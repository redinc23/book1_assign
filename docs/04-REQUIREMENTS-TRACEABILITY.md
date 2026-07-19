# MANGU Book OS — Requirements Traceability Matrix

| Field | Value |
|---|---|
| Document ID | `TRC-BOOKOS-001` |
| Version | `1.0.0` |
| Related | BRD-BOOKOS-001, FRD-BOOKOS-001, TECH-BOOKOS-001 |

Use this matrix for sprint planning and QA coverage. Update when IDs are added.

---

## 1. Business → Functional → Technical

| BR | FR (primary) | Tech anchors | Phase | Module |
|---|---|---|---|---|
| BR-001 Vision SSOT | FR-UNI-*, FR-LIB-001 | §3 layers, §5 data | 0–1 | Platform |
| BR-003 SSOT principle | FR-IO-001, FR-META-001 | §12 export derived | 1–2 | Platform |
| BR-005 Universal header | FR-UNI-001/002 | §5.1 shared columns | 1 | Platform |
| BR-006 Milestone lifecycle | FR-MS-001…009 | §5.3.4, §6 gates | 1 | Lifecycle |
| BR-007 AI as employee | FR-AI-001…011 | §10 agents | 1–2 | AI |
| BR-008 Human governance | FR-APPR-001/002, FR-AI-005/006 | §3.4 apply path, RPCs | 1 | Approvals |
| BR-011 Authoritative store | FR-LIB-001, FR-GENOME-001 | §5 tables | 0 | Library |
| BR-012 Solo + teams | FR-ORG-001…004, FR-AUTH-* | §4 tenancy | 0→3 | Auth/Org |
| BR-013 Institutional memory | FR-ACT-001/002, FR-MSCRIPT-002, FR-SNAP-001 | audit + revisions + snapshots | 1 | Audit |
| BR-014 Continuous lifecycle | FR-MS-008 | gate evidence retention | 1 | Lifecycle |
| BR-016 IP reuse | FR-INH-001/002, FR-LIB-005/006 | inheritance service | 3 | Franchise |
| BR-017 Commercial artifacts | FR-META-001, FR-DIST-001, FR-MKT-002 | §11–12 | 2 | Production/Mkt |
| BR-018 Health scores | FR-AN-001, FR-DASH-002 | §6.4 scoring | 2 | Analytics |
| BR-019 OPAS | FR-IO-002 | §12.2 | 3 | Interop |
| BR-021 Active book UX | FR-IA-003, FR-LIB-001 | BookContext + router | 0–1 | Shell |
| BR-022 Editorial triage | FR-ED-001…003 | editorial tables | 0–1 | Editorial |
| BR-023 Genome completeness | FR-GENOME-003, FR-CHAR-002/005 | attributes + scoring | 1 | Genome |
| BR-024 Production preflight | FR-PROD-002/003 | assets + preflight RPC | 2 | Production |
| BR-025 Executive visibility | FR-DASH-001/002 | scores on books | 0–2 | Dashboard |
| BR-026 AI proposal review | FR-APPR-001, FR-AI-004/005 | proposals RPCs | 1 | AI |
| BR-027 Permissions | FR-ORG-003 | RLS + role RPCs | 3 | Org |
| BR-028 Snapshots | FR-SNAP-001/002 | snapshots table/RPCs | 1 | Platform |
| BR-029 Marketing | FR-MKT-001…003 | marketing/campaigns | 0–2 | Marketing |
| BR-030 ISBN/metadata | FR-PROD-005, FR-META-001 | books identifiers | 2 | Metadata |
| BR-031 Rights | FR-RIGHTS-001 | rights_records | 3 | Rights |
| BR-032 Sales | FR-SALES-001/002 | sales_records | 3 | Sales |
| BR-035 Auditability | FR-ACT-001, FR-MS-004 | audit_events | 0–1 | Audit |
| BR-036 Isolation | FR-AUTH-002, NFR-003 | §4 RLS | 0 | Security |
| BR-039 No silent AI canon | FR-AI-005/006, FR-AI-AGT-010 | proposal default | 1 | AI |
| BR-041 Milestone gates | FR-MS-003/004/005 | advance_milestone RPC | 1 | Lifecycle |
| BR-042 Non-linear enrichment | FR-MS-008 | evidence model | 1 | Lifecycle |
| BR-043 Specialist agents | FR-AI-011 | agent catalog §21 | 1–2 | AI |
| BR-044 Shared memory | FR-AI-007 | context packs | 1 | AI |
| BR-046 Propose/approve/apply | FR-AI-004/005 | apply_proposal | 1 | AI |
| BR-047 Autonomy levels | FR-AI-006 | agent_defs + org settings | 1 | AI |

---

## 2. Milestone → FR → Tech

| Milestone | Key FR | Tech |
|---|---|---|
| M0 | FR-MS-006, FR-AI-AGT-001 | artifacts + market agent |
| M1 | FR-LIB-003, FR-AI-AGT-002 | book logline/premise fields |
| M2 | FR-CHAR-002/005 | psych required paths |
| M3 | FR-GENOME-003, FR-REL-001 | completeness + relationships |
| M4–M5 | FR-OUT-001, FR-AI-AGT-003 | outline + story architect |
| M6 | FR-CH-002 | chapter purpose gate |
| M7 | FR-SC-001/002 | scene checklist gate |
| M8 | FR-MSCRIPT-001/004 | manuscript + word aggregates |
| M9–M12 | FR-ED-*, FR-AI-AGT-010…012 | editorial + agents |
| M13–M16 | FR-PROD-*, FR-META-*, FR-MKT-* | production/marketing |
| M17–M20 | FR-AN-*, FR-FRAN-001, FR-RIGHTS-* | analytics/franchise/rights |

---

## 3. Current codebase coverage (gap list)

| Area | Now | Spec target | Gap severity |
|---|---|---|---|
| Auth | Yes | Org roles | Med (Phase 3) |
| Books | Thin | Full identity/creative/commercial | High |
| Characters | Thin | 12-domain genome | High |
| Chapters | Thin | Planning fields | High |
| Scenes | No | Full | Critical Phase 1 |
| Manuscript | No | Studio + revisions | Critical Phase 1 |
| Relationships/Graph | No | Full | Critical Phase 1 |
| Milestone gates | UI only | Hard gates + RPC | Critical Phase 1 |
| AI | Shell | Jobs/proposals/agents | Critical Phase 1 |
| Approvals | No | Inbox | Critical Phase 1 |
| Snapshots | No | Create/restore | High Phase 1 |
| Assets/Metadata | No | Registry + export | High Phase 2 |
| Rights/Sales | No | Records + dashboards | Med Phase 3 |

---

## 4. QA test ID suggestions

| Test ID | Covers |
|---|---|
| `QA-RLS-001` | NFR-003 / BR-036 |
| `QA-GATE-M7-001` | FR-MS-003 + FR-SC-002 |
| `QA-MSCRIPT-001` | FR-MSCRIPT-001 / NFR-002 |
| `QA-PROP-001` | FR-AI-005 version conflict |
| `QA-SNAP-001` | FR-SNAP-001 / NFR-007 |
| `QA-APPR-001` | FR-APPR-001 reject path |
| `QA-ED-CRIT-001` | FR-ED-003 blocks M12 |

---

## 5. Document control

| Version | Date | Notes |
|---|---|---|
| 1.0.0 | 2026-07-19 | Initial traceability matrix |
