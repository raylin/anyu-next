# LINE Recovery CTA Wiring v0

Date: 2026-06-03 00:59 CST

## Completed Work

- Added visible LINE recovery save CTA wiring to checkout-start recovery soft gate.
- Added visible LINE recovery save CTA wiring to completed paid result recovery surfaces.
- Added `createLineRecoveryBindHref(...)` as a server-side wrapper around the existing `rlb_` state helper.
- Passed payment/entitlement context into the shared completed-result renderer so LINE recovery contacts can bind to paid context where available.
- Updated no-card QA HTML summarizer to accept the wired LINE CTA instead of only the previous “稍後支援” placeholder.
- Added/updated tests for CTA copy, bind href safety, LINE saved state, and existing Email recovery behavior.

## LINE CTA Surfaces Wired

### Checkout-start

- Email remains the primary/default recovery method.
- LINE appears as a secondary recovery option.
- CTA copy:
  - `用 LINE 保存這份報告`
  - `之後可以透過 LINE 協助找回`
  - `LINE 綁定失敗也不影響付款或查看報告`
- The CTA points to `/line/recovery/bind?state=rlb_...`.
- Return path is the non-tokenized checkout-start path.
- `lineRecovery=line_saved` marks the checkout-start soft gate as saved to LINE.
- `lineRecovery=line_error` shows non-blocking fallback copy and keeps Email available.

### Completed paid result

- Unsaved completed result shows LINE as a secondary/alternate save method beside Email.
- Email-saved completed result shows “新增 LINE 備用找回”.
- LINE-saved completed result shows saved-to-LINE copy without exposing raw LINE user ID or hash.
- The completed-result LINE bind state includes result/payment/entitlement context where available, but the return path is intentionally non-tokenized (`/m/[moduleSlug]`) because existing `rlb_` safety rejects `/unlock/...`, `pcs_`, `pa_`, and `prl_` paths.

## rlb_ State Safety

The new CTA uses existing recovery-specific LIFF state, not legacy unlock/fulfillment.

State/href tests verify no visible:

- raw `pa_`
- raw `pcs_`
- raw `prl_`
- `/unlock/` tokenized route
- `unlockToken`
- short code
- `TradeInfo`
- `TradeSha`
- raw LINE user ID
- raw Email

The bind route still writes hash-only LINE recovery contact rows through `payment_recovery_contacts`.

## Success / Failure / Fallback Behavior

- Success returns through the existing LIFF bind route with `lineRecovery=line_saved` where the return path supports it.
- Failure/cancel returns with `lineRecovery=line_error` where possible.
- Checkout/report access is not blocked by LINE failure.
- Email remains available as fallback.
- Desktop/default behavior remains Email primary, LINE secondary.
- Non-LINE context fallback remains handled by `/line/recovery/bind`, which tells users to open in LINE or use Email.

## Deferred Items

- No LINE push/message sending was implemented.
- No LINE recovery link delivery was implemented.
- Owner-assisted LIFF smoke was not run in this implementation task because the new CTA is not live on Preview(staging) until this commit is pushed and deployed.
- Exact “return to same completed paid page” after completed-result LINE binding remains deferred until there is a safe non-tokenized paid access return/handoff. This is intentional; raw `pa_`, `pcs_`, and `prl_` paths must not be placed in LIFF state.

## Validation

- `corepack pnpm exec vitest run src/tests/line-recovery-bind-state.test.ts src/tests/line-recovery-liff-page.test.tsx src/tests/line-recovery-bind-route.test.ts src/tests/newebpay-checkout-start-page.test.tsx src/tests/result-checkout-no-card-qa.test.ts src/tests/paid-result-recovery-save-section.test.tsx`: passed
- `corepack pnpm lint`: passed
- `corepack pnpm test`: passed, 75 files / 496 tests
- `corepack pnpm build`: passed
- `corepack pnpm run qa:result-checkout:no-card`: passed against currently deployed Preview(staging) commit `e66fd89cec25`
- `corepack pnpm run qa:recovery-link:smoke`: passed against currently deployed Preview(staging) commit `e66fd89cec25`

## Production Safety

- No production env changes.
- No production DB changes.
- No production payment runtime changes.
- No LINE messages sent.
- No Email sent by this task.
- Production checkout/fake-paid/operator routes remained fail-closed in staging QA checks.

## Tech Debt Review

- New technical debt introduced: completed-result LINE bind cannot safely return directly to the same paid page yet because all current paid access URLs are bearer/tokenized.
- Existing technical debt observed: `qa:result-checkout:no-card` field name `recoveryLineDeferredPresent` now covers both deferred and wired LINE CTA states; rename later if this helper evolves.
- Opportunistic cleanup completed: added a reusable LINE recovery bind href helper instead of duplicating URL/state construction in page components.
- Deferred cleanup candidates: add a safe non-tokenized paid access return handoff for LIFF success returns, then update completed-result LINE CTA return behavior.

## Suggested Next Steps

1. LINE Recovery Bind Staging Smoke v0 after Preview(staging) serves this commit.
2. LINE Recovery Link Sending v0 after owner-assisted LINE bind smoke passes.
3. Module 02 Concept Spec if owner decides the LINE v0 route proof is sufficient for now.
