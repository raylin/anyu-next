# Handoff: Module 01 Operator Test Mode v0

Date: 2026-05-27

## Goal

Add a safe operator / QA test mode so the owner can repeatedly test Module 01 flows without constantly hitting the first analyze rate limit, especially on mobile where private browsing is inconvenient.

This is for controlled QA only. It must not weaken public abuse protections.

## Scope

- Add a safe operator test mode for Module 01.
- At minimum, allow operator test mode to bypass or significantly relax the first analyze rate limit.
- Mark all operator test requests/events so they can be excluded from analytics.
- Do not bypass provider hard limits.
- Do not bypass input validation.
- Do not bypass LINE webhook signature verification.
- Do not bypass LIFF ID token verification.
- Do not expose test mode to normal users.
- Do not change product prompts, schemas, paid generation behavior, LINE fulfillment behavior, payment, email, ads, or production launch posture.

## Security Requirements

1. Do not rely only on query params.
2. Require a secret or signed token, e.g. `OPERATOR_TEST_SECRET`.
3. Do not print or commit the secret.
4. If enabled in production, it must be explicit and secret-gated.
5. If no secret is configured, operator test mode must be disabled.
6. Invalid secret must behave like normal public traffic.

## Recommended v0

- Use request header secret for server/API tests: `x-operator-test-secret`.
- For mobile manual testing, document the header limitation for v0 unless a safe signed-link flow is implemented later.

## Behavior

- For analyze route: valid operator test bypasses or relaxes per-IP/per-device analyze rate limit while keeping validation and provider safety.
- For events: add safe metadata `operatorTest: true` and `testModeSource: "header"`.
- For analytics: operator events can be filtered out.
- Public behavior remains unchanged.

## Validation

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint
cd apps/web && corepack pnpm test
cd apps/web && corepack pnpm build
cd apps/web && corepack pnpm test:e2e:local
```

## Commit

```bash
git commit -m "feat: add operator test mode"
git push origin HEAD:staging
```
