# Debug Staging Processor Manual Completion 401 in Fake-Paid QA v0

## Summary
The fake-paid creation path is now working. The remaining failure is isolated to processor/manual completion authorization.

The processor endpoint and runner were inspected. They use the same auth contract:

- Endpoint path: `/api/internal/jobs/process`
- Header: `Authorization`
- Value format: `Bearer <INTERNAL_JOB_SECRET>`
- Server env lookup: `INTERNAL_JOB_SECRET`, with `CRON_SECRET` fallback

Because the runner received HTTP `401 unauthorized` rather than `503 config_error` or `403 processor_disabled`, the likely root cause is that the `INTERNAL_JOB_SECRET` exported in the owner/operator shell does not match the secret configured in the staging Vercel environment. Another possible env-side cause is that staging was not redeployed after changing `INTERNAL_JOB_SECRET`, but the current route bundle itself is fresh.

No authorized QA was rerun from Codex because this shell does not have the required secrets. No secrets, raw `pa_` tokens, tokenized URLs, raw input, provider output, LINE IDs, or private values were recorded.

## Processor Auth Contract
Implementation reviewed:

- `apps/web/src/app/api/internal/jobs/process/route.ts`
- `apps/web/src/lib/runtime/internal-job-auth.ts`
- `apps/web/src/tests/internal-job-auth.test.ts`
- `apps/web/src/tests/paid-generation-processor-route.test.ts`

Contract:

```text
POST /api/internal/jobs/process
Authorization: Bearer <INTERNAL_JOB_SECRET>
Content-Type: application/json
```

Payload used by runner:

```json
{
  "jobType": "paid_analysis",
  "limit": 1
}
```

Server checks in order:

1. DB configured; otherwise `503 config_error`.
2. Internal job secret configured; otherwise `503 config_error`.
3. Authorization bearer token matches `INTERNAL_JOB_SECRET` or `CRON_SECRET`; otherwise `401 unauthorized`.
4. `ENABLE_PAID_GENERATION_PROCESSOR=true`; otherwise `403 processor_disabled`.
5. Valid processor payload; otherwise `400`.

## Runner Behavior
Implementation reviewed:

- `apps/web/scripts/authorized-fake-paid-qa.mjs`

The runner already used:

```text
POST https://staging.anyu.tw/api/internal/jobs/process
Authorization: Bearer <in-memory INTERNAL_JOB_SECRET>
```

This matches the endpoint contract.

## Code Change
Added safe diagnostics to the runner's `processor_manual_completion` output:

```json
{
  "processorEndpointPath": "/api/internal/jobs/process",
  "processorAuthHeaderUsed": true,
  "processorAuthMode": "authorization_bearer_internal_job_secret"
}
```

These fields expose only the endpoint path and auth mode label. They do not expose the secret value, length, prefix, suffix, hash, or any derived value.

## Diagnosis
The observed runner output from the owner/operator showed:

```json
{"step":"processor_manual_completion","outcome":"fail","httpStatus":401,"error":"unauthorized"}
```

Given the route's check order, `401 unauthorized` means:

- the processor route exists,
- the processor route passed basic route/config presence far enough to check auth,
- the request did not match the configured internal job secret.

Most likely root cause:

```text
local INTERNAL_JOB_SECRET does not match the Preview/Staging INTERNAL_JOB_SECRET currently active in Vercel
```

Other plausible env-side causes:

- Preview/Staging was not redeployed after the intended `INTERNAL_JOB_SECRET` update.
- The owner/operator shell exported a different variable value than the Vercel Preview/Staging env value.
- Vercel Preview/Staging is using `CRON_SECRET` fallback instead of the intended `INTERNAL_JOB_SECRET`, and the local runner is sending a different value.

A code-side endpoint/header mismatch was not found.

## Owner / Operator Action Required
In Vercel UI, verify without exposing the value:

1. `INTERNAL_JOB_SECRET` exists in Preview/Staging scope.
2. The local shell's exported `INTERNAL_JOB_SECRET` is exactly the same value as Vercel Preview/Staging.
3. If the Vercel value was changed, redeploy staging after the env change.
4. Confirm `ENABLE_PAID_GENERATION_PROCESSOR=true` in Preview/Staging if processor completion is expected.
5. Keep production unchanged unless explicitly approved.

Then rerun locally:

```bash
cd apps/web
corepack pnpm run qa:fake-paid
```

Only paste sanitized runner output.

## Validation
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm vitest run src/tests/internal-job-auth.test.ts src/tests/paid-generation-processor-route.test.ts`: passed, 2 files / 6 tests.
- `cd apps/web && corepack pnpm test`: passed, 43 files / 288 tests.
- `cd apps/web && corepack pnpm run qa:fake-paid` without secrets: safely blocked with `operator_secret_missing`; route preflight passed and no authorized path was attempted.

No route code changed, so a full production build was not required for this runner-only diagnostics update.

## Security / Privacy
- No `OPERATOR_TEST_SECRET`, `INTERNAL_JOB_SECRET`, or `PAID_ACCESS_TOKEN_HASH_SECRET` values were printed or recorded.
- No raw `pa_` token or tokenized URL was printed or recorded.
- No raw input, provider output, `paid_result_json`, LINE ID, provider credential, or private value was recorded.
- The runner continues to keep paid access tokens only in memory for authorized checks.

## Tech Debt Review
### New Technical Debt Introduced
None significant. The runner now exposes safe auth-mode diagnostics for processor failures.

### Existing Technical Debt Observed
- Secret mismatch between local QA shell and Vercel env is hard to diagnose without a safe operator-side env comparison workflow.
- Processor QA depends on manually synchronized Preview/Staging secrets.

### Opportunistic Cleanup Completed
- Added safe runner diagnostics for processor endpoint path and auth mode.

### Deferred Cleanup Candidates
- Add an operator-gated readiness endpoint that returns safe booleans for processor flag and internal-job auth configuration, without exposing values.
- Add a runbook step for rotating/synchronizing `INTERNAL_JOB_SECRET` between local QA shell and Vercel Preview/Staging.

## Recommended Next Step
Owner/operator verifies `INTERNAL_JOB_SECRET` value parity between local shell and Vercel Preview/Staging, redeploys staging if the env changed, then reruns `cd apps/web && corepack pnpm run qa:fake-paid` and shares sanitized output for final QA recording.
