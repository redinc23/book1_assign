/*
# Create books table

1. New Tables
  - `books`
    - `id` (uuid, primary key)
    - `user_id` (uuid, NOT NULL, defaults to auth.uid(), references auth.users)
    - `title` (text, NOT NULL)
    - `author` (text, NOT NULL)
    - `genre` (text)
    - `cover_url` (text)
    - `progress` (integer, default 0)
    - `phase` (text, default 'Concept')
    - `status` (text, default 'draft')
    - `word_count` (integer, default 0)
    - `target_word_count` (integer, default 80000)
    - `deadline` (date)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

2. Security
  - Enable RLS on `books`.
  - Owner-scoped CRUD: each authenticated user can only access their own books.

3. Indexes
  - Index on user_id for fast lookups.
*/

CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  author text NOT NULL DEFAULT '',
  genre text DEFAULT '',
  cover_url text DEFAULT '',
  progress integer NOT NULL DEFAULT 0,
  phase text NOT NULL DEFAULT 'Concept',
  status text NOT NULL DEFAULT 'draft',
  word_count integer NOT NULL DEFAULT 0,
  target_word_count integer NOT NULL DEFAULT 80000,
  deadline date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_books" ON books;
CREATE POLICY "select_own_books" ON books FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_books" ON books;
CREATE POLICY "insert_own_books" ON books FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_books" ON books;
CREATE POLICY "update_own_books" ON books FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_books" ON books;
CREATE POLICY "delete_own_books" ON books FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
