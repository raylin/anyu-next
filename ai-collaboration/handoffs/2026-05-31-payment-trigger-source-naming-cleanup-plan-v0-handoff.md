# Payment Trigger Source Naming Cleanup Plan v0 Handoff

## Date

2026-05-31

## Task

Audit current usage of `payment_success_future` and related trigger-source names, then recommend a safe cleanup/rename plan without changing runtime behavior.

## Context

- NewebPay sandbox E2E v5 passed end-to-end.
- Vercel Queues staging smoke and manual fallback passed.
- Module 01 paid CTA and legal copy are launch-aligned.
- Local QA env autoload and sandbox helper exist.
- Production payment runtime remains disabled.
- `payment_success_future` remains a stale placeholder-style trigger-source name and may be persisted or used in queue/test metadata.

## Constraints

- Planning/investigation only.
- Do not enable runtime behavior, production flags, Vercel env, deploy, or run real payments.
- Do not alter DB schema or data.
- Do not rename persisted values without a compatibility/migration plan.
- Do not implement Module 02 or public copy changes.
- Do not commit secrets or private values.

## Planned Work

1. Search source, tests, and docs for `payment_success_future`, trigger-source fields, and related source labels.
2. Inspect generation job helpers, paid delivery artifact service, notify service, fake-paid service, queue trigger/payload, processor, and tests.
3. Map current behavior and persistence risk.
4. Recommend naming replacement and compatibility strategy.
5. Create report and summary log entry.
6. Run documentation validation and commit/push docs.

## Initial Git Note

Local `origin/staging` tracking ref is stale because of the known `.git` metadata permission issue. Remote pushes should be verified with `git ls-remote`.
