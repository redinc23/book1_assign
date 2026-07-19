# Technical Specification
# MANGU Book Operating System (Book OS)

| Field | Value |
|---|---|
| Document ID | MANGU-TECH-001 |
| Version | 1.0.0 |
| Status | Engineering-Ready |
| Date | 2026-07-19 |
| Owner | Engineering |
| Parents | `01-BRD-MANGU-Book-OS.md`, `02-FRD-MANGU-Book-OS.md` |
| Canonical Implementation | React + TypeScript + Vite + Supabase (this repo) |
| Prototype Reference | `prototype-reference/` (interaction & domain reference only) |

---

## 0. Goals of This Spec

1. Give developers an unambiguous build blueprint.
2. Define the target architecture, schema, APIs, AI runtime, security, and testing.
3. Map current repo → target state without dual sources of truth.
4. Provide migration sequencing that does not strand the live app.

---

## 1. System Context

```
┌─────────────────────────────────────────────────────────────────┐
│                         Clients                                  │
│  Web App (React/Vite SPA on Vercel)  │  Future Portals / Mobile  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼─────────────────────────────────────┐
│                    Edge / Server Layer                           │
│  Supabase Auth  │  PostgREST  │  Edge Functions  │  AI Gateway   │
└─────────┬─────────────┬─────────────┬─────────────┬─────────────┘
          │             │             │             │
          ▼             ▼             ▼             ▼
     Postgres+RLS   Storage Bucket  Queue/Jobs   LLM Providers
          │
          ▼
   Knowledge Graph (relational + relationship edges + optional embeddings)
```

### 1.1 Platform Layers (Manual Vol I / XII mapping)
| Layer | Responsibility | Implementation |
|---|---|---|
| Presentation | UI views, packets rendering | React views/components |
| Experience | Navigation, command palette, notifications | AppShell, future router |
| Workflow | Milestones, approvals, queues | Tables + RPCs + UI |
| AI | Agents, tools, proposals | Edge Functions + agent_runs |
| Business Logic | Validation, readiness, gates | SQL functions + TS domain lib |
| Knowledge Graph | Entities + relationships | Postgres schema |
| Database | Canonical SSOT | Supabase Postgres |
| Infrastructure | Hosting, CI, secrets | Vercel + Supabase + GitHub Actions |

---

## 2. Current Repo Baseline (As-Is)

### 2.1 Stack
- **Frontend:** React 18, TypeScript, Vite, Tailwind, lucide-react
- **Backend:** Supabase JS client (`src/lib/supabase.ts`)
- **Auth:** Supabase Auth via `AuthContext`
- **State:** React context for auth + active book; hooks per domain
- **CI:** `.github/workflows/ci.yml` — typecheck, lint, test, build
- **Deploy:** `vercel.json` SPA rewrite
- **Tests:** Vitest (`src/lib/progress.test.ts`)

### 2.2 Existing Views (`ViewId`)
`dashboard | library | lifecycle | genome | characters | chapters | editorial | production | marketing | ai-center | activity`

### 2.3 Existing Migrations (user-scoped)
- `books` (user_id owner model)
- `characters`, `chapters`
- `editorial_tasks`
- `production_tasks`, `marketing_items`, `activity_log`

### 2.4 Reference Assets
- `prototype-reference/legacy-schema.sql` — target-leaning workspace model
- `prototype-reference/MANGU_Book_OS_v0_2_Standalone.html` — UX/flows
- `prototype-reference/HANDOFF-v0.2.md` — amalgamation strategy

### 2.5 Architectural Debt to Resolve
1. User-scoped RLS → workspace-scoped RLS
2. Missing scenes/locations/relationships/canon/milestones tables in live migrations
3. AI Center heuristics ≠ governed agent runtime
4. No storage bucket wiring yet
5. View-state navigation vs URL routing (recommend React Router in Phase B)

---

## 3. Target Architecture

### 3.1 Tenancy Model
```
organizations
  └── workspaces
        ├── workspace_members (user_id, role, capabilities[])
        └── books (projects)
              └── all book-scoped entities
```

### 3.2 Design Decisions (ADRs)

#### ADR-001 — Canonical app is React/Supabase
**Decision:** Prototype remains reference only.  
**Consequence:** Port features, not the localStorage kernel wholesale.

#### ADR-002 — Postgres is SSOT; JSONB for genome extensibility
**Decision:** Stable/query-critical fields are columns; deep genome attributes live in `genome JSONB` with versioned JSON schemas.  
**Consequence:** Progressive enrichment without endless migrations; GIN indexes for common paths.

#### ADR-003 — RLS is the primary authorization boundary
**Decision:** All client access via anon key + user JWT; privileged AI apply via Edge Function service role with explicit checks.  
**Consequence:** Mandatory RLS tests.

#### ADR-004 — AI mutates only through tool layer + approvals
**Decision:** LLMs never get raw DB credentials in the browser.  
**Consequence:** Agent runs server-side; proposals gate L3/L4.

#### ADR-005 — Event log is append-only
**Decision:** `events` table is immutable audit fabric.  
**Consequence:** Activity UI reads events; no update/delete policies for normal roles.

#### ADR-006 — Soft archive over hard delete
**Decision:** Status `archived` (+ optional `archived_at`). Hard delete only for empty drafts by owner within short window (optional).  
**Consequence:** ID stability for graph/AI.

#### ADR-007 — URL routing introduction
**Decision:** Add React Router with routes mirroring ViewId + entity IDs by Phase B.  
**Consequence:** Deep links for issues/chapters; keeps AppShell.

---
## 4. Logical Data Model

### 4.1 Core Enums
```sql
create type public.mangu_record_status as enum (
  'draft', 'working', 'review', 'approved', 'published', 'archived'
);
create type public.mangu_severity as enum (
  'low', 'medium', 'high', 'critical'
);
create type public.mangu_gate_mode as enum ('soft', 'hard');
```

### 4.2 Entity Relationship Overview
```
organizations 1—* workspaces 1—* workspace_members
workspaces 1—* books
books 1—* milestones 1—* milestone_items
books 1—* characters
books 1—* chapters 1—* scenes
scenes *—* characters (scene_characters)
books 1—* locations
books 1—* relationships
books 1—* canon_facts
books 1—* timeline_events
books 1—* editorial_issues
books 1—* assets
books 1—* campaigns
books 1—* decisions
books 1—* rights_agreements
books 1—* sales_facts
workspaces 1—* automations
workspaces 1—* notifications
workspaces 1—* agent_runs
workspaces 1—* entity_versions
workspaces 1—* events
```

### 4.3 Table Specifications

#### 4.3.1 organizations
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| name | text not null | |
| slug | text not null unique | lowercase kebab |
| settings | jsonb | org policies (MFA required, etc.) |
| created_at / updated_at | timestamptz | |

#### 4.3.2 workspaces
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| organization_id | uuid FK | cascade |
| name | text | |
| slug | text | unique (organization_id, slug) |
| settings | jsonb | gate modes, defaults |
| created_at / updated_at | timestamptz | |

#### 4.3.3 workspace_members
| Column | Type | Notes |
|---|---|---|
| workspace_id | uuid FK | PK composite |
| user_id | uuid FK auth.users | PK composite |
| role | text | see role catalog |
| capabilities | text[] | overrides |
| created_at | timestamptz | |

#### 4.3.4 books (target)
Align toward `legacy-schema.sql` while migrating from current `books`:

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| workspace_id | uuid FK | required after migration |
| record_code | text | unique (workspace_id, record_code) |
| title | text not null | |
| subtitle | text | |
| series_id | uuid null | FK series (P1) |
| universe_id | uuid null | FK universes (P1) |
| genre | text | |
| publication_type | text | default book |
| status | mangu_record_status | |
| current_milestone | text | e.g. M0 |
| target_release_date | date | |
| owner_user_id | uuid | |
| word_count / word_goal | int | >=0 |
| hook / logline / audience / primary_theme / tone / point_of_view | text | commercial/creative seed |
| genome | jsonb | deep Book Genome |
| approval_state | text | |
| version | int | >0 |
| progress | int | cached 0–100 optional |
| created_at / updated_at | timestamptz | |

**Migration note:** Current `user_id` maps to membership+owner; do not drop until workspace backfill complete.

#### 4.3.5 milestones / milestone_items
As in `prototype-reference/legacy-schema.sql`. Seed M0–M20 on book create from template JSON.

#### 4.3.6 Baseline tables from legacy schema (normative)
Implement exactly as specified in `prototype-reference/legacy-schema.sql` for:
`characters`, `chapters`, `locations`, `scenes`, `scene_characters`, `canon_facts`, `timeline_events`, `relationships`, `editorial_issues`, `assets`, `campaigns`, `decisions`, `automations`, `notifications`, `agent_runs`, `entity_versions`, `events`
including indexes, `set_updated_at` triggers, and workspace RLS policies.

#### 4.3.7 Additive Tables
```sql
create table public.series (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  record_code text not null,
  name text not null,
  genome jsonb not null default '{}'::jsonb,
  status public.mangu_record_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, record_code)
);

create table public.universes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  record_code text not null,
  name text not null,
  genome jsonb not null default '{}'::jsonb,
  status public.mangu_record_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, record_code)
);

create table public.rights_agreements (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  record_code text not null,
  rights_type text not null,
  owner_label text,
  territory text,
  language text,
  exclusivity text,
  starts_on date,
  ends_on date,
  renewal_terms text,
  revenue numeric(14,2) default 0,
  status public.mangu_record_status not null default 'draft',
  restrictions text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (book_id, record_code)
);

create table public.sales_facts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  sold_on date not null,
  retailer text not null,
  units integer not null default 0,
  net_revenue numeric(14,2) not null default 0,
  currency text not null default 'USD',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.ai_proposals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  book_id uuid references public.books(id) on delete cascade,
  agent_run_id uuid references public.agent_runs(id) on delete cascade,
  title text not null,
  summary text,
  governance_level int not null check (governance_level between 1 and 4),
  status text not null default 'pending',
  proposed_ops jsonb not null default '[]'::jsonb,
  edited_ops jsonb,
  resolution_note text,
  requested_by uuid references auth.users(id),
  resolved_by uuid references auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.book_acl (
  book_id uuid not null references public.books(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  capability_set text[] not null default '{}',
  created_at timestamptz not null default now(),
  primary key (book_id, user_id)
);
```

### 4.4 record_code Generation
Server-side function per entity prefix:
`BOOK`, `CHAR`, `CHAP`, `SCN`, `LOC`, `REL`, `CAN`, `TL`, `ED`, `AST`, `CMP`, `DEC`, `RGT`, `AGT`  
Format: `PREFIX-000001` zero-padded, monotonic per workspace or per book as specified in FRD.

### 4.5 Genome JSON Schema Strategy
- Store JSON Schema documents in repo: `src/domain/genome/book.schema.json`, `character.schema.json`, etc.
- Validate on write in Edge/RPC for known paths; unknown keys allowed under `extensions` namespace.
- Version field: `genome._schema_version`.

### 4.6 Indexes (Minimum)
- `(workspace_id, status)` on major tables
- `(book_id, sequence)` on chapters/scenes
- GIN on `genome`, `metadata`, `payload`
- `(workspace_id, occurred_at desc)` on events
- `(recipient_user_id, created_at desc)` on notifications
- Unique constraints as in legacy schema

### 4.7 RLS Pattern
```sql
create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = target_workspace and wm.user_id = auth.uid()
  );
$$;
```
All book-scoped tables: `using (public.is_workspace_member(workspace_id))` plus optional `book_acl` OR for contractors.

**Capability-aware writes:** Prefer SECURITY DEFINER RPCs for sensitive transitions (`advance_milestone`, `apply_ai_proposal`) that call `assert_capability(workspace_id, 'milestone.advance.hard')`.

---

## 5. Migration Plan (Live App → Target Schema)

### Phase M1 — Non-breaking additive
1. Create organizations/workspaces/members.
2. Backfill: for each distinct `books.user_id`, create personal org/workspace + membership role `publisher`.
3. Add `books.workspace_id` nullable → backfill → set NOT NULL.
4. Keep `books.user_id` temporarily for compat.

### Phase M2 — New entities
Ship milestones, scenes, locations, relationships, canon, timeline, events, agent_runs, ai_proposals from legacy schema.

### Phase M3 — Cutover RLS
Replace user-scoped policies with workspace policies; dual-run tests.

### Phase M4 — Deprecate legacy tables/columns
Map `editorial_tasks` → `editorial_issues` (data migrate); `activity_log` → `events`; marketing_items → campaigns (or keep items as lightweight campaigns).

### Phase M5 — Storage
Create private bucket `mangu-assets`; wire assets table.

**Rule:** Every migration must be expandable/rollback-safe; expand/contract pattern.

---

## 6. Application Architecture (Frontend)

### 6.1 Directory Target
```
src/
  app/                 # router, providers
  components/          # shell, primitives
  domain/              # pure TS: readiness, genome schemas, record codes
  features/
    library/
    lifecycle/
    genome/
    characters/
    chapters/
    scenes/
    studio/
    editorial/
    production/
    marketing/
    ai/
    activity/
  hooks/               # data hooks (react-query optional later)
  lib/                 # supabase client, utils
  types/
```

### 6.2 State Management
- Auth + workspace + active book in contexts (or Zustand later if needed)
- Server state via Supabase hooks; introduce `@tanstack/react-query` when caching complexity demands (Phase B recommendation)
- Avoid premature useMemo/useCallback unless measuring; follow repo patterns

### 6.3 Routing (Phase B)
| Route | Module |
|---|---|
| `/` | dashboard |
| `/library` | library |
| `/books/:bookId/lifecycle` | lifecycle |
| `/books/:bookId/genome` | genome |
| `/books/:bookId/characters` | characters |
| `/books/:bookId/chapters` | chapters |
| `/books/:bookId/chapters/:chapterId/studio` | studio |
| `/books/:bookId/editorial` | editorial |
| `/books/:bookId/ai` | ai center |
| `/activity` | activity |
| `/admin` | admin |

### 6.4 UI System
Preserve existing editorial visual language (cream/gold/dark teal panels). New modules must reuse `card-gradient`, typography, toast, modal patterns. Do not introduce a second design system.

### 6.5 Forms & Validation
- Client: zod schemas mirroring domain
- Server: constraints + RPC validation
- Progressive required fields from milestone config

---

## 7. Backend / API Design

### 7.1 Primary Access Style
- **CRUD:** Supabase PostgREST from client for authorized row ops
- **Commands:** Edge Functions / RPC for multi-step domain operations

### 7.2 Critical RPCs
| RPC | Purpose |
|---|---|
| `bootstrap_org_workspace()` | First login provisioning |
| `create_book_with_milestones(...)` | Atomic book + M0–M20 seed |
| `reorder_chapters(book_id, ordered_ids[])` | Sequence rewrite |
| `advance_milestone(book_id, to_code, override_reason)` | Gate logic |
| `recompute_readiness(book_id)` | Score update |
| `create_entity_version(...)` | Snapshot |
| `export_book_package(book_id)` | JSON export |
| `import_book_package(workspace_id, payload)` | Import |
| `start_agent_run(...)` | Enqueue AI |
| `resolve_ai_proposal(proposal_id, decision, edited_ops)` | Apply/reject |

### 7.3 Edge Functions
| Function | Auth | Notes |
|---|---|---|
| `ai-runner` | user JWT | Loads agent def, builds context, calls model, writes agent_runs/proposals |
| `ai-apply` | user JWT | Applies accepted proposal ops with service role after checks |
| `sales-import` | user JWT | CSV parse + insert |
| `notify-dispatch` | service | Fanout notifications |
| `cron-rights-expiry` | service cron | Create notifications |

### 7.4 Event Schema
```json
{
  "event_type": "milestone.advanced",
  "title": "Advanced to M3",
  "entity_type": "milestone",
  "entity_id": "...",
  "actor_user_id": "...",
  "payload": {"from": "M2", "to": "M3", "override": false}
}
```

### 7.5 Idempotency
Mutating Edge endpoints accept `Idempotency-Key` header; store processed keys for 24h.

---

## 8. Readiness Engine (Normative Algorithm)

```
checklist_score = completed_items / total_items * 100
validation_score = passed_blocking_rules / total_blocking_rules * 100
critical_open = count(editorial_issues where severity=critical and status not resolved)
if critical_open > 0 and gate_mode == hard:
  readiness = min(checklist_score, 99)  # cannot be 100
  can_advance = false
else:
  readiness = round(0.7 * checklist_score + 0.3 * validation_score)
  can_advance = readiness >= threshold (default 100 for hard, 80 for soft warn)
```
Unit test in `src/domain/readiness.test.ts`.

---

## 9. Milestone Template Config

Store in `workspace.settings.milestone_templates.book` or table `milestone_templates`.

Each milestone:
```json
{
  "code": "M3",
  "name": "Book Genome",
  "gate_mode": "soft",
  "approver_roles": ["author", "editor"],
  "items": [
    {"key": "characters_seeded", "title": "Core characters created"},
    {"key": "locations_seeded", "title": "Key locations created"}
  ],
  "suggested_agents": ["world_builder", "character_psychologist"],
  "required_genome_paths": ["identity.genre", "commercial.logline"]
}
```

Seed defaults for all M0–M20 from BRD deliverables.

---
## 10. AI Agent Development Kit (ADK) Tech Design

### 10.1 Principles
Specialize; shared ontology; explain with evidence; respect permissions; escalate; evaluate; collaborate.

### 10.2 Agent Definition File (repo)
`src/ai/agents/<agent_key>.ts` exports:
- `key`, `name`, `version`
- `governanceLevel` (1–4)
- `model` routing key
- `tools[]` allowlist
- `inputSchema` / `outputSchema`
- `systemPrompt`
- `evalSuite` id

### 10.3 Cognitive Loop
`Observe → Understand → Plan → Reason → Execute → Verify → Learn`  
Implemented as structured stages in runner with logged traces.

### 10.4 Memory Layers
| Layer | Store | Retention |
|---|---|---|
| Session | agent_runs.input_context / chat | run-scoped |
| Project | SSOT tables | durable |
| Org | style guides, decisions, lessons | durable |
| Long-term | ontology + embeddings | durable |

### 10.5 Tool Interface (examples)
| Tool | Side effect | Governance |
|---|---|---|
| `search_graph` | read | L1 |
| `get_entity` | read | L1 |
| `propose_entity_patch` | proposal | L2/L3 |
| `propose_create_issue` | proposal | L2 |
| `propose_metadata` | proposal | L3 |
| `validate_timeline` | read + report | L2 |

Tools return typed JSON; runner validates.

### 10.6 Proposal Ops Format
```json
{
  "op": "update",
  "entity_type": "character",
  "entity_id": "...",
  "patch": {"core_fear": "..."},
  "evidence": [{"type": "chapter", "id": "...", "note": "stated in ch3"}]
}
```

### 10.7 Grounding / Anti-Hallucination
1. Context pack built only from SSOT queries + authorized docs.
2. Model instructed to cite entity IDs; verifier rejects claims without IDs for L2+.
3. Eval harness measures hallucination rate.

### 10.8 Agent Roster Implementation Order
1. continuity_guardian
2. concept_architect
3. developmental_editor
4. metadata_specialist
5. executive_copilot
6. remaining catalog

### 10.9 Model Routing
Prefer Vercel AI Gateway (or Supabase Edge → provider) with env server-only keys.  
Never expose model keys in Vite `VITE_*`.

### 10.10 Cost Controls
Per-workspace monthly token budget in settings; soft warn / hard stop; cache identical readiness reports for N minutes.

### 10.11 Human Governance Levels (enforced server-side)
| Level | Behavior |
|---|---|
| L1 | Write report to agent_runs; no SSOT mutation |
| L2 | Create ai_proposals; recommend review |
| L3 | Create ai_proposals; require approval to apply |
| L4 | Create ai_proposals; require executive capability to apply |

---

## 11. Security Architecture

### 11.1 AuthN
Supabase Auth email/password (P0); MFA (P2); SSO SAML/OIDC (P4).

### 11.2 AuthZ
RLS + capability RPCs + book_acl.

### 11.3 Secrets
Vercel env for `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`; server secrets for service role + AI keys.

### 11.4 Storage
Private bucket; signed URLs with short TTL; MIME allowlist; max size per type.

### 11.5 Audit
All approvals, exports, ACL changes, proposal resolutions → events.

### 11.6 Threat Model (abridged)
| Threat | Mitigation |
|---|---|
| Cross-tenant read | RLS tests |
| Prompt injection to exfiltrate other books | tool scoping by workspace/book; no global search tool |
| Service role misuse | only in Edge; code review; least privilege ops |
| Asset hotlink | signed URLs |
| Dependent package compromise | lockfile + CI |

---

## 12. Performance & Scalability Targets

| Metric | Target |
|---|---|
| SPA TTI (approx) | < 3s on broadband for shell |
| List books (≤500) | < 300ms server P95 |
| Autosave chapter | < 500ms P95 ack |
| Agent L2 run | < 60s P95 (model-dependent) |
| Graph view | interactive ≤2k nodes |
| Scale ceiling (design) | millions books / tens of millions characters (Manual) — via indexing, partitioning later |

Strategies: select only needed columns; pagination; debounce; background jobs; optional read replicas later.

---

## 13. Observability

- Frontend: error boundary + logging sink (Sentry optional)
- Edge: structured logs with `request_id`, `workspace_id`, `agent_key`
- DB: slow query monitoring in Supabase
- Product analytics: milestone advances, proposal accept rate (privacy-aware)

---

## 14. Testing Strategy

### 14.1 Unit
Domain pure functions: readiness, progress, record codes, genome validation, gate evaluation.

### 14.2 Integration
Supabase local or CI project: RLS policies, RPCs, migrations.

### 14.3 E2E
Playwright critical paths: signup → create book → character → chapter → issue → advance milestone.

### 14.4 AI Evals
Golden sets per agent; CI can run cheap deterministic verifier tests; full model evals on schedule.

### 14.5 CI Gate
Existing workflow must remain green; add domain tests alongside `progress.test.ts`.

---

## 15. Deployment Architecture

```
GitHub main ──CI──► Vercel Production
PR branches ──CI──► Vercel Preview
Supabase migrations via supabase CLI / CI job (recommended)
```

### 15.1 Environments
| Env | Supabase | Vercel |
|---|---|---|
| local | local or shared dev | vite dev |
| preview | preview project or branch DB | preview URLs |
| prod | prod project | prod domain |

### 15.2 Config
`.env.example` already requires URL + anon key; document server envs in README as added.

---

## 16. Import/Export Schemas

### 16.1 Book Package JSON (v1)
```json
{
  "schema_version": "1.0.0",
  "exported_at": "ISO-8601",
  "book": {},
  "characters": [],
  "chapters": [],
  "scenes": [],
  "locations": [],
  "relationships": [],
  "canon_facts": [],
  "timeline_events": [],
  "editorial_issues": [],
  "milestones": [],
  "campaigns": [],
  "assets_manifest": []
}
```
Binary assets: separate zip or re-upload by manifest path.

### 16.2 Prototype Import Mapper
Map v0.2 localStorage export keys → package v1; unknown fields to `genome.extensions.prototype`.

---

## 17. Search Design

### P1 Keyword
Postgres `tsvector` on title/name/summary/record_code; union search RPC.

### P3 Semantic
Embeddings table `(entity_type, entity_id, embedding vector)`; pgvector extension; update on write via job.

---

## 18. Notifications Design
Insert into `notifications`; optional Realtime subscription channels `workspace:<id>`. Email bridge later.

---

## 19. Versioning Design
`entity_versions` snapshot jsonb on:
- manual “Save version”
- milestone advance
- AI apply
- manuscript significant save checkpoints (every N minutes or N words)

Restore = insert new version from snapshot + update entity.

---

## 20. Frontend Feature Mapping (Build Order)

| Sprint Theme | FR IDs | Tech Tasks |
|---|---|---|
| Tenancy bootstrap | FR-ORG-*, FR-AUTH-* | migrations M1, bootstrap RPC, UI switcher |
| Books + genome P0 | FR-BOOK-*, FR-GEN-* | extend books columns/genome, Genome view |
| Characters/chapters harden | FR-CHAR-001, FR-CHAP-001 | record_code, versioning hooks |
| Lifecycle engine | FR-LIFE-* | milestones tables, readiness lib, Lifecycle UI rewrite |
| Editorial issues | FR-EDIT-* | migrate editorial_tasks → issues + kanban |
| Scenes/world/canon | FR-SCENE-*, FR-LOC-*, FR-CANON-* | new views |
| Studio | FR-STU-* | port prototype studio |
| Graph/search/queue | FR-GRAPH-*, FR-SEARCH-*, FR-QUEUE-* | |
| Production/marketing ops | FR-PROD-*, FR-MKT-* | storage, campaigns |
| Rights/sales | FR-RIGHTS-*, FR-SALES-* | |
| ADK | FR-AI-* | edge runner + proposals |
| Portals | FR-PORT-* | separate route trees |

---

## 21. Capability Keys (Normative)
```
org.admin
workspace.admin
users.manage
book.create
book.edit
book.archive
manuscript.edit
character.edit
chapter.edit
scene.edit
canon.approve
issue.manage
milestone.advance.soft
milestone.advance.hard
milestone.override
asset.upload
asset.approve
metadata.publish
campaign.manage
rights.manage
sales.import
ai.run
ai.apply.L3
ai.apply.L4
export.package
audit.export
```

Map roles → default capability sets in `src/domain/rbac/roleDefaults.ts`.

---

## 22. Data Dictionary Notes (Column Taxonomy)
Every field belongs to: Identity | Creative | Psychology | Narrative | Commercial | Operational | Editorial | Production | Marketing | Analytics | AI | Audit  
Use taxonomy tags in JSON schema for form generation.

---

## 23. Continuity Rules Engine v1 (Deterministic)
Implemented in TS/SQL without LLM:
1. Character marked dead before timeline event appearance → flag
2. Scene location missing when status in working/review → warn
3. POV character not in scene_characters → flag
4. Canon fact conflict: same domain+subject contradictory approved facts → flag
LLM Continuity Guardian supplements, does not replace v1.

---

## 24. Coding Standards for Implementers
1. Ticket references FR IDs.
2. No silent schema drift — migrate first.
3. Prefer pure domain functions under `src/domain`.
4. Every new RLS policy gets a test.
5. AI tools fail closed.
6. Do not invent parallel SSOT spreadsheets/docs in-product.
7. Keep prototype code out of production bundle.

---

## 25. Open Technical Questions
1. React Query vs thin hooks for Phase B?
2. pgvector now vs later for semantic search?
3. Single Edge `ai-runner` vs per-agent functions?
4. Manuscript CRDT/Yjs needed for simultaneous co-editing, or last-write-wins + conflict modal sufficient for P1? **Recommendation:** conflict modal P1; CRDT P4.
5. Branching (git-like) for genomes — defer to P3 beyond linear versions?

---
## 26. Appendix A — Agent Catalog (Implementation Keys)
- `executive_publisher` — **Executive Publisher AI** — L3 — Orchestra conductor; portfolio health, milestone tracking, decision routing, risk, prioritization
- `market_intelligence` — **Market Intelligence Agent** — L2 — Bestsellers, niches, sentiment, demand, pricing, SWOT, opportunity scoring
- `concept_architect` — **Concept Architect** — L2 — Working title, hook, logline, USP, genre, audience, comps, series potential
- `story_architect` — **Story Architect** — L2 — Structure systems, beat maps, pacing, subplots, ending design
- `character_psychologist` — **Character Psychologist** — L2 — Trauma, attachment, motivations, behavior, speech, growth, relationships
- `world_builder` — **World Builder** — L2 — History, politics, economics, religion, tech/magic, culture; contradiction detection
- `plot_engineer` — **Plot Engineer** — L2 — Scene necessity, tension, conflict evolution, pacing, plot health score
- `chapter_planner` — **Chapter Planner** — L2 — Purpose, summary, word goal, conflict, POV, hooks, themes, timeline
- `scene_director` — **Scene Director** — L2 — Per-scene characters, location, conflict, dialogue, emotion, transitions
- `dialogue_coach` — **Dialogue Coach** — L2 — Per-character voice models; vocabulary, formality, slang, evolution
- `developmental_editor` — **Developmental Editor AI** — L2 — Diagnose story/characters/pacing/structure/engagement without rewriting
- `continuity_guardian` — **Continuity Guardian** — L2 — Timeline, objects, knowledge, ages, travel, canon, magic/tech rules
- `copy_editor` — **Copy Editor** — L2 — Grammar, formatting, capitalization, consistency, house style, readability
- `fact_checker` — **Fact Checker** — L2 — Research DB, historical/scientific/legal/medical, internal canon
- `production_coordinator` — **Production Coordinator** — L3 — Cover/interior/illustrations/ISBN/metadata/uploads/accessibility/approvals
- `marketing_strategist` — **Marketing Strategist** — L2 — Launch plans, calendars, BookTok, influencers, ads, personas, pricing experiments
- `metadata_specialist` — **Metadata Specialist** — L3 — Amazon/Apple/Google/Kobo/Ingram/libraries; SEO, keywords, BISAC, THEMA
- `rights_manager` — **Rights Manager** — L3 — Translations, film/TV, audio, merch, licensing, renewals, contracts, royalties
- `sales_analyst` — **Sales Analyst** — L2 — Daily sales, ad ROI, reviews, regional performance, elasticity, forecasts
- `portfolio_manager` — **Portfolio Manager** — L2 — Cross-catalog: genres, authors, sequels, translations, franchise potential
- `executive_copilot` — **Executive Copilot** — L1 — Daily executive briefing across portfolio, risks, deadlines, opportunities

---

## 27. Appendix B — Module → Table Map
| Module | Primary Tables |
|---|---|
| MOD-ORG | organizations, workspaces, workspace_members |
| MOD-LIB | books, series, universes |
| MOD-LIFE | milestones, milestone_items |
| MOD-CHAR | characters |
| MOD-CHAP | chapters |
| MOD-SCENE | scenes, scene_characters |
| MOD-WORLD | locations |
| MOD-REL | relationships |
| MOD-CANON | canon_facts |
| MOD-TIME | timeline_events |
| MOD-EDIT | editorial_issues |
| MOD-PROD | production_tasks, assets |
| MOD-MKT | campaigns / marketing_items |
| MOD-RIGHTS | rights_agreements |
| MOD-SALES | sales_facts |
| MOD-AI | agent_runs, ai_proposals |
| MOD-NOTIF | notifications |
| MOD-AUDIT | events |
| MOD-VER | entity_versions |
| MOD-ADMIN | automations, workspace.settings |

---

## 28. Appendix C — Sample Sequence: Create Book
1. UI calls `create_book_with_milestones`
2. RPC asserts `book.create`
3. Insert book + 21 milestones + checklist items in one transaction
4. Insert event `book.created`
5. Return book row
6. Client sets active book and navigates to Lifecycle M0

---

## 29. Appendix D — Sample Sequence: AI Continuity Run
1. User starts `continuity_guardian` on book
2. `ai-runner` builds context: characters, timeline, canon, scenes summary
3. Model returns structured findings
4. Runner writes `agent_runs` + `ai_proposals` (create_issue ops)
5. User accepts proposal
6. `resolve_ai_proposal` inserts editorial_issues + event
7. Readiness recomputed

---

## 30. Appendix E — Alignment With Manual Volumes
| Volume | Tech Spec Sections |
|---|---|
| I Layers | §1.1 |
| II–III Entities/Schema | §4 |
| IV Lifecycle | §8–9 |
| V Creative engine | scenes/characters/studio features |
| VI Editorial | editorial_issues |
| VII Production/commercial | assets, campaigns, rights, sales |
| VIII/XVII AI | §10 |
| IX Data dictionary | §4, §22 |
| X–XV Genomes | genome JSON schemas |
| XI Analytics | dashboards + sales_facts |
| XII Enterprise | tenancy, API, security, roadmap |
| XVI Ontology/KG | relationships + search |
| XVIII OPAS | future export adapters |

---

## 31. Appendix F — Detailed Column Checklists for P0 Migrations

### books (compat columns to preserve during migration)
`id, user_id (legacy), workspace_id (new), title, author (legacy/display), genre, cover_url, progress, phase (legacy→derive from milestone), status, word_count, target_word_count→word_goal, deadline→target_release_date, created_at, updated_at`

### characters (P0)
`id, workspace_id, book_id, record_code, name, role, status, summary, core_wound, core_desire, core_fear, arc, voice_profile, importance, genome, version, created_at, updated_at`

### chapters (P0)
`id, workspace_id, book_id, record_code, sequence, title, purpose, pov_character_id, pov_label, emotional_shift, word_goal, word_count, manuscript, status, metadata, version, created_at, updated_at`

### editorial_issues (P0 target)
`id, workspace_id, book_id, record_code, chapter_id, scene_id, character_id, title, category, severity, status, description, suggested_fix, assignee_user_id, root_cause, lesson_learned, resolution, resolved_at, approved_by, created_at, updated_at`

---

## 32. Appendix G — Environment Variables

| Name | Surface | Required | Purpose |
|---|---|---|---|
| `VITE_SUPABASE_URL` | client | yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | client | yes | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | yes for AI apply / admin jobs | service role |
| `AI_GATEWAY_API_KEY` or provider key | server only | yes for Phase D | model access |
| `SENTRY_DSN` | client/server | optional | error tracking |

---

## 33. Definition of Done (Engineering)
A feature is done when:
1. FR acceptance criteria checked
2. Migrations applied + documented
3. RLS covered
4. Unit/integration tests updated
5. Events emitted for mutations
6. UI empty/error states handled
7. README/env updated if new secrets
8. CI green

---

*End of Technical Specification — MANGU Book Operating System (Book OS) v1.0.0*
