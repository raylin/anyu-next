# Email Recovery Link Real Provider Smoke v0 Handoff

Date: 2026-06-02

## Task

Configure Preview(staging)-only Resend env and send one controlled recovery Email smoke to an owner-approved test address.

## Scope

- Verify Resend sender/API key/test recipient readiness from secure local env without printing values.
- Configure branch-scoped Preview(staging) env only if prerequisites are present.
- Redeploy Preview(staging) if env changes.
- Run a controlled staging Email recovery link smoke.
- Verify link resolution and regression QA.
- Document results.

## Constraints

- Do not enable production payment runtime.
- Do not modify Production env.
- Do not apply Production DB migrations.
- Do not send production Email.
- Do not send LINE messages.
- Do not expose raw `prl_`, token hash, raw Email, `pa_`, `pcs_`, tokenized URL, provider API key, provider payload, raw input, or report content.
- Do not commit provider secrets or private customer data.

## Planned Work

1. Inspect secure local env presence for `EMAIL_PROVIDER`, `EMAIL_FROM`, `RESEND_API_KEY`, and smoke recipient if available.
2. Stop if sender/domain/test recipient readiness cannot be confidently verified.
3. Align branch-scoped Preview(staging) env names only, with no values printed.
4. Redeploy staging only if env changes.
5. Run real Email smoke using a sanitized staging flow.
6. Run `qa:recovery-link:smoke` and `qa:result-checkout:no-card` regressions.
7. Create report, update summary/dashboard, commit, and push if docs changed.
