import { MongoClient, Db, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.warn('MONGODB_URI is not set');
}

declare global {
  // eslint-disable-next-line no-var
  var __manguMongo: { client: MongoClient; db: Db } | undefined;
}

export async function getDb(): Promise<Db> {
  if (!uri) {
    throw new Error('Missing MONGODB_URI environment variable');
  }

  if (globalThis.__manguMongo) {
    return globalThis.__manguMongo.db;
  }

  const client = new MongoClient(uri);
  await client.connect();
  const dbName = process.env.MONGODB_DB || 'mangu_book_os';
  const db = client.db(dbName);
  globalThis.__manguMongo = { client, db };
  return db;
}

export function toObjectId(id: string): ObjectId | null {
  if (!ObjectId.isValid(id)) return null;
  return new ObjectId(id);
}

export function serialize<T extends Record<string, unknown>>(doc: T | null | undefined) {
  if (!doc) return null;
  const { _id, ...rest } = doc as T & { _id: ObjectId };
  const out: Record<string, unknown> = { id: _id.toString() };
  for (const [key, value] of Object.entries(rest)) {
    if (value instanceof ObjectId) {
      out[key] = value.toString();
    } else if (value instanceof Date) {
      out[key] = value.toISOString();
    } else {
      out[key] = value;
    }
  }
  return out;
}

export function serializeMany<T extends Record<string, unknown>>(docs: T[]) {
  return docs.map((d) => serialize(d)!);
}
