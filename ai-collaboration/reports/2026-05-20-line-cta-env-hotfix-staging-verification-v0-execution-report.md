# LINE CTA Env Hotfix + Staging Verification v0 Execution Report

## Summary

Resolved the staging LINE CTA issue by refreshing the staging deployment after `NEXT_PUBLIC_LINE_ADD_URL` had been added in Vercel Preview env. No application code hotfix was needed.

## Files Created

- `ai-collaboration/handoffs/2026-05-20-line-cta-env-hotfix-staging-verification-v0-handoff.md`
- `ai-collaboration/research/2026-05-20-line-cta-env-hotfix-staging-verification-v0.md`
- `ai-collaboration/reports/2026-05-20-line-cta-env-hotfix-staging-verification-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Env Status

- `NEXT_PUBLIC_LINE_ADD_URL` is configured in Vercel env
- env scope shown by CLI: `Preview, Production`
- the problem was not absence of env in Vercel anymore; it was absence of env in the older deployed frontend bundle

## Deployment Status

- fresh preview deployment created:
  - `https://anyu-next-l9oa57u31-studioanyu-1488s-projects.vercel.app`
- `staging.anyu.tw` now points to that deployment

## LINE CTA Verification

- protected staging demo result route returns `200`
- deployed client bundle contains:
  - `https://lin.ee/S6dnbJO`
  - LINE-first contact panel strings
  - `line_add_clicked`
- deployed client bundle uses same-tab navigation via `window.location.href`

## Email Fallback Verification

- `改用 Email 接收通知` is still present in the deployed client bundle
- fallback body text is still present
- fallback is secondary rather than default

## Fixes Applied

- no repo code changes required for CTA logic
- hotfix was env/build freshness only:
  - confirm env
  - redeploy preview
  - ensure staging alias points to the fresh deployment

## Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

## Known Technical Debt

- Protected staging still lacks a clean automated click-level verification path from this shell-only environment, so some UX checks still rely on authenticated bundle inspection rather than true browser interaction.

## Tech Debt Review

### New Technical Debt Introduced

- None.

### Existing Technical Debt Observed

- Deployment/env changes for `NEXT_PUBLIC_*` values are still operationally fragile because the app can look correct in code while a stale staging alias serves an older bundle.

### Opportunistic Cleanup Completed

- None in repo code. This pass stayed focused on env/redeploy verification.

### Deferred Cleanup Candidates

- A future deployment runbook or staging checklist should explicitly call out that public env changes require a rebuild and alias refresh verification.

### Recommended Follow-up

- Add one explicit staging QA step for public env-dependent CTAs after future frontend env changes.

## Deviations From Handoff

- No code bug was found, so no app-code patch was necessary.

## Git Commit

- Pending at report-write time; final commit hash is reported in the final Codex Completion Summary.

## Staging Push

- Pending at report-write time; final staging push status is reported in the final Codex Completion Summary.

## Remaining Uncertainties

- A true protected-browser click pass is still useful to confirm the final human interaction feel.

## Recommended Next Step

- `LINE Funnel Protected Staging Browser Pass v0`
