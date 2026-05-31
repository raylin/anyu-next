# Payment Trigger Source Naming Cleanup Implementation v0

Date: 2026-05-31

## Summary

Implemented the trigger source naming cleanup with backward compatibility:

- New NewebPay NotifyURL-created generation jobs now use `newebpay_notify`.
- Legacy `payment_success_future` remains accepted for existing rows.
- No DB migration or historical row rewrite was performed.
- Queue payload source names remain unchanged and DB-reference-only.

## Completed Work

- Added `newebpay_notify` to `GENERATION_JOB_TRIGGER_SOURCES`.
- Kept `payment_success_future` in the same allow-list as a legacy accepted value.
- Updated NewebPay NotifyURL delivery creation to pass `generationJobTriggerSource: "newebpay_notify"`.
- Added/updated tests for:
  - NewebPay NotifyURL delivery source metadata.
  - Legacy `payment_success_future` acceptance.
  - Processor compatibility for legacy-source jobs.
  - Queue payload behavior remaining unchanged.
  - Operator fake-paid behavior remaining unchanged.
- Updated the project dashboard tech-debt card.

## Runtime Behavior

Changed:

- Internal persisted trigger-source metadata for newly created NewebPay paid generation jobs.

Unchanged:

- Payment runtime flags.
- NewebPay verification/payment behavior.
- Payment intent transition behavior.
- Entitlement and paid access artifact behavior.
- Queue trigger payload shape.
- Queue consumer behavior.
- Operator fake-paid behavior.
- Existing database rows.

## Backward Compatibility

Existing `generation_jobs.trigger_source = "payment_success_future"` rows remain valid because:

- `payment_success_future` remains in `GENERATION_JOB_TRIGGER_SOURCES`.
- The processor claims jobs by job type/status/timing or exact `generationJobId`, not by trigger source.
- A regression test verifies targeted processor compatibility for a legacy-source job.

No DB migration is required because `trigger_source` is a plain text column and no DB enum/check constraint exists.

## Validation

- `cd apps/web && corepack pnpm test -- src/tests/generation-jobs.test.ts src/tests/newebpay-notify-service.test.ts src/tests/paid-delivery-artifacts.test.ts src/tests/paid-generation-processor.test.ts src/tests/paid-job-queue-trigger.test.ts src/tests/paid-job-queue-consumer.test.ts src/tests/operator-fake-paid-success.test.ts`: passed, 59 files / 375 tests
- `cd apps/web && corepack pnpm lint`: passed
- `cd apps/web && corepack pnpm test`: passed, 59 files / 375 tests
- `cd apps/web && corepack pnpm build`: passed

## Blockers

None.

## Uncertainties

- Existing staging DB row counts by trigger source were not queried. Compatibility is retained, so row count is not required for this implementation.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: historical rows and historical docs may continue to mention `payment_success_future`.
- Opportunistic cleanup completed: stale runtime metadata name replaced for new NewebPay-created jobs.
- Deferred cleanup candidates:
  - Optional reporting normalization if future dashboards need to group legacy/current provider notify source labels.
  - Optional DB data migration only if a future explicit audit/reporting requirement justifies rewriting historical metadata.

## Suggested Next Steps

1. Keep production payment runtime disabled until merchant approval and launch gate completion.
2. If operational reporting expands, add a display normalization helper that groups `payment_success_future` and `newebpay_notify` as provider NotifyURL-created jobs.
