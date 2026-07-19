# MANGU Book OS — Functional Requirements Document (FRD)

| Field | Value |
|---|---|
| Document ID | `FRD-BOOKOS-001` |
| Version | `1.0.0` |
| Status | **Approved for engineering** |
| Product | MANGU Book Operating System |
| Related | BRD-BOOKOS-001, TECH-BOOKOS-001 |
| Last Updated | 2026-07-19 |

---

## 0. How to use this FRD

1. Every `FR-*` is testable. If it cannot fail a test, rewrite it.
2. Priority uses MoSCoW: **Must / Should / Could / Won’t (this phase)**.
3. Acceptance criteria use Given/When/Then where behavior is non-trivial.
4. UI may vary; **behavior and data rules may not**.
5. Cross-links: `Traces BR-###` and `Implements ENT-* / MS-* / AGT-*`.

### Priority legend

| Tag | Meaning |
|---|---|
| Must | Phase-blocking |
| Should | Required for phase excellence; may slip only with Product waiver |
| Could | Desirable |
| Won’t | Explicitly deferred |

---

## 1. Information Architecture & Navigation

### FR-IA-001 — Application shell
**Priority:** Must · **Phase:** 0 · **Traces:** BR-021

The system SHALL provide a persistent application shell with:

- Collapsible sidebar navigation
- Top bar showing current view + active book context
- Main content region
- Global toast feedback for mutations
- Auth-gated access (unauthenticated users see auth only)

**AC-FR-IA-001-01:** Given an authenticated user, when the app loads, then Dashboard is reachable without full page reload navigation to auth.

**AC-FR-IA-001-02:** Given sidebar closed on mobile width, when user opens menu, then all primary nav items are reachable.

### FR-IA-002 — Primary navigation destinations
**Priority:** Must · **Phase:** 0 (extend in later phases)

Sidebar SHALL include (order stable unless Product changes):

| ViewId | Label | Phase introduced |
|---|---|---|
| `dashboard` | Command Center | 0 |
| `library` | Library / Books | 0 |
| `lifecycle` | Lifecycle (M0–M20) | 0 |
| `genome` | Book Genome | 0 |
| `characters` | Characters | 0 |
| `chapters` | Chapters | 0 |
| `scenes` | Scenes | 1 |
| `locations` | Locations | 1 |
| `graph` | Story Graph | 1 |
| `manuscript` | Manuscript Studio | 1 |
| `editorial` | Editorial | 0 |
| `production` | Production | 0 |
| `marketing` | Marketing | 0 |
| `rights` | Rights | 3 |
| `sales` | Sales | 3 |
| `ai-center` | AI Center | 0 |
| `work-queue` | Work Queue | 1 |
| `approvals` | Approvals | 1 |
| `activity` | Activity / Audit | 0 |
| `settings` | Settings | 1 |

### FR-IA-003 — Active book context
**Priority:** Must · **Phase:** 0 · **Traces:** BR-021

The system SHALL maintain an **active book** in client context. Entity views (characters, chapters, etc.) operate on the active book unless explicitly global.

**AC-FR-IA-003-01:** Given two books A and B, when user switches active book to B, then Characters list shows only B’s characters.

**AC-FR-IA-003-02:** Given no books exist, when user opens Characters, then empty-state CTA routes to create book.

### FR-IA-004 — Command palette / global search
**Priority:** Should · **Phase:** 1

User SHALL open a command palette (keyboard shortcut) to search entities and navigate to records by title/name/ID.

**AC-FR-IA-004-01:** Given a character named “Imani”, when user searches “ima”, then the character appears and Enter navigates to its detail.

### FR-IA-005 — Deep linking
**Priority:** Should · **Phase:** 1

URLs SHALL encode `view`, `bookId`, and when applicable `entityId` so refresh restores context.

---

## 2. Identity, Auth, Users & Organizations

### FR-AUTH-001 — Sign up / sign in / sign out
**Priority:** Must · **Phase:** 0

System SHALL support email/password auth via Supabase Auth (additional providers Could in Phase 2).

**AC-FR-AUTH-001-01:** Given valid credentials, when user signs in, then session persists across refresh.

**AC-FR-AUTH-001-02:** Given signed-in user, when user signs out, then protected data requests fail and Auth page shows.

### FR-AUTH-002 — Session security
**Priority:** Must · **Phase:** 0 · **Traces:** BR-036

Client SHALL use Supabase session tokens; RLS enforces ownership/tenancy. UI hiding is never the only control.

### FR-ORG-001 — Organization (tenant) model
**Priority:** Must · **Phase:** 3 (schema-ready Phase 1) · **Traces:** BR-012, BR-027

System SHALL support Organization as tenant. Phase 0–2 MAY map each user to an implicit personal org.

**Roles (minimum):** `owner`, `admin`, `publisher`, `creative_director`, `managing_editor`, `editor`, `author`, `designer`, `marketer`, `production`, `viewer`.

### FR-ORG-002 — Membership & invites
**Priority:** Should · **Phase:** 3

Owner/admin can invite members by email with a role; invite acceptance grants access.

### FR-ORG-003 — Permission enforcement
**Priority:** Must · **Phase:** 3 · **Traces:** BR-027

Permissions matrix (summary):

| Action | author | editor | managing_editor | publisher | viewer |
|---|---|---|---|---|---|
| Edit manuscript | ✓ | ✓ | ✓ | ✓ | |
| Advance milestone | | | ✓ | ✓ | |
| Approve AI canon write | | ✓* | ✓ | ✓ | |
| Edit rights | | | | ✓ | |
| View commercial dashboards | | | ✓ | ✓ | ✓ |

\* Editor approval limited to editorial-scope proposals.

### FR-ORG-004 — Solo mode
**Priority:** Must · **Phase:** 0

Solo users SHALL experience zero org ceremony; all role powers available to the owner.

---

## 3. Universal Record Behavior

All entities implementing the universal header inherit these requirements.

### FR-UNI-001 — Universal record header fields
**Priority:** Must · **Phase:** 1 · **Traces:** BR-005 · **Entity:** all

Every canonical entity record SHALL include:

**System:** `id`, `entity_type`, `parent_id?`, `book_id?`, `series_id?`, `universe_id?`, `status`, `version`, `owner_user_id`, `org_id`, `created_at`, `updated_at`, `approval_status`

**Content (as applicable):** `title`/`name`, `short_description`, `long_description`, `purpose`, `tags[]`, `keywords[]`, `priority`, `importance`, `visibility`, `confidentiality`

**AI:** `ai_summary`, `ai_expansion`, `ai_confidence`, `ai_recommendations`, `ai_completeness`, `ai_risk`, `generation_status`, `quality_score`, `validation_score`

**Workflow:** `current_phase`, `assigned_user_id?`, `completion_pct`, `dependencies[]`, `risk_level`, `notes`

**Analytics:** `usage_count`, `reference_count` (system-maintained)

### FR-UNI-002 — Universal lifecycle states
**Priority:** Must · **Phase:** 1 · **Traces:** BR-005

Record status state machine:

`draft → working → review → approved → published → archived`

Illegal transitions SHALL be rejected with actionable error.

### FR-UNI-003 — Soft semantics for delete
**Priority:** Should · **Phase:** 1

Destructive delete of referenced canon entities SHALL prefer archive. Hard delete requires confirmation and is blocked if references exist (unless cascade explicitly confirmed).

### FR-UNI-004 — Optimistic concurrency
**Priority:** Should · **Phase:** 1

Updates SHALL include version check; conflicting writes return conflict and require reload/merge.

### FR-UNI-005 — Validation engine
**Priority:** Must · **Phase:** 1

Each entity type declares required fields by milestone context. Validation produces machine-readable issue list used by milestone gates and AI readiness.

---

## 4. Library, Books, Series, Universes

### FR-LIB-001 — Book CRUD
**Priority:** Must · **Phase:** 0 · **Entity:** `ENT-Book` · **Traces:** BR-011, BR-021

User can create, read, update, archive books with at minimum:

- `title` (required), `author`, `genre`, `cover_url`
- `progress` (0–100), `phase` / milestone pointer
- `status`, `word_count`, `target_word_count`, `deadline`

**AC-FR-LIB-001-01:** Given title “River Gospel”, when created, then it appears in Library and can be set active.

**AC-FR-LIB-001-02:** Given a book with characters, when archived, then it is hidden from default Library but not hard-deleted.

### FR-LIB-002 — Book identity fields (expanded)
**Priority:** Should · **Phase:** 1

Book identity group SHALL support: working title, official title, subtitle, edition, volume, language, ISBN, ASIN, publication type.

### FR-LIB-003 — Book creative fields
**Priority:** Should · **Phase:** 1

Genre, subgenre, POV, tone, mood, narrative style, audience, reading level, core theme, premise, logline.

### FR-LIB-004 — Book commercial fields
**Priority:** Should · **Phase:** 2

Pricing, categories, keywords/BISAC-like fields, comparable titles, target release window.

### FR-LIB-005 — Series entity
**Priority:** Should · **Phase:** 3 · **Entity:** `ENT-Series`

CRUD for series; books may belong to a series; series-level shared metadata.

### FR-LIB-006 — Universe entity
**Priority:** Should · **Phase:** 3 · **Entity:** `ENT-Universe`

CRUD for universe; series/books may belong; world canon shared via inheritance rules (see FR-INH).

### FR-LIB-007 — Library filters & sort
**Priority:** Could · **Phase:** 1

Filter by status, milestone, genre; sort by updated, deadline, title, health score.

### FR-LIB-008 — Cover image upload
**Priority:** Should · **Phase:** 1

Upload cover to object storage; store URL on book; validate type/size.

---

## 5. Book Genome Module

### FR-GENOME-001 — Genome workspace
**Priority:** Must · **Phase:** 0 shell / 1 depth · **Traces:** BR-023

Genome view SHALL present layered attribute groups for the active book with completion % per layer and overall.

### FR-GENOME-002 — Genome layers (Book)
**Priority:** Must · **Phase:** 1 · **Manual:** Vol X

System SHALL support (progressive disclosure OK) these layers:

1. Identity Genome  
2. Narrative Genome  
3. Character Ensemble Genome  
4. World/Setting Genome  
5. Theme & Meaning Genome  
6. Reader Experience Genome  
7. Production/Metadata Genome  
8. Franchise Genome  
9. Commercial Genome  
10. Operational / Milestone Genome  

Each layer has typed attributes; unknown attributes stored in validated JSON extensions only if registered in schema registry.

### FR-GENOME-003 — Completeness scoring
**Priority:** Must · **Phase:** 1 · **Traces:** BR-018

Completeness = weighted filled required attributes / required attributes for current milestone.

**AC-FR-GENOME-003-01:** Given M3 required set incomplete, when user views Genome, then incomplete fields are listed with deep links.

### FR-GENOME-004 — AI genome assist
**Priority:** Should · **Phase:** 1 · **Agent:** multiple

User can request AI to propose fills for empty fields; proposals route through FR-AI-PROPOSE.

### FR-GENOME-005 — Genome templates
**Priority:** Could · **Phase:** 2

Genre templates pre-seed recommended fields and default structure.

---

## 6. Character Genome Module

### FR-CHAR-001 — Character CRUD
**Priority:** Must · **Phase:** 0 · **Entity:** `ENT-Character`

Create/list/edit/archive characters for active book with Phase 0 fields: name, role, archetype, arc, connections, image_url, notes.

### FR-CHAR-002 — Character Genome domains
**Priority:** Must · **Phase:** 1 · **Manual:** Vol XIII · **Traces:** BR-023

Character detail SHALL organize twelve domains:

1. Identity  
2. Physical  
3. Psychology  
4. Personality  
5. Behavior  
6. Relationships  
7. Narrative  
8. Communication  
9. Skills  
10. Culture  
11. Commercial  
12. Evolution  

**Minimum psychology fields (Must for M2 exit):** core wound, core fear, core desire, need, want, lie believed, fatal flaw, greatest strength, motivation, transformation.

### FR-CHAR-003 — Appearance & identity detail
**Priority:** Should · **Phase:** 1

Aliases, titles, nicknames, species, gender/pronouns, age, birthday, occupation, height, weight, hair, eyes, voice, scars, clothing, distinguishing features.

### FR-CHAR-004 — Voice model
**Priority:** Should · **Phase:** 1 · **Agent:** `AGT-DialogueCoach`

Store vocabulary notes, sentence length tendency, formality, humor, catchphrases, slang, speech evolution notes.

### FR-CHAR-005 — Character completeness & role matrix
**Priority:** Must · **Phase:** 1

Dashboard widget: cast list with role + psychology completeness. M2 gate uses this.

### FR-CHAR-006 — First/last appearance
**Priority:** Should · **Phase:** 1

Link to chapter/scene IDs for first and last appearance.

### FR-CHAR-007 — Character AI psychologist
**Priority:** Should · **Phase:** 1 · **Agent:** `AGT-CharacterPsychologist`

Generate proposal for psychology gaps; never auto-apply in default autonomy.

**AC-FR-CHAR-007-01:** Given empty core wound, when agent runs, then a proposal draft appears in Approvals, character unchanged until approve.

---

## 7. Chapters, Scenes, Outline, Manuscript

### FR-CH-001 — Chapter CRUD
**Priority:** Must · **Phase:** 0 · **Entity:** `ENT-Chapter`

Fields Phase 0: number, title, status, word_count, target_word_count, pov, notes.

### FR-CH-002 — Chapter planning fields
**Priority:** Must · **Phase:** 1

Act, sequence, purpose, synopsis, opening_emotion, closing_emotion, conflict, resolution, scene_count, estimated_reading_time, cliffhanger, foreshadowing, reveal, themes, draft_version, approval_status.

**AC-FR-CH-002-01:** Given M6 exit check, when any chapter lacks purpose, then gate fails listing those chapters.

### FR-CH-003 — Chapter reorder
**Priority:** Should · **Phase:** 1

Drag/reorder updates `number`/`sequence` transactionally.

### FR-SC-001 — Scene CRUD
**Priority:** Must · **Phase:** 1 · **Entity:** `ENT-Scene`

Fields: chapter_id, sequence, title, synopsis, pov_character_id, location_id, characters_present[], purpose, conflict, outcome, emotional_shift, plot_advancement, word_goal, word_count, status, notes.

**AC-FR-SC-001-01:** Given scene missing purpose, when M7 validation runs, then scene flagged.

### FR-SC-002 — Scene necessity checklist
**Priority:** Must · **Phase:** 1

UI presents the six questions (who/where/change/why/emotion/plot). Saving with empty answers allowed in draft; M7 exit requires all answered.

### FR-OUT-001 — Outline tree
**Priority:** Should · **Phase:** 1

Hierarchical view Acts → Chapters → Scenes with synopsis; edits sync to entities.

### FR-MSCRIPT-001 — Manuscript Studio
**Priority:** Must · **Phase:** 1 · **Traces:** BR-013

Provide chapter-scoped manuscript editor:

- Load/save manuscript body per chapter (and optionally per scene)
- Autosave with debounce + version bump
- Word count sync to chapter/book aggregates
- Offline-tolerant queue Could Phase 2

**AC-FR-MSCRIPT-001-01:** Given typing 500 words, when autosave completes, then refresh shows same text and word_count updated.

### FR-MSCRIPT-002 — Revisions
**Priority:** Must · **Phase:** 1

Every explicit “Save version” or milestone-related freeze creates a revision row with timestamp, author, label, content snapshot or diff.

### FR-MSCRIPT-003 — Compare revisions
**Priority:** Should · **Phase:** 1

User can diff two revisions for a chapter.

### FR-MSCRIPT-004 — Writing metrics
**Priority:** Should · **Phase:** 1 · **Milestone:** M8

Show words written, daily/weekly goal, velocity, ETA, chapter/scene progress.

### FR-MSCRIPT-005 — Inline continuity hints
**Priority:** Could · **Phase:** 2 · **Agent:** `AGT-ContinuityGuardian`

Non-blocking hints during writing based on recent continuity scan.

---

## 8. Locations, World, Timeline, Themes

### FR-LOC-001 — Location CRUD
**Priority:** Must · **Phase:** 1 · **Entity:** `ENT-Location`

Name, type, description, parent_location_id, climate, cultural_notes, sensory_notes, connected_characters, status.

### FR-WORLD-001 — World Genome
**Priority:** Should · **Phase:** 1–2 · **Manual:** Vol XV

Domains: history, politics, economics, religion, technology/magic, climate, trade, languages, culture, laws, architecture, transportation. Contradiction flags from World Builder agent.

### FR-WORLD-002 — Magic/Technology systems
**Priority:** Should · **Phase:** 2 · **Entity:** `ENT-SystemRule`

Named systems with rules, costs, limits, known exceptions; linked to scenes/characters.

### FR-TIME-001 — Timeline events
**Priority:** Should · **Phase:** 1 · **Entity:** `ENT-TimelineEvent`

Dated/ordered events with book/universe scope, linked entities, absolute vs story-relative time.

### FR-THEME-001 — Themes
**Priority:** Should · **Phase:** 1 · **Entity:** `ENT-Theme`

Theme records linked to book/chapters/scenes with statement + manifestation notes.

### FR-CANON-001 — Canon rules
**Priority:** Should · **Phase:** 1 · **Entity:** `ENT-CanonRule`

Explicit rules agents and humans must respect; severity if violated.

---

## 9. Relationship Graph & Knowledge Graph

### FR-REL-001 — Relationship CRUD
**Priority:** Must · **Phase:** 1 · **Entity:** `ENT-Relationship` · **Traces:** BR-016

Typed edges between entities: `from_id`, `to_id`, `from_type`, `to_type`, `relationship_type`, `strength`, `since_event_id?`, `notes`, `status`.

### FR-REL-002 — Graph visualization
**Priority:** Should · **Phase:** 1

Interactive graph for characters/locations/orgs; click node → entity detail.

### FR-REL-003 — Relationship types catalog
**Priority:** Must · **Phase:** 1

Controlled vocabulary (family, ally, rival, mentor, romantic, member_of, located_in, owns, conflicts_with, etc.) extensible per org.

### FR-KG-001 — Ontology consistency
**Priority:** Should · **Phase:** 2 · **Manual:** Vol XVI

System treats Node/Relationship/Event/Constraint/DerivedInsight as first-class; invalid edges rejected.

### FR-KG-002 — Derived insights
**Priority:** Could · **Phase:** 3

Materialize insights (e.g., “Character X never meets Y but share 3 mutual links”) for AI and dashboards.

---

## 10. Lifecycle / Milestone Engine

### FR-MS-001 — Milestone board
**Priority:** Must · **Phase:** 0 UI / 1 gates · **Traces:** BR-014, BR-041

Lifecycle view lists M0–M20 with status: `locked | available | in_progress | blocked | complete | waived`.

### FR-MS-002 — Current milestone pointer
**Priority:** Must · **Phase:** 1

Book stores `current_milestone` and `milestone_states` JSON/table rows.

### FR-MS-003 — Exit criteria evaluation
**Priority:** Must · **Phase:** 1

Each milestone has machine-checkable criteria + human checklist items.

Example M3 required entities present: Book, ≥1 Character, Locations (if world-heavy genre), Themes, Timeline starter, Relationships starter, Canon rules starter — configurable by publication type.

**AC-FR-MS-003-01:** Given M2 psychology incomplete, when user attempts advance to M3, then system blocks with unmet criteria list.

### FR-MS-004 — Human approval to advance
**Priority:** Must · **Phase:** 1 · **Traces:** BR-041

Advance requires authorized role approval (solo owner auto-authorized) and writes audit event `EVT-MilestoneAdvanced`.

### FR-MS-005 — Waiver
**Priority:** Should · **Phase:** 1

Authorized role may waive unmet criteria with reason; waiver stored permanently.

### FR-MS-006 — Deliverables registry
**Priority:** Should · **Phase:** 1

Each milestone lists deliverables; each can be `missing | draft | ready | approved` and link to entity/asset.

### FR-MS-007 — AI tasks per milestone
**Priority:** Should · **Phase:** 1–2

Milestone detail shows recommended agents/tasks; launching creates proposals.

### FR-MS-008 — Non-linear enrichment
**Priority:** Must · **Phase:** 1 · **Traces:** BR-042

Completing M9 may update M2 character psychology fields without resetting M2 completion evidence; show “enriched after approval” marker.

### FR-MS-009 — Lifecycle dashboard metrics
**Priority:** Should · **Phase:** 1

Time-in-stage, blockers, health, next actions.

---

## 11. Editorial Intelligence

### FR-ED-001 — Editorial issue CRUD + Kanban
**Priority:** Must · **Phase:** 0 · **Entity:** `ENT-EditorialIssue` · **Traces:** BR-022

Statuses: `backlog | in_progress | review | resolved` (extensible).  
Fields: title, chapter ref, assignee, severity (`critical|high|medium|low`), type, description, entity links.

### FR-ED-002 — Editorial categories
**Priority:** Should · **Phase:** 1 · **Manual:** Vol VI

Types include: Structural, Continuity, Line Edit, Character, Craft, Sensitivity, Factual, Pacing, Voice, Plot Hole.

### FR-ED-003 — Severity policy
**Priority:** Must · **Phase:** 1

Critical issues block M12 exit by default.

### FR-ED-004 — Revision linkage
**Priority:** Should · **Phase:** 1

Issues can link to manuscript revision IDs and text anchors (chapter + optional scene + offset/range).

### FR-ED-005 — Continuity intelligence queue
**Priority:** Should · **Phase:** 1 · **Agent:** `AGT-ContinuityGuardian`

Agent findings create editorial issues with type Continuity and evidence payload.

### FR-ED-006 — Style guide
**Priority:** Should · **Phase:** 2 · **Entity:** `ENT-StyleGuide`

Org/book style rules; Copy Editor agent consumes them.

### FR-ED-007 — Editorial quality score
**Priority:** Should · **Phase:** 2 · **Traces:** BR-018

Score from open issue weights, severity mix, age of criticals, reopened rate.

### FR-ED-008 — Sensitivity review
**Priority:** Could · **Phase:** 3 · **Traces:** BR-040

Workflow status on book/issue for sensitivity pass.

---

## 12. Production, Assets, Metadata, Distribution

### FR-PROD-001 — Production task tracker
**Priority:** Must · **Phase:** 0 · **Entity:** `ENT-ProductionTask`

Task, status, due, assignee, category.

### FR-PROD-002 — Asset registry
**Priority:** Must · **Phase:** 2 · **Entity:** `ENT-Asset` · **Traces:** BR-024

Store assets: cover, interior, ebook, audio, marketing images, fonts, illustrations. Fields: type, file URL, version, checksum, status, linked book, rights notes.

### FR-PROD-003 — Preflight checklist
**Priority:** Must · **Phase:** 2

Machine + human checks before M13/M16: missing ISBN, missing cover, manuscript not approved, unresolved critical editorial, metadata incomplete.

### FR-PROD-004 — Format pipelines
**Priority:** Should · **Phase:** 2

Track status per format: print interior, ebook, audiobook script/audio, accessibility report.

### FR-PROD-005 — ISBN / identifier management
**Priority:** Should · **Phase:** 2 · **Traces:** BR-030

Capture ISBN-13, ASIN, internal SKUs; validate checksum for ISBN where possible.

### FR-META-001 — Metadata engine
**Priority:** Must · **Phase:** 2

Canonical retail metadata fields; generate export package (JSON/ONIX-like subset).

### FR-DIST-001 — Distribution package export
**Priority:** Should · **Phase:** 2 · **Traces:** BR-017

One-click export zip/manifest of metadata + required files list (files from storage).

### FR-ACCESS-001 — Accessibility tracking
**Priority:** Could · **Phase:** 3

Track alt text coverage, ebook accessibility checks status.

---

## 13. Marketing, Sales, Rights

### FR-MKT-001 — Marketing items / campaigns
**Priority:** Must · **Phase:** 0 list / 2 campaigns · **Traces:** BR-029

Phase 0: title, channel, status, reach, date.  
Phase 2: campaign entity with goals, budget, assets, messaging pillars linked to genome.

### FR-MKT-002 — Messaging kit
**Priority:** Should · **Phase:** 2 · **Traces:** BR-034

Generate author bio, pitch, taglines, press blurb from approved genome fields via Marketing Strategist proposals.

### FR-MKT-003 — Launch plan
**Priority:** Should · **Phase:** 2

Pre-launch checklist tied to M14–M16 deliverables.

### FR-SALES-001 — Sales records
**Priority:** Should · **Phase:** 3 · **Traces:** BR-032 · **Entity:** `ENT-Sale`

Manual entry + CSV import: date, channel, units, revenue, returns, territory.

### FR-SALES-002 — Sales dashboards
**Priority:** Should · **Phase:** 3

Units, revenue, velocity, channel mix per title/portfolio.

### FR-RIGHTS-001 — Rights records
**Priority:** Should · **Phase:** 3 · **Traces:** BR-031 · **Entity:** `ENT-Rights`

Territory, language, format, exclusive, start/end, licensee, status, notes.

### FR-RIGHTS-002 — Licensing opportunities
**Priority:** Could · **Phase:** 3 · **Agent:** `AGT-RightsManager`

Agent proposes opportunities; human approves outreach tasks.

### FR-PRICE-001 — Pricing hypotheses
**Priority:** Could · **Phase:** 2 · **Traces:** BR-033

Store price tests and comps from M0 research.

---

## 14. Work Queue, Approvals, Notifications, Activity

### FR-WQ-001 — Work queue
**Priority:** Must · **Phase:** 1

Unified queue of tasks assigned to user: editorial issues, production tasks, approval requests, AI proposal reviews, milestone checklists.

### FR-APPR-001 — Approvals inbox
**Priority:** Must · **Phase:** 1 · **Traces:** BR-008, BR-046

List pending approvals with payload diff, agent/source, risk, approve/reject/request-changes.

**AC-FR-APPR-001-01:** Given pending character psychology proposal, when rejected with reason, then character unchanged and proposal stored as rejected.

### FR-APPR-002 — Approval policies
**Priority:** Must · **Phase:** 1

Configurable which actions require approval (defaults in Tech Spec).

### FR-NOTIF-001 — Notifications
**Priority:** Should · **Phase:** 1

In-app notifications for assignment, approval needed, milestone blocked, agent completed.

### FR-ACT-001 — Activity / audit log
**Priority:** Must · **Phase:** 0 · **Traces:** BR-013, BR-035

Append-only activity with actor, action, target, entity_type, entity_id, book_id, timestamp, metadata.

**AC-FR-ACT-001-01:** Given chapter title change, when saved, then activity entry exists with old/new in metadata (Phase 1+) or descriptive target (Phase 0).

### FR-ACT-002 — Tamper resistance
**Priority:** Must · **Phase:** 1

No UI to edit/delete audit rows for normal roles; admin retention tools only in Phase 3 with secondary audit.

---

## 15. Snapshots, Import/Export, Search

### FR-SNAP-001 — Project snapshots
**Priority:** Must · **Phase:** 1 · **Traces:** BR-028

Create named snapshot of book subgraph (entities + manuscript pointers). Restore replaces working state after confirmation.

**AC-FR-SNAP-001-01:** Given snapshot S, when user mutates then restores S, then genome/characters/chapters match S.

### FR-SNAP-002 — Auto-snapshot before risky ops
**Priority:** Should · **Phase:** 1

Auto-snapshot before bulk AI apply or milestone waiver.

### FR-IO-001 — JSON export/import
**Priority:** Should · **Phase:** 1

Export book package JSON; import creates or merges with conflict strategy.

### FR-IO-002 — OPAS package
**Priority:** Should · **Phase:** 3 · **Traces:** BR-019

Export/import OPAS-compliant package subset.

### FR-SEARCH-001 — Full search
**Priority:** Should · **Phase:** 1

Search titles, names, notes, manuscript (Phase 2 for full manuscript index).

---

## 16. AI Center & Agent Functional Requirements

### FR-AI-001 — AI Center hub
**Priority:** Must · **Phase:** 0 shell / 1 real · **Traces:** BR-043

List agents, status, last run, autonomy level, entry points to run/configure.

### FR-AI-002 — Agent profile
**Priority:** Must · **Phase:** 1 · **Traces:** BR-045

Each agent displays role, responsibilities, authority, limitations, KPIs, inputs/outputs, escalation.

### FR-AI-003 — Run agent
**Priority:** Must · **Phase:** 1

User selects scope (book/chapter/character), optional prompt notes, runs agent → job → proposal(s) and/or report artifact.

### FR-AI-004 — Proposal schema
**Priority:** Must · **Phase:** 1 · **Traces:** BR-046

Proposal contains: agent_id, scope, summary, diffs (entity patches), confidence, risk, citations/evidence, created_at, status.

### FR-AI-005 — Apply proposal
**Priority:** Must · **Phase:** 1

On approve, apply patches transactionally; write audit; update AI fields; optionally create follow-up tasks.

### FR-AI-006 — Autonomy levels
**Priority:** Must · **Phase:** 1 · **Traces:** BR-047

`observe | suggest | propose | auto_low_risk` per agent × org. Auto only for explicitly low-risk patch classes (e.g., AI summary refresh).

### FR-AI-007 — Shared memory
**Priority:** Must · **Phase:** 1 · **Traces:** BR-044

Agents read canonical DB; may not keep contradictory side stores as authority.

### FR-AI-008 — Multi-agent orchestration
**Priority:** Could · **Phase:** 2 · **Agent:** `AGT-ExecutivePublisher`

Orchestrator plans specialist sequence for a milestone packet.

### FR-AI-009 — Cost & confidence visibility
**Priority:** Should · **Phase:** 1 · **Traces:** BR-049

Show tokens/cost estimate and confidence on proposals/jobs.

### FR-AI-010 — Safety refusals
**Priority:** Must · **Phase:** 1

Agents refuse disallowed content policies; log refusal; do not partially corrupt entities.

### FR-AI-011 — Agent-specific behaviors

| ID | Agent | Must behavior |
|---|---|---|
| `FR-AI-AGT-001` | Market Intelligence | Produce Market Intelligence Packet artifact for M0 |
| `FR-AI-AGT-002` | Concept Architect | Propose title/logline/comps/USP for M1 |
| `FR-AI-AGT-003` | Story Architect | Propose act map / beat sheet |
| `FR-AI-AGT-004` | Character Psychologist | Propose psychology domain fills |
| `FR-AI-AGT-005` | World Builder | Propose world fields + contradiction list |
| `FR-AI-AGT-006` | Plot Engineer | Score scene necessity; flag removable scenes |
| `FR-AI-AGT-007` | Chapter Planner | Propose chapter planning fields |
| `FR-AI-AGT-008` | Scene Director | Validate scene checklist completeness |
| `FR-AI-AGT-009` | Dialogue Coach | Voice consistency report |
| `FR-AI-AGT-010` | Developmental Editor | Diagnostic report + editorial issues (no silent rewrite) |
| `FR-AI-AGT-011` | Continuity Guardian | Timeline/object/knowledge contradictions → issues |
| `FR-AI-AGT-012` | Copy Editor | Style/grammar suggestions as proposals or issues |
| `FR-AI-AGT-013` | Fact Checker | Claim list with verify/fail |
| `FR-AI-AGT-014` | Production Coordinator | Preflight gaps report |
| `FR-AI-AGT-015` | Marketing Strategist | Messaging + campaign proposals |
| `FR-AI-AGT-016` | Metadata Specialist | Metadata quality fixes proposal |
| `FR-AI-AGT-017` | Rights Manager | Rights risk/opportunity notes |
| `FR-AI-AGT-018` | Sales Analyst | Performance commentary |
| `FR-AI-AGT-019` | Portfolio Manager | Cross-title recommendations |
| `FR-AI-AGT-020` | Executive Copilot | Q&A over portfolio with citations to records |

---

## 17. Executive Command Center & Analytics

### FR-DASH-001 — Command Center
**Priority:** Must · **Phase:** 0 · **Traces:** BR-025

Show active book health summary, milestone status, counts (chapters, characters, open editorial criticals), recent activity, CTAs into modules.

### FR-DASH-002 — Portfolio view
**Priority:** Should · **Phase:** 2

Multi-book table with milestone, health scores, deadline risk.

### FR-AN-001 — Health scores
**Priority:** Must · **Phase:** 2 · **Traces:** BR-018

Compute and display scores listed in BRD §8.2; show contributors (why score is low).

### FR-AN-002 — Predictive analytics
**Priority:** Could · **Phase:** 3 · **Manual:** Vol XI

ETA to milestone, launch risk, demand hypotheses (non-binding).

### FR-AN-003 — AI readiness engine
**Priority:** Should · **Phase:** 1

Per entity/book readiness for AI tasks (enough context fields present).

---

## 18. Inheritance & Franchise

### FR-INH-001 — Inheritance model
**Priority:** Should · **Phase:** 3 · **Traces:** BR-016 · **Manual:** Vol II

Universe → Series → Book inheritance for world/character shared records with override-at-child rules.

### FR-INH-002 — Override markers
**Priority:** Should · **Phase:** 3

UI shows inherited vs overridden values; clearing override restores inherited.

### FR-FRAN-001 — Franchise expansion workspace
**Priority:** Could · **Phase:** 3 · **Milestone:** M19

Capture expansion options (spin-off, sequel, adaptation) as structured records.

---

## 19. Settings, Admin, Accessibility, i18n

### FR-SET-001 — User settings
**Priority:** Should · **Phase:** 1

Profile display name, writing goals defaults, notification preferences.

### FR-SET-002 — Book settings
**Priority:** Should · **Phase:** 1

Publication type, milestone template, AI autonomy defaults, style guide link.

### FR-SET-003 — Org admin
**Priority:** Must · **Phase:** 3

Members, roles, API tokens, retention, billing hooks (future).

### FR-A11Y-001 — WCAG targeting
**Priority:** Should · **Phase:** 1 · **NFR link**

Keyboard navigation for shell + critical flows; labels on inputs; contrast compliant with design tokens.

### FR-I18N-001 — i18n readiness
**Priority:** Could · **Phase:** 3

UI strings externalizable; content language field on book.

---

## 20. Non-Functional Requirements (product-facing)

| ID | Requirement | Priority | Phase |
|---|---|---|---|
| `NFR-001` | Initial interactive load of shell < 3s on broadband | Must | 0 |
| `NFR-002` | Autosave manuscript p95 < 1.5s for chapter ≤50k chars | Must | 1 |
| `NFR-003` | RLS prevents cross-user data access (verified by tests) | Must | 0 |
| `NFR-004` | All mutations produce audit event for consequential types | Must | 1 |
| `NFR-005` | Agent job failures are visible and retryable | Must | 1 |
| `NFR-006` | Mobile-usable shell for triage & approvals | Should | 1 |
| `NFR-007` | Snapshot restore integrity 100% in automated tests | Must | 1 |
| `NFR-008` | Support books with 200+ chapters / 2000+ scenes without UI freeze (virtualization) | Should | 2 |
| `NFR-009` | Encrypt data in transit (TLS) and at rest (platform default) | Must | 0 |
| `NFR-010` | Feature flags for phased module rollout | Should | 1 |

---

## 21. Edge Cases & Error Handling (cross-cutting)

### FR-ERR-001 — Empty states
Every list view MUST have empty state + primary CTA.

### FR-ERR-002 — Partial failure on batch apply
Proposal apply is transactional; partial entity corruption MUST NOT occur.

### FR-ERR-003 — Deleted active book
If active book archived/deleted, context resets to next available or empty state.

### FR-ERR-004 — Offline
Phase 0: show error. Phase 2 Could: queue manuscript saves.

### FR-ERR-005 — Validation errors
Field-level messages; milestone gate errors aggregate with links.

### FR-ERR-006 — Concurrent editors (Phase 3)
Presence indicators Could; conflict resolution via version field Must.

---

## 22. Functional Epics → Sprint-sized capability slices

Use these as engineering epics (each vertical):

1. **E0.1** Auth + Books + Active context hardening  
2. **E0.2** Characters/Chapters CRUD polish + activity completeness  
3. **E0.3** Editorial Kanban + filters + severity  
4. **E0.4** Production/Marketing lists + dashboard widgets  
5. **E1.1** Universal header migration + status state machine  
6. **E1.2** Scenes + chapter planning fields + M6/M7 gates  
7. **E1.3** Manuscript Studio + revisions + word aggregates  
8. **E1.4** Locations + relationships + graph v1  
9. **E1.5** Milestone engine real gates + approvals + audit  
10. **E1.6** Snapshots + export/import JSON  
11. **E1.7** AI proposal pipeline + Continuity + Dev Editor  
12. **E2.1** Asset registry + metadata + preflight  
13. **E2.2** Marketing campaigns + messaging kit  
14. **E2.3** Agent roster expansion + cost telemetry  
15. **E2.4** Health scores + portfolio dashboard  
16. **E3.1** Orgs/roles/permissions  
17. **E3.2** Series/universe inheritance  
18. **E3.3** Rights + sales  
19. **E3.4** OPAS package + public API  

---

## 23. Acceptance packs per phase

### Phase 0 acceptance (functional)
- [ ] P-01 can create 2 books, switch context, manage characters/chapters  
- [ ] Editorial kanban moves issues across columns  
- [ ] Production & marketing items CRUD  
- [ ] Activity shows recent mutations  
- [ ] Lifecycle shows M0–M20 (even if gates soft)  
- [ ] Genome shell editable for core identity fields  
- [ ] Auth + RLS isolation verified  

### Phase 1 acceptance (functional)
- [ ] Scenes + relationships operational  
- [ ] Manuscript autosave + revision restore  
- [ ] Hard milestone gates for M2/M3/M6/M7/M8 path  
- [ ] Approvals inbox for AI proposals  
- [ ] Snapshot restore drill passes  
- [ ] Continuity Guardian creates issues from contradictions  

### Phase 2 acceptance (functional)
- [ ] Preflight blocks publish package gaps  
- [ ] Metadata export generated from SSOT  
- [ ] ≥12 agents runnable in propose mode  
- [ ] Health scores visible and explainable  

### Phase 3 acceptance (functional)
- [ ] Second user with editor role cannot edit rights  
- [ ] Series inheritance overrides work  
- [ ] Sales CSV import reflects in dashboard  
- [ ] OPAS export/import round-trips core entities  

---

## 24. Explicit Won’t (near-term)

| Item | Won’t until |
|---|---|
| Consumer reading app | Separate product |
| Fully autonomous AI publish | Policy change + Phase 3+ controls |
| Full ONIX 3.0 certification | After metadata subset proves value |
| Real-time multiplayer cursors | Phase 3+ |
| Native mobile apps | After web mobile-usable |

---

## Appendix A — Entity inventory (functional)

| Entity ID | Name | Phase | Owning module |
|---|---|---|---|
| `ENT-Org` | Organization | 3 (keys earlier) | Platform |
| `ENT-UserProfile` | User profile | 0 | Auth |
| `ENT-Membership` | Org membership | 3 | Platform |
| `ENT-Book` | Book | 0 | Library |
| `ENT-Series` | Series | 3 | Library |
| `ENT-Universe` | Universe | 3 | Library |
| `ENT-Character` | Character | 0 | Characters |
| `ENT-Chapter` | Chapter | 0 | Chapters |
| `ENT-Scene` | Scene | 1 | Scenes |
| `ENT-Location` | Location | 1 | Locations |
| `ENT-Relationship` | Relationship | 1 | Graph |
| `ENT-TimelineEvent` | Timeline event | 1 | Timeline |
| `ENT-Theme` | Theme | 1 | Themes |
| `ENT-CanonRule` | Canon rule | 1 | Canon |
| `ENT-SystemRule` | Magic/Tech system | 2 | World |
| `ENT-Manuscript` | Manuscript blob/meta | 1 | Manuscript |
| `ENT-Revision` | Revision | 1 | Manuscript |
| `ENT-EditorialIssue` | Editorial issue | 0 | Editorial |
| `ENT-ProductionTask` | Production task | 0 | Production |
| `ENT-Asset` | Asset | 2 | Production |
| `ENT-MarketingItem` | Marketing item | 0 | Marketing |
| `ENT-Campaign` | Campaign | 2 | Marketing |
| `ENT-Rights` | Rights record | 3 | Rights |
| `ENT-Sale` | Sale record | 3 | Sales |
| `ENT-MilestoneState` | Milestone state | 1 | Lifecycle |
| `ENT-Approval` | Approval request | 1 | Approvals |
| `ENT-AgentJob` | Agent job | 1 | AI |
| `ENT-Proposal` | AI proposal | 1 | AI |
| `ENT-Snapshot` | Snapshot | 1 | Platform |
| `ENT-Activity` | Activity/audit | 0 | Activity |
| `ENT-Notification` | Notification | 1 | Notifications |
| `ENT-StyleGuide` | Style guide | 2 | Editorial |

## Appendix B — Document control

| Version | Date | Notes |
|---|---|---|
| 1.0.0 | 2026-07-19 | Initial exhaustive FRD for full Book OS build |
