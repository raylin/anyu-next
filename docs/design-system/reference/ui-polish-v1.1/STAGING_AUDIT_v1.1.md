# 暗語 ANYU · Staging Visual Audit · v1.1
> 對照 staging 截圖（2026-05-20）vs. v1.1 設計系統 + 新版 ⋯ 品牌 mark
> 目的：給 coding agent 一張清單，讓 staging 對齊 v1.1
> 參照檔：`v1.1/DESIGN_SYSTEM_v1.1.md` · `v1.1/LOGO_v1.1.md` · `v1.1/anyu-mark.css`

---

## 0. TL;DR · 三件最重要的事

整體型體與 v1.1 對齊度大約 **75%** — 字體階級、卡片圓角、奶油底色、付費卡的 A/B/C 編排都對。但有三個結構性問題：

1. **缺品牌標誌** — 現在的 header 是「暗語 ANYU」純打字。新版 v1.1 已經有 ⋯ mark；header / 分享卡 / favicon 全部要換成 lockup。
2. **purple 圓點是孤兒元素** — 溫度卡右上角 + persona 卡右上角各有一顆紫色實心圓。這是更早版本的彎月殘留物，**現在不屬於任何 token / component**。要嘛換成 ⋯ mark、要嘛刪除。
3. **沒用到新的 ⋯ system** — 我們做了 7 個 system utility class（divider / loading / unread / stamp / pattern / button / inline），現在 staging **一個都沒用到**。下面會逐一指出該用在哪。

完成這三件，視覺一致性會從 75% 推到 95%。

---

## 1. 全域 · 環境問題

### 1.1 頁面背景帶 purple bloom（top-right）
截圖右上角有一塊 pinkish/purplish 暈染，**不在 v1.1 spec 內**。

- 預期：`background: var(--anyu-bg)` = `#f4efe7` 純淨奶油霧。如果要 atmosphere，最多用 token 化的 `--anyu-glow-warm` 或 `--anyu-glow-mist`，**且只允許出現在每頁的一處**（DESIGN_SYSTEM §1 「一頁 1 個 glow」鐵則）。
- 現況：兩處 glow（top-right 大塊 + bottom-left 較淡），且顏色偏 purple 不是 token 裡的 accent2。
- 修法：移除頁面層的 glow；如果一定要保留，**最多一個**，並用 `--anyu-glow-mist`（即 `accent2-15`）。

### 1.2 字體載入
看起來 OK — Cormorant Garamond italic、Noto Serif TC、JetBrains Mono 都正常。沒有變化需求。

---

## 2. Header · 頂部導覽

### 2.1 「暗語 ANYU」純文字 → 必須改成 lockup

**現況：** `暗語 ANYU` 純文字並排，無 mark，字體是 serif + latin italic 混排。

**預期：** 使用 `<AnyuLockup lang="zh" size={20} />`，或手寫 HTML：

```html
<a href="/" class="anyu-lockup anyu-lockup--zh" aria-label="暗語 ANYU">
  <svg viewBox="0 0 100 100" width="32" class="anyu-mark"
       style="color: var(--anyu-ink)">
    <circle cx="22" cy="56" r="7.5" fill="currentColor" opacity="0.55"/>
    <circle cx="50" cy="50" r="7.5" fill="currentColor" opacity="0.82"/>
    <circle cx="78" cy="44" r="7.5" fill="currentColor"/>
  </svg>
  <span class="anyu-lockup__divider"></span>
  <span class="anyu-lockup__zhblock">
    <span class="anyu-lockup__zh" style="font-size: 20px">暗語</span>
    <span class="anyu-lockup__en" style="font-size: 11px">ANYU</span>
  </span>
</a>
```

> 詳見 `LOGO_v1.1.md §4` — 已有完整 markup。

### 2.2 「← 重新整理輸入」
箭頭風格 OK，但 ASCII `←` 在 retina 上偏細。改用：
- `&larr;` HTML entity，或
- SVG icon line 1.5px，accent 色

字體已是對的 serif。

### 2.3 Header 整體間距
看起來 padding 略小（top ~24px）。v1.1 §3 建議 mobile top-bar 高度 56px，內距 16/20px。確認是 `var(--anyu-space-5)`。

---

## 3. 溫度卡（最上方主卡）

### 3.1 ❌ 右上角紫色實心圓 → 刪除或換成 ⋯
這顆 `purple solid circle` 是**孤兒元素**。v1.1 沒有「右上角放一顆圓」的設計語彙。
- **建議 A（刪除）：** 直接拿掉。卡片主體已經夠飽滿。
- **建議 B（換成 mark）：** 改成 24px 的 ⋯，accent 色，作為品牌存在感。

```html
<!-- 替代方案 B -->
<div style="position: absolute; top: 24px; right: 24px;">
  <svg viewBox="0 0 100 100" width="24" class="anyu-mark"
       style="color: var(--anyu-accent)">…three circles…</svg>
</div>
```

### 3.2 ✅ 「42 /100」typography 正確
latin italic 大數字 + mono `/100` 上標 — 就是 v1.1 spec。**保持**。

### 3.3 ⚠️ 漸層 bar 顏色偏豔
COLD → WARM → HOT 漸層在左側 purple 部分**過於飽和**，跟頁面其他地方相比過跳。

- 現況：看起來像 `#7e5a9a` 之類的純紫
- 預期：應使用 `--anyu-accent2` `#9b7eb0`（霧紫，溫度低/曖昧）+ `--anyu-rose` `#cd8a78` + `--anyu-accent` `#b69664`
- 修法：

```css
.temp-bar {
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(90deg,
    var(--anyu-accent2)  0%,
    var(--anyu-rose)    50%,
    var(--anyu-accent) 100%);
  /* OR if a smoother three-stop blend is needed, drop in via oklch() */
}
```

### 3.4 COLD / WARM / HOT 標籤
使用 `.t-label` utility（mono 11px, letter-spacing 1.5px, color dim）— 看起來大致對。**確認**用的是 `var(--anyu-dim)` 而非 hardcoded 灰。

---

## 4. Italic Quote · 第一句 hook
> 「昨天的邀約後今天完全靜音，這種落差會讓人特別不安。」

✅ 字體 + 行高大致對（serif italic, ~17px）。但**獨立成卡是浪費 surface**。

- 建議：把這句 quote 與下方「觀察到的三個小訊號」**整合成單一容器**，用 `.anyu-divider` 隔開：

```html
<blockquote class="quote">「昨天的邀約後...」</blockquote>
<div class="anyu-divider"><svg class="anyu-mark"…/></div>
<section class="signals">…</section>
```

這樣會讓兩個段落產生「同一個故事」的視覺連結，而不是兩張陌生的卡片。

---

## 5. 觀察到的三個小訊號（signal rows）

### 5.1 ✅ 整體 layout 對
標題 / 副標 / mono count（`3 個維度`）/ 每 row 的 bar + hint — 都跟 v1.1 §`.signal` spec 對得起來。

### 5.2 ⚠️ Signal bar 太細
bar 看起來大約 2px。v1.1 `.signal-bar` 規格是 **4px**。

```css
.signal-bar { height: 4px; }   /* 確認，不是 2px */
```

### 5.3 ⚠️ Signal bar 顏色失溫
bar 的 fill 看起來是 muted purple → 但 v1.1 的 `.signal-bar > i` 應該是 `var(--anyu-accent)` 金棕。

```css
.signal-bar > i { background: var(--anyu-accent); }  /* 不是 purple */
```

> 例外：若這個 signal 需要表達「冷掉」這種負面溫度，可以加 modifier `.signal-bar.is-cold { ... background: var(--anyu-accent2); }`，但**預設**應該是金棕。

### 5.4 hint text 行高
「約見面後消失」「今天沒回訊息」「明顯的互動溫差」— 這些 italic serif 11–13px 看起來 OK。確認 `--anyu-type-caption-lh: 1.65`。

---

## 6. INSIGHT LAYER 卡

### 6.1 ✅ 基本對
- mono 11px 「INSIGHT LAYER」label — 對
- serif 標題「邀約後的空白期效應」— 對
- 兩段內文，行距 1.7 — 對

### 6.2 💡 可加 ⋯ 作為「結論」標誌
這張卡的尾段「現在最大的風險是 ...」是給 user 的具體建議，視覺上可以用一個 ⋯ glyph 作為 leading mark，幫助 user 區分「描述 vs. 建議」：

```html
<p class="insight-recommendation">
  <span class="anyu-mark anyu-mark--inline" style="color: var(--anyu-accent)">
    <svg viewBox="0 0 100 100">…</svg>
  </span>
  現在最大的風險是連續追問或解釋為什麼要約見面，這會讓壓力集中在你身上 ...
</p>
```

可選實驗，不一定要做。

---

## 7. ❗️Persona / Share Card（中間白色直式卡）

這張卡有最多視覺問題，列為**第二優先**。

### 7.1 ❌ 右上角紫色實心圓 → 同 §3.1
跟溫度卡一樣的孤兒元素。**刪掉或換 ⋯**。

如果要保留作為 visual anchor，建議改用 `.anyu-stamp` 完整 stamp 組件作為這張卡的核心 visual：

```html
<div class="persona-card-stamp-wrap">
  <div class="anyu-stamp" style="transform: rotate(-2deg)">
    <div class="anyu-stamp__seal">
      <svg viewBox="0 0 100 100" width="48" class="anyu-mark"
           style="color: var(--anyu-accent)">…</svg>
    </div>
    <div class="anyu-stamp__strip">
      <span>ANYU</span><span>·</span><span>READ</span>
    </div>
    <div class="anyu-stamp__meta">2026/05/20 · 信心度 78%</div>
  </div>
</div>
```

這會把這張卡從「一張資訊卡」升級成「**證書感**」，符合 social-share 的場景（user 會截圖貼到 IG / Threads）。

### 7.2 ❌ 卡片下半部空白過多
從 quote 「你感受到的不是拒絕...」到下方 TEMPERATURE 區塊之間有**很大一塊空白**（200px+），讓卡片看起來「沒做完」。

- 方案 A：用 §7.1 的 stamp 填那塊空白
- 方案 B：用 `.anyu-pattern-bg--cream` 把那塊區域變成有層次的底紋
- 方案 C：把卡片整體壓縮 30%，去掉這塊空白

選一個。**不要留空**。

### 7.3 「暗語 ANYU」 label top-left → 改成 mini lockup
跟 header 同樣的問題 — 用 ⋯ + ANYU lockup，size 14：

```html
<span class="anyu-lockup anyu-lockup--en" style="color: var(--anyu-dim)">
  <svg viewBox="0 0 100 100" width="16" class="anyu-mark">…</svg>
  <span class="anyu-lockup__en" style="font-size: 12px">ANYU</span>
</span>
```

### 7.4 「測一次 ↗ anyu.app」
- 字體 + 排列正確
- 箭頭符號 `↗` 可以改用 SVG line icon 統一風格

### 7.5 「分享這個結果」按鈕
應該是 ghost 變體（白底 + 細邊），這沒問題。✅

### 7.6 「複製成 LINE / Threads 可貼上的文字」
小字 caption，OK。確認 color 是 `var(--anyu-dim)` 而非 `--anyu-faint`（v1.1 對比鐵則）。

---

## 8. Paywall Card · 解鎖下一句怎麼回

### 8.1 ✅ 結構正確
- ONE-TIME · NO SUB mono label — 對
- 大標題 + 副標 + NT$49 italic latin — 對
- 三個 A/B/C 子卡 — 結構對
- 黑色 CTA button — 對

### 8.2 ❌ B / C locked sub-cards 沒有「locked」visual hint
現況：兩張用模糊處理（filter: blur）。模糊的 visual 線索弱，user 可能以為是「載入中」。

**用 ⋯ 補強：** 在標題與內容之間放一個淡的 ⋯ glyph，明示「這裡有東西被遮住」：

```html
<div class="paywall-sub locked">
  <span class="paywall-sub__letter">B</span>
  <h4>三種不失控回法</h4>
  <h5>低壓試探</h5>
  <div class="anyu-locked-mark">
    <svg viewBox="0 0 100 100" width="32" class="anyu-mark"
         style="color: var(--anyu-faint)">…</svg>
  </div>
  <ul class="blurred">…</ul>
  <span class="t-label" style="color: var(--anyu-faint)">尚未解鎖</span>
</div>
```

或更簡單：把「尚未解鎖」改成「`⋯` 尚未解鎖」（inline ⋯）。

### 8.3 ⚠️ A card 黃色「A」圓圈
這個 monogram detail（A 在金色 ring 裡）**做得很好** — 維持。確認 ring 用 `--anyu-accent-45` border + `--anyu-accent-12` fill。

### 8.4 主 CTA「解鎖下一句怎麼回 — NT$49」
- 背景 `var(--anyu-ink-dark)` ✅
- 文字 `var(--anyu-ink-onDark)` ✅
- font-family `--anyu-font-serif` 中 size 15 — 對
- padding 16px (0 + 16) — 對

✅ 不需改。

---

## 9. LINE 通知卡（最底）

### 9.1 ✅ 整體 OK
- 「目前內測中」mono label
- 「加入 LINE，收到完整分析開放通知」serif 標題
- 兩段說明文
- 黑色 CTA + ghost-link「改用 Email」+ 補充說明

字體階級、留白、按鈕都對。✅

### 9.2 💡 可選：加入 mini lockup
最底卡是 user 離開頁面前最後看到的卡。在「加入 LINE...」按鈕上方放一個 `<AnyuMark size={24} />` + 「最後一步」micro label，會強化 brand recall。可選。

---

## 10. Footer · 隱私權政策 / 使用條款 / 免責聲明

✅ 字體、間距、divider「|」都 OK。

💡 可選：footer 用 `.anyu-divider` 包住作為 page 結尾：

```html
<div class="anyu-divider" style="margin-top: 48px">
  <svg class="anyu-mark" width="16" style="color: var(--anyu-faint)">…</svg>
</div>
<nav class="footer">…</nav>
```

---

## 11. 缺漏的狀態 · 看不到但必須補

這些狀態截圖看不到，但 v1.1 + 新 ⋯ system 規定要有：

### 11.1 Loading state（AI scoring 中）
當 user 送出對話 → 開始 AI 分析這段時間，**必須**顯示 `.anyu-loading` + 「ANYU 正在感覺這句話 …」。

```html
<div class="loading-screen">
  <div class="anyu-loading">
    <svg viewBox="0 0 100 100" width="48"
         class="anyu-mark anyu-mark--typing">
      <circle class="anyu-mark__dot anyu-mark__dot--1" cx="22" cy="50" r="7.5" fill="currentColor"/>
      <circle class="anyu-mark__dot anyu-mark__dot--2" cx="50" cy="50" r="7.5" fill="currentColor"/>
      <circle class="anyu-mark__dot anyu-mark__dot--3" cx="78" cy="50" r="7.5" fill="currentColor"/>
    </svg>
  </div>
  <p>ANYU 正在感覺這句話 …</p>
</div>
```

觸發規則：任何 `> 600ms` 的 async 動作；不要在 `< 600ms` 就出現（會閃）。

### 11.2 Empty state / 第一次進站
還沒貼對話前的空頁面，需要一個大的 `<AnyuLockup lang="stack">` 作為 brand 出場。

### 11.3 Favicon
確認 `<link rel="icon" type="image/svg+xml" href="/anyu-mark.svg">`，以及 raster 版本（16/32/180/192/512）。詳見 `LOGO_v1.1.md §7`。

---

## 12. 優先順序 · 給 coding agent 的 1-2-3

| 等級 | 項目 | 預期工時 |
|---|---|---|
| **P0** | 移除兩處紫色實心圓（§3.1, §7.1） | 10 min |
| **P0** | Header 換成 `<AnyuLockup lang="zh">`（§2.1） | 20 min |
| **P0** | Loading state 用 `.anyu-loading`（§11.1） | 30 min |
| **P0** | Favicon 接 `anyu-mark.svg`（§11.3） | 10 min |
| **P1** | Persona 卡填補空白（§7.2 stamp / pattern / 壓縮）+ mini lockup（§7.3） | 60 min |
| **P1** | Signal bar 顏色改回 accent（§5.3）+ 高度 4px（§5.2） | 15 min |
| **P1** | 漸層 bar 顏色用 token（§3.3） | 15 min |
| **P1** | Paywall locked 子卡加 ⋯ hint（§8.2） | 30 min |
| **P2** | 頁面 glow 收乾淨（§1.1） | 15 min |
| **P2** | Quote + Signal 之間放 `.anyu-divider`（§4） | 10 min |
| **P2** | Footer 上方放 ⋯ divider（§10） | 5 min |

P0 完成 → 視覺破口堵住、品牌 mark 確立。
P0+P1 完成 → 對齊 v1.1 的 95%。
P0+P1+P2 完成 → ⋯ system 完整滲透到頁面。

---

## 13. 對的事 · 別動

讓 coding agent 知道哪些保持原樣：

✅ 大數字 `42` italic latin treatment
✅ Paywall A/B/C 三欄結構 + 黃色 ring 上的「A」monogram
✅ ONE-TIME · NO SUB / MY PERSONA / INSIGHT LAYER 這些 mono label
✅ 卡片圓角（看起來 14-18px，對）
✅ 主 CTA 黑底 serif 字按鈕
✅ 整體 typography hierarchy（serif h1 / sans body / mono label / italic quote）
✅ 奶油底 + 白卡 + 灰邊框配色

---

## 14. 給 coding agent 的 setup checklist

確認以下檔案已從 `v1.1/` 拉進專案：

- [ ] `anyu-tokens-v1.1.css` （已存在嗎？確認最新版有 `--anyu-mark-*` 變數）
- [ ] `anyu-mark.css`（新檔，必加）
- [ ] `anyu-mark.svg`（新檔，必加）
- [ ] `anyu-mark.jsx` 或對應的 React component 包裝（如已是 React 專案）

載入順序：
```html
<link rel="stylesheet" href="anyu-tokens-v1.1.css">
<link rel="stylesheet" href="anyu-mark.css">
<!-- 其他 stylesheet -->
```

完整參考：`v1.1/LOGO_v1.1.md` 是入口手冊；`v1.1/anyu-mark-demo.html` 是視覺對照頁。

---

## 變更紀錄
- **2026-05-20** · staging screenshot vs. v1.1 baseline + 新 ⋯ mark system 落差盤點
