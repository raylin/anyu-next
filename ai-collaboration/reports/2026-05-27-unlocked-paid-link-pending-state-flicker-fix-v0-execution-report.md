# Unlocked Paid Link Pending State Flicker Fix v0 Execution Report

## Summary

Fixed the unlocked paid-link pending-state flicker by making fulfilled missing paid rows resolve to pending, adding explicit unlocked route state selection, and preventing the LIFF bridge from rendering a transient success CTA before navigation in normal mode.

## Files Created

- `ai-collaboration/handoffs/2026-05-27-unlocked-paid-link-pending-state-flicker-fix-v0-handoff.md`
- `ai-collaboration/research/2026-05-27-unlocked-paid-link-pending-state-flicker-fix-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-27-unlocked-paid-link-pending-state-flicker-fix-v0-execution-report.md`
- `apps/web/src/tests/unlock-paid-route-state.test.ts`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`
- `apps/web/src/app/m/[moduleSlug]/unlock/[unlockToken]/page.tsx`
- `apps/web/src/app/api/modules/[moduleSlug]/paid-result/status/route.ts`
- `apps/web/src/components/line/LineFulfillBridge.tsx`
- `apps/web/src/tests/paid-generation-route.test.ts`
- `apps/web/src/tests/line-fulfillment.test.ts`

## Root Cause

- The LIFF bridge briefly entered a success state before assigning the unlocked route, which could render an intermediate CTA in normal mobile flow.
- The paid-status route treated claimed fulfillment links with no paid row as generic `missing`.
- The unlocked route lacked an explicit fulfillment-aware state boundary for `claimed_missing`.

## State Selection Fix

- Added `resolveUnlockPaidRouteState(...)` with explicit states for completed, processing, requested, claimed missing, not requested, failed, and expired.
- `bound` / `delivered` fulfillment with no paid row now maps to `claimed_missing`.
- `claimed_missing` initializes `PaidResultPendingPoller` with pending status rather than a claim/idle state.

## Pending Polling Behavior

- Completed paid result: renders paid content directly.
- Processing/requested/claimed-missing: renders `正在整理你的完整分析` polling state directly.
- Failed/expired: renders safe failure state and keeps retry/refresh affordance.

## Tests Added

- Route-state tests for completed, processing, claimed-missing, and failed.
- Paid-status route test for delivered fulfillment without a paid row returning pending.
- LIFF bridge source-order regression to prevent transient success CTA render before normal navigation.

## Validation Results

- `python3 -m compileall oradar`: passed.
- `python3 -m compileall tools/topic-ingestion`: passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`: passed, 25 tests.
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed, 29 files / 177 tests.
- `cd apps/web && corepack pnpm build`: passed.
- `cd apps/web && corepack pnpm test:e2e:local`: passed, 11 tests.

## Known Technical Debt

- Production still needs a refresh/smoke after this fix is promoted.
- Durable background delivery remains deferred; this fix does not change paid-generation execution architecture.

## Tech Debt Review

### New Technical Debt Introduced

- None known.

### Existing Technical Debt Observed

- LIFF/operator smoke cannot be fully automated from CLI.
- Paid generation still relies on synchronous/serverless paths rather than a durable queue.

### Opportunistic Cleanup Completed

- Centralized unlocked route state selection into a named helper with direct unit coverage.

### Deferred Cleanup Candidates

- Add a safe runtime build marker for production smoke correlation.
- Add a browser-level regression that exercises a mocked claimed-missing unlocked link.

### Recommended Follow-up

- Deploy this fix to staging and run a focused unlocked-link operator smoke.
- If staging passes, refresh production to latest staging and rerun production LIFF/short-code operator smoke.

## Deviations From Handoff

- No production deployment was run, per the handoff constraint.
- No DB/schema change was needed.

## Git Commit

- Pending at report creation.

## Staging Push

- Pending at report creation.

## Remaining Uncertainties

- Real mobile LINE client behavior should be rechecked after staging deployment.

## Recommended Next Step

Run the latest-staging production refresh/smoke only after this commit is deployed to staging and the unlocked-link pending-state flow is verified.
