# Deep Debug Processor Auth 401 with Secret-Safe Diagnostics v0

## Summary
Added a secret-safe diagnostic mode for processor auth failures so the next authorized fake-paid QA run can distinguish whether the persistent processor `401 unauthorized` is caused by a missing Authorization header, wrong scheme, missing runtime secret config, secret mismatch, or another gate.

The processor auth contract after inspection is:

```text
POST /api/internal/jobs/process
Authorization: Bearer <INTERNAL_JOB_SECRET>
Content-Type: application/json
```

The route reads `INTERNAL_JOB_SECRET` first and falls back to `CRON_SECRET`. The paid-generation processor flag is checked only after auth passes.

No payment runtime, NewebPay, queue trigger integration, LINE delivery, production flag, prompt/result, public legal copy, raw `pa_` token, tokenized URL, secret value, or private data behavior was changed.

## Root Cause Status
The exact production/staging-side root cause is not proven yet because Codex does not have the owner/operator secrets and did not run authorized QA.

What is now known:

- The runner targets `https://staging.anyu.tw`.
- The runner sends `Authorization: Bearer ${process.env.INTERNAL_JOB_SECRET}`.
- The route expects the `Authorization` header and compares the bearer token to `INTERNAL_JOB_SECRET` or `CRON_SECRET` after trimming whitespace.
- A processor `401` means auth did not match before the processor flag was evaluated.
- `ENABLE_PAID_GENERATION_PROCESSOR` is an additional required gate, but if it is missing/false after auth succeeds, the expected response is `403 processor_disabled`, not `401`.

## Processor Route Auth Implementation
Files inspected:

- `apps/web/src/app/api/internal/jobs/process/route.ts`
- `apps/web/src/lib/runtime/internal-job-auth.ts`
- `apps/web/src/lib/runtime/feature-flags.ts`
- `apps/web/src/tests/internal-job-auth.test.ts`
- `apps/web/src/tests/paid-generation-processor-route.test.ts`

Route check order:

1. DB configured, otherwise `503 config_error`.
2. Internal job secret configured, otherwise `503 config_error`.
3. Authorization bearer token authorized, otherwise `401 unauthorized`.
4. `ENABLE_PAID_GENERATION_PROCESSOR=true`, otherwise `403 processor_disabled`.
5. Valid payload and processor execution.

Secret source order:

1. `INTERNAL_JOB_SECRET`
2. `CRON_SECRET`

## Diagnostics Added
Added `diagnoseInternalJobAuthorization()` in `apps/web/src/lib/runtime/internal-job-auth.ts`.

Added an optional route diagnostic response for unauthorized processor requests only when:

- `VERCEL_ENV !== "production"`, and
- request header `x-processor-auth-diagnostic: 1` is present, and
- the request is unauthorized.

The diagnostic fields are safe categories/booleans only:

```json
{
  "authHeaderPresent": true,
  "authHeaderScheme": "bearer",
  "internalJobSecretConfigured": true,
  "internalJobSecretConfiguredSource": "INTERNAL_JOB_SECRET",
  "bearerTokenPresent": true,
  "authMatched": false,
  "additionalGateConfigured": true,
  "rejectionReason": "secret_mismatch"
}
```

Allowed rejection reasons:

- `missing_auth_header`
- `invalid_scheme`
- `missing_secret_config`
- `secret_mismatch`

Diagnostics intentionally do not include:

- secret value
- header value
- token value
- secret length
- header length
- prefix or suffix
- hash
- raw env dump
- timing details

Production mode does not expose diagnostic details even if the diagnostic header is sent.

## Runner Update
Updated `apps/web/scripts/authorized-fake-paid-qa.mjs` so processor requests include:

```text
x-processor-auth-diagnostic: 1
```

If processor completion still returns `401`, the runner records the safe `authDiagnostic` object from the route response.

Existing runner output remains sanitized. It still does not print or persist secrets, raw `pa_` tokens, tokenized URLs, raw input, provider output, LINE IDs, or private values.

## Expected Owner/Operator Output if 401 Persists
If the owner/operator reruns the QA after deploying this commit and processor auth still returns `401`, the sanitized runner output should include `authDiagnostic` under `processor_manual_completion`.

Examples:

```json
{
  "step": "processor_manual_completion",
  "outcome": "fail",
  "httpStatus": 401,
  "processorEndpointPath": "/api/internal/jobs/process",
  "processorAuthHeaderUsed": true,
  "processorAuthMode": "authorization_bearer_internal_job_secret",
  "authDiagnostic": {
    "authHeaderPresent": true,
    "authHeaderScheme": "bearer",
    "internalJobSecretConfigured": true,
    "internalJobSecretConfiguredSource": "INTERNAL_JOB_SECRET",
    "bearerTokenPresent": true,
    "authMatched": false,
    "additionalGateConfigured": true,
    "rejectionReason": "secret_mismatch"
  },
  "error": "unauthorized"
}
```

Interpretation examples:

- `authHeaderPresent: false`: Authorization header is not reaching the route.
- `authHeaderScheme: other`: Header is present but not recognized as Bearer.
- `internalJobSecretConfigured: false`: staging runtime cannot see `INTERNAL_JOB_SECRET` or `CRON_SECRET`.
- `internalJobSecretConfiguredSource: CRON_SECRET`: route is using fallback secret, not `INTERNAL_JOB_SECRET`.
- `authMatched: false` and `rejectionReason: secret_mismatch`: the bearer token does not match the active staging secret.
- `additionalGateConfigured: false` with auth matched would lead to `403 processor_disabled`, not `401`.

## Files Changed
- `apps/web/src/lib/runtime/internal-job-auth.ts`
- `apps/web/src/app/api/internal/jobs/process/route.ts`
- `apps/web/scripts/authorized-fake-paid-qa.mjs`
- `apps/web/src/tests/internal-job-auth.test.ts`
- `apps/web/src/tests/paid-generation-processor-route.test.ts`
- `ai-collaboration/handoffs/2026-05-30-deep-debug-processor-auth-401-secret-safe-diagnostics-v0-handoff.md`
- `ai-collaboration/reports/2026-05-30-deep-debug-processor-auth-401-secret-safe-diagnostics-v0.md`
- `ai-collaboration/summaries/summary_log.md`

## Validation Results
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm vitest run src/tests/internal-job-auth.test.ts src/tests/paid-generation-processor-route.test.ts`: passed, 2 files / 11 tests.
- `cd apps/web && corepack pnpm test`: passed, 43 files / 293 tests.
- `cd apps/web && corepack pnpm build`: passed.
- `cd apps/web && corepack pnpm run qa:fake-paid` without secrets: safely blocked with `operator_secret_missing`; route preflight passed and no authorized path was attempted.

## Security / Privacy
- No `OPERATOR_TEST_SECRET`, `INTERNAL_JOB_SECRET`, or `PAID_ACCESS_TOKEN_HASH_SECRET` values were printed or recorded.
- No raw `pa_` token or tokenized URL was printed or recorded.
- No secret value, header value, token value, secret length, prefix, suffix, hash, or raw env dump is exposed by diagnostics.
- Production mode suppresses diagnostic detail.

## Tech Debt Review
### New Technical Debt Introduced
A temporary diagnostic mode now exists on the internal processor route for non-production unauthorized requests with an explicit diagnostic header. It is intentionally safe but should be removed or retained only if operationally useful after QA stabilizes.

### Existing Technical Debt Observed
Processor secret synchronization between local QA shell and Vercel Preview/Staging is still manual and opaque without a safe readiness endpoint.

### Opportunistic Cleanup Completed
Added reusable internal-job auth diagnostics and tests for secret-safe output.

### Deferred Cleanup Candidates
- Add a dedicated operator-gated readiness endpoint for fake-paid/processor env booleans.
- Add a non-secret staging preflight runner separated from the full secret-dependent QA runner.
- Remove diagnostic mode after the processor auth issue is resolved if it is no longer needed.

## Recommended Next Step
Deploy this commit to staging, then owner/operator reruns:

```bash
cd apps/web
corepack pnpm run qa:fake-paid
```

with `OPERATOR_TEST_SECRET` and `INTERNAL_JOB_SECRET` exported securely. If processor still returns `401`, paste only the sanitized `processor_manual_completion` line including `authDiagnostic`.
