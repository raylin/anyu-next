# Provider-review Public Copy Implementation v0 Review Bundle

Date: 2026-05-27

## 1. Summary

Implemented provider-review-ready public copy for Module 01 while keeping payment disabled. Runtime copy now explains the planned `NT$49` one-time full-analysis product, digital delivery via web/LINE, refund/re-delivery principles for future payment, privacy/trust boundaries, support contact, service limitations, and individual small-scale/no-unified-invoice posture.

No checkout, payment provider integration, payment DB schema, payment webhook, LINE behavior, paid generation behavior, prompt/schema/cache/DB, ads, or production payment behavior was changed.

## 2. Owner Decisions Applied

- Applicant type: individual.
- Tax/invoice posture: no unified invoice for now.
- Payout account: personal bank account, not exposed publicly.
- Payment-provider application email: owner personal email, not committed.
- Public support email: `hello@anyu.tw`.
- Public copy does not claim company, studio, business registration, 商號, or 工作室.

## 3. Public Product Copy

Runtime paid-preview copy now states:

- Formal launch planned price: one-time `NT$49`.
- Current beta/internal period: no real charge.
- Product type: one-time digital content.
- Delivery method after formal payment launch: web or LINE link.
- Included content:
  - relationship temperature and signal summary
  - 3 possible states
  - reply strategies and directly usable messages
  - 48-hour observation plan
  - evidence-summary clues
  - revisit-able full result page

## 4. Refund / Re-delivery Copy

Terms now include future-payment refund/re-delivery principles:

- Once full analysis is generated and delivered, refunds are generally unavailable.
- If payment succeeds but generation fails, link cannot open, or duplicate payment occurs, user should contact support.
- After verification, ANYU can re-generate, re-send the link, or refund if re-delivery cannot be completed.
- Support needs payment/order/error information, not raw conversation content.

## 5. Privacy / Trust Copy

Privacy and product copy now reinforce:

- Users do not need to leave their name to use Module 01.
- Users should not paste names, phone numbers, addresses, accounts, ID numbers, financial details, or identifying information.
- Input is used for this analysis and necessary service delivery.
- Content is not publicly displayed or provided to third parties for marketing.
- Analysis data follows the existing retention cleanup rules.
- Future payment data should be processed by payment-provider pages; ANYU should not collect/store full card numbers.

## 6. Service Limitation / Disclaimer Copy

Runtime unlocked/full-analysis copy and legal content reinforce:

- ANYU provides text-situation organization and communication suggestions.
- It is not therapy, counseling, medical diagnosis, legal advice, fortune-telling, or a guaranteed relationship prediction.
- It does not guarantee another person’s true thoughts or any relationship outcome.

## 7. Support / Contact Copy

Public support contact remains:

```text
hello@anyu.tw
```

Support copy instructs users to provide payment time, necessary order information, or an error description, and explicitly says raw conversation content is not needed.

## 8. Invoice / Tax Posture Copy

Terms now include conservative copy:

```text
本服務目前以個人小規模測試方式提供，暫未開立統一發票；若後續服務型態或法規要求調整，將依相關規定辦理。
```

The copy does not claim permanent no-invoice status, tax exemption, company invoice, or studio invoice.

## 9. Runtime Pages Updated

- Module 01 paid preview card.
- Module 01 unlocked full-analysis header.
- Shared legal/privacy/terms content.

## 10. Payment-disabled Verification

- No checkout route was added.
- No NewebPay/ECPay API code was added.
- No payment DB schema was added.
- No payment webhook was added.
- Existing beta/LINE fulfillment behavior remains unchanged.
- Public copy says current internal/beta period does not charge.

## 11. Tests Added

- Legal content tests cover planned/future `NT$49` wording while payment remains disabled.
- Legal content tests cover refund/re-delivery policy, support email, no vague-only privacy wording, no unsupported anonymity/deletion promises, and no forbidden business-registration claims.
- Result rendering tests cover paid preview public copy, support contact, no raw conversation support requirement, and no provider/checkout wording.

## 12. Remaining Owner Actions

- Review public copy in staging.
- Confirm whether `hello@anyu.tw` remains formal support for payment review.
- Confirm whether provider review requires public phone/address or applicant details.
- Confirm tax/invoice wording with the owner/accounting advisor before real payment launch.
- Submit NewebPay application only after public staging copy review passes.

## 13. Recommended Next Step

Deploy to staging and review `/m/ambiguous-temperature`, `/terms`, `/privacy`, and an unlocked full-analysis route for provider-review copy clarity. Keep payment disabled.
