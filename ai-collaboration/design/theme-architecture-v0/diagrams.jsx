// =============================================================
// 暗語 ANYU · Theme Architecture · Strategy diagrams & panels
// =============================================================
// The written backbone of the proposal, rendered as editorial panels
// on the canvas. Riso doc-chrome (thick ink, mono labels, offset shadow).
// =============================================================

const D_INK = '#1a1626', D_DIM = 'rgba(26,22,38,.78)', D_FAINT = 'rgba(26,22,38,.5)';
const D_HAIR = 'rgba(26,22,38,.14)', D_BG = '#faf6ee', D_CARD = '#fffdf8';
const D_ACC = '#5b3aa3', D_ACC2 = '#ec4e8c';
const M01 = '#5b3aa3', M02 = '#2b5e86', M02B = '#1f8a5b';
const FS = 'var(--anyu-font-serif)', FN = 'var(--anyu-font-sans)', FM = 'var(--anyu-font-mono)', FL = 'var(--anyu-font-latin)';

function Kicker({ n, name, color = D_ACC }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
      {n && <span style={{ fontFamily: FL, fontStyle: 'italic', fontWeight: 700, fontSize: 20, color: D_ACC2 }}>{n}</span>}
      <span style={{ fontFamily: FM, fontSize: 11, fontWeight: 700, letterSpacing: 1.6, color, textTransform: 'uppercase' }}>{name}</span>
    </div>
  );
}
function H({ children, size = 24 }) {
  return <div style={{ fontFamily: FS, fontWeight: 500, fontSize: size, lineHeight: 1.3, letterSpacing: '-0.4px', color: D_INK }}>{children}</div>;
}
function P({ children, style }) {
  return <p style={{ fontFamily: FN, fontSize: 13.5, lineHeight: 1.8, color: D_DIM, margin: '10px 0 0', ...style }}>{children}</p>;
}
function Panel({ children, w = '100%', pad = '34px 38px', shadow = D_ACC, style }) {
  return <div style={{ width: w, boxSizing: 'border-box', background: D_CARD, border: `1.5px solid ${D_INK}`, boxShadow: `5px 5px 0 ${shadow}`, padding: pad, ...style }}>{children}</div>;
}
function Tag({ children, color = D_INK, fill }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FM, fontWeight: 700, fontSize: 9.5, letterSpacing: 1, textTransform: 'uppercase', padding: '3px 8px', border: `1.5px solid ${color}`, background: fill ? color : 'transparent', color: fill ? '#fff' : color }}>{children}</span>;
}

// ===========================================================================
// 1 · Mental model — the Theme Park
// ===========================================================================
function MentalModel() {
  const Land = ({ name, sub, color, motifFilled }) => (
    <div style={{ flex: 1, background: '#fff', border: `2px solid ${color}`, boxShadow: `4px 4px 0 ${color}`, padding: '16px 16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 26, height: 26, borderRadius: '50%', border: `1.5px solid ${color}`, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: motifFilled ? color : 'transparent', border: `1.5px solid ${color}` }} />
        </span>
        <span style={{ fontFamily: FM, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.2, color, textTransform: 'uppercase' }}>{sub}</span>
      </div>
      <div style={{ marginTop: 12, fontFamily: FS, fontSize: 17, fontWeight: 500, color: D_INK }}>{name}</div>
      <div style={{ marginTop: 10, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {['輸入', '結果', '付款', '等待', '報告', '連結'].map(s => (
          <span key={s} style={{ fontFamily: FN, fontSize: 10.5, color: '#fff', background: color, padding: '3px 7px' }}>{s}</span>
        ))}
      </div>
      <div style={{ marginTop: 11, fontFamily: FN, fontSize: 11.5, color: D_DIM, lineHeight: 1.55 }}>整段旅程都待在這個世界裡。</div>
    </div>
  );
  return (
    <Panel w={1080} pad="38px 44px">
      <Kicker n="01" name="Design Philosophy · 心智模型" />
      <H size={30}>主站是統一的園區入口；<br/>每個模組是一座沉浸式主題園區。</H>
      <P style={{ maxWidth: 760 }}>不要再把「主題」當成頁面層級的變化。把它當成<b style={{ color: D_INK }}>空間</b>：暗語 ANYU 是整座園區，有共同的識別與入口；每個模組是一塊主題園區，氣味、顏色、motif 完全沉浸。一旦使用者走進某塊園區，從輸入到付款到拿到報告，整段都待在那個世界裡 —— 不會走兩步就被丟回一條沒有裝潢的走廊。</P>

      {/* the park */}
      <div style={{ marginTop: 26, border: `1.5px dashed ${D_INK}`, background: D_BG, padding: '20px 22px 24px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: -11, left: 22, background: D_BG, padding: '0 10px', fontFamily: FM, fontSize: 10, fontWeight: 700, letterSpacing: 1.4, color: D_INK, textTransform: 'uppercase' }}>暗語 ANYU · Core Shell（園區與入口）</div>
        {/* entrance */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: D_CARD, border: `1px solid ${D_HAIR}`, marginBottom: 18 }}>
          <span style={{ fontFamily: FM, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.2, color: D_FAINT, textTransform: 'uppercase' }}>入口 · 中性 editorial</span>
          <span style={{ flex: 1 }} />
          {['首頁', '模組總覽', '隱私 / 退款 / 支援', '（未來）會員'].map(s => (
            <span key={s} style={{ fontFamily: FN, fontSize: 11, color: D_DIM, border: `1px solid ${D_HAIR}`, padding: '3px 9px' }}>{s}</span>
          ))}
        </div>
        {/* lands */}
        <div style={{ display: 'flex', gap: 18, alignItems: 'stretch' }}>
          <Land name="曖昧溫度計" sub="Module 01 · Riso World" color={M01} motifFilled />
          <Land name="職場暗流雷達" sub="Module 02 · Radar World" color={M02} />
          <div style={{ flex: 0.8, border: `1.5px dashed ${D_HAIR}`, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 14 }}>
            <span style={{ fontFamily: FN, fontSize: 12, color: D_FAINT, lineHeight: 1.6 }}>Module 03+<br/>同樣的殼，<br/>新的主題包</span>
          </div>
        </div>
      </div>

      {/* external */}
      <div style={{ marginTop: 18, display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 280, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Tag color={D_FAINT}>External</Tag>
          <P style={{ margin: 0, fontSize: 12.5 }}>藍新（NewebPay）是園區外的第三方櫃檯 —— 無法套主題，這沒關係。關鍵是它<b style={{ color: D_INK }}>前後</b>的 ANYU 頁面（橋接、等待）都還在園區內，使用者只是短暫出去刷卡，馬上回到同一個世界。</P>
        </div>
        <div style={{ flex: 1, minWidth: 280, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Tag color={D_ACC} >Rule</Tag>
          <P style={{ margin: 0, fontSize: 12.5 }}>一個模組不混多種主題。視覺撕裂感幾乎都來自「強主題 → 淡雅 generic → 強主題」的來回。把整段旅程鎖在一個世界，撕裂就消失了。</P>
        </div>
      </div>
    </Panel>
  );
}

// ===========================================================================
// 2 · Route classification
// ===========================================================================
function RouteClasses() {
  const Col = ({ group, color, title, routes, controls, fill }) => (
    <div style={{ flex: 1, minWidth: 280, background: fill || '#fff', border: `1.5px solid ${D_INK}`, boxShadow: `4px 4px 0 ${color}`, padding: '20px 20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: FL, fontStyle: 'italic', fontWeight: 700, fontSize: 22, color }}>{group}</span>
        <span style={{ fontFamily: FS, fontSize: 16, fontWeight: 500, color: D_INK }}>{title}</span>
      </div>
      <div style={{ marginTop: 14, display: 'grid', gap: 6 }}>
        {routes.map(r => (
          <div key={r} style={{ fontFamily: FM, fontSize: 11, color: D_INK, background: D_BG, border: `1px solid ${D_HAIR}`, padding: '5px 9px' }}>{r}</div>
        ))}
      </div>
      <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1.5px dashed ${D_HAIR}`, display: 'grid', gap: 9 }}>
        {controls.map(([k, v]) => (
          <div key={k}>
            <div style={{ fontFamily: FM, fontSize: 9, fontWeight: 700, letterSpacing: 1, color, textTransform: 'uppercase' }}>{k}</div>
            <div style={{ marginTop: 3, fontFamily: FN, fontSize: 12, color: D_DIM, lineHeight: 1.55 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <Panel w={1180} pad="34px 40px">
      <Kicker n="02" name="Route / Surface Classification · 路由分類" />
      <H size={26}>把每一條 ANYU 路由，歸進三種世界其中一種。</H>
      <div style={{ marginTop: 24, display: 'flex', gap: 18, alignItems: 'stretch', flexWrap: 'wrap' }}>
        <Col group="A" color={D_INK} title="Site / Core Shell"
          routes={['/  首頁', '/modules  模組總覽', '/legal · /refund · /support', '（未來）/account 會員']}
          controls={[['Controlled by', 'ANYU Core Shell（中性 editorial）'], ['Shared', '字體、間距、wordmark、信任語言'], ['Module-specific', '無 —— 模組只以小色塊預覽'], ['Neutral', '整層保持安靜，不被任一模組主導']]} />
        <Col group="B" color={M01} title="Module Journey" fill="#fff"
          routes={['/m/ai-temperature  輸入', 'result  結果', 'checkout-start  橋接', 'ReturnURL  等待', 'paid result  報告交付', '/r/…  連結返回', 'LINE bind · Email save', 'expired / invalid（已知模組時）']}
          controls={[['Controlled by', '該模組 Theme Pack（Module 01 = Riso）'], ['Shared', '版面骨架 + Shared Flow Templates'], ['Module-specific', 'accent / motif / 語言 / 情緒'], ['Neutral', '不允許 —— 全段沉浸在模組世界']]} />
        <Col group="C" color={D_FAINT} title="External Provider" fill={D_BG}
          routes={['NewebPay 藍新付款頁']}
          controls={[['Controlled by', '藍新（第三方，無法套主題）'], ['Shared', '不適用'], ['Module-specific', '不適用'], ['Neutral', '保持原樣；用前後的橋接頁包住它']]} />
      </div>
    </Panel>
  );
}

// ===========================================================================
// 3 · Theme architecture — 4 layers
// ===========================================================================
function ArchLayers() {
  const Layer = ({ n, name, en, color, scope, owns, fill }) => (
    <div style={{ display: 'flex', gap: 0, alignItems: 'stretch', border: `1.5px solid ${D_INK}`, background: fill || '#fff', boxShadow: `4px 4px 0 ${color}` }}>
      <div style={{ width: 200, flex: '0 0 200px', padding: '16px 18px', borderRight: `1.5px solid ${D_INK}`, background: color, color: '#fff' }}>
        <div style={{ fontFamily: FL, fontStyle: 'italic', fontWeight: 700, fontSize: 20 }}>{n}</div>
        <div style={{ marginTop: 6, fontFamily: FS, fontSize: 16, fontWeight: 500 }}>{name}</div>
        <div style={{ marginTop: 3, fontFamily: FM, fontSize: 9, fontWeight: 700, letterSpacing: 1, opacity: 0.85, textTransform: 'uppercase' }}>{en}</div>
      </div>
      <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontFamily: FN, fontSize: 12.5, color: D_INK, lineHeight: 1.6 }}><b>範圍 · </b>{scope}</div>
        <div style={{ marginTop: 7, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {owns.map(o => <span key={o} style={{ fontFamily: FM, fontSize: 10, color: color, border: `1px solid ${color}66`, background: color + '12', padding: '3px 8px' }}>{o}</span>)}
        </div>
      </div>
    </div>
  );
  return (
    <Panel w={1080} pad="34px 40px">
      <Kicker n="03" name="Theme Architecture · 四層結構" />
      <H size={26}>四層：哪一層擁有什麼，界線清楚。</H>
      <P style={{ maxWidth: 720 }}>由外到內：Core Shell 是園區；Module Shell 是進入某模組後的結構外殼；Theme Pack 是換得掉的皮；Shared Flow Templates 是所有模組共用、但會被主題上色的骨架。越外層越穩定，越內層越可換。</P>
      <div style={{ marginTop: 24, display: 'grid', gap: 14 }}>
        <Layer n="L1" name="ANYU Core Shell" en="Park frame" color={D_INK}
          scope="主站品牌外框：首頁、模組總覽、法務 / 支援、未來會員。"
          owns={['品牌 wordmark', '中性 editorial', '全域導覽 / footer', '法務語言']} />
        <Layer n="L2" name="Module Shell" en="Structural wrapper" color={'#4a3d72'}
          scope="進入某模組後的結構外殼：navbar 行為、頁面骨架、滾動模型、安全區。"
          owns={['頁面 scaffold', 'navbar / 返回', '單欄滾動模型', 'safe-area']} />
        <Layer n="L3" name="Module Theme Pack" en="The swappable skin" color={M01}
          scope="一個模組的整套感官：顏色、紋理、字體口音、icon / motif、動態、卡片風格、背景系統。"
          owns={['accent / accent2 / rose', 'motif（月相 / 雷達）', '紋理 / bleed', '狀態語言 / CTA 質感']} />
        <Layer n="L4" name="Shared Flow Templates" en="Themeable skeletons" color={'#7a5a86'}
          scope="跨模組共用的流程骨架，結構固定、被 Theme Pack 上色：付款橋接、等待、報告交付、連結保存、LINE 綁定、過期、支援。"
          owns={['結構共用', 'token 上色', '信任 / 無障礙固定']} />
      </div>
    </Panel>
  );
}

// ===========================================================================
// 4 · Shared Flow Templates
// ===========================================================================
function SharedTemplates() {
  const rows = [
    ['AccessLinkSaveTemplate', '連結保存（Email / LINE）', '欄位結構、consent、隱私語言', 'accent / motif / 標題口吻', 'PII 提示、不寄電子報聲明'],
    ['CheckoutStart / PaymentBridge', '前往藍新的橋接頁', 'stepper、訂單摘要、信任聲明', 'accent / hook / motif', 'NT$49 · 一次性 · 藍新字樣'],
    ['ReturnURLWaiting', '等待藍新通知', '「收到了」+ 三步 + 無 primary CTA', 'motif 進度 / 狀態語言', '「以藍新通知為準」'],
    ['PaidResultDelivery', '報告交付封面（zine cover）', '封面框 + 開啟 CTA + INSIDE', 'persona / 讀數 / 金句 / motif', '網頁交付 · 連結有保留期限'],
    ['LineBindTemplate', 'LINE 綁定 / 接收連結', '說明 + 你會收到 + 綁定 / 略過', 'accent / 文案口吻', '只送連結、可解除聲明'],
    ['ExpiredAccessLink', '連結過期', 'error 狀態 + 補發 / 重來', 'motif error 態 / rose', '補發 3–7 天 · email'],
    ['SupportStateTemplate', '支援 / 退款 / 客訴', '政策條列 + 聯絡 + 處理時間', 'accent 點綴', '退款條款、處理時效'],
  ];
  return (
    <Panel w={1180} pad="34px 40px">
      <Kicker n="04" name="Shared Flow Templates · 共用流程模板" />
      <H size={26}>七個共用模板：結構共用，主題上色，信任不動。</H>
      <div style={{ marginTop: 22, border: `1.5px solid ${D_INK}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1.1fr 1.5fr 1.3fr 1.3fr', background: D_INK, color: '#fff' }}>
          {['Template', '用途', '結構共用（不動）', 'Theme tokens 換', '為信任 / 無障礙固定'].map(h => (
            <div key={h} style={{ padding: '10px 12px', fontFamily: FM, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>{h}</div>
          ))}
        </div>
        {rows.map((r, i) => (
          <div key={r[0]} style={{ display: 'grid', gridTemplateColumns: '1.3fr 1.1fr 1.5fr 1.3fr 1.3fr', background: i % 2 ? D_BG : '#fff', borderTop: `1px solid ${D_HAIR}` }}>
            <div style={{ padding: '11px 12px', fontFamily: FM, fontSize: 11, fontWeight: 700, color: D_ACC, lineHeight: 1.4 }}>{r[0]}</div>
            <div style={{ padding: '11px 12px', fontFamily: FN, fontSize: 12, color: D_INK, lineHeight: 1.5 }}>{r[1]}</div>
            <div style={{ padding: '11px 12px', fontFamily: FN, fontSize: 12, color: D_DIM, lineHeight: 1.5 }}>{r[2]}</div>
            <div style={{ padding: '11px 12px', fontFamily: FN, fontSize: 12, color: D_DIM, lineHeight: 1.5 }}>{r[3]}</div>
            <div style={{ padding: '11px 12px', fontFamily: FN, fontSize: 12, color: D_DIM, lineHeight: 1.5 }}>{r[4]}</div>
          </div>
        ))}
      </div>
      <P style={{ fontSize: 12.5 }}>換模組 = 用一個 <code style={{ fontFamily: FM, color: D_ACC, background: '#fff', border: `1px solid ${D_HAIR}`, padding: '1px 5px' }}>ModuleAccentScope</code> 包住模板，再給一個 motif。最右欄的東西永遠不變 —— 那是信任與無障礙的地基。</P>
    </Panel>
  );
}

// ===========================================================================
// 5 · Token system
// ===========================================================================
function TokenSystem() {
  const Sw = ({ c }) => <span style={{ display: 'inline-block', width: 13, height: 13, borderRadius: 3, border: `1.5px solid ${D_INK}`, background: c, verticalAlign: 'middle', marginRight: 7 }} />;
  const coreRows = [['typography', 'Noto Serif / Sans TC · Fraunces · Space Mono'], ['spacing', '4pt base · gutter 24 · max 440'], ['radius', 'sharp 2–4px'], ['focus state', '3px accent glow ring'], ['layout max width', '440 (mobile-first)'], ['motion', '≤ 700ms · reduced-motion 尊重'], ['base neutral', 'cream paper #faf6ee · ink #1a1626']];
  const modRows = [['module background', 'paper tint / bleed 紋理'], ['module surface', 'input bed / card'], ['module accent', 'M01 群青 #5b3aa3 · M02 鋼藍 #2b5e86', [M01, M02]], ['module accent2', 'M01 洋紅 #ec4e8c · M02 訊號綠 #1f8a5b', [D_ACC2, M02B]], ['module border / shadow', 'thick ink + 彩色 offset'], ['module texture', 'halftone / stripe'], ['module motif', '月相顯影 / 雷達掃描'], ['module CTA / status', '按鈕陰影色 + 狀態語言']];
  return (
    <Panel w={920} pad="34px 40px">
      <Kicker n="05" name="Design Tokens · 兩層 token" />
      <H size={26}>Core tokens 穩定；Module tokens 換膚。</H>
      <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <div style={{ fontFamily: FM, fontSize: 10, fontWeight: 700, letterSpacing: 1.4, color: D_INK, textTransform: 'uppercase', marginBottom: 10 }}>● Core tokens · 跨模組不動</div>
          <div style={{ border: `1.5px solid ${D_INK}` }}>
            {coreRows.map((r, i) => (
              <div key={r[0]} style={{ display: 'flex', gap: 10, padding: '9px 12px', background: i % 2 ? D_BG : '#fff', borderTop: i ? `1px solid ${D_HAIR}` : 'none' }}>
                <span style={{ flex: '0 0 116px', fontFamily: FM, fontSize: 10.5, fontWeight: 700, color: D_ACC }}>{r[0]}</span>
                <span style={{ fontFamily: FN, fontSize: 11.5, color: D_DIM, lineHeight: 1.5 }}>{r[1]}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontFamily: FM, fontSize: 10, fontWeight: 700, letterSpacing: 1.4, color: M01, textTransform: 'uppercase', marginBottom: 10 }}>● Module tokens · 每模組換</div>
          <div style={{ border: `1.5px solid ${D_INK}` }}>
            {modRows.map((r, i) => (
              <div key={r[0]} style={{ display: 'flex', gap: 10, padding: '9px 12px', background: i % 2 ? D_BG : '#fff', borderTop: i ? `1px solid ${D_HAIR}` : 'none' }}>
                <span style={{ flex: '0 0 130px', fontFamily: FM, fontSize: 10, fontWeight: 700, color: M01 }}>{r[0]}</span>
                <span style={{ fontFamily: FN, fontSize: 11.5, color: D_DIM, lineHeight: 1.5 }}>{r[2] && r[2].map(c => <Sw key={c} c={c} />)}{r[1]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

// ===========================================================================
// 6 · Direction options A / B / C
// ===========================================================================
function Directions() {
  const Card = ({ id, name, desc, str, weak, eng, risk, pick }) => (
    <div style={{ flex: 1, minWidth: 300, background: pick ? '#fff' : D_BG, border: `1.5px solid ${D_INK}`, boxShadow: pick ? `5px 5px 0 ${D_ACC}` : `4px 4px 0 ${D_HAIR}`, padding: '22px 22px 24px', position: 'relative' }}>
      {pick && <span style={{ position: 'absolute', top: -12, right: 18, fontFamily: FM, fontWeight: 700, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#fff', background: D_ACC, padding: '4px 10px' }}>推薦</span>}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontFamily: FL, fontStyle: 'italic', fontWeight: 700, fontSize: 26, color: pick ? D_ACC : D_FAINT }}>{id}</span>
        <span style={{ fontFamily: FS, fontSize: 17, fontWeight: 500, color: D_INK }}>{name}</span>
      </div>
      <P style={{ fontSize: 12.5, marginTop: 8 }}>{desc}</P>
      <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
        {[['＋ 強', str], ['－ 弱', weak], ['⚙ 工程', eng], ['⚠ 風險', risk]].map(([k, v]) => (
          <div key={k} style={{ position: 'relative', paddingLeft: 64, fontFamily: FN, fontSize: 12, color: D_DIM, lineHeight: 1.55 }}>
            <span style={{ position: 'absolute', left: 0, top: 1, fontFamily: FM, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, color: D_FAINT, textTransform: 'uppercase' }}>{k}</span>
            {v}
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <Panel w={1180} pad="34px 40px">
      <Kicker n="06" name="Direction Options · 三個方向" />
      <H size={26}>三種力道，一個推薦。</H>
      <div style={{ marginTop: 22, display: 'flex', gap: 18, alignItems: 'stretch', flexWrap: 'wrap' }}>
        <Card id="A" name="Strong Module Immersion" desc="每個模組完全自由發展視覺，主站幾乎隱形。" str="模組沉浸感最強、最有個性。" weak="主站身份稀薄；模組各做各的，難維護。" eng="高 —— 每模組重做大量 UI。" risk="高 —— 跨模組一致性容易崩。" />
        <Card id="B" name="Core Shell Dominant" desc="主站系統很強，模組只能在窄框內微調顏色。" str="一致性最好、最好維護。" weak="模組之間差異太小，失去沉浸與記憶點。" eng="低。" risk="低 —— 但換來平淡。" />
        <Card id="C" name="Hybrid Theme Park" pick desc="共用 Core Shell + Module Shell + Shared Flow Templates；模組透過 Theme Pack 完整換膚，但骨架與信任層共用。" str="沉浸 + 一致兼得；換模組只換一層皮。" weak="需要前期把模板抽乾淨（一次性投資）。" eng="中 —— 模板抽好後，新模組成本很低。" risk="低 —— 信任 / 結構鎖在共用層。" />
      </div>
    </Panel>
  );
}

// ===========================================================================
// 7 · Recommendation + first implementation
// ===========================================================================
function Recommendation() {
  return (
    <Panel w={1080} pad="36px 44px" shadow={D_ACC}>
      <Kicker n="07" name="Recommended Direction · 最終建議" />
      <H size={30}>採用 Direction C — Hybrid Theme Park。</H>
      <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26 }}>
        <div>
          <div style={{ fontFamily: FM, fontSize: 10, fontWeight: 700, letterSpacing: 1.4, color: D_ACC, textTransform: 'uppercase' }}>為什麼適合 ANYU</div>
          <P style={{ fontSize: 13 }}>ANYU 不是一堆孤立的 AI 測驗，而是一個 AI-native 的個人洞察系統。Hybrid 模型讓每個模組都是獨立、沉浸的世界，卻共享同一座園區 —— 這正是產品定位的視覺翻譯。</P>
          <div style={{ marginTop: 16, fontFamily: FM, fontSize: 10, fontWeight: 700, letterSpacing: 1.4, color: D_ACC, textTransform: 'uppercase' }}>怎麼解決付款 / 連結撕裂</div>
          <P style={{ fontSize: 13 }}>撕裂來自「強 Riso → 淡雅 generic → 強 Riso」。把 checkout、ReturnURL、報告交付、/r/ 返回、LINE / Email 連結都納入 Shared Flow Templates，再以 Module 01 的 Theme Pack 上色 —— 整段付款旅程都在 Riso 世界裡，藍新只是短暫的外部櫃檯。</P>
        </div>
        <div>
          <div style={{ fontFamily: FM, fontSize: 10, fontWeight: 700, letterSpacing: 1.4, color: D_ACC, textTransform: 'uppercase' }}>怎麼擴展到 Module 02+</div>
          <P style={{ fontSize: 13 }}>新模組 = 一組 Theme Pack（3 個顏色 + 1 個 motif + 一套狀態語言）。模板、付款、信任全部沿用。Module 02 雷達預覽已證明：同一段殼換成鋼藍 / 訊號綠 + 雷達掃描，毫無重工。</P>
          <div style={{ marginTop: 16, fontFamily: FM, fontSize: 10, fontWeight: 700, letterSpacing: 1.4, color: D_ACC, textTransform: 'uppercase' }}>先做什麼 · First</div>
          <div style={{ marginTop: 10, display: 'grid', gap: 9 }}>
            {['抽出 Shared Flow Templates（付款 6 態 + 連結保存）', '把 Module 01 全部 owned 頁面套上 Riso Theme Pack', '移除 Module 01 內殘留的 generic / elegant 樣式', 'Core Shell 收斂為中性 editorial（首頁 / 總覽 / 法務）'].map((t, i) => (
              <div key={i} style={{ position: 'relative', paddingLeft: 24, fontFamily: FN, fontSize: 12.5, color: D_DIM, lineHeight: 1.55 }}>
                <span style={{ position: 'absolute', left: 0, top: -1, fontFamily: FL, fontStyle: 'italic', fontWeight: 700, fontSize: 15, color: D_ACC2 }}>{i + 1}</span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

// ===========================================================================
// 8 · Handoff + acceptance criteria + constraints
// ===========================================================================
function HandoffAcceptance() {
  const Col = ({ title, items, color = D_ACC, ok }) => (
    <div style={{ flex: 1, minWidth: 280 }}>
      <div style={{ fontFamily: FM, fontSize: 10, fontWeight: 700, letterSpacing: 1.4, color, textTransform: 'uppercase', marginBottom: 12 }}>{title}</div>
      <div style={{ display: 'grid', gap: 10 }}>
        {items.map((t, i) => (
          <div key={i} style={{ position: 'relative', paddingLeft: 18, fontFamily: FN, fontSize: 12.5, color: D_DIM, lineHeight: 1.6 }}>
            <span style={{ position: 'absolute', left: 0, top: 0, color }}>{ok ? '✓' : '·'}</span>
            {t}
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <Panel w={1180} pad="34px 40px">
      <Kicker n="08" name="Handoff & Acceptance · 交付與驗收" />
      <H size={26}>給 Codex 的實作順序，與「做完了」的定義。</H>
      <div style={{ marginTop: 22, display: 'flex', gap: 30, flexWrap: 'wrap' }}>
        <Col title="先更新哪些 Module 01 頁" items={['checkout-start（最容易斷裂）', 'ReturnURL waiting', 'paid result 交付', '/r/ 連結返回', 'LINE bind · Email save', 'expired / invalid 連結']} />
        <Col title="先抽 / 主題化哪些模板" items={['PaymentBridge + ReturnURLWaiting 先抽', 'AccessLinkSave（Email / LINE）共用', 'PaidResultDelivery 封面元件', 'ModuleAccentScope + motif 介面定案']} />
        <Col title="保持不動 / 不要做" items={['不主題化藍新 NewebPay 外部頁', 'NT$49 · 一次性 · 藍新字樣不動', 'Email / LINE 只送連結，不送報告全文', '不假設會員系統存在', '不上重到擋住迭代的設計系統']} />
      </div>
      <div style={{ marginTop: 26, paddingTop: 22, borderTop: `1.5px solid ${D_INK}`, display: 'flex', gap: 30, flexWrap: 'wrap' }}>
        <Col color={'#4f7d56'} ok title="Acceptance · 驗收（done 的定義）" items={['進入 Module 01 後，回到主站前不會看到任何非 Riso 的 ANYU 頁。', '桌機 / 手機的 checkout-start 都像 Module 01。', 'ReturnURL waiting 像 Module 01，不像 generic SaaS。', '/r/ 連結返回像 Module 01。']} />
        <Col color={'#4f7d56'} ok title="" items={['法務 / 支援 / 首頁維持 Core Shell，不被 Module 01 染色。', 'Module 02 能換主題，而不動付款 / 連結模板結構。', '所有付款 / 連結狀態維持清楚的信任與可讀對比。', '行動優先；safe-area、44px 點擊、reduced-motion 都顧到。']} />
      </div>
    </Panel>
  );
}

Object.assign(window, {
  MentalModel, RouteClasses, ArchLayers, SharedTemplates,
  TokenSystem, Directions, Recommendation, HandoffAcceptance,
});
