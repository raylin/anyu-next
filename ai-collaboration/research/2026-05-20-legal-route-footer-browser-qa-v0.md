# Legal Route + Footer Browser QA v0

## 1. Summary

完成了針對法律頁面與 footer legal links 的 staging QA。雖然這個環境沒有可直接操作的 in-app browser runtime，我仍用已驗證的 staging deployment 檢查、`vercel inspect`、受保護頁面的 live HTML 檢視，以及 source/CSS 檢查完成了這輪 QA。結果整體通過，只有一個小修正：補上 `/legal` index 頁的版本／日期／聯絡信箱區塊，讓它和其他 legal 頁一致。

## 2. Deployment Freshness

- `origin/staging` 最新提交已包含 `f2bf35e`，而本次 QA 時 staging 已部署到更晚的 preview deployment
- `vercel inspect https://staging.anyu.tw` 顯示 staging 指向 `anyu-next-k8euku9n4-studioanyu-1488s-projects.vercel.app`
- 因此 staging freshness 狀態為通過

## 3. Routes Tested

- `https://staging.anyu.tw/privacy`
- `https://staging.anyu.tw/terms`
- `https://staging.anyu.tw/disclaimer`
- `https://staging.anyu.tw/legal`
- `https://staging.anyu.tw/m/ambiguous-temperature`
- `https://staging.anyu.tw/m/ambiguous-temperature/result/demo`

## 4. Legal Route Results

- `/privacy` 載入成功，title、說明、交叉導覽與 `hello@anyu.tw` 正確
- `/terms` 載入成功，title、禁止使用項目、內測/付費說明與 `hello@anyu.tw` 正確
- `/disclaimer` 載入成功，title、非專業建議、危機聲明與 `hello@anyu.tw` 正確
- `/legal` 載入成功，索引連到三個 legal pages；本次補上版本／日期／聯絡信箱後與其他 legal 頁更一致
- ANYU branding 存在但不壓迫，沒有落成 SaaS dashboard 氣質

## 5. Footer Link Results

- landing 頁 live HTML 可見 footer links：
  - `隱私權政策`
  - `使用條款`
  - `免責聲明`
- demo result 頁 live HTML 也可見同一組 footer links
- real runtime result 沒有另外單獨打一次 live request，但使用同一個 `AiTemperatureResult` component，因此 footer path 一致

## 6. UI Short Notice Results

### Landing

- privacy helper 已改為法律草稿要求的短提醒
- CTA 下方已存在 `送出後，我們會依隱私權政策處理你提供的文字；系統會盡量先做去識別化。`
- footer links 存在且不算吵

### Result

- subtle disclaimer 已存在：`這不是判決，也不是心理諮商；它只是幫你多看一眼互動裡的訊號。`
- share / paid preview / legal footer 共同存在，但在目前 HTML 結構下仍屬可接受密度

### Contact Capture

- source 檢查可確認 contact note 使用 reviewed legal copy
- 沒有誤導宣稱 LINE 自動化已正式上線

## 7. Placeholder Scan

- legal-facing placeholder 掃描結果通過
- `docs/legal/` 與 app-rendered legal content 已無 `TBD`、`[contact email]`、`placeholder` 類型的法務對外占位字
- `example.com` 仍存在於 contact capture 的 email placeholder，但這是輸入範例，不是 legal-facing placeholder，因此不視為問題

## 8. Content Consistency

- `docs/legal` 與 app-rendered legal content 都使用 `hello@anyu.tw`
- retention wording 仍維持「24 小時目標」，沒有被強化成硬承諾
- persona / insight graph 仍維持 opt-in only 方向
- fake-door / no-real-charge wording 仍準確
- LINE 仍被描述成 v0 / 近未來主要管道，但沒有聲稱現成自動化已經上線

## 9. Mobile Readability

- CSS 已為 legal nav 提供小螢幕單欄排版
- legal shell 仍維持窄欄、閱讀導向，不是寬 SaaS dashboard
- 這一項主要依 live HTML + CSS 結構判斷，不是真人手持裝置互動檢查

## 10. Issues Found

- `/legal` index 頁最初缺少和其他 legal pages 一致的版本／日期／聯絡信箱資訊

## 11. Fixes Applied

- 在 `/legal` 頁 header 補上：
  - 版本 `v0`
  - 更新日期 `2026-05-20`
  - `hello@anyu.tw`

## 12. Remaining Limitations

- 這一輪不是字面上的互動式 browser/devtools QA，而是 staging live HTML + source/CSS-aware QA
- runtime result route 沒有額外獨立打 live staging request，但使用同一個結果 component，可合理推定 footer 行為一致
- 真正的手機可讀性與 tap feel 仍值得在真人裝置上做最後確認

## 13. Recommendation

目前 legal route + footer implementation 已可接受進入下一輪更完整的 staging funnel/browser QA。

## 14. Recommended Next Step

`Module 01 Human Browser Funnel Pass v0`
