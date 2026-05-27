# Module 01 Low-key Production Activation + Smoke v0 Execution Report

## Summary

Activated the latest approved Module 01 build to production for low-key beta usage and ran a sanitized production route/API smoke. Production deployment, alias, health, landing, input threshold, free analyze, result, unlock intent, LIFF URL shape, LIFF bridge, deferred paid generation, paid status, unlocked paid content, theme carryover, and privacy checks passed.

Manual operator-owned production LIFF and production OA short-code smokes were not run from Codex and remain pending. Ads and broader traffic remain blocked.

## Files Created

- `ai-collaboration/handoffs/2026-05-25-module-01-low-key-production-activation-smoke-v0-handoff.md`
- `ai-collaboration/research/2026-05-25-module-01-low-key-production-activation-smoke-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-25-module-01-low-key-production-activation-smoke-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Production Deployment Status

- Candidate commit: `7c891c9`.
- Deployment ID: `dpl_9bsMSd6rQba3Fgbd1croUFid9AJD`.
- Deployment URL: `https://anyu-next-nhlzk5t2j-studioanyu-1488s-projects.vercel.app`.
- Production alias: `https://anyu.tw`.
- Deployment status: Ready.
- Alias status: successful.
- Production scope: low-key beta only.
- Ads/broader traffic: still blocked.

## Production Smoke Results

Passed route/API smoke:

- Health route: HTTP 200.
- Module 01 landing: HTTP 200.
- Demo result route: HTTP 200.
- Input under threshold: HTTP 400 `input_too_short`.
- Valid synthetic analyze: HTTP 200 completed.
- Analyze duration: about 21.6 seconds.
- Runtime result route: HTTP 200.
- Unlock intent: HTTP 200 for classic and riso.
- LIFF URL shape: valid production LIFF base with query context only.
- Global LIFF bridge: HTTP 200 for both theme variants.
- Unlocked route: HTTP 200 for both theme variants.
- Empty-events LINE webhook verification POST: HTTP 200.

## LIFF Result

Route/API prerequisites passed:

- Production `/line/fulfill`: HTTP 200.
- Generated LIFF URL origin: `https://liff.line.me`.
- LIFF ID matched expected production ID.
- LIFF path shape: `/:liffId`.
- No path after LIFF ID.
- Theme hints were present in query key names.

Real mobile production LIFF smoke:

- Not run from Codex because it requires an operator-owned LINE account and mobile LINE client.
- Status: pending operator verification.

## Short-code Result

Route/API prerequisites passed:

- Unlock intent generated a fulfillment code and token internally.
- LINE add URL origin resolved to `https://lin.ee`.
- Unlocked route shape passed after fulfillment context creation.

Real production OA short-code smoke:

- Not run from Codex because it requires sending the generated code to the production OA from an operator-owned LINE account.
- Status: pending operator verification.

## Paid Generation Result

Passed.

- Fresh paid-generation request: HTTP 200 completed.
- Fresh paid-generation duration: about 42.8 seconds.
- Repeat paid-generation request: HTTP 200 reused.
- Repeat paid-generation duration: about 2.1 seconds.
- Paid status endpoint: completed, retryable false, no error category.
- Unlocked paid route: HTTP 200 with paid content marker.
- Recent production event aggregate: one `paid_generation_completed` event with `source = provider`.

## Theme Result

Passed route/API checks.

- Classic theme unlock intent accepted.
- Riso theme unlock intent accepted.
- Classic bridge rendered classic theme shell.
- Riso bridge rendered riso theme shell.
- Classic unlocked route rendered classic theme shell.
- Riso unlocked route rendered riso theme shell.
- Theme switch hidden on unlocked downstream surfaces.

## Event / Privacy Result

Passed.

- Smoke output recorded only route shapes, status categories, booleans, public URL origins/shape checks, and timing aggregates.
- No raw input, redacted input text, full result JSON, paid result JSON, provider output, LINE user IDs, LINE display names, ID tokens, LINE message text, fulfillment codes, short codes, unlock tokens, tokenized URLs, emails, database URLs, provider keys, or LINE secrets were recorded.
- Production route scans did not surface forbidden secret markers.

## Validation Results

- `python3 -m compileall oradar`: passed.
- `python3 -m compileall tools/topic-ingestion`: passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`: passed, 25 tests.
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed, 28 files and 168 tests.
- `cd apps/web && corepack pnpm build`: passed.
- Playwright was not run because no code changes were made.

## Known Technical Debt

- Webhook-triggered paid generation still uses Next `after`, not a durable queue.
- Runtime does not expose exact commit/version marker.
- Real production LIFF and short-code smokes require operator-owned LINE account verification.
- Page-payload scan for English-mix wording is inconclusive without manual visual review.

## Tech Debt Review

### New Technical Debt Introduced

- None. This was production activation plus smoke/reporting only.

### Existing Technical Debt Observed

- Durable background delivery is still needed before ads or broader traffic.
- Production operator smoke cannot be fully automated from CLI.
- Provider output stability should continue to be monitored.
- Exact production build marker should be added later.

### Opportunistic Cleanup Completed

- None; no code was changed.

### Deferred Cleanup Candidates

- Add durable paid-generation worker/processor or polling job.
- Add a safe app version/build marker.
- Add an operator-safe production LINE smoke checklist that records pass/fail facts quickly.
- Add monitoring for provider vs fallback source and pending paid stuck counts.

### Recommended Follow-up

- Run real production LIFF and production OA short-code operator smokes.
- If both pass, start `Module 01 Low-key Production Monitoring v0`.

## Deviations From Handoff

- The handoff-provided synthetic input is now below the 80 visible-character minimum, so the valid analyze smoke used an extended synthetic-only version of the same scenario.
- Manual production LIFF and short-code smokes were not feasible from Codex and remain pending.
- No code changes were made, so Playwright was not required by the handoff.

## Git Commit

- Pending.

## Staging Push

- Pending.

## Remaining Uncertainties

- Whether real mobile production LIFF bind passes with the operator-owned LINE account.
- Whether real production OA short-code reply/link passes with the operator-owned LINE account.
- Whether the possible English-mix page-payload scan corresponds to visible paid content or non-visible bundled/payload text.

## Recommended Next Step

Run operator-owned production LIFF and production OA short-code smokes, then record sanitized pass/fail. If both pass, begin 24-hour low-key production monitoring.
