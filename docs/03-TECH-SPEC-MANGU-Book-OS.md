# MANGU Book OS — Technical Specification

| Field | Value |
|---|---|
| **Document ID** | MANGU-TECH-001 |
| **Product** | MANGU Book Operating System (Book OS / POS) |
| **Version** | 1.0 |
| **Status** | Approved for Engineering Kickoff |
| **Date** | 2026-07-19 |
| **Parent** | MANGU-BRD-001, MANGU-FRD-001 |
| **Audience** | Engineering, DevOps, QA, architects |

---

## 1. Overview

### 1.1 Purpose

This document specifies **how** to implement MANGU Book OS: architecture, stack, data model, API contracts, security, deployment, migration path from the current repo, and engineering standards.

### 1.2 Canonical Implementation

| Artifact | Role |
|---|---|
| `src/` | **Canonical** React/TypeScript application |
| `supabase/migrations/` | **Canonical** applied database migrations |
| `prototype-reference/` | Feature/interaction reference only — do not merge blindly |
| `public/MANGU_Book_OS_v0_*.html` | Legacy standalone prototypes |
| `prototype-reference/legacy-schema.sql` | **Target** full PostgreSQL schema (not yet fully applied) |

### 1.3 Current vs Target Gap Summary

| Area | Current State | Target State |
|---|---|---|
| Tenancy | Single-user (`books.user_id`) | Organization → Workspace → Members |
| Milestones | 6 simplified phases in UI | M0–M20 with milestones table |
| Characters | Basic fields | Full genome + relationships |
| Chapters | number, title, notes | sequence, manuscript, POV FK, scenes |
| Editorial | `editorial_tasks` table | `editorial_issues` with severity/Kanban |
| Production | `production_tasks` | `assets` registry + storage |
| Marketing | `marketing_items` | `campaigns` with KPIs |
| AI | Client-side heuristics | Edge Functions + agent_runs + proposals |
| Audit | `activity_log` | `events` + `entity_versions` |
| Search | None | Full-text + future semantic |

---

## 2. Architecture

### 2.1 High-Level System Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           Client (Browser)                                │
│  React 18 SPA · Vite · Tailwind · Lucide                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────────┐  │
│  │   Views    │  │   Hooks    │  │  Contexts  │  │  Components/Shell  │  │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └────────────────────┘  │
│        └────────────────┴───────────────┘                                   │
│                         │ @supabase/supabase-js                             │
└─────────────────────────┼──────────────────────────────────────────────────┘
                          │ HTTPS (REST + Realtime)
┌─────────────────────────▼──────────────────────────────────────────────────┐
│                         Supabase Platform                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │  Auth       │  │  PostgreSQL  │  │  Storage    │  │  Edge Functions │ │
│  │  (JWT)      │  │  + RLS       │  │  mangu-assets│  │  agents/*       │ │
│  └─────────────┘  └──────────────┘  └─────────────┘  └─────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────────────────────────┐
│  Vercel (Hosting)          │  AI Provider (via Gateway)                      │
│  SPA + vercel.json         │  OpenAI / Anthropic / etc.                    │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Layered Architecture (Manual Volume I)

| Layer | Implementation |
|---|---|
| **Presentation** | React views in `src/views/`, components in `src/components/` |
| **Template** | Export generators (PDF, DOCX, ONIX) — Edge Functions or client |
| **Business Logic** | Readiness calculators, gate rules, hooks + future `src/lib/domain/` |
| **Data** | Supabase client hooks; Postgres as SSOT |
| **Storage** | PostgreSQL rows + Supabase Storage blobs |

### 2.3 Directory Structure (Target)

```
/workspace
├── docs/                          # BRD, FRD, Tech Spec (this doc)
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── types.ts                   # ViewId, domain types
│   ├── index.css                  # Tailwind + design tokens
│   ├── components/                # Shell, Modal, Toast, shared UI
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── BookContext.tsx
│   │   └── WorkspaceContext.tsx   # NEW — phase 1
│   ├── hooks/                     # Supabase data access per entity
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── progress.ts
│   │   ├── readiness/             # NEW — milestone scoring
│   │   ├── gates/                 # NEW — gate rule engine
│   │   └── agents/                # NEW — client agent invoke helpers
│   └── views/                     # One file per nav module
├── supabase/
│   ├── migrations/                # Ordered SQL migrations
│   └── functions/                 # NEW — Edge Functions
│       ├── agent-run/
│       ├── export-snapshot/
│       └── preflight/
├── prototype-reference/           # Read-only reference
├── public/
├── vercel.json
└── .github/workflows/ci.yml
```

---

## 3. Technology Stack

### 3.1 Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.3+ | UI framework |
| TypeScript | 5.5+ | Type safety |
| Vite | 5.4+ | Build/dev server |
| Tailwind CSS | 3.4+ | Styling |
| lucide-react | 0.344+ | Icons |
| Vitest | 4.x | Unit tests |
| ESLint | 9.x | Linting |

**Environment variables (client):**
```bash
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

App throws on load if either is missing (`src/lib/supabase.ts`).

### 3.2 Backend

| Technology | Purpose |
|---|---|
| Supabase PostgreSQL 15+ | Primary database |
| Supabase Auth | JWT authentication |
| Supabase Storage | Binary assets (covers, EPUB, etc.) |
| Supabase Edge Functions (Deno) | AI agents, exports, webhooks |
| Row Level Security | Multi-tenant isolation |

### 3.3 Infrastructure

| Service | Purpose |
|---|---|
| Vercel | SPA hosting, preview deploys per PR |
| GitHub Actions | CI: typecheck, lint, test, build |
| Supabase Dashboard | Migrations, RLS, storage buckets |

**vercel.json:**
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 4. Data Model

### 4.1 Entity Relationship Diagram (Target)

```
organizations
    └── workspaces
            └── workspace_members (user_id, role, capabilities)
            └── books
                    ├── milestones → milestone_items
                    ├── characters
                    ├── chapters → scenes → scene_characters
                    ├── locations
                    ├── canon_facts
                    ├── timeline_events
                    ├── relationships (polymorphic source/target)
                    ├── editorial_issues
                    ├── assets
                    ├── campaigns
                    ├── decisions
                    └── automations

Cross-cutting:
    events (audit stream)
    entity_versions (snapshots)
    notifications
    agent_runs
```

### 4.2 Enumerations

```sql
CREATE TYPE public.mangu_record_status AS ENUM (
  'draft', 'working', 'review', 'approved', 'published', 'archived'
);

CREATE TYPE public.mangu_severity AS ENUM (
  'low', 'medium', 'high', 'critical'
);
```

### 4.3 Core Tables (Target — from legacy-schema.sql)

#### organizations
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| name | text | NOT NULL |
| slug | text | UNIQUE |

#### workspaces
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| organization_id | uuid FK | |
| name, slug | text | UNIQUE (organization_id, slug) |
| settings | jsonb | Default `{}` |

#### workspace_members
| Column | Type | Notes |
|---|---|---|
| workspace_id, user_id | composite PK | |
| role | text | owner, admin, author, editor, production, marketing, viewer |
| capabilities | text[] | Fine-grained overrides |

#### books (target)
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| workspace_id | uuid FK | NOT NULL |
| record_code | text | UNIQUE per workspace, e.g. BOOK-000001 |
| title | text | NOT NULL |
| subtitle, series_name, genre | text | |
| publication_type | text | default 'book' |
| status | mangu_record_status | |
| current_milestone | text | M0–M20, default 'M0' |
| target_release_date | date | |
| owner_user_id | uuid FK auth.users | |
| word_count, word_goal | int | CHECK >= 0 |
| hook, logline, audience | text | |
| primary_theme, tone, point_of_view | text | |
| genome | jsonb | Extensible layers |
| approval_state | text | |
| version | int | CHECK > 0 |

**Indexes:** `(workspace_id, status)`, `(workspace_id, current_milestone)`, GIN on `genome`.

#### milestones / milestone_items
See `prototype-reference/legacy-schema.sql` lines 79–105.

#### characters (target)
Extends current with: `record_code`, `core_wound`, `core_desire`, `core_fear`, `arc`, `voice_profile`, `importance`, `genome jsonb`, `status`, `version`.

#### chapters (target)
Extends current with: `record_code`, `sequence`, `purpose`, `pov_character_id`, `manuscript text`, `emotional_shift`, `metadata jsonb`, `version`. Rename `number` → `sequence` for consistency.

#### scenes
Full spec in legacy-schema.sql lines 172–204.

#### editorial_issues
Replaces `editorial_tasks` with full issue model (lines 276–299).

#### assets
Production asset registry with storage_bucket, storage_path, checksum (lines 304–323).

#### campaigns
Replaces `marketing_items` (lines 325–342).

#### events
Immutable audit log (lines 425–443):
```sql
event_type, title, description, entity_type, entity_id,
actor_user_id, actor_agent_key, payload jsonb, occurred_at
```

#### agent_runs
```sql
agent_key, agent_version, status, input_context jsonb,
output jsonb, model_metadata jsonb, requested_by, approved_by,
started_at, completed_at
```

#### entity_versions
Point-in-time snapshots for rollback (lines 411–423).

### 4.4 Current Applied Migrations (As-Is)

| Migration | Table |
|---|---|
| 20260718183716 | books (simplified, user_id scoped) |
| 20260718183732 | characters |
| 20260718183745 | chapters |
| 20260718183758 | editorial_tasks |
| 20260718183819 | production_tasks, marketing_items, activity_log |

### 4.5 Migration Strategy (Phase 1)

**Step 1:** Add organizations, workspaces, workspace_members tables.

**Step 2:** Add workspace_id to books (nullable), backfill: create default org/workspace per existing user, assign books.

**Step 3:** Add new columns to books (record_code, current_milestone, genome, etc.) with defaults.

**Step 4:** Apply remaining tables from legacy-schema.sql.

**Step 5:** Migrate editorial_tasks → editorial_issues (data script).

**Step 6:** Drop user_id direct scope; enforce workspace RLS via `is_workspace_member()`.

**Step 7:** Generate record_codes for existing rows.

```sql
-- Example backfill record_code
UPDATE books SET record_code = 'BOOK-' || LPAD(
  ROW_NUMBER() OVER (PARTITION BY workspace_id ORDER BY created_at)::text, 6, '0'
) WHERE record_code IS NULL;
```

---

## 5. Security

### 5.1 Authentication Flow

```
User → AuthPage (email/password) → supabase.auth.signInWithPassword
    → JWT stored in client session
    → All queries include Authorization header
    → Postgres RLS evaluates auth.uid()
```

`AuthContext` (`src/contexts/AuthContext.tsx`):
- Subscribes to `onAuthStateChange`
- Provides `user`, `loading`, `signIn`, `signUp`, `signOut`

### 5.2 Row Level Security

**Current pattern (owner-scoped):**
```sql
EXISTS (SELECT 1 FROM books WHERE books.id = <child>.book_id AND books.user_id = auth.uid())
```

**Target pattern (workspace-scoped):**
```sql
CREATE FUNCTION is_workspace_member(target_workspace uuid) RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspace_members wm
    WHERE wm.workspace_id = target_workspace AND wm.user_id = auth.uid()
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

Apply to: books, milestones, characters, chapters, scenes, editorial_issues, assets, campaigns, events, agent_runs, entity_versions, notifications.

**Service role:** Edge Functions use service role for agent writes after approval — never expose to client.

### 5.3 Role Capabilities Matrix

| Action | Owner | Admin | Author | Editor | Production | Marketing | Viewer |
|---|---|---|---|---|---|---|---|
| Manage workspace members | ✓ | ✓ | | | | | |
| Create/delete book | ✓ | ✓ | ✓ | | | | |
| Edit genome/chapters | ✓ | ✓ | ✓ | ✓ | | | |
| Approve milestone gate | ✓ | ✓ | | ✓ | | | |
| Manage assets | ✓ | ✓ | | | ✓ | | |
| Manage campaigns | ✓ | ✓ | | | | ✓ | |
| Resolve editorial issues | ✓ | ✓ | ✓ | ✓ | | | |
| Invoke AI agents | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| Approve AI proposals | ✓ | ✓ | ✓ | ✓ | | | |
| View all | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

Enforce via RLS policies checking `workspace_members.role` + `capabilities` array for overrides.

### 5.4 Storage Security

Bucket: `mangu-assets` (private)

```sql
-- Storage policy pattern
CREATE POLICY "workspace_member_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'mangu-assets' AND is_workspace_member(
    (storage.foldername(name))[1]::uuid  -- workspace_id as first path segment
  ));
```

Path convention: `{workspace_id}/{book_id}/{asset_id}/{filename}`

---

## 6. API & Data Access Patterns

### 6.1 Supabase Client

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error('Missing Supabase env vars');

export const supabase = createClient(url, key);
```

### 6.2 Hook Pattern (Standard)

All entity hooks follow this contract:

```typescript
export function useCharacters(bookId: string | undefined) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!bookId) { setCharacters([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('book_id', bookId)
      .order('name');
    if (error) setError(error.message);
    else setCharacters(data ?? []);
    setLoading(false);
  }, [bookId]);

  useEffect(() => { refresh(); }, [refresh]);

  const create = async (payload: Partial<Character>) => { /* insert + log event */ };
  const update = async (id: string, payload: Partial<Character>) => { /* ... */ };
  const remove = async (id: string) => { /* ... */ };

  return { characters, loading, error, refresh, create, update, remove };
}
```

### 6.3 Event Logging Helper

```typescript
// src/lib/events.ts
export async function logEvent(params: {
  workspace_id: string;
  book_id?: string;
  event_type: string;
  title: string;
  entity_type?: string;
  entity_id?: string;
  payload?: Record<string, unknown>;
}) {
  await supabase.from('events').insert({
    ...params,
    actor_user_id: (await supabase.auth.getUser()).data.user?.id,
    occurred_at: new Date().toISOString(),
  });
}
```

Call from every mutation hook after successful insert/update/delete.

### 6.4 Realtime (Optional Phase 2)

```typescript
supabase.channel(`book:${bookId}`)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'chapters', filter: `book_id=eq.${bookId}` },
    () => refresh())
  .subscribe();
```

---

## 7. Business Logic Implementation

### 7.1 Readiness Calculator

```typescript
// src/lib/readiness/milestone.ts
export function milestoneReadiness(items: { completed: boolean }[]): number {
  if (items.length === 0) return 0;
  const done = items.filter(i => i.completed).length;
  return Math.round((done / items.length) * 100);
}

export function bookOverallReadiness(book: Book, scores: DomainScores): number {
  const weights = { creative: 0.3, editorial: 0.25, production: 0.25, marketing: 0.2 };
  return Math.round(
    scores.creative * weights.creative +
    scores.editorial * weights.editorial +
    scores.production * weights.production +
    scores.marketing * weights.marketing
  );
}
```

Reuse existing `progressPercent` from `src/lib/progress.ts` for sub-calculations.

### 7.2 Gate Engine

```typescript
// src/lib/gates/index.ts
export interface GateResult {
  passed: boolean;
  blockers: string[];
  warnings: string[];
}

export async function runGateCheck(
  milestoneCode: string,
  bookId: string,
  supabase: SupabaseClient
): Promise<GateResult> {
  switch (milestoneCode) {
    case 'M3': return checkM3Genome(supabase, bookId);
    case 'M8': return checkM8Draft(supabase, bookId);
    case 'M13': return checkM13Production(supabase, bookId);
    case 'M15': return checkM15PreLaunch(supabase, bookId);
    default: return checkDefaultMilestone(supabase, bookId, milestoneCode);
  }
}
```

Gate checks query live data — never trust client-only state.

### 7.3 Word Count Aggregation

On chapter manuscript save (debounced 500ms):
1. Update `chapters.word_count` = count words in manuscript
2. Aggregate `books.word_count` = SUM(chapters.word_count)
3. Update `books.progress` based on phase rules
4. Log event

---

## 8. AI Architecture

### 8.1 Shared Memory Snapshot

Edge Function builds context package:

```typescript
interface SharedMemorySnapshot {
  book: Book;
  milestones: Milestone[];
  characters: Character[];
  chapters: ChapterSummary[];
  scenes?: Scene[];
  editorial_issues: EditorialIssue[];
  assets: Asset[];
  campaigns: Campaign[];
  canon_facts?: CanonFact[];
  relationships?: Relationship[];
}
```

Query all tables for `book_id`, truncate manuscript to summaries for large texts, include in `agent_runs.input_context`.

### 8.2 Agent Run Flow

```
POST /functions/v1/agent-run
Body: { book_id, agent_key, prompt?, proposal_mode: true }
    ↓
Verify JWT + workspace membership
    ↓
Insert agent_runs (status: queued)
    ↓
Build shared memory snapshot
    ↓
Call LLM with system prompt per agent_key + snapshot
    ↓
Parse structured output: { summary, proposals: Proposal[] }
    ↓
Update agent_runs (status: pending_approval, output)
    ↓
Return run id to client
```

### 8.3 Proposal Schema

```typescript
interface AgentProposal {
  id: string;
  entity_type: 'character' | 'chapter' | 'book' | 'editorial_issue' | ...;
  entity_id: string | null;  // null = create new
  field: string;
  current_value: unknown;
  proposed_value: unknown;
  rationale: string;
  confidence: number;
}
```

### 8.4 Approval Endpoint

```
POST /functions/v1/agent-approve
Body: { run_id, proposal_ids: string[], action: 'accept' | 'reject' }
```

Accept path:
1. Validate approver role
2. Apply each proposal in transaction
3. Increment entity version, insert entity_versions snapshot
4. Log events
5. Update agent_runs.approved_by, status: completed

**Hard rule:** Client NEVER writes AI-proposed values directly to tables.

### 8.5 Agent System Prompts (Storage)

Store in `supabase/functions/_shared/prompts/` per agent_key. Version alongside `agent_version` column.

---

## 9. Frontend Module Specifications

### 9.1 View Registry

```typescript
// src/types.ts
export type ViewId =
  | 'dashboard' | 'library' | 'lifecycle' | 'genome'
  | 'characters' | 'chapters' | 'editorial' | 'production'
  | 'marketing' | 'ai-center' | 'activity'
  | 'work-queue'    // phase 5
  | 'manuscript'    // phase 3
  | 'settings';     // phase 1
```

`AppShell.tsx` maps ViewId → component.

### 9.2 State Management

| Scope | Mechanism |
|---|---|
| Auth | AuthContext |
| Active book | BookContext |
| Active workspace | WorkspaceContext (new) |
| Entity data | Per-view hooks (no global Redux) |
| UI toast | ToastProvider |

### 9.3 Design Tokens (Tailwind)

From `tailwind.config.js` and `index.css`:
- `--gold`, `--cream`, `--bg-0`, `--line`, `--muted`
- Components: `card-gradient`, `hero-gradient`, `progress-track`, `status-badge`

**Rule:** Match prototype v0.2 visual language when transplanting features.

### 9.4 Component Library Roadmap

| Component | Status | Priority |
|---|---|---|
| Modal | Exists | — |
| Toast | Exists | — |
| DataTable | Needed | P1 |
| KanbanBoard | Needed for editorial | P1 |
| MilestoneList + Detail | Port from prototype | P0 |
| ManuscriptEditor | Needed | P1 |
| CommandPalette | Port from v0.2 | P2 |
| ProposalReviewCard | Needed | P1 |

---

## 10. Edge Functions Catalog

| Function | Method | Purpose |
|---|---|---|
| `agent-run` | POST | Execute governed agent |
| `agent-approve` | POST | Apply/reject proposals |
| `export-snapshot` | POST | Full project JSON export |
| `import-snapshot` | POST | Restore from JSON |
| `preflight` | POST | M13 asset validation |
| `generate-metadata` | POST | ONIX/retailer JSON from genome |
| `readiness-report` | GET | PDF/markdown readiness |

Deploy: `supabase functions deploy <name>`

---

## 11. Testing Strategy

### 11.1 Unit Tests (Vitest)

Location: `src/**/*.test.ts` adjacent to source.

**Current:** `src/lib/progress.test.ts`

**Required coverage targets:**
| Module | Tests |
|---|---|
| `lib/progress.ts` | progressPercent edge cases |
| `lib/readiness/*` | Milestone scoring |
| `lib/gates/*` | Each gate rule with fixtures |
| `lib/wordcount.ts` | Manuscript word counting |

### 11.2 Integration Tests

Use Supabase local dev (`supabase start`) + test workspace seed:

- CRUD each entity respects RLS
- User A cannot read User B workspace books
- Gate check returns correct blockers

### 11.3 E2E Tests (Phase 2)

Playwright:
- Sign up → create book → add character → complete M0 item → approve
- Upload asset → run preflight

### 11.4 CI Pipeline

`.github/workflows/ci.yml`:
```yaml
- npm run typecheck
- npm run lint
- npm run test
- npm run build
```

All must pass before merge.

---

## 12. Deployment

### 12.1 Environments

| Env | Frontend | Database |
|---|---|---|
| Local | `npm run dev` | Supabase local or dev project |
| Preview | Vercel PR deploy | Supabase preview branch (optional) |
| Production | Vercel main | Supabase production |

### 12.2 Environment Variables

| Variable | Where | Required |
|---|---|---|
| VITE_SUPABASE_URL | Vercel + .env | Yes |
| VITE_SUPABASE_ANON_KEY | Vercel + .env | Yes |
| SUPABASE_SERVICE_ROLE_KEY | Edge Functions only | Yes |
| AI_GATEWAY_API_KEY | Edge Functions | Phase 5 |

### 12.3 Migration Deployment

1. Apply migrations via Supabase CLI: `supabase db push`
2. Verify RLS policies in dashboard
3. Create storage bucket `mangu-assets`
4. Deploy Edge Functions
5. Deploy frontend to Vercel

### 12.4 Rollback

- Frontend: Vercel instant rollback to prior deployment
- Database: Forward-only migrations; write down migrations for reversals; rely on entity_versions for data rollback

---

## 13. Performance & Scalability

| Concern | Strategy |
|---|---|
| Large manuscripts | Store in `chapters.manuscript`; lazy load per chapter; consider TOAST compression |
| Portfolio list | Paginate library; index `updated_at DESC` |
| Activity feed | Index `(workspace_id, occurred_at DESC)`; paginate |
| Graph queries | Materialized views for relationship counts (phase 6) |
| Search | Postgres `tsvector` on title, name, manuscript; pgvector for semantic (phase 6) |
| Realtime | Subscribe per active book only |

**Targets:** p95 API <500ms; initial JS bundle <250KB gzipped (code split views).

---

## 14. Observability

| Signal | Tool |
|---|---|
| Frontend errors | Vercel Analytics / Sentry (recommended) |
| Edge Function logs | Supabase dashboard |
| DB slow queries | Supabase performance advisor |
| Agent costs | model_metadata token counts in agent_runs |

---

## 15. Prototype Transplant Guide

When porting features from `prototype-reference/MANGU_Book_OS_v0_2_Standalone.html`:

| Prototype Feature | Target Location | Notes |
|---|---|---|
| M0–M20 milestone list/detail | `src/views/Lifecycle.tsx` | Replace 6-phase simplified model |
| Manuscript studio | `src/views/Manuscript.tsx` | New view |
| Work queue | `src/views/WorkQueue.tsx` | New view |
| Story graph | `src/views/StoryGraph.tsx` | Phase 6 |
| Command palette | `src/components/CommandPalette.tsx` | Global |
| Snapshots | Edge Function + UI modal | |
| AI proposals | AI Center + Work Queue | Wire to agent_runs |
| Kanban editorial | `src/views/Editorial.tsx` | Enhance current |

**Do NOT** copy localStorage persistence — replace with Supabase hooks.

---

## 16. Implementation Backlog (Engineering Tickets)

### Epic E1: Workspace Tenancy
- [ ] E1-1: Migration — organizations, workspaces, workspace_members
- [ ] E1-2: Backfill existing users to default workspace
- [ ] E1-3: WorkspaceContext + workspace switcher UI
- [ ] E1-4: Update all RLS policies to workspace scope
- [ ] E1-5: Role-based action guards in UI

### Epic E2: Milestone Engine
- [ ] E2-1: Migration — milestones, milestone_items
- [ ] E2-2: Seed M0–M20 templates on book create
- [ ] E2-3: Port Lifecycle UI from prototype
- [ ] E2-4: Gate engine + approval flow
- [ ] E2-5: Readiness report export

### Epic E3: Genome Expansion
- [ ] E3-1: Extend books/characters/chapters schema
- [ ] E3-2: locations, scenes, scene_characters tables
- [ ] E3-3: canon_facts, timeline_events, relationships
- [ ] E3-4: Genome JSONB editors per layer
- [ ] E3-5: record_code generator

### Epic E4: Editorial & Manuscript
- [ ] E4-1: editorial_issues migration from editorial_tasks
- [ ] E4-2: Kanban board component
- [ ] E4-3: Manuscript editor with autosave
- [ ] E4-4: Word count aggregation trigger/hook

### Epic E5: Production & Storage
- [ ] E5-1: assets table + storage bucket
- [ ] E5-2: Upload UI with progress
- [ ] E5-3: Preflight Edge Function
- [ ] E5-4: campaigns table replacing marketing_items

### Epic E6: AI Workforce
- [ ] E6-1: agent_runs table
- [ ] E6-2: agent-run Edge Function
- [ ] E6-3: Proposal review UI
- [ ] E6-4: agent-approve Edge Function
- [ ] E6-5: Executive Publisher + Continuity Guardian prompts

### Epic E7: Platform
- [ ] E7-1: events table on all mutations
- [ ] E7-2: entity_versions on approved changes
- [ ] E7-3: Export/import snapshot
- [ ] E7-4: Command palette search
- [ ] E7-5: URL routing (react-router)

---

## 17. Coding Standards

| Rule | Detail |
|---|---|
| TypeScript strict | No `any` without comment |
| Hooks | One hook file per entity |
| Errors | Always surface to user via toast |
| Mutations | Always log event after success |
| Migrations | Idempotent where possible; comment header block |
| Components | Functional only; no class components |
| Styling | Tailwind utilities; extract repeated patterns to components |
| Tests | Required for lib/ business logic |
| PR size | <500 lines preferred; split by epic |

---

## 18. Open Questions

| ID | Question | Owner | Default Assumption |
|---|---|---|---|
| OQ-1 | React Router now or phase 2? | Frontend lead | Phase 2; ViewId state for now |
| OQ-2 | Rich text vs plain manuscript? | Product | Plain text MVP; TipTap phase 3 |
| OQ-3 | Supabase branching for previews? | DevOps | Single dev project until scale |
| OQ-4 | AI provider via Vercel AI Gateway? | Platform | Yes — unified routing |
| OQ-5 | Migrate existing production data? | Product | Yes with backfill scripts |

---

## 19. Document Control

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-07-19 | Initial technical specification |

**Related Documents:**
- `docs/01-BRD-MANGU-Book-OS.md`
- `docs/02-FRD-MANGU-Book-OS.md`
- `prototype-reference/legacy-schema.sql`
- `prototype-reference/HANDOFF-v0.2.md`
- `README.md`

---

*End of Technical Specification*
