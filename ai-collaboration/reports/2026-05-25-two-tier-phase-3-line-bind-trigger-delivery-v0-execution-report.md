# Two-tier Phase 3 LINE Bind Trigger + Delivery v0 Execution Report

## Summary

Implemented LINE fulfillment triggers for the two-tier deferred paid-generation flow. LIFF bind now requests paid generation. LINE short-code webhook replies quickly with a pending link and schedules paid generation after the webhook response.

Production was not deployed.

## Files Created

- `ai-collaboration/handoffs/2026-05-25-two-tier-phase-3-line-bind-trigger-delivery-v0-handoff.md`
- `ai-collaboration/research/2026-05-25-two-tier-phase-3-line-bind-trigger-delivery-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-25-two-tier-phase-3-line-bind-trigger-delivery-v0-execution-report.md`

## Files Updated

- `apps/web/src/app/api/line/fulfillment/bind-liff/route.ts`
- `apps/web/src/app/api/line/webhook/route.ts`
- `apps/web/src/lib/line/webhook.ts`
- `apps/web/src/tests/line-route-hardening.test.ts`
- `ai-collaboration/summaries/summary_log.md`

## Trigger Design

LIFF/web path can synchronously request paid generation because it is user-driven and can redirect to the unlocked page. Webhook path must not wait on provider generation; it responds quickly and schedules generation after response.

## LIFF Flow Changes

After verified LINE ID token and unlock token validation, the bind route:

- binds unlock intent to LINE
- calls `requestDeferredPaidGeneration`
- records safe `paidStatus` metadata
- returns `unlockedUrl` and safe `paidStatus`

## Webhook Flow Changes

After valid short-code match, the webhook:

- binds unlock intent to LINE
- replies with pending message and unlocked link
- schedules deferred paid generation with Next `after`
- preserves existing duplicate/signature/rate-limit handling

## Paid Generation / Delivery Behavior

The user receives a link immediately. The unlocked route is responsible for showing completed/processing/failed state honestly. No raw analysis content is sent through LINE.

## Tests Added

Updated LINE route tests for:

- LIFF bind triggers paid generation after verified identity binding.
- Valid short-code webhook replies with pending copy and link.
- Event metadata does not include LINE user ID, fulfillment code, or unlock token.
- Existing hardening tests remain green.

## Staging Smoke

Automated staging smoke after deploy verified deferred paid-generation provider path:

- analyze: HTTP 200, about 17.3s
- unlock intent: HTTP 200
- paid request: HTTP 200 completed, about 39.0s
- repeat paid request: HTTP 200 reused, about 1.0s
- unlocked route: HTTP 200 with paid-content marker
- DB verification: paid row completed, provider model `claude-haiku-4-5-20251001`, paid JSON present, retention set
- event metadata: `source: provider`

Real LIFF ID-token smoke and real test-OA short-code smoke were not possible from shell and remain manual staging steps.

## Validation Results

Passed:

- `python3 -m compileall oradar`
- `python3 -m compileall tools/topic-ingestion`
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`
- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm test:e2e:local`

## Known Technical Debt

Webhook generation uses after-response scheduling, not a durable queue. If the task fails after the webhook reply, the user still has an honest unlocked page but no automatic LINE push retry.

## Tech Debt Review

### New Technical Debt Introduced

- `scheduleAfterResponse` includes a unit-test fallback because Next `after` requires request async context.

### Existing Technical Debt Observed

- No durable background job or queue exists.
- Real LINE client smoke remains manual.

### Opportunistic Cleanup Completed

- Added explicit pending LINE message copy instead of reusing completed-link copy.

### Deferred Cleanup Candidates

- Add durable background delivery or polling endpoint.
- Add manual test-OA smoke record after operator verification.

### Recommended Follow-up

Run manual staging test OA smoke for LIFF bind and short-code message.

## Deviations From Handoff

- Did not add a status API because existing unlocked route states and paid-generation service status were sufficient for this MVP.
- Did not implement automatic push-after-completion; webhook sends a processing link instead.

## Git Commit

Pending.

## Staging Push

Pending.

## Remaining Uncertainties

- Real LIFF and short-code LINE client behavior still needs manual test-OA verification.
- Next `after` is not a durable background mechanism.

## Recommended Next Step

Run manual staging LINE fulfillment smoke with the test OA, then decide whether Phase 3B needs durable background delivery.
