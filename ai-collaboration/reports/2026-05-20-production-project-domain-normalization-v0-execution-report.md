# Production Project + Domain Normalization v0 Execution Report

## Summary

Verified the current Vercel/domain split and documented the recommended normalization path. Recommendation is `Option A`: make `anyu-next` the production Vercel project and move `anyu.tw` / `www.anyu.tw` there only after explicit human approval. Current production launch status remains `No-Go`.

## Files Created

- `ai-collaboration/handoffs/2026-05-20-production-project-domain-normalization-v0-handoff.md`
- `ai-collaboration/research/2026-05-20-production-project-domain-normalization-v0.md`
- `ai-collaboration/reports/2026-05-20-production-project-domain-normalization-v0-execution-report.md`

## Files Updated

- `ai-collaboration/decisions/2026-05-20-production-launch-decision-draft-v0.md`
- `docs/operations/production-deployment-runbook.md`
- `ai-collaboration/summaries/summary_log.md`

## Current Project / Domain State

- `anyu-next`
  - repo-aligned project
  - Root Directory `apps/web`
  - owns `https://staging.anyu.tw`
- `anyu`
  - older production-facing project
  - Root Directory `.`
  - currently owns/serves `https://anyu.tw`
- `www.anyu.tw`
  - exists under the Vercel account/domain record
  - currently does not present a valid matching cert on direct HTTPS check
- Neon `anyu-next`
  - ready `production` branch in `aws-ap-southeast-1`

## Recommendation

- choose `Option A`
- normalize production onto `anyu-next`
- use `https://anyu.tw` as canonical
- redirect `https://www.anyu.tw` to apex

## Manual Actions Required

1. approve Option A as the normalization path
2. confirm no important dependency remains on the old `anyu` project
3. confirm/fill the missing `anyu-next` production env names
4. confirm production `DATABASE_URL` points to Neon `anyu-next` `production`
5. approve domain reassignment for `anyu.tw`
6. approve domain reassignment for `www.anyu.tw`
7. verify redirect/certificate behavior after the move

## Decision Draft Updates

- added the explicit recommendation that production normalization is required before `Go`
- recorded `anyu-next` as the recommended target project
- kept current launch status `No-Go`

## Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

## Known Technical Debt

- production launch truth still spans several docs and external platform states
- the older `anyu` Vercel project continues to create operational ambiguity

## Tech Debt Review

### New Technical Debt Introduced

- none

### Existing Technical Debt Observed

- production/domain ownership is still split across two Vercel projects
- the active production DB target is still not directly proven from the current production-facing project

### Opportunistic Cleanup Completed

- updated the launch decision and runbook so the normalization prerequisite is explicit instead of implied

### Deferred Cleanup Candidates

- once Option A is approved, collapse the cross-project ambiguity by treating `anyu-next` as the only active app project for launch operations

### Recommended Follow-up

- run a focused approval-and-execution handoff for the actual domain move and env finalization

## Deviations From Handoff

- old-project env names were retained from the immediately prior production readiness verification because direct project-id env listing was unreliable in this shell session
- no domain or env change was attempted, per handoff constraint

## Git Commit

- committed after validation

## Staging Push

- pushed to `origin/staging`

## Remaining Uncertainties

- whether any hidden external dependency still requires the old `anyu` project
- whether the active production `DATABASE_URL` already points to the intended Neon branch
- whether the human operator wants `main` or an explicitly approved production commit path at the moment of launch

## Recommended Next Step

`Production Domain Move Approval + Env Finalization v0`
