#!/usr/bin/env tsx
/**
 * One-shot Mongo automation (same flow as my_publishing):
 *   1) Atlas bootstrap (cluster/user/IP/URI → .env.local)
 *   2) Ping
 *   3) Ensure Book OS indexes
 *   4) Sync to Vercel (if VERCEL_TOKEN + VERCEL_PROJECT_ID set)
 *
 * Usage:
 *   export ATLAS_PUBLIC_KEY=... ATLAS_PRIVATE_KEY=...
 *   export VERCEL_TOKEN=... VERCEL_PROJECT_ID=prj_...
 *   npm run db:mongo:up
 */

import { spawnSync } from 'child_process';
import { loadDotEnvLocal } from './lib/env-file';

function run(label: string, args: string[], optional = false): void {
  console.log(`\n── ${label} ──`);
  const result = spawnSync('npx', ['tsx', ...args], {
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    if (optional) {
      console.warn(`(optional step failed — continuing)`);
      return;
    }
    process.exit(result.status ?? 1);
  }
}

async function main(): Promise<void> {
  loadDotEnvLocal();

  if (!process.env.ATLAS_PUBLIC_KEY && !process.env.MONGODB_ATLAS_PUBLIC_KEY) {
    console.error(`
Mongo automation needs Atlas API keys (same keys as my_publishing):

  1. https://cloud.mongodb.com → Organization → Access Manager → API Keys
  2. Create API Key with Organization Project Creator (or Project Owner)
  3. Then:

    export ATLAS_PUBLIC_KEY='...'
    export ATLAS_PRIVATE_KEY='...'
    export VERCEL_TOKEN='...'            # optional
    export VERCEL_PROJECT_ID='prj_...'   # Book OS Vercel project
    npm run db:mongo:up

  Already have a Drivers URI from my_publishing / Atlas?
    npm run db:mongo:import-uri -- 'mongodb+srv://USER:PASS@cluster...'
`);
    process.exit(1);
  }

  run('Atlas bootstrap', ['scripts/atlas-bootstrap.ts']);
  loadDotEnvLocal();
  run('Ping', ['scripts/mongo-ping.ts']);
  run('Indexes', ['scripts/mongo-ensure-indexes.ts']);

  if (process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID) {
    run('Sync → Vercel', ['scripts/sync-mongodb-to-vercel.ts']);
  } else {
    console.warn('\n⚠ VERCEL_TOKEN / VERCEL_PROJECT_ID not set — skipped Vercel env sync.');
  }

  console.log(`
════════════════════════════════════════
 Book OS Mongo stack is up (local).
 DB: mangu_book_os (separate from storefront "mangu")
 Next: npm run dev
════════════════════════════════════════
`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
