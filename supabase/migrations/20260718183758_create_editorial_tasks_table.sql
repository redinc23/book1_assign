/*
# Create editorial_tasks table

1. New Tables
  - `editorial_tasks`
    - `id` (uuid, primary key)
    - `book_id` (uuid, NOT NULL, references books)
    - `title` (text, NOT NULL)
    - `chapter` (text) - chapter reference label
    - `assignee` (text)
    - `severity` (text, default 'medium') - critical, high, medium, low
    - `status` (text, default 'backlog') - backlog, in-progress, review, resolved
    - `type` (text) - Structural, Continuity, Line Edit, Character, Craft
    - `created_at` (timestamptz)

2. Security
  - Enable RLS on `editorial_tasks`.
  - Owner-scoped through parent book.

3. Indexes
  - Index on book_id.
  - Index on status for kanban filtering.
*/

CREATE TABLE IF NOT EXISTS editorial_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  title text NOT NULL,
  chapter text DEFAULT '',
  assignee text DEFAULT '',
  severity text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'backlog',
  type text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_editorial_tasks_book_id ON editorial_tasks(book_id);
CREATE INDEX IF NOT EXISTS idx_editorial_tasks_status ON editorial_tasks(status);

ALTER TABLE editorial_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_editorial_tasks" ON editorial_tasks;
CREATE POLICY "select_own_editorial_tasks" ON editorial_tasks FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM books WHERE books.id = editorial_tasks.book_id AND books.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_editorial_tasks" ON editorial_tasks;
CREATE POLICY "insert_own_editorial_tasks" ON editorial_tasks FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM books WHERE books.id = editorial_tasks.book_id AND books.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_editorial_tasks" ON editorial_tasks;
CREATE POLICY "update_own_editorial_tasks" ON editorial_tasks FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM books WHERE books.id = editorial_tasks.book_id AND books.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM books WHERE books.id = editorial_tasks.book_id AND books.user_id = auth.uid()));

DROP POLICY IF EXISTS "delete_own_editorial_tasks" ON editorial_tasks;
CREATE POLICY "delete_own_editorial_tasks" ON editorial_tasks FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM books WHERE books.id = editorial_tasks.book_id AND books.user_id = auth.uid())
  );
