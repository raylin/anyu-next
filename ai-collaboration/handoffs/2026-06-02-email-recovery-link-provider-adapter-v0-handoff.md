# Email Recovery Link Provider Adapter Plan / Implementation v0 Handoff

Date: 2026-06-02

## Task

Add a real Email provider adapter path for recovery link Email delivery while preserving noop/test behavior and production safety.

## Scope

- Inspect current Email recovery link foundation.
- Recommend a v0 Email provider.
- Add provider adapter behind explicit env gates.
- Preserve safe recovery Email template constraints.
- Add tests for adapter success/failure, missing config, duplicate prevention, and no token/report leakage.
- Run validation and staging-safe QA.
- Document results.

## Constraints

- Do not enable production payment runtime.
- Do not modify production env.
- Do not apply production DB migrations.
- Do not send real production Email.
- Do not send LINE messages.
- Do not implement membership/login or Module 02.
- Do not expose raw `prl_`, `pa_`, `pcs_`, token hashes, provider payloads, raw input, or private identifiers.
- Do not include report content in Email.
- Do not commit provider secrets or private customer data.

## Planned Work

1. Inspect `email-recovery-link.ts`, recovery link helpers, completed-result save actions, env docs, and tests.
2. Verify provider API basics from official docs and recommend the lowest-risk v0 provider.
3. Implement adapter behind `EMAIL_PROVIDER=<provider>`, `EMAIL_FROM`, and provider API key env.
4. Keep noop/test default and fail closed when provider config is missing or send fails.
5. Add unit tests with mocked provider transport; no real Email in tests.
6. Run full validation plus recovery-link/no-card staging smoke.
7. Create report, update summary log/dashboard, commit, and push.
