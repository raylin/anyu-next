# Module 01 Operator Test Mode v0 Review Bundle

## 1. Summary

Added a secret-gated operator test mode for Module 01 analyze requests so controlled QA can avoid noisy first-analyze rate-limit false negatives.

The mode is server-side only in v0. It uses the `x-operator-test-secret` request header and is disabled unless `OPERATOR_TEST_SECRET` is configured in the target environment.

## 2. Activation Model

- Environment variable: `OPERATOR_TEST_SECRET`
- Request header: `x-operator-test-secret`
- Missing env, missing header, or invalid header behaves like normal public traffic.
- No query-only bypass or visible public UI was added.

## 3. Rate Limit Behavior

Valid operator test requests:

- skip the in-memory per-IP analyze limit
- skip the persisted per-session analyze limit
- continue to enforce the global daily analyze cap

Normal requests keep the existing rate-limit behavior.

## 4. Protections Preserved

- Input validation remains enforced before any bypass is applied.
- Relationship-content and prompt-injection guards remain enforced.
- Provider/model hard limits remain unchanged.
- LINE webhook signature verification is untouched.
- LIFF ID token verification is untouched.
- Product prompts, schemas, cache behavior, DB schema, paid generation, LINE fulfillment, payment, email, ads, and production launch posture are unchanged.

## 5. Event / Analytics Metadata

Operator events include only safe filter metadata:

- `operatorTest: true`
- `testModeSource: "header"`

No operator secret is recorded in events, responses, reports, or docs.

## 6. Tests Added

- Operator mode disabled when no env secret is configured.
- Operator mode requires the configured header secret.
- Operator event metadata is safe.
- Analyze route skips IP and session limits for valid operator mode.
- Missing/invalid operator credentials follow normal rate-limit behavior.
- Input validation still blocks invalid operator-mode analyze requests.
- Event metadata guard allows `operatorTest` and `testModeSource`.

## 7. Operational Notes

The production runbook now documents `OPERATOR_TEST_SECRET` as optional and explicitly approval-gated for production QA.

Mobile-friendly signed operator links were not implemented in v0. A future signed, short-lived mobile operator link would need separate approval because it broadens the activation surface.

## 8. Known Limitations

- Header-based v0 is easiest for server/API QA tooling, not manual mobile browser testing.
- Operator mode does not remove provider latency, provider errors, or global daily cap constraints.

## 9. Recommended Next Step

Use the header-gated mode for staging/server QA first. Only add production `OPERATOR_TEST_SECRET` if the operator explicitly approves controlled production QA usage.
