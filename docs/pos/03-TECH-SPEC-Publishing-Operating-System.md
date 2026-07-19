# Technical Specification
# MANGU Publishing Operating System (POS) / Book OS

| Field | Value |
|-------|-------|
| Document ID | `MANGU-POS-TS-001` |
| Version | `1.0.0` |
| Status | **Engineering source of truth for implementation** |
| Companion | BRD, FRD |
| Baseline repo | `redinc23/book1_assign` |
| Target stack | Vite + React 18 + TypeScript + Tailwind + Supabase (Postgres/Auth/Storage/Edge) + Vercel |

---

## 1. Purpose & Scope

This Tech Spec defines **how** to implement the POS described in the BRD/FRD:

- System architecture and module boundaries
- Canonical data model & migrations strategy
- AuthZ (RLS + capabilities)
- API/contracts (client & server)
- Event/audit backbone
- Manuscript & asset storage
- Milestone readiness engine
- Governed AI Agent Development Kit (ADK)
- Frontend application structure
- Testing, CI/CD, observability, rollout
- Migration from current simplified schema → target schema

Normative alignment: FRD `FR-*` requirements. When code and this spec diverge, fix code or change-control the spec.

---

## 2. Architecture Overview

### 2.1 Logical layers (Manual Volume I mapped to engineering)

```
┌─────────────────────────────────────────────────────────────┐
│ Presentation Layer                                          │
│  React SPA (Vercel) — AppShell, Views, Command Palette      │
├─────────────────────────────────────────────────────────────┤
│ Application / Template Layer                                │
│  View-models, packet generators, readiness presenters       │
├─────────────────────────────────────────────────────────────┤
│ Business Logic Layer                                        │
│  Milestone gates, validation, RBAC capabilities,            │
│  Agent proposal apply, completeness scoring                 │
│  (TypeScript domain modules + Edge Functions / RPC)         │
├─────────────────────────────────────────────────────────────┤
│ Data Layer                                                  │
│  Entities, genomes (JSONB), relationships, events           │
├─────────────────────────────────────────────────────────────┤
│ Storage Layer                                               │
│  Supabase Postgres + Storage buckets + Auth                 │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Component diagram (runtime)

```
[Browser SPA]
    │  supabase-js (user JWT)
    ▼
[Supabase API Gateway]
    ├─ Auth
    ├─ PostgREST (RLS)
    ├─ Storage (RLS/policies)
    └─ Edge Functions
           ├─ readiness.compute
           ├─ agents.run / agents.approve
           ├─ export.book / import.book
           └─ webhooks (future retailers)
    │
    ▼
[Postgres]  [Storage]  [LLM Provider via server-side gateway]
```

### 2.3 Key architectural decisions

| ID | Decision | Rationale |
|----|----------|-----------|
| `TS-ARCH-001` | **Supabase Postgres is canonical SSOT** | Matches FR-GLOBAL-001; replaces localStorage authority |
| `TS-ARCH-002` | **SPA + RLS-first** for CRUD; **Edge Functions** for privileged/multi-step/AI | Keeps simple paths fast; confines secrets |
| `TS-ARCH-003` | **Hybrid relational + JSONB genomes** | Queryable core columns + progressive genome depth |
| `TS-ARCH-004` | **Event table is append-only audit** | Institutional memory |
| `TS-ARCH-005` | **Agent mutations via proposals** | Human governance |
| `TS-ARCH-006` | **Workspace tenancy** over pure `user_id` ownership | Multi-user imprint |
| `TS-ARCH-007` | **Prototype is reference only** | Avoid dual-frontend merge; transplant features selectively |
| `TS-ARCH-008` | **Vercel for web**, Supabase for backend | Current repo direction |

### 2.4 Bounded contexts

| Context | Owns | Notes |
|---------|------|-------|
| Platform | orgs, workspaces, members, roles | Cross-cutting |
| Catalog | books, series, universe | Library |
| Genome | book/character/story/world genome docs | JSONB + validators |
| Narrative | chapters, scenes, manuscript | Writing |
| Continuity | relationships, canon, timeline | Graph |
| Lifecycle | milestones, readiness | Gates |
| Editorial | issues, style, reviews | Quality |
| Production | assets, metadata, products | Commercialization |
| Go-to-market | campaigns, prices, sales, rights | Commercial ops |
| Intelligence | snapshots, dashboards | Read models |
| Agents | registry, runs, proposals, memory | ADK |

---

## 3. Technology Stack (normative for Phase 0–3)

| Layer | Choice | Versions / notes |
|-------|--------|------------------|
| UI | React 18 + TypeScript | Existing |
| Bundler | Vite 5 | Existing |
| Styling | Tailwind 3 | Existing; design tokens via CSS variables |
| Icons | lucide-react | Existing |
| Backend-as-platform | Supabase | Auth, Postgres, Storage, Edge Functions |
| DB | PostgreSQL 15+ | via Supabase |
| ORM/client | `@supabase/supabase-js` | Typed wrappers in `src/lib/` |
| Testing | Vitest | Expand to domain tests |
| E2E | Playwright (recommended Phase 1) | Not yet in repo — add |
| Hosting | Vercel | `vercel.json` present |
| CI | GitHub Actions | `.github/workflows/ci.yml` |
| AI | Server-side provider via Edge Function / gateway | Never expose provider keys to SPA |
| Package manager | npm | lockfile present |

### 3.1 Repository layout (target)

```
src/
  app/                 # providers, routes (if react-router added)
  components/          # shell, primitives
  contexts/            # Auth, Workspace, ActiveBook
  features/
    library/
    genome/
    characters/
    chapters/
    manuscript/
    lifecycle/
    editorial/
    production/
    marketing/
    ai/
    search/
  domain/              # pure TS: readiness, genome scores, validators
  hooks/               # data hooks (thin)
  lib/                 # supabase client, events, storage helpers
  types/               # generated + hand types
  views/               # route-level screens (current)
supabase/
  migrations/          # ordered SQL
  functions/           # edge functions
  seed/                # dev seeds
docs/pos/              # this pack
prototype-reference/   # read-only reference
```

---

## 4. Tenancy, Auth, and Security

### 4.1 Identity

- Supabase Auth email/password (Phase 0)
- Optional OAuth later without schema break (`auth.users` remains identity root)

### 4.2 Tenancy model

```
organizations 1─* workspaces 1─* workspace_members *─1 auth.users
workspaces 1─* books 1─* (characters, chapters, ...)
```

Every domain table includes `workspace_id` (denormalized for RLS simplicity) and usually `book_id`.

### 4.3 RLS strategy (`TS-SEC-RLS`)

1. Enable RLS on all tenant tables.  
2. `security definer` helper `is_workspace_member(workspace_id)` / `has_capability(workspace_id, capability)`.  
3. Default policies: member SELECT/INSERT/UPDATE; DELETE restricted by capability.  
4. Service role used only in Edge Functions for agent apply / admin jobs.  
5. Storage policies: path prefix `workspace_id/book_id/...`.

### 4.4 Capabilities (`TS-SEC-CAP`)

Store on `workspace_members.capabilities text[]` plus role defaults expanded in code/SQL.

Suggested capabilities:

```
book.create, book.delete, book.archive,
genome.edit, character.edit, manuscript.edit,
milestone.advance, milestone.approve,
editorial.create, editorial.verify,
asset.upload, asset.approve,
campaign.edit,
rights.edit,
agent.run, agent.approve,
members.manage, workspace.settings,
export.run, import.run, snapshot.restore
```

### 4.5 Security requirements

| ID | Spec |
|----|------|
| `TS-SEC-001` | No provider API keys in Vite env (`VITE_*` only anon URL/key) |
| `TS-SEC-002` | CI test proving cross-workspace SELECT returns 0 rows |
| `TS-SEC-003` | Signed URLs or authenticated downloads for private assets |
| `TS-SEC-004` | Rate-limit agent run endpoints |
| `TS-SEC-005` | CORS locked to app origins |

---

## 5. Canonical Data Model

### 5.1 Migration strategy from current schema

**Current:** owner-scoped tables (`books.user_id`, etc.)  
**Target:** workspace-scoped model aligned with `prototype-reference/legacy-schema.sql` + commercial extensions.

#### Phased migration plan

| Step | Migration | Notes |
|------|-----------|-------|
| M-A | Create `organizations`, `workspaces`, `workspace_members` | Backfill: one personal org/workspace per existing user |
| M-B | Add `workspace_id` to `books` (nullable → backfill → NOT NULL) | Map `user_id` → personal workspace |
| M-C | Create milestones/items; backfill M0–M20 for each book | `phase` text → `current_milestone` mapping table |
| M-D | Evolve `characters`, `chapters` toward target columns | Preserve data; add columns; dual-write if needed |
| M-E | Add scenes, locations, relationships, canon, timeline | New |
| M-F | Replace thin editorial_tasks with `editorial_issues` | Migrate rows |
| M-G | Assets, campaigns, decisions, automations, notifications | New/upgrade |
| M-H | `events`, `entity_versions`, `agent_runs`, `agent_proposals` | New |
| M-I | Commercial: products, isbns, prices, sales_facts, rights | New |
| M-J | Drop obsolete columns after read-path cutover | Careful |

### 5.2 Enums

```sql
create type public.mangu_record_status as enum (
  'draft', 'working', 'review', 'approved', 'published', 'archived'
);
create type public.mangu_severity as enum (
  'low', 'medium', 'high', 'critical'
);
create type public.mangu_milestone_status as enum (
  'locked', 'planned', 'in_progress', 'blocked',
  'ready_for_review', 'approved', 'waived'
);
```

### 5.3 Core tables (normative list)

> Detailed DDL baseline: extend `prototype-reference/legacy-schema.sql`. Below is the contract engineers implement.

#### Platform
- `TBL-organizations`
- `TBL-workspaces`
- `TBL-workspace_members`

#### Catalog
- `TBL-universes` (P3)
- `TBL-series` (P2)
- `TBL-books` — see fields FR-LIB-005 + `genome jsonb`, `story_genome jsonb`, `world_genome jsonb`, `current_milestone`, `word_count`, `word_goal`, `version`

#### Lifecycle
- `TBL-milestones` (unique book_id+code)
- `TBL-milestone_items`

#### Narrative
- `TBL-characters`
- `TBL-chapters`
- `TBL-scenes`
- `TBL-scene_characters`
- `TBL-locations`

#### Continuity
- `TBL-relationships`
- `TBL-canon_facts`
- `TBL-timeline_events`

#### Editorial
- `TBL-editorial_issues`
- `TBL-style_guide_rules` (P1)
- `TBL-sensitivity_reviews` (P1)
- `TBL-fact_claims` (P2)
- `TBL-quality_score_snapshots` (P1)

#### Production / commercial
- `TBL-products` (format targets per book)
- `TBL-assets`
- `TBL-isbn_records`
- `TBL-metadata_records` (or books.metadata jsonb + isbn table)
- `TBL-campaigns`
- `TBL-marketing_items`
- `TBL-price_records`
- `TBL-sales_facts`
- `TBL-rights_records`
- `TBL-license_deals`

#### Operating system
- `TBL-decisions`
- `TBL-notifications`
- `TBL-automations`
- `TBL-events` (append-only)
- `TBL-entity_versions`
- `TBL-project_snapshots`

#### Agents
- `TBL-agent_definitions` (optional seed table)
- `TBL-agent_runs`
- `TBL-agent_proposals`
- `TBL-agent_memory_items`

### 5.4 `books` target columns (delta highlights)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| workspace_id | uuid NN FK | RLS key |
| record_code | text NN | unique per workspace |
| title | text NN | |
| subtitle | text | |
| series_id | uuid NULL | P2 |
| genre | text | |
| publication_type | text NN default `book` | |
| status | mangu_record_status | |
| current_milestone | text NN default `M0` | check M0–M20 |
| target_release_date | date | |
| owner_user_id | uuid | |
| word_count | int ≥0 | derived |
| word_goal | int ≥0 | |
| hook / logline / audience / primary_theme / tone / point_of_view | text | |
| genome | jsonb NN `{}` | Book Genome layers |
| story_genome | jsonb NN `{}` | |
| world_genome | jsonb NN `{}` | |
| metadata | jsonb NN `{}` | commercial metadata |
| approval_state | text | |
| version | int ≥1 | optimistic concurrency |
| created_at / updated_at | timestamptz | |

### 5.5 Indexes (minimum)

- `(workspace_id, status)`, `(workspace_id, current_milestone)` on books  
- `(book_id, sequence)` on chapters/scenes  
- GIN on `genome`, `metadata` where filtered  
- `(book_id, status, severity)` on editorial_issues  
- `(workspace_id, occurred_at desc)` on events  
- `(workspace_id, recipient_user_id, read_at)` on notifications  

### 5.6 Referential integrity rules

| Rule | Implementation |
|------|----------------|
| Scene requires chapter | FK + NOT NULL |
| Chapter POV character optional | ON DELETE SET NULL |
| Prevent location parent cycle | trigger / constraint via recursive check function |
| Block hard delete of character referenced as POV | trigger raising exception OR UI preflight + restrict |

### 5.7 Universal header fields

All durable entities SHOULD include: id, workspace_id, record_code (where user-facing), status, version, created_at, updated_at, created_by (where applicable).

### 5.8 Record code generation (`TS-DATA-CODES`)

Format examples:

- Book: `BK-000123`
- Character: `CH-000045`
- Chapter: `CP-000012`
- Scene: `SC-000088`
- Issue: `ED-000310`
- Asset: `AS-000022`

Generation: per-book or per-workspace counters table OR `lpad` from sequence. Codes immutable after create.

---

## 6. Domain Logic Specifications

### 6.1 Readiness engine (`TS-DOM-READY`)

Pure TypeScript module `src/domain/readiness.ts` (+ SQL RPC optional).

**Input:** book aggregate (genome scores, chapter stats, issue counters, asset approvals, checklist).  
**Output:** per-milestone readiness 0–100 + `blockers: {code, message, frRef}[]`.

```ts
export type ReadinessResult = {
  milestone: string;
  readiness: number;
  blockers: Array<{ code: string; message: string; severity: 'block' | 'warn' }>;
  checklistCompletion: number;
};
```

Rules encode FR-LIFE-006. Unit tests are mandatory for each milestone’s blocker codes.

### 6.2 Genome completeness (`TS-DOM-GENOME`)

`src/domain/genomeCompleteness.ts` walks required paths per layer/milestone configuration.

Config example:

```json
{
  "M3": {
    "genome.identity.logline": 1,
    "genome.identity.audience": 1,
    "genome.creative.theme": 1,
    "genome.narrative.premise": 1,
    "characters.protagonist": 1
  }
}
```

### 6.3 Word count (`TS-DOM-WORDS`)

Normalize: split on whitespace; trim; ignore empty.  
Chapter manuscript is canonical in Phase 1; scene counts optional add-on.  
Book.word_count = sum(chapter.word_count) maintained by trigger or app transaction.

### 6.4 Event writer (`TS-DOM-EVENTS`)

```ts
writeEvent({
  workspaceId, bookId, eventType, title, description,
  entityType, entityId, actorUserId, actorAgentKey, payload
})
```

Event types (selected):

- `EVT-book.created|updated|archived`
- `EVT-milestone.advanced|rolled_back|waived`
- `EVT-editorial.created|resolved|verified`
- `EVT-asset.uploaded|approved`
- `EVT-agent.proposed|approved|rejected|failed`
- `EVT-decision.recorded`
- `EVT-snapshot.created|restored`
- `EVT-member.invited|removed`

### 6.5 Optimistic concurrency

Update paths for books/chapters/characters include `version` check:

```sql
UPDATE chapters SET ..., version = version + 1
WHERE id = $1 AND version = $2
```

If 0 rows → conflict error to client.

---

## 7. API Contracts

### 7.1 Client data access pattern

Phase 1: typed repositories over supabase-js.

```ts
// src/features/characters/api.ts
export async function listCharacters(bookId: string): Promise<Character[]>
export async function upsertCharacter(input: CharacterInput): Promise<Character>
```

All repositories:

1. Assume RLS  
2. Write events on mutations (via RPC or secondary insert)  
3. Map DB errors to domain errors (`PermissionError`, `ValidationError`, `ConflictError`)

### 7.2 RPC / Edge Functions

| API ID | Name | Purpose | Auth |
|--------|------|---------|------|
| `API-READY-001` | `compute_readiness(book_id)` | Server-authoritative readiness | member |
| `API-LIFE-001` | `advance_milestone(book_id, to_code, decision_id?)` | Gate + advance txn | capability |
| `API-EXPORT-001` | `export_book(book_id)` | JSON package | export.run |
| `API-IMPORT-001` | `import_book(workspace_id, payload)` | Remap IDs | import.run |
| `API-AGENT-001` | `POST /functions/v1/agents-run` | Start run | agent.run |
| `API-AGENT-002` | `POST /functions/v1/agents-approve` | Apply/reject proposal | agent.approve |
| `API-SNAP-001` | `create_snapshot(book_id)` | Bundle snapshot | member+ |
| `API-SNAP-002` | `restore_snapshot(snapshot_id)` | Restore | snapshot.restore |

### 7.3 `advance_milestone` transactional behavior

1. Lock book row.  
2. Compute readiness for current milestone.  
3. If blockers and no waiver decision → abort.  
4. Mark current approved/waived; set next in_progress; update book.current_milestone; bump version.  
5. Insert event.  
6. Notify owner/publisher.

### 7.4 Export package schema (v1)

```json
{
  "format": "mangu.book.package",
  "version": "1.0",
  "exportedAt": "ISO-8601",
  "book": {},
  "characters": [],
  "chapters": [],
  "scenes": [],
  "locations": [],
  "relationships": [],
  "canonFacts": [],
  "timelineEvents": [],
  "milestones": [],
  "editorialIssues": [],
  "assets": [],
  "campaigns": [],
  "decisions": []
}
```

Binary assets: metadata + storage paths; optional zip in Phase 2.

### 7.5 Agent proposal patch schema

```json
{
  "proposalId": "uuid",
  "runId": "uuid",
  "riskClass": "low|medium|high|critical",
  "operations": [
    {
      "op": "merge",
      "entityType": "character",
      "entityId": "uuid",
      "path": "core_fear",
      "value": "Abandonment"
    }
  ],
  "rationale": "string"
}
```

Apply supports only allowlisted paths per agent definition.

---

## 8. Frontend Specification

### 8.1 Routing

Phase 0 may continue view-state switching in `App.tsx`.  
Phase 1 SHOULD introduce `react-router` (or equivalent) with routes:

```
/login
/app                              → Command Center
/app/library
/app/books/:bookId                → redirects to overview
/app/books/:bookId/genome
/app/books/:bookId/characters
/app/books/:bookId/chapters
/app/books/:bookId/chapters/:id/write
/app/books/:bookId/scenes
/app/books/:bookId/lifecycle
/app/books/:bookId/editorial
/app/books/:bookId/production
/app/books/:bookId/marketing
/app/books/:bookId/ai
/app/books/:bookId/activity
/app/settings/workspace
/app/settings/members
```

### 8.2 State management

- `AuthContext` — session  
- `WorkspaceContext` — active workspace + role/capabilities  
- `BookContext` — active book id + summary  
- Server state via hooks; avoid duplicating large manuscript caches unsafely  
- Prefer progressive enhancement with React 18 patterns already acceptable in codebase  

### 8.3 UI module requirements

| View | Must implement FR modules |
|------|---------------------------|
| Dashboard | CMD, INTEL light |
| Library | LIB |
| Genome | GENOME, STORY light |
| Characters | CHAR |
| Chapters + Studio | CHAP, MS |
| Lifecycle | LIFE |
| Editorial | EDIT |
| Production | PROD, META |
| Marketing | MKT |
| AI Center | AI |
| Activity | WORK, DEC |

### 8.4 Design system constraints

Follow existing product visual language in repo. For new marketing/landing surfaces only, apply brand-first rules from org frontend guidelines. In-app tools prioritize clarity, density control, and accessibility over decorative hero patterns.

### 8.5 Command palette

`⌘K` / `Ctrl+K` opens palette; fuzzy match entities + navigation commands.

---

## 9. Storage Specification

### 9.1 Buckets

| Bucket | Public | Path layout |
|--------|--------|-------------|
| `mangu-assets` | private | `{workspace_id}/{book_id}/assets/{asset_id}/{filename}` |
| `mangu-exports` | private | `{workspace_id}/exports/{job_id}.json` |
| `mangu-snapshots` | private | `{workspace_id}/{book_id}/snapshots/{snapshot_id}.json` |

### 9.2 Manuscript storage policy

Phase 1: manuscript text in Postgres (`chapters.manuscript`).  
Phase 2 option: large manuscripts to Storage with DB pointer if row size becomes issue.

### 9.3 Checksums

SHA-256 checksum on upload for production assets; stored on `assets.checksum`.

---

## 10. AI Agent Development Kit (ADK)

### 10.1 Principles (`TS-AI-PRIN`)

1. AI is an employee with a job description, tools, memory, and a manager (human).  
2. No silent canon writes.  
3. Every run is observable.  
4. Evaluation harness exists before wide enablement.  
5. Shared memory is curated (approved artifacts), not raw chain-of-thought dumps.

### 10.2 Universal agent model

```ts
type AgentDefinition = {
  key: string;
  version: string;
  name: string;
  description: string;
  riskClassDefault: 'low' | 'medium' | 'high' | 'critical';
  systemPrompt: string;
  tools: AgentTool[];
  allowlistedEntityPaths: string[];
  memorySelectors: string[]; // e.g. style_guide, decisions, canon:domain
  outputSchema: 'proposal' | 'report' | 'checklist';
};
```

### 10.3 Run lifecycle state machine

```
queued → running → awaiting_approval → completed
                 ↘ failed
                 ↘ cancelled
report-only runs may skip awaiting_approval → completed
```

### 10.4 Tool interface

Tools execute server-side with workspace-scoped credentials:

- `retrieve.book_summary`
- `retrieve.characters`
- `retrieve.chapters_outline`
- `retrieve.canon_search`
- `retrieve.style_guide`
- `retrieve.open_issues`
- `propose.patch` (creates proposal rows, does not apply)

Forbidden: raw SQL, cross-workspace fetch, direct UPDATE.

### 10.5 Memory architecture

| Memory type | Source | Retention |
|-------------|--------|-----------|
| Working | run input_context | run |
| Episodic | prior run summaries | book-scoped |
| Semantic | canon + genome embeddings (P3) | book/series |
| Procedural | style guide / house rules | workspace |

### 10.6 Governance

- `critical` proposals require `publisher`  
- Continuity guardian proposals open editorial issues by default (safer than auto-patch)  
- Copy editor may propose issue rows, not silent manuscript overwrite (P2 policy)

### 10.7 Evaluation (`TS-AI-EVAL`)

Golden tasks fixtures in `src/domain/ai/eval/`:

- character psychology gap detection  
- continuity contradiction detection  
- metadata missing fields  

Metrics: precision/recall of proposed issue categories; approval rate; revert rate post-approve.

---

## 11. Milestone Engine Implementation Notes

### 11.1 Seed milestones

On book create, insert 21 milestone rows M0–M20 with names from Manual Volume IV and default checklists JSON/seed.

### 11.2 Checklist seeding examples

**M8 First Draft**

- All planned chapters have manuscript text or status ≥ drafting  
- Word count ≥ 80% goal (configurable)  
- Protagonist appears in ≥1 chapter  

**M13 Production**

- Cover asset approved  
- Interior or EPUB approved for required products  
- ISBN assigned for required formats  
- Metadata completeness ≥ 90%  

### 11.3 Waiver mechanism

`decisions` row with `metadata.waiver_for_milestone = 'M7'` linked in `advance_milestone` call; event payload includes decision id.

---

## 12. Editorial System Implementation Notes

### 12.1 Mapping from current `editorial_tasks`

Migrate title/description/status; map priority→severity; leave category default `Story` if unknown.

### 12.2 Quality score job

Function computes dimensions from proxies:

- Continuity: open continuity issues weighted  
- Grammar: open grammar issues  
- Production readiness: asset/metadata scores  
- etc.

Store in `quality_score_snapshots`.

---

## 13. Production / Metadata Implementation Notes

### 13.1 Products table

```sql
create table products (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id),
  book_id uuid not null references books(id),
  format text not null, -- ebook, print, audio, ...
  required_for_launch boolean not null default true,
  status text not null default 'planned',
  unique(book_id, format)
);
```

### 13.2 Preflight engine

`src/domain/preflight.ts` returns missing requirements per product format.

---

## 14. Observability & Ops

| Concern | Approach |
|---------|----------|
| App errors | Window error boundary + console; Phase 1 add client logging endpoint optional |
| Edge Function logs | Supabase function logs |
| Audit | `events` table |
| Metrics | Phase 2: snapshot table + simple SQL views |
| Uptime | Vercel + Supabase status |

Alerts (Phase 2+): agent failure spikes; RLS policy denials anomaly; storage upload failures.

---

## 15. Testing Strategy

### 15.1 Unit (Vitest)

- `progressPercent` (exists)  
- readiness blockers per milestone  
- genome completeness  
- word count  
- proposal patch allowlist  
- ISBN checksum  

### 15.2 Integration

- Supabase local or staged project  
- RLS tests with two JWT users in different workspaces  
- `advance_milestone` success/fail  

### 15.3 E2E (Playwright)

Critical journeys: UC-LIFE-001, UC-EDIT-001, UC-PROD-001, UC-AI-001, UC-TENANT-001.

### 15.4 CI gate

Existing: typecheck, lint, test, build.  
Add: SQL migration lint; RLS integration job when secrets available.

---

## 16. CI/CD & Environments

| Env | Branch | Supabase | Vercel |
|-----|--------|----------|--------|
| Local | * | local/dev project | `npm run dev` |
| Preview | PRs | preview/dev project | Preview deploys |
| Production | `main` | prod project | Production |

Env vars:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- Server only: `SUPABASE_SERVICE_ROLE_KEY`, `AI_GATEWAY_API_KEY`, etc.

---

## 17. Performance Budgets

| Surface | Budget |
|---------|--------|
| Library load (200 books summary) | p95 ≤ 2s |
| Chapter list | p95 ≤ 1s |
| Open manuscript chapter (≤100k chars) | p95 ≤ 1.5s |
| Autosave | debounce 500–1000ms; ack ≤ 1s typical |
| Readiness compute | ≤ 300ms for Phase 1 aggregates |

Techniques: select only needed columns; pagination; avoid selecting all manuscripts in lists; GIN indexes as needed.

---

## 18. Accessibility Technical Requirements

- Focus management in modals (`Modal.tsx`)  
- `aria-*` on icon buttons  
- Ensure toasts are `role="status"`  
- Manuscript editor: label, readable font sizing, keyboard save (`⌘S`)  

---

## 19. Rollout Plan (Engineering)

### Phase 0
1. Adopt docs pack  
2. Add domain folder + readiness tests (even if UI still soft)  
3. Introduce workspaces tables + backfill  
4. Event writer utility  

### Phase 1
1. Cut books/characters/chapters to workspace model  
2. Lifecycle UI wired to milestones tables  
3. Editorial issues upgrade  
4. Manuscript autosave hardening  
5. Export JSON  
6. Command Center metrics from real SQL views  

### Phase 2
1. Scenes/locations/graph/canon/timeline  
2. Assets + storage + metadata gates  
3. Marketing campaigns model  
4. Router + search palette  

### Phase 3
1. Edge agent runner + proposals  
2. Rights/pricing/sales ingest  
3. Automations  
4. Intelligence snapshots  

### Phase 4
1. Series/Universe inheritance  
2. ONIX/export partners  
3. OPAS alignment APIs  
4. Mobile/public portals as needed  

---

## 20. Concrete File-Level Implementation Checklist (Phase 1)

| Area | Files / actions |
|------|-----------------|
| Types | Expand `src/types.ts` → `src/types/*` |
| Supabase | New migrations from legacy-schema adapted |
| Hooks | Update `useCharacters`, `useChapters`, add `useMilestones`, `useEditorialIssues` |
| Views | Wire Lifecycle to real gates; Editorial to issues model |
| Domain | Add `src/domain/readiness.ts`, `genomeCompleteness.ts` |
| Events | `src/lib/events.ts` |
| Tests | `src/domain/*.test.ts` |
| AI Center | Keep shell; list runs table when ready |
| Docs | Keep `docs/pos` updated on schema changes |

---

## 21. Alignment with Current Code (gap register)

| Current | Target | Action |
|---------|--------|--------|
| `books.user_id` ownership | `workspace_id` + members | Migration M-A/B |
| `books.phase` text | `current_milestone` + milestones table | Map + seed |
| `editorial_tasks` | `editorial_issues` | Migrate |
| `production_tasks` / `marketing_items` thin | assets/campaigns full model | Expand Phase 2 |
| AI Center UI shell | agent_runs/proposals | Phase 3 |
| No scenes/locations/canon | full continuity | Phase 2 |
| `legacy-schema.sql` not applied | becomes migration source | Adapt into `supabase/migrations` |
| Progress helper tested | extend to readiness tests | Phase 0 |

---

## 22. Open Technical Questions (decide in Phase 0 spike)

1. Manuscript canonical unit: chapter-only vs scene-assembled? **Default: chapter-canonical.**  
2. Soft vs hard delete post-M3? **Default: archive/soft-delete.**  
3. Embeddings provider & storage for semantic canon search — Phase 3.  
4. Whether to adopt react-router immediately — **recommended yes in Phase 1.**  
5. Single vs multi-imprint orgs for v1 — support schema now, UI simple.

---

## 23. Appendix — Sample Readiness Blocker Codes

| Code | Meaning |
|------|---------|
| `GENOME_LOGLINE_MISSING` | M1/M3 |
| `PROTAGONIST_MISSING` | M3 |
| `CHAPTERS_INSUFFICIENT` | M6 |
| `SCENES_INCOMPLETE` | M7 |
| `WORDCOUNT_BELOW_THRESHOLD` | M8 |
| `CRITICAL_ISSUES_OPEN` | M9–M16 |
| `ASSET_COVER_UNAPPROVED` | M13 |
| `ISBN_MISSING` | M13/M15 |
| `METADATA_INCOMPLETE` | M13–M15 |
| `CAMPAIGN_MISSING` | M14 |
| `PRICE_MISSING` | M15 |
| `PUBLISHER_APPROVAL_MISSING` | M16 |

---

## 24. Appendix — Environment Hardening Checklist

- [ ] `.env.example` documents all vars  
- [ ] Production anon key restricted by RLS (never service role in client)  
- [ ] Storage bucket private  
- [ ] Database backups enabled (Supabase)  
- [ ] Migration history clean on `main`  
- [ ] Preview env cannot read prod data  

---

## 25. Document Control

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-07-19 | Initial exhaustive Tech Spec for POS build |

### Change Log process

Any schema change:

1. Migration SQL  
2. Update §5 tables  
3. Update FRD traceability if FR impacted  
4. Bump TS patch version  

---

*End of Technical Specification. Engineers implement Phase 0–1 against §§3–8, 11, 15, 19–21 first.*
