-- MANGU Book OS v0.2
-- Supabase/PostgreSQL reference schema for converting the local-first prototype
-- into a multi-user canonical publishing platform.

create extension if not exists pgcrypto;

create type public.mangu_record_status as enum (
  'draft', 'working', 'review', 'approved', 'published', 'archived'
);

create type public.mangu_severity as enum (
  'low', 'medium', 'high', 'critical'
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'author',
  capabilities text[] not null default '{}',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  record_code text not null,
  title text not null,
  subtitle text,
  series_name text,
  genre text,
  publication_type text not null default 'book',
  status public.mangu_record_status not null default 'draft',
  current_milestone text not null default 'M0',
  target_release_date date,
  owner_user_id uuid references auth.users(id),
  word_count integer not null default 0 check (word_count >= 0),
  word_goal integer not null default 0 check (word_goal >= 0),
  hook text,
  logline text,
  audience text,
  primary_theme text,
  tone text,
  point_of_view text,
  genome jsonb not null default '{}'::jsonb,
  approval_state text not null default 'draft',
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, record_code)
);

create index if not exists books_workspace_status_idx
  on public.books(workspace_id, status);
create index if not exists books_workspace_milestone_idx
  on public.books(workspace_id, current_milestone);
create index if not exists books_genome_gin_idx
  on public.books using gin(genome);

create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  code text not null,
  name text not null,
  description text,
  status text not null default 'planned',
  readiness integer not null default 0 check (readiness between 0 and 100),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (book_id, code)
);

create table if not exists public.milestone_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  milestone_id uuid not null references public.milestones(id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  completed_by uuid references auth.users(id),
  completed_at timestamptz,
  position integer not null default 0,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  record_code text not null,
  name text not null,
  role text,
  status public.mangu_record_status not null default 'draft',
  summary text,
  core_wound text,
  core_desire text,
  core_fear text,
  arc text,
  voice_profile text,
  importance integer not null default 50 check (importance between 0 and 100),
  genome jsonb not null default '{}'::jsonb,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (book_id, record_code)
);

create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  record_code text not null,
  sequence integer not null,
  title text not null,
  purpose text,
  pov_character_id uuid references public.characters(id) on delete set null,
  pov_label text,
  emotional_shift text,
  word_goal integer not null default 0 check (word_goal >= 0),
  word_count integer not null default 0 check (word_count >= 0),
  manuscript text not null default '',
  status text not null default 'planned',
  metadata jsonb not null default '{}'::jsonb,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (book_id, record_code),
  unique (book_id, sequence)
);

create index if not exists chapters_book_sequence_idx
  on public.chapters(book_id, sequence);

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  record_code text not null,
  parent_location_id uuid references public.locations(id) on delete set null,
  name text not null,
  location_type text,
  description text,
  risk text,
  status public.mangu_record_status not null default 'draft',
  genome jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (book_id, record_code)
);

create table if not exists public.scenes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  record_code text not null,
  sequence integer not null,
  title text not null,
  purpose text,
  goal text,
  conflict text,
  outcome text,
  emotional_shift text,
  location_id uuid references public.locations(id) on delete set null,
  pov_character_id uuid references public.characters(id) on delete set null,
  pov_label text,
  status text not null default 'planned',
  word_count integer not null default 0 check (word_count >= 0),
  genome jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (book_id, record_code),
  unique (chapter_id, sequence)
);

create table if not exists public.scene_characters (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  scene_id uuid not null references public.scenes(id) on delete cascade,
  character_id uuid not null references public.characters(id) on delete cascade,
  participation_role text,
  primary key (scene_id, character_id)
);

create table if not exists public.canon_facts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  record_code text not null,
  domain text not null,
  fact text not null,
  status public.mangu_record_status not null default 'draft',
  source_label text,
  source_entity_type text,
  source_entity_id uuid,
  confidence integer not null default 50 check (confidence between 0 and 100),
  risk text,
  effective_from timestamptz,
  effective_to timestamptz,
  supersedes_id uuid references public.canon_facts(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (book_id, record_code)
);

create index if not exists canon_facts_book_status_idx
  on public.canon_facts(book_id, status);

create table if not exists public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  record_code text not null,
  absolute_time timestamptz,
  relative_time text,
  event text not null,
  importance text,
  canon_status text not null default 'working',
  source_label text,
  location_id uuid references public.locations(id) on delete set null,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (book_id, record_code)
);

create table if not exists public.relationships (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  record_code text not null,
  source_type text not null,
  source_id uuid not null,
  relationship_type text not null,
  target_type text not null,
  target_id uuid not null,
  strength integer not null default 50 check (strength between 0 and 100),
  confidence integer not null default 100 check (confidence between 0 and 100),
  status public.mangu_record_status not null default 'working',
  evidence text,
  effective_from timestamptz,
  effective_to timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (book_id, record_code)
);

create index if not exists relationships_source_idx
  on public.relationships(workspace_id, source_type, source_id);
create index if not exists relationships_target_idx
  on public.relationships(workspace_id, target_type, target_id);

create table if not exists public.editorial_issues (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  record_code text not null,
  chapter_id uuid references public.chapters(id) on delete set null,
  scene_id uuid references public.scenes(id) on delete set null,
  character_id uuid references public.characters(id) on delete set null,
  title text not null,
  category text not null,
  severity public.mangu_severity not null default 'medium',
  status text not null default 'open',
  description text,
  suggested_fix text,
  assignee_user_id uuid references auth.users(id),
  root_cause text,
  lesson_learned text,
  resolution text,
  resolved_at timestamptz,
  approved_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (book_id, record_code)
);

create index if not exists editorial_issues_book_status_idx
  on public.editorial_issues(book_id, status, severity);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  record_code text not null,
  name text not null,
  asset_type text not null,
  format text,
  storage_bucket text,
  storage_path text,
  status public.mangu_record_status not null default 'draft',
  version text not null default '0.1',
  checksum text,
  metadata jsonb not null default '{}'::jsonb,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (book_id, record_code)
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  record_code text not null,
  name text not null,
  channel text,
  objective text,
  budget numeric(14,2) not null default 0 check (budget >= 0),
  status text not null default 'planned',
  progress integer not null default 0 check (progress between 0 and 100),
  kpis jsonb not null default '{}'::jsonb,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (book_id, record_code)
);

create table if not exists public.decisions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  record_code text not null,
  title text not null,
  decision text not null,
  rationale text,
  owner_label text,
  owner_user_id uuid references auth.users(id),
  status public.mangu_record_status not null default 'working',
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (book_id, record_code)
);

create table if not exists public.automations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  book_id uuid references public.books(id) on delete cascade,
  record_code text not null,
  name text not null,
  trigger_key text not null,
  condition_expression jsonb not null default '{}'::jsonb,
  action_key text not null,
  action_config jsonb not null default '{}'::jsonb,
  enabled boolean not null default true,
  run_count integer not null default 0,
  last_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, record_code)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  book_id uuid references public.books(id) on delete cascade,
  recipient_user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  message text,
  level text not null default 'info',
  action_view text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  book_id uuid references public.books(id) on delete cascade,
  agent_key text not null,
  agent_version text not null default '1.0',
  status text not null default 'queued',
  input_context jsonb not null default '{}'::jsonb,
  summary text,
  output jsonb not null default '{}'::jsonb,
  model_metadata jsonb not null default '{}'::jsonb,
  requested_by uuid references auth.users(id),
  approved_by uuid references auth.users(id),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.entity_versions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  book_id uuid references public.books(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  version integer not null check (version > 0),
  summary text,
  snapshot jsonb not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (entity_type, entity_id, version)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  book_id uuid references public.books(id) on delete cascade,
  event_type text not null,
  title text not null,
  description text,
  entity_type text,
  entity_id uuid,
  actor_user_id uuid references auth.users(id),
  actor_agent_key text,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists events_workspace_time_idx
  on public.events(workspace_id, occurred_at desc);
create index if not exists events_book_time_idx
  on public.events(book_id, occurred_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace
      and wm.user_id = auth.uid()
  );
$$;

-- Apply the updated_at trigger to mutable tables.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'organizations', 'workspaces', 'books', 'milestones', 'characters',
    'chapters', 'locations', 'scenes', 'scene_characters', 'canon_facts', 'timeline_events',
    'relationships', 'editorial_issues', 'assets', 'campaigns', 'decisions',
    'automations'
  ]
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name,
      table_name
    );
  end loop;
end;
$$;

-- Row-level security. Service-role workers bypass RLS; end users must belong
-- to the workspace attached to the record.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'books', 'milestones', 'milestone_items', 'characters', 'chapters',
    'locations', 'scenes', 'scene_characters', 'canon_facts', 'timeline_events', 'relationships',
    'editorial_issues', 'assets', 'campaigns', 'decisions', 'automations',
    'notifications', 'agent_runs', 'entity_versions', 'events'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists workspace_member_select on public.%I', table_name);
    execute format('drop policy if exists workspace_member_insert on public.%I', table_name);
    execute format('drop policy if exists workspace_member_update on public.%I', table_name);
    execute format('drop policy if exists workspace_member_delete on public.%I', table_name);
    execute format(
      'create policy workspace_member_select on public.%I for select using (public.is_workspace_member(workspace_id))',
      table_name
    );
    execute format(
      'create policy workspace_member_insert on public.%I for insert with check (public.is_workspace_member(workspace_id))',
      table_name
    );
    execute format(
      'create policy workspace_member_update on public.%I for update using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id))',
      table_name
    );
    execute format(
      'create policy workspace_member_delete on public.%I for delete using (public.is_workspace_member(workspace_id))',
      table_name
    );
  end loop;
end;
$$;

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;

drop policy if exists workspace_member_read_workspace on public.workspaces;
create policy workspace_member_read_workspace
  on public.workspaces for select
  using (public.is_workspace_member(id));

drop policy if exists member_read_membership on public.workspace_members;
create policy member_read_membership
  on public.workspace_members for select
  using (public.is_workspace_member(workspace_id));

-- Storage bucket creation should be performed from the Supabase dashboard or
-- a privileged migration. Recommended bucket: mangu-assets (private).
