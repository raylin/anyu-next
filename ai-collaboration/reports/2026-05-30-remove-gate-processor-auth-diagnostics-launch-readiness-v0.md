# Remove or Gate Processor Auth Diagnostics for Launch Readiness v0

Date: 2026-05-30

## Summary

Removed the temporary detailed auth diagnostics from the internal paid generation processor route.

Decision:

```text
Remove detailed deployed-route diagnostics entirely.
```

Reason:

- The diagnostics were added for a specific staging secret mismatch incident.
- Authorized fake-paid QA has passed.
- Phase 4 queue work should start from a launch-readier internal processor surface.
- The normal runner does not need diagnostic fields to classify pass/fail.

No payment runtime, queue behavior, NewebPay behavior, LINE behavior, public copy, Vercel env, or production flags were changed.

## Files Changed

- `apps/web/src/lib/runtime/internal-job-auth.ts`
- `apps/web/src/app/api/internal/jobs/process/route.ts`
- `apps/web/scripts/authorized-fake-paid-qa.mjs`
- `apps/web/src/tests/internal-job-auth.test.ts`
- `apps/web/src/tests/paid-generation-processor-route.test.ts`
- `ai-collaboration/handoffs/2026-05-30-remove-gate-processor-auth-diagnostics-launch-readiness-v0-handoff.md`
- `ai-collaboration/reports/2026-05-30-remove-gate-processor-auth-diagnostics-launch-readiness-v0.md`
- `ai-collaboration/summaries/summary_log.md`

## Diagnostics Removed

Removed from `apps/web/src/lib/runtime/internal-job-auth.ts`:

- `getInternalJobSecretSource(...)`
- `InternalJobAuthDiagnostic`
- `diagnoseInternalJobAuthorization(...)`

Removed from `POST /api/internal/jobs/process`:

- `x-processor-auth-diagnostic` handling.
- non-production diagnostic response path.
- `authDiagnostic` response payload.
- `additionalGateConfigured` diagnostic field.

Removed from the secret-safe fake-paid QA runner:

- `x-processor-auth-diagnostic: 1` request header.
- `authDiagnostic` output field.

## Final Processor 401 Behavior

Missing or invalid processor auth now always returns the same safe response:

```json
{
  "ok": false,
  "error": "unauthorized",
  "message": "Unauthorized processor request."
}
```

This behavior is the same in production and non-production.

The route still returns:

- `503 config_error` if DB or internal job secret is unavailable.
- `403 processor_disabled` if auth is valid but `ENABLE_PAID_GENERATION_PROCESSOR` is disabled.
- `400 invalid_json` for invalid JSON.
- `400 unsupported_job_type` for unsupported job type.
- aggregate-only processor result on valid authorized enabled requests.

## Security / Privacy Result

The processor route no longer exposes:

- secret values
- bearer values
- token values
- secret/header length
- prefix/suffix
- hashes
- raw env data
- auth match booleans
- auth header scheme
- configured secret source
- rejection reason details
- processor gate state in unauthorized responses

Tests still assert unauthorized responses do not contain configured secret, wrong secret, or secret length.

## Runner Compatibility

`apps/web/scripts/authorized-fake-paid-qa.mjs` still:

- checks secret presence without printing values
- sends `Authorization: Bearer <INTERNAL_JOB_SECRET>` when available
- reports processor endpoint path, header-used boolean, auth mode label, HTTP status, aggregate processor counts, and safe error category
- does not need diagnostic fields to pass/fail

Without secrets, the runner remains safely blocked after non-secret preflights:

```text
final_summary: blocked
reason: operator_secret_missing
exit code: 2
```

## Tests Updated

Updated tests:

- `internal-job-auth.test.ts` now covers only secret selection and exact bearer matching.
- `paid-generation-processor-route.test.ts` now verifies diagnostic headers are ignored and unauthorized responses never expose diagnostics.
- Production-mode diagnostic suppression is still covered by expecting the same safe 401 response.

## Validation

| Command | Result |
| --- | --- |
| `cd apps/web && corepack pnpm lint` | PASS |
| `cd apps/web && corepack pnpm vitest run src/tests/internal-job-auth.test.ts src/tests/paid-generation-processor-route.test.ts` | PASS, 2 files / 9 tests |
| `cd apps/web && corepack pnpm test` | PASS, 54 files / 333 tests |
| `cd apps/web && corepack pnpm build` | PASS |
| `cd apps/web && corepack pnpm run qa:fake-paid` without secrets | Expected safe blocked result, exit code 2 after non-secret preflight PASS |

## Tech Debt Review

### New Technical Debt Introduced

None.

### Existing Technical Debt Observed

- Phase 4 queue trigger remains unimplemented.
- `main` remains behind `staging` from the prior quality scan.
- Local `.git/FETCH_HEAD` permission issue remains from prior quality scan.
- Entitlement/payment intent uniqueness remains service-level plus DB index, not DB unique by `payment_intent_id`.

### Opportunistic Cleanup Completed

- Removed temporary processor auth diagnostic helper and response path.
- Removed QA runner dependency on diagnostic response fields.

### Deferred Cleanup Candidates

- Payment runtime env/flag matrix.
- Production deployment source-of-truth cleanup.
- Queue trigger Phase 4A no-op/test adapter.
- Entitlement uniqueness migration plan.

## Remaining Launch-Readiness Notes

- Internal processor is now launch-readier from an auth-response perspective.
- Keep manual processor route protected by `INTERNAL_JOB_SECRET` and `ENABLE_PAID_GENERATION_PROCESSOR`.
- Future queue trigger work should use its own signed/authenticated webhook contract and should not reintroduce detailed auth diagnostics in public responses.

## Recommended Next Step

Proceed with `Production Deployment Source-of-Truth Cleanup v0` or `Payment Runtime Env Flag Matrix v0` before Phase 4B queue provider wiring. If implementation velocity is prioritized, Phase 4A no-op/test adapter can proceed next because it should remain flag-off by default.
