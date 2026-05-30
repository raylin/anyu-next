# Payment Runtime Env / Feature Flag Matrix v0

Date: 2026-05-30

## Summary

This audit documents the current payment-runtime-related env vars, feature flags, route controls, and launch readiness classification for ANYU before Phase 4 queue trigger implementation.

No env values were read or changed. No code, runtime behavior, deployment, public copy, payment flags, queue behavior, LINE behavior, NewebPay behavior, prompts, or schemas were changed.

Bottom line:

- No P0 immediate safety issue was found while payment runtime remains disabled.
- Phase 4A can proceed if it stays flag-off/no-op by default.
- Before Phase 4B queue provider wiring, branch-scoped `Preview(staging)` env discipline must be treated as mandatory.
- Before production payment launch, separate checkout session secret, deployment source-of-truth cleanup, and entitlement uniqueness should be addressed.

## 1. Source Env / Flag Inventory

### Payment Runtime Feature Flags

| Name | Source | Type | Current role | Safe default |
| --- | --- | --- | --- | --- |
| `ENABLE_PAYMENT_RUNTIME` | `apps/web/src/lib/runtime/feature-flags.ts` | boolean flag | Top-level public payment runtime gate used by checkout route | absent/false |
| `ENABLE_NEWEBPAY_CHECKOUT` | `apps/web/src/lib/runtime/feature-flags.ts` | boolean flag | Enables NewebPay checkout creation route | absent/false |
| `ENABLE_OPERATOR_FAKE_PAID_SUCCESS` | `apps/web/src/lib/runtime/feature-flags.ts` | boolean flag | Enables operator fake-paid QA route | absent/false |
| `ENABLE_PAID_GENERATION_JOBS` | `apps/web/src/lib/runtime/feature-flags.ts` | boolean flag | Enables paid generation job status lookup in paid-result status/resolver paths | absent/false |
| `ENABLE_PAID_GENERATION_PROCESSOR` | `apps/web/src/lib/runtime/feature-flags.ts` | boolean flag | Enables internal paid generation processor execution | absent/false |

Boolean parsing accepts `1`, `true`, `yes`, and `on`, case-insensitive after trim.

### NewebPay Provider Config

| Name | Source | Type | Required for | Fail-closed behavior |
| --- | --- | --- | --- | --- |
| `NEWEBPAY_MERCHANT_ID` | `apps/web/src/lib/payments/newebpay/config.ts` | provider identifier | checkout + notify verification | missing provider config |
| `NEWEBPAY_HASH_KEY` | same | secret, 32 chars | checkout TradeInfo encryption + NotifyURL verification | missing/invalid provider config |
| `NEWEBPAY_HASH_IV` | same | secret, 16 chars | checkout TradeInfo encryption + NotifyURL verification | missing/invalid provider config |
| `NEWEBPAY_CHECKOUT_URL` | same | URL | checkout form action | missing provider config |
| `NEWEBPAY_NOTIFY_URL` | same | URL | checkout payload NotifyURL | missing provider config |
| `NEWEBPAY_ENVIRONMENT` | same | enum-ish string: `production`, `staging`, `sandbox`, otherwise `unknown` | metadata on payment intent | falls back to `unknown` |
| `NEXT_PUBLIC_APP_URL` | same + LINE config | public app origin URL | checkout ReturnURL base, app URL fallback | missing provider config for NewebPay |

### Paid Access / Session Token Config

| Name | Source | Type | Required for | Notes |
| --- | --- | --- | --- | --- |
| `PAID_ACCESS_TOKEN_HASH_SECRET` | `apps/web/src/lib/payments/paid-access-token.ts` | secret | hash-at-rest `pa_` token creation/lookup | missing fails delivery creation and resolver config |
| `PAYMENT_CHECKOUT_SESSION_SECRET` | `apps/web/src/lib/payments/payment-checkout-session.ts` | secret | preferred `pcs_` checkout session signing | falls back to `PAID_ACCESS_TOKEN_HASH_SECRET` |

### Operator / Processor / Cron

| Name | Source | Type | Required for | Notes |
| --- | --- | --- | --- | --- |
| `OPERATOR_TEST_SECRET` | `apps/web/src/lib/runtime/abuse-guard.ts` | secret | operator fake-paid and checkout while payment runtime off | sent as `x-operator-test-secret` |
| `INTERNAL_JOB_SECRET` | `apps/web/src/lib/runtime/internal-job-auth.ts` | secret | internal processor route auth | preferred over `CRON_SECRET` |
| `CRON_SECRET` | `apps/web/src/lib/runtime/cron-auth.ts`, `internal-job-auth.ts`, retention cleanup | secret | cron wrapper; fallback internal processor secret; fallback retention cleanup secret | fallback behavior can surprise operators |
| `RETENTION_CLEANUP_SECRET` | `apps/web/src/lib/runtime/retention-cleanup.ts` | secret | retention cleanup route | falls back to `CRON_SECRET` |

### Queue Trigger Placeholders

Not implemented in source as of this scan.

Planned names from Phase 4 plan:

- `ENABLE_PAID_JOB_QUEUE_TRIGGER`
- `PAID_JOB_QUEUE_PROVIDER`
- optional `ENABLE_OPERATOR_QUEUE_TRIGGER_QA`
- `QSTASH_TOKEN`
- `QSTASH_CURRENT_SIGNING_KEY`
- `QSTASH_NEXT_SIGNING_KEY`
- `PAID_JOB_QUEUE_ENDPOINT_URL`

These are planning placeholders only and should not be assumed live until Phase 4 implementation.

### LINE / Fulfillment-Adjacent Config

These exist today but are not part of NewebPay paid runtime launch:

- `NEXT_PUBLIC_LINE_ADD_URL`
- `NEXT_PUBLIC_LINE_LIFF_ID`
- `NEXT_PUBLIC_LINE_LIFF_URL`
- `LINE_LOGIN_CHANNEL_ID`
- `LINE_CHANNEL_SECRET`
- `LINE_CHANNEL_ACCESS_TOKEN`
- `FULFILLMENT_TOKEN_SECRET`

LINE webhook and fulfillment are implemented separately. LINE delivery for paid runtime remains out of scope.

### Public / Build / Health

- `VERCEL_ENV`
- `NODE_ENV`
- `VERCEL_GIT_COMMIT_SHA`
- `VERCEL_GIT_COMMIT_REF`
- `ANYU_BUILD_TIME`
- `VERCEL`
- `VERCEL_URL`
- `VERCEL_PROJECT_PRODUCTION_URL`

These are used for health/build marker or URL fallback only. Health sanitizes marker values.

### Database / AI / Abuse Guard

Payment routes require DB where they mutate/read persisted state:

- `DATABASE_URL`

AI generation and general app runtime:

- `ORADAR_PROVIDER`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`
- `ANTHROPIC_FAST_MODEL`
- `ANTHROPIC_FALLBACK_MODEL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `MODEL_STRATEGY`
- `ANALYSIS_CACHE_HASH_SECRET`

Abuse limits:

- `ANALYSIS_SESSION_DAILY_LIMIT`
- `ANALYSIS_IP_HOURLY_LIMIT`
- `ANALYSIS_GLOBAL_DAILY_LIMIT`

These are not payment-runtime flags but affect full product operation.

## 2. Route-To-Flag Mapping

| Route | Class | Mutating | Controls | Current expected Production behavior | Current expected Staging QA behavior | Disabled/failure mode |
| --- | --- | --- | --- | --- | --- | --- |
| `POST /api/modules/[moduleSlug]/checkout/newebpay` | operator/public checkout API | yes | `ENABLE_NEWEBPAY_CHECKOUT`; `ENABLE_PAYMENT_RUNTIME`; `OPERATOR_TEST_SECRET`; DB; NewebPay config; `PAYMENT_CHECKOUT_SESSION_SECRET` or fallback | `404 not_found` while checkout flag off | Can create pending checkout only when checkout flag on and operator secret present if runtime off | flag off: `404`; runtime off/no operator: `401`; config missing: `503` |
| `POST /api/payments/newebpay/notify` | provider callback | yes | DB; NewebPay config/signature | Route exists but fails closed without valid config/signature/payment intent | Valid fixture/sandbox callback can mark paid and create delivery artifacts if config present | DB missing: `503`; malformed/signature/config mismatch: provider-compatible error |
| `GET /m/[moduleSlug]/payment/return` | public UX | read-only | optional DB; signed `pcs_`; `NEXT_PUBLIC_APP_URL` only at creation time | Safe pending/fallback page | Safe waiting/processing/ready UX if checkout session exists | missing token/DB: fallback pending page |
| `POST /api/modules/[moduleSlug]/payment/status` | public status API | read-only | DB; signed `pcs_`; session signing secret | Safe invalid/session responses | Polls waiting/processing/ready for staging payment QA | missing token: `400`; DB missing: `503`; invalid session: safe status |
| `GET /m/[moduleSlug]/payment/access` | public session-bound access | read-only | DB; signed `pcs_`; paid result state | Does not render paid result without valid ready session | Renders paid result after paid + completed result | invalid/not-ready: safe fallback |
| `GET /m/[moduleSlug]/unlock/[unlockToken]` | public unlock page | read-only | DB; legacy unlock token or `pa_`; `PAID_ACCESS_TOKEN_HASH_SECRET`; `ENABLE_PAID_GENERATION_JOBS` for job signal fallback | Safe invalid/pending/completed rendering | `pa_` resolves first; legacy still works | invalid `pa_`: paid-access error, no legacy fallback |
| `POST /api/modules/[moduleSlug]/paid-result/status` | public paid status API | read-only | DB; legacy unlock token or `pa_`; `PAID_ACCESS_TOKEN_HASH_SECRET`; `ENABLE_PAID_GENERATION_JOBS` | Safe invalid/expired/pending/completed statuses | Used by fake-paid and paid access polling | invalid `pa_`: `invalid_paid_access`; legacy invalid: `invalid_unlock` |
| `POST /api/operator/fake-paid-success` | operator QA | yes | `ENABLE_OPERATOR_FAKE_PAID_SUCCESS`; `OPERATOR_TEST_SECRET`; DB; `PAID_ACCESS_TOKEN_HASH_SECRET` | Should be `404 not_found` | Authorized staging QA creates fake paid intent, entitlement, `pa_`, generation job | flag off: `404`; missing/invalid secret: `401`; missing config: `503` |
| `POST /api/internal/jobs/process` | internal processor | yes | DB; `INTERNAL_JOB_SECRET` fallback `CRON_SECRET`; `ENABLE_PAID_GENERATION_PROCESSOR` | disabled unless explicitly configured and authorized | Manual staging processor completion when authorized | no DB/secret: `503`; unauthorized: safe `401`; flag off: `403` |
| `GET /api/cron/paid-generation` | cron fallback | yes | DB; `CRON_SECRET`; `ENABLE_PAID_GENERATION_PROCESSOR` | safety net only; not primary | safety/manual fallback only | no DB/secret: `503`; unauthorized: `401`; flag off: `403` |
| `GET /api/health` | public health | read-only | build marker envs | safe marker only | safe marker only | no secret data exposed |

## 3. Environment Matrix

Legend:

- Required now: needed for current low-key monitor/product health.
- Required for staging QA: needed for fake-paid or staging payment QA.
- Required for launch: needed before production payment runtime.
- Fail closed: missing config should disable/fail safely, not partially run.

| Env / Flag | Local development | Vercel Preview general | Preview(staging) branch-scoped | Production | Value type | Safe default | Fail closed | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `DATABASE_URL` | optional unless testing DB routes | likely present | authoritative for staging DB | present for app runtime | URL secret | absent disables DB routes | yes | Do not print. |
| `ENABLE_PAYMENT_RUNTIME` | absent/false | absent/false | false until launch QA explicitly says otherwise | false now | boolean | false | yes | Broad public runtime gate. |
| `ENABLE_NEWEBPAY_CHECKOUT` | optional false | optional false | true only for staging checkout QA | false now | boolean | false | yes | Checkout route 404 when off. |
| `NEWEBPAY_MERCHANT_ID` | optional for tests/sandbox | optional | required for staging sandbox/E2E | required before launch | string | absent | yes | Name only in docs. |
| `NEWEBPAY_HASH_KEY` | optional for tests/sandbox | optional | required for staging sandbox/E2E | required before launch | 32-char secret | absent | yes | Do not expose. |
| `NEWEBPAY_HASH_IV` | optional for tests/sandbox | optional | required for staging sandbox/E2E | required before launch | 16-char secret | absent | yes | Do not expose. |
| `NEWEBPAY_CHECKOUT_URL` | optional | optional | required for staging sandbox/E2E | required before launch | URL | absent | yes | Sandbox vs production URL matters. |
| `NEWEBPAY_NOTIFY_URL` | optional | optional | required for staging sandbox/E2E | required before launch | URL | absent | yes | Must point to correct environment. |
| `NEWEBPAY_ENVIRONMENT` | optional | optional | recommended `sandbox`/`staging` | required before launch | enum-ish string | `unknown` | no | Metadata only. |
| `NEXT_PUBLIC_APP_URL` | optional local URL | preview URL | staging URL authoritative | production URL | URL | absent | yes for NewebPay | Also LINE URL fallback. |
| `PAID_ACCESS_TOKEN_HASH_SECRET` | optional unless fake-paid/payment tests | optional | required for fake-paid and paid delivery QA | required before launch | secret | absent | yes | Needed for hash-at-rest `pa_`. |
| `PAYMENT_CHECKOUT_SESSION_SECRET` | optional | optional | recommended for checkout QA | required before launch | secret | falls back to paid access secret | partial | Separate before launch. |
| `ENABLE_OPERATOR_FAKE_PAID_SUCCESS` | optional | false | true only during staging QA | false | boolean | false | yes | Never enable broadly. |
| `OPERATOR_TEST_SECRET` | optional | optional | required if operator routes enabled | absent unless explicit prod QA decision | secret | absent | yes | Header: `x-operator-test-secret`. |
| `ENABLE_PAID_GENERATION_JOBS` | optional | optional | true for paid job status QA | required if launch uses job status | boolean | false | yes-ish | Mostly status visibility. |
| `ENABLE_PAID_GENERATION_PROCESSOR` | optional | optional | true for manual/queue processor QA | required for paid generation launch | boolean | false | yes | Processor route `403` when off. |
| `INTERNAL_JOB_SECRET` | optional | optional | required for processor QA and future queue | required for launch processor/queue | secret | absent | yes | Preferred over `CRON_SECRET`. |
| `CRON_SECRET` | optional | optional | optional fallback/safety | optional fallback/safety | secret | absent | yes | Cron auth and fallback internal secret. |
| `RETENTION_CLEANUP_SECRET` | optional | optional | recommended if cleanup route used | recommended if cleanup route used | secret | fallback `CRON_SECRET` | yes | Not payment-specific. |
| `ENABLE_PAID_JOB_QUEUE_TRIGGER` | not implemented | not implemented | planned for Phase 4 | planned disabled by default | boolean | false | yes | Placeholder only. |
| `PAID_JOB_QUEUE_PROVIDER` | not implemented | not implemented | planned for Phase 4 | planned | enum string | `noop`/absent | yes | Placeholder only. |
| `QSTASH_TOKEN` | not implemented | not implemented | planned provider secret | planned provider secret | secret | absent | yes | Placeholder only. |
| `QSTASH_CURRENT_SIGNING_KEY` | not implemented | not implemented | planned provider secret | planned provider secret | secret | absent | yes | Placeholder only. |
| `QSTASH_NEXT_SIGNING_KEY` | not implemented | not implemented | planned provider secret | planned provider secret | secret | absent | yes | Placeholder only. |
| `NEXT_PUBLIC_LINE_ADD_URL` | optional | optional | optional | optional | public URL | absent | no | LINE delivery not part of payment runtime. |
| `LINE_CHANNEL_SECRET` | optional | optional | required for LINE webhook | required if LINE webhook active | secret | absent | yes | Separate from payment launch. |
| `LINE_CHANNEL_ACCESS_TOKEN` | optional | optional | required for LINE replies | required if LINE webhook active | secret | absent | yes | Separate from payment launch. |
| `FULFILLMENT_TOKEN_SECRET` | optional | optional | recommended for fulfillment hash pepper | recommended | secret | empty pepper | no | Consider requiring later. |
| `VERCEL_ENV` / git marker envs | platform-set | platform-set | platform-set | platform-set | safe marker strings | unknown | no | Health sanitizes. |

### Environment Authority

`Preview(staging)` branch-scoped values must be authoritative for staging. General Preview values are not sufficient for `staging.anyu.tw` when branch-scoped values exist.

Production values must be reviewed separately. Do not infer production safety from staging values.

## 4. Current Operational Caveats

- Branch-scoped `Preview(staging)` env overrides general Preview env. This caused the previous `INTERNAL_JOB_SECRET` mismatch.
- Production public merchant-review content was deployed directly through Vercel from `staging`; `origin/main` is still behind `origin/staging`.
- Current refs: local/staging and `origin/staging` at `cda089e`; `origin/main` at `4c2487a`; `main` is 73 commits behind staging.
- Local `.git/FETCH_HEAD` permission issues have occurred and `.git/FETCH_HEAD` remains present. No `origin/staging.lock` exists at scan time.
- `anyu.tw` may still appear associated with older Vercel project in Vercel UI, though current alias resolution has served `anyu-next` in recent checks.
- Payment runtime is intentionally off despite production storefront/refund pages being live.

## 5. Launch Readiness Classification

| Classification | Env / Flag Names |
| --- | --- |
| Required now for low-key monitor | `DATABASE_URL`, AI provider vars, `NEXT_PUBLIC_APP_URL` as appropriate, abuse guard optional limits |
| Required for staging fake-paid QA | `ENABLE_OPERATOR_FAKE_PAID_SUCCESS`, `OPERATOR_TEST_SECRET`, `PAID_ACCESS_TOKEN_HASH_SECRET`, `INTERNAL_JOB_SECRET`, `ENABLE_PAID_GENERATION_PROCESSOR`, `ENABLE_PAID_GENERATION_JOBS`, `DATABASE_URL` |
| Required for NewebPay sandbox E2E | `ENABLE_NEWEBPAY_CHECKOUT`, all NewebPay config vars, `PAYMENT_CHECKOUT_SESSION_SECRET` or fallback, `PAID_ACCESS_TOKEN_HASH_SECRET`, `ENABLE_PAID_GENERATION_PROCESSOR`, `INTERNAL_JOB_SECRET`, `DATABASE_URL`, operator secret while runtime off |
| Required for Phase 4 queue trigger | planned `ENABLE_PAID_JOB_QUEUE_TRIGGER`, `PAID_JOB_QUEUE_PROVIDER`, queue provider token/signing vars, `INTERNAL_JOB_SECRET`, `ENABLE_PAID_GENERATION_PROCESSOR`, `DATABASE_URL` |
| Required for production payment launch | `ENABLE_PAYMENT_RUNTIME`, `ENABLE_NEWEBPAY_CHECKOUT`, production NewebPay config, dedicated `PAYMENT_CHECKOUT_SESSION_SECRET`, `PAID_ACCESS_TOKEN_HASH_SECRET`, processor/queue vars, `ENABLE_PAID_GENERATION_PROCESSOR`, `ENABLE_PAID_GENERATION_JOBS`, `DATABASE_URL` |
| Optional / cleanup candidate | `CRON_SECRET` fallback for processor, `PAYMENT_CHECKOUT_SESSION_SECRET` fallback behavior, `FULFILLMENT_TOKEN_SECRET` empty fallback, stale `payment_success_future` trigger source label |

## 6. Risk Review

### Flags Too Broad

- `ENABLE_PAYMENT_RUNTIME` is intentionally broad. It should remain off until a launch decision record exists.
- `ENABLE_NEWEBPAY_CHECKOUT` only gates checkout creation, not NotifyURL route existence. This is acceptable because NotifyURL fails closed on signature/config/payment intent, but operators must understand it.

### Confusing Fallbacks

- `INTERNAL_JOB_SECRET` falls back to `CRON_SECRET`. This can mask a missing dedicated processor secret.
- `RETENTION_CLEANUP_SECRET` falls back to `CRON_SECRET`. Reasonable but should be documented separately from paid generation.
- `PAYMENT_CHECKOUT_SESSION_SECRET` falls back to `PAID_ACCESS_TOKEN_HASH_SECRET`. Works now but couples two token domains.
- `FULFILLMENT_TOKEN_SECRET` can be empty, meaning fulfillment hash pepper is optional.

### Preview vs Preview(staging)

- Duplicated general Preview and branch-scoped Preview(staging) values can mislead operators.
- For staging payment QA, always inspect/update Preview(staging) explicitly.
- Do not assume `vercel env ls preview` alone proves staging behavior.

### Production Fail-Closed Defaults

- Payment runtime flags default false: good.
- Checkout route 404 when `ENABLE_NEWEBPAY_CHECKOUT` is false: good.
- Operator fake-paid route 404 when flag off: good.
- Processor route requires secret and flag: good.
- NotifyURL route exists but cannot mutate without DB + valid provider config + valid signature + matching intent: acceptable.

### Stale / Misleading Names

- `payment_success_future` is still used as a generation job trigger source for verified NewebPay paid delivery. Behavior is correct, name is stale.

## 7. Recommendations

### P0

None found while payment runtime remains disabled.

### P1 Before Phase 4B Queue Provider Wiring

1. `Preview(staging) Payment Env Verification Runbook v0`
   - Type: ops/docs
   - Why: branch-scoped staging env is the highest recurring operational risk.
   - Risk if deferred: queue staging smoke may debug the wrong env scope again.

2. `Production Deployment Source-of-Truth Cleanup v0`
   - Type: ops/docs
   - Why: production is deployed from staging while `main` is far behind.
   - Risk if deferred: launch rollback/audit confusion.

3. `Payment Runtime Env Preflight Script v0`
   - Type: tooling/docs
   - Why: a secret-safe local script could check presence/scope categories without printing values.
   - Risk if deferred: manual env checks remain error-prone.

### P2 Before Production Payment Launch

1. `Payment Checkout Session Secret Separation v0`
   - Type: ops/code small
   - Why: stop relying on `PAID_ACCESS_TOKEN_HASH_SECRET` fallback for `pcs_`.
   - Risk if deferred: token-domain coupling and harder rotation.

2. `Entitlement Payment Intent Uniqueness Migration Plan v0`
   - Type: schema/migration plan
   - Why: service idempotency exists, but DB uniqueness by `payment_intent_id` is not enforced.
   - Risk if deferred: duplicate entitlement edge case under concurrency.

3. `Generation Job Trigger Source Naming Cleanup v0`
   - Type: code/schema-adjacent
   - Why: `payment_success_future` is stale.
   - Risk if deferred: reporting/ops confusion.

4. `Production Payment Launch Gate Checklist v0`
   - Type: docs/ops
   - Why: launch requires coordinated flags, provider config, queue/processor, refund/support, and rollback.
   - Risk if deferred: runtime launch depends on scattered docs.

### P3 Cleanup

- Separate retention cleanup auth docs from paid generation auth docs.
- Consider requiring `FULFILLMENT_TOKEN_SECRET` before any LINE delivery expansion.
- Add a current payment operations index that supersedes older blocked QA reports.

## 8. Phase 4 Readiness

Phase 4A can proceed because it should add only a queue trigger abstraction and no-op/test adapter behind a disabled flag.

Before Phase 4B provider queue wiring:

- Define actual queue env names.
- Add branch-scoped Preview(staging) setup steps.
- Confirm processor route auth uses `INTERNAL_JOB_SECRET` only for queue, not a shared cron fallback if avoidable.
- Keep queue trigger disabled in production until launch gate.

Before production payment launch:

- Complete P2 items above or explicitly accept their risk.
- Run NewebPay sandbox E2E if credentials are available.
- Confirm refund/support process and owner response window.

## 9. Validation

Documentation-only validation for this task:

- Docs presence check.
- Secret/private pattern scan on new docs.
- `git diff --check`.

No app code changed, so app lint/test/build is not required.

## 10. Recommended Next Step

Recommended next task:

```text
Production Deployment Source-of-Truth Cleanup v0
```

Alternative if engineering velocity is preferred:

```text
Queue Trigger Integration Phase 4A: No-op/Test Adapter v0
```

Phase 4A is safe to proceed if it stays disabled by default and does not add provider queue credentials yet.
