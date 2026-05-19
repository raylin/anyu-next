# 暗語 ANYU · 曖昧溫度計 — UX Flow v1.1
> Module 01 · Mobile-first · zh-Hant
> 配合 DESIGN_SYSTEM_v1.1.md 一起讀

---

## 0. 一句話

> 使用者貼上一段對話 → AI 把節奏翻譯成「溫度 + 三個訊號 + 一句金句」→ 給人 share / 想付費的兩條路。

---

## 1. 主流程（happy path）

```
[Entry]
   │
   ▼
S1 Landing
   │   讀 hero、看到 input card
   │   action: 貼對話 (paste) 或 自描述
   │
   ▼
S1' Landing (filled)
   │   chip 可選（情境）
   │   CTA enabled
   │
   ▼ tap CTA
S2 Loading (~ 8s)
   │   月相 + 三點 + tip card
   │   API 中：PII redact → LLM → score + signals + insight + persona
   │
   ▼ resolved
S3 Result
   │   ① Temperature card
   │   ② One-sentence read
   │   ③ Observed signals × 3
   │   ④ Insight card
   │   ⑤ 雙 CTA: [分享 ↗] [下一句怎麼回 · NT$49]
   │
   ├── tap [分享 ↗] ─────────┐
   │                         ▼
   │                      S4 Share
   │                         │ preview share card
   │                         │ tap 「IG Story / 儲存 / 複製連結」
   │                         │ Native share sheet (iOS / Android)
   │                         └── 回到 S3 (back)
   │
   └── tap [下一句怎麼回] ────┐
                             ▼
                          S5 Paid preview
                             │ Card A (sample) + B/C (locked)
                             │ Paywall card · NT$49
                             │
                             ▼ tap [解鎖]
                          S6 Contact capture (內測階段)
                             │ Email + LINE + consent
                             │
                             ▼ submit
                          S7 Confirmation
                                "已收到 · 24h 內人工送你完整分析"
                                沒有 CTA · 靜止頁
```

---

## 2. 狀態機（landing CTA）

```
state: input.text  ∈  { empty | <30 chars | ≥30 chars }
state: chip        ∈  { none | one selected }

CTA enabled when:
  input.text.length ≥ 30   (chip is optional)

CTA label:
  empty                → "先貼一段對話"           (disabled · opacity .4)
  < 30 chars           → "再寫一點⋯"             (disabled · opacity .4)
  ≥ 30 chars           → "分析我的曖昧溫度"        (enabled)
  ≥ 30 chars + chip    → "分析我的曖昧溫度 →"     (enabled · 右箭頭微微浮現)
```

`CTA` 永遠是 1 顆。沒有「先註冊」或「進階模式」。

---

## 3. PII 防呆流程（input 過濾）

```
user types ──► debounce 400ms ──► local PII detect (regex)
                                     │
                                     ├─ has match
                                     │     ▼
                                     │  show inline banner above textarea:
                                     │   "我幫你把名字改成『他』，看起來更安全 ↗"
                                     │   [一鍵替換] [先不要]
                                     │
                                     └─ no match → nothing
```

偵測規則：
- 中文姓 (常見 100 姓) + 1–2 字 + 後接 `說／回／傳／打／找／約／問` → 視為人名
- `09\d{8}` / `\d{2,4}-\d{6,8}` → 電話
- `[\w.+-]+@[\w-]+\.[\w.-]+` → email
- `@\w{3,}` → LINE / IG ID
- 「住在 XX 區 / XX 路」→ 地址（用 NER 替代 regex 在 server 側補強）

無論 user 有沒有按一鍵替換，**送 API 前 server 再 redact 一次**（client 不可信）。

---

## 4. API 契約（最小集）

### 4.1 `POST /api/analyze`

```jsonc
// request
{
  "module": "ai-temperature",
  "text": "<redacted on client>",
  "situation": "read_no_reply" | "hot_cold" | "story_no_dm" | "unsure" | null,
  "client_id": "anonymous uuid"
}

// response (8s typical, 12s hard timeout)
{
  "result_id": "r_2g3h...",       // 用來進 share / paid
  "score": 42,                     // 0–100
  "score_bucket": "cool",          // cold | cool | warm | hot
  "persona": "微訊號觀察家",        // serif name (≤ 6 字 · ≤ 2 行)
  "label": "溫差期 · 他在但他飄",   // 溫度副標
  "quote": "你不是想太多 —— 是訊號太小聲。",
  "signals": [
    { "key": "initiative", "label": "主動度", "value": 28, "hint": "多半你先開話題" },
    { "key": "immediacy",  "label": "即時性", "value": 45, "hint": "平均回訊延遲 38 分" },
    { "key": "emotion",    "label": "情緒投入", "value": 35, "hint": "短句多、提問少" }
  ],
  "insight": {
    "lead": "讓你卡住的",
    "body": "不是他沒回訊息 — 是他明明有在活動，卻暫時沒有接你的邀約。",
    "soft": "現在最不該做的，是把壓力全部丟到自己身上。"
  },
  "paid_preview": {
    "cards": [
      { "letter": "A", "tag": "保留主動權", "body": "「最近你好像在忙；我這週四五有空，你想再聊聊嗎？」", "why": "把球給回去，但不催。", "locked": false },
      { "letter": "B", "tag": "低壓試探",   "body": "「看你在跟朋友打球，那就先好好玩——哪天⋯」",        "why": null, "locked": true },
      { "letter": "C", "tag": "尊嚴守門",   "body": "「這幾天忙的話，等你⋯」",                            "why": null, "locked": true }
    ]
  }
}
```

### 4.2 `POST /api/unlock-intent`（內測階段）

```jsonc
{
  "result_id": "r_2g3h...",
  "email": "you@example.com",
  "line_id": "@yourid" | null,
  "consent_analytics": true,
  "client_id": "anonymous uuid"
}
// → 202 Accepted
{ "ok": true, "message": "已收到，我們會在 24h 內聯絡。" }
```

不真進金流。webhook 進 Slack #anyu-beta-unlock。

---

## 5. 邊界情境（edge cases）

| 情境 | 行為 |
|---|---|
| 輸入 < 30 字 | CTA disabled，文案「再寫一點⋯」 |
| 輸入 > 4000 字 | 超過 limit 時 textarea border → danger；CTA 文案「太長了，縮短一點」|
| 偵測 ban list 字眼 | 不允許送出，inline 提示「這段不適合分析；試著用『他』『她』描述」 |
| API timeout (12s) | 載入頁切到「再讀一下⋯」（serif 18 · ink），15s 後改「網路不穩，要不要重試」 + retry 按鈕 |
| 結果頁 reload | 從 `result_id` 重撈（TTL 24h）；過期顯示「分析已經被刪除，重新分析一次？」 |
| 點 [分享] 但 native share 不支援 | fallback 3 顆按鈕：複製連結 / 下載圖片 / 開 IG Story scheme |
| 點 [下一句] 後在 capture sheet 關閉 | 不留 email，回到 S5；下一次再點仍會出 sheet |
| Capture 重複提交（同 email + 同 result） | server 去重，client 顯示「我們已經在處理你這次了 🌙」 |
| 鍵盤升起遮 CTA | 底部 CTA 改 `position: static` 隨內容捲動 |
| 用戶開啟 `prefers-reduced-motion` | 溫度條不 animate；月相不 glow；點不脈動 |
| Dark mode（系統） | 自動切 `data-theme="dark"`；月相 phase 改成「亮的部分朝下」（暗示夜晚） |

---

## 6. 載入時間管理

API 真實時間：4–10s（中位數 6s）。但介面預期 8s。

```
0–2s    "讀著你貼上的對話⋯"  (initial)
2–6s    "比對節奏與回訊時差⋯"  (mid copy switch)
6–10s   "整理一下訊號⋯"  (late copy switch)
10–15s  "再讀一下⋯"  (stress · 提示變慢)
> 15s   "網路有點慢，要不要重試 ↻"  (offer retry)
```

文案切換不換版面、不換顏色、不換月相 — 只換 title 那一行。

---

## 7. 分享流程細節

```
S3 [分享 ↗]
   │
   ▼
S4 Share preview
   │  顯示 share card 4:5
   │  下方 3 顆按鈕：[IG Story] [儲存] [複製連結]
   │
   ├── IG Story → open instagram://story-camera?source_application_id=anyu&backgroundImage=<png-url>
   │            (Android: intent fallback)
   │            (失敗 fallback：下載 + 提示「打開 IG 貼上」)
   │
   ├── 儲存 → 觸發 download <a download="anyu-42°-微訊號觀察家.png">
   │
   └── 複製連結 → navigator.clipboard.writeText(`https://anyu.app/r/${result_id}`)
                + 短暫 toast: "已複製"
```

share card image render：

- 用 Satori / @vercel/og server 端渲染 PNG（1080×1350）
- Cache：CDN cache 24h，key = `result_id + version`
- 字體 inline base64（Noto Serif TC subset + Cormorant + JetBrains Mono subset）
- 不含原文／人名／QR

---

## 8. 付費 funnel（內測）

```
S3 → S5 → S6 → S7
 │     │    │    └── 終點：靜止頁，無 CTA
 │     │    │
 │     │    └── Email + LINE + consent submit
 │     │
 │     └── 看到 A 卡完整 + B/C 模糊 + paywall
 │
 └── 結果頁底部 [下一句怎麼回 · NT$49]
```

埋點：

| 事件 | 何時 | 屬性 |
|---|---|---|
| `result_view` | S3 mount | `score_bucket` |
| `share_open` | S4 mount | (none) |
| `share_action` | tap any of 3 buttons | `channel: ig | save | copy` |
| `paid_click` | tap S3 / S5 paywall CTA | `source: result | preview` |
| `capture_view` | S6 mount | (none) |
| `capture_submit` | S6 submit success | `has_line_id` boolean |

**不收**：原文、人名、score 具體值、persona name、quote。

---

## 9. 失敗 / 回復

| 失敗 | 使用者看到 |
|---|---|
| API 500 | 全頁：月相 + 「我們這邊出了點狀況 🌙\n稍後再試一次？」 + [重試] |
| API 422 (content unsafe) | inline 在 textarea：「這段裡有些字沒辦法分析；換個說法？」 |
| Capture submit 失敗 | 表單下 inline 紅字 + 按鈕仍可重送 |
| share image render 失敗 | preview 區換成靜態 fallback（白卡 + 「分享卡片準備中⋯」）+ retry |
| Cookie / localStorage 失效 | 一切走 URL params；result_id 在 URL 即可重新拉資料 |

---

## 10. 第二次造訪 / 回流

* 不要求註冊。
* 上次 result_id 存 localStorage `anyu:last_result`，24h 內 landing 顯示一個小提示：
  > 「上次測的還在 →」（hint chip · 右上角 · mono 11 · accent）
* 點擊回到 S3 直接渲染。

---

## 11. 多模組未來性（前瞻）

```
Portal (anyu.app)
   ├── 01 曖昧溫度計   LIVE   ← 本流程
   ├── 02 關係紅旗雷達   COMING
   ├── 03 伴侶價值觀雷達 COMING
   └── ...
```

第二個模組上線時：

- Portal 列表 row 加 1 條
- accent 換成該模組顏色（§17.3 of v1.0）
- Share card / paid / contact 結構**完全沿用本文檔**，只換 token + copy

---

## 12. 螢幕清單（給 coding agent）

實作這個 module 需要 7 個畫面：

| ID | 路徑 | 名稱 |
|---|---|---|
| S1 / S1' | `/m/ai-temperature` | Landing (empty / filled) — 同一頁的不同 state |
| S2 | `/m/ai-temperature` (loading overlay) | Loading |
| S3 | `/m/ai-temperature/result/[id]` | Result |
| S4 | `/m/ai-temperature/share/[id]` | Share preview |
| S5 | `/m/ai-temperature/paid/[id]` | Paid preview |
| S6 | `/m/ai-temperature/paid/[id]` (bottom sheet) | Contact capture |
| S7 | `/m/ai-temperature/paid/[id]/sent` | Confirmation |

S6 可以是 bottom sheet 或全頁，技術上推薦 bottom sheet（push state + back 可關）。

---

## 13. 開發優先序（給 PM）

```
Sprint 1 (1 週)
  ✓ tokens v1.1 + utility classes
  ✓ S1 / S1' Landing + chip 行為 + PII inline 提示
  ✓ Mock API（hardcoded result）→ S3 Result
  ✓ S2 Loading（純前端 setTimeout 8s）

Sprint 2 (1 週)
  ✓ 真實 API (analyze) wiring
  ✓ S4 Share preview + 3 顆按鈕（先做複製連結即可）
  ✓ S5 Paid preview

Sprint 3 (1 週)
  ✓ S6 Contact capture
  ✓ S7 Confirmation
  ✓ Share image server-render (PNG)
  ✓ Telemetry events

Sprint 4 (0.5 週)
  ✓ Edge cases · timeouts · error 頁
  ✓ A11y pass · reduced motion · keyboard 焦點
  ✓ Dark theme
```
