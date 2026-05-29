# Staging Operator Fake-Paid Env Setup Runbook + Preflight v0 Handoff

## Task
Create a safe staging-only environment setup runbook and preflight checklist for enabling operator fake-paid QA.

## Context
Staging fake paid delivery QA has been blocked twice because `POST /api/operator/fake-paid-success` returns the feature-disabled `404` response. The implementation exists and staging is fresh, but `ENABLE_OPERATOR_FAKE_PAID_SUCCESS` is not active on staging.

## Scope
- Documentation and preflight guidance only.
- No code changes.
- No Vercel environment changes from this session.
- No production changes.
- No payment runtime or NewebPay behavior changes.

## Safety Rules
- Do not commit or print `OPERATOR_TEST_SECRET`, `INTERNAL_JOB_SECRET`, `CRON_SECRET`, provider credentials, raw `pa_` tokens, tokenized URLs, raw user input, or private values.
- Keep fake-paid setup staging/preview only.
- Keep production fake-paid disabled.
- Keep payment runtime disabled.

## Deliverables
- Runbook/report: `ai-collaboration/reports/2026-05-29-staging-operator-fake-paid-env-setup-runbook-preflight-v0.md`
- Summary log update: `ai-collaboration/summaries/summary_log.md`
- Commit and push to `origin/staging`.
