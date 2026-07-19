# MANGU Book OS — Product Documentation

Developer-ready specification pack for the full **Publishing Operating System (POS)** build.

| Document | ID | Purpose |
|---|---|---|
| [01-BRD-MANGU-Book-OS.md](./01-BRD-MANGU-Book-OS.md) | MANGU-BRD-001 | Business requirements, stakeholders, KPIs, phased roadmap |
| [02-FRD-MANGU-Book-OS.md](./02-FRD-MANGU-Book-OS.md) | MANGU-FRD-001 | Functional requirements, M0–M20 specs, user stories, acceptance criteria |
| [03-TECH-SPEC-MANGU-Book-OS.md](./03-TECH-SPEC-MANGU-Book-OS.md) | MANGU-TECH-001 | Architecture, schema, security, APIs, migration, engineering backlog |

## Source Authority

- MANGU Book OS Manual v1.0 (Volumes I–XVIII)
- `prototype-reference/` — v0.2 prototype kernel
- `prototype-reference/legacy-schema.sql` — target PostgreSQL schema
- Canonical app: `src/` (React + Supabase)

## Read Order

1. **BRD** — why we build, scope, phases
2. **FRD** — what each module must do
3. **Tech Spec** — how to implement, gap analysis, tickets

## Current Baseline

The React app implements ~15% of target scope (auth, simplified books/characters/chapters, partial views). Phase 1 begins workspace tenancy + full schema migration per Tech Spec §4.5.
