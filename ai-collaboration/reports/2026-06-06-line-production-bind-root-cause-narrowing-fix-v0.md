# LINE Production Bind Root-Cause Narrowing + Fix v0

Date: 2026-06-07

## Model / Effort

- Model used: GPT-5 Codex
- Reasoning effort used: high
- taskStartedAt: `2026-06-06T16:52:16Z`
- taskCompletedAt: `2026-06-06T23:39:29Z`
- totalWallClockDuration: about 6 hours 47 minutes
- humanWaitDuration: about 0 minutes
- netCodexWorkDuration: about 6 hours 47 minutes

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

Pending after push:

- `qa:module01:staging`, because deployed client/link behavior changed and should be verified after Preview(staging) serves the fix.

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

## Remaining Blockers

- Preview(staging) must serve this commit and pass `qa:module01:staging` before returning to a production runtime window.
- Production runtime window and alias guard remains the next mainline step after staging verification.

## Final Status

LINE Production Bind Root-Cause Narrowing + Fix v0 is code-complete locally. The fix targets the production LINE login redirect failure by removing the query-state collision and making LIFF login redirect state deterministic.

