/*
# Create production_tasks, marketing_items, and activity_log tables

1. New Tables
  - `production_tasks`
    - `id` (uuid, primary key)
    - `book_id` (uuid, NOT NULL, references books)
    - `task` (text, NOT NULL)
    - `status` (text, default 'planned')
    - `due` (date)
    - `assignee` (text)
    - `category` (text)
    - `created_at` (timestamptz)

  - `marketing_items`
    - `id` (uuid, primary key)
    - `book_id` (uuid, NOT NULL, references books)
    - `title` (text, NOT NULL)
    - `channel` (text)
    - `status` (text, default 'planned')
    - `reach` (text)
    - `date` (date)
    - `created_at` (timestamptz)

  - `activity_log`
    - `id` (uuid, primary key)
    - `user_id` (uuid, NOT NULL, defaults to auth.uid())
    - `book_id` (uuid, references books)
    - `action` (text, NOT NULL)
    - `target` (text, NOT NULL)
    - `entity_type` (text) - book, character, chapter, task, etc.
    - `entity_id` (uuid)
    - `created_at` (timestamptz)

2. Security
  - Enable RLS on all tables.
  - production_tasks and marketing_items: owner-scoped through parent book.
  - activity_log: owner-scoped by user_id.

3. Indexes
  - Indexes on book_id columns.
  - Index on activity_log(user_id, created_at desc).
*/

-- Production Tasks
CREATE TABLE IF NOT EXISTS production_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  task text NOT NULL,
  status text NOT NULL DEFAULT 'planned',
  due date,
  assignee text DEFAULT '',
  category text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_production_tasks_book_id ON production_tasks(book_id);

ALTER TABLE production_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_production_tasks" ON production_tasks;
CREATE POLICY "select_own_production_tasks" ON production_tasks FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM books WHERE books.id = production_tasks.book_id AND books.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_production_tasks" ON production_tasks;
CREATE POLICY "insert_own_production_tasks" ON production_tasks FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM books WHERE books.id = production_tasks.book_id AND books.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_production_tasks" ON production_tasks;
CREATE POLICY "update_own_production_tasks" ON production_tasks FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM books WHERE books.id = production_tasks.book_id AND books.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM books WHERE books.id = production_tasks.book_id AND books.user_id = auth.uid()));

DROP POLICY IF EXISTS "delete_own_production_tasks" ON production_tasks;
CREATE POLICY "delete_own_production_tasks" ON production_tasks FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM books WHERE books.id = production_tasks.book_id AND books.user_id = auth.uid())
  );

-- Marketing Items
CREATE TABLE IF NOT EXISTS marketing_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  title text NOT NULL,
  channel text DEFAULT '',
  status text NOT NULL DEFAULT 'planned',
  reach text DEFAULT '',
  date date,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketing_items_book_id ON marketing_items(book_id);

ALTER TABLE marketing_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_marketing_items" ON marketing_items;
CREATE POLICY "select_own_marketing_items" ON marketing_items FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM books WHERE books.id = marketing_items.book_id AND books.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_marketing_items" ON marketing_items;
CREATE POLICY "insert_own_marketing_items" ON marketing_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM books WHERE books.id = marketing_items.book_id AND books.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_marketing_items" ON marketing_items;
CREATE POLICY "update_own_marketing_items" ON marketing_items FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM books WHERE books.id = marketing_items.book_id AND books.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM books WHERE books.id = marketing_items.book_id AND books.user_id = auth.uid()));

DROP POLICY IF EXISTS "delete_own_marketing_items" ON marketing_items;
CREATE POLICY "delete_own_marketing_items" ON marketing_items FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM books WHERE books.id = marketing_items.book_id AND books.user_id = auth.uid())
  );

-- Activity Log
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid REFERENCES books(id) ON DELETE SET NULL,
  action text NOT NULL,
  target text NOT NULL,
  entity_type text DEFAULT '',
  entity_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_created ON activity_log(user_id, created_at DESC);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_activity" ON activity_log;
CREATE POLICY "select_own_activity" ON activity_log FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_activity" ON activity_log;
CREATE POLICY "insert_own_activity" ON activity_log FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_activity" ON activity_log;
CREATE POLICY "update_own_activity" ON activity_log FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_activity" ON activity_log;
CREATE POLICY "delete_own_activity" ON activity_log FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
