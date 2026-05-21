# Local Playwright UI Smoke v0 Execution Report

## Summary

Added a local-only Playwright smoke test layer for Module 01 and verified it passes. The setup protects the current landing/result/contact/legal UI contracts without touching CI, provider-backed analyze flows, or product behavior.

## Files Created

- `ai-collaboration/handoffs/2026-05-21-local-playwright-ui-smoke-v0-handoff.md`
- `ai-collaboration/research/2026-05-21-local-playwright-ui-smoke-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-21-local-playwright-ui-smoke-v0-execution-report.md`
- `apps/web/playwright.config.ts`
- `apps/web/e2e/module-01-smoke.spec.ts`
- `apps/web/e2e/line-funnel.spec.ts`
- `apps/web/e2e/legal-routes.spec.ts`

## Files Updated

- `apps/web/package.json`
- `apps/web/README.md`
- `apps/web/src/components/anyu/ContactCapture.tsx`
- `docs/operations/production-deployment-runbook.md`
- `pnpm-lock.yaml`
- `ai-collaboration/summaries/summary_log.md`

## Playwright Setup

- added `@playwright/test` as an app-local dev dependency
- configured Playwright under `apps/web/playwright.config.ts`
- set Chromium-only execution
- used a fixed mobile viewport `390x844`
- configured a local production-like web server on `http://127.0.0.1:3001`
- reused the gitignored repo-local browser cache under `.playwright-browsers/`

## Tests Added

- landing/input-guidance smoke
- demo result UI contract smoke
- inline CTA reveal smoke
- LINE-first / Email fallback smoke on demo route
- legal route smoke
- landing footer legal-link smoke

## Scripts Added

- `start:test`
- `playwright:install`
- `build:e2e`
- `test:e2e:local`
- `test:e2e:ui`
- `verify:ui`

## Local-Only Policy

- Playwright is not part of `pnpm test`
- Playwright is not part of CI
- Playwright is not part of a pre-commit flow
- tests use the demo route and local server to avoid remote/provider dependency

## Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed
- `cd apps/web && corepack pnpm test:e2e:local` passed

## Known Technical Debt

- the smoke layer still avoids the live local analyze/provider path, so loading-state and runtime-provider behavior remain covered elsewhere rather than by Playwright

## Tech Debt Review

### New Technical Debt Introduced

- none

### Existing Technical Debt Observed

- real runtime analyze smoke is still not deterministic enough for local Playwright without adding a mock or provider-safe local path
- LINE CTA verification needed a tiny testability-only attribute because the current UI uses same-tab `window.location.href` rather than an anchor href

### Opportunistic Cleanup Completed

- added the minimum `data-line-add-url` attribute needed to verify the LINE target without changing UI behavior
- documented the local-only smoke command in `apps/web/README.md`
- noted the optional local Playwright smoke in the production runbook without making it mandatory

### Deferred Cleanup Candidates

- a future mock-backed runtime analyze smoke if technical work starts touching analyze UX more aggressively
- optional desktop-specific Playwright coverage if wide-layout work resumes

### Recommended Follow-up

- resume technical UX work with the new local smoke layer in place

## Deviations From Handoff

- no full-page screenshots or visual snapshots were added
- no CI integration was added
- one tiny testability-only attribute was added to the LINE primary button so the target URL can be asserted without navigating away

## Git Commit

- Commit hash: pending at report-write time
- Commit message: `test: add local module ui smoke`

## Staging Push

- Push status: pending at report-write time
- Push command: `git push origin HEAD:staging`

## Remaining Uncertainties

- whether future local runtime-analyze smoke should use a mock layer or a safe provider-backed dev path
- whether the same-tab LINE CTA should stay button-driven long term or eventually move to a more directly inspectable link primitive

## Recommended Next Step

- `Technical UX Work Resumption v0`
