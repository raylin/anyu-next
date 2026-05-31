# Result-Page Checkout No-Card QA Bypass v0

Date: 2026-05-31

## Result

PASS. Added and ran a script-driven no-card QA path for the real Module 01 result-page checkout flow.

New command:

```bash
cd apps/web && corepack pnpm run qa:result-checkout:no-card
```

Preflight command:

```bash
cd apps/web && corepack pnpm run qa:env:preflight -- result-checkout-no-card
```

## What Was Added

- Added `apps/web/scripts/result-checkout-no-card-qa.mjs`.
- Added helper library `apps/web/scripts/lib/result-checkout-no-card-qa.mjs`.
- Added package script `qa:result-checkout:no-card`.
- Added `result_checkout_no_card` mode to `qa:env:preflight`.
- Added safe blank env names to `apps/web/.env.example`.
- Added tests in `apps/web/src/tests/result-checkout-no-card-qa.test.ts`.

## Flow Covered

The new QA runner validates:

```text
fresh normal Module 01 analyze/result
→ result page paid CTA visible
→ checkout-start href present
→ checkout-start page renders launch-safe payment bridge
→ operator fake-paid success server-side
→ paid-result status reaches completed
→ paid access page renders completed paid result
→ production checkout/fake-paid remain fail-closed
```

No NewebPay provider payment is submitted.

## Redaction Guarantees

The runner prints sanitized JSON only.

It does not print:

- `OPERATOR_TEST_SECRET`
- `INTERNAL_JOB_SECRET`
- MerchantID / HashKey / HashIV values
- TradeInfo / TradeSha values
- raw `pcs_` token
- raw `pa_` token
- tokenized URLs
- raw user input
- provider payloads
- card data

Route shapes redact result IDs and unlock tokens, for example:

```text
/m/ambiguous-temperature/result/[REDACTED]/checkout
/m/ambiguous-temperature/unlock/[REDACTED]
```

The first staging run exposed a raw result ID in a path shape. This was corrected before final validation by redacting `/result/...` route segments and rerunning the staging QA successfully.

## Safety Behavior

- Production target is rejected before any QA request.
- Missing `OPERATOR_TEST_SECRET` blocks safely before creating result/checkout/fake-paid state.
- `OPERATOR_TEST_SECRET` is used only by the local script as a server-side request header.
- No visible fake-paid button or browser-exposed operator secret was added.
- `QA_NO_CARD_DISABLE_LOCAL_ENV=1` can be used for CI-like missing-env checks without autoloading `.env.local`.

## Staging QA Result

Staging run:

```bash
cd apps/web && corepack pnpm run qa:result-checkout:no-card
```

Sanitized outcome:

- target preflight: pass, base URL `https://staging.anyu.tw`.
- secret preflight: pass, `OPERATOR_TEST_SECRET` present.
- staging health: pass, environment preview, branch staging, route bundle `payment-foundation-2026-05-29`, commit marker `88c0c88bc8d1`.
- source analyze: pass.
- result page checkout CTA: pass.
- checkout-start page: pass.
- operator fake-paid success: pass.
- queue trigger: pass, provider `vercel_queue`, category `enqueued`.
- paid status: reached `completed`.
- paid access render: pass.
- production disabled check: pass.
- final summary: pass.

No provider payment was submitted.

## Production Safety Result

- Production health: HTTP 200, environment production, branch main.
- Production checkout route: HTTP 404, `not_found`.
- Production fake-paid route: HTTP 404, `not_found`.
- Production runtime flags were not changed.
- Vercel env was not modified.

## Known Limitation

This no-card path proves:

- result-page CTA wiring
- checkout-start rendering
- downstream paid delivery artifacts
- queue completion
- paid access rendering
- production fail-closed behavior

It does not prove NewebPay provider behavior or the exact NewebPay checkout payment intent transition. The operator fake-paid route creates an `operator_fake` payment intent for the same result. Sandbox card E2E remains the required provider proof before production launch.

## Validation

- `cd apps/web && corepack pnpm run qa:env:preflight -- result-checkout-no-card` passed.
- Production target rejection dry run passed.
- Missing-secret dry run with `QA_NO_CARD_DISABLE_LOCAL_ENV=1` blocked safely.
- Staging no-card QA passed.
- `cd apps/web && corepack pnpm lint` passed.
- Targeted tests passed:
  `cd apps/web && corepack pnpm test -- src/tests/result-checkout-no-card-qa.test.ts src/tests/qa-local-env-loader.test.ts src/tests/newebpay-checkout-start-page.test.tsx src/tests/payment-return-poller.test.tsx`
- Full test suite passed: 62 files, 394 tests.
- `cd apps/web && corepack pnpm build` passed.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: the no-card QA path uses an operator fake payment intent, not the NewebPay checkout intent. This is acceptable for no-card QA but should not replace sandbox/provider smoke.
- Opportunistic cleanup completed: env preflight now includes the no-card QA mode.
- Deferred cleanup candidates:
  - optional ReturnURL visual continuity polish
  - future shared Payment Shell + Module Accent abstraction
  - production launch dry-run after NewebPay approval

## Recommended Next Step

If launch confidence remains the priority, run `ReturnURL Visual Continuity Polish v0`. If product exploration is the priority, run `Module 02 Concept Spec: 職場暗流雷達 v0`.
