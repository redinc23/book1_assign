/**
 * MongoDB Atlas client — same pattern as my_publishing/lib/mongodb.ts.
 *
 * Global-cached client (HMR-safe) + attachDatabasePool on Vercel Fluid Compute.
 * Server-only — do not import from Client Components.
 */

import { MongoClient, type Db, type MongoClientOptions } from 'mongodb';
import { assertMongoUri, getMongoDbName } from './mongodb-config';

export { getMongoDbName, isMongoConfigured } from './mongodb-config';

const globalForMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
  _mongoPoolAttached?: boolean;
};

const options: MongoClientOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
};

async function createClientPromise(): Promise<MongoClient> {
  const client = new MongoClient(assertMongoUri(), options);

  if (!globalForMongo._mongoPoolAttached) {
    globalForMongo._mongoPoolAttached = true;
    try {
      const { attachDatabasePool } = await import('@vercel/functions');
      attachDatabasePool(client);
    } catch {
      // Non-Vercel / missing package — connection still works.
    }
  }

  return client.connect();
}

export function getMongoClientPromise(): Promise<MongoClient> {
  if (!globalForMongo._mongoClientPromise) {
    globalForMongo._mongoClientPromise = createClientPromise().catch((error) => {
      delete globalForMongo._mongoClientPromise;
      globalForMongo._mongoPoolAttached = false;
      throw error;
    });
  }
  return globalForMongo._mongoClientPromise;
}

export async function getDb(dbName?: string): Promise<Db> {
  const client = await getMongoClientPromise();
  return client.db(dbName ?? getMongoDbName());
}

export interface MongoPingResult {
  ok: boolean;
  latency_ms: number;
  message?: string;
}

export async function pingMongo(): Promise<MongoPingResult> {
  const start = Date.now();
  try {
    const client = await getMongoClientPromise();
    await client.db('admin').command({ ping: 1 });
    const latency_ms = Date.now() - start;
    return {
      ok: true,
      latency_ms,
      message: latency_ms > 1000 ? 'Ping slow (>1s)' : undefined,
    };
  } catch (error) {
    const latency_ms = Date.now() - start;
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, latency_ms, message };
  }
}

/** Test-only: clear cached client (does not close live sockets). */
export function __resetMongoClientForTests(): void {
  delete globalForMongo._mongoClientPromise;
  delete globalForMongo._mongoPoolAttached;
}
