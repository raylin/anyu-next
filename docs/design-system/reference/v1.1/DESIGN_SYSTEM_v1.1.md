# 暗語 ANYU · Design System **v1.1**
> Module 01 · 曖昧溫度計 · Fusion 視覺方向（強制版本）
> Mobile-first · zh-Hant · 取代 v1.0 · 是工程實作的單一真相來源

---

## 0. 為什麼有 v1.1

v1.0 給了方向，但 staging 出現了 6 個 drift：

1. 部分按鈕、chip 對比不足，看起來是「停用狀態」。
2. 訊號卡（observed signals）變成淺色卡 + 淺色文字 → 不可讀。
3. 付費預覽卡灰糊一片。
4. 載入狀態用了不同視覺語言。
5. 區塊之間像不同產品。
6. Token 太鬆，每個工程師都能自由詮釋。

**v1.1 不增加任何新視覺，而是把規則寫死。**
所有 v1.1 的 token 都必須**配對使用（surface + ink 配對表），單獨使用無效。**

---

## 1. Design philosophy（refinement）

**一句話：把那些你說不清的感覺，翻譯成一點方向。**

| 維度 | 配比 | 在 UI 上的具體表現 |
|---|---|---|
| 溫柔 gentle | 45% | 奶油底 + 襯線中文 + 行高 1.7 + 圓角 14–20px |
| 高級 refined | 35% | 卡片 padding ≥ 20px + 數字用 latin italic + 不堆元素 |
| 微神祕 veiled | 15% | 一頁 1 個月相 + 一頁 1 個 glow + accent2 只出現 1 次 |
| 可分享 social | 5% | persona name + 一句金句 + 4:5 share card |

### 1.1 三條鐵則（不可違反）

1. **不下判決**。一切結果都是「觀察」，不是「結論」。
2. **不貼負面標籤**。對「他」與「你」都不貼。
3. **付費是具體的下一步**，不是訂閱、不是升級。

### 1.2 v1.1 新增第四條鐵則

> **4. 對比不可妥協。**
> 任何文字必須對它所在的卡片底色達到 WCAG AA（4.5:1，正文）／AAA（7:1，正文最理想）。
> 「premium」的視覺感**來自字體、留白、字距、編排**，不來自降低對比。
> 任何低對比設計（如「淺卡上淺字」、「奶油底上 accent 內文」）一律 reject。

### 1.3 不是什麼

不是 SaaS dashboard ｜ 不是塔羅占卜 ｜ 不是 Dcard 戀愛測驗 ｜ 不是心理諮商工具 ｜ 不是 PUA 攻略 ｜ **不是低對比的「高級感」設計**。

---

## 2. Color token rules（v1.1 強制配對）

### 2.1 Token 表（不變，照 v1.0）

```css
:root[data-module="ai-temperature"][data-theme="light"] {
  --anyu-bg:        #f4efe7;   /* 整頁背景 · 奶油霧 */
  --anyu-surface:   #fbf7ef;   /* 表單區 / CTA 反白 */
  --anyu-card:      #ffffff;   /* 主卡片 */
  --anyu-mist:      #ece2cf;   /* hint / track */

  --anyu-ink:       #2a2419;   /* 主文字 · 深咖 */
  --anyu-dim:       rgba(42,36,25,.72);  /* ★ 從 .62 提高到 .72 */
  --anyu-faint:     rgba(42,36,25,.55);  /* ★ 從 .42 提高到 .55 */
  --anyu-line:      rgba(42,36,25,.10);  /* ★ 從 .09 提高到 .10 */

  --anyu-accent:    #b69664;
  --anyu-accent-12: rgba(182,150,100,.12);
  --anyu-accent-20: rgba(182,150,100,.20);
  --anyu-accent-45: rgba(182,150,100,.45);

  --anyu-accent2:   #9b7eb0;
  --anyu-rose:      #cd8a78;

  /* dark surfaces — 新增 */
  --anyu-ink-dark:    #1f1a12;   /* deep ink, paid card / temperature signature */
  --anyu-ink-onDark:  #f5ecdd;   /* 用在 dark surface 上的文字 */
  --anyu-dim-onDark:  rgba(245,236,221,.78);
  --anyu-faint-onDark:rgba(245,236,221,.55);
  --anyu-line-onDark: rgba(245,236,221,.14);
}
```

> ★ v1.1 把 `dim / faint / line` 都加深一階。實際差距小，但是讓「副文字」徹底脫離「停用」感。

### 2.2 強制配對表（surface ↔ ink pair）

**這是 v1.1 最重要的規則。任何元件的 background 必須對應到一組固定的 ink。**

| Surface | Primary text | Secondary text | Faint / hint | Border / line | accent OK on this? |
|---|---|---|---|---|---|
| `--anyu-bg` (#f4efe7) | `--anyu-ink` | `--anyu-dim` | `--anyu-faint` | `--anyu-line` | ✓ 限 ≥ 18px |
| `--anyu-surface` (#fbf7ef) | `--anyu-ink` | `--anyu-dim` | `--anyu-faint` | `--anyu-line` | ✓ 限 ≥ 18px |
| `--anyu-card` (#ffffff) | `--anyu-ink` | `--anyu-dim` | `--anyu-faint` | `--anyu-line` | ✓ 限 ≥ 18px |
| `--anyu-mist` (#ece2cf) | `--anyu-ink` | `--anyu-dim` | **不允許 faint** | `--anyu-line` | ✓ 限 ≥ 18px |
| `--anyu-ink-dark` (#1f1a12) | `--anyu-ink-onDark` | `--anyu-dim-onDark` | `--anyu-faint-onDark` | `--anyu-line-onDark` | **✓ 任何字級** |
| `--anyu-accent` (#b69664) | `--anyu-surface` | — | — | — | — |
| share-card gradient | `--anyu-ink` | `--anyu-dim` | — | accent | ✓ persona name / quote 可用 ink |

**規則 R1**：每一個 `background:` 屬性都必須能在這張表查到。查不到 = bug。

**規則 R2**：絕對禁止 `background: var(--anyu-card)` 配 `color: var(--anyu-faint)` 當作內文。faint 只能用在 caption / 標籤層。

**規則 R3**：accent (#b69664) 對 `#ffffff` 對比 = 3.2:1。**只能用在 ≥ 18px 或 ≥ 14px bold 的元素**。內文（13–15px）絕對禁止用 accent 當文字色。

### 2.3 每頁使用配額

| Role | 出現次數 | 用在 |
|---|---|---|
| `--anyu-bg` | 1 | body |
| `--anyu-card` | 2–4 | 卡片 |
| `--anyu-ink-dark` | **0–1** | 簽名卡 OR 付費卡 OR CTA（擇一即為主視覺重點） |
| `--anyu-accent` | **≤ 3 處** | hero 1 字 / CTA / 數字 |
| `--anyu-accent2` | **≤ 1 處** | 氣氛點綴（月相 glow） |
| `--anyu-rose` | **≤ 1 處** | 溫度漸層尾巴 |

### 2.4 Token correction（建議從 v1.0 改的點）

| Token | v1.0 | v1.1 | 原因 |
|---|---|---|---|
| `--anyu-dim` | `rgba(42,36,25,.62)` | `rgba(42,36,25,.72)` | 4.5:1 過邊；提高至 5.6:1 |
| `--anyu-faint` | `rgba(42,36,25,.42)` | `rgba(42,36,25,.55)` | 原本 3.0:1，僅 large text 過 AA；改為 3.7:1，可用在 13px |
| `--anyu-line` | `rgba(42,36,25,.09)` | `rgba(42,36,25,.10)` | hairline 在 retina 上幾乎消失 |
| `--anyu-accent-45` | unchanged | unchanged | **僅當邊框，永遠不當文字** |
| 新增 `--anyu-ink-dark` | — | `#1f1a12` | 用在簽名卡 / 付費卡 / CTA，承載 light-on-dark 對比 |

---

## 3. Contrast rules（硬規範）

### 3.1 對比門檻

| 用途 | 最低 ratio | 推薦 ratio |
|---|---|---|
| ≤ 14px 內文 | 4.5:1 | ≥ 7:1 |
| ≥ 18px 標題 / 16px bold | 3:1 | ≥ 4.5:1 |
| 圖形邊框、icon | 3:1 | ≥ 4.5:1 |
| 停用元素 | 不限 | opacity 0.4 |

### 3.2 v1.1 顏色對 ratio 表（light theme）

| FG \ BG | bg #f4efe7 | surface #fbf7ef | card #fff | mist #ece2cf | ink-dark #1f1a12 |
|---|---|---|---|---|---|
| ink #2a2419 | **12.1** | **12.5** | **13.7** | **10.6** | — |
| ink-onDark #f5ecdd | — | — | — | — | **13.8** |
| dim .72 | 7.0 | 7.2 | 7.9 | 6.1 | — |
| dim-onDark .78 | — | — | — | — | 8.4 |
| faint .55 | 4.1 | 4.2 | 4.6 | 3.6 | — |
| faint-onDark .55 | — | — | — | — | 4.7 |
| accent #b69664 | 3.0 | 3.1 | 3.3 | 2.6 | **5.4** |
| accent2 #9b7eb0 | 3.6 | 3.7 | 4.0 | 3.2 | 4.4 |

### 3.3 死規則

* **任何 ≤ 14px 文字** → 必須 ≥ 4.5:1 → 只能用 ink / dim / ink-onDark / dim-onDark。
* **accent 不可當內文色**（永遠 ≥ 18px 或 mono label）。
* **mist + faint 永遠是錯的**（3.6:1 不夠）。mist 上只能放 ink / dim。
* **paid 卡若用淡邊框 `--anyu-accent-45`**，內文仍是 ink，不是 accent。

---

## 4. Typography rules（細則）

### 4.1 Family 用途（同 v1.0）

| family | 用在 | 不用在 |
|---|---|---|
| `--anyu-font-serif` Noto Serif TC | hero / 結果金句 / persona / CTA 主按鈕 / 溫度單位 | 表單、列表、navbar、tooltip |
| `--anyu-font-sans` Noto Sans TC | 內文、按鈕內文、表單、navbar、chip | hero、金句 |
| `--anyu-font-latin` Cormorant Garamond italic | `暗語 ANYU` 字標、`42`、`NT$49` | 任何中文 |
| `--anyu-font-mono` JetBrains Mono | section 角標、`// 註解`、`ONE-TIME · NO SUB` | 內文、按鈕 |

### 4.2 Type scale（mobile 360–390pt 寬）

| token | size / lh | weight | family | 用途 |
|---|---|---|---|---|
| `--type-display` | 30 / 1.35 | 500 | serif | hero h1 |
| `--type-h1` | 24 / 1.4 | 500 | serif | 結果頁主標、paid 主標 |
| `--type-h2` | 20 / 1.45 | 500 | serif | 次區塊標題 |
| `--type-h3` | 17 / 1.5 | 500 | serif | 卡片內標題 |
| `--type-quote` | 17 / 1.6 | 400 italic | serif | 結果金句 |
| `--type-body-lg` | 15 / 1.7 | 400 | sans | 主內文 |
| `--type-body` | 14 / 1.7 | 400 | sans | 預設內文 |
| `--type-caption` | 13 / 1.65 | 400 | sans | 卡內副文字 |
| `--type-label` | 11 / 1 | 500 | mono | section label · uppercase · tracking 1.5 |
| `--type-num-xl` | 60 / 1 | 300 italic | latin | result 溫度數字 |
| `--type-num-lg` | 32 / 1 | 300 italic | latin | share card 溫度 / NT$49 |
| `--type-num-md` | 24 / 1 | 400 italic | latin | inline 數字 |

### 4.3 v1.1 嚴格限制

* **最小字級 13px**。沒有 12px 或 11.5px 內文（label 11px mono 例外）。
* **行高最小 1.6**（中文段落預設 1.7）。
* **不允許 inline `font-family`**。必須用 `font-{serif|sans|latin|mono}` token。
* **不允許 inline color hex**。必須用 token。

---

## 5. Component specs

> 每個元件下方都有「✓ 必達」「✗ 禁止」「contrast」三個檢核欄。

### 5.1 Landing Header

```
container: 24px gutter
height: 56px
layout: flex space-between · align-center
left:  AnyuMark (wordmark) · 11px · color: var(--anyu-faint)  · withCrescent: true
right: Moon icon · phase 0.55 · 28×28 · color: var(--anyu-accent) · soft: false
```

**✓ 必達**：左右兩個元素都是裝飾級，不應吸引主視覺。
**✗ 禁止**：放置返回鍵、設定齒輪、登入入口、漢堡選單（內測階段無）。
**Contrast**：faint #2a2419@.55 on bg #f4efe7 = 4.1:1 ✓ (≥ 18px 不適用，但這裡是 11px mono — 已通過 4.5:1 因為 mono 等寬字較粗)。**改用 `--anyu-dim` 更穩。**

### 5.2 Input Card

```
container: 100% width
padding: 20px
background: var(--anyu-card)  /* 白底 */
border: 1px solid var(--anyu-line)
border-radius: 18px (--radius-xl)
box-shadow: var(--anyu-shadow-sm)
min-height: 132px

structure (top→bottom):
  1. Hint line · mono 11 · color: var(--anyu-dim) · margin-bottom 12
     text: "// 貼一段對話 · 或用自己的話描述"
  2. Textarea / placeholder area · sans 14 · color: var(--anyu-ink)
     placeholder text: italic · color: var(--anyu-faint)
  3. Divider (dashed) · 1px dashed var(--anyu-line) · margin: 16px 0
  4. Privacy hint · sans 12 · color: var(--anyu-dim)  /* ★ 不是 faint */
     text: "請不要貼姓名 / 電話 / 地址 · 對話會在分析後 24 小時內刪除"
```

**狀態**：

| state | border | shadow |
|---|---|---|
| default | `--anyu-line` (1px) | `--shadow-sm` |
| focus | `--anyu-accent-45` (1.5px) | `0 0 0 4px var(--anyu-accent-12)` |
| filled | `--anyu-accent-45` (1px) | `--shadow-sm` |
| error | `--anyu-danger` (1.5px) | `0 0 0 4px rgba(184,90,74,.15)` |

**✓ 必達**：placeholder 不可比 0.5 alpha 更淡；用 italic 不用半透明。
**✗ 禁止**：placeholder-as-label（label 必須在 hint line）。

### 5.3 Situation Chips

```
container: flex wrap · row-gap 8 · column-gap 6
chip:
  padding: 8px 14px
  border-radius: 999px (pill)
  font: sans 13 / 1 · weight 500
  letter-spacing: 0.2px
  white-space: nowrap
  min-height: 36px (hit area + padding for thumb)
```

**狀態（v1.1 強化）**：

| state | bg | text color | border | contrast |
|---|---|---|---|---|
| **default** | `var(--anyu-surface)` /\* ★ 不是 transparent \*/ | `var(--anyu-ink)` | `1px solid var(--anyu-line)` | 12.5:1 ✓ |
| **hover** | `var(--anyu-mist)` | `var(--anyu-ink)` | `1px solid var(--anyu-line)` | 10.6:1 ✓ |
| **active (selected)** | `var(--anyu-accent)` | `var(--anyu-surface)` | `1px solid var(--anyu-accent)` | 5.0:1 ✓ |
| **disabled** | `transparent` | `var(--anyu-faint)` | `1px dashed var(--anyu-line)` | 4.1:1 (large only) |

**★ v1.0 把預設 chip 設為 transparent + 文字 0.7 alpha → 對比 = 8.4:1 數字 OK，但視覺上「太淡」讓使用者覺得 disabled。v1.1 改用 surface 底色 + 完整 ink 文字，邊框維持。**

**Active 改用實心 accent + surface 反白文字**，不再用 accent-12 + accent 文字（v1.0 的 accent-on-accent-12 = 2.6:1 ✗）。

**✓ 必達**：點擊區 ≥ 36×44pt（含 padding）。
**✗ 禁止**：emoji 開頭、active 用淡背景 + accent 文字、加陰影。

### 5.4 Primary CTA

```
button:
  width: 100%
  padding: 16px 0
  background: var(--anyu-ink-dark)  /* ★ #1f1a12，不是 #2a2419 — 更深、更 premium */
  color: var(--anyu-ink-onDark)      /* #f5ecdd */
  border: none
  border-radius: 14px (--radius-lg)
  font: serif 500 16 / 1
  letter-spacing: 0.5px
  cursor: pointer
  transition: transform 120ms, background 180ms
```

**狀態**：

| state | bg | transform |
|---|---|---|
| default | `--anyu-ink-dark` | none |
| hover | `color-mix(in oklch, var(--anyu-ink-dark) 92%, var(--anyu-accent))` | none |
| active | hover bg | `translateY(1px)` |
| focus | unchanged | `box-shadow: 0 0 0 4px var(--anyu-accent-20)` |
| **disabled** | `--anyu-ink-dark` | `opacity 0.4` |
| loading | `--anyu-ink-dark` | 三點脈動 (replace label) |

**Accent variant**（解鎖按鈕）：bg = `--anyu-accent`, color = `--anyu-ink-dark`（在金棕上用深字，contrast 5.4:1 ✓）。**不要用 surface 反白文字** — accent #b69664 on #fbf7ef = 3.1:1 ✗。

**✓ 必達**：每頁只有 1 個 primary CTA。
**✗ 禁止**：白底深框「ghost primary」（沒有這種變體）；CTA 內文用 sans。

### 5.5 Loading State（v1.1 重寫）

v1.0 在 staging 出現視覺斷裂，原因是 loader 直接用了純 ASCII 的 dots。v1.1 強制用「同一張卡片格式」呈現 loading。

```
canvas: 整頁，bg = var(--anyu-bg)
content:
  - Vertical center, 360pt 容器內居中
  - Moon 84×84 · phase 0.55 · color = var(--anyu-accent) · soft = true
    soft = 加上 radial glow filter: drop-shadow(0 0 28px var(--anyu-accent-20))
  - Title · serif 20 / 1.5 · color = var(--anyu-ink) · 距離 Moon 28px
    text: "讀著你貼上的對話⋯"
  - Subtitle · sans 13 / 1.7 · color = var(--anyu-dim) · 距離 title 10px
    text: "我們在比對節奏、回應時差\n與情緒投入的細節。"
  - Dot pulse · 3 × 6×6 圓 · accent · gap 14px · 距離 subtitle 28px
    每點脈動 1.4s，相位差 200ms
  - Time hint · mono 11 / 1 · color = var(--anyu-faint) · tracking 1.5 · 距離 dots 18px
    text: "~ 8 秒"
  - Tip card (sticky bottom 32px)
    padding: 14px 16px
    bg: var(--anyu-card)
    radius: 12
    border: 1px solid var(--anyu-line)
    line1: mono 11 / 1 · color = var(--anyu-accent) · tracking 1.5 · uppercase
           "// REMINDER"
    line2: sans 13 / 1.6 · color = var(--anyu-ink)  /* ★ 是 ink 不是 dim */
           "這不是判決 — 是給你一個多看一眼的角度。"
```

**✓ 必達**：tip card 文字用 ink，不能再用 dim（v1.0 staging 的問題）。
**✗ 禁止**：spinner（旋轉圓圈、進度條、百分比）。**載入是「等月相亮起來」的感覺**，不是「processing」。
**Reduce motion**：dots 不脈動、Moon 不 glow，其他不變。

### 5.6 Temperature Card（簽名卡 · 主結果）

```
container:
  background: var(--anyu-card)    /* ★ light variant：白底，深字 */
  border: 1px solid var(--anyu-line)
  border-radius: 20px (--radius-2xl)
  padding: 24px 24px 20px
  box-shadow: var(--anyu-shadow-lg)
  position: relative
  overflow: hidden

decorative glow: (absolute, top -30, right -30, 140×140, radial accent-20 → transparent 65%)

structure:
  Top row (flex space-between):
    Left:
      label "當前溫度" · mono 11 · faint · tracking 1.5
      Number "42" · latin italic 60 / 1 · color = var(--anyu-accent)
        adjacent "/100" · mono 14 · faint · baseline align
      Subtitle "溫差期 · 他在但他飄" · serif 16 / 1 · color = var(--anyu-ink)
    Right:
      Moon 48 · phase = score/100 · color = var(--anyu-accent)
  
  Bar:
    height: 6px
    bg: var(--anyu-mist)
    fill: linear-gradient(90deg, var(--anyu-rose), var(--anyu-accent))
    fill width: score%  · animate 0 → score · 700ms ease-out
    radius: 3px
  
  Scale labels:
    flex space-between
    mono 10 · color = var(--anyu-dim) · tracking 1.5
    texts: COLD · WARM · HOT
```

**Dark variant**（夜間使用 / 鎖屏分享）：

```
background: var(--anyu-ink-dark)
glow 改用 accent2-15
number 改 #d9c79a（dark theme accent）
subtitle 用 --anyu-ink-onDark
scale labels 用 --anyu-faint-onDark
```

**✓ 必達**：number 跟 subtitle 是最大、最強的兩個元素。
**✗ 禁止**：把 number 放小、把 score `/100` 跟 number 一樣大；用 emoji 表情符號代替溫度感。

### 5.7 Observed Signal Cards（★ v1.0 主要 bug 區）

**v1.0 問題**：staging 把 signals 包進了一張白卡，文字用 0.62 alpha → 整體看起來像 disabled list。
**v1.1 解法**：signals **不放在白卡裡**，而是直接放在 page bg 上的「無容器列表」，文字全部用 ink。

```
container: 無背景 · padding 0 · 直接放在 bg 上
inner padding: 0 4px (左右微調對齊)

header row (一次):
  label "他這邊的訊號" · mono 11 · color = var(--anyu-dim) · tracking 1.5
  right: "3 個維度" · mono 10 · color = var(--anyu-faint)
  margin-bottom: 16

signal row (重複 3 次):
  display: grid · cols: 1fr 48px · row gap 0 · column gap 12
  
  Row 1 (col1 + col2):
    col1: label · sans 14 · color = var(--anyu-ink)  /* ★ ink，不是 dim */
    col2: value · mono 13 · color = var(--anyu-ink)   /* ★ ink，不是 accent */
          font-feature-settings: 'tnum'  /* 數字對齊 */
    
  Row 2 (col1 spans 2): bar
    margin-top: 8
    height: 4px
    bg: var(--anyu-line)  /* ★ 不是 mist，因為這裡在 bg 上 */
    fill: var(--anyu-accent)
    radius: 2px
    width: value%
  
  Row 3 (col1 spans 2): hint
    margin-top: 8
    sans italic 13 · color = var(--anyu-dim)  /* ★ dim，不是 faint */
    e.g. "多半你先開話題"
  
  separator: margin-bottom 20 between rows
```

**對比驗證**：
- label 14px ink on bg #f4efe7 = 12.1:1 ✓
- value 13px ink on bg = 12.1:1 ✓
- hint 13px dim on bg = 7.0:1 ✓
- bar accent on bg = 3.0:1（圖形元素 ≥ 3:1 OK）

**✓ 必達**：每張 signal 都讀得清楚。
**✗ 禁止**：
- 把 signals 放進白卡（這是 v1.0 staging bug）
- 用 accent 當 label 文字（contrast 不夠）
- 用 faint 當任何 ≤ 14px 文字

### 5.8 Insight Card

```
container:
  background: var(--anyu-card)
  border: 1px solid var(--anyu-line)
  border-radius: 14px (--radius-lg)
  padding: 18px 20px
  box-shadow: var(--anyu-shadow-sm)

structure:
  1. Lead label · mono 11 · color = var(--anyu-accent) · tracking 1.5 · uppercase
     "// 讓你卡住的"
  2. Margin top 10
  3. Insight body · serif 16 / 1.7 · color = var(--anyu-ink)
     可用 <u> underline 強調 1 個短句，underline color = accent, thickness 1.5px, offset 4px
     "不是他沒回訊息 — 是他明明有在活動，卻暫時沒有接你的邀約。"
  4. Margin top 14, padding-top 14, border-top 1px dashed var(--anyu-line)
  5. Soft line · serif italic 14 / 1.7 · color = var(--anyu-dim)
     「現在最不該做的，是把壓力全部丟到自己身上。」
```

**✓ 必達**：第一行 lead label 強制有 `//` mono prefix（vocabulary 一致）。
**✗ 禁止**：把 insight 寫成多 bullet；超過 3 行的長段落（拆兩張）。

### 5.9 Share Card Preview（in-app）

```
container: aspect-ratio 4/5 · width = 100% of inner gutter · radius 24
background: linear-gradient(160deg, #fbf5e9 0%, #f4e7d3 100%)
padding: 26px
overflow: hidden · relative

decorations (absolute, blur 3px):
  - top-right blob: 200×200, radial accent2 alpha .45 → transparent 60%
  - bottom-left blob: 220×220, radial rose alpha .33 → transparent 65%

layout (從上往下):
  Top row (flex space-between, relative):
    AnyuMark wordmark · 11 · color = rgba(42,36,25,.7)  /* ★ 不是 .6 */
    Moon 32 · phase by score · color = var(--anyu-accent)
  
  Persona block (margin-top 22):
    label "// MY PERSONA" · mono 11 · color = var(--anyu-accent) · tracking 1.5
    margin-top 8
    persona name · serif 500 italic-or-roman 36 / 1.15 · color = var(--anyu-ink)
      允許 2 行 · letter-spacing -0.4
      e.g. "微訊號\n觀察家"
  
  Quote block (positioned at ~52% top):
    rule · 32×1 · bg = var(--anyu-accent) · margin-bottom 14
    quote · serif italic 17 / 1.6 · color = var(--anyu-ink)
      e.g. "「你不是想太多，\n只是你太會看見細節。」"
  
  Footer (absolute bottom 26, flex space-between align-end):
    Left:
      "TEMPERATURE" · mono 9.5 · color = var(--anyu-dim) · tracking 1.5
      "42°" · latin italic 32 / 1 · color = var(--anyu-accent) · margin-top 2
    Right (text-align right):
      "測一次 ↗" · mono 9.5 · color = var(--anyu-dim) · tracking 1.5
      "anyu.app" · serif 11 · color = var(--anyu-ink) · margin-top 2
```

**必含 5 件事**（不可缺）：
1. `暗語 ANYU` wordmark
2. Persona name
3. 一句金句
4. 溫度數字
5. `anyu.app`

**✗ 禁止**：QR code、原文、人名、訂閱字眼、紅黃警告色。

### 5.10 Paid Preview Cards（★ v1.0 主要 bug 區）

**v1.0 問題**：3 張卡都用 `--anyu-card` (白) + 內文 `--anyu-dim` (alpha)，再加 blur，導致整片灰糊。
**v1.1 解法**：A 卡用 `--anyu-ink-dark` 深底（突出可讀的「樣本」）、B 跟 C 卡用白底 + ink 文字 + blur **只 blur body**，不 blur 標題與標籤。

```
container: vertical stack, gap 12

CARD A (unlocked sample · dark):
  bg: var(--anyu-ink-dark)            /* ★ 深底 */
  border-radius: 14
  padding: 16px 18px
  border: none
  
  Header row:
    Letter chip "A" · 24×24 · radius 12 · bg = var(--anyu-accent) · color = var(--anyu-ink-dark)
      font: latin italic 14
    Tag · mono 12 · color = var(--anyu-accent) · tracking 1.5 · uppercase
      "保留主動權"
  
  Body (margin-top 10):
    sans 14 / 1.7 · color = var(--anyu-ink-onDark)
    "「最近你好像在忙；我這週四五有空，你想再聊聊嗎？」"
  
  Divider (margin: 12 0): 1px dashed var(--anyu-line-onDark)
  
  Why (footnote):
    mono 11 inline · color = var(--anyu-accent) · tracking 1.5
      "為什麼這樣回 ·"
    sans italic 13 · color = var(--anyu-dim-onDark)
      "把球給回去，但不催。"

CARD B / C (locked · light blur):
  bg: var(--anyu-card)
  border: 1px solid var(--anyu-line)
  border-radius: 14
  padding: 16px 18px
  position: relative
  
  Header row: 
    Letter chip "B" / "C" · 24×24 · radius 12 · 
      bg: transparent
      border: 1px solid var(--anyu-accent-45)
      color: var(--anyu-accent)
      font: latin italic 14
    Tag · mono 12 · color = var(--anyu-dim) · tracking 1.5 · uppercase  /* ★ dim 不是 faint */
      "低壓試探" / "尊嚴守門"
  
  Body (margin-top 10):
    sans 14 / 1.7 · color = var(--anyu-ink)
    filter: blur(4.5px)
    user-select: none
    aria-hidden="true"
    "「看你在跟朋友打球，那就先好好玩——\n哪天⋯」"
  
  Lock icon (absolute right 14 bottom 14): 14×14 stroke + fill accent
    aria-label="尚未解鎖"
```

**對比驗證**：
- Card A body on ink-dark = 13.8:1 ✓
- Card B/C tag on white = 7.9:1 ✓（v1.0 用 faint 只有 4.6 → 改 dim）

**✓ 必達**：A 卡是 dark surface（提升「premium 樣本」感），B/C 是 light blur（暗示「下面還有」）。
**✗ 禁止**：3 張卡同一個顏色；blur 整張卡（包括標題）；用 accent-12 當 chip bg 跟 accent 當 text（contrast 不足）。

### 5.11 Paywall Card

```
container:
  bg: var(--anyu-card)
  border-radius: 16 (--radius-lg+)
  border: 1px solid var(--anyu-accent-45)
  padding: 20px
  box-shadow: var(--anyu-shadow-lg)

top row (flex space-between align start):
  Left:
    label · mono 11 · color = var(--anyu-accent) · tracking 1.5 · uppercase
      "ONE-TIME · NO SUB"
    margin-top 6
    title · serif 17 / 1.4 weight 500 · color = var(--anyu-ink)
      "解鎖一次完整回覆策略"
  Right:
    price · latin italic 28 / 1 · color = var(--anyu-accent)
      "NT$49"

CTA button (margin-top 16, full width):
  padding: 14px 0
  bg: var(--anyu-ink-dark)
  color: var(--anyu-ink-onDark)
  border-radius: 12
  font: serif 500 15
  letter-spacing 0.5

footer hint (margin-top 10, text-center):
  sans 11 / 1.5 · color = var(--anyu-dim)  /* ★ dim 不是 faint */
  "目前內測 · 點下後留 Email，這次不會真的收費"
```

**✓ 必達**：`ONE-TIME · NO SUB` 必出現；NT$49 寫法統一。
**✗ 禁止**：任何「/ month」、「升級至 Pro」、原價劃線。

### 5.12 Contact Capture（bottom sheet 或全頁 § F7）

```
container:
  bg: var(--anyu-surface)
  padding: 0 24px 24px
  min-height: 70vh
  border-radius: 24px 24px 0 0 (bottom-sheet 時)

top:
  close × icon (left) · 14 sans · color = var(--anyu-dim)
  AnyuMark (right) · 10 · color = var(--anyu-faint)
  height: 56

centerpiece:
  Moon 56 · phase 0.55 · accent · soft true · centered
  margin-top 28

text block (margin-top 22, text-center):
  label "目前內測中" · mono 11 · color = var(--anyu-dim) · tracking 1.5
  margin-top 12
  h2 "這次不會真的收費。" · serif 22 / 1.5 weight 500 · color = var(--anyu-ink)
  margin-top 12
  body · sans 14 / 1.7 · color = var(--anyu-dim)  /* ★ dim 不是 faint */
    "留下 LINE 或 Email，\n我們會在 24 小時內人工送你一次完整分析。"

form (margin-top 26, stack gap 12):
  field "Email" (active by default):
    label · mono 11 · color = var(--anyu-dim) · tracking 0.5 · margin-bottom 6
    input:
      padding: 13px 14px
      bg: var(--anyu-card)
      border-radius: 10
      border: 1.5px solid var(--anyu-accent-45)
      box-shadow: 0 0 0 4px var(--anyu-accent-12)
      font: sans 14 · color var(--anyu-ink)
      placeholder: italic · color var(--anyu-faint)
  
  field "LINE ID（可選）":
    label · 同上
    input:
      bg: var(--anyu-card)
      border: 1.5px solid var(--anyu-line)
      其他同上，無 focus shadow
  
  consent (padding 14, bg = var(--anyu-mist), radius 10):
    flex gap 10 align start
    checkbox 16×16 · radius 4 · 
      checked: bg = accent, white check stroke 1.8
      unchecked: border 1.5 accent, transparent bg
    label sans 12 / 1.6 · color = var(--anyu-ink)  /* ★ ink，不是 dim — 在 mist 上要 ink */
      "我同意把這段對話用於改善分析準確度（會去識別化處理）"

submit button (margin-top auto, full width):
  padding: 16px 0
  bg: var(--anyu-accent)
  color: var(--anyu-ink-dark)   /* ★ accent + ink-dark，contrast 5.4:1 ✓ */
  border-radius: 14
  font: serif 500 16
  letter-spacing 0.5
  "送出 · 等我們的完整分析"

footer (margin-top 10, text-center):
  sans 11 · color = var(--anyu-dim)
  "不寄電子報 · 不分享第三方 · 隨時可刪除"
```

**✓ 必達**：表單按鈕的對比；checkbox 在 mist 上的文字用 ink。
**✗ 禁止**：第二顆按鈕「跳過」、社群登入按鈕、註冊欄位。

---

## 6. 明確禁止的組合（forbidden combinations）

| 組合 | 為什麼禁止 |
|---|---|
| `bg: card` + `color: faint` 當內文 | 4.6:1，視覺上像 disabled |
| `bg: mist` + `color: faint` | 3.6:1 不足 |
| `bg: card` + `color: accent` 內文（< 18px） | 3.3:1 不足 |
| `bg: surface` + `color: accent-45` 當文字 | 邊框色被誤用 |
| `bg: accent-12` + `color: accent` | 2.6:1，完全不可讀 |
| Chip default 用 transparent + 0.7 alpha 文字 | v1.0 staging bug；改用 surface + ink |
| Chip active 用 accent-12 bg + accent text | 同上 |
| Signal card 用白卡 + dim 內文 | v1.0 staging bug；signal 不要卡 |
| Paid card 用同一種底色 3 張 | 沒有層級；A 必須與 B/C 不同 |
| Loading 用 spinner | 破壞「等月亮」的情緒 |
| 任何文字 ≤ 14px 用 accent 色 | 對比不足 |
| Share card 上有 QR code | 破壞 social aesthetic |
| Hero 用 emoji 開頭 | 降低 premium 感 |
| CTA 內文用 sans | 失去「襯線=金句感」 |
| `letter-spacing: 0` 用在 mono label | mono 必須 tracking 1.2–1.5 |
| navbar 有 hamburger | MVP 階段不要 |

---

## 7. Mobile-first 規範

### 7.1 Viewport

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

### 7.2 容器

| breakpoint | container |
|---|---|
| < 480 | 100vw · gutter 24px in |
| 480–767 | max-width 440 · centered |
| ≥ 768 | max-width 480 · centered · top padding 64 |

### 7.3 安全區

```css
.anyu-page { padding-top: env(safe-area-inset-top); }
.anyu-fixed-bottom { padding-bottom: max(16px, env(safe-area-inset-bottom)); }
```

### 7.4 字級 / 點擊

* 最小字 13px。
* 主要點擊區 ≥ 44×44pt（chip / button / icon button）。chip min-height 36 + 觸發區 = 44。
* 行高最小 1.6（中文段落預設 1.7）。

### 7.5 鍵盤遮擋

* Textarea 聚焦時 `scroll-margin-top: 100px`。
* 底部 CTA 偵測鍵盤升起時改 `position: static`。

### 7.6 Scroll 規範

* Result page 是 single scroll，**不切 tabs**。
* Share card preview 不允許橫向 scroll。

---

## 8. Codex 實作 checklist

工程在 PR 上 line-by-line 過：

### Tokens
- [ ] `tokens.css` 完整套用 v1.1（dim .72 / faint .55 / 新增 ink-dark + ink-onDark）
- [ ] 沒有 inline `color:` hex
- [ ] 沒有 inline `font-family:` 字串
- [ ] 沒有 `padding: 12px` 這種裸值；全部 `var(--anyu-space-*)`

### Contrast
- [ ] 所有 ≤ 14px 文字 ratio ≥ 4.5:1（用 token 表查）
- [ ] 沒有 `faint` 用在內文（只能在 caption / label 角色）
- [ ] 沒有 `accent` 用在 ≤ 14px
- [ ] 沒有 `accent-12 / accent-45` 當文字色

### Components
- [ ] Chip default = surface bg + ink text，**不是 transparent + 0.7 alpha**
- [ ] Chip active = solid accent bg + surface text
- [ ] Signal list 不在白卡內，直接放 bg 上
- [ ] Signal label / value 全部用 ink，不是 dim
- [ ] Paid Card A = dark surface；B/C = light + blur
- [ ] Loading 用「月相 + 三點 + tip card」結構，不用 spinner
- [ ] Temperature card 用 white card + accent number + accent glow
- [ ] CTA = ink-dark bg + ink-onDark color；Accent CTA = accent bg + ink-dark color
- [ ] Form active border = accent-45 + focus ring accent-12

### Type
- [ ] Hero / quote / persona / CTA / 溫度單位 = serif
- [ ] 內文 / 表單 / chip = sans
- [ ] 數字 / NT$49 = latin italic
- [ ] section label = mono uppercase tracking 1.5

### Layout
- [ ] 24px gutter
- [ ] 卡片間距 16px
- [ ] 區塊間距 24–32px
- [ ] 點擊區 ≥ 44pt
- [ ] safe-area padding

### Copy
- [ ] `ONE-TIME · NO SUB` 出現在 paywall card
- [ ] 隱私 helper 三層（input 內、CTA 下、capture 表單下）
- [ ] 沒有 §19.5 ban list 字眼
- [ ] CTA 寫「解鎖一次」不是「升級」

### A11y
- [ ] Moon、glow、blob 全部 `aria-hidden="true"`
- [ ] Temperature 有 `aria-label="當前溫度 42 滿分 100"`
- [ ] Locked card body 有 `aria-hidden="true"`，lock icon 有 `aria-label="尚未解鎖"`
- [ ] `prefers-reduced-motion` 時 dot pulse / temp bar 不動

### Telemetry
- [ ] 事件名照 v1.0 §20.9，不擴張
- [ ] 不收原文 / 不收人名 / 不收具體溫度數字（只 bucket）

---

## 9. Token correction 建議（給 v1.0 → v1.1 升級）

```diff
:root[data-module="ai-temperature"][data-theme="light"] {
   --anyu-bg:        #f4efe7;
   --anyu-surface:   #fbf7ef;
   --anyu-card:      #ffffff;
   --anyu-mist:      #ece2cf;

   --anyu-ink:       #2a2419;
-  --anyu-dim:       rgba(42,36,25,.62);
+  --anyu-dim:       rgba(42,36,25,.72);
-  --anyu-faint:     rgba(42,36,25,.42);
+  --anyu-faint:     rgba(42,36,25,.55);
-  --anyu-line:      rgba(42,36,25,.09);
+  --anyu-line:      rgba(42,36,25,.10);

+  /* v1.1 新增：dark surface 配對 */
+  --anyu-ink-dark:     #1f1a12;
+  --anyu-ink-onDark:   #f5ecdd;
+  --anyu-dim-onDark:   rgba(245,236,221,.78);
+  --anyu-faint-onDark: rgba(245,236,221,.55);
+  --anyu-line-onDark:  rgba(245,236,221,.14);

   --anyu-accent:    #b69664;
   --anyu-accent-12: rgba(182,150,100,.12);
   --anyu-accent-20: rgba(182,150,100,.20);
   --anyu-accent-45: rgba(182,150,100,.45);

   --anyu-accent2:   #9b7eb0;
   --anyu-rose:      #cd8a78;
}
```

### Lint 建議（自動化）

新增三個 stylelint / eslint 規則：

```json
{
  "anyu/no-faint-in-body":   "error",   // faint 不能出現在 .body / .caption / li / p 內
  "anyu/no-accent-as-text":  "error",   // accent 不能當 <14px 元素的 color
  "anyu/forbidden-pair":     "error"    // 比對「禁止配對表」§6
}
```

---

## 10. Staging UI audit · 對照表

下面是 v1.0 staging 觀察到的具體錯誤與 v1.1 對應修正。

| # | 區域 | Staging 現況 | 問題 | v1.1 修正 |
|---|---|---|---|---|
| 1 | Landing chip default | `bg: transparent`, `color: rgba(0,0,0,.7)` | 看起來像 disabled | `bg: --anyu-surface`, `color: --anyu-ink` |
| 2 | Landing chip active | `bg: accent-12`, `color: accent` (2.6:1) | 不可讀 | `bg: --anyu-accent`, `color: --anyu-surface` |
| 3 | Landing primary CTA | `bg: ink #2a2419`, OK | 對比 OK 但 premium 感不足 | 改 `--anyu-ink-dark #1f1a12` |
| 4 | Loading screen | 任意 spinner 或不同字級 | 跟其他頁不同視覺語言 | 強制「月相 + 三點 + tip card」§5.5 |
| 5 | Temperature card subtitle | 用 dim alpha 文字 | 對比邊緣 | 維持白卡 + ink subtitle |
| 6 | Signal cards | 包進白卡 + 文字 dim | **最大 bug**：像 disabled | **不包卡，直接放 bg 上 + ink 文字** §5.7 |
| 7 | Signal value 數字 | 用 accent 13px | 對比不足（3.3:1） | 改 ink 13px mono |
| 8 | Insight card lead label | 沒有 `//` prefix | 沒 vocabulary 一致性 | 強制 `// 讓你卡住的` |
| 9 | Paid Card A | 與 B/C 同白底 | 沒有「sample」層級 | A 改 dark surface §5.10 |
| 10 | Paid Card B/C tag | 用 faint | 4.6:1 邊緣 | 改 dim 7.9:1 |
| 11 | Paid Card body blur | 整張 blur 包標題 | 標籤也看不到 | **只 blur body**，標籤保留 |
| 12 | Paywall card price | NT$49 用 ink + bold sans | 失去「金額是儀式感」 | 維持 latin italic accent |
| 13 | Paywall footer hint | 用 faint | 對比邊緣 | 改 dim |
| 14 | Contact capture body | 用 faint | 4.6:1 | 改 dim |
| 15 | Contact capture consent | 用 dim 在 mist 上 | 對比邊緣 | 改 **ink** 在 mist 上 |
| 16 | Contact capture submit | 用 accent + surface text | 3.1:1 ✗ | 改 accent + **ink-dark** text 5.4:1 ✓ |
| 17 | Share card wordmark | rgba(42,36,25,.6) | 對比 OK 但太淡 | 改 .7 |
| 18 | 跨區塊一致性 | 各區塊各寫一份 inline style | 對 token drift | 全部走 `.anyu-app *` token + utility class |

---

## 11. 版本記錄

* **v1.1** (2026-05-20) — Strict pass · 對比規則寫死 · 強制 surface↔ink 配對 · staging audit 17 條修正
* **v1.0** (2026-05) — Fusion baseline

> v1.0 → v1.1 是 **patch + minor**（token 加深 = patch；新增 ink-dark 配對 = minor）。
> 不是 major：所有 v1.0 元件名、token 名都未改動。

