# Appendix — Engineering Epic Breakdown (Dev Kickoff)
# MANGU POS Build Spec Pack

| Field | Value |
|-------|-------|
| Document ID | `MANGU-POS-EPICS-001` |
| Version | `1.0.0` |
| Purpose | Turn BRD/FRD/Tech Spec into assignable engineering epics |

Each epic lists: goal, primary FR IDs, Tech Spec refs, deliverables, test focus, exit criteria.  
**No calendar estimates** — size is expressed as technical surface area.

---

## Epic E0 — Spec Adoption & Platform Foundations

**Goal:** Repo is ready to implement workspace-scoped POS safely.  
**FR:** FR-GLOBAL-*, FR-NFR-003/004/006, FR-AUTH-*  
**TS:** §§3–4, 15–16, 19 Phase 0  

**Deliverables**
- [ ] `docs/pos` linked from root README
- [ ] `src/domain/` scaffold with readiness stub + tests
- [ ] `events` writer utility
- [ ] organizations/workspaces/members migrations + backfill from `user_id`
- [ ] CI still green

**Exit:** Two test users cannot read each other’s workspace data.

---

## Epic E1 — Catalog & Active Book

**Goal:** Library + active book context on workspace model.  
**FR:** FR-LIB-*, FR-CMD-001/004/005  
**TS:** §5 books, §8 routes/state  

**Deliverables**
- [ ] books.workspace_id cutover
- [ ] record_code generation
- [ ] Library filters/sort
- [ ] BookContext loads workspace-scoped book
- [ ] `EVT-book.created` 

**Exit:** Create→select→see empty dependent modules with correct scope.

---

## Epic E2 — Book Genome Editor

**Goal:** Layered genome edit + completeness score.  
**FR:** FR-GENOME-001–006  
**TS:** TS-DOM-GENOME, Dict appendix  

**Deliverables**
- [ ] Sectioned Genome view bound to `books.genome`
- [ ] Completeness calculator + unit tests
- [ ] Milestone config for M1–M3 required paths

**Exit:** Completeness changes as fields fill; M3 blockers reflect gaps.

---

## Epic E3 — Characters

**Goal:** Psychology-first character CRUD.  
**FR:** FR-CHAR-001–007  
**TS:** characters table  

**Deliverables**
- [ ] Schema alignment + hooks
- [ ] Character form (core psych fields)
- [ ] Importance/role list UX
- [ ] Delete guards for POV refs

**Exit:** Protagonist required for M3 readiness.

---

## Epic E4 — Chapters & Manuscript Studio

**Goal:** Ordered chapters + durable autosave writing.  
**FR:** FR-CHAP-*, FR-MS-001/003/004  
**TS:** word count, concurrency  

**Deliverables**
- [ ] Chapter reorder transactional
- [ ] Manuscript editor autosave
- [ ] Word count rollup trigger or app txn
- [ ] Version conflict handling

**Exit:** Reload persistence UAT; word rollup correct; M8 word threshold works.

---

## Epic E5 — Milestone Engine Wiring

**Goal:** Real M0–M20 records, checklists, advance RPC.  
**FR:** FR-LIFE-001–007  
**TS:** API-LIFE-001, checklist appendix  

**Deliverables**
- [ ] Seed milestones on book create
- [ ] Lifecycle UI readiness + blockers
- [ ] `advance_milestone` RPC
- [ ] Waiver Decision path
- [ ] Unit tests all blocker codes M0–M16

**Exit:** Cannot advance past failing gates; waiver path audited.

---

## Epic E6 — Editorial Intelligence

**Goal:** Issue system replaces thin tasks.  
**FR:** FR-EDIT-001–005/010  
**TS:** editorial_issues  

**Deliverables**
- [ ] Migration from editorial_tasks
- [ ] Kanban/list + filters
- [ ] Severity blocking integration with readiness
- [ ] Resolve/verify workflow

**Exit:** Critical issue blocks M13 advance.

---

## Epic E7 — Command Center + Activity

**Goal:** Exec metrics + event feed.  
**FR:** FR-CMD-001–003, FR-WORK-001, FR-DEC-001  
**TS:** events, SQL views  

**Deliverables**
- [ ] Dashboard metrics from DB
- [ ] Activity feed
- [ ] Decisions CRUD MVP

**Exit:** Weekly standup runnable from Dashboard + Activity.

---

## Epic E8 — Export / Snapshot

**Goal:** Portability & safety.  
**FR:** FR-VER-001–004  
**TS:** API-EXPORT/IMPORT/SNAP  

**Deliverables**
- [ ] JSON export package v1
- [ ] Snapshot create
- [ ] Import with ID remap + report

**Exit:** Export→import round trip on fixture book.

---

## Epic E9 — Scenes, Locations, Graph, Canon

**Goal:** Continuity substrate.  
**FR:** FR-SCENE-*, FR-WORLD-001–004, FR-GRAPH-001–002/004, FR-CANON-001–005  
**TS:** legacy-schema continuity tables  

**Deliverables**
- [ ] CRUD UIs (can be dense/table-first)
- [ ] Scene↔character participation
- [ ] Canon search
- [ ] Integrity guards

**Exit:** M7 scene gate enforceable; canon searchable.

---

## Epic E10 — Production Assets & Metadata Gates

**Goal:** Commercialization readiness.  
**FR:** FR-PROD-*, FR-META-001–003  
**TS:** storage buckets, preflight  

**Deliverables**
- [ ] Asset upload to `mangu-assets`
- [ ] Approval workflow
- [ ] ISBN + metadata completeness
- [ ] Products table
- [ ] M13–M15 gate binding

**Exit:** Unapproved cover blocks M13.

---

## Epic E11 — Marketing Object Model

**Goal:** Campaigns + brief generation.  
**FR:** FR-MKT-*  
**TS:** campaigns  

**Deliverables**
- [ ] Campaigns CRUD
- [ ] Brief generator from genome
- [ ] M14 campaign gate

**Exit:** Brief generated without re-entering logline/audience.

---

## Epic E12 — Search & Router Hardening

**Goal:** App IA productionization.  
**FR:** FR-SEARCH-*, FR-UX-*  
**TS:** §8 routing  

**Deliverables**
- [ ] react-router routes
- [ ] Command palette
- [ ] Unsaved changes guard

**Exit:** Deep links work for chapter writer & editorial issue.

---

## Epic E13 — Governed AI ADK MVP

**Goal:** One real agent path end-to-end.  
**FR:** FR-AI-001–007  
**TS:** §10  

**Deliverables**
- [ ] agent_runs + agent_proposals tables
- [ ] Edge function run + approve
- [ ] Ship `AGT-character-psychologist` + `AGT-continuity-guardian` (report/proposal)
- [ ] AI Center pending proposals UX
- [ ] Eval fixtures skeleton

**Exit:** UC-AI-001 passes; no direct canon write.

---

## Epic E14 — Rights, Pricing, Sales Ingest

**Goal:** Commercial ops data.  
**FR:** FR-PRICE-001, FR-SALES-001–002, FR-RIGHTS-001–003  
**TS:** commercial tables  

**Deliverables**
- [ ] CRUD + CSV ingest
- [ ] Simple sales dashboard
- [ ] Expiration notifications

**Exit:** M15 price gate works; CSV import idempotent enough for UAT.

---

## Epic E15 — Automations & Intelligence Snapshots

**Goal:** OS automation + trends.  
**FR:** FR-AUTO-*, FR-INTEL-001–002  
**TS:** automations, snapshots  

**Exit:** Critical issue notifies publisher role automatically.

---

## Suggested assignment lanes

| Lane | Epics |
|------|-------|
| Platform/DB | E0, E1, E5, E8 |
| Creative UX | E2, E3, E4, E9 |
| Ops UX | E6, E7, E10, E11 |
| App shell | E12 |
| AI/Commercial | E13, E14, E15 |

---

## Definition of Done (every epic)

1. FR acceptance criteria automated or scripted UAT checklist attached  
2. Events emitted for mutative paths  
3. RLS tests updated if new tables  
4. Types updated  
5. Docs pack appendix touched if field/gate/capability changed  
6. CI green  

---

## Document Control

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-07-19 | Initial engineering epic breakdown |
