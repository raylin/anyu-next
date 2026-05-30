# NewebPay Paid Access Handoff Phase 3B Execution Report

## Summary
Implemented a minimal safe ReturnURL/session-bound paid access handoff for real NewebPay payment flow. The browser that initiated checkout receives a signed checkout session token in the ReturnURL, can poll a sanitized payment status endpoint, and can reach a session-bound paid access page once NotifyURL has verified payment and paid generation has completed.

ReturnURL remains non-mutating and does not mark payment paid, verify provider payloads, create entitlements, create `pa_` tokens, create generation jobs, or trigger processing.

## Files Created
- `apps/web/src/lib/payments/payment-checkout-session.ts`
- `apps/web/src/lib/payments/payment-access-handoff.ts`
- `apps/web/src/app/api/modules/[moduleSlug]/payment/status/route.ts`
- `apps/web/src/app/m/[moduleSlug]/payment/access/page.tsx`
- `apps/web/src/tests/payment-checkout-session.test.ts`
- `apps/web/src/tests/payment-access-handoff.test.ts`
- `apps/web/src/tests/payment-status-route.test.ts`
- `apps/web/src/tests/payment-access-page.test.tsx`
- `ai-collaboration/handoffs/2026-05-30-newebpay-paid-access-handoff-phase-3b-v0-handoff.md`
- `ai-collaboration/reports/2026-05-30-newebpay-paid-access-handoff-phase-3b-v0.md`

## Files Updated
- `apps/web/src/lib/payments/newebpay/checkout-service.ts`
- `apps/web/src/app/api/modules/[moduleSlug]/checkout/newebpay/route.ts`
- `apps/web/src/app/m/[moduleSlug]/payment/return/page.tsx`
- `apps/web/src/app/m/[moduleSlug]/unlock/[unlockToken]/page.tsx`
- `apps/web/src/tests/newebpay-checkout-service.test.ts`
- `apps/web/src/tests/newebpay-checkout-route.test.ts`
- `apps/web/src/tests/newebpay-return-page.test.tsx`
- `ai-collaboration/summaries/summary_log.md`

## Access Handoff Model
Chosen model: signed, non-persisted checkout session token.

Token behavior:
- prefix: `pcs_`
- payload: `moduleSlug`, `merchantOrderNo`, `exp`, `nonce`
- signing: HMAC-SHA256
- primary env: `PAYMENT_CHECKOUT_SESSION_SECRET`
- fallback env: `PAID_ACCESS_TOKEN_HASH_SECRET`
- persistence: none
- expiry: 24 hours

This avoids a schema migration and avoids storing raw checkout session tokens. Because it is not persisted, there is no hash-at-rest row. The token is a private bearer handoff link and must not be logged or committed.

## Checkout Creation Changes
Checkout creation now issues a checkout session token before writing payment state. If session signing config is unavailable, checkout creation fails safely before payment intent creation.

NewebPay ReturnURL now includes:
- `merchantOrderNo`
- `checkoutToken`

The merchant order number is still useful for provider/operator support, but access decisions use the signed checkout token.

## Payment Status Endpoint
Added:

```text
POST /api/modules/[moduleSlug]/payment/status
```

Input:
- `checkoutToken`

Sanitized states:
- `waiting_for_payment`
- `paid_processing`
- `paid_ready`
- `paid_failed`
- `expired`
- `invalid_session`

The endpoint does not expose provider payloads, raw `pa_` tokens, internal payment objects, or secrets. It does not mutate payment or delivery state.

## ReturnURL UX
ReturnURL now validates the session-bound checkout token and shows:
- waiting state before NotifyURL payment confirmation
- processing state after verified paid delivery artifacts exist but paid result is not completed
- ready state with a safe session-bound access link when paid result is completed
- support/fallback copy for invalid or expired sessions

ReturnURL remains non-mutating.

## Paid Access Page
Added:

```text
GET /m/[moduleSlug]/payment/access?checkoutToken=...
```

The page validates the signed checkout session token and renders the completed paid result only when:
- matching payment intent is `paid`
- entitlement exists
- completed paid result exists

It does not use or expose the raw `pa_` token.

## Raw pa_ Token Handling
The shared delivery service still creates the `pa_` token and stores only its hash. Phase 3B does not retrieve or expose the raw `pa_` token for NewebPay browser handoff.

This means:
- NotifyURL does not expose raw `pa_`
- ReturnURL does not expose raw `pa_`
- status endpoint does not expose raw `pa_`
- access page renders via signed checkout session, not raw `pa_`

## Security Assumptions
- `checkoutToken` is a private bearer token.
- It is signed, time-limited, and bound to module + merchant order number.
- It is not proof of payment by itself.
- Payment truth remains verified NotifyURL and `payment_intents.status = paid`.
- Access page requires both valid checkout token and completed paid result state.

## Tests Added / Updated
- checkout session token creation/resolution/tamper/expiry
- checkout creation issues session token and fails safely when signing config is missing
- payment access handoff rejects invalid sessions
- unpaid payment does not reveal access
- verified paid before result ready returns `paid_processing`
- completed paid result returns `paid_ready` with session-bound access path
- payment status endpoint returns sanitized states
- payment access page renders paid result only for valid ready handoff
- ReturnURL remains non-mutating and uses session-bound state

## Validation Results
- `cd apps/web && corepack pnpm test -- payment-access-page payment-checkout-session payment-access-handoff payment-status-route newebpay-checkout-service newebpay-return-page`: passed, 53 files / 333 tests.
- `python3 -m compileall oradar`: passed.
- `python3 -m compileall tools/topic-ingestion`: passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`: passed, 25 tests.
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed, 53 files / 333 tests.
- `cd apps/web && corepack pnpm build`: passed and included `/api/modules/[moduleSlug]/payment/status` and `/m/[moduleSlug]/payment/access`.
- `git diff --check`: passed.

## Staging QA Notes
Suggested staging smoke after deployment:
1. Create gated NewebPay checkout and confirm ReturnURL contains `checkoutToken`.
2. Call payment status endpoint before NotifyURL and expect `waiting_for_payment`.
3. Simulate verified NotifyURL fixture or use provider sandbox and expect `paid_processing`.
4. Run existing manual processor path.
5. Confirm status returns `paid_ready` and access page renders paid result.
6. Confirm invalid checkout token cannot access paid result.

Do not record checkout tokens, provider payload secrets, decrypted provider payloads, raw `pa_` tokens, tokenized URLs, raw user input, or private values.

## Tech Debt Review
### New Technical Debt Introduced
- The session-bound access page is a minimal browser handoff and does not replace the canonical `pa_` unlock URL. Decide later whether this should remain a first-class paid access path or be exchanged for a short-lived redirect/token channel.

### Existing Technical Debt Observed
- Branch-scoped `Preview(staging)` env precedence remains an operational footgun.
- Queue trigger integration is still absent, so paid generation requires existing manual/processor path.

### Opportunistic Cleanup Completed
- Exported existing `UnlockCompleted` rendering so paid result presentation is shared instead of duplicated.

### Deferred Cleanup Candidates
- Add client-side polling component for ReturnURL payment status if needed.
- Add explicit telemetry for payment handoff states without recording tokens.
- Add real NewebPay sandbox E2E smoke.

### Recommended Follow-up
Queue Trigger Integration / Paid Delivery Orchestration Phase 4, or real NewebPay sandbox E2E smoke if provider credentials are available.

## Deviations From Handoff
- Did not persist checkout session token hash because a signed, non-persisted token was sufficient and safer for a minimal v0 without schema changes.
- Did not introduce encrypted raw `pa_` storage; session-bound rendering avoids exposing/reconstructing raw `pa_`.

## Git Commit
Pending at report-writing time; final hash is recorded in the Codex completion summary.

## Staging Push
Pending at report-writing time; final push status is recorded in the Codex completion summary.

## Remaining Uncertainties
- Whether the session-bound access page should remain long-term or be replaced by an exchange-to-`pa_` flow.
- Whether final NewebPay ReturnURL behavior preserves custom query params exactly in all provider modes.

## Recommended Next Step
Queue Trigger Integration / Paid Delivery Orchestration Phase 4, or a real NewebPay sandbox end-to-end smoke if provider credentials are available.
