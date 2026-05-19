# Module 01 Staging Remote QA v0 Execution Report

## Summary

Executed staging remote QA against `https://staging.anyu.tw` using authenticated Vercel CLI access and Neon branch verification.

The initial staging deployment had two blockers:

- the staging Preview DB branch had no app tables
- the analyze runtime expected prompt/schema files at the repo root, which is incompatible with the Vercel `apps/web` deployment root

Applied the smallest safe fix:

- bootstrapped the Preview DB schema from the existing Drizzle migration SQL
- bundled synced app-local copies of the prompt and schema into `apps/web`

After the fix, staging analyze, result loading, unlock intent, contact submission, and event persistence all passed.

## Files Created

- `ai-collaboration/handoffs/2026-05-19-module-01-staging-remote-qa-v0-handoff.md`
- `ai-collaboration/research/2026-05-19-module-01-staging-remote-qa-report.md`
- `ai-collaboration/reports/2026-05-19-module-01-staging-remote-qa-v0-execution-report.md`
- `apps/web/src/lib/ai/assets/product_result_prompt_v0.md`
- `apps/web/src/lib/ai/assets/product_result_schema_v0.json`
- `apps/web/src/tests/repo-paths.test.ts`

## Files Updated

- `apps/web/src/lib/ai/repo-paths.ts`
- `ai-collaboration/summaries/summary_log.md`

## Staging Access Status

- direct unauthenticated shell access to `https://staging.anyu.tw` remained protected by Vercel
- authenticated access succeeded via `vercel curl`
- `vercel inspect staging.anyu.tw` confirmed the alias mapped to the `git-staging` preview deployment

## Staging Env Status

Confirmed Preview env names:

- `DATABASE_URL`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`
- `ORADAR_PROVIDER`
- `NEXT_PUBLIC_APP_URL`

Runtime-confirmed values:

- provider resolved to `anthropic`
- model resolved to `claude-sonnet-4-20250514`

## Migration Status

- local `db:migrate` using a pulled Preview env file did not receive a usable `DATABASE_URL`
- Neon `preview` branch was directly inspected and found empty
- the existing Drizzle schema SQL was applied directly to Neon `preview`
- all six runtime tables were verified after the migration step

## Remote QA Status

Passed remotely on staging:

- landing route
- demo route
- real analyze API
- DB-backed result route
- unlock intent API
- email contact API
- LINE contact API
- direct event API

## DB Verification Status

Verified on Neon `preview`:

- `analysis_requests` rows present
- `analysis_results` row present for the generated result id
- `events` rows present
- `unlock_intents` row present
- `contact_submissions` rows present
- normalized result JSON present
- score and score bucket present
- retention fields present

## Privacy Verification Status

Verified:

- no raw input text found in event metadata
- no synthetic contact values found in event metadata
- no secrets printed or committed
- only synthetic QA payloads were used

## Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

## Fixes Applied

- moved runtime prompt/schema loading to app-local synced assets inside `apps/web`
- added a regression test covering the asset-path assumption
- applied the runtime schema to the Neon `preview` branch

## Known Technical Debt

- staging remote QA in this environment still relies on authenticated `vercel curl`, not a literal interactive browser session
- local Preview secret pull is not a reliable path for running `db:migrate`
- retention cleanup remains manual / deferred

## Deviations From Handoff

- used authenticated Vercel CLI route and API checks rather than a true browser session because browser automation against the protected remote target was not available in this tool environment
- applied the staging schema directly through Neon tooling instead of local `db:migrate` because the Preview secret pull was not usable locally

## Git Commit

- Pending at report-write time; final commit hash is recorded in the final Codex Completion Summary.

## Staging Push

- Pending at report-write time; final staging push status is recorded in the final Codex Completion Summary.

## Remaining Uncertainties

- interactive mobile browser QA remains unverified
- exact Preview `DATABASE_URL` branch target was not decoded from secrets, but runtime writes were verified on the Neon `preview` branch used for staging QA

## Recommended Next Step

`Module 01 Staging Browser Manual QA Sweep v0`
