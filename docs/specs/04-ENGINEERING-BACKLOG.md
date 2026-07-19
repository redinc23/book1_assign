# Engineering Backlog — MANGU Book OS

| Field | Value |
|---|---|
| Document ID | MANGU-BL-001 |
| Version | 1.0.0 |
| Date | 2026-07-19 |
| Status | Planning aid (derived from BRD/FRD/Tech Spec) |
| Rule | If backlog conflicts with FRD/Tech Spec, **FRD/Tech Spec win** |

---

## How to use

1. Create tickets with title format: `[P0][FR-BOOK-001] Create book with milestone seed`
2. Each ticket must list **FR IDs**, **Tech Spec sections**, and **acceptance criteria** copied from the FRD.
3. Do not start Phase B schema work until Phase A migration M1 path is agreed.
4. Prototype features are ported intentionally — never by copying the entire HTML kernel into `src/`.

---

## Epic map

| Epic | Phase | Goal |
|---|---|---|
| E0 Spec Hygiene | — | Keep docs/CI/README linked (this suite) |
| E1 Tenancy & Auth | A | Org/workspace membership + RLS direction |
| E2 Library & Book SSOT | A | Robust books + genome seed fields |
| E3 Characters & Chapters | A | Harden CRUD + codes + events |
| E4 Lifecycle Engine | A | M0–M20 persisted + readiness |
| E5 Editorial Board | A | Issues workflow replacing/elevating tasks |
| E6 Activity/Audit | A | Immutable event stream |
| E7 Scenes & World | B | Scene atomic unit + locations |
| E8 Canon/Timeline/Relationships | B | Continuity substrate |
| E9 Manuscript Studio | B | Writing surface + autosave |
| E10 Graph / Search / Queue | B | Navigation & ops |
| E11 Production Assets | C | Storage + preflight |
| E12 Marketing/Rights/Sales | C | Commercial ops |
| E13 ADK & Agents | D | Governed AI workforce |
| E14 Portals & Ecosystem | E | External surfaces |

---

## Phase A / P0 — Foundation tickets

### E1 — Tenancy & Auth

| Ticket | FR IDs | Summary | Tech notes |
|---|---|---|---|
| A-101 | FR-AUTH-001, FR-AUTH-002 | Verify auth flows + protected shell | Existing `AuthContext` |
| A-102 | FR-ORG-001 | Bootstrap org+workspace on first login | RPC `bootstrap_org_workspace` |
| A-103 | FR-ORG-003, FR-RBAC-001 | Membership table + role on invite (min: owner self) | `workspace_members` |
| A-104 | — | Migration M1: add workspace_id to books, backfill | Tech Spec §5 M1 |
| A-105 | INV-05 | Dual-policy period tests (user vs workspace) | RLS test suite |

### E2 — Library & Genome

| Ticket | FR IDs | Summary | Tech notes |
|---|---|---|---|
| A-201 | FR-BOOK-001 | `create_book_with_milestones` RPC | Seed M0–M20 |
| A-202 | FR-BOOK-002, FR-BOOK-004 | Library list/filter/archive | Extend `Library.tsx` |
| A-203 | FR-BOOK-003, FR-GEN-001, FR-GEN-002 | Genome editor sections + commercial fields | `genome` JSONB + columns |
| A-204 | FR-BOOK-005 | Unify progress computation | Extend `progress.ts` tests |
| A-205 | FR-NAV-002 | Active book switcher persistence | `BookContext` |

### E3 — Characters & Chapters

| Ticket | FR IDs | Summary | Tech notes |
|---|---|---|---|
| A-301 | FR-CHAR-001 | Character CRUD + record_code + archive | Align to target columns |
| A-302 | FR-CHAP-001 | Chapter CRUD + sequence reorder RPC | Transactional reorder |
| A-303 | FR-AUD-001 | Emit events on create/update/archive | `events` or bridge `activity_log` |

### E4 — Lifecycle Engine

| Ticket | FR IDs | Summary | Tech notes |
|---|---|---|---|
| A-401 | FR-LIFE-001 | Persist milestones UI wired to DB | Replace purely local checklist if any |
| A-402 | FR-LIFE-002 | Checklist toggle + completed_by/at | `milestone_items` |
| A-403 | FR-LIFE-004 | Readiness algorithm + unit tests | Tech Spec §8 |
| A-404 | FR-LIFE-003 | Advance/reopen + soft gate warnings | RPC `advance_milestone` |
| A-405 | FR-LIFE-M0 … FR-LIFE-M20 | Seed checklist copy from BRD deliverables | Template JSON |
| A-406 | FR-EDIT-003 | Wire critical-issue blocker stub (even if hard gates later) | Query open critical |

### E5 — Editorial

| Ticket | FR IDs | Summary | Tech notes |
|---|---|---|---|
| A-501 | FR-EDIT-001, FR-EDIT-002 | Issues board (kanban or enhanced table) | Prefer `editorial_issues` model |
| A-502 | — | Data migrate `editorial_tasks` → issues | Expand/contract |
| A-503 | FR-EDIT-001 | Severity/category filters + assignee | |

### E6 — Production/Marketing/Activity (elevate existing)

| Ticket | FR IDs | Summary | Tech notes |
|---|---|---|---|
| A-601 | FR-PROD-001 | Production tasks polish + overdue | Existing table |
| A-602 | FR-MKT-001 | Marketing items polish | Existing table |
| A-603 | FR-DASH-001 | Command center metrics from real aggregates | `Dashboard.tsx` |
| A-604 | FR-AI-001 | Label heuristic AI insights as non-model | Avoid false trust |
| A-605 | FR-UX-001, FR-UX-003 | Empty/error states pass on all P0 views | |

**Phase A exit checklist:** multi-user book + genome + characters + chapters + lifecycle readiness + editorial issues + activity; CI green; no prototype runtime dependency.

---

## Phase B / P1 — Creative depth tickets

| Ticket | FR IDs | Summary |
|---|---|---|
| B-101 | FR-SCENE-001…003 | Scenes CRUD, participants, move |
| B-102 | FR-LOC-001 | Locations + parent hierarchy validation |
| B-103 | FR-REL-001 | Typed relationships |
| B-104 | FR-TIME-001 | Timeline events |
| B-105 | FR-CANON-001, FR-CANON-002 | Canon + integrity report v1 |
| B-106 | FR-STU-001…003 | Manuscript Studio + autosave + conflict modal |
| B-107 | FR-GRAPH-001 | Knowledge graph viewer |
| B-108 | FR-NAV-003, FR-SEARCH-001 | Command palette + keyword search RPC |
| B-109 | FR-QUEUE-001, FR-APPR-001, FR-NOTIF-001 | Work queue + approvals + notifications |
| B-110 | FR-VER-001, FR-VER-002 | Entity versions + book package import/export |
| B-111 | FR-CHAR-002, FR-CHAR-003 | Psychology layers + voice profile |
| B-112 | FR-CHAP-002, FR-SCENE-002 | Planning completeness + necessity report |
| B-113 | ADR-007 | Introduce React Router deep links |

**Phase B exit:** continuity-aware drafting; integrity score; studio autosave durable.

---

## Phase C / P2 — Publishing operations tickets

| Ticket | FR IDs | Summary |
|---|---|---|
| C-101 | FR-PROD-002…004 | Asset registry, preflight, ISBN/metadata package |
| C-102 | FR-MKT-002 | Campaigns + KPIs |
| C-103 | FR-RIGHTS-001 | Rights agreements + expiry cron |
| C-104 | FR-SALES-001 | Sales CSV import + dashboard |
| C-105 | FR-LIFE-003 | Hard gates M12/M15/M16 enforced |
| C-106 | FR-EXP-001 | Packet generation (Character Bible, Marketing Brief) |
| C-107 | FR-AUTH-003 | MFA org policy |
| C-108 | FR-DASH-002, FR-DASH-003 | Portfolio + creative health dashboards |

**Phase C exit:** launch package assemblable and authorizable inside Book OS.

---

## Phase D / P3 — Intelligence OS tickets

| Ticket | FR IDs | Summary |
|---|---|---|
| D-101 | FR-AI-002, FR-AI-003 | Agent catalog + `ai-runner` Edge Function |
| D-102 | FR-AI-004, FR-AI-006 | Proposal workflow + server-side governance |
| D-103 | FR-AI-AGENT-CONTINUITY_GUARDIAN | First production agent + evals |
| D-104 | FR-AI-AGENT-CONCEPT_ARCHITECT | Concept pack playbook |
| D-105 | FR-AI-AGENT-DEVELOPMENTAL_EDITOR | Dev edit diagnosis agent |
| D-106 | FR-AI-AGENT-METADATA_SPECIALIST | Metadata draft proposals (L3) |
| D-107 | FR-AI-AGENT-EXECUTIVE_COPILOT | Daily briefing |
| D-108 | FR-AI-005 | Multi-agent playbooks |
| D-109 | FR-SEARCH-001 (semantic) | pgvector embeddings pipeline |
| D-110 | FR-AUTO-001 | Automations engine |

Remaining agents from FRD §15 follow the same ticket pattern: registry + tools + schemas + evals + UI entry.

**Phase D exit:** AI is a measurable governed workforce; zero unauthorized SSOT mutations.

---

## Phase E / P4 — Ecosystem tickets

| Ticket | FR IDs | Summary |
|---|---|---|
| E-201 | FR-PORT-001 | Beta reader portal |
| E-202 | FR-PORT-002 | Partner portals |
| E-203 | — | Plugin/extension host design |
| E-204 | — | OPAS/ONIX adapters |
| E-205 | — | Mobile-optimized approvals |

---

## Cross-cutting tickets (all phases)

| Ticket | IDs | Summary |
|---|---|---|
| X-01 | INV-03, FR-AUD-002 | Audit completeness sweep |
| X-02 | Tech Spec §14 | RLS integration test harness in CI |
| X-03 | FR-UX-002 | Accessibility pass per phase |
| X-04 | Tech Spec §12 | Performance budgets check on Studio/list pages |
| X-05 | ADR-001 | Prototype port checklist (studio, graph, queue, snapshots) |

---

## Suggested first 10 tickets to open tomorrow

1. `A-104` Migration M1 workspace backfill  
2. `A-102` Bootstrap org/workspace  
3. `A-201` create_book_with_milestones  
4. `A-401` Lifecycle DB wiring  
5. `A-403` Readiness unit tests  
6. `A-301` Character target columns  
7. `A-302` Chapter reorder RPC  
8. `A-501` Editorial issues board  
9. `A-603` Dashboard real aggregates  
10. `A-604` Honest AI Center labeling  

---

## Estimation guidance (relative)

Use story points / t-shirt sizes internally; do **not** publish calendar-day estimates in commits. Complexity signals:

- **S:** UI polish on existing table/hook  
- **M:** New table + CRUD view + RLS  
- **L:** RPC + state machine + migrations + tests (lifecycle, studio autosave)  
- **XL:** ADK runner + proposals + eval harness  

---

*End of Engineering Backlog v1.0.0*
