# Module 01 Pre-production Staging QA v0 Execution Report

## Summary

Completed a staging-safe pre-production QA pass for Module 01. Route-level and API-level checks against `https://staging.anyu.tw` passed for health, landing, input threshold, fresh analyze, result render, unlock intent, global LIFF bridge context, pending paid-result UI, paid generation/status, unlocked route, theme carryover, hidden downstream theme switch, and privacy-safe output. No P0 or P1 issues were found.

Production was not deployed or touched.

## Files Created

- `ai-collaboration/handoffs/2026-05-25-module-01-pre-production-staging-qa-v0-handoff.md`
- `ai-collaboration/research/2026-05-25-module-01-pre-production-staging-qa-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-25-module-01-pre-production-staging-qa-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## QA Results

- Staging health: passed, HTTP 200.
- Landing route: passed, HTTP 200.
- Demo result route: passed, HTTP 200.
- Short input rejection: passed, HTTP 400 with `input_too_short`.
- Valid analyze: passed, HTTP 200, completed.
- Valid analyze duration: about 20.5 seconds.
- Runtime result route: passed, HTTP 200.
- Pending paid UI route: passed, HTTP 200 with waiting copy.
- Paid generation request: passed, completed.
- Paid status endpoint: passed, completed.
- Unlocked route: passed, HTTP 200.
- Forbidden secret marker scan: passed.

## Theme A Result

Passed by route-level checks.

- Classic theme hint was accepted by unlock intent.
- Global LIFF bridge rendered classic theme shell.
- Unlocked route rendered with classic theme shell.
- Downstream theme switch was hidden.
- Generated LIFF URL remained `https://liff.line.me/:liffId?<context>` with no path after the LIFF ID.

## Theme B Result

Passed by route-level checks.

- Riso theme hint was accepted by unlock intent.
- Global LIFF bridge rendered riso theme shell.
- Unlocked route rendered with riso theme shell.
- Downstream theme switch was hidden.
- Generated LIFF URL remained `https://liff.line.me/:liffId?<context>` with no path after the LIFF ID.

## Fulfillment Result

Route-level fulfillment checks passed.

- Unlock intent creation returned safe success for both theme variants.
- Fulfillment code and unlock token were generated but not recorded.
- LINE add URL origin resolved to `https://lin.ee`.
- LIFF URL carried context keys without appending `/line/fulfill` after the LIFF ID.
- Global bridge and unlocked route returned HTTP 200.

Real mobile LIFF and real staging/test OA short-code flows were not re-run in this task. This report relies on prior recorded manual smoke passes for those two manual-only checks.

## Content Quality Result

Passed with caveat.

- Paid content route rendered after deferred paid generation.
- Paid status endpoint returned completed.
- No visible `high` / `medium` / `low` likelihood labels were detected in route-level scans.
- Source rendering uses Chinese likelihood mapping via `formatPaidLikelihoodLabel`.
- Full nuanced wording review still requires human/browser visual review because route-level HTML can include non-visible bundled strings.

## Visual Result

Passed at route/source level.

- Latest human visual QA before this task: `Visuals look normal`.
- Demo result route contained share and paid-preview surfaces.
- Visible demo-route scan did not show visible debug/experiment wording.
- Local screenshot validation was not possible because Playwright remains blocked by the known Chromium/MachPort issue.

## Event / Privacy Result

Passed.

- QA commands printed only sanitized route shapes, booleans, status categories, and timing aggregates.
- No raw input, full result JSON, provider output, paid result JSON, LINE user IDs, ID tokens, fulfillment codes, unlock tokens, tokenized URLs, email, database URLs, provider keys, or secrets were recorded.
- Staging route scans did not surface forbidden secret markers.

## Validation Results

- `python3 -m compileall oradar`: passed.
- `python3 -m compileall tools/topic-ingestion`: passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`: passed, 25 tests.
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed, 28 files and 168 tests.
- `cd apps/web && corepack pnpm build`: passed.
- `cd apps/web && corepack pnpm test:e2e:local`: not run because this was a no-code-change QA/documentation task. The handoff requires Playwright only if code changes are made.

## Known Technical Debt

- Exact deployed commit is not exposed by the app runtime.
- Local Playwright remains blocked by the Chromium/MachPort permission issue.

## Tech Debt Review

### New Technical Debt Introduced

- None.

### Existing Technical Debt Observed

- Staging freshness has to be inferred through behavior and deployed client chunks because no commit/version marker is exposed.
- Manual real-device LIFF and OA checks cannot be fully reproduced from CLI.

### Opportunistic Cleanup Completed

- None; this was intentionally QA/documentation-only.

### Deferred Cleanup Candidates

- Add a safe app version/build marker to the health endpoint or page metadata.
- Restore local Playwright/browser execution by resolving the macOS Chromium/MachPort permission issue.

### Recommended Follow-up

- Create a production activation decision record.
- If desired, run one final human real-device LIFF and short-code confirmation immediately before production activation.

## Deviations From Handoff

- Real mobile LIFF and real staging/test OA short-code flows were not re-run in this task; prior manual smoke records were referenced instead.
- No code changes were made.
- No production deployment was performed.

## Git Commit

- Pending.

## Staging Push

- Pending.

## Remaining Uncertainties

- Exact deployed commit hash is not available from the staging runtime.
- Real mobile LIFF and short-code flows were not manually re-run during this pass.

## Recommended Next Step

Proceed to a production activation decision record. Production deployment should remain a separate explicit human-approved workflow.
