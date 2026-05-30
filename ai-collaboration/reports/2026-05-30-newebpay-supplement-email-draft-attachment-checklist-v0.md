# NewebPay Supplement Email Draft and Attachment Checklist v0

Date: 2026-05-30
Branch: staging

## Summary

This document prepares a NewebPay merchant review supplement email draft and owner-facing attachment checklist. It is documentation-only and does not change payment runtime, checkout, NotifyURL, queue, LINE, prompt, schema, production flag, or public website behavior.

Public support email has been verified as `hello@anyu.tw` in the current website/legal copy and should be used in the supplement materials.

## Website Update Summary

The following public website updates were completed in NewebPay Merchant Review Public Content Implementation v0:

- Root homepage now presents a public storefront for `曖昧溫度計｜AI 關係互動分析報告`.
- Product/service introduction explains the service as a digital AI-assisted relationship interaction analysis report.
- Public copy explains that users can receive a free initial analysis and, after paid unlock, a fuller AI-generated interpretation/report.
- A synthetic product preview card visually represents the report/service without using private user data.
- Price is displayed as `單次完整報告解鎖：NT$ 49`.
- Charging model is disclosed as one-time payment, non-subscription.
- Delivery method is disclosed as web-based result delivery after payment confirmation, with a processing/waiting state if generation takes time.
- Refund/support summary is visible on the root page.
- Dedicated refund policy page exists at `/refund`.
- Footer/legal links now expose service introduction, refund policy, privacy policy, terms, and disclaimer.

Recommended website URLs for review:

- Root homepage / product storefront: `https://anyu.tw/`
- Refund policy: `https://anyu.tw/refund`
- Legal page: `https://anyu.tw/legal`
- Terms: `https://anyu.tw/terms`
- Privacy policy: `https://anyu.tw/privacy`
- Disclaimer: `https://anyu.tw/disclaimer`

If production has not yet been refreshed to the latest staging content, use the owner-confirmed staging URL for screenshots and clearly note that production refresh is pending.

## Attachment Checklist

Prepare these attachments outside the repo. Do not commit the files or any private data.

| Attachment placeholder | Purpose | Owner action | Privacy / redaction notes |
| --- | --- | --- | --- |
| `01_homepage_product_service_price.png` | Shows product/service introduction, synthetic product preview, NT$49 price, one-time charging model, and web delivery copy. | Capture latest production or staging page after confirming URL. | Do not include admin bars, private browser extensions, tokens, or account details. |
| `02_refund_policy.png` | Shows refund/reissue policy and support contact. | Capture `/refund`. | Ensure visible support email is `hello@anyu.tw`. |
| `03_legal_footer_links.png` | Shows footer/legal links for refund, privacy, terms, and disclaimer. | Capture footer area or legal index. | No private data. |
| `04_domain_ownership_anyu_tw.pdf/png` | Proves ownership/control of `anyu.tw`. | Export domain registrar or DNS proof. | Redact registrar account IDs, payment details, and unrelated domains if present. |
| `05_vercel_hosting_platform_proof.pdf/png` | Shows hosting/deployment platform proof. | Provide Vercel billing, invoice, project, or deployment proof. | Redact billing details, account IDs, private project settings, environment variables, and tokens. |
| `06_ai_api_provider_proof.pdf/png` | Shows AI/API provider account, billing, invoice, or usage proof. | Provide OpenAI/Anthropic or applicable AI service proof. | Redact API keys, organization/account IDs, invoice numbers if not needed, and detailed billing identifiers. |
| `07_self_developed_system_statement.pdf` | Explains no external system vendor invoice exists because system is self-developed. | Use or adapt the statement below and export as PDF if useful. | Include only factual, non-secret information. |
| `08_website_order_payment_flow_explanation.pdf/png` | Explains planned order/payment flow or shows review-safe checkout/order page if available. | Provide a simple flow note or screenshot if NewebPay requests order information. | Do not include test card data, real payment payloads, tokenized URLs, or private transaction IDs. |
| `09_merchant_identity_docs.pdf/png` | Business/merchant identity proof if NewebPay asks for it. | Provide only if already requested or available. | Keep personal identity and registration documents out of the repo. Send directly to NewebPay through approved channel. |

## Self-Developed System Statement Draft

Use this only as an owner-reviewed statement. Adjust merchant/operator names as needed before sending.

```text
暗語 ANYU 網站與「曖昧溫度計｜AI 關係互動分析報告」服務由申請人／營運者自行開發與維護，並非委託外部系統廠商建置，因此目前無外部系統廠商發票可提供。

本服務網站部署與託管使用 Vercel 平台；AI 輔助報告產生使用第三方 AI/API 服務，相關平台、網域與 API 服務證明請見附件。

網站主要提供數位內容服務：使用者輸入文字情境後，可取得免費初步分析；正式付款解鎖後，可查看一次性的完整 AI 生成分析報告。付款功能目前依金流審核流程進行中，正式對外收費前將依審核結果與網站公告內容上線。
```

## NewebPay Supplement Email Draft

Subject:

```text
補件資料提供｜暗語 ANYU 曖昧溫度計網站商品說明、退款政策與相關證明文件
```

Email body:

```text
藍新金流客服團隊您好：

您好，我們是暗語 ANYU。針對本次商店審核補件意見，已完成網站內容補充，並整理相關證明文件如附件，敬請協助再次審核。

一、商品／服務內容補充
網站已補充「曖昧溫度計｜AI 關係互動分析報告」的商品與服務說明。此服務為數位 AI 輔助關係互動分析報告，使用者輸入曖昧互動情境後，可取得免費初步分析；正式付款解鎖後，可查看更完整的 AI 生成分析報告。

網站目前已公開揭露：
- 商品／服務名稱與介紹
- 產品預覽示意區塊
- 單次完整報告解鎖價格：NT$49
- 收費方式：一次性付款，非訂閱制
- 交付方式：付款完成並確認後，於網頁提供付費完整報告；若系統處理需時間，頁面會顯示處理中狀態

二、退款政策補充
網站已公開揭露退款與補發政策。若發生重複付款、付款成功但完整報告未產生、付費結果連結因系統問題無法開啟，或其他明確付款／系統異常，使用者可透過客服信箱 hello@anyu.tw 聯絡協助補發或退款。由於完整報告屬於付款後產生或交付的數位 AI 內容，若報告已成功產生並可查看，一般情況下不因主觀喜好或解讀感受提供退款。

三、網站連結
- 商品／服務介紹頁：https://anyu.tw/
- 退款政策：https://anyu.tw/refund
- 法律與說明：https://anyu.tw/legal
- 使用條款：https://anyu.tw/terms
- 隱私權政策：https://anyu.tw/privacy
- 免責聲明：https://anyu.tw/disclaimer

四、附件資料
本信附上以下補充資料供審核參考：
- 首頁商品／服務／價格／收費方式截圖
- 退款政策頁截圖
- 網域 anyu.tw 相關證明
- Vercel 網站託管／平台證明
- AI/API 服務使用或帳務證明
- 自行開發系統說明
- 網站訂單／付款流程說明（如適用）
- 其他貴司要求之商店／身分相關文件（如適用）

金流串接目前依審核流程進行中；正式對外收費前，將依審核結果與網站公開資訊進行上線。

再麻煩協助審核，若仍需補充其他文件或資訊，也請告知，我們會再配合提供。

謝謝您。

暗語 ANYU
客服信箱：hello@anyu.tw
```

## Owner Confirmation Checklist Before Sending

- Confirm support email/channel: `hello@anyu.tw`.
- Confirm whether refund handling time should include a concrete processing window.
- Confirm `NT$49` is the final review price shown to NewebPay.
- Confirm final screenshot source: production `https://anyu.tw` or staging URL.
- Confirm production has been refreshed if using production screenshots.
- Confirm attachment filenames and contents match the email list.
- Confirm all screenshots redact browser extensions, admin UI, private account details, tokens, and unrelated tabs.
- Confirm domain, hosting, AI/API, and identity proof documents are accurate and current.
- Confirm whether merchant identity/business registration documents are required for this application.
- Confirm no private invoice numbers, account IDs, API keys, provider credentials, raw user input, or tokenized URLs are included in the repo or pasted into public docs.

## Notes For ChatGPT Review

- The customer support email has been verified in site/legal copy as `hello@anyu.tw`.
- The email draft intentionally says the payment integration is under review, not publicly live.
- The attachment checklist uses placeholders only and does not include private documents.
- The owner must send private proof documents directly to NewebPay customer service outside the repository.

## Validation

- Documentation presence check: passed.
- Secret/private pattern scan: no secret values found. Matches were policy/redaction warnings in this report and historical env-var references in the existing summary log.
- `git diff --check`: passed.

## Recommended Next Step

Owner prepares screenshots and external proof documents, reviews this email draft, then sends the supplement package to NewebPay customer service.
