// =============================================================
// 暗語 ANYU · Theme Architecture · Core Shell (main site) screens
// =============================================================
// The shared ANYU identity: homepage, module gallery, legal/support.
//
// VISUAL STRATEGY — Core Shell is the QUIET layer:
//   · same cream paper + serif/mono/latin type + wordmark + grain (shared DNA)
//   · BUT hairline rules + air + ink/neutral only — NO thick-ink offset cards,
//     NO single dominant accent. Module color shows only as small swatches.
//   · Module worlds (Riso etc.) are the LOUD layer: thick ink, offset shadow,
//     full accent immersion.
// That intensity gap is what makes "theme park": same park, louder lands.
// =============================================================

const CORE_INK = '#1a1626';
const CORE_DIM = 'rgba(26,22,38,.72)';
const CORE_FAINT = 'rgba(26,22,38,.45)';
const CORE_HAIR = 'rgba(26,22,38,.14)';
const CORE_BG = '#faf6ee';
const CORE_CARD = '#fffdf8';

const MODULES = [
  { id: '01', zh: '曖昧溫度計', en: 'Ai-Temperature', hook: '他是真的忙，還是其實在冷掉？', accent: '#5b3aa3', motif: 'moon', status: 'live', statusLabel: '上線中' },
  { id: '02', zh: '職場暗流雷達', en: 'Undercurrent-Radar', hook: '這場會議真正的訊號，是什麼？', accent: '#2b5e86', motif: 'radar', status: 'soon', statusLabel: '即將上線' },
  { id: '03', zh: '伴侶價值觀雷達', en: 'Values-Radar', hook: '你們要的，是同一種未來嗎？', accent: '#7d8c7d', motif: 'moon', status: 'soon', statusLabel: '規劃中' },
];

function CoreShellBase({ children, scroll = true }) {
  return (
    <div className="anyu-v2" style={{ width: 390, height: 844, background: CORE_BG, color: CORE_INK, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(26,22,38,.30) 0.6px, transparent 0.6px)', backgroundSize: '3px 3px', mixBlendMode: 'multiply', opacity: 0.4, pointerEvents: 'none', zIndex: 0 }} />
      {window.RisoStatusBar ? <window.RisoStatusBar /> : null}
      <div style={{ flex: 1, overflowY: scroll ? 'auto' : 'hidden', overflowX: 'hidden', position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}

// small module motif glyph (line, not filled — quieter than the Riso stamp)
function CoreMotif({ motif, color, size = 22 }) {
  if (motif === 'radar') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="1.3"/>
        <circle cx="12" cy="12" r="5" fill="none" stroke={color} strokeWidth="1.1" opacity="0.7"/>
        <line x1="12" y1="12" x2="12" y2="3" stroke={color} strokeWidth="1.3"/>
        <circle cx="17" cy="8" r="1.3" fill={color}/>
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="1.3"/>
      <path d="M15 5.5a9 9 0 100 13 6.5 6.5 0 010-13z" fill={color} opacity="0.9"/>
    </svg>
  );
}

function CoreWordmark({ size = 'md' }) {
  return window.AnyuWordmark ? <window.AnyuWordmark size={size} color={CORE_INK} /> : null;
}

// ===========================================================================
// A · Homepage — quiet editorial entrance
// ===========================================================================
function CoreHomepage() {
  const S = 'var(--anyu-font-serif)', N = 'var(--anyu-font-sans)', M = 'var(--anyu-font-mono)', L = 'var(--anyu-font-latin)';
  return (
    <CoreShellBase>
      {/* nav */}
      <div style={{ padding: '18px 26px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <CoreWordmark size="md" />
        <span aria-hidden="true" style={{ display: 'grid', gap: 4 }}>
          {[0, 1, 2].map(i => <span key={i} style={{ width: 20, height: 1.5, background: CORE_INK }} />)}
        </span>
      </div>
      {/* hero */}
      <div style={{ padding: '54px 26px 0' }}>
        <div style={{ fontFamily: M, fontSize: 10.5, fontWeight: 700, letterSpacing: 2, color: CORE_DIM, textTransform: 'uppercase' }}>AI-Native 關係洞察</div>
        <h1 style={{ margin: '18px 0 0', fontFamily: S, fontWeight: 500, fontSize: 34, lineHeight: 1.3, letterSpacing: '-0.6px', color: CORE_INK }}>讀懂關係裡<br/>那些沒說出口<br/>的訊號。</h1>
        <p style={{ margin: '18px 0 0', fontFamily: N, fontSize: 14.5, lineHeight: 1.8, color: CORE_DIM, maxWidth: 300 }}>把你說不清的感覺，翻譯成一點方向。每一個模組，都是一次獨立、沉浸的關係洞察。</p>
      </div>
      {/* modules preview */}
      <div style={{ padding: '40px 26px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ fontFamily: M, fontSize: 10, fontWeight: 700, letterSpacing: 1.6, color: CORE_DIM, textTransform: 'uppercase' }}>Modules</span>
          <span style={{ flex: 1, height: 1, background: CORE_HAIR }} />
          <span style={{ fontFamily: N, fontSize: 11.5, color: CORE_FAINT }}>探索全部 →</span>
        </div>
        <div style={{ display: 'grid', gap: 14 }}>
          {MODULES.slice(0, 2).map(m => (
            <div key={m.id} style={{ background: CORE_CARD, border: `1px solid ${CORE_HAIR}`, padding: '18px 18px', display: 'flex', gap: 14, alignItems: 'flex-start', opacity: m.status === 'live' ? 1 : 0.72 }}>
              <span style={{ flex: '0 0 auto', width: 42, height: 42, borderRadius: '50%', border: `1px solid ${CORE_HAIR}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CoreMotif motif={m.motif} color={m.accent} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontFamily: M, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.4, color: m.accent, textTransform: 'uppercase' }}>Module · {m.id}</span>
                  <span style={{ fontFamily: M, fontSize: 9, fontWeight: 700, letterSpacing: 1, color: m.status === 'live' ? CORE_INK : CORE_FAINT, textTransform: 'uppercase', border: `1px solid ${m.status === 'live' ? CORE_INK : CORE_HAIR}`, padding: '2px 6px' }}>{m.statusLabel}</span>
                </div>
                <div style={{ marginTop: 7, fontFamily: S, fontSize: 18, fontWeight: 500, color: CORE_INK }}>{m.zh}</div>
                <div style={{ marginTop: 5, fontFamily: N, fontSize: 12.5, color: CORE_DIM, lineHeight: 1.6 }}>{m.hook}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* footer */}
      <div style={{ padding: '40px 26px 28px', marginTop: 24, borderTop: `1px solid ${CORE_HAIR}` }}>
        <CoreWordmark size="sm" />
        <div style={{ marginTop: 14, display: 'flex', gap: 14, fontFamily: N, fontSize: 11.5, color: CORE_DIM }}>
          <span>關於</span><span>隱私權政策</span><span>使用條款</span><span>支援</span>
        </div>
      </div>
    </CoreShellBase>
  );
}

// ===========================================================================
// B · Module Gallery — the park map / directory
// ===========================================================================
function CoreModuleGallery() {
  const S = 'var(--anyu-font-serif)', N = 'var(--anyu-font-sans)', M = 'var(--anyu-font-mono)';
  const Row = ({ m, dim }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 15, padding: '18px 0', borderBottom: `1px solid ${CORE_HAIR}`, opacity: dim ? 0.6 : 1 }}>
      <span style={{ flex: '0 0 auto', width: 46, height: 46, borderRadius: 4, background: m.accent + '1c', border: `1px solid ${m.accent}55`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CoreMotif motif={m.motif} color={m.accent} size={24} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: S, fontSize: 17, fontWeight: 500, color: CORE_INK }}>{m.zh}</div>
        <div style={{ marginTop: 3, fontFamily: M, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.2, color: m.status === 'live' ? m.accent : CORE_FAINT, textTransform: 'uppercase' }}>Module · {m.id} · {m.statusLabel}</div>
      </div>
      <span aria-hidden="true" style={{ fontFamily: 'var(--anyu-font-latin)', fontStyle: 'italic', fontWeight: 700, fontSize: 18, color: dim ? CORE_FAINT : CORE_INK }}>→</span>
    </div>
  );
  return (
    <CoreShellBase>
      <div style={{ padding: '18px 26px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: N, fontSize: 12.5, color: CORE_DIM }}>← 首頁</span>
        <CoreWordmark size="sm" />
      </div>
      <div style={{ padding: '32px 26px 0' }}>
        <div style={{ fontFamily: M, fontSize: 10.5, fontWeight: 700, letterSpacing: 2, color: CORE_DIM, textTransform: 'uppercase' }}>The Modules</div>
        <h1 style={{ margin: '14px 0 0', fontFamily: S, fontWeight: 500, fontSize: 28, lineHeight: 1.3, letterSpacing: '-0.4px', color: CORE_INK }}>每一個模組，<br/>一個獨立的洞察世界。</h1>
        <p style={{ margin: '12px 0 0', fontFamily: N, fontSize: 13.5, lineHeight: 1.75, color: CORE_DIM }}>進入任何一個模組，整段體驗都會待在那個世界裡 —— 各有各的氣味，但都還是暗語。</p>
      </div>
      <div style={{ padding: '28px 26px 0' }}>
        <div style={{ fontFamily: M, fontSize: 10, fontWeight: 700, letterSpacing: 1.6, color: CORE_INK, textTransform: 'uppercase', marginBottom: 4 }}>Live · 本週可玩</div>
        {MODULES.filter(m => m.status === 'live').map(m => <Row key={m.id} m={m} />)}
        <div style={{ fontFamily: M, fontSize: 10, fontWeight: 700, letterSpacing: 1.6, color: CORE_FAINT, textTransform: 'uppercase', margin: '24px 0 4px' }}>Coming Soon · 排程中</div>
        {MODULES.filter(m => m.status === 'soon').map(m => <Row key={m.id} m={m} dim />)}
      </div>
      <div style={{ padding: '32px 26px 28px' }}>
        <div style={{ padding: '16px 18px', border: `1px dashed ${CORE_HAIR}`, fontFamily: N, fontSize: 12, color: CORE_DIM, lineHeight: 1.7, textAlign: 'center' }}>每個模組都共用暗語的字體、間距、信任與隱私語言；不同的是顏色、motif 與情緒。</div>
      </div>
    </CoreShellBase>
  );
}

// ===========================================================================
// C · Legal / Support — neutral, readable, ANYU-level (not module-themed)
// ===========================================================================
function CoreLegal() {
  const S = 'var(--anyu-font-serif)', N = 'var(--anyu-font-sans)', M = 'var(--anyu-font-mono)';
  const Section = ({ k, h, body }) => (
    <div style={{ padding: '22px 0', borderBottom: `1px solid ${CORE_HAIR}` }}>
      <div style={{ fontFamily: M, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.4, color: CORE_FAINT, textTransform: 'uppercase' }}>{k}</div>
      <div style={{ marginTop: 8, fontFamily: S, fontSize: 17, fontWeight: 500, color: CORE_INK }}>{h}</div>
      <p style={{ margin: '8px 0 0', fontFamily: N, fontSize: 13, lineHeight: 1.8, color: CORE_DIM }}>{body}</p>
    </div>
  );
  return (
    <CoreShellBase>
      <div style={{ padding: '18px 26px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: N, fontSize: 12.5, color: CORE_DIM }}>← 返回</span>
        <CoreWordmark size="sm" />
      </div>
      <div style={{ padding: '30px 26px 0' }}>
        <div style={{ fontFamily: M, fontSize: 10.5, fontWeight: 700, letterSpacing: 2, color: CORE_DIM, textTransform: 'uppercase' }}>Policy</div>
        <h1 style={{ margin: '12px 0 0', fontFamily: S, fontWeight: 500, fontSize: 27, lineHeight: 1.3, letterSpacing: '-0.4px', color: CORE_INK }}>隱私權與資料處理</h1>
        <p style={{ margin: '10px 0 0', fontFamily: N, fontSize: 12.5, lineHeight: 1.75, color: CORE_DIM }}>最後更新 · 2026/05 · 適用於暗語 ANYU 全站與所有模組</p>
      </div>
      <div style={{ padding: '14px 26px 0' }}>
        <Section k="01 · 我們收什麼" h="只收分析所需的最少資料" body="你貼上的對話僅用於本次分析。我們會先去識別化（移除姓名、電話、地址、帳號），不保留原文，只留一個無法反推回你的識別碼。" />
        <Section k="02 · 保留多久" h="原文 24 小時內刪除" body="去識別化後的內容僅供本次分析；原始貼文於 24 小時內刪除。完整報告以網頁交付，查看連結會在有效期限內保留（保留期限以產品政策為準）。" />
        <Section k="03 · 我們不做什麼" h="不寄電子報 · 不分享第三方" body="付款由藍新金流處理，ANYU 不會看到你的卡號。我們不販售、不交換你的任何資料。" />
      </div>
      <div style={{ padding: '24px 26px 30px' }}>
        <div style={{ fontFamily: N, fontSize: 12.5, color: CORE_DIM, lineHeight: 1.7 }}>有任何疑問，來信 <span style={{ color: CORE_INK, borderBottom: `1px dotted ${CORE_INK}` }}>hello@anyu.tw</span>，我們會在 3–7 個工作天內回覆。</div>
        <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${CORE_HAIR}` }}><CoreWordmark size="sm" /></div>
      </div>
    </CoreShellBase>
  );
}

Object.assign(window, {
  CoreShellBase, CoreMotif, CORE_MODULES: MODULES,
  CoreHomepage, CoreModuleGallery, CoreLegal,
});
