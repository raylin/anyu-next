# Production Payment Config Dry-Run v0 Handoff

Date: 2026-06-04

## Task

Configure and verify production NewebPay payment configuration readiness for credit-card one-time payment while keeping production checkout disabled/fail-closed.

## Scope

- Inspect production payment config contracts and fail-closed logic.
- Use owner-provided secure env from `apps/web/.env` without printing values.
- Configure Production env names only where appropriate.
- Keep `ENABLE_NEWEBPAY_CHECKOUT` disabled.
- Verify production health and fail-closed checkout/operator behavior.
- Inventory production DB/provider/access-link gates.
- Document dry-run result.

## Constraints

- Do not enable production payment runtime or checkout.
- Do not run real production payments or use real cards.
- Do not enable Apple Pay / Google Pay / Samsung Pay as required paths.
- Do not enable ATM, WebATM, convenience store, installment, rewards, ads, or broad launch settings.
- Do not send Email or LINE messages.
- Do not expose MerchantID, HashKey, HashIV, TradeInfo, TradeSha, or bearer/access tokens.
- Do not apply production DB migrations.
- Do not commit secrets or private values.

## Validation Plan

- Production env names presence check without values.
- Production health check.
- Production checkout/operator fail-closed checks.
- Public page 200 checks.
- Docs presence, dashboard sanity, secret/private scan, `git diff --check`.
- If code changes unexpectedly: lint/test/build.

## Expected Output

- Execution report with configured env names only.
- Production backend/provider checklist.
- Fail-closed verification.
- DB migration gate inventory.
- Summary log and dashboard update.
- Commit and push docs/status changes to `origin/staging`.
