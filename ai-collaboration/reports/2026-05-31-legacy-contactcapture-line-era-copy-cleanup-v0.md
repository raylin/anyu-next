# Legacy ContactCapture / LINE-era Copy Cleanup v0

Date: 2026-05-31

## Summary

Cleaned legacy ContactCapture / LINE-era copy so active source no longer presents internal-test, no-charge, or LINE paid-report delivery promises.

No runtime behavior changed. LINE routes, ContactCapture component behavior, and legacy fallback mechanics remain available, but their user-facing wording now frames LINE as notification / short-code confirmation / support, not the launch paid delivery channel.

Production payment runtime remains disabled.

## 1. Audit Findings

Search targets:

- `ContactCapture`
- `LINE`
- `Email delivery`
- `no charge`
- `no real charge`
- `internal test`
- `internal-test`
- `內測`
- `測試階段`
- `不收費`
- `contact capture`
- `delivery by email`
- `LINE delivery`

Inspected:

- `apps/web/src/components/anyu/ContactCapture.tsx`
- `apps/web/src/lib/modules/ai-temperature-ui.ts`
- `apps/web/src/components/modules/ai-temperature/AiTemperatureResult.tsx`
- `apps/web/src/components/anyu/PaidPreviewCard.tsx`
- `apps/web/src/components/line/LineFulfillBridge.tsx`
- `apps/web/src/lib/line/webhook.ts`
- `apps/web/src/app/api/line/fulfillment/bind-liff/route.ts`
- related component/unit/e2e tests

## 2. Classification

| Finding | Surface | Classification | Action |
|---|---|---|---|
| `ContactCapture` rendered `目前內測中` and “這次不會真的收費”. | `ContactCapture.tsx` | Legacy component, still potentially user-visible if called | Replaced with notification/support wording and web delivery note. |
| `LINE_PRIMARY_BODY` said LINE would send the complete analysis link. | `ai-temperature-ui.ts` | Shared copy used by legacy contact panel | Reframed as LINE/Email notification and support; explicitly says paid report is web-delivered. |
| `LINE_PRIMARY_PANEL_TITLE` / CTA said `用 LINE 領取完整分析`. | `ai-temperature-ui.ts`, tests, e2e | Legacy/fallback user-visible wording | Replaced with `用 LINE 接收開放通知` / `用 LINE 接收通知`. |
| Missing LINE URL copy said LINE link not ready for receiving. | `ai-temperature-ui.ts` | Legacy/fallback copy | Reframed as LINE notification link. |
| LINE webhook welcome said it would send complete analysis link. | `line/webhook.ts` | LINE-specific legacy fulfillment surface | Reframed as short-code confirmation for an existing complete analysis page. |
| LINE bridge headings said LINE receive / receiving complete analysis. | `LineFulfillBridge.tsx`, e2e | Legacy fulfillment surface | Reframed as `LINE 短碼確認` and `正在確認完整分析頁`. |
| Active result-page paid CTA still avoids `ContactCapture`. | `AiTemperatureResult.tsx`, `event-metadata.test.ts` | Active launch path | No runtime change needed; existing tests continue to assert ContactCapture is not the main result CTA. |
| Share card says “複製成 LINE / Threads”. | Share UI | Active social share, not paid delivery | Left unchanged. It is a share target, not report delivery. |
| LINE legal/privacy mentions. | `legal.ts` | Future notification/support | Left unchanged from prior legal alignment; it explicitly says LINE is not current paid report delivery commitment. |
| Historical reports/handoffs. | `ai-collaboration/*` | Historical docs | Not edited. |

## 3. Copy Updated

Updated:

- `apps/web/src/lib/modules/ai-temperature-ui.ts`
- `apps/web/src/components/anyu/ContactCapture.tsx`
- `apps/web/src/lib/line/webhook.ts`
- `apps/web/src/components/line/LineFulfillBridge.tsx`
- `apps/web/src/app/api/line/fulfillment/bind-liff/route.ts`
- related tests and e2e expectations

New direction:

- LINE is optional notification/support or legacy short-code confirmation.
- Paid report launch delivery remains web-based.
- ContactCapture no longer says internal test or no real charge.
- ContactCapture no longer says LINE will deliver the complete paid analysis.
- Existing support email remains `hello@anyu.tw`.

## 4. What Remains

Remaining LINE infrastructure:

- LINE fulfillment route and bridge still exist.
- LINE webhook still supports short-code link resolution.
- ContactCapture component still exists for legacy/internal/fallback use.

Why it remains:

- Removing it would be behavior/infrastructure cleanup, not copy-only cleanup.
- Current main result paid CTA path does not render ContactCapture.
- Existing LINE tests cover route hardening and fulfillment helper behavior.

Recommended future cleanup if owner wants it:

- `Legacy LINE Fulfillment Deprecation Plan v0`
- `ContactCapture Usage Removal / Archive v0`

## 5. Tests

Updated/covered tests:

- `contact-capture.test.tsx`
- `ai-temperature-ui.test.ts`
- `ai-temperature-result.test.tsx`
- `paid-cta-view-model.test.ts`
- `legal-content.test.ts`
- `line-fulfillment.test.ts`
- `line-route-hardening.test.ts`
- related e2e text expectations for LINE contact/bridge wording

Assertions now cover:

- no active launch-facing paid CTA contains internal-test/no-charge wording;
- ContactCapture no longer contains internal-test/no-charge wording;
- legacy ContactCapture says paid report is web-delivered;
- LINE primary copy no longer says it will send a complete analysis link;
- result page paid CTA still does not render ContactCapture;
- web delivery and support/refund copy remain intact.

## Validation

Validation results are recorded in the final completion summary.

## Architecture Decisions

- No architecture changes.
- Copy-level decision: keep LINE infrastructure but frame visible copy as notification / short-code confirmation, not launch paid delivery.
- Copy-level decision: leave social share “LINE / Threads” wording unchanged because it is not paid report delivery.

## Blockers

- None.

## Uncertainties

- Whether owner wants to remove or archive legacy LINE fulfillment code later.
- Whether future LINE support should become a launch feature after production payment stabilizes.

## Suggested Next Steps

- `Module 01 Checkout CTA Wiring Plan v0` when owner is ready to plan the public checkout transition.
- `Legacy LINE Fulfillment Deprecation Plan v0` only if owner wants LINE routes/components removed rather than retained as legacy/fallback infrastructure.

## Known Technical Debt

- Legacy LINE fulfillment infrastructure remains in code even though paid launch delivery is web-only.

## Tech Debt Review

### New Technical Debt Introduced

- None.

### Existing Technical Debt Observed

- LINE fulfillment routes/components remain available as legacy/fallback infrastructure and should be intentionally deprecated or re-approved later.

### Opportunistic Cleanup Completed

- Updated stale tests and e2e expectations to match launch-safe wording.

### Deferred Cleanup Candidates

- Archive or remove ContactCapture if no future notification capture is desired.
- Deprecate LINE fulfillment route if LINE is not part of launch or post-launch support.

### Recommended Follow-up

- `Module 01 Checkout CTA Wiring Plan v0`

## Git Commit

- Commit hash: pending
- Commit message: `copy: clean legacy line contact wording`

## Staging Push

- Push status: pending
- Push command: `git push origin HEAD:staging`
