# Legal Baseline Content Draft v0 Execution Report

## Summary

建立了 ANYU / Module 01 的第一批法務與信任內容草稿，內容集中於隱私、使用規則、免責說明、UI 短提醒、LINE 漏斗揭露，以及未來 persona / insight graph 的同意文案。這一輪只做可審閱的 markdown 草稿，沒有改動 app route、footer、資料流程或產品行為。

## Files Created

- `ai-collaboration/handoffs/2026-05-20-legal-baseline-content-draft-v0-handoff.md`
- `docs/legal/privacy-policy-v0.md`
- `docs/legal/terms-of-service-v0.md`
- `docs/legal/disclaimer-v0.md`
- `docs/legal/ui-notices-v0.md`
- `docs/legal/line-funnel-disclosure-v0.md`
- `docs/legal/persona-insight-consent-v0.md`
- `ai-collaboration/research/2026-05-20-legal-baseline-content-review-v0.md`
- `ai-collaboration/reports/2026-05-20-legal-baseline-content-draft-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Privacy Draft

- 說明目前可能收集的資料類型
- 保守描述去識別化輸入與事件紀錄的邊界
- 使用「24 小時目標」而不是尚未實作完成的硬承諾
- 對未來 persona / insight graph 保持明確 opt-in 方向

## Terms Draft

- 定義服務內容與使用者責任
- 補上禁止用途與異常使用限制
- 明確說明內測與假門付費功能仍非正式收費承諾

## Disclaimer Draft

- 補齊非專業建議聲明
- 補齊 AI 不完整／不準確風險
- 補齊危機／安全情境的轉介提醒

## UI Notices Draft

- 提供輸入提醒、CTA 送出提醒、結果頁短聲明、內測付費提醒、contact 說明與 footer 文字草稿

## LINE Disclosure Draft

- 把 LINE 描述成台灣 v0 最可能的主要漏斗方向
- 同時避免聲稱 LINE API 已經正式上線
- 保留 Email 作為備用聯絡管道

## Persona Consent Draft

- 將長期 persona / insight 功能定義為未來能力
- v0 預設不建立長期個人化檔案
- 建議使用明確 opt-in 文案

## Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

## Known Limitations

- 這些內容是產品與信任草稿，不是最終法律版本
- 正式公開前仍需要補上明確刪除請求／聯絡窗口
- 仍需要人類或法律專業人士審閱

## Deviations From Handoff

- none

## Git Commit

- Pending at report-write time; final hash is included in the final Codex Completion Summary.

## Staging Push

- Pending at report-write time; final staging push status is included in the final Codex Completion Summary.

## Remaining Uncertainties

- 是否要把「24 小時清理目標」寫成更強或更弱的承諾
- LINE primary wording 要不要在對外版本更明確
- 正式刪除窗口與對外聯絡方式尚未決定

## Recommended Next Step

`Legal Page Implementation Plan v0`
