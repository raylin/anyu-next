# 暗語 ANYU Web Foundation

This is the production Next.js app foundation for `暗語 ANYU`.

Module 01 now has a runtime + persistence integration path for:

- `/m/ambiguous-temperature`
- `/m/ambiguous-temperature/result/demo`
- `/api/modules/ambiguous-temperature/analyze`
- `/api/events`
- `/api/unlock-intent`
- `/api/contact`

The current Module 01 experience supports:

- landing input + chip selection
- analyze submit flow
- elapsed-time wait-state copy with a client timeout guard
- schema-validated result normalization
- DB-backed result loading when `DATABASE_URL` is configured
- 24-hour idempotent analyze-result reuse for identical redacted input when cache hashing is configured
- fake-door unlock intent + contact capture APIs
- safe runtime timing metadata attached to `analysis_completed` events
- scheduled retention cleanup for expired `analysis_requests` and `analysis_results` via `/api/cron/retention-cleanup`

The current Module 01 experience still defers:

- real payment
- auth
- share PNG / OG generation
- email or LINE delivery
- advanced PII detection
- broader retention cleanup policy beyond the analysis tables

Public legal/trust routes now exist for:

- `/privacy`
- `/terms`
- `/disclaimer`
- `/legal`

Source legal drafts live under `docs/legal/`.
The v0 public contact email used in legal pages is `hello@anyu.tw`.
The app currently duplicates reviewed legal copy into app-local content modules for deploy-safe rendering, so future legal copy changes must sync both `docs/legal/` and `apps/web/src/content/legal.ts`.

If `DATABASE_URL` or a provider key is missing, the app should stay up and return friendly configuration errors instead of crashing.

## Environment

Copy `apps/web/.env.example` and provide the values you need locally:

- `DATABASE_URL=`
- `ANTHROPIC_API_KEY=`
- `ANTHROPIC_MODEL=`
- `ANTHROPIC_FAST_MODEL=`
- `ANTHROPIC_FALLBACK_MODEL=`
- `OPENAI_API_KEY=`
- `OPENAI_MODEL=`
- `ORADAR_PROVIDER=anthropic`
- `MODEL_STRATEGY=sonnet_default`
- `ANALYSIS_CACHE_HASH_SECRET=`
- `RETENTION_CLEANUP_SECRET=`
- `ANALYSIS_SESSION_DAILY_LIMIT=3`
- `ANALYSIS_IP_HOURLY_LIMIT=10`
- `ANALYSIS_GLOBAL_DAILY_LIMIT=200`
- `NEXT_PUBLIC_APP_URL=`
- `NEXT_PUBLIC_LINE_ADD_URL=`

Provider priority in v0 is Anthropic first. OpenAI is available as a lightweight fallback path.

Launch-readiness behavior:

- local dev without env should still lint, test, and build
- live analyze requires `DATABASE_URL` plus at least one provider key
- `/m/ambiguous-temperature/result/demo` works without env
- unconfigured runtime APIs should return friendly non-technical errors
- wait-state instrumentation must not include raw input or contact values in events
- identical redacted input only reuses a prior result when module slug, situation, prompt version, schema version, model strategy, provider, and primary model still match
- production should set `ANALYSIS_CACHE_HASH_SECRET`; local/test may fall back to a non-production dev secret
- after adding or changing `ANALYSIS_CACHE_HASH_SECRET` in Vercel, redeploy the target environment before expecting live cache hits
- scheduled retention cleanup requires `RETENTION_CLEANUP_SECRET` or `CRON_SECRET`
- analyze input is guarded by a 30-char minimum, 4,000-char hard max, lightweight relationship-content checks, prompt-injection checks, and pragmatic session/IP/global caps
- Module 01 now supports a LINE-first contact-notification UI when `NEXT_PUBLIC_LINE_ADD_URL` is configured; Email remains a secondary fallback

## Launch Readiness

Before the first low-key launch review, confirm:

- Vercel project has all required env vars
- Neon project is created in `ap-southeast-1`
- Drizzle migration has been generated and applied in the target environment
- a live analyze inserts rows into `analysis_results`, `events`, and `contact_submissions`
- privacy review confirms raw text is excluded from events
- runtime timing review confirms only aggregate latency metadata is stored in events
- manual QA is completed for landing, runtime result, demo result, unlock fallback, and contact submit flows

## Preview Deployment

Recommended preview project settings:

- Root Directory: `apps/web`
- Framework Preset: `Next.js`
- Build Command: `corepack pnpm build`
- Install Command: `corepack pnpm install --frozen-lockfile`

Preview env required for live analyze:

- `DATABASE_URL`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`
- `ANTHROPIC_FAST_MODEL` for guarded Haiku staging trials
- `ANTHROPIC_FALLBACK_MODEL` for guarded Haiku staging trials
- `ORADAR_PROVIDER=anthropic`
- `MODEL_STRATEGY`
- `ANALYSIS_CACHE_HASH_SECRET`
- `RETENTION_CLEANUP_SECRET` or `CRON_SECRET`
- `NEXT_PUBLIC_APP_URL`

Suggested manual preview commands if Vercel CLI access is available:

```bash
vercel link
vercel env add DATABASE_URL preview
vercel env add ANTHROPIC_API_KEY preview
vercel env add ANTHROPIC_MODEL preview
vercel env add ORADAR_PROVIDER preview
vercel env add NEXT_PUBLIC_APP_URL preview
vercel --cwd apps/web
```

## Commands

```bash
corepack pnpm install
corepack pnpm dev
corepack pnpm lint
corepack pnpm test
corepack pnpm test:e2e:local
corepack pnpm test:e2e:ui
corepack pnpm verify:ui
corepack pnpm build
corepack pnpm db:generate
corepack pnpm db:migrate
corepack pnpm brand:export
```

Retention cleanup dry run:

```bash
curl -H "Authorization: Bearer $RETENTION_CLEANUP_SECRET" \
  "http://localhost:3000/api/cron/retention-cleanup?dryRun=1"
```

## Local UI Smoke Tests

Run:

```bash
corepack pnpm test:e2e:local
```

These tests are local-only and are not part of CI.
They protect Module 01's landing, demo result, legal routes, inline CTA, LINE CTA, and Email fallback affordances.

If Chromium is missing locally, install it with:

```bash
corepack pnpm playwright:install
```

## Notes

- Design tokens are imported from `apps/web/src/styles/tokens.css`.
- Canonical source is `docs/design-system/tokens-v1.1.css`.
- ANYU Brand Mark v1.1 source docs live under `docs/design-system/brand/`.
- The production-safe app mark component is `apps/web/src/components/anyu/AnyuMark.tsx`.
- The app-local brand-mark animation subset is `apps/web/src/styles/anyu-mark.css`.
- The browser favicon is `apps/web/public/favicon.svg`.
- Generated brand-mark exports live under `docs/design-system/brand/exports/`.
- App icon assets are generated from `docs/design-system/brand/anyu-mark.svg`.
- Font Migration Phase 1 is complete: Latin display now uses `Instrument Serif`.
- Font Migration Phase 2 is complete: selective long-form result reading surfaces now use `Newsreader` via `--anyu-font-reading` and `.t-reading`.
- Font Migration Phase 3 is complete: short quote / whisper surfaces now use `LXGW WenKai` via `--anyu-font-kai`, `.t-kai`, `.t-kai-quote`, and `.t-quote`.
- Do not hand-edit the generated icon PNGs.
- Current design-system source-of-truth docs are:
  - `docs/design-system/anyu-design-system-v1.1.md`
  - `docs/design-system/ux-flow-v1.1.md`
- The current app foundation uses token-driven custom styles rather than a UI kit baseline.
- No required auth in v0.
- No real payment in v0.
- `/m/ambiguous-temperature/result/demo` remains available for internal UI review even after runtime integration.
