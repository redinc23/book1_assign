/**
 * Pure MongoDB env helpers (no driver import) — ported from my_publishing/lib/mongodb-config.ts.
 * Book OS uses its own database name on the shared Mangu Atlas cluster.
 */

export function isMongoConfigured(uri = process.env.MONGODB_URI): boolean {
  return !!uri && (uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'));
}

export function getMongoDbName(db = process.env.MONGODB_DB): string {
  return db || 'mangu_book_os';
}

/**
 * Validate MONGODB_URI shape. Throws on missing/placeholder values.
 */
export function assertMongoUri(uri = process.env.MONGODB_URI): string {
  if (!uri) {
    throw new Error('Missing environment variable: MONGODB_URI');
  }
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    throw new Error('MONGODB_URI must start with mongodb:// or mongodb+srv://');
  }
  if (uri.includes('<password>') || uri.includes('<db_password>')) {
    throw new Error(
      'MONGODB_URI still contains a password placeholder — replace <password> with the Atlas database user password',
    );
  }
  return uri;
}
