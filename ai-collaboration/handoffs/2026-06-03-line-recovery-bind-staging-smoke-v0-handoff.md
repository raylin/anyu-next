# LINE Recovery Bind Staging Smoke v0 Handoff

Date: 2026-06-03

## Task

Run an owner-assisted Preview(staging) smoke for the LINE recovery bind path after visible LINE recovery CTAs were wired into checkout-start and completed-result recovery surfaces.

## Scope

- Verify Preview(staging) freshness for commit `0ebe9e98c0a1` or newer.
- Run automated staging regressions:
  - `qa:result-checkout:no-card`
  - `qa:recovery-link:smoke`
- Verify visible LINE CTA copy and `rlb_` state safety on checkout-start and, where accessible, completed result.
- Support owner-assisted LINE mobile LIFF bind smoke if feasible.
- Verify sanitized `payment_recovery_contacts` row state without printing raw LINE identifiers, hashes, tokens, provider payloads, or private report content.
- Document results and update summary/dashboard if status changes.

## Constraints

- Do not enable production payment runtime.
- Do not modify production flags, env, or DB.
- Do not apply production DB migration.
- Do not run real production payments.
- Do not send LINE messages or Email.
- Do not implement membership/login or Module 02.
- Do not expose raw `pa_`, `pcs_`, `prl_`, `rlb_`, LINE user IDs, LINE hashes, provider payloads, or private report content.
- Do not reuse legacy unlock/fulfillment semantics.

## Expected Output

- Execution report under `ai-collaboration/reports/`.
- Summary log update.
- Dashboard update if LINE recovery status changes.
- Commit and push to `origin/staging` if validation and safety checks pass.
