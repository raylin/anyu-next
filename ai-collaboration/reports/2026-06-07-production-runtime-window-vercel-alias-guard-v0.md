# Production Runtime Window + Vercel Alias Guard v0

Date: 2026-06-07

## Model / Effort

- Model used: GPT-5 Codex
- Reasoning effort used: high
- taskStartedAt: `2026-06-07T00:15:59Z`
- taskCompletedAt: `2026-06-07T00:22:44Z`
- totalWallClockDuration: about 7 minutes
- humanWaitDuration: about 0 minutes
- netCodexWorkDuration: about 7 minutes

## Scope

Added a structured production runtime-window status/plan helper and integrated it into Module 01 production preflight so production smoke cannot proceed while deploy/alias proof is ambiguous.

No production runtime, production checkout, production payment, Email, LINE, Vercel env change, provider credential change, DB mutation, migration, theme UI, or Module 02 work occurred.

## Instruction Conflict Rule Update

Updated shared process docs to make the safe interpretation explicit:

- if task goal and process rule conflict, stop and ask or choose the safer interpretation
- correctness and safety override speed
- target deployment freshness overrides avoiding wait time
- “do not poll with full suite” means use a lightweight freshness wait, not a full gate against stale deployment
- `commandExitCode` is not `gateStatus`
- deployed gate reports must separate target/start/end commits and required/optional check status

Updated:

- `AGENTS.md`
- `ai-collaboration/process/codex-operating-policy.md`
- `ai-collaboration/process/qa-validation-policy.md`
- `ai-collaboration/process/production-gate-policy.md`
- `ai-collaboration/process/handoff-template.md`

## Runtime-Window Helper

Added:

```bash
cd apps/web && corepack pnpm run qa:production:runtime-window -- --action status
cd apps/web && corepack pnpm run qa:production:runtime-window -- --action plan-enable
cd apps/web && corepack pnpm run qa:production:runtime-window -- --action plan-disable
```

v0 behavior:

- `status` is read-only
- `plan-enable` / `plan-disable` are read-only plans
- `enable` refuses without `--confirm-controlled-smoke`
- `disable` refuses without `--confirm-shutdown`
- even with confirmation, execute actions are intentionally deferred to v1
- no production flags are changed
- only planned runtime-window keys are:
  - `ENABLE_PAYMENT_RUNTIME`
  - `ENABLE_NEWEBPAY_CHECKOUT`

## Runtime-Window Status Result

Command:

```bash
cd apps/web && corepack pnpm run qa:production:runtime-window -- --action status
```

Result:

| Field | Value |
|---|---|
| commandExitCode | `0` |
| ok | `false` |
| environment | `production` |
| productionBaseUrl | `https://anyu.tw` |
| stateCategory | `alias_mismatch` |
| runtimeEnabled | `false` |
| checkoutEnabled | `false` |
| publicPagesStatus | pass: `/`, `/refund`, `/legal` return 200 |
| checkoutRouteStatus | fail-closed, 404 / `not_found` |
| fakePaidRouteStatus | fail-closed, 404 |
| operatorRouteStatus | fail-closed, 404 |
| canonicalProjectStatus | `pass` |
| aliasGuardStatus | `alias_target_unverified` |
| currentDeployCommit | present: `4d2a3caa5b50` |
| preflight readiness | `pass_ready_for_controlled_smoke` |
| recommendedNextAction | `resolve_alias_guard_before_runtime_enablement` |

Interpretation:

- production is fail-closed
- canonical local project linkage is correct
- production payment preflight still passes
- runtime-window readiness is blocked because exact alias target ownership could not be proven by the helper

## Plan-Enable Result

Command:

```bash
cd apps/web && corepack pnpm run qa:production:runtime-window -- --action plan-enable
```

Result:

- commandExitCode: `2`
- stateCategory: `alias_mismatch`
- aliasGuardStatus: `alias_target_unverified`
- planned keys only:
  - `ENABLE_PAYMENT_RUNTIME`
  - `ENABLE_NEWEBPAY_CHECKOUT`
- localMirrorFirst: true
- VercelSyncSecond: true
- deployFromRepoRootOnly: true
- no values printed
- no values changed

## Vercel Alias Guard Result

Alias checks attempted for:

- `anyu.tw`
- `www.anyu.tw`

Current status:

- aliasTargetDetected: false
- aliasProjectMatchesCanonical: unknown
- deploymentIdPresent: false
- gitCommitPresent from alias inspect: false
- production health environment: production
- production health gitCommitPresent: true
- canonical project local link: pass

Classification:

- `alias_target_unverified`
- treated as a blocker before runtime enablement

Reason:

- health endpoint proves production is reachable and reports production commit metadata
- root project link proves canonical local Vercel project linkage
- but exact alias target ownership could not be proven by the available alias inspection path
- per task rule, this cannot silently pass as “probably OK”

## Production Preflight Integration

Updated `qa:module01:production-preflight` to include `production_runtime_window_status`.

Command:

```bash
cd apps/web && corepack pnpm run qa:module01:production-preflight
```

Result:

| Field | Value |
|---|---|
| commandExitCode | `1` |
| gateStatus | `blocked` |
| requiredChecksStatus | `blocked` |
| productionPaymentPreflight | pass |
| productionRuntimeWindowStatus | blocked |
| blocker | `production_runtime_window_alias_target_unverified` |
| aliasGuardStatus | `alias_target_unverified` |
| runtimeWindowStatus | `alias_mismatch` |

This is the intended conservative result. Production smoke must not proceed until alias target proof is resolved or an explicitly accepted safer proof mechanism is added.

## Tests / Gates Run

| Command | Result |
|---|---|
| `cd apps/web && corepack pnpm exec vitest run src/tests/production-runtime-window.test.ts src/tests/production-payment-runtime-preflight.test.ts src/tests/module01-release-validation-suite.test.ts` | pass, 3 files / 38 tests |
| `cd apps/web && corepack pnpm lint` | pass |
| `cd apps/web && corepack pnpm test` | pass, 94 files / 647 tests |
| `cd apps/web && corepack pnpm build` | pass |
| `cd apps/web && corepack pnpm run qa:production:runtime-window -- --action status` | read-only, blocked on `alias_target_unverified` |
| `cd apps/web && corepack pnpm run qa:production:runtime-window -- --action plan-enable` | read-only plan, blocked on `alias_target_unverified` |
| `cd apps/web && corepack pnpm run qa:module01:production-preflight` | blocked on `production_runtime_window_alias_target_unverified` |

Skipped:

- `qa:module01:local`: skipped because lint, targeted tests, full tests, and build already covered the changed runtime-window/preflight code.
- `qa:module01:staging`: skipped because staging/deployed behavior did not change.
- `qa:module01:staging:channels`: not run; real Email/LINE remains owner-approved only.

## Production Safety

- production runtime enabled: no
- production checkout enabled: no
- production payment run: no
- Email sent: no
- LINE sent: no
- Vercel env modified: no
- provider credentials touched: no
- DB data mutated: no

## Remaining Blocker

`alias_target_unverified`

The runtime-window helper cannot prove that `anyu.tw` and `www.anyu.tw` aliases target a deployment belonging to canonical project `anyu-next`.

## Final Status

Production Runtime Window + Vercel Alias Guard v0 is implemented and correctly blocks runtime-window readiness on alias proof.

Recommended next task: resolve the alias target proof blocker before any production runtime enablement or controlled payment smoke retry.

