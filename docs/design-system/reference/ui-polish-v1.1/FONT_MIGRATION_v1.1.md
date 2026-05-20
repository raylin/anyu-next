# 暗語 ANYU · Font Migration · v1.1
> Prompt for the coding agent · 字體系統升級指南
> 把現行的 Cormorant Garamond / Noto Serif TC / JetBrains Mono 三段組合，
> 升級到 **「文學雜誌」(Editorial Modern)** — Instrument Serif × Noto Serif TC × Newsreader × 霞鶩文楷 LXGW WenKai × JetBrains Mono。
>
> 視覺參考：`v1.1/font-explorations.html`（第二欄 B · 文學雜誌）

---

## 0. TL;DR · 為什麼換 + 換什麼

**為什麼換：**
- Cormorant Garamond italic 被婚禮 / boutique / 心靈成長類目用到爛 — 沒辨識度
- 把 ANYU 跟 Notion / Linear / Cal.com 並排會被比下去
- 「暗語」要的是 The Paris Review / Aperture Magazine 的編輯審美，不是 wedding invitation

**換什麼：**
| 用途 | Before | After |
|---|---|---|
| Latin display (大標 / 大數字 / wordmark) | Cormorant Garamond italic | **Instrument Serif** italic |
| Latin body (內文) | Noto Sans TC | **Newsreader** (with optical sizing) |
| Chinese display (標題) | Noto Serif TC | Noto Serif TC ✅ 保留 |
| Chinese quote / italic (引言) | Noto Serif TC italic | **LXGW WenKai 霞鶩文楷** |
| Chinese body (內文長段) | Noto Sans TC | Noto Sans TC ✅ 保留（為 UI 清晰度） |
| Mono (label / data) | JetBrains Mono | JetBrains Mono ✅ 保留 |

**載入成本：** 多一個 LXGW WenKai，總增 ~100kb gzipped；其它字體本來就在用。

---

## 1. 字體載入 · `<head>` 區塊

**移除：** Cormorant Garamond 那一行（如果沒有其他地方需要）
**新增：** Instrument Serif + Newsreader + LXGW WenKai

### 1.1 完整新版 `<link>` 標籤

替換 `index.html`（與所有 entry HTML）的 `<head>`：

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Latin display: Instrument Serif (italic only — 唯一需要的 weight) -->
<!-- Latin body:    Newsreader with variable optical sizing -->
<!-- Chinese:       Noto Serif TC + Noto Sans TC -->
<!-- Mono:          JetBrains Mono -->
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,300;1,6..72,400&family=Noto+Serif+TC:wght@300;400;500;600;700&family=Noto+Sans+TC:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet">

<!-- Chinese italic / quote: 霞鶩文楷 LXGW WenKai (via jsdelivr) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/style.css">
```

> ⚠️ `Cormorant+Garamond` 從 URL 移除。如果舊版有單獨的 `<link>` 行，整行刪除。

### 1.2 性能注意

- `display=swap` 保留 — 確保字體載入時不阻擋 render
- LXGW WenKai 走 jsDelivr，第一次載入會慢一點（CN serif glyph 量大）。**只在 quote / italic 場景使用**，不要當全頁 body
- 預設 fallback chain 已寫在 token 裡，網路差時會優雅退到 system serif

---

## 2. CSS Token 更新 · `anyu-tokens-v1.1.css`

找到 `:root { ... }` 區塊裡 `/* font families */` 那段，整段替換：

### 2.1 Before（現行）

```css
:root {
  --anyu-font-serif: "Noto Serif TC", "Songti TC", serif;
  --anyu-font-sans:  "Noto Sans TC", "PingFang TC", "Inter", system-ui, -apple-system, sans-serif;
  --anyu-font-latin: "Cormorant Garamond", "Noto Serif TC", serif;
  --anyu-font-mono:  "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
}
```

### 2.2 After（v1.1.1 · 文學雜誌）

```css
:root {
  /* ── font families · v1.1.1 editorial ─────────────────────
     Five-axis system:
       serif    · 中文襯線 → 標題 (Noto Serif TC)
       sans     · 中文非襯線 → UI / 內文 (Noto Sans TC)
       latin    · 拉丁 italic display → wordmark / 大數字 / "冷"
       reading  · 拉丁正文 → 長文內容 (Newsreader, opsz variable)
       kai      · 中文楷書 → quote / italic / 私語感
       mono     · 數字 / label (JetBrains Mono)
     ─────────────────────────────────────────────────────── */
  --anyu-font-serif:   "Noto Serif TC", "Songti TC", serif;
  --anyu-font-sans:    "Noto Sans TC", "PingFang TC", "Inter", system-ui, -apple-system, sans-serif;
  --anyu-font-latin:   "Instrument Serif", "Noto Serif TC", serif;
  --anyu-font-reading: "Newsreader", "Noto Serif TC", serif;
  --anyu-font-kai:     "LXGW WenKai", "Kaiti TC", "STKaiti", "Noto Serif TC", serif;
  --anyu-font-mono:    "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
}
```

⚠️ **重點：** `--anyu-font-latin` 被換成 Instrument Serif，**所有用到 `--anyu-font-latin` 的地方（wordmark、大數字、italic 「冷」、強調字）自動升級**，不需要逐處改。

---

## 3. CSS Utility Classes 更新

`anyu-tokens-v1.1.css` 裡有一段 `.t-num-xl / .t-num-lg / .t-num-md / .t-quote ...`。要做兩件事：

### 3.1 加入新 utility class

在 `.t-num-*` 那段下方新增：

```css
/* 新增：reading body — 用於 insight 長文段落、blog 內容 */
.t-reading {
  font: 400 16px/1.75 var(--anyu-font-reading);
  font-variation-settings: "opsz" 16;   /* 14-18px 用 16 */
  color: var(--anyu-ink);
}
.t-reading-lg {
  font: 400 18px/1.7 var(--anyu-font-reading);
  font-variation-settings: "opsz" 18;
  color: var(--anyu-ink);
}

/* 新增：kai italic — 用於 quote / 私語感引言 */
.t-kai {
  font: 400 17px/1.85 var(--anyu-font-kai);
  letter-spacing: 0.5px;
  color: var(--anyu-ink);
}
.t-kai-quote {
  font: 400 17px/1.85 var(--anyu-font-kai);
  font-style: italic;
  letter-spacing: 0.6px;
  color: var(--anyu-ink);
}
```

### 3.2 修改現有 `.t-quote`

```css
/* before */
.t-quote { font: italic 400 var(--anyu-type-quote-size)/var(--anyu-type-quote-lh) var(--anyu-font-serif); color: var(--anyu-ink); }

/* after — 改用 kai (霞鶩文楷) 帶私語感 */
.t-quote {
  font: 400 var(--anyu-type-quote-size)/var(--anyu-type-quote-lh) var(--anyu-font-kai);
  letter-spacing: 0.5px;
  color: var(--anyu-ink);
}
```

> 不再用 italic — 因為 LXGW WenKai 本身就帶手寫感，再 italic 會過度。

---

## 4. 元件層替換 · 哪些檔案要動

### 4.1 全局 search-and-replace

在整個 `src/` 或 components 目錄，搜尋以下 string，並按下面對應替換：

| Search | Replace | 註 |
|---|---|---|
| `"Cormorant Garamond"` | `"Instrument Serif"` | 含引號 |
| `'Cormorant Garamond'` | `'Instrument Serif'` | 單引號版 |
| `Cormorant Garamond` | `Instrument Serif` | 不含引號版 |
| `font-family: var(--anyu-font-latin)` 加 `font-style: italic` | 視情況保留 | Instrument Serif italic 才有 character |

### 4.2 個別檔案 · 對應改動位置

> 以下檔名是建議的對應位置，如專案結構不同請對應到實際位置。

**`components/Header.tsx` (或 `Header.jsx`)**
- 「暗語 ANYU」wordmark → 應該已經用 `var(--anyu-font-latin)`。確認，無需手改。
- 如果有 inline font-family，改為 `var(--anyu-font-latin)`

**`components/TemperatureCard.tsx`**
- 大數字 `42` → 用 `class="t-num-xl"` 或 inline `font-family: var(--anyu-font-latin); font-style: italic`
- 副標「邀約後降溫」→ 改用 `font-family: var(--anyu-font-kai)`（取代 italic serif）

**`components/Quote.tsx` / 任何引言 component**
- 把所有 `<blockquote>` 或 `.quote` 從 Noto Serif TC italic 改用 `class="t-quote"`（已自動切換到 kai）

**`components/Insight.tsx`**
- 長段落從 `class="t-body"`（Noto Sans TC）改成 `class="t-reading"`（Newsreader）
- 標題保持 `class="t-h2"`（Noto Serif TC）— 不換

**`components/PaywallCard.tsx`**
- 主標題用 `var(--anyu-font-serif)`（中文 Noto Serif TC）— 不換
- 「NT$49」latin 數字 → 自動跟著 `--anyu-font-latin` 升級到 Instrument Serif

**`components/Persona.tsx`**
- 內文長段使用 `class="t-reading"`
- 引言 quote 使用 `class="t-kai-quote"`

### 4.3 中英混排場景 — 重點檢查

ANYU 的 UI 大量中英混排（例：「他是真的忙，還是其實在 *冷* 掉？」），這些地方需要：

1. 確認 `<em>` 或斜體強調用的是 `var(--anyu-font-latin)`
2. 確認 italic 的中文字（如「冷」）有 `font-style: italic` 屬性 — Noto Serif TC 沒有真的 italic glyph，但可以 fake slant

**範例 markup：**

```html
<!-- before -->
<h1>他是真的忙，還是其實在<em style="font-family: 'Cormorant Garamond', serif; font-style: italic; color: var(--anyu-accent)">冷</em>掉？</h1>

<!-- after -->
<h1>他是真的忙，還是其實在<em style="font-family: var(--anyu-font-latin); font-style: italic; color: var(--anyu-accent); font-weight: 400">冷</em>掉？</h1>
```

註：因為 Instrument Serif 不支援中文，`冷` 會 fallback 到 Noto Serif TC italic — 這是預期行為，看起來會像「日記體」斜體中文，符合品牌調性。

---

## 5. 別動 · Things NOT to change

下列項目不要動，避免過度修改：

- ❌ **Noto Serif TC** 作標題用 — 保持。不要改成 Source Han Serif 或其他。
- ❌ **Noto Sans TC** 作 UI / 按鈕 label — 保持。換掉會犧牲清晰度。
- ❌ **JetBrains Mono** — 保持。所有 mono label / number prefix / metadata 都靠它。
- ❌ **`--anyu-track-*` 字距 token** — Instrument Serif 的天然字距不同，但 token 系統不需要改；如果某個位置看起來太擠，個案調整 `letter-spacing` 即可。
- ❌ **字級 token (`--anyu-type-*-size`)** — 不變。Newsreader 在 16px 是最佳閱讀區間，剛好對得上。

---

## 6. 視覺驗收 · 三步檢查

### 6.1 對照頁
打開 `v1.1/font-explorations.html` 第二欄 (B · 文學雜誌)，跟你的 staging 對照：

- Wordmark "ANYU" 應該是窄、優雅、義式 italic
- 大數字 "42" 應該是又高又窄的 italic
- 「他是真的忙」標題：中文用 Noto Serif TC（沒變），但裡面斜體「冷」現在更窄、更現代
- 引言 quote 字會有「楷書感」— 起筆收筆有筆意
- 長文內文不再是 Noto Sans TC（無襯線），而是 Newsreader（有襯線、編輯感）

### 6.2 載入順序檢查

```html
<head>
  <!-- 1. preconnect 給 Google Fonts + Gstatic -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <!-- 2. Google Fonts CSS -->
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:..." rel="stylesheet">

  <!-- 3. jsDelivr (LXGW WenKai) -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/style.css">

  <!-- 4. Project tokens -->
  <link rel="stylesheet" href="/anyu-tokens-v1.1.css">

  <!-- 5. Project styles -->
  <link rel="stylesheet" href="/styles.css">
</head>
```

### 6.3 FOUT 處理

Newsreader / Instrument Serif 載入時，default `serif` fallback 字寬不一樣，可能會跳動。處理方式：

```css
/* 在 body 或 main wrapper */
body {
  font-family: var(--anyu-font-sans);
  /* 用 size-adjust 讓 fallback 與目標字體 visual size 對齊 */
}

/* 如果跳動明顯，加 font-display: optional */
/* （Google Fonts 改 display=optional 即可） */
```

---

## 7. 漸進部署選項 · 不想一次全換

如果想分階段：

**Phase 1**（最低風險） — 只換 latin display：
- 更新 `--anyu-font-latin` token 為 Instrument Serif
- 載入 Instrument Serif font
- 所有「ANYU」wordmark、italic「冷」等強調字自動升級
- 視覺立刻有 70% 升級感

**Phase 2** — 加入 Newsreader 內文：
- 新增 `--anyu-font-reading` token
- 把 insight / 長文段落 class 從 `t-body` 改 `t-reading`

**Phase 3** — 加入 LXGW WenKai 引言：
- 新增 `--anyu-font-kai` token
- 把 `.t-quote` 改用 kai font

每階段都能獨立 ship，每階段都有可見的視覺提升。

---

## 8. 變數 / Token 完整清單 · 給 coding agent 對照

最終狀態（v1.1.1）的 font tokens：

```css
--anyu-font-serif:   "Noto Serif TC", "Songti TC", serif;
--anyu-font-sans:    "Noto Sans TC", "PingFang TC", "Inter", system-ui, -apple-system, sans-serif;
--anyu-font-latin:   "Instrument Serif", "Noto Serif TC", serif;       /* ★ 改 */
--anyu-font-reading: "Newsreader", "Noto Serif TC", serif;             /* ★ 新增 */
--anyu-font-kai:     "LXGW WenKai", "Kaiti TC", "STKaiti", "Noto Serif TC", serif;  /* ★ 新增 */
--anyu-font-mono:    "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
```

Utility classes 對照：

| Class | Font token | 用途 |
|---|---|---|
| `.t-display` | `--anyu-font-serif` | 中文大標 |
| `.t-h1 / .t-h2 / .t-h3` | `--anyu-font-serif` | 中文小標 |
| `.t-body / .t-body-lg` | `--anyu-font-sans` | UI 中文內文 |
| `.t-reading` | `--anyu-font-reading` | 拉丁長文（Newsreader） ★ 新增 |
| `.t-quote` | `--anyu-font-kai` | 引言（霞鶩文楷） ★ 改 |
| `.t-kai / .t-kai-quote` | `--anyu-font-kai` | 任何想要私語感的中文 ★ 新增 |
| `.t-num-xl / -lg / -md` | `--anyu-font-latin` | 大數字 (Instrument Serif italic) |
| `.t-label / .t-caption` | `--anyu-font-mono / --anyu-font-sans` | label / caption |

---

## 9. 完成 checklist

- [ ] `<head>` 移除 Cormorant Garamond，加入 Instrument Serif / Newsreader / LXGW WenKai
- [ ] `anyu-tokens-v1.1.css` 更新 `--anyu-font-latin` 為 Instrument Serif
- [ ] 新增 `--anyu-font-reading` 和 `--anyu-font-kai` token
- [ ] 新增 `.t-reading`, `.t-reading-lg`, `.t-kai`, `.t-kai-quote` utility class
- [ ] 修改 `.t-quote` 改用 kai
- [ ] 全局 search "Cormorant Garamond" 改 "Instrument Serif"
- [ ] 長文段落從 `.t-body` 改 `.t-reading`（insight / persona 卡的長段）
- [ ] 引言從 italic Noto Serif TC 改用 `.t-quote`（自動切到 kai）
- [ ] 視覺對照 `v1.1/font-explorations.html` 第二欄
- [ ] 測試 mobile / desktop / 暗色模式都正常

---

## 10. 變更紀錄

- **2026-05-21** · 初版 · 把 Cormorant Garamond → Instrument Serif；新增 Newsreader 作為內文閱讀字體；新增 LXGW WenKai 作為引言楷書

> 視覺對照：`v1.1/font-explorations.html`
> v1.1 設計系統：`v1.1/DESIGN_SYSTEM_v1.1.md`
> Logo 規範：`v1.1/LOGO_v1.1.md`
> Staging 落差盤點：`v1.1/STAGING_AUDIT_v1.1.md`
