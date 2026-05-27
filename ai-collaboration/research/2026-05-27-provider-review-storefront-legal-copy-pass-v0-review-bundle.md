# Provider-review Storefront + Legal Copy Pass v0 Review Bundle

Date: 2026-05-27

## 1. Summary

This bundle converts the NewebPay application-prep plan into concrete provider-review copy drafts for Module 01「曖昧溫度計」.

Payment remains disabled. No checkout, payment integration, payment DB schema, webhook, LINE behavior, prompt/schema/cache/DB, or production runtime legal page was changed.

The copy is written for a future public storefront/legal pass after owner review. It is not legal advice and should be reviewed before publication.

## 2. Current Public Page / Legal Readiness

Current readiness:

- Product URL exists: `/m/ambiguous-temperature`.
- Public legal routes exist: `/privacy`, `/terms`, `/disclaimer`, `/legal`.
- Support email exists in current legal content: `hello@anyu.tw`.
- Module 01 price value exists in module config: `NT$49`.
- Current terms correctly say v0 payment/price surfaces do not mean formal payment is enabled yet.
- Current privacy copy tells users not to paste identifiable information and states analysis data follows retention cleanup rules.

Current gaps before provider submission:

- Public storefront copy does not yet clearly present the paid product as an approved purchasable digital item.
- Public terms do not yet include final refund/re-delivery/payment language.
- Public pages do not yet state digital delivery/no-shipping in a provider-review-ready way.
- Formal applicant/business/tax/invoice/contact details remain owner decisions.
- Payment provider return/notify URLs are not yet implemented or published.

## 3. Provider-facing Product Description

Recommended provider application description:

```text
暗語 ANYU 是一個情境分析工具。使用者貼上一段互動描述後，系統會根據文字內容整理關係訊號、可能狀態與下一步回覆建議。結果是溝通輔助與情境整理，不是心理治療、命理判斷、保證預測或關係結果承諾。
```

Payment product description:

```text
商品名稱：曖昧溫度計完整分析
商品類型：一次性數位內容 / AI 生成情境分析
建議售價：NT$49
交付方式：付款成功後，使用者可於網頁或 LINE 連結查看完整分析。
```

Provider-safe claim boundaries:

- Do not claim the product can guarantee another person’s real thoughts.
- Do not claim successful relationship outcomes.
- Do not describe the service as therapy, counseling, medical diagnosis, legal advice, fortune-telling, or guaranteed prediction.
- Describe it as communication support, signal organization, and next-step reference.

## 4. Storefront Product Copy Draft

Suggested product section:

```markdown
## 曖昧溫度計完整分析

一次性查看｜NT$49

付款成功後，你會取得一份完整分析連結，可於網頁或 LINE 中查看。這是一次性數位內容，不需要物流寄送。

完整分析包含：

- 你們目前的關係溫度與訊號整理
- 3 種可能狀態
- 回覆策略與可直接使用的句子
- 48 小時觀察建議
- 這份分析主要參考的線索摘要
- 可回看的完整結果頁

此結果是根據你提供的文字內容整理出的溝通輔助，不是心理治療、諮商、命理判斷，也不保證任何關係結果。
```

Short paid teaser variant:

```text
想看完整分析？NT$49 一次性查看。付款成功後可在網頁或 LINE 開啟完整結果，內容包含 3 種可能狀態、回覆策略、可直接使用的句子、48 小時觀察建議與分析依據線索摘要。
```

Purchase-area trust note:

```text
付款前請確認你不需要在輸入內容中留下姓名、電話、地址、帳號或其他能識別身分的資訊。分析只根據你提供的文字產生，付款資料由金流服務處理。
```

## 5. Refund / Re-delivery Policy Draft

Recommended refund/re-delivery section:

```markdown
## 退款與重新交付

由於「曖昧溫度計完整分析」屬於付款後產生/交付的數位內容，若系統已成功產生並交付完整分析，一般情況下不提供退款。

如果付款成功後發生以下情況，請聯絡我們：

- 系統未能成功產生完整分析
- 完整分析連結無法開啟
- 你重複付款
- 付款成功但沒有收到可查看完整分析的連結

經確認後，我們會協助重新產生、補發連結，或在無法重新交付時辦理退款。

請透過 hello@anyu.tw 或官方 LINE 聯絡我們，並提供付款時間與可識別訂單的必要資訊。客服僅需付款/訂單資訊，不需要你提供原始對話內容、完整卡號、LINE ID token 或其他不必要的敏感資料。
```

Short checkout/support version:

```text
若付款成功但完整分析未產生、連結無法開啟或發生重複付款，請來信 hello@anyu.tw 或透過官方 LINE 聯絡我們。我們會協助重新交付；無法重新交付時，再協助退款。
```

Invoice/receipt placeholder for owner review only:

```text
發票或收據相關資訊將依實際申請主體與金流/稅務設定辦理。
```

Do not publish the invoice/receipt placeholder until owner confirms tax/invoice posture.

## 6. Privacy / Trust Copy Draft

Recommended product-page privacy note:

```text
你不需要留下姓名就能使用曖昧溫度計。請不要貼上姓名、電話、地址、帳號、身分證字號、金融資訊或其他能識別身份的資料。

你提供的文字只會用於產生本次分析與必要的服務交付；不會公開展示，也不會提供給第三方作行銷用途。分析資料會依系統保留規則清理。
```

Payment-specific privacy note:

```text
付款資料將由金流服務提供的付款頁處理。ANYU 不應收集或保存完整卡號。客服處理付款或連結問題時，只需要訂單/付款查詢資訊，不需要你提供原始對話內容。
```

Privacy page placement note:

```text
未來啟用正式付款前，隱私權政策應補充：付款資料由金流服務商處理，ANYU 僅保存完成服務交付、查詢與客服所需的訂單/交易狀態資訊。
```

## 7. Service Limitation / Disclaimer Draft

Recommended limitation copy:

```text
暗語 ANYU 提供的是文字情境整理與溝通建議，不是心理治療、諮商、醫療診斷、法律建議或命理服務。分析結果不能保證對方真實想法，也不能保證任何關係結果。請把它當作一個幫助你整理線索與下一步選擇的參考。
```

Short version:

```text
這不是判決，也不是心理諮商；它只是幫你整理互動線索與下一步選擇。
```

Unsupported-use note:

```text
如果你正在面臨暴力、騷擾、自傷、他傷、重大心理壓力或人身安全風險，請立即尋求可信任的人、專業機構或當地緊急協助。ANYU 不提供危機處理服務。
```

## 8. Support / Contact Copy Draft

Recommended support copy:

```text
如果付款、連結或結果產生遇到問題，請來信 hello@anyu.tw，或透過官方 LINE 聯絡我們。請提供付款時間、訂單資訊或錯誤畫面描述；不需要附上原始對話內容。
```

Provider-review footer/support copy:

```text
客服信箱：hello@anyu.tw
服務問題：付款、連結、完整分析交付、資料刪除或隱私請求
提醒：客服不需要你提供原始對話內容或完整付款卡號。
```

Do not add private phone, address, applicant name, bank information, business number, or identity details until owner explicitly approves public disclosure.

## 9. Page Placement Recommendation

Module 01 product page / paid teaser:

- Product name
- Price
- What is included
- Delivery method
- Short refund/re-delivery note
- Short privacy/trust note
- Short service limitation note
- Support contact

Terms page:

- Digital content delivery terms
- Refund/re-delivery policy
- Duplicate payment handling
- Failed generation / failed delivery handling
- Service limitation
- Support contact

Privacy page:

- Input data use
- Do-not-paste-identifiers note
- Payment provider processing note
- Order/payment status retention note
- No third-party marketing use
- Deletion/support contact

Checkout / payment confirmation page after future implementation:

- Product name and price
- Digital delivery/no shipping
- Support contact
- Refund/re-delivery link
- Privacy/legal links

## 10. Owner Decisions Needed

Applicant / business posture:

- Applicant type: individual / business registration / company / studio.
- Bank payout account type.
- Tax/invoice posture.
- Whether public pages should list applicant/company details.
- Whether public pages must show phone/address or email is enough for provider review.
- Whether `hello@anyu.tw` is the formal support email.
- Whether official LINE OA should be formal support or only fulfillment/contact channel.

Copy approval:

- Approve product description.
- Approve refund/re-delivery policy.
- Approve privacy/trust copy.
- Approve limitation/disclaimer copy.
- Approve first payment method set.
- Decide whether invoice/receipt language can be published.

## 11. Application Checklist

Before applying to NewebPay:

- [ ] Applicant type chosen.
- [ ] Applicant/business documents ready.
- [ ] Bank payout account ready.
- [ ] Tax/invoice posture decided.
- [ ] Support email confirmed.
- [ ] Public product page URL available.
- [ ] Product price visible.
- [ ] Delivery method visible.
- [ ] What-is-included list visible.
- [ ] Refund/re-delivery policy public or ready to publish.
- [ ] Privacy page available.
- [ ] Terms page available.
- [ ] Service limitation/disclaimer available.
- [ ] No risky claims on product page.
- [ ] Domain SSL working.
- [ ] Future return URL planned.
- [ ] Future notify/webhook URL planned.
- [ ] No payment credentials or merchant secrets stored in repo.

## 12. Recommended Next Step

Owner should review and approve the drafts in this bundle. After approval, run a narrow app-copy implementation pass that adds provider-review-ready product/refund/support copy to public pages while keeping real payment disabled.
