# Production Env Readiness Verification v0 Execution Report

## Summary

Verified the current production environment state without changing production. The result is still `No-Go`: the prepared app/project is `anyu-next`, but the live production domain `anyu.tw` currently serves a different Vercel project, `anyu`, whose env shape does not match the current Module 01 launch candidate.

## Files Created

- `ai-collaboration/handoffs/2026-05-20-production-env-readiness-verification-v0-handoff.md`
- `ai-collaboration/research/2026-05-20-production-env-readiness-verification-v0.md`
- `ai-collaboration/reports/2026-05-20-production-env-readiness-verification-v0-execution-report.md`

## Files Updated

- `ai-collaboration/decisions/2026-05-20-production-launch-decision-draft-v0.md`
- `ai-collaboration/summaries/summary_log.md`

## Verification Scope

- verified Vercel project settings for both `anyu-next` and `anyu`
- verified production env vars by name only
- verified current production domain/deployment mapping
- verified domain/DNS/HTTPS status at a high level
- verified Neon production-branch readiness where accessible
- verified Drizzle migration-path readiness without running production migration

## Key Findings

- `anyu-next` is the correctly configured app project for this repo, with `apps/web` as Root Directory.
- `anyu.tw` is currently attached to Vercel project `anyu`, not `anyu-next`.
- `anyu-next` production env is only partially configured.
- `anyu` production env is missing multiple vars required for the current Module 01 launch candidate.
- Neon project `anyu-next` has a ready `production` branch, but the active production `DATABASE_URL` target was not safely confirmed.
- `https://anyu.tw` returns `200`, but `https://www.anyu.tw` returns `521`.

## Production Env Status

- `anyu-next` production env:
  - present: `DATABASE_URL`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `ORADAR_PROVIDER`, `NEXT_PUBLIC_LINE_ADD_URL`
  - missing: `MODEL_STRATEGY`, `NEXT_PUBLIC_APP_URL`, `ANALYSIS_SESSION_DAILY_LIMIT`, `ANALYSIS_IP_HOURLY_LIMIT`, `ANALYSIS_GLOBAL_DAILY_LIMIT`
- production-facing `anyu` env:
  - present by name: `DATABASE_URL`, `ANTHROPIC_API_KEY`
  - missing for current app: `ANTHROPIC_MODEL`, `ORADAR_PROVIDER`, `MODEL_STRATEGY`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_LINE_ADD_URL`, `ANALYSIS_*`

## Vercel / Domain Status

- `anyu-next` project settings match the current repo/app
- `anyu` project settings do not match the prepared app layout
- `anyu.tw` currently resolves to the `anyu` production deployment
- `www.anyu.tw` is misconfigured and unhealthy
- nameserver/path ownership is still not normalized through the intended app project

## Neon / Database Status

- `anyu-next` Neon project:
  - region `aws-ap-southeast-1`
  - `production` branch exists and is ready
- `AnYu` Neon project:
  - archived production branch
- active production DB linkage remains unverified

## Migration Status

- production migration was not run
- migration artifacts exist locally
- `db:migrate` remains launch-ready as a separate approved step only

## Production Readiness Verdict

Current verdict: `No-Go`

The blocking issue is environment ownership drift, not missing app implementation.

## Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

## Tech Debt Review

- New technical debt introduced:
  - none
- Existing technical debt observed:
  - production launch state is split across multiple Vercel and Neon projects, creating operational ambiguity
  - the process-local abuse/IP limiter remains a known v0 limitation
- Opportunistic cleanup completed:
  - updated the production launch decision draft so it reflects the verified environment drift instead of generic pending status
- Deferred cleanup candidates:
  - normalize or retire the older `anyu` project path to reduce production ambiguity
  - consolidate launch-readiness truth into a single operational checklist later
- Recommended follow-up:
  - run a focused production project/domain/env normalization pass before any launch approval update

## Deviations From Handoff

- direct verification of the active production `DATABASE_URL` target was intentionally left incomplete because it could not be confirmed safely without exposing or mishandling secrets

## Git Commit

- committed after validation

## Remaining Uncertainties

- whether the final production host should be `anyu-next` or a reconfigured `anyu` project
- whether the active production `DATABASE_URL` already points at the intended `anyu-next` production branch
- final `www.anyu.tw` redirect policy and DNS implementation path

## Recommended Next Step

`Production Project + Domain Normalization v0`
