# MANGU Book OS — Product Specification Suite

| Field | Value |
|---|---|
| Suite Version | 1.0.0 |
| Date | 2026-07-19 |
| Product | MANGU Book Operating System (Book OS) |
| Audience | Executives, Product, Engineering, Design, QA, AI |
| Authority | MANGU Book OS Manual v1.0 (Volumes I–XVIII) + this repo’s canonical React/Supabase app |

---

## Start here (for developers)

1. Read **[01-BRD](./01-BRD-MANGU-Book-OS.md)** §§1, 5, 8, 9, 11 — mission, philosophy, milestones, AI governance, phases.
2. Read **[02-FRD](./02-FRD-MANGU-Book-OS.md)** — implement against `FR-*` IDs; every ticket should cite one or more.
3. Read **[03-TECH-SPEC](./03-TECH-SPEC-MANGU-Book-OS.md)** — schema, ADRs, RPCs, ADK, migration, DoD.
4. Use **[04-ENGINEERING-BACKLOG](./04-ENGINEERING-BACKLOG.md)** — phased ticket slices ready to assign.
5. Keep **`prototype-reference/`** as UX/domain reference only — not the canonical runtime.

---

## Document map

| Doc | What it answers | When to open a change request |
|---|---|---|
| [BRD](./01-BRD-MANGU-Book-OS.md) | Why / who / business scope / KPIs / gates / AI authority | Scope, phases, governance, commercial claims |
| [FRD](./02-FRD-MANGU-Book-OS.md) | What the product must do (user stories + acceptance) | Behavior, UX flows, acceptance tests |
| [Tech Spec](./03-TECH-SPEC-MANGU-Book-OS.md) | How to build it (architecture, schema, APIs, AI) | Stack, schema, security, SLAs |
| [Engineering Backlog](./04-ENGINEERING-BACKLOG.md) | In what order to build | Sprint planning only (derived; not normative over FRD) |

---

## Product thesis (one paragraph)

Book OS is a **knowledge-centric publishing operating system**: Creative OS + Publishing OS + Intelligence OS. Every fact about a publication exists once in Supabase/Postgres, progresses through **M0–M20 readiness gates**, and is reused across manuscript, editorial, production, marketing, rights, sales, and a **governed multi-agent AI workforce** that recommends while humans decide.

---

## Current codebase alignment

| Area | Today | Spec target |
|---|---|---|
| App | React + Vite + Supabase Auth | Same canonical stack |
| Tenancy | `books.user_id` RLS | Org → Workspace → Book + RLS |
| Modules | 11 views | Full IA in FRD §1 (+ Studio, Graph, Rights, etc.) |
| Lifecycle | UI shell | Persisted milestones + readiness engine |
| AI | Heuristic insights | ADK agent runs + proposals |
| Schema reference | Early migrations + `legacy-schema.sql` | Migrate toward Tech Spec §4–5 |

---

## Requirement ID conventions

| Prefix | Meaning |
|---|---|
| `BO-*` | Business objective (BRD) |
| `DP-*` | Design principle (BRD) |
| `FR-*` | Functional requirement (FRD) |
| `INV-*` | Global invariant (FRD) |
| `ADR-*` | Architecture decision (Tech Spec) |
| `MOD-*` | Product module code |
| `M0`…`M20` | Lifecycle milestones |

---

## Phase summary

| Phase | Name | Outcome |
|---|---|---|
| A / P0 | Foundation | Multi-user SSOT: books, genome seed, characters, chapters, lifecycle, editorial, activity |
| B / P1 | Creative Depth | Scenes, world, canon, studio, graph, versions, queue |
| C / P2 | Publishing Ops | Assets, preflight, campaigns, rights, sales, hard gates |
| D / P3 | Intelligence OS | Full ADK, proposals, copilot, semantic search |
| E / P4 | Ecosystem | Portals, plugins, standards/OPAS, mobile approvals |

---

## Manual volume traceability

| Manual Volume | Spec coverage |
|---|---|
| I Vision & architecture | BRD §§1,5,7; Tech Spec §1 |
| II Genome & entities | BRD §12; FRD §§4–7; Tech Spec §4 |
| III Workbook/DB | Tech Spec §4–5 |
| IV Lifecycle M0–M20 | BRD §8; FRD §9 |
| V Creative engine | FRD §§5–8 |
| VI Editorial intelligence | FRD §11 |
| VII Production & commercial | FRD §§12–13 |
| VIII AI agents | BRD §9; FRD §15 |
| IX Data dictionary | FRD §25; Tech Spec §4, §22 |
| X–XV Genome specs | Progressive enrichment / JSON schemas |
| XI Analytics | FRD §19; Tech Spec sales/dashboards |
| XII Enterprise platform | BRD §10–11; Tech Spec full |
| XVI Knowledge graph | FRD §10; Tech Spec search/graph |
| XVII ADK | FRD §15; Tech Spec §10 |
| XVIII OPAS | Phase E |

---

## Sign-off

- [ ] BRD accepted by publishing leadership
- [ ] FRD accepted by product + eng leads
- [ ] Tech Spec accepted by eng lead
- [ ] Phase A backlog pulled into tracker with `FR-*` links
