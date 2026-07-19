#!/usr/bin/env tsx
/**
 * Ensure Book OS collections + indexes exist on Atlas.
 * Safe to re-run. Usage: npm run db:mongo:indexes
 */

import { loadDotEnvLocal } from './lib/env-file';
import { getDb, isMongoConfigured, __resetMongoClientForTests } from '../server/mongodb';

async function main(): Promise<void> {
  loadDotEnvLocal();
  __resetMongoClientForTests();

  if (!isMongoConfigured()) {
    console.error('MONGODB_URI not set. Run: npm run db:atlas:bootstrap');
    process.exit(1);
  }

  const db = await getDb();
  console.log(`Ensuring Book OS indexes on db="${db.databaseName}"…`);

  await db.collection('users').createIndexes([
    { key: { email: 1 }, unique: true, name: 'users_email_uq' },
  ]);

  await db.collection('books').createIndexes([
    { key: { user_id: 1, updated_at: -1 }, name: 'books_user_updated' },
    { key: { user_id: 1, status: 1 }, name: 'books_user_status' },
  ]);

  await db.collection('characters').createIndexes([
    { key: { book_id: 1, created_at: 1 }, name: 'characters_book_created' },
  ]);

  await db.collection('chapters').createIndexes([
    { key: { book_id: 1, number: 1 }, name: 'chapters_book_number' },
  ]);

  await db.collection('editorial_tasks').createIndexes([
    { key: { book_id: 1, status: 1 }, name: 'editorial_book_status' },
  ]);

  await db.collection('production_tasks').createIndexes([
    { key: { book_id: 1, status: 1 }, name: 'production_book_status' },
  ]);

  await db.collection('marketing_items').createIndexes([
    { key: { book_id: 1, status: 1 }, name: 'marketing_book_status' },
  ]);

  await db.collection('activity_log').createIndexes([
    { key: { user_id: 1, created_at: -1 }, name: 'activity_user_created' },
  ]);

  console.log(
    '✓ users, books, characters, chapters, editorial_tasks, production_tasks, marketing_items, activity_log',
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
