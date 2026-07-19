# MANGU Book OS — Business Requirements Document (BRD)

| Field | Value |
|---|---|
| Document ID | `BRD-BOOKOS-001` |
| Version | `1.0.0` |
| Status | **Approved for engineering** |
| Product | MANGU Book Operating System |
| Owner | Product / Founding Publisher |
| Last Updated | 2026-07-19 |
| Related | FRD-BOOKOS-001, TECH-BOOKOS-001 |
| Source Authority | MANGU Book OS Manual Vols I–XVIII + current codebase baseline |

---

## 1. Executive Summary

### 1.1 One-sentence mission

Build the world’s most complete **publishing operating system** — a single source of truth that takes a publication from idea to globally distributed product using structured data, intelligent workflows, AI-assisted creation, and human governance.

### 1.2 Problem statement

Publishing workflows today are fragmented across outlines, manuscripts, character sheets, editorial notes, metadata forms, marketing briefs, production trackers, and launch plans. Each artifact evolves independently, creating:

- duplicated work and inconsistent facts
- version conflicts and lost institutional knowledge
- manual synchronization overhead
- avoidable production delays and missed commercial opportunities
- AI tools that rewrite blindly without shared canon or approval gates

The cost is not merely inefficiency — it is organizational amnesia.

### 1.3 Solution statement

MANGU Book OS is a **knowledge-centric cloud platform** (not document-centric software) where every participant — authors, editors, designers, marketers, executives, and specialized AI agents — works from one canonical structured model (the Book Genome and related genomes), with milestone-gated workflows and human approval on consequential actions.

### 1.4 Business outcomes (success definition)

| Outcome ID | Outcome | Target signal |
|---|---|---|
| `BO-01` | Single source of truth adopted | ≥95% of project facts originate from Book OS entities (not side docs) by Phase 2 |
| `BO-02` | Faster concept→draft | Median days from MS-M1 exit to MS-M8 start reduced vs baseline spreadsheet workflow |
| `BO-03` | Fewer continuity defects | Continuity issues escaping to proofreading reduced ≥40% after Continuity Guardian GA |
| `BO-04` | Governed AI adoption | ≥80% of AI writes applied only via approved proposals |
| `BO-05` | Launch readiness visibility | Every title has a real-time Launch Readiness score before MS-M16 |
| `BO-06` | Reusable IP | Characters/locations/worlds reusable across series without re-entry |
| `BO-07` | Enterprise readiness | Multi-seat org, roles, audit, export/import by Phase 3 |

---

## 2. Vision, Philosophy & Strategic Intent

### 2.1 Vision statement (`BR-001`)

> Every piece of information about a publication should exist once, in one authoritative location, and be reusable everywhere else.

### 2.2 Long-term product vision (`BR-002`)

Book OS must eventually support, via a **publication-agnostic core** with extensible modules:

- Books, children’s books, educational materials
- Comic books, graphic novels, manga
- Magazines, journals, newspapers
- Interactive / digital publications
- Audiobooks and multimedia publishing
- Future formats not yet defined

### 2.3 Design philosophy (binding business principles)

| Principle ID | Principle | Business implication |
|---|---|---|
| `BR-003` | Single Source of Truth | Downstream artifacts are generated/derived; they are never competing masters |
| `BR-004` | Knowledge-centric, not document-centric | Primary question is “What do we know?” not “Where is the file?” |
| `BR-005` | Canonical entities with universal headers | Every record shares identity, workflow, AI, analytics, audit fields |
| `BR-006` | Milestone-gated lifecycle (M0–M20) | Progression requires exit criteria + human approval where specified |
| `BR-007` | AI is an employee, not a magic button | Specialists with role, authority, limits, KPIs, escalation |
| `BR-008` | Human governance on consequential actions | AI proposes; humans approve for canon, rights, publish, pricing, major rewrites |
| `BR-009` | Modular platform applications | Modules evolve independently on shared data model |
| `BR-010` | Open Publishing Architecture Standard (OPAS) alignment | Interoperability and portable intelligence metrics |

### 2.4 Strategic positioning

Book OS aspires to be the “Salesforce + Adobe + Atlassian + Bloomberg Terminal + GitHub of publishing” — an operating system for the publishing company, not a word processor with extras.

---

## 3. Stakeholders & Personas

### 3.1 Stakeholder map

| Stakeholder | Interest | Influence | Primary modules |
|---|---|---|---|
| Founding Publisher / CEO | Portfolio health, IP value, speed | Critical | Executive Center, Analytics |
| Creative Director | Story quality, genome completeness | High | Genome, Creative Engine, AI Center |
| Managing Editor | Editorial throughput, quality gates | High | Editorial, Lifecycle, Work Queue |
| Author / Co-Author | Writing flow, character consistency | High | Manuscript, Chapters, Characters |
| Production Lead | Assets, preflight, retail packages | Medium | Production, Assets |
| Marketing Lead | Messaging, campaigns, launch | Medium | Marketing, Metadata |
| Rights / Business Lead | Contracts, licensing, royalties | Medium | Rights, Sales, Finance |
| AI Operations | Agent quality, cost, safety | High | AI Center, ADK |
| Engineering | Feasibility, reliability | Critical | Platform |
| End reader (indirect) | Experience quality | Low (via metrics) | Analytics |

### 3.2 Primary personas (build for these first)

#### P-01 — Solo Author-Publisher
Runs 1–3 titles. Needs genome, draft, editorial issues, basic marketing, AI help with guardrails. Price sensitivity high. Org size = 1 user.

#### P-02 — Indie Imprint Operator
Team of 3–15. Needs roles, approvals, multi-book portfolio, production + marketing ops, shared canon across series.

#### P-03 — Developmental Editor
Lives in issue Kanban, severity, chapter links, revision history, AI diagnosis (not blind rewrite).

#### P-04 — Production Coordinator
Asset registry, cover/interior/ebook/audiobook checklists, ISBN/metadata, preflight.

#### P-05 — Executive Publisher
Dashboard health scores, milestone risk, portfolio prioritization, approval inbox.

#### P-06 — AI Agent Operator (human)
Configures agents, reviews proposals, sets autonomy levels, monitors cost/confidence.

### 3.3 Secondary personas (Phase 3+)

Illustrator, Translator, Rights Manager, Sales Analyst, Retail Partner (portal), External Licensor.

---

## 4. Scope

### 4.1 In scope — Product domains (full build)

| Domain ID | Domain | Manual Volume | Priority Phase |
|---|---|---|---|
| `DOM-CORE` | Auth, orgs, workspaces, books, series, universes | I–III, XII | P0 |
| `DOM-GENOME` | Book / Character / Story / World genomes | II, X, XIII–XV | P0–P1 |
| `DOM-NARRATIVE` | Chapters, scenes, outline, manuscript studio | III, V | P0–P1 |
| `DOM-GRAPH` | Relationships, knowledge graph, ontology | II, XVI | P1 |
| `DOM-LIFECYCLE` | M0–M20 milestone engine + gates | IV | P0 |
| `DOM-EDITORIAL` | Issues, severity, continuity, style, quality scores | VI | P0–P1 |
| `DOM-PRODUCTION` | Assets, formats, ISBN, metadata, preflight | VII | P1 |
| `DOM-COMMERCIAL` | Marketing, sales, pricing, rights, licensing | VII | P1–P2 |
| `DOM-AI` | Agent org chart, proposals, ADK, shared memory | VIII, XVII | P1 |
| `DOM-INTEL` | Predictive analytics, readiness scores | XI | P2 |
| `DOM-PLATFORM` | Events, search, notifications, versioning, APIs, plugins | XII | P1–P2 |
| `DOM-OPAS` | Import/export standards, interoperability | XVIII | P2 |

### 4.2 Explicitly out of scope (v1.0 platform)

| Item | Rationale |
|---|---|
| Full retail storefront / consumer reading app | Separate product; Book OS feeds metadata/packages |
| Print manufacturing plant integration beyond file export | Partner via OPAS/export later |
| Legal contract drafting as a law firm substitute | Rights module tracks metadata; not legal advice |
| Unbounded autonomous publishing without human gates | Violates `BR-008` |
| Replacing Google Sheets as the only UI forever without migration path | Sheets may remain an import/export adapter, not the SSOT |

### 4.3 Delivery phases (business phasing)

#### Phase 0 — Foundation Hardening (current → production kernel)
**Business goal:** Reliable multi-book workspace on Supabase with the modules already sketched.

Must include: auth, books, characters, chapters, editorial board, production/marketing lists, activity, basic lifecycle UI, genome *shell* with expandable attribute groups.

**Exit:** Daily usable by P-01 without data loss; CI green; RLS correct.

#### Phase 1 — Creative OS + Gated Lifecycle
**Business goal:** Authors and editors run real titles through M0–M12 with structured genomes and manuscript studio.

Must include: scenes, locations, relationships graph v1, manuscript editor + revisions, milestone exit criteria + approvals, work queue, snapshots, Continuity Guardian + Developmental Editor AI (proposal mode).

**Exit:** One title completes M8→M12 inside Book OS as system of record.

#### Phase 2 — Production, Marketing, Governed AI Workforce
**Business goal:** Title becomes shippable commercial package; AI specialists cover creative→marketing.

Must include: asset registry, metadata engine, ISBN, distribution packages, marketing campaigns, AI org chart (≥12 agents), proposal/approval audit, readiness scores.

**Exit:** One title reaches MS-M16 with package export and approval trail.

#### Phase 3 — Enterprise Portfolio + Commercial Intelligence
**Business goal:** Multi-seat orgs, rights/sales, analytics, OPAS interchange.

Must include: org roles/permissions, series/universe inheritance, rights & licensing, sales ingestion, executive analytics, OPAS import/export, plugin/API partner surface.

**Exit:** Imprint (P-02) runs ≥5 concurrent titles with role separation.

---

## 5. Business Requirements (detailed)

### 5.1 Strategic & organizational

| ID | Requirement | Priority | Phase | Success metric |
|---|---|---|---|---|
| `BR-011` | System SHALL serve as authoritative structured store for all publication project knowledge | P0 | 0 | No parallel master spreadsheet required for in-scope entities |
| `BR-012` | System SHALL support solo creators and multi-role teams without forking product | P0 | 0→3 | Same core schema; permissions scale |
| `BR-013` | System SHALL preserve institutional memory via audit trail and version history | P0 | 1 | Every consequential change attributable |
| `BR-014` | System SHALL model publishing as continuous lifecycle M0–M20, not a linear checklist only | P0 | 1 | Feedback from later milestones can update earlier entities without corruption |
| `BR-015` | System SHALL treat AI as specialized workforce with governance | P0 | 1–2 | Autonomy levels configurable per agent/org |
| `BR-016` | System SHALL enable franchise/IP reuse across books/series/universes | P1 | 3 | Inheritance model operational |
| `BR-017` | System SHALL produce commercial artifacts (metadata, marketing, packages) from shared data | P1 | 2 | Artifacts regenerate from entities |
| `BR-018` | System SHALL expose measurable health: creative, editorial, commercial, launch, AI confidence | P1 | 2 | Scores visible on Executive Dashboard |
| `BR-019` | System SHALL support OPAS-aligned interchange for partner ecosystems | P2 | 3 | Round-trip export/import of core package |
| `BR-020` | System SHALL be publication-type extensible without rewriting core identity model | P2 | 3 | New publication type via module config |

### 5.2 Customer / user value requirements

| ID | Requirement | Persona | Priority |
|---|---|---|---|
| `BR-021` | Author can manage multiple books and switch active context in <2 clicks | P-01 | P0 |
| `BR-022` | Editor can triage and resolve issues with severity, type, chapter linkage | P-03 | P0 |
| `BR-023` | Creative lead can inspect completeness of Book/Character/Story/World genomes | P-02 | P1 |
| `BR-024` | Production can track assets and preflight blockers to ship date | P-04 | P1 |
| `BR-025` | Executive can see portfolio risk and approval backlog in one command center | P-05 | P1 |
| `BR-026` | AI operator can review, approve, reject, or request changes on agent proposals | P-06 | P1 |
| `BR-027` | Team members only see/edit what their role permits | P-02 | P3 |
| `BR-028` | User can restore a project snapshot after bad AI or human edit | All | P1 |

### 5.3 Commercial & operational requirements

| ID | Requirement | Priority | Phase |
|---|---|---|---|
| `BR-029` | Track marketing campaigns and channel status per title | P1 | 2 |
| `BR-030` | Manage ISBN/ASIN and retailer metadata fields | P1 | 2 |
| `BR-031` | Capture rights, territories, license windows at record level | P2 | 3 |
| `BR-032` | Ingest or manually enter sales performance for analytics | P2 | 3 |
| `BR-033` | Support pricing hypotheses and comparable titles from M0 onward | P1 | 1 |
| `BR-034` | Generate press kit / messaging from genome + marketing entities | P2 | 2 |

### 5.4 Compliance, trust & risk

| ID | Requirement | Priority |
|---|---|---|
| `BR-035` | Full auditability of approvals, milestone advances, AI applies | P0 |
| `BR-036` | Data isolation between users/orgs (RLS / tenancy) | P0 |
| `BR-037` | Confidentiality/visibility flags on sensitive records | P1 |
| `BR-038` | Export user/org data on request (portability) | P1 |
| `BR-039` | No silent AI mutation of approved canon | P0 |
| `BR-040` | Sensitivity review workflow support (flag + human review) | P2 |

---

## 6. Publishing Lifecycle Business Rules (M0–M20)

These are **business rules**, not UI suggestions. Engineering implements gates per FRD/Tech Spec.

| Milestone | Name | Business objective | Human approval roles (default) | Business exit theme |
|---|---|---|---|---|
| `MS-M0` | Market Intelligence | Decide whether the book should exist | Publishing Director, Creative Director, Business Lead | Audience, genre, opportunity, commercial rationale documented |
| `MS-M1` | Concept Discovery | Idea → publishable concept | Creative Director | 30-second clarity; logline; care factor |
| `MS-M2` | Story Foundation | Emotional engine of story | Creative Director | Major characters have psychology + narrative role |
| `MS-M3` | Book Genome | Structured database populated | Creative Director + Editor | Required entity set complete above threshold |
| `MS-M4` | Story Architecture | How the story is told | Creative Director | Structure, turns, pacing strategy defined |
| `MS-M5` | Outline Development | Hierarchical outline exists | Editor | Outline covers acts→chapters |
| `MS-M6` | Chapter Planning | Every chapter has purpose | Editor | No filler chapters |
| `MS-M7` | Scene Planning | Smallest intentional unit planned | Editor | Every scene answers who/where/change/why/emotion/plot |
| `MS-M8` | First Draft | Manuscript drafted against structure | Author + Editor | Word goals met; draft marked complete |
| `MS-M9` | Developmental Editing | Story evaluated & revision plan | Senior Editor | Structural issues ranked; rewrite tasks filed |
| `MS-M10` | Line Editing | Expression polished | Editor | Line-edit pass complete |
| `MS-M11` | Copyediting | Technical correctness | Copyeditor | Copyedit complete |
| `MS-M12` | Proofreading | Final polish, no creative changes | Proofreader + Managing Editor | Sign-off checklist complete |
| `MS-M13` | Production | Manuscript → products | Production Lead | Print/ebook/audio/cover/metadata package ready |
| `MS-M14` | Marketing Preparation | Messaging & assets ready | Marketing Lead | Brand messaging + press kit + plans |
| `MS-M15` | Pre-Launch | Launch machinery armed | Marketing + Publisher | Pre-launch checklist green |
| `MS-M16` | Publication | Go live | Publisher | Distribution confirmed |
| `MS-M17` | Post-Launch | Learn & optimize | Marketing + Analytics | Postmortem + optimization tasks |
| `MS-M18` | Catalog Growth | Catalog leverage | Business Lead | Cross-sell / catalog actions |
| `MS-M19` | Franchise Expansion | IP expansion decisions | Publisher + Creative | Franchise options documented |
| `MS-M20` | Legacy Management | Long-term IP stewardship | Publisher | Legacy plan & archive policy |

**Business rule `BR-041`:** Milestone advance is blocked unless configured exit criteria are satisfied OR an authorized role grants an explicit waiver with reason (audited).

**Business rule `BR-042`:** Later-stage insights may update earlier entities; they must not delete audit history or approved milestone evidence.

---

## 7. AI Workforce — Business Requirements

| ID | Requirement | Priority |
|---|---|---|
| `BR-043` | Provide specialist agents (not one general chatbot) aligned to domains in Vol VIII | P1 |
| `BR-044` | All agents share the same canonical memory (Book OS DB) — no private contradictory copies | P0 |
| `BR-045` | Every agent has role, responsibilities, authority, inputs, outputs, limitations, KPIs, escalation | P1 |
| `BR-046` | Default mode is **propose → human approve → apply** for canon-affecting writes | P0 |
| `BR-047` | Autonomy levels: Observe / Suggest / Propose / Auto-apply(low-risk) — org configurable | P1 |
| `BR-048` | Executive Publisher AI orchestrates specialists; does not replace them | P2 |
| `BR-049` | AI cost, confidence, and quality must be observable | P1 |
| `BR-050` | Rejected proposals remain searchable learning artifacts | P2 |

### 7.1 Agent roster (business inventory)

| Agent ID | Name | Business value |
|---|---|---|
| `AGT-ExecutivePublisher` | Executive Publisher AI | Portfolio health, routing, risk |
| `AGT-MarketIntelligence` | Market Intelligence Agent | M0 research & opportunity |
| `AGT-ConceptArchitect` | Concept Architect | M1 concept packaging |
| `AGT-StoryArchitect` | Story Architect | Structure & beats |
| `AGT-CharacterPsychologist` | Character Psychologist | Deep character systems |
| `AGT-WorldBuilder` | World Builder | Consistent world model |
| `AGT-PlotEngineer` | Plot Engineer | Scene necessity & tension |
| `AGT-ChapterPlanner` | Chapter Planner | Chapter design |
| `AGT-SceneDirector` | Scene Director | Scene integrity |
| `AGT-DialogueCoach` | Dialogue Coach | Distinct voices |
| `AGT-DevelopmentalEditor` | Developmental Editor AI | Story diagnosis |
| `AGT-ContinuityGuardian` | Continuity Guardian | Long-term consistency |
| `AGT-CopyEditor` | Copy Editor | Technical language |
| `AGT-FactChecker` | Fact Checker | Verifiable claims |
| `AGT-ProductionCoordinator` | Production Coordinator | Package readiness |
| `AGT-MarketingStrategist` | Marketing Strategist | Positioning & campaigns |
| `AGT-MetadataSpecialist` | Metadata Specialist | Retail metadata quality |
| `AGT-RightsManager` | Rights Manager | Rights opportunity/risk |
| `AGT-SalesAnalyst` | Sales Analyst | Performance insight |
| `AGT-PortfolioManager` | Portfolio Manager | Cross-title optimization |
| `AGT-ExecutiveCopilot` | Executive Copilot | Exec Q&A / briefings |

---

## 8. Success Metrics & KPIs

### 8.1 Product KPIs

| KPI | Definition | Phase target |
|---|---|---|
| Time-to-first-book | Signup → first book created | <10 minutes |
| Genome completeness | % required genome fields filled at M3 | ≥85% to exit without waiver |
| Milestone cycle time | Median time in each milestone | Tracked; improve QoQ |
| AI proposal acceptance rate | Approved / submitted | 40–70% healthy band |
| Continuity escape rate | Issues found after M12 that existed earlier | ↓ over time |
| Snapshot restore success | Restores without data loss | 100% |
| Uptime | Production availability | ≥99.5% Phase 2+ |

### 8.2 Business health scores (exposed in product)

Per title and portfolio:

- Creative Health
- Editorial Health
- Commercial Readiness
- Metadata Quality
- Launch Readiness
- Rights Opportunity
- AI Confidence
- Portfolio Health

Definitions and formulas live in Tech Spec; business ownership is Product + Publisher.

---

## 9. Assumptions, Dependencies, Constraints

### 9.1 Assumptions

- Supabase (Postgres + Auth + Storage + RLS) remains the primary backend for Phases 0–2.
- React + TypeScript + Vite remains the canonical web client.
- LLM providers are available via server-side keys; client never holds privileged keys.
- Initial customers are English-first; i18n follows.
- Manual Volumes I–XVIII define domain completeness; engineering phases prioritize ruthlessly.

### 9.2 Dependencies

- Supabase project provisioning & env vars
- Object storage for manuscripts/assets
- LLM provider accounts + budget controls
- ISBN/metadata partner knowledge (Phase 2)
- Design system continuity with existing MANGU visual language

### 9.3 Constraints

| Constraint | Impact |
|---|---|
| Solo-user RLS exists today | Org multi-tenancy is additive migration |
| Character/chapter schemas are thin | Genome expansion requires migrations + UI progressive disclosure |
| No manuscript table yet | Phase 1 critical path |
| Cost of AI at draft scale | Caching, batching, proposal caps required |
| Must not block authors with enterprise ceremony in Phase 0–1 | Sensible defaults; advanced gates optional until org mode |

---

## 10. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Spec sprawl delays shipping | H | H | Phased BR scope; FR MoSCoW; vertical slices |
| AI writes corrupt canon | M | H | Proposal workflow + snapshots + Continuity Guardian |
| Genome UX overwhelms users (250+ fields) | H | H | Progressive disclosure, templates, AI fill-with-review |
| Org permissions retrofit is painful | M | H | Design tenancy keys now; ship solo as org-of-one |
| Manual treated as code | M | M | These specs are the contract; manual is reference |
| Performance on graph queries | M | M | Materialized views, indexed edges, pagination |

---

## 11. Cost & Value Hypothesis (business case)

**Value drivers**

1. Reduced re-entry of the same fact across tools  
2. Faster editorial cycles via structured issues + AI diagnosis  
3. Fewer continuity/production defects  
4. Higher launch quality via readiness scoring  
5. IP compounding via series/universe reuse  

**Cost drivers**

1. Engineering build of genome + manuscript + agents  
2. LLM inference  
3. Storage for assets/manuscripts  
4. Compliance/audit features for enterprise  

**Decision:** Proceed with phased build; Phase 0–1 maximize creator retention; Phase 2–3 monetize teams/imprints.

---

## 12. Acceptance of BRD

This BRD is accepted when:

1. Engineering can map every `BR-*` to FR/Tech items (see Traceability).  
2. Phase 0–3 scopes are used for roadmap planning without re-litigating mission.  
3. Milestone and AI governance rules are treated as non-negotiable product law.

---

## Appendix A — Glossary (business)

| Term | Definition |
|---|---|
| Book OS | The MANGU Book Operating System product |
| Book Genome | Structured “DNA” of a publication — attributes across creative, commercial, operational layers |
| Character Genome | Multi-domain psychological/identity system for characters |
| Story Genome | Structured narrative architecture attributes |
| World Genome | Structured setting/systems attributes |
| Milestone Engine | M0–M20 lifecycle with exit criteria and approvals |
| SSOT | Single Source of Truth |
| Proposal | AI-generated change set awaiting human decision |
| OPAS | Open Publishing Architecture Standard |
| Canon | Approved facts that agents and humans must not contradict silently |

## Appendix B — Document control

| Version | Date | Notes |
|---|---|---|
| 1.0.0 | 2026-07-19 | Initial exhaustive BRD for full platform build |
