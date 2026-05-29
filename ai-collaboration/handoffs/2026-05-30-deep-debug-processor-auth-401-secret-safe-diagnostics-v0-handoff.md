# Deep Debug Processor Auth 401 with Secret-Safe Diagnostics v0 Handoff

## Task
Add or use secret-safe diagnostics to identify why `/api/internal/jobs/process` returns HTTP 401 during authorized fake-paid QA even after the owner/operator regenerated and synchronized `INTERNAL_JOB_SECRET` for Vercel Preview/Staging.

## Scope
- Processor auth diagnostics and minimal fix only.
- No payment runtime enablement.
- No NewebPay checkout, notify, or return endpoints.
- No public checkout UI, queue trigger integration, LINE delivery, refund tooling, production payment enablement, prompt/result, or public legal/provider-review copy changes.

## Safety Rules
- Do not print or record `OPERATOR_TEST_SECRET`, `INTERNAL_JOB_SECRET`, or `PAID_ACCESS_TOKEN_HASH_SECRET`.
- Do not record secret values, header values, token values, secret/header lengths, prefixes, suffixes, hashes, or timing details.
- Do not commit raw `pa_` tokens, tokenized URLs, raw input, or private values.

## Planned Work
- Inspect processor route, internal job auth helper, feature flags, runner, and tests.
- Add a safe unauthorized diagnostic response gated to non-production and explicit diagnostic header.
- Add runner support to request/record safe diagnostic categories when processor 401 persists.
- Add tests proving diagnostics are safe and production does not expose detail.
- Validate with lint, targeted tests, full tests, build, and no-secret runner.
