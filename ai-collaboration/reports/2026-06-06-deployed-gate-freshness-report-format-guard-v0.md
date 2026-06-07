# Deployed Gate Freshness + Report Format Guard v0

Date: 2026-06-07

## Format Alignment Note

This report introduced the gate-status/report-format correction that is now formalized in `ai-collaboration/process/report-template.md` and the canonical completion summary schema. Future reports should use those templates directly.

## Model / Effort

- Model used: GPT-5 Codex
- Reasoning effort used: high
- taskStartedAt: `2026-06-06T23:50:27Z`
- taskCompletedAt: `2026-06-07T00:01:17Z`
- totalWallClockDuration: about 11 minutes
- humanWaitDuration: about 0 minutes
- netCodexWorkDuration: about 11 minutes

## Scope

Added a deployed freshness guard and report-format fields so staging/production gates cannot be treated as clean evidence when they start on stale deployments or when command exit code differs from gate status.

No production runtime, production checkout, production payment, Email, LINE, Vercel env change, DB mutation, LINE behavior fix, theme UI, or Module 02 work occurred.

## Problem Corrected

During LINE Production Bind Root-Cause Narrowing + Fix v0, `qa:module01:staging` began while Preview(staging) still served old commit `42e9c2d`. The deployment changed to `cfd4658` during the same structured gate run.

Correction:

- that first staging gate is not clean validation of the pushed LINE fix
- classify it as `mixed_deployment_gate_invalid` for the LINE fix evidence record
- use a lightweight freshness wait before the substantive staging gate
- report `gateStatus` and `commandExitCode` separately

## Freshness Helper

Added:

```bash
cd apps/web && corepack pnpm run qa:deploy:freshness -- --env staging --expected-commit <sha>
cd apps/web && corepack pnpm run qa:deploy:freshness -- --env production --expected-commit <sha>
```

Behavior:

- checks only `/api/health`
- verifies environment, branch, and git commit
- waits with timeout/interval
- emits structured JSON only
- prints no secrets, values, lengths, prefixes, suffixes, hashes, or checksums
- returns `staging_freshness_timeout` / `production_freshness_timeout` when target commit is not live before timeout
- returns `commit_metadata_unknown` when health has no usable commit

## Module 01 Staging Guard

`qa:module01:staging` now supports:

```bash
cd apps/web && MODULE01_EXPECTED_DEPLOY_COMMIT=<sha> corepack pnpm run qa:module01:staging
```

If expected commit is supplied:

- freshness is checked before access-link smoke, no-card checkout, Admin API, or Admin CLI checks
- stale deployment blocks the gate instead of polling through the full suite
- start/end deployed commits are reported
- mixed deployment is reported as invalid evidence

If expected commit is not supplied:

- current behavior remains available
- summary reports `freshnessStatus=not_asserted`, not pass

## Report Format Changes

Module 01 summaries now include:

- `targetDeployCommit`
- `deployedCommitAtGateStart`
- `deployedCommitAtGateEnd`
- `freshnessStatus`
- `mixedDeploymentDetected`
- `gateStatus`
- `commandExitCode`
- `requiredChecksStatus`
- `optionalChecksStatus`

This prevents conflating process exit code with gate quality. A command can exit 0 while `gateStatus=partial` if required checks pass and optional checks are skipped/partial.

## Clean Freshness + Staging Rerun

Target:

- codeFixCommit for LINE redirect-state fix: `cfd4658`
- previous report/dashboard commit: `6226d2e`
- freshness guard commits: `136e47e`, `29de59f`
- targetDeployCommit for clean rerun: `29de59f`

Lightweight freshness wait:

| Field | Result |
|---|---|
| command | `cd apps/web && corepack pnpm run qa:deploy:freshness -- --env staging --expected-commit 29de59f --timeout 180000 --interval 5000` |
| freshnessStatus | `pass` |
| targetDeployCommit | `29de59f` |
| deployedCommitAtGateStart | `6226d2e4bc96` |
| deployedCommitAtGateEnd | `29de59fa4d10` |
| mixedDeploymentDetected | `true` for the lightweight wait only |
| interpretation | deploy became fresh during the lightweight wait, before the substantive gate |

Substantive staging gate:

| Field | Result |
|---|---|
| command | `cd apps/web && MODULE01_EXPECTED_DEPLOY_COMMIT=29de59f corepack pnpm run qa:module01:staging` |
| commandExitCode | `0` |
| gateStatus | `partial` |
| requiredChecksStatus | `pass` |
| optionalChecksStatus | `partial` |
| freshnessStatus | `pass` |
| targetDeployCommit | `29de59f` |
| deployedCommitAtGateStart | `29de59fa4d10` |
| deployedCommitAtGateEnd | `29de59fa4d10` |
| mixedDeploymentDetected | `false` |
| real Email / LINE sent | no |
| production runtime/payment | no |

Why `partial`:

- required checks passed
- optional Admin API/CLI lookup checks were skipped because this shell did not have explicit `ADMIN_API_TOKEN`
- channel checks were skipped by design because real Email/LINE requires owner approval

## Tests Run

| Command | Result |
|---|---|
| `cd apps/web && corepack pnpm exec vitest run src/tests/deploy-freshness-check.test.ts src/tests/module01-release-validation-suite.test.ts` | pass, 2 files / 20 tests |
| `cd apps/web && corepack pnpm lint` | pass |
| `cd apps/web && corepack pnpm test` | pass, 93 files / 639 tests |
| `cd apps/web && corepack pnpm build` | pass |

## Gates Skipped

- `qa:module01:production-preflight`: skipped because production runtime/env/preflight behavior did not change; only process docs and staging freshness guard behavior changed.
- `qa:module01:staging:channels`: not run; real Email/LINE checks remain owner-approved only.
- production smoke/payment: not run.

## Process Docs Updated

Updated:

- `AGENTS.md`
- `ai-collaboration/process/qa-validation-policy.md`
- `ai-collaboration/process/production-gate-policy.md`
- `ai-collaboration/process/handoff-template.md`

New rule:

- deployed staging/production gates must assert target commit freshness before substantive checks
- stale or mixed-deployment full-gate runs are invalid evidence for the target commit
- future reports must separate code fix, report, and deploy commits

## Production Safety

- Production runtime: not enabled.
- Production checkout: not enabled.
- Production payment: not run.
- Production Email: not sent.
- Production LINE: not sent.
- Vercel env: not changed.
- DB data: not mutated.

## Final Status

Deployed Gate Freshness + Report Format Guard v0 is complete.

The LINE fix now has a clean deployed staging gate record for target commit `29de59f`, with `freshnessStatus=pass`, `mixedDeploymentDetected=false`, `requiredChecksStatus=pass`, `optionalChecksStatus=partial`, `gateStatus=partial`, and `commandExitCode=0`.

Recommended next task: resume LINE production bind root-cause fix review using the corrected evidence, then proceed to Production Runtime Window + Vercel Alias Guard v0 when appropriate.
