// ui.jsx — shared UI primitives for the v1.1 handoff spec.
// All visual tokens come from anyu-tokens-v1.1.css.
// Avoid inline color hex / font-family strings — everything goes through CSS vars.

/* ----------------------------- Moon icon ----------------------------- */
// phase 0..1 (0 = new, 0.5 = half, 1 = full).
// Always aria-hidden — decorative.
function Moon({ phase = 0.55, size = 28, color, soft = false }) {
  const fill = color || 'var(--anyu-accent)';
  const cover = Math.max(0, Math.min(1, 1 - phase * 2));
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      style={{
        display: 'block',
        filter: soft ? 'drop-shadow(0 0 22px rgba(182,150,100,.45))' : 'none',
      }}
    >
      <defs>
        <mask id={`moonmask-${phase}-${size}`}>
          <rect width="64" height="64" fill="white" />
          {phase < 0.5 && (
            <ellipse
              cx={32 + 22 * cover}
              cy="32"
              rx={22 * (1 - cover * 0.4)}
              ry="22"
              fill="black"
            />
          )}
        </mask>
      </defs>
      <circle cx="32" cy="32" r="22" fill={fill} mask={`url(#moonmask-${phase}-${size})`} />
    </svg>
  );
}

/* ----------------------------- AnyuMark ----------------------------- */
// 暗語 ANYU wordmark with crescent.
function AnyuMark({ size = 11, color, withCrescent = true }) {
  const c = color || 'var(--anyu-dim)';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      fontFamily: 'var(--anyu-font-sans)', color: c, fontSize: size, lineHeight: 1,
    }}>
      {withCrescent && (
        <svg aria-hidden="true" width={size + 2} height={size + 2} viewBox="0 0 14 14">
          <circle cx="7" cy="7" r="5.5" fill="currentColor" opacity="0.18" />
          <path d="M9.5 3.5a5.5 5.5 0 100 7 4 4 0 010-7z" fill="currentColor" />
        </svg>
      )}
      <span style={{ fontFamily: 'var(--anyu-font-serif)', letterSpacing: 'var(--anyu-track-wordmark)', fontWeight: 400 }}>暗語</span>
      <span style={{ fontFamily: 'var(--anyu-font-latin)', fontStyle: 'italic', letterSpacing: 1.5, opacity: 0.85 }}>ANYU</span>
    </span>
  );
}

/* ----------------------------- Section Label ----------------------------- */
// mono uppercase tracking 1.5 label.
function SectionLabel({ children, color, withSlash = false }) {
  const c = color || 'var(--anyu-dim)';
  return (
    <div style={{
      fontFamily: 'var(--anyu-font-mono)',
      fontSize: 11,
      fontWeight: 500,
      color: c,
      letterSpacing: 'var(--anyu-track-mono)',
      textTransform: 'uppercase',
      lineHeight: 1,
    }}>
      {withSlash && <span style={{ marginRight: 6 }}>//</span>}
      {children}
    </div>
  );
}

/* ----------------------------- Chip ----------------------------- */
function Chip({ children, active = false, disabled = false }) {
  return (
    <span
      role="button"
      aria-pressed={active}
      aria-disabled={disabled}
      className={`chip${active ? ' is-active' : ''}`}
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      {children}
    </span>
  );
}

/* ----------------------------- Primary CTA ----------------------------- */
function PrimaryCTA({ children, disabled = false, loading = false, variant = 'primary', onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`btn ${variant === 'accent' ? 'btn-accent' : 'btn-primary'}`}
    >
      {loading
        ? <span style={{ display: 'inline-flex', gap: 6 }}>
            <Dot delay={0} /><Dot delay={200} /><Dot delay={400} />
          </span>
        : children}
    </button>
  );
}

function Dot({ delay = 0 }) {
  return (
    <span style={{
      width: 6, height: 6, borderRadius: 3,
      background: 'currentColor',
      animation: `anyu-pulse 1400ms ${delay}ms infinite ease-in-out`,
    }} />
  );
}

/* ----------------------------- Signal row ----------------------------- */
function Signal({ label, value, hint }) {
  return (
    <div className="signal">
      <span className="signal-label">{label}</span>
      <span className="signal-value">{value}</span>
      <div className="signal-bar"><i style={{ width: `${value}%` }} /></div>
      <div className="signal-hint">{hint}</div>
    </div>
  );
}

/* ----------------------------- Lock icon ----------------------------- */
function LockIcon({ size = 14, color }) {
  const c = color || 'var(--anyu-accent)';
  return (
    <svg aria-label="尚未解鎖" width={size} height={size} viewBox="0 0 14 14">
      <path d="M3.5 7V4.5a3.5 3.5 0 117 0V7" stroke={c} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <rect x="2" y="7" width="10" height="6" rx="1.3" fill={c} />
    </svg>
  );
}

/* ----------------------------- Phone Frame ----------------------------- */
// Bare 390x844 phone with status bar + scrollable inner page.
function Phone({ children, dark = false, statusTime = '21:47', statusBarInk }) {
  const ink = statusBarInk || (dark ? 'var(--anyu-ink-onDark)' : 'var(--anyu-ink)');
  return (
    <div className="anyu-phone" style={{ background: dark ? 'var(--anyu-ink-dark)' : 'var(--anyu-bg)' }}>
      <div className="anyu-phone-status" style={{ color: ink }}>
        <span>{statusTime}</span>
        <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <svg width="16" height="10" viewBox="0 0 16 10" fill={ink}><rect x="0" y="6" width="2" height="4" rx=".5"/><rect x="4" y="4" width="2" height="6" rx=".5"/><rect x="8" y="2" width="2" height="8" rx=".5"/><rect x="12" y="0" width="2" height="10" rx=".5"/></svg>
          <svg width="22" height="10" viewBox="0 0 22 10" fill="none" stroke={ink} strokeWidth="1"><rect x=".5" y=".5" width="18" height="9" rx="2"/><rect x="2" y="2" width="13" height="6" rx="1" fill={ink} stroke="none"/><rect x="19.5" y="3" width="1.5" height="4" rx=".5" fill={ink} stroke="none"/></svg>
        </span>
      </div>
      <div className={`anyu-phone-page${dark ? ' dark on-dark' : ''}`}>{children}</div>
    </div>
  );
}

/* ----------------------------- Pulse animation ----------------------------- */
// inject keyframes once
if (typeof document !== 'undefined' && !document.getElementById('anyu-keyframes')) {
  const s = document.createElement('style');
  s.id = 'anyu-keyframes';
  s.textContent = `
    @keyframes anyu-pulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }
    @keyframes anyu-bar { from { width: 0; } to { width: var(--w, 50%); } }
  `;
  document.head.appendChild(s);
}

Object.assign(window, {
  Moon, AnyuMark, SectionLabel, Chip, PrimaryCTA, Signal, LockIcon, Phone,
});
