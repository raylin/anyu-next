# LINE Recovery LIFF Page / UI Entry v0

Date: 2026-06-01
Task: LINE Recovery LIFF Page / UI Entry v0

## Completed Work

- Added recovery-specific LIFF page route:
  - `/line/recovery/bind`
- Added client bridge:
  - `apps/web/src/components/line/LineRecoveryBindBridge.tsx`
- Added safe recovery LIFF context parser:
  - `apps/web/src/lib/line/recovery-liff-context.ts`
- Added tests:
  - `apps/web/src/tests/line-recovery-liff-page.test.tsx`
- Kept legacy LINE fulfillment route/UI unchanged.

## Recovery Semantics

The page copy uses recovery language only:

- "用 LINE 保存這份報告"
- "之後可以透過 LINE 協助找回"
- "LINE 綁定失敗也不影響付款或查看報告"
- "你可以回到原頁，改用 Email 保存"

It does not promise LINE paid report delivery and does not use legacy fulfillment language such as "LINE 領取完整分析".

## LIFF Bind Behavior

The page:

1. Reads `state` or `rlb` from query params.
2. Also supports LIFF `liff.state` carrying `/line/recovery/bind?state=...`.
3. Checks that the state has `rlb_` shape and does not contain token-like or legacy provider/fulfillment markers.
4. Loads the LIFF SDK.
5. Initializes LIFF with `NEXT_PUBLIC_LINE_LIFF_ID`.
6. Requires LINE login through LIFF if needed.
7. Obtains LIFF `idToken`.
8. Calls `POST /api/line/recovery/bind-liff` with only:
   - `state`
   - `idToken`
9. Navigates to the safe `returnPath` returned by the route.

The page does not read or render raw LINE user IDs.

## Non-LINE / Desktop Fallback

If state is missing/invalid, LIFF config is missing, ID token is unavailable, or binding fails, the page shows safe fallback copy:

- open in LINE if possible
- return to the original safe recovery surface when available
- use Email save as fallback
- checkout/report access is not blocked

The fallback does not call legacy fulfillment and does not expose any tokenized access URL.

## Token / Raw ID Exclusion

The parser rejects client state containing:

- `pa_` token-like values
- `pcs_` token-like values
- `unlockToken`
- `fulfillmentCode`
- `TradeInfo`
- `TradeSha`

The rendered page and tests avoid exposing:

- raw `pa_`
- raw `pcs_`
- unlock tokens
- short codes
- raw LINE user IDs
- report content

## Legacy-Only Inventory

Reused:

- LIFF SDK loading pattern from `LineFulfillBridge`.
- Existing `getLineLiffId`.
- Existing recovery bind route.

Kept legacy-only:

- `LineFulfillBridge`
- `/line/fulfill`
- `/m/[moduleSlug]/line/fulfill`
- `/api/line/fulfillment/bind-liff`
- webhook short-code fulfillment flow

No legacy unlock/fulfillment semantics were reused in the recovery page.

## Staging LIFF Smoke

Owner-assisted real LINE in-app staging smoke was not run in this task because it requires a LINE mobile context/test account and a live generated `rlb_` state from future UI entry wiring.

Current proof is route/component/unit coverage plus full app validation. A staging LIFF smoke should be run after a visible LINE recovery CTA creates the `rlb_` state and points to this page.

## Production Safety

- No production env changes.
- No production DB migration.
- No payment provider changes.
- No LINE push.
- No Email sending.
- No membership/login.
- Production payment runtime remains disabled.

## Validation

- `cd apps/web && corepack pnpm test -- src/tests/line-recovery-liff-page.test.tsx src/tests/line-recovery-bind-route.test.ts src/tests/line-recovery-bind-state.test.ts src/tests/line-fulfillment.test.ts src/tests/line-route-hardening.test.ts`: passed; 68 files / 437 tests.
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed; 68 files / 437 tests.
- `cd apps/web && corepack pnpm build`: passed.
- docs presence check: passed.
- dashboard HTML sanity: passed.
- `git diff --check`: passed.
- diff-level secret/token scan: passed.

## Tech Debt Review

- New technical debt introduced: the LIFF page exists, but no checkout-start/paid-result UI CTA generates `rlb_` state and links to it yet.
- Existing technical debt observed: legacy LINE fulfillment still exists and should remain isolated from recovery semantics.
- Opportunistic cleanup completed: none.
- Deferred cleanup candidates: visible LINE recovery CTA wiring and owner-assisted staging LIFF smoke.

## Recommended Next Steps

1. `Checkout / Paid Result LINE Recovery CTA Wiring v0` to generate `rlb_` state and link to `/line/recovery/bind`.
2. Owner-assisted staging LIFF bind smoke with a test LINE account.
3. Continue keeping LINE as recovery identity only, not paid report delivery.
