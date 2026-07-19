# MANGU Book OS

Canonical React + TypeScript application for the MANGU Book Operating System.

**Data store: MongoDB Atlas** (same ops stack as `my_publishing`). Auth + CRUD go through a Hono API (`/api/*`). Supabase is not used.

## Mongo setup (same as my_publishing)

If you already have a URI from `my_publishing` / Atlas:

```bash
npm install
npm run db:mongo:import-uri -- 'mongodb+srv://...'
```

That writes `.env.local` with **`MONGODB_DB=mangu_book_os`** (separate database on the same cluster as the storefront `mangu` DB — no collection collisions).

Or bootstrap Atlas with the same API keys:

```bash
export ATLAS_PUBLIC_KEY='...'
export ATLAS_PRIVATE_KEY='...'
# optional: VERCEL_TOKEN + VERCEL_PROJECT_ID for env sync
npm run db:mongo:up
```

Scripts (ported from `my_publishing`):

| Script | What it does |
|---|---|
| `db:atlas:bootstrap` | Org → project → M0 cluster → user → IP allowlist → `.env.local` |
| `db:mongo:ping` | Ping cluster |
| `db:mongo:indexes` | Book OS indexes |
| `db:mongo:sync-vercel` | Push `MONGODB_*` + `AUTH_SECRET` to Vercel |
| `db:mongo:up` | All of the above |
| `db:mongo:import-uri` | Paste an existing URI |

## Run locally

```bash
npm run dev
```

- API: `http://localhost:3001`
- Web: `http://localhost:5173` (proxies `/api`)

## Deploy (Vercel)

1. Import `redinc23/book1_assign`
2. `export VERCEL_PROJECT_ID=prj_... VERCEL_TOKEN=... && npm run db:mongo:sync-vercel`
3. Redeploy

## Architecture

- `src/` — Vite React client (`/api` via `src/lib/api.ts`)
- `server/` — Hono app + Mongo client (Fluid-aware singleton, same pattern as `my_publishing/lib/mongodb.ts`)
- `api/[...path].ts` — Vercel Functions entry
- `scripts/` — Atlas bootstrap / ping / indexes / Vercel sync
- `prototype-reference/` — v0.2 localStorage kernel (interaction reference only)
