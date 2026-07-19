# Functional Requirements Document (FRD)
# MANGU Publishing Operating System (POS) / Book OS

| Field | Value |
|-------|-------|
| Document ID | `MANGU-POS-FRD-001` |
| Version | `1.0.0` |
| Status | **Binding for implementation & QA** |
| Companion | BRD `01-BRD-…`, Tech Spec `03-TECH-SPEC-…` |
| Requirement style | SHALL / SHOULD / MAY (RFC 2119) |

---

## 0. How to use this FRD

1. Every `FR-<MODULE>-###` is independently testable.
2. Acceptance criteria `AC-…` are the QA contract; a requirement is done only when all linked ACs pass.
3. Priority: **P0** (Phase 0–1 must), **P1** (Phase 2), **P2** (Phase 3), **P3** (Phase 4+).
4. Modules map to app surfaces and CAP-IDs from the BRD.
5. Edge cases and error behaviors are normative, not suggestions.

### 0.1 Global functional invariants

| ID | Statement | Priority |
|----|-----------|----------|
| `FR-GLOBAL-001` | The system SHALL treat the canonical database as the single source of truth for structured publication data. | P0 |
| `FR-GLOBAL-002` | The system SHALL NOT require users to re-enter an authoritative field in a second store to complete a supported workflow. | P0 |
| `FR-GLOBAL-003` | The system SHALL record an audit/event entry for create/update/delete of core entities and for milestone/approval/agent decisions. | P0 |
| `FR-GLOBAL-004` | The system SHALL enforce workspace isolation: users SHALL only read/write data for workspaces they belong to. | P0 |
| `FR-GLOBAL-005` | The system SHALL support progressive enrichment: records MAY be saved with sparse fields; required-field enforcement SHALL be milestone-gated, not create-gated (except minimal identity fields). | P0 |
| `FR-GLOBAL-006` | Generated documents/templates SHALL be derived views and SHALL NOT become alternate masters. | P0 |
| `FR-GLOBAL-007` | AI-originated mutations that affect canon, milestones ≥ advancement, or approved assets SHALL go through proposal + human approval. | P0 |
| `FR-GLOBAL-008` | The system SHALL provide responsive web UX usable on desktop and mobile viewports for primary workflows. | P0 |
| `FR-GLOBAL-009` | Destructive actions (delete book, hard-delete canon, purge snapshot) SHALL require explicit confirmation. | P0 |
| `FR-GLOBAL-010` | The system SHALL preserve referential integrity (no orphan scenes; FK-safe deletes or blocked deletes with explanation). | P0 |

---

## 1. Module Map

| Module code | Name | BRD CAPs | Primary UI |
|-------------|------|----------|------------|
| `AUTH` | Authentication & session | CAP-002 | AuthPage |
| `TENANT` | Org / workspace / members | CAP-001 | Settings (to build) |
| `LIB` | Publication library | CAP-003 | Library |
| `CMD` | Executive Command Center | CAP-029 | Dashboard |
| `GENOME` | Book Genome | CAP-004 | Genome |
| `CHAR` | Characters | CAP-005 | Characters |
| `STORY` | Story genome / creative health | CAP-006/013 | Genome/Lifecycle/Dashboard |
| `WORLD` | Locations & world | CAP-007 | (to build / Genome) |
| `CHAP` | Chapters | CAP-008 | Chapters |
| `SCENE` | Scenes | CAP-008 | (to build) |
| `MS` | Manuscript Studio | CAP-009 | Chapters / Studio |
| `GRAPH` | Relationships | CAP-010 | (graph view) |
| `CANON` | Canon & timeline | CAP-011 | (to build) |
| `LIFE` | Milestone Engine | CAP-012 | Lifecycle |
| `EDIT` | Editorial Intelligence | CAP-014 | Editorial |
| `PROD` | Production & assets | CAP-015–017 | Production |
| `META` | Metadata & ISBN | CAP-016 | Production/Metadata |
| `MKT` | Marketing | CAP-019 | Marketing |
| `PRICE` | Pricing | CAP-018 | (to build) |
| `SALES` | Sales facts & analytics | CAP-020 | (to build) |
| `RIGHTS` | Rights & licensing | CAP-021 | (to build) |
| `DEC` | Decisions | CAP-022 | Activity/Decisions |
| `WORK` | Work queue & notifications | CAP-023 | Activity |
| `SEARCH` | Search & command palette | CAP-024 | Global |
| `VER` | Versions, snapshots, import/export | CAP-025 | Library/Settings |
| `AI` | Governed AI agents | CAP-026 | AI Center |
| `AUTO` | Automations | CAP-027 | Settings/AI |
| `INTEL` | Publishing intelligence | CAP-028 | Dashboards |
| `A11Y` | Accessibility | NFR | Cross-cutting |

---

## 2. AUTH — Authentication & Session

### FR-AUTH-001 — Sign up / sign in
**Priority:** P0  
**SHALL** allow email/password authentication via Supabase Auth (or successor IdP) and establish a session.

**AC-AUTH-001**
1. Valid credentials create a session and land the user in an authenticated shell.
2. Invalid credentials show a non-enumerating error.
3. Signing out clears session and blocks protected routes.

### FR-AUTH-002 — Protected application shell
**Priority:** P0  
Unauthenticated users SHALL NOT access workspace data views.

**AC-AUTH-002**
1. Direct URL to `/` app routes redirects to auth when logged out.
2. API/data hooks return empty/error without leaking other users' data.

### FR-AUTH-003 — Password reset
**Priority:** P1  
**SHALL** support password reset email flow.

### FR-AUTH-004 — Session resilience
**Priority:** P0  
Refresh/reload SHALL restore session when refresh token valid.

---

## 3. TENANT — Organizations, Workspaces, Members

### FR-TENANT-001 — Organization & workspace model
**Priority:** P0  
System SHALL support Organization → Workspace → Membership hierarchy.

**AC-TENANT-001**
1. Creating an account provisions (or joins) at least one workspace.
2. Books and child entities require `workspace_id`.
3. Queries never return rows from other workspaces.

### FR-TENANT-002 — Invite member
**Priority:** P1  
Owner/publisher SHALL invite users by email with a role.

**AC-TENANT-002**
1. Invite creates membership on accept.
2. Invitee sees only that workspace's publications.
3. Role determines allowed mutations (see FR-TENANT-004).

### FR-TENANT-003 — Remove / disable member
**Priority:** P1  
Owner SHALL remove member; historical events retain actor identity.

### FR-TENANT-004 — RBAC enforcement
**Priority:** P0  
System SHALL enforce role/capability checks on privileged actions:

| Action | Minimum role/capability |
|--------|-------------------------|
| Create book | `author+` |
| Advance milestone | `publisher` or `milestone.approve` |
| Approve canon | `editor_dev+` or `canon.approve` |
| Approve asset | `producer+` or `asset.approve` |
| Approve agent proposal | capability `agent.approve` |
| Manage members | `owner`/`publisher` |

**AC-TENANT-004**
1. Unauthorized action returns permission error and creates no partial write.
2. UI hides or disables unauthorized controls.

### FR-TENANT-005 — Workspace settings
**Priority:** P1  
Workspace SHALL store settings JSON (house style link, default word goals, timezone, AI policy flags).

---

## 4. LIB — Publication Library

### FR-LIB-001 — Create publication
**Priority:** P0  
User SHALL create a Book with minimal fields: `title` (required), optional subtitle/genre/type, initial milestone `M0` or `M1` per policy.

**AC-LIB-001**
1. Create succeeds and appears in Library.
2. System assigns `id`, `record_code`, timestamps, `status=draft`, `current_milestone` default.
3. Event `EVT-book.created` recorded.

### FR-LIB-002 — List / filter / sort
**Priority:** P0  
Library SHALL list workspace books with filter by status, milestone, genre, owner; sort by updated, title, milestone.

### FR-LIB-003 — Active book context
**Priority:** P0  
Selecting a book SHALL set active book context used by all module views.

**AC-LIB-003**
1. Characters/Chapters/Editorial queries scope to active book.
2. Switching books updates all dependent views without stale data.

### FR-LIB-004 — Archive / restore
**Priority:** P1  
User with permission SHALL archive a book (hide from default library) and restore it.

### FR-LIB-005 — Book overview fields
**Priority:** P0  
Book record SHALL support: title, subtitle, series_name (or series_id P1), genre, publication_type, status, current_milestone, target_release_date, owner, word_count, word_goal, hook, logline, audience, primary_theme, tone, POV, cover_url, approval_state, version.

### FR-LIB-006 — Cover image
**Priority:** P1  
User SHALL attach/update cover image via storage-backed URL.

### FR-LIB-007 — Delete book
**Priority:** P1  
Delete SHALL require confirmation and capability; default SHOULD soft-delete/archive after M3.

---

## 5. CMD — Executive Command Center

### FR-CMD-001 — Portfolio snapshot
**Priority:** P0  
Dashboard SHALL show counts: total books, by status, by milestone band (pre-draft / draft / editorial / production / live), open critical editorial issues, upcoming deadlines (7/30 days).

### FR-CMD-002 — Risk strip
**Priority:** P1  
Dashboard SHALL surface top risks: blocked milestones, critical issues, missing required assets for books in M13+.

### FR-CMD-003 — Attention queue
**Priority:** P1  
Dashboard SHALL list items needing the current user's action (approvals, assigned issues, agent proposals).

### FR-CMD-004 — Drill-down
**Priority:** P0  
Each metric SHALL navigate to the filtered module view.

### FR-CMD-005 — Empty states
**Priority:** P0  
New workspaces SHALL see guided empty state CTA to create first book.

---

## 6. GENOME — Book Genome

### FR-GENOME-001 — Layered genome model
**Priority:** P0  
Book SHALL store a structured genome object covering layers:

1. Identity Genome  
2. Creative Genome  
3. Narrative Genome  
4. Character Genome (summary links)  
5. World Genome (summary links)  
6. Reader Experience Genome  
7. Commercial Genome  
8. Franchise Genome  
9. Publishing Genome  
10. Evolution Genome  

Sparse population allowed; schema MUST validate known keys.

### FR-GENOME-002 — Identity layer fields
**Priority:** P0  
SHALL support at minimum: working title, subtitle, authors/contributors, publication type, language, genre/subgenre, series positioning, logline, hook, audience.

### FR-GENOME-003 — Creative / narrative essentials
**Priority:** P0  
SHALL support theme, tone, premise, central conflict, stakes, promise to reader, POV strategy, structure pattern.

### FR-GENOME-004 — Commercial essentials
**Priority:** P1  
SHALL support positioning statement, comp titles, keywords, categories, pricing intent, territories intent.

### FR-GENOME-005 — Genome completeness score
**Priority:** P0  
System SHALL compute completeness % per layer and overall, weighted by current milestone requirements.

**AC-GENOME-005**
1. Score updates when fields change.
2. Lifecycle view shows genome readiness contribution.
3. Score is deterministic for same inputs.

### FR-GENOME-006 — Genome edit UX
**Priority:** P0  
User SHALL edit genome via sectioned form; save persists partial updates; concurrent edit SHOULD use version check (P1 optimistic concurrency).

### FR-GENOME-007 — Genome fingerprint (read-only derived)
**Priority:** P2  
System MAY compute a stable fingerprint/hash of approved genome for comparison across versions.

### FR-GENOME-008 — Template generation from genome
**Priority:** P1  
System SHALL generate at least: Concept Packet, Marketing Brief skeleton, Production Brief skeleton from genome fields.

---

## 7. CHAR — Characters

### FR-CHAR-001 — CRUD characters
**Priority:** P0  
User SHALL create/read/update/archive characters for the active book.

**AC-CHAR-001**
1. `name` required; `record_code` auto-generated unique per book.
2. List shows name, role, status, importance.
3. Delete/archive blocked if character is POV on scenes/chapters unless reassigned or force with warning.

### FR-CHAR-002 — Psychology-first fields
**Priority:** P0  
Character SHALL support: core_wound, core_desire, core_fear, need, want, lie_believed / misbelief, fatal_flaw, greatest_strength, motivation, internal_conflict, external_conflict, transformation/arc, voice_profile, summary, role, importance (0–100).

### FR-CHAR-003 — Identity & appearance fields
**Priority:** P1  
SHALL support aliases, titles, species, gender, age, birthday, occupation, height, hair, eyes, distinguishing features, clothing notes.

### FR-CHAR-004 — Character genome JSON
**Priority:** P1  
SHALL allow extended domains (Identity, Physical, Psychological, Personality, Behavioral, Relationship, Narrative, Communication, Skills, Cultural, Commercial, Evolution) in structured JSON without breaking core columns.

### FR-CHAR-005 — Story linkage fields
**Priority:** P1  
SHALL support introduction/final scene references, first/last appearance notes, secrets/reveals/foreshadowing lists.

### FR-CHAR-006 — Importance & casting
**Priority:** P0  
Importance score SHALL sort default lists; role taxonomy at least: protagonist, antagonist, ally, mentor, love_interest, sidekick, cameo, other.

### FR-CHAR-007 — Character completeness for milestones
**Priority:** P0  
For M3–M7 gates, system SHALL require psychology essentials for characters marked importance ≥ threshold (default 70) or role protagonist/antagonist.

---

## 8. STORY — Story Genome & Creative Health

### FR-STORY-001 — Story genome record
**Priority:** P1  
Book SHALL expose Story Genome domains: Identity, Premise, Narrative Structure, Conflict, Emotional, Theme, Mystery & Reveal, Pacing, Scene (summary), Character Dynamics, Reader Experience, Commercial, Continuity, Evolution.

### FR-STORY-002 — Story readiness / health score
**Priority:** P1  
System SHALL compute Story Health dimensions (e.g., premise clarity, stakes, structure coverage, pacing risk, theme integration) and show on Dashboard/Lifecycle.

### FR-STORY-003 — Beat / act structure
**Priority:** P1  
User SHALL define acts/beats linked to chapters (ordering + purpose).

### FR-STORY-004 — Conflict matrix
**Priority:** P2  
User MAY capture primary/secondary conflicts and opposition relationships.

---

## 9. WORLD — Locations & World Genome

### FR-WORLD-001 — Location CRUD
**Priority:** P1  
User SHALL manage locations with name, type, description, parent_location, risk, status, genome JSON.

### FR-WORLD-002 — Location hierarchy
**Priority:** P1  
Locations MAY nest (parent_location_id); cycles SHALL be rejected.

### FR-WORLD-003 — World genome essentials
**Priority:** P2  
Workspace/book SHALL store world-level rules: physics/magic/tech constraints, cultures summary, continuity rules.

### FR-WORLD-004 — Scene linkage
**Priority:** P1  
Scenes MAY reference location_id; location page lists referencing scenes.

---

## 10. CHAP — Chapters

### FR-CHAP-001 — Ordered chapter list
**Priority:** P0  
User SHALL create chapters with `sequence`, `title`, optional purpose, POV, emotional_shift, word_goal, word_count, status, manuscript.

**AC-CHAP-001**
1. Sequence unique per book.
2. Reorder updates sequences transactionally.
3. Book word_count recalculates from chapters (and scenes when present).

### FR-CHAP-002 — Chapter statuses
**Priority:** P0  
Status enum SHALL include at least: `planned`, `outlined`, `drafting`, `drafted`, `revising`, `approved`.

### FR-CHAP-003 — POV linkage
**Priority:** P0  
Chapter MAY link `pov_character_id`; display resolves character name.

### FR-CHAP-004 — Chapter planning fields
**Priority:** P0  
Purpose, stakes, cliffhanger/outcome notes, act reference (P1) supported.

### FR-CHAP-005 — Milestone relevance
**Priority:** P0  
M6 exit SHALL require N chapters (configurable) with purpose + sequence; M8 SHALL require word_count progress vs word_goal threshold.

---

## 11. SCENE — Scenes

### FR-SCENE-001 — Scene CRUD under chapter
**Priority:** P1  
User SHALL create scenes bound to a chapter with sequence unique within chapter.

### FR-SCENE-002 — Scene dramatic fields
**Priority:** P1  
SHALL support purpose, goal, conflict, outcome, emotional_shift, POV, location, status, word_count, genome JSON.

### FR-SCENE-003 — Scene characters participation
**Priority:** P1  
User SHALL attach characters to scenes with optional participation_role.

### FR-SCENE-004 — Orphan prevention
**Priority:** P1  
Deleting a chapter with scenes SHALL cascade or block per setting; default cascade with confirmation listing scene count.

### FR-SCENE-005 — M7 gate
**Priority:** P1  
M7 exit SHALL require scenes for each chapter or an explicit waiver Decision.

---

## 12. MS — Manuscript Studio

### FR-MS-001 — Edit manuscript text
**Priority:** P0  
User SHALL edit chapter manuscript in a focused editor; autosave SHALL persist within ≤ 3s idle debounce (configurable).

**AC-MS-001**
1. Reload shows last saved text.
2. Word count updates from manuscript (whitespace-normalized).
3. Save failure surfaces recoverable error; no silent data loss.

### FR-MS-002 — Scene-scoped writing (optional mode)
**Priority:** P1  
User MAY write at scene level; chapter manuscript can assemble from scenes or remain chapter-canonical (policy setting).

### FR-MS-003 — Find in manuscript
**Priority:** P1  
User SHALL search within active book manuscripts.

### FR-MS-004 — Revision snapshots on demand
**Priority:** P1  
User SHALL create named manuscript snapshot; restore creates new version (non-destructive).

### FR-MS-005 — Comment vs editorial issue bridge
**Priority:** P1  
User SHOULD convert a selection into an Editorial Issue with chapter/scene linkage.

### FR-MS-006 — Offline draft buffer
**Priority:** P2  
If network lost, editor MAY buffer locally and reconcile on reconnect with conflict notice.

---

## 13. GRAPH — Relationships

### FR-GRAPH-001 — Typed relationships
**Priority:** P1  
User SHALL create relationships: source_type/source_id, relationship_type, target_type/target_id, strength (0–100), confidence (0–100), status, evidence, effective_from/to.

### FR-GRAPH-002 — Relationship types catalog
**Priority:** P1  
System SHALL provide default types: family, friend, ally, enemy, rival, romance, mentor, student, member_of, located_in, foreshadows, contradicts, appears_in, owns, other — extensible per workspace.

### FR-GRAPH-003 — Graph visualization
**Priority:** P2  
System SHOULD render a navigable graph for character-centric and book-centric views.

### FR-GRAPH-004 — Integrity
**Priority:** P1  
Relationships SHALL reject dangling IDs; deleting entity SHALL cascade or nullify per type rules and warn user.

---

## 14. CANON — Canon Facts & Timeline

### FR-CANON-001 — Canon fact CRUD
**Priority:** P1  
User SHALL record canon facts: domain, fact, status, source_label, source entity, confidence, risk, effective_from/to, supersedes_id.

### FR-CANON-002 — Supersession
**Priority:** P1  
A new fact MAY supersede an old fact; UI shows chain; superseded facts remain readable.

### FR-CANON-003 — Continuity alerts
**Priority:** P2  
System SHOULD flag contradictions (e.g., conflicting attribute facts for same character domain) as editorial issues or continuity alerts.

### FR-CANON-004 — Timeline events
**Priority:** P1  
User SHALL manage timeline events with absolute and/or relative time, importance, location, canon_status, notes.

### FR-CANON-005 — Canon search
**Priority:** P1  
User SHALL search canon facts by text/domain/status.

### FR-CANON-006 — Series/universe canon scope
**Priority:** P2  
Canon facts MAY be scoped above book (series/universe) and inherited downward.

---

## 15. LIFE — Milestone Engine (M0–M20)

### FR-LIFE-001 — Milestone records
**Priority:** P0  
For each book, system SHALL maintain milestone records M0–M20 with code, name, description, status, readiness (0–100), approved_by/at.

### FR-LIFE-002 — Milestone statuses
**Priority:** P0  
Status values SHALL include: `locked`, `planned`, `in_progress`, `blocked`, `ready_for_review`, `approved`, `waived`.

### FR-LIFE-003 — Checklist items
**Priority:** P0  
Each milestone SHALL have milestone_items (title, completed, completed_by/at, position, metadata).

### FR-LIFE-004 — Readiness computation
**Priority:** P0  
Readiness SHALL combine checklist completion, genome/entity completeness rules, and blocking issues.

### FR-LIFE-005 — Advance milestone
**Priority:** P0  
Authorized user SHALL advance `current_milestone` only if exit criteria met OR waiver Decision linked.

**AC-LIFE-005**
1. Failed advance shows unmet criteria list.
2. Successful advance writes event + approval fields.
3. Next milestone becomes `in_progress`; previous `approved`/`waived`.

### FR-LIFE-006 — Exit criteria matrix (normative baseline)

| Milestone | Baseline exit criteria (SHALL unless waived) |
|-----------|-----------------------------------------------|
| M0 | Market rationale Decision recorded OR market notes fields completed |
| M1 | Title + logline/hook + audience present |
| M2 | Premise + central conflict + stakes present |
| M3 | Genome Identity+Creative+Narrative completeness ≥ configured threshold; protagonist character exists |
| M4 | Act/structure outline present (story architecture fields) |
| M5 | Outline packet fields / chapter plan draft exists |
| M6 | ≥ configured chapters with purpose + sequence |
| M7 | Scenes planned for chapters OR waiver |
| M8 | word_count ≥ configured % of word_goal; chapters not all `planned` |
| M9 | No open `critical` developmental issues; M9 checklist complete |
| M10 | M10 checklist complete; high line-level issues addressed per policy |
| M11 | Copyedit checklist complete |
| M12 | Proof checklist complete; zero critical open issues |
| M13 | Required assets approved for selected formats; metadata completeness ≥ threshold |
| M14 | ≥1 campaign in ready/scheduled state; marketing brief exists |
| M15 | Distribution targets selected; pricing record exists; pre-launch checklist green |
| M16 | Publisher approval; publication date set; products marked released |
| M17 | Post-launch monitoring checklist started |
| M18 | Catalog placement notes recorded |
| M19 | Franchise/rights expansion Decision accept/reject recorded |
| M20 | Legacy stewardship plan fields recorded |

### FR-LIFE-007 — Lifecycle UI
**Priority:** P0  
Lifecycle view SHALL show all milestones, current pointer, readiness, blockers, and CTA to advance/approve.

### FR-LIFE-008 — Rollback
**Priority:** P1  
Authorized user MAY move current milestone backward with mandatory rationale Decision.

### FR-LIFE-009 — Parallel tracking post-M16
**Priority:** P1  
M17–M20 SHALL be trackable without blocking catalog operations on other titles.

---

## 16. EDIT — Editorial Intelligence

### FR-EDIT-001 — Editorial issue CRUD
**Priority:** P0  
User SHALL create issues with title, category, severity, status, description, suggested_fix, optional chapter/scene/character links, assignee.

### FR-EDIT-002 — Categories
**Priority:** P0  
Categories SHALL include: Story, Character, Dialogue, Pacing, Continuity, Timeline, Theme, Voice, Grammar, Formatting, Research, Historical Accuracy, Legal, Sensitivity, Accessibility, Metadata, Marketing, Production, Other.

### FR-EDIT-003 — Severity scale
**Priority:** P0  
Severity: `critical`, `high`, `medium`, `low` with meanings per BRD/Manual (critical blocks publication milestones).

### FR-EDIT-004 — Issue workflow
**Priority:** P0  
Statuses SHALL support: `open`, `triaged`, `in_progress`, `resolved`, `verified`, `closed`, `wont_fix`.

**AC-EDIT-004**
1. Transition `resolved` → `verified` requires different user when possible (P1) or capability `editorial.verify`.
2. Closing critical issue requires resolution text.
3. Severity ≥ high SHOULD require root_cause or lesson_learned on close (warning if missing; enforce P1).

### FR-EDIT-005 — Kanban / filters
**Priority:** P0  
Editorial view SHALL support board/list, filter by severity/category/assignee/status/chapter.

### FR-EDIT-006 — Editorial quality score
**Priority:** P1  
System SHALL compute Editorial Quality Index dimensions and store snapshots over time.

### FR-EDIT-007 — Style guide
**Priority:** P1  
Workspace/book SHALL store style guide rules; issue MAY reference rule id.

### FR-EDIT-008 — Sensitivity review records
**Priority:** P1  
System SHALL support structured sensitivity/specialist reviews with recommendations and approval.

### FR-EDIT-009 — Fact verification records
**Priority:** P2  
Claims MAY be tracked with citation, verification status, confidence, reviewer.

### FR-EDIT-010 — Blocking rules
**Priority:** P0  
Open `critical` issues SHALL block FR-LIFE advance into M13+ (and SHOULD block M12 approval) unless waiver Decision.

---

## 17. PROD — Production & Asset Registry

### FR-PROD-001 — Asset registry CRUD
**Priority:** P1  
User SHALL register assets: name, asset_type, format, storage path/url, status, version, checksum, metadata, approvals.

### FR-PROD-002 — Asset types
**Priority:** P1  
Types SHALL include: front_cover, back_cover, spine, dust_jacket, interior_pdf, epub, mobi, kpf, audiobook_master, author_photo, press_kit, marketing_image, trailer, social_graphic, mockup_3d, other.

### FR-PROD-003 — Asset approval workflow
**Priority:** P1  
Statuses: `draft`, `review`, `approved`, `rejected`, `deprecated`. Approval sets approved_by/at.

### FR-PROD-004 — File upload
**Priority:** P1  
User SHALL upload binary to private storage; system stores bucket/path/checksum; download requires authz.

### FR-PROD-005 — Preflight checklist
**Priority:** P1  
Production module SHALL present format-specific preflight items (ebook TOC, cover dimensions, ISBN presence, accessibility notes).

### FR-PROD-006 — Production tasks
**Priority:** P0  
User SHALL track production tasks (title, status, due, assignee) linked to book/asset.

### FR-PROD-007 — Multi-product derivation
**Priority:** P1  
Book SHALL support multiple product targets (print, ebook, audio, large_print, translation) each referencing assets.

### FR-PROD-008 — M13 gate binding
**Priority:** P1  
M13 exit SHALL require approved assets for all product targets marked `required` for release.

---

## 18. META — Metadata & ISBN

### FR-META-001 — Metadata record
**Priority:** P1  
Book SHALL have metadata fields: description/blurb, keywords[], bisac/categories[], language, contributors[], age_range, series metadata, publication date, publisher name, imprint, copyright.

### FR-META-002 — ISBN management
**Priority:** P1  
System SHALL track ISBN records per format/product: isbn13, assignment status, carrier format, notes.

### FR-META-003 — Metadata completeness score
**Priority:** P1  
Score SHALL feed M13–M15 readiness.

### FR-META-004 — Metadata packet export
**Priority:** P2  
System SHOULD export JSON/CSV metadata packet; ONIX XML MAY be Phase 4.

---

## 19. MKT — Marketing Operations

### FR-MKT-001 — Campaign CRUD
**Priority:** P0  
User SHALL create campaigns: name, channel, objective, budget, status, progress, KPIs JSON, start/end.

### FR-MKT-002 — Marketing items / tasks
**Priority:** P0  
User SHALL track marketing items linked to book/campaign.

### FR-MKT-003 — Brief generation
**Priority:** P1  
System SHALL generate marketing brief from Book Genome commercial/reader layers + logline/hook/audience/comps.

### FR-MKT-004 — Launch checklist
**Priority:** P1  
M14/M15 checklists include cover reveal, ARC, retail links, email, social assets — tracked as milestone_items or marketing items.

### FR-MKT-005 — Channel taxonomy
**Priority:** P1  
Channels include: email, site, social, ads, influencers, press, events, retail, other.

---

## 20. PRICE / SALES / RIGHTS

### FR-PRICE-001 — Price records
**Priority:** P2  
User SHALL store price records: currency, amount, territory, format/product, effective dates, status.

### FR-SALES-001 — Sales fact ingest
**Priority:** P2  
User SHALL import sales facts (CSV): date, channel, units, royalty, currency, ISBN/product link.

### FR-SALES-002 — Sales dashboard
**Priority:** P2  
System SHALL show units/revenue by title/channel/time.

### FR-RIGHTS-001 — Rights records
**Priority:** P2  
User SHALL track rights: right_type, territory, exclusive, licensee, start/end, status, notes.

### FR-RIGHTS-002 — License deals
**Priority:** P2  
User SHALL track license deals linked to rights with commercial terms JSON.

### FR-RIGHTS-003 — Expiration alerts
**Priority:** P2  
System SHOULD notify rights_manager N days before expiration.

---

## 21. DEC — Decisions

### FR-DEC-001 — Decision CRUD
**Priority:** P0  
User SHALL record decisions: title, decision, rationale, owner, status, approvals.

### FR-DEC-002 — Linkage
**Priority:** P0  
Decisions SHALL link to book and MAY link to milestone advancement, waiver, agent proposal, rights outcome.

### FR-DEC-003 — Immutable history
**Priority:** P1  
Approved decisions SHALL be immutable except superseding decision record.

---

## 22. WORK — Work Queue, Notifications, Activity

### FR-WORK-001 — Activity feed
**Priority:** P0  
User SHALL see chronological activity for workspace/book (events).

### FR-WORK-002 — Notifications
**Priority:** P1  
System SHALL create notifications for assignments, approvals requested, agent completions, milestone blocks.

### FR-WORK-003 — Work queue
**Priority:** P1  
User SHALL see unified queue of assigned issues, tasks, proposals.

### FR-WORK-004 — Mark read
**Priority:** P1  
User SHALL mark notifications read / read all.

---

## 23. SEARCH — Search & Command Palette

### FR-SEARCH-001 — Global search
**Priority:** P1  
User SHALL search across books, characters, chapters, issues, assets by title/name/record_code.

### FR-SEARCH-002 — Command palette
**Priority:** P1  
Keyboard-accessible palette SHALL navigate to modules and common create actions.

### FR-SEARCH-003 — Recent items
**Priority:** P1  
Palette SHALL show recently visited entities.

---

## 24. VER — Versioning, Snapshots, Import/Export

### FR-VER-001 — Entity version snapshots
**Priority:** P1  
On significant updates (or explicit save-as-version), system SHALL store entity_versions snapshot JSON.

### FR-VER-002 — Project snapshot
**Priority:** P1  
User SHALL create workspace/book snapshot bundle; restore into new working state without destroying audit log.

### FR-VER-003 — Export JSON
**Priority:** P0  
User SHALL export book package (genome + characters + chapters + scenes + issues + assets metadata) as JSON.

### FR-VER-004 — Import JSON
**Priority:** P1  
User SHALL import package into workspace with ID remapping and conflict report.

### FR-VER-005 — Prototype migration
**Priority:** P1  
System SHOULD import v0.2 prototype export shape where feasible.

---

## 25. AI — Governed AI Agent Workforce

### FR-AI-001 — Agent registry
**Priority:** P2  
System SHALL list agents with key, name, description, allowed tools, risk class, version.

### FR-AI-002 — Baseline agents (catalog)
**Priority:** P2  
System SHALL support (stubs allowed until wired) at least:

| Agent key | Responsibility |
|-----------|----------------|
| `AGT-executive-publisher` | Portfolio prioritization suggestions |
| `AGT-market-intelligence` | M0 market notes / comps |
| `AGT-concept-architect` | Concept framing |
| `AGT-story-architect` | Structure/beats |
| `AGT-character-psychologist` | Psychology gaps |
| `AGT-world-builder` | World consistency suggestions |
| `AGT-plot-engineer` | Plot hole detection |
| `AGT-chapter-planner` | Chapter purpose suggestions |
| `AGT-scene-director` | Scene goal/conflict suggestions |
| `AGT-dialogue-coach` | Dialogue notes |
| `AGT-dev-editor` | Developmental issue proposals |
| `AGT-continuity-guardian` | Continuity alerts |
| `AGT-copy-editor` | Copy issues |
| `AGT-fact-checker` | Claim checks |
| `AGT-production-coordinator` | Production checklist gaps |
| `AGT-marketing-strategist` | Campaign suggestions |
| `AGT-metadata-specialist` | Metadata completeness |
| `AGT-rights-manager` | Rights gap suggestions |
| `AGT-sales-analyst` | Sales insights |
| `AGT-portfolio-manager` | Catalog recommendations |
| `AGT-executive-copilot` | Cross-domain briefings |

### FR-AI-003 — Agent run lifecycle
**Priority:** P2  
Runs SHALL track: queued → running → awaiting_approval → completed/failed/cancelled with input_context, output, model_metadata, timings.

### FR-AI-004 — Proposal model
**Priority:** P2  
Agent output that mutates data SHALL be a proposal: target entity, patch, rationale, risk class; human approve/reject.

**AC-AI-004**
1. Approve applies patch atomically and writes event with agent_key + approver.
2. Reject stores reason; no mutation.
3. Critical risk proposals require publisher role.

### FR-AI-005 — Shared memory
**Priority:** P2  
Approved decisions and style constraints SHALL be retrievable as agent memory for the book/workspace.

### FR-AI-006 — Human override
**Priority:** P0  
Humans SHALL always be able to edit entities directly without agent involvement.

### FR-AI-007 — AI Center UI
**Priority:** P1  
AI Center SHALL list available agents, past runs, pending proposals, and policy notices.

### FR-AI-008 — Safety
**Priority:** P0  
System SHALL refuse agent tools that bypass RLS; service role usage confined to server-side workers.

---

## 26. AUTO — Automations

### FR-AUTO-001 — Automation CRUD
**Priority:** P2  
User SHALL define trigger_key, condition JSON, action_key/config, enabled flag.

### FR-AUTO-002 — Baseline triggers
**Priority:** P2  
Triggers include: `milestone.readiness_changed`, `issue.created`, `issue.severity_critical`, `asset.uploaded`, `agent.run_completed`, `deadline.approaching`.

### FR-AUTO-003 — Baseline actions
**Priority:** P2  
Actions include: `notify.user`, `notify.role`, `workitem.create`, `agent.enqueue`, `checklist.add`.

### FR-AUTO-004 — Run audit
**Priority:** P2  
Each automation execution increments run_count and logs event.

---

## 27. INTEL — Publishing Intelligence

### FR-INTEL-001 — Domain dashboards
**Priority:** P2  
System SHOULD provide dashboards: Executive, Portfolio, Creative, Editorial, Production, Marketing, Sales, Rights, Financial (stub ok), Operational.

### FR-INTEL-002 — Metric snapshots
**Priority:** P2  
Nightly (or on-demand) job MAY snapshot portfolio metrics for trend lines.

### FR-INTEL-003 — Predictive stubs
**Priority:** P3  
System MAY expose predictive fields (slip risk, launch readiness forecast) clearly labeled as estimates.

---

## 28. SERIES / UNIVERSE (Franchise containers)

### FR-SERIES-001 — Series entity
**Priority:** P2  
User SHALL create Series with shared bible fields; books MAY belong to series with reading/publication order.

### FR-UNIV-001 — Universe entity
**Priority:** P3  
User SHALL create Universe containing series; inheritance rules apply.

### FR-SERIES-002 — Inheritance visibility
**Priority:** P2  
Book views SHOULD show inherited universe/series constraints and allow explicit overrides with audit.

---

## 29. A11Y & UX Cross-Cutting

### FR-A11Y-001 — Keyboard access
**Priority:** P0  
Primary navigation, editors, and dialogs SHALL be keyboard operable.

### FR-A11Y-002 — Labels & contrast
**Priority:** P0  
Form controls SHALL have labels; text contrast meets WCAG AA for primary surfaces.

### FR-A11Y-003 — Toasts & errors
**Priority:** P0  
Errors SHALL be perceivable beyond color alone.

### FR-UX-001 — Unsaved changes guard
**Priority:** P1  
Navigating away from dirty editors SHALL prompt confirm.

### FR-UX-002 — Toast feedback
**Priority:** P0  
Successful saves/advances SHALL confirm via toast or inline status.

### FR-UX-003 — Record codes visible
**Priority:** P1  
UI SHOULD show record_code for support/debug and canon citation.

---

## 30. Use Cases (selected end-to-end)

### UC-LIFE-001 — Advance from draft to developmental edit
1. Author completes M8 checklist and word goal threshold.  
2. System marks M8 ready_for_review.  
3. Publisher/editor approves advance to M9.  
4. Events and notifications created.  
**Passes if:** FR-LIFE-005/006, FR-WORK-002 satisfied.

### UC-EDIT-001 — Continuity issue to resolution
1. Editor creates Continuity/high issue linked to character + chapter.  
2. Author resolves with resolution text + lesson.  
3. Editor verifies and closes.  
4. Quality score updates.  
**Passes if:** FR-EDIT-001–004, FR-EDIT-006.

### UC-PROD-001 — Ebook asset approval gate
1. Producer uploads EPUB asset.  
2. Preflight checklist completed.  
3. Asset approved.  
4. M13 readiness increases; without approval advance blocked.  
**Passes if:** FR-PROD-001–008, FR-LIFE-006.

### UC-AI-001 — Character psychologist proposal
1. User runs `AGT-character-psychologist`.  
2. Agent proposes patch to core_fear.  
3. User rejects with reason; character unchanged.  
4. Second run; user approves; character updates; event recorded.  
**Passes if:** FR-AI-003–005.

### UC-TENANT-001 — Contractor limited access
1. Publisher invites freelancer as `editor_line`.  
2. Freelancer can resolve grammar issues, cannot advance milestone to M16, cannot approve canon.  
**Passes if:** FR-TENANT-002/004.

---

## 31. Non-Functional Requirements (Functionalized)

| ID | Requirement | Priority |
|----|-------------|----------|
| `FR-NFR-001` | Interactive p95 page data load for library ≤ 2s on staging dataset of 200 books | P1 |
| `FR-NFR-002` | Manuscript autosave durability: ≤ 0.1% lost-edit incidents in UAT | P0 |
| `FR-NFR-003` | CI SHALL run typecheck, lint, unit tests, build on every PR | P0 |
| `FR-NFR-004` | RLS/tenancy regression tests SHALL run in CI for Phase 1+ | P0 |
| `FR-NFR-005` | System SHALL support browser Chrome/Firefox/Safari latest -1 | P0 |
| `FR-NFR-006` | All migrations SHALL be forward-only and documented | P0 |
| `FR-NFR-007` | Secrets rotation SHALL NOT require client app rewrite beyond env | P1 |

---

## 32. Error Handling Requirements

### FR-ERR-001
All mutative UX SHALL surface failures with actionable messages (permission, validation, network).

### FR-ERR-002
Validation errors SHALL name fields and milestone relevance when gate-related.

### FR-ERR-003
Partial multi-entity transactions SHALL roll back (e.g., chapter reorder).

### FR-ERR-004
Agent failures SHALL mark run `failed` with error summary; no half-applied proposals.

---

## 33. Data Validation Rules (selected)

| Field | Rule |
|-------|------|
| word_count / word_goal | integer ≥ 0 |
| importance / readiness / progress / confidence / strength | 0–100 |
| email invites | valid email |
| sequences | integer ≥ 1 (or ≥ 0 if standardized), unique in scope |
| record_code | unique in scope; immutable after create (P1) |
| milestone codes | only M0–M20 |
| severity | enum only |
| ISBN-13 | checksum validation when present |

---

## 34. Appendix A — Traceability Matrix (excerpt)

| FR | CAP | TS component | Phase |
|----|-----|--------------|-------|
| FR-AUTH-* | CAP-002 | TS-SEC-AUTH | 0 |
| FR-TENANT-* | CAP-001 | TS-DATA-TENANT | 0–1 |
| FR-LIB-* | CAP-003 | TBL-books | 1 |
| FR-GENOME-* | CAP-004 | books.genome + TS-GENOME | 1 |
| FR-CHAR-* | CAP-005 | TBL-characters | 1 |
| FR-CHAP-/MS-* | CAP-008/009 | TBL-chapters | 1 |
| FR-LIFE-* | CAP-012 | TBL-milestones | 1 |
| FR-EDIT-* | CAP-014 | TBL-editorial_issues | 1 |
| FR-SCENE-/WORLD-/GRAPH-/CANON-* | CAP-007/010/011 | legacy-schema tables | 2 |
| FR-PROD-/META-* | CAP-015/016 | TBL-assets | 2 |
| FR-AI-/AUTO-* | CAP-026/027 | TBL-agent_runs | 3 |
| FR-SALES-/RIGHTS-/PRICE-* | CAP-018/020/021 | new commercial tables | 3 |
| FR-SERIES-/UNIV-/INTEL-* | CAP-028/030 | platform services | 3–4 |

---

## 35. Appendix B — QA Master Test Themes

1. Tenancy isolation matrix  
2. Milestone gate matrix M0–M16  
3. Editorial severity blocking  
4. Manuscript autosave/restore  
5. Asset approval gating  
6. Agent proposal approve/reject  
7. Export/import round-trip  
8. Permission matrix by role  
9. Accessibility smoke  
10. Command Center metric accuracy  

---

## 36. Document Control

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-07-19 | Initial exhaustive FRD for POS engineering |

*End of FRD — implement against Tech Spec component contracts.*
