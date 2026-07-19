# MANGU Book OS

Canonical React + TypeScript application for the MANGU Book Operating System.

**Data store: MongoDB.** Auth and persistence run through a Hono API (`/api/*`) backed by MongoDB — Supabase is not used.

## Run locally

```bash
npm install
cp .env.example .env
# fill MONGODB_URI + AUTH_SECRET
npm run dev
```

This starts:
- API on `http://localhost:3001` (`server/dev.ts`)
- Vite on `http://localhost:5173` (proxies `/api` → API)

## Environment

| Variable | Where | Purpose |
|---|---|---|
| `MONGODB_URI` | API / Vercel | MongoDB Atlas connection string |
| `MONGODB_DB` | API / Vercel | Database name (default `mangu_book_os`) |
| `AUTH_SECRET` | API / Vercel | JWT signing secret for session cookies |
| `API_PORT` | local only | API port (default `3001`) |

## Validation

```bash
npm run typecheck
npm run build
```

## Deployment (Vercel)

1. Import `redinc23/book1_assign` into Vercel (Vite is already configured in `vercel.json`).
2. Set **Production** + **Preview** env vars: `MONGODB_URI`, `MONGODB_DB`, `AUTH_SECRET`.
3. Deploy. Serverless routes live in `api/[...path].ts`; the SPA rewrite skips `/api/*`.

## Architecture

- `src/views/` — product modules
- `src/hooks/` + `src/contexts/` — client state calling `/api`
- `server/` — Hono app, MongoDB access, JWT auth
- `api/[...path].ts` — Vercel Functions entry
- `prototype-reference/` — earlier standalone v0.2 kernel (localStorage) used as interaction reference
