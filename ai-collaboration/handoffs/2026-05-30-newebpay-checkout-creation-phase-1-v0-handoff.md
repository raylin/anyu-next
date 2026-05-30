# NewebPay Checkout Creation Phase 1 Handoff

## Task
Implement gated NewebPay checkout creation Phase 1 for Module 01: pending payment intent creation, checkout payload/form contract, and ReturnURL pending UX only.

## Scope
- Minimal checkout creation + pending `payment_intent`.
- ReturnURL pending UX only.
- Tests, report, and summary log.

## Explicit Non-Goals
- No NotifyURL verification.
- No paid transition from provider flow.
- No entitlement or `pa_` token creation from real payment.
- No generation job or queue trigger from real payment.
- No LINE delivery.
- No production payment runtime enablement.
- No Module 01 prompt/result or legal/provider-review copy changes.

## Safety
- Keep checkout creation gated off by default.
- Use env-only provider config.
- Do not expose provider secrets to client.
- Do not print or commit provider secrets, raw tokens, tokenized URLs, payment payload secrets, raw input, or private values.
