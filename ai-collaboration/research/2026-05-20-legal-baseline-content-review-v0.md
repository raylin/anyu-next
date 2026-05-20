# Legal Baseline Content Review v0

## 1. Summary

建立了第一批可審閱的 ANYU 法務／信任內容草稿，覆蓋隱私權政策、使用條款、免責聲明、UI 短提醒、LINE 漏斗揭露，以及未來 persona / insight graph 的同意文案。這些內容刻意保守，避免承諾尚未實作的自動刪除、LINE 自動化或正式客服流程。

## 2. Files Created

- `docs/legal/privacy-policy-v0.md`
- `docs/legal/terms-of-service-v0.md`
- `docs/legal/disclaimer-v0.md`
- `docs/legal/ui-notices-v0.md`
- `docs/legal/line-funnel-disclosure-v0.md`
- `docs/legal/persona-insight-consent-v0.md`

## 3. Privacy Policy Summary

- 說明 ANYU 目前可能處理的資料類型：輸入文字、分析結果、匿名 session、事件資料、聯絡資料與必要技術資訊
- 明確寫出「盡量不在事件紀錄中保存原始文字」，但不虛假宣稱完全不存任何文字
- 對去識別化輸入與短期保存採保守說法
- 對資料保存期間使用「24 小時目標」而非絕對承諾

## 4. Terms Summary

- 把服務定位成 AI 關係互動觀察工具，而非正式專業服務
- 明確列出不可接受用途：騷擾、違法、敏感個資、prompt injection、大量自動化、成本攻擊
- 保留限制或拒絕異常使用的權利

## 5. Disclaimer Summary

- 明確說明不是心理、醫療、法律或其他專業建議
- 強調 AI 分析可能不完整或不準確
- 要求使用者不要把結果當成重大決策唯一依據
- 補上危機／安全情境的轉介提醒

## 6. LINE Funnel Disclosure Summary

- 把 LINE 描述為台灣 v0 內測最可能的主要通知與交付管道
- 同時清楚說明：這不代表 LINE API 或完整自動化已經全部上線
- 保留 Email 作為備用選項

## 7. Persona / Insight Consent Summary

- 明確把未來長期 persona / insight 功能寫成 opt-in 方向
- v0 預設不建立長期個人化檔案
- 不同意長期洞察，不應影響單次分析使用

## 8. UI Notices Summary

- 提供短版輸入提醒、送出提醒、結果頁提醒、fake-door 內測提醒、contact 說明與未來 LINE 補充文案
- 整體語氣維持清楚、溫和、不過度嚇人

## 9. Open Questions For User Review

- 原始／去識別化輸入的保存期間，是否要維持「24 小時目標」而不是固定承諾？
- LINE 是否現在就要明確寫成 primary channel，還是保留成「即將成為主要方向」？
- Persona / Insight consent 是否在 v0 必須明確維持 opt-in only？
- fake-door paid wording 是否在所有相關畫面都要明講「這次不會真的收費」？
- 刪除請求或隱私聯絡窗口，正式公開前要填哪個 Email 或表單？

## 10. Implementation Readiness

- 內容層面已足夠支撐下一步 legal page 實作
- 仍需要在公開前補上正式聯絡窗口
- 仍需要人類／專業顧問審閱，尤其是保存期間、刪除流程與未成年人條款

## 11. Recommended Next Step

`Legal Page Implementation Plan v0`
