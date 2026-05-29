# Rerun Authorized Staging Fake Paid Delivery QA after PAID_ACCESS_TOKEN_HASH_SECRET v0 Handoff

## Task
Rerun the secret-safe authorized staging fake-paid QA runner after `PAID_ACCESS_TOKEN_HASH_SECRET` was configured for Vercel Preview/Staging and staging was redeployed.

## Scope
- QA / verification / documentation only.
- No NewebPay checkout, notify, or return implementation.
- No payment runtime enablement.
- No production flag changes.
- No queue trigger, LINE delivery, prompt/result, or public legal/provider-review copy changes.

## Safety Rules
- Do not print or record `OPERATOR_TEST_SECRET`, `INTERNAL_JOB_SECRET`, or `PAID_ACCESS_TOKEN_HASH_SECRET`.
- Do not commit raw `pa_` tokens, tokenized URLs, raw user input, or private values.
- Use only sanitized runner output in reports.

## Expected Checks
- Staging health marker passes.
- Fake-paid missing/invalid secret gates pass.
- Invalid synthetic `pa_` check passes.
- Source analyze/result and legacy unlock checks pass.
- Authorized fake-paid first call no longer returns HTTP 500.
- Fake-paid creates/reuses payment intent, entitlement, generation job, and in-memory paid access token.
- Idempotency check passes.
- Paid-result status polling works.
- Processor/manual completion works if `INTERNAL_JOB_SECRET` is valid.
- `pa_` unlock route renders completed paid result.

## Deliverables
- QA result report.
- Summary log update.
- Follow-up handoff only if a blocker requires implementation.
