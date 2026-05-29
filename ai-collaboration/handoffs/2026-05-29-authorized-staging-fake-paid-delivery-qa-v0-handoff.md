# Authorized Staging Fake Paid Delivery QA v0 Handoff

## Task
Rerun the authorized staging fake paid delivery QA after owner/operator staging env setup.

## Scope
- QA and documentation only unless a minimal fix is required.
- Staging only.
- No real payment runtime.
- No production flag changes.
- No NewebPay checkout, notify, or return behavior.

## Chain To Validate
1. Missing operator secret rejected.
2. Invalid operator secret rejected.
3. Valid operator secret reaches fake paid success path.
4. Fake paid success creates/reuses payment intent.
5. Entitlement is created/reused.
6. Raw `pa_` token returned only on first creation.
7. Generation job created/reused idempotently.
8. `pa_` unlock route works.
9. Paid-result status polling works.
10. Processor/manual path completes paid result.
11. Completed paid result renders through `pa_` unlock route.
12. Legacy unlock still works.
13. Invalid `pa_` still does not fallback to legacy.
14. Production/payment runtime remain disabled.

## Safety Rules
- Do not commit raw `pa_` tokens, tokenized URLs, operator secrets, processor secrets, provider credentials, raw user input, or private values.
- Do not print secrets.
- Redact all token-bearing request/response examples.
- Do not change prompts, schemas, Module 01 result behavior, legal/provider-review copy, LINE delivery, queue trigger, or production behavior.

## Deliverables
- QA report under `ai-collaboration/reports/`.
- Summary log update.
- Commit and push to `origin/staging`.
