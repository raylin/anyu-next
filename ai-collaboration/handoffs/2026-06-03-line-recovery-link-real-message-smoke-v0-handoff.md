# LINE Recovery Link Real Message Smoke v0 Handoff

Date: 2026-06-03

## Task

Run a controlled Preview(staging) LINE recovery link message smoke to verify that an eligible LINE recovery contact receives a LINE message containing a safe `/r/` access link after paid result readiness.

## Scope

Preview(staging) smoke and minimal implementation/fix only if required. No Production LINE messages.

## Constraints

- Do not enable production payment runtime.
- Do not modify Production env.
- Do not apply Production DB migration.
- Do not send production LINE messages.
- Do not send unrelated LINE campaign messages.
- Do not expose raw LINE userId, encrypted recipient, recipient hash, raw `prl_`, token hash, `pa_`, or `pcs_`.
- Do not include report body or private analysis in LINE messages.
- Do not commit secrets or private customer data.

## Planned Checks

1. Inspect LINE sender, recipient-secret resolver, recovery-link helpers, and paid delivery hook.
2. Verify Preview(staging) LINE sender env-name readiness without printing values.
3. Choose the safest staging smoke path; add a narrow operator path only if the current hooks cannot prove same-context LINE send.
4. Send at most one controlled owner/test LINE message if env and recipient are available.
5. Verify `/r/` link opens paid result through owner-assisted or sanitized method.
6. Verify sanitized DB sent-state for LINE recovery link.
7. Run recovery-link and no-card regression QA.
8. Document results, update summary/dashboard, commit, and push to `origin/staging`.

## Expected Result

LINE real message send is staging-proven with link-only content and no token/private identifier exposure. If env or same-context tooling is missing, block safely and document the exact blocker.
