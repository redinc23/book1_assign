# MANGU Book OS

Canonical React + TypeScript + Supabase application for the MANGU Book Operating System.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`.

## Validation

```bash
npm run typecheck
npm run build
```

## Architecture

- `src/views/` — product modules
- `src/hooks/` — Supabase-backed domain access
- `src/contexts/` — authentication and active-book state
- `prototype-reference/` — the earlier standalone v0.2 kernel used as a feature and interaction reference

The React/Supabase application is the canonical implementation. The standalone prototype is retained only as a source for transplanting manuscript, graph, task-queue, snapshots, and governed-agent features.
