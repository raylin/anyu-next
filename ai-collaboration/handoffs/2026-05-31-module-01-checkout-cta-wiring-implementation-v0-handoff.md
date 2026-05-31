# Module 01 Checkout CTA Wiring Implementation v0 Handoff

## Date

2026-05-31

## Task

Wire Module 01 result-page paid CTA to a safe server-rendered checkout-start page/route for staging/user-facing checkout UI testing without exposing operator secrets or enabling production runtime.

## Context

- Module 01 checkout CTA wiring plan recommended a dedicated checkout-start page/route.
- Current result page computes `checkout_available` only when payment runtime and NewebPay checkout flags are enabled.
- `PaidPreviewCard` copy is launch-aligned but the primary button is disabled because no checkout action/link is wired.
- Checkout service and route exist; sandbox E2E v5 has passed through the helper/operator-gated flow.
- Production payment runtime remains disabled/fail-closed.

## Relevant Files

- `apps/web/src/app/m/[moduleSlug]/result/[resultId]/page.tsx`
- `apps/web/src/components/anyu/PaidPreviewCard.tsx`
- `apps/web/src/components/modules/ai-temperature/AiTemperatureResult.tsx`
- `apps/web/src/lib/modules/paid-cta-view-model.ts`
- `apps/web/src/lib/payments/newebpay/checkout-service.ts`
- `apps/web/src/app/api/modules/[moduleSlug]/checkout/newebpay/route.ts`
- `apps/web/src/tests/`
- `ai-collaboration/reports/`
- `ai-collaboration/summaries/summary_log.md`

## Constraints

- Do not enable production payment runtime or change env values.
- Do not run production payments or apply production DB migration.
- Do not expose `OPERATOR_TEST_SECRET`, provider credentials, raw `TradeInfo` / `TradeSha`, raw `pa_` / `pcs_` tokens, tokenized URLs, raw input, or private values.
- Do not implement Module 02, homepage portal, LINE delivery, or prompt/result behavior changes.

## Planned Work

1. Save this handoff.
2. Add a server-rendered checkout-start page under Module 01 result routing.
3. Keep production disabled fail-closed; allow staging/operator checkout only through server-side gates.
4. Wire `PaidPreviewCard` to render a checkout link when checkout is available.
5. Render a confirmation page with explicit submit button to NewebPay.
6. Add/update tests for disabled state, checkout link, checkout-start page, redaction, and no pre-payment artifacts.
7. Run required validation.
8. Create report, update summary/dashboard if needed, commit, and push to `origin/staging`.

## Uncertainties

- Exact production launch gate remains external; this implementation must stay dormant in production while flags are disabled.
- Full staging browser payment smoke may be too broad for this implementation task and can remain a follow-up if needed.
