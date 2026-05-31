# Result-Page Checkout Staging Sandbox QA v0 Handoff

## Date

2026-05-31

## Task

Run staging sandbox QA through the real Module 01 result-page paid CTA path: result page to checkout-start page to NewebPay sandbox payment to ReturnURL/status/access to completed paid result.

## Context

- Checkout-start route exists at `/m/[moduleSlug]/result/[resultId]/checkout`.
- Result-page CTA links to checkout-start only when checkout is available.
- Production remains disabled and fail-closed.
- NewebPay sandbox E2E v5 passed through helper/operator flow, but result-page CTA UI path has not been smoke-tested.
- Staging unique index for `entitlements(payment_intent_id)` is applied.

## Relevant Files

- `apps/web/src/app/m/[moduleSlug]/result/[resultId]/checkout/page.tsx`
- `apps/web/src/app/m/[moduleSlug]/result/[resultId]/page.tsx`
- `apps/web/src/components/anyu/PaidPreviewCard.tsx`
- `apps/web/scripts/newebpay-sandbox-e2e-helper.mjs`
- `ai-collaboration/reports/`
- `ai-collaboration/summaries/summary_log.md`
- `ai-collaboration/dashboard/anyu-project-dashboard.html`

## Constraints

- Do not enable production payment runtime or modify production env.
- Do not use real cards.
- Do not print or commit provider credentials, raw `TradeInfo` / `TradeSha`, provider payloads, raw `pa_` / `pcs_` tokens, tokenized URLs, raw input, card data, or private values.
- Do not test non-credit-card payment methods.
- Do not implement Module 02, public copy changes, or LINE delivery.

## Planned Work

1. Save this handoff.
2. Verify staging deployment freshness and production fail-closed state.
3. Create a fresh Module 01 result through the staging analyze path.
4. Verify the result page CTA is checkout-enabled and sanitized.
5. Verify checkout-start page renders a sandbox provider form without secret exposure.
6. Pause for owner/operator manual sandbox credit-card payment.
7. After confirmation, poll status/access and verify backend delivery/queue evidence.
8. Record sanitized report, update summary/dashboard if status changes, validate docs, commit, and push.

## Uncertainties

- Whether Preview(staging) deployment has completed for commit `31fdbe8`.
- Whether owner can complete the manual sandbox payment during this run.
