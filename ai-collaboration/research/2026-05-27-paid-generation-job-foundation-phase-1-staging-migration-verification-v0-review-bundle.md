# Paid Generation Job Foundation Phase 1 Staging Migration Verification v0 Review Bundle

Date: 2026-05-27

## 1. Summary

Staging migration verification passed for `0006_generation_jobs.sql` on the Neon `preview` branch used by `https://staging.anyu.tw`.

The migration is additive. Existing Module 01 staging routes continued to work, and normal runtime flows did not write to `generation_jobs`.

## 2. Staging Freshness

Staging `/api/health` returned:

- environment: `preview`
- gitCommit: `ccf2d906a97c`
- gitBranch: `staging`
- deploymentProvider: `vercel`
- versionSource: `env`

This confirms staging included the Phase 1 schema/repository commit before migration verification.

## 3. Migration Application

Applied only:

- `apps/web/drizzle/0006_generation_jobs.sql`

Target:

- Neon project: `anyu-next`
- branch: `preview`
- database: `neondb`

Production was not touched.

Before migration:

- `public.generation_jobs`: absent

After migration:

- `public.generation_jobs`: present

## 4. Schema Verification

Verified expected columns exist:

- `id`
- `job_type`
- `status`
- `priority`
- `module_slug`
- `input_ref_type`
- `input_ref_id`
- `output_ref_type`
- `output_ref_id`
- `trigger_source`
- `dedupe_key`
- `entitlement_ref_id`
- `attempt_count`
- `max_attempts`
- `next_run_at`
- `locked_at`
- `locked_by`
- `last_error_category`
- `last_error_code`
- `last_error_at`
- `model_provider`
- `model_name`
- `prompt_version`
- `schema_version`
- `source`
- `operator_test`
- `created_at`
- `updated_at`

Verified defaults:

- `status`: `queued`
- `priority`: `50`
- `attempt_count`: `0`
- `max_attempts`: `3`
- `next_run_at`: `now()`
- `operator_test`: `false`
- `created_at`: `now()`
- `updated_at`: `now()`

## 5. Index / Constraint Verification

Verified indexes:

- `generation_jobs_pkey`
- `generation_jobs_dedupe_key_idx`
- `generation_jobs_status_next_run_idx`
- `generation_jobs_type_status_next_run_idx`
- `generation_jobs_input_ref_idx`
- `generation_jobs_output_ref_idx`
- `generation_jobs_module_created_idx`
- `generation_jobs_trigger_created_idx`

The `dedupe_key` unique index is present.

## 6. Repository Smoke

Ran a staging-safe synthetic smoke using fixed synthetic UUIDs and no user data.

Verified:

- synthetic queued `paid_analysis` job insert succeeded
- duplicate dedupe insert created no second row
- processing transition set `status=processing`, incremented `attempt_count` to `1`, and set lock fields
- retry transition set `status=retry_scheduled` and safe error category
- final failure transition set `status=failed_final` and safe error category
- synthetic row cleanup succeeded

Final `generation_jobs` row count after synthetic smoke: `0`.

## 7. Runtime Regression Checks

Staging route/API regression results:

- landing route: `200`
- short input validation: `400 input_too_short`
- synthetic fresh analyze: `200 completed`
- result route: `200`
- unlock intent: `200`
- paid-result request: `200 completed`
- paid-result status: `200 completed`
- unlocked route: `200`
- LIFF bridge missing-context debug route: `200`
- invalid LIFF bind: `400 invalid_input`
- invalid LINE webhook signature: `401 invalid_signature`
- empty LINE webhook verification: `200`

No real LINE client smoke was run.

## 8. Runtime Write Verification

After the normal staging route/API checks:

- `generation_jobs` row count: `0`

This confirms Phase 1 did not introduce normal runtime writes to `generation_jobs`.

## 9. Privacy / Data Safety

Recorded only structural facts, safe status categories, HTTP status codes, and aggregate row counts.

No database URL, raw input, redacted text, result JSON, paid result JSON, provider output, LINE ID, ID token, message text, fulfillment code, short code, unlock token, tokenized URL, email, provider key, LINE secret, retention secret, cache secret, operator secret, or payment secret is included.

## 10. Issues Found

No P0 or P1 issues found.

P2 note:

- A first one-statement CTE repository smoke inserted the synthetic row but did not progress subsequent updates against that inserted row in the same statement snapshot. The synthetic row was immediately deleted, and the smoke was rerun successfully as separate statements inside one transaction.

## 11. Production Migration Recommendation

Production migration should remain pending.

Because `generation_jobs` is unused by runtime in Phase 1, production migration can be deferred until Phase 2 enqueue/status integration is imminent or explicitly approved.

## 12. Recommended Next Step

Proceed to either:

- Phase 2 enqueue/status integration plan, if design review is needed first.
- Production migration gate for `0006_generation_jobs.sql`, only if Phase 2 implementation is imminent and owner approves.
