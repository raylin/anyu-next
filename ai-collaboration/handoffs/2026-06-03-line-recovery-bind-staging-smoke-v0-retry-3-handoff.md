# LINE Recovery Bind Staging Smoke v0 Retry 3 Handoff

Date: 2026-06-03

## Task

Rerun owner-assisted Preview(staging) LINE recovery bind smoke after the legacy LIFF entry recovery-state handoff fix at commit `2de568380081bf05ecca4d598d9f5649bdd4b7ab`.

## Scope

- Confirm Preview(staging) serves `2de568380081bf05ecca4d598d9f5649bdd4b7ab` or newer.
- Run automated staging regressions:
  - `qa:result-checkout:no-card`
  - `qa:recovery-link:smoke`
- Verify checkout-start LINE recovery CTA uses LIFF entry URL.
- Verify `/line/fulfill` compatibility routes recovery `rlb_` state to recovery UI while preserving legacy fulfillment for non-recovery state.
- Support owner-assisted LINE mobile retry.
- Verify sanitized staging DB result if owner-assisted bind succeeds.
- Document outcome and update summary/dashboard if status changes.

## Constraints

- Do not enable production payment runtime.
- Do not modify production flags, env, or DB.
- Do not run real production payments.
- Do not send LINE messages or Email.
- Do not implement membership/login or Module 02.
- Do not expose raw `pa_`, `pcs_`, `prl_`, `rlb_`, LINE user IDs, LINE hashes, provider payloads, or private result content.
- Do not reuse legacy unlock/fulfillment semantics for recovery.

## Expected Output

- Execution report under `ai-collaboration/reports/`.
- Summary log update.
- Dashboard update if LINE recovery status changes.
- Commit and push to `origin/staging` if validation and safety checks pass.
