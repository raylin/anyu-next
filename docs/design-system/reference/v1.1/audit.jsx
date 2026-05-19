// audit.jsx — Section 04: side-by-side staging audit (bad → good).

function SectionAudit() {
  const { DCSection, DCArtboard } = window;
  return (
    <DCSection
      id="audit"
      title="04 · Staging audit · 修正前 → 修正後"
      subtitle="staging 出現過的 6 個關鍵 drift。左邊是 v1.0 staging 的樣子，右邊是 v1.1 強制版。"
    >
      <DCArtboard id="A1" label="A1 · Chip 預設 / Active" width={680} height={520}>
        <AuditCard title="① Chip · default / active" issue="default 用 transparent + 0.7 alpha 文字看起來像 disabled；active 用 accent-12 + accent text 對比 2.6:1 不可讀。">
          <AuditCompare>
            <AuditBad>
              <div style={au.label}>v1.0 staging</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                <BadChip>已讀不回</BadChip>
                <BadChip>忽冷忽熱</BadChip>
                <BadChipActive>回訊變慢但看限動</BadChipActive>
              </div>
              <div style={au.note}>
                contrast<br/>
                default: 8.4:1（看似 disabled）<br/>
                active: <span style={au.warnRed}>2.6:1 ✗</span>
              </div>
            </AuditBad>
            <AuditGood>
              <div style={au.label}>v1.1 strict</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                <span className="chip">已讀不回</span>
                <span className="chip">忽冷忽熱</span>
                <span className="chip is-active">回訊變慢但看限動</span>
              </div>
              <div style={au.note}>
                contrast<br/>
                default: 12.5:1 ✓<br/>
                active: 5.0:1 ✓
              </div>
            </AuditGood>
          </AuditCompare>
        </AuditCard>
      </DCArtboard>

      <DCArtboard id="A2" label="A2 · Observed Signals" width={680} height={620}>
        <AuditCard title="② Observed Signals · ★ 最大 bug" issue="包進白卡 + 文字 dim/faint → 整列像 disabled。修正：不包卡，直接放在 page bg 上，文字全 ink。">
          <AuditCompare>
            <AuditBad>
              <div style={au.label}>v1.0 staging</div>
              <div style={au.badCard}>
                <BadSignal label="主動度" value="28" hint="多半你先開話題" />
                <BadSignal label="即時性" value="45" hint="平均回訊 38 分" />
                <BadSignal label="情緒投入" value="35" hint="短句多、提問少" />
              </div>
              <div style={au.note}>
                contrast<br/>
                label: <span style={au.warnRed}>4.6:1 邊緣</span><br/>
                value (accent 13px): <span style={au.warnRed}>3.3:1 ✗</span>
              </div>
            </AuditBad>
            <AuditGood>
              <div style={au.label}>v1.1 strict</div>
              <div style={{ marginTop: 12 }}>
                <window.Signal label="主動度" value={28} hint="多半你先開話題" />
                <window.Signal label="即時性" value={45} hint="平均回訊 38 分" />
                <window.Signal label="情緒投入" value={35} hint="短句多、提問少" />
              </div>
              <div style={au.note}>
                contrast<br/>
                label: 12.1:1 ✓<br/>
                value (ink 13px mono): 12.1:1 ✓
              </div>
            </AuditGood>
          </AuditCompare>
        </AuditCard>
      </DCArtboard>

      <DCArtboard id="A3" label="A3 · Paid Preview Cards" width={680} height={620}>
        <AuditCard title="③ Paid Preview · A vs B/C 階層" issue="staging 三張卡同色 + 全 blur → 灰糊一片。v1.1：A 用 ink-dark 深底（sample 質感）；B/C 淺底只 blur body。">
          <AuditCompare>
            <AuditBad>
              <div style={au.label}>v1.0 staging</div>
              <div style={au.badPaidA}>
                <div style={au.smallLabel}>A · 保留主動權</div>
                <div style={{ fontSize: 13, color: 'rgba(42,36,25,.62)', marginTop: 6, lineHeight: 1.6 }}>
                  「最近你好像在忙；我這週四五有空，你想再聊聊嗎？」
                </div>
              </div>
              <div style={au.badPaidB}>
                <div style={au.smallLabel}>B · 低壓試探</div>
                <div style={{ fontSize: 13, color: 'rgba(42,36,25,.62)', marginTop: 6, lineHeight: 1.6, filter: 'blur(3px)' }}>
                  「看你在跟朋友打球⋯」
                </div>
              </div>
              <div style={au.note}>三張同色 + 全 blur</div>
            </AuditBad>
            <AuditGood>
              <div style={au.label}>v1.1 strict</div>
              <div style={au.goodPaidA}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={au.letterDark}>A</div>
                  <div style={{ fontFamily: 'var(--anyu-font-mono)', fontSize: 11, letterSpacing: 1.5, color: 'var(--anyu-accent)', textTransform: 'uppercase' }}>保留主動權</div>
                </div>
                <div style={{ marginTop: 8, fontSize: 13, color: 'var(--anyu-ink-onDark)', lineHeight: 1.7 }}>
                  「最近你好像在忙；我這週四五有空，你想再聊聊嗎？」
                </div>
              </div>
              <div style={au.goodPaidB}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={au.letterLight}>B</div>
                  <div style={{ fontFamily: 'var(--anyu-font-mono)', fontSize: 11, letterSpacing: 1.5, color: 'var(--anyu-dim)', textTransform: 'uppercase' }}>低壓試探</div>
                </div>
                <div style={{ marginTop: 8, fontSize: 13, color: 'var(--anyu-ink)', lineHeight: 1.7, filter: 'blur(4.5px)' }}>
                  「看你在跟朋友打球⋯」
                </div>
              </div>
              <div style={au.note}>A 深底 sample · B 淺底 blur body</div>
            </AuditGood>
          </AuditCompare>
        </AuditCard>
      </DCArtboard>

      <DCArtboard id="A4" label="A4 · Loading state" width={680} height={520}>
        <AuditCard title="④ Loading · 視覺一致性" issue="staging 用了 spinner/百分比 → 跟產品其他頁不像同一套。v1.1：強制「月相 + 三點 + tip card」。">
          <AuditCompare>
            <AuditBad>
              <div style={au.label}>v1.0 staging</div>
              <div style={au.badLoading}>
                <div style={au.spinner} />
                <div style={{ marginTop: 18, fontFamily: 'var(--anyu-font-sans)', fontSize: 13, color: 'rgba(42,36,25,.62)' }}>
                  Analyzing… 73%
                </div>
              </div>
              <div style={au.note}>spinner + 百分比 = SaaS 感</div>
            </AuditBad>
            <AuditGood>
              <div style={au.label}>v1.1 strict</div>
              <div style={au.goodLoading}>
                <window.Moon phase={0.55} size={64} color="var(--anyu-accent)" soft />
                <div style={{ marginTop: 18, fontFamily: 'var(--anyu-font-serif)', fontSize: 18, color: 'var(--anyu-ink)' }}>
                  讀著你貼上的對話⋯
                </div>
                <div style={{ marginTop: 14, display: 'flex', gap: 12 }}>
                  <i style={au.dot} /><i style={{ ...au.dot, animationDelay: '200ms' }} /><i style={{ ...au.dot, animationDelay: '400ms' }} />
                </div>
              </div>
              <div style={au.note}>月相 + 三點 = ANYU 視覺語法</div>
            </AuditGood>
          </AuditCompare>
        </AuditCard>
      </DCArtboard>

      <DCArtboard id="A5" label="A5 · CTA 對比" width={680} height={520}>
        <AuditCard title="⑤ Accent CTA 反白文字" issue="staging 用 accent (#b69664) bg + surface (#fbf7ef) text = 3.1:1 ✗。v1.1：accent bg + ink-dark text = 5.4:1 ✓。">
          <AuditCompare>
            <AuditBad>
              <div style={au.label}>v1.0 staging</div>
              <button style={{ ...au.badCTA }}>送出 · 等我們的完整分析</button>
              <div style={au.note}>
                accent #b69664 / surface #fbf7ef<br/>
                <span style={au.warnRed}>3.1:1 ✗</span>
              </div>
            </AuditBad>
            <AuditGood>
              <div style={au.label}>v1.1 strict</div>
              <button className="btn btn-accent" style={{ marginTop: 12 }}>送出 · 等我們的完整分析</button>
              <div style={au.note}>
                accent #b69664 / ink-dark #1f1a12<br/>
                5.4:1 ✓
              </div>
            </AuditGood>
          </AuditCompare>
        </AuditCard>
      </DCArtboard>

      <DCArtboard id="A6" label="A6 · Token 配對表" width={680} height={620}>
        <AuditCard title="⑥ 強制 surface↔ink 配對" issue="這張表是 v1.1 的核心。每個 background 都對應一組固定的 ink。查不到 = bug。">
          <table style={au.table}>
            <thead>
              <tr>
                <th style={au.th}>Background</th>
                <th style={au.th}>Primary text</th>
                <th style={au.th}>Secondary</th>
                <th style={au.th}>Faint OK?</th>
                <th style={au.th}>Accent OK?</th>
              </tr>
            </thead>
            <tbody>
              <PairRow bg="--anyu-bg" sw="#f4efe7" p="ink (12.1)" s="dim (7.0)" f="≥ 13" a="≥ 18" />
              <PairRow bg="--anyu-surface" sw="#fbf7ef" p="ink (12.5)" s="dim (7.2)" f="≥ 13" a="≥ 18" />
              <PairRow bg="--anyu-card" sw="#ffffff" p="ink (13.7)" s="dim (7.9)" f="≥ 13" a="≥ 18" />
              <PairRow bg="--anyu-mist" sw="#ece2cf" p="ink (10.6)" s="dim (6.1)" f="✗" a="≥ 18" />
              <PairRow bg="--anyu-ink-dark" sw="#1f1a12" p="ink-onDark (13.8)" s="dim-onDark (8.4)" f="≥ 13" a="✓ 任何字級" />
            </tbody>
          </table>
          <div style={{ marginTop: 14, fontSize: 12, color: 'var(--anyu-dim)', fontStyle: 'italic', lineHeight: 1.7 }}>
            「Faint OK?」= 是否允許用 <code style={{ fontFamily: 'var(--anyu-font-mono)', color: 'var(--anyu-accent)' }}>--anyu-faint</code> 當文字色。<br/>
            「Accent OK?」= accent 字色可用的最小字級。
          </div>
        </AuditCard>
      </DCArtboard>
    </DCSection>
  );
}

function AuditCard({ title, issue, children }) {
  return (
    <div style={au.wrap}>
      <div style={au.tag}>staging audit</div>
      <h3 style={au.h3}>{title}</h3>
      <div style={au.issue}>{issue}</div>
      <div style={{ height: 16 }} />
      {children}
    </div>
  );
}

function AuditCompare({ children }) { return <div style={au.compare}>{children}</div>; }
function AuditBad({ children })     { return <div style={{ ...au.cell, ...au.badCell }}>{children}</div>; }
function AuditGood({ children })    { return <div style={{ ...au.cell, ...au.goodCell }}>{children}</div>; }

function BadChip({ children }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '8px 14px', borderRadius: 999, background: 'transparent', color: 'rgba(42,36,25,.7)', border: '1px solid rgba(42,36,25,.09)', fontSize: 13, fontFamily: 'var(--anyu-font-sans)', fontWeight: 500 }}>{children}</span>;
}
function BadChipActive({ children }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '8px 14px', borderRadius: 999, background: 'rgba(182,150,100,.12)', color: '#b69664', border: '1px solid #b69664', fontSize: 13, fontFamily: 'var(--anyu-font-sans)', fontWeight: 500 }}>{children}</span>;
}
function BadSignal({ label, value, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: 'rgba(42,36,25,.62)' }}>{label}</span>
        <span style={{ fontSize: 11, color: '#b69664', fontFamily: 'var(--anyu-font-mono)' }}>{value}</span>
      </div>
      <div style={{ height: 3, background: '#ece2cf', borderRadius: 2 }}>
        <div style={{ width: `${value}%`, height: '100%', background: '#b69664' }} />
      </div>
      <div style={{ marginTop: 4, fontSize: 11, color: 'rgba(42,36,25,.42)', fontStyle: 'italic' }}>{hint}</div>
    </div>
  );
}

function PairRow({ bg, sw, p, s, f, a }) {
  return (
    <tr style={au.tr}>
      <td style={au.td}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: sw, border: '1px solid rgba(20,15,5,.1)', display: 'inline-block' }} />
          <code style={{ fontFamily: 'var(--anyu-font-mono)', fontSize: 11 }}>{bg}</code>
        </span>
      </td>
      <td style={au.td}>{p}</td>
      <td style={au.td}>{s}</td>
      <td style={au.td}>{f}</td>
      <td style={au.td}>{a}</td>
    </tr>
  );
}

const au = {
  wrap: {
    width: '100%', height: '100%', boxSizing: 'border-box',
    padding: 32,
    background: 'var(--anyu-surface)',
    fontFamily: 'var(--anyu-font-sans)',
    color: 'var(--anyu-ink)',
    overflow: 'hidden',
  },
  tag: {
    fontFamily: 'var(--anyu-font-mono)',
    fontSize: 11, color: 'var(--anyu-accent)',
    letterSpacing: 1.5, textTransform: 'uppercase',
    marginBottom: 10,
  },
  h3: {
    margin: 0,
    fontFamily: 'var(--anyu-font-serif)',
    fontSize: 22, fontWeight: 500, lineHeight: 1.45,
    color: 'var(--anyu-ink)',
  },
  issue: {
    marginTop: 8,
    fontSize: 13, lineHeight: 1.7,
    color: 'var(--anyu-dim)',
    fontFamily: 'var(--anyu-font-sans)',
  },
  compare: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  cell: { padding: 18, borderRadius: 12, border: '1px solid var(--anyu-line)' },
  badCell: { background: '#fbf2f0' },
  goodCell: { background: '#f3f7ef' },
  label: {
    fontFamily: 'var(--anyu-font-mono)',
    fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'var(--anyu-dim)',
  },
  note: {
    marginTop: 14, paddingTop: 12,
    borderTop: '1px dashed var(--anyu-line)',
    fontFamily: 'var(--anyu-font-mono)',
    fontSize: 10.5, lineHeight: 1.7, letterSpacing: 0.5,
    color: 'var(--anyu-dim)',
  },
  warnRed: { color: '#b85a4a', fontWeight: 500 },
  smallLabel: {
    fontFamily: 'var(--anyu-font-mono)',
    fontSize: 11, letterSpacing: 1.2,
    color: 'rgba(42,36,25,.55)',
    textTransform: 'uppercase',
  },
  badCard: {
    marginTop: 12,
    padding: 14, background: '#fff',
    border: '1px solid var(--anyu-line)',
    borderRadius: 12,
  },
  badPaidA: {
    marginTop: 12,
    padding: 12, background: '#fff', border: '1px solid var(--anyu-line)', borderRadius: 10, marginBottom: 8,
  },
  badPaidB: {
    padding: 12, background: '#fff', border: '1px solid var(--anyu-line)', borderRadius: 10,
  },
  goodPaidA: {
    marginTop: 12,
    padding: 12, background: 'var(--anyu-ink-dark)', borderRadius: 10, marginBottom: 8,
  },
  goodPaidB: {
    padding: 12, background: 'var(--anyu-card)', border: '1px solid var(--anyu-line)', borderRadius: 10,
  },
  letterDark: {
    width: 22, height: 22, borderRadius: 11, background: 'var(--anyu-accent)',
    color: 'var(--anyu-ink-dark)', fontFamily: 'var(--anyu-font-latin)',
    fontSize: 13, fontStyle: 'italic', fontWeight: 500,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  letterLight: {
    width: 22, height: 22, borderRadius: 11, background: 'transparent',
    color: 'var(--anyu-accent)', border: '1px solid var(--anyu-accent-45)',
    fontFamily: 'var(--anyu-font-latin)',
    fontSize: 13, fontStyle: 'italic', fontWeight: 500,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  badLoading: {
    marginTop: 14, padding: 24, background: '#fff', border: '1px solid var(--anyu-line)', borderRadius: 12,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  goodLoading: {
    marginTop: 14, padding: 24, background: 'var(--anyu-bg)', border: '1px solid var(--anyu-line)', borderRadius: 12,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  spinner: {
    width: 32, height: 32, borderRadius: '50%',
    border: '3px solid #ece2cf',
    borderTopColor: '#b69664',
    animation: 'spin 1s linear infinite',
  },
  dot: {
    display: 'block', width: 5, height: 5, borderRadius: 3, background: 'var(--anyu-accent)',
    animation: 'anyu-pulse 1400ms infinite ease-in-out',
  },
  badCTA: {
    marginTop: 12,
    width: '100%', padding: '15px 0',
    background: '#b69664', color: '#fbf7ef',
    border: 'none', borderRadius: 14,
    fontFamily: 'var(--anyu-font-serif)', fontSize: 15, fontWeight: 500,
    letterSpacing: 0.5,
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

// spinner keyframes
if (typeof document !== 'undefined' && !document.getElementById('audit-keyframes')) {
  const s = document.createElement('style');
  s.id = 'audit-keyframes';
  s.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(s);
}

Object.assign(window, { SectionAudit });
