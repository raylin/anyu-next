# NewebPay Paid Delivery Integration Phase 3 Handoff

## Task
Connect verified paid NewebPay payment intents to the existing paid delivery foundation.

## Scope
- Extract reusable paid delivery artifact creation from the operator fake-paid path.
- After verified successful NewebPay NotifyURL marks a payment intent `paid`, create/reuse:
  - entitlement
  - hash-at-rest `pa_` paid access token
  - paid generation job
- Preserve idempotency and fake-paid QA behavior.

## Explicit Non-Goals
- Do not add queue trigger integration.
- Do not add LINE delivery.
- Do not add refund tooling.
- Do not enable broad public payment runtime.
- Do not change Module 01 prompt/result behavior.
- Do not change public legal/provider-review copy.
- Do not add checkout UI changes beyond safe status behavior.

## Safety Constraints
- Do not log or expose raw `pa_` tokens from NotifyURL.
- Do not commit provider secrets, raw payment payload secrets, decrypted provider payloads, raw user input, or tokenized URLs.
- Invalid or mismatched NotifyURL callbacks must not create delivery artifacts.
- ReturnURL remains non-mutating.

## Implementation Plan
1. Add a shared delivery service for payment-intent-backed paid delivery artifacts.
2. Refactor operator fake-paid success to use the shared service.
3. Wire verified NewebPay NotifyURL success and duplicate paid notifications to the shared delivery service without exposing raw tokens.
4. Add targeted tests for successful delivery artifact creation, duplicate idempotency, invalid callback no-op, ReturnURL non-mutation, and fake-paid compatibility.

## Validation Plan
- `python3 -m compileall oradar`
- `python3 -m compileall tools/topic-ingestion`
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`
- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`

