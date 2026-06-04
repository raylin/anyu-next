# Production LINE Bind Identity Completion Fix v0

Date: 2026-06-04

## Completed Work

- Saved the handoff before diagnosis.
- Inspected the LINE recovery bind client, LIFF context parser, LIFF config helpers, and bind API route.
- Identified where `LINE 身分確認沒有完成` is emitted.
- Checked Production LINE env-name presence only.
- Implemented a narrow LIFF identity-source alignment fix.
- Added regression tests.
- Ran targeted LINE tests, lint, full tests, and build.
- Committed and pushed the code fix.
- Deployed the fix to canonical Production project `anyu-next` while runtime remained disabled.
- Verified Production public pages and fail-closed routes.
- Opened a short runtime/checkout window only for owner LINE bind retry.
- Owner verified mobile LINE bind succeeded.
- Owner observed desktop browser still fails, which is expected for a non-LINE LIFF identity context.
- Disabled runtime/checkout again, redeployed Production fail-closed, and verified safety.

## Root Cause

The failure was consistent with LIFF identity source mismatch risk:

- The checkout CTA is generated from `NEXT_PUBLIC_LINE_LIFF_URL`.
- The browser bridge previously initialized LIFF from `NEXT_PUBLIC_LINE_LIFF_ID`.
- Production has both env names present.
- If the two values differ, the user can open the configured LIFF URL while the frontend initializes a different LIFF app/channel.
- In that state, `window.liff.getIDToken()` can return empty and the client displays `LINE 身分確認沒有完成`.

The visible failure was emitted client-side in `LineRecoveryBindBridge` when `getIDToken()` returned no token after LIFF init/login.

No validation was weakened. The server still requires a verified LINE ID token and never accepts raw client-provided LINE user IDs.

## Fix Applied

- Added `getLineLiffIdFromUrl`.
- Updated `getLineLiffId` to derive LIFF ID from `NEXT_PUBLIC_LINE_LIFF_URL` first.
- Updated LINE Login channel ID derivation to use the same URL-derived LIFF ID when no explicit `LINE_LOGIN_CHANNEL_ID` is configured.
- Kept explicit `LINE_LOGIN_CHANNEL_ID` as the highest-priority server-side override.
- Kept legacy `NEXT_PUBLIC_LINE_LIFF_ID` as fallback only.

This makes the LIFF entry URL and frontend initialization use the same LIFF app by default.

## Production Env / Config Findings

Presence-only check confirmed these Production LINE-related names exist:

- `NEXT_PUBLIC_LINE_LIFF_URL`
- `NEXT_PUBLIC_LINE_LIFF_ID`
- `LINE_RECOVERY_MESSAGE_PROVIDER`
- `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`
- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_CHANNEL_SECRET`

No values, lengths, prefixes, suffixes, hashes, checksums, id tokens, LIFF states, cookies, raw LINE IDs, encrypted recipients, or tokenized URLs were printed.

Owner-side LINE Developers checklist remains useful if future issues recur:

- LIFF app endpoint points to Production `anyu.tw` flow.
- LIFF app/channel matches the production LINE Login/Messaging channel.
- OpenID/profile scopes are enabled if required by the LIFF app.
- Production domain settings allow the ANYU domain.
- No staging or old Vercel project endpoint remains configured.

## Validation

- `corepack pnpm --dir apps/web test -- src/tests/line-fulfillment.test.ts src/tests/line-recovery-liff-page.test.tsx src/tests/line-recovery-bind-route.test.ts src/tests/line-recovery-bind-state.test.ts`: passed.
- `corepack pnpm --dir apps/web lint`: passed.
- `corepack pnpm --dir apps/web test`: passed, 80 files / 570 tests.
- `corepack pnpm --dir apps/web build`: passed.
- Secret/private diff scan: passed.
- `git diff --check`: passed before code commit.

## Production Deploy Result

- Code fix commit: `69f4c7b`.
- Production fix deployment ID: `dpl_2u4xbEBLi7XCZeAtv9pA2hGt16kd`.
- Production health after deploy:
  - `environment`: `production`
  - `gitCommit`: `69f4c7badc99`
  - `gitBranch`: `staging`
  - `routeBundleVersion`: `payment-foundation-2026-05-29`
- `anyu.tw` and `www.anyu.tw` both served the fixed deployment.
- Runtime remained disabled during the initial fix deployment.

## Owner LINE Bind Retry

Because runtime-disabled checkout pages do not expose the LINE save CTA, a short runtime window was opened only for LINE bind retry.

- Runtime-enabled retry deployment ID: `dpl_8btbnsKL5yyUNrpggxmuh3idje7r`.
- A fresh Production result and checkout-start page were created.
- Checkout-start verified:
  - NT$49 present.
  - Email / LINE 保存查看連結 present.
  - provider form present.
  - no internal/no-charge copy.
  - no report-body delivery promise.
- Owner result:
  - Mobile LINE context: `LINE ok`.
  - Desktop browser: failed.

Interpretation:

- Mobile LINE context is the intended supported LIFF identity path and passed.
- Desktop browser is not a reliable LINE LIFF identity context and can fail to complete ID token identity; this is not a blocker for the mobile LINE save flow.

No payment was run. No Email or LINE access-link message was sent.

## Sanitized DB Verification

DB verification was not completed from this shell:

- `ops:paid-result:lookup` requires `SUPPORT_OPS_DATABASE_URL`.
- The local shell does not have `SUPPORT_OPS_DATABASE_URL`.
- `DATABASE_URL` fallback is intentionally blocked without explicit opt-in.
- No DB target was guessed.

Expected DB result after mobile success:

- `payment_access_link_contacts` line contact row created.
- transactional consent present.
- source `checkout_start` or expected source.
- `payment_access_link_contact_secrets` active encrypted recipient secret row created.

Do not treat this as confirmed until a sanitized support lookup is run with an approved Production support DB env.

## Final Production Safety

- Runtime/checkout flags were removed after the bind retry.
- Final fail-closed deployment ID: `dpl_3DaDreo3DjB58ccbxz73cGU9TBof`.
- Public `/`, `/refund`, `/legal`: 200.
- Checkout route: 404 `not_found`.
- Fake-paid route: 404.
- Operator access-link route: 404.
- Final Production preflight: `pass_ready_for_controlled_smoke`.
- No payment was run.
- No Email was sent.
- No LINE access-link message was sent.
- No manual DB mutation was performed.

## Architecture Decisions

- Use `NEXT_PUBLIC_LINE_LIFF_URL` as the primary LIFF ID source because it is the actual entry URL used by the CTA.
- Keep explicit `LINE_LOGIN_CHANNEL_ID` override for future channel split if needed.
- Keep desktop browser LINE bind unsupported/secondary; mobile LINE context is the intended path.
- Do not add a public bind-only route.
- Do not weaken idToken verification.

## Blockers

- Sanitized DB verification remains blocked until `SUPPORT_OPS_DATABASE_URL` is available locally.
- Controlled Production Payment Smoke v1 still needs a clean card-payment run.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed:
  - Local support DB env alignment is still missing for fast Production smoke inspection.
  - Desktop LINE bind behavior could use clearer fallback copy if owners/users try outside LINE.
- Opportunistic cleanup completed:
  - Unified LIFF ID derivation around the configured LIFF URL.
- Deferred cleanup candidates:
  - Add explicit non-LINE-desktop copy category if desktop attempts keep causing confusion.
  - Add support ops env alignment before the next payment smoke.

## Suggested Next Steps

1. Align `SUPPORT_OPS_DATABASE_URL` locally for sanitized Production support lookup.
2. Run Controlled Production Payment Smoke v1 Clean Retry with Fresh NewebPay Form.
3. Keep LINE bind checkpoint mobile-only for the next smoke.
