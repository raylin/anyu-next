# Production Gate Policy

Date: 2026-06-06

## Default Posture

Production runtime stays fail-closed unless a task explicitly authorizes controlled smoke.

Default scoped runtime config:

- `payment.window.enabled=false` for Module 01 unless a controlled smoke explicitly opens it
- `payment.global.disabled=false` unless an emergency kill switch is intentionally active

Operator/fake-paid routes must remain fail-closed in production.

## Production Smoke Validity

Production smoke requires:

- local/staging evidence for flows staging can mirror
- production deploy freshness and known target commit
- scoped runtime config readiness or dry-run evidence
- production Admin/Ops auth preflight using process-env `ADMIN_API_TOKEN` or `~/.anyu/credentials.json`
- tracked fresh Module 01 fixture
- Admin/Ops diagnostics available for result, access-link, and LINE bind failures
- explicit owner approval for payment and real channel checks

Production smoke is invalid if:

- target deploy commit is stale, unknown, or mixed during the gate
- staging/local could reasonably test the path but was skipped
- `commandExitCode` is used as a substitute for `gateStatus`
- runtime window open/close cannot be proven
- fixture result creation returns `cacheHit=true`
- production `pnpm ops` lookup cannot authenticate before runtime open

## Preconditions Before Runtime Enablement

Production smoke is final acceptance, not the primary diagnostic environment. If staging can reasonably mirror the flow being validated, Codex must establish current staging evidence first. For payment/access-link changes this means a fresh staging result, checkout-start, pre-payment save behavior, no-card/fake-paid transition, access-link resolution, and Admin/Ops summaries where applicable.

If a failure appears production-only, verify the target production deploy commit and whether the latest expected fix is live before drawing product conclusions. Then decide whether staging can mirror the same class of flow. If staging can mirror it, reproduce and fix through staging or local automation before another production smoke.

If Email save and LINE bind/save both fail before payment, do not split them into independent channel failures first. Treat the shared access-link save/contact/linkage layer as the primary suspect, use Email save as the smallest automated reproduction, and block production smoke until Email save plus no-card/fake-paid access-link readiness is automated and passing.

Before enabling production runtime, Codex must run and report:

```bash
cd apps/web && corepack pnpm run qa:module01:local
cd apps/web && corepack pnpm run qa:module01:staging
cd apps/web && corepack pnpm run qa:module01:production-preflight
```

All must pass or be explicitly owner-accepted partials.

For deployed gates, Codex must assert the intended target commit before substantive checks. Use lightweight freshness checks instead of the full staging/production gate as a polling mechanism:

```bash
cd apps/web && corepack pnpm run qa:deploy:freshness -- --env staging --expected-commit <sha>
cd apps/web && corepack pnpm run qa:deploy:freshness -- --env production --expected-commit <sha>
```

If a deployed gate starts on a stale commit, the run is invalid for the target fix. If the deployed commit changes mid-run, classify it as `mixed_deployment_gate_invalid`.

Production smoke must also prepare a tracked Module 01 fixture before runtime enablement:

```bash
cd apps/web && corepack pnpm run qa:module01:smoke-fixture
```

Use the generated `.qa/module01-valid-analyze-request.json` request or the shared fixture helpers as the smoke input source. The smoke fixture summary must report `validationStatus=pass`, `smokeRunIdPresent=true`, `freshDimensionPresent=true`, and `expectedFreshResult=true` before production runtime is opened. Do not dynamically invent analyze request bodies during a production runtime window. If the fixture command or fixture validation fails, stop and classify the first failure as `production_smoke_fixture_unprepared`.

After production result creation, assert `cacheHit=false`. If `cacheHit=true`, stop immediately, close runtime config, and classify the first failure as `result_creation_failed / tracked_fixture_cache_hit_reused_previous_result`. Do not continue with a reused result and do not dynamically invent another body; rerun `qa:module01:smoke-fixture` to generate a new tracked fresh fixture.

Codex must also assert:

- environment: production
- base URL: `https://anyu.tw`
- canonical Vercel project: `anyu-next`
- deploy from repo root, not `apps/web`
- production public pages are live
- checkout/operator routes fail closed before enablement
- NewebPay canonical ReturnURL path is `https://anyu.tw/payment/newebpay/return`
- NewebPay NotifyURL is `https://anyu.tw/api/payments/newebpay/notify`
- Vercel Production URL-bearing env values match the local `.env.production` mirror; blank `NEXT_PUBLIC_APP_URL` or `NEWEBPAY_NOTIFY_URL` blocks payment smoke
- production Admin/Ops availability before runtime open:

```bash
cd apps/web && corepack pnpm run qa:production:admin-ops-preflight
```

This preflight is read-only. `pnpm ops` resolves Admin auth from shell/process `ADMIN_API_TOKEN` first, then `~/.anyu/credentials.json`. If it fails with `production_admin_token_missing_owner_action_required`, stop before runtime open, result creation, or owner manual action. Do not load `.env.production` into `pnpm ops` and do not use direct DB as a fallback for a missing Admin token.

## Runtime Enablement

Only open the minimum required scoped runtime config for the controlled smoke.

Before runtime enablement planning, run:

```bash
cd apps/web && corepack pnpm run qa:production:runtime-window -- --action status
cd apps/web && corepack pnpm run qa:production:runtime-window -- --action plan-enable
cd apps/web && corepack pnpm run qa:module01:smoke-fixture -- --json
```

Normal controlled smoke open/close uses scoped runtime config:

```bash
pnpm ops config set --env production payment.window.enabled true --module ai-temperature --reason "controlled production smoke"
pnpm ops config set --env production payment.window.enabled false --module ai-temperature --reason "smoke complete"
```

Do not use:

- Vercel env toggles
- redeploys for runtime open/close
- `ENABLE_PAYMENT_RUNTIME`
- `ENABLE_NEWEBPAY_CHECKOUT`

The runtime-window helper must:

- default to read-only status
- require explicit confirmation for execute action
- only set `payment.window.enabled` for module `ai-temperature`
- use Admin API / `pnpm ops` runtime config boundary
- require no redeploy for normal runtime-window open/close
- never touch provider credentials or unrelated config values

The old Vercel env flags `ENABLE_PAYMENT_RUNTIME` and `ENABLE_NEWEBPAY_CHECKOUT` are no longer primary runtime gates.

They must not be used to open or close normal production smoke windows. If the names are encountered in historical reports or old handoffs, treat them as historical context unless a current task explicitly reintroduces a tested static upper-bound with owner approval.

Active Scoped Runtime Config v0 payment controls:

- `payment.window.enabled`
- `payment.global.disabled`

Reserved delivery config names are not live sender controls in v0 and must not be used as proof that Email or LINE delivery is enabled/disabled.

## Controlled Smoke Ops Runbook

Before opening:

```bash
cd apps/web && corepack pnpm run qa:module01:local
cd apps/web && corepack pnpm run qa:module01:staging
cd apps/web && corepack pnpm run qa:module01:production-preflight
cd apps/web && corepack pnpm run qa:production:runtime-window -- --action status
cd apps/web && corepack pnpm run qa:module01:smoke-fixture -- --json
cd apps/web && corepack pnpm run qa:production:admin-ops-preflight
```

Open:

```bash
pnpm ops config set --env production payment.window.enabled true --module ai-temperature --reason "controlled production smoke"
cd apps/web && corepack pnpm run qa:production:runtime-window -- --action status
```

If LINE bind fails before payment:

```bash
pnpm ops lookup-line-bind --env production --result-id <resultId>
pnpm ops lookup-line-bind --env production --result-id <resultId> --json
```

After payment/result completion:

```bash
pnpm ops lookup-result --env production --id <resultId>
pnpm ops lookup-result --env production --id <resultId> --json
```

Close, unless the owner explicitly chooses soft availability:

```bash
pnpm ops config set --env production payment.window.enabled false --module ai-temperature --reason "smoke complete"
cd apps/web && corepack pnpm run qa:production:runtime-window -- --action status
cd apps/web && corepack pnpm run qa:module01:production-preflight
```

Final close is mandatory for controlled smoke unless the owner explicitly chooses soft availability in the moment.

Do not generate a NewebPay provider form, ask for owner payment, create a production result, open runtime, or ask for Email/LINE manual checks until the pre-open gates, runtime-window status, and production Admin/Ops preflight pass.

For NewebPay provider setup, the active canonical ReturnURL is provider-level `/payment/newebpay/return`, derived from `NEXT_PUBLIC_APP_URL` by checkout service. Legacy module-scoped return routes must not be configured as active provider dashboard ReturnURL. If they exist in code, treat them as compatibility-only and verify they do not appear in generated checkout contracts.

If any open/close operation fails, stop and classify the first failure as `runtime_config_open_failed` or `runtime_config_close_failed`.

Runtime config open/close is intentionally independent of Vercel deployment. A redeploy is not required for normal smoke window open/close.

Operator/fake-paid routes must remain fail-closed during and after the smoke window.

No ads or non-card payment methods are enabled by runtime config.

Use tracked fixture input only; do not dynamically invent analyze request bodies during the runtime window. Result creation must return `cacheHit=false`; otherwise close runtime config and stop before Email save, LINE bind, provider form, or payment.

Do not enable:

- ads
- broad traffic
- non-card payment methods
- operator/fake-paid routes
- unrelated runtime features

## Owner Manual Action

Do not ask the owner to perform card payment, Email, or LINE checks until preflight passes and production runtime is prepared.

Manual production payment requires owner approval and immediate availability.

Do not record or expose:

- card data
- provider raw payload
- `TradeInfo` / `TradeSha`
- tokenized URLs
- raw Email / LINE ID

## Production Result Identity

Do not report a staging result ID as production.

Any production result ID in a production task must include:

- `resultSourceCategory=production_runtime`
- production environment assertion
- base URL assertion

## Failure Handling

Stop at the first hard failure and classify it using `codex-operating-policy.md`.

Do not continue blindly after:

- preflight failure
- checkout unavailable
- LINE bind failure before payment
- provider form failure
- payment failure
- NotifyURL failure
- processor/generation failure
- access-link delivery failure

Keep runtime conservative.

## Final Runtime Decision

Default after controlled smoke:

- set `payment.window.enabled=false` for module `ai-temperature`
- leave `payment.global.disabled=false` unless emergency shutdown is intentionally active
- no redeploy is required for normal scoped runtime-window close
- confirm checkout/operator routes fail closed

Leave runtime enabled only if owner explicitly chooses soft public availability.

## Paid Generation Processor Readiness

Gate 1 functional smoke can pass while soft-public readiness remains conditional. Before any owner-only availability window or low-key soft public window, Codex must assess paid-generation queue readiness instead of relying on manual smoke impressions.

Track these metrics where available:

- `enqueueLatencyMs`: payment paid / entitlement active to generation job creation
- `queueWaitMs`: generation job creation to processor start/lock
- `processorPickupLatencyMs`: eligible queued job to processor pickup
- `processingDurationMs`: processor start to paid result completion
- `totalPaidReadyMs`: payment paid / entitlement active to paid result completion
- `deliveryReadyMs`: paid result completion to Email/LINE access-link delivery readiness
- `queueStuckThreshold`: v0 default threshold for operator attention

Initial proposed SLOs are evidence-seeking targets, not permanent launch guarantees:

- paid result ready p50 <= 60 seconds
- paid result ready p95 <= 180 seconds
- queue wait p95 <= 60 seconds
- no queued job remains beyond 5 minutes without a safe Admin/Ops action
- controlled small-sample processor failure rate = 0

Use the structured benchmark helper before availability decisions:

```bash
cd apps/web && corepack pnpm run qa:paid-generation:benchmark -- --mode mock --jobs 1 --json
cd apps/web && corepack pnpm run qa:paid-generation:benchmark -- --mode mock --jobs 3 --concurrency 2 --json
```

Mock benchmark output does not prove deployed cron or Vercel Queue automatic drain behavior. If deployed drain behavior is the question, use a bounded staging-safe no-card/fake-paid path with freshness guard and Admin/Ops evidence. Do not use production as the primary processor benchmark environment.

If a paid result remains queued:

- run `pnpm ops lookup-result --env <env> --id <resultId>` and inspect the sanitized generation queue state
- if the queue state is within threshold, wait using structured result wait helpers
- if the queue state is stuck or retry-scheduled, use only the approved processor endpoint/path when authorized
- stop accepting production payments if queue readiness is unknown or jobs require repeated manual processor action
- never mutate DB rows manually to mark generation complete

## Reporting

Production reports must include:

- codeFixCommit, reportCommit, and targetDeployCommit when they differ
- deployedCommitAtGateStart and deployedCommitAtGateEnd for deployed gates
- freshnessStatus and mixedDeploymentDetected for deployed gates
- gateStatus and commandExitCode separately
- requiredChecksStatus and optionalChecksStatus
- runtime-window helper action/status
- aliasGuardStatus and whether alias target was proven, mismatched, or unverified
- preflight results
- runtime enablement window
- payment method
- Email save result
- LINE bind result
- ReturnURL / NotifyURL result
- paid result result
- access-link delivery result
- Admin CLI lookup result
- final runtime status
- whether ads/broad traffic were enabled
- first failure category if failed

Use the canonical report template in `ai-collaboration/process/report-template.md` and the canonical completion summary schema in `ai-collaboration/process/handoff-template.md`.

Do not collapse production smoke or preflight results into informal prose. Report `commandExitCode`, `gateStatus`, `requiredChecksStatus`, and `optionalChecksStatus` separately. If any gate is partial or invalid because of freshness/source evidence, the production report must say so explicitly.
