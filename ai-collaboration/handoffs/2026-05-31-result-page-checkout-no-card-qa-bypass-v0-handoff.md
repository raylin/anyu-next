# Result-Page Checkout No-Card QA Bypass v0 Handoff

## Date

2026-05-31

## Task

Add a safe staging/operator-only no-card QA path for the real Module 01 result-page checkout flow.

## Context

- Real result-page checkout sandbox QA has already passed with sandbox credit card.
- Checkout-start visual bridge and ReturnURL polling are implemented.
- Production payment runtime remains disabled and fail-closed.
- Current gap: repeated full user-path smoke requires sandbox card input.

## Scope

- QA tooling only.
- Script-driven staging/operator path.
- No visible fake-paid UI.
- No production runtime/env/provider behavior changes.

## Planned Work

1. Inspect existing QA scripts, checkout-start route, fake-paid route, payment status/access routes, and env preflight.
2. Add a dedicated no-card QA script and package command.
3. Ensure it:
   - creates a fresh normal Module 01 result
   - validates result-page paid CTA and checkout-start link
   - validates checkout-start copy/form/secret-safety
   - calls operator fake-paid success server-side
   - polls paid access/status and verifies completed paid result
   - verifies production checkout/fake-paid remain fail-closed
4. Add tests for safe missing-secret blocking, production target rejection, redaction, and CTA unavailable classification if practical.
5. Run validation and staging QA if local secrets are available.
6. Document results, update summary/dashboard, commit, and push.

## Safety Constraints

- Do not print or commit `OPERATOR_TEST_SECRET`, `INTERNAL_JOB_SECRET`, NewebPay credentials, raw provider payloads, raw `pcs_`/`pa_` tokens, tokenized URLs, card data, raw user input, or private values.
- Do not submit provider payment.
- Do not target production.
- Do not change production flags or Vercel env.
