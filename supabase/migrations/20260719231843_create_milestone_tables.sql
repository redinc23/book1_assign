/*
# Create milestone system tables

1. New Tables
  - `milestone_templates`
    - `id` (uuid, primary key)
    - `code` (text, unique) - e.g. 'M0', 'M1', 'M2'
    - `name` (text, NOT NULL) - display name
    - `description` (text) - what this milestone represents
    - `gate_mode` (text) - 'soft' or 'hard'
    - `threshold` (integer) - percentage needed to pass (0-100)
    - `sort_order` (integer) - ordering
    - `created_at` (timestamptz)

  - `milestone_template_items`
    - `id` (uuid, primary key)
    - `template_id` (uuid, references milestone_templates)
    - `label` (text, NOT NULL) - checklist item text
    - `description` (text) - additional context
    - `required` (boolean, default true)
    - `sort_order` (integer)
    - `created_at` (timestamptz)

  - `milestones`
    - `id` (uuid, primary key)
    - `book_id` (uuid, references books)
    - `template_id` (uuid, references milestone_templates)
    - `status` (text) - pending, in_progress, completed, blocked, overridden
    - `readiness_score` (integer, 0-100)
    - `started_at` (timestamptz)
    - `completed_at` (timestamptz)
    - `override_reason` (text)
    - `created_at` (timestamptz)

  - `milestone_items`
    - `id` (uuid, primary key)
    - `milestone_id` (uuid, references milestones)
    - `template_item_id` (uuid, references milestone_template_items)
    - `completed` (boolean, default false)
    - `completed_at` (timestamptz)
    - `notes` (text)
    - `created_at` (timestamptz)

2. Security
  - Enable RLS on all tables.
  - milestone_templates and milestone_template_items: readable by all authenticated users (shared reference data).
  - milestones and milestone_items: owner-scoped through parent book.

3. Indexes
  - milestones(book_id)
  - milestone_items(milestone_id)
  - milestone_template_items(template_id)
  - unique constraint on milestones(book_id, template_id)
*/

-- Milestone Templates (shared reference data)
CREATE TABLE IF NOT EXISTS milestone_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text DEFAULT '',
  gate_mode text NOT NULL DEFAULT 'soft' CHECK (gate_mode IN ('soft', 'hard')),
  threshold integer NOT NULL DEFAULT 80 CHECK (threshold >= 0 AND threshold <= 100),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE milestone_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_milestone_templates" ON milestone_templates;
CREATE POLICY "select_milestone_templates" ON milestone_templates FOR SELECT
  TO authenticated USING (true);

-- Milestone Template Items (shared reference data)
CREATE TABLE IF NOT EXISTS milestone_template_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES milestone_templates(id) ON DELETE CASCADE,
  label text NOT NULL,
  description text DEFAULT '',
  required boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_milestone_template_items_template ON milestone_template_items(template_id);

ALTER TABLE milestone_template_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_milestone_template_items" ON milestone_template_items;
CREATE POLICY "select_milestone_template_items" ON milestone_template_items FOR SELECT
  TO authenticated USING (true);

-- Milestones (per-book instances)
CREATE TABLE IF NOT EXISTS milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES milestone_templates(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'overridden')),
  readiness_score integer NOT NULL DEFAULT 0 CHECK (readiness_score >= 0 AND readiness_score <= 100),
  started_at timestamptz,
  completed_at timestamptz,
  override_reason text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (book_id, template_id)
);

CREATE INDEX IF NOT EXISTS idx_milestones_book_id ON milestones(book_id);

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_milestones" ON milestones;
CREATE POLICY "select_own_milestones" ON milestones FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM books WHERE books.id = milestones.book_id AND books.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_milestones" ON milestones;
CREATE POLICY "insert_own_milestones" ON milestones FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM books WHERE books.id = milestones.book_id AND books.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_milestones" ON milestones;
CREATE POLICY "update_own_milestones" ON milestones FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM books WHERE books.id = milestones.book_id AND books.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM books WHERE books.id = milestones.book_id AND books.user_id = auth.uid()));

DROP POLICY IF EXISTS "delete_own_milestones" ON milestones;
CREATE POLICY "delete_own_milestones" ON milestones FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM books WHERE books.id = milestones.book_id AND books.user_id = auth.uid())
  );

-- Milestone Items (per-book checklist items)
CREATE TABLE IF NOT EXISTS milestone_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  template_item_id uuid NOT NULL REFERENCES milestone_template_items(id),
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_milestone_items_milestone ON milestone_items(milestone_id);

ALTER TABLE milestone_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_milestone_items" ON milestone_items;
CREATE POLICY "select_own_milestone_items" ON milestone_items FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM milestones m
      JOIN books b ON b.id = m.book_id
      WHERE m.id = milestone_items.milestone_id AND b.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_milestone_items" ON milestone_items;
CREATE POLICY "insert_own_milestone_items" ON milestone_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM milestones m
      JOIN books b ON b.id = m.book_id
      WHERE m.id = milestone_items.milestone_id AND b.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_own_milestone_items" ON milestone_items;
CREATE POLICY "update_own_milestone_items" ON milestone_items FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM milestones m
    JOIN books b ON b.id = m.book_id
    WHERE m.id = milestone_items.milestone_id AND b.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM milestones m
    JOIN books b ON b.id = m.book_id
    WHERE m.id = milestone_items.milestone_id AND b.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "delete_own_milestone_items" ON milestone_items;
CREATE POLICY "delete_own_milestone_items" ON milestone_items FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM milestones m
      JOIN books b ON b.id = m.book_id
      WHERE m.id = milestone_items.milestone_id AND b.user_id = auth.uid()
    )
  );
