# MANGU Book OS — Business Requirements Document (BRD)

| Field | Value |
|---|---|
| **Document ID** | MANGU-BRD-001 |
| **Product** | MANGU Book Operating System (Book OS / POS) |
| **Version** | 1.0 |
| **Status** | Approved for Engineering Kickoff |
| **Date** | 2026-07-19 |
| **Owner** | Mangu Publishers — Product & Architecture |
| **Audience** | Executive sponsors, product, engineering, creative ops, editorial, production, marketing |
| **Source Authority** | MANGU Book OS Manual v1.0 (Volumes I–XVIII), prototype v0.2, canonical React/Supabase repo |

---

## 1. Executive Summary

### 1.1 What We Are Building

**MANGU Book OS** (also referred to internally as **POS — Publishing Operating System**) is an end-to-end publishing platform that takes a publication from **market intelligence (M0)** through **legacy stewardship (M20)** using a single canonical data model called the **Book Genome**.

Book OS is **not** a manuscript editor, spreadsheet, or folder of documents. It is a **unified information architecture** where every fact about a publication exists once, is structured before narrative prose, and powers creative development, editorial intelligence, production pipelines, marketing operations, commercial analytics, and governed AI assistance.

### 1.2 Business Problem

Publishing workflows today are fragmented across:

- Outlines, manuscripts, character sheets, worldbuilding notes
- Editorial annotations in separate tools
- Metadata spreadsheets, marketing briefs, launch trackers
- Production asset folders with inconsistent versioning
- Ad-hoc AI chats disconnected from project truth

This fragmentation produces:

| Pain | Business Impact |
|---|---|
| Duplicated data entry | Wasted author/editor hours; inconsistent metadata |
| Version conflicts | Wrong cover copy, outdated character names in marketing |
| Lost institutional knowledge | Staff turnover erodes series/universe continuity |
| Manual synchronization | Delayed launches; missed preflight requirements |
| Ungoverned AI usage | Hallucinated canon; unapproved automated changes |
| Weak readiness visibility | Projects advance without gate criteria met |

### 1.3 Business Opportunity

Book OS creates a **digital twin of a publishing company** — one system where:

1. **Creative teams** develop stories as structured, queryable systems.
2. **Editorial teams** track issues, canon, continuity, and quality scores.
3. **Production teams** manage asset registries, ISBN/metadata, and distribution packages.
4. **Marketing teams** derive campaigns from the same genome used to write the book.
5. **Executives** see readiness, risk, blockers, and next actions per title and portfolio.
6. **AI agents** read shared memory and propose changes through human approval gates.

### 1.4 Strategic Vision

> *Every piece of information about a publication should exist once, in one authoritative location, and be reusable everywhere else.*

Long-term, Book OS must support books, comics, graphic novels, manga, magazines, educational materials, audiobooks, interactive publications, and formats not yet defined — via extensible modules on a common core genome.

### 1.5 Success Definition (North Star)

A publisher can onboard a new title, progress it through M0–M20, collaborate across roles, generate downstream artifacts from structured data, and launch with **zero conflicting truths** about characters, metadata, assets, or milestone readiness — with full audit history.

---

## 2. Scope

### 2.1 In Scope — Product Build

| Layer | Scope |
|---|---|
| **Core Platform** | Multi-user auth, workspaces, organizations, role-based access |
| **Canonical Data** | Book Genome entities: Book, Series, Universe, Character, Location, Scene, Chapter, Timeline, Canon, Relationships, Themes, Assets, Campaigns, Editorial Issues, Decisions, Rights |
| **Lifecycle Engine** | M0–M20 milestones, checklist items, readiness scoring, gate approval |
| **Creative Engine** | Character/world/story engines, narrative stack, conflict matrix, scene planning |
| **Editorial Intelligence** | Issue Kanban, severity, continuity/canon management, editorial quality score |
| **Production Ops** | Asset registry, preflight validation, metadata/ISBN, distribution readiness |
| **Marketing Ops** | Campaign planning, channel tracking, launch/pre-launch checklists |
| **Intelligence Layer** | Dashboards, portfolio analytics, predictive readiness (phased) |
| **AI Workforce** | Governed agents with shared memory, proposals, approvals, audit trail |
| **Knowledge Graph** | Cross-entity relationships, semantic search, event stream |
| **Integrations** | Export/import, snapshots, future OPAS interoperability |

### 2.2 Out of Scope — Initial Release (v1.0 GA)

| Item | Rationale | Future Phase |
|---|---|---|
| Full 300–500 field Book entity | Progressive enrichment; ship core + JSONB genome extensibility | v1.x |
| Native mobile apps | Web-first PWA acceptable for v1 | v2 |
| Direct retailer API integrations (Amazon KDP, Ingram, etc.) | Requires partner agreements | v2+ |
| Print-on-demand production automation | Manual asset registry first | v2 |
| Public OPAS marketplace / certification | Platform maturity prerequisite | v3+ |
| Autonomous publishing (no human gates) | Violates governance philosophy | Never by default |

### 2.3 Current Baseline (As-Is)

The repository today (`redinc23/book1_assign`) contains:

- **React 18 + TypeScript + Vite + Tailwind** SPA
- **Supabase Auth + PostgreSQL** with simplified owner-scoped schema
- **11 product views**: Dashboard, Library, Lifecycle, Genome, Characters, Chapters, Editorial, Production, Marketing, AI Center, Activity
- **Prototype reference** (`prototype-reference/`, standalone HTML v0.1/v0.2) with richer M0–M20 kernel
- **Target schema** (`prototype-reference/legacy-schema.sql`) not yet fully migrated

**Gap:** Current app implements ~15% of the manual's target surface. This BRD defines the **full build**; phased delivery is in Section 10.

---

## 3. Stakeholders & Personas

### 3.1 Stakeholder Map

| Stakeholder | Interest | Success Criteria |
|---|---|---|
| **Publisher / CEO** | Portfolio visibility, ROI, risk | Executive dashboard, readiness scores, launch confidence |
| **Creative Director** | Story quality, canon integrity | Genome completeness, creative health metrics |
| **Author** | Focus on writing, not admin | Manuscript studio, structure-first drafting |
| **Developmental Editor** | Structure, pacing, character arcs | Editorial pyramid, issue tracking, revision plans |
| **Copy Editor / Proofreader** | Consistency, style guide | Issue categories, proof logs, sign-off gates |
| **Production Manager** | Asset completeness, preflight | Asset registry, M13/M15 checklists |
| **Marketing Lead** | Positioning from source truth | Campaign module fed by genome |
| **Rights Manager** | IP lifecycle | Rights records, M19/M20 stewardship |
| **Engineering** | Maintainable architecture | Clear domain model, API contracts, testability |
| **AI Operations** | Safe agent deployment | ADK, governance, evaluation framework |

### 3.2 Primary Personas

#### Persona A — Independent Author-Publisher ("Alex")
- Runs 1–3 active titles, wears all hats
- Needs: simple onboarding, guided M0–M8, AI copilot, export to Word/PDF
- Pain: drowning in scattered Google Docs

#### Persona B — Small Publisher Ops Lead ("Jordan")
- Manages 5–20 titles, 3–8 collaborators
- Needs: workspace roles, milestone gates, editorial Kanban, production tracker
- Pain: no single readiness picture before launch

#### Persona C — Enterprise Publishing Director ("Morgan")
- Portfolio of 50+ titles, series/universe franchises
- Needs: multi-workspace, knowledge graph, portfolio intelligence, rights/legacy
- Pain: institutional memory loss across imprints

---

## 4. Business Objectives & KPIs

### 4.1 Objectives

| ID | Objective | Measurement |
|---|---|---|
| BO-01 | Eliminate duplicate truth | ≤1 canonical record per fact per book |
| BO-02 | Accelerate time-to-readiness | Reduce avg days M8→M13 by 30% vs baseline |
| BO-03 | Improve launch quality | ≤5 critical editorial issues open at M15 |
| BO-04 | Preserve organizational memory | 100% entity change audit coverage |
| BO-05 | Govern AI assistance | 100% AI mutations via proposal→approval |
| BO-06 | Enable portfolio decisions | Executive dashboard for all active titles |

### 4.2 Key Performance Indicators

| KPI | Target (12 mo post-GA) | Frequency |
|---|---|---|
| Weekly active workspaces | 100+ | Weekly |
| Books with genome ≥70% complete at M5 | 80% | Per gate |
| Milestone gate approval cycle time | <48h median | Per gate |
| Editorial issue resolution rate | 90% before M13 | Per book |
| Production preflight pass rate (first attempt) | 85% | Per launch |
| AI proposal acceptance rate | 40–60% (quality signal) | Monthly |
| User-reported conflicting metadata incidents | 0 critical | Per launch |

---

## 5. Business Requirements

### 5.1 Core Platform Requirements

| ID | Requirement | Priority | Rationale |
|---|---|---|---|
| BR-PLAT-001 | System SHALL support organizations containing one or more workspaces | P0 | Enterprise multi-imprint |
| BR-PLAT-002 | System SHALL authenticate users via Supabase Auth (email/OAuth) | P0 | Security baseline |
| BR-PLAT-003 | System SHALL enforce workspace-scoped row-level security on all domain data | P0 | Multi-tenant isolation |
| BR-PLAT-004 | System SHALL support roles: Owner, Admin, Author, Editor, Production, Marketing, Viewer | P0 | Collaboration |
| BR-PLAT-005 | System SHALL maintain immutable event/audit log for material changes | P0 | Compliance, debugging |
| BR-PLAT-006 | System SHOULD support real-time collaboration indicators | P2 | Multiple editors |
| BR-PLAT-007 | System SHALL export/import full project snapshots (JSON) | P1 | Portability, backup |

### 5.2 Book Genome Requirements

| ID | Requirement | Priority |
|---|---|---|
| BR-GEN-001 | Every entity SHALL have stable UUID, human-readable record_code, status lifecycle, version | P0 |
| BR-GEN-002 | Book record SHALL be root aggregate for chapters, characters, scenes, assets, issues | P0 |
| BR-GEN-003 | Series and Universe SHALL support inheritance (shared characters/locations/canon) | P1 |
| BR-GEN-004 | Structured fields SHALL be captured before freeform manuscript prose | P0 |
| BR-GEN-005 | Genome JSONB extensions SHALL allow progressive enrichment without schema migration | P0 |
| BR-GEN-006 | Relationship graph SHALL link any entity type to any other with typed edges | P1 |
| BR-GEN-007 | Canon facts SHALL support supersession, effective dates, confidence, source provenance | P1 |

### 5.3 Lifecycle (M0–M20) Requirements

| ID | Requirement | Priority |
|---|---|---|
| BR-LC-001 | Every book SHALL track current_milestone (M0–M20) | P0 |
| BR-LC-002 | Each milestone SHALL have named deliverables, checklist items, exit criteria | P0 |
| BR-LC-003 | Milestone advancement SHALL require human approval when readiness <100% or gate fails | P0 |
| BR-LC-004 | System SHALL compute readiness scores: creative, editorial, production, marketing, commercial | P0 |
| BR-LC-005 | Later-stage feedback SHALL enrich earlier entities without breaking canonical IDs | P1 |
| BR-LC-006 | Lifecycle dashboard SHALL show blockers, risks, next recommended actions | P0 |

### 5.4 Creative Engine Requirements

| ID | Requirement | Priority |
|---|---|---|
| BR-CRE-001 | Characters SHALL model identity, psychology, motivation, behavior, relationships, arc, voice | P0 |
| BR-CRE-002 | Chapters SHALL support purpose, POV, hooks, word goals, emotional shift, dependencies | P0 |
| BR-CRE-003 | Scenes SHALL be first-class entities with goal/conflict/outcome/change justification | P1 |
| BR-CRE-004 | Story architecture (acts, turning points, reveals) SHALL be storable and validated | P1 |
| BR-CRE-005 | Creative readiness score SHALL gate M8 (First Draft) | P1 |

### 5.5 Editorial Intelligence Requirements

| ID | Requirement | Priority |
|---|---|---|
| BR-ED-001 | Editorial issues SHALL support category, severity, status workflow, assignee | P0 |
| BR-ED-002 | Issues SHALL link to chapter, scene, character entities | P0 |
| BR-ED-003 | Continuity/canon violations SHALL be detectable and surfaced as issues | P1 |
| BR-ED-004 | Editorial quality score SHALL contribute to milestone readiness | P1 |
| BR-ED-005 | Proofreading pass (M12) SHALL produce sign-off checklist | P1 |

### 5.6 Production & Commercial Requirements

| ID | Requirement | Priority |
|---|---|---|
| BR-PROD-001 | Asset registry SHALL track type, format, version, checksum, approval state, storage path | P0 |
| BR-PROD-002 | M13 preflight SHALL validate required asset types before M15 | P0 |
| BR-PROD-003 | Metadata engine SHALL generate retailer-ready fields from book genome | P1 |
| BR-PROD-004 | ISBN assignment workflow SHALL be tracked per edition | P2 |
| BR-PROD-005 | Rights records SHALL link to M19 franchise and M20 legacy workflows | P2 |

### 5.7 Marketing Requirements

| ID | Requirement | Priority |
|---|---|---|
| BR-MKT-001 | Campaigns SHALL derive hook, themes, audience from book genome | P0 |
| BR-MKT-002 | M14/M15 checklists SHALL cover ARC, press kit, social calendar, pricing approval | P1 |
| BR-MKT-003 | Post-launch (M17) SHALL capture channel performance and reader feedback | P2 |

### 5.8 AI & Governance Requirements

| ID | Requirement | Priority |
|---|---|---|
| BR-AI-001 | AI agents SHALL read from shared memory (genome, lifecycle, issues, assets) — never isolated context | P0 |
| BR-AI-002 | AI SHALL NOT write canonical data without proposal + human approval | P0 |
| BR-AI-003 | Agent runs SHALL be logged with input, output, model metadata, approver | P0 |
| BR-AI-004 | Specialized agents SHALL map to milestone domains (Market Intel, Story Architect, Continuity Guardian, etc.) | P1 |
| BR-AI-005 | Executive Publisher AI SHALL orchestrate cross-domain briefs and gate recommendations | P1 |

---

## 6. M0–M20 Business Milestone Reference

Each milestone answers: **What must be true before the publication moves forward?**

| Code | Name | Business Purpose | Key Deliverables | Approvers |
|---|---|---|---|---|
| **M0** | Market Intelligence | Validate the book should exist | Market report, comps, personas, opportunity matrix | Publishing Director, Creative Director, Business Lead |
| **M1** | Concept Discovery | Crystallize the idea | Title, premise, pitch, genre, theme, conflict | Creative lead |
| **M2** | Story Foundation | Define emotional engine | Protagonist/antagonist, wounds, stakes, transformation | Creative lead |
| **M3** | Book Genome | Populate canonical records | Characters, locations, themes, timeline, canon rules | Creative Director |
| **M4** | Story Architecture | Determine how story is told | Acts, turning points, subplots, reveals, pacing | Story lead |
| **M5** | Outline Development | Chapter-level outline | Chapter list, summaries, word estimates | Author + editor |
| **M6** | Chapter Planning | Chapter as planning unit | Purpose, POV, hooks, dependencies per chapter | Author |
| **M7** | Scene Planning | Scene as atomic unit | Goal, conflict, change, emotional shift per scene | Author |
| **M8** | First Draft | Write against structure | Manuscript, velocity metrics, quality flags | Author |
| **M9** | Developmental Editing | Evaluate story | Revision plan, structural issues | Dev editor |
| **M10** | Line Editing | Voice and clarity | Line-level revision completion | Line editor |
| **M11** | Copyediting | Technical correctness | Style consistency, grammar pass | Copy editor |
| **M12** | Proofreading | Final correction | Proof log, publication sign-off | Proofreader |
| **M13** | Production | Create products | Print, ebook, audio, cover, metadata, ISBN | Production mgr |
| **M14** | Marketing Preparation | Pre-launch marketing | Brand messaging, press kit, ARC, ad plan | Marketing lead |
| **M15** | Pre-Launch | Final readiness | Files, metadata, pricing, schedules verified | Publishing Director |
| **M16** | Publication | Launch | Sales, rankings, reviews, inventory tracking | Ops |
| **M17** | Post-Launch | Analyze outcomes | Channel performance, feedback synthesis | Marketing + editorial |
| **M18** | Catalog Growth | Expand catalog value | Translations, editions, audio, companions | Publisher |
| **M19** | Franchise Expansion | IP ecosystem | Sequels, adaptations, licensing | Rights + exec |
| **M20** | Legacy Management | Long-term stewardship | Rights renewals, archives, canon, new editions | Publisher |

---

## 7. Constraints & Assumptions

### 7.1 Constraints

- **Budget:** Engineering team size and AI inference costs must be modeled per phase.
- **Timeline:** Phased delivery required; full manual scope is multi-release.
- **Technology:** Canonical stack is React + Supabase + Vercel unless formally changed.
- **Compliance:** User data, manuscript IP, and audit logs require encryption at rest and in transit.
- **Governance:** Human approval gates are non-negotiable for AI writes.

### 7.2 Assumptions

- Users have modern browsers (Chrome, Firefox, Safari, Edge — last 2 versions).
- Supabase project is provisioned with appropriate tier for production workloads.
- AI provider access (OpenAI, Anthropic, or Vercel AI Gateway) available for agent features.
- Mangu Book OS Manual v1.0 remains authoritative for domain semantics.
- Prototype v0.2 (`prototype-reference/`) is the interaction reference for transplant features.

---

## 8. Dependencies

| Dependency | Owner | Impact if Delayed |
|---|---|---|
| Supabase production project + RLS policies | DevOps | No multi-user launch |
| Domain schema migration (legacy-schema.sql) | Backend | Genome features blocked |
| AI gateway + agent runtime | Platform | AI Center remains heuristic-only |
| Object storage bucket (`mangu-assets`) | Infra | Production assets blocked |
| Design system completion (Tailwind tokens) | Frontend | UI inconsistency |
| Manual/sign-off on M0–M20 checklist templates | Product | Gate engine incomplete |

---

## 9. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Scope creep from 18-volume manual | High | High | Strict phase gates; JSONB extensibility |
| Schema migration breaks existing users | Medium | High | Dual-write period; migration scripts; snapshots |
| AI hallucination corrupts canon | Medium | Critical | Proposal-only writes; Continuity Guardian agent |
| Performance degradation on large manuscripts | Medium | Medium | Chunked storage; lazy loading; search indexing |
| Low author adoption (too structured) | Medium | High | Progressive enrichment UX; optional fields early |
| Vendor lock-in (Supabase) | Low | Medium | OPAS export standard; snapshot portability |

---

## 10. Phased Delivery Roadmap

### Phase 0 — Foundation (Current → 4 weeks)
**Goal:** Production-grade shell with auth, books CRUD, characters, chapters, activity.

- Delivered: React app, Supabase auth, simplified schema, 11 views (partial)
- Remaining: Activity logging on all mutations; book switcher polish; CI green

### Phase 1 — Canonical Domain (6–8 weeks)
**Goal:** Migrate to workspace model + core genome tables from `legacy-schema.sql`.

- Organizations, workspaces, workspace_members
- Books with record_code, current_milestone, genome JSONB
- Characters, chapters (enhanced), milestones, milestone_items
- Events table + audit on all writes

### Phase 2 — Lifecycle Engine (4–6 weeks)
**Goal:** Full M0–M20 milestone UI + gate approval + readiness scoring.

- Port milestone kernel from prototype v0.2
- Gate check business rules
- Lifecycle dashboard matching manual spec

### Phase 3 — Creative & Editorial (6–8 weeks)
**Goal:** Scenes, locations, canon, relationships, editorial Kanban, manuscript studio.

- Scene planning (M7)
- Editorial issues with severity workflow
- Manuscript editor with chapter/scene navigation
- Version history (entity_versions)

### Phase 4 — Production & Marketing (4–6 weeks)
**Goal:** Asset registry, preflight, campaigns, M13–M15 checklists.

- Supabase Storage integration
- Asset approval workflow
- Marketing campaigns module (replace marketing_items)

### Phase 5 — AI Workforce (6–10 weeks)
**Goal:** Governed agents, shared memory, proposal queue, Executive Publisher.

- Agent runs table + Edge Functions
- Proposal review UI
- Minimum viable agents: Executive Publisher, Continuity Guardian, Story Architect

### Phase 6 — Intelligence & Enterprise (8–12 weeks)
**Goal:** Knowledge graph, semantic search, portfolio dashboards, rights/legacy.

- Graph queries on relationships
- Publishing Intelligence Center
- M18–M20 modules
- OPAS export foundation

---

## 11. Acceptance Criteria (Business Level)

Book OS v1.0 GA is accepted when:

1. A workspace admin can create a book and progress it M0→M13 with gate approvals.
2. Characters, chapters, scenes, and editorial issues are fully CRUD with audit trail.
3. Readiness dashboard shows accurate scores derived from checklist completion.
4. Asset registry holds cover + interior + ebook with approval states; M13 preflight passes.
5. AI agent can propose a character field change; human approves; audit shows full chain.
6. Project snapshot export/import round-trips without data loss.
7. 95th percentile page load <3s on standard broadband.
8. Zero critical security findings on RLS penetration test.

---

## 12. Glossary

| Term | Definition |
|---|---|
| **Book OS / POS** | MANGU Book Operating System — Publishing Operating System |
| **Book Genome** | Complete structured representation of reusable publication information |
| **Canonical Record** | Single authoritative entity instance referenced everywhere |
| **Gate** | Milestone checkpoint requiring readiness + human approval |
| **Genome JSONB** | Extensible structured fields on entities for progressive enrichment |
| **OPAS** | Open Publishing Architecture Standard (Volume XVIII) |
| **Readiness Score** | Computed % completion for milestone/domain, not word count alone |
| **Record Code** | Human-readable ID (e.g., `BOOK-000001`, `CHAR-000012`) |
| **Shared Memory** | AI-accessible projection of genome + lifecycle + issues + assets |
| **Workspace** | Tenant boundary containing books and members |

---

## 13. Document Control

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-07-19 | Cloud Agent | Initial BRD from Manual v1.0 + repo baseline |

**Related Documents:**
- `docs/02-FRD-MANGU-Book-OS.md` — Functional Requirements
- `docs/03-TECH-SPEC-MANGU-Book-OS.md` — Technical Specification
- `prototype-reference/HANDOFF-v0.2.md` — Prototype handoff
- `prototype-reference/legacy-schema.sql` — Target PostgreSQL schema

---

*End of Business Requirements Document*
