# Checkout-start v2 · Patch Memo

> 補在現有 **ANYU Theme Architecture / Hybrid Theme Park** 提案上的 patch，
> 不重做整份畫布。畫布新增 section：**「04✦ · Checkout-start v2 — 強制保存查看連結」**
> （Desktop hi-fi + Mobile hi-fi + Saved→Unlocked 對照）。

維持不變的推薦方向：Hybrid Theme Park · Module 01 = Riso-only · Core Shell = neutral editorial · Shared Flow Templates = 結構共用、模組上色 · Module 02 Radar 預覽保留。

---

## A. 這個 patch 改了什麼（flow / copy 修正）

1. **付款前強制保存查看連結**：`前往安全付款` 在「保存專屬查看連結」完成前為 **locked**（虛線 + 鎖 icon + 提示），無法直接點。
2. **Desktop checkout-start**：只顯示 **Email** 保存查看連結，**無 LINE CTA**；Email 保存成功後才 unlock 付款。文案用「保存查看連結 / 專屬查看連結 / 回 ANYU 查看完整報告」；無 recovery / 找回 作主 CTA；無報告正文交付承諾。
3. **Mobile checkout-start**：**LINE 卡片 / CTA 在 Email 上方**，Email 為 fallback 在下；完成 LINE 或 Email 任一即 unlock 付款；LINE 失敗 / 取消 → 可重試 LINE 或改用 Email；無 desktop-only 的 LINE fallback 提示。
4. **移除的過期 / 不正確元素**（全畫布一併清掉）：「目前內測中，這次不會真的收費」、Email save 的 LINE ID 選填欄、付款前的去識別化 / 改善訓練 consent checkbox、Email/LINE 寄送報告正文的暗示。
5. **連結保留天數**：不再固定寫「30 天」。統一改為「此專屬查看連結會在有效期限內保留。」→ **retention copy 以 product policy 為準。**
6. **/r/ access-link 安全提醒**：保留「這個連結就是你的鑰匙」語氣，並補一句「**請勿轉傳給他人。**」

---

## B. 哪些是 visual reference，哪些必須以 product source-of-truth 為準

### Visual reference（這份畫布負責的：看起來長怎樣）
- Riso 視覺語言：版面、卡片 / 按鈕 / 欄位、月相 motif、accent、grain、offset shadow。
- 門檻的**狀態表現**：locked（虛線 + 鎖 + 提示）vs unlocked（實心 CTA）。
- Desktop = Email-only、Mobile = LINE 在上 / Email fallback 的**版面與優先級**。
- step 結構（STEP 1 保存 → STEP 2 付款）與文案語氣。

### Must follow product source-of-truth（工程 / PM 對齊，不以畫布為準）
- **連結有效天數 / 保留期**：用實際 policy；畫布只寫「有效期限內保留」。
- **保存成功的判定與 unlock 條件**：LINE 綁定成功事件、Email 驗證 / 寄送成功的實際 trigger。
- **LINE 失敗 / 取消的真實狀態碼與重試邏輯**。
- **藍新（NewebPay）金流**：金額、`NT$49`、一次性、付款確認以藍新通知為準 —— 以金流與法務文案為準，外部頁不主題化。
- **報告交付形式**：以網頁 + 專屬查看連結查看；Email / LINE **只送連結，不送報告正文** —— 以實際交付管線為準。
- **退款 / 補發時效**、PII / 隱私處理：以隱私政策與 support SOP 為準。

> 一句話：**畫布定「長相與門檻邏輯的視覺」，產品端定「天數、事件、金流、交付的真值」。** 兩者衝突時以 product source-of-truth 為準。

---

## C. 畫布內既有頁的連帶修正
- §04 `RisoCheckoutStart`（流程概覽 / skeleton）：移除內測字樣，加註「強制保存門檻見 04✦」。
- §04 `paid result` / `/r/ return` / `Email save`：30 天 → policy 文案；`/r/` 補「請勿轉傳給他人」；Email save 移除 LINE ID 選填欄與 consent checkbox，改為查看連結語言。
- §07 Module 02：同步移除內測字樣與固定天數（保留為 preview）。
