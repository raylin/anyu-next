# ReturnURL Polling UX Polish v0 Handoff

## Date

2026-05-31

## Task

Improve Module 01 payment ReturnURL polling UX while preserving non-mutating payment truth.

## Context

- Checkout-start route is implemented.
- Payment UX Orchestration Plan v0 identified ReturnURL polling as P1 launch polish.
- Current ReturnURL page resolves status once server-side and does not poll.
- ReturnURL must not imply browser return equals payment success.
- Web access remains canonical paid delivery; LINE delivery is not implemented.

## Relevant Files

- `apps/web/src/app/m/[moduleSlug]/payment/return/page.tsx`
- `apps/web/src/app/api/modules/[moduleSlug]/payment/status/route.ts`
- `apps/web/src/app/m/[moduleSlug]/payment/access/page.tsx`
- `apps/web/src/components/modules/ai-temperature/PaidResultPendingPoller.tsx`
- `apps/web/src/tests/newebpay-return-page.test.tsx`
- `apps/web/src/tests/payment-status-route.test.ts`
- `apps/web/src/tests/payment-access-page.test.tsx`
- `ai-collaboration/reports/`
- `ai-collaboration/summaries/summary_log.md`

## Constraints

- Do not change provider/payment mutation behavior.
- Do not enable production payment runtime or modify env values.
- Do not run payments.
- Do not add LINE delivery, Module 02, homepage portal, or broad visual shell redesign.
- Do not expose or commit secrets, raw tokens, tokenized URLs, provider payloads, raw input, or private values.

## Planned Work

1. Save this handoff.
2. Inspect current ReturnURL/status/access and existing poller patterns.
3. Add a small client ReturnURL payment status poller.
4. Update ReturnURL page copy/state rendering.
5. Add/update tests for waiting, processing, ready, failed, invalid/expired, and non-mutating behavior.
6. Create report, update summary/dashboard if useful.
7. Run lint, targeted tests, full test, and build.
8. Commit and push to `origin/staging` unless blocked.

## Uncertainties

- Whether future design shell work will replace the final visual layout; this task should keep visuals minimal and compatible.
