# ANYU LINE OA Setup Record v0

Date: 2026-05-20

## 1. Summary

LINE OA setup is manually completed for v0.

LINE is the primary v0 retention and opening-notification channel.

Email remains secondary.

LINE API, LIFF, and webhook automation are deferred.

## 2. Account Identity

- LINE OA 名稱：暗語 ANYU
- 顯示名稱：暗語 ANYU｜關係微訊號
- 狀態訊息：把說不清的互動，翻譯成一點方向。
- 類別：已於 LINE 後台設定；具體類別待回填。

## 3. Add-Friend URL / QR

- Add-friend URL：https://lin.ee/S6dnbJO
- QR code URL：https://qr-official.line.me/gs/M_403ttnun_GW.png?oat_content=qr

Operational note:

- mobile same-tab handoff is confirmed working
- desktop QR fallback is expected and acceptable for v0

## 4. Profile Image

Recommended / used asset:

- `docs/design-system/brand/exports/line-profile-1024.png`

Current record:

- Profile image uploaded manually using the exported ANYU brand mark asset.

## 5. Background Image

v0 position:

- no background image for v0
- optional future ANYU cream / gold background later if brand needs it

## 6. Status Message

Current status message:

```text
把說不清的互動，翻譯成一點方向。
```

## 7. Welcome Message

Recorded v0 welcome-message baseline:

```text
歡迎來到暗語 ANYU。

我們會把那些說不清的互動，翻譯成一點方向。

如果你是從「曖昧溫度計」來的，可以回到測驗頁，或等完整分析開放時收到通知。
```

Actual live text:

- 版本 A 已調整為不過度承諾立即交付完整分析
- 如與上方文字有細節差異，待使用者回填最終上線版本

## 8. Rich Menu

v0:

- rich menu not enabled

Future candidate buttons:

- 測曖昧溫度
- 最新測驗
- 隱私與刪除資料

## 9. Complete Analysis Delivery Policy

Current policy:

- v0 does not promise immediate complete-analysis delivery
- current CTA copy should remain `加入 LINE，收到開放通知`

Future direction:

- if complete analysis delivery is added later, prefer automation over manual short-code matching

## 10. Email Fallback

Current policy:

- Email remains available as a secondary fallback
- it should not be visually equal to the LINE primary CTA

## 11. Mobile / Desktop Behavior

Recorded behavior:

- mobile open behavior: same tab
- desktop open behavior: same tab with QR fallback acceptable
- staging LINE CTA has been manually verified on phone

## 12. Privacy / Legal Notes

- users can block the LINE OA at any time
- users can contact `hello@anyu.tw` for deletion or privacy requests
- LINE data should not be used for unrelated third-party sharing
- high-frequency push behavior should be avoided
- current product/legal copy should continue to describe notification/opening, not guaranteed immediate complete-analysis delivery

## 13. Deferred LINE Features

- LINE Messaging API
- LIFF
- webhook
- rich menu
- userId mapping
- automatic result delivery
- short-code matching
- CRM segmentation
- broadcast campaigns

## 14. Production Launch References

Related docs:

- `ai-collaboration/research/2026-05-20-line-funnel-strategy-v0.md`
- `ai-collaboration/research/2026-05-20-line-funnel-ui-copy-implementation-plan-v0.md`
- `docs/operations/production-deployment-runbook.md`
- `docs/design-system/brand/exports/README.md`

Key launch references:

- add-friend URL to configure in app/public env: `https://lin.ee/S6dnbJO`
- profile image asset: `docs/design-system/brand/exports/line-profile-1024.png`

## 15. Open Questions

- LINE backend category is set, but the exact chosen category is still待回填
- the exact live welcome message may need a final copy-back from the operator
- whether a future background image is worth adding remains open

## 16. Recommended Next Step

- `Production Env + LINE Launch Checklist Sync v0`
