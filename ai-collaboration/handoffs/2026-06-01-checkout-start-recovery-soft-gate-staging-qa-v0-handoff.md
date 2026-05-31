# Checkout-Start Recovery Soft Gate Staging QA v0 Handoff

Date: 2026-06-01

## Task

Run staging QA for the checkout-start recovery soft gate and Email recovery capture added in commit `61626dd`.

## Scope

- Confirm staging freshness and checkout-start recovery soft gate presence.
- Verify recovery secret presence by name only.
- Create a fresh staging Module 01 result.
- Verify checkout-start recovery UI, skip acknowledgement, and secret-safe HTML.
- Submit fake Email recovery save and verify sanitized DB state.
- Run no-card result checkout QA regression.
- Confirm production remains fail-closed and production DB migration remains gated.

## Guardrails

- Do not enable production payment runtime.
- Do not modify production env.
- Do not apply production DB migration.
- Do not run real payments or use real cards.
- Do not send Email or LINE push.
- Do not print raw Email, LINE identifiers, encrypted contact values, hashes, secrets, raw `pa_`, or raw `pcs_`.
- Do not change NewebPay provider behavior.

## Planned Validation

If no code changes:

- docs presence check
- secret/private scan
- `git diff --check`
If code changes unexpectedly:

- app lint/test/build
