# Module 01 Checkout CTA Wiring Plan v0 Handoff

## Date

2026-05-31

## Task

Plan the safest way to wire the Module 01 result-page paid CTA to NewebPay checkout creation while preserving production fail-closed behavior and staging sandbox testing.

## Context

- Module 01 paid CTA copy is state-driven and launch-aligned.
- NewebPay sandbox E2E v5 passed end-to-end through helper/operator-created checkout.
- Staging DB has the `entitlements(payment_intent_id)` partial unique index applied and verified.
- Production payment runtime remains disabled and production DB unique index is not yet applied.
- Result-page checkout-available copy exists, but public/result-page checkout submission is not wired.

## Relevant Files

- `apps/web/src/lib/payments/paid-cta-view-model.ts`
- `apps/web/src/components/PaidPreviewCard.tsx`
- `apps/web/src/components/AiTemperatureResult.tsx`
- `apps/web/src/app/m/[moduleSlug]/payment/return/page.tsx`
- `apps/web/src/app/m/[moduleSlug]/payment/access/page.tsx`
- `apps/web/src/app/api/modules/[moduleSlug]/checkout/newebpay/route.ts`
- `apps/web/src/lib/payments/newebpay/checkout-service.ts`
- `apps/web/scripts/newebpay-sandbox-e2e-helper.mjs`
- `ai-collaboration/reports/`
- `ai-collaboration/summaries/summary_log.md`
- `ai-collaboration/dashboard/anyu-project-dashboard.html`

## Constraints

- Planning only; do not implement checkout wiring.
- Do not enable production payment runtime or change Vercel env values.
- Do not run payments or deploy.
- Do not apply production DB migration.
- Do not implement Module 02, multi-module homepage, LINE delivery, or prompt/result behavior changes.
- Do not commit secrets or private values.

## Planned Work

1. Save this handoff.
2. Inspect current CTA/result/payment/checkout route source.
3. Document the current CTA state model and checkout route contract.
4. Compare implementation options and recommend a v0 wiring approach.
5. Define gate model, tests, staging QA plan, and production launch dependencies.
6. Create an execution report, update summary log and dashboard if useful.
7. Run documentation validation.
8. Commit and push to `origin/staging` unless blocked.

## Uncertainties

- Whether v0 should expose staging checkout publicly or keep it operator-gated until production launch.
- Whether implementation should prefer a dedicated checkout-start page or a server action once source constraints are inspected.
