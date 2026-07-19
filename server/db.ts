import { ObjectId } from 'mongodb';
import { getDb } from './mongodb';

export { getDb } from './mongodb';

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
