# Module 01 Multi-State Paid CTA Implementation v0

Date: 2026-05-31

## Summary

Implemented a small explicit paid CTA state model for Module 01 and updated result/payment copy so the launch-facing result flow no longer says internal test, no real charge, or LINE/Email delivery.

Production payment runtime remains disabled. NewebPay provider behavior, checkout route behavior, NotifyURL behavior, queues, prompts, result generation, Module 02, and homepage multi-module work were not changed.

## What Changed

### CTA state model

Added `apps/web/src/lib/modules/paid-cta-view-model.ts` with:

- `PaidCtaAvailability`
- `PaidCtaViewModel`
- `buildPaidCtaViewModel(...)`
- `getSupportResponseWindowCopy()`

Supported states:

- `review_pending`
- `payment_unavailable`
- `checkout_available`
- `checkout_pending`
- `waiting_for_payment`
- `processing`
- `ready`
- `failed_retryable`
- `failed_support`
- `invalid_or_expired`
- `already_unlocked`

### Result-page paid CTA

Updated `apps/web/src/components/anyu/PaidPreviewCard.tsx`:

- Review-pending state now shows disabled CTA: `完整報告即將開放`.
- Microcopy says the complete report unlock is being prepared and will use NT$49 one-time payment after formal opening.
- Checkout-available state copy says `解鎖完整報告｜NT$49`, one-time/non-subscription, web delivery after payment confirmation.
- Support/refund links are visible in relevant states.
- Support copy includes `hello@anyu.tw` and `3–7 個工作天內回覆處理結果`.
- Launch-facing LINE delivery and no-charge/internal-test copy were removed from this paid CTA.

Updated `apps/web/src/components/modules/ai-temperature/AiTemperatureResult.tsx`:

- Result page accepts `paidCtaAvailability`.
- Inline “看下一句怎麼回” now scrolls to the paid preview only.
- Result-page contact capture is no longer the main paid CTA flow.
- Legacy LINE/contact infrastructure remains elsewhere in the repo but is not foregrounded by Module 01 paid CTA.

Updated `apps/web/src/app/m/[moduleSlug]/result/[resultId]/page.tsx`:

- Server derives paid CTA availability from `ENABLE_PAYMENT_RUNTIME` and `ENABLE_NEWEBPAY_CHECKOUT`.
- Current production-disabled posture resolves to `review_pending`.
- If both runtime and checkout are enabled in a future launch gate, result page can render `checkout_available` copy.

### Payment/support copy

Updated:

- `apps/web/src/app/m/[moduleSlug]/payment/return/page.tsx`
- `apps/web/src/app/m/[moduleSlug]/payment/access/page.tsx`
- `apps/web/src/components/modules/ai-temperature/PaidResultPendingPoller.tsx`
- `apps/web/src/content/legal.ts`

Changes:

- ReturnURL now says `付款確認中` and explicitly says it waits for the payment provider’s official notification.
- ReturnURL still does not imply payment success before NotifyURL truth.
- Access fallback and failed/expired pending states mention support and 3-7 business day response window.
- UI notices now describe paid report web delivery instead of LINE delivery.
- Refund page handling copy now says responses are handled within 3-7 business days.

## LINE Reference Handling

Removed/hid launch-facing LINE delivery references from Module 01 paid CTA/result payment copy.

Intentionally not removed:

- Existing LINE funnel components/routes.
- Legacy unlock/contact infrastructure.
- Broader legal/privacy/terms references that are outside the paid CTA/result payment surface. Those still include internal-test/LINE-era language in places and should be handled by a separate legal copy alignment task if owner wants a full public legal refresh.

## Refund / Support Window

Implemented owner-approved handling window:

- `3–7 個工作天內回覆處理結果`

Applied to:

- Paid CTA support copy.
- ReturnURL support note.
- Payment access fallback.
- Paid result pending failure note.
- Refund page handling paragraph.

## Tests Added / Updated

Added:

- `apps/web/src/tests/paid-cta-view-model.test.ts`

Updated:

- `apps/web/src/tests/ai-temperature-result.test.tsx`
- `apps/web/src/tests/event-metadata.test.ts`
- `apps/web/src/tests/legal-content.test.ts`
- `apps/web/src/tests/newebpay-return-page.test.tsx`
- `apps/web/src/tests/payment-access-page.test.tsx`

Coverage now asserts:

- Review-pending CTA is disabled and does not mention internal test, no-charge, or LINE delivery.
- Checkout-available CTA shows NT$49, one-time payment, and web delivery.
- Waiting/payment-pending copy does not imply ReturnURL is payment truth.
- Failed/support state includes `hello@anyu.tw` and support/refund framing.
- Homepage merchant-review content remains intact.
- Legacy unlock route ordering remains unchanged.

## Validation

- `cd apps/web && corepack pnpm lint`: passed.
- Targeted paid CTA/result/payment/legal tests: passed.
- `cd apps/web && corepack pnpm test`: passed, 58 files / 370 tests.
- `cd apps/web && corepack pnpm build`: passed.
- Docs presence check: passed.
- Added-line secret/private scan: passed.
- `git diff --check`: passed.

## Tech Debt Review

- New technical debt introduced: checkout-available CTA copy can render from the state model, but actual result-page checkout form submission remains a separate implementation task.
- Existing technical debt observed: public terms/privacy still contain some internal-test/LINE-era language outside the paid CTA/result payment surface.
- Opportunistic cleanup completed: removed result-page contact capture from the main paid CTA flow.
- Deferred cleanup candidates: full public legal copy launch alignment, result-page checkout form submission/wiring, mobile CTA contrast QA.

## Recommended Next Step

Run `Module 01 Checkout CTA Wiring Plan / Implementation v0` after owner approves the launch copy and after NewebPay approval/formal credentials are available, or run `Module 02 Concept Spec + Homepage Cross-Link Plan v0` if approval is still pending.
