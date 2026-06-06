# QA Validation Policy

Date: 2026-06-06

## Purpose

Use the lightest reliable validation tier for the changed surface. Do not run heavier staging or production gates by habit.

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

### Module 01 Production Preflight

Run when production gate, env mirror, Vercel, fail-closed behavior, or production smoke readiness changes.

Use:

```bash
cd apps/web && corepack pnpm run qa:module01:production-preflight
```

Production preflight must not enable runtime or submit payment.

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

The command writes sanitized `.qa` artifacts for the canonical valid analyze request. If this fixture is invalid or unavailable, stop before any runtime enablement and classify the issue as `production_smoke_fixture_unprepared`.

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
- whether it mutates staging data
- whether it touches production read-only checks
- whether it sends Email/LINE
- whether production runtime/payment was enabled
- why skipped, if skipped
