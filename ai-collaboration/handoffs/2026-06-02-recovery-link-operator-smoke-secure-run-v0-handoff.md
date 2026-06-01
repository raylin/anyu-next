# Recovery Link Operator Smoke Secure Run v0 Handoff

Date: 2026-06-02

## Task

Run `qa:recovery-link:smoke` from a secure operator session with matching Preview(staging) `DATABASE_URL`, `OPERATOR_TEST_SECRET`, and `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`.

## Scope

- Secure QA run and documentation.
- Preview(staging)-only env alignment if a required secret is missing.
- No production env, DB, or runtime changes.

## Constraints

- Do not enable production payment runtime.
- Do not modify production env.
- Do not apply production DB migrations.
- Do not send Email or LINE messages.
- Do not expose raw `prl_`, token hashes, raw `pa_`, raw `pcs_`, tokenized URLs, raw user input, provider payloads, secret values, or secret derivatives.
- Do not rotate existing recovery secrets unless explicitly instructed.

## Planned Work

1. Check local QA env presence with `qa:env:preflight recovery-link-smoke`.
2. Check Preview(staging) env name presence without values.
3. If a required Preview(staging) secret is missing, generate and set a branch-scoped Preview(staging)-only value.
4. If existing Preview(staging) secret exists, do not rotate it.
5. Run `qa:recovery-link:smoke` if a secure local matching secret is available.
6. Document pass or safe blocked status.

## Expected Deliverables

- Execution report.
- Summary log update.
- Dashboard update if smoke status changes.
- Commit and staging push for docs/status changes.

