# Recovery Link Operator Smoke Helper v0 Handoff

Date: 2026-06-01

## Task

Add a secret-safe operator QA helper that can create an `operator_test` paid result recovery link for a staging paid result, verify `/r/[recoveryToken]` renders the paid result, and avoid exposing raw recovery tokens, hashes, paid access tokens, checkout session tokens, or private identifiers.

## Scope

- QA tooling and tests only.
- Prefer a local script over any public runtime endpoint.
- No Email/LINE sending.
- No production runtime, env, or DB changes.

## Constraints

- Do not enable production payment runtime.
- Do not set or rotate Vercel env.
- Do not apply production DB migrations.
- Do not run real production payments.
- Do not expose raw `prl_`, `pa_`, `pcs_`, token hashes, provider payloads, raw Email/LINE IDs, or tokenized URLs.
- Do not implement membership, Module 02, Email sending, or LINE push.

## Planned Work

1. Inspect existing result-page no-card QA tooling, recovery link helpers, `/r/[recoveryToken]` resolver, and env preflight.
2. Add a local `qa:recovery-link:smoke` script that:
   - rejects production hosts before requests or DB writes,
   - creates a fresh no-card paid result through the existing operator fake-paid path,
   - creates an `operator_test` recovery link in the staging DB using hash-only token storage,
   - keeps the raw `prl_` token only in local process memory,
   - fetches `/r/[recoveryToken]` internally and reports only sanitized results,
   - verifies invalid-token failure if practical,
   - deletes or revokes the operator test link after the smoke.
3. Add/update QA env preflight mode.
4. Add targeted tests for redaction, production rejection, token/hash non-output, and helper behavior.
5. Document implementation, validation, and staging smoke outcome.

## Expected Deliverables

- `apps/web` QA command for recovery link smoke.
- Targeted tests.
- Execution report.
- Summary log update.
- Dashboard update if recovery-link status changes.

