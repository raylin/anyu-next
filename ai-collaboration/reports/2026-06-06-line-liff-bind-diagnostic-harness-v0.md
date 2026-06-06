# LINE / LIFF Bind Diagnostic Harness v0

Date: 2026-06-07

## Model / Effort

- Model used: GPT-5 Codex
- Reasoning effort used: high
- taskStartedAt: `2026-06-06T16:18:33Z`
- taskCompletedAt: `2026-06-06T16:22:51Z`
- totalWallClockDuration: about 4 minutes
- humanWaitDuration: about 0 minutes
- netCodexWorkDuration: about 4 minutes

## Scope

Built a local/testable LINE / LIFF bind diagnostic harness. No production runtime, production checkout, payment, Email, LINE message, Vercel env change, secret rotation, DB mutation, migration, theme UI, or Module 02 work occurred.

## Current LIFF Bind State Machine Inventory

Current runtime flow before this task:

1. Checkout/result page generates a LINE recovery bind href using `createLineRecoveryBindHref()`.
2. The user opens `/line/recovery/bind` or the legacy `/line/fulfill` compatibility entry with `state=rlb_...` or `liff.state=...`.
3. `LineRecoveryBindBridge` parses direct query plus browser search/hash through `parseLineRecoveryBindContext()`.
4. The bridge loads the LIFF SDK script.
5. The bridge initializes LIFF with `NEXT_PUBLIC_LINE_LIFF_ID`.
6. If not logged in, it calls `liff.login({ redirectUri: window.location.href })`.
7. After LINE redirects back, the bridge parses `liff.state` / direct query again.
8. If logged in, the bridge calls `liff.getIDToken()`.
9. The bridge POSTs `{ state, idToken }` to `/api/line/recovery/bind-liff`.
10. The route verifies the signed `rlb_` state and the LINE ID token.
11. The route writes hash-only LINE contact plus active encrypted recipient secret.
12. On success, the route returns a safe `returnPath` with `lineRecovery=line_saved`.
13. On failure, the route returns safe errors such as `state_expired`, `state_invalid`, `line_user_missing`, or `bind_failed` with `bindCategory`.

Gap before this task:

- Client-side LIFF/redirect failures were mostly collapsed into generic fallback copy.
- Local tests covered server route behavior and context parsing, but not a pure state machine for SDK load/init/login/idToken/bind API failure categories.

## Adapter / Seam Added

Added:

- `apps/web/src/lib/line/recovery-bind-diagnostics.ts`

The seam is pure and locally testable. It evaluates:

- parsed recovery bind context
- LIFF ID configured / missing
- SDK load success/failure
- LIFF init success/failure
- logged-in vs login redirect
- idToken present / missing
- bind API success/failure

`LineRecoveryBindBridge` now consumes this seam to set a safe hidden diagnostic category with `data-line-diagnostic-category`. User-facing fallback copy remains safe and does not expose private values.

## Diagnostic Categories Added

Supported safe categories:

- `liff_sdk_load_failed`
- `liff_init_failed`
- `liff_login_redirect_started`
- `liff_state_missing`
- `liff_state_invalid`
- `liff_state_expired`
- `id_token_missing_after_login`
- `bind_api_state_missing`
- `bind_api_state_invalid`
- `bind_api_line_identity_missing`
- `bind_api_recipient_secret_failed`
- `bind_api_failed`
- `bind_success`

The diagnostic helper rejects unsafe serialized diagnostic output containing token-like values, raw idToken labels, raw LINE user ID labels, encrypted recipient labels, hashes, or provider payload labels.

## Tests Added

Added:

- `apps/web/src/tests/line-recovery-bind-diagnostics.test.ts`

Updated:

- `apps/web/src/tests/line-recovery-liff-page.test.tsx`
- `apps/web/src/tests/module01-mock-flow-qa.test.ts`

Coverage added:

- valid LIFF state + idToken + bind API success → `bind_success`
- missing state → `liff_state_missing`
- invalid state → `liff_state_invalid`
- expired state from bind API → `liff_state_expired`
- SDK load failure → `liff_sdk_load_failed`
- LIFF init failure → `liff_init_failed`
- not logged in → `liff_login_redirect_started`
- after login but missing idToken → `id_token_missing_after_login`
- bind API recipient-secret failure → `bind_api_recipient_secret_failed`
- bind API state/identity failures → safe bind API categories
- unsafe diagnostic output rejection
- rendered recovery bind fallback includes hidden safe diagnostic category

## Playwright / Component Harness Result

Implemented pure state-machine tests plus existing server-render/component tests for the recovery bind page.

Did not add a Playwright LIFF route harness in this task because the pure seam now covers the categories without a browser-global-heavy setup. Concrete follow-up if needed:

- `LINE / LIFF Bind Playwright Harness v0`: mocked LIFF SDK injection for `/line/recovery/bind`, validating login redirect start, return with fake idToken, missing idToken fallback, bind API failure fallback, and no real LINE calls.

## Mock-Flow Integration

Updated `qa:module01:mock-flow` scenario summary with:

- `line_liff_bind_success`
- `line_liff_missing_state`
- `line_liff_missing_id_token`
- `line_bind_recipient_secret_failure`
- `line_email_fallback_after_bind_failure`

`qa:module01:mock-flow` now runs `src/tests/line-recovery-bind-diagnostics.test.ts` and reports these scenarios as local/no-provider coverage.

## Admin API / Ops Diagnostic Gap Assessment

Admin API pre-payment bind diagnostics are still likely needed.

Reason:

- This task provides local deterministic categories and hidden client-side category output.
- It does not persist bind attempts.
- A production pre-payment failure before any paid result exists still cannot be queried through the existing paid-result Admin API.

Recommended next task:

- **Admin API Pre-Payment Bind Diagnostics v0**, if owner wants ops visibility into recent bind attempts without screenshots or direct DB.

Safe boundary for that task:

- read-only/sanitized categories only
- no raw LINE ID, idToken, signed state, encrypted recipient, hashes, or tokenized URLs
- no production mutation endpoint

If Admin API diagnostics are deferred, the next implementation task should use these categories to fix the production LINE bind failure with targeted/mock/UI/staging validation.

## Validation

Run:

| Command | Result |
|---|---|
| `cd apps/web && corepack pnpm exec vitest run src/tests/line-recovery-bind-diagnostics.test.ts src/tests/line-recovery-liff-page.test.tsx src/tests/line-recovery-bind-route.test.ts src/tests/module01-mock-flow-qa.test.ts` | pass, 4 files / 23 tests |
| `cd apps/web && corepack pnpm lint` | pass |
| `cd apps/web && corepack pnpm test` | pass, 89 files / 621 tests |
| `cd apps/web && corepack pnpm build` | pass |
| `cd apps/web && corepack pnpm run qa:module01:mock-flow` | pass |
| `cd apps/web && corepack pnpm run qa:module01:ui` | pass |
| `cd apps/web && corepack pnpm run qa:module01:local` | pass |

Skipped:

- `qa:module01:staging`: skipped because this task added a local diagnostic seam and hidden safe category output, not deployed integration behavior that requires Preview verification.
- `qa:module01:production-preflight`: skipped because production/env/preflight behavior did not change.
- `qa:module01:staging:channels`: not run; real Email/LINE is owner-approved only.

## Opportunistic Cleanup

Directly related cleanup completed:

- Replaced duplicated client fallback message branching with a centralized diagnostic message mapper.
- Added a hidden safe category output for deterministic component/report inspection without exposing private values.

No unrelated refactor or product behavior expansion was performed.

## Remaining Gaps

- The current harness does not persist bind attempts.
- Existing Admin API cannot query a pre-payment bind failure when no result support state is available.
- Playwright does not yet mock the full LIFF SDK browser bridge on a real route.
- The actual production failure may still require safe deployed/staging reproduction after the fix candidate is identified.

## Theme Route Preservation

Theme Architecture remains archived and preserved. This task does not implement theme UI and does not change the Module 01 Riso-only future implementation track.

## Final Status

LINE / LIFF Bind Diagnostic Harness v0 is complete. The local foundation can now classify the LIFF bridge failure surface without real LINE or production.

Recommended next task: **Admin API Pre-Payment Bind Diagnostics v0** if owner wants persisted/ops-visible bind attempts; otherwise **LINE production bind fix with targeted/mock/UI/staging validation**.
