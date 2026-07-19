/*
# Seed milestone templates and add genome column to books

1. Modified Tables
  - `books` - Added `genome` (jsonb, default '{}') column for structured book DNA storage
  - `books` - Added `current_milestone` (text, default 'M0') to track active milestone

2. Seed Data
  - 6 milestone templates (M0-M5) representing the book lifecycle
  - Checklist items for each milestone template

3. Important Notes
  - Templates are shared reference data (no user_id)
  - Each template has 3-5 checklist items
  - Milestone codes: M0=Market Intelligence, M1=Concept Discovery, M2=Story Foundation, M3=Book Genome, M4=First Draft, M5=Revision & Polish
*/

-- Add genome JSONB column to books
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'books' AND column_name = 'genome') THEN
    ALTER TABLE books ADD COLUMN genome jsonb NOT NULL DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add current_milestone column to books
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'books' AND column_name = 'current_milestone') THEN
    ALTER TABLE books ADD COLUMN current_milestone text NOT NULL DEFAULT 'M0';
  END IF;
END $$;

-- Seed milestone templates
INSERT INTO milestone_templates (code, name, description, gate_mode, threshold, sort_order) VALUES
  ('M0', 'Market Intelligence', 'Determine if the publication should exist before writing begins. Research market viability, comp titles, and audience.', 'soft', 80, 0),
  ('M1', 'Concept Discovery', 'Convert market insight into a publishable concept. Define premise, audience promise, and differentiators.', 'soft', 80, 1),
  ('M2', 'Story Foundation', 'Establish the emotional engine of the story. Define theme, conflict, character arcs, and narrative structure.', 'soft', 80, 2),
  ('M3', 'Book Genome Complete', 'Populate the structured knowledge base. All core identity, creative, and commercial fields completed.', 'soft', 90, 3),
  ('M4', 'First Draft Complete', 'Complete the first full draft of the manuscript. All chapters drafted with target word count met.', 'hard', 100, 4),
  ('M5', 'Revision & Polish', 'Complete editorial passes, resolve all critical issues, and prepare manuscript for production.', 'hard', 90, 5)
ON CONFLICT (code) DO NOTHING;

-- Seed M0 items
INSERT INTO milestone_template_items (template_id, label, description, required, sort_order)
SELECT t.id, items.label, items.description, items.required, items.sort_order
FROM milestone_templates t
CROSS JOIN (VALUES
  ('Market research completed', 'Analyze market trends, reader demographics, and demand signals', true, 0),
  ('Comp titles identified', 'Identify 3-5 comparable titles with sales data and positioning', true, 1),
  ('Target audience defined', 'Create reader persona with demographics, psychographics, and buying behavior', true, 2),
  ('Genre positioning documented', 'Define primary and secondary genre categories with rationale', false, 3)
) AS items(label, description, required, sort_order)
WHERE t.code = 'M0'
ON CONFLICT DO NOTHING;

-- Seed M1 items
INSERT INTO milestone_template_items (template_id, label, description, required, sort_order)
SELECT t.id, items.label, items.description, items.required, items.sort_order
FROM milestone_templates t
CROSS JOIN (VALUES
  ('One-sentence premise written', 'A single compelling sentence that captures the core story promise', true, 0),
  ('Elevator pitch drafted', 'A 2-3 sentence pitch that hooks the reader', true, 1),
  ('Working title confirmed', 'Title that captures tone and marketability', true, 2),
  ('Audience promise defined', 'Clear articulation of what the reader will experience', false, 3),
  ('Unique differentiator identified', 'What makes this book stand apart from comp titles', false, 4)
) AS items(label, description, required, sort_order)
WHERE t.code = 'M1'
ON CONFLICT DO NOTHING;

-- Seed M2 items
INSERT INTO milestone_template_items (template_id, label, description, required, sort_order)
SELECT t.id, items.label, items.description, items.required, items.sort_order
FROM milestone_templates t
CROSS JOIN (VALUES
  ('Core theme identified', 'The central thematic question the story explores', true, 0),
  ('Primary conflict defined', 'The main source of tension driving the narrative', true, 1),
  ('Protagonist arc mapped', 'Character transformation from beginning to end', true, 2),
  ('Narrative structure chosen', 'Story structure framework (3-act, hero journey, etc.)', true, 3),
  ('Emotional beats outlined', 'Key emotional turning points in the reader experience', false, 4)
) AS items(label, description, required, sort_order)
WHERE t.code = 'M2'
ON CONFLICT DO NOTHING;

-- Seed M3 items
INSERT INTO milestone_template_items (template_id, label, description, required, sort_order)
SELECT t.id, items.label, items.description, items.required, items.sort_order
FROM milestone_templates t
CROSS JOIN (VALUES
  ('All identity fields complete', 'Title, author, genre, target audience populated in genome', true, 0),
  ('Creative DNA documented', 'Premise, theme, conflict, tone, and voice defined', true, 1),
  ('Character profiles created', 'All major characters have complete profiles with arcs', true, 2),
  ('World-building documented', 'Setting, rules, and context fully specified', false, 3),
  ('Commercial positioning set', 'Pricing strategy, format, and release window planned', false, 4)
) AS items(label, description, required, sort_order)
WHERE t.code = 'M3'
ON CONFLICT DO NOTHING;

-- Seed M4 items
INSERT INTO milestone_template_items (template_id, label, description, required, sort_order)
SELECT t.id, items.label, items.description, items.required, items.sort_order
FROM milestone_templates t
CROSS JOIN (VALUES
  ('All chapters drafted', 'Every planned chapter has a complete first draft', true, 0),
  ('Word count target met', 'Total word count meets or exceeds the target', true, 1),
  ('Chapter sequence finalized', 'Chapter ordering and flow confirmed', true, 2),
  ('POV consistency verified', 'Point of view consistent across all scenes', true, 3),
  ('Draft read-through completed', 'Author has read the complete draft end-to-end', true, 4)
) AS items(label, description, required, sort_order)
WHERE t.code = 'M4'
ON CONFLICT DO NOTHING;

-- Seed M5 items
INSERT INTO milestone_template_items (template_id, label, description, required, sort_order)
SELECT t.id, items.label, items.description, items.required, items.sort_order
FROM milestone_templates t
CROSS JOIN (VALUES
  ('Developmental edit complete', 'Big-picture structural and story issues resolved', true, 0),
  ('Line edit complete', 'Prose quality, voice consistency, and flow refined', true, 1),
  ('Copy edit complete', 'Grammar, spelling, punctuation, and style sheet applied', true, 2),
  ('Critical issues resolved', 'All critical and high-severity editorial issues closed', true, 3),
  ('Beta reader feedback integrated', 'External reader feedback reviewed and incorporated', false, 4)
) AS items(label, description, required, sort_order)
WHERE t.code = 'M5'
ON CONFLICT DO NOTHING;
