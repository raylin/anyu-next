# 暗語 ANYU · Module Theme 架構 + Module 01 Riso 統一 — Design Memo

> 推薦方向：**Hybrid Theme Park Model**
> 配套設計畫布：`proposal/ANYU Theme Architecture.html`（策略 panel + 完整 hi-fi 畫面）
> 本文件 = 精簡決策 / handoff 文字版；畫布 = 視覺真相。

---

## 0. 一句話

ANYU 主站是**統一的園區入口**；每個模組是一座**沉浸式主題園區**。一旦使用者進入某模組，從輸入 → 付款 → 拿到報告 → 之後回訪，整段旅程都待在那個世界裡 —— 視覺撕裂消失。

---

## 1. Design philosophy

- **主站 vs 模組世界**：Core Shell 提供共同識別與入口（首頁、模組總覽、法務、未來會員）；模組世界提供完整沉浸（顏色、motif、語言、情緒）。
- **共享 vs 沉浸**：共享的是「暗語 DNA」——字體系統、間距、wordmark、信任與隱私語言。沉浸的是模組的 Theme Pack。
- **避免撕裂**：撕裂幾乎都來自「強主題 → 淡雅 generic → 強主題」的來回。把整段旅程鎖在一個世界即可解決。
- **Universal Studios 類比**：整座園區有共同識別；各主題園區沉浸而獨特；園區間移動不破裂，因為底層系統共用。
- **一個模組不混多種主題**：Module 01 必須 Riso-only。

---

## 2. Route / surface classification

| 群組 | 路由 | 由誰控制 | 共用 | 模組專屬 | 中性 |
|---|---|---|---|---|---|
| **A · Site / Core Shell** | `/` 首頁、`/modules`、`/legal·/refund·/support`、（未來）`/account` | ANYU Core Shell（中性 editorial） | 字體 / 間距 / wordmark / 信任語言 | 無（模組只以小色塊預覽） | 整層保持安靜 |
| **B · Module Journey** | `/m/ai-temperature` 輸入、result、checkout-start、ReturnURL、paid result、`/r/…`、LINE bind、Email save、expired/invalid | 該模組 Theme Pack（Module 01 = Riso） | 版面骨架 + Shared Flow Templates | accent / motif / 語言 / 情緒 | 不允許 |
| **C · External** | NewebPay 藍新付款頁 | 藍新（無法套主題） | — | — | 保持原樣，前後橋接頁包住它 |

---

## 3. Theme architecture — 四層

由外到內、越外層越穩定：

1. **ANYU Core Shell**（park frame）— 品牌外框、首頁、法務 / 支援、未來會員。中性 editorial。
2. **Module Shell**（structural wrapper）— 進入模組後的結構外殼：navbar 行為、頁面 scaffold、單欄滾動模型、safe-area。
3. **Module Theme Pack**（the swappable skin）— 一個模組的整套感官：`--anyu-accent / accent2 / rose`、motif、紋理 / bleed、狀態語言、CTA 質感。
4. **Shared Flow Templates**（themeable skeletons）— 跨模組共用、被 Theme Pack 上色的流程骨架。

換模組 = 給 Module Shell 套一個新的 Theme Pack。實作上 = 一個 `ModuleAccentScope`（或 `AnyuPage tokens=`）+ 一個 motif。

---

## 4. Module 01 Riso 統一

Riso = v2.0 視覺語言：奶油紙底 + halftone grain、銳角 2–4px、粗墨線 1.5px、實心位移陰影（4/4 offset）、群青紫 `#5b3aa3` + 螢光洋紅 `#ec4e8c` + 朱橘 `#f08c5a`、Fraunces 拉丁數字、月相顯影 motif。

**全部轉成 Riso 的 owned 頁（畫布 §04 已畫成 hi-fi）：**

- **checkout-start** — 模組標題 + stepper + 訂單摘要（NT$49 · 一次性）+ 藍新信任聲明 + 主 CTA。Riso 卡片，但金額 / 退款 / 藍新等信任資訊放在固定殼，不浮誇。
- **ReturnURL waiting** — 先給確定性「收到了」，再用「接下來會發生什麼」三步；**不放 primary CTA**、不出現百分比 / spinner / 技術字眼。月相微亮 = 報告在顯影。
- **paid result 交付** — zine cover：persona / 溫度 / 金句 + UNLOCKED 印 + 「開啟完整報告」+ INSIDE 清單。像翻開同一本 zine 的下一頁。
- **/r/ 連結返回** — 「歡迎回來，這份報告一直為你留著」+ 連結效期（剩 28 天）+ 開啟 CTA。不需登入，連結即鑰匙。
- **LINE bind / Email save** — 連結保管：說明「你會收到什麼」、綁定 / 寄送、隱私聲明（只送連結、不寄電子報、不分享第三方）。**Email / LINE 只送 access link，不送報告全文。**
- **expired 連結** — error 狀態（月相 error 印 + rose），補發 / 重來兩條路。

**信任 / 付款清晰原則**：Module 01 可以情緒、可以表達，但付款 / 連結狀態必須維持清楚與信心 —— 固定資訊（NT$49 · 一次性 · 藍新 · 網頁交付 · 退款 3–7 天）永遠在共用殼，不被風格淹沒。

---

## 5. Core Shell — 主站視覺語言

- **色彩**：奶油紙 `#faf6ee` + 墨 `#1a1626`；**不設單一主導 accent**，模組顏色只以小色塊在模組卡 / 列表出現。
- **字體**：延續暗語 — 襯線負責情緒大標、無襯線負責結構、mono 負責 label、Fraunces 負責數字。
- **間距 / 版面**：比模組世界更多留白；用 **hairline 細線**取代粗墨卡與位移陰影 → 安靜、不搶戲。
- **nav / header / footer**：wordmark 左上、漢堡選單；footer 放法務連結。模組世界才用粗墨 + 位移陰影。
- **模組卡如何預覽不同主題而不混亂**：每張模組卡用「中性卡 + 一個該模組的 accent 色點 / 線稿 motif」預覽，不把整張卡塗成模組色 → 首頁保持安靜，色彩只當索引。

> 視覺策略核心：**Core Shell = 安靜層（hairline + 留白），Module World = 大聲層（粗墨 + 位移陰影 + 滿版 accent）**。共用 DNA + 強度落差，就是「主題園區」可被一眼讀懂的關鍵。

---

## 6. Module 02 readiness「職場暗流雷達」

- **共用**：版面骨架、付款 6 態、Shared Flow Templates、信任 / 隱私語言、字體 / 間距 token。
- **不同**：`accent` 鋼藍 `#2b5e86`、`accent2` 訊號綠 `#1f8a5b`、`rose` 訊號琥珀 `#c0863a`；motif 月相顯影 → 雷達掃描；狀態語言 顯影/溫度/校準 → 掃描/收斂/定位。
- **transition 不是 rupture**：首頁 → 進入 Module 02，使用者感受到的是「換了一塊主題園區」，因為字體、間距、wordmark、付款結構完全一致 —— 畫布 §07 用同一個 checkout 模板換皮直接證明。

---

## 7. Shared template examples（結構共用 / token 換 / 信任固定）

| Template | 結構共用 | Theme tokens 換 | 為信任 / 無障礙固定 |
|---|---|---|---|
| AccessLinkSave | 欄位、consent、隱私語言 | accent / motif / 標題口吻 | PII 提示、不寄電子報 |
| CheckoutStart / PaymentBridge | stepper、訂單摘要、信任聲明 | accent / hook / motif | NT$49 · 一次性 · 藍新字樣 |
| ReturnURLWaiting | 「收到了」+ 三步 + 無 primary CTA | motif 進度 / 狀態語言 | 「以藍新通知為準」 |
| PaidResultDelivery | 封面框 + 開啟 CTA + INSIDE | persona / 讀數 / 金句 / motif | 網頁交付 · 連結有保留期限 |
| LineBind | 說明 + 你會收到 + 綁定 / 略過 | accent / 文案口吻 | 只送連結、可解除 |
| ExpiredAccessLink | error 狀態 + 補發 / 重來 | motif error 態 / rose | 補發 3–7 天 · email |
| SupportState | 政策條列 + 聯絡 + 處理時間 | accent 點綴 | 退款條款、處理時效 |

---

## 8. Design tokens（概念層）

- **Core tokens（不動）**：typography、spacing（4pt）、radius（sharp 2–4）、focus state、layout max width（440）、motion（≤700ms）、base neutral（cream / ink）。
- **Module tokens（換膚）**：module background / surface / accent / accent2 / border + shadow / texture / motif / CTA / status card。

實作：`anyu-tokens-v2.css` 已定義 Core + Module 01；新模組用 `ModuleAccentScope` 或 `AnyuPage tokens={…}` 覆寫 3 個 hex + 換 motif。

---

## 9. 方向比較

| | A · 強模組沉浸 | B · Core Shell 主導 | **C · Hybrid Theme Park（推薦）** |
|---|---|---|---|
| 強 | 沉浸感最強 | 一致性最好、好維護 | 沉浸 + 一致兼得 |
| 弱 | 主站身份稀薄、難維護 | 模組差異太小、平淡 | 需前期把模板抽乾淨（一次性投資） |
| 工程 | 高 | 低 | 中（抽好後新模組很便宜） |
| 一致性風險 | 高 | 低 | 低（信任 / 結構鎖在共用層） |

---

## 10. 最終建議

**採用 Direction C — Hybrid Theme Park。** 它把 ANYU「不是孤立測驗、而是 AI-native 洞察系統」的定位翻成視覺；用 Shared Flow Templates 把付款 / 連結旅程鎖進 Module 01 的 Riso 世界，解決撕裂；新模組只換一層 Theme Pack 即可擴展。

**先做（順序）：**
1. 抽出 Shared Flow Templates（付款 6 態 + 連結保存）。
2. Module 01 全部 owned 頁套上 Riso Theme Pack。
3. 移除 Module 01 內殘留的 generic / elegant 樣式。
4. Core Shell 收斂為中性 editorial（首頁 / 總覽 / 法務）。

---

## 11. Handoff guidance（給 Codex）

- **先更新**：checkout-start → ReturnURL waiting → paid result → `/r/` 返回 → LINE bind / Email save → expired。
- **先抽 / 主題化**：PaymentBridge + ReturnURLWaiting 先抽；AccessLinkSave（Email/LINE）共用；PaidResultDelivery 封面元件；`ModuleAccentScope` + motif 介面定案。
- **保持不動**：不主題化藍新 NewebPay 外部頁；`NT$49 · 一次性 · 藍新`字樣；Email/LINE 只送連結；不假設會員系統；不上重到擋住迭代的設計系統。
- **Design QA 檢查**：每頁都在同一個 Theme Pack 世界；信任資訊位置一致；mobile safe-area / 44px 點擊 / reduced-motion；對比度可讀。
- **上線前審的狀態**：checkout-start（桌機 + 手機）、ReturnURL waiting、paid result、`/r/` 返回、LINE bind、Email save、expired。

---

## 12. Acceptance criteria（done 的定義）

- [ ] 進入 Module 01 後，回到主站前**不會看到任何非 Riso 的 ANYU 頁**。
- [ ] 桌機 / 手機的 checkout-start 都像 Module 01。
- [ ] ReturnURL waiting 像 Module 01，不像 generic SaaS。
- [ ] `/r/` 連結返回像 Module 01。
- [ ] 法務 / 支援 / 首頁維持 Core Shell，不被 Module 01 染色。
- [ ] Module 02 能換主題，而**不動付款 / 連結模板結構**。
- [ ] 所有付款 / 連結狀態維持清楚的信任與可讀對比。
- [ ] 行動優先；safe-area、44px 點擊、reduced-motion 都顧到。

### Constraints（硬性）
不主題化藍新外部頁 · 不上過重設計系統 · 不假設會員 · Email/LINE 只送連結不送報告全文 · 付款 / 連結維持清晰信任 · mobile-first · 維持無障礙對比。
