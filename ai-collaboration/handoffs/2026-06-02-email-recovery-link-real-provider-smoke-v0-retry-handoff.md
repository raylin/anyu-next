# Email Recovery Link Real Provider Smoke v0 Retry Handoff

Date: 2026-06-02

## Task

Configure branch-scoped Preview(staging) Resend env and send one controlled recovery Email smoke to `EMAIL_RECOVERY_TEST_RECIPIENT` from secure local env.

## Scope

- Confirm local `RESEND_API_KEY` and `EMAIL_RECOVERY_TEST_RECIPIENT` presence without values.
- Set Preview(staging)-only `EMAIL_PROVIDER=resend`, `EMAIL_FROM`, and `RESEND_API_KEY`.
- Redeploy staging.
- Run one controlled real Email recovery link smoke.
- Run recovery-link and no-card regression QA.
- Document results.

## Constraints

- Do not modify Production env.
- Do not enable production payment runtime.
- Do not apply Production DB migrations.
- Do not send production Email.
- Do not send LINE messages.
- Do not print raw Email, `prl_`, token hash, `pa_`, `pcs_`, tokenized URL, provider API key, provider payload, raw input, or report content.
- Do not commit secrets or private customer data.

## Planned Work

1. Load `apps/web/.env.local` through secure local scripts/process env.
2. Verify required env presence only.
3. Align branch-scoped Preview(staging) env names only.
4. Redeploy Preview(staging) and confirm health.
5. Create paid result through staging-safe no-card flow and save recovery Email to the configured recipient.
6. Verify sanitized DB/link state and provider send status without printing values.
7. Run regression QA commands.
8. Commit docs-only report and push.
