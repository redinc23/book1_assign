# Business Requirements Document (BRD)
# MANGU Book Operating System (Book OS)

| Field | Value |
|---|---|
| Document ID | MANGU-BRD-001 |
| Version | 1.0.0 |
| Status | Approved for Engineering Kickoff |
| Date | 2026-07-19 |
| Owner | Mangu Publishers Product & Publishing Leadership |
| Audience | Executives, Product, Engineering, Design, Editorial Ops, AI, QA |
| Source of Truth | MANGU Book OS Manual v1.0 (Volumes I–XVIII) + Product Prototype v0.2 + React/Supabase canonical app |
| Related Documents | `02-FRD-MANGU-Book-OS.md`, `03-TECH-SPEC-MANGU-Book-OS.md`, `00-INDEX.md` |

---

## 0. Document Control

### 0.1 Purpose of This BRD
This BRD defines **why** MANGU Book OS must be built, **who** it serves, **what business outcomes** it must deliver, **what is in/out of scope**, success metrics, risks, constraints, and release phasing. It is the contract between business stakeholders and the delivery organization.

### 0.2 How to Use With FRD & Tech Spec
- **BRD (this document):** business problem, goals, personas, scope, KPIs, non-goals, commercial model assumptions, governance.
- **FRD:** exhaustive functional requirements, user stories, acceptance criteria, UX flows, state machines, edge cases.
- **Tech Spec:** architecture, data model, APIs, AI ADK, security, infra, SLAs, migration, testing strategy.

### 0.3 Change Control
Any change that alters scope, milestones, roles, commercial claims, or compliance posture requires BRD revision + stakeholder sign-off. FRD/Tech Spec may refine implementation detail without BRD change unless business intent shifts.

### 0.4 Definitions
| Term | Definition |
|---|---|
| Book OS | End-to-end publishing operating system: Creative OS + Publishing OS + Intelligence OS |
| Book Genome | Canonical structured attribute set describing a publication as knowledge, not just a file |
| Single Source of Truth (SSOT) | PostgreSQL/Supabase knowledge store; documents/templates are derived views |
| Milestone (M0–M20) | Readiness gate answering “What must be true before we move forward?” |
| Canon | Approved factual truth for a story universe; supersedable with history |
| Agent | Specialized AI worker with role, tools, memory, KPIs, and human governance |
| Workspace | Tenant subdivision (e.g., Fiction, Children’s, Comics) under an Organization |
| Proposal | AI-suggested change that cannot mutate SSOT until human approval (per governance level) |
| Packet | Generated document view (Character Bible, Marketing Brief, etc.) from SSOT |
| Readiness Score | 0–100 composite indicating fitness to advance a milestone |

---

## 1. Executive Summary

### 1.1 The Problem
Publishing workflows are fragmented across outlines, manuscripts, character notes, spreadsheets, editorial comments, metadata sheets, marketing docs, design requests, and production trackers. Each artifact evolves independently, creating:

1. **Duplicated work** — the same fact re-entered in 6–12 places.
2. **Competing truths** — protagonist name, timeline, or metadata diverge.
3. **Lost institutional memory** — decisions and lessons die in email threads.
4. **Manual synchronization tax** — meetings exist to reconcile versions.
5. **Late discovery of defects** — continuity/metadata/rights issues surface at production or launch.
6. **AI without grounding** — generic LLM use invents contradictions because there is no shared structured memory.

### 1.2 The Solution
Build **MANGU Book Operating System (Book OS)**: a cloud-native, knowledge-centric publishing platform where every fact about a publication exists once, is versioned, permissioned, auditable, and reusable across creative development, editorial, production, marketing, rights, sales, and AI agents.

### 1.3 Mission
> Create the world's most complete publishing operating system, capable of taking a publication from an idea to a globally distributed product using structured data, intelligent workflows, AI-assisted creation, and human review.

### 1.4 Vision Statement
> Every piece of information about a publication should exist once, in one authoritative location, and be reusable everywhere else.

### 1.5 Long-Term Product Ambition
Publication-agnostic core supporting: books, comics, graphic novels, manga, newspapers, magazines, journals, educational materials, children’s books, interactive books, digital publications, audiobooks, multimedia, and future formats — via extensible modules sharing one data model.

### 1.6 Three Intertwined Operating Domains
| Domain | Responsibility |
|---|---|
| **Creative OS** | Conceive, structure, write, edit, evolve stories (genomes, manuscript, continuity) |
| **Publishing OS** | Produce, market, distribute, license, financially steward IP |
| **Intelligence OS** | Knowledge graph, analytics, AI agents, decision support across the catalog |

### 1.7 Immediate Business Outcome (Why Now)
Mangu Publishers needs a production-grade system for developers to implement against a single, unambiguous specification — replacing prototype ambiguity with engineering-ready requirements that preserve the Manual’s philosophy while aligning to the current React + TypeScript + Supabase canonical codebase.

---

## 2. Business Objectives & Success Criteria

### 2.1 Primary Business Objectives
| ID | Objective | Measurable Outcome |
|---|---|---|
| BO-01 | Establish SSOT for every active title | ≥95% of project facts retrieved from platform; zero parallel “master spreadsheets” for active titles |
| BO-02 | Compress idea→launch cycle time | ≥25% reduction in calendar time from M1→M16 for titles run fully on Book OS (vs baseline) |
| BO-03 | Reduce continuity / metadata defects escaping to launch | ≥50% reduction in post-upload critical corrections |
| BO-04 | Make AI operationally useful under governance | ≥60% of AI proposals reviewed; ≥40% accepted with edits; 0 unauthorized SSOT mutations by agents |
| BO-05 | Preserve institutional knowledge | 100% of milestone gate decisions logged with actor, rationale, timestamp |
| BO-06 | Enable multi-role collaboration | ≥5 concurrent roles can work a single title without file-pass conflicts |
| BO-07 | Portfolio visibility for leadership | Executive dashboard answers “what is blocked / at risk / ready” in <60 seconds |
| BO-08 | Extensibility toward industry platform | Architecture supports org/workspace multi-tenancy and future OPAS/ONIX exports |

### 2.2 Non-Goals (Explicit)
| ID | Non-Goal | Rationale |
|---|---|---|
| NG-01 | Fully autonomous book writing without humans | Manual mandates AI recommends; humans decide |
| NG-02 | Replacing professional editorial judgment | AI diagnoses; editors decide |
| NG-03 | Building a consumer reading social network (v1) | Out of scope for core OS |
| NG-04 | Becoming a print manufacturer | Integrate/export; do not operate presses |
| NG-05 | Guaranteeing commercial sales outcomes | System improves readiness & intelligence; market risk remains |
| NG-06 | Supporting every retailer API on day one | Phased integrations |
| NG-07 | Migrating historical industry catalogs at launch | Import tools later; start with Mangu active titles |

### 2.3 Success Metrics (KPIs)
#### Product / Ops KPIs
- Time-to-first structured Book Genome for a new project < 1 business day
- Milestone readiness scores visible for 100% of active books
- Mean time to resolve critical editorial issues < 5 business days
- Asset/version findability: users locate correct cover/file in < 30 seconds
- Audit completeness: 100% of approval-gated actions emit events

#### Quality KPIs
- Continuity Guardian false-negative rate tracked; target continuous improvement
- Manuscript autosave reliability ≥ 99.9% of save attempts succeed
- Zero data loss on snapshot restore for last N snapshots

#### AI KPIs
- Hallucination escalation rate (human marks “wrong/ungrounded”) trending down
- Human acceptance rate of proposals trending up after onboarding
- P95 agent run latency within SLA per agent class

#### Business KPIs
- Active titles managed in Book OS / total active titles
- Stakeholder NPS (authors, editors, production, marketing)
- Hours/week saved on status meetings (surveyed)

---

## 3. Stakeholders & Personas

### 3.1 Stakeholder Map
| Stakeholder | Interest | Influence | Engagement |
|---|---|---|---|
| Publisher / Executives | Portfolio risk, schedule, revenue, IP | High | Approvals, roadmap |
| Authors / Co-authors | Creative flow, clarity, less admin | High | Daily use |
| Editors (all levels) | Issue quality, continuity, gates | High | Daily use |
| Production / Design | Assets, specs, preflight | High | Milestone M13 |
| Marketing / Sales | Messaging, campaigns, comps, metrics | Medium-High | M14–M17 |
| Rights / Legal | Contracts, territories, renewals | Medium-High | Continuous |
| Engineering | Buildable clarity, stable domain model | High | Delivery |
| AI / Data | Grounded agents, ontology, evals | High | ADK |
| Beta readers / Translators / Partners | Scoped portals | Medium | Later phases |

### 3.2 Primary Personas (Detailed)

#### P-01 — Indie / House Author (“Ava”)
- **Goals:** Develop story deeply, write fast, keep characters consistent, avoid retyping bios into marketing forms.
- **Frustrations:** Notes scattered; AI chats invent facts; editors ask questions already answered somewhere.
- **Jobs-to-be-done:** Capture genome → plan chapters/scenes → draft in Studio → respond to editorial issues.
- **Success:** Feels guided by structure without bureaucracy choking creativity.

#### P-02 — Developmental / Managing Editor (“Marcus”)
- **Goals:** See story health, track issues by severity, gate milestones honestly.
- **Frustrations:** Word docs + email; no single issue database; unclear whether “ready” is real.
- **JTBD:** Triage issues, assign work, approve M9–M12 exits, request AI continuity passes.
- **Success:** Dashboard shows blockers; every issue has owner + resolution lesson.

#### P-03 — Production Lead (“Priya”)
- **Goals:** Correct files, ISBNs, metadata, accessibility, retailer packages.
- **Frustrations:** Wrong cover version shipped; metadata diverges from manuscript title.
- **JTBD:** Asset registry, preflight, approve M13, export packages.
- **Success:** Launch blocked automatically until production readiness = 100%.

#### P-04 — Marketing Manager (“Leo”)
- **Goals:** Positioning from truth (logline/USP/comps already in genome), campaign execution.
- **Frustrations:** Recreating messaging from scratch; stale comps.
- **JTBD:** Pull packets from SSOT, build campaigns, track KPIs, feed learnings back.
- **Success:** Campaigns linked to book; post-launch lessons become org memory.

#### P-05 — Publisher / Executive (“Faith”)
- **Goals:** Know portfolio health, approve high-impact moves, protect IP.
- **Frustrations:** Twenty spreadsheets; surprises at launch.
- **JTBD:** Executive Center + Copilot briefings; authorize publication; rights alerts.
- **Success:** One morning brief: risks, deadlines, opportunities.

#### P-06 — Platform Engineer (“Dev”)
- **Goals:** Clear domain model, RLS-safe multi-tenant data, testable AI tool contracts.
- **Frustrations:** Ambiguous “genome” fields; prototype vs production drift.
- **JTBD:** Implement FRD IDs; migrate from prototype; keep CI green.
- **Success:** Spec IDs map 1:1 to tickets and acceptance tests.

---

## 4. Current State vs Future State

### 4.1 Current State (As of this repo)
| Area | State |
|---|---|
| Canonical app | React + TypeScript + Vite + Supabase Auth |
| Deploy | Vercel SPA |
| Data | Early migrations: `books`, `characters`, `chapters`, `editorial_tasks`, `production_tasks`, `marketing_items`, `activity_log` — user-scoped RLS |
| Prototype reference | Local-first v0.2 HTML kernel: lifecycle M0–M20, genome, manuscript studio, graph, AI proposals, snapshots, work queue |
| Reference schema | `prototype-reference/legacy-schema.sql` — richer org/workspace model not yet fully applied |
| AI | Heuristic insights in UI; not yet governed agent runs with tools |
| Gaps | Scenes, locations, relationships, canon, milestones engine, assets bucket, RBAC, rights, sales, ADK, semantic search |

### 4.2 Future State
A multi-tenant publishing OS with knowledge graph, milestone engine, manuscript studio, editorial intelligence, production/marketing/rights/sales modules, governed multi-agent AI, versioning, audit, portals, and standards-aligned export — as specified in Manual Volumes I–XVIII.

### 4.3 Migration Principle
> Do not merge two front ends blindly. Keep one canonical domain model and selectively absorb the strongest components from the prototype into the React/Supabase app.

---

## 5. Design Philosophy (Business Rules That Never Bend)

| ID | Principle | Business Implication |
|---|---|---|
| DP-01 | Single Source of Truth | SSOT is the database; Docs/PDFs/packets are generated views |
| DP-02 | Structured Before Narrative | Capture wound/fear/goal before prose whenever possible |
| DP-03 | Progressive Enrichment | Start sparse; deepen over milestones; never force 500 fields on day one |
| DP-04 | Reusability | Theme/character/comps feed creative + marketing + education packs |
| DP-05 | Modular Design | Modules evolve independently; share IDs/relationships |
| DP-06 | Readiness Over Vanity Metrics | Word count ≠ readiness; gates ask “what must be true?” |
| DP-07 | AI Is an Employee | Agents have roles, limits, KPIs, escalation; not a magic box |
| DP-08 | AI Recommends, Humans Decide | Authority matrix is non-negotiable |
| DP-09 | Archive, Don’t Destroy | IDs never reused; soft-archive preserves history |
| DP-10 | Knowledge-Centric, Not Document-Centric | “What do we know about this publication?” |

---

## 6. Scope

### 6.1 In Scope — Product Surface (Full Build Target)

- **MOD-AUTH — Authentication & Identity:** Sign-up, sign-in, MFA, SSO, session management
- **MOD-ORG — Organizations & Workspaces:** Multi-tenant org/workspace hierarchy
- **MOD-RBAC — Roles & Permissions:** Capability-based RBAC
- **MOD-LIB — Library / Book Manager:** Catalog of publications and project switching
- **MOD-DASH — Executive Command Center:** Portfolio and project health dashboards
- **MOD-LIFE — Lifecycle & Milestone Engine:** M0–M20 workflow with gates and readiness
- **MOD-GENOME — Book Genome:** Structured publication DNA
- **MOD-CHAR — Character Manager:** Character genome + psychology
- **MOD-WORLD — World / Location Manager:** Locations, world systems, continuity
- **MOD-STORY — Story / Plot Manager:** Acts, beats, subplots, mysteries
- **MOD-CHAP — Chapter Manager:** Chapter planning and sequencing
- **MOD-SCENE — Scene Manager:** Atomic scene planning and tracking
- **MOD-STUDIO — Manuscript Studio:** Writing surface with context inspector
- **MOD-CANON — Canon & Continuity:** Canon facts, supersession, integrity
- **MOD-TIME — Timeline Manager:** Chronological truth and validation
- **MOD-REL — Relationship Graph:** Typed relationships between entities
- **MOD-GRAPH — Knowledge Graph Viewer:** Visual graph of story world
- **MOD-EDIT — Editorial Intelligence:** Issue DB, kanban, severity, resolutions
- **MOD-PROD — Production Manager:** Assets, preflight, formats, ISBN
- **MOD-MKT — Marketing Operations:** Campaigns, calendars, assets, KPIs
- **MOD-RIGHTS — Rights & Licensing:** Territories, contracts, renewals
- **MOD-SALES — Sales & Analytics:** Imports, dashboards, forecasts
- **MOD-AI — AI Center & ADK:** Agent runs, proposals, governance
- **MOD-QUEUE — Work Queue:** Tasks, approvals, assignments
- **MOD-NOTIF — Notifications:** Event-driven alerts
- **MOD-SEARCH — Global Search / Command Palette:** Semantic + keyword search
- **MOD-VER — Versioning & Snapshots:** Entity versions, project snapshots
- **MOD-AUDIT — Activity & Audit Trail:** Immutable event log
- **MOD-ASSETS — Asset Library:** Binary storage for covers/manuscripts/media
- **MOD-EXPORT — Import / Export / Templates:** JSON, packets, ONIX/metadata exports
- **MOD-ADMIN — Administration:** Settings, style guides, automations
- **MOD-PORTAL — External Portals:** Author/illustrator/reviewer/partner portals

### 6.2 In Scope — Publication Lifecycle
Full M0–M20 milestone engine with objectives, deliverables, AI tasks, human approvers, exit criteria, and readiness scoring (see §8).

### 6.3 In Scope — Entity Domains (Business View)
Organization, Workspace, User/Membership, Book, Series, Universe, Character, Location, Organization-in-world, Object, Theme, Chapter, Scene, Timeline Event, Relationship, Canon Fact, Decision, Editorial Issue, Asset, Campaign, Rights Agreement, Sales Record, Automation, Notification, Agent Run, Entity Version, Event/Audit.

### 6.4 Out of Scope (Phase 1 Delivery Boundary)
Detailed phase boundaries are in §11. Hard out-of-scope for initial production release (P0/P1):
- Marketplace of third-party plugins (design for later)
- Multi-publisher industry data exchange (OPAS phase)
- Native mobile apps (responsive web first; mobile-optimized approvals later)
- Full ERP finance/general ledger (royalty basics may appear later)
- Automatic retailer push to all channels without human confirm

### 6.5 Assumptions
1. Primary customers are Mangu Publishers staff and contracted creators initially.
2. English-first UI; i18n architecture reserved.
3. Supabase (Postgres + Auth + Storage + RLS) remains backbone unless Tech Spec change-controlled.
4. LLM access via provider API / Vercel AI Gateway pattern with secrets server-side.
5. Users have modern browsers; offline PWA is stretch, not P0 blocker.
6. Legal review required before rights/contract automation claims in marketing.

### 6.6 Constraints
| Constraint | Impact |
|---|---|
| IP confidentiality | Strict RLS, encryption, audit, least privilege |
| Small initial eng team | Phased delivery; vertical slices over big-bang |
| Prototype has localStorage semantics | Must remap to multi-user concurrency model |
| AI cost | Quotas, caching, proposal batching, eval harness |
| Compliance | Auth, data retention, export/delete for user data |

### 6.7 Dependencies
- Supabase project + env vars on Vercel
- CI workflow already present (typecheck/lint/test/build)
- Design system continuity with existing cream/gold editorial UI language
- Manual Volumes IX–XV as field-level authority for genome depth

---

## 7. Business Process Overview

### 7.1 Traditional Workflow (To Be Eliminated)
Idea → Notebook → Outline → Character Notes → Worldbuilding → Word Doc → Editor Notes → Spreadsheet → Metadata → Marketing → Launch  
*(Each stage forges a new competing truth.)*

### 7.2 Book OS Workflow (Target)
Structured Book Record → Book Genome → Outline → Chapters → Scenes → Draft → Editorial → Production → Marketing → Launch → Growth → Franchise → Legacy  
*(Every artifact derived from / synchronized with SSOT; feedback can enrich earlier stages without breaking identity.)*

### 7.3 Continuous / Non-Linear Nature
Later stages may update earlier entities (e.g., marketing discovers positioning that updates USP; continuity fix updates Scene 12). The system must support enrichment without ID destruction and with full audit.

---

## 8. Milestone Business Requirements (M0–M20)

Each milestone is a **business gate**. Engineering must implement checklist items, readiness computation, approver capture, and blocked-state enforcement as specified in the FRD.


### M0 — Market Intelligence
- **Business Objective:** Determine whether the publication should exist
- **Required Deliverables:** Market Research Report; Genre Analysis; Reader Personas; Competitive Landscape; Comparable Titles; Publisher Landscape; Sales Trends; Emerging Topics; Keyword Analysis; Retail Categories; Pricing Analysis; Opportunity Matrix; Risk Assessment
- **Exit Criteria:** Target audience defined; Genre validated; Opportunity identified; Commercial rationale documented
- **Human Approval Roles:** Publishing Director, Creative Director, Business Lead
- **AI Assist (business expectation):** Specialist agents may draft/analyze artifacts; humans approve gate exit.
- **Readiness:** Composite score from deliverable completion + validation rules + open critical issues = 0.


### M1 — Concept Discovery
- **Business Objective:** Convert market insight into a publishable concept
- **Required Deliverables:** Working Title; One-Sentence Premise; Elevator Pitch; Genre/Subgenre; Audience; Core Theme; Primary Conflict; Narrative Style; Estimated Length; Target Release Window
- **Exit Criteria:** 30-second explainability; One-sentence premise; Clear reader care reason
- **Human Approval Roles:** Creative Director, Author
- **AI Assist (business expectation):** Specialist agents may draft/analyze artifacts; humans approve gate exit.
- **Readiness:** Composite score from deliverable completion + validation rules + open critical issues = 0.


### M2 — Story Foundation
- **Business Objective:** Establish emotional engine of the story
- **Required Deliverables:** Protagonist/Antagonist/Supporting Cast; Core Wound/Desire/Need/Fear; Internal/External Conflict; Primary Stakes; Transformation; Ending Intent; Character Matrix; Relationship Graph; Conflict Matrix; Emotional Arc Overview
- **Exit Criteria:** Every major character has psychological profile and narrative role
- **Human Approval Roles:** Author, Developmental Editor
- **AI Assist (business expectation):** Specialist agents may draft/analyze artifacts; humans approve gate exit.
- **Readiness:** Composite score from deliverable completion + validation rules + open critical issues = 0.


### M3 — Book Genome
- **Business Objective:** Populate structured knowledge base
- **Required Deliverables:** Book entity; Characters; Locations; Organizations; Objects; Themes; Timeline; Relationships; Magic/Technology Systems; Story Rules; Canon Rules; Vocabulary; Glossary
- **Exit Criteria:** Core entities created; No critical orphan records; Genome completeness threshold met
- **Human Approval Roles:** Author, Story Architect
- **AI Assist (business expectation):** Specialist agents may draft/analyze artifacts; humans approve gate exit.
- **Readiness:** Composite score from deliverable completion + validation rules + open critical issues = 0.


### M4 — Story Architecture
- **Business Objective:** Define how the story is told
- **Required Deliverables:** Story Structure; Acts; Turning Points; Midpoint; Climax; Resolution; Subplots; Mysteries; Reveals; Foreshadowing Plan; Pacing Strategy; Theme Integration
- **Exit Criteria:** Every subplot supports central narrative; Every reveal has setup; Every act ends with meaningful change
- **Human Approval Roles:** Author, Story Architect, Developmental Editor
- **AI Assist (business expectation):** Specialist agents may draft/analyze artifacts; humans approve gate exit.
- **Readiness:** Composite score from deliverable completion + validation rules + open critical issues = 0.


### M5 — Outline Development
- **Business Objective:** Expand architecture into complete outline
- **Required Deliverables:** Chapter List; Chapter Summaries; Estimated Word Counts; Scene Estimates; Character Distribution; Timeline Alignment; Major Emotional Beats
- **Exit Criteria:** Complete chapter outline; Estimated length within target band; Pacing reviewed
- **Human Approval Roles:** Author, Editor
- **AI Assist (business expectation):** Specialist agents may draft/analyze artifacts; humans approve gate exit.
- **Readiness:** Composite score from deliverable completion + validation rules + open critical issues = 0.


### M6 — Chapter Planning
- **Business Objective:** Each chapter becomes intentional planning unit
- **Required Deliverables:** Purpose; Conflict; POV; Opening/Ending Hook; Themes; Characters; Locations; Target Length; Dependencies; Status
- **Exit Criteria:** Every chapter has clear purpose; No filler chapters remain
- **Human Approval Roles:** Author
- **AI Assist (business expectation):** Specialist agents may draft/analyze artifacts; humans approve gate exit.
- **Readiness:** Composite score from deliverable completion + validation rules + open critical issues = 0.


### M7 — Scene Planning
- **Business Objective:** Scenes become atomic storytelling units
- **Required Deliverables:** Who/Where/What changes; Necessity justification; Emotional shift; Plot advancement; POV; Location; Participants; Goal/Conflict/Obstacle/Decision/Outcome
- **Exit Criteria:** Every scene answers necessity questions; Orphan scenes removed/merged
- **Human Approval Roles:** Author
- **AI Assist (business expectation):** Specialist agents may draft/analyze artifacts; humans approve gate exit.
- **Readiness:** Composite score from deliverable completion + validation rules + open critical issues = 0.


### M8 — First Draft
- **Business Objective:** Write manuscript from validated structure
- **Required Deliverables:** Chapter manuscripts; Scene drafts; Writing velocity metrics; Quality flags; Continuity reminders; Voice consistency checks
- **Exit Criteria:** Target word count reached or intentional variance approved; All planned chapters drafted
- **Human Approval Roles:** Author
- **AI Assist (business expectation):** Specialist agents may draft/analyze artifacts; humans approve gate exit.
- **Readiness:** Composite score from deliverable completion + validation rules + open critical issues = 0.


### M9 — Developmental Editing
- **Business Objective:** Evaluate story itself
- **Required Deliverables:** Revision Plan; Structural Issues; Priority Ranking; Rewrite Tasks; Stakes/Pacing/Character Evolution assessment
- **Exit Criteria:** Dev edit pass complete; Critical structural issues resolved or deferred with approval
- **Human Approval Roles:** Developmental Editor, Author
- **AI Assist (business expectation):** Specialist agents may draft/analyze artifacts; humans approve gate exit.
- **Readiness:** Composite score from deliverable completion + validation rules + open critical issues = 0.


### M10 — Line Editing
- **Business Objective:** Improve expression and voice
- **Required Deliverables:** Sentence rhythm notes; Dialogue polish; Clarity/voice/repetition/flow revisions
- **Exit Criteria:** Line edit complete; Author acceptance of line changes
- **Human Approval Roles:** Line Editor, Author
- **AI Assist (business expectation):** Specialist agents may draft/analyze artifacts; humans approve gate exit.
- **Readiness:** Composite score from deliverable completion + validation rules + open critical issues = 0.


### M11 — Copyediting
- **Business Objective:** Technical correctness
- **Required Deliverables:** Grammar/spelling/capitalization; Consistency; Formatting; References; Terminology
- **Exit Criteria:** Copyedit complete; Style guide compliance
- **Human Approval Roles:** Copy Editor
- **AI Assist (business expectation):** Specialist agents may draft/analyze artifacts; humans approve gate exit.
- **Readiness:** Composite score from deliverable completion + validation rules + open critical issues = 0.


### M12 — Proofreading
- **Business Objective:** Final polish before production
- **Required Deliverables:** Final Approval Checklist; Proof Log; Error Report; Publication Sign-Off
- **Exit Criteria:** Zero open critical proof issues; Sign-off recorded
- **Human Approval Roles:** Proofreader, Managing Editor
- **AI Assist (business expectation):** Specialist agents may draft/analyze artifacts; humans approve gate exit.
- **Readiness:** Composite score from deliverable completion + validation rules + open critical issues = 0.


### M13 — Production
- **Business Objective:** Manuscript becomes products
- **Required Deliverables:** Print Interior; eBook; Audiobook Script; Cover Files; Marketing Images; Metadata; Retail Files; ISBN Assignment; Distribution Package; Accessibility report
- **Exit Criteria:** Production readiness 100%; All product formats approved
- **Human Approval Roles:** Production Manager, Designer
- **AI Assist (business expectation):** Specialist agents may draft/analyze artifacts; humans approve gate exit.
- **Readiness:** Composite score from deliverable completion + validation rules + open critical issues = 0.


### M14 — Marketing Preparation
- **Business Objective:** Prepare go-to-market
- **Required Deliverables:** Brand Messaging; Author Bio; Press Kit; Cover Reveal Plan; Social Calendar; Email Campaign; ARC List; Influencer Outreach; Media Targets; Advertising Plan
- **Exit Criteria:** Campaign plan approved; Assets ready; Calendar scheduled
- **Human Approval Roles:** Marketing Manager
- **AI Assist (business expectation):** Specialist agents may draft/analyze artifacts; humans approve gate exit.
- **Readiness:** Composite score from deliverable completion + validation rules + open critical issues = 0.


### M15 — Pre-Launch
- **Business Objective:** Final readiness review
- **Required Deliverables:** Files uploaded; Retail metadata complete; Pricing approved; Marketing scheduled; Review copies distributed; Website updated; Newsletter prepared; Launch events confirmed
- **Exit Criteria:** Pre-launch checklist 100%
- **Human Approval Roles:** Publisher, Project Manager
- **AI Assist (business expectation):** Specialist agents may draft/analyze artifacts; humans approve gate exit.
- **Readiness:** Composite score from deliverable completion + validation rules + open critical issues = 0.


### M16 — Publication
- **Business Objective:** Launch and operational tracking
- **Required Deliverables:** Sales; Downloads; Rankings; Reviews; Inventory; Returns; Advertising Performance; Media Mentions; Reader Feedback
- **Exit Criteria:** Live on target retailers; Monitoring dashboards active
- **Human Approval Roles:** Publisher, Sales Manager
- **AI Assist (business expectation):** Specialist agents may draft/analyze artifacts; humans approve gate exit.
- **Readiness:** Composite score from deliverable completion + validation rules + open critical issues = 0.


### M17 — Post-Launch
- **Business Objective:** Analyze outcomes and iterate
- **Required Deliverables:** Audience reach analysis; Channel performance; Recurring feedback themes; Conversion asset review; Edition update recommendations
- **Exit Criteria:** Post-launch report approved; Learnings logged to organizational memory
- **Human Approval Roles:** Marketing Manager, Publisher
- **AI Assist (business expectation):** Specialist agents may draft/analyze artifacts; humans approve gate exit.
- **Readiness:** Composite score from deliverable completion + validation rules + open critical issues = 0.


### M18 — Catalog Growth
- **Business Objective:** Expand from single title to catalog asset
- **Required Deliverables:** Series expansion; Translations; Large-print/Special editions; Audiobooks; Companion guides; Educational materials; Merchandise; Licensing; Cross-promotions
- **Exit Criteria:** Growth initiatives linked to original project; Rights/assets connected
- **Human Approval Roles:** Portfolio Manager, Rights Manager
- **AI Assist (business expectation):** Specialist agents may draft/analyze artifacts; humans approve gate exit.
- **Readiness:** Composite score from deliverable completion + validation rules + open critical issues = 0.


### M19 — Franchise Expansion
- **Business Objective:** IP ecosystem expansion
- **Required Deliverables:** Sequels/Prequels/Spin-offs; Graphic novels/Comics; Interactive editions; Film/TV adaptations; Podcasts; Games; Educational curricula
- **Exit Criteria:** Related projects share Universe/Series/Characters/Rights records
- **Human Approval Roles:** Executive, Rights Manager
- **AI Assist (business expectation):** Specialist agents may draft/analyze artifacts; humans approve gate exit.
- **Readiness:** Composite score from deliverable completion + validation rules + open critical issues = 0.


### M20 — Legacy Management
- **Business Objective:** Long-term IP stewardship
- **Required Deliverables:** Rights renewals; New editions; Metadata refreshes; Accessibility improvements; Archival storage; Sales trend analysis; Historical documentation; Canon management; Estate planning
- **Exit Criteria:** Renewal calendar active; Canonical archive integrity verified
- **Human Approval Roles:** Rights Manager, Publisher
- **AI Assist (business expectation):** Specialist agents may draft/analyze artifacts; humans approve gate exit.
- **Readiness:** Composite score from deliverable completion + validation rules + open critical issues = 0.


### 8.1 Lifecycle Dashboard (Business Requirement)
Every project MUST expose: current milestone, overall readiness, creative/editorial/production/marketing/commercial completion, risk level, critical blockers, next recommended actions. This is the executive control surface for publishing operations.

### 8.2 Gate Enforcement Policy (Business)
| Policy | Rule |
|---|---|
| Soft gate (default early milestones) | Warn on incomplete exit criteria; allow override with reason by authorized role |
| Hard gate (M12→M13, M15→M16) | Block advancement if critical checklist incomplete or critical issues open |
| Audit | Every override and approval stored immutably |
| Rollback | Milestone can be reopened; prior approval retained in history |

---

## 9. AI Business Requirements & Governance

### 9.1 Philosophy
AI is an **operational workforce of specialists**, not a single chatbot that “writes the book.”

### 9.2 Authority Matrix (Non-Negotiable)
| Decision Class | AI Role | Human Role |
|---|---|---|
| Market research | Recommend | Approve |
| Character psychology | Recommend | Approve |
| Story structure | Recommend | Approve |
| Editorial revisions | Suggest | Decide |
| Metadata | Draft | Verify |
| Pricing | Recommend | Approve |
| Rights deals | Analyze | Negotiate |
| Publication | Validate readiness | Final authorization |

### 9.3 Governance Levels
| Level | Examples | Approval |
|---|---|---|
| L1 Informational | Summaries, brainstorming | None |
| L2 Editorial assistance | Outline feedback, continuity checks | Review recommended |
| L3 Operational actions | Metadata publish, campaign schedule | Required |
| L4 High-impact | Contracts, spend, public release | Executive |

### 9.4 Agent Roster (Business Catalog)

- **`executive_publisher` — Executive Publisher AI** (default governance L3): Orchestra conductor; portfolio health, milestone tracking, decision routing, risk, prioritization
- **`market_intelligence` — Market Intelligence Agent** (default governance L2): Bestsellers, niches, sentiment, demand, pricing, SWOT, opportunity scoring
- **`concept_architect` — Concept Architect** (default governance L2): Working title, hook, logline, USP, genre, audience, comps, series potential
- **`story_architect` — Story Architect** (default governance L2): Structure systems, beat maps, pacing, subplots, ending design
- **`character_psychologist` — Character Psychologist** (default governance L2): Trauma, attachment, motivations, behavior, speech, growth, relationships
- **`world_builder` — World Builder** (default governance L2): History, politics, economics, religion, tech/magic, culture; contradiction detection
- **`plot_engineer` — Plot Engineer** (default governance L2): Scene necessity, tension, conflict evolution, pacing, plot health score
- **`chapter_planner` — Chapter Planner** (default governance L2): Purpose, summary, word goal, conflict, POV, hooks, themes, timeline
- **`scene_director` — Scene Director** (default governance L2): Per-scene characters, location, conflict, dialogue, emotion, transitions
- **`dialogue_coach` — Dialogue Coach** (default governance L2): Per-character voice models; vocabulary, formality, slang, evolution
- **`developmental_editor` — Developmental Editor AI** (default governance L2): Diagnose story/characters/pacing/structure/engagement without rewriting
- **`continuity_guardian` — Continuity Guardian** (default governance L2): Timeline, objects, knowledge, ages, travel, canon, magic/tech rules
- **`copy_editor` — Copy Editor** (default governance L2): Grammar, formatting, capitalization, consistency, house style, readability
- **`fact_checker` — Fact Checker** (default governance L2): Research DB, historical/scientific/legal/medical, internal canon
- **`production_coordinator` — Production Coordinator** (default governance L3): Cover/interior/illustrations/ISBN/metadata/uploads/accessibility/approvals
- **`marketing_strategist` — Marketing Strategist** (default governance L2): Launch plans, calendars, BookTok, influencers, ads, personas, pricing experiments
- **`metadata_specialist` — Metadata Specialist** (default governance L3): Amazon/Apple/Google/Kobo/Ingram/libraries; SEO, keywords, BISAC, THEMA
- **`rights_manager` — Rights Manager** (default governance L3): Translations, film/TV, audio, merch, licensing, renewals, contracts, royalties
- **`sales_analyst` — Sales Analyst** (default governance L2): Daily sales, ad ROI, reviews, regional performance, elasticity, forecasts
- **`portfolio_manager` — Portfolio Manager** (default governance L2): Cross-catalog: genres, authors, sequels, translations, franchise potential
- **`executive_copilot` — Executive Copilot** (default governance L1): Daily executive briefing across portfolio, risks, deadlines, opportunities

### 9.5 AI Business Rules
1. Agents share SSOT memory; no private contradictory copies.
2. Agents may not silently mutate approved canon.
3. Every agent run is logged (inputs summary, outputs, model metadata, requester, approver).
4. Rejected proposals become training/eval signal; they do not alter SSOT.
5. Cost controls and rate limits are business-configurable per workspace.

---

## 10. Roles & Organizational Model

### 10.1 Tenancy
`Organization → Workspaces → Projects (Books) → Entities`  
Example workspaces: Fiction, Children’s, Comics, Manga, Educational, Newspapers, Magazines, Research, Experimental.

### 10.2 Role Catalog (Business)

- **guest (`Guest`)**: Read public portal content only
- **reader (`Reader / Beta Reader`)**: Comment on assigned manuscripts; submit feedback
- **author (`Author`)**: Create/edit creative entities for owned books; draft manuscript
- **co_author (`Co-Author`)**: Collaborative authorship with scoped book access
- **ghostwriter (`Ghostwriter`)**: Write under assignment; limited marketing/rights visibility
- **illustrator (`Illustrator`)**: Upload/manage illustration assets; view related creative briefs
- **researcher (`Researcher`)**: Manage research notes, fact sources, historical references
- **editor (`Editor`)**: Editorial issues, developmental feedback, chapter/scene review
- **senior_editor (`Senior Editor`)**: Approve editorial transitions; assign editors
- **managing_editor (`Managing Editor`)**: Editorial pipeline ownership; milestone gate approvals M9–M12
- **proofreader (`Proofreader`)**: Proof logs; M12 corrections only
- **designer (`Designer`)**: Covers, interiors, typography assets
- **production_artist (`Production Artist`)**: Format production files; preflight
- **marketing_manager (`Marketing Manager`)**: Campaigns, assets, calendars, ARCs
- **sales_manager (`Sales Manager`)**: Sales imports, pricing recommendations, retailer performance
- **rights_manager (`Rights Manager`)**: Contracts, territories, renewals, licensing
- **project_manager (`Project Manager`)**: Milestones, tasks, blockers, schedules
- **publisher (`Publisher`)**: Publication authorization; commercial gates
- **executive (`Executive`)**: Portfolio oversight; high-impact decisions
- **system_admin (`System Administrator`)**: Org/workspace settings, users, integrations
- **platform_admin (`Platform Administrator`)**: Platform-wide configuration and security
- **ai_agent (`AI Agent (service principal)`)**: Tool-scoped actions under human governance

### 10.3 Capability Examples (Business Language)
Create books; approve outlines; edit characters; publish metadata; assign editors; approve production; manage rights; export files; manage users; configure AI; administer workflows. Capabilities are additive and assigned via roles + optional overrides.

---

## 11. Release Phasing (Business Roadmap)

Aligned to Manual Volume XII platform roadmap, adapted to current repo reality.

### Phase A — Foundation (P0)
**Business goal:** Replace fragile prototype workflows with multi-user SSOT for core creative ops.
- Auth, org/workspace membership (minimum viable tenancy)
- Books library, active book context
- Characters, chapters, basic genome fields
- Lifecycle checklist M0–M20 (even if readiness rules are partial)
- Editorial issues board
- Activity/audit log
- Production tasks + marketing items (existing tables elevated)
- Import path from prototype JSON where feasible

**Exit:** A real title can be run from concept→draft→editorial tracking with multiple users.

### Phase B — Creative Depth (P1)
- Scenes, locations, relationships, timeline, canon
- Manuscript Studio with autosave + context inspector
- Story graph viewer
- Version snapshots
- Work queue + approvals
- Stronger readiness scoring for M2–M8

**Exit:** Continuity-aware drafting; graph + canon integrity visible.

### Phase C — Publishing Operations (P2)
- Asset library + storage
- Production preflight & ISBN/metadata packages
- Marketing campaigns with KPIs
- Rights records + renewal alerts
- Sales import + basic analytics
- Hard gates for M13/M15/M16

**Exit:** Launch package can be assembled and authorized inside Book OS.

### Phase D — Intelligence OS (P3)
- Full ADK agent runs with tools
- Proposal/approval workflow wired to all L2–L4 actions
- Executive Copilot briefings
- Predictive analytics (readiness, risk, portfolio)
- Semantic search over knowledge graph

**Exit:** AI is measurable workforce; executives use Copilot daily.

### Phase E — Ecosystem (P4)
- External portals
- Plugin/extension model
- Broader retailer/tool connectors
- OPAS / open standards participation
- Mobile-optimized approval experiences

---

## 12. Data as a Business Asset

### 12.1 Knowledge Graph Business Value
Explicit relationships enable impact analysis (“if we change Character X’s age, which scenes break?”), semantic search, AI grounding, and portfolio intelligence.

### 12.2 Progressive Enrichment Policy
Field requirements tighten by milestone. Early milestones require identity + commercial seed fields; later milestones require production/rights completeness. This is a business rule to prevent onboarding paralysis.

### 12.3 Record Lifecycle (Universal)
`Draft → Working → Review → Approved → Published → Archived` applies to books, characters, locations, campaigns, issues, rights, etc.

### 12.4 Retention & Archival
- Soft-delete/archive only for domain entities
- Legal hold capability for rights/contracts
- Exportable project packages for portability

---

## 13. Reporting & Analytics Requirements (Business)

### 13.1 Project Dashboards
Creative completion, editorial health, production readiness, marketing readiness, commercial readiness, risk, blockers.

### 13.2 Portfolio Dashboards
Books by status/milestone, overdue gates, AI health, rights expiries, campaign ROI, revenue (when sales present).

### 13.3 Learning Loop
Post-launch lessons and editorial “lesson learned” fields feed organizational memory for future titles.

---

## 14. Compliance, Security & Risk (Business View)

### 14.1 Security Requirements
- Authentication required for all non-public surfaces
- RLS / authorization on every record
- Encryption in transit and at rest (platform defaults)
- MFA available; SSO for enterprise phase
- Comprehensive audit logs for approvals and exports
- Least-privilege AI tool access

### 14.2 Privacy
- PII minimized; contractor access scoped to assigned projects
- Data export/delete workflows for accounts

### 14.3 IP Protection
- Private asset buckets
- Watermarking optional later
- External portal exposure tightly scoped

### 14.4 Key Risks & Mitigations
| Risk | Impact | Mitigation |
|---|---|---|
| Spec drift vs Manual | Wrong product | Spec IDs + Manual volume references; change control |
| Prototype/production dual truth | Eng confusion | Canonical app = React/Supabase; prototype = reference only |
| AI writes bad canon | IP damage | Proposal gates; Continuity Guardian; audit |
| Over-modeling day one | Delivery stall | Progressive enrichment; phase A vertical slice |
| Multi-tenant leaks | Catastrophic | RLS tests mandatory in CI |
| Scope creep (full ERP) | Miss publishing OS | Enforce non-goals |

---

## 15. Commercial & Product Packaging (Initial Assumptions)
| Package | Intended User | Notes |
|---|---|---|
| Internal House | Mangu staff | Full modules as rolled out |
| Creator Seat | Authors/contractors | Scoped workspace/project access |
| Partner Portal | Reviewers/translators/retailers | Later phase, limited surfaces |
| Enterprise | Multi-workspace orgs | SSO, admin, audit exports |

Pricing is **out of band** for this BRD; engineering should not hard-code plan limits without product config.

---

## 16. Acceptance of BRD (Sign-Off Checklist)
- [ ] Mission/vision confirmed
- [ ] In/out of scope accepted
- [ ] M0–M20 business gates accepted
- [ ] AI governance matrix accepted
- [ ] Phases A–E accepted as delivery strategy
- [ ] KPIs accepted
- [ ] Security/IP constraints accepted
- [ ] FRD authorized to proceed as functional decomposition of this BRD

---

## 17. Appendices

### Appendix A — Manual Traceability (Volumes → BRD Themes)
| Volume | Theme | BRD Sections |
|---|---|---|
| I | Vision, philosophy, 5 layers, SSOT | §§1,5,7 |
| II | Genome & entities | §§6,12 |
| III | Workbook/DB schema mindset | §12; Tech Spec |
| IV | M0–M20 lifecycle | §8 |
| V | Creative engine | §§6,11 Phase B |
| VI | Editorial intelligence | §§6,11 |
| VII | Production/commercial | §§6,11 Phase C |
| VIII | AI agents | §9 |
| IX | Data dictionary | Tech Spec / FRD data |
| X–XV | Genome depth specs | Progressive enrichment |
| XI | Analytics | §13 |
| XII | Enterprise platform | §§6,10,11 |
| XVI | Knowledge graph ontology | §12 |
| XVII | ADK | §9 |
| XVIII | OPAS open standard | Phase E |

### Appendix B — Glossary Expansion
See FRD §Definitions and Tech Spec Data Dictionary for field-level terms.

### Appendix C — Open Questions (Track Explicitly)
1. Which hard gates are mandatory for Mangu house style beyond M12/M15/M16?
2. Exact ISBN/ONIX authority and retailer priority order?
3. Which LLM providers are approved for production IP?
4. Retention period for agent transcripts containing manuscript excerpts?
5. Workspace model: single workspace MVP vs full multi-workspace in Phase A?

---

*End of BRD — {PRODUCT} v{DOC_VERSION}*
