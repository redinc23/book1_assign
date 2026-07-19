# Business Requirements Document (BRD)
# MANGU Publishing Operating System (POS) / Book OS

| Field | Value |
|-------|-------|
| Document ID | `MANGU-POS-BRD-001` |
| Version | `1.0.0` |
| Status | **Approved for engineering kickoff** |
| Classification | Internal — Mangu Publishers |
| Product name | MANGU Book Operating System (Book OS) → Publishing Operating System (POS) |
| Owning org | Mangu Publishers |
| Primary contact domain | books@mangu-publishers.com |
| Related authority | *MANGU Book OS Manual* Volumes I–XVIII (v1.0, 2026) |
| Companion docs | FRD (`02-FRD-…`), Tech Spec (`03-TECH-SPEC-…`) |
| Baseline code | `redinc23/book1_assign` (Vite/React/Supabase/Vercel) |

---

## 1. Executive Summary

### 1.1 One-sentence mission

Build the world's most complete **Publishing Operating System** — a unified information architecture that takes a publication from a single idea to a globally distributed, actively managed intellectual-property asset using structured data, milestone-gated workflows, AI-assisted creation, and human governance.

### 1.2 Business problem

Publishing work today is fragmented across outlines, manuscripts, character sheets, editorial notes, metadata forms, marketing briefs, production trackers, and rights documents. Each artifact evolves independently, creating:

- duplicated entry of the same facts
- contradictory "truths" about one project
- version conflicts and lost institutional knowledge
- manual synchronization overhead
- avoidable production delays and quality escapes
- weak handoffs between creative, editorial, production, marketing, and commercial teams

The cost is not merely inefficiency; it is **loss of organizational memory** and inability to scale a multi-title, multi-format catalog with predictable quality.

### 1.3 Business solution

**POS / Book OS** stores every publication fact once in a canonical structured model (the **Book Genome** and related genomes), then derives manuscripts, packets, assets, metadata, campaigns, and analytics from that single source of truth. Progression through the publishing lifecycle is controlled by a **Milestone Engine (M0–M20)** with explicit readiness gates. Specialized **AI agents** assist under human approval. The platform grows from Book OS into a full Publishing OS and, longer-term, an open industry architecture (**OPAS**).

### 1.4 Business outcomes (what success looks like)

1. **One authoritative record** per publication fact, reusable across creative, editorial, production, marketing, and commercial surfaces.
2. **Predictable lifecycle throughput** from concept → publication → catalog growth with measurable milestone readiness.
3. **Quality that compounds** — editorial issues, continuity facts, and lessons learned become institutional data, not tribal knowledge.
4. **Multi-format productization** — one master manuscript yields print, ebook, audio, large-print, translations, and special editions as managed assets.
5. **Governed AI leverage** — agents accelerate work without bypassing human approval or corrupting canon.
6. **Portfolio command** — executives see readiness, risk, quality, schedule, and commercial posture across the catalog.
7. **Extensibility** — architecture remains publication-agnostic (books today; comics, magazines, educational, interactive, audio tomorrow).

### 1.5 What this BRD is / is not

| This BRD IS | This BRD is NOT |
|-------------|-----------------|
| The business contract for the entire POS build | A UI mockup or pixel spec |
| Scope, capabilities, KPIs, phases, constraints | Implementation code |
| Traceable capability IDs for FRD/Tech Spec | A substitute for the Manual's creative methodology depth |
| The "why" and "what business value" | Retail point-of-sale software |

---

## 2. Vision, Mission & Strategic Context

### 2.1 Vision statement (Manual Volume I)

> Every piece of information about a publication should exist once, in one authoritative location, and be reusable everywhere else.

### 2.2 Mission statement (Manual Volume I)

Create the world's most complete publishing operating system, capable of taking a publication from an idea to a globally distributed product using structured data, intelligent workflows, AI-assisted creation, and human review.

### 2.3 Strategic layers (Manual Epilogue I)

| Layer | Scope | Manual volumes | POS phase emphasis |
|-------|-------|----------------|--------------------|
| **L1 — Build the Book** | Genomes, workbook/schema, milestones, creative/editorial/production | I–X | **Phase 0–2 (core product)** |
| **L2 — Manage the Publishing Company** | Intelligence, enterprise platform, knowledge graph, AI ADK | XI–XVII | **Phase 2–3** |
| **L3 — Industry Platform** | OPAS, digital twin, open standards, marketplace | XVIII+ | **Phase 4+ (strategic)** |

### 2.4 Long-term publication types (must remain architecturally possible)

Books, comic books, graphic novels, manga, newspapers, magazines, journals, educational materials, children's books, interactive books, digital publications, audiobooks, multimedia publishing, and future formats not yet defined.

**Implication:** Core entities and workflows must be **publication-agnostic** with format-specific modules that plug into a common genome / lifecycle / asset model.

### 2.5 Design philosophy (binding business principles)

| ID | Principle | Business meaning |
|----|-----------|------------------|
| `PRIN-01` | **Single Source of Truth** | One Character name, one ISBN status, one launch date — referenced everywhere, typed nowhere twice |
| `PRIN-02` | **Structured Before Narrative** | Capture Core Fear / Wound / Arc before (or while) drafting prose; structure drives quality |
| `PRIN-03` | **Progressive Enrichment** | Start sparse; deepen fields over milestones without rewriting foundations |
| `PRIN-04` | **Reusability** | Theme / character / world data feeds chapters, marketing, covers, guides |
| `PRIN-05` | **Modular Design** | Book, Character, World, Plot, Editorial, Marketing, Rights, Production evolve independently but share IDs |
| `PRIN-06` | **Templates are views, not truth** | Character Bible, Marketing Brief, etc. are generated; the database/genome is authoritative |
| `PRIN-07` | **Human governance over AI** | AI proposes; humans approve for canon-affecting and publication-affecting changes |
| `PRIN-08` | **Inheritance** | Universe → Series → Book → Act → Chapter → Scene; children inherit context |
| `PRIN-09` | **Institutional memory** | Issues, decisions, revisions, lessons learned never disappear |
| `PRIN-10` | **Manuscript ≠ product** | Master manuscript is source asset; commercial products are derived managed assets |

---

## 3. Stakeholders, Personas & Organizational Roles

### 3.1 Stakeholder map

| Stakeholder | Interest | Influence | Primary success lens |
|-------------|----------|-----------|----------------------|
| Publisher / Owner (Mangu) | Catalog quality, IP value, speed-to-market | Highest | Portfolio readiness + revenue potential |
| Executive Publisher | Cross-title decisions, risk, prioritization | High | Command Center accuracy |
| Authors | Creative flow, clear feedback, less admin | High | Draft velocity + fair revision loops |
| Developmental Editors | Story quality, arc integrity | High | Issue throughput + quality index |
| Line / Copy Editors / Proofreaders | Language correctness, consistency | Medium | Issue clarity + style guide adherence |
| Production / Design | Asset integrity, preflight, formats | High | Zero bad-file launches |
| Marketing | Campaign coherence with genome | Medium | Brief accuracy + campaign status |
| Rights / Licensing | Clean IP metadata, deal tracking | Medium | Rights completeness |
| Sales / Analytics | Channel performance visibility | Medium | Trusted sales facts |
| Engineering | Clear contracts, incremental delivery | High | Spec stability + testability |
| AI Agents (system actors) | Assist under policy | Controlled | Proposal quality + approval compliance |
| Future: external partners / retailers | Metadata / distribution exchange | Future | OPAS compatibility |

### 3.2 Primary personas (product design targets)

#### P-01 — Solo Author-Publisher
Runs 1–5 titles. Needs low-friction genome capture, milestone clarity, manuscript studio, and basic production/marketing checklists without enterprise ceremony.

#### P-02 — Small Imprint Operator
Manages multiple authors/titles. Needs workspaces, roles, approvals, portfolio dashboard, shared style guides, and audit trails.

#### P-03 — Developmental Editor
Lives in editorial issues, continuity, and revision verification. Needs severity, linking to chapter/scene/character, and quality scores.

#### P-04 — Production Lead
Owns asset registry, covers, interiors, ebook/print/audio preflight, ISBN/metadata completeness gates before M16.

#### P-05 — Marketing Lead
Needs genome-derived briefs, campaign objects, channel tasks, and launch readiness tied to M14–M16.

#### P-06 — Executive Publisher
Needs Command Center: milestone distribution, critical risks, blockers, quality indices, upcoming launches — not raw tables.

#### P-07 — Continuity / Canon Steward (series/universe)
Owns canon facts, relationship graph integrity, and cross-book consistency.

#### P-08 — AI Collaboration User
Invokes agents, reviews proposals, approves/rejects with rationale; expects memory of prior decisions.

### 3.3 Platform roles (business RBAC targets)

| Role key | Typical capabilities |
|----------|----------------------|
| `owner` | Full org/workspace control, billing (future), destructive actions |
| `publisher` | Approvals across milestones, portfolio decisions, rights |
| `editor_dev` | Developmental editorial + story gates |
| `editor_line` | Line/copy/proof workflows |
| `author` | Create/edit creative content for assigned books |
| `producer` | Assets, production tasks, preflight |
| `marketer` | Campaigns, marketing items |
| `rights_manager` | Rights/licensing records |
| `analyst` | Read-heavy intelligence dashboards |
| `viewer` | Read-only |
| `agent_service` | Non-human service principal for agent runs (no direct UI login) |

Fine-grained capabilities (e.g., `milestone.approve`, `canon.write`, `agent.approve`) are specified in Tech Spec; business requirement is **role + capability** dual control.

---

## 4. Scope

### 4.1 In scope — Product capabilities (capability catalog)

Each capability below is a first-class business deliverable. Detailed functional requirements live in the FRD under matching modules.

#### CAP-001 — Workspace & Multi-Tenancy
Organizations, workspaces, memberships, invitations, and isolation of publishing data between tenants.

#### CAP-002 — Identity & Access
Authentication, session management, RBAC/capabilities, audit of privileged actions.

#### CAP-003 — Publication Library
Create/manage Books (and later Series/Universe containers), project switching, status, ownership, cover, progress.

#### CAP-004 — Book Genome
Structured identity, creative, narrative, character summary, world summary, reader experience, commercial, franchise, publishing, and evolution genome layers (Manual Volume X).

#### CAP-005 — Character System
Full Character entity + Character Genome domains; psychology-first model; relationships; voice; importance scoring.

#### CAP-006 — Story / Narrative System
Premise, structure, conflict, emotional design, theme, mystery/reveal, pacing, story health scores (Volume XIV).

#### CAP-007 — World System
Locations, world genome domains, inheritance from Universe/Series, continuity hooks (Volume XV).

#### CAP-008 — Chapter & Scene Architecture
Ordered chapters/scenes with purpose, POV, goals, conflict, outcome, emotional shift, word goals/counts, manuscript linkage.

#### CAP-009 — Manuscript Studio
Authoring surface for chapter/scene manuscript text with versioning, search, and linkage to structure.

#### CAP-010 — Relationship Graph & Knowledge Links
Typed relationships between entities with strength/confidence/evidence/time bounds.

#### CAP-011 — Canon & Timeline
Canon facts database; timeline events; supersession; confidence; continuity alerts.

#### CAP-012 — Milestone Engine (M0–M20)
Lifecycle state machine with readiness scoring, checklist items, entry/exit gates, approvals, and progression rules.

#### CAP-013 — Creative Health
Story readiness / creative health dashboards spanning character, plot, pacing, emotional rhythm.

#### CAP-014 — Editorial Intelligence
Issue database, categories, severity, assignment, revision verification, style guide, sensitivity reviews, editorial quality index.

#### CAP-015 — Production & Asset Registry
Managed assets (cover, interior, ebook, audio, marketing), versions, checksums, approvals, preflight.

#### CAP-016 — Metadata & ISBN
ONIX-oriented metadata completeness, ISBN assignment tracking, channel-ready metadata packets.

#### CAP-017 — Distribution Readiness
Channel targets, format packages, distribution status (not necessarily live retailer APIs in Phase 1).

#### CAP-018 — Pricing Engine (structured)
List/price experiments, territory/format pricing records as data (integrations later).

#### CAP-019 — Marketing Operations
Campaigns, channel tasks, briefs generated from genome, M14–M16 launch prep.

#### CAP-020 — Sales & Analytics (ingest + dashboard)
Sales facts ingestion model, analytics dashboards, catalog intelligence (manual/CSV first; APIs later).

#### CAP-021 — Rights & Licensing
Rights records, territories, license deals, expiration, franchise expansion hooks (M19).

#### CAP-022 — Decisions & Approvals
Explicit decision records with rationale, owner, approval state — institutional memory.

#### CAP-023 — Work Queue, Notifications & Activity
Unified work items, notifications, activity/audit event stream.

#### CAP-024 — Search & Command Palette
Global search across entities; quick navigation and actions.

#### CAP-025 — Versioning, Snapshots & Export/Import
Entity versions, project snapshots, JSON export/import for portability and backup.

#### CAP-026 — Governed AI Agent Workforce
Agent registry, runs, proposals, human approval gates, shared memory, evaluation metrics (Volumes VIII, XVII).

#### CAP-027 — Automation Rules
Trigger → condition → action automations (notifications, checklist updates, agent invocations).

#### CAP-028 — Publishing Intelligence
Portfolio/creative/editorial/production/marketing/sales/rights/financial/operational intelligence domains (Volume XI) — progressive depth by phase.

#### CAP-029 — Executive Command Center
Role-appropriate dashboards consolidating readiness, risk, quality, schedule, commercial posture.

#### CAP-030 — Extensibility toward OPAS
Identity, knowledge, workflow, exchange, intelligence, application, and governance standards alignment (Volume XVIII) as architectural constraint even when not fully implemented.

### 4.2 Explicitly out of scope (Phase 1–2)

| Out of scope now | Notes |
|------------------|-------|
| Retail point-of-sale hardware/software | Different product category |
| Full live retailer API settlement (Amazon KDP, Ingram, etc.) | Model readiness first; integrate later |
| Print-on-demand manufacturing | Track status/assets only |
| Full accounting / ERP | Financial *fields* and intelligence stubs only |
| Public consumer storefront | Future public portals (Volume XII) |
| Mobile-native apps (iOS/Android) | Responsive web first; mobile platform later |
| Plugin marketplace | Architecture reserved; not Phase 1 delivery |
| Full World Simulation Engine | Spec'd as future capability |
| OPAS certification program | Strategic Layer 3 |
| Automatic unsupervised canon mutation by AI | Forbidden by governance principles |

### 4.3 Assumptions

1. Initial primary users are Mangu Publishers internal teams and invited collaborators.
2. English-first UI; i18n architecture must not be precluded.
3. Supabase + Vercel remain the default cloud substrate unless Tech Spec change-controlled otherwise.
4. Human editors remain final authority on publication quality.
5. Manual Volumes I–XVIII are the conceptual authority when this BRD and the Manual conflict on *domain meaning*; this BRD + FRD win on *delivery scope and acceptance* for the software build.
6. Prototype v0.2 behaviors are a feature reference, not a sacred UI.

### 4.4 Constraints

| ID | Constraint |
|----|------------|
| `BR-NFR-001` | Multi-tenant data isolation is mandatory (RLS or equivalent). |
| `BR-NFR-002` | Canon-affecting and milestone-advancing actions require authenticated human principal (or explicitly delegated approval). |
| `BR-NFR-003` | All privileged mutations emit immutable audit/event records. |
| `BR-NFR-004` | System must remain usable for solo authors (progressive disclosure; no forced enterprise ceremony). |
| `BR-NFR-005` | Offline-only localStorage prototype mode is not the production authority; server canonical store is. |
| `BR-NFR-006` | Accessibility: WCAG 2.2 AA target for primary authoring and editorial workflows. |
| `BR-NFR-007` | Secrets never shipped in client bundles beyond anon/public keys. |
| `BR-NFR-008` | Breaking genome/schema changes require versioned migrations and documented upgrade path. |

---

## 5. Current-State vs Target-State

### 5.1 Current-state (baseline product)

The repository today provides a React SPA with Supabase-backed tables for books, characters, chapters, editorial tasks, production tasks, marketing items, and activity — largely **owner-scoped** (`user_id`) rather than full workspace tenancy. Views cover Dashboard, Library, Lifecycle, Genome, Characters, Chapters, Editorial, Production, Marketing, AI Center, and Activity. A richer **v0.2 prototype** and `legacy-schema.sql` already describe organizations, workspaces, milestones, scenes, locations, canon, relationships, assets, campaigns, agent runs, events, and RLS patterns.

### 5.2 Target-state (POS)

A multi-user, workspace-scoped Publishing Operating System implementing CAP-001–CAP-030 with:

- Canonical Postgres model (genome JSON + relational entities)
- Milestone Engine with real gates
- Manuscript Studio
- Editorial Intelligence
- Production asset registry
- Governed AI proposal workflow
- Event/audit backbone
- Executive Command Center
- Path to intelligence + OPAS layers

### 5.3 Gap themes (business)

1. **Tenancy & roles** — from personal books to org/workspace RBAC  
2. **Genome depth** — from light forms to Volume X/XIII/XIV/XV depth (progressive)  
3. **Lifecycle enforcement** — from display phases to gated M0–M20  
4. **Scenes/locations/canon/graph** — present in prototype, thin in live app  
5. **AI governance** — from UI shell to proposal/approval/memory  
6. **Commercial ops** — production/marketing exist lightly; metadata/distribution/rights/sales need first-class objects  
7. **Institutional memory** — decisions, versions, events must be durable  

---

## 6. Business Process Overview — Publishing Lifecycle (M0–M20)

The Milestone Engine is the **operating cadence** of POS. Each milestone is a managed business state with readiness, checklist items, and approval.

| Milestone | Name | Business intent | Primary modules |
|-----------|------|-----------------|-----------------|
| **M0** | Market Intelligence | Is there a market rationale to proceed? | Intelligence, Decisions |
| **M1** | Concept Discovery | Idea crystallized enough to invest structure | Genome (Identity/Creative) |
| **M2** | Story Foundation | Premise, promise, audience, stakes baseline | Story Genome |
| **M3** | Book Genome | Core genome layers sufficiently populated | Book Genome |
| **M4** | Story Architecture | Acts/structure/conflict framework | Story System |
| **M5** | Outline Development | Outline complete enough for chapter planning | Chapters (outline mode) |
| **M6** | Chapter Planning | Chapter purposes/POVs/order locked enough | Chapters |
| **M7** | Scene Planning | Scene-level goals/conflicts planned | Scenes |
| **M8** | First Draft | Manuscript draft produced | Manuscript Studio |
| **M9** | Developmental Editing | Story-level editorial pass complete | Editorial |
| **M10** | Line Editing | Line-level craft pass | Editorial |
| **M11** | Copyediting | Language correctness pass | Editorial |
| **M12** | Proofreading | Final publication-ready text verification | Editorial |
| **M13** | Production | Formats/assets produced & preflighted | Production, Assets, Metadata |
| **M14** | Marketing Preparation | Campaigns/briefs/assets ready | Marketing |
| **M15** | Pre-Launch | Channel/metadata/pricing/checklist green | Distribution, Pricing, Metadata |
| **M16** | Publication | Release executed; products live | Distribution, Sales |
| **M17** | Post-Launch | Monitoring, reviews, corrections, momentum | Analytics, Marketing |
| **M18** | Catalog Growth | Catalog positioning, related titles, backlist ops | Catalog Intelligence |
| **M19** | Franchise Expansion | Series/universe/rights expansion decisions | Rights, Series/Universe |
| **M20** | Legacy Management | Long-term IP stewardship, reissues, archives | Rights, Assets, Canon |

### 6.1 Cross-cutting business rules for milestones

1. A book has exactly one `current_milestone` pointer, plus per-milestone records with status/readiness.
2. Advancement requires meeting **exit criteria** (FRD) OR an explicit publisher **waiver decision** recorded in Decisions.
3. Regression (moving backward) is allowed only with rationale and audit event.
4. AI may compute readiness suggestions; humans approve advancement.
5. Critical open editorial issues of severity `critical` block M13+ unless waived.

### 6.2 Traditional vs POS workflow (business narrative)

**Traditional:** Idea → Notebook → Outline → Character Notes → Worldbuilding → Word Doc → Editor Notes → Spreadsheet → Metadata → Marketing → Launch (many competing truths).

**POS:** Structured Book Record → Book Genome → Outline → Chapters → Scenes → Draft → Editorial → Production → Marketing → Launch (one truth, many derived views).

---

## 7. Capability Deep-Dives (Business Requirements)

For each capability: business objective, value, inputs/outputs, success signals. Functional detail is in FRD.

### 7.1 CAP-001 / CAP-002 — Tenancy & Access

**Objective:** Enable safe collaboration without leaking IP across organizations.  
**Value:** Multi-author imprint operations; contractor access; auditability.  
**Success signals:** Zero cross-tenant reads in security tests; invite→role→access path < 5 minutes for admin.

### 7.2 CAP-003 — Publication Library

**Objective:** Portfolio of publications as first-class projects.  
**Value:** Fast context switching; clear ownership; status at a glance.  
**Success signals:** User can create book, set genome basics, and see it in Library/Command Center within one session.

### 7.3 CAP-004 — Book Genome

**Objective:** Measurable DNA of a publication across 10 layers (Identity → Evolution).  
**Value:** Shared language for creative + commercial decisions; AI grounding; template generation.  
**Success signals:** Genome completeness score correlates with milestone readiness; marketing brief can be generated from genome without re-interviewing author.

### 7.4 CAP-005–007 — Character / Story / World

**Objective:** Psychology-rich characters, engineered story, reusable world — linked, not siloed.  
**Value:** Continuity cost reduction; better drafts; franchise readiness.  
**Success signals:** Continuity alerts catch contradictions before proof stage; character changes propagate to dependent views.

### 7.5 CAP-008–009 — Chapters, Scenes, Manuscript

**Objective:** Structure and prose co-exist with bidirectional navigation.  
**Value:** Planning integrity + drafting speed.  
**Success signals:** Word counts roll up; scene belongs to one chapter; manuscript versions recoverable.

### 7.6 CAP-010–011 — Graph, Canon, Timeline

**Objective:** Explicit knowledge graph and truth database.  
**Value:** Series/universe survivability; AI-safe grounding.  
**Success signals:** Canon search answers "what is established?"; timeline contradictions flagged.

### 7.7 CAP-012 — Milestone Engine

**Objective:** Make publishing operationally legible and gated.  
**Value:** Predictable schedules; fewer premature launches.  
**Success signals:** No M16 without metadata/production gates (or recorded waiver); readiness scores visible to executives.

### 7.8 CAP-014 — Editorial Intelligence

**Objective:** Replace scattered doc comments with a durable issue system + quality index.  
**Value:** Faster cycles; learning organization.  
**Success signals:** Issue MTTR measurable; critical issues visible in Command Center; lessons learned captured on resolve.

### 7.9 CAP-015–017 — Production, Metadata, Distribution Readiness

**Objective:** Convert approved manuscript into managed commercial products.  
**Value:** Professional launches; fewer file/metadata failures.  
**Success signals:** Asset registry complete for required formats; preflight checklist enforced at M13–M15.

### 7.10 CAP-018–021 — Pricing, Marketing, Sales, Rights

**Objective:** Commercial operations as structured data, not side spreadsheets.  
**Value:** Catalog intelligence; franchise/rights readiness.  
**Success signals:** Campaigns linked to books; rights expirations alertable; sales facts attachable.

### 7.11 CAP-022–025 — Decisions, Work, Search, Versions

**Objective:** Operating system ergonomics — memory, findability, recoverability.  
**Value:** Fewer meetings; safer experimentation.  
**Success signals:** "Why did we decide X?" answerable from Decisions; snapshot restore works.

### 7.12 CAP-026–027 — AI Agents & Automations

**Objective:** AI as employees with job descriptions, tools, memory, and managers (humans).  
**Value:** Throughput without sacrificing canon integrity.  
**Success signals:** 100% of canon-mutating agent outputs go through proposal→approval; rejected proposals retained for learning.

### 7.13 CAP-028–029 — Intelligence & Command Center

**Objective:** Digital twin of the publishing company at executive altitude.  
**Value:** Prioritization, risk control, portfolio strategy.  
**Success signals:** Executives can run weekly publishing standup from Command Center alone.

### 7.14 CAP-030 — OPAS trajectory

**Objective:** Do not paint the architecture into a proprietary dead end.  
**Value:** Future interoperability, partners, industry leadership.  
**Success signals:** Stable identity scheme, event model, and export formats align with OPAS layers even before certification.

---

## 8. Business Rules Catalog (selected high-value rules)

| Rule ID | Statement |
|---------|-----------|
| `BRULE-001` | The database/genome is authoritative; generated documents are not independently editable sources of truth. |
| `BRULE-002` | Every core entity has a stable unique ID and human `record_code` unique within book (or workspace where specified). |
| `BRULE-003` | Relationships reference entity IDs; free-text-only relationship storage is non-compliant for primary links. |
| `BRULE-004` | Child entities inherit workspace/book scope from parents; orphan scenes are invalid. |
| `BRULE-005` | Milestone advancement is an audited state transition. |
| `BRULE-006` | Critical editorial issues block publication milestones unless a Decision waiver exists. |
| `BRULE-007` | Asset approval is required before distribution packaging for that asset type. |
| `BRULE-008` | AI agents may not directly set milestone to M16 or alter approved canon without human approval. |
| `BRULE-009` | Soft-delete/archive preferred over hard-delete for genome/canon entities after M3. |
| `BRULE-010` | Word counts on chapters/scenes must roll up to book totals via system calculation (not manual-only). |
| `BRULE-011` | Series/Universe inheritance overrides must be explicit and audited. |
| `BRULE-012` | Every resolved editorial issue should capture root cause and/or lesson learned when severity ≥ high. |

---

## 9. Success Metrics & KPIs

### 9.1 Product / operational KPIs

| KPI | Definition | Target (initial) |
|-----|------------|------------------|
| Time-to-M3 | Median days from book create → M3 approved | Measurable baseline in 90 days; then −20% |
| Milestone predictability | % milestones completed by planned date | ≥ 70% after process adoption |
| Critical escape rate | Critical issues found post-M12 | Trending down quarter over quarter |
| Genome reuse | % marketing briefs auto-drafted from genome | ≥ 80% of launches |
| Continuity catch rate | Continuity issues found pre-M12 vs post | Pre ≥ 90% of total continuity issues |
| Agent approval compliance | Canon-affecting agent changes with approval record | **100%** |
| Audit completeness | Privileged actions with event row | **100%** |
| Snapshot restore success | Successful restore drills | 100% in staging drills |

### 9.2 Quality KPIs

Editorial Quality Index dimensions (business): Story, Character, Dialogue, World Consistency, Theme Integration, Grammar, Readability, Continuity, Research, Accessibility, Production Readiness.

### 9.3 Adoption KPIs

Weekly active creators; % titles with genome completeness ≥ threshold for current milestone; % titles with ≥1 editorial issue tracked in-system (not external docs).

---

## 10. Phased Delivery Roadmap (Business Phases)

> Note: Phases describe **capability slices**, not calendar estimates.

### Phase 0 — Foundations (hardening current app)
- Auth hardened; env/deploy reliable
- Workspace model migration path from `user_id` ownership
- Event/audit table live
- Requirement pack adopted by eng/QA

### Phase 1 — Canonical Book OS Core
- CAP-001–003, CAP-004 (essential layers), CAP-005, CAP-008–009
- CAP-012 (M0–M12 enforced lightly; M13–M20 tracked)
- CAP-014 (editorial issues)
- CAP-022–025 (decisions, activity, search basics, versions/snapshots MVP)
- Command Center MVP (CAP-029 light)

### Phase 2 — Structure, Continuity & Production
- Scenes, locations, relationships, canon, timeline (CAP-006/007/010/011 depth)
- Production assets + metadata gates (CAP-015–017)
- Marketing campaigns object model (CAP-019)
- Milestone gates tightened through M16

### Phase 3 — Governed AI + Commercial Ops
- Agent workforce with proposals/approvals/memory (CAP-026–027)
- Rights/licensing (CAP-021)
- Pricing records + sales ingest (CAP-018/020)
- Intelligence dashboards expansion (CAP-028)

### Phase 4 — Publishing OS / OPAS trajectory
- Series/Universe inheritance at scale
- Deeper predictive intelligence
- Exchange APIs, partner portals
- OPAS layer alignment / digital twin maturity

### Phase exit criteria (business)

Each phase exits when:

1. Listed capabilities have FRD acceptance criteria passing in staging  
2. Security tenancy tests pass  
3. Publisher stakeholder sign-off on Command Center usefulness for that phase  
4. Migration notes applied for existing data  

---

## 11. Data Domains (Business View)

### 11.1 Core creative domains
Book, Series, Universe, Character, Location, Chapter, Scene, Theme, Timeline Event, Relationship, Canon Fact, Decision.

### 11.2 Operating domains
Milestone, Milestone Item, Editorial Issue, Revision, Style Guide Rule, Sensitivity Review, Work Item, Notification, Automation.

### 11.3 Commercial domains
Asset, ISBN/Metadata Record, Distribution Target, Price Record, Campaign, Sales Fact, Rights Record, License Deal.

### 11.4 Intelligence & AI domains
Agent Definition, Agent Run, Agent Proposal, Shared Memory Item, Quality Score Snapshot, Portfolio Metric Snapshot.

### 11.5 Platform domains
Organization, Workspace, Membership, Role/Capability, Event/Audit, Entity Version, Snapshot, Export Job.

### 11.6 Universal record expectations (from Manual Volume IX)

Every durable record conceptually includes:

- Identity (IDs, record codes, titles/names)
- Lifecycle status (`draft` / `working` / `review` / `approved` / `published` / `archived`)
- Ownership / attribution
- Timestamps
- Version
- AI-ready fields (embeddings/summary hooks as applicable by phase)
- Analytics fields (counts, scores) as applicable

---

## 12. Integration Landscape (Business)

| Integration | Phase | Business need |
|-------------|-------|---------------|
| Supabase Auth | 0 | Identity |
| Supabase Storage | 1–2 | Manuscript assets / production files |
| Vercel hosting | 0 | Web delivery |
| LLM providers (via gateway) | 3 | Agent workforce |
| Email (transactional) | 1 | Invites/notifications |
| CSV sales ingest | 3 | Sales facts without full retailer API |
| Retailer/distributor APIs | 4+ | Distribution automation |
| ONIX exchange | 4+ | Metadata interoperability |
| Object storage CDN | 2 | Large binary assets |

---

## 13. Risks, Issues & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Genome over-modeling slows authors | Adoption failure | High | Progressive enrichment; milestone-appropriate required fields only |
| AI corrupts canon | Trust failure | Medium | Proposal/approval; no direct write; evaluation harness |
| Scope explosion across 18 volumes | Delivery stall | High | Phased CAP delivery; Manual is north star, FRD is contract |
| Tenancy bugs | IP leak | Low/Med | RLS tests mandatory in CI |
| Dual systems (prototype vs app) confusion | Wasted eng | Medium | This pack declares canonical target; prototype is reference only |
| Metadata/distribution underestimated | Failed launches | Medium | Hard gates at M13–M15 |
| Performance with large manuscripts | UX pain | Medium | Chapter-scoped loading; storage strategy in Tech Spec |

---

## 14. Compliance, Security & Governance (Business)

1. **IP confidentiality** — manuscripts and genomes are confidential tenant data.  
2. **Least privilege** — contractors get capability-scoped access.  
3. **Human accountability** — publication and canon approvals attributable to a person.  
4. **Retention** — events/versions retained per policy; legal hold capability reserved.  
5. **AI disclosure** — internally track which text segments were AI-proposed vs human-authored where feasible (phase-progressive).  
6. **Accessibility & sensitivity** — supported as first-class review types, not afterthoughts.  

---

## 15. Acceptance at Business Level

The POS Phase N release is business-accepted when:

1. Capabilities scheduled for that phase are demonstrable in a stakeholder walkthrough.  
2. A sample title can move from create → draft → editorial issue loop → production asset checklist → launch readiness checklist with audit history.  
3. Cross-tenant isolation verified.  
4. Executive Command Center answers: *Where is each title? What is blocking launch? What is critical risk?*  
5. No severity-1 open defects against BRULE-001–008.

---

## 16. Traceability to Manual Volumes

| Manual Volume | BRD mapping |
|---------------|-------------|
| I Vision & Architecture | §2, principles, layers |
| II Book Genome & Master Data | CAP-004–011, §11 |
| III Workbook/Schema | Tech Spec schema; CAP data domains |
| IV Milestone Engine | §6, CAP-012 |
| V Creative Engine | CAP-006/013, character/story/world |
| VI Editorial Intelligence | CAP-014 |
| VII Production/Commercial | CAP-015–021, CAP-029 |
| VIII AI Agents | CAP-026 |
| IX Data Dictionary | §11, Tech Spec |
| X Book Genome Spec | CAP-004 |
| XI Intelligence | CAP-028 |
| XII Enterprise Platform | CAP-001/002/023/024/029, NFR |
| XIII Character Genome | CAP-005 |
| XIV Story Genome | CAP-006 |
| XV World Genome | CAP-007 |
| XVI Knowledge Graph | CAP-010/011, CAP-030 |
| XVII AI ADK | CAP-026, Tech Spec agents |
| XVIII OPAS | CAP-030, Phase 4 |

---

## 17. Glossary (selected)

| Term | Definition |
|------|------------|
| **POS** | Publishing Operating System — the full Mangu platform ambition |
| **Book OS** | Core product for building and operating individual publications |
| **Book Genome** | Structured, layered DNA of a publication |
| **Single Source of Truth** | Canonical structured store from which artifacts are derived |
| **Milestone Engine** | M0–M20 gated lifecycle |
| **Canon** | Established truth database for fictional (or factual) continuity |
| **Agent Proposal** | AI-suggested change awaiting human decision |
| **Asset** | Managed production/commercial file/object with version/approval |
| **Command Center** | Executive operational dashboard |
| **OPAS** | Open Publishing Architecture Standard (industry layer) |
| **Progressive Enrichment** | Deepen data over time without early overload |
| **Inheritance** | Child entities receive context from Universe/Series/Book ancestors |

---

## 18. Document Control

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0.0 | 2026-07-19 | Cursor Cloud Agent (POS build documentation) | Initial exhaustive BRD for engineering kickoff |

**Approval checklist**

- [ ] Publisher / owner review  
- [ ] Product owner review  
- [ ] Engineering lead review  
- [ ] Editorial lead review  
- [ ] Production lead review  

---

*End of BRD — continue to FRD for testable functional requirements.*
