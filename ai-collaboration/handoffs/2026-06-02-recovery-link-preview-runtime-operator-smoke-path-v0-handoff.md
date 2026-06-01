# Recovery Link Preview Runtime Operator Smoke Path v0 Handoff

Date: 2026-06-02

## Task

Add a Preview(staging)-only operator smoke path that creates and verifies paid result recovery links inside the Preview runtime, where `PAYMENT_RECOVERY_LINK_TOKEN_SECRET` already exists, without exposing raw recovery tokens or hashes locally.

## Scope

- Operator-only QA endpoint/script updates and tests.
- Preview(staging)-only env alignment for `ENABLE_OPERATOR_RECOVERY_LINK_SMOKE` if missing.
- No Email/LINE sending.
- No production runtime/env/DB changes.

## Constraints

- Do not enable production payment runtime.
- Do not modify production env.
- Do not apply production DB migration.
- Do not expose raw `prl_`, token hashes, `pa_`, `pcs_`, raw Email/LINE IDs, provider payloads, source input, or tokenized URLs.
- Do not rotate existing recovery secrets.
- Do not implement Module 02, membership, Email sending, or LINE push.

## Planned Work

1. Inspect existing operator fake-paid service, recovery link helpers, resolver, and smoke QA script.
2. Add `ENABLE_OPERATOR_RECOVERY_LINK_SMOKE` gate:
   - disabled by default,
   - production fail-closed,
   - requires `x-operator-test-secret`.
3. Add `POST /api/operator/recovery-link-smoke`.
4. Update `qa:recovery-link:smoke` to prefer Preview runtime mode and retain local DB mode as fallback/explicit mode.
5. Add/update env preflight and tests.
6. Align Preview(staging) env only if `ENABLE_OPERATOR_RECOVERY_LINK_SMOKE` is missing.
7. Run validation and staging smoke.
8. Document results and push to `origin/staging`.

