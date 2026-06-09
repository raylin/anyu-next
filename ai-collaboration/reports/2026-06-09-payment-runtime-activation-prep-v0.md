# Payment Runtime Activation Prep v0

## Metadata

- task name: Payment Runtime Activation Prep v0
- date: 2026-06-09
- report path: `ai-collaboration/reports/2026-06-09-payment-runtime-activation-prep-v0.md`
- commit: not committed at report creation
- branch / push status: `staging` / not pushed at report creation
- model / effort: GPT-5 Codex, high effort
- taskStartedAt: 2026-06-09T15:46:52Z
- taskCompletedAt: 2026-06-09T15:52:36Z
- totalWallClockDuration: 5m 44s
- humanWaitDuration: 0m
- netCodexWorkDuration: 5m 44s

## Context

- why this task exists: NewebPay NotifyURL / ReturnURL Dry-Run Matrix v0 passed, repeated/concurrency paid-generation local hardening passed, and production runtime remains disabled while the owner decides whether to run an owner-controlled activation window.
- upstream blocker / mainline context: this is a readiness/checklist/runbook gate, not activation. Production runtime must remain fail-closed until a separate owner-approved activation task.
- out-of-scope items: runtime open, real payment, real Email/LINE, Vercel env changes, production DB mutation, NewebPay dashboard/config changes, provider behavior changes, product/legal copy, and visual redesign.

## Scope

- what changed: created the activation prep/runbook report, updated summary/dashboard status, and confirmed existing controls/tests from code and process docs.
- what did not change: no app runtime code, payment/provider logic, schemas, env values, Admin/Ops config, production runtime, DB data, or channel sending behavior.

## Runtime Gate Inventory

| Gate / variable / command | Location / owner | Expected state before activation | Required production value/state for an activation window | Safety concern | Owner action required |
| --- | --- | --- | --- | --- | --- |
| `payment.window.enabled` | DB-backed scoped runtime config; registry in `apps/web/src/lib/runtime-config/registry.ts`; resolved by `apps/web/src/lib/runtime-config/payment.ts` | `false` for module `ai-temperature` | temporarily `true` only during owner-controlled window | primary checkout open/close control; high risk; reason required | yes, in activation task only |
| `payment.global.disabled` | DB-backed global runtime config | `false` unless emergency shutdown is active | `false`; if `true`, checkout must fail closed even if module window is open | global kill switch; requires global-impact confirmation | no, unless emergency |
| `qa:production:runtime-window -- --action status` | `apps/web/scripts/production-runtime-window.mjs` | `fail_closed_ready` | before open: `fail_closed_ready`; after open: `runtime_config_open`; after close: `fail_closed_ready` | blocks if alias/project/preflight/runtime config unsafe | run in activation task |
| `qa:production:runtime-window -- --action plan-enable` | same helper | read-only plan only | confirms scoped key, module scope, no redeploy | must not execute open accidentally | run in activation task |
| `pnpm ops config set --env production payment.window.enabled true --module ai-temperature --reason ...` | Admin API / `pnpm ops` | not run in this prep task | only command that opens controlled window | opens production checkout | owner-approved activation task only |
| `pnpm ops config set --env production payment.window.enabled false --module ai-temperature --reason ...` | Admin API / `pnpm ops` | available | mandatory close command | close failure is escalation | activation/rollback task |
| `qa:production:admin-ops-preflight` | `apps/web/scripts/production-admin-ops-preflight.mjs`; ops credentials in process env or `~/.anyu/credentials.json` | pass before any owner/manual action | pass | missing Admin/Ops token blocks runtime open and diagnostics | run before activation |
| `qa:module01:production-preflight` | `apps/web/scripts/module01-release-validation-suite.mjs production-preflight`; provider/env checker in `production-payment-runtime-preflight.mjs` | pass | pass | checks env name presence, URL alignment, fail-closed route posture, provider/static requirements | run before activation |
| `NEWEBPAY_MERCHANT_ID` | Vercel Production env and local mirror `.env.production` | present; value not printed | production merchant id present | missing/placeholder blocks provider form/NotifyURL verify | owner verifies presence only |
| `NEWEBPAY_HASH_KEY` / `NEWEBPAY_HASH_IV` | Vercel Production env and local mirror | present; value not printed | production credentials present | secret mismatch breaks TradeInfo decrypt/signature verification | owner/provider config responsibility |
| `NEWEBPAY_CHECKOUT_URL` | Vercel Production env and local mirror | present | production checkout gateway URL | sandbox URL would invalidate production smoke | owner/provider config responsibility |
| `NEWEBPAY_NOTIFY_URL` | Vercel Production env and local mirror | present and canonical | `https://anyu.tw/api/payments/newebpay/notify` | blank/mismatched URL blocks smoke | owner dashboard already confirmed; recheck before activation |
| `NEXT_PUBLIC_APP_URL` | Vercel Production env and local mirror | present and canonical | `https://anyu.tw` | drives provider-level ReturnURL | no if already aligned; recheck before activation |
| `NEWEBPAY_ENVIRONMENT` | Vercel Production env and local mirror | present | `production` for production runtime | sandbox/staging value would be unsafe for real payment | owner/provider config responsibility |
| `PAYMENT_CHECKOUT_SESSION_SECRET` | Vercel Production env and local mirror | present; value not printed | present | ReturnURL session handoff depends on it | no if preflight passes |
| `PAID_ACCESS_TOKEN_HASH_SECRET` | Vercel Production env and local mirror | present; value not printed | present | entitlement paid access token hashing depends on it | no if preflight passes |
| `ENABLE_PAID_JOB_QUEUE_TRIGGER` | Vercel Production env and local mirror | present; value checked by preflight where available | expected enabled for queue trigger if using queue provider | if disabled, paid result may require manual processor path | verify in preflight |
| `PAID_JOB_QUEUE_PROVIDER` / `PAID_JOB_QUEUE_TOPIC` | Vercel Production env and local mirror | present | configured for production queue provider/topic | queue trigger cannot enqueue without them | verify in preflight |
| `ENABLE_PAID_GENERATION_PROCESSOR` | Vercel Production env and local mirror | present | enabled for processor/cron path | disabled processor can leave paid jobs queued | verify in preflight |
| `INTERNAL_JOB_SECRET` / `CRON_SECRET` | Vercel Production env and local mirror | present; values not printed | present | processor endpoints require auth | verify in preflight |
| AI provider key | Vercel Production env and local mirror; any of `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` | at least one present | at least one present | paid generation cannot complete without provider | verify in preflight |
| access-link secrets | `.env.production` / Vercel Production: `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`, `PAYMENT_RECOVERY_CONTACT_HASH_SECRET`, `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY`, `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY` | present | present | Email/LINE access links/contact binding depend on them | verify in preflight |
| Email provider env | `.env.production` / Vercel Production: `EMAIL_PROVIDER`, `EMAIL_FROM`, `RESEND_API_KEY` | present | present if Email delivery is part of activation smoke | Email delivery will fail otherwise | owner/operator verifies before real delivery check |
| LINE provider env | `.env.production` / Vercel Production: `LINE_RECOVERY_MESSAGE_PROVIDER`, `NEXT_PUBLIC_LINE_LIFF_URL`, `LINE_CHANNEL_ACCESS_TOKEN` or `LINE_MESSAGING_CHANNEL_ACCESS_TOKEN` | present | present if LINE delivery is part of activation smoke | LINE bind/delivery will fail otherwise | owner/operator verifies before real delivery check |
| `ENABLE_OPERATOR_FAKE_PAID_SUCCESS` and related operator flags | static env flags in feature flag code | absent or false in production | absent or false | operator/fake-paid routes must remain fail-closed | no activation use |
| deprecated `ENABLE_PAYMENT_RUNTIME` / `ENABLE_NEWEBPAY_CHECKOUT` | historical env names | not used | must not be used to open/close | Vercel env toggles are obsolete runtime control | no; do not restore |
| `DATABASE_URL` | Vercel Production env and local mirror | present; value not printed | present | DB required for payment state | verify by preflight / app health |

## Production Readiness Inventory

| Area | Status | Evidence / caveat |
| --- | --- | --- |
| `payment_intents` schema | ready | schema has unique merchant order index, provider trade index, status/time fields, and result/module indexes. |
| `entitlements` schema | ready | unique paid access token hash and unique payment intent constraint are present. |
| `generation_jobs` schema | ready with caveat | unique dedupe key and `FOR UPDATE SKIP LOCKED` claim path exist; deployed concurrency automatic-drain still needed before low-key soft public. |
| paid result storage | ready | `analysis_paid_results` has status, JSON payload, prompt/schema lookup indexes, and completion/error timestamps. |
| paid access token hashing | ready with presence caveat | code requires `PAID_ACCESS_TOKEN_HASH_SECRET`; production preflight blocks if missing. |
| NotifyURL verification | ready | dry-run matrix confirms malformed/signature/amount/non-success/duplicate/unknown handling and paid truth boundary. |
| ReturnURL recovery/status UX | ready | provider-level `/payment/newebpay/return` is canonical; ReturnURL remains UX-only and does not create paid state. |
| status polling | ready | paid result/status route and ReturnURL handoff tests cover pending/processing/ready/failed states. |
| `/r` recovery/access-link states | ready with visual review caveat | paid-state surfaces use shared Riso primitive; owner visual review can continue separately without blocking owner-controlled activation. |
| processor/Admin wait path | ready for owner-controlled window | one deployed staging automatic-drain job passed; local/mock repeated/concurrency passed; deployed repeated/concurrency remains soft-public blocker. |
| Admin/Ops lookup | ready if preflight passes | `pnpm ops lookup-result`, `lookup-line-bind`, runtime config get/history/set are supported; auth via process env then `~/.anyu/credentials.json`. |
| no-card/fake-paid fallback | ready for staging/operator QA only | production operator routes must remain fail-closed; use only staging-safe helpers unless task explicitly authorizes. |
| Email/LINE access-link delivery | ready with provider env caveat | controlled smoke v4 proved delivery; future activation preflight must ensure provider env presence and owner availability. |

## Activation Runbook Draft

This runbook is for a future owner-approved activation task. Do not execute it in this prep task.

1. Confirm owner decision and scope.
   - Decision must explicitly authorize one owner-controlled short window.
   - Confirm credit-card one-time payment only; no ads, no broad traffic, no non-card methods.
2. Confirm deploy freshness.
   - Determine target commit.
   - Run production freshness / alias proof per production gate policy.
   - Stop if target commit is unknown, stale, or mixed.
3. Run local and deployed pre-open gates.
   - `cd apps/web && corepack pnpm run qa:module01:local`
   - `cd apps/web && corepack pnpm run qa:module01:staging`
   - `cd apps/web && corepack pnpm run qa:module01:production-preflight`
   - `cd apps/web && corepack pnpm run qa:production:admin-ops-preflight`
   - `cd apps/web && corepack pnpm run qa:production:runtime-window -- --action status`
   - `cd apps/web && corepack pnpm run qa:production:runtime-window -- --action plan-enable`
4. Verify provider/dashboard alignment.
   - ReturnURL: `https://anyu.tw/payment/newebpay/return`
   - NotifyURL: `https://anyu.tw/api/payments/newebpay/notify`
   - one-time credit card enabled; non-card methods disabled.
5. Generate tracked smoke fixture.
   - `cd apps/web && corepack pnpm run qa:module01:smoke-fixture -- --json`
   - Use tracked fixture only; do not invent input.
6. Open production runtime window.
   - `pnpm ops config set --env production payment.window.enabled true --module ai-temperature --reason "owner-controlled payment runtime activation window"`
   - Verify with `qa:production:runtime-window -- --action status`.
7. Create fresh production result.
   - Use tracked fixture.
   - Assert `resultSourceCategory=production_runtime`, `cacheHit=false`, new result ID, and no tokenized URL in logs/report.
8. Pre-payment save checks.
   - Owner saves Email.
   - Owner binds LINE only if included in the activation smoke scope.
   - Use `pnpm ops lookup-result --env production --id <resultId> --json` and `pnpm ops lookup-line-bind --env production --result-id <resultId> --json` as needed.
9. First payment placeholder.
   - Owner performs one NT$49 credit-card payment only after Email/LINE save pass.
   - Do not record card/provider raw payload or tokenized URLs.
10. Verify NotifyURL / ReturnURL.
   - ReturnURL lands in waiting/processing/ready state.
   - NotifyURL marks payment paid without manual resend.
   - If payment is paid but generation is queued, use Admin/Ops wait path.
11. Verify entitlement/job/result/access links.
   - `pnpm ops lookup-result --env production --id <resultId>`
   - `pnpm ops lookup-result --env production --id <resultId> --json`
   - Expected: payment paid, entitlement active, generation completed, paid result completed, Email/LINE access-link delivery state as applicable.
12. Close runtime.
   - `pnpm ops config set --env production payment.window.enabled false --module ai-temperature --reason "owner-controlled payment runtime activation window complete"`
   - Verify runtime status and production preflight.
13. Decide final posture.
   - Default: fail-closed.
   - Keep open only if owner explicitly chooses and all pass criteria are met.

## Close / Rollback Plan

- Fast close command:
  - `pnpm ops config set --env production payment.window.enabled false --module ai-temperature --reason "runtime close / rollback"`
- Verify close:
  - `cd apps/web && corepack pnpm run qa:production:runtime-window -- --action status`
  - `cd apps/web && corepack pnpm run qa:module01:production-preflight`
- Identify in-flight paid intents:
  - use `pnpm ops lookup-result --env production --id <resultId> --json` for known smoke result IDs.
  - do not use direct DB unless Admin/Ops is insufficient and the owner explicitly approves read-only root-cause debugging.
- Paid but not generated:
  - keep payment truth and entitlement intact.
  - inspect sanitized generation job state and recommended action.
  - use only approved processor endpoint/path if authorized.
  - never manually update DB rows to mark generation complete.
- Failed generation:
  - preserve payment intent, entitlement, generation job, Admin/Ops diagnostics, and provider evidence.
  - classify safe failure category.
  - close runtime before further payments.
- What not to delete:
  - payment intent, entitlement, generation job, paid result, access-link/contact rows, runtime config history, provider evidence.
- Owner messaging:
  - if paid but pending, tell user the report is being prepared and support can verify payment.
  - if failed, support/refund policy remains 3-7 business days unless owner updates it.

## Smoke And Monitoring Matrix

| Step | Command / route | Expected signal | Pass/fail criteria | Safety note |
| --- | --- | --- | --- | --- |
| Deploy freshness | `qa:deploy:freshness -- --env production --expected-commit <sha>` or production gate equivalent | target commit served; no mixed deploy | pass required | no runtime open until pass |
| Health marker | `https://anyu.tw/api/health` | `environment=production`, git commit present | pass required | safe read-only |
| Runtime fail-closed | `qa:production:runtime-window -- --action status` | `stateCategory=fail_closed_ready` | pass required before open | proves checkout/operator closed |
| Production preflight | `qa:module01:production-preflight` | `gateStatus=pass` | pass required | route/env/static readiness |
| Admin/Ops preflight | `qa:production:admin-ops-preflight` | `production_admin_ops_ready` | pass required | no owner manual action until pass |
| Checkout page availability after open | checkout-start and NewebPay checkout route | form available only after scoped open | fail if unavailable or wrong provider | do not print provider fields |
| NotifyURL route availability | `GET /api/payments/newebpay/notify` in preflight / provider callback in smoke | route reachable; POST provider response on real smoke | real callback required in activation task | no raw payload logging |
| ReturnURL route availability | `/payment/newebpay/return` | safe invalid/pending page | must not mark paid | UX only |
| Fake-paid/no-card fallback | staging helper only | staging operator path pass | production must remain fail-closed | do not run production fake-paid |
| First payment | owner card payment | one NT$49 one-time credit card | only after pre-save pass | no card/provider payload captured |
| Paid generation | Admin/Ops lookup and wait result | generation completed | fail/close if stuck beyond threshold | approved processor path only |
| `/r` access link | owner verifies Email/LINE link opens paid result | completed result opens | no tokenized URL in report | owner should not paste link |
| Runtime close | `pnpm ops config set ... false` then status/preflight | fail-closed ready | mandatory unless owner explicitly overrides | close failure escalates |

## Remaining Blocker Review

| Item | Classification | Rationale |
| --- | --- | --- |
| NewebPay approval state | must confirm before first real payment | owner previously confirmed alignment/approval; activation task must reconfirm dashboard state immediately before payment. |
| Production Admin/Ops auth | must pass before runtime open | required for safe lookup/close/history; missing token blocks activation. |
| Production deploy freshness / alias proof | must pass before runtime open | stale/mixed production code invalidates smoke evidence. |
| Runtime fail-closed status | must pass before runtime open | activation must start from closed, known-safe state. |
| Deployed repeated/concurrency automatic-drain evidence | blocks low-key soft public, not owner-controlled short window | one deployed staging job passed; local/mock repeated/concurrency passed; deployed concurrency remains unproven. |
| Provider failed/cancelled/expired Admin taxonomy | acceptable for owner-controlled short window; future support enhancement | dry-run matrix proves no paid artifacts on non-success callbacks; local terminal mapping can wait until support need is real. |
| Vercel Hobby Cron daily-only limitation | acceptable for owner-controlled monitored windows; blocks unmonitored availability if queue relies on cron only | queue trigger/processor path must be monitored; if automatic drain depends on cron cadence, keep owner-controlled only. |
| Payment support/recovery playbook completeness | acceptable for owner-controlled short window; improve before broader traffic | support/refund SOP exists; detailed incident playbook can be refined. |
| Visual owner review status | future/growth debt unless owner blocks activation on visual quality | paid-state surfaces are aligned enough for function; owner visual polish can continue separately. |
| Low-key soft public | blocked | requires deployed repeated/concurrency automatic-drain evidence and owner decision. |
| Ads/broad traffic | blocked | requires soft public stability, monitoring, support cadence, and owner approval. |

## Validation

- commands run:
  - `cd apps/web && corepack pnpm lint`: pass.
  - `cd apps/web && corepack pnpm test`: pass, 106 files / 734 tests.
  - `cd apps/web && corepack pnpm build`: pass.
  - `cd apps/web && corepack pnpm run qa:module01:ui`: pass, 5 Playwright tests.
  - `cd apps/web && corepack pnpm run qa:module01:local`: pass, `gateStatus=pass`, `commandExitCode=0`, `requiredChecksStatus=pass`, `optionalChecksStatus=not_applicable`.
  - `cd apps/web && corepack pnpm run qa:module01:mock-flow`: pass, 12 named scenarios.
  - docs presence check: pass.
  - dashboard HTML sanity: pass.
  - secret/private scan over diff: pass, no matches.
  - `git diff --check`: pass.
- gateStatus: pass
- commandExitCode: 0
- requiredChecksStatus: pass
- optionalChecksStatus: skipped / not_applicable
- targetDeployCommit: not_applicable
- deployedCommitAtGateStart: not_applicable
- deployedCommitAtGateEnd: not_applicable
- freshnessStatus: not_applicable
- gates skipped and why:
  - production runtime open / real activation preflight execution that would change runtime: prohibited.
  - real payment / real Email / real LINE / real NewebPay transaction: prohibited.
  - staging/no-card/fake-paid: not required because no runtime/payment code changed.

## Safety

- production runtime enabled: no
- payment run: no
- Email sent: no
- LINE sent: no
- Vercel env changed: no
- DB mutated: no
- secrets/private data exposed: no

## Result

- result: pass
- first failure category: not_applicable
- blocker status: activation not performed; readiness/runbook prepared

## Tech Debt / Cleanup Notes

- new technical debt introduced: none
- existing technical debt observed:
  - deployed repeated/concurrency automatic-drain remains required before low-key soft public.
  - provider failed/cancelled/expired local terminal taxonomy remains deferred.
  - payment support/recovery incident playbook can be expanded before broader traffic.
- opportunistic cleanup completed: none
- deferred cleanup candidates: staging-safe simulated callback matrix helper if local tests are insufficient later.

## Decisions Made

- Kept this task docs/runbook-only because no safety bug was found and the task explicitly prohibited activation.
- Preserved `payment.window.enabled` as the only normal production open/close control for Module 01 payment runtime.
- Kept soft-public readiness separate from owner-controlled activation readiness.

## Uncertainties / Blockers

- Owner must explicitly approve any future activation window.
- Exact NewebPay dashboard state should be reconfirmed immediately before a real payment task.
- Production runtime must remain fail-closed until the future activation task passes pre-open gates.

## Recommended Next Step

If owner wants real-payment readiness: Payment Runtime Activation Owner-Controlled Window v0.

If owner wants soft-public readiness first: Deployed Repeated/Concurrency Automatic-Drain Benchmark v0.

If owner wants operational support hardening first: Payment Support/Recovery Playbook v0.

## Paste-Back Context

Payment Runtime Activation Prep v0 prepared the controlled activation checklist/runbook without opening runtime or running payment. The gate inventory confirms scoped DB runtime config remains the open/close control: `payment.window.enabled` for module `ai-temperature`, with `payment.global.disabled` as global kill switch. Provider/static env, Admin/Ops, schema, NotifyURL/ReturnURL, entitlement/job, status polling, access-link, processor, and no-card fallback readiness were classified. No production runtime, payment, Email/LINE, Vercel env, provider config, or DB mutation occurred. Recommended next task depends on owner priority: owner-controlled activation window, deployed concurrency auto-drain benchmark, or payment support/recovery playbook.
