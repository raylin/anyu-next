# LINE Recovery Bind Staging Smoke v0 Retry 2 Handoff

Date: 2026-06-03

## Task

Rerun owner-assisted Preview(staging) LINE recovery bind smoke after the LIFF-entry URL fix at commit `0f0801d9b5c50f0a58046411c0f04c26ccf31690`.

## Scope

- Confirm Preview(staging) serves `0f0801d9b5c50f0a58046411c0f04c26ccf31690` or newer.
- Run automated staging regressions:
  - `qa:result-checkout:no-card`
  - `qa:recovery-link:smoke`
- Verify checkout-start LINE recovery CTA uses LIFF entry URL when `NEXT_PUBLIC_LINE_LIFF_URL` is configured.
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
- Do not reuse legacy unlock/fulfillment semantics.

## Expected Output

- Execution report under `ai-collaboration/reports/`.
- Summary log update.
- Dashboard update if LINE recovery status changes.
- Commit and push to `origin/staging` if validation and safety checks pass.
