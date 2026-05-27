# Provider-review Copy Visual Grouping Polish v0 Review Bundle

Date: 2026-05-27

## 1. Summary

Polished the Module 01 paid-preview provider-review copy so it remains complete for payment-provider review without reading as a dense wall of paragraphs.

The paid preview now separates copy into:

- Product/value summary
- Delivery/current beta status
- Included-content panel
- Trust/refund/support policy panel
- Low-hierarchy service limitation note

Payment remains disabled. No checkout, NewebPay integration, payment DB schema, LINE behavior, paid generation, prompt/schema/cache/DB, or production payment behavior changed.

## 2. Grouped Copy Structure

Product/value summary:

- Headline remains `解鎖下一句怎麼回 — NT$49`.
- Concise status line: formal launch one-time viewing; current beta does not charge.
- Delivery line: full analysis is delivered through web or LINE link.

Included-content panel:

- 3 種可能狀態
- 可直接使用的回覆句與回覆策略
- 48 小時觀察建議
- 分析依據線索摘要
- 可回看的完整結果頁

Trust/policy panel:

- No name required and do not paste identifying info.
- Input is used only for this analysis and necessary service delivery.
- Formal payment failures, inaccessible links, or duplicate payments can be re-delivered or refunded after support review.
- Public support remains `hello@anyu.tw`.

Service limitation:

- Moved into subdued lower-hierarchy copy.
- Clarifies ANYU is text situation organization and communication advice, not therapy, counseling, fortune-telling, or relationship outcome guarantee.

## 3. Theme Behavior

Theme A keeps the grouped copy in soft bordered panels and compact chips.

Theme B / Riso uses stronger borders, sharper radius, and offset shadows for the same grouped structure.

## 4. Payment-disabled Verification

- No checkout route was added.
- No NewebPay/ECPay integration was added.
- No payment DB schema or webhook was added.
- No charging behavior was changed.
- Existing LINE fulfillment and beta/free behavior remains unchanged.

## 5. Tests Added / Updated

- Updated paid-preview rendering test to verify grouped panels and required provider-review details.
- Added Theme A / Theme B wrapper coverage for grouped provider-review copy.
- Existing legal-content tests continue to verify no checkout/provider claims and no company/studio/business-registration claims.

## 6. Remaining Visual Notes

- This pass reuses existing card/chip visual primitives rather than introducing a new design system component.
- A later screenshot QA pass can tune exact spacing if the staging visual review finds the panel still too tall.

## 7. Recommended Next Step

Deploy to staging and visually review the paid-preview section in both themes on desktop and mobile.
