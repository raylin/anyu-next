# Entitlement / Payment Intent Uniqueness Migration Plan v0 Handoff

## Date

2026-05-31

## Task

Plan a safe DB-level uniqueness strategy for `payment_intent -> entitlement` and related paid delivery artifacts without applying migrations or changing runtime behavior.

## Context

- NewebPay sandbox E2E v5 passed.
- NotifyURL paid transition, paid delivery artifacts, Vercel Queues, paid access render, and manual fallback are proven.
- Production payment runtime remains disabled.
- Trigger source naming cleanup is complete.
- Current technical debt: `entitlements.payment_intent_id` uniqueness is service-level only.

## Constraints

- Planning/schema audit only.
- Do not apply DB migrations.
- Do not query or print sensitive DB data.
- Do not change runtime behavior, production flags, Vercel env, or deploy.
- Do not run real payments.
- Do not rewrite DB rows.
- Do not commit secrets or private values.

## Planned Work

1. Audit schema/migrations/helpers for payment intents, entitlements, paid access token hashes, generation jobs, and indexes.
2. Audit runtime idempotency in paid delivery artifacts, NotifyURL, fake-paid, entitlement helpers, and generation job helpers.
3. Document data preflight SQL checks without running them.
4. Recommend DB uniqueness/index strategy.
5. Plan migration, rollback, staging gate, production gate, and tests.
6. Write report and summary log entry.
7. Run docs validation, commit, and push.

## Git Note

Local `origin/staging` tracking ref is stale due the known `.git` metadata permission issue. Remote push must be verified with `git ls-remote`.
