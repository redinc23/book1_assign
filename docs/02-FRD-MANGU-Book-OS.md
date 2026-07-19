# MANGU Book OS — Functional Requirements Document (FRD)

| Field | Value |
|---|---|
| **Document ID** | MANGU-FRD-001 |
| **Product** | MANGU Book Operating System (Book OS / POS) |
| **Version** | 1.0 |
| **Status** | Approved for Engineering Kickoff |
| **Date** | 2026-07-19 |
| **Parent** | MANGU-BRD-001 |
| **Audience** | Product, engineering, QA, design, creative ops |

---

## 1. Introduction

### 1.1 Purpose

This Functional Requirements Document specifies **what** the MANGU Book OS must do — module by module, screen by screen, rule by rule — in sufficient detail for engineering to implement without guessing business intent.

### 1.2 Conventions

| Label | Meaning |
|---|---|
| **P0** | Must have for GA — blocking |
| **P1** | Should have for GA — high value |
| **P2** | Could have — post-GA or stretch |
| **SHALL** | Mandatory requirement |
| **SHOULD** | Recommended; waiver requires product approval |
| **MAY** | Optional |

**Requirement ID format:** `FR-<MODULE>-<NNN>` (e.g., `FR-LC-012`)

### 1.3 System Context

```
┌─────────────────────────────────────────────────────────────────┐
│                     MANGU Book OS (Web SPA)                      │
├─────────────┬─────────────┬─────────────┬─────────────┬───────────┤
│  Dashboard  │   Library   │  Lifecycle  │   Genome    │ Characters│
├─────────────┼─────────────┼─────────────┼─────────────┼───────────┤
│  Chapters   │  Manuscript │  Editorial  │ Production  │ Marketing │
│   Studio    │   (future)  │   Kanban    │   Assets    │ Campaigns │
├─────────────┴─────────────┴─────────────┴─────────────┴───────────┤
│  AI Center │ Work Queue │ Notifications │ Search │ Activity │ Settings│
└──────────────────────────────┬──────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Supabase Backend │
                    │  Auth · Postgres  │
                    │  Storage · Edge   │
                    └───────────────────┘
```

---

## 2. Global Functional Requirements

### 2.1 Authentication & Session

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR-AUTH-001 | System SHALL provide email/password sign-up and sign-in | P0 | User can register, verify email (if enabled), sign in |
| FR-AUTH-002 | System SHALL persist session across browser refresh | P0 | Reload keeps user authenticated until expiry/sign-out |
| FR-AUTH-003 | System SHALL show auth loading state before routing | P0 | No flash of protected content |
| FR-AUTH-004 | System SHALL support sign-out clearing all client state | P0 | Books list empty after sign-out |
| FR-AUTH-005 | System SHOULD support OAuth providers (Google, Apple) | P2 | Configurable in Supabase dashboard |

### 2.2 Navigation & Shell

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR-NAV-001 | App SHALL provide persistent sidebar with grouped modules | P0 | Dashboard, Library, Book group, Workflow group, Intelligence group |
| FR-NAV-002 | Topbar SHALL show current view title and active book context | P0 | Title updates on navigation |
| FR-NAV-003 | Sidebar SHALL collapse on mobile with overlay | P0 | Usable on 375px viewport |
| FR-NAV-004 | System SHALL deep-link views (future: URL routes per view) | P2 | `/books/:id/lifecycle` etc. |

### 2.3 Active Book Context

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR-BOOK-CTX-001 | User SHALL select active book from library or topbar switcher | P0 | All book-scoped views reflect selection |
| FR-BOOK-CTX-002 | Switching books SHALL refresh dependent hooks without full reload | P0 | Characters/chapters swap correctly |
| FR-BOOK-CTX-003 | Empty state SHALL prompt book creation when no books exist | P0 | Dashboard shows CTA |

### 2.4 Notifications & Feedback

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR-UX-001 | System SHALL show toast on successful CRUD operations | P0 | Create/update/delete feedback |
| FR-UX-002 | System SHALL show inline error on failed API calls | P0 | User-readable message, no silent fail |
| FR-UX-003 | Loading spinners SHALL appear for async view loads | P0 | No blank flash >200ms |

### 2.5 Activity & Audit

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR-ACT-001 | System SHALL log user actions to activity_log / events | P0 | Create book, edit chapter, approve gate |
| FR-ACT-002 | Activity view SHALL list recent actions with relative timestamps | P0 | Matches logged events |
| FR-ACT-003 | Events SHALL include entity_type, entity_id, actor, payload | P1 | Queryable audit trail |

---

## 3. Module: Executive Dashboard

**View ID:** `dashboard`  
**Personas:** All; primary for Publisher  
**Purpose:** Single operational picture of portfolio and active publication.

### 3.1 User Stories

| Story ID | As a... | I want to... | So that... |
|---|---|---|---|
| US-DASH-01 | Publisher | see my active book hero card with progress | I know where to continue |
| US-DASH-02 | Publisher | see portfolio metrics (active projects, deadlines) | I manage capacity |
| US-DASH-03 | Publisher | see recent activity feed | I stay aware of team changes |
| US-DASH-04 | Publisher | navigate to continue work in one click | I reduce friction |
| US-DASH-05 | Publisher | generate executive brief (future) | I share status with stakeholders |

### 3.2 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-DASH-001 | Dashboard SHALL display hero card for active book: cover, title, phase/milestone, word progress bar | P0 |
| FR-DASH-002 | Dashboard SHALL show metric tiles: Active Projects, Total Books, Next Deadline, Activity count | P0 |
| FR-DASH-003 | Recent Activity SHALL show last 6 entries with action, target, relative time | P0 |
| FR-DASH-004 | Your Books sidebar SHALL list up to 4 books with phase and progress | P0 |
| FR-DASH-005 | Empty dashboard SHALL show welcome + "Create Your First Book" CTA | P0 |
| FR-DASH-006 | Dashboard SHOULD show readiness breakdown: creative, editorial, production, marketing | P1 |
| FR-DASH-007 | Dashboard SHOULD show open critical issues count | P1 |
| FR-DASH-008 | Dashboard SHOULD show risk level badge (low/medium/high/critical) | P1 |
| FR-DASH-009 | "Continue" button SHALL navigate to contextually appropriate view (chapters or lifecycle gate) | P1 |
| FR-DASH-010 | "Generate brief" SHALL invoke Executive Publisher agent with book snapshot | P2 |

### 3.3 Target Metrics (Full Build)

| Metric | Source | Display |
|---|---|---|
| Book readiness | Milestone engine | % overall |
| Creative completion | M0–M8 checklist | % |
| Editorial completion | Open vs resolved issues | % |
| Production completion | Approved assets / required | % |
| Marketing completion | Campaign readiness | % |
| Managed assets | assets table count | # |
| Open issues | editorial_issues where status ≠ resolved | # by severity |

---

## 4. Module: Publication Library

**View ID:** `library`  
**Purpose:** Canonical catalog — one authoritative record per publication.

### 4.1 User Stories

| Story ID | As a... | I want to... | So that... |
|---|---|---|---|
| US-LIB-01 | Author | create a new publication | I start a project |
| US-LIB-02 | Publisher | see all books in a table with status, gate, readiness | I compare portfolio |
| US-LIB-03 | Author | open a book as active | downstream views use it |
| US-LIB-04 | Admin | archive/delete publications | I manage catalog hygiene |
| US-LIB-05 | Publisher | export/import project JSON | I backup and migrate |

### 4.2 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-LIB-001 | Library SHALL list all books user/workspace can access | P0 |
| FR-LIB-002 | Create book modal/form SHALL capture: title (required), author, genre, target word count, deadline | P0 |
| FR-LIB-003 | New book SHALL initialize at M0 or phase "Concept" with status draft | P0 |
| FR-LIB-004 | Table SHALL show: title, status, current milestone/gate, readiness %, word count, target | P1 |
| FR-LIB-005 | Click row SHALL set active book and optionally navigate to genome | P0 |
| FR-LIB-006 | Edit book SHALL update title, author, genre, cover_url, deadline, target_word_count | P0 |
| FR-LIB-007 | Delete book SHALL cascade to child entities with confirmation dialog | P0 |
| FR-LIB-008 | Library SHOULD support filter by status, milestone, genre | P1 |
| FR-LIB-009 | Library SHOULD support sort by updated_at, deadline, title | P1 |
| FR-LIB-010 | Export SHALL produce JSON snapshot of book + all child entities | P1 |
| FR-LIB-011 | Import SHALL create book from valid snapshot with new UUIDs | P2 |

### 4.3 Book Record Fields

#### Phase 1 (Current Schema)
`id, user_id, title, author, genre, cover_url, progress, phase, status, word_count, target_word_count, deadline, created_at, updated_at`

#### Target Schema (Full Build)
`id, workspace_id, record_code, title, subtitle, series_name, genre, publication_type, status (enum), current_milestone, target_release_date, owner_user_id, word_count, word_goal, hook, logline, audience, primary_theme, tone, point_of_view, genome (jsonb), approval_state, version`

---

## 5. Module: Lifecycle & Milestone Engine

**View ID:** `lifecycle`  
**Purpose:** M0–M20 publishing lifecycle with gates, checklists, approvals.

### 5.1 Milestone Data Model

Each milestone record:

```typescript
interface Milestone {
  id: string;
  book_id: string;
  code: 'M0' | 'M1' | ... | 'M20';
  name: string;
  description: string;
  status: 'planned' | 'in_progress' | 'complete' | 'blocked';
  readiness: number; // 0-100
  approved_by?: string;
  approved_at?: string;
  items: MilestoneItem[];
}

interface MilestoneItem {
  id: string;
  milestone_id: string;
  title: string;
  completed: boolean;
  completed_by?: string;
  completed_at?: string;
  position: number;
  metadata?: Record<string, unknown>;
}
```

### 5.2 Complete M0–M20 Specification

#### M0 — Market Intelligence
| Field | Value |
|---|---|
| **Objective** | Determine whether the book should exist |
| **Default Checklist Items** | Market research captured; Genre validated; Target audience defined; Comp titles identified; Opportunity matrix documented; Risk assessment complete |
| **Exit Criteria** | Target audience defined ✔; Genre validated ✔; Opportunity identified ✔; Commercial rationale documented ✔ |
| **Approvers** | Publishing Director, Creative Director, Business Lead |
| **AI Agent** | Market Intelligence Agent |

#### M1 — Concept Discovery
| Checklist Items | Working title set; One-sentence premise; Elevator pitch; Genre/subgenre; Core theme; Primary conflict; Estimated length; Target release window |
| **Readiness Questions** | Understand in 30 seconds? One sentence explainable? Clear why reader should care? |

#### M2 — Story Foundation
| Deliverables | Protagonist, antagonist, supporting cast, core wound/desire/need/fear, internal/external conflict, stakes, transformation, ending intent |
| **Exit Criteria** | Every major character has psychological profile and narrative role |

#### M3 — Book Genome
| Required Entities | Book, Characters, Locations, Organizations, Objects, Themes, Timeline, Relationships, Magic/Tech systems, Story rules, Canon rules, Vocabulary/Glossary |
| **AI Tasks** | Detect duplicates; suggest missing entities; flag incomplete records; recommend relationship links |

#### M4 — Story Architecture
| Deliverables | Story structure, acts, turning points, midpoint, climax, resolution, subplots, mysteries, reveals, foreshadowing plan, pacing strategy, theme integration |
| **Validation Rules** | Every subplot supports central narrative; every reveal has setup; every act ends with meaningful change |

#### M5 — Outline Development
| Deliverables | Chapter list, summaries, word estimates, scene estimates, character distribution, timeline alignment, emotional beats |

#### M6 — Chapter Planning
| Per-Chapter Fields | Purpose, conflict, POV, opening hook, ending hook, themes, characters, locations, target length, reading time, dependencies, status |
| **Exit Criteria** | Every chapter has clear purpose; no filler chapters |

#### M7 — Scene Planning
| Per-Scene Questions | Who present? Where? What changes? Why necessary? Emotional shift? Plot advancement? |
| **Rule** | Scene that cannot answer → revise, merge, or remove |

#### M8 — First Draft
| Metrics | Words written, daily/weekly goals, chapter/scene progress, velocity, estimated completion, quality flags |
| **AI Assistance** | Continuity reminders, voice consistency, timeline validation, terminology, style suggestions |

#### M9 — Developmental Editing
| Outputs | Revision plan, structural issues, priority ranking, rewrite tasks |
| **Questions** | Narrative works? Stakes compelling? Characters evolve? Pacing balanced? Ending earned? |

#### M10 — Line Editing
| Focus | Sentence rhythm, dialogue, clarity, voice, repetition, flow |

#### M11 — Copyediting
| Focus | Grammar, spelling, capitalization, consistency, formatting, references, terminology |

#### M12 — Proofreading
| Outputs | Final approval checklist, proof log, error report, publication sign-off |
| **Rule** | No creative changes — corrections only |

#### M13 — Production
| Deliverables | Print interior, ebook, audiobook script, cover files, marketing images, metadata, retail files, ISBN, distribution package |
| **Automation** | Generate retailer metadata; validate ISBNs; export print specs; accessibility reports |

#### M14 — Marketing Preparation
| Deliverables | Brand messaging, author bio, press kit, cover reveal plan, social calendar, email campaign, ARC list, influencer outreach, media targets, ad plan |

#### M15 — Pre-Launch
| Checklist | Files uploaded ✔; Retail metadata complete ✔; Pricing approved ✔; Marketing scheduled ✔; ARC distributed ✔; Website updated ✔; Newsletter prepared ✔; Launch events confirmed ✔ |

#### M16 — Publication
| Track | Sales, downloads, rankings, reviews, inventory, returns, ad performance, media mentions, reader feedback |

#### M17 — Post-Launch
| Analyze | Audience reached? Best channels? Recurring feedback? Converting assets? Edition updates needed? |

#### M18 — Catalog Growth
| Focus | Series expansion, translations, large-print, special editions, audio, companion guides, educational, merchandise, licensing, cross-promotions |

#### M19 — Franchise Expansion
| Paths | Sequels, prequels, spin-offs, graphic novels, comics, interactive, film/TV, podcasts, games, curricula — linked via Universe/Series/Rights |

#### M20 — Legacy Management
| Responsibilities | Rights renewals, new editions, metadata refresh, accessibility, archival storage, sales trends, historical docs, canon, estate planning |

### 5.3 Lifecycle UI Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-LC-001 | Lifecycle view SHALL show M0–M20 list with readiness % and status per milestone | P0 |
| FR-LC-002 | Selecting milestone SHALL show detail: code, name, purpose, checklist, footer actions | P0 |
| FR-LC-003 | User SHALL toggle checklist item completion with immediate persistence | P0 |
| FR-LC-004 | Readiness % SHALL = completed_items / total_items × 100 | P0 |
| FR-LC-005 | "Approve [code]" button SHALL be disabled until readiness = 100% | P0 |
| FR-LC-006 | Approval SHALL record approver, timestamp, advance book.current_milestone | P0 |
| FR-LC-007 | "Run gate check" SHALL evaluate business rules and surface blockers | P1 |
| FR-LC-008 | "Readiness report" SHALL export PDF/markdown summary | P2 |
| FR-LC-009 | Non-linear enrichment: completing M9 issue MAY create M4 architecture task without rollback | P1 |

### 5.4 Gate Business Rules

| Rule ID | Condition | Action |
|---|---|---|
| GR-001 | readiness < 100% | Block approval |
| GR-002 | M3 gate | Require ≥1 character, ≥1 location OR theme, book.hook populated |
| GR-003 | M8 gate | Require ≥1 chapter with status working/complete; creative readiness ≥ threshold |
| GR-004 | M13 gate | Require approved assets: cover, interior OR ebook, metadata record |
| GR-005 | M15 gate | All M15 checklist items complete + M13/M14 approved |
| GR-006 | User role Viewer | Deny approval actions |

---

## 6. Module: Book Genome

**View ID:** `genome`  
**Purpose:** Structured DNA of the publication — 10 layers (manual Volume X).

### 6.1 Genome Layers

| Layer | Contents |
|---|---|
| L1 Identity | Title, series, edition, ISBN, publication type |
| L2 Creative | Genre, mood, tone, voice, POV, themes, motifs, symbols |
| L3 Narrative | Structure, acts, beats, pacing profile |
| L4 Character | Cast summary, arc overview, relationship summary |
| L5 World | Geography, systems, rules, organizations |
| L6 Reader Experience | Age range, reading level, emotional palette, hooks |
| L7 Commercial | Logline, USP, comps, keywords, pricing |
| L8 Franchise | Universe links, series position, adaptation readiness |
| L9 Publishing | Milestone, owner, dependencies, risk |
| L10 Evolution | Version history, change frequency, lessons learned |

### 6.2 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-GEN-001 | Genome view SHALL provide tabbed navigation: Overview, Themes, World-Building, Tone & Voice (+ future layers) | P0 |
| FR-GEN-002 | Overview SHALL show project details, progress, genre tags, status summary | P0 |
| FR-GEN-003 | All genome fields SHALL persist to books.genome JSONB or normalized tables | P1 |
| FR-GEN-004 | Genome completeness score SHALL display per layer | P1 |
| FR-GEN-005 | Themes tab SHALL support CRUD on theme records linked to book | P1 |
| FR-GEN-006 | World-building tab SHALL link to locations, magic/tech systems | P1 |
| FR-GEN-007 | Tone tab SHALL store narrative voice, pacing visualization, emotional palette | P1 |
| FR-GEN-008 | Genome SHOULD generate fingerprint hash for similarity/portfolio analysis | P2 |

---

## 7. Module: Characters

**View ID:** `characters`  
**Purpose:** Character Engine — identity through transformation.

### 7.1 Character Entity (Target)

| Domain | Fields |
|---|---|
| Identity | name, aliases, age, occupation, species, record_code |
| Psychology | core_wound, core_desire, core_fear, misbelief, values |
| Motivation | external_goal, internal_need, stakes |
| Behavior | voice_profile, stress_response, defense_mechanisms |
| Relationships | graph edges to other characters |
| Arc | arc type, transformation, starting/ending state |
| Narrative | importance (0-100), POV eligibility, scenes present |
| Meta | status, version, genome JSONB |

### 7.2 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-CHAR-001 | List characters for active book with name, role, archetype, arc | P0 |
| FR-CHAR-002 | Create character with name (required), role, archetype, arc, notes | P0 |
| FR-CHAR-003 | Edit all character fields inline or modal | P0 |
| FR-CHAR-004 | Delete character with confirmation; nullify chapter POV refs | P0 |
| FR-CHAR-005 | Character card SHOULD show connection count from relationships | P1 |
| FR-CHAR-006 | Character detail SHOULD show psychology layers (M2/M3 fields) | P1 |
| FR-CHAR-007 | Character SHOULD link to scenes where they appear | P1 |
| FR-CHAR-008 | Image upload for character portrait via storage | P2 |

---

## 8. Module: Chapters & Manuscript Studio

**View ID:** `chapters` (+ future `manuscript` view)  
**Purpose:** Chapter planning (M6) and first draft (M8).

### 8.1 Chapter Entity

| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| book_id | uuid | FK |
| record_code | text | e.g. CH-001 |
| sequence / number | int | Order in book |
| title | text | Required |
| purpose | text | M6 |
| pov_character_id | uuid | FK nullable |
| pov_label | text | Fallback |
| emotional_shift | text | M6 |
| word_goal | int | Target |
| word_count | int | Computed from manuscript |
| manuscript | text | Full chapter prose (M8) |
| status | enum | planned, working, complete, review |
| metadata | jsonb | hooks, dependencies, themes |

### 8.2 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-CH-001 | List chapters ordered by sequence with title, status, word count | P0 |
| FR-CH-002 | Create chapter with number, title; auto-increment number | P0 |
| FR-CH-003 | Edit chapter title, status, POV, notes, word counts | P0 |
| FR-CH-004 | Delete chapter with confirmation | P0 |
| FR-CH-005 | Reorder chapters updating sequence uniquely | P1 |
| FR-CH-006 | Manuscript studio SHALL provide rich text or plain text editor per chapter | P1 |
| FR-CH-007 | Word count SHALL update on manuscript save (debounced) | P1 |
| FR-CH-008 | Book word_count SHALL aggregate chapter word counts | P1 |
| FR-CH-009 | Chapter planning fields (purpose, hooks) SHALL be editable in M6+ | P1 |
| FR-CH-010 | Split/merge chapter actions | P2 |

### 8.3 Scene Sub-Module (M7)

| ID | Requirement | Priority |
|---|---|---|
| FR-SC-001 | Scenes belong to chapter with sequence, title, goal, conflict, outcome | P1 |
| FR-SC-002 | Scene SHALL link location_id, pov_character_id, scene_characters | P1 |
| FR-SC-003 | Scene list nested under chapter in UI | P1 |
| FR-SC-004 | Scene justification validator flags scenes missing "what changes" | P2 |

---

## 9. Module: Editorial Intelligence

**View ID:** `editorial`  
**Purpose:** Issue tracking, Kanban workflow, editorial quality.

### 9.1 Editorial Issue Entity

| Field | Values |
|---|---|
| category | structure, character, pacing, continuity, canon, style, grammar, sensitivity, fact, other |
| severity | low, medium, high, critical |
| status | open, in_progress, resolved, wont_fix, deferred |
| links | chapter_id, scene_id, character_id (optional) |
| content | title, description, suggested_fix, root_cause, lesson_learned, resolution |

### 9.2 Kanban Columns

`Open → In Progress → Review → Resolved`

### 9.3 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-ED-001 | Editorial board SHALL display issues in Kanban by status | P0 |
| FR-ED-002 | Create issue with title, category, severity, description | P0 |
| FR-ED-003 | Drag or action to change status | P0 |
| FR-ED-004 | Filter by severity, category, assignee | P1 |
| FR-ED-005 | Link issue to chapter/scene/character | P1 |
| FR-ED-006 | Resolved issues SHALL require resolution notes for M9+ | P1 |
| FR-ED-007 | Critical open issues SHALL surface on dashboard and block M12 approval | P1 |
| FR-ED-008 | Editorial quality score = weighted resolution by severity | P2 |

---

## 10. Module: Production & Asset Registry

**View ID:** `production`  
**Purpose:** M13 production pipeline — one manuscript, many products.

### 10.1 Asset Types

| Type | Format Examples | Required for M13 |
|---|---|---|
| cover | PDF, PNG, JPG | Yes |
| interior | PDF (print-ready) | Print editions |
| ebook | EPUB, MOBI | Yes |
| audiobook | WAV masters, script | Optional |
| marketing | PNG, JPG banners | M14 |
| metadata | ONIX, JSON | Yes |

### 10.2 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-PROD-001 | List production tasks with task, status, due, assignee, category | P0 |
| FR-PROD-002 | CRUD production tasks | P0 |
| FR-PROD-003 | Asset registry SHALL list assets with name, type, format, version, status | P1 |
| FR-PROD-004 | Upload asset to Supabase Storage bucket `mangu-assets` | P1 |
| FR-PROD-005 | Asset approval workflow: draft → review → approved | P1 |
| FR-PROD-006 | Preflight validation at M13 checks required asset types | P1 |
| FR-PROD-007 | Store checksum for file integrity | P2 |
| FR-PROD-008 | Version increment on re-upload | P2 |

---

## 11. Module: Marketing

**View ID:** `marketing`  
**Purpose:** M14–M17 campaign and launch operations.

### 11.1 Campaign Entity (Target)

Replaces simplified `marketing_items`:

| Field | Notes |
|---|---|
| name, channel, objective | Core |
| budget, status, progress | Tracking |
| kpis | jsonb — impressions, clicks, conversions |
| starts_at, ends_at | Schedule |
| genome_refs | Auto-populated hook, themes, audience |

### 11.2 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-MKT-001 | List marketing items/campaigns for active book | P0 |
| FR-MKT-002 | CRUD marketing items: title, channel, status, reach, date | P0 |
| FR-MKT-003 | Campaign SHOULD pre-fill copy from book.hook, themes | P1 |
| FR-MKT-004 | M15 checklist UI for pre-launch verification | P1 |
| FR-MKT-005 | Post-launch metrics entry for M17 | P2 |

---

## 12. Module: AI Center

**View ID:** `ai-center`  
**Purpose:** Governed AI workforce with shared memory.

### 12.1 Agent Catalog (Minimum Viable)

| Agent Key | Milestone Domain | Capabilities |
|---|---|---|
| executive_publisher | All | Briefs, gate recommendations, risk summary |
| market_intelligence | M0 | Comps, trends, positioning |
| concept_architect | M1 | Loglines, hooks |
| story_architect | M4 | Structure, acts, reveals |
| character_psychologist | M2/M3 | Psychology layers, arc |
| continuity_guardian | M8–M11 | Canon violations, timeline |
| developmental_editor | M9 | Structural issue proposals |
| production_coordinator | M13 | Metadata, preflight |
| marketing_strategist | M14 | Campaign ideas from genome |

### 12.2 Proposal Workflow

```
User invokes agent
    → agent_run created (status: running)
    → agent reads shared memory snapshot
    → agent outputs proposals[] (entity, field, old, new, rationale)
    → status: pending_approval
User reviews in Work Queue
    → Accept / Reject / Edit per proposal
    → Accepted proposals write to DB + entity_version + event
    → agent_run status: completed
```

### 12.3 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-AI-001 | AI Center SHALL show insights derived from book data (current: heuristic) | P0 |
| FR-AI-002 | Insights SHALL have type, title, description, confidence, impact | P0 |
| FR-AI-003 | User SHALL dismiss insight | P0 |
| FR-AI-004 | Chat interface SHALL invoke agent with book context | P1 |
| FR-AI-005 | Agent proposals SHALL NEVER auto-apply | P0 |
| FR-AI-006 | Work queue view for pending proposals | P1 |
| FR-AI-007 | Agent run history with input/output audit | P1 |
| FR-AI-008 | Executive brief generation from dashboard | P2 |

---

## 13. Module: Activity Log

**View ID:** `activity`  
**Purpose:** User-facing audit trail.

| ID | Requirement | Priority |
|---|---|---|
| FR-ACT-V-001 | Full paginated activity list with filters by book, entity_type | P0 |
| FR-ACT-V-002 | Relative and absolute timestamps | P0 |
| FR-ACT-V-003 | Link activity entry to entity when applicable | P1 |

---

## 14. Cross-Cutting: Work Queue, Search, Notifications

### 14.1 Work Queue (Prototype v0.2)

| ID | Requirement | Priority |
|---|---|---|
| FR-WQ-001 | Unified inbox: approvals, assigned issues, agent proposals | P1 |
| FR-WQ-002 | Approve/reject with comment | P1 |

### 14.2 Global Search / Command Palette

| ID | Requirement | Priority |
|---|---|---|
| FR-SRCH-001 | Cmd+K palette search books, characters, chapters, issues | P2 |
| FR-SRCH-002 | Semantic search over genome (future) | P2 |

### 14.3 Notifications

| ID | Requirement | Priority |
|---|---|---|
| FR-NOTIF-001 | In-app notifications for assignments, approvals needed | P1 |
| FR-NOTIF-002 | Mark read/unread | P1 |
| FR-NOTIF-003 | Email notifications | P2 |

---

## 15. Entity: Universal Record Header

Every entity SHALL implement (from Manual Vol IX):

| Field | Purpose |
|---|---|
| id (UUID) | Permanent identifier |
| record_code | Human-readable ID |
| entity_type | Book, Character, Scene, etc. |
| workspace_id | Tenant |
| book_id | Owning book (where applicable) |
| status | draft → working → review → approved → published → archived |
| version | Integer increment on material change |
| owner_user_id | Responsible user |
| created_at, updated_at | Timestamps |
| approved_by, approved_at | Approval gate |
| genome / metadata JSONB | Extension fields |
| AI fields | ai_summary, ai_completeness, ai_risk, ai_recommendations |
| Analytics fields | reference_count, completeness, change_frequency |

---

## 16. Non-Functional Requirements (User-Facing)

| ID | Requirement | Target |
|---|---|---|
| NFR-PERF-001 | Initial load | <3s on 10 Mbps |
| NFR-PERF-002 | CRUD operations | <500ms p95 |
| NFR-A11Y-001 | WCAG 2.1 AA for core flows | Audit pass |
| NFR-I18N-001 | UTF-8 manuscript storage | Full Unicode |
| NFR-OFFLINE-001 | PWA offline read (future) | Phase 2+ |
| NFR-SEC-001 | RLS on all tenant data | Zero cross-tenant leak |

---

## 17. Requirements Traceability Matrix (Sample)

| BRD ID | FRD IDs | Module | Phase |
|---|---|---|---|
| BR-LC-001 | FR-LC-001–009 | Lifecycle | 2 |
| BR-GEN-001 | FR-GEN-003, FR-CHAR-006 | Genome/Characters | 1 |
| BR-AI-002 | FR-AI-005, FR-AI-006 | AI Center | 5 |
| BR-PROD-001 | FR-PROD-003–006 | Production | 4 |
| BR-PLAT-003 | FR-AUTH-* + RLS policies | Platform | 1 |

---

## 18. Document Control

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-07-19 | Initial FRD |

**Related:** `docs/01-BRD-MANGU-Book-OS.md`, `docs/03-TECH-SPEC-MANGU-Book-OS.md`

---

*End of Functional Requirements Document*
