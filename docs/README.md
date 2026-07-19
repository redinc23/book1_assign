# MANGU Book OS — Product Specification Suite

**Product:** MANGU Book Operating System (Book OS)  
**Document Set Version:** 1.0.0  
**Status:** Ready for engineering execution  
**Authority:** Derived from *MANGU Book OS System Design Manual* (Volumes I–XVIII, v1.0 · 2026) + current canonical React/Supabase codebase  
**Audience:** Product, engineering, design, AI, QA, publishing operations

---

## What this suite is

This is the single handoff package for building the full Book OS platform. It is deliberately exhaustive so developers can implement without inventing product decisions.

| Document | File | Purpose |
|---|---|---|
| **BRD** | [`01-BRD-MANGU-Book-OS.md`](./01-BRD-MANGU-Book-OS.md) | Why we build it: business goals, personas, scope, success metrics, constraints, phased ROI |
| **FRD** | [`02-FRD-MANGU-Book-OS.md`](./02-FRD-MANGU-Book-OS.md) | What the system must do: every feature, screen flow, rule, acceptance criterion, edge case |
| **Tech Spec** | [`03-TECH-SPEC-MANGU-Book-OS.md`](./03-TECH-SPEC-MANGU-Book-OS.md) | How we build it: architecture, schema, APIs, AI agents, security, events, testing, ops |
| **Traceability** | [`04-REQUIREMENTS-TRACEABILITY.md`](./04-REQUIREMENTS-TRACEABILITY.md) | BR → FR → Tech Spec → module mapping for QA and sprint planning |
| **Data Dictionary** | [`05-DATA-DICTIONARY.md`](./05-DATA-DICTIONARY.md) | Field-level canonical schema contracts for implementation |

---

## ID conventions (mandatory)

| Prefix | Meaning | Example |
|---|---|---|
| `BR-###` | Business requirement | `BR-014` |
| `FR-<DOMAIN>-###` | Functional requirement | `FR-GENOME-012` |
| `NFR-###` | Non-functional requirement | `NFR-007` |
| `AC-<ID>` | Acceptance criterion | `AC-FR-MS-003-01` |
| `ENT-<Name>` | Canonical entity | `ENT-Character` |
| `MS-M#` | Milestone | `MS-M8` |
| `AGT-<Name>` | AI agent | `AGT-ContinuityGuardian` |
| `API-<Resource>` | API surface | `API-Books` |
| `EVT-<Name>` | Domain event | `EVT-MilestoneAdvanced` |
| `TBL-<name>` | Database table | `TBL-scenes` |

---

## Current baseline (as of this repo)

Already shipping in the canonical React + TypeScript + Supabase app:

- Auth (Supabase)
- Books CRUD + active-book context
- Characters, Chapters
- Editorial Kanban tasks
- Production tasks, Marketing items
- Activity log
- Shell views: Dashboard, Library, Lifecycle, Genome, Characters, Chapters, Editorial, Production, Marketing, AI Center, Activity

**Not yet built (must be delivered per these specs):** full genome attribute model, scenes, locations, relationships/knowledge graph, manuscript studio, milestone gating with approvals, governed AI agents, work queue, snapshots/versioning, rights/sales/distribution, multi-user org roles, OPAS export, and enterprise collaboration.

---

## Recommended reading order for developers

1. BRD §1–§4 (mission, personas, scope phases)
2. FRD §1 (information architecture) + domain of your sprint
3. Tech Spec §1–§4 (architecture + data model)
4. Traceability matrix for your epic
5. Manual Volumes matching your domain (reference, not implementation contract — **these specs are the contract**)

---

## Governance

- Specs override ad-hoc UI inventions.
- Manual volumes are the philosophical source; where this suite and the manual disagree on *implementation*, follow this suite and file a spec amendment.
- Any new entity/field/agent requires an amendment with ID assignment before merge.
