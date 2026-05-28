# Paid Generation Job Foundation Phase 3A Processor Endpoint v0 Review Bundle

## 1. Summary

Implemented a secret-gated internal processor endpoint for `paid_analysis` generation jobs. The endpoint can recover stale locks, atomically claim due jobs, generate/store paid results through the existing paid-generation core, and return aggregate-only processor outcomes.

Phase 3A keeps current user-facing behavior unchanged. No request route was switched to enqueue-only, no Vercel Cron was added, and production was not enabled for the processor.

## 2. Processor Endpoint

- Added `POST /api/internal/jobs/process`.
- Supports only `jobType: "paid_analysis"`.
- Accepts `limit` clamped to a small bounded range.
- Supports `dryRun` for aggregate inspection without claiming jobs.
- Returns only aggregate counts: processed, completed, retry scheduled, failed final, stale recovered, skipped.
- Does not return job IDs, dedupe keys, input refs, output refs, tokens, provider output, or raw result payloads.

## 3. Security / Secret Handling

- Added `INTERNAL_JOB_SECRET` support with fallback to `CRON_SECRET`.
- Processor endpoint requires `Authorization: Bearer <secret>`.
- If no internal secret is configured, the endpoint denies access.
- Missing or invalid secret returns `401`.
- `ENABLE_PAID_GENERATION_PROCESSOR` gates execution and defaults off.
- Valid secret with processor flag disabled returns `403`.
- Staging-only secret and processor flag were configured for smoke verification.
- Production processor flag/secret were not configured.

## 4. Claim / Lock Helper

- Added atomic claim helper for due `paid_analysis` jobs.
- Claim query uses `FOR UPDATE SKIP LOCKED`.
- Claiming transitions due jobs to `processing`, increments attempt count, and records safe worker metadata.
- Claim ordering prioritizes higher priority, earlier next run, then earlier creation.

## 5. Stale Recovery

- Added stale lock recovery helper for `processing` jobs older than the configured threshold.
- Jobs below max attempts are returned to `retry_scheduled` with a safe retry category.
- Jobs at or above max attempts are moved to `failed_final`.
- Recovery returns aggregate counts only.

## 6. Paid Analysis Processing

- Processor loads the referenced analysis request/result from the queued job input.
- If a compatible completed paid result already exists, the processor marks the job completed without a provider call.
- Otherwise, the processor creates or updates the paid-result row to `processing`.
- It uses the shared paid-generation execution path to generate a schema-compatible paid result.
- Completed output is persisted to `analysis_paid_results` and the job is marked completed.

## 7. Retry / Backoff / Fallback

- Provider/retryable output errors schedule retry while attempts remain.
- Non-retryable or exhausted failures mark the job `failed_final`.
- Existing paid-generation fallback remains a fail-safe path.
- Fallback source is recorded as an aggregate/source category only, not as raw content.

## 8. Events / Metrics

- No new public analytics semantics were introduced.
- Processor responses are aggregate-only and exclude sensitive fields.
- No raw input, provider output, paid result JSON, tokenized URLs, LINE IDs, or secrets are logged or recorded in this review bundle.

## 9. Staging Verification

- Deployed current candidate to Vercel Preview and aliased it to `staging.anyu.tw`.
- Confirmed staging health route served the preview environment.
- Confirmed missing processor secret returned `401`.
- Confirmed production env listing did not include processor flag/secret names.
- Created one synthetic staging analysis result and one queued `paid_analysis` job.
- Called processor with the staging-only internal secret.
- Processor aggregate response: processed `1`, completed `1`, retry scheduled `0`, failed final `0`, skipped `0`, stale recovered `0`.
- Verified the job reached `completed` with provider source and an output reference present.
- Verified exactly one completed `analysis_paid_results` row for the synthetic result.
- Verified paid-result status returned `completed`.
- Verified the unlocked route returned `200` and rendered paid-content markers.
- Verified dry-run after processing returned zero work.

## 10. Production Safety

- Production was not deployed.
- Production processor feature flag was not enabled.
- Production internal job secret was not configured.
- Production request routes remain on the existing runtime behavior.

## 11. Tests Added

- Feature flag tests for `ENABLE_PAID_GENERATION_PROCESSOR`.
- Internal job auth tests for missing, invalid, and valid bearer secrets.
- Generation job claim and stale recovery helper tests.
- Paid-generation processor service tests for dry run, already-completed rows, provider success, fallback success, retry scheduling, and final failure.
- Processor route tests for auth, disabled flag, valid aggregate response, unsupported job type, and privacy-safe response shape.

## 12. Known Limitations

- Vercel Cron is intentionally not added in Phase 3A.
- Request routes still generate paid results directly or mirror jobs; they are not enqueue-only.
- Paid-generation execution logic is now shared for the processor, but `requestDeferredPaidGeneration` still contains adjacent direct-path orchestration that should be consolidated later to reduce drift.
- Staging disabled-flag behavior is covered by route tests; staging runtime was intentionally enabled for the smoke.

## 13. Recommended Next Step

Run Phase 3B to add the scheduled cron trigger and then decide, with explicit approval, whether to move any request path toward enqueue-first behavior.
