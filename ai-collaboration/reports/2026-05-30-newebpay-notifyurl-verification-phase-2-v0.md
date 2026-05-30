# NewebPay NotifyURL Verification Phase 2 Execution Report

## Summary
Implemented NewebPay NotifyURL verification and idempotent `payment_intent` paid transition for Module 01. The new provider callback path verifies encrypted NewebPay callback fields, matches the existing Phase 1 pending payment intent, and marks it `paid` only for verified successful payments.

This phase deliberately does not create entitlements, `pa_` tokens, generation jobs, queue triggers, LINE delivery, public checkout UI, or production payment runtime enablement.

## Files Created
- `apps/web/src/app/api/payments/newebpay/notify/route.ts`
- `apps/web/src/lib/payments/newebpay/notify-service.ts`
- `apps/web/src/lib/payments/newebpay/notify-verification.ts`
- `apps/web/src/tests/newebpay-notify-route.test.ts`
- `apps/web/src/tests/newebpay-notify-service.test.ts`
- `ai-collaboration/handoffs/2026-05-30-newebpay-notifyurl-verification-phase-2-v0-handoff.md`
- `ai-collaboration/reports/2026-05-30-newebpay-notifyurl-verification-phase-2-v0.md`

## Files Updated
- `apps/web/src/lib/payments/newebpay/checkout-payload.ts`
- `apps/web/src/tests/newebpay-return-page.test.tsx`
- `ai-collaboration/summaries/summary_log.md`

## NotifyURL Route
- Route path: `POST /api/payments/newebpay/notify`
- Accepts form-encoded provider callback payloads and JSON payloads for tests/operator diagnostics.
- Returns provider-compatible plain text:
  - success: `1|OK`
  - failure: `0|ERROR`
- Adds only a safe category header, `x-anyu-payment-category`, for sanitized diagnostics.

## Verification Helpers
Added provider-specific verification under `apps/web/src/lib/payments/newebpay/`.

Verification assumptions:
- Callback contains `MerchantID`, `TradeInfo`, `TradeSha`, and optional `Version`.
- `TradeSha` is calculated as `SHA256(HashKey={HashKey}&{TradeInfo}&HashIV={HashIV})`, uppercased.
- `TradeInfo` is AES-256-CBC encrypted JSON using `NEWEBPAY_HASH_KEY` and `NEWEBPAY_HASH_IV`.
- Decrypted payload contains top-level `Status`, `Message`, and `Result`.
- `Result` contains `MerchantOrderNo`, `Amt`, and optional `RespondCode`, `TradeNo`, `PaymentType`, and `PayTime`.

These assumptions match the current Phase 1 MPG checkout contract and should be rechecked against final provider-review documentation before broad runtime enablement.

## Required Env Vars
No values were recorded.

- `NEWEBPAY_MERCHANT_ID`
- `NEWEBPAY_HASH_KEY`
- `NEWEBPAY_HASH_IV`
- `NEWEBPAY_CHECKOUT_URL`
- `NEWEBPAY_NOTIFY_URL`
- `NEXT_PUBLIC_APP_URL`
- optional `NEWEBPAY_ENVIRONMENT`

Operational note: staging env work must check branch-scoped `Preview(staging)` variables because they override general Preview env.

## Paid Transition State Machine
Verified NotifyURL callback:

```text
created | checkout_started -> paid
```

Already-paid callback:

```text
paid -> paid
```

The already-paid case is treated as `duplicate_notify` and does not perform another transition.

Rejected callbacks:
- missing provider config
- malformed payload
- missing/invalid signature
- decrypt failure
- merchant mismatch
- unknown order/payment intent
- amount mismatch
- non-success provider payment status
- unsupported existing payment state

Rejected callbacks do not mark the payment intent paid.

## Idempotency Behavior
- Duplicate successful NotifyURL for an already-paid payment intent returns success with category `duplicate_notify`.
- Duplicate notify does not create entitlement.
- Duplicate notify does not create `pa_` token.
- Duplicate notify does not create generation job.

## ReturnURL Behavior
ReturnURL remains UX/status-only:
- It may display the current payment intent status, including `paid`.
- It does not mark payment paid.
- It does not create entitlement, `pa_` token, generation job, or queue work.

## Tests Added
- Missing provider config returns safe error and does not mutate.
- Malformed payload does not mutate.
- Invalid signature does not mutate.
- Verified successful NotifyURL marks matching pending intent paid.
- Duplicate successful NotifyURL is idempotent.
- Amount mismatch does not mark paid.
- Payment failed/cancelled provider status does not mark paid.
- Notify route returns `1|OK` / `0|ERROR` without exposing internals.
- ReturnURL can display `paid` status while staying non-mutating.

## Validation Results
- `cd apps/web && corepack pnpm test -- newebpay-notify-service newebpay-notify-route newebpay-return-page`: passed.
- `python3 -m compileall oradar`: passed.
- `python3 -m compileall tools/topic-ingestion`: passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`: passed, 25 tests.
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed, 48 files / 315 tests.
- `cd apps/web && corepack pnpm build`: passed and included `/api/payments/newebpay/notify`.
- `git diff --check`: passed.

## Safety Results
- No provider secrets were printed or committed.
- No raw decrypted provider payloads are returned to clients.
- No raw `pa_` tokens, tokenized URLs, raw user input, LINE IDs, or private values were recorded.
- Entitlement, paid access token, generation job, queue, LINE, prompt, result schema, and public legal/provider-review copy behavior were untouched.

## Tech Debt Review
### New Technical Debt Introduced
- Notify verification currently implements known MPG callback assumptions and should be rechecked against final NewebPay provider-review docs before production runtime.

### Existing Technical Debt Observed
- Branch-scoped `Preview(staging)` env precedence remains an operational footgun.
- Temporary processor auth diagnostics from earlier fake-paid QA still need later removal or tightening after payment flow stabilizes.

### Opportunistic Cleanup Completed
- Reused checkout `TradeSha` calculation from a single exported helper to avoid duplicate signature logic.

### Deferred Cleanup Candidates
- Add real staging NewebPay sandbox callback smoke once provider sandbox credentials and callback tooling are available.
- Consider a provider event/audit table if support needs exceed current `payment_intents` metadata columns.

### Recommended Follow-up
NewebPay Paid Delivery Integration Phase 3: verified paid `payment_intent` -> entitlement + `pa_` token -> generation job creation, still without broad public runtime.

## Deviations From Handoff
- None.

## Git Commit
Pending at report-writing time; final hash is recorded in the Codex completion summary.

## Staging Push
Pending at report-writing time; final push status is recorded in the Codex completion summary.

## Remaining Uncertainties
- Exact final NewebPay callback field set may vary by merchant/provider settings.
- Whether final provider review requires additional response semantics beyond `1|OK` / `0|ERROR`.

## Recommended Next Step
Proceed to NewebPay Paid Delivery Integration Phase 3 after review, limited to verified paid payment intents creating delivery artifacts behind safe gates.
