# Public Legal Copy Launch Alignment v0

Date: 2026-05-31

## Summary

Public legal / refund / support copy is now aligned with the Module 01 launch posture:

- Module 01 full report is described as a digital AI-generated report/service.
- Price is NT$49 for a one-time, non-subscription unlock.
- Delivery is web-based after payment confirmation.
- Browser ReturnURL is not payment truth; confirmation depends on payment provider notification and system records.
- Refund/support coverage is framed around duplicate payment, paid-but-no-result, inaccessible paid result, and system/payment abnormality.
- Support goes through `hello@anyu.tw`.
- Handling window is `3–7 個工作天內回覆處理結果`.
- LINE is no longer described as paid report delivery; it is only a possible future notification/support channel where mentioned.

No runtime behavior, payment provider logic, Vercel env, production flags, checkout wiring, Module 02, homepage portal, or Module 01 prompt/result behavior changed.

## 1. Audit Findings

Launch-facing surfaces inspected:

- `apps/web/src/content/legal.ts`
- `apps/web/src/app/legal/page.tsx`
- `apps/web/src/app/refund/page.tsx`
- `apps/web/src/app/privacy/page.tsx`
- `apps/web/src/app/terms/page.tsx`
- `apps/web/src/app/disclaimer/page.tsx`
- `apps/web/src/components/anyu/LegalFooter.tsx`
- `apps/web/src/app/page.tsx`
- `apps/web/src/components/anyu/PaidPreviewCard.tsx`
- `apps/web/src/lib/modules/paid-cta-view-model.ts`
- Existing legal/homepage/result tests

Findings:

| Finding | Surface | Classification | Action |
|---|---|---|---|
| Terms still said current period was internal test and would not really charge. | `/terms` / `legal.ts` | Public legal / should be launch-aligned now | Replaced with formal NT$49 one-time digital content payment copy. |
| Terms said successful payment could be viewed through web or LINE link. | `/terms` / `legal.ts` | Public legal / should be launch-aligned now | Replaced with web result page delivery after provider confirmation. |
| Terms/refund did not clearly state ReturnURL/browser return is not payment truth. | `/terms`, `/refund` | Public legal / should be launch-aligned now | Added provider notification / system record truth language. |
| Terms refund/support copy did not include 3-7 business day handling window. | `/terms` | Public legal / should be launch-aligned now | Added `3–7 個工作天內回覆處理結果`. |
| Privacy and short notices still framed contact as internal-test notification. | `/privacy`, shared notices | Public policy / future note should be softened | Reframed as launch notification, new test/module reminders, and necessary support. |
| LINE wording could imply paid delivery. | `/privacy`, shared notices, `/terms` | LINE retention mention allowed only if not paid delivery | Kept LINE only as possible future notification/support channel; explicitly not current paid report delivery commitment. |
| Legacy `ContactCapture` and LINE fulfillment UI still contain internal-test / LINE-first language. | Legacy contact/LINE code and tests | Internal/legacy path / not the launch-facing legal surface | Left unchanged; result-page paid CTA no longer foregrounds it. |
| Historical reports/handoffs contain internal-test/no-charge/LINE-era references. | `ai-collaboration/*` | Historical docs / do not edit | Left unchanged. |

## 2. Copy Changes

Updated `apps/web/src/content/legal.ts`:

- Privacy version/date updated to 2026-05-31.
- Terms version/date updated to 2026-05-31.
- Refund version/date updated to 2026-05-31.
- Disclaimer version/date updated to 2026-05-31.
- Removed launch-facing “內測期間 / 不會真的收費” payment claims from Terms.
- Removed launch-facing LINE paid-report delivery promise from Terms.
- Added web delivery and provider notification truth language to Terms and Refund.
- Added 3-7 business day support/refund handling window to Terms.
- Reframed Email / LINE contact data as notifications/support, not paid report delivery.
- Clarified LINE is not current paid report delivery commitment.

Updated `apps/web/src/app/legal/page.tsx`:

- Legal index version/date updated to 2026-05-31.

Updated `ai-collaboration/dashboard/anyu-project-dashboard.html`:

- Dashboard now reflects public legal/support copy launch alignment.

## 3. Test Coverage

Updated `apps/web/src/tests/legal-content.test.ts` to assert:

- public legal copy contains NT$49 one-time/non-subscription model;
- Terms includes provider notification/system record payment truth;
- Refund includes provider notification and browser-return-not-truth wording;
- Terms includes the 3-7 business day handling window;
- public legal copy does not include the previous no-charge language;
- public legal copy does not promise LINE paid delivery.

Existing result-page CTA tests continue to verify:

- disabled/review-pending paid CTA does not mention internal-test/no-charge/LINE delivery;
- checkout-available CTA uses NT$49 one-time web delivery copy;
- result support/refund copy includes the 3-7 business day handling window.

## 4. Remaining Copy Risks

- Legacy contact capture and LINE fulfillment surfaces still contain internal-test / LINE-first wording. They are not the main paid CTA path after Module 01 Multi-State Paid CTA Implementation v0, but they remain in the codebase for backward-compatible/legacy paths.
- Broader LINE product strategy remains deferred. LINE should not be promised for paid report delivery until implemented and launch-reviewed.
- Invoice/receipt wording remains “個人小規模測試 / 暫未開立統一發票”; this may need owner/legal review before production payment launch depending on business registration and tax posture.

## Architecture Decisions

- No architecture changes.
- Copy-level decision: keep LINE only as future notification/support wording, not paid report delivery.
- Copy-level decision: legal/refund copy now treats provider notification and system record as payment truth, matching ReturnURL behavior.

## Blockers

- None for this copy alignment.
- NewebPay approval / formal production credentials remain external launch blockers.

## Uncertainties

- Whether invoice/receipt wording should change before production launch.
- Whether legacy ContactCapture / LINE-first copy should be removed later or preserved as an internal/legacy flow.

## Suggested Next Steps

1. `Module 01 Checkout CTA Wiring Plan v0` after owner confirms launch gate timing.
2. `Invoice / Receipt Policy Review v0` before production payment launch if business/tax posture changes.
3. `Legacy LINE Contact Capture Cleanup Plan v0` if owner wants to fully remove internal-test copy outside the main result CTA.

## Known Technical Debt

- Legacy LINE/contact capture copy remains outside the launch-facing paid CTA path.
- Invoice/receipt policy wording may need owner/legal review before production payment launch.

## Tech Debt Review

### New Technical Debt Introduced

- None.

### Existing Technical Debt Observed

- Legacy `ContactCapture` and LINE fulfillment code still reflect the earlier internal-test / LINE-first strategy.
- Terms still mention no invoice issuance under current small-scale testing posture; this should be reviewed before production payment launch.

### Opportunistic Cleanup Completed

- Legal index version/date updated to match the legal content update.
- Dashboard status updated to reflect legal/support copy launch alignment.

### Deferred Cleanup Candidates

- Legacy LINE contact capture cleanup.
- Invoice/receipt policy review.

### Recommended Follow-up

- `Module 01 Checkout CTA Wiring Plan v0`

## Git Commit

- Commit hash: pending
- Commit message: `copy: align public legal launch copy`

## Staging Push

- Push status: pending
- Push command: `git push origin HEAD:staging`
