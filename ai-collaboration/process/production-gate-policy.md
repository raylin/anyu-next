# Production Gate Policy

Date: 2026-06-06

## Default Posture

Production runtime stays fail-closed unless a task explicitly authorizes controlled smoke.

Default flags:

- `ENABLE_PAYMENT_RUNTIME=false`
- `ENABLE_NEWEBPAY_CHECKOUT=false`

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

Only enable the minimum required flags for the controlled smoke.

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

- disable `ENABLE_PAYMENT_RUNTIME`
- disable `ENABLE_NEWEBPAY_CHECKOUT`
- redeploy production fail-closed if needed
- confirm checkout/operator routes fail closed

Leave runtime enabled only if owner explicitly chooses soft public availability.

## Reporting

Production reports must include:

- codeFixCommit, reportCommit, and targetDeployCommit when they differ
- deployedCommitAtGateStart and deployedCommitAtGateEnd for deployed gates
- freshnessStatus and mixedDeploymentDetected for deployed gates
- gateStatus and commandExitCode separately
- requiredChecksStatus and optionalChecksStatus
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
