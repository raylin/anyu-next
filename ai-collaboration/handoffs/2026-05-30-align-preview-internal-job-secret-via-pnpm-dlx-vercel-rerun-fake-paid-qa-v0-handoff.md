# Align Preview INTERNAL_JOB_SECRET via corepack pnpm dlx vercel and Rerun Fake-Paid QA v0 Handoff

## Task
Use `corepack pnpm dlx vercel` from the local shell to align Vercel Preview `INTERNAL_JOB_SECRET`, redeploy Preview/Staging, and rerun the secret-safe fake-paid QA runner.

## Scope
- Vercel Preview env alignment, non-production redeploy, and QA rerun only.
- No Production env update or production deployment.
- No payment runtime enablement.
- No NewebPay checkout, notify, or return implementation.
- No Module 01 prompt/result, public legal/provider-review copy, queue trigger, or LINE delivery changes.

## Safety Rules
- Do not print `OPERATOR_TEST_SECRET`, `INTERNAL_JOB_SECRET`, or `PAID_ACCESS_TOKEN_HASH_SECRET`.
- Do not commit secrets, raw `pa_` tokens, tokenized URLs, raw input, or private values.
- Stop before env mutation if Vercel CLI auth/project context is unavailable or ambiguous.
- Stop before env mutation if `OPERATOR_TEST_SECRET` is missing locally.

## Planned Preflight
- Confirm local repo/branch/remote state.
- Confirm `corepack pnpm dlx vercel` availability and auth.
- Confirm Vercel Preview env/project context safely.
- Confirm local `OPERATOR_TEST_SECRET` presence as boolean only.

## Deliverables
- Execution report.
- Summary log update.
- Docs-only commit if blocked or after QA result is recorded.
