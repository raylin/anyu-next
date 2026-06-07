# Vercel Alias Target Proof Resolution v0

## Format Alignment Note

This report predates the formal canonical report template but includes the required timing, validation, safety, result, blocker, and next-step fields. Future reports should use `ai-collaboration/process/report-template.md`.

## Timing / Execution

- Model used: GPT-5 Codex
- Reasoning / effort level: high
- taskStartedAt: 2026-06-07T00:28:26Z
- taskCompletedAt: 2026-06-07T00:34:02Z
- totalWallClockDuration: about 6 minutes
- humanWaitDuration: about 0 minutes
- netCodexWorkDuration: about 6 minutes

## Goal

Resolve the production runtime-window blocker `alias_target_unverified` so production readiness can prove that `anyu.tw` and `www.anyu.tw` point to deployments belonging to canonical Vercel project `anyu-next`.

No production runtime was enabled. No payment, Email, LINE, Vercel env change, DB mutation, migration, theme work, or Module 02 work occurred.

## Project Metadata Inspected

- Root Vercel project metadata: present.
- Root project name: `anyu-next`.
- Root project ID: present in `.vercel/project.json`.
- Root org/scope metadata: present in `.vercel/project.json`.
- Root directory: `apps/web`.
- `apps/web/.vercel/project.json`: absent, which avoids an app-local project mismatch.

Project IDs and org IDs were treated as deployment metadata, not secrets. No auth tokens or env values were printed.

## Alias Proof Methods Evaluated

| Method | Result | Safe fields available | Automated preflight suitability |
| --- | --- | --- | --- |
| `vercel alias inspect <host>` | Insufficient for this case | Did not provide reliable deployment/project proof through the helper path | Not selected |
| `vercel inspect https://anyu.tw` | Successful | deployment ID presence, project name, target, ready status, alias listing | Selected |
| `vercel inspect https://www.anyu.tw` | Successful | deployment ID presence, project name, target, ready status, alias listing | Selected |
| Alias `/api/health` | Successful supporting evidence | environment category and git commit presence | Supporting evidence only |
| Health endpoint alone | Insufficient | production environment and git commit presence, but no project ownership proof | Explicitly remains non-passing alone |

## Selected Proof Method

The runtime-window helper now uses `vercel inspect https://<alias>` for each required production alias:

- `https://anyu.tw`
- `https://www.anyu.tw`

The helper captures both stdout and stderr because the Vercel CLI writes useful inspect metadata to its formatted output stream. It parses only safe metadata:

- deployment ID present boolean
- project name/id present boolean
- project canonical match boolean
- deployment target category
- deployment ready boolean
- alias listed on deployment boolean
- alias health environment category
- alias health git commit presence boolean

It does not print Vercel auth tokens, env values, secret values, lengths, prefixes, suffixes, hashes, checksums, or tokenized URLs.

## Alias Proof Result

### `anyu.tw`

- aliasTargetDetected: true
- aliasProjectMatchesCanonical: true
- aliasTargetDeploymentIdPresent: true
- aliasTargetProjectNameOrIdPresent: true
- aliasDeploymentTarget: production
- aliasDeploymentReady: true
- aliasListedOnDeployment: true
- aliasHealthEnvironment: production
- aliasHealthGitCommitPresent: true

### `www.anyu.tw`

- aliasTargetDetected: true
- aliasProjectMatchesCanonical: true
- aliasTargetDeploymentIdPresent: true
- aliasTargetProjectNameOrIdPresent: true
- aliasDeploymentTarget: production
- aliasDeploymentReady: true
- aliasListedOnDeployment: true
- aliasHealthEnvironment: production
- aliasHealthGitCommitPresent: true

Overall `aliasGuardStatus`: pass.

## Runtime-Window Result

Command:

```bash
cd apps/web && corepack pnpm run qa:production:runtime-window -- --action status
```

Result:

- commandExitCode: 0
- ok: true
- stateCategory: fail_closed_ready
- runtimeEnabled: false
- checkoutEnabled: false
- public pages: 200 for `/`, `/refund`, `/legal`
- checkout route: fail-closed
- fake-paid route: fail-closed
- operator route: fail-closed
- canonicalProjectStatus: pass
- aliasGuardStatus: pass
- production payment preflight readiness inside helper: pass_ready_for_controlled_smoke
- recommendedNextAction: keep_production_fail_closed_until_controlled_smoke_task

## Production Preflight Result

Command:

```bash
cd apps/web && corepack pnpm run qa:module01:production-preflight
```

Result:

- commandExitCode: 0
- gateStatus: pass
- requiredChecksStatus: pass
- optionalChecksStatus: not_applicable
- productionRuntimeWindowStatus: pass
- productionPaymentPreflight: pass
- runtimeWindowStatus: fail_closed_ready
- aliasGuardStatus: pass
- blockers: none
- warnings: none
- nextRequiredAction: production_stays_frozen_until_owner_gate

## Tests / Gates Run

- `cd apps/web && corepack pnpm exec vitest run src/tests/production-runtime-window.test.ts src/tests/production-payment-runtime-preflight.test.ts src/tests/module01-release-validation-suite.test.ts`: pass, 3 files / 43 tests.
- `cd apps/web && corepack pnpm lint`: pass.
- `cd apps/web && corepack pnpm test`: pass, 94 files / 652 tests.
- `cd apps/web && corepack pnpm build`: pass.
- `cd apps/web && corepack pnpm run qa:production:runtime-window -- --action status`: pass, read-only.
- `cd apps/web && corepack pnpm run qa:module01:production-preflight`: pass.

Skipped:

- `qa:module01:local`: skipped because no Module 01 runtime behavior changed; lint, targeted tests, full tests, build, runtime-window status, and production-preflight covered the changed preflight/helper surface.
- `qa:module01:staging`: skipped because no staging/deployed behavior changed.
- `qa:module01:staging:channels`: skipped because this task did not include real channel approval.

## Blocker Status

Resolved:

- `production_runtime_window_alias_target_unverified`

Current production readiness:

- Production remains fail-closed.
- Runtime-window alias proof passes.
- Production preflight passes.
- Runtime enablement remains owner-gated and task-gated.

## Production Safety

- Production runtime enabled: no.
- Production checkout enabled: no.
- Production payment run: no.
- Email sent: no.
- LINE sent: no.
- Vercel env modified: no.
- DB mutated: no.
- Migrations applied: no.
- Provider credentials touched: no.
- Secrets/private values printed: no.

## Theme Route Preservation

Theme Architecture remains archived and preserved. Hybrid Theme Park Model, Module 01 Riso-only, and Core Shell neutral editorial remain future implementation tracks. This alias proof task did not implement or discard any theme work.

## Recommended Next Task

Controlled Production Payment Smoke retry using the runtime-window helper, only after explicit owner approval.
