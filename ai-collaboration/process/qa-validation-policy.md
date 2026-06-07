# QA Validation Policy

Date: 2026-06-06

## Purpose

Use the lightest reliable validation tier for the changed surface. This policy implements the AGENTS.md principles: quality before apparent progress, production as acceptance not diagnosis, structured target-correct validation, and tests that reduce manual standby.

## Core Selection Rules

- Start with targeted tests for changed helpers, routes, scripts, components, Admin/Ops, payment, access-link, LINE, or Email surfaces.
- Use `qa:module01:mock-flow` and `qa:module01:ui` before staging when local/mocked coverage can prove the behavior.
- Use `qa:module01:staging` for deployed integration or release-candidate evidence, not as default smoke.
- Use production only for final acceptance after local/staging evidence when the path can be mirrored.
- Real Email, LINE, and payment require explicit owner approval.
- Do not use ad hoc heredoc scripts, random temp-file polling, or repeated full-suite polling.
- If Email and LINE save both fail, inspect shared access-link save/contact logic first and use Email as the minimal automated reproduction.

## Validation Tiers

### Targeted Tests

Run for any code change touching helpers, routes, components, scripts, Admin API/CLI, access-link logic, payment logic, LINE/Email logic, or QA tooling.

Use:

```bash
cd apps/web && corepack pnpm exec vitest run <targeted test files>
```

### Module 01 Mock Flow

Run for payment/access-link/backend flow changes that can be verified without providers.

Use:

```bash
cd apps/web && corepack pnpm run qa:module01:mock-flow
```

This tier must not hit NewebPay, Resend, LINE Messaging, Vercel runtime, or production.

### Module 01 UI

Run for checkout-start, mandatory save gate, desktop/mobile layout, copy, or interaction-state changes.

Use:

```bash
cd apps/web && corepack pnpm run qa:module01:ui
```

This tier should use local mocked harnesses where possible.

### Module 01 Local Gate

Run for broad Module 01 changes or before important handoff completion.

Use:

```bash
cd apps/web && corepack pnpm run qa:module01:local
```

It includes lint, targeted tests, full tests, and build.

### Module 01 Staging Gate

Run only when deployed Preview(staging) behavior must be verified or for release-candidate checks.

Use:

```bash
cd apps/web && corepack pnpm run qa:module01:staging
```

Do not rerun the full staging gate just to wait for one async result. Use structured wait helpers instead.

For code that must be verified on a deployed commit, assert deployment freshness first:

```bash
cd apps/web && corepack pnpm run qa:deploy:freshness -- --env staging --expected-commit <sha>
cd apps/web && MODULE01_EXPECTED_DEPLOY_COMMIT=<sha> corepack pnpm run qa:module01:staging
```

If `MODULE01_EXPECTED_DEPLOY_COMMIT` is supplied and the target commit is not live, `qa:module01:staging` must block before access-link, no-card, Admin API, or Admin CLI checks. Do not use the full staging gate as a deploy polling mechanism.

For flows that staging can reasonably mirror, use staging as the deployed diagnostic environment before production. If a fresh staging result cannot pass checkout-start, pre-payment save, no-card/fake-paid transition, access-link resolution, and Admin/Ops visibility, classify the staging failure and block production smoke until targeted fixes pass.

### Shared Access-Link Save Failures

If Email save and LINE bind/save both fail in the same checkout flow, investigate the shared access-link save/contact/linkage layer first. Use Email save as the minimal automated reproduction before debugging LINE-specific LIFF, mobile browser, or provider behavior.

For Module 01, the minimum automated path before another production attempt is:

- fresh tracked fixture result
- checkout-start save gate visible
- Email save succeeds pre-payment
- checkout unlocks from saved Email
- no-card/fake-paid transition consumes saved contact
- access-link readiness and `/r` resolution are verified
- Admin/Ops summary is sanitized

### Module 01 Production Preflight

Run when production gate, env mirror, Vercel, fail-closed behavior, or production smoke readiness changes.

Use:

```bash
cd apps/web && corepack pnpm run qa:module01:production-preflight
```

Production preflight must not enable runtime or submit payment.

### Production Runtime Window

Use before any controlled production smoke runtime enablement:

```bash
cd apps/web && corepack pnpm run qa:production:runtime-window -- --action status
cd apps/web && corepack pnpm run qa:production:runtime-window -- --action plan-enable
cd apps/web && corepack pnpm run qa:production:runtime-window -- --action plan-disable
```

The helper reports production fail-closed state, controlled-window state, canonical project status, alias guard status, and scoped runtime config state without printing env values.

Runtime open/close for controlled smoke is performed through Admin API / `pnpm ops config`, not Vercel env changes:

```bash
pnpm ops config set --env production payment.window.enabled true --module ai-temperature --reason "controlled production smoke"
pnpm ops config set --env production payment.window.enabled false --module ai-temperature --reason "smoke complete"
```

No redeploy is required for normal scoped runtime config open/close.

`qa:production:runtime-window -- --action status` must be run before open and after close.

## Structured Waits

Use:

```bash
cd apps/web && corepack pnpm run qa:module01:wait-result -- --env staging --result-id <resultId>
```

Do not use heredoc scripts, random temp-file handoffs, or repeated full-suite polling.

## Deployed Gate Freshness

Any deployed staging or production gate must assert the target deployment before substantive checks.

Rules:

- Use the health endpoint or `qa:deploy:freshness` for lightweight deploy freshness waiting.
- A gate run is valid only if `deployedCommitAtGateStart` matches `targetDeployCommit`.
- If a gate starts on a stale commit and changes mid-run, classify it as `mixed_deployment_gate_invalid`.
- If health does not expose usable commit metadata, classify it as `commit_metadata_unknown`.
- If the target commit is not live before timeout, classify it as `staging_freshness_timeout` or `production_freshness_timeout`.
- If no expected commit is supplied, report `freshnessStatus=not_asserted`, not pass.
- Reports must separate `commandExitCode` from `gateStatus`; an exit code of 0 can still produce `gateStatus=partial`.

For any deployed gate, report:

- `targetDeployCommit`
- `deployedCommitAtGateStart`
- `deployedCommitAtGateEnd`
- `freshnessStatus`
- `mixedDeploymentDetected`
- `gateStatus`
- `commandExitCode`
- `requiredChecksStatus`
- `optionalChecksStatus`

## Smoke Fixtures

Production and staging smoke prep must use tracked Module 01 fixtures instead of invented request bodies.

Use:

```bash
cd apps/web && corepack pnpm run qa:module01:smoke-fixture
```

The command writes sanitized `.qa` artifacts for the canonical valid analyze request. For production smoke prep, the default artifact must include a controlled fresh dimension and the summary must report `smokeRunIdPresent=true`, `freshDimensionPresent=true`, and `expectedFreshResult=true`. If this fixture is invalid, unavailable, or not fresh-capable, stop before any runtime enablement and classify the issue as `production_smoke_fixture_unprepared`.

Production result creation must assert `cacheHit=false`. If `cacheHit=true`, stop with `result_creation_failed / tracked_fixture_cache_hit_reused_previous_result`; do not continue with the reused result and do not invent another request body.

## Real Provider Checks

Real Email, LINE, and credit-card payment require explicit owner approval.

- `qa:module01:staging:channels` is owner-approved only.
- Production payment smoke is owner-approved only.
- Provider accepted / DB row exists is not user-channel pass.
- User-channel pass requires owner receipt and successful `/r/` open.

## When To Run What

- Docs-only: docs presence, dashboard HTML sanity, secret scan, `git diff --check`.
- Small helper/script change: targeted tests, lint if relevant.
- UI flow change: targeted tests, `qa:module01:ui`, build if runtime code changed.
- Payment/access-link/backend change: targeted tests, `qa:module01:mock-flow`, local gate; staging only if deployed behavior changed.
- Env/Vercel/production gate change: env/preflight tests and `qa:module01:production-preflight`.
- Production smoke: local, staging, and production-preflight must pass first.

## Required Reporting

For each gate, report:

- command
- result
- gateStatus and commandExitCode separately
- requiredChecksStatus
- optionalChecksStatus
- whether it mutates staging data
- whether it touches production read-only checks
- whether it sends Email/LINE
- whether production runtime/payment was enabled
- why skipped, if skipped

Rules:

- `commandExitCode=0` does not equal `gateStatus=pass`.
- If a gate summary says `partial`, the report and completion summary must say `partial`.
- If a deployed gate is involved, include `targetDeployCommit`, `deployedCommitAtGateStart`, `deployedCommitAtGateEnd`, `freshnessStatus`, and `mixedDeploymentDetected`.
