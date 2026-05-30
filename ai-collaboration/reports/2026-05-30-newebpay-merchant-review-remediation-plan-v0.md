# NewebPay Merchant Review Remediation Plan v0

## Summary
NewebPay requested supplementary materials because the current public site does not yet present the product/storefront clearly enough for merchant review. The repo already contains solid Module 01 product/refund/privacy copy in result/payment-adjacent areas and legal pages, but the root homepage still reads as an internal technical foundation page, and there is no obvious public storefront/review page that combines product introduction, image, price, charging model, delivery, refund, and support information in one reviewer-friendly place.

This is a planning-only report. No code, runtime behavior, payment flags, provider callbacks, queue, LINE, prompt/result behavior, legal semantics, or production settings were changed.

## 1. Existing Public Site Audit

### Root Homepage `/`
Current state:
- Displays `暗語 ANYU`.
- Copy says `C-stage production foundation is being prepared.`
- CTA links to Module 01.

Review implication:
- This likely directly triggered “website has no product content.”
- It does not explain the service, product, price, charging model, delivery, refund, or support.
- It should be replaced or augmented with a provider-review-ready product/service landing section.

### Module 01 Public Page `/m/ambiguous-temperature`
Current state:
- Real Module 01 entry exists.
- Product title, interaction input, privacy helper, and analysis flow exist.
- Module config has price `NT$49`.
- Paid preview/result surfaces already explain planned one-time `NT$49`, beta/no-charge status, web/LINE delivery, included full-analysis items, privacy/trust, refund/re-delivery, support email, and service limitation.

Review implication:
- Useful, but much of the provider-review copy is visible after generating a result or in paid preview context.
- Reviewer may not reach or recognize it as storefront/product content.
- Needs a public, immediately visible “商品/服務說明” block near the top or a dedicated review/storefront page.

### Legal Index `/legal`
Current state:
- Lists privacy, terms, disclaimer.
- Shows support email `hello@anyu.tw`.

Review implication:
- Exists and is useful.
- Does not itself summarize product, price, refund, delivery, or charging model.

### Terms `/terms`
Current state:
- Has service content.
- Has beta/paid feature section.
- States formal full analysis planned as one-time digital content, suggested price `NT$49`.
- States delivery via web or LINE link.
- States complete analysis likely includes signal summary, possible states, reply strategy, 48-hour observation, evidence-summary clues, and revisitable full result page.
- Has digital-content delivery/refund/re-delivery policy.
- Has support email.

Review implication:
- Good foundation for refund policy.
- Should be linked visibly from storefront/payment area.
- May need a separate `/refund` or clear section anchor if NewebPay expects refund policy to be easy to find.

### Privacy `/privacy`
Current state:
- Explains input/content data, contact data, third-party services, retention, deletion requests, support email.
- Says payment data will be handled by payment provider pages and ANYU should not collect/store full card numbers.

Review implication:
- Good privacy support.
- Not a substitute for product/service and refund storefront clarity.

### Disclaimer `/disclaimer`
Current state:
- Explains service is not therapy, counseling, medical/legal advice, fortune-telling, or guaranteed prediction.
- Includes crisis/safety boundary.

Review implication:
- Good risk-control material.
- Should be linked from storefront/product area.

### Checkout / Payment Return Pages
Current state:
- NewebPay checkout/notify/access handoff foundations exist behind gates.
- ReturnURL shows payment status UX.
- Public runtime remains disabled for broad traffic.

Review implication:
- Useful for implementation readiness, but should not be used as primary public content until approved/enabled.
- Screenshots may be useful for internal evidence only if sanitized and not exposing tokens or secrets.

## 2. Requirement Mapping

| NewebPay comment | Required website change | Required copy/content | Required image/screenshot | External document/attachment | Owner action required | Codex implementation action required | Risk / notes |
|---|---|---|---|---|---|---|---|
| Product/service introduction | Replace/augment root homepage and Module 01 top section with clear product intro | Product name, service description, user flow, AI-generated digital report boundaries | Homepage/product page screenshots after implementation | Optional self-developed system statement | Approve public-facing wording and applicant/business posture | Implement storefront/product section and ensure `/` is no longer internal-foundation copy | Highest priority; current root page is likely the review blocker |
| Product image | Add product image/visual preview or screenshot of product/result | Caption explaining product/result preview | Product page screenshot, result preview screenshot, optional share-card image | None unless reviewer asks | Approve whether UI screenshot is acceptable as product image | Add a review-safe visual preview section or use existing share/result preview | Do not include raw user input or real paid result content |
| Product price | Make `NT$49` visible without requiring result generation | One-time full analysis `NT$49` | Product page screenshot showing price | None | Confirm price remains `NT$49` | Add price block to homepage/module page | Avoid “subscription” ambiguity |
| Fee/charging model | State one-time digital content, no subscription | “一次性付款 / 非訂閱 / 數位內容 / 無物流寄送” | Product page screenshot | None | Confirm no subscription model | Add charging-model copy near price and paid preview | Must remain consistent with payment implementation |
| Refund policy | Make refund/re-delivery policy easy to find | Duplicate payment, generation failure, inaccessible link, system abnormality; no subjective refund after successful delivery | Terms/refund section screenshot | None | Owner/legal confirmation of policy wording | Add visible refund section/page or homepage link to terms refund section | Do not overstate legal certainty |
| API / AI proof | None public required, but can mention AI provider category in privacy | Third-party AI service category only, no keys | Maybe privacy screenshot | OpenAI/Anthropic invoice or billing proof, API service dashboard screenshot if owner provides | Owner gathers proof and redacts account IDs/secrets | None in repo; possibly create attachment checklist only | Do not commit invoices or API account details |
| Domain proof | None public required unless contact/domain mismatch exists | Domain shown as `anyu.tw` | Browser screenshot of site domain | Domain registration/DNS proof for `anyu.tw` | Owner exports proof from registrar/DNS provider | None | Do not commit registrar account data |
| Hosting/platform proof | None public required | Site deployed on `anyu.tw` | Browser screenshot if needed | Vercel billing/invoice/project proof | Owner gathers and redacts private details | None | Branch-scoped Preview env note is unrelated to merchant documents |
| Website order information | Product/order flow needs visible product and price | Product name, one-time price, delivery method, support/refund | Checkout creation/ReturnURL screenshots only after safe staging/prod setup | Test order or provider sandbox screenshots if available | Owner decides whether to submit screenshots before payment runtime | After implementation, prepare screenshot checklist | Do not include tokenized URLs |
| System vendor invoice / self-developed statement | No public website change | If self-developed, prepare statement that ANYU system is self-developed and hosted on Vercel, using AI/API providers | Optional architecture screenshot without secrets | Self-developed system statement, Vercel proof, AI/API proof | Owner signs/approves statement | Draft non-final statement outline if requested | Do not fabricate vendor invoice |

## 3. Product / Service Content Proposal

Provider-review-safe product direction:

```text
商品名稱：曖昧溫度計完整分析
服務品牌：暗語 ANYU
商品類型：一次性數位內容 / AI 生成文字情境分析
建議售價：NT$49
收費方式：一次性付款，非訂閱制，無實體物流寄送
交付方式：付款成功並經系統確認後，使用者可透過網頁連結查看完整分析；未來可依功能設定透過 LINE 連結交付。
```

Public service description:

```text
暗語 ANYU 的「曖昧溫度計」是一個文字情境整理工具。使用者貼上一段互動描述後，系統會整理目前的關係溫度、互動訊號、可能狀態與下一步回覆建議。結果是溝通輔助與自我整理參考，不是心理治療、諮商、命理判斷，也不保證任何關係結果。
```

Free result:

```text
免費分析會提供關係溫度、目前互動狀態、初步訊號整理與簡短建議，幫助使用者先理解互動節奏。
```

Paid result:

```text
完整分析包含 3 種可能狀態、可直接使用的回覆句與回覆策略、48 小時觀察建議、分析依據線索摘要，以及可回看的完整結果頁。
```

Delivery timing:

```text
付款完成並經金流確認後，系統會產生或整理完整分析。多數情況可於付款確認後短時間內查看；若遇系統忙碌或產生失敗，使用者可聯絡客服協助重新交付或退款。
```

Support:

```text
客服信箱：hello@anyu.tw
```

## 4. Refund Policy Proposal

Draft direction for owner/legal confirmation:

```text
退款與重新交付

「曖昧溫度計完整分析」屬於付款後產生或交付的數位內容。若系統已成功產生並提供完整分析連結，一般情況下不因主觀喜好或使用者判斷不同而提供退款。

若發生以下情況，使用者可聯絡我們：
- 重複付款
- 付款成功但系統未成功產生完整分析
- 付款成功但完整分析連結無法開啟
- 因明顯系統異常導致無法取得已付款內容

經確認後，我們會優先協助重新產生或補發連結；若無法重新交付，將協助退款。

請來信 hello@anyu.tw，並提供付款時間、付款方式與可供查詢的訂單資訊。客服不需要你提供原始對話內容、完整卡號、LINE ID token 或其他不必要的敏感資料。
```

Owner/legal confirmation needed:
- Exact refund request window, if any.
- Whether email-only support is enough or LINE OA support should also be listed.
- Invoice/receipt wording for the actual applicant/tax posture.

## 5. Supporting Documents Checklist

Owner-provided materials likely needed:

- Domain registration or DNS proof for `anyu.tw`.
- Vercel project/billing/invoice or hosting/platform proof.
- AI/API provider billing proof, such as OpenAI/Anthropic invoice or usage/billing screenshot if applicable.
- Website screenshots after remediation:
  - root homepage with product/service intro
  - Module 01 product page with price and charging model
  - paid product included-content section
  - refund/re-delivery section
  - privacy/terms/support footer
- Test order / checkout flow screenshots if available after staging/sandbox configuration.
- Self-developed system statement if there is no system vendor invoice.
- Any platform/service invoices available, redacted where appropriate.

Do not commit these materials to the repo if they contain account IDs, billing identifiers, personal data, private invoices, or operational secrets.

## 6. NewebPay Customer Service Email Draft Outline

Subject:

```text
補充資料提供：暗語 ANYU / 曖昧溫度計完整分析
```

Outline:

1. Greeting and application/context reference.
2. Short explanation:
   - ANYU provides one-time AI-generated digital relationship/communication analysis.
   - Product is `曖昧溫度計完整分析`.
   - Planned price `NT$49`, one-time payment, no subscription.
   - Delivery through web result link; LINE delivery may be used when enabled.
3. Website updates:
   - product/service introduction
   - product image/screenshot
   - price and charging model
   - refund/re-delivery policy
   - privacy/support/legal links
4. Attachment list:
   - domain proof
   - hosting/platform proof
   - AI/API provider proof
   - product page screenshots
   - refund/terms screenshots
   - self-developed system statement, if applicable
5. Note:
   - Payment runtime is under review/testing and will be enabled only after approval.
6. Contact:
   - `hello@anyu.tw` or owner’s official application contact, per owner decision.

Do not send this as-is until owner inserts application identifiers and verified attachment names.

## 7. Recommended Implementation Order

1. Public product/service review page update:
   - Replace root homepage internal foundation copy.
   - Add product intro, price `NT$49`, one-time/non-subscription model, delivery, included content, product image/preview, support contact.
2. Refund policy visibility update:
   - Add a dedicated refund/re-delivery section or page.
   - Ensure footer/product page links make it easy for reviewer to find.
3. Provider-review screenshot/attachment preparation:
   - Capture sanitized screenshots after deployment.
   - Owner collects domain, hosting, AI/API proof, and optional self-developed statement.
4. NewebPay supplement email draft:
   - Convert outline into send-ready email after owner confirms attachments and applicant details.

## 8. Blockers / Questions

- Owner must provide or export external proofs; Codex must not fabricate them.
- Owner must confirm final refund request window and support channel scope.
- Owner must confirm whether public support remains only `hello@anyu.tw` or also LINE OA.
- Owner must confirm invoice/receipt wording for actual applicant/tax posture.
- If NewebPay requires public phone/address/applicant info, owner must decide what can be disclosed.

## 9. Validation

Documentation-only task:
- New handoff/report created.
- Summary log updated.
- Secret/private pattern scan should run before commit.

## Recommended Next Step
Implement public product/service content and refund-policy visibility updates for NewebPay merchant review, then prepare sanitized screenshots and owner-provided proof checklist.

