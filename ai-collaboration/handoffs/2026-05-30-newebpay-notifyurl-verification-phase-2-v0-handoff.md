# NewebPay NotifyURL Verification Phase 2 Handoff

## Task
Implement NewebPay NotifyURL verification and idempotent payment intent paid transition only.

## Scope
- Add a server-side NotifyURL endpoint for NewebPay callbacks.
- Verify provider payloads using configured NewebPay merchant/hash settings.
- Match verified callbacks to existing Phase 1 pending payment intents.
- Idempotently transition matching successful payments to `paid`.
- Preserve ReturnURL as pending/status UX only.

## Explicit Non-Goals
- Do not create entitlements.
- Do not create `pa_` paid access tokens.
- Do not create generation jobs.
- Do not add queue trigger integration.
- Do not add LINE delivery.
- Do not enable public payment runtime or production flags.
- Do not change Module 01 prompt/result behavior.
- Do not change public legal/provider-review copy.

## Safety Constraints
- Do not commit provider secrets, raw payment payload secrets, decrypted sensitive payloads, raw `pa_` tokens, tokenized URLs, raw user input, or private values.
- NotifyURL is payment truth; ReturnURL must not mutate payment state.
- Invalid, mismatched, or unverified provider callbacks must not mark payments paid.
- Duplicate successful callbacks must be idempotent and must not create delivery artifacts.

## Implementation Plan
1. Add NewebPay payload verification helpers under `apps/web/src/lib/payments/newebpay/`.
2. Add a payment notify service that verifies, matches, and transitions payment intents.
3. Add `POST /api/payments/newebpay/notify`.
4. Keep ReturnURL read-only and update tests to assert it stays non-mutating.
5. Add targeted tests for verification failures, successful paid transition, duplicate notify, and artifact non-creation.

## Validation Plan
- `python3 -m compileall oradar`
- `python3 -m compileall tools/topic-ingestion`
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`
- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`

