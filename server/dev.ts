import { serve } from '@hono/node-server';
import { loadDotEnvLocal } from '../scripts/lib/env-file';
import app from './app';

loadDotEnvLocal();

const port = Number(process.env.API_PORT || 3001);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`MANGU API listening on http://localhost:${info.port}`);
});
