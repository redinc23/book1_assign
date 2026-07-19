/*
# Create chapters table

1. New Tables
  - `chapters`
    - `id` (uuid, primary key)
    - `book_id` (uuid, NOT NULL, references books)
    - `number` (integer, NOT NULL)
    - `title` (text, NOT NULL)
    - `status` (text, default 'draft')
    - `word_count` (integer, default 0)
    - `target_word_count` (integer, default 4000)
    - `pov` (text) - point of view character
    - `notes` (text)
    - `created_at` (timestamptz)

2. Security
  - Enable RLS on `chapters`.
  - Owner-scoped through parent book.

3. Indexes
  - Index on book_id.
  - Index on (book_id, number) for ordering.
*/

CREATE TABLE IF NOT EXISTS chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  number integer NOT NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  word_count integer NOT NULL DEFAULT 0,
  target_word_count integer NOT NULL DEFAULT 4000,
  pov text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chapters_book_id ON chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_chapters_book_number ON chapters(book_id, number);

ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_chapters" ON chapters;
CREATE POLICY "select_own_chapters" ON chapters FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM books WHERE books.id = chapters.book_id AND books.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_chapters" ON chapters;
CREATE POLICY "insert_own_chapters" ON chapters FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM books WHERE books.id = chapters.book_id AND books.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_chapters" ON chapters;
CREATE POLICY "update_own_chapters" ON chapters FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM books WHERE books.id = chapters.book_id AND books.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM books WHERE books.id = chapters.book_id AND books.user_id = auth.uid()));

DROP POLICY IF EXISTS "delete_own_chapters" ON chapters;
CREATE POLICY "delete_own_chapters" ON chapters FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM books WHERE books.id = chapters.book_id AND books.user_id = auth.uid())
  );
