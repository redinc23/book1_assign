#!/usr/bin/env tsx
/**
 * Import an existing mongodb+srv URI (e.g. from my_publishing .env.local)
 * into Book OS .env.local, then ping + indexes + optional Vercel sync.
 *
 * Usage:
 *   npm run db:mongo:import-uri -- "mongodb+srv://..."
 */

import { createInterface } from 'readline';
import { randomBytes } from 'crypto';
import { assertMongoUri } from '../server/mongodb-config';
import { envFilePath, loadDotEnvLocal, upsertEnvVars, readEnvFile } from './lib/env-file';
import { spawnSync } from 'child_process';

async function readUri(): Promise<string> {
  const arg = process.argv.slice(2).find((a) => !a.startsWith('-'));
  if (arg) return arg.trim();

  if (!process.stdin.isTTY) {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks).toString('utf8').trim();
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const uri = await new Promise<string>((resolve) => {
    rl.question('Paste MONGODB_URI (not echoed to git): ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
  return uri;
}

function run(script: string): void {
  const result = spawnSync('npx', ['tsx', script], {
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

async function main(): Promise<void> {
  loadDotEnvLocal();
  const uri = assertMongoUri(await readUri());
  const dbName = process.env.MONGODB_DB || 'mangu_book_os';
  const existingSecret = readEnvFile(envFilePath()).get('AUTH_SECRET');
  const authSecret = process.env.AUTH_SECRET || existingSecret || randomBytes(32).toString('hex');

  upsertEnvVars(envFilePath(), {
    MONGODB_URI: uri,
    MONGODB_DB: dbName,
    AUTH_SECRET: authSecret,
    DATABASE_PROVIDER: 'mongodb',
  });
  process.env.MONGODB_URI = uri;
  process.env.MONGODB_DB = dbName;
  process.env.AUTH_SECRET = authSecret;
  process.env.DATABASE_PROVIDER = 'mongodb';

  console.log('✓ Wrote MONGODB_URI to .env.local (redacted) — db=' + dbName);
  run('scripts/mongo-ping.ts');
  run('scripts/mongo-ensure-indexes.ts');

  if (process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID) {
    run('scripts/sync-mongodb-to-vercel.ts');
  } else {
    console.warn('⚠ VERCEL_TOKEN / VERCEL_PROJECT_ID not set — skipped Vercel sync');
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
