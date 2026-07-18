# MANGU Book OS — Developer Handoff

This repository contains the current prototype code and supporting artifacts for MANGU Book OS.

## Start here

- `MANGU_Book_OS_v0_2_Standalone.html` — fastest way to inspect the complete current prototype. Open directly in a modern browser.
- `index.html` — modular source entry point.
- `app.js` — base application, data model, seeded state, navigation, CRUD flows, dashboards, milestones, editorial, production, marketing, and persistence.
- `v2.js` — v0.2 kernel extensions: manuscript studio, work queue, story graph, AI proposals, snapshots, search, revisions, notifications, and expanded records.
- `styles.css` and `v2.css` — complete interface styling.
- `kernel-schema.json` — implementation-oriented entity contract.
- `README.md` and `CHANGELOG.md` — run instructions and feature summary.

## Current architecture

The prototype is local-first and browser-based:

- Vanilla HTML/CSS/JavaScript
- State stored in browser localStorage
- No build step
- No backend or authentication yet
- PWA manifest and service worker included
- JSON import/export and project snapshots included

## Current product surface

- Executive Command Center
- Publications and project switching
- M0–M20 publishing lifecycle
- Book Genome records
- Characters, chapters, scenes, locations, canon, timeline, and relationships
- Manuscript Studio
- Editorial issue Kanban
- Production assets and preflight
- Marketing campaigns
- Work queue, approvals, notifications, and audit trail
- Story knowledge graph
- Governed AI proposal workflow
- Global command/search palette
- Project export/import and snapshot restore

## Suggested amalgamation strategy

Do not merge two front ends blindly. Keep one canonical domain model and selectively absorb the strongest components from the Bolt project.

Recommended comparison order:

1. Data entities and IDs
2. State and persistence model
3. Navigation and information architecture
4. Manuscript editor
5. Book/Character/Story/World Genome forms
6. Milestones and approval gates
7. AI workflows
8. Backend/auth/database capabilities
9. Reusable UI components
10. Deployment configuration

The likely production migration is:

- Supabase/PostgreSQL for canonical storage
- Supabase Auth or equivalent
- Object storage for manuscripts/assets
- Durable event and audit tables
- Row-level permissions
- Real model-backed agent actions behind proposal/approval gates
