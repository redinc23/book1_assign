# MANGU Book OS — Technical Specification

| Field | Value |
|---|---|
| Document ID | `TECH-BOOKOS-001` |
| Version | `1.0.0` |
| Status | **Approved for engineering** |
| Product | MANGU Book Operating System |
| Related | BRD-BOOKOS-001, FRD-BOOKOS-001 |
| Baseline stack | React 18 + TypeScript + Vite + Tailwind + Supabase (Postgres/Auth/Storage) + Vercel |
| Last Updated | 2026-07-19 |

---

## 1. Goals of this Tech Spec

Translate BRD/FRD into an implementable system design:

- Canonical architecture and module boundaries
- Data model (logical + physical) with migration strategy from today’s thin tables
- API surfaces (Supabase + Edge Functions)
- Event, approval, and AI job pipelines
- Security/tenancy model
- Frontend structure aligned to current repo
- Testing, observability, deployment, and rollout

**Normative language:** SHALL / SHOULD / MAY match RFC 2119 intent.

---

## 2. Current Baseline (repo truth)

### 2.1 What exists today

| Area | Location | Notes |
|---|---|---|
| App shell / views | `src/components/AppShell.tsx`, `src/views/*` | ViewId switcher, no URL router yet |
| Auth | `src/contexts/AuthContext.tsx`, `AuthPage` | Supabase Auth |
| Active book | `src/contexts/BookContext.tsx` | Client context |
| Domain hooks | `src/hooks/use*.ts` | Direct Supabase client calls |
| Tables | `supabase/migrations/*` | `books`, `characters`, `chapters`, `editorial_tasks`, `production_tasks`, `marketing_items`, `activity_log` |
| CI | `.github/workflows/ci.yml` | typecheck, lint, test, build |
| Deploy | `vercel.json` | SPA rewrite |

### 2.2 Known gaps vs FRD

No scenes, locations, relationships, manuscript, revisions, milestone states, approvals, proposals, assets, orgs, series/universe, rights/sales. Character/chapter columns are thin vs genome. No Edge Functions for AI. No router deep links.

### 2.3 Non-negotiable migration rule

**TS-MIG-001:** All schema changes SHALL be additive forward migrations in `supabase/migrations/`. No silent break of existing RLS owner model until org tenancy ships with backfill.

---

## 3. Target Architecture

### 3.1 Layered architecture (normative)

```
Presentation (React views/components)
    ↓
Experience (hooks, contexts, command palette, toasts)
    ↓
Workflow (milestones, approvals, work queue)
    ↓
AI Layer (jobs, agents, proposals — Edge Functions)
    ↓
Business Logic (validation, scoring, gates — SQL + TS shared)
    ↓
Knowledge Graph (entities + relationships)
    ↓
Database (Postgres via Supabase)
    ↓
Infrastructure (Vercel, Supabase, object storage, LLM providers)
```

### 3.2 Logical module map

| Module | Frontend | Data | Backend extras |
|---|---|---|---|
| Platform/Auth | Auth*, Settings | profiles, orgs, memberships | — |
| Library | Library, Dashboard widgets | books, series, universes | — |
| Genome | Genome | book_genome_attrs / JSONB columns | scoring fn |
| Characters | Characters | characters + character_genome | — |
| Narrative | Chapters, Scenes, Outline | chapters, scenes | — |
| Manuscript | Manuscript Studio | manuscripts, revisions | storage |
| Graph | Story Graph | relationships | graph RPCs |
| Lifecycle | Lifecycle | milestone_states | gate RPCs |
| Editorial | Editorial | editorial_tasks → editorial_issues | — |
| Production | Production | production_tasks, assets | storage |
| Marketing | Marketing | marketing_items, campaigns | — |
| Commercial | Rights, Sales | rights, sales | import fn |
| AI | AI Center, Approvals | agent_jobs, proposals | `ai-runner` Edge Fn |
| Audit | Activity | activity_log / audit_events | triggers |

### 3.3 Trust boundaries

1. **Browser** — untrusted; holds anon key + user JWT only  
2. **Supabase PostgREST** — RLS enforced  
3. **Edge Functions** — service role carefully scoped; LLM keys server-only  
4. **Object Storage** — signed URLs; bucket policies by org/book path  

### 3.4 Diagram — write path for AI proposal apply

```
User → Approvals UI → approve()
  → RPC apply_proposal(proposal_id)
    → verify status=pending & policy
    → BEGIN
      → apply JSON patches to entities
      → bump versions
      → insert audit_events
      → mark proposal approved
    → COMMIT
  → UI refresh + toast
```

---

## 4. Tenancy & Security Model

### 4.1 Phase strategy

| Phase | Tenancy |
|---|---|
| 0 | `user_id` ownership (current) |
| 1 | Add nullable `org_id`; backfill personal org per user; dual policies |
| 3 | Enforce `org_id` + membership role checks; deprecate pure user-only where appropriate |

### 4.2 Tables for identity

```sql
-- logical target
profiles (
  user_id uuid PK references auth.users,
  display_name text,
  settings jsonb default '{}',
  created_at timestamptz,
  updated_at timestamptz
);

organizations (
  id uuid PK,
  name text not null,
  slug text unique,
  settings jsonb default '{}',
  created_at timestamptz
);

organization_members (
  org_id uuid references organizations,
  user_id uuid references auth.users,
  role text not null,
  primary key (org_id, user_id)
);
```

### 4.3 RLS patterns (normative)

**TS-SEC-001:** Every book-scoped table SHALL authorize via:

```sql
EXISTS (
  SELECT 1 FROM books b
  WHERE b.id = <table>.book_id
    AND (
      b.user_id = auth.uid() -- legacy solo
      OR EXISTS (
        SELECT 1 FROM organization_members m
        WHERE m.org_id = b.org_id AND m.user_id = auth.uid()
      )
    )
)
```

Role-sensitive writes (rights, milestone advance) SHALL use SECURITY DEFINER RPCs that check role.

### 4.4 Secrets

| Secret | Where |
|---|---|
| `VITE_SUPABASE_URL` | Vercel env (public) |
| `VITE_SUPABASE_ANON_KEY` | Vercel env (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions only |
| `LLM_API_KEY` | Edge Functions only |
| Never | Committed to git |

### 4.5 Audit

**TS-SEC-002:** Consequential actions SHALL write `audit_events` (or enhanced `activity_log`) with actor, action, entity, before/after (or patch), request id.

---

## 5. Data Model

### 5.1 Universal header (physical strategy)

**TS-DATA-001:** Prefer shared columns on each table for queryability; put sparse genome attributes in `attributes jsonb` with JSON schema validation in app + optional DB check.

Recommended shared columns:

```text
id uuid PK DEFAULT gen_random_uuid()
org_id uuid NULL
book_id uuid NULL REFERENCES books(id) ON DELETE CASCADE
series_id uuid NULL
universe_id uuid NULL
status text NOT NULL DEFAULT 'draft'
approval_status text NOT NULL DEFAULT 'draft'
version int NOT NULL DEFAULT 1
owner_user_id uuid NOT NULL DEFAULT auth.uid()
title text  -- or name
short_description text
long_description text
purpose text
tags text[] DEFAULT '{}'
keywords text[] DEFAULT '{}'
priority text
visibility text DEFAULT 'team'
confidentiality text DEFAULT 'standard'
ai jsonb DEFAULT '{}'  -- summary, confidence, recommendations, completeness, risk...
workflow jsonb DEFAULT '{}' -- phase, completion_pct, risk_level, dependencies...
attributes jsonb DEFAULT '{}' -- entity-specific genome fields
created_at timestamptz DEFAULT now()
updated_at timestamptz DEFAULT now()
```

### 5.2 Entity → table mapping

| Entity | Table | Phase |
|---|---|---|
| Book | `books` (expand) | 0+ |
| Character | `characters` (expand) | 0+ |
| Chapter | `chapters` (expand) | 0+ |
| Scene | `scenes` | 1 |
| Location | `locations` | 1 |
| Relationship | `relationships` | 1 |
| TimelineEvent | `timeline_events` | 1 |
| Theme | `themes` | 1 |
| CanonRule | `canon_rules` | 1 |
| SystemRule | `system_rules` | 2 |
| Manuscript | `manuscripts` | 1 |
| Revision | `manuscript_revisions` | 1 |
| EditorialIssue | rename/evolve `editorial_tasks` | 0→1 |
| ProductionTask | `production_tasks` | 0 |
| Asset | `assets` | 2 |
| MarketingItem | `marketing_items` | 0 |
| Campaign | `campaigns` | 2 |
| Rights | `rights_records` | 3 |
| Sale | `sales_records` | 3 |
| MilestoneState | `milestone_states` | 1 |
| Approval | `approvals` | 1 |
| AgentJob | `agent_jobs` | 1 |
| Proposal | `proposals` | 1 |
| Snapshot | `snapshots` | 1 |
| Activity | `activity_log` / `audit_events` | 0+ |
| Notification | `notifications` | 1 |
| StyleGuide | `style_guides` | 2 |
| Series | `series` | 3 |
| Universe | `universes` | 3 |

### 5.3 Core DDL sketches (Phase 1 critical path)

#### 5.3.1 `scenes`

```sql
CREATE TABLE scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  chapter_id uuid NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  sequence integer NOT NULL,
  title text NOT NULL DEFAULT '',
  synopsis text DEFAULT '',
  pov_character_id uuid REFERENCES characters(id) ON DELETE SET NULL,
  location_id uuid, -- FK when locations exist
  characters_present uuid[] DEFAULT '{}',
  purpose text DEFAULT '',
  conflict text DEFAULT '',
  outcome text DEFAULT '',
  emotional_shift text DEFAULT '',
  plot_advancement text DEFAULT '',
  word_goal integer DEFAULT 0,
  word_count integer DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  attributes jsonb NOT NULL DEFAULT '{}',
  ai jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (chapter_id, sequence)
);
```

#### 5.3.2 `relationships`

```sql
CREATE TABLE relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  from_type text NOT NULL,
  from_id uuid NOT NULL,
  to_type text NOT NULL,
  to_id uuid NOT NULL,
  relationship_type text NOT NULL,
  strength numeric,
  notes text DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  attributes jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX idx_relationships_book ON relationships(book_id);
CREATE INDEX idx_relationships_from ON relationships(from_type, from_id);
CREATE INDEX idx_relationships_to ON relationships(to_type, to_id);
```

#### 5.3.3 `manuscripts` + revisions

```sql
CREATE TABLE manuscripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  chapter_id uuid NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  scene_id uuid REFERENCES scenes(id) ON DELETE SET NULL,
  body text NOT NULL DEFAULT '',
  format text NOT NULL DEFAULT 'markdown',
  word_count integer NOT NULL DEFAULT 0,
  version integer NOT NULL DEFAULT 1,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (chapter_id) -- chapter-scoped body v1
);

CREATE TABLE manuscript_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manuscript_id uuid NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  label text,
  body text NOT NULL,
  word_count integer NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);
```

#### 5.3.4 Milestone states

```sql
CREATE TABLE milestone_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  milestone_code text NOT NULL, -- 'M0'..'M20'
  status text NOT NULL DEFAULT 'locked',
  exit_criteria jsonb NOT NULL DEFAULT '[]',
  deliverables jsonb NOT NULL DEFAULT '[]',
  waiver_reason text,
  waived_by uuid,
  completed_at timestamptz,
  approved_by uuid,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (book_id, milestone_code)
);
```

#### 5.3.5 Proposals / jobs / approvals

```sql
CREATE TABLE agent_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  agent_key text NOT NULL,
  scope jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'queued', -- queued|running|succeeded|failed|cancelled
  error text,
  cost_cents integer,
  token_usage jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  finished_at timestamptz
);

CREATE TABLE proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES agent_jobs(id) ON DELETE SET NULL,
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  agent_key text NOT NULL,
  summary text NOT NULL,
  patches jsonb NOT NULL, -- [{table, id, expected_version, ops:[...]}]
  evidence jsonb DEFAULT '{}',
  confidence numeric,
  risk text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'pending', -- pending|approved|rejected|applied|failed
  decision_note text,
  decided_by uuid,
  decided_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  kind text NOT NULL, -- ai_proposal|milestone_advance|asset_publish|...
  subject_type text NOT NULL,
  subject_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  requested_by uuid,
  assigned_to uuid,
  payload jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);
```

#### 5.3.6 Snapshots

```sql
CREATE TABLE snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  label text NOT NULL,
  reason text,
  payload jsonb NOT NULL, -- packed subgraph
  created_by uuid,
  created_at timestamptz DEFAULT now()
);
```

### 5.4 Expanding existing tables

**books** add: `org_id`, `series_id`, `universe_id`, `working_title`, `official_title`, `subtitle`, `language`, `isbn`, `asin`, `publication_type`, `current_milestone`, `logline`, `premise`, `audience`, `attributes jsonb`, `ai jsonb`, `version`, health score columns or jsonb `scores`.

**characters** add: psychology columns or `attributes jsonb` domains; `alive boolean`; appearance fields; `voice jsonb`; `first_appearance_scene_id`; `version`.

**chapters** add: planning fields from FR-CH-002; `act`, `sequence`, `purpose`, `synopsis`, emotions, etc.; `version`.

**editorial_tasks** → evolve to `editorial_issues` with `description`, `entity_type`, `entity_id`, `anchor jsonb`, keep compatible view/alias during migration.

### 5.5 Indexes & performance

| Need | Index |
|---|---|
| Book lists | `(user_id, updated_at desc)`, `(org_id, updated_at desc)` |
| Chapter order | `(book_id, number)` |
| Scene order | `(chapter_id, sequence)` |
| Issues kanban | `(book_id, status)`, `(book_id, severity)` |
| Graph traversal | from/to indexes above |
| Activity feed | `(user_id, created_at desc)`, `(book_id, created_at desc)` |
| Proposals inbox | `(book_id, status, created_at desc)` |

### 5.6 Word count aggregation

**TS-DATA-002:** Manuscript save SHALL update `manuscripts.word_count`, then recompute `chapters.word_count`, then recompute `books.word_count` in one RPC `save_manuscript_body`.

---

## 6. Validation, Scoring & Milestone Gates

### 6.1 Shared validation package

Implement `src/lib/validation/` (and mirrored SQL where gates must be trusted):

- `schemas/` Zod (or equivalent) entities
- `gates/milestones.ts` pure functions: `(bookSnapshot) => GateResult`
- `scoring/health.ts` pure functions for health scores

**TS-VAL-001:** Gate evaluation used by UI MAY run client-side for UX, but **advance RPC SHALL re-validate server-side**.

### 6.2 GateResult contract

```ts
type GateResult = {
  milestone: `M${number}`;
  ok: boolean;
  criteria: Array<{
    id: string;
    label: string;
    passed: boolean;
    severity: 'blocker' | 'warn';
    link?: { view: string; entityId?: string };
  }>;
};
```

### 6.3 Default blockers (initial)

| Milestone | Blocker examples |
|---|---|
| M1 | missing logline OR premise |
| M2 | <1 protagonist OR protagonist missing core wound/desire |
| M3 | genome completeness < threshold OR zero relationships when characters ≥2 |
| M6 | any chapter missing purpose |
| M7 | any scene missing purpose/conflict/emotional_shift/plot_advancement |
| M8 | book.word_count < 0.9 * target OR any chapter status not in draft_complete+ |
| M12 | any critical editorial issue open |
| M13 | preflight failures (ISBN/cover/manuscript approved) |
| M16 | distribution package incomplete |

Thresholds live in `book.settings.gates` with system defaults.

### 6.4 Health score formulas (v1)

All scores 0–100.

- **Creative Health:** avg(character psych completeness, chapter purpose coverage, scene necessity coverage, genome narrative layer)
- **Editorial Health:** 100 - weighted open issues (critical×15, high×8, medium×3, low×1), floored at 0; reopen penalty
- **Commercial Readiness:** metadata completeness × comps present × messaging kit present
- **Launch Readiness:** min(production preflight, marketing checklist, editorial health gate)
- **AI Confidence:** avg confidence of recent applied proposals minus rejection rate penalty

Store on `books.scores jsonb` refreshed by trigger/RPC on relevant changes.

---

## 7. API Surface

### 7.1 Primary access pattern

Phase 0–1: Supabase JS client from hooks with RLS.  
Privileged workflows: RPCs + Edge Functions.

### 7.2 RPC catalog (required)

| RPC | Purpose | Security |
|---|---|---|
| `save_manuscript_body(chapter_id, body, expected_version)` | Autosave + aggregates | invoker + RLS |
| `advance_milestone(book_id, to_code, waiver_reason?)` | Gate + approve advance | definer + role check |
| `create_book_snapshot(book_id, label, reason)` | Pack subgraph | invoker |
| `restore_book_snapshot(snapshot_id)` | Restore | definer + confirm ownership |
| `submit_agent_job(agent_key, book_id, scope)` | Enqueue AI | invoker |
| `apply_proposal(proposal_id, note?)` | Transactional apply | definer |
| `reject_proposal(proposal_id, note)` | Reject | invoker/definer |
| `evaluate_gates(book_id, milestone_code)` | Return GateResult | invoker |

### 7.3 Edge Functions

| Function | Responsibility |
|---|---|
| `ai-runner` | Pull job, load context pack, call LLM, write proposals/artifacts, update job |
| `sales-import` | CSV parse → sales_records (Phase 3) |
| `opas-export` | Build OPAS package (Phase 3) |

**TS-API-001:** `ai-runner` SHALL enforce max tokens/cost per job and redact secrets from logs.

### 7.4 Context pack for agents

```ts
type AgentContextPack = {
  book: BookSummary;
  milestone: string;
  entities: Record<string, unknown[]>; // scoped
  styleGuide?: unknown;
  canonRules: unknown[];
  manuscriptExcerpts?: Array<{ chapterId: string; text: string }>;
  limits: { maxChars: number };
};
```

Pack assembly rules per `agent_key` in `src/lib/ai/contextPacks.ts` (shared types) and Edge Function.

### 7.5 Proposal patch format

```json
{
  "table": "characters",
  "id": "uuid",
  "expected_version": 3,
  "ops": [
    { "op": "set", "path": "/attributes/psychology/core_wound", "value": "..." }
  ]
}
```

Apply rejects on version mismatch → proposal status `failed` with conflict error; user retries after refresh.

### 7.6 REST/public API (Phase 3)

Versioned `/api/v1` via Edge Functions or Supabase for partner access with org tokens. Out of Phase 0–1 scope except designing IDs stable.

---

## 8. Event System

### 8.1 Domain events (logical)

Emit as audit rows + optional `domain_events` table for async consumers:

| Event | When |
|---|---|
| `EVT-BookCreated` | book insert |
| `EVT-EntityUpdated` | consequential update |
| `EVT-MilestoneAdvanced` | gate pass |
| `EVT-MilestoneWaived` | waiver |
| `EVT-ProposalSubmitted` | AI job done |
| `EVT-ProposalApplied` | apply success |
| `EVT-ProposalRejected` | reject |
| `EVT-SnapshotCreated` | snapshot |
| `EVT-SnapshotRestored` | restore |
| `EVT-AssetUploaded` | asset |
| `EVT-EditorialIssueOpened/Resolved` | editorial |

### 8.2 Notification projection

Worker/trigger maps events → `notifications` for assignees.

---

## 9. Frontend Architecture

### 9.1 Target folder structure

```text
src/
  App.tsx
  main.tsx
  types/                 # expand beyond ViewId
  lib/
    supabase.ts
    validation/
    scoring/
    gates/
    ai/                  # types, agent catalog (no secrets)
    progress.ts
  contexts/
  hooks/                 # one hook family per entity
  components/
    shell/
    ui/
    genome/
    manuscript/
    graph/
    approvals/
  views/                 # route-level screens
  routes/                # Phase 1 router
```

### 9.2 Routing

**TS-FE-001:** Introduce React Router (or equivalent) in Phase 1:

- `/` dashboard  
- `/library`  
- `/books/:bookId/...` nested module routes  

Keep ViewId mapping during migration.

### 9.3 State strategy

- Server state: Supabase fetches in hooks; prefer simple `useEffect` + local state consistent with current codebase (no mandatory React Query unless team adopts it).
- Active book: context (existing).
- Avoid premature `useMemo`/`useCallback` unless measured need (match repo guidance).

### 9.4 Manuscript editor

**TS-FE-002:** Phase 1 MAY use textarea/Markdown editor; Phase 2 MAY adopt rich text. Body stored Markdown. Autosave debounce 500–1000ms calling `save_manuscript_body`.

Virtualize chapter list; do not load all manuscript bodies at once.

### 9.5 Graph UI

Use a lightweight canvas/SVG library; fetch nodes/edges for one book; cap initial render with clustering if >200 nodes.

### 9.6 Design system

Preserve existing MANGU visual language (gold accent tokens, current Tailwind theme). New modules must reuse shell patterns (Topbar/Sidebar/Modal/Toast).

### 9.7 Progressive disclosure for genomes

**TS-FE-003:** Genome forms SHALL use domain accordions + “required for milestone” filters; never dump 250 fields on one flat page.

---

## 10. AI Agent Technical Design

### 10.1 Agent catalog config

```ts
// src/lib/ai/agents.ts
export type AgentDef = {
  key: string; // AGT key without prefix or stable slug
  name: string;
  description: string;
  defaultAutonomy: 'observe' | 'suggest' | 'propose' | 'auto_low_risk';
  allowedPatchTables: string[];
  contextBuilder: string; // name of pack builder
  systemPromptVersion: string;
  output: 'proposal' | 'report' | 'both';
  milestoneHints: string[];
};
```

### 10.2 Job lifecycle

`queued → running → succeeded|failed|cancelled`

Idempotency key: `(book_id, agent_key, scope_hash, prompt_hash)` optional debounce.

### 10.3 Prompt governance

- Prompts versioned strings in repo `ai/prompts/<agent>/<version>.md`
- Output MUST be structured JSON validated before proposal insert
- Include canon rules + “do not invent IDs; use provided IDs”

### 10.4 Continuity Guardian algorithm (v1)

1. Load characters, timeline, scenes, locations, canon rules, manuscript excerpts  
2. Extract claims (age, location-at-time, inventory, knowledge)  
3. Detect contradictions  
4. Emit proposals that create `editorial_issues` patches (not silent manuscript rewrites)

### 10.5 Developmental Editor algorithm (v1)

Diagnostic only: produce report artifact + issue patches; `allowedPatchTables = ['editorial_tasks']` (or issues).

### 10.6 Safety

- Server-side moderation / policy checks  
- PII minimization in logs  
- Per-org monthly budget counters in `org_ai_usage`

---

## 11. Storage & Assets

### 11.1 Buckets

| Bucket | Path pattern | Use |
|---|---|---|
| `covers` | `{org_id}/{book_id}/cover/{file}` | covers |
| `assets` | `{org_id}/{book_id}/{asset_type}/{file}` | production assets |
| `exports` | `{org_id}/{book_id}/exports/{id}.zip` | packages |
| `snapshots` | optional large payloads if not jsonb | cold storage |

### 11.2 Upload flow

Client requests signed upload URL (RPC/Edge) → upload → insert `assets` row → audit.

Max sizes configurable; MIME allowlist.

---

## 12. Import / Export / OPAS

### 12.1 Internal JSON package (Phase 1)

```json
{
  "format": "mangu.bookos.package",
  "version": "1.0",
  "exportedAt": "ISO",
  "book": {},
  "characters": [],
  "chapters": [],
  "scenes": [],
  "locations": [],
  "relationships": [],
  "themes": [],
  "timeline_events": [],
  "editorial_issues": [],
  "manuscripts": []
}
```

### 12.2 OPAS (Phase 3)

Map to OPAS layers (workflow vocab, exchange ops, intelligence metrics) per Manual Vol XVIII. Implement subset + extension points; certify later.

---

## 13. Testing Strategy

### 13.1 Unit tests (Vitest)

| Area | Examples |
|---|---|
| Progress/scoring | extend `progress.test.ts` patterns |
| Gates | each milestone fixture pass/fail |
| Patch apply | version conflict, transactional ops |
| Health scores | deterministic fixtures |

### 13.2 Integration / RLS

Supabase local tests or SQL tests for policies: user A cannot read user B book rows.

### 13.3 E2E (Phase 1+)

Playwright critical paths: auth → create book → chapter → manuscript save → milestone gate block → AI proposal approve.

### 13.4 CI gates

Existing CI SHALL remain green. New packages must typecheck/lint/test/build.

**TS-QA-001:** No merge of gate/RPC changes without unit tests for happy path + deny path.

---

## 14. Observability & Ops

| Concern | Approach |
|---|---|
| Frontend errors | console + future Sentry |
| Edge Function logs | Supabase logs; structured JSON |
| AI cost | `agent_jobs.cost_cents` + org rollup |
| Perf | mark manuscript save timings |
| Feature flags | `org.settings.flags` / env flags |

SLOs: see NFR-001/002; page error rate <1% of sessions Phase 2.

---

## 15. Deployment & Environments

| Env | Purpose |
|---|---|
| Local | Vite + local/cloud Supabase |
| Preview | Vercel PR previews + Preview env vars |
| Production | Vercel production + Prod Supabase |

Migrations applied via Supabase CLI/CI; never hand-edit prod schema.

---

## 16. Implementation Plan (engineering sequence)

Aligned to FRD epics; technical tasks:

### Phase 0 hardening
1. Add router scaffolding behind flag (optional)  
2. Expand types + shared table types  
3. Ensure all hooks write activity_log  
4. Lifecycle UI binds to `books.phase` mapping M0–M20 labels  
5. Genome shell writes `books.attributes`  
6. RLS regression tests  

### Phase 1 vertical slices
1. Migrations: scenes, relationships, manuscripts, milestone_states, proposals, approvals, snapshots  
2. RPCs: save_manuscript_body, evaluate_gates, advance_milestone  
3. Manuscript Studio UI  
4. Gates wired for M2/M3/M6/M7/M8  
5. Approvals UI  
6. `ai-runner` + 2 agents (Continuity, Dev Editor)  
7. Snapshot create/restore  

### Phase 2
1. Assets + storage  
2. Metadata export  
3. Campaigns  
4. Agent roster expansion  
5. scores job  

### Phase 3
1. orgs/members/roles  
2. series/universe + inheritance resolution service  
3. rights/sales  
4. OPAS export  

---

## 17. Coding Standards (repo-specific)

- TypeScript strict; no `any` without justification  
- Prefer clear hooks over god-objects  
- Match existing component patterns (Modal, Toast, Topbar)  
- Migrations documented with header comments like existing SQL files  
- Do not invent parallel frontends; prototype-reference is transplant source only  
- Keep secrets out of client bundles  

---

## 18. Risk Register (technical)

| Risk | Mitigation |
|---|---|
| JSONB genome chaos | schema registry + Zod + milestone required paths |
| Large manuscript rows | chapter-scoped bodies; consider storage for mega chapters later |
| AI nondeterminism | structured outputs + human approve + snapshots |
| RLS bugs on join tables | helper SQL functions + tests |
| Graph over-fetch | pagination + scoped queries |
| Dual tenancy transition | backfill personal orgs early |

---

## 19. Detailed Module Contracts (selected)

### 19.1 Hook conventions

```ts
// pattern
export function useCharacters(bookId: string | null) {
  // load, create, update, remove
  // all mutations: supabase + activity log (+ toast via caller)
}
```

Every new entity gets `use<Entity>s.ts` + view + types.

### 19.2 View responsibilities

Views orchestrate; hooks own data; `lib/*` owns pure business rules. **No gate logic only in JSX.**

### 19.3 Activity helper

```ts
logActivity({ action, target, entityType, entityId, bookId, metadata })
```

Centralize in `src/lib/activity.ts`.

---

## 20. Milestone Code Enum (normative)

```ts
export const MILESTONES = [
  'M0','M1','M2','M3','M4','M5','M6','M7','M8','M9',
  'M10','M11','M12','M13','M14','M15','M16','M17','M18','M19','M20'
] as const;
export type MilestoneCode = typeof MILESTONES[number];
```

Map display names exactly per BRD §6.

---

## 21. Agent Key Enum (normative)

```ts
export const AGENT_KEYS = [
  'executive_publisher','market_intelligence','concept_architect','story_architect',
  'character_psychologist','world_builder','plot_engineer','chapter_planner',
  'scene_director','dialogue_coach','developmental_editor','continuity_guardian',
  'copy_editor','fact_checker','production_coordinator','marketing_strategist',
  'metadata_specialist','rights_manager','sales_analyst','portfolio_manager',
  'executive_copilot'
] as const;
```

---

## 22. Acceptance Tests mapped to Tech

| Phase | Tech proof |
|---|---|
| 0 | CI green; RLS test user isolation; activity on CRUD |
| 1 | RPC gate deny/allow fixtures; manuscript version conflict; proposal apply transaction; snapshot round-trip |
| 2 | signed upload; preflight RPC; ≥12 agent defs registered; scores recomputed |
| 3 | role deny on rights update; inheritance resolver tests; OPAS round-trip fixture |

---

## 23. Open Engineering Decisions (decide in Phase 1 kickoff)

| Decision | Options | Recommendation |
|---|---|---|
| Router | React Router v6 vs wouter | React Router v6 |
| Validation lib | Zod vs Valibot | Zod (ecosystem) |
| Manuscript format | Markdown vs Tiptap JSON | Markdown v1 |
| Graph lib | cytoscape vs react-flow | react-flow |
| Job queue | DB poll vs Supabase queue | DB poll `agent_jobs` v1 |
| Genome storage | wide columns vs JSONB | hybrid: key filters as columns, deep domains JSONB |

These recommendations are binding unless Product/Eng lead amends this spec.

---

## 24. Appendix — Mapping Manual Volumes → Tech modules

| Volume | Tech module |
|---|---|
| I Vision/SSOT | Platform principles, derived artifacts |
| II Entities/Genome core | tables + relationships + inheritance |
| III Workbook/schema | migrations + validation |
| IV Milestones | milestone_states + gates |
| V Creative engine | characters/scenes/themes/scores |
| VI Editorial | editorial_issues + style |
| VII Production/commercial | assets, metadata, marketing, sales, rights |
| VIII AI agents | agent_jobs/proposals/ai-runner |
| IX Data dictionary | types + schema registry |
| X–XV Genomes | attributes jsonb domains + UI |
| XI Analytics | scores + dashboards |
| XII Enterprise platform | orgs, events, search, API |
| XVI Ontology/KG | relationships + constraints |
| XVII ADK | prompts, context packs, agent defs |
| XVIII OPAS | export/import adapters |

---

## 25. Document control

| Version | Date | Notes |
|---|---|---|
| 1.0.0 | 2026-07-19 | Initial exhaustive technical specification for full Book OS build |
