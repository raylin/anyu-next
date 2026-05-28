# Paid Generation Job Foundation Phase 1 — DB Schema + Repository Seams v0 Review Bundle

Date: 2026-05-27

## 1. Summary

Implemented additive Phase 1 foundations for future durable paid-analysis jobs:

- new `generation_jobs` migration
- Drizzle schema definition
- TypeScript constants and allowed values
- repository helpers for create/reuse and future processor lifecycle transitions
- synthetic unit tests

No runtime route was switched to enqueue jobs, no processor was added, and existing paid generation/LINE/payment behavior remains unchanged.

## 2. Migration / Schema

Added `apps/web/drizzle/0006_generation_jobs.sql`.

Table: `generation_jobs`.

Key columns:

- job identity: `id`, `job_type`, `dedupe_key`
- lifecycle: `status`, `attempt_count`, `max_attempts`, `next_run_at`, `locked_at`, `locked_by`
- references: `input_ref_type`, `input_ref_id`, `output_ref_type`, `output_ref_id`
- trigger: `trigger_source`, `operator_test`
- diagnostics: `last_error_category`, `last_error_code`, `last_error_at`
- model/version metadata: `model_provider`, `model_name`, `prompt_version`, `schema_version`, `source`
- timestamps: `created_at`, `updated_at`

Indexes:

- unique `dedupe_key`
- `(status, next_run_at)`
- `(job_type, status, next_run_at)`
- `(input_ref_type, input_ref_id)`
- `(output_ref_type, output_ref_id)`
- `(module_slug, created_at)`
- `(trigger_source, created_at)`

## 3. Constants / Allowed Values

Implemented in `apps/web/src/lib/db/generation-jobs.ts`.

Job type:

- `paid_analysis`

Statuses:

- `queued`
- `processing`
- `retry_scheduled`
- `completed`
- `failed_final`

Trigger sources:

- `web_unlock`
- `line_bind`
- `short_code`
- `payment_success_future`
- `operator`

Ref types:

- input: `analysis_result`
- output: `analysis_paid_result`

## 4. Dedupe Key

Dedupe key shape:

```text
paid_analysis:{moduleSlug}:{analysisResultId}:{promptVersion}:{schemaVersion}
```

This prevents duplicate generation for the same result/prompt/schema while allowing future regeneration after prompt/schema version changes.

The builder validates each segment and does not include raw user input, LINE IDs, tokens, fulfillment codes, payment data, or provider output.

## 5. Repository Helpers

Added:

- `buildPaidAnalysisJobDedupeKey`
- `createOrReusePaidAnalysisJob`
- `getGenerationJobById`
- `getGenerationJobByDedupeKey`
- `markGenerationJobProcessing`
- `markGenerationJobCompleted`
- `markGenerationJobRetryScheduled`
- `markGenerationJobFailedFinal`
- `listDueGenerationJobs`

Attempt-count decision:

- `attempt_count` increments when a job is marked `processing`, because that is the point where a processor claim/attempt begins.

## 6. Privacy / Data Safety

The schema stores only refs, statuses, safe categories, trigger source, version/model metadata, and timestamps.

It does not store:

- raw input
- redacted input
- paid result JSON
- raw provider output
- LINE user IDs
- ID tokens
- short codes
- fulfillment codes
- unlock tokens
- tokenized URLs
- email
- secrets

## 7. Behavior Preservation

No existing runtime path imports or calls the new generation job repository.

Unchanged:

- paid-result request route behavior
- paid-result status route behavior
- LIFF bind behavior
- LINE webhook / short-code behavior
- pending poller behavior
- payment disabled state
- provider prompt/schema behavior
- event names

## 8. Tests Added

Added `apps/web/src/tests/generation-jobs.test.ts`.

Coverage:

- allowed values
- stable dedupe key
- unsafe dedupe segment rejection
- create/reuse behavior
- lookup helpers
- processing transition and attempt-count increment
- completed transition with paid-result output ref
- retry/final-failure transitions
- due-job listing
- serialized fixture privacy guard

## 9. Migration / Deployment Notes

This task creates the migration but does not apply it to production.

Recommended follow-up:

```text
Paid Generation Job Foundation Phase 1 Staging Migration Verification v0
```

Production migration requires separate explicit approval.

## 10. Known Limitations

- No runtime writes to `generation_jobs` yet.
- No processor or cron exists yet.
- No status API reads from `generation_jobs` yet.
- No stale-lock recovery exists yet.
- No entitlement/payment integration exists yet.

## 11. Recommended Next Step

Run staging migration verification for `0006_generation_jobs.sql`, then proceed to Phase 2 only after confirming staging schema and repository seams are safe.
