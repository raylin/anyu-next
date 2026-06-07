# LINE Production Bind Root-Cause Narrowing + Fix v0

Date: 2026-06-07

## Model / Effort

- Model used: GPT-5 Codex
- Reasoning effort used: high
- taskStartedAt: `2026-06-06T16:52:16Z`
- taskCompletedAt: `2026-06-06T23:45:04Z`
- totalWallClockDuration: about 6 hours 53 minutes
- humanWaitDuration: about 0 minutes
- netCodexWorkDuration: about 6 hours 53 minutes

## Scope

Narrowed and fixed the production LINE bind failure path without running another production smoke.

No production runtime, production checkout, production payment, production Email, production LINE message, production DB mutation, Vercel env change, secret rotation, theme UI, or Module 02 work occurred.

## Production Failure Context

Source: `ai-collaboration/reports/2026-06-06-controlled-production-payment-smoke-v1-clean-retry-final.md`

Safe facts from the failed smoke:

- environment asserted: production
- base URL: `https://anyu.tw`
- resultSourceCategory: `production_runtime`
- production runtime was temporarily enabled only after gates passed
- a fresh production Module 01 result was created
- owner attempted mobile LINE bind
- LINE bind failed after LINE login redirect
- no payment was run
- no production Email or LINE message was sent
- production was disabled and redeployed fail-closed
- first failure category: `line_bind_failed`

The failed smoke report did not contain a source-categorized production result ID. A local `.qa` result artifact existed, but it was not used as evidence because it had no production source category and predated the failed smoke attempt.

## Admin CLI Diagnostics Result

`pnpm ops lookup-line-bind --env production --result-id <resultId>` was not run for the failed attempt.

Reason:

- no exact source-categorized failed production result ID was safely recorded
- pre-payment LINE bind diagnostics were added after the failed attempt
- querying an unrelated or ambiguous result would risk reporting the wrong production context

Expected diagnostic state for the failed attempt:

- `no_events_found`, because persisted diagnostics were not deployed at the time of failure

No direct DB lookup was used.

## Staging / Production LIFF Config Comparison

Checked key-name/config presence only; no values or value-derived metadata were printed.

Local mirrors:

- `apps/web/.env.staging` contains `NEXT_PUBLIC_LINE_LIFF_URL` and `NEXT_PUBLIC_LINE_LIFF_ID`
- `apps/web/.env.production` contains `NEXT_PUBLIC_LINE_LIFF_URL` and `NEXT_PUBLIC_LINE_LIFF_ID`

Vercel targets:

- Vercel Preview(staging) has `NEXT_PUBLIC_LINE_LIFF_URL` and `NEXT_PUBLIC_LINE_LIFF_ID`
- Vercel Production has `NEXT_PUBLIC_LINE_LIFF_URL` and `NEXT_PUBLIC_LINE_LIFF_ID`
- host values are encrypted/protected, so only key-name presence was verified

Deployment/source:

- root `.vercel/project.json` points to canonical project `anyu-next`
- root deployment configuration uses `apps/web` as project root
- `apps/web` itself is intentionally not the linked Vercel CLI directory

No LINE console or Vercel env action was identified from key-name comparison.

## Bind Bridge Root Cause

Root cause classification:

- `line_liff_redirect_state_collision`

The LINE bind URL used the generic query key `state` to carry ANYU's signed recovery bind token.

Problem:

- LINE OAuth also uses the query key `state`.
- After `liff.login()` redirect, the returned URL can contain LINE OAuth's `state` value.
- The old parser read `state` before `rlb`.
- If LINE returned `?state=<oauth-state>&rlb=<valid-anyu-state>`, the parser could select the OAuth state and ignore the valid ANYU bind token.
- This matches the production symptom: bind failed only after LINE login redirect, before payment.

Additional fragility:

- `LineRecoveryBindBridge` passed `window.location.href` directly as the LIFF login `redirectUri`.
- That preserved unrelated OAuth/search/hash state and made the post-login URL harder to reason about.

## Fix Implemented

Changed the outbound and return bind-state handling:

- `createLineRecoveryBindHref()` now emits `rlb=<signed-bind-token>` instead of `state=<signed-bind-token>`.
- `parseLineRecoveryBindContext()` now evaluates `state` and `rlb` independently and chooses whichever value has a valid ANYU recovery-bind token shape.
- Nested `liff.state` parsing now supports the same collision-safe `state` / `rlb` behavior.
- `LineRecoveryBindBridge` now builds a canonical `redirectUri` for `liff.login()`:
  - clears unrelated search/hash
  - carries only `rlb=<signed-bind-token>`
  - preserves safe `returnPath` when present

The fix does not:

- weaken idToken validation
- accept missing LINE identity
- bypass signed bind-state verification
- bypass the recipient-secret invariant
- store raw LINE user ID outside the encrypted recipient-secret path
- expose raw state, tokens, hashes, encrypted recipient, or tokenized URLs

## Tests Added / Updated

Updated tests cover:

- outbound LINE bind href uses `rlb`
- `rlb` token resolves through existing signed-state verifier
- direct OAuth `state` collision plus valid `rlb` picks `rlb`
- nested `liff.state` OAuth collision plus valid `rlb` picks `rlb`
- LIFF bridge login redirects through canonical `rlb` redirect URI
- checkout-start and completed-result LINE CTA expectations use `rlb`
- existing back-compat parser behavior for valid `state=rlb_...` remains covered

## Validation

Run:

| Command | Result |
|---|---|
| `cd apps/web && corepack pnpm vitest run src/tests/line-recovery-liff-page.test.tsx src/tests/line-recovery-bind-state.test.ts src/tests/line-recovery-bind-diagnostics.test.ts src/tests/newebpay-checkout-start-page.test.tsx src/tests/paid-result-recovery-save-section.test.tsx src/tests/line-recovery-bind-route.test.ts src/tests/line-bind-diagnostic-events.test.ts src/tests/line-recovery-bind-diagnostics-route.test.ts src/tests/admin-line-bind-diagnostics-route.test.ts` | pass, 9 files / 50 tests |
| `cd apps/web && corepack pnpm lint` | pass |
| `cd apps/web && corepack pnpm test` | pass, 92 files / 631 tests |
| `corepack pnpm --filter @anyu/admin-cli test` | pass, 2 files / 23 tests |
| `cd apps/web && corepack pnpm build` | pass |
| `cd apps/web && corepack pnpm run qa:module01:mock-flow` | pass, 15 files / 125 tests |
| `cd apps/web && corepack pnpm run qa:module01:ui` | pass after sandbox-escalated browser rerun |
| `cd apps/web && corepack pnpm run qa:module01:local` | pass |
| `cd apps/web && corepack pnpm run qa:module01:staging` | exit 0; required staging checks pass on pushed commit, suite summary `partial` only because optional Admin API/CLI lookup was skipped without explicit `ADMIN_API_TOKEN` |

## Correction: Deployed Gate Freshness

Correction added 2026-06-07:

The first `qa:module01:staging` run for this fix is not clean validation of commit `cfd4658`. It started while Preview(staging) still served old commit `42e9c2d`, and the deployment changed during the same full gate run. That run should be classified as `mixed_deployment_gate_invalid` for target-fix evidence.

Follow-up guard:

- `qa:deploy:freshness` was added in Deployed Gate Freshness + Report Format Guard v0.
- The clean rerun used targetDeployCommit `29de59f`, which includes the LINE redirect-state fix plus freshness guard.
- The lightweight freshness wait started on `6226d2e4bc96` and ended on `29de59fa4d10`.
- The substantive `qa:module01:staging` run then started and ended on `29de59fa4d10`.
- Clean rerun fields:
  - `freshnessStatus=pass`
  - `mixedDeploymentDetected=false`
  - `requiredChecksStatus=pass`
  - `optionalChecksStatus=partial`
  - `gateStatus=partial`
  - `commandExitCode=0`

The `partial` status is due to optional Admin API/CLI lookup checks being skipped without explicit shell `ADMIN_API_TOKEN`; required staging checks passed and no real Email/LINE was sent.

Skipped:

- `qa:module01:production-preflight`: skipped because production/env/preflight behavior did not change and production was not deployed or enabled.
- `qa:module01:staging:channels`: not run; real Email/LINE checks remain owner-approved only.

## Root Cause Status

Fixed in code:

- `line_liff_redirect_state_collision`

No confirmed owner LINE console action is required from this task.

If staging or the next production runtime window still fails LINE bind, the next diagnostic should use:

- `pnpm ops lookup-line-bind --env staging --result-id <resultId>`
- `pnpm ops lookup-line-bind --env production --result-id <resultId>`

## Production / Channel Safety

- Production runtime: not enabled.
- Production checkout: not enabled.
- Production payment: not run.
- Production Email: not sent.
- Production LINE: not sent.
- Vercel env: not modified.
- Production data: not mutated.

## Theme Route Preservation

Theme Architecture remains archived and preserved. This task does not implement theme UI and does not alter the Hybrid Theme Park / Module 01 Riso-only future track.

## Staging Verification

Preview(staging) served the pushed fix during `qa:module01:staging`:

- staging health observed pushed commit `cfd4658`
- staging env mirror check passed
- access-link smoke passed
- no-card checkout/result path passed
- production fail-closed read-only checks passed
- no real Email or LINE channel sends occurred

The staging suite summary was `partial` only because optional Admin API and Admin CLI checks were skipped without an explicit shell `ADMIN_API_TOKEN`. This was non-blocking under the current suite policy and did not affect the deployed LINE redirect-state verification.

## Remaining Blockers

- No code-level blocker remains from this task.
- Production Runtime Window + Vercel Alias Guard remains the next mainline step before any production smoke retry.

## Final Status

LINE Production Bind Root-Cause Narrowing + Fix v0 is complete. The fix targets the production LINE login redirect failure by removing the query-state collision and making LIFF login redirect state deterministic, with local/mock/UI/staging validation completed.
