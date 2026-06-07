# Production Gate Policy

Date: 2026-06-06

## Default Posture

Production runtime stays fail-closed unless a task explicitly authorizes controlled smoke.

Default scoped runtime config:

- `payment.window.enabled=false` for Module 01 unless a controlled smoke explicitly opens it
- `payment.global.disabled=false` unless an emergency kill switch is intentionally active

Operator/fake-paid routes must remain fail-closed in production.

## Preconditions Before Runtime Enablement

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

Use the generated `.qa/module01-valid-analyze-request.json` request or the shared fixture helpers as the smoke input source. Do not dynamically invent analyze request bodies during a production runtime window. If the fixture command or fixture validation fails, stop and classify the first failure as `production_smoke_fixture_unprepared`.

Codex must also assert:

- environment: production
- base URL: `https://anyu.tw`
- canonical Vercel project: `anyu-next`
- deploy from repo root, not `apps/web`
- production public pages are live
- checkout/operator routes fail closed before enablement

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

Do not generate a NewebPay provider form, ask for owner payment, or ask for Email/LINE manual checks until the pre-open gates and runtime-window status pass.

If any open/close operation fails, stop and classify the first failure as `runtime_config_open_failed` or `runtime_config_close_failed`.

Runtime config open/close is intentionally independent of Vercel deployment. A redeploy is not required for normal smoke window open/close.

Operator/fake-paid routes must remain fail-closed during and after the smoke window.

No ads or non-card payment methods are enabled by runtime config.

Use tracked fixture input only; do not dynamically invent analyze request bodies during the runtime window.

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
