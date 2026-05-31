# Payment Trigger Source Naming Cleanup Plan v0

Date: 2026-05-31

## Summary

`payment_success_future` is still an active runtime generation-job trigger source for verified NewebPay NotifyURL paid delivery. It is not only historical documentation or tests. The queue trigger payload already uses the clearer `newebpay_notify`, but the persisted `generation_jobs.trigger_source` value created by NewebPay delivery artifacts remains `payment_success_future`.

Recommendation: rename runtime creation for verified NewebPay jobs to `newebpay_notify` in a small follow-up, but keep backward compatibility by allowing both `payment_success_future` and `newebpay_notify` in the generation job source allow-list. Do not migrate existing rows in v0; leave historical rows untouched.

## Source Search Scope

Searched:

- `payment_success_future`
- `triggerSource`
- `trigger_source`
- `payment_success`
- `newebpay_notify`
- `operator_fake`
- `operator_fake_paid`
- generation job source labels

Inspected:

- generation job DB helpers and schema
- paid delivery artifact service
- NewebPay NotifyURL service
- operator fake-paid service
- Vercel queue trigger and consumer code
- paid generation processor code
- tests
- historical reports/handoffs for context only

## Current Usage Map

### Runtime Code

| Area | Current value | Behavior |
| --- | --- | --- |
| `apps/web/src/lib/db/generation-jobs.ts` | `payment_success_future` | Included in `GENERATION_JOB_TRIGGER_SOURCES` allow-list. |
| `apps/web/src/lib/payments/newebpay/notify-service.ts` | `payment_success_future` | Used as `generationJobTriggerSource` when verified NewebPay NotifyURL creates/reuses paid delivery artifacts. |
| `apps/web/src/lib/payments/paid-delivery-artifacts.ts` | caller-provided | Persists the caller-provided generation job trigger source. |
| `apps/web/src/lib/payments/operator-fake-paid-success.ts` | `operator` | Operator fake-paid persisted generation job source remains separate. |
| `apps/web/src/lib/payments/paid-job-queue-trigger.ts` | `newebpay_notify` / `operator_fake_paid` | Queue trigger payload source enum already uses clear event-source names. |
| `apps/web/src/lib/payments/paid-job-queue-consumer.ts` | `newebpay_notify` / `operator_fake_paid` | Queue consumer validates payload source but processes by `generationJobId`. |

### Database / Persistence

- `generation_jobs.trigger_source` is a text column, not a DB enum.
- `generation_jobs_trigger_created_idx` indexes `(trigger_source, created_at)`.
- Runtime TypeScript validation enforces `GENERATION_JOB_TRIGGER_SOURCES`.
- Existing staging rows likely include `payment_success_future` because sandbox E2E v5 passed with the current source name.
- Existing production rows may include old foundation/test data depending on prior operator/internal activity, but production payment runtime remains disabled.

### Processor / Queue Behavior

- Generic processor claims due jobs by job type/status/timing, not trigger source.
- Targeted queue processor processes exact `generationJobId`, not trigger source.
- Queue payload source is already `newebpay_notify`; it does not reuse `payment_success_future`.
- Therefore, renaming the persisted trigger source should not affect processor selection if backward-compatible input creation is preserved.

### Tests

Active tests assert `payment_success_future` in:

- `apps/web/src/tests/generation-jobs.test.ts`
- `apps/web/src/tests/paid-delivery-artifacts.test.ts`
- `apps/web/src/tests/newebpay-notify-service.test.ts`

Queue tests already use:

- `newebpay_notify`
- `operator_fake_paid`

### User-Visible Surfaces

No user-facing UI copy appears to expose `payment_success_future`. The risk is operational/reporting clarity, test naming, and internal metadata consistency.

### Historical Docs

Historical reports and handoffs intentionally mention `payment_success_future` as earlier-phase context. These should not be rewritten.

## Risk Assessment

| Risk Area | Classification | Reason |
| --- | --- | --- |
| Docs-only rename | Low | Historical docs can remain untouched; new docs can explain the old name. |
| Tests/constants rename | Medium | Tests encode current runtime expectations and must be updated together. |
| Runtime creation rename | Medium | The DB column is text and processors do not filter by source, but runtime allow-list must accept the new value. |
| Existing DB rows | Medium | Existing rows may already contain `payment_success_future`; removing it from allow-list could break mapping/type assumptions. |
| DB migration / data rewrite | High / unnecessary now | Rewriting historical rows is not needed for launch and can obscure audit history. |

Overall risk: **medium** if implemented with compatibility; **high** if the old value is removed or existing rows are migrated without a clear audit need.

## Naming Recommendation

Recommended persisted generation job source for verified NewebPay NotifyURL delivery:

```text
newebpay_notify
```

Why:

- It matches the queue trigger payload source already in use.
- It is provider-specific enough to explain where the job came from.
- It avoids the stale “future” wording.
- It distinguishes real provider callback delivery from operator fake-paid.
- It is already accepted by queue-layer concepts and tests.

Rejected alternatives:

- `payment_notify`: too generic; loses provider context.
- `provider_notify`: generic but less useful for NewebPay-specific debugging.
- `verified_payment`: describes verification state but not the source/event.
- `payment_success`: better than current name, but still vague and overlaps with provider success status.
- `operator_fake_paid`: appropriate only for queue payload from fake-paid; persisted generation jobs already use `operator`.

## Compatibility / Migration Plan

Recommended implementation strategy:

1. Add `newebpay_notify` to `GENERATION_JOB_TRIGGER_SOURCES`.
2. Keep `payment_success_future` in the allow-list as a legacy accepted value.
3. Change `processNewebPayNotify` delivery artifact creation to pass `generationJobTriggerSource: "newebpay_notify"`.
4. Update tests to expect new NewebPay-created jobs to use `newebpay_notify`.
5. Add a regression test proving legacy `payment_success_future` is still accepted by `createOrReusePaidAnalysisJob`.
6. Do not migrate existing DB rows.
7. Do not change queue payload source names.
8. Do not change operator fake-paid persisted source in the same task unless explicitly scoped.

No DB migration is required because:

- `trigger_source` is plain text.
- No DB enum or CHECK constraint blocks the new value.
- Existing rows can remain as historical metadata.
- Processor behavior does not depend on the trigger source value.

Optional later cleanup:

- Add display/normalization helpers for reports if ops dashboards need “legacy provider notify” grouping.
- Consider DB data migration only if future reporting requires a single canonical value and a decision log approves it.

## Recommended Implementation Task

Task title:

```text
Payment Trigger Source Naming Cleanup Implementation v0
```

Scope:

- Add `newebpay_notify` as an accepted persisted generation-job trigger source.
- Keep `payment_success_future` accepted as legacy.
- Switch NewebPay NotifyURL delivery artifact creation to the new value.
- Update tests.
- No DB data migration.
- No production runtime enablement.

Likely files:

- `apps/web/src/lib/db/generation-jobs.ts`
- `apps/web/src/lib/payments/newebpay/notify-service.ts`
- `apps/web/src/tests/generation-jobs.test.ts`
- `apps/web/src/tests/paid-delivery-artifacts.test.ts`
- `apps/web/src/tests/newebpay-notify-service.test.ts`
- possibly docs/dashboard summary if current tech debt status changes

Tests to run:

- targeted generation job tests
- paid delivery artifact tests
- NewebPay notify service tests
- queue trigger/consumer tests to confirm payload source remains unchanged
- full `cd apps/web && corepack pnpm test`
- lint/build because runtime code changes

## Blockers

None for planning.

## Uncertainties

- Exact existing DB row counts by trigger source were not queried because this task is planning-only and DB inspection was not required.
- Production likely has no real provider rows because payment runtime remains disabled, but staging likely contains sandbox rows from v5.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: persisted NewebPay provider-paid generation jobs still use a stale placeholder-style source name.
- Opportunistic cleanup completed: risk and compatibility plan documented.
- Deferred cleanup candidates: optional reporting normalization if old/new values need grouped ops presentation later.

## Suggested Next Step

Proceed with `Payment Trigger Source Naming Cleanup Implementation v0` if the owner wants to remove this internal naming debt before production launch. Implement with legacy compatibility and no DB migration.
