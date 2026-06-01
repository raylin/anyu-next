# LINE Recovery Bind Route / LIFF Callback v0

Date: 2026-06-01
Task: LINE Recovery Bind Route / LIFF Callback v0

## Completed Work

- Added recovery-specific LIFF bind route:
  - `POST /api/line/recovery/bind-liff`
- The new route consumes signed `rlb_` recovery state and a LIFF ID token.
- The route verifies LINE identity with the existing `verifyLineIdToken` helper.
- The route binds the verified LINE identity to `payment_recovery_contacts` through the existing hash-only recovery contact helper.
- Added route tests in `apps/web/src/tests/line-recovery-bind-route.test.ts`.
- Kept the legacy LINE fulfillment/unlock route unchanged.
- Updated dashboard and summary log with the new LINE recovery route status.

## Reused vs Legacy-Only Inventory

Reused:

- `verifyLineIdToken` from `apps/web/src/lib/line/liff.ts` for server-side LINE identity verification.
- `resolveLineRecoveryBindStateToken` and `bindVerifiedLineUserToRecoveryContact` from the recovery bind-state helper.
- `payment_recovery_contacts` service helpers for hash-only LINE recovery identity persistence.

Kept legacy-only:

- `ContactCapture` remains notification/support-oriented and is not used for recovery binding.
- `LineFulfillBridge` remains legacy fulfillment UI.
- `/api/line/fulfillment/bind-liff` remains unlock-token/short-code/link-delivery specific.
- `/api/line/webhook` remains legacy code matching/reply flow and is not used for paid result recovery binding.

## Route / Callback Behavior

Route contract:

- Method: `POST`
- Path: `/api/line/recovery/bind-liff`
- Body:
  - `state`: signed `rlb_` recovery bind state
  - `idToken`: LIFF ID token

Success response:

- `ok: true`
- `status: success`
- `recoveryContactStatus: verified | bound`
- safe internal `returnPath` with `lineRecovery=line_saved`

Failure response:

- sanitized `ok: false`
- error category only
- safe internal `returnPath` when the state is valid enough to trust the original recovery surface

No redirect is forced by the route in v0. A future LIFF client page can navigate to the returned safe `returnPath`.

## Failure / Fallback Behavior

Handled categories:

- `config_error`
- `invalid_json`
- `state_missing`
- `state_invalid`
- `state_expired`
- `line_user_missing`
- `bind_failed`

If LINE identity is missing or unverifiable, the route returns `line_user_missing` and includes a safe return path with `lineRecovery=line_error` when possible. Checkout/report access is not blocked, and Email remains the fallback channel.

## Token / Raw ID Exclusion Guarantees

The new route does not accept or return:

- raw paid access tokens
- raw checkout session tokens
- unlock tokens
- short codes
- tokenized access URLs
- provider payloads
- report content
- raw LINE user IDs
- raw Email

The route verifies LINE identity server-side and passes the verified LINE user ID directly to the hash-only recovery helper. Tests assert the raw LINE ID and ID token are not present in the JSON response or stored recovery contact fields.

## Data Mapping

Successful binding creates or updates `payment_recovery_contacts` with:

- `contact_type=line`
- `contact_hash` / `line_user_hash` derived from the recovery contact hash secret
- `contact_encrypted=null`
- `email_hash=null`
- source copied from state: `checkout_start`, `paid_ready`, or `completed_result`
- transactional consent recorded
- marketing opt-in recorded only when requested in state
- status `bound` if `entitlementId` exists, otherwise `verified`

## UI Scope

No visible UI was added in this task.

The route is ready for a future recovery-specific LIFF page or checkout/result UI link. Copy should remain:

- "用 LINE 保存這份報告"
- "之後可以透過 LINE 協助找回"

It must not become:

- "LINE 領取完整分析"
- "完整報告會傳到 LINE"

## Staging QA

- Full owner-assisted LIFF staging smoke was not run in this task because it requires an actual LIFF/browser LINE context and test account action.
- Existing staging no-card QA regression was run and passed:
  - result CTA available
  - checkout-start renders recovery gate
  - operator fake-paid completes
  - queue completes paid generation
  - paid access renders
  - production checkout/fake-paid remain fail-closed

## Production Safety

- No production env changes.
- No production DB migration.
- No LINE push.
- No Email sending.
- No payment provider behavior changes.
- Production payment runtime remains disabled/fail-closed.

## Validation

- `cd apps/web && corepack pnpm test -- src/tests/line-recovery-bind-route.test.ts src/tests/line-recovery-bind-state.test.ts src/tests/line-route-hardening.test.ts src/tests/payment-recovery-contacts.test.ts src/tests/payment-recovery-email-route.test.ts`: passed; 67 files / 431 tests.
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed; 67 files / 431 tests.
- `cd apps/web && corepack pnpm build`: passed.
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`: passed.

## Tech Debt Review

- New technical debt introduced: route returns JSON for a future LIFF client page to navigate; no visible LIFF UI page exists yet.
- Existing technical debt observed: legacy LINE fulfillment still contains unlock-token/short-code/link-delivery semantics and raw LINE ID storage outside the new recovery flow.
- Opportunistic cleanup completed: none beyond route/test isolation.
- Deferred cleanup candidates: build a recovery-specific LIFF page and later contain or retire legacy LINE fulfillment once recovery binding is stable.

## Suggested Next Steps

1. `LINE Recovery LIFF Page / UI Entry v0` to add a minimal client page/link that calls this route and returns to checkout/paid result with safe status.
2. Owner-assisted staging LIFF smoke with a test LINE account.
3. If LINE route replay or diagnostics become necessary, add DB-backed single-use bind intent in a separate schema-approved task.
