# 暗語 ANYU · Brand Mark · v1.1
> 整合指南 · 給 coding agent 看的單一真相來源
> 配合 `anyu-mark.svg` + `anyu-mark.jsx` + `anyu-mark.css` + `anyu-tokens-v1.1.css`

---

## 0. TL;DR · 30 秒上手

```html
<!-- 1. 載入 tokens + mark CSS -->
<link rel="stylesheet" href="anyu-tokens-v1.1.css">
<link rel="stylesheet" href="anyu-mark.css">

<!-- 2a. 純 HTML / 任何框架 -->
<img src="anyu-mark.svg" width="32" height="32" alt="ANYU"
     style="color: var(--anyu-ink)" />
<!-- 注意：<img> 載入的 SVG 不會繼承 currentColor。要換色，請改 inline 或 fetch + inject。-->

<!-- 2b. 想用 currentColor → inline SVG 或 React component -->
<svg viewBox="0 0 100 100" width="32" height="32" class="anyu-mark"
     style="color: var(--anyu-ink)" role="img" aria-label="ANYU">
  <circle cx="22" cy="56" r="7.5" fill="currentColor" opacity="0.55"/>
  <circle cx="50" cy="50" r="7.5" fill="currentColor" opacity="0.82"/>
  <circle cx="78" cy="44" r="7.5" fill="currentColor"/>
</svg>

<!-- 2c. React -->
<AnyuMark size={32} />
<AnyuMark size={48} animated />     {/* AI loading */}
<AnyuLockup lang="zh" size={28} />
```

---

## 1. The mark · 設計決策（不可變動）

```
viewBox · 100 × 100
─────────────────────
dot Ø     · 15 units   (= 0.075 × box)
spacing   · 56 units 等距
y offset  · +6 / 0 / −6 units   (微上升弧線)
opacity   · 0.55 → 0.82 → 1.0   (從淡到亮)
fill      · currentColor (永遠)
```

**為什麼是 ⋯（而不是某個圖形）**
⋯ 是 unicode 唯一一個「沒說完的話」的符號 — 跨語言、跨年齡、跨文化都讀得懂。把它擁有起來，比畫任何抽象幾何更直接。三個點上升 = 從「尚未說出口」到「終於說出來」的情緒弧。

**不可變動的事**
1. 三個點，永遠等大。
2. 從左到右 opacity 漸亮。
3. 不旋轉、不拉伸、不描邊、不加陰影、不加 glow。
4. clear-space = 四周各 1 個 dot Ø。
5. 最小尺寸 12px；更小一律改用 wordmark "ANYU"。

詳細探索與否決方案見 `logo-04-ellipsis.html`。

---

## 2. 檔案清單

| 檔案 | 內容 | 給誰用 |
|---|---|---|
| `anyu-mark.svg`   | 原始 SVG · currentColor · 100×100 viewBox | 任何能載入 SVG 的環境 |
| `anyu-mark.jsx`   | `<AnyuMark>` / `<AnyuLockup>` / `<AnyuInline>` | React / 內聯 Babel |
| `anyu-mark.css`   | 動畫 + 7 個 system utility class | 任何前端 |
| `anyu-tokens-v1.1.css` | `--anyu-mark-*` 尺寸變數 | 同上 |

依賴：`anyu-mark.css` 用到 `anyu-tokens-v1.1.css` 裡的 colors / spacing / motion tokens。必須先載入 tokens，再載入 mark CSS。

---

## 3. React API

### `<AnyuMark>`
```tsx
<AnyuMark
  size={24}              // px · default 24 · 最小 12
  animated={false}       // true → typing indicator
  title="ANYU"           // SVG <title> · 螢幕閱讀器用
  className=""
  style={{}}
/>
```
- 顏色透過 `style={{ color: '...' }}` 或父層 CSS `color:` 控制
- `animated` 會自動掛 `.anyu-mark--typing`，CSS 處理 3 dot stagger pulse
- 尊重 `prefers-reduced-motion` — 自動降為 static-resolved 排列

### `<AnyuLockup>`
```tsx
<AnyuLockup
  size={32}             // wordmark 字體基準 px
  lang="en"             // "en" | "zh" | "stack"
  className=""
/>
```
- `en` → ⋯ ANYU (主要橫式 · navbar / 名片)
- `zh` → ⋯ │ 暗語 / ANYU (台灣市場 · PR)
- `stack` → 三層垂直 (square spaces · profile pic)

### `<AnyuInline>`
```tsx
<p>她說「沒事」<AnyuInline />然後傳了一個句點。</p>
```
自動 sizing 到周圍字體 cap-height × 0.85；行內可用，但**每段最多一個**。

---

## 4. ⋯ 系統用法 · 7 個角色

mark 不只是 logo — 它是 ANYU 的「字根」。同一個圖形可以在產品內擔任 7 種角色，永遠不再需要新圖示。

### 4.1 Logo 本體 · static
標誌、名片、印章。

```html
<svg viewBox="0 0 100 100" width="40" class="anyu-mark"
     style="color: var(--anyu-ink)"><!-- 三個點 --></svg>
```

### 4.2 Loading · AI 思考中
typing indicator 動畫。配對「AI 正在感覺這句話 ⋯」這類 microcopy。

```html
<div class="anyu-loading">
  <svg viewBox="0 0 100 100" width="48" class="anyu-mark anyu-mark--typing">
    <circle class="anyu-mark__dot anyu-mark__dot--1" cx="22" cy="50" r="7.5" fill="currentColor"/>
    <circle class="anyu-mark__dot anyu-mark__dot--2" cx="50" cy="50" r="7.5" fill="currentColor"/>
    <circle class="anyu-mark__dot anyu-mark__dot--3" cx="78" cy="50" r="7.5" fill="currentColor"/>
  </svg>
</div>
```
變體：`.anyu-loading--light` (cream surface) / `.anyu-loading--inline` (跟文字並排)

### 4.3 Divider · 段落分隔
取代 `<hr>`，用於詩意 / 抒情段落之間。

```html
<div class="anyu-divider">
  <svg viewBox="0 0 100 100" width="20" class="anyu-mark"><!-- ⋯ --></svg>
</div>
```

### 4.4 Unread · 有新訊號
取代藍點 unread indicator。語義：「這裡有還沒讀懂的暗語」。

```html
<span class="anyu-unread">
  <svg viewBox="0 0 100 100" width="20" class="anyu-mark"><!-- ⋯ --></svg>
</span>
<!-- 已讀狀態 -->
<span class="anyu-unread anyu-unread--muted">…</span>
```

### 4.5 Stamp · 認證印章 / paid feature
用在「ANYU 已認證」、付費功能、結果頁的徽章。

```html
<div class="anyu-stamp">
  <div class="anyu-stamp__seal">
    <svg viewBox="0 0 100 100" width="48" class="anyu-mark"><!-- ⋯ --></svg>
  </div>
  <div class="anyu-stamp__strip">
    <span>VERIFIED</span><span>·</span><span>ANYU READ</span>
  </div>
  <div class="anyu-stamp__meta">2026/05/19 · 信心度 92%</div>
</div>
```

### 4.6 Pattern · wallpaper / ad / pack
整面 tile 的底紋。預設深底 + accent；有 cream 變體。

```html
<div class="anyu-pattern-bg" style="padding: 60px">
  <!-- 內容 -->
</div>
<div class="anyu-pattern-bg anyu-pattern-bg--cream">…</div>
```

### 4.7 Tap target · ⋯ button
44×44 hit area。可作為「more」按鈕、選單觸發、或 mark 的可點擊版本。

```html
<button class="anyu-mark-btn" aria-label="more">
  <svg viewBox="0 0 100 100" width="20" class="anyu-mark"><!-- ⋯ --></svg>
</button>
```

---

## 5. 顏色搭配 · 必須跟著 v1.1 strict pairing

| 表面 background | mark `color:` token | 用途 |
|---|---|---|
| `var(--anyu-surface)` (#fbf7ef) | `var(--anyu-ink)` | **預設組合**，95% 場景 |
| `var(--anyu-surface)`            | `var(--anyu-accent)` | 印章 / signature 變體 |
| `var(--anyu-ink-dark)` (#1f1a12) | `var(--anyu-accent)` | 暗夜模式 · 付費頁 |
| `var(--anyu-ink-dark)`            | `var(--anyu-ink-onDark)` | 暗底但需要更安靜時 |
| `var(--anyu-accent)` (#b69664)   | `var(--anyu-ink-dark)` | 廣告 banner / 誇張版位 |
| `#ffffff` (print)                | `#000000` | 名片黑白印刷 fallback |

**絕對禁止** — accent on cream-with-low-contrast、純色 + glow filter、漸層填色、霓虹色。

---

## 6. 行為規範

### 6.1 Tap 動畫
mark 本體**不**有 hover / tap state。只有當包在 `.anyu-mark-btn` 或互動容器裡時，才由那個容器來顯示 state。

### 6.2 Loading 觸發時機
任何超過 600ms 的網路請求 / AI 推理都必須顯示 `.anyu-loading`。少於 600ms 不顯示，避免「閃」。

### 6.3 多個 ⋯ 在同一畫面
- ✅ 一個 logo + 一個 loading + 一個 stamp，無妨。
- ❌ 一個 list 裡同時有 5 個 unread indicator 是 OK 的（不同 row）。
- ❌ 同一卡片內 ≥2 個 ⋯ 並排出現會搶讀，需要 visual hierarchy。

### 6.4 與其他標點的距離
⋯ 不應該與真實的 ellipsis 字元（U+2026 …）出現在同一行。如果文案需要句末 …，先把它改寫掉。

---

## 7. Build-time 資產

當把 ANYU 接到實際產品時要產生這些檔案（同一個 SVG 出來的）：

```
public/
  favicon.svg              ← anyu-mark.svg
  favicon-16.png           ← rasterize 16×16, color = ink #2a2419
  favicon-32.png           ← rasterize 32×32
  favicon-180.png          ← apple-touch-icon · 180×180 · ink-dark bg + accent mark, 22.65% radius
  favicon-192.png          ← Android · same as 180 spec
  favicon-512.png          ← PWA splash · same spec
  og-image.png             ← 1200×630 · uses <AnyuLockup lang="en" /> on ink-dark
manifest.webmanifest:
  {
    "name": "暗語 ANYU",
    "short_name": "ANYU",
    "icons": [
      { "src": "/favicon-192.png", "sizes": "192x192", "type": "image/png" },
      { "src": "/favicon-512.png", "sizes": "512x512", "type": "image/png" }
    ],
    "theme_color": "#1f1a12",
    "background_color": "#fbf7ef"
  }
```

> raster 步驟可用 [`sharp`](https://sharp.pixelplumbing.com/) / [`resvg`](https://github.com/RazrFalcon/resvg) / 任何 SVG → PNG pipeline。**不要**手描；永遠從 `anyu-mark.svg` 出。

---

## 8. 驗證頁

`v1.1/anyu-mark-demo.html` 是把上述所有用法跑一遍的驗證頁。當你做完整合，跟這頁對齊，視覺一致就算過關。

對照表：
- 8.1 mark static · static + scale ladder
- 8.2 mark animated · 跑 typing
- 8.3 lockups · en / zh / stack
- 8.4 §4.1–4.7 七個系統用法

---

## 9. 變更紀錄

- **v1.1.0** (2026-05-20) — 初版。從 logo exploration 04 收斂、加入 system extension（divider / loading / unread / stamp / pattern / button / inline）。
