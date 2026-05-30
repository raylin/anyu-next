# ANYU Engineering Sync-Up / Quality Scan v0

Date: 2026-05-30

## Summary

The implementation is broadly aligned with the intended payment phase boundaries. Checkout, NotifyURL verification, delivery artifact creation, and session-bound paid access handoff are separated correctly. Public payment runtime remains gated, production storefront/refund content is live, and the latest staging route bundle is fresh.

The main risks before continuing major payment work are operational and cleanup-oriented:

- `origin/main` is far behind `origin/staging`, while production was deployed directly from `staging`.
- Local `git fetch` still fails on `.git/FETCH_HEAD` permissions even though remote refs can be read and pushes have worked.
- Temporary processor auth diagnostics remain in deployed code.
- Entitlement uniqueness by `payment_intent_id` remains service-level only; DB currently has an index, not a unique constraint.
- Queue trigger is the right next engineering direction, but a small cleanup/readiness pass should happen first.

No runtime code, flags, env values, deployments, public copy, schemas, prompts, LINE behavior, or payment behavior were changed in this scan.

## 1. Git / Repo Hygiene

### Current State

| Item | Result |
| --- | --- |
| Working directory | `/Users/raylin/Projects/anyu-next` |
| Branch | `staging` |
| Local HEAD | `a8a8bb59af3fff0e859d824cc1c995be1b9fb43c` |
| Local `origin/staging` | `a8a8bb59af3fff0e859d824cc1c995be1b9fb43c` |
| Remote `origin/staging` | `a8a8bb59af3fff0e859d824cc1c995be1b9fb43c` |
| Remote `origin/main` | `4c2487a73587b9efee8f4b216cc47675219524c3` |
| `origin/main...origin/staging` | `0	71`, so `main` is 71 commits behind staging |
| Worktree before report | Clean except this task handoff |
| `.git/refs/remotes/origin/staging.lock` | Not present |
| `.git/FETCH_HEAD` | Present but `git fetch origin --prune` returns `Operation not permitted` |

Latest relevant commits on staging:

- `a8a8bb5` docs: plan paid job queue trigger
- `14ccdd1` ops: refresh production merchant review content
- `3de74ca` docs: snapshot anyu current state
- `b40a5d2` docs: draft newebpay supplement email
- `d68bbb7` docs: publish newebpay review content
- `bf78115` feat: add payment access handoff
- `c0f67b0` feat: create paid delivery artifacts
- `3591e06` feat: verify newebpay notify payments
- `c83a05d` feat: add newebpay checkout foundation

### Deployment State Observed

Live health checks:

| URL | Result |
| --- | --- |
| `https://staging.anyu.tw/api/health` | `environment: preview`, `gitCommit: a8a8bb59af3f`, `gitBranch: staging`, `routeBundleVersion: payment-foundation-2026-05-29` |
| `https://anyu.tw/api/health` | `environment: production`, `gitCommit: 3de74ca20c74`, `gitBranch: staging`, `routeBundleVersion: payment-foundation-2026-05-29` |

Production was refreshed via direct Vercel production deployment from `staging`, not by promoting/merging `main`. That solved merchant-review urgency but creates workflow risk because `main` no longer represents production.

### Risks

- Future operators may inspect `main` and incorrectly assume it is production truth.
- Local fetch failure can leave remote-tracking refs stale again.
- Direct production deploys from staging are workable for emergency public-content refreshes but weaken auditability.

### Recommended Cleanup

- P1 ops: repair local `.git/FETCH_HEAD` permission issue.
- P1 ops/docs: decide whether production truth is `main` or `staging`, then document the deployment workflow.
- P1 ops/codebase: reconcile `main` with tested/stable `staging` when safe, likely via reviewed PR or fast-forward merge, not force push.

## 2. Payment Architecture Consistency

### Phase 1 Checkout

Files:

- `apps/web/src/app/api/modules/[moduleSlug]/checkout/newebpay/route.ts`
- `apps/web/src/lib/payments/newebpay/checkout-service.ts`
- `apps/web/src/lib/payments/newebpay/checkout-payload.ts`

Observed behavior:

- Creates/reuses `newebpay` `payment_intent`.
- Transitions `created` to `checkout_started`.
- Builds NewebPay checkout form contract.
- Creates signed `pcs_` checkout session token for ReturnURL.
- Requires `ENABLE_NEWEBPAY_CHECKOUT`.
- Requires operator secret when `ENABLE_PAYMENT_RUNTIME` is off.
- Does not mark paid.
- Does not create entitlement.
- Does not create `pa_` token.
- Does not create generation job.

Assessment: matches Phase 1 boundary.

### Phase 2 NotifyURL

Files:

- `apps/web/src/app/api/payments/newebpay/notify/route.ts`
- `apps/web/src/lib/payments/newebpay/notify-service.ts`
- `apps/web/src/lib/payments/newebpay/notify-verification.ts`

Observed behavior:

- Accepts JSON or form payload.
- Verifies NewebPay `TradeSha` before decrypt/processing.
- Decrypts `TradeInfo`.
- Requires merchant match.
- Matches existing `payment_intent` by merchant order number.
- Checks provider is `newebpay`.
- Checks amount and currency.
- Marks `created` / `checkout_started` payment intent as `paid`.
- Duplicate paid NotifyURL is idempotent.
- ReturnURL is not part of paid mutation.

Assessment: matches Phase 2 boundary.

### Phase 3 Delivery

Files:

- `apps/web/src/lib/payments/paid-delivery-artifacts.ts`
- `apps/web/src/lib/payments/newebpay/notify-service.ts`
- `apps/web/src/lib/payments/operator-fake-paid-success.ts`

Observed behavior:

- Verified paid NotifyURL calls shared `createPaidDeliveryArtifactsForPaymentIntent(...)`.
- Creates/reuses entitlement.
- Stores hash-at-rest `pa_` token.
- Creates/reuses `generation_job`.
- Does not expose raw `pa_` token in NotifyURL result.
- Operator fake-paid uses the same delivery service with explicit raw token exposure for operator QA only.

Assessment: matches Phase 3 boundary.

Mismatch / cleanup note:

- The NewebPay generation job trigger source is still named `payment_success_future`. It is behaviorally correct but semantically stale.

### Phase 3B Paid Access Handoff

Files:

- `apps/web/src/lib/payments/payment-checkout-session.ts`
- `apps/web/src/lib/payments/payment-access-handoff.ts`
- `apps/web/src/app/api/modules/[moduleSlug]/payment/status/route.ts`
- `apps/web/src/app/m/[moduleSlug]/payment/return/page.tsx`
- `apps/web/src/app/m/[moduleSlug]/payment/access/page.tsx`

Observed behavior:

- `pcs_` token is signed, 24-hour TTL, non-persisted.
- Status endpoint accepts `pcs_` token and returns sanitized state only.
- ReturnURL page is read-only.
- Payment access page renders paid result only when session-bound handoff is `paid_ready`.
- Raw `pa_` token remains unexposed to browser in the real NewebPay path.

Assessment: matches Phase 3B boundary.

Security note:

- `pcs_` token is currently placed in ReturnURL query string, which is acceptable as a private bearer-style continuation link but should be treated as sensitive in logs/docs/screenshots.

## 3. Route Inventory

| Route | Class | Mutating | Gate/Auth | Creates intent | Marks paid | Creates entitlement | Creates `pa_` | Creates job | Triggers processor | Production behavior |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `POST /api/modules/[moduleSlug]/checkout/newebpay` | operator/staging checkout API | yes | `ENABLE_NEWEBPAY_CHECKOUT`; operator secret if runtime off | yes | no | no | no | no | no | `404 not_found` when checkout flag off |
| `POST /api/payments/newebpay/notify` | provider callback | yes | provider signature/config | no | yes after verification | yes after paid | hash only | yes | no | exists; inert without valid config/payload |
| `GET /m/[moduleSlug]/payment/return` | public UX | read-only | signed `pcs_` token optional | no | no | no | no | no | no | safe pending/fallback UX |
| `POST /api/modules/[moduleSlug]/payment/status` | public status API | read-only | signed `pcs_` token | no | no | no | no | no | no | safe state response |
| `GET /m/[moduleSlug]/payment/access` | public session-bound access | read-only | signed `pcs_` token | no | no | no | no | no | no | renders paid result only if ready |
| `POST /api/modules/[moduleSlug]/paid-result/status` | public/legacy paid status | read-only | unlock token or `pa_` bearer token | no | no | no | no | no | no | safe invalid/expired responses |
| `GET /m/[moduleSlug]/unlock/[unlockToken]` | public unlock page | read-only | legacy token or `pa_` bearer token | no | no | no | no | no | no | `pa_` resolves first; invalid `pa_` does not fallback |
| `POST /api/operator/fake-paid-success` | operator QA | yes | `ENABLE_OPERATOR_FAKE_PAID_SUCCESS` + `x-operator-test-secret` | yes | yes fake only | yes | returns raw token only in operator response | yes | no | production route-controlled `404 not_found` |
| `POST /api/internal/jobs/process` | internal processor | yes | `Authorization: Bearer` internal secret + processor flag | no | no | no | no | no | yes, processes due jobs | disabled unless secret + flag |
| `GET /api/cron/paid-generation` | internal cron fallback | yes | `CRON_SECRET` + processor flag | no | no | no | no | no | yes, max one job | safety net only |
| `GET /api/health` | public health | read-only | none | no | no | no | no | no | no | safe build marker |

Live disabled checks:

- Production checkout route: JSON `404 not_found`.
- Production fake-paid route: JSON `404 not_found`.
- Staging checkout route: JSON `404 not_found`.
- Staging fake-paid route: JSON `401 unauthorized`, indicating staging operator fake-paid gate is enabled and route-controlled.

## 4. Feature Flags / Env Consistency

### Feature Flags

Current flag helpers:

- `ENABLE_PAID_GENERATION_JOBS`
- `ENABLE_PAID_GENERATION_PROCESSOR`
- `ENABLE_OPERATOR_FAKE_PAID_SUCCESS`
- `ENABLE_PAYMENT_RUNTIME`
- `ENABLE_NEWEBPAY_CHECKOUT`

Planned but not implemented:

- `ENABLE_PAID_JOB_QUEUE_TRIGGER`
- `PAID_JOB_QUEUE_PROVIDER`
- optional `ENABLE_OPERATOR_QUEUE_TRIGGER_QA`

### Payment / Provider Config Names

NewebPay:

- `NEWEBPAY_MERCHANT_ID`
- `NEWEBPAY_HASH_KEY`
- `NEWEBPAY_HASH_IV`
- `NEWEBPAY_CHECKOUT_URL`
- `NEWEBPAY_NOTIFY_URL`
- `NEWEBPAY_ENVIRONMENT`
- `NEXT_PUBLIC_APP_URL`

Access/session:

- `PAID_ACCESS_TOKEN_HASH_SECRET`
- `PAYMENT_CHECKOUT_SESSION_SECRET`

Processor/internal:

- `INTERNAL_JOB_SECRET`
- `CRON_SECRET`
- `RETENTION_CLEANUP_SECRET`

Operator:

- `OPERATOR_TEST_SECRET`

Database/runtime:

- `DATABASE_URL`
- Vercel build marker envs: `VERCEL_ENV`, `VERCEL_GIT_COMMIT_SHA`, `VERCEL_GIT_COMMIT_REF`, `ANYU_BUILD_TIME`, `VERCEL`.

AI/LINE/analytics-adjacent:

- `ORADAR_PROVIDER`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`
- `ANTHROPIC_FAST_MODEL`
- `ANTHROPIC_FALLBACK_MODEL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `MODEL_STRATEGY`
- `ANALYSIS_CACHE_HASH_SECRET`
- `NEXT_PUBLIC_LINE_ADD_URL`
- `NEXT_PUBLIC_LINE_LIFF_ID`
- `NEXT_PUBLIC_LINE_LIFF_URL`
- `LINE_LOGIN_CHANNEL_ID`
- `LINE_CHANNEL_SECRET`
- `LINE_CHANNEL_ACCESS_TOKEN`
- abuse limits: `ANALYSIS_SESSION_DAILY_LIMIT`, `ANALYSIS_IP_HOURLY_LIMIT`, `ANALYSIS_GLOBAL_DAILY_LIMIT`

### Required By Environment

Staging paid QA:

- `DATABASE_URL`
- `ENABLE_OPERATOR_FAKE_PAID_SUCCESS`
- `OPERATOR_TEST_SECRET`
- `PAID_ACCESS_TOKEN_HASH_SECRET`
- `INTERNAL_JOB_SECRET`
- `ENABLE_PAID_GENERATION_PROCESSOR`
- `ENABLE_PAID_GENERATION_JOBS`

Staging checkout/notify sandbox:

- All NewebPay config names above.
- `ENABLE_NEWEBPAY_CHECKOUT`.
- Operator secret if `ENABLE_PAYMENT_RUNTIME` stays off.
- `PAYMENT_CHECKOUT_SESSION_SECRET` or fallback `PAID_ACCESS_TOKEN_HASH_SECRET`.

Production current public merchant-review:

- Payment runtime remains disabled.
- Checkout should remain disabled unless separately approved.
- Provider secrets can exist but should not imply public runtime is enabled.

### Confusing / Temporary

- `INTERNAL_JOB_SECRET` falls back to `CRON_SECRET`; convenient but potentially confusing for processor vs cron auth.
- `PAYMENT_CHECKOUT_SESSION_SECRET` falls back to `PAID_ACCESS_TOKEN_HASH_SECRET`; acceptable for launch simplicity but should eventually use separate secrets.
- `payment_success_future` trigger source name is stale.
- Branch-scoped `Preview(staging)` env vars override general Preview; this caused prior QA secret mismatch.

## 5. Security / Privacy Scan

| Category | Result | Notes |
| --- | --- | --- |
| Raw `pa_` logging | PASS with caveat | No route logs raw token. Operator route returns raw token by design only behind operator gate. QA runner keeps token in memory and redacts output. |
| Tokenized URL logging/docs | PASS with caveat | Docs avoid real tokenized URLs. Route shapes mention query param names only. Treat `pcs_` URLs as sensitive in future screenshots/logs. |
| Provider secrets exposure | PASS | Checkout route returns encrypted provider fields required for NewebPay form but does not expose hash key/IV. Tests assert no `NEWEBPAY_HASH` leakage. |
| Decrypted provider payload exposure | PASS | Notify verification returns safe categories; no decrypted payload in public response. |
| Raw user input in logs/reports | PASS in scanned payment paths | Processor uses `rawInputRedacted` for generation. Reports avoid raw input. |
| Temporary auth diagnostics | REVIEW | Processor returns safe booleans/categories only in non-production with diagnostic header. Keep for staging queue QA or remove before launch. |
| Production diagnostic suppression | PASS | Processor tests cover no diagnostic detail in production mode. |
| Bearer-token route errors | PASS | Processor returns safe `401`/`403` categories. |
| ReturnURL trust model | PASS | ReturnURL is non-mutating and does not verify or mark paid. |
| NotifyURL trust model | PASS | NotifyURL is payment truth and verifies signature before mutation. |

High-priority risks:

- Do not enable payment runtime until diagnostics retention/removal decision is made.
- Do not publish screenshots with `pcs_` query tokens.
- Do not rely on service-level entitlement uniqueness for real payment scale.

## 6. Temporary / Leftover Code Scan

| Item | Recommendation | Why | Risk If Left |
| --- | --- | --- | --- |
| Processor auth diagnostic mode | Tighten/remove before public runtime launch; keep only through Phase 4 staging QA if needed | Useful for queue auth debugging, safe but temporary | Low security risk due production suppression, but unnecessary attack surface/info in preview |
| Cron wrapper `/api/cron/paid-generation` | Keep as fallback, document not primary | Useful recovery/safety path | Misuse as primary trigger, especially on Hobby daily cron |
| Operator fake-paid endpoint | Keep gated for staging QA | Proven paid delivery chain and future regression tool | Risk if gate/secret accidentally enabled publicly |
| `authorized-fake-paid-qa.mjs` | Keep local-only QA script | Useful secret-safe smoke runner | Needs docs reminding not to paste tokenized output; current output redacts |
| `payment_success_future` trigger source | Rename only if migration-free or with explicit migration plan | Semantically stale after Phase 3 | Confusing reports/ops labels |
| `INTERNAL_JOB_SECRET` fallback to `CRON_SECRET` | Defer; document | Convenience during rollout | Operators may align wrong secret |
| `PAYMENT_CHECKOUT_SESSION_SECRET` fallback to `PAID_ACCESS_TOKEN_HASH_SECRET` | Defer; prefer separate secret before launch | Works safely but couples token domains | Secret rotation coupling |
| Old internal foundation copy | Mostly removed from public root | Production now storefront; legal still says payment not live, which is accurate | Low |
| Stale handoff/report references | Defer | Historical docs intentionally preserve sequence | Future readers may confuse old blocked QA with current pass |
| Refund DB functions without tooling | Defer | Schema supports states; no admin flow yet | Manual refund operations remain ad hoc |

## 7. Test Coverage Scan

### Strong Coverage

- Checkout route/service:
  - disabled flag
  - operator secret while runtime off
  - pending checkout contract
  - provider config errors
  - idempotent reuse
  - no paid delivery artifacts
- NotifyURL route/service:
  - provider-compatible response
  - config/malformed/invalid signature rejection
  - verified paid transition
  - duplicate notify idempotency
  - amount mismatch
  - failed provider status
  - no raw paid access token exposure
- Paid delivery artifacts:
  - entitlement + hash-at-rest token + generation job
  - explicit operator raw-token exposure
  - idempotent reuse
  - missing hash config failure
- `pcs_` handoff/status/access:
  - invalid session rejection
  - unpaid does not reveal access
  - paid processing
  - paid ready with session-bound access path
- Processor route/auth:
  - missing/invalid secret
  - safe diagnostics non-production
  - diagnostic suppression in production
  - processor flag disabled
  - aggregate-only enabled response
  - unsupported job type
- Merchant review:
  - homepage product/price/charging/delivery/refund/support
  - legal content and public contact email

### Missing / Recommended Before Phase 4

- Queue trigger abstraction flag-off and provider failure tests.
- Queue webhook signature/auth rejection tests.
- Duplicate queue trigger does not duplicate paid result.
- Verified NotifyURL creates job and attempts enqueue only when queue flag on.
- Queue enqueue failure does not rollback paid transition or delivery artifacts.
- Manual recovery still works after queue enqueue failure.
- `payment_success_future` reporting/label expectations if left unchanged.
- Production disabled behavior for checkout/fake-paid is partly smoke-verified live but could use a small automated route test if desired.

### Brittle / Watch

- Tests use safe test-shaped `pa_` and `pcs_` strings. Keep scans in place so these do not become real token examples.
- NewebPay tests use synthetic encrypted payload helpers; real sandbox E2E still not run.

## 8. User-Facing Merchant Review Content

### Source Alignment

Homepage source shows:

- Product/service name: `曖昧溫度計｜AI 關係互動分析報告`.
- Product preview card with synthetic, non-private content.
- Price: `NT$ 49`.
- Charging model: one-time, non-subscription.
- Delivery method: web-based report after payment confirmation; processing state if needed.
- Refund/support summary.
- Support email: `hello@anyu.tw`.

Refund/legal:

- `/refund` exists through legal content shell.
- `/legal` links refund, privacy, terms, disclaimer.
- Footer links service intro and legal pages.

### Live Public Checks

Production:

- `https://anyu.tw/`: 200 and includes `曖昧溫度計`, `NT$ 49`, `一次性付款`, `退款`, `hello@anyu.tw`.
- `https://anyu.tw/refund`: 200 and includes refund/support content.
- `https://anyu.tw/legal`: 200 and includes legal/refund/support content.

Staging:

- Same checks pass on `https://staging.anyu.tw/`, `/refund`, and `/legal`.

### Wording Risks

- Public homepage says payment is opened according to review/launch status. This is accurate while runtime is disabled.
- Legal terms still say current internal-test period does not charge. This is accurate now, but must be updated before public payment launch.
- Refund policy still does not state a hard processing time window. Owner confirmation is still needed if NewebPay asks.
- Price consistency currently matches checkout service amount (`49`) and homepage `NT$ 49`.

## 9. Delivery Orchestration Readiness

### Is Phase 4 Still The Right Next Engineering Task?

Yes, with one short cleanup/readiness step first.

Reason:

- Verified payment can create delivery artifacts and job records.
- Manual processor path is proven but not acceptable as normal paid delivery.
- Queue trigger should be added before broad payment runtime so paid jobs process without human intervention.

### Blockers To Fix First

Not blockers to planning, but recommended before Phase 4 implementation:

- Decide whether to keep or remove processor auth diagnostics during queue QA.
- Repair/document local git fetch permissions.
- Decide production deployment source-of-truth workflow.

### Sandbox E2E vs Queue Trigger

If NewebPay sandbox credentials are available, run a real sandbox E2E smoke before or in parallel with Phase 4B. It is not required before Phase 4A because Phase 4A can be no-op/test-only and should not depend on provider credentials.

### Manual Processor Fallback

Manual processor is sufficient temporarily for staging/operator QA and emergency recovery, but not sufficient for real user paid delivery.

### Minimal Queue Fit

The current code fits a trigger-only queue:

- enqueue after `createPaidDeliveryArtifactsForPaymentIntent(...)` returns generation job
- payload contains only job reference / trigger type
- processor fetches DB state
- duplicate triggers are safe due DB dedupe and `FOR UPDATE SKIP LOCKED`

### Must Remain Gated

- Queue trigger flag off by default.
- Payment runtime off for broad public traffic.
- Processor requires internal auth and processor flag.
- Operator fake-paid remains staging/operator-only.
- ReturnURL/status/access remain non-mutating.

## 10. Operational Risks

| Risk | Current Status | Impact |
| --- | --- | --- |
| Branch-scoped Preview(staging) env precedence | Known; caused previous secret mismatch | High for staging QA if ignored |
| Direct production deploy from staging | Current production health reports branch `staging`; `main` is behind | Medium/high workflow confusion |
| Duplicate Vercel domain/project association | Previously observed; current production serves correct app | Medium ops risk |
| Local git fetch permission problem | Still active on `.git/FETCH_HEAD` | Medium local workflow risk |
| Staging alias freshness | Currently fresh at `a8a8bb5` | Low now, high if not preflighted |
| Manual secret coordination | Improved after branch-scoped env discovery | Medium |
| Temporary diagnostics in deployed code | Present, production suppressed | Low now; should be resolved before launch |
| External proof docs outside repo | Correct by design | Owner action remains |

## 11. Priority Recommendations

### P0: Must Fix Before More Payment Runtime Work

None found that require stopping all work. Payment runtime remains disabled and current public exposure checks are safe.

### P1: Should Fix Before Phase 4 Implementation

1. Remove/Tighten Temporary Processor Auth Diagnostics
   - Type: code
   - Why: Safe today, but should not become permanent launch surface by accident.
   - Suggested task: `Remove or Gate Processor Auth Diagnostics for Launch Readiness v0`
   - Risk if deferred: low security risk in production, medium hygiene risk.

2. Git/Vercel Deployment Workflow Cleanup
   - Type: ops/docs
   - Why: `main` is 71 commits behind staging while production was deployed from staging.
   - Suggested task: `Production Deployment Source-of-Truth Cleanup v0`
   - Risk if deferred: high operator confusion and harder rollback/audit.

3. Local Git FETCH_HEAD Permission Repair
   - Type: ops
   - Why: `git fetch` still fails locally.
   - Suggested task: `Repair Local Git Remote Tracking Permissions v0`
   - Risk if deferred: medium risk of stale refs and bad deployment assumptions.

4. Payment Env/Flag Readiness Matrix
   - Type: docs/ops
   - Why: Branch-scoped Preview(staging) precedence is now a known failure mode.
   - Suggested task: `Payment Runtime Env Flag Matrix v0`
   - Risk if deferred: medium risk of staging/production flag mistakes.

### P2: Can Defer But Track

1. DB Unique Constraint For Entitlements By Payment Intent
   - Type: schema/migration
   - Why: Service-level idempotency exists, but DB only indexes `payment_intent_id`.
   - Suggested task: `Entitlement Payment Intent Uniqueness Migration Plan v0`
   - Risk if deferred: duplicate entitlement risk under concurrent notify edge cases.

2. Rename `payment_success_future`
   - Type: code/schema-adjacent
   - Why: Trigger source label is stale.
   - Suggested task: `Generation Job Trigger Source Naming Cleanup v0`
   - Risk if deferred: reporting/ops confusion.

3. Separate `PAYMENT_CHECKOUT_SESSION_SECRET`
   - Type: ops
   - Why: Current fallback to paid access hash secret couples token domains.
   - Suggested task: `Payment Session Secret Separation v0`
   - Risk if deferred: secret rotation coupling.

4. Refund Admin/Operator Process
   - Type: ops/code later
   - Why: DB supports refund states but no operator tooling.
   - Suggested task: `Refund Operations Runbook v0`
   - Risk if deferred: manual support friction.

### P3: Nice-To-Have Cleanup

1. Add operator readiness endpoint for safe booleans.
   - Type: code
   - Risk if deferred: repeated manual env checks.

2. Consolidate old planning docs into a current payment index.
   - Type: docs
   - Risk if deferred: future collaborators read stale blocked states.

3. Add automated public disabled-route smoke.
   - Type: test/tooling
   - Risk if deferred: mostly manual verification overhead.

## 12. Suggested Next Tasks

Recommended order:

1. `Remove or Gate Processor Auth Diagnostics for Launch Readiness v0`
2. `Production Deployment Source-of-Truth Cleanup v0`
3. `Payment Runtime Env Flag Matrix v0`
4. `Queue Trigger Integration Phase 4A: No-op/Test Adapter v0`
5. `NewebPay Sandbox E2E Smoke Plan v0`, if provider sandbox credentials are available

If velocity is more important than cleanup, Phase 4A can proceed immediately because it should be flag-off/no-op by default. However, diagnostics and deployment workflow cleanup should happen before any Phase 4B queue provider staging smoke or runtime launch gate.

## Validation

Documentation-only validation for this task:

- Docs presence check.
- Secret/private pattern scan on new docs.
- `git diff --check`.

No app code changed; app lint/test/build was not required for this scan.

## Tech Debt Review

### New Technical Debt Introduced

None. This task is reporting-only.

### Existing Technical Debt Observed

- Temporary processor auth diagnostics remain.
- `main` is far behind `staging` while production was deployed from `staging`.
- Local `.git/FETCH_HEAD` permission issue persists.
- Entitlement uniqueness by payment intent is not DB-enforced.
- Queue trigger is still missing.
- Refund tooling is missing.
- LINE delivery remains intentionally out of scope.

### Opportunistic Cleanup Completed

None.

### Deferred Cleanup Candidates

- Remove diagnostics.
- Repair git permissions.
- Define production deployment source of truth.
- Add env/flag matrix.
- Plan entitlement uniqueness migration.

## Bottom Line

The codebase is consistent enough to proceed, but the safest next move is a small launch-readiness cleanup pass before Phase 4B/provider queue wiring. Phase 4A no-op/test adapter remains a good next implementation task after, or in parallel with, the P1 cleanup tasks.
