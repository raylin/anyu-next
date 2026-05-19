// reference.jsx — intro, design tokens visual reference, component reference.

/* =========================================================================
 *  SECTION 01 · Intro
 * ========================================================================= */
function SectionIntro() {
  const { DCSection, DCArtboard } = window;
  return (
    <DCSection
      id="intro"
      title="01 · 暗語 ANYU · Design System v1.1（strict）"
      subtitle="收緊 v1.0 → v1.1 · 把 staging 的 drift 寫成硬規則 · 給 Coding Agent 直接照做。"
    >
      <DCArtboard id="I1" label="I1 · 設計哲學 / 修正方向" width={620} height={760}>
        <div style={r.cardWrap}>
          <div style={r.tag}>design philosophy · v1.1</div>
          <h2 style={r.bigTitle}>
            <em style={r.titleAccent}>對比</em>不可妥協。<br />
            premium 來自字體 + 留白，<br />
            不來自降低對比。
          </h2>
          <div style={{ height: 22 }} />
          <div style={r.body}>
            v1.0 給對了視覺方向（C 卡片 + A 月相 + B share card）。
            v1.1 把 staging 的 6 個 drift 寫成硬規則：<br /><br />
            <strong>1.</strong> 每個 background token 必須與一組固定的 ink token 配對使用。<br />
            <strong>2.</strong> <code style={r.code}>faint</code> 不能當任何 ≤ 14px 內文色。<br />
            <strong>3.</strong> <code style={r.code}>accent</code> 不能當 ≤ 14px 文字色（對比 3:1 不足）。<br />
            <strong>4.</strong> 「observed signals」<u>不放在白卡內</u>，直接放在 page bg 上。<br />
            <strong>5.</strong> Paid Card A 用 <code style={r.code}>ink-dark</code> 深底；B/C 用淺底 + blur。<br />
            <strong>6.</strong> Loading 強制統一畫面（月相 + 三點 + tip card）。<br />
          </div>
          <div style={{ height: 28 }} />
          <div style={r.metricRow}>
            <Metric n="17" l="staging 修正" />
            <Metric n="9"  l="高保真畫面" />
            <Metric n="11" l="元件硬規範" />
            <Metric n="22" l="禁止組合" />
          </div>
        </div>
      </DCArtboard>

      <DCArtboard id="I2" label="I2 · v1.0 → v1.1 token diff" width={520} height={760}>
        <div style={r.cardWrap}>
          <div style={r.tag}>token diff</div>
          <h3 style={r.h3}>四行 token 變動，解決 90% 的 drift</h3>
          <div style={{ height: 18 }} />
          <DiffRow before="--anyu-dim: rgba(42,36,25,.62)"   after="--anyu-dim: rgba(42,36,25,.72)" />
          <DiffRow before="--anyu-faint: rgba(42,36,25,.42)" after="--anyu-faint: rgba(42,36,25,.55)" />
          <DiffRow before="--anyu-line: rgba(42,36,25,.09)"  after="--anyu-line: rgba(42,36,25,.10)" />
          <DiffRow before={null} after="--anyu-ink-dark: #1f1a12" addOnly />
          <DiffRow before={null} after="--anyu-ink-onDark: #f5ecdd" addOnly />
          <DiffRow before={null} after="--anyu-dim-onDark: rgba(245,236,221,.78)" addOnly />

          <div style={{ height: 22 }} />
          <div style={r.tag}>contrast ratios</div>
          <div style={{ height: 8 }} />
          <RatioRow fg="ink"        bg="card"     ratio="13.7:1" pass="AAA" />
          <RatioRow fg="dim"        bg="card"     ratio="7.9:1"  pass="AAA" />
          <RatioRow fg="faint"      bg="card"     ratio="4.6:1"  pass="AA"   warn="僅 ≥ 13px" />
          <RatioRow fg="ink-onDark" bg="ink-dark" ratio="13.8:1" pass="AAA" />
          <RatioRow fg="accent"     bg="card"     ratio="3.3:1"  pass="✕ 內文" warn="只能 ≥ 18px" bad />
        </div>
      </DCArtboard>

      <DCArtboard id="I3" label="I3 · 給工程的 checklist" width={460} height={760}>
        <div style={r.cardWrap}>
          <div style={r.tag}>codex checklist · 前 10 項</div>
          <h3 style={r.h3}>PR 上 line-by-line 過</h3>
          <div style={{ height: 18 }} />
          <Check>沒有 inline color hex（全走 token）</Check>
          <Check>沒有 inline font-family（全走 var）</Check>
          <Check>≤ 14px 文字一律 ink 或 dim，不能 faint / accent</Check>
          <Check>chip default = surface bg + ink 文字，不是 transparent + alpha</Check>
          <Check>chip active = solid accent + surface 反白</Check>
          <Check>signal list 不在白卡內</Check>
          <Check>signal label / value 全部 ink，不是 dim</Check>
          <Check>Paid Card A 用 ink-dark 深底</Check>
          <Check>Paid Card B/C 只 blur body，不 blur 標題</Check>
          <Check>Loading 用「月相 + 三點 + tip」，禁用 spinner</Check>

          <div style={{ height: 20 }} />
          <div style={r.tag}>verification</div>
          <div style={r.smallBody}>
            完整 checklist 見 <code style={r.code}>DESIGN_SYSTEM_v1.1.md §8</code>。<br/>
            UX flow 見 <code style={r.code}>UX_FLOW.md</code>。<br/>
            Token 原始檔見 <code style={r.code}>anyu-tokens-v1.1.css</code>。
          </div>
        </div>
      </DCArtboard>
    </DCSection>
  );
}

function Metric({ n, l }) {
  return (
    <div style={r.metric}>
      <div style={r.metricNum}>{n}</div>
      <div style={r.metricLabel}>{l}</div>
    </div>
  );
}

function DiffRow({ before, after, addOnly = false }) {
  return (
    <div style={r.diffRow}>
      {!addOnly && before && (
        <div style={r.diffBefore}>
          <span style={r.diffSign}>−</span>
          <code style={r.diffCode}>{before}</code>
        </div>
      )}
      <div style={r.diffAfter}>
        <span style={r.diffSignAdd}>+</span>
        <code style={r.diffCode}>{after}</code>
      </div>
    </div>
  );
}

function RatioRow({ fg, bg, ratio, pass, warn, bad }) {
  return (
    <div style={r.ratioRow}>
      <code style={{ ...r.diffCode, color: 'rgba(42,36,25,.78)' }}>{fg} / {bg}</code>
      <span style={{ marginLeft: 'auto', fontFamily: 'var(--anyu-font-latin)', fontStyle: 'italic', fontSize: 16, color: bad ? '#b85a4a' : 'var(--anyu-accent)' }}>{ratio}</span>
      <span style={{
        marginLeft: 10,
        fontFamily: 'var(--anyu-font-mono)', fontSize: 10,
        color: bad ? '#b85a4a' : '#5a7c52',
        letterSpacing: 1, textTransform: 'uppercase',
      }}>{pass}</span>
      {warn && <span style={{ marginLeft: 10, fontSize: 11, color: 'var(--anyu-dim)', fontStyle: 'italic' }}>{warn}</span>}
    </div>
  );
}

function Check({ children }) {
  return (
    <div style={r.checkRow}>
      <span style={r.checkBox}>
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="var(--anyu-surface)" strokeWidth="1.8" strokeLinecap="round"><path d="M1 4.5L3.5 7 8 1.5"/></svg>
      </span>
      <span style={r.checkText}>{children}</span>
    </div>
  );
}

const r = {
  cardWrap: {
    width: '100%', height: '100%', boxSizing: 'border-box',
    padding: 36,
    background: 'var(--anyu-surface)',
    fontFamily: 'var(--anyu-font-sans)',
    color: 'var(--anyu-ink)',
    overflow: 'hidden',
  },
  tag: {
    fontFamily: 'var(--anyu-font-mono)',
    fontSize: 11, color: 'var(--anyu-accent)',
    letterSpacing: 1.5, textTransform: 'uppercase',
    marginBottom: 14,
  },
  bigTitle: {
    margin: 0,
    fontFamily: 'var(--anyu-font-serif)',
    fontSize: 30, fontWeight: 500, lineHeight: 1.35,
    color: 'var(--anyu-ink)',
    letterSpacing: '-0.3px',
  },
  titleAccent: {
    fontFamily: 'var(--anyu-font-latin)',
    fontStyle: 'italic', fontWeight: 400,
    color: 'var(--anyu-accent)',
  },
  h3: {
    margin: 0,
    fontFamily: 'var(--anyu-font-serif)',
    fontSize: 20, fontWeight: 500, lineHeight: 1.45,
    color: 'var(--anyu-ink)',
  },
  body: {
    fontSize: 14, lineHeight: 1.85,
    color: 'var(--anyu-ink)',
  },
  smallBody: {
    fontSize: 13, lineHeight: 1.8,
    color: 'var(--anyu-dim)',
  },
  code: {
    fontFamily: 'var(--anyu-font-mono)',
    fontSize: 12.5,
    color: 'var(--anyu-accent)',
    background: 'var(--anyu-mist)',
    padding: '1px 5px', borderRadius: 4,
  },
  metricRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 },
  metric: {
    padding: 14,
    background: 'var(--anyu-card)',
    border: '1px solid var(--anyu-line)',
    borderRadius: 12,
    textAlign: 'center',
  },
  metricNum: {
    fontFamily: 'var(--anyu-font-latin)',
    fontStyle: 'italic',
    fontSize: 32, lineHeight: 1,
    color: 'var(--anyu-accent)',
  },
  metricLabel: {
    marginTop: 4,
    fontFamily: 'var(--anyu-font-mono)',
    fontSize: 9.5, color: 'var(--anyu-dim)',
    letterSpacing: 1.2, textTransform: 'uppercase',
  },
  diffRow: { marginBottom: 8, fontSize: 12 },
  diffBefore: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 },
  diffAfter: { display: 'flex', alignItems: 'center', gap: 8 },
  diffSign: {
    width: 14, height: 14, borderRadius: 4,
    background: 'rgba(184,90,74,.12)', color: '#b85a4a',
    fontFamily: 'var(--anyu-font-mono)', fontSize: 11,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  diffSignAdd: {
    width: 14, height: 14, borderRadius: 4,
    background: 'rgba(111,138,106,.12)', color: '#5a7c52',
    fontFamily: 'var(--anyu-font-mono)', fontSize: 11,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  diffCode: {
    fontFamily: 'var(--anyu-font-mono)',
    fontSize: 11.5, lineHeight: 1.4,
    color: 'var(--anyu-ink)',
  },
  ratioRow: {
    display: 'flex', alignItems: 'center',
    padding: '8px 10px',
    background: 'var(--anyu-card)',
    borderRadius: 8,
    marginBottom: 6,
    border: '1px solid var(--anyu-line)',
  },
  checkRow: { display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  checkBox: {
    width: 16, height: 16, borderRadius: 4,
    background: 'var(--anyu-accent)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginTop: 1,
  },
  checkText: { fontSize: 13, lineHeight: 1.55, color: 'var(--anyu-ink)' },
};

/* =========================================================================
 *  SECTION 02a · Tokens
 * ========================================================================= */
function SectionTokens() {
  const { DCSection, DCArtboard } = window;
  return (
    <DCSection
      id="tokens"
      title="02a · Tokens（顏色 / 字級 / 間距）"
      subtitle="這是 token 的視覺化目錄。配對表是強制的。"
    >
      <DCArtboard id="T1" label="T1 · Color · light" width={520} height={760}>
        <ColorPalette />
      </DCArtboard>
      <DCArtboard id="T2" label="T2 · Color · dark-on-light（配對使用）" width={520} height={760}>
        <ColorDarkPair />
      </DCArtboard>
      <DCArtboard id="T3" label="T3 · Type scale" width={620} height={760}>
        <TypeScale />
      </DCArtboard>
    </DCSection>
  );
}

function ColorPalette() {
  const rows = [
    { name: 'bg',      hex: '#f4efe7', kind: 'surface', usage: 'body bg' },
    { name: 'surface', hex: '#fbf7ef', kind: 'surface', usage: 'chip default / form area' },
    { name: 'card',    hex: '#ffffff', kind: 'surface', usage: '主卡片 / paywall' },
    { name: 'mist',    hex: '#ece2cf', kind: 'surface', usage: 'hint card / progress track' },
    { name: 'ink',     hex: '#2a2419', kind: 'ink',     usage: '主文字（all surfaces above）' },
    { name: 'dim',     hex: 'rgba(42,36,25,.72)', kind: 'ink', usage: '副文字 / hint' },
    { name: 'faint',   hex: 'rgba(42,36,25,.55)', kind: 'ink', usage: '≥ 13px caption only' },
    { name: 'line',    hex: 'rgba(42,36,25,.10)', kind: 'line', usage: 'border / divider' },
    { name: 'accent',  hex: '#b69664', kind: 'accent',  usage: 'CTA / 數字 / hero 1 字（≥ 18px）' },
    { name: 'accent2', hex: '#9b7eb0', kind: 'accent',  usage: '氣氛點綴 · 一頁 ≤ 1 次' },
    { name: 'rose',    hex: '#cd8a78', kind: 'accent',  usage: '溫度漸層尾巴 · 一頁 ≤ 1 次' },
  ];
  return (
    <div style={r.cardWrap}>
      <div style={r.tag}>color tokens · light</div>
      <h3 style={r.h3}>11 個 base tokens</h3>
      <div style={{ height: 16 }} />
      {rows.map(row => (
        <div key={row.name} style={tk.row}>
          <div style={{ ...tk.swatch, background: row.hex.startsWith('rgba') ? `${row.hex}, var(--anyu-bg)` : row.hex, backgroundColor: row.hex }} />
          <div style={tk.rowText}>
            <div style={tk.rowName}>--anyu-{row.name}</div>
            <div style={tk.rowUsage}>{row.usage}</div>
          </div>
          <code style={tk.rowHex}>{row.hex}</code>
        </div>
      ))}
    </div>
  );
}

function ColorDarkPair() {
  const rows = [
    { name: 'ink-dark',     hex: '#1f1a12',                kind: 'surface', usage: 'CTA / 簽名卡 dark / paid sample card' },
    { name: 'ink-onDark',   hex: '#f5ecdd',                kind: 'ink',     usage: '主文字 on ink-dark · 13.8:1' },
    { name: 'dim-onDark',   hex: 'rgba(245,236,221,.78)',  kind: 'ink',     usage: '副文字 on ink-dark · 8.4:1' },
    { name: 'faint-onDark', hex: 'rgba(245,236,221,.55)',  kind: 'ink',     usage: 'caption on ink-dark · 4.7:1' },
    { name: 'line-onDark',  hex: 'rgba(245,236,221,.14)',  kind: 'line',    usage: 'divider on ink-dark' },
  ];
  return (
    <div style={r.cardWrap}>
      <div style={r.tag}>dark surface pair · 配對使用</div>
      <h3 style={r.h3}>用在 light theme 內的「深底元件」</h3>
      <div style={{ height: 8 }} />
      <p style={{ fontSize: 13, color: 'var(--anyu-dim)', lineHeight: 1.7 }}>
        Primary CTA、Paid sample card、Temperature dark variant 都是「light theme 中的 dark surface」。
        在這些位置一律用下方這組配對 token，禁止用 ink (#2a2419) 配 mist alpha。
      </p>
      <div style={{ height: 14 }} />
      {rows.map(row => (
        <div key={row.name} style={tk.row}>
          <div style={{ ...tk.swatch, backgroundColor: row.hex }} />
          <div style={tk.rowText}>
            <div style={tk.rowName}>--anyu-{row.name}</div>
            <div style={tk.rowUsage}>{row.usage}</div>
          </div>
          <code style={tk.rowHex}>{row.hex}</code>
        </div>
      ))}

      <div style={{ height: 20 }} />
      <div style={r.tag}>preview</div>
      <div style={{ height: 8 }} />
      <div style={{
        padding: 18, background: '#1f1a12',
        borderRadius: 12, color: '#f5ecdd',
        fontFamily: 'var(--anyu-font-sans)', fontSize: 14, lineHeight: 1.7,
      }}>
        <div style={{ fontFamily: 'var(--anyu-font-mono)', fontSize: 11, letterSpacing: 1.5, color: 'var(--anyu-accent)' }}>// SAMPLE</div>
        <div style={{ marginTop: 6 }}>「最近你好像在忙；我這週四五有空，你想再聊聊嗎？」</div>
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed rgba(245,236,221,.14)', fontStyle: 'italic', color: 'rgba(245,236,221,.78)', fontSize: 13 }}>
          <span style={{ color: 'var(--anyu-accent)', fontFamily: 'var(--anyu-font-mono)', fontSize: 11, letterSpacing: 1.2, fontStyle: 'normal' }}>為什麼這樣回 ·</span> 把球給回去，但不催。
        </div>
      </div>
    </div>
  );
}

function TypeScale() {
  const rows = [
    { token: 'type-display', size: '30 / 1.35', family: 'serif 500', sample: '他是真的忙，還是其實在冷掉？' },
    { token: 'type-h1',      size: '24 / 1.4',  family: 'serif 500', sample: '看看這段是冷掉還是只是忙。' },
    { token: 'type-h2',      size: '20 / 1.45', family: 'serif 500', sample: '這次不會真的收費。' },
    { token: 'type-h3',      size: '17 / 1.5',  family: 'serif 500', sample: '解鎖一次完整回覆策略' },
    { token: 'type-quote',   size: '17 / 1.6 italic', family: 'serif 400', sample: '「你不是想太多，只是你太會看見細節。」' },
    { token: 'type-body-lg', size: '15 / 1.7',  family: 'sans 400',  sample: '貼上對話或描述情境，AI 幫你讀出關係溫度。' },
    { token: 'type-body',    size: '14 / 1.7',  family: 'sans 400',  sample: '請不要貼姓名 / 電話 / 地址 · 24 小時內刪除。' },
    { token: 'type-caption', size: '13 / 1.65', family: 'sans 400',  sample: '平均回訊延遲 38 分' },
    { token: 'type-label',   size: '11 / 1 mono', family: 'mono 500 uppercase', sample: 'ONE-TIME · NO SUB' },
    { token: 'type-num-xl',  size: '60 / 1 italic', family: 'latin 300', sample: '42' },
    { token: 'type-num-lg',  size: '32 / 1 italic', family: 'latin 300', sample: '42°' },
    { token: 'type-num-md',  size: '24 / 1 italic', family: 'latin 400', sample: 'NT$49' },
  ];
  return (
    <div style={r.cardWrap}>
      <div style={r.tag}>type scale · mobile baseline</div>
      <h3 style={r.h3}>12 個 type tokens · 全走 var()</h3>
      <div style={{ height: 16 }} />
      {rows.map((row, i) => (
        <div key={i} style={tk.typeRow}>
          <div style={tk.typeMeta}>
            <code style={tk.typeMetaCode}>--anyu-{row.token}</code>
            <span style={tk.typeMetaDim}>{row.size} · {row.family}</span>
          </div>
          <div style={typeStyleFromToken(row.token)}>{row.sample}</div>
        </div>
      ))}
    </div>
  );
}

function typeStyleFromToken(token) {
  const base = {
    color: 'var(--anyu-ink)',
    fontFamily: 'var(--anyu-font-sans)',
    fontSize: 14,
    lineHeight: 1.7,
    fontWeight: 400,
    fontStyle: 'normal',
  };
  const map = {
    'type-display': { fontFamily: 'var(--anyu-font-serif)', fontWeight: 500, fontSize: 30, lineHeight: 1.35, letterSpacing: '-0.3px' },
    'type-h1':      { fontFamily: 'var(--anyu-font-serif)', fontWeight: 500, fontSize: 24, lineHeight: 1.4 },
    'type-h2':      { fontFamily: 'var(--anyu-font-serif)', fontWeight: 500, fontSize: 20, lineHeight: 1.45 },
    'type-h3':      { fontFamily: 'var(--anyu-font-serif)', fontWeight: 500, fontSize: 17, lineHeight: 1.5 },
    'type-quote':   { fontFamily: 'var(--anyu-font-serif)', fontStyle: 'italic', fontSize: 17, lineHeight: 1.6 },
    'type-body-lg': { fontFamily: 'var(--anyu-font-sans)', fontSize: 15, lineHeight: 1.7 },
    'type-body':    { fontFamily: 'var(--anyu-font-sans)', fontSize: 14, lineHeight: 1.7 },
    'type-caption': { fontFamily: 'var(--anyu-font-sans)', fontSize: 13, lineHeight: 1.65, color: 'var(--anyu-dim)' },
    'type-label':   { fontFamily: 'var(--anyu-font-mono)', fontWeight: 500, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--anyu-dim)' },
    'type-num-xl':  { fontFamily: 'var(--anyu-font-latin)', fontStyle: 'italic', fontWeight: 300, fontSize: 60, lineHeight: 1, color: 'var(--anyu-accent)' },
    'type-num-lg':  { fontFamily: 'var(--anyu-font-latin)', fontStyle: 'italic', fontWeight: 300, fontSize: 32, lineHeight: 1, color: 'var(--anyu-accent)' },
    'type-num-md':  { fontFamily: 'var(--anyu-font-latin)', fontStyle: 'italic', fontWeight: 400, fontSize: 24, lineHeight: 1, color: 'var(--anyu-accent)' },
  };
  return { ...base, ...map[token] };
}

const tk = {
  row: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 0',
    borderBottom: '1px solid var(--anyu-line)',
  },
  swatch: {
    width: 40, height: 40, borderRadius: 8,
    border: '1px solid var(--anyu-line)', flexShrink: 0,
  },
  rowText: { flex: 1, minWidth: 0 },
  rowName: {
    fontFamily: 'var(--anyu-font-mono)',
    fontSize: 12.5, color: 'var(--anyu-ink)',
    letterSpacing: 0.5,
  },
  rowUsage: {
    marginTop: 2,
    fontFamily: 'var(--anyu-font-sans)',
    fontSize: 12, color: 'var(--anyu-dim)',
    lineHeight: 1.45,
  },
  rowHex: {
    fontFamily: 'var(--anyu-font-mono)',
    fontSize: 11, color: 'var(--anyu-dim)',
    letterSpacing: 0.3,
  },
  typeRow: {
    padding: '14px 0',
    borderBottom: '1px solid var(--anyu-line)',
  },
  typeMeta: {
    display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6,
  },
  typeMetaCode: {
    fontFamily: 'var(--anyu-font-mono)',
    fontSize: 11, color: 'var(--anyu-accent)',
    letterSpacing: 0.3,
  },
  typeMetaDim: {
    fontFamily: 'var(--anyu-font-mono)',
    fontSize: 10, color: 'var(--anyu-faint)',
    letterSpacing: 0.3,
  },
};

/* =========================================================================
 *  SECTION 02b · Components (mini reference)
 * ========================================================================= */
function SectionComponents() {
  const { DCSection, DCArtboard, Chip, PrimaryCTA, Signal } = window;
  return (
    <DCSection
      id="components"
      title="02b · 元件硬規範"
      subtitle="11 個元件 · 每個都有預設、active、disabled 三態。staging 出現過 drift 的標 ★。"
    >
      <DCArtboard id="C1" label="C1 · Chips（★ 修正主區）" width={460} height={620}>
        <ComponentCard title="Situation Chips" diff="staging: transparent + 0.7 alpha 文字 → 看似 disabled">
          <Row label="default">
            <Chip>已讀不回</Chip><Chip>忽冷忽熱</Chip>
          </Row>
          <Row label="hover">
            <Chip>{/* hover 不易示意，靜態為 default */}已讀不回</Chip>
            <span style={{ marginLeft: 4, fontFamily: 'var(--anyu-font-mono)', fontSize: 10, color: 'var(--anyu-dim)' }}>:hover → bg = mist</span>
          </Row>
          <Row label="active">
            <Chip active>回訊變慢但看限動</Chip><Chip>忽冷忽熱</Chip>
          </Row>
          <Row label="disabled">
            <Chip disabled>已讀不回</Chip><Chip disabled>忽冷忽熱</Chip>
          </Row>
          <Spec
            lines={[
              ['padding',       '8px 14px'],
              ['min-height',    '36px (tap area ≥ 44 with margin)'],
              ['radius',        '999 (pill)'],
              ['default bg',    'var(--anyu-surface)  ★ not transparent'],
              ['default text',  'var(--anyu-ink)  (12.5:1)'],
              ['active bg',     'var(--anyu-accent)  (solid)'],
              ['active text',   'var(--anyu-surface)  (5.0:1)'],
            ]}
          />
        </ComponentCard>
      </DCArtboard>

      <DCArtboard id="C2" label="C2 · Buttons" width={460} height={620}>
        <ComponentCard title="Primary CTA" diff="v1.0 ink #2a2419 → v1.1 ink-dark #1f1a12 (更深、更 premium)">
          <Row label="primary">
            <PrimaryCTA>分析我的曖昧溫度</PrimaryCTA>
          </Row>
          <Row label="accent">
            <PrimaryCTA variant="accent">解鎖下一句怎麼回</PrimaryCTA>
          </Row>
          <Row label="ghost">
            <button className="btn btn-ghost" style={{ width: '100%' }}>分享 ↗</button>
          </Row>
          <Row label="disabled">
            <PrimaryCTA disabled>先貼一段對話</PrimaryCTA>
          </Row>
          <Row label="loading">
            <PrimaryCTA loading>—</PrimaryCTA>
          </Row>
          <Spec
            lines={[
              ['primary bg',     'var(--anyu-ink-dark) #1f1a12'],
              ['primary text',   'var(--anyu-ink-onDark) #f5ecdd  (13.8:1)'],
              ['accent bg',      'var(--anyu-accent) #b69664'],
              ['accent text',    'var(--anyu-ink-dark)  ★ 不是 surface (5.4:1)'],
              ['radius',         '14px (lg)'],
              ['font',           'serif 500 15.5 · tracking 0.5'],
            ]}
          />
        </ComponentCard>
      </DCArtboard>

      <DCArtboard id="C3" label="C3 · Signals（★ 修正主區）" width={460} height={620}>
        <ComponentCard title="Observed Signal" diff="staging: 包進白卡 + dim 文字 → 像 disabled list。v1.1：不包卡，全 ink。">
          <div style={{ marginTop: 12 }}>
            <Signal label="主動度"    value={28} hint="多半你先開話題" />
            <Signal label="即時性"    value={45} hint="平均回訊延遲 38 分" />
            <Signal label="情緒投入" value={35} hint="短句多、提問少" />
          </div>
          <Spec
            lines={[
              ['container',      '無 bg · 直接在 page 上'],
              ['label color',    'var(--anyu-ink)  ★ 不是 dim'],
              ['value color',    'var(--anyu-ink) mono  ★ 不是 accent'],
              ['hint color',     'var(--anyu-dim) italic'],
              ['bar bg',         'var(--anyu-line)  ★ 不是 mist（在 bg 上）'],
              ['bar fill',       'var(--anyu-accent)'],
            ]}
          />
        </ComponentCard>
      </DCArtboard>

      <DCArtboard id="C4" label="C4 · Cards Inventory" width={620} height={620}>
        <ComponentCard title="Card 等級表" diff="">
          <table style={ck.table}>
            <thead><tr>
              <th style={ck.th}>等級</th><th style={ck.th}>bg</th><th style={ck.th}>radius</th><th style={ck.th}>shadow</th><th style={ck.th}>用途</th>
            </tr></thead>
            <tbody>
              <tr style={ck.tr}><td style={ck.td}>plain hint</td><td style={ck.td}>mist</td><td style={ck.td}>md 10</td><td style={ck.td}>—</td><td style={ck.td}>quote / privacy bar</td></tr>
              <tr style={ck.tr}><td style={ck.td}>card</td><td style={ck.td}>card</td><td style={ck.td}>xl 18</td><td style={ck.td}>sm</td><td style={ck.td}>input / insight</td></tr>
              <tr style={ck.tr}><td style={ck.td}>signature</td><td style={ck.td}>card</td><td style={ck.td}>2xl 20</td><td style={ck.td}>lg + glow</td><td style={ck.td}>temperature</td></tr>
              <tr style={ck.tr}><td style={ck.td}>dark sample</td><td style={ck.td}>ink-dark</td><td style={ck.td}>lg 14</td><td style={ck.td}>—</td><td style={ck.td}>paid card A</td></tr>
              <tr style={ck.tr}><td style={ck.td}>locked</td><td style={ck.td}>card</td><td style={ck.td}>lg 14</td><td style={ck.td}>sm</td><td style={ck.td}>paid card B/C</td></tr>
              <tr style={ck.tr}><td style={ck.td}>paywall</td><td style={ck.td}>card</td><td style={ck.td}>lg 14</td><td style={ck.td}>lg + accent-45 border</td><td style={ck.td}>NT$49 row</td></tr>
              <tr style={ck.tr}><td style={ck.td}>share</td><td style={ck.td}>gradient</td><td style={ck.td}>3xl 24</td><td style={ck.td}>xl</td><td style={ck.td}>截圖卡 (4:5)</td></tr>
            </tbody>
          </table>
        </ComponentCard>
      </DCArtboard>
    </DCSection>
  );
}

function ComponentCard({ title, diff, children }) {
  return (
    <div style={ck.wrap}>
      <div style={r.tag}>component spec</div>
      <h3 style={r.h3}>{title}</h3>
      {diff && (
        <div style={{ marginTop: 8, fontSize: 12.5, lineHeight: 1.7, color: 'var(--anyu-dim)', fontStyle: 'italic' }}>
          {diff}
        </div>
      )}
      <div style={{ height: 14 }} />
      {children}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={ck.row}>
      <div style={ck.rowLabel}>{label}</div>
      <div style={ck.rowChildren}>{children}</div>
    </div>
  );
}

function Spec({ lines }) {
  return (
    <div style={ck.spec}>
      {lines.map(([k, v], i) => (
        <div key={i} style={ck.specLine}>
          <code style={ck.specKey}>{k}</code>
          <code style={ck.specVal}>{v}</code>
        </div>
      ))}
    </div>
  );
}

const ck = {
  wrap: {
    width: '100%', height: '100%', boxSizing: 'border-box',
    padding: 32,
    background: 'var(--anyu-surface)',
    fontFamily: 'var(--anyu-font-sans)',
    color: 'var(--anyu-ink)',
    overflow: 'hidden',
  },
  row: {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '8px 0',
    minHeight: 44,
  },
  rowLabel: {
    width: 70, flexShrink: 0,
    fontFamily: 'var(--anyu-font-mono)',
    fontSize: 10, letterSpacing: 1.5,
    color: 'var(--anyu-dim)',
    textTransform: 'uppercase',
  },
  rowChildren: { display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', flex: 1 },
  spec: {
    marginTop: 14,
    padding: 14,
    background: 'var(--anyu-card)',
    border: '1px solid var(--anyu-line)',
    borderRadius: 10,
  },
  specLine: {
    display: 'flex', alignItems: 'baseline', gap: 12,
    padding: '4px 0',
  },
  specKey: {
    width: 100, flexShrink: 0,
    fontFamily: 'var(--anyu-font-mono)',
    fontSize: 11, color: 'var(--anyu-dim)',
  },
  specVal: {
    fontFamily: 'var(--anyu-font-mono)',
    fontSize: 11.5, color: 'var(--anyu-ink)',
    lineHeight: 1.5,
  },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: 6 },
  th: {
    textAlign: 'left', padding: '8px 10px',
    fontFamily: 'var(--anyu-font-mono)',
    fontSize: 10, letterSpacing: 1.2,
    color: 'var(--anyu-dim)',
    borderBottom: '1px solid var(--anyu-line)',
    textTransform: 'uppercase',
  },
  tr: { borderBottom: '1px solid var(--anyu-line)' },
  td: {
    padding: '10px',
    fontFamily: 'var(--anyu-font-mono)',
    fontSize: 11.5, color: 'var(--anyu-ink)',
    lineHeight: 1.5,
  },
};

Object.assign(window, { SectionIntro, SectionTokens, SectionComponents });
