# Vercel Staging Deployment Alias Stability Audit v0 Handoff

## Task
Audit why `staging.anyu.tw` route-bundle freshness regressed after previously passing payment-foundation preflight checks.

## Scope
- Investigation, documentation, and minimal safe observability only.
- Do not run authorized fake-paid QA.
- Do not require or print `OPERATOR_TEST_SECRET` or `INTERNAL_JOB_SECRET`.
- Do not enable payment runtime or change production flags.
- Do not implement NewebPay checkout, notify, return, queue trigger, LINE delivery, prompt/result, or legal copy changes.

## Required Checks
- Local/source state and origin/staging state.
- Local build route output includes `/api/health`, `/api/operator/fake-paid-success`, and paid-result status routes.
- Live non-secret staging checks for health marker, fake-paid route presence, and invalid synthetic `pa_` behavior.
- Vercel alias/project/deployment checks if CLI access is available.

## Deliverables
- Execution report under `ai-collaboration/reports/`.
- Summary log update.
- Follow-up handoff only if implementation or manual remediation is needed.

## Safety
- Record only sanitized statuses, safe commit markers, route presence, and response categories.
- Do not record secrets, raw `pa_` tokens, tokenized URLs, provider credentials, raw user input, or private values.
