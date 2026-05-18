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
- schema-validated result normalization
- DB-backed result loading when `DATABASE_URL` is configured
- fake-door unlock intent + contact capture APIs

The current Module 01 experience still defers:

- real payment
- auth
- share PNG / OG generation
- email or LINE delivery
- advanced PII detection
- retention cleanup jobs

If `DATABASE_URL` or a provider key is missing, the app should stay up and return friendly configuration errors instead of crashing.

## Environment

Copy `apps/web/.env.example` and provide the values you need locally:

- `DATABASE_URL=`
- `ANTHROPIC_API_KEY=`
- `ANTHROPIC_MODEL=`
- `OPENAI_API_KEY=`
- `OPENAI_MODEL=`
- `ORADAR_PROVIDER=anthropic`
- `NEXT_PUBLIC_APP_URL=`

Provider priority in v0 is Anthropic first. OpenAI is available as a lightweight fallback path.

Launch-readiness behavior:

- local dev without env should still lint, test, and build
- live analyze requires `DATABASE_URL` plus at least one provider key
- `/m/ambiguous-temperature/result/demo` works without env
- unconfigured runtime APIs should return friendly non-technical errors

## Launch Readiness

Before the first low-key launch review, confirm:

- Vercel project has all required env vars
- Neon project is created in `ap-southeast-1`
- Drizzle migration has been generated and applied in the target environment
- a live analyze inserts rows into `analysis_results`, `events`, and `contact_submissions`
- privacy review confirms raw text is excluded from events
- manual QA is completed for landing, runtime result, demo result, unlock fallback, and contact submit flows

## Commands

```bash
corepack pnpm install
corepack pnpm dev
corepack pnpm lint
corepack pnpm test
corepack pnpm build
corepack pnpm db:generate
corepack pnpm db:migrate
```

## Notes

- Design tokens are imported from `apps/web/src/styles/tokens.css`.
- Canonical source is `docs/design-system/tokens.css`.
- The current app foundation uses token-driven custom styles rather than a UI kit baseline.
- No required auth in v0.
- No real payment in v0.
- `/m/ambiguous-temperature/result/demo` remains available for internal UI review even after runtime integration.
