# Queue Trigger Integration Phase 4A: No-op/Test Adapter v0

Date: 2026-05-30

## Completed Work

- Added a disabled-by-default paid job queue trigger feature flag:
  - `ENABLE_PAID_JOB_QUEUE_TRIGGER`
  - `PAID_JOB_QUEUE_PROVIDER`
- Added `apps/web/src/lib/payments/paid-job-queue-trigger.ts` as the Phase 4A queue trigger abstraction.
- Implemented no external queue provider calls.
- Implemented provider modes:
  - `none`: fail-closed disabled behavior
  - `noop`: enabled no-op result for integration smoke
  - `test`: in-memory enqueued-style result for unit tests
- Wired the abstraction after paid delivery artifact creation in:
  - verified NewebPay NotifyURL service
  - operator fake-paid success service
- Left ReturnURL, payment status, payment access, paid-result status, pa_ unlock, processor, and cron routes unchanged.
- Added targeted tests for flag behavior, payload safety, NotifyURL integration, and operator fake-paid integration.

## Architecture Decisions

- Phase 4A uses DB references only in the queue trigger payload:
  - `paymentIntentId`
  - `generationJobId`
  - `moduleSlug`
  - `triggerSource`
- Queue trigger payloads do not include raw user input, raw `pa_` tokens, `pcs_` checkout session tokens, tokenized URLs, provider payloads, decrypted provider payloads, or queue credentials.
- Unknown queue providers resolve to `none`, which returns a safe disabled result rather than attempting work.
- `test` provider returns `enqueued` without contacting any external system. Real provider idempotency and delivery guarantees remain Phase 4B scope.
- Queue trigger failure handling remains non-blocking in design; Phase 4A adapters cannot produce real provider failures because no external provider is wired.

## Integration Points

| Integration point | Behavior |
| --- | --- |
| Verified NewebPay NotifyURL | After `payment_intent` is verified/paid and delivery artifacts exist, returns queue trigger category internally. |
| Duplicate NewebPay NotifyURL | Reuses delivery artifacts and returns queue trigger category without duplicating entitlement/job artifacts. |
| Operator fake-paid success | After fake-paid delivery artifacts exist, returns queue trigger category internally. |
| ReturnURL/status/access/unlock | Not wired. Remain read-only/non-mutating where already designed. |
| Processor route | Unchanged. Processor continues to fetch DB state as source of truth. |

## Feature Flags / Env Names

- `ENABLE_PAID_JOB_QUEUE_TRIGGER`: explicit truthy values enable Phase 4A trigger adapter selection.
- `PAID_JOB_QUEUE_PROVIDER`: accepted Phase 4A values are `noop` and `test`; missing or unknown values behave as `none`.

Expected defaults:

- Local development: disabled unless explicitly enabled for tests.
- Preview/Staging: disabled unless operator intentionally enables no-op/test smoke.
- Production: disabled by default; no production flag changes were made.

## Tests Added / Updated

- `apps/web/src/tests/paid-job-queue-trigger.test.ts`
- `apps/web/src/tests/feature-flags.test.ts`
- `apps/web/src/tests/newebpay-notify-service.test.ts`
- `apps/web/src/tests/operator-fake-paid-success.test.ts`

Coverage added:

- Queue trigger disabled by default.
- Unknown provider fails closed.
- No-op adapter returns safe payload.
- Test adapter returns in-memory `enqueued`.
- Payload contains only DB references and safe source metadata.
- Verified NotifyURL can return a no-op trigger result when explicitly enabled.
- Operator fake-paid can return a no-op trigger result when explicitly enabled.
- Existing default NotifyURL/fake-paid behavior remains disabled-compatible.

## Validation

- `cd apps/web && corepack pnpm vitest run src/tests/paid-job-queue-trigger.test.ts src/tests/newebpay-notify-service.test.ts src/tests/operator-fake-paid-success.test.ts src/tests/feature-flags.test.ts`: passed, 25 tests.
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed, 55 files / 341 tests.
- `cd apps/web && corepack pnpm build`: passed.

Python validation was not run because this task changed only the web payment queue trigger abstraction, web services, web tests, and collaboration docs.

## Blockers

- None for Phase 4A.

## Uncertainties

- Phase 4B still needs a provider decision and stricter env discipline before any real queue provider wiring.
- Provider-level enqueue idempotency and retry semantics are intentionally deferred.
- Whether operator fake-paid should surface queue trigger category in its HTTP response remains deferred; the service currently exposes it internally for tests/observability.

## Tech Debt Review

- New technical debt introduced: none significant; Phase 4A intentionally includes only no-op/test adapters.
- Existing technical debt observed: `payment_success_future` remains a legacy trigger-source name for real provider delivery jobs.
- Opportunistic cleanup completed: added explicit queue flag helper and isolated queue payload construction in one module.
- Deferred cleanup candidates:
  - Decide whether to rename or supplement `payment_success_future` before queue reporting expands.
  - Add real provider enqueue idempotency/tracking in Phase 4B.
  - Consider whether queue trigger categories should be persisted for operator support.

## Suggested Next Steps

1. Production Deployment Source-of-Truth Cleanup v0, if owner wants to reduce release/deployment workflow risk before more payment runtime work.
2. Queue Provider Selection / Phase 4B Plan v0, if owner wants to proceed directly toward QStash or another provider.
3. NewebPay sandbox E2E smoke plan, if provider sandbox credentials become available before queue wiring.
