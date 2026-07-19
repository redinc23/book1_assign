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
npm run lint
npm run test
npm run build
```

## Continuous integration

Every push to `main` and every pull request runs the CI workflow in
`.github/workflows/ci.yml`, which typechecks, lints, runs the test suite, and
builds the app on the Node version pinned in `.nvmrc`. The status check appears
on each PR, so a change is only mergeable once it is green.

Unit tests live next to the code they cover (`src/**/*.test.ts`) and run under
[Vitest](https://vitest.dev/). See `src/lib/progress.test.ts` for the shared
progress-percentage helper.

## Deployment (Vercel)

This repo is set up for continuous deployment to Vercel via the native Git
integration. `vercel.json` pins the framework (Vite), build command, and
output directory, and adds an SPA fallback rewrite.

One-time setup:

1. In the Vercel dashboard: **Add New → Project → Import** `redinc23/book1_assign`.
   Vercel auto-detects Vite; the settings in `vercel.json` are applied.
2. In **Project → Settings → Environment Variables**, add both variables for
   **Production** and **Preview**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

   These are required at runtime — the app throws on load if they are missing.
3. Deploy.

After that, every push to `main` ships a **production** deploy and every pull
request gets its own **preview** URL, so build progress and each change are
visible in the Vercel deployments dashboard.

## Architecture

- `src/views/` — product modules
- `src/hooks/` — Supabase-backed domain access
- `src/contexts/` — authentication and active-book state
- `prototype-reference/` — the earlier standalone v0.2 kernel used as a feature and interaction reference

The React/Supabase application is the canonical implementation. The standalone prototype is retained only as a source for transplanting manuscript, graph, task-queue, snapshots, and governed-agent features.

## Product specifications (POS build)

Engineering-ready BRD, FRD, Tech Spec, and appendices for the MANGU Publishing Operating System live in [`docs/pos/`](./docs/pos/README.md).
