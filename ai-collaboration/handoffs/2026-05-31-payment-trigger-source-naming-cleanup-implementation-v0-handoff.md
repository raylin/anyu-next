# Payment Trigger Source Naming Cleanup Implementation v0 Handoff

## Date

2026-05-31

## Task

Implement the trigger source naming cleanup with backward compatibility:

- New NewebPay paid generation jobs should use `newebpay_notify`.
- Legacy `payment_success_future` must remain accepted.
- No DB migration or historical row rewrite.

## Context

Payment Trigger Source Naming Cleanup Plan v0 found:

- `payment_success_future` is active runtime metadata for NewebPay-created `generation_jobs.trigger_source`.
- Queue payloads already use `newebpay_notify`.
- `generation_jobs.trigger_source` is a text column, not a DB enum.
- TypeScript allow-list validation means old values must remain accepted.
- Existing staging rows likely contain `payment_success_future` from sandbox E2E.

## Constraints

- No production runtime enablement.
- No production flag, Vercel env, deploy, or real payment changes.
- No DB migration or data rewrite.
- No provider behavior change beyond trigger-source metadata.
- Do not remove legacy trigger source support.
- Do not change public copy or Module 02.
- Do not commit secrets or private values.

## Planned Work

1. Add `newebpay_notify` to generation job trigger source allow-list/types.
2. Keep `payment_success_future` as legacy accepted value.
3. Change NewebPay NotifyURL delivery creation to use `generationJobTriggerSource: "newebpay_notify"`.
4. Update tests for new value and legacy compatibility.
5. Update current docs/dashboard summary if helpful.
6. Run lint, targeted tests, full tests, and build.

## Git Note

Local `origin/staging` tracking ref is stale due the known `.git` metadata permission issue. Remote push must be verified with `git ls-remote`.
