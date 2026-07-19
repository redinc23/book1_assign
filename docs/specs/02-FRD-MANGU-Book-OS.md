# Functional Requirements Document (FRD)
# MANGU Book Operating System (Book OS)

| Field | Value |
|---|---|
| Document ID | MANGU-FRD-001 |
| Version | 1.0.0 |
| Status | Engineering-Ready |
| Date | 2026-07-19 |
| Owner | Product + Engineering |
| Parent | `01-BRD-MANGU-Book-OS.md` |
| Sibling | `03-TECH-SPEC-MANGU-Book-OS.md` |
| Requirement ID Format | `FR-<DOMAIN>-<NNN>` |

---

## 0. How to Read This FRD

1. Every requirement has a stable ID. Tickets MUST reference IDs.
2. Priority: **P0** (Phase A must), **P1** (Phase B), **P2** (Phase C), **P3** (Phase D), **P4** (Phase E), **P0-CORE** (cross-cutting always).
3. Acceptance criteria are testable. QA writes cases mapped to these checkboxes.
4. Where UI already exists in `src/views/*`, FRD defines the target behavior (prototype features may exceed current UI).
5. Data field lists here are functional; physical schema is in Tech Spec.

### 0.1 Global Functional Invariants
| ID | Invariant |
|---|---|
| INV-01 | SSOT is the database; packets/exports are derived |
| INV-02 | Domain entity IDs are immutable; archive instead of hard-delete (except pure drafts optionally) |
| INV-03 | Every mutating action emits an audit event |
| INV-04 | AI cannot apply L3/L4 mutations without human approval workflow |
| INV-05 | Authorization is workspace-scoped (evolve from user-scoped) |
| INV-06 | Progressive enrichment: required fields depend on milestone |
| INV-07 | Universal record statuses: draft, working, review, approved, published, archived |
| INV-08 | All timestamps stored UTC; UI may localize |

### 0.2 Cross-Cutting Non-Functional Targets (Functional Impact)
Users must perceive autosave, navigation, and list loads as responsive; exact SLAs in Tech Spec. Functionally: never lose manuscript text after acknowledged save; never show another workspace's entities.

---

## 1. Information Architecture & Navigation

### 1.1 Primary Navigation Destinations (Target IA)
| Nav ID | Label | Current View | Target Scope |
|---|---|---|---|
| NAV-DASH | Command Center | `dashboard` | Portfolio + active book health |
| NAV-LIB | Library | `library` | All books in workspace |
| NAV-LIFE | Lifecycle | `lifecycle` | M0–M20 engine |
| NAV-GENOME | Book Genome | `genome` | Structured book DNA |
| NAV-CHAR | Characters | `characters` | Character genome |
| NAV-WORLD | World | *(new)* | Locations, systems |
| NAV-STORY | Story | *(new)* | Acts, beats, subplots |
| NAV-CHAP | Chapters | `chapters` | Chapter planning |
| NAV-SCENE | Scenes | *(new)* | Scene planning |
| NAV-STUDIO | Manuscript Studio | *(new / from prototype)* | Writing surface |
| NAV-CANON | Canon | *(new)* | Canon facts |
| NAV-TIME | Timeline | *(new)* | Timeline events |
| NAV-REL | Relationships | *(new)* | Relationship graph data |
| NAV-GRAPH | Story Graph | *(new / prototype)* | Visual graph |
| NAV-EDIT | Editorial | `editorial` | Issues kanban/table |
| NAV-PROD | Production | `production` | Assets & tasks |
| NAV-MKT | Marketing | `marketing` | Campaigns |
| NAV-RIGHTS | Rights | *(new)* | Rights agreements |
| NAV-SALES | Sales | *(new)* | Sales analytics |
| NAV-AI | AI Center | `ai-center` | Agents & proposals |
| NAV-QUEUE | Work Queue | *(new / prototype)* | Tasks & approvals |
| NAV-ACT | Activity | `activity` | Audit trail |
| NAV-ADMIN | Admin | *(new)* | Workspace settings |

### FR-NAV-001 — App shell with persistent navigation
- **Priority:** P0
- **Module:** MOD-DASH
- **User Story:** As a signed-in user, I can navigate modules without losing active book context.
- **Acceptance Criteria:**
  - [ ] Sidebar lists modules available to my role
  - [ ] Active route/view is visually indicated
  - [ ] Active book remains selected across view changes
  - [ ] Mobile: sidebar collapses; menu toggle works
  - [ ] Unauthorized modules are hidden or disabled with tooltip
- **UI / UX Notes:** Preserve existing AppShell/Sidebar/Topbar patterns; extend nav items progressively.
- **Traceability:** BRD section 6, current AppShell.tsx

### FR-NAV-002 — Active book context switcher
- **Priority:** P0
- **Module:** MOD-LIB
- **User Story:** As a user, I can switch the active book from a global control.
- **Acceptance Criteria:**
  - [ ] Switcher lists books I can access in current workspace
  - [ ] Selecting a book updates all book-scoped views
  - [ ] If no books exist, empty state CTA creates/imports a book
  - [ ] Last selected book persisted per user+workspace
- **Edge Cases:**
  - Deleted/archived active book falls back to next available or empty state

### FR-NAV-003 — Global command palette / search
- **Priority:** P1
- **Module:** MOD-SEARCH
- **User Story:** As a power user, I can jump to any entity or action via keyboard.
- **Acceptance Criteria:**
  - [ ] Shortcut opens palette (Ctrl/Cmd+K)
  - [ ] Search matches title/name/record_code across entity types
  - [ ] Results show type + parent book
  - [ ] Selecting result navigates to entity detail
  - [ ] Actions (Create Character, Run Continuity Check) appear when permitted
- **Traceability:** Prototype command search

### FR-NAV-004 — Breadcrumbs
- **Priority:** P1
- **Module:** MOD-DASH
- **User Story:** As a user, I always know where I am in the hierarchy.
- **Acceptance Criteria:**
  - [ ] Breadcrumbs show Workspace / Book / Module / Entity as applicable
  - [ ] Segments are clickable

---

## 2. Authentication, Tenancy, RBAC

### FR-AUTH-001 — Email/password authentication
- **Priority:** P0
- **Module:** MOD-AUTH
- **User Story:** As a user, I can sign up and sign in securely.
- **Acceptance Criteria:**
  - [ ] Sign-up creates auth user
  - [ ] Sign-in establishes session
  - [ ] Sign-out clears session and private caches
  - [ ] Invalid credentials show safe error
  - [ ] Protected routes redirect unauthenticated users to AuthPage
- **Traceability:** Current AuthContext, AuthPage

### FR-AUTH-002 — Session persistence and refresh
- **Priority:** P0
- **Module:** MOD-AUTH
- **User Story:** As a returning user, I stay signed in until expiry/sign-out.
- **Acceptance Criteria:**
  - [ ] Refresh restores session when valid
  - [ ] Expired session forces re-auth without data corruption

### FR-AUTH-003 — MFA optional then enforceable
- **Priority:** P2
- **Module:** MOD-AUTH
- **User Story:** As an admin, I can require MFA for the organization.
- **Acceptance Criteria:**
  - [ ] Users can enroll MFA
  - [ ] Org policy can require MFA before accessing workspaces
  - [ ] Backup codes or recovery path documented

### FR-ORG-001 — Organization create/bootstrap
- **Priority:** P0
- **Module:** MOD-ORG
- **User Story:** As the first user, I get an Organization + default Workspace on first login if none exist.
- **Acceptance Criteria:**
  - [ ] Bootstrap is idempotent
  - [ ] Creator becomes org admin + workspace admin
  - [ ] Slug uniqueness enforced
- **Business / Functional Rules:**
  - Phase A may use single-org mode but schema must support multi-org

### FR-ORG-002 — Workspace CRUD
- **Priority:** P1
- **Module:** MOD-ORG
- **User Story:** As an admin, I can create workspaces under my organization.
- **Acceptance Criteria:**
  - [ ] Create/rename/archive workspace
  - [ ] Slug unique per org
  - [ ] Archived workspace hidden from default switcher but restorable by admin

### FR-ORG-003 — Membership and invitations
- **Priority:** P0
- **Module:** MOD-RBAC
- **User Story:** As an admin, I can invite users to a workspace with a role.
- **Acceptance Criteria:**
  - [ ] Invite by email
  - [ ] Pending invite can be revoked
  - [ ] Accepting invite grants membership
  - [ ] Users can belong to multiple workspaces
  - [ ] Removing member revokes access immediately

### FR-RBAC-001 — Role assignment
- **Priority:** P0
- **Module:** MOD-RBAC
- **User Story:** As an admin, I assign roles that grant capabilities.
- **Acceptance Criteria:**
  - [ ] Role catalog matches BRD section 10
  - [ ] Capabilities checked server-side (RLS + RPC/Edge)
  - [ ] UI hides actions user cannot perform
  - [ ] Attempting forbidden mutation returns 403-equivalent and toast

### FR-RBAC-002 — Capability overrides
- **Priority:** P2
- **Module:** MOD-RBAC
- **User Story:** As an admin, I can grant extra capabilities to a member without changing their base role.
- **Acceptance Criteria:**
  - [ ] Overrides stored per membership
  - [ ] Effective permissions = role union overrides
  - [ ] Audit log records permission changes

### FR-RBAC-003 — Book-level sharing
- **Priority:** P1
- **Module:** MOD-RBAC
- **User Story:** As a project owner, I can grant a contractor access to one book without whole workspace.
- **Acceptance Criteria:**
  - [ ] Book ACL or project membership table supported
  - [ ] Contractor sees only assigned books and necessary modules
  - [ ] Default remains workspace-wide for house staff

---

## 3. Library and Book Manager

### FR-BOOK-001 — Create book
- **Priority:** P0
- **Module:** MOD-LIB
- **User Story:** As an author/PM, I can create a new book project.
- **Acceptance Criteria:**
  - [ ] Required: title; author defaults to profile name if empty
  - [ ] System assigns UUID and human record_code (e.g., BOOK-000123)
  - [ ] Initial milestone = M0
  - [ ] Initial status = draft
  - [ ] Creates default milestone rows M0–M20 with checklist templates
  - [ ] Emits book.created event
- **Business / Functional Rules:**
  - record_code unique per workspace
  - Never reuse codes

### FR-BOOK-002 — List and filter books
- **Priority:** P0
- **Module:** MOD-LIB
- **User Story:** As a user, I can browse books in my workspace.
- **Acceptance Criteria:**
  - [ ] List shows title, status, milestone, progress, updated_at
  - [ ] Filter by status, milestone, genre, owner
  - [ ] Sort by updated, title, deadline
  - [ ] Search by title/subtitle/code

### FR-BOOK-003 — Edit book identity and commercial seed fields
- **Priority:** P0
- **Module:** MOD-LIB
- **User Story:** As an authorized user, I can edit book fields appropriate to my role.
- **Acceptance Criteria:**
  - [ ] Edits validate types/ranges
  - [ ] Optimistic UI with conflict handling on updated_at mismatch
  - [ ] Changes version bump + event

### FR-BOOK-004 — Archive book
- **Priority:** P0
- **Module:** MOD-LIB
- **User Story:** As an admin/owner, I can archive a book.
- **Acceptance Criteria:**
  - [ ] Archived books excluded from default library
  - [ ] Archived books read-only except unarchive
  - [ ] No hard delete of books with approved/published children

### FR-BOOK-005 — Book progress computation
- **Priority:** P0
- **Module:** MOD-LIB
- **User Story:** As a user, I see meaningful progress not only raw word count.
- **Acceptance Criteria:**
  - [ ] Progress combines word progress + milestone readiness weights (configurable)
  - [ ] Helper is unit-tested (extend existing progressPercent)
  - [ ] Dashboard and library show same number for same book

### FR-BOOK-006 — Series and Universe linkage
- **Priority:** P1
- **Module:** MOD-LIB
- **User Story:** As a user, I can attach a book to a Series and Universe.
- **Acceptance Criteria:**
  - [ ] Series/Universe entities creatable from book form
  - [ ] Inheritance: book can display inherited series themes/brand fields as read-only overlays
  - [ ] Removing series link does not delete series

---

## 4. Book Genome Module

### FR-GEN-001 — Genome editor with progressive sections
- **Priority:** P0
- **Module:** MOD-GENOME
- **User Story:** As an author, I can edit structured Book Genome fields grouped by category.
- **Acceptance Criteria:**
  - [ ] Sections: Identity, Creative, Commercial, Operational, Workflow, AI meta (readouts), Analytics (readouts)
  - [ ] Fields persist to books columns and/or genome JSONB per Tech Spec mapping
  - [ ] Completion percent per section visible
  - [ ] Required-by-milestone indicators shown
- **Traceability:** Manual Vol II, IX, X; view Genome.tsx

### FR-GEN-002 — Commercial positioning fields
- **Priority:** P0
- **Module:** MOD-GENOME
- **User Story:** As marketing/author, I maintain hook, logline, USP, comps, keywords, categories, target price.
- **Acceptance Criteria:**
  - [ ] Fields reusable by Marketing packet generation
  - [ ] Validation: logline max length warning (not hard fail until M14)
  - [ ] Comps stored as structured list not free-text only

### FR-GEN-003 — Genome validation engine
- **Priority:** P1
- **Module:** MOD-GENOME
- **User Story:** As a user, I can see missing required genome fields for current milestone.
- **Acceptance Criteria:**
  - [ ] Validation rules driven by config table/JSON
  - [ ] Blocking vs warning severity distinguished
  - [ ] Results feed milestone readiness

### FR-GEN-004 — Generate Concept / Marketing packets from genome
- **Priority:** P2
- **Module:** MOD-EXPORT
- **User Story:** As a user, I can generate a read-only packet PDF/Markdown from SSOT.
- **Acceptance Criteria:**
  - [ ] Packet never becomes editable source of truth
  - [ ] Regenerate overwrites derived file, not genome
  - [ ] Includes timestamp + book version

---

## 5. Character Manager

### FR-CHAR-001 — CRUD characters
- **Priority:** P0
- **Module:** MOD-CHAR
- **User Story:** As an author, I can create and edit characters for a book.
- **Acceptance Criteria:**
  - [ ] Required: name
  - [ ] record_code unique per book
  - [ ] Supports role, summary, core_wound, core_desire, core_fear, arc, voice_profile, importance 0–100
  - [ ] genome JSONB for extended psychology/appearance fields
  - [ ] List + detail + modal/page edit patterns
  - [ ] Archive supported
- **Traceability:** Characters.tsx, characters migration, Manual Vol XIII

### FR-CHAR-002 — Character psychology layers
- **Priority:** P1
- **Module:** MOD-CHAR
- **User Story:** As an author, I can capture Identity, Psychology, Motivation, Behavior, Narrative layers.
- **Acceptance Criteria:**
  - [ ] UI tabs/sections for layers
  - [ ] Empty fields allowed early; M2 readiness requires core psychology for major characters
  - [ ] Importance threshold defines major (default >=70 or role in protagonist/antagonist/supporting)

### FR-CHAR-003 — Character voice profile
- **Priority:** P1
- **Module:** MOD-CHAR
- **User Story:** As an author/editor, I maintain voice attributes used by Dialogue Coach.
- **Acceptance Criteria:**
  - [ ] Stores vocabulary notes, formality, humor, catchphrases, etc.
  - [ ] Studio inspector can show voice profile for POV character

### FR-CHAR-004 — Character appearance in scenes
- **Priority:** P1
- **Module:** MOD-CHAR
- **User Story:** As a user, I can see which scenes a character appears in.
- **Acceptance Criteria:**
  - [ ] Derived from scene_characters
  - [ ] Click-through to scene

---

## 6. World / Locations

### FR-LOC-001 — CRUD locations
- **Priority:** P1
- **Module:** MOD-WORLD
- **User Story:** As an author, I can manage locations with optional parent hierarchy.
- **Acceptance Criteria:**
  - [ ] Fields: name, type, description, risk, genome JSONB
  - [ ] parent_location_id optional
  - [ ] Cycles in parent hierarchy rejected
  - [ ] record_code unique per book

### FR-LOC-002 — World systems records
- **Priority:** P2
- **Module:** MOD-WORLD
- **User Story:** As an author, I can define magic/technology/culture systems as structured records.
- **Acceptance Criteria:**
  - [ ] Systems link to universe/book
  - [ ] Continuity Guardian can validate against system rules
  - [ ] Contradictions create editorial issues of category continuity

---

## 7. Chapters and Scenes

### FR-CHAP-001 — CRUD chapters with sequence integrity
- **Priority:** P0
- **Module:** MOD-CHAP
- **User Story:** As an author, I can plan chapters ordered by sequence.
- **Acceptance Criteria:**
  - [ ] sequence unique per book
  - [ ] Reorder updates sequences transactionally
  - [ ] Fields: title, purpose, pov, emotional_shift, word_goal, word_count, manuscript, status, metadata
  - [ ] Deleting chapter with scenes requires confirm; scenes reassigned or cascaded per policy (default cascade with warn)
- **Traceability:** Chapters.tsx

### FR-CHAP-002 — Chapter planning completeness
- **Priority:** P1
- **Module:** MOD-CHAP
- **User Story:** As an author at M6, I see whether each chapter has purpose/conflict/POV/hooks.
- **Acceptance Criteria:**
  - [ ] Checklist per chapter
  - [ ] Feeds M6 readiness

### FR-SCENE-001 — CRUD scenes under chapters
- **Priority:** P1
- **Module:** MOD-SCENE
- **User Story:** As an author, I can create scenes as atomic units.
- **Acceptance Criteria:**
  - [ ] sequence unique per chapter
  - [ ] Fields: purpose, goal, conflict, outcome, emotional_shift, location, pov, status, word_count, genome
  - [ ] Participants via scene_characters
  - [ ] Necessity prompt: warn if purpose/goal/conflict empty when status is not planned

### FR-SCENE-002 — Scene necessity validation
- **Priority:** P1
- **Module:** MOD-SCENE
- **User Story:** As an editor, I can list scenes failing necessity questions.
- **Acceptance Criteria:**
  - [ ] Report lists scenes missing who/where/change/why/emotion/plot advance
  - [ ] Can bulk-create editorial issues from failures

### FR-SCENE-003 — Move scene across chapters
- **Priority:** P1
- **Module:** MOD-SCENE
- **User Story:** As an author, I can move a scene to another chapter.
- **Acceptance Criteria:**
  - [ ] Updates chapter_id + sequence
  - [ ] Audit event includes from/to
  - [ ] Word counts roll up correctly

---

## 8. Manuscript Studio

### FR-STU-001 — Three-pane studio layout
- **Priority:** P1
- **Module:** MOD-STUDIO
- **User Story:** As an author, I write in a focused manuscript surface with outline + inspector.
- **Acceptance Criteria:**
  - [ ] Left: chapter list with status
  - [ ] Center: title + manuscript editor
  - [ ] Right: context inspector (POV, characters, location, canon, issues)
  - [ ] Responsive: inspector/outline collapse on smaller screens
- **Traceability:** Prototype studio-shell

### FR-STU-002 — Autosave manuscript
- **Priority:** P1
- **Module:** MOD-STUDIO
- **User Story:** As an author, my words save automatically without disrupting flow.
- **Acceptance Criteria:**
  - [ ] Debounced save (e.g., 500–1500ms)
  - [ ] Save state indicator: saving / saved / error
  - [ ] Conflict detection if another session saved newer version
  - [ ] Offline failure surfaces retry; no silent data loss
  - [ ] word_count recalculated on save

### FR-STU-003 — Writing metrics in studio
- **Priority:** P1
- **Module:** MOD-STUDIO
- **User Story:** As an author, I see words, goal, velocity helpers.
- **Acceptance Criteria:**
  - [ ] Shows chapter word_count / word_goal
  - [ ] Optional session words written
  - [ ] Does not block writing if over/under goal

### FR-STU-004 — Inline continuity hints
- **Priority:** P2
- **Module:** MOD-STUDIO
- **User Story:** As an author, I can request continuity hints for current chapter without leaving studio.
- **Acceptance Criteria:**
  - [ ] Invokes Continuity Guardian as L2 proposal/report
  - [ ] Hints link to canon/timeline entities
  - [ ] No auto-edit of manuscript

---

## 9. Lifecycle and Milestone Engine

### FR-LIFE-001 — Milestone list + detail
- **Priority:** P0
- **Module:** MOD-LIFE
- **User Story:** As a user, I can view M0–M20 for the active book.
- **Acceptance Criteria:**
  - [ ] List shows code, name, status, readiness
  - [ ] Detail shows purpose, checklist, approvers, AI task suggestions
  - [ ] Current milestone highlighted
- **Traceability:** Manual Vol IV; view Lifecycle.tsx; prototype lifecycle

### FR-LIFE-002 — Checklist item toggle
- **Priority:** P0
- **Module:** MOD-LIFE
- **User Story:** As an authorized user, I can complete checklist items.
- **Acceptance Criteria:**
  - [ ] Toggle stores completed_by/at
  - [ ] Readiness recomputed
  - [ ] Event emitted

### FR-LIFE-003 — Advance / reopen milestone
- **Priority:** P0
- **Module:** MOD-LIFE
- **User Story:** As an authorized approver, I can advance the book's current milestone.
- **Acceptance Criteria:**
  - [ ] Soft gates warn; hard gates block per config
  - [ ] Override requires reason + capability milestone.override
  - [ ] Advance writes approved_by/at on milestone
  - [ ] book.current_milestone updates
  - [ ] Reopen allowed; history preserved

### FR-LIFE-004 — Readiness score computation
- **Priority:** P0
- **Module:** MOD-LIFE
- **User Story:** As a user, I trust readiness reflects checklist + validations + critical issues.
- **Acceptance Criteria:**
  - [ ] Score 0–100
  - [ ] Critical open editorial issues cap score or block hard gates
  - [ ] Formula documented in Tech Spec and unit-tested
  - [ ] Displayed on dashboard + lifecycle

### FR-LIFE-005 — Milestone templates per publication type
- **Priority:** P2
- **Module:** MOD-LIFE
- **User Story:** As an admin, I can vary checklists by publication_type.
- **Acceptance Criteria:**
  - [ ] Default book template shipped
  - [ ] Comics/educational templates addable without code change (config)

### FR-LIFE-M0 — Milestone behavior: M0 Market Intelligence
- **Priority:** P0
- **Module:** MOD-LIFE
- **Objective:** Determine whether the publication should exist
- **System SHALL provide checklist items covering:**
  - Market Research Report
  - Genre Analysis
  - Reader Personas
  - Competitive Landscape
  - Comparable Titles
  - Publisher Landscape
  - Sales Trends
  - Emerging Topics
  - Keyword Analysis
  - Retail Categories
  - Pricing Analysis
  - Opportunity Matrix
  - Risk Assessment
- **Exit criteria tracked:**
  - Target audience defined
  - Genre validated
  - Opportunity identified
  - Commercial rationale documented
- **Default approver roles:** Publishing Director, Creative Director, Business Lead
- **Acceptance Criteria:**
  - [ ] M0 appears in lifecycle for every new book
  - [ ] Checklist toggles persist and affect readiness
  - [ ] Suggested AI agents for this milestone are listed in UI (even if agent not yet live)
  - [ ] Gate policy (soft/hard) enforced as configured

### FR-LIFE-M1 — Milestone behavior: M1 Concept Discovery
- **Priority:** P0
- **Module:** MOD-LIFE
- **Objective:** Convert market insight into a publishable concept
- **System SHALL provide checklist items covering:**
  - Working Title
  - One-Sentence Premise
  - Elevator Pitch
  - Genre/Subgenre
  - Audience
  - Core Theme
  - Primary Conflict
  - Narrative Style
  - Estimated Length
  - Target Release Window
- **Exit criteria tracked:**
  - 30-second explainability
  - One-sentence premise
  - Clear reader care reason
- **Default approver roles:** Creative Director, Author
- **Acceptance Criteria:**
  - [ ] M1 appears in lifecycle for every new book
  - [ ] Checklist toggles persist and affect readiness
  - [ ] Suggested AI agents for this milestone are listed in UI (even if agent not yet live)
  - [ ] Gate policy (soft/hard) enforced as configured

### FR-LIFE-M2 — Milestone behavior: M2 Story Foundation
- **Priority:** P0
- **Module:** MOD-LIFE
- **Objective:** Establish emotional engine of the story
- **System SHALL provide checklist items covering:**
  - Protagonist/Antagonist/Supporting Cast
  - Core Wound/Desire/Need/Fear
  - Internal/External Conflict
  - Primary Stakes
  - Transformation
  - Ending Intent
  - Character Matrix
  - Relationship Graph
  - Conflict Matrix
  - Emotional Arc Overview
- **Exit criteria tracked:**
  - Every major character has psychological profile and narrative role
- **Default approver roles:** Author, Developmental Editor
- **Acceptance Criteria:**
  - [ ] M2 appears in lifecycle for every new book
  - [ ] Checklist toggles persist and affect readiness
  - [ ] Suggested AI agents for this milestone are listed in UI (even if agent not yet live)
  - [ ] Gate policy (soft/hard) enforced as configured

### FR-LIFE-M3 — Milestone behavior: M3 Book Genome
- **Priority:** P0
- **Module:** MOD-LIFE
- **Objective:** Populate structured knowledge base
- **System SHALL provide checklist items covering:**
  - Book entity
  - Characters
  - Locations
  - Organizations
  - Objects
  - Themes
  - Timeline
  - Relationships
  - Magic/Technology Systems
  - Story Rules
  - Canon Rules
  - Vocabulary
  - Glossary
- **Exit criteria tracked:**
  - Core entities created
  - No critical orphan records
  - Genome completeness threshold met
- **Default approver roles:** Author, Story Architect
- **Acceptance Criteria:**
  - [ ] M3 appears in lifecycle for every new book
  - [ ] Checklist toggles persist and affect readiness
  - [ ] Suggested AI agents for this milestone are listed in UI (even if agent not yet live)
  - [ ] Gate policy (soft/hard) enforced as configured

### FR-LIFE-M4 — Milestone behavior: M4 Story Architecture
- **Priority:** P1
- **Module:** MOD-LIFE
- **Objective:** Define how the story is told
- **System SHALL provide checklist items covering:**
  - Story Structure
  - Acts
  - Turning Points
  - Midpoint
  - Climax
  - Resolution
  - Subplots
  - Mysteries
  - Reveals
  - Foreshadowing Plan
  - Pacing Strategy
  - Theme Integration
- **Exit criteria tracked:**
  - Every subplot supports central narrative
  - Every reveal has setup
  - Every act ends with meaningful change
- **Default approver roles:** Author, Story Architect, Developmental Editor
- **Acceptance Criteria:**
  - [ ] M4 appears in lifecycle for every new book
  - [ ] Checklist toggles persist and affect readiness
  - [ ] Suggested AI agents for this milestone are listed in UI (even if agent not yet live)
  - [ ] Gate policy (soft/hard) enforced as configured

### FR-LIFE-M5 — Milestone behavior: M5 Outline Development
- **Priority:** P1
- **Module:** MOD-LIFE
- **Objective:** Expand architecture into complete outline
- **System SHALL provide checklist items covering:**
  - Chapter List
  - Chapter Summaries
  - Estimated Word Counts
  - Scene Estimates
  - Character Distribution
  - Timeline Alignment
  - Major Emotional Beats
- **Exit criteria tracked:**
  - Complete chapter outline
  - Estimated length within target band
  - Pacing reviewed
- **Default approver roles:** Author, Editor
- **Acceptance Criteria:**
  - [ ] M5 appears in lifecycle for every new book
  - [ ] Checklist toggles persist and affect readiness
  - [ ] Suggested AI agents for this milestone are listed in UI (even if agent not yet live)
  - [ ] Gate policy (soft/hard) enforced as configured

### FR-LIFE-M6 — Milestone behavior: M6 Chapter Planning
- **Priority:** P1
- **Module:** MOD-LIFE
- **Objective:** Each chapter becomes intentional planning unit
- **System SHALL provide checklist items covering:**
  - Purpose
  - Conflict
  - POV
  - Opening/Ending Hook
  - Themes
  - Characters
  - Locations
  - Target Length
  - Dependencies
  - Status
- **Exit criteria tracked:**
  - Every chapter has clear purpose
  - No filler chapters remain
- **Default approver roles:** Author
- **Acceptance Criteria:**
  - [ ] M6 appears in lifecycle for every new book
  - [ ] Checklist toggles persist and affect readiness
  - [ ] Suggested AI agents for this milestone are listed in UI (even if agent not yet live)
  - [ ] Gate policy (soft/hard) enforced as configured

### FR-LIFE-M7 — Milestone behavior: M7 Scene Planning
- **Priority:** P1
- **Module:** MOD-LIFE
- **Objective:** Scenes become atomic storytelling units
- **System SHALL provide checklist items covering:**
  - Who/Where/What changes
  - Necessity justification
  - Emotional shift
  - Plot advancement
  - POV
  - Location
  - Participants
  - Goal/Conflict/Obstacle/Decision/Outcome
- **Exit criteria tracked:**
  - Every scene answers necessity questions
  - Orphan scenes removed/merged
- **Default approver roles:** Author
- **Acceptance Criteria:**
  - [ ] M7 appears in lifecycle for every new book
  - [ ] Checklist toggles persist and affect readiness
  - [ ] Suggested AI agents for this milestone are listed in UI (even if agent not yet live)
  - [ ] Gate policy (soft/hard) enforced as configured

### FR-LIFE-M8 — Milestone behavior: M8 First Draft
- **Priority:** P0
- **Module:** MOD-LIFE
- **Objective:** Write manuscript from validated structure
- **System SHALL provide checklist items covering:**
  - Chapter manuscripts
  - Scene drafts
  - Writing velocity metrics
  - Quality flags
  - Continuity reminders
  - Voice consistency checks
- **Exit criteria tracked:**
  - Target word count reached or intentional variance approved
  - All planned chapters drafted
- **Default approver roles:** Author
- **Acceptance Criteria:**
  - [ ] M8 appears in lifecycle for every new book
  - [ ] Checklist toggles persist and affect readiness
  - [ ] Suggested AI agents for this milestone are listed in UI (even if agent not yet live)
  - [ ] Gate policy (soft/hard) enforced as configured

### FR-LIFE-M9 — Milestone behavior: M9 Developmental Editing
- **Priority:** P0
- **Module:** MOD-LIFE
- **Objective:** Evaluate story itself
- **System SHALL provide checklist items covering:**
  - Revision Plan
  - Structural Issues
  - Priority Ranking
  - Rewrite Tasks
  - Stakes/Pacing/Character Evolution assessment
- **Exit criteria tracked:**
  - Dev edit pass complete
  - Critical structural issues resolved or deferred with approval
- **Default approver roles:** Developmental Editor, Author
- **Acceptance Criteria:**
  - [ ] M9 appears in lifecycle for every new book
  - [ ] Checklist toggles persist and affect readiness
  - [ ] Suggested AI agents for this milestone are listed in UI (even if agent not yet live)
  - [ ] Gate policy (soft/hard) enforced as configured

### FR-LIFE-M10 — Milestone behavior: M10 Line Editing
- **Priority:** P1
- **Module:** MOD-LIFE
- **Objective:** Improve expression and voice
- **System SHALL provide checklist items covering:**
  - Sentence rhythm notes
  - Dialogue polish
  - Clarity/voice/repetition/flow revisions
- **Exit criteria tracked:**
  - Line edit complete
  - Author acceptance of line changes
- **Default approver roles:** Line Editor, Author
- **Acceptance Criteria:**
  - [ ] M10 appears in lifecycle for every new book
  - [ ] Checklist toggles persist and affect readiness
  - [ ] Suggested AI agents for this milestone are listed in UI (even if agent not yet live)
  - [ ] Gate policy (soft/hard) enforced as configured

### FR-LIFE-M11 — Milestone behavior: M11 Copyediting
- **Priority:** P1
- **Module:** MOD-LIFE
- **Objective:** Technical correctness
- **System SHALL provide checklist items covering:**
  - Grammar/spelling/capitalization
  - Consistency
  - Formatting
  - References
  - Terminology
- **Exit criteria tracked:**
  - Copyedit complete
  - Style guide compliance
- **Default approver roles:** Copy Editor
- **Acceptance Criteria:**
  - [ ] M11 appears in lifecycle for every new book
  - [ ] Checklist toggles persist and affect readiness
  - [ ] Suggested AI agents for this milestone are listed in UI (even if agent not yet live)
  - [ ] Gate policy (soft/hard) enforced as configured

### FR-LIFE-M12 — Milestone behavior: M12 Proofreading
- **Priority:** P1
- **Module:** MOD-LIFE
- **Objective:** Final polish before production
- **System SHALL provide checklist items covering:**
  - Final Approval Checklist
  - Proof Log
  - Error Report
  - Publication Sign-Off
- **Exit criteria tracked:**
  - Zero open critical proof issues
  - Sign-off recorded
- **Default approver roles:** Proofreader, Managing Editor
- **Acceptance Criteria:**
  - [ ] M12 appears in lifecycle for every new book
  - [ ] Checklist toggles persist and affect readiness
  - [ ] Suggested AI agents for this milestone are listed in UI (even if agent not yet live)
  - [ ] Gate policy (soft/hard) enforced as configured

### FR-LIFE-M13 — Milestone behavior: M13 Production
- **Priority:** P0
- **Module:** MOD-LIFE
- **Objective:** Manuscript becomes products
- **System SHALL provide checklist items covering:**
  - Print Interior
  - eBook
  - Audiobook Script
  - Cover Files
  - Marketing Images
  - Metadata
  - Retail Files
  - ISBN Assignment
  - Distribution Package
  - Accessibility report
- **Exit criteria tracked:**
  - Production readiness 100%
  - All product formats approved
- **Default approver roles:** Production Manager, Designer
- **Acceptance Criteria:**
  - [ ] M13 appears in lifecycle for every new book
  - [ ] Checklist toggles persist and affect readiness
  - [ ] Suggested AI agents for this milestone are listed in UI (even if agent not yet live)
  - [ ] Gate policy (soft/hard) enforced as configured

### FR-LIFE-M14 — Milestone behavior: M14 Marketing Preparation
- **Priority:** P1
- **Module:** MOD-LIFE
- **Objective:** Prepare go-to-market
- **System SHALL provide checklist items covering:**
  - Brand Messaging
  - Author Bio
  - Press Kit
  - Cover Reveal Plan
  - Social Calendar
  - Email Campaign
  - ARC List
  - Influencer Outreach
  - Media Targets
  - Advertising Plan
- **Exit criteria tracked:**
  - Campaign plan approved
  - Assets ready
  - Calendar scheduled
- **Default approver roles:** Marketing Manager
- **Acceptance Criteria:**
  - [ ] M14 appears in lifecycle for every new book
  - [ ] Checklist toggles persist and affect readiness
  - [ ] Suggested AI agents for this milestone are listed in UI (even if agent not yet live)
  - [ ] Gate policy (soft/hard) enforced as configured

### FR-LIFE-M15 — Milestone behavior: M15 Pre-Launch
- **Priority:** P0
- **Module:** MOD-LIFE
- **Objective:** Final readiness review
- **System SHALL provide checklist items covering:**
  - Files uploaded
  - Retail metadata complete
  - Pricing approved
  - Marketing scheduled
  - Review copies distributed
  - Website updated
  - Newsletter prepared
  - Launch events confirmed
- **Exit criteria tracked:**
  - Pre-launch checklist 100%
- **Default approver roles:** Publisher, Project Manager
- **Acceptance Criteria:**
  - [ ] M15 appears in lifecycle for every new book
  - [ ] Checklist toggles persist and affect readiness
  - [ ] Suggested AI agents for this milestone are listed in UI (even if agent not yet live)
  - [ ] Gate policy (soft/hard) enforced as configured

### FR-LIFE-M16 — Milestone behavior: M16 Publication
- **Priority:** P0
- **Module:** MOD-LIFE
- **Objective:** Launch and operational tracking
- **System SHALL provide checklist items covering:**
  - Sales
  - Downloads
  - Rankings
  - Reviews
  - Inventory
  - Returns
  - Advertising Performance
  - Media Mentions
  - Reader Feedback
- **Exit criteria tracked:**
  - Live on target retailers
  - Monitoring dashboards active
- **Default approver roles:** Publisher, Sales Manager
- **Acceptance Criteria:**
  - [ ] M16 appears in lifecycle for every new book
  - [ ] Checklist toggles persist and affect readiness
  - [ ] Suggested AI agents for this milestone are listed in UI (even if agent not yet live)
  - [ ] Gate policy (soft/hard) enforced as configured

### FR-LIFE-M17 — Milestone behavior: M17 Post-Launch
- **Priority:** P1
- **Module:** MOD-LIFE
- **Objective:** Analyze outcomes and iterate
- **System SHALL provide checklist items covering:**
  - Audience reach analysis
  - Channel performance
  - Recurring feedback themes
  - Conversion asset review
  - Edition update recommendations
- **Exit criteria tracked:**
  - Post-launch report approved
  - Learnings logged to organizational memory
- **Default approver roles:** Marketing Manager, Publisher
- **Acceptance Criteria:**
  - [ ] M17 appears in lifecycle for every new book
  - [ ] Checklist toggles persist and affect readiness
  - [ ] Suggested AI agents for this milestone are listed in UI (even if agent not yet live)
  - [ ] Gate policy (soft/hard) enforced as configured

### FR-LIFE-M18 — Milestone behavior: M18 Catalog Growth
- **Priority:** P1
- **Module:** MOD-LIFE
- **Objective:** Expand from single title to catalog asset
- **System SHALL provide checklist items covering:**
  - Series expansion
  - Translations
  - Large-print/Special editions
  - Audiobooks
  - Companion guides
  - Educational materials
  - Merchandise
  - Licensing
  - Cross-promotions
- **Exit criteria tracked:**
  - Growth initiatives linked to original project
  - Rights/assets connected
- **Default approver roles:** Portfolio Manager, Rights Manager
- **Acceptance Criteria:**
  - [ ] M18 appears in lifecycle for every new book
  - [ ] Checklist toggles persist and affect readiness
  - [ ] Suggested AI agents for this milestone are listed in UI (even if agent not yet live)
  - [ ] Gate policy (soft/hard) enforced as configured

### FR-LIFE-M19 — Milestone behavior: M19 Franchise Expansion
- **Priority:** P1
- **Module:** MOD-LIFE
- **Objective:** IP ecosystem expansion
- **System SHALL provide checklist items covering:**
  - Sequels/Prequels/Spin-offs
  - Graphic novels/Comics
  - Interactive editions
  - Film/TV adaptations
  - Podcasts
  - Games
  - Educational curricula
- **Exit criteria tracked:**
  - Related projects share Universe/Series/Characters/Rights records
- **Default approver roles:** Executive, Rights Manager
- **Acceptance Criteria:**
  - [ ] M19 appears in lifecycle for every new book
  - [ ] Checklist toggles persist and affect readiness
  - [ ] Suggested AI agents for this milestone are listed in UI (even if agent not yet live)
  - [ ] Gate policy (soft/hard) enforced as configured

### FR-LIFE-M20 — Milestone behavior: M20 Legacy Management
- **Priority:** P1
- **Module:** MOD-LIFE
- **Objective:** Long-term IP stewardship
- **System SHALL provide checklist items covering:**
  - Rights renewals
  - New editions
  - Metadata refreshes
  - Accessibility improvements
  - Archival storage
  - Sales trend analysis
  - Historical documentation
  - Canon management
  - Estate planning
- **Exit criteria tracked:**
  - Renewal calendar active
  - Canonical archive integrity verified
- **Default approver roles:** Rights Manager, Publisher
- **Acceptance Criteria:**
  - [ ] M20 appears in lifecycle for every new book
  - [ ] Checklist toggles persist and affect readiness
  - [ ] Suggested AI agents for this milestone are listed in UI (even if agent not yet live)
  - [ ] Gate policy (soft/hard) enforced as configured

---

## 10. Relationships, Timeline, Canon, Graph

### FR-REL-001 — CRUD typed relationships
- **Priority:** P1
- **Module:** MOD-REL
- **User Story:** As an author, I can define relationships between entities.
- **Acceptance Criteria:**
  - [ ] source_type/source_id + target_type/target_id + relationship_type
  - [ ] strength/confidence 0–100
  - [ ] effective_from/to optional
  - [ ] evidence text optional
  - [ ] Prevents exact duplicate active edges (configurable)

### FR-TIME-001 — CRUD timeline events
- **Priority:** P1
- **Module:** MOD-TIME
- **User Story:** As an author, I maintain chronological truth.
- **Acceptance Criteria:**
  - [ ] Supports absolute_time and/or relative_time
  - [ ] Links to location and characters via metadata or join
  - [ ] Importance + canon_status fields
  - [ ] Timeline view sorted intelligently (absolute first, then relative ordering tools)

### FR-CANON-001 — CRUD canon facts with supersession
- **Priority:** P1
- **Module:** MOD-CANON
- **User Story:** As an editor, I manage canon facts that AI and humans must respect.
- **Acceptance Criteria:**
  - [ ] domain + fact required
  - [ ] confidence 0–100
  - [ ] supersedes_id supported
  - [ ] Approving a fact may auto-archive superseded
  - [ ] Cannot hard-delete approved canon; archive only

### FR-CANON-002 — Integrity report
- **Priority:** P1
- **Module:** MOD-CANON
- **User Story:** As an editor, I can run an integrity report for a book.
- **Acceptance Criteria:**
  - [ ] Checks: orphan scenes, characters without role, timeline contradictions (ruleset v1), unresolved critical issues
  - [ ] Produces score + checklist
  - [ ] Can create issues from failed checks
- **Traceability:** Prototype integrity-summary

### FR-GRAPH-001 — Visual story knowledge graph
- **Priority:** P1
- **Module:** MOD-GRAPH
- **User Story:** As a user, I can explore entities and relationships visually.
- **Acceptance Criteria:**
  - [ ] Nodes for book/characters/locations/canon (minimum)
  - [ ] Edges from relationships + structural contains edges
  - [ ] Click node opens entity
  - [ ] Filter by type
  - [ ] Performance acceptable for <=2k nodes initially (pagination/clustering beyond)

### FR-GRAPH-002 — Impact analysis
- **Priority:** P2
- **Module:** MOD-GRAPH
- **User Story:** As an editor, I can see impact of changing an entity.
- **Acceptance Criteria:**
  - [ ] Given character/location, list dependent scenes/chapters/relationships/canon
  - [ ] Used before destructive edits

---

## 11. Editorial Intelligence

### FR-EDIT-001 — Editorial issue CRUD + kanban
- **Priority:** P0
- **Module:** MOD-EDIT
- **User Story:** As an editor, I track issues through a workflow board.
- **Acceptance Criteria:**
  - [ ] Columns minimally: open, assigned/in progress, review, resolved (exact labels configurable)
  - [ ] Fields: title, category, severity, description, suggested_fix, assignee, links to chapter/scene/character
  - [ ] Severity: low|medium|high|critical
  - [ ] resolved_at set on resolve; root_cause/lesson_learned/resolution captured
  - [ ] Filters by severity/category/assignee
- **Traceability:** Manual Vol VI; Editorial.tsx; prototype kanban

### FR-EDIT-002 — Issue categories
- **Priority:** P0
- **Module:** MOD-EDIT
- **User Story:** As an editor, I classify issues for analytics.
- **Acceptance Criteria:**
  - [ ] Categories include at least: plot, character, pacing, continuity, style, sensitivity, factual, production, metadata, other
  - [ ] Admin can extend category list

### FR-EDIT-003 — Critical issues block hard gates
- **Priority:** P0
- **Module:** MOD-EDIT
- **User Story:** As a publisher, critical unresolved issues prevent publication gates.
- **Acceptance Criteria:**
  - [ ] M12/M15/M16 hard gates query open critical issues
  - [ ] UI explains blockers with links

### FR-EDIT-004 — Editorial quality score
- **Priority:** P2
- **Module:** MOD-EDIT
- **User Story:** As a managing editor, I see editorial health score.
- **Acceptance Criteria:**
  - [ ] Derived from open issues weighted by severity + age
  - [ ] Shown on dashboard

### FR-EDIT-005 — Revision history linkage
- **Priority:** P1
- **Module:** MOD-EDIT
- **User Story:** As an editor, I can link an issue to entity versions / manuscript snapshots.
- **Acceptance Criteria:**
  - [ ] Optional links stored in metadata
  - [ ] History visible on issue detail

---

## 12. Production, Assets, ISBN/Metadata

### FR-PROD-001 — Production task tracking
- **Priority:** P0
- **Module:** MOD-PROD
- **User Story:** As production staff, I track production tasks per book.
- **Acceptance Criteria:**
  - [ ] CRUD tasks with status, due, assignee, category
  - [ ] Visible in Production view
  - [ ] Overdue highlighting
- **Traceability:** production_tasks table, Production.tsx

### FR-PROD-002 — Asset registry
- **Priority:** P2
- **Module:** MOD-ASSETS
- **User Story:** As production/design, I register versioned assets.
- **Acceptance Criteria:**
  - [ ] Upload to private storage bucket
  - [ ] Fields: name, asset_type, format, version, checksum, status, metadata
  - [ ] Approve asset with approved_by/at
  - [ ] Cannot delete approved assets without archive capability
  - [ ] Cover current pointer configurable per book

### FR-PROD-003 — Preflight checklist
- **Priority:** P2
- **Module:** MOD-PROD
- **User Story:** As production lead, I run preflight before M13 exit.
- **Acceptance Criteria:**
  - [ ] Checks presence of required assets/formats
  - [ ] Metadata completeness
  - [ ] Accessibility checklist items
  - [ ] Results feed production readiness percent

### FR-PROD-004 — ISBN and retail metadata package
- **Priority:** P2
- **Module:** MOD-PROD
- **User Story:** As production/metadata specialist, I manage ISBN/ASIN and export retailer metadata draft.
- **Acceptance Criteria:**
  - [ ] ISBN uniqueness validation within org
  - [ ] Export package generated from SSOT fields
  - [ ] Human verification required before mark-as-published metadata

---

## 13. Marketing, Rights, Sales

### FR-MKT-001 — Marketing items / campaigns
- **Priority:** P0
- **Module:** MOD-MKT
- **User Story:** As marketing, I plan and track go-to-market activities.
- **Acceptance Criteria:**
  - [ ] Phase A: marketing_items CRUD (title, channel, status, reach, date)
  - [ ] Phase C: full campaigns with budget, KPIs JSON, schedule, progress
  - [ ] Link to book genome messaging fields as read-only reference
- **Traceability:** Marketing.tsx

### FR-MKT-002 — Campaign KPI capture
- **Priority:** P2
- **Module:** MOD-MKT
- **User Story:** As marketing, I record CTR/conversion/revenue/ROI/lessons.
- **Acceptance Criteria:**
  - [ ] KPI fields persist
  - [ ] Post-launch report can pull campaign lessons into org memory

### FR-RIGHTS-001 — Rights agreement registry
- **Priority:** P2
- **Module:** MOD-RIGHTS
- **User Story:** As rights manager, I track rights as assets.
- **Acceptance Criteria:**
  - [ ] Type, owner, territory, language, exclusivity, start/end, renewal, revenue, status, restrictions
  - [ ] Renewal alerts at configurable thresholds (e.g., 30/60/90 days)
  - [ ] L4 actions for contract approval

### FR-SALES-001 — Sales import and dashboard
- **Priority:** P2
- **Module:** MOD-SALES
- **User Story:** As sales manager, I import sales and view performance.
- **Acceptance Criteria:**
  - [ ] CSV import with validation
  - [ ] Daily/period aggregates
  - [ ] Per-retailer breakdown
  - [ ] Feeds M16/M17 dashboards

---

## 14. Work Queue, Approvals, Notifications, Decisions

### FR-QUEUE-001 — Unified work queue
- **Priority:** P1
- **Module:** MOD-QUEUE
- **User Story:** As a team member, I see my tasks and waiting approvals.
- **Acceptance Criteria:**
  - [ ] Columns: now / next / waiting / done (or equivalent)
  - [ ] Sources: editorial assignments, milestone approvals, AI proposals, production tasks
  - [ ] Click-through to entity

### FR-APPR-001 — Generic approval object
- **Priority:** P1
- **Module:** MOD-QUEUE
- **User Story:** As an approver, I can approve/reject change requests with rationale.
- **Acceptance Criteria:**
  - [ ] Works for AI proposals, milestone exits, asset approvals, metadata publish
  - [ ] Records actor, timestamp, decision, note
  - [ ] Rejected items notify requester

### FR-NOTIF-001 — In-app notifications
- **Priority:** P1
- **Module:** MOD-NOTIF
- **User Story:** As a user, I receive relevant notifications.
- **Acceptance Criteria:**
  - [ ] Unread badge
  - [ ] Mark read
  - [ ] Types: assignment, approval required, gate blocked, rights expiry, agent completed
  - [ ] Users can configure subscriptions (P2)

### FR-DEC-001 — Decision log
- **Priority:** P1
- **Module:** MOD-AUDIT
- **User Story:** As a publisher, I record important decisions with rationale.
- **Acceptance Criteria:**
  - [ ] CRUD decisions linked to book
  - [ ] Approval optional
  - [ ] Searchable in activity

---

## 15. AI Center and ADK (Functional)

### FR-AI-001 — AI Center hub
- **Priority:** P0
- **Module:** MOD-AI
- **User Story:** As a user, I can see insights/proposals relevant to the active book.
- **Acceptance Criteria:**
  - [ ] Phase A may keep heuristic insights (current AiCenter) clearly labeled as non-model
  - [ ] Phase D replaces/extends with live agent runs
  - [ ] Dismissed insights persist per user
- **Traceability:** AiCenter.tsx

### FR-AI-002 — Agent catalog UI
- **Priority:** P3
- **Module:** MOD-AI
- **User Story:** As a user, I can browse available agents, their role, and governance level.
- **Acceptance Criteria:**
  - [ ] Shows all BRD agents with status (available/coming soon)
  - [ ] Explains permissions and typical outputs

### FR-AI-003 — Start agent run
- **Priority:** P3
- **Module:** MOD-AI
- **User Story:** As an authorized user, I can start a specialist agent with scoped context.
- **Acceptance Criteria:**
  - [ ] Select agent + book (+ optional entity scope)
  - [ ] System assembles grounded context from SSOT (genome, entities, style guide)
  - [ ] Run status: queued, running, awaiting_approval, completed, failed
  - [ ] Output stored in agent_runs
  - [ ] Cost/token metadata stored

### FR-AI-004 — Proposal workflow
- **Priority:** P3
- **Module:** MOD-AI
- **User Story:** As a human, I review AI proposals before SSOT mutation.
- **Acceptance Criteria:**
  - [ ] Proposal shows diff/summary/evidence links
  - [ ] Actions: accept, accept-with-edits, reject
  - [ ] Accept applies tool mutations transactionally
  - [ ] Reject stores reason; no SSOT change
  - [ ] L1 outputs may skip proposal if marked informational

### FR-AI-005 — Multi-agent orchestration
- **Priority:** P3
- **Module:** MOD-AI
- **User Story:** As Executive Publisher agent (or user), I can run sequenced specialist workflows.
- **Acceptance Criteria:**
  - [ ] Playbooks: e.g., M1 Concept Pack, Continuity Sweep, Pre-Launch Readiness
  - [ ] Each step logged
  - [ ] Failure policy: stop or continue with gaps

### FR-AI-006 — Human governance enforcement
- **Priority:** P0-CORE
- **Module:** MOD-AI
- **User Story:** As the system, I prevent unauthorized AI writes.
- **Acceptance Criteria:**
  - [ ] Server-side enforcement; UI alone insufficient
  - [ ] Service role tools still record requested_by/approved_by
  - [ ] Attempts without approval fail closed

### FR-AI-AGENT-EXECUTIVE_PUBLISHER — Executive Publisher AI
- **Priority:** P3
- **Default governance:** L3
- **Purpose:** Orchestra conductor; portfolio health, milestone tracking, decision routing, risk, prioritization
- **Acceptance Criteria:**
  - [ ] Agent registered in agent registry with version
  - [ ] Allowed tools declared and enforced
  - [ ] Grounded only on authorized knowledge sources
  - [ ] Produces structured output schema validated before storage
  - [ ] Eval cases exist for happy path + hallucination catch
  - [ ] UI entry point from AI Center and relevant milestone suggestions

### FR-AI-AGENT-MARKET_INTELLIGENCE — Market Intelligence Agent
- **Priority:** P3
- **Default governance:** L2
- **Purpose:** Bestsellers, niches, sentiment, demand, pricing, SWOT, opportunity scoring
- **Acceptance Criteria:**
  - [ ] Agent registered in agent registry with version
  - [ ] Allowed tools declared and enforced
  - [ ] Grounded only on authorized knowledge sources
  - [ ] Produces structured output schema validated before storage
  - [ ] Eval cases exist for happy path + hallucination catch
  - [ ] UI entry point from AI Center and relevant milestone suggestions

### FR-AI-AGENT-CONCEPT_ARCHITECT — Concept Architect
- **Priority:** P3
- **Default governance:** L2
- **Purpose:** Working title, hook, logline, USP, genre, audience, comps, series potential
- **Acceptance Criteria:**
  - [ ] Agent registered in agent registry with version
  - [ ] Allowed tools declared and enforced
  - [ ] Grounded only on authorized knowledge sources
  - [ ] Produces structured output schema validated before storage
  - [ ] Eval cases exist for happy path + hallucination catch
  - [ ] UI entry point from AI Center and relevant milestone suggestions

### FR-AI-AGENT-STORY_ARCHITECT — Story Architect
- **Priority:** P3
- **Default governance:** L2
- **Purpose:** Structure systems, beat maps, pacing, subplots, ending design
- **Acceptance Criteria:**
  - [ ] Agent registered in agent registry with version
  - [ ] Allowed tools declared and enforced
  - [ ] Grounded only on authorized knowledge sources
  - [ ] Produces structured output schema validated before storage
  - [ ] Eval cases exist for happy path + hallucination catch
  - [ ] UI entry point from AI Center and relevant milestone suggestions

### FR-AI-AGENT-CHARACTER_PSYCHOLOGIST — Character Psychologist
- **Priority:** P3
- **Default governance:** L2
- **Purpose:** Trauma, attachment, motivations, behavior, speech, growth, relationships
- **Acceptance Criteria:**
  - [ ] Agent registered in agent registry with version
  - [ ] Allowed tools declared and enforced
  - [ ] Grounded only on authorized knowledge sources
  - [ ] Produces structured output schema validated before storage
  - [ ] Eval cases exist for happy path + hallucination catch
  - [ ] UI entry point from AI Center and relevant milestone suggestions

### FR-AI-AGENT-WORLD_BUILDER — World Builder
- **Priority:** P3
- **Default governance:** L2
- **Purpose:** History, politics, economics, religion, tech/magic, culture; contradiction detection
- **Acceptance Criteria:**
  - [ ] Agent registered in agent registry with version
  - [ ] Allowed tools declared and enforced
  - [ ] Grounded only on authorized knowledge sources
  - [ ] Produces structured output schema validated before storage
  - [ ] Eval cases exist for happy path + hallucination catch
  - [ ] UI entry point from AI Center and relevant milestone suggestions

### FR-AI-AGENT-PLOT_ENGINEER — Plot Engineer
- **Priority:** P3
- **Default governance:** L2
- **Purpose:** Scene necessity, tension, conflict evolution, pacing, plot health score
- **Acceptance Criteria:**
  - [ ] Agent registered in agent registry with version
  - [ ] Allowed tools declared and enforced
  - [ ] Grounded only on authorized knowledge sources
  - [ ] Produces structured output schema validated before storage
  - [ ] Eval cases exist for happy path + hallucination catch
  - [ ] UI entry point from AI Center and relevant milestone suggestions

### FR-AI-AGENT-CHAPTER_PLANNER — Chapter Planner
- **Priority:** P3
- **Default governance:** L2
- **Purpose:** Purpose, summary, word goal, conflict, POV, hooks, themes, timeline
- **Acceptance Criteria:**
  - [ ] Agent registered in agent registry with version
  - [ ] Allowed tools declared and enforced
  - [ ] Grounded only on authorized knowledge sources
  - [ ] Produces structured output schema validated before storage
  - [ ] Eval cases exist for happy path + hallucination catch
  - [ ] UI entry point from AI Center and relevant milestone suggestions

### FR-AI-AGENT-SCENE_DIRECTOR — Scene Director
- **Priority:** P3
- **Default governance:** L2
- **Purpose:** Per-scene characters, location, conflict, dialogue, emotion, transitions
- **Acceptance Criteria:**
  - [ ] Agent registered in agent registry with version
  - [ ] Allowed tools declared and enforced
  - [ ] Grounded only on authorized knowledge sources
  - [ ] Produces structured output schema validated before storage
  - [ ] Eval cases exist for happy path + hallucination catch
  - [ ] UI entry point from AI Center and relevant milestone suggestions

### FR-AI-AGENT-DIALOGUE_COACH — Dialogue Coach
- **Priority:** P3
- **Default governance:** L2
- **Purpose:** Per-character voice models; vocabulary, formality, slang, evolution
- **Acceptance Criteria:**
  - [ ] Agent registered in agent registry with version
  - [ ] Allowed tools declared and enforced
  - [ ] Grounded only on authorized knowledge sources
  - [ ] Produces structured output schema validated before storage
  - [ ] Eval cases exist for happy path + hallucination catch
  - [ ] UI entry point from AI Center and relevant milestone suggestions

### FR-AI-AGENT-DEVELOPMENTAL_EDITOR — Developmental Editor AI
- **Priority:** P3
- **Default governance:** L2
- **Purpose:** Diagnose story/characters/pacing/structure/engagement without rewriting
- **Acceptance Criteria:**
  - [ ] Agent registered in agent registry with version
  - [ ] Allowed tools declared and enforced
  - [ ] Grounded only on authorized knowledge sources
  - [ ] Produces structured output schema validated before storage
  - [ ] Eval cases exist for happy path + hallucination catch
  - [ ] UI entry point from AI Center and relevant milestone suggestions

### FR-AI-AGENT-CONTINUITY_GUARDIAN — Continuity Guardian
- **Priority:** P3
- **Default governance:** L2
- **Purpose:** Timeline, objects, knowledge, ages, travel, canon, magic/tech rules
- **Acceptance Criteria:**
  - [ ] Agent registered in agent registry with version
  - [ ] Allowed tools declared and enforced
  - [ ] Grounded only on authorized knowledge sources
  - [ ] Produces structured output schema validated before storage
  - [ ] Eval cases exist for happy path + hallucination catch
  - [ ] UI entry point from AI Center and relevant milestone suggestions

### FR-AI-AGENT-COPY_EDITOR — Copy Editor
- **Priority:** P3
- **Default governance:** L2
- **Purpose:** Grammar, formatting, capitalization, consistency, house style, readability
- **Acceptance Criteria:**
  - [ ] Agent registered in agent registry with version
  - [ ] Allowed tools declared and enforced
  - [ ] Grounded only on authorized knowledge sources
  - [ ] Produces structured output schema validated before storage
  - [ ] Eval cases exist for happy path + hallucination catch
  - [ ] UI entry point from AI Center and relevant milestone suggestions

### FR-AI-AGENT-FACT_CHECKER — Fact Checker
- **Priority:** P3
- **Default governance:** L2
- **Purpose:** Research DB, historical/scientific/legal/medical, internal canon
- **Acceptance Criteria:**
  - [ ] Agent registered in agent registry with version
  - [ ] Allowed tools declared and enforced
  - [ ] Grounded only on authorized knowledge sources
  - [ ] Produces structured output schema validated before storage
  - [ ] Eval cases exist for happy path + hallucination catch
  - [ ] UI entry point from AI Center and relevant milestone suggestions

### FR-AI-AGENT-PRODUCTION_COORDINATOR — Production Coordinator
- **Priority:** P3
- **Default governance:** L3
- **Purpose:** Cover/interior/illustrations/ISBN/metadata/uploads/accessibility/approvals
- **Acceptance Criteria:**
  - [ ] Agent registered in agent registry with version
  - [ ] Allowed tools declared and enforced
  - [ ] Grounded only on authorized knowledge sources
  - [ ] Produces structured output schema validated before storage
  - [ ] Eval cases exist for happy path + hallucination catch
  - [ ] UI entry point from AI Center and relevant milestone suggestions

### FR-AI-AGENT-MARKETING_STRATEGIST — Marketing Strategist
- **Priority:** P3
- **Default governance:** L2
- **Purpose:** Launch plans, calendars, BookTok, influencers, ads, personas, pricing experiments
- **Acceptance Criteria:**
  - [ ] Agent registered in agent registry with version
  - [ ] Allowed tools declared and enforced
  - [ ] Grounded only on authorized knowledge sources
  - [ ] Produces structured output schema validated before storage
  - [ ] Eval cases exist for happy path + hallucination catch
  - [ ] UI entry point from AI Center and relevant milestone suggestions

### FR-AI-AGENT-METADATA_SPECIALIST — Metadata Specialist
- **Priority:** P3
- **Default governance:** L3
- **Purpose:** Amazon/Apple/Google/Kobo/Ingram/libraries; SEO, keywords, BISAC, THEMA
- **Acceptance Criteria:**
  - [ ] Agent registered in agent registry with version
  - [ ] Allowed tools declared and enforced
  - [ ] Grounded only on authorized knowledge sources
  - [ ] Produces structured output schema validated before storage
  - [ ] Eval cases exist for happy path + hallucination catch
  - [ ] UI entry point from AI Center and relevant milestone suggestions

### FR-AI-AGENT-RIGHTS_MANAGER — Rights Manager
- **Priority:** P3
- **Default governance:** L3
- **Purpose:** Translations, film/TV, audio, merch, licensing, renewals, contracts, royalties
- **Acceptance Criteria:**
  - [ ] Agent registered in agent registry with version
  - [ ] Allowed tools declared and enforced
  - [ ] Grounded only on authorized knowledge sources
  - [ ] Produces structured output schema validated before storage
  - [ ] Eval cases exist for happy path + hallucination catch
  - [ ] UI entry point from AI Center and relevant milestone suggestions

### FR-AI-AGENT-SALES_ANALYST — Sales Analyst
- **Priority:** P3
- **Default governance:** L2
- **Purpose:** Daily sales, ad ROI, reviews, regional performance, elasticity, forecasts
- **Acceptance Criteria:**
  - [ ] Agent registered in agent registry with version
  - [ ] Allowed tools declared and enforced
  - [ ] Grounded only on authorized knowledge sources
  - [ ] Produces structured output schema validated before storage
  - [ ] Eval cases exist for happy path + hallucination catch
  - [ ] UI entry point from AI Center and relevant milestone suggestions

### FR-AI-AGENT-PORTFOLIO_MANAGER — Portfolio Manager
- **Priority:** P3
- **Default governance:** L2
- **Purpose:** Cross-catalog: genres, authors, sequels, translations, franchise potential
- **Acceptance Criteria:**
  - [ ] Agent registered in agent registry with version
  - [ ] Allowed tools declared and enforced
  - [ ] Grounded only on authorized knowledge sources
  - [ ] Produces structured output schema validated before storage
  - [ ] Eval cases exist for happy path + hallucination catch
  - [ ] UI entry point from AI Center and relevant milestone suggestions

### FR-AI-AGENT-EXECUTIVE_COPILOT — Executive Copilot
- **Priority:** P3
- **Default governance:** L1
- **Purpose:** Daily executive briefing across portfolio, risks, deadlines, opportunities
- **Acceptance Criteria:**
  - [ ] Agent registered in agent registry with version
  - [ ] Allowed tools declared and enforced
  - [ ] Grounded only on authorized knowledge sources
  - [ ] Produces structured output schema validated before storage
  - [ ] Eval cases exist for happy path + hallucination catch
  - [ ] UI entry point from AI Center and relevant milestone suggestions

---

## 16. Versioning, Snapshots, Import/Export

### FR-VER-001 — Entity version snapshots
- **Priority:** P1
- **Module:** MOD-VER
- **User Story:** As a user, I can view prior versions of key entities.
- **Acceptance Criteria:**
  - [ ] Versions created on significant updates and on demand
  - [ ] Diff summary optional
  - [ ] Restore requires permission and creates new version (no history rewrite)

### FR-VER-002 — Project snapshot export/import
- **Priority:** P1
- **Module:** MOD-EXPORT
- **User Story:** As a user, I can snapshot an entire book package and restore.
- **Acceptance Criteria:**
  - [ ] Export JSON package with schema version
  - [ ] Import validates schema
  - [ ] Restore into workspace as new book or overwrite with confirm
  - [ ] Used for migration from prototype
- **Traceability:** Prototype snapshots

### FR-EXP-001 — Packet generation
- **Priority:** P2
- **Module:** MOD-EXPORT
- **User Story:** As a user, I can generate Character Bible, World Guide, Marketing Brief, Editorial Report from SSOT.
- **Acceptance Criteria:**
  - [ ] Templates listed in UI
  - [ ] Output Markdown/PDF
  - [ ] Includes generation timestamp + entity versions

---

## 17. Activity, Audit, Search

### FR-AUD-001 — Activity feed
- **Priority:** P0
- **Module:** MOD-AUDIT
- **User Story:** As a user, I can see recent actions on books I access.
- **Acceptance Criteria:**
  - [ ] Shows actor, action, target, timestamp
  - [ ] Filter by book/entity type
  - [ ] Immutable append-only events
- **Traceability:** Activity.tsx, activity_log

### FR-AUD-002 — Security audit fields
- **Priority:** P0-CORE
- **Module:** MOD-AUDIT
- **User Story:** As an admin, I can trace who approved publication/rights/AI applies.
- **Acceptance Criteria:**
  - [ ] Approval events include previous/new state
  - [ ] Exports of audit log available to admin (P2)

### FR-SEARCH-001 — Workspace search API
- **Priority:** P1
- **Module:** MOD-SEARCH
- **User Story:** As a user, I can search entities by keyword.
- **Acceptance Criteria:**
  - [ ] Indexes titles/names/codes/descriptions
  - [ ] Respects RLS
  - [ ] P3: semantic search queries over embeddings

---

## 18. Administration and Automations

### FR-ADMIN-001 — Workspace settings
- **Priority:** P1
- **Module:** MOD-ADMIN
- **User Story:** As an admin, I configure workspace defaults.
- **Acceptance Criteria:**
  - [ ] Default word goals, gate strictness, AI enablement, style guide doc link
  - [ ] Settings stored in workspaces.settings JSONB

### FR-ADMIN-002 — Style guide entity
- **Priority:** P2
- **Module:** MOD-ADMIN
- **User Story:** As managing editor, I maintain house style rules consumed by Copy Editor agent.
- **Acceptance Criteria:**
  - [ ] CRUD style rules
  - [ ] Versioned
  - [ ] Attached at org or workspace scope

### FR-AUTO-001 — Automation rules
- **Priority:** P3
- **Module:** MOD-ADMIN
- **User Story:** As an admin, I configure trigger-condition-action automations.
- **Acceptance Criteria:**
  - [ ] Example: on critical issue open -> notify managing editor
  - [ ] Example: rights expiry in 30 days -> notify rights_manager
  - [ ] Enable/disable; run_count; last_run_at
  - [ ] All actions audited

---

## 19. Dashboards and Analytics

### FR-DASH-001 — Executive command center
- **Priority:** P0
- **Module:** MOD-DASH
- **User Story:** As any user, I see health of active book + shortcuts.
- **Acceptance Criteria:**
  - [ ] Metrics: progress, milestone, word count, open issues, upcoming dues
  - [ ] Next actions list
  - [ ] Navigate into modules
- **Traceability:** Dashboard.tsx

### FR-DASH-002 — Portfolio dashboard
- **Priority:** P2
- **Module:** MOD-DASH
- **User Story:** As executive, I see all books milestone/risk matrix.
- **Acceptance Criteria:**
  - [ ] Filter by workspace
  - [ ] Risk sorting
  - [ ] Drill-down

### FR-DASH-003 — Creative health metrics
- **Priority:** P2
- **Module:** MOD-DASH
- **User Story:** As author/editor, I see story health indicators.
- **Acceptance Criteria:**
  - [ ] Plot health, character coverage, scene necessity percent, continuity score
  - [ ] Sources documented; empty states when modules not populated

---

## 20. External Portals (Phase E)

### FR-PORT-001 — Beta reader portal
- **Priority:** P4
- **Module:** MOD-PORTAL
- **User Story:** As a beta reader, I access only assigned manuscript chapters and submit feedback.
- **Acceptance Criteria:**
  - [ ] Magic-link or restricted account
  - [ ] Feedback becomes editorial issues or feedback records
  - [ ] No access to genome/rights/finance

### FR-PORT-002 — Partner portals
- **Priority:** P4
- **Module:** MOD-PORTAL
- **User Story:** As a translator/illustrator/retail partner, I see only relevant assets/tasks.
- **Acceptance Criteria:**
  - [ ] Role-scoped portal shells
  - [ ] Download authorized assets only

---

## 21. UX / Accessibility Functional Requirements

### FR-UX-001 — Responsive layouts
- **Priority:** P0-CORE
- **Module:** MOD-DASH
- **User Story:** As a mobile user, I can complete critical tasks.
- **Acceptance Criteria:**
  - [ ] Library, lifecycle checklist, issue triage, approvals usable on >=375px width
  - [ ] Studio usable with progressive disclosure

### FR-UX-002 — Accessibility baseline
- **Priority:** P1
- **Module:** MOD-DASH
- **User Story:** As a user with assistive tech, I can operate primary flows.
- **Acceptance Criteria:**
  - [ ] Keyboard navigation for main controls
  - [ ] Labeled form fields
  - [ ] Adequate contrast for text on brand backgrounds
  - [ ] Toasts are screen-reader announcable

### FR-UX-003 — Empty and error states
- **Priority:** P0-CORE
- **Module:** MOD-DASH
- **User Story:** As a new user, empty states teach next action.
- **Acceptance Criteria:**
  - [ ] Every list has empty state + CTA
  - [ ] API errors toast with retry where safe

---

## 22. Functional State Machines

### 22.1 Universal Record Status
`draft -> working -> review -> approved -> published -> archived`
Allowed transitions configurable; illegal transitions rejected.

### 22.2 Editorial Issue Status (example)
`open -> in_progress -> in_review -> resolved` (also `wont_fix` terminal)

### 22.3 Agent Run Status
`queued -> running -> awaiting_approval -> completed -> failed -> cancelled`

### 22.4 Milestone Status
`planned -> in_progress -> blocked -> approved -> reopened`

---

## 23. Permissions Matrix (Functional)

| Capability | author | editor | managing_editor | production | marketing | publisher | admin |
|---|---|---|---|---|---|---|---|
| book.create | Y | Y | Y | | | Y | Y |
| book.edit_creative | Y | Y | Y | | | Y | Y |
| manuscript.edit | Y | limited | Y | | | Y | Y |
| issue.manage | Y | Y | Y | | | Y | Y |
| milestone.advance.soft | Y | Y | Y | | | Y | Y |
| milestone.advance.hard | | | Y | Y(M13) | Y(M14/15) | Y | Y |
| asset.approve | | | | Y | | Y | Y |
| metadata.publish | | | | Y | Y | Y | Y |
| rights.manage | | | | | | Y | Y |
| ai.run.L2 | Y | Y | Y | Y | Y | Y | Y |
| ai.apply.L3 | | | Y | Y | Y | Y | Y |
| users.manage | | | | | | | Y |

Exact capability keys are in the Tech Spec; this table is normative intent.

---

## 24. Acceptance Test Themes (QA Mapping)

| Theme | Covers |
|---|---|
| AuthZ/RLS | Cross-user/cross-workspace isolation tests |
| Lifecycle gates | Soft vs hard gate suites |
| Manuscript durability | Autosave/conflict/restore |
| Editorial blocking | Critical issue blocks M16 |
| AI governance | Proposal required before mutation |
| Import/export | Prototype snapshot round-trip |
| Audit completeness | Approval actions emit events |

---

## 25. Detailed Field Requirements by Entity (Functional)

### 25.1 Universal Record Header (every entity)
Record ID; Entity Type; Parent ID; Book ID; Series ID; Universe ID; Status; Created; Modified; Version; Owner; Approval state.

### 25.2 Universal AI Fields
AI Summary; AI Keywords; AI Confidence; AI Risk; AI Completeness; AI Recommendations; AI Generated Date; AI Reviewed Date; AI Reviewer; AI Notes.

### 25.3 Universal Analytics Fields
Usage Count; Reference Count; Popularity; Complexity; Completeness; Readability; Dependencies; Risk; Change Frequency; Reuse Score; Business Value.

### 25.4 Book — Identity Fields
Book ID; Working Title; Official Title; Subtitle; Internal Name; Series; Volume; Edition; Language; Publisher; Imprint; Publication Type; ISBN; ASIN; DOI; Project Code / record_code.

### 25.5 Book — Creative Fields
Genre; Subgenre; Mood; Tone; Voice; POV; Audience; Age Range; Themes; Motifs; Symbols; Story Structure; Ending; Reading Level.

### 25.6 Book — Commercial Fields
Hook; Logline; USP; Comparable Titles; Comparable Authors; Market Segment; Keywords; Retail Categories; Target Price; Forecast Revenue.

### 25.7 Book — Operational Fields
Current Phase; Milestone; Status; Completion; Priority; Owner; Dependencies; Risk; Word Goal; Current Word Count; Deadline.

### 25.8 Character — Minimum P0 Columns
id; workspace_id; book_id; record_code; name; role; status; summary; core_wound; core_desire; core_fear; arc; voice_profile; importance; genome; version; timestamps.

### 25.9 Character — Extended Genome Categories (P1+)
Identity (aliases, titles, pronouns, age, birthday, occupation, species, nationality, religion, languages, education); Appearance (hair, eyes, height, weight, skin, body, clothing, scars, tattoos, accessories, gait, expressions); Psychology (wound, fear, need, want, values, beliefs, attachment, temperament, IQ/EQ proxies, love language, stress response, trauma, defenses, moral alignment, self image, shame, hope); Narrative (role, POV, arc stages, secrets, reveals, foreshadowing, death, legacy); Analytics (dialogue percent, scene/chapter/conflict/relationship counts, popularity, sentiment, importance).

### 25.10 Chapter Fields
Chapter ID; Book ID; Act; Sequence; Title; Purpose; Synopsis; POV; Opening Emotion; Closing Emotion; Conflict; Resolution; Word Goal; Actual Words; Status; Manuscript; Dependencies.

### 25.11 Scene Fields
Scene ID; Book ID; Chapter ID; Sequence; Scene Type; POV; Location; Characters Present; Goal; Conflict; Obstacle; Decision; Outcome; Emotion Before/After; Pacing; Tension; Word Goal/Actual; Dialogue/Description/Action percent; Hook; Reveal; Foreshadowing; Cliffhanger; AI quality scores.

### 25.12 Location Fields (categories)
Identity; History; Government; Climate; Economy; Population; Architecture; Religion; Education; Transportation; Healthcare; Food; Currency; Crime; Trade; Technology; Magic; Military; Important Events; Notable Residents; Connected Locations.

### 25.13 Relationship Fields
Relationship ID; Character A/B (or polymorphic ends); Type; Trust; Affection; Power Balance; History; Current Status; Future Direction; Important Scenes; Turning Points; Ending.

### 25.14 Timeline Fields
Timeline ID; Absolute Date; Relative Date; Book Date; Historical Date; Event; Characters; Location; Importance; Canon; References; Dependencies; Consequences.

### 25.15 Marketing / Rights Fields
Campaign: audience, platform, objective, creative assets, budget, schedule, KPIs, CTR, conversion, revenue, ROI, lessons. Rights: type, owner, territory, language, exclusivity, start/end, renewal, revenue, status, restrictions, counsel, agent.

---

## 26. FRD Traceability Summary
- BRD objectives BO-01…BO-08 map to FR modules above
- Manual Vol IV maps to FR-LIFE-*
- Manual Vol VI maps to FR-EDIT-*
- Manual Vol VIII/XVII map to FR-AI-*
- Manual Vol XII maps to FR-ORG/RBAC/SEARCH/PORT
- Current app views map to P0 requirements marked where applicable

---

## 27. Open Functional Questions
1. Should chapter.manuscript be the sole prose store, or scene-level manuscript too? Recommendation: chapter manuscript P1; scene prose optional P2.
2. Exact hard-gate list beyond M12/M15/M16 for Mangu house?
3. Beta reader feedback object model vs editorial issues?
4. Maximum upload size per asset type?

---

*End of FRD — MANGU Book Operating System (Book OS) v1.0.0*
