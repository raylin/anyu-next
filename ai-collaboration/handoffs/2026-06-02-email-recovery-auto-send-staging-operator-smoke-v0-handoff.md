# Email Recovery Auto-Send Staging Operator Smoke v0 Handoff

## Date

2026-06-02

## Task

Run or enable a staging operator smoke that proves a checkout-start-style Email recovery contact receives a real recovery Email automatically after paid result readiness.

## Context

Paid Delivery Recovery Link Send Hook v0 added non-fatal Email recovery auto-send after direct/queued paid result completion. Existing no-card QA cannot prove this because checkout-start creates a NewebPay payment intent while operator fake-paid creates a separate operator payment intent. A safe Preview(staging)-only operator path may be needed to create the recovery contact and payment artifacts in the same operator payment context.

## Relevant Files

- `apps/web/src/lib/payments/operator-fake-paid-success.ts`
- `apps/web/src/lib/payments/paid-delivery-artifacts.ts`
- `apps/web/src/lib/modules/paid-generation-processor.ts`
- `apps/web/src/lib/notifications/email-recovery-link.ts`
- `apps/web/src/lib/db/payment-recovery-contacts.ts`
- `apps/web/src/app/api/operator/email-recovery-smoke/route.ts`
- `apps/web/scripts/result-checkout-no-card-qa.mjs`
- `apps/web/scripts/recovery-link-smoke-qa.mjs`

## Constraints

- Do not enable production payment runtime or modify production env/DB.
- Do not send production Email or LINE messages.
- Do not expose raw `prl_`, token hash, `pa_`, `pcs_`, raw Email, provider payload, or report content.
- Use only owner-approved test recipient from secure env.
- Any new operator path must be Preview(staging)-only, operator-secret gated, sanitized, and production fail-closed.

## Planned Work

1. Inspect current QA/payment/recovery flow.
2. Add minimal operator smoke path if required.
3. Run targeted and full validation if code changes.
4. Deploy/push to staging as required by project workflow.
5. Run staging smoke using approved test recipient without printing values.
6. Document result, update summary/dashboard, commit, and push.

## Uncertainties

- Whether existing Preview(staging) env already has any new feature flag required for this smoke; if missing, set branch-scoped Preview(staging) only if needed and approved by task scope.
