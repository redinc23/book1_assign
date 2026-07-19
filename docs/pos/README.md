# MANGU Publishing Operating System (POS) — Build Specification Pack

**Product:** MANGU Book OS → Publishing Operating System (POS)  
**Publisher:** Mangu Publishers  
**Spec Pack Version:** 1.0.0  
**Date:** 2026-07-19  
**Status:** Ready for engineering implementation  
**Authority:** Derived from *MANGU Book Operating System — End-to-End Publishing Architecture & System Design Manual* (Volumes I–XVIII, v1.0) and the current `book1_assign` React + Supabase codebase / v0.2 prototype kernel.

## Documents in this pack

| # | Document | Path | Audience | Purpose |
|---|----------|------|----------|---------|
| 1 | **Business Requirements Document (BRD)** | [`01-BRD-Publishing-Operating-System.md`](./01-BRD-Publishing-Operating-System.md) | Executives, product, publishers | *Why* we build POS; business outcomes, scope, personas, KPIs, phases, risks |
| 2 | **Functional Requirements Document (FRD)** | [`02-FRD-Publishing-Operating-System.md`](./02-FRD-Publishing-Operating-System.md) | Product, UX, QA, engineers | *What* the system must do; FR-IDs, acceptance criteria, workflows, edge cases |
| 3 | **Technical Specification** | [`03-TECH-SPEC-Publishing-Operating-System.md`](./03-TECH-SPEC-Publishing-Operating-System.md) | Engineering, DevOps, security | *How* to build it; architecture, schema, APIs, RLS, AI ADK, testing, rollout |
| 4 | **Genome & Entity Data Dictionary** | [`04-APPENDIX-Genome-Data-Dictionary.md`](./04-APPENDIX-Genome-Data-Dictionary.md) | Eng, data, AI | Field-level genome/entity paths & validation |
| 5 | **Milestone Checklists & Gate Matrix** | [`05-APPENDIX-Milestone-Checklists.md`](./05-APPENDIX-Milestone-Checklists.md) | Product, eng, QA | M0–M20 checklists, blocker codes, readiness |
| 6 | **RBAC & Capability Matrix** | [`06-APPENDIX-RBAC-Matrix.md`](./06-APPENDIX-RBAC-Matrix.md) | Eng, security, QA | Role×capability allow/deny matrix |
| 7 | **Engineering Epics (Dev Kickoff)** | [`07-APPENDIX-Engineering-Epics.md`](./07-APPENDIX-Engineering-Epics.md) | Eng leads, all devs | Assignable epics mapped to FR/TS |

## Reading order for developers

1. Skim **BRD §1–§4** (mission, principles, scope, personas).
2. Read **FRD** module-by-module for the epic you own; treat every `FR-*` as a testable contract.
3. Implement against **Tech Spec** (data model first, then domain modules, then agents).
4. Traceability: every FR maps to BR capability IDs (`CAP-*`) and Tech Spec components (`TS-*`).
5. Pull work from [`07-APPENDIX-Engineering-Epics.md`](./07-APPENDIX-Engineering-Epics.md) (E0→E15).

## Definition of POS

In this pack, **POS = Publishing Operating System** (not retail point-of-sale).

Per Manual Volume XVIII / Epilogue I:

- **Layer 1 — Build the Book** (Volumes I–X): genomes, lifecycle, creative/editorial/production core
- **Layer 2 — Manage the Publishing Company** (Volumes XI–XVII): intelligence, platform, knowledge graph, AI ADK
- **Layer 3 — Industry Platform** (Volume XVIII+): OPAS, digital twin, open standards

The near-term build target is a production-grade **Book OS** that is architected to grow into full **Publishing OS**.

## Current codebase baseline (as of this pack)

| Area | State |
|------|-------|
| App | Vite + React 18 + TypeScript + Tailwind |
| Backend | Supabase (Auth, Postgres, RLS) — simplified owner-scoped tables |
| Deploy | Vercel |
| Prototype reference | `prototype-reference/` v0.2 local-first kernel + `legacy-schema.sql` (fuller target schema) |
| Views today | Dashboard, Library, Lifecycle, Genome, Characters, Chapters, Editorial, Production, Marketing, AI Center, Activity |

This pack is the **contract** for elevating the baseline into the full POS described by the Manual.

## Requirement ID conventions

| Prefix | Meaning |
|--------|---------|
| `CAP-###` | Business capability (BRD) |
| `BR-NFR-###` | Business non-functional / constraint (BRD) |
| `FR-<MODULE>-###` | Functional requirement (FRD) |
| `AC-<MODULE>-###` | Acceptance criterion (FRD) |
| `UC-<MODULE>-###` | Use case (FRD) |
| `TS-<AREA>-###` | Technical component / decision (Tech Spec) |
| `API-<RESOURCE>-###` | API contract (Tech Spec) |
| `TBL-<name>` | Database table (Tech Spec) |
| `EVT-<name>` | Domain event (Tech Spec) |
| `AGT-<key>` | AI agent (FRD / Tech Spec) |
| `M0`–`M20` | Lifecycle milestones |

## Change control

Any material change to requirements requires:

1. Update to the owning document section
2. Bump pack patch/minor version in this README
3. Update the Traceability Matrix (FRD Appendix A)
4. Engineering impact note in Tech Spec §Change Log
