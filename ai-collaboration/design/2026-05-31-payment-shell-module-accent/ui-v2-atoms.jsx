// =============================================================
// 暗語 ANYU · UI v2.0 · Atoms (Riso Editorial)
// =============================================================
// Loaded after React + Babel. Exposes all atoms on `window`.
// Token contract: requires anyu-tokens-v2.css and a wrapping element
// with class "anyu-v2" or [data-design-system="v2"].
//
// Props interfaces are documented at top of each component as JSDoc.
// See DESIGN_SYSTEM_v2.md §5 for full spec per component.
// =============================================================

const V2_INK    = 'var(--anyu-ink)';
const V2_INKDK  = 'var(--anyu-ink-dark)';
const V2_BG     = 'var(--anyu-bg)';
const V2_SURF   = 'var(--anyu-surface)';
const V2_CARD   = 'var(--anyu-card)';
const V2_MIST   = 'var(--anyu-mist)';
const V2_DIM    = 'var(--anyu-dim)';
const V2_FAINT  = 'var(--anyu-faint)';
const V2_LINE   = 'var(--anyu-line)';
const V2_ACC    = 'var(--anyu-accent)';
const V2_ACC2   = 'var(--anyu-accent2)';
const V2_ROSE   = 'var(--anyu-rose)';
const V2_ONDK   = 'var(--anyu-ink-onDark)';
const V2_DIMDK  = 'var(--anyu-dim-onDark)';
const V2_FNTDK  = 'var(--anyu-faint-onDark)';
const V2_LINDK  = 'var(--anyu-line-onDark)';

const V2_SANS  = 'var(--anyu-font-sans)';
const V2_SERIF = 'var(--anyu-font-serif)';
const V2_LATIN = 'var(--anyu-font-latin)';
const V2_MONO  = 'var(--anyu-font-mono)';

// -------------------------------------------------------------
// <AnyuPage> — page scaffold with grain + optional bleed blocks
// -------------------------------------------------------------
/**
 * @typedef AnyuBleedBlock
 * @property {'top'|'bottom'} [v]   vertical anchor (default top)
 * @property {number} offsetV       px from v anchor (can be negative for off-canvas)
 * @property {'left'|'right'} h
 * @property {number} offsetH
 * @property {number} size          px square
 * @property {'accent'|'accent2'|'rose'} color
 * @property {number} [opacity]     0..1, default 0.28
 * @property {number} [rotate]      deg, default 0
 *
 * @typedef AnyuPageProps
 * @property {React.ReactNode} children
 * @property {AnyuBleedBlock[]} [bleeds]   ≤ 3 / page; ≥ 1 must be accent
 * @property {boolean} [grain]             default true
 */
function AnyuPage({ children, bleeds = [], grain = true }) {
  // ★ enforce config: ≤3 bleeds, ≥1 accent (lint-time only — not blocked at runtime).
  const colorMap = { accent: V2_ACC, accent2: V2_ACC2, rose: V2_ROSE };
  return (
    <div className="anyu-v2 page" style={{
      position: 'relative', overflow: 'hidden',
      background: V2_BG, color: V2_INK,
      width: '100%', minHeight: '100%',
      fontFamily: 'var(--anyu-font-sans)',
    }}>
      {grain && <div aria-hidden="true" className="page-grain" />}
      {bleeds.slice(0, 3).map((b, i) => (
        <div key={i} aria-hidden="true" className="bleed" style={{
          [b.v ?? 'top']: b.offsetV,
          [b.h]: b.offsetH,
          width: b.size, height: b.size,
          background: colorMap[b.color],
          opacity: b.opacity ?? 0.28,
          transform: `rotate(${b.rotate ?? 0}deg)`,
        }}/>
      ))}
      {children}
    </div>
  );
}

// -------------------------------------------------------------
// <AnyuNavBar> — top header (back link + wordmark)
// -------------------------------------------------------------
/**
 * @typedef AnyuNavBarProps
 * @property {string|null} [back]    null to hide; default "← 重新整理輸入"
 * @property {()=>void} [onBack]
 * @property {boolean} [showMark]    default true
 */
function AnyuNavBar({ back = '← 重新整理輸入', onBack, showMark = true }) {
  return (
    <div style={{
      padding: '20px 24px 6px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      {back ? (
        <button onClick={onBack} style={{
          all: 'unset', cursor: 'pointer',
          fontSize: 12.5, color: V2_DIM, fontFamily: V2_SANS,
        }}>{back}</button>
      ) : <span/>}
      {showMark && <AnyuWordmark size="sm" />}
    </div>
  );
}

// -------------------------------------------------------------
// <AnyuWordmark> — "⋯ 暗語 ANYU"
// -------------------------------------------------------------
/**
 * @typedef AnyuWordmarkProps
 * @property {'sm'|'md'|'lg'} [size]   default 'sm'
 * @property {string} [color]          default --anyu-dim
 */
function AnyuWordmark({ size = 'sm', color = V2_DIM }) {
  const cfg = {
    sm: { dot: 14, dotR: 1.4, zh: 11, en: 11, gap: 6, track: 2.5 },
    md: { dot: 18, dotR: 1.8, zh: 14, en: 14, gap: 8, track: 2.8 },
    lg: { dot: 24, dotR: 2.4, zh: 18, en: 18, gap: 10, track: 3.0 },
  }[size];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: cfg.gap, color }}>
      <svg width={cfg.dot} height={cfg.dot * 0.43} viewBox="0 0 14 6" fill="currentColor" aria-hidden="true">
        <circle cx="2" cy="3" r={cfg.dotR} />
        <circle cx="7" cy="3" r={cfg.dotR} />
        <circle cx="12" cy="3" r={cfg.dotR} />
      </svg>
      <span style={{ fontFamily: V2_SERIF, letterSpacing: cfg.track, fontSize: cfg.zh }}>暗語</span>
      <span style={{ fontFamily: V2_LATIN, fontStyle: 'italic', fontWeight: 700, letterSpacing: 1, fontSize: cfg.en }}>ANYU</span>
    </span>
  );
}

// -------------------------------------------------------------
// <AnyuMoonStamp> — round halftone seal
// -------------------------------------------------------------
/**
 * @typedef AnyuMoonStampProps
 * @property {number} [size]       default 52
 * @property {number} [rotate]     default -4 deg
 * @property {'standard'|'dark'} [variant]
 */
function AnyuMoonStamp({ size = 52, rotate = -4, variant = 'standard' }) {
  const id = React.useId();
  const ring = variant === 'dark' ? V2_ONDK : V2_INK;
  const bg = variant === 'dark' ? V2_INKDK : V2_CARD;
  return (
    <div aria-hidden="true" style={{
      width: size, height: size,
      border: `1.5px solid ${ring}`,
      borderRadius: '50%',
      background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transform: `rotate(${rotate}deg)`,
      flex: '0 0 auto',
    }}>
      <svg width={size * 0.78} height={size * 0.78} viewBox="0 0 56 56">
        <defs>
          <pattern id={`mhalf-${id}`} width="3.5" height="3.5" patternUnits="userSpaceOnUse">
            <circle cx="1.75" cy="1.75" r="1.05" fill={V2_ACC2} opacity="0.85"/>
          </pattern>
          <clipPath id={`mclip-${id}`}><circle cx="28" cy="28" r="20"/></clipPath>
        </defs>
        <circle cx="28" cy="28" r="20" fill={V2_ACC}/>
        <rect x="6" y="6" width="44" height="44"
          fill={`url(#mhalf-${id})`}
          clipPath={`url(#mclip-${id})`}
          style={{ mixBlendMode: 'multiply' }}/>
      </svg>
    </div>
  );
}

// -------------------------------------------------------------
// <AnyuOrnamentRule> — section divider
// -------------------------------------------------------------
/**
 * @typedef AnyuOrnamentRuleProps
 * @property {string} label       mono uppercase, "SIGNAL ANALYSIS"
 * @property {string} [zh]        "他這邊的訊號"
 * @property {string} [count]     "3 個維度"
 * @property {string} [ornament]  default "✦"; ✺ ✦ ❋ ⨳
 */
function AnyuOrnamentRule({ label, zh, count, ornament = '✦' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      margin: '28px 0 14px',
    }}>
      <span style={{
        fontFamily: V2_MONO, fontSize: 10, fontWeight: 700, letterSpacing: 1.6,
        color: V2_ACC, textTransform: 'uppercase', whiteSpace: 'nowrap',
      }}>{label}</span>
      <span style={{ flex: 1, height: 1.5, background: V2_INK }}/>
      <span aria-hidden="true" style={{ fontSize: 14, color: V2_ACC2 }}>{ornament}</span>
      <span style={{
        fontFamily: V2_SERIF, fontSize: 11.5, color: V2_DIM, whiteSpace: 'nowrap',
      }}>{zh}{count ? ` · ${count}` : ''}</span>
    </div>
  );
}

// -------------------------------------------------------------
// <AnyuCard> — base card (thick ink border + offset shadow)
// -------------------------------------------------------------
/**
 * @typedef AnyuCardProps
 * @property {'accent'|'accent2'|'rose'|'ink'|'none'} [shadow]    default 'accent'
 * @property {'light'|'dark'|'surface'} [bg]                       default 'light'
 * @property {string|number} [padding]                             default '20px 22px'
 * @property {React.CSSProperties} [style]
 */
function AnyuCard({ children, shadow = 'accent', bg = 'light', padding = '20px 22px', style = {} }) {
  const shadowMap = {
    accent:  `4px 4px 0 ${V2_ACC}`,
    accent2: `4px 4px 0 ${V2_ACC2}`,
    rose:    `4px 4px 0 ${V2_ROSE}`,
    ink:     `4px 4px 0 ${V2_INK}`,
    none:    'none',
  };
  const bgMap = {
    light: V2_CARD,
    dark:  V2_INKDK,
    surface: V2_SURF,
  };
  return (
    <div className={bg === 'dark' ? 'on-dark' : ''} style={{
      position: 'relative',
      background: bgMap[bg],
      border: `1.5px solid ${V2_INK}`,
      boxShadow: shadowMap[shadow],
      borderRadius: 'var(--anyu-radius-lg)',
      color: bg === 'dark' ? V2_ONDK : V2_INK,
      padding,
      ...style,
    }}>{children}</div>
  );
}

// -------------------------------------------------------------
// <AnyuPrimaryButton>
// -------------------------------------------------------------
/**
 * @typedef AnyuPrimaryButtonProps
 * @property {React.ReactNode} children
 * @property {()=>void} [onClick]
 * @property {boolean} [loading]
 * @property {boolean} [disabled]
 * @property {'ink'|'accent'|'striped'} [variant]  default 'ink'
 * @property {'accent'|'accent2'|'ink'|'rose'} [shadow]  default 'accent2'
 * @property {number} [height]                      default 50
 * @property {React.ReactNode} [endIcon]
 */
function AnyuPrimaryButton({
  children, onClick, loading, disabled,
  variant = 'ink', shadow = 'accent2', height = 50, endIcon,
}) {
  const shadowMap = {
    accent:  `4px 4px 0 ${V2_ACC}`,
    accent2: `4px 4px 0 ${V2_ACC2}`,
    rose:    `4px 4px 0 ${V2_ROSE}`,
    ink:     `4px 4px 0 ${V2_INK}`,
  };
  const bgMap = {
    ink: V2_INK,
    accent: V2_ACC,
    striped: `repeating-linear-gradient(45deg, ${V2_ACC} 0 6px, transparent 6px 12px), ${V2_BG}`,
  };
  if (variant === 'striped' || loading) {
    return (
      <button onClick={onClick} disabled={disabled} style={{
        width: '100%', height,
        background: V2_BG,
        backgroundImage: `repeating-linear-gradient(45deg, ${V2_ACC} 0 6px, transparent 6px 12px)`,
        border: `1.5px solid ${V2_INK}`, borderRadius: 'var(--anyu-radius-lg)',
        boxShadow: shadowMap[shadow], cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          padding: '5px 16px', background: V2_BG,
          border: `1.5px solid ${V2_INK}`,
          fontFamily: V2_SERIF, fontWeight: 500, fontSize: 15, color: V2_INK,
          letterSpacing: 0.5,
          display: 'inline-flex', alignItems: 'baseline', gap: 4,
        }}>
          <span>{children}</span>
          <DotPulse />
        </span>
      </button>
    );
  }
  const onDark = variant !== 'accent';  // accent uses ink-onDark too
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', height,
      background: bgMap[variant], color: V2_ONDK,
      border: `1.5px solid ${V2_INK}`, borderRadius: 'var(--anyu-radius-lg)',
      fontFamily: V2_SERIF, fontWeight: 500, fontSize: 15,
      letterSpacing: 0.3,
      boxShadow: shadowMap[shadow],
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      transition: 'transform 120ms ease-out',
    }}>
      <span>{children}</span>
      {endIcon && <span style={{
        fontFamily: V2_LATIN, fontStyle: 'italic', fontWeight: 700, color: V2_ACC2,
      }}>{endIcon}</span>}
    </button>
  );
}

function DotPulse() {
  return (
    <span aria-hidden="true" style={{ display: 'inline-flex', gap: 3 }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 5, height: 5, borderRadius: '50%',
          background: V2_ACC,
          animation: `anyu-pulse 1.4s ${i * 0.2}s infinite`,
        }}/>
      ))}
      <style>{`
        @keyframes anyu-pulse {
          0%,100% { opacity: .25; transform: scale(.85); }
          50%     { opacity: 1;   transform: scale(1.1); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes anyu-pulse { 0%,100%,50% { opacity: 1; transform: none; } }
        }
      `}</style>
    </span>
  );
}

// -------------------------------------------------------------
// <AnyuChip> + <AnyuChipGroup>
// -------------------------------------------------------------
/**
 * @typedef AnyuChipProps
 * @property {React.ReactNode} children
 * @property {boolean} [active]
 * @property {()=>void} [onClick]
 */
function AnyuChip({ children, active, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      aria-pressed={active ? 'true' : 'false'}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center',
        padding: '7px 13px', minHeight: 34,
        borderRadius: 'var(--anyu-radius-md)',
        background: active ? V2_INK : V2_CARD,
        color: active ? V2_ONDK : V2_INK,
        border: `1.5px solid ${V2_INK}`,
        boxShadow: active
          ? `3px 3px 0 ${V2_ACC2}`
          : (hover ? `2px 2px 0 ${V2_INK}` : 'none'),
        transform: hover && !active ? 'translate(-1px,-1px)' : 'none',
        transition: 'box-shadow 120ms, transform 120ms, background 120ms',
        fontFamily: V2_SANS, fontWeight: 500, fontSize: 13,
        letterSpacing: 0.2, whiteSpace: 'nowrap',
        cursor: 'pointer',
      }}>{children}</button>
  );
}

/**
 * @typedef ChipDef
 * @property {string} label
 * @property {boolean} [active]
 * @property {string} [value]
 *
 * @typedef AnyuChipGroupProps
 * @property {string} title
 * @property {string} [hint]                     "可選"
 * @property {ChipDef[]} chips
 * @property {(value:string, active:boolean)=>void} [onChange]
 */
function AnyuChipGroup({ title, hint = '可選', chips, onChange }) {
  return (
    <div style={{ marginTop: 22 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 8,
        fontFamily: V2_MONO, fontSize: 10, fontWeight: 700, letterSpacing: 1.6,
        color: V2_ACC, textTransform: 'uppercase',
      }}>
        <span>{title}</span>
        <span style={{ color: V2_FAINT }}>·</span>
        <span style={{ color: V2_DIM }}>{hint}</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
        {chips.map(c => (
          <AnyuChip
            key={c.label}
            active={c.active}
            onClick={() => onChange && onChange(c.value || c.label, !c.active)}>
            {c.label}
          </AnyuChip>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// <AnyuSignal> + <AnyuSignalList>
// -------------------------------------------------------------
/**
 * @typedef AnyuSignalProps
 * @property {string} n        "01"
 * @property {string} label
 * @property {number} value    0..100
 * @property {string} hint
 */
function AnyuSignal({ n, label, value, hint }) {
  const isFull = value >= 100;
  return (
    <div style={{
      marginBottom: 18,
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      gridTemplateRows: 'auto auto auto',
      columnGap: 14, rowGap: 6,
      alignItems: 'baseline',
    }}>
      <span style={{
        gridColumn: 1, gridRow: '1 / span 3',
        fontFamily: V2_LATIN, fontStyle: 'italic', fontWeight: 700,
        fontSize: 26, lineHeight: 1, color: V2_ACC,
        alignSelf: 'start', marginTop: 2,
      }}>{n}</span>
      <span style={{
        gridColumn: 2, gridRow: 1,
        fontSize: 14, fontWeight: 500, color: V2_INK,
      }}>{label}</span>
      <span style={{
        gridColumn: 3, gridRow: 1,
        display: 'inline-flex', alignItems: 'baseline', gap: 2,
      }}>
        <span style={{
          fontFamily: V2_LATIN, fontStyle: 'italic', fontWeight: 700,
          fontSize: 18, lineHeight: 1, color: V2_ACC2,
        }}>{value}</span>
        <span aria-hidden="true" style={{
          fontFamily: V2_MONO, fontSize: 9, fontWeight: 700,
          color: V2_ACC2, transform: 'translateY(-7px)',
        }}>°</span>
      </span>
      <div style={{
        gridColumn: '2 / span 2', gridRow: 2,
        height: 7, border: `1.5px solid ${V2_INK}`,
        background: V2_BG, overflow: 'hidden',
      }}>
        <div style={{
          width: `${value}%`, height: '100%',
          background: `repeating-linear-gradient(90deg, ${V2_ACC} 0 3px, transparent 3px 6px)`,
          borderRight: isFull ? 'none' : `1.5px solid ${V2_INK}`,
          transition: 'width 700ms cubic-bezier(.2,.7,.3,1)',
        }}/>
      </div>
      <div style={{
        gridColumn: '2 / span 2', gridRow: 3,
        fontSize: 13, lineHeight: 1.55, color: V2_DIM,
        fontStyle: 'italic', fontFamily: V2_SERIF,
      }}>{hint}</div>
    </div>
  );
}

/**
 * @typedef AnyuSignalListProps
 * @property {AnyuSignalProps[]} signals
 * @property {string} [sectionLabel]   default "SIGNAL ANALYSIS"
 * @property {string} [sectionZh]      default "他這邊的訊號"
 */
function AnyuSignalList({ signals, sectionLabel = 'SIGNAL ANALYSIS', sectionZh = '他這邊的訊號' }) {
  return (
    <div>
      <AnyuOrnamentRule
        label={sectionLabel} zh={sectionZh}
        count={`${signals.length} 個維度`} ornament="✺"
      />
      <div style={{ paddingTop: 4 }}>
        {signals.map(s => <AnyuSignal key={s.n} {...s} />)}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// <AnyuPullQuote>
// -------------------------------------------------------------
/**
 * @typedef AnyuPullQuoteProps
 * @property {React.ReactNode} children
 * @property {'accent'|'accent2'|'rose'} [accent]   left edge color
 */
function AnyuPullQuote({ children, accent = 'accent2' }) {
  const colorMap = { accent: V2_ACC, accent2: V2_ACC2, rose: V2_ROSE };
  return (
    <div style={{
      padding: '18px 22px',
      background: V2_SURF,
      border: `1.5px solid ${V2_INK}`,
      borderLeft: `4px solid ${colorMap[accent]}`,
    }}>
      <div style={{
        fontFamily: V2_SERIF, fontStyle: 'italic',
        fontSize: 16, fontWeight: 500, lineHeight: 1.65,
        color: V2_INK,
      }}>{children}</div>
    </div>
  );
}

// -------------------------------------------------------------
// <AnyuFooterLinks>
// -------------------------------------------------------------
function AnyuFooterLinks() {
  return (
    <div style={{
      padding: '28px 24px 24px',
      display: 'flex', justifyContent: 'center', gap: 10,
      fontSize: 11.5, color: V2_DIM, fontFamily: V2_SANS,
    }}>
      <span>隱私權政策</span>
      <span style={{ color: V2_FAINT }}>|</span>
      <span>使用條款</span>
      <span style={{ color: V2_FAINT }}>|</span>
      <span>免責聲明</span>
    </div>
  );
}

Object.assign(window, {
  // tokens
  V2_INK, V2_INKDK, V2_BG, V2_SURF, V2_CARD, V2_MIST,
  V2_DIM, V2_FAINT, V2_LINE, V2_ACC, V2_ACC2, V2_ROSE,
  V2_ONDK, V2_DIMDK, V2_FNTDK, V2_LINDK,
  V2_SANS, V2_SERIF, V2_LATIN, V2_MONO,
  // atoms
  AnyuPage, AnyuNavBar, AnyuWordmark, AnyuMoonStamp,
  AnyuOrnamentRule, AnyuCard, AnyuPrimaryButton, DotPulse,
  AnyuChip, AnyuChipGroup,
  AnyuSignal, AnyuSignalList,
  AnyuPullQuote, AnyuFooterLinks,
});
