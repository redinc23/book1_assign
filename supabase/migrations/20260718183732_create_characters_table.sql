/*
# Create characters table

1. New Tables
  - `characters`
    - `id` (uuid, primary key)
    - `book_id` (uuid, NOT NULL, references books)
    - `name` (text, NOT NULL)
    - `role` (text) - e.g. Protagonist, Antagonist, Ally
    - `archetype` (text)
    - `arc` (text) - e.g. Fall & Redemption
    - `connections` (integer, default 0)
    - `image_url` (text)
    - `notes` (text)
    - `created_at` (timestamptz)

2. Security
  - Enable RLS on `characters`.
  - Owner-scoped through parent book: user can access characters only for their own books.

3. Indexes
  - Index on book_id.
*/

CREATE TABLE IF NOT EXISTS characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text DEFAULT '',
  archetype text DEFAULT '',
  arc text DEFAULT '',
  connections integer NOT NULL DEFAULT 0,
  image_url text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_characters_book_id ON characters(book_id);

ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_characters" ON characters;
CREATE POLICY "select_own_characters" ON characters FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM books WHERE books.id = characters.book_id AND books.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_characters" ON characters;
CREATE POLICY "insert_own_characters" ON characters FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM books WHERE books.id = characters.book_id AND books.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_characters" ON characters;
CREATE POLICY "update_own_characters" ON characters FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM books WHERE books.id = characters.book_id AND books.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM books WHERE books.id = characters.book_id AND books.user_id = auth.uid()));

DROP POLICY IF EXISTS "delete_own_characters" ON characters;
CREATE POLICY "delete_own_characters" ON characters FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM books WHERE books.id = characters.book_id AND books.user_id = auth.uid())
  );
