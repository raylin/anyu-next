# Production Redirect + DB Target Confirmation v0 Execution Report

## Summary

Completed the remaining `www` canonical redirect by shipping a narrow host-based redirect rule and redeploying `anyu-next` production. Verified `www.anyu.tw` now returns `308` to `https://anyu.tw/`. Production DB target confirmation remains unresolved because the safe production env-run probe sees `ANTHROPIC_API_KEY` but not a usable `DATABASE_URL`.

## Files Created

- `ai-collaboration/handoffs/2026-05-20-production-redirect-db-target-confirmation-v0-handoff.md`
- `ai-collaboration/research/2026-05-20-production-redirect-db-target-confirmation-v0.md`
- `ai-collaboration/reports/2026-05-20-production-redirect-db-target-confirmation-v0-execution-report.md`

## Files Updated

- `apps/web/next.config.ts`
- `ai-collaboration/decisions/2026-05-20-production-launch-decision-draft-v0.md`
- `docs/operations/production-deployment-runbook.md`
- `ai-collaboration/summaries/summary_log.md`

## Domain Redirect Status

- `https://anyu.tw`:
  - `HTTP 200`
  - serves healthy `anyu-next` production deployment
- `https://www.anyu.tw`:
  - `HTTP 308`
  - redirects to `https://anyu.tw/`
- redirect is currently enforced at the app level via host-based Next.js redirect config

## DB Target Confirmation Status

- not confirmed
- safe `vercel env run -e production` probe showed:
  - `ANTHROPIC_API_KEY` present
  - `DATABASE_URL` effectively absent/blank for the probe
- therefore:
  - branch/region/pooler target could not be confirmed
  - production DB readiness remains blocked

## Provider Key Readiness

- `ANTHROPIC_API_KEY` is present by env name
- safe env-run probe also saw it as present
- actual provider-call success still requires a later production smoke pass

## Decision Draft Updates

- recorded that `www -> apex` redirect is now complete
- recorded that `DATABASE_URL` target is still not confirmed
- recorded that provider-key presence is not equal to production smoke readiness
- kept launch status `No-Go`

## Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

## Known Technical Debt

- production DB confirmation still depends on a safer secret-verification path or manual operator check
- redirect is implemented at the app level rather than in external domain config

## Tech Debt Review

### New Technical Debt Introduced

- narrow app-level canonical redirect for `www.anyu.tw`

### Existing Technical Debt Observed

- production `DATABASE_URL` still cannot be trusted from current secret-handling visibility
- production smoke still cannot proceed safely until DB secret readiness is resolved

### Opportunistic Cleanup Completed

- finished the canonical domain policy in practice by converting `www` from a duplicate-serving host into a permanent redirect

### Deferred Cleanup Candidates

- move redirect policy to Vercel/domain config later if the team prefers infra-layer canonicalization
- establish a secret-safe operational recipe for DB target confirmation

### Recommended Follow-up

- verify or repair production `DATABASE_URL`, then run a tightly scoped production smoke gate

## Deviations From Handoff

- DB target confirmation did not succeed because the safe production env-run probe returned no usable `DATABASE_URL` value
- no production analyze smoke was run because DB readiness was not safe enough

## Git Commit

- committed after validation

## Staging Push

- pushed to `origin/staging`

## Remaining Uncertainties

- whether `DATABASE_URL` is truly blank in production or just inaccessible through the current safe probe path
- whether manual Vercel dashboard inspection will show the intended Neon `production` branch target
- whether production DB migration is still required once the secret is repaired/confirmed

## Recommended Next Step

`Production DATABASE_URL Repair + Smoke Gate v0`
