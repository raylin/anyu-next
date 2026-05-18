# 暗語 ANYU · Design System v1.0

> Module 01 · 曖昧溫度計 baseline
> Mobile-first · zh-Hant 為主，i18n-ready
> 視覺方向：**Fusion** — C 溫柔洞察 + A 月相 / 光暈 + B share card 自信感

---

## 0. 文件用法

這份文件是「暗語 ANYU」第一個 MVP 與未來模組的單一視覺真相來源。

* 工程：可以直接複製出 CSS Custom Properties / Tailwind tokens / Tamagui theme。
* 設計：所有新 UI 都要找得到對應 token；找不到代表這個元件還沒被定義 — 回到這份文件補。
* PM / 行銷：第 18 節 Do / Don't 與第 19 節 Copy tone 是審稿用清單。

版號規則：semver。Color / type / spacing token 改名 = major。新增 token / 元件 = minor。修文字、文檔 = patch。

---

## 1. Design philosophy

**一句話**：把那些你說不清的感覺，翻譯成一點方向。

| 維度 | 配比 |
|---|---|
| 溫柔 · gentle | 45% |
| 高級 · refined | 35% |
| 微神祕 · veiled | 15% |
| 可分享 · social | 5–10% |

### 三條鐵則

1. **比測驗多一層「我被理解了」的感覺**。不下判決、不貼標籤、不分對錯。
2. **比塔羅少一點玄學壓力**。月相是裝飾、不是占卜符號。一頁不超過一個神祕元素。
3. **付費 = 具體下一步**，不是訂閱、不是「升級 Pro」。每一次付費都是「這次」的一次性解鎖。

### 不是什麼

不是 SaaS dashboard｜不是塔羅占卜｜不是 Dcard 戀愛測驗｜不是心理諮商工具｜不是 PUA / 攻略手冊。

---

## 2. Brand positioning

### 命名階層

```
母品牌：    暗語 ANYU
第一模組：  曖昧溫度計 by 暗語 ANYU
共用 hook： 讀懂關係裡那些沒說出口的訊號
```

### Hero 露出規則

* 主視覺給模組（「曖昧溫度計」+ 該模組 hook 文案）。
* 母品牌 `暗語 ANYU` 出現在 **navbar 左上**、**結果頁角落**、**share card footer**、**paid 區塊小字** — 不放大、不搶戲。
* `暗語 ANYU` 永遠是 lockup（不單獨用中文或英文）。
* 字標規格見 §7.1。

### Tagline 庫（不要全部都用，挑情境）

* `讀懂關係裡那些沒說出口的訊號。` — navbar hover / SEO
* `把那些你說不清的感覺，翻譯成一點方向。` — about / footer
* `他是真的忙，還是其實在冷掉？` — 模組 01 hero（只在「曖昧溫度計」用）

---

## 3. Visual principles

1. **一個畫面，一個情緒口音**。一頁只用一個 accent；月相 / 光暈最多出現在一個位置。
2. **襯線負責情緒、無襯線負責結構**。所有「金句、溫度、persona name、CTA」用襯線；所有「按鈕內文、表單、列表」用無襯線。
3. **奶油底，不要白底**。`#fbf7ef` 是預設背景；純白只給 share card 與 modal。
4. **卡片是主角，不是格線**。間距由卡片邊距驅動；不畫表格線。
5. **數字用拉丁斜體做主視覺**，不用粗體無襯線。例：`42°` 永遠是 Cormorant Garamond italic。
6. **訊號用 1–3px 細線**。不用厚進度條，避免 dashboard 感。
7. **暗色模式不是反相**。每個元件都要在 dark token set 重新調校；陰影改為內描線 + 光暈。

---

## 4. Color tokens

### 4.1 命名規則

```
--anyu-{role}-{variant}
role:    bg, surface, card, ink, dim, faint, line, accent, accent2, rose, mist
variant: 預設無；alpha 變體加 -on{N}（N 是不透明度百分比 ×10），例 -on10、-on20
```

### 4.2 Module 01 · 曖昧溫度計（baseline · light）

```css
:root[data-module="ai-temperature"] {
  /* base */
  --anyu-bg:        #f4efe7; /* 整頁背景 · 奶油霧 */
  --anyu-surface:   #fbf7ef; /* navbar / 表單區 / cta 反白 */
  --anyu-card:      #ffffff; /* 卡片底 */
  --anyu-mist:      #ece2cf; /* hint 區 / track / mist 區塊 */

  /* ink */
  --anyu-ink:       #2a2419; /* 主文字 · 深咖 */
  --anyu-dim:       rgba(42,36,25,.62); /* 副文字 */
  --anyu-faint:     rgba(42,36,25,.42); /* hint / 標籤 */
  --anyu-line:      rgba(42,36,25,.09); /* 細分隔線 */

  /* accent · primary 金棕（warm gold） */
  --anyu-accent:    #b69664;
  --anyu-accent-12: rgba(182,150,100,.12);
  --anyu-accent-20: rgba(182,150,100,.20);
  --anyu-accent-45: rgba(182,150,100,.45);

  /* accent2 · 霧紫（misty purple） — A 方向口音 */
  --anyu-accent2:   #9b7eb0;
  --anyu-accent2-15:rgba(155,126,176,.15);

  /* warmth · 柔玫 — 結果共鳴 / 溫度漸層尾 */
  --anyu-rose:      #cd8a78;

  /* state */
  --anyu-success:   #6f8a6a;
  --anyu-warning:   #c9904a;
  --anyu-danger:    #b85a4a; /* 僅用在表單錯誤；不做為主視覺 */
}
```

### 4.3 Module 01 · 曖昧溫度計（dark）

```css
:root[data-module="ai-temperature"][data-theme="dark"] {
  --anyu-bg:        #191614;
  --anyu-surface:   #221f1c;
  --anyu-card:      #2a2622;
  --anyu-mist:      rgba(244,236,224,.05);

  --anyu-ink:       #f4ece0;
  --anyu-dim:       rgba(244,236,224,.62);
  --anyu-faint:     rgba(244,236,224,.42);
  --anyu-line:      rgba(244,236,224,.08);

  --anyu-accent:    #d9c79a; /* 金棕在暗色變亮 */
  --anyu-accent-12: rgba(217,199,154,.12);
  --anyu-accent-20: rgba(217,199,154,.20);
  --anyu-accent-45: rgba(217,199,154,.45);

  --anyu-accent2:   #b39bc7;
  --anyu-rose:      #e0a48a;
}
```

### 4.4 使用配額（每個畫面）

| 角色 | 出現次數 | 用在 |
|---|---|---|
| `--anyu-bg` | 1 | body |
| `--anyu-card` | 2–4 | 卡片 |
| `--anyu-accent` | **每頁 ≤ 3 處** | hero 一句、CTA、一兩個圖徽 |
| `--anyu-accent2` | **每頁 ≤ 1 處** | 月相 / 光暈，做為氣氛點綴 |
| `--anyu-rose` | **每頁 ≤ 1 處** | 溫度漸層尾、結果卡共鳴金句的底色 |

> **關鍵**：accent2 一頁只能出現一次；多用就會掉進「塔羅感」。

---

## 5. Typography tokens

### 5.1 Font families

```css
--anyu-font-serif:  "Noto Serif TC", "Songti TC", serif;
--anyu-font-sans:   "Noto Sans TC", "PingFang TC", "Inter", system-ui, sans-serif;
--anyu-font-latin:  "Cormorant Garamond", "Noto Serif TC", serif;
--anyu-font-mono:   "JetBrains Mono", "SFMono-Regular", Menlo, monospace;
```

### 5.2 何時用哪一個

| family | 用在 | 不用在 |
|---|---|---|
| serif | hero 大標、結果金句、persona name、CTA 主按鈕、溫度單位 | 表單、列表、tooltip、navbar |
| sans | 內文、按鈕內文、表單、navbar、chip | hero、結果金句 |
| latin（italic） | `暗語 ANYU` 字標、數字 `42°`、`NT$49`、`A / B / C` 角標 | 任何中文 |
| mono | 角標、`// 註解`、`LV/100`、`ONE-TIME · NO SUB` | 內文、按鈕 |

> mono 是「人味的數據感」— 不要因此覺得可以拿來當所有的 label，內文還是用 sans。

### 5.3 Type scale（mobile baseline · 360pt 寬）

| token | size / line-height | weight | family | 用途 |
|---|---|---|---|---|
| `--anyu-type-display` | 32 / 1.35 | 500 | serif | hero h1（可選 36 if 1 行） |
| `--anyu-type-h1` | 26 / 1.4 | 500 | serif | 結果頁主標、paid 區主標 |
| `--anyu-type-h2` | 22 / 1.45 | 500 | serif | 次級區塊標題 |
| `--anyu-type-h3` | 18 / 1.5 | 500 | serif | 卡片內標題、persona name 小尺寸 |
| `--anyu-type-quote` | 17 / 1.6 | 400 italic | serif | 結果金句 |
| `--anyu-type-body-lg` | 15 / 1.7 | 400 | sans | 主內文 |
| `--anyu-type-body` | 14 / 1.7 | 400 | sans | 預設內文 |
| `--anyu-type-caption` | 13 / 1.65 | 400 | sans | 卡內副文字 |
| `--anyu-type-label` | 11 / 1 | 500 | mono | 角標、segment 標籤 |
| `--anyu-type-num-xl` | 64 / 1 | 300 italic | latin | 結果頁 `42` |
| `--anyu-type-num-lg` | 38 / 1 | 300 italic | latin | share card `42°` |
| `--anyu-type-num-md` | 26 / 1 | 400 italic | latin | `NT$49` |

### 5.4 Letter-spacing

```css
--anyu-track-tight:  -0.3px; /* serif display */
--anyu-track-normal: 0;
--anyu-track-wide:   0.5px;  /* sans button */
--anyu-track-mono:   1.2px;  /* mono label */
--anyu-track-wordmark: 3px;  /* 「暗語」字標 */
```

### 5.5 Mobile vs desktop scaling

Desktop（≥ 768）display 與 num-xl 可以放大 1.15×；其餘維持。
**不要在 mobile 縮小到 < 13px。** 任何文字 ≥ 13px 是硬性下限（caption 是底線）。

---

## 6. Spacing · radius · shadow tokens

### 6.1 Spacing scale（4pt base）

```css
--anyu-space-1:  4px;
--anyu-space-2:  8px;
--anyu-space-3:  12px;
--anyu-space-4:  16px;
--anyu-space-5:  20px;
--anyu-space-6:  24px;
--anyu-space-8:  32px;
--anyu-space-10: 40px;
--anyu-space-14: 56px;
--anyu-space-18: 72px;
```

* Mobile gutter（左右邊距）：`--anyu-space-6 = 24px`
* Section 垂直間距：`--anyu-space-8 = 32px`
* 卡片之間：`--anyu-space-4 = 16px`
* 卡片內 padding：`--anyu-space-5` 上下 + `--anyu-space-6` 左右

### 6.2 Radius scale

```css
--anyu-radius-sm:   8px;   /* chip、tag */
--anyu-radius-md:   10px;  /* input、按鈕（非 pill）、小卡 */
--anyu-radius-lg:   14px;  /* CTA 按鈕、一般卡 */
--anyu-radius-xl:   18px;  /* 主要卡片 */
--anyu-radius-2xl:  20px;  /* 簽名卡（temperature card） */
--anyu-radius-3xl:  24px;  /* share card */
--anyu-radius-pill: 999px; /* chip、輔助按鈕 */
```

### 6.3 Shadow scale

```css
/* light mode */
--anyu-shadow-xs: 0 1px 2px rgba(42,36,25,.06);
--anyu-shadow-sm: 0 1px 0 rgba(42,36,25,.04), 0 4px 14px rgba(42,36,25,.04);
--anyu-shadow-md: 0 1px 0 rgba(42,36,25,.04), 0 8px 24px rgba(42,36,25,.04);
--anyu-shadow-lg: 0 1px 0 rgba(42,36,25,.04), 0 12px 32px rgba(42,36,25,.06);
--anyu-shadow-xl: 0 24px 60px rgba(42,36,25,.12), 0 1px 0 rgba(42,36,25,.04);

/* focus ring */
--anyu-shadow-focus: 0 0 0 4px var(--anyu-accent-12);

/* dark mode 改為內描線 + 暗光暈 */
[data-theme="dark"] {
  --anyu-shadow-xs: inset 0 0 0 1px var(--anyu-line);
  --anyu-shadow-sm: inset 0 0 0 1px var(--anyu-line);
  --anyu-shadow-md: inset 0 0 0 1px var(--anyu-line);
  --anyu-shadow-lg: inset 0 0 0 1px var(--anyu-line), 0 12px 32px rgba(0,0,0,.4);
  --anyu-shadow-xl: 0 24px 60px rgba(0,0,0,.5);
  --anyu-shadow-focus: 0 0 0 4px var(--anyu-accent-20);
}
```

### 6.4 Glow（限定使用）

只用在 temperature card 右上角與 hero 月相旁。**整個 app 同時可見的 glow ≤ 2 個**。

```css
--anyu-glow-warm:
  radial-gradient(circle, var(--anyu-accent-20) 0%, transparent 65%);
--anyu-glow-mist:
  radial-gradient(circle, rgba(155,126,176,.22) 0%, transparent 60%);
```

---

## 7. Component guidelines

### 7.1 Wordmark · 暗語 ANYU

| 用法 | 規格 |
|---|---|
| Primary lockup | `[月相 8–14px] 暗語 ANYU`，serif 中文 + Cormorant italic 拉丁；letter-spacing 3px |
| 純字（footer） | 不放月相，字級 11–12px |
| App icon | 月相 0.55 phase + 「暗」字置中（單字 monogram） |
| 最小尺寸 | 中文字高 ≥ 9px |

月相 SVG：

```svg
<svg width="14" height="14" viewBox="0 0 14 14">
  <circle cx="7" cy="7" r="5.5" fill="currentColor" opacity=".18"/>
  <path d="M9.5 3.5a5.5 5.5 0 100 7 4 4 0 010-7z" fill="currentColor"/>
</svg>
```

### 7.2 Buttons

#### Primary（深 / 預設 CTA）

```
bg:        var(--anyu-ink)
color:     var(--anyu-surface)
padding:   15px 0 (full-width) / 14px 22px
radius:    var(--anyu-radius-lg) = 14px
font:      serif 500 · 15.5 / 1
letter-spacing: 0.5px
hover:     bg = mix(--anyu-ink, --anyu-accent, 12%)
active:    transform: translateY(1px)
disabled:  opacity 0.4 · cursor not-allowed
loading:   replace text with 3-dot pulse · same bg
```

#### Accent（解鎖 / 強情緒 CTA）

```
bg:        var(--anyu-accent)
color:     var(--anyu-surface) (light) / #191614 (dark)
其餘同 Primary
```

#### Secondary（次要操作）

```
bg:        transparent
color:     var(--anyu-ink)
border:    1px solid var(--anyu-line)
radius:    pill / 14px
hover:     bg = var(--anyu-mist)
```

#### Pill（chip-like 操作，例 「分享」）

```
bg:        transparent
color:     var(--anyu-ink)
border:    1px solid var(--anyu-line)
radius:    var(--anyu-radius-pill)
padding:   12px 18px
font:      sans 12.5 / 1 · weight 400
```

#### 狀態總表

| state | bg | color | shadow |
|---|---|---|---|
| default | per variant | per variant | 無 / xs |
| hover | +6% accent overlay | unchanged | xs |
| pressed | translateY(1) + 8% overlay | unchanged | inset xs |
| focused | unchanged | unchanged | focus ring |
| disabled | opacity 0.4 | unchanged | 無 |
| loading | 3-dot pulse 取代文字 | 0.6 alpha | unchanged |

### 7.3 Cards

| 等級 | 用途 | bg | radius | shadow |
|---|---|---|---|---|
| Plain | hint / 提示卡 | mist | md | 無 |
| Card | 一般容器 | card | xl | sm |
| Signature | 主要結果卡（temperature） | card | 2xl | lg + 內 glow |
| Share | 截圖用 | 漸層 `#fbf5e9 → #f4e7d3` | 3xl | xl |
| Paid | 付費卡 | card | xl | lg + `1px solid accent-45` |

### 7.4 Chips（情境選擇器）見 §13

### 7.5 Inputs 見 §12

### 7.6 Progress bar（訊號條）

```
container height: 3px (細) · 6px (粗 — 結果頁主溫度條)
bg:               var(--anyu-mist)
fill:             var(--anyu-accent) · 或溫度漸層 (rose → accent)
radius:           2px (細) · 3px (粗)
animation:        width 600ms cubic-bezier(.2,.7,.3,1) on mount
```

### 7.7 月相 icon（裝飾）

* 整個 app 每頁最多 1 個。
* phase 對應溫度：`0` = cold, `0.5` = warm, `1` = hot。
* 顏色：永遠用 accent，不用 ink。
* 一律有 `aria-hidden="true"`。

### 7.8 Glyph 系統（多模組用）

每個模組對應一個圖徽，**18×18 線稿**，stroke-width 1.2–1.4，stroke = 該模組 accent。詳見 §17。

---

## 8. Landing page layout

### 8.1 結構（mobile 360pt 寬 baseline）

```
┌─────────────────────────────────┐
│ 14px              status bar    │  ─ phone status
├─────────────────────────────────┤
│ 24px gutter ←→ 24px gutter      │
│                                 │
│ navbar · 暗語 ANYU · 月相 28px   │  ─ space-6 (24)
│                                 │
│ space-8 (32)                    │
│                                 │
│ label  module · 01 · 曖昧溫度計  │  ─ mono 11
│ space-4                         │
│ H1  他是真的忙，                  │  ─ display 32
│     還是其實在【冷】掉？           │     accent 在「冷」
│ space-4                         │
│ p   貼上對話或描述情境⋯           │  ─ body 14
│                                 │
│ space-6                         │
│                                 │
│ ┌─ Input card ─────────────────┐│
│ │ // 貼一段對話 · 或用自己的話    ││  ─ mono hint
│ │   描述                       ││
│ │                              ││
│ │ (textarea, min-h 96)        ││
│ │ ──── dashed ─────────────    ││
│ │ 請不要貼姓名 / 電話 / 地址⋯    ││  ─ §14
│ └─────────────────────────────┘│
│                                 │
│ space-5                         │
│                                 │
│ label  情境 · 可選                │
│ space-3                         │
│ [已讀不回] [忽冷忽熱] [看限動]    │  ─ §13
│ [不確定]                         │
│                                 │
│ (push-bottom)                   │
│                                 │
│ ┌─ Primary CTA ────────────────┐│
│ │  分析我的曖昧溫度              ││
│ └─────────────────────────────┘│
│ 免費 · 約 8 秒 · 結果可截圖分享    │  ─ caption · text-center
│                                 │
└─────────────────────────────────┘
```

### 8.2 距離規格

| 元件之間 | space |
|---|---|
| navbar → label | 32 |
| label → H1 | 16 |
| H1 → p | 14 |
| p → Input card | 24 |
| Input card → label「情境」| 20 |
| label「情境」→ chips | 12 |
| chips → CTA（auto push） | min 24 |
| CTA → 隱私說明 | 10 |

### 8.3 可變狀態

* Input 空：placeholder italic 0.5 alpha
* Input 填滿：accent-45 border + accent-12 focus ring
* CTA 在 input < 30 字 / 沒選 chip 時：`opacity .4 · cursor not-allowed`，文案改 `先貼一段對話`
* 已選 chip：見 §13.4

### 8.4 Desktop（≥ 768pt）

container max-width 480pt，左右居中；上方加 64pt 留白。**不變成兩欄式**。

---

## 9. Result page layout

### 9.1 結構

```
┌─────────────────────────────────┐
│ ← 重新分析           暗語 ANYU    │
│                                 │
│ ┌─ Signature: Temperature ─────┐│
│ │ 當前溫度        [Moon 50px]  ││
│ │                              ││
│ │ 42 /100        ← latin xl    ││
│ │ 溫差期 · 他在但他飄             ││
│ │                              ││
│ │ ▰▰▰▰▱▱▱▱▱▱  (rose→accent)   ││
│ │ COLD    WARM    HOT          ││
│ └─────────────────────────────┘│
│                                 │
│ space-3                         │
│                                 │
│ ┌─ One-sentence read ──────────┐│
│ │ “你不是想太多 ──               ││
│ │  是訊號太小聲。」              ││  ─ serif italic 17
│ └─────────────────────────────┘│
│                                 │
│ space-3                         │
│                                 │
│ label  他這邊的訊號  ·  3 個維度  │
│   主動度        28              │
│   ▰▰▱▱▱▱▱▱▱▱   多半你先開話題   │
│   即時性        45              │
│   ▰▰▰▰▱▱▱▱▱▱   平均回訊 38 分   │
│   情緒投入       35              │
│   ▰▰▰▱▱▱▱▱▱▱   短句多、提問少   │
│                                 │
│ space-3                         │
│                                 │
│ ┌─ Insight ────────────────────┐│
│ │ // 讓你卡住的                  ││
│ │ 不是他沒回 — 是他【明明有在    ││
│ │ 活動】，卻暫時沒有接你的邀約。  ││
│ │                              ││
│ │ 「現在最不該做的，是把壓力     ││
│ │  全部丟到自己身上。」          ││  ─ italic 12.5 + dim
│ └─────────────────────────────┘│
│                                 │
│ space-4                         │
│                                 │
│ [ 分享 ↗ ] [ 下一句怎麼回 · NT$49 ]│
└─────────────────────────────────┘
```

### 9.2 區塊次序（不可調換）

1. Temperature signature
2. One-sentence read
3. Signals (3 維度)
4. Insight layer（含 italic 安撫句）
5. 雙按鈕：分享 / 解鎖

### 9.3 溫度漸層條

```
linear-gradient(90deg, var(--anyu-rose), var(--anyu-accent))
fill width = score / 100 (%)
animate from 0 → score over 700ms ease-out on mount
```

### 9.4 Signals 規格

```
- label · 13 sans · color = ink
- value · 11 mono · color = accent
- bar · height 3px · bg = mist · fill = accent
- hint · 11 sans italic · color = faint
- 一頁固定 3 條，欄位不可少
```

### 9.5 Insight layer

* 必有：第一句陳述（「讓你卡住的不是 X，是 Y」）
* 必有：第二句 italic 安撫（「現在最不該做的，是 ⋯」）
* **不可有**：「他不喜歡你」「你是備胎」「你有焦慮依附」 — 見 §19。

---

## 10. Share card layout

### 10.1 三種尺寸

| 用途 | 比例 | 像素 |
|---|---|---|
| In-app preview | 4:5 | 容器寬 × 1.25 |
| IG Feed / Threads | 4:5 | 1080 × 1350 |
| IG Story | 9:16 | 1080 × 1920 |
| OG / link preview | 1.91:1 | 1200 × 630 |

> 主視覺基準：**4:5**。9:16 與 1.91:1 是裁切變體；persona / quote 位置會位移，但元素清單不變。

### 10.2 4:5 規格（1080×1350）

```
邊距：上下 80 · 左右 80
背景：linear-gradient(160deg, #fbf5e9 0%, #f4e7d3 100%)
背景裝飾：
  - 右上 radial blob (accent2 @ 0.45 alpha · ⌀ 600 · blur 12)
  - 左下 radial blob (rose @ 0.33 alpha · ⌀ 660 · blur 8)
```

#### 元素位置（從上往下）

| 位置 | 內容 | 規格 |
|---|---|---|
| 頂列 (y=80) | 左：`暗語 ANYU` wordmark + 月相｜右：月相裝飾（accent 色，phase 對應溫度） | wordmark 32px / 月相 92px |
| persona block (y≈260) | `// MY PERSONA` mono accent 30px + serif persona name 110px / 1.15 | name 兩行 |
| 分隔線 (y≈700) | 寬 88、高 3、bg = accent | |
| quote (y≈730) | serif italic 50px / 1.6 | 兩行 |
| footer (y=1190) | 左：`TEMPERATURE` mono faint 28px + `42°` latin italic 92px｜右：`測一次 ↗` mono + `anyu.app` serif | y 從底部對齊 |

### 10.3 必含元素（不可缺）

1. `暗語 ANYU` wordmark（左上 / 右下擇一，預設左上）
2. Persona name（最多 6 字、兩行）
3. 一句金句（≤ 24 字、可兩行）
4. 溫度數字（latin italic）
5. `anyu.app` footer link

### 10.4 不可出現

* 任何原始對話內容
* 任何人名、暱稱、ID、@handle
* QR code
* 訂閱 CTA、價錢、折扣
* 「他喜歡你 / 他不喜歡你」這種斷言
* 紅 / 黃警告色

### 10.5 動態變體規則

不同 persona / 溫度 → 換月相 phase + 換 quote + 換 persona name。
**背景漸層永遠一致**；不要為每個 persona 換色。

### 10.6 9:16 Story 變體

* persona block 上移到 y=600
* quote 放中央 y=1100
* 月相裝飾改為置中 y=300 ⌀ 200
* footer 同 4:5

### 10.7 OG 1.91:1 變體

左右兩欄：左 persona + quote（佔 60%）、右 月相 + 溫度（佔 40%）。

---

## 11. Paid CTA design

### 11.1 哲學

* **不是訂閱**。`ONE-TIME · NO SUB` 永遠出現在 paid card 上方。
* **小額解鎖**。NT$49 是「再加一杯飲料的價錢」。
* **具體下一步**。CTA 文案是「解鎖下一句怎麼回」，不是「升級」。

### 11.2 出現位置與時機

```
1. 結果頁底部雙按鈕：右側 [ 下一句怎麼回 · NT$49 ]（次按鈕）
2. 結果頁滑到底自然進入「Paid preview」全頁
3. share card 頁面右上小提示，但 share 流程內不打斷
```

**不要做的**：interstitial modal、彈窗、5 秒延遲後出現的覆蓋層、訂閱牆。

### 11.3 Paid preview 區塊結構

```
┌─────────────────────────────────┐
│ label  下一句怎麼回 · 完整策略    │
│ space-3                         │
│ H1  三種【不失控】的             │
│     回法 · 你選一種。            │
│ space-3                         │
│ p   幫你保留主動權，也不把自己放低。│
│     每一種都附【為什麼這樣回】     │
│     的小段分析。                 │
│                                 │
│ space-5                         │
│                                 │
│ ┌ Card A (預覽 · 完整) ─────────┐│
│ │ ⓐ  保留主動權                ││
│ │ 「最近你好像在忙；我這週四五   ││
│ │  有空，你想再聊聊嗎？」        ││
│ │ ── dashed ──                ││
│ │ 為什麼這樣回 · 把球給回去，    ││
│ │ 但不催。                      ││
│ └─────────────────────────────┘│
│ ┌ Card B (模糊 · 鎖) ──────────┐│
│ │ ⓑ  低壓試探                  ││
│ │ ░░░░░░░░░░░░░░░░░░          ││  ─ blur(4.5px)
│ │ ░░░░░░░░░░ 🔒                ││
│ └─────────────────────────────┘│
│ ┌ Card C (模糊 · 鎖) ──────────┐│
│ └─────────────────────────────┘│
│                                 │
│ ┌─ Paywall ────────────────────┐│
│ │ ONE-TIME · NO SUB             ││
│ │ 解鎖一次完整回覆策略   NT$49  ││
│ │ ┌──────────────────────────┐ ││
│ │ │  解鎖下一句怎麼回         │ ││  ─ ink primary
│ │ └──────────────────────────┘ ││
│ │ 目前內測 · 點下後留 Email，   ││
│ │ 這次不會真的收費。            ││
│ └─────────────────────────────┘│
└─────────────────────────────────┘
```

### 11.4 三張預覽卡規則

| 卡 | 狀態 | 為什麼 |
|---|---|---|
| A | 完整可讀 + 附「為什麼這樣回」 | 證明品質、降低疑慮 |
| B | 第一行可見、其後 blur(4.5px) + 鎖 icon | 暗示更多 |
| C | 全模糊 + 鎖 | 強化稀缺 |

### 11.5 NT$49 呈現

```
font: var(--anyu-font-latin) italic
size: 28px / 1
color: var(--anyu-accent)
位置: paywall card 右上對齊 ONE-TIME 標籤
```

**不要寫**：`$49 USD`、`49元`、`只要 49`、`原價 99 限時 49`。
單一寫法：`NT$49`。

### 11.6 CTA Button states

| state | bg | color | label |
|---|---|---|---|
| default | ink | surface | 解鎖下一句怎麼回 |
| hover | ink + 8% accent | surface | 同上 |
| pressed | ink + 12% accent · translateY(1) | surface | 同上 |
| loading | ink | surface @ 0.6 | 三點動畫 |
| post-click (內測) | ink | surface | 開啟 contact capture sheet（§11.7） |

### 11.7 Contact capture（內測階段必經流程）

點下 CTA 後不跳轉，而是從底部升起一個 bottom sheet（或 push 全頁 §F7）：

```
┌─ Bottom sheet (h ~ 60vh) ──────┐
│ ╳                  暗語 ANYU   │
│                                │
│              [Moon 48]         │
│                                │
│ label  目前內測中               │
│ H2     這次不會真的收費。        │
│ p      留下 LINE 或 Email，     │
│        我們會在 24 小時內人工    │
│        送你一次完整分析。        │
│                                │
│ [ Email field · focused ]      │
│ [ LINE ID field · optional ]   │
│ ☑ 我同意把這段對話用於改善     │
│   分析準確度（去識別化處理）    │
│                                │
│ [ 送出 · 等我們的完整分析 ]      │  ─ accent CTA
│ 不寄電子報 · 不分享第三方 ·     │
│ 隨時可刪除                      │
└────────────────────────────────┘
```

提交後跳到一張「靜止狀態」確認頁 — 不要再有任何 CTA。

### 11.8 「不要做得像 subscription」清單

| 不要 | 為什麼 |
|---|---|
| 「7 天免費試用」 | 訂閱話術 |
| 「升級至 Pro」 | 我們沒有 Pro |
| 「每月 NT$49」 | 一次性 |
| 「自動續訂」 | 一次性 |
| 「會員 / 帳號 / 登入」 | 內測階段不要求註冊 |
| 出現 NT$49 旁邊的「/ month」「/ 月」 | 同上 |
| 出現「方案比較表」 | 沒有方案 |

每一個 paid 區塊**強制有**：`ONE-TIME · NO SUB` mono 標籤。

---

## 12. Form / input design

### 12.1 Textarea（landing 主輸入）

```
container: var(--anyu-card) · radius xl · border 1px var(--anyu-line)
padding: 18px
min-height: 96px
font: sans 13.5 / 1.7 · color ink
placeholder: same font · italic · color faint · opacity 0.5
```

#### 狀態

| state | border | shadow |
|---|---|---|
| default | line | sm |
| focus | accent-45 | focus ring (accent-12) |
| filled | accent-45 | sm |
| error | danger | 0 0 0 4px rgba(184,90,74,.15) |
| disabled | line | none · opacity 0.5 |

### 12.2 文字 input（email / LINE ID）

```
container: card · radius md · border 1.5px line
padding: 13px 14px
label: mono 11 · color faint · uppercase optional · spacing 0.5
font: sans 13.5 · color ink
```

* 永遠有 label 在上方（不是 placeholder-as-label）。
* `aria-describedby` 連到下方的 hint。

### 12.3 Checkbox

```
size: 16×16
radius: 4
unchecked: border 1.5px accent · bg transparent
checked: bg accent · 白色勾 (stroke-width 1.8)
label: sans 12 · color dim · line-height 1.6
hit area: padding extended to 14px each side
```

### 12.4 錯誤訊息

```
font: sans 11.5 · color danger · italic
位置: 緊貼 input 下方，space-1 (4px) 間距
帶 icon: 12×12 圓圈內驚嘆號
```

---

## 13. Situation chips

### 13.1 設計

```
chip:
  display: inline-flex
  padding: 8px 14px
  radius: pill
  border: 1px solid var(--anyu-line)
  bg: transparent
  font: sans 13 / 1 · weight 500
  color: ink @ 0.7
  gap (multiple): 6px row + column

active:
  border: 1px solid var(--anyu-accent)
  bg: var(--anyu-accent-12)
  color: var(--anyu-accent)
```

### 13.2 行為

* 單選（曖昧溫度計）— 點 A 取消 A，點 B 自動取消 A。
* 可以不選（「不確定 / 跳過」是其中一個選項）。
* 已選時 CTA label 不變，但 telemetry 帶 situation 給 API。

### 13.3 文案

固定四個（暫定）：
1. 已讀不回
2. 忽冷忽熱
3. 回訊變慢但看限動
4. 不確定 / 跳過

**不要**改成 emoji + label（例「📱 已讀不回」），破壞溫柔感。

### 13.4 不同模組的 chip 集合

每個模組自有 4–6 個 chip。chip 集是 prompt context 的一部分，不要在前端硬編；後端給的 chip 集前端依序 render。

---

## 14. Privacy helper treatment

### 14.1 三層出現位置

1. **Input card 內**：dashed border 上方，sans 10.5 / faint。
2. **CTA 下方**：sans 10.5 / faint / text-center。
3. **隱私政策入口**：navbar 漢堡選單裡（不是 footer，mobile 沒 footer）。

### 14.2 必含文案

* 「請不要貼姓名 / 電話 / 地址」
* 「對話會在分析後 24 小時內刪除」
* 「不寄電子報 · 不分享第三方」（內測 capture 用）

### 14.3 處理規則

* AI 端在解析前對 input 做 PII redaction：人名（用「他」「她」「對方」取代）、電話、地址、Email、LINE ID。
* 前端在送出前提示 PII 警告：偵測到人名時 inline 顯示「我幫你把名字改成『他』，看起來更安全 ↗」一鍵替換。
* Server log 不留原文，只留 hashed prompt id。

### 14.4 視覺上不要做的

* 不放鎖頭 / 盾牌 icon（會讓人想到網銀 / 太正式）
* 不把隱私文字放紅色
* 不寫「保密」「絕對安全」這種絕對化用詞

---

## 15. Mobile-first rules

### 15.1 Viewport

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

### 15.2 容器尺寸

| breakpoint | container |
|---|---|
| < 480 | 100vw - 0 (gutter inside) |
| 480–767 | 100vw - 48px |
| 768+ | 480px centered, top padding 64 |

### 15.3 字級 / 點擊

* 最小字 13px（caption）。
* 主要點擊區 ≥ 44×44pt（chip / button / icon button）。
* 行高最小 1.45（中文段落 1.7 預設）。

### 15.4 安全區

* `padding-top: env(safe-area-inset-top)`
* `padding-bottom: env(safe-area-inset-bottom)` 在固定底部 CTA 容器。

### 15.5 Touch states

* 所有可點元素加 `:active` 視覺反饋（translateY(1) 或 opacity 0.85）。
* 禁用 hover-only 樣式 — 桌面版必須有 click 同樣反饋。

### 15.6 Scroll

* Result page 是 single scroll，**不要切 tabs**。
* Share card preview 不能讓使用者橫向 scroll；只能直接 fit。

### 15.7 鍵盤遮擋

* Textarea 聚焦時，scroll into view 帶 100px 上方留白（看到 label）。
* 底部 CTA 偵測到鍵盤升起時 sticky 失效（直接放回 normal flow）。

---

## 16. Accessibility notes

### 16.1 顏色對比

| 文字 | 背景 | ratio | WCAG |
|---|---|---|---|
| ink (#2a2419) | bg (#f4efe7) | 11.8 | AAA |
| dim (.62) | bg | 5.4 | AA |
| faint (.42) | bg | 3.0 | 只能用在 ≥ 18px 或 13px bold |
| accent (#b69664) | surface | 3.1 | 只能用在 ≥ 18px |

**規則**：accent 不能用在 ≤ 14px 的內文；只能用在標題、數字、按鈕反白文字。

### 16.2 鍵盤導覽

* Tab 順序：navbar → input → chips → CTA → 隱私文字（不需 focus）→ 結果卡。
* Focus ring：`focus-visible:outline-none + box-shadow: var(--anyu-shadow-focus)`，**不要拿掉**。

### 16.3 ARIA

| 元件 | 規則 |
|---|---|
| 月相、glow、背景 blob | `aria-hidden="true"` |
| Persona name | `role="heading" aria-level="1"`（share card 內） |
| Temperature score | `aria-label="當前溫度 42 滿分 100"` |
| Chip | `role="button" aria-pressed={active}` |
| Paid lock icon | `aria-label="尚未解鎖"` |

### 16.4 動畫

* 所有動畫 ≤ 700ms。
* `prefers-reduced-motion: reduce` 時：移除溫度條 animate、glow 脈動；保留必要的狀態切換。

### 16.5 語言

* `<html lang="zh-Hant">`
* 標題、按鈕避免用全形標點縮短；保持完整句。

---

## 17. Multi-module / portal extension rules

### 17.1 哪些是「全模組共享」（不可換）

| 元素 | 原因 |
|---|---|
| 字體系統 | 品牌一致 |
| Spacing / radius / shadow tokens | 結構一致 |
| Wordmark `暗語 ANYU` lockup | 母品牌 |
| Share card 元素清單與位置 | Threads 上一眼可認 |
| `ONE-TIME · NO SUB` 標籤 | 商業模式一致 |
| 隱私 helper 文案 | 信任一致 |
| 月相裝飾的 phase 對應規則 | 視覺語法 |

### 17.2 哪些是「每模組可換」

| 元素 | 規則 |
|---|---|
| `--anyu-accent` | 每模組換 |
| `--anyu-accent2` | 每模組換（限定氣氛點綴） |
| 模組 glyph（18px 線稿） | 每模組設計一個 |
| 模組 hook 文案（h1） | 每模組寫 |
| Chip 集合（4–6 個） | 每模組定 |
| Persona 命名集合 | 每模組定 5–8 個 |

### 17.3 模組 accent 表（v1 規劃）

```css
[data-module="ai-temperature"] {  /* 曖昧溫度計 */
  --anyu-accent:  #b69664;  /* warm gold */
  --anyu-accent2: #9b7eb0;  /* misty purple */
}
[data-module="red-flag-radar"] {  /* 關係紅旗雷達 */
  --anyu-accent:  #c97c66;  /* muted rose */
  --anyu-accent2: #e0865a;  /* ember */
}
[data-module="values-radar"] {  /* 伴侶價值觀雷達 */
  --anyu-accent:  #7d8c7d;  /* sage gray */
  --anyu-accent2: #b88469;  /* warm clay */
}
[data-module="pre-marriage-trust"] {  /* 婚前信任檢查 */
  --anyu-accent:  #4a5a6d;  /* deep blue gray */
  --anyu-accent2: #c9a878;  /* soft gold */
}
[data-module="social-signal"] {  /* 社群微訊號分析 */
  --anyu-accent:  #6c5d8c;  /* blue purple */
  --anyu-accent2: #b8b8c0;  /* signal silver */
}
```

> Pair 規則：accent 是「主要操作色」，accent2 是「氣氛裝飾色」。**accent2 一頁 ≤ 1 處**。

### 17.4 Portal 首頁

* 模組列表 row 元件：左 38×38 icon-tile（`accent-18` bg + 18px glyph）+ 中間 serif name + mono status + 右側 `→`。
* 列表分兩段：`LIVE / 本週上線` 與 `排程中 · COMING SOON`（後者 opacity 0.65）。
* 不要做 grid card；list 比較像「目錄」。

### 17.5 新模組上線 checklist

每個新模組上線前必須過：

- [ ] accent + accent2 已定義
- [ ] glyph 18×18 已畫
- [ ] hook 文案（h1）寫好
- [ ] 4–6 個 chip
- [ ] 5–8 個 persona name
- [ ] 一句結果金句模板
- [ ] paid CTA 三張預覽卡（A 完整 + B C 模糊）
- [ ] share card 設定預覽過 4:5 / 9:16 / 1.91:1 三尺寸
- [ ] 過 §18 Do/Don't 與 §19 forbidden phrases lint
- [ ] 已加進 portal 列表

---

## 18. Do / Don't

### Do ✓

1. **襯線開頭、無襯線收尾**。Hero、金句、persona、CTA 主按鈕用 serif；其他用 sans。
2. **一頁一個 accent**。其他口音控制在 1 處之內。
3. **月相只放 hero / temperature card / share card**。不放結果內文。
4. **數字用 latin italic**。`42` `NT$49` 永遠如此。
5. **付費 CTA 永遠帶「ONE-TIME · NO SUB」**。
6. **Share card 必含 5 件事**：wordmark + persona + 金句 + 溫度 + anyu.app。
7. **內測階段所有付費按鈕 = 收 Email**，不真的扣款。
8. **隱私文案三層出現**：input 內、CTA 下、選單裡。
9. **動畫 ≤ 700ms**，溫度條從 0 跑到分數。
10. **每個新模組過 checklist（§17.5）**才上線。

### Don't ✗

1. **不放紅色警報**。沒有「危險！」「立刻分手」這種訊息。
2. **不用塔羅 / 水晶球 / 星座插畫**。月相是抽象幾何，不是占卜符號。
3. **不寫絕對判斷**：「他不喜歡你」「你是備胎」「你心理有問題」 — 見 §19。
4. **不寫訂閱話術**：見 §11.8。
5. **不用 emoji 當主視覺**。允許在 chip 與分享 CTA 出現 ≤ 1 個（如 ↗），不灑全文。
6. **不用 SaaS dashboard 元件**：折線圖、KPI 卡、儀表板、tabs。
7. **不把 logo 放大**。Hero 留給模組 hook，不留給母品牌。
8. **不要求註冊才能看結果**。MVP 階段免登入。
9. **不在 share card 上放原文 / 人名 / QR**。
10. **不做 interstitial 廣告式 paywall**。付費自然出現在結果頁底部。

---

## 19. Example copy tone

### 19.1 Voice

* 像「懂心理學的朋友」，不是諮商師、不是命理師、不是攻略大師。
* 語氣短句多、停頓多、不用權威感詞彙。
* 中文標點優先用全形；金句可用半形破折號 `——`。

### 19.2 範例：結果金句

✓ 你不是想太多，只是你太會看見細節。
✓ 有些曖昧不是沒訊號，是訊號太小聲。
✓ 你看見的不是答案，而是節奏的變化。
✓ 讓你卡住的不是他沒回訊息，而是他明明有在活動，卻暫時沒有接你的邀約。
✓ 現在最不該做的不是追問答案，而是把壓力全部丟到自己身上。

### 19.3 範例：付費 CTA 支援文案

✓ `給你 3 種不失控的回法，幫你保留主動權，也不把自己放低。`
✓ `不知道該追問、試探，還是先拉開？解鎖一次完整回覆策略。`
✓ `每一種都附「為什麼這樣回」的小段分析。`

### 19.4 範例：Persona name（5–8 字以內）

* 微訊號觀察家
* 已讀偵探型
* 溫差敏感觀察者
* 低壓試探型
* 曖昧節奏派
* 尊嚴守門員

### 19.5 禁用 / 不能出現的文字

完全 ban list（絕對不可出現在任何 AI 輸出與 UI 文案）：

* 「他不喜歡你」、「他根本沒在意」、「他覺得你 _」
* 「你是備胎 / 工具人」
* 「他就是渣」、「你被綠了」
* 「你有焦慮依附 / 逃避依附 / 心理有問題」
* 「你應該立刻分手」、「你該離開他」
* 「他註定不會回頭」
* 任何給「對方」貼性格標籤的句子
* 任何 PUA 詞彙（「拉開距離他就會回頭」、「冷處理 7 天他必定主動」）
* 任何「保證 / 一定 / 絕對」的斷言
* 任何含「100% 準確」、「AI 神準分析」的話
* 任何鼓勵刪聊天紀錄、查勤、查 IG 追蹤者的建議

### 19.6 寫文案的三段檢查

每個新文案上線前過：

1. **是不是判決？** — 改成觀察與描述
2. **是不是貼標籤？** — 改成具體行為
3. **是不是 PUA 操作？** — 改成尊重與留白

---

## 20. Implementation notes for engineers

### 20.1 技術棧建議

* Next.js 14+ (App Router) — RSC 友善
* Tailwind CSS + 自訂 tokens（見下方）
* Framer Motion（動畫 ≤ 700ms）
* `next/font` 載 Noto Serif TC / Noto Sans TC / Cormorant Garamond / JetBrains Mono — 取代 Google Fonts CDN（CLS 友善）

### 20.2 Tailwind 設定（節錄）

```js
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        anyu: {
          bg: 'var(--anyu-bg)',
          surface: 'var(--anyu-surface)',
          card: 'var(--anyu-card)',
          mist: 'var(--anyu-mist)',
          ink: 'var(--anyu-ink)',
          dim: 'var(--anyu-dim)',
          faint: 'var(--anyu-faint)',
          line: 'var(--anyu-line)',
          accent: 'var(--anyu-accent)',
          accent2: 'var(--anyu-accent2)',
          rose: 'var(--anyu-rose)',
        },
      },
      fontFamily: {
        serif: ['var(--anyu-font-serif)'],
        sans:  ['var(--anyu-font-sans)'],
        latin: ['var(--anyu-font-latin)'],
        mono:  ['var(--anyu-font-mono)'],
      },
      borderRadius: {
        sm:'8px', md:'10px', lg:'14px',
        xl:'18px', '2xl':'20px', '3xl':'24px',
      },
      boxShadow: {
        xs:'var(--anyu-shadow-xs)',
        sm:'var(--anyu-shadow-sm)',
        md:'var(--anyu-shadow-md)',
        lg:'var(--anyu-shadow-lg)',
        xl:'var(--anyu-shadow-xl)',
        focus:'var(--anyu-shadow-focus)',
      },
    },
  },
};
```

### 20.3 主題切換

```tsx
// Theme provider — 預設 light，使用者 / 系統決定 dark
<html lang="zh-Hant" data-module="ai-temperature" data-theme={theme}>
```

* `prefers-color-scheme: dark` 自動切。
* 使用者偏好優先（localStorage `anyu:theme`）。

### 20.4 Share card 渲染

* 用 Satori + `@vercel/og` 或 `html-to-image` 生成 PNG。
* Server-side 渲染 1080×1350 / 1080×1920 / 1200×630 三套。
* 字體必須 inline base64 內嵌（不要外連）。
* Quote / persona 從 API response 拿，不要前端硬編。

### 20.5 內測 paid flow

```
POST /api/unlock-intent
  body: { resultId, email, lineId?, consent }
  → 觸發後台 webhook（Slack / Notion / email）
  → 24h 內人工回覆
  → response: { ok: true, message: "..." }
不真正進金流；不留 Stripe / TapPay token。
```

### 20.6 PII 處理

* 前端：偵測中文人名（常見姓 + 1–2 字、@handle、電話格式）→ inline 提示。
* 後端：在送 LLM 前 redact PII；只發送 redacted 版本 + 一個對話節奏結構。
* 24 小時後刪除原文（用 TTL 索引）。
* `resultId` 不可逆推回 user。

### 20.7 性能預算

| 指標 | 目標 |
|---|---|
| LCP (mobile, slow 3G) | ≤ 2.5s |
| CLS | ≤ 0.05 |
| TBT | ≤ 200ms |
| Bundle (initial) | ≤ 150KB gzipped |
| Font payload | ≤ 80KB（subsetted, woff2） |

### 20.8 Font subsetting

中文字體用 `subset-font` 切：

* 必含：landing / result / share card / paid 文案中出現的全部字
* 留動態空間：persona name 庫 + chip 庫 + insight prompt 常用 4000 字
* Cormorant 只留拉丁 + 數字 + 標點

### 20.9 Telemetry events（最小集）

```
page_view: { module, page }
input_submit: { module, situation, char_count, has_pii_warning }
result_view: { module, score_bucket }
share_open: { module, channel }  // ig-story / link / save
paid_click: { module }
contact_capture_submit: { module }
```

不收原文、不收人名、不收溫度具體數字（只收 bucket：cold / cool / warm / hot）。

### 20.10 Repo 結構建議

```
/app
  /(marketing)/page.tsx     # Portal home
  /m/ai-temperature/        # Module 01
    page.tsx                # Landing
    result/[id]/page.tsx    # Result
    paid/[id]/page.tsx      # Paid preview
    share/[id]/route.ts     # OG image render
/components
  /anyu                     # 跨模組共享 (Button, Card, Chip, Wordmark, Moon)
  /module/ai-temperature    # 模組專屬
/lib
  tokens.css                # 本文件 §4–§6 的 CSS 變數
  pii.ts                    # §20.6 PII redaction
  share-card.tsx            # Satori template
/content
  ai-temperature/
    chips.ts                # §13.4
    personas.ts             # §10.3 / §19.4
    forbidden.ts            # §19.5 lint dict
```

### 20.11 Lint 規則（建議自動化）

* 文案 lint：`/forbidden.ts` 詞庫，PR 時 grep `messages/**` 與 `prompts/**`。
* 字體 lint：禁止 inline `font-family`，必須走 `font-{serif|sans|latin|mono}` token。
* 顏色 lint：禁止 inline hex / rgb，必須走 `text-anyu-*` / `bg-anyu-*` token。

---

## Appendix A · Quick start for new module

複製此檔，按以下順序填：

1. 寫一句 hook（不超過 14 字）
2. 寫一句模組副標（不超過 30 字）
3. 挑 accent + accent2（從 §17.3，或新定義一組）
4. 畫 18×18 glyph
5. 寫 4–6 個 chip
6. 寫 5–8 個 persona
7. 寫 1 個結果金句模板（含「不是 X，是 Y」結構）
8. 寫 1 個安撫句模板（含「最不該做的，是 ⋯」結構）
9. 寫 3 張 paid 預覽（A 完整、B C 預覽鎖）
10. 試 share card 4:5 → 過 §10.3 必含 5 件事
11. 過 §17.5 上線 checklist

完成後再走一遍 §18 Do/Don't 與 §19 forbidden lint。

---

## Appendix B · 版本記錄

* **v1.0** (2026-05) — Module 01 曖昧溫度計 baseline · Fusion 視覺方向定稿
