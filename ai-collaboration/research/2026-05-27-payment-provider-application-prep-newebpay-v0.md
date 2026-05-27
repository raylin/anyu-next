# Payment Provider Application Prep + NewebPay Evaluation v0

Date: 2026-05-27

## 1. Summary

ANYU is ready to begin payment-provider application prep, but not yet ready to submit without storefront/legal updates. The best first application target is NewebPay / 藍新, with ECPay / 綠界 kept as backup.

Current production state supports review preparation:

- Production domain: `https://anyu.tw`
- Module 01 low-key production: active/monitor
- Production route/API smoke: passed
- Production short-code smoke: passed
- Production LIFF smoke: passed
- Payment: not enabled
- Ads / broader traffic: blocked

The main readiness gaps are storefront clarity, refund policy, formal payment terms, and owner business/account documents.

## 2. Provider Recommendation

Recommendation: apply to NewebPay first.

Rationale:

- ANYU sells a low-price one-time digital content/service unlock, not a physical product.
- NewebPay supports credit-card collection, multiple payment tools, API integration, and technical documentation downloads from its official site.
- The first implementation can stay simple with hosted/redirect-style checkout rather than a custom card form.
- ECPay should remain backup if NewebPay review stalls, if approval conditions are unfavorable, or if later ecosystem needs make ECPay more attractive.

Sources reviewed:

- NewebPay official complete payment service page: https://www.newebpay.com/main/main/index/enterprise_shop
- NewebPay official fee/payment method page: https://www.newebpay.com/website/Page/content/service_fare
- NewebPay official FAQ / membership application notes: https://cwww.newebpay.com/website/Page/content/faq
- NewebPay official API document download page: https://www.newebpay.com/website/Page/content/download_api
- ECPay official application prep page: https://support.ecpay.com.tw/4862/
- ECPay official special seller application page: https://support.ecpay.com.tw/4738/
- ECPay official payment product page: https://www.ecpay.com.tw/Business/payment_standard

## 3. NewebPay Application Notes

Officially observed NewebPay points:

- NewebPay supports personal and enterprise member login/application paths.
- The FAQ says eligible members include legally capable natural persons or legal entities such as firms/companies under Taiwan law.
- Personal member application requires identity, phone, and email information; enterprise member application requires a unified business number.
- The official fee page lists default transaction quotas: personal member 20 萬 and enterprise member 60 萬, subject to qualification/risk review.
- The official service page highlights credit-card support, payment gateway integration, diverse payment tools, technical support, and electronic invoice support.
- The official fee page lists payment methods including domestic credit card, installment, Apple / Google / Samsung Pay, ATM/WebATM, virtual account, Taiwan Pay, convenience-store code/barcode, and BNPL options.
- Official API documentation is available through NewebPay’s API document download page.

Review-time estimate:

- I found current official NewebPay application and fee/application references, but did not find a clear official review-time SLA in the reviewed pages. Do not promise a specific approval time for NewebPay; treat review duration as owner/provider-dependent.

NewebPay readiness for ANYU:

- Good fit for v0 if reviewer accepts AI-generated relationship-analysis digital content as a permitted service.
- Start with hosted/redirect MPG-style payment flow for lower PCI and implementation complexity.
- Keep checkout copy conservative: digital generated analysis, communication aid, no therapy, no guaranteed prediction.

## 4. ECPay Backup Comparison

ECPay remains a practical backup.

Officially observed ECPay points:

- ECPay application prep requires account/password, phone, email, identity or company documents, bank book cover, and a public sales URL.
- ECPay states the sales site should be Chinese-language, priced in NTD, publicly accessible, and display contact information matching seller verification records.
- ECPay special-seller application asks for account data, seller identity, store name, website URL, product category, delivery period, business/contact/bank details, and agreement to relevant terms.
- ECPay documentation states special-seller application can complete in 3-5 business days if no supplemental documents are needed.
- ECPay supports technical integration redirecting to an ECPay payment page, Web support, and all payment methods for the general integration route; non-card backend code generation supports ATM virtual account and convenience-store code/barcode.

Backup recommendation:

- Prepare ECPay materials in parallel only after NewebPay application is submitted or if NewebPay asks for materials that are slower to produce.
- ECPay’s sales-site requirements are useful as a readiness checklist even if NewebPay is first.

## 5. ANYU Product Description for Review

Suggested provider-facing description:

```text
暗語 ANYU 是一個情境分析工具。使用者貼上一段互動描述後，系統會根據文字內容整理關係訊號、可能狀態與下一步回覆建議。結果是溝通輔助與情境整理，不是心理治療、命理判斷、保證預測或關係結果承諾。
```

Payment product:

```text
商品名稱：曖昧溫度計完整分析
商品類型：一次性數位內容 / AI 生成情境分析
建議售價：NT$49
交付方式：付款成功後於網頁與 LINE 提供完整分析連結
```

Buyer receives:

- 關係溫度與訊號整理
- 3 種可能狀態
- 3 組回覆策略與可直接使用的句子
- 48 小時觀察策略
- 分析依據線索摘要
- 可回看完整結果頁

Avoid these claims:

- 保證知道對方想法
- 保證挽回
- 保證準確
- 心理治療
- 諮商
- 命理保證
- 醫療/心理診斷

## 6. Storefront / Sales Page Readiness

Current public readiness:

- `/m/ambiguous-temperature` exists as the public Module 01 product surface.
- `/privacy`, `/terms`, `/disclaimer`, and `/legal` exist.
- Public support email exists as `hello@anyu.tw`.
- Module 01 shows `NT$49` and describes full analysis as a richer result.
- Current legal text correctly says v0 payment is not formally enabled yet.

Storefront gaps before provider submission:

- Add a provider-review-ready product section or standalone sales section that clearly states product name, price, delivery method, and what is included.
- Add clear refund/failed-delivery policy wording.
- Update terms from “payment not formally enabled” to “payment is available for this digital product” only after payment is approved and implementation is ready.
- Add support response channel expectations, such as email and LINE OA support.
- Add no-shipping/no-physical-delivery language for digital content.
- Ensure product page displays customer-support contact visibly enough for provider review.
- Ensure privacy/terms/refund pages or sections are reachable from product page footer or purchase area.

Suggested storefront copy draft:

```text
曖昧溫度計完整分析是一份一次性數位分析內容。付款成功後，系統會根據你提供的情境整理可能狀態、訊號解讀、回覆策略與 48 小時觀察建議，並提供可回看的完整分析連結。

本服務是溝通輔助與情境整理工具，不保證預測對方想法或關係結果，也不是心理諮商、醫療、法律或命理服務。
```

## 7. Refund Policy Draft

Product-policy draft, not legal advice:

```text
因本商品屬付款後即生成/交付的數位內容，完整分析一旦成功生成並開啟，原則上不提供無條件退款。

若付款成功但系統未能生成或交付完整分析，使用者可聯絡客服申請重新交付或退款。

若發生重複付款，經確認後可協助退款。

若因系統錯誤造成連結無法開啟或內容無法存取，使用者可於付款後合理期間內聯絡客服，我們會優先協助重新交付；無法重新交付時，再協助退款。

退款申請請來信 hello@anyu.tw，並提供付款時間、付款方式與可供查詢的訂單資訊。請勿在信件中提供完整對話原文、LINE ID token、付款卡號或其他不必要的敏感資料。
```

Refund implementation implications:

- Need order ID and payment transaction lookup.
- Need refund status tracking before real payment launch.
- Need support SOP for duplicate payment, generation failure, and user-access issue.

## 8. Privacy / Trust Copy Requirements

Current privacy readiness:

- Privacy page tells users not to paste identifiable data.
- Privacy page states input is used for analysis, result reload, safety controls, and necessary debugging.
- Privacy page states events should not store raw text/contact content.
- Retention copy states analysis requests, results, and full paid-analysis data use an approximately 24-hour retention policy with scheduled cleanup.
- Support/deletion contact is `hello@anyu.tw`.

Recommended payment-review trust copy:

```text
請不要貼上姓名、電話、地址、帳號、身分證字號、金融資訊或其他可識別個人身分的資料。你提供的內容只用於產生這次分析與必要的安全/除錯流程，不會公開展示，也不會提供給第三方行銷使用。
```

Add before payment launch:

- Mention payment provider will process payment data on its own hosted checkout/payment page.
- State ANYU should not collect or store full card numbers.
- State support requests should include order lookup information but not raw private conversation text.

## 9. First Payment Method Recommendation

Recommended v0 payment methods:

1. Credit card one-time payment first.
2. Apple Pay / Google Pay only if available through the selected NewebPay setup with minimal extra implementation/support overhead.
3. ATM / WebATM / virtual account later only if card conversion is a blocker.
4. Convenience-store code later only if non-card demand is proven.

Reasoning:

- NT$49 is low-ticket and should be mobile-first.
- Credit card has the simplest immediate user journey for a digital unlock.
- ATM and convenience-store payments add delayed confirmation, expiration, support, and refund complexity.
- WebATM is not ideal for mobile-first use.

## 10. Future Payment Integration Flow

Planning only:

1. User clicks paid unlock.
2. App creates payment intent/order linked to `analysis_result_id` and `unlock_intent_id`.
3. App redirects user to NewebPay checkout.
4. NewebPay returns the user to a return URL and sends server-side notify/webhook.
5. App verifies payment server-side using provider signatures/hashes.
6. App marks entitlement/payment successful.
7. App triggers paid generation or reuses completed paid result.
8. App delivers unlocked route and/or LINE fulfillment link.
9. App handles failed, cancelled, expired, duplicate, and refund cases.
10. Support/admin SOP handles re-delivery and refund verification.

Technical planning notes:

- Use server-side payment verification; never trust client return alone.
- Keep provider credentials server-only.
- Avoid storing full card data.
- Use idempotent order IDs and notify handling.
- Keep paid generation decoupled from payment provider-specific code.

## 11. Application Checklist

Business/account info:

- [ ] Decide applicant type: individual, business, or company.
- [ ] Prepare applicant identity/company documents.
- [ ] Prepare bank account information matching applicant.
- [ ] Prepare contact email and phone.
- [ ] Confirm tax/invoice obligations with owner/accounting advisor.
- [ ] Confirm whether electronic invoice service is needed immediately or later.

Website/product:

- [x] Production domain exists: `https://anyu.tw`.
- [x] SSL expected through Vercel production domain.
- [x] Product URL exists: `/m/ambiguous-temperature`.
- [x] Privacy page exists: `/privacy`.
- [x] Terms page exists: `/terms`.
- [x] Disclaimer page exists: `/disclaimer`.
- [x] Support email exists: `hello@anyu.tw`.
- [ ] Add provider-ready product/sales section.
- [ ] Add refund/failed-delivery policy.
- [ ] Add payment-specific terms once payment is approved.
- [ ] Make support contact visible in purchase area/footer.
- [ ] Ensure public product page clearly says digital delivery, no shipping.

Technical:

- [ ] Define order ID format.
- [ ] Define payment-intent DB schema.
- [ ] Define NewebPay return URL.
- [ ] Define NewebPay notify/webhook URL.
- [ ] Define payment verification helper.
- [ ] Define idempotent notify handling.
- [ ] Define refund/re-delivery support state.
- [ ] Define staging/test provider environment.
- [ ] Define no-secrets logging policy for payment events.

## 12. Missing Items / Owner Actions

Owner actions before application:

- Choose applicant type and gather legal/account documents.
- Confirm business/tax/invoice posture for digital-content sales.
- Decide whether `hello@anyu.tw` is the provider-facing support email.
- Confirm if a phone number or business address must be displayed for provider review.
- Approve storefront product copy.
- Approve refund policy draft.
- Approve payment method v0: credit card first.
- Decide whether to apply to NewebPay immediately or wait until storefront/refund copy is live.

Implementation actions after provider approval:

- Add payment-intent/order schema.
- Add NewebPay checkout creation.
- Add return/notify handlers.
- Verify payment server-side.
- Connect successful payment to existing paid-generation/unlocked flow.
- Add refund/re-delivery SOP and support tooling.

## 13. Recommended Next Step

Create a provider-review storefront/legal copy pass:

- Add product/payment/refund copy to public surfaces.
- Keep payment disabled.
- Run legal/product review.
- Then submit NewebPay application with `https://anyu.tw/m/ambiguous-temperature` as the product URL.
