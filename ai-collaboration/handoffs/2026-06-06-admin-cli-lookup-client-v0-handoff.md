# Admin CLI Lookup Client v0 Handoff

## Date

2026-06-06

## Task

Implement the first pure Admin API client CLI for read-only paid result lookup:

- `pnpm ops lookup-result --env staging --id <resultId>`
- `pnpm ops lookup-result --env production --id <resultId>`

## Scope

Create a standalone `tools/admin-cli` package, root command wiring, tests, docs/report/summary/dashboard updates, and validation. No live API smoke unless explicitly approved. No production runtime, payment, Email, LINE, Vercel env, Neon, or DB access.

## Constraints

- CLI must not load `apps/web/.env.staging`, `.env.production`, `.env.local`, or `.env`.
- CLI must not read DB URLs, Vercel env, Neon, or web app DB/runtime helpers.
- CLI auth uses `ADMIN_API_TOKEN` from current shell/process env only.
- No `--base-url`, endpoint env, `--token`, DB URL, resend, mutation, Admin UI, or Module 02.
- Do not expose tokens, raw Email, raw LINE ID, encrypted recipient, hashes, tokenized URLs, source text, provider payloads, merchant order raw values, or provider message IDs.
- Production remains frozen/fail-closed.

## Planned Work

1. Inspect package/workspace structure and existing test conventions.
2. Add a standalone `tools/admin-cli` TypeScript CLI package.
3. Add root `pnpm ops` script without making Vercel build depend on the CLI.
4. Implement `lookup-result` with hardcoded staging/production base URLs and `x-admin-api-token` header.
5. Validate and redact Admin API responses before pretty/JSON output.
6. Add mocked CLI tests, including env/file isolation and unsafe response rejection.
7. Update docs/dashboard/summary/report.
8. Run required validation, commit, and push to `origin/staging`.

## Validation

- `pnpm install --lockfile-only` or equivalent if workspace/dependency metadata changes
- targeted CLI tests
- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm run qa:module01:local`
- `cd apps/web && corepack pnpm run qa:module01:staging`
- `cd apps/web && corepack pnpm run qa:module01:production-preflight`
- docs presence, dashboard HTML sanity, secret/private scan, `git diff --check`
