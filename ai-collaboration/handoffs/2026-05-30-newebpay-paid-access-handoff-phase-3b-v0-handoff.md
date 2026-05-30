# NewebPay Paid Access Handoff Phase 3B Handoff

## Task
Implement a minimal safe ReturnURL/session-bound paid access handoff after verified NewebPay payment.

## Scope
- Keep ReturnURL non-mutating.
- Add a checkout session token issued during checkout creation.
- Add a session-bound payment status endpoint.
- Add a session-bound paid access page that can render completed paid result without exposing raw `pa_`.

## Explicit Non-Goals
- Do not add queue trigger integration.
- Do not add LINE delivery.
- Do not add refund tooling.
- Do not enable broad public payment runtime.
- Do not change Module 01 prompt/result behavior.
- Do not change public legal/provider-review copy.
- Do not add unsafe public token lookup.

## Chosen Model
- Use a signed, non-persisted checkout session token with prefix `pcs_`.
- Token payload contains module slug, merchant order number, expiry, and nonce.
- Token is signed with `PAYMENT_CHECKOUT_SESSION_SECRET`, falling back to `PAID_ACCESS_TOKEN_HASH_SECRET`.
- ReturnURL and status/access endpoints validate this token before showing status or paid access.
- Raw `pa_` tokens remain hash-at-rest and are not reconstructed or exposed to the browser.
- Completed paid result can be rendered through a session-bound access page.

## Validation Plan
- `python3 -m compileall oradar`
- `python3 -m compileall tools/topic-ingestion`
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`
- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`

