// =============================================================
// 暗語 ANYU · Payment Shell · v2.0 · Shell atoms
// =============================================================
// These are the FIXED payment-shell primitives. They never change
// per module. What changes per module is isolated to:
//   1. <ModuleAccentScope> — accent / accent2 / rose token swap
//   2. the `motif` passed into <AnyuStatusStamp> (moon / radar / …)
//   3. the copy passed into <AnyuModuleHeader> (title / hook)
//   4. the state-metaphor labels (e.g. 顯影 vs 收斂)
//
// Everything else below — stepper, order summary, trust line,
// support footer, card scaffolds — is shared shell.
// =============================================================

// -------------------------------------------------------------
// <ModuleAccentScope> — the ONLY thing a new module re-binds.
// Overrides the accent CSS variables for its subtree. Because every
// shell component draws from var(--anyu-accent*), the whole payment
// flow re-skins from these 3 hexes + a motif. Proof of the thesis.
// -------------------------------------------------------------
function ModuleAccentScope({ tokens = {}, children, style = {} }) {
  const s = { ...style };
  if (tokens.accent)  {
    s['--anyu-accent']    = tokens.accent;
    s['--anyu-accent-12'] = hexA(tokens.accent, 0.12);
    s['--anyu-accent-20'] = hexA(tokens.accent, 0.22);
    s['--anyu-accent-45'] = hexA(tokens.accent, 0.50);
  }
  if (tokens.accent2) {
    s['--anyu-accent2']    = tokens.accent2;
    s['--anyu-accent2-15'] = hexA(tokens.accent2, 0.18);
    s['--anyu-accent2-30'] = hexA(tokens.accent2, 0.40);
  }
  if (tokens.rose)    s['--anyu-rose'] = tokens.rose;
  return <div style={s}>{children}</div>;
}
function hexA(hex, a) {
  const m = hex.replace('#', '');
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// -------------------------------------------------------------
// <AnyuModuleHeader> — ACCENT layer. Module identity lives here.
// MODULE · NN label + serif title + one-line hook + small stamp.
// -------------------------------------------------------------
function AnyuModuleHeader({ moduleId = '01', title, hook, stamp = 'moon', align = 'left' }) {
  const { V2_INK, V2_DIM, V2_ACC, V2_ACC2, V2_SANS, V2_SERIF, V2_LATIN, V2_MONO } = window;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start',
      justifyContent: 'space-between', gap: 14,
    }}>
      <div style={{ flex: 1, textAlign: align }}>
        <div style={{
          fontFamily: V2_MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.8,
          color: V2_ACC, textTransform: 'uppercase',
        }}>
          MODULE ·{' '}
          <span style={{
            fontFamily: V2_LATIN, fontStyle: 'italic', fontWeight: 700,
            color: V2_ACC2, fontSize: 13, letterSpacing: 0,
          }}>{moduleId}</span>
        </div>
        <div style={{
          marginTop: 10, fontFamily: V2_SERIF, fontSize: 23, fontWeight: 500,
          lineHeight: 1.25, color: V2_INK, letterSpacing: '-0.3px',
        }}>{title}</div>
        {hook && (
          <div style={{ marginTop: 7, fontSize: 13.5, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.6 }}>
            {hook}
          </div>
        )}
      </div>
      {align === 'left' && <AnyuStatusStamp size={52} motif={stamp} progress={1} compact />}
    </div>
  );
}

// -------------------------------------------------------------
// <AnyuStatusStamp> — SHELL frame + ACCENT motif slot.
// The round ink frame is shell. The thing inside is the module
// motif (moon waxes for 01; radar sweeps for 02). `progress` 0..1
// drives the metaphor (moon fills / report develops).
// -------------------------------------------------------------
function AnyuStatusStamp({ size = 96, motif = 'moon', progress = 0.5, state = 'work', rotate = -4, compact = false }) {
  const { V2_INK, V2_CARD, V2_ACC, V2_ACC2, V2_ROSE } = window;
  const id = React.useId();
  const ring = state === 'error' ? V2_ROSE : V2_INK;
  return (
    <div aria-hidden="true" style={{
      width: size, height: size, flex: '0 0 auto',
      border: `1.5px solid ${ring}`, borderRadius: '50%',
      background: V2_CARD,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transform: `rotate(${rotate}deg)`, position: 'relative',
      boxShadow: compact ? 'none' : `3px 3px 0 ${V2_ACC}`,
    }}>
      {motif === 'radar'
        ? <RadarMotif size={size * 0.74} progress={progress} state={state} />
        : <MoonMotif size={size * 0.78} progress={progress} state={state} />}
      {/* done seal */}
      {state === 'done' && !compact && (
        <span style={{
          position: 'absolute', right: -6, bottom: -6,
          width: 26, height: 26, borderRadius: '50%',
          background: V2_ACC2, border: `1.5px solid ${V2_INK}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: `rotate(${-rotate}deg)`,
        }}>
          <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
            <path d="M1.5 5.5 L4.8 9 L11.5 1.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      )}
      {state === 'error' && !compact && (
        <span style={{
          position: 'absolute', right: -6, bottom: -6,
          width: 26, height: 26, borderRadius: '50%',
          background: V2_ROSE, border: `1.5px solid ${V2_INK}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: `rotate(${-rotate}deg)`,
          fontFamily: 'var(--anyu-font-latin)', fontStyle: 'italic', fontWeight: 700,
          color: '#fff', fontSize: 14,
        }}>!</span>
      )}
    </div>
  );
}

// Module 01 motif — halftone moon that waxes with progress.
function MoonMotif({ size = 70, progress = 0.5, state }) {
  const { V2_ACC, V2_ACC2 } = window;
  const id = React.useId();
  const reveal = 56 * Math.max(0.08, Math.min(1, progress)); // height of halftone reveal
  return (
    <svg width={size} height={size} viewBox="0 0 56 56">
      <defs>
        <pattern id={`pm-${id}`} width="3.5" height="3.5" patternUnits="userSpaceOnUse">
          <circle cx="1.75" cy="1.75" r="1.05" fill={V2_ACC2} opacity="0.85"/>
        </pattern>
        <clipPath id={`pc-${id}`}><circle cx="28" cy="28" r="20"/></clipPath>
      </defs>
      <circle cx="28" cy="28" r="20" fill={V2_ACC}/>
      {/* halftone wax — rises from bottom as the report "develops" */}
      <rect x="0" y={56 - reveal} width="56" height={reveal}
        fill={`url(#pm-${id})`} clipPath={`url(#pc-${id})`}
        style={{ mixBlendMode: 'multiply', transition: 'all 700ms cubic-bezier(.2,.7,.3,1)' }}/>
    </svg>
  );
}

// Module 02 motif — radar. Concentric rings + sweep wedge + signal dots.
// (Demo only — Module 02 is annotate-only in this exploration.)
function RadarMotif({ size = 70, progress = 0.6, state }) {
  const { V2_ACC, V2_ACC2 } = window;
  const id = React.useId();
  const dots = [
    [38, 20], [20, 38], [40, 40], [24, 22],
  ];
  const lit = Math.round(dots.length * Math.min(1, progress));
  return (
    <svg width={size} height={size} viewBox="0 0 56 56">
      <defs>
        <clipPath id={`rc-${id}`}><circle cx="28" cy="28" r="20"/></clipPath>
      </defs>
      <circle cx="28" cy="28" r="20" fill="none" stroke={V2_ACC} strokeWidth="1.4"/>
      <circle cx="28" cy="28" r="13" fill="none" stroke={V2_ACC} strokeWidth="1.1" opacity="0.7"/>
      <circle cx="28" cy="28" r="6" fill="none" stroke={V2_ACC} strokeWidth="1.1" opacity="0.5"/>
      <g clipPath={`url(#rc-${id})`}>
        <path d="M28 28 L28 6 A22 22 0 0 1 47 18 Z" fill={V2_ACC} opacity="0.16"/>
        <line x1="28" y1="28" x2="28" y2="6" stroke={V2_ACC} strokeWidth="1.4"/>
      </g>
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.1"
          fill={i < lit ? V2_ACC2 : 'none'}
          stroke={V2_ACC2} strokeWidth="1.2"/>
      ))}
    </svg>
  );
}

// -------------------------------------------------------------
// <AnyuPayProgress> — SHELL. 3-beat payment progress.
// 付款 → 生成 → 完成. Module-agnostic; only the active color is accent.
// -------------------------------------------------------------
function AnyuPayProgress({ active = 1, labels = ['付款', '生成', '完成'], error = false }) {
  const { V2_INK, V2_DIM, V2_FAINT, V2_CARD, V2_ACC, V2_ACC2, V2_ROSE, V2_SANS, V2_MONO, V2_LATIN } = window;
  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      {labels.map((lab, i) => {
        const done = i < active;
        const cur = i === active;
        const isErr = error && cur;
        const dotBg = isErr ? V2_ROSE : (done ? V2_INK : (cur ? V2_CARD : V2_CARD));
        const dotBorder = isErr ? V2_ROSE : V2_INK;
        const numCol = done ? '#fff' : (cur ? V2_ACC : V2_FAINT);
        return (
          <React.Fragment key={lab}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: '0 0 auto' }}>
              <span style={{
                width: 26, height: 26, borderRadius: '50%',
                border: `1.5px solid ${dotBorder}`, background: dotBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: cur && !isErr ? `2px 2px 0 ${V2_ACC2}` : 'none',
              }}>
                {done
                  ? <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5 L4 7.5 L10 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  : <span style={{ fontFamily: V2_LATIN, fontStyle: 'italic', fontWeight: 700, fontSize: 12, color: numCol }}>{i + 1}</span>}
              </span>
              <span style={{
                fontFamily: V2_MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.2,
                color: cur ? V2_INK : V2_DIM, whiteSpace: 'nowrap',
              }}>{lab}</span>
            </div>
            {i < labels.length - 1 && (
              <span style={{
                flex: 1, height: 1.5, margin: '0 6px', marginBottom: 18,
                background: i < active ? V2_INK : 'repeating-linear-gradient(90deg, var(--anyu-line-soft) 0 3px, transparent 3px 6px)',
              }}/>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// -------------------------------------------------------------
// <AnyuOrderSummary> — SHELL layout; product title is ACCENT copy.
// Carries the immutable commercial facts: NT$49 · 一次性 · 非訂閱.
// -------------------------------------------------------------
function AnyuOrderSummary({ product = '完整報告', price = 'NT$49', note = '一次性付款 · 非訂閱制' }) {
  const { V2_INK, V2_DIM, V2_SURF, V2_ACC, V2_ACC2, V2_SANS, V2_SERIF, V2_LATIN, V2_MONO } = window;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      padding: '14px 16px', background: V2_SURF,
      border: `1.5px solid ${V2_INK}`, borderLeft: `4px solid ${V2_ACC}`,
    }}>
      <div>
        <div style={{ fontFamily: V2_SERIF, fontSize: 15, fontWeight: 500, color: V2_INK }}>{product}</div>
        <div style={{ marginTop: 4, fontFamily: V2_MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.2, color: V2_DIM, textTransform: 'uppercase' }}>
          {note}
        </div>
      </div>
      <div style={{ position: 'relative', lineHeight: 1, flex: '0 0 auto' }}>
        <span aria-hidden="true" style={{
          position: 'absolute', left: 2, top: 2,
          fontFamily: V2_LATIN, fontStyle: 'italic', fontWeight: 700, fontSize: 26,
          color: V2_ACC2, mixBlendMode: 'multiply', opacity: 0.85,
        }}>{price}</span>
        <span style={{ position: 'relative', fontFamily: V2_LATIN, fontStyle: 'italic', fontWeight: 700, fontSize: 26, color: V2_ACC }}>{price}</span>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// <AnyuTrustLine> — SHELL. Fixed 藍新 / web-delivery statement.
// -------------------------------------------------------------
function AnyuTrustLine({ children, icon = true }) {
  const { V2_DIM, V2_ACC, V2_SANS } = window;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 8,
      fontSize: 11.5, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.65,
    }}>
      {icon && (
        <svg width="13" height="15" viewBox="0 0 13 15" fill="none" style={{ flex: '0 0 auto', marginTop: 1 }}>
          <path d="M6.5 1 L12 3 V7 C12 10.5 9.6 13 6.5 14 C3.4 13 1 10.5 1 7 V3 Z"
            fill="none" stroke="var(--anyu-accent)" strokeWidth="1.3" strokeLinejoin="round"/>
          <path d="M4.3 7.2 L5.9 8.8 L9 5.4" stroke="var(--anyu-accent)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      <span>{children}</span>
    </div>
  );
}

// -------------------------------------------------------------
// <AnyuSupportFooter> — SHELL. refund policy + email + handling time.
// -------------------------------------------------------------
function AnyuSupportFooter({ onRefund, compact = false }) {
  const { V2_INK, V2_DIM, V2_FAINT, V2_ACC, V2_SANS } = window;
  return (
    <div style={{ padding: compact ? '16px 0 0' : '20px 0 0' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        fontSize: 12, fontFamily: V2_SANS,
      }}>
        <button onClick={onRefund} style={{
          all: 'unset', cursor: 'pointer', color: V2_INK,
          borderBottom: `1.5px solid ${V2_INK}`, paddingBottom: 1,
        }}>退款政策</button>
        <span style={{ color: V2_FAINT }}>·</span>
        <a href="mailto:hello@anyu.tw" style={{
          color: V2_INK, textDecoration: 'none',
          borderBottom: `1px dotted ${V2_INK}`, paddingBottom: 1,
        }}>hello@anyu.tw</a>
      </div>
      <div style={{
        marginTop: 10, textAlign: 'center',
        fontSize: 11, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.6,
      }}>
        退款 / 補發於 3–7 個工作天內人工處理
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Annotation helpers — only used in the doc, not in product.
// -------------------------------------------------------------
function AnnotTag({ kind = 'shell', children, style = {} }) {
  const isShell = kind === 'shell';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: 'var(--anyu-font-mono)', fontWeight: 700, fontSize: 10,
      letterSpacing: 0.6, textTransform: 'uppercase',
      padding: '3px 8px', borderRadius: 2,
      border: `1.5px solid ${isShell ? '#1a1626' : '#5b3aa3'}`,
      background: isShell ? '#1a1626' : 'transparent',
      color: isShell ? '#f5ecdd' : '#5b3aa3',
      ...style,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: isShell ? 1 : '50%',
        background: isShell ? '#f5ecdd' : '#ec4e8c',
      }}/>
      {children}
    </span>
  );
}

Object.assign(window, {
  ModuleAccentScope, hexA,
  AnyuModuleHeader, AnyuStatusStamp, MoonMotif, RadarMotif,
  AnyuPayProgress, AnyuOrderSummary, AnyuTrustLine, AnyuSupportFooter,
  AnnotTag,
});
