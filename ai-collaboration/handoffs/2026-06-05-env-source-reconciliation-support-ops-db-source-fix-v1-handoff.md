# Env Source Reconciliation + Support Ops DB Source Fix v1 Handoff

## Date

2026-06-05

## Task

Reconcile the intended local/host staging/production env source model and fix support lookup source handling so a verified `apps/web/.env.local` `DATABASE_URL` can be used safely when `SUPPORT_OPS_DATABASE_URL` is absent.

## Context

Owner clarified the expected model:

- Local staging: `apps/web/.env.local`
- Host staging: Vercel Preview(staging)
- Local production: `apps/web/.env`
- Host production: Vercel Production

Recent support lookup attempts were blocked because `SUPPORT_OPS_DATABASE_URL` was missing and local `DATABASE_URL` was classified as wrong schema. Owner challenged that conclusion because `apps/web/.env.local` has historically been the staging DB source.

## Relevant Files

- `apps/web/scripts/lib/load-local-env.mjs`
- `apps/web/scripts/support-paid-result-lookup.mjs`
- `apps/web/scripts/qa-env-preflight.mjs`
- `apps/web/src/tests/support-paid-result-lookup.test.ts`
- `apps/web/src/tests/recovery-link-smoke-qa.test.ts`
- `ai-collaboration/reports/2026-06-04-env-source-reconciliation-support-ops-db-source-fix-v1.md`
- `ai-collaboration/summaries/summary_log.md`
- `ai-collaboration/dashboard/anyu-project-dashboard.html`

## Constraints

- Do not enable Production runtime or checkout.
- Do not run payments.
- Do not send Email or LINE messages.
- Do not modify Production env values or Vercel env values.
- Do not print DB URLs, env values, value lengths, prefixes, suffixes, hashes, checksums, tokens, raw Email, raw LINE IDs, encrypted recipients, hashes, source text, or provider payloads.
- Do not commit local env files or secrets.

## Tech Debt Policy For This Task

Small code/test fixes inside support lookup and env preflight are in scope. Do not clean broad access-link naming debt or change product runtime behavior.

## Planned Work

1. Inventory the four env sources by key presence only.
2. Inspect local env loader behavior and support lookup/preflight source policy.
3. Probe `apps/web/.env.local` `DATABASE_URL` read-only for clean access-link schema.
4. Update support lookup to prefer `SUPPORT_OPS_DATABASE_URL`, then allow `DATABASE_URL` only after schema verification.
5. Update `qa:env:preflight -- support-ops-lookup` to pass on verified `DATABASE_URL` fallback.
6. Run support lookup against a safe staging artifact.
7. Update report, summary log, and dashboard with final baseline status.
8. Run required validation, commit, and push to `origin/staging`.

## Git Commit And Staging Push Rule

Every completed handoff should end with:

1. Run required validation.
2. Confirm `git status --short`.
3. Ensure no secrets, `.env`, raw user data, or unrelated changes are staged.
4. Commit task changes with a clear message.
5. Push the completed commit to the `staging` branch:

   ```bash
   git push origin HEAD:staging
   ```

6. Include both commit hash and push status in the final Codex Completion Summary.

If push is skipped or fails, report the reason clearly and do not claim staging was updated.

## Uncertainties

- Whether `apps/web/.env.local` currently points to the clean Preview(staging) access-link schema.
- Whether an existing staging artifact id with both Email and LINE state is available without exposing private data.
