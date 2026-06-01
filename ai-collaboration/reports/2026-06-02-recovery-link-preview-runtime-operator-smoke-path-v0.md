# Recovery Link Preview Runtime Operator Smoke Path v0

Date: 2026-06-02

## Completed Work

- Added Preview(staging)-only operator endpoint:
  - `POST /api/operator/recovery-link-smoke`
- Added feature flag:
  - `ENABLE_OPERATOR_RECOVERY_LINK_SMOKE`
- Added runtime smoke service:
  - reuses operator fake-paid delivery artifacts
  - processes the exact paid generation job by ID
  - creates an `operator_test` `paid_result_recovery_link` inside Preview runtime
  - resolves the recovery link server-side
  - verifies paid result access reaches a completed render marker
  - verifies invalid-link safety
  - revokes the operator test recovery link after smoke
- Updated `qa:recovery-link:smoke` runtime mode so local execution no longer needs `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`.
- Retained local DB mode behind `QA_RECOVERY_LINK_MODE=local-db`.
- Updated `qa:env:preflight recovery-link-smoke` for runtime mode.
- Added route and feature-flag tests.

## Gate Behavior

- Endpoint is disabled by default.
- Endpoint requires `ENABLE_OPERATOR_RECOVERY_LINK_SMOKE=true`.
- Endpoint only enables on `VERCEL_ENV=preview` and `VERCEL_GIT_COMMIT_REF=staging`.
- Endpoint requires `x-operator-test-secret`.
- Production returns 404 / fail-closed even if someone accidentally configures the flag.

## Preview(staging) Env Alignment

- Added branch-scoped Preview(staging) env:
  - `ENABLE_OPERATOR_RECOVERY_LINK_SMOKE=true`
- Did not set Production env.
- Did not set general Preview env.
- Did not rotate any existing recovery secrets.
- Did not modify `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`.

## Staging Smoke Result

Command:

```bash
cd apps/web && corepack pnpm run qa:recovery-link:smoke
```

Result: passed.

Evidence:

- staging health: preview / staging / commit `5e162848746c`
- result analyze: passed
- result-page checkout CTA: passed
- checkout-start page: passed
- runtime operator recovery-link smoke: passed
- recovery link created: true
- resolver status: passed
- invalid-link safety: passed
- cleanup: revoked
- paid result render marker: true
- production disabled check: passed

No raw `prl_`, token hash, raw `pa_`, raw `pcs_`, tokenized URL, raw Email, LINE ID, source input, provider payload, or secret value was printed.

## Production Safety

- Production payment runtime remains disabled.
- Production checkout route returned 404 / `not_found`.
- Production fake-paid route returned 404 / `not_found`.
- Production recovery-link smoke route returned 404.
- Production env was not modified.
- Production DB migration was not applied.
- No Email or LINE message was sent.

## Validation

- `cd apps/web && corepack pnpm lint`: passed.
- Targeted tests: `cd apps/web && corepack pnpm exec vitest run src/tests/operator-recovery-link-smoke-route.test.ts src/tests/recovery-link-smoke-qa.test.ts src/tests/feature-flags.test.ts`: passed.
- `cd apps/web && corepack pnpm test`: passed before final script-only fixes; final full validation is captured in completion summary.
- `cd apps/web && corepack pnpm build`: passed before final script-only fixes; final full validation is captured in completion summary.
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`: passed during investigation.
- `cd apps/web && corepack pnpm run qa:recovery-link:smoke`: passed after runtime endpoint deployment.

## Tech Debt Review

- New technical debt introduced: a Preview-only operator endpoint exists and must stay gated.
- Existing technical debt observed: repeated QA scripts duplicate result creation and checkout-start checks.
- Opportunistic cleanup completed: runtime smoke mode removes the need to pull sensitive recovery link token secrets locally.
- Deferred cleanup candidates: extract shared no-card result creation/checkout verification utilities if more QA scripts are added.

## Suggested Next Steps

1. Keep `ENABLE_OPERATOR_RECOVERY_LINK_SMOKE` Preview(staging)-only; do not enable in Production.
2. Proceed to Email Recovery Link Sending v0, because valid recovery link creation/resolution is now staging-proven.
3. Alternatively proceed to LINE Recovery CTA Wiring v0 if owner wants LINE recovery proof before Email sending.

