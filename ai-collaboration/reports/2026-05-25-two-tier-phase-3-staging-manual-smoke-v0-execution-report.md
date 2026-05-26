# Two-tier Phase 3 Staging Manual Smoke v0 Execution Report

## Summary

Verified staging deployment freshness and reran shell-safe staging paid-generation smoke after Phase 3. Follow-up manual operator verification confirmed both real mobile staging LIFF and real staging/test OA short-code flows pass.

Production was not deployed or touched.

## Files Created

- `ai-collaboration/handoffs/2026-05-25-two-tier-phase-3-staging-manual-smoke-v0-handoff.md`
- `ai-collaboration/research/2026-05-25-two-tier-phase-3-staging-manual-smoke-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-25-two-tier-phase-3-staging-manual-smoke-v0-execution-report.md`

## Files Updated

- `ai-collaboration/research/line/line-oa-staging-setup.md`
- `ai-collaboration/summaries/summary_log.md`

## Manual Smoke Results

Original shell run could not complete real LINE smoke because it required operator interaction.

Follow-up status:

- Real mobile staging LIFF smoke: passed after the LIFF URL path duplication fix.
- Real staging/test OA short-code smoke: passed.

## LIFF Result

Status: passed in real mobile staging LIFF smoke.

Sanitized fields:

- LIFF bind smoke: passed
- generic 404 after opening LIFF: not observed after fix
- homepage fallback/drop: not observed after fix
- post-bind route: reached correct unlocked route
- paid generation completed through real LIFF: yes
- unlocked paid content visible through real LIFF: yes
- processing/failure state seen: no
- production touched: no

## Short-code Result

Status: passed in real staging/test OA short-code smoke.

Sanitized fields:

- short-code smoke: passed
- fulfillment short code pasted into staging/test OA: yes
- bot reply received: yes
- returned link opened: yes
- post-link route: reached correct unlocked route
- paid content completed/rendered: yes
- processing/failure state seen: no
- production touched: no

## Paid Generation Result

Shell-safe staging synthetic paid-generation flow passed:

- analyze: HTTP 200, about 23.3s
- unlock intent: HTTP 200
- deferred paid request: HTTP 200 completed, about 44.8s
- repeat paid request: HTTP 200 reused, about 1.2s
- unlocked route: HTTP 200 with completed paid marker
- DB/event verification: provider source, no fallback, retention set

This verifies the service path after Phase 3, but it does not replace manual LINE smoke.

## Event / Privacy Status

No raw input, fulfillment code, unlock token, tokenized URL, LINE user ID, LINE display name, LINE message text, paid result JSON, provider output, email, or secrets were recorded.

## Next-after Risk Assessment

Current decision: both real staging LIFF and short-code smoke now pass, so Next `after` is acceptable for low-volume beta from this staging evidence. Production activation remains a separate manual decision.

Recommendation:

- Keep Next `after` as staging / low-volume beta MVP only.
- Do not treat this documentation update as production approval.
- If manual smoke gets stuck processing, add durable background delivery or polling before production.

## Validation Results

Passed:

- `python3 -m compileall oradar`
- `python3 -m compileall tools/topic-ingestion`
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`
- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`

## Known Technical Debt

Real mobile LIFF smoke and real short-code test-OA smoke now pass. The current webhook trigger uses Next `after`, not a durable queue.

## Tech Debt Review

### New Technical Debt Introduced

None. This was documentation and smoke verification only.

### Existing Technical Debt Observed

- Next `after` is not durable background delivery.
- Next `after` is not durable background delivery.

### Opportunistic Cleanup Completed

- None.

### Deferred Cleanup Candidates

- Add durable background delivery or polling if manual smoke shows stuck processing.
- Add a formal operator checklist for LINE smoke runs.

### Recommended Follow-up

Proceed to a separate production activation decision if desired; do not merge this documentation update with production deployment approval.

## Deviations From Handoff

- Original shell run could not complete real LIFF or short-code smoke because no LINE client/operator facts were available. This report was updated after the operator provided sanitized pass facts for both manual flows.

## Git Commit

Pending.

## Staging Push

Pending.

## Remaining Uncertainties

- Real LIFF bind behavior after LINE login is now verified as passing on staging.
- Real short-code bot reply and after-response paid generation behavior are now verified as passing on staging.

## Recommended Next Step

Proceed to a separate production activation decision record if production rollout is desired.
