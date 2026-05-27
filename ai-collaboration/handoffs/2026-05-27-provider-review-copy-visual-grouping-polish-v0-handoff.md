# Handoff: Provider-review Copy Visual Grouping Polish v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Improve the visual structure of provider-review/payment-related public copy in Module 01. Current copy is correct but too dense: product value, delivery, privacy, refund, and service limitation copy are all rendered as plain paragraphs, making the paid preview/unlock area visually confusing.

This is a visual/copy layout polish task.

## Scope

Do:

- Split paid preview provider-review copy into product/value summary, delivery/current beta status, and trust/policy notes.
- Keep headline copy concise.
- Render included-content items as a compact visual block.
- Group delivery/privacy/refund/support copy into one compact panel.
- Move service limitation copy into lower visual hierarchy.
- Preserve provider-review clarity.
- Add/update tests.
- Create review bundle, execution report, summary log.
- Commit and push to `origin/staging`.

Do not:

- Change payment behavior.
- Enable checkout.
- Integrate NewebPay.
- Change LINE fulfillment.
- Change paid generation.
- Change prompt/schema/cache/DB.
- Change production payment behavior.

## Required Copy Structure

Paid preview headline area:

```text
解鎖下一句怎麼回 — NT$49
正式開放後，一次性查看；目前內測不會真的收費。
完整分析會透過網頁或 LINE 連結交付。
```

Included-content block:

- 3 種可能狀態
- 可直接使用的回覆句與回覆策略
- 48 小時觀察建議
- 分析依據線索摘要
- 可回看的完整結果頁

Trust / delivery / refund panel:

```text
交付與隱私
- 不需要留下姓名，也請不要貼姓名、電話、地址或帳號等可識別身份資訊。
- 你提供的文字只用於本次分析與必要服務交付，不會公開展示或提供第三方行銷使用。
- 正式付款後若系統未成功產生結果、連結無法開啟或重複付款，可協助補發或退款。
```

Service limitation:

```text
暗語 ANYU 是文字情境整理與溝通建議，不是心理治療、諮商、命理或關係結果保證。
```

## Validation

Run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint
cd apps/web && corepack pnpm test
cd apps/web && corepack pnpm build
cd apps/web && corepack pnpm test:e2e:local
```

If Playwright is blocked by known Chromium/MachPort issue, record honestly.

