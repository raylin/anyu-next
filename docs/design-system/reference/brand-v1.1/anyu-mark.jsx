// anyu-mark.jsx — 暗語 ANYU 品牌標誌 · v1.1
// ─────────────────────────────────────────────────────────────
// Canonical React component for the brand mark.
//
//   import { AnyuMark, AnyuLockup } from './anyu-mark';
//
//   <AnyuMark />                              // 24px, currentColor, static
//   <AnyuMark size={64} />                    // bigger
//   <AnyuMark animated />                     // typing indicator
//   <AnyuMark variant="seal" />               // future-extensible variant slot
//   <AnyuLockup size={32} />                  // mark + ANYU wordmark
//   <AnyuLockup lang="zh" size={28} />        // mark + 暗語 ANYU
//
// All sizing is via the `size` prop (rendered into the SVG width/height).
// Color comes from CSS `color:` — uses currentColor inside.
// ─────────────────────────────────────────────────────────────

function AnyuMark({
  size = 24,
  animated = false,
  title = 'ANYU',
  className = '',
  style = {},
  ...rest
}) {
  if (animated) return <AnyuMarkAnimated size={size} title={title} className={className} style={style} {...rest} />;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={title}
      className={`anyu-mark ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
      {...rest}
    >
      <title>{title}</title>
      <circle cx="22" cy="56" r="7.5" fill="currentColor" opacity="0.55" />
      <circle cx="50" cy="50" r="7.5" fill="currentColor" opacity="0.82" />
      <circle cx="78" cy="44" r="7.5" fill="currentColor" />
    </svg>
  );
}

/* Animated variant — typing indicator. Three dots pulse in sequence.
   Loops infinitely. For "thinking..." UI, AI loading, etc.
   Respects prefers-reduced-motion (anyu-mark.css). */
function AnyuMarkAnimated({ size = 24, title = 'ANYU thinking', className = '', style = {}, ...rest }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={title}
      className={`anyu-mark anyu-mark--typing ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
      {...rest}
    >
      <title>{title}</title>
      <circle className="anyu-mark__dot anyu-mark__dot--1" cx="22" cy="50" r="7.5" fill="currentColor" />
      <circle className="anyu-mark__dot anyu-mark__dot--2" cx="50" cy="50" r="7.5" fill="currentColor" />
      <circle className="anyu-mark__dot anyu-mark__dot--3" cx="78" cy="50" r="7.5" fill="currentColor" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
 *  AnyuLockup — mark + wordmark
 *  ─────────────────────────────────────────────────────────────
 *  Three locks:
 *    lang="en"  (default) →  ⋯  ANYU
 *    lang="zh"            →  ⋯  暗語 / ANYU  (Chinese primary)
 *    lang="stack"         →  vertical stack for square spaces
 * ─────────────────────────────────────────────────────────── */
function AnyuLockup({
  size = 32,
  lang = 'en',
  title = 'ANYU',
  className = '',
  style = {},
}) {
  if (lang === 'stack') {
    return (
      <div className={`anyu-lockup anyu-lockup--stack ${className}`} role="img" aria-label={title} style={style}>
        <AnyuMark size={size * 2.6} aria-hidden="true" title="" />
        <span className="anyu-lockup__zh" style={{ fontSize: size * 1.4 }}>暗語</span>
        <span className="anyu-lockup__en" style={{ fontSize: size * 0.7 }}>ANYU</span>
      </div>
    );
  }
  if (lang === 'zh') {
    return (
      <div className={`anyu-lockup anyu-lockup--zh ${className}`} role="img" aria-label={title} style={style}>
        <AnyuMark size={size * 2.2} aria-hidden="true" title="" />
        <div className="anyu-lockup__divider" />
        <div className="anyu-lockup__zhblock">
          <span className="anyu-lockup__zh" style={{ fontSize: size * 1.5 }}>暗語</span>
          <span className="anyu-lockup__en" style={{ fontSize: size * 0.55 }}>ANYU</span>
        </div>
      </div>
    );
  }
  return (
    <div className={`anyu-lockup anyu-lockup--en ${className}`} role="img" aria-label={title} style={style}>
      <AnyuMark size={size * 2.2} aria-hidden="true" title="" />
      <span className="anyu-lockup__en" style={{ fontSize: size * 1.8 }}>ANYU</span>
    </div>
  );
}

/* Convenience: inline ⋯ for runs of body copy.
   Sizes itself to inherited font-size × 0.85 and vertically aligns to x-height.
   Use: <p>她的意思 <AnyuInline /> 不是真的沒事</p> */
function AnyuInline({ title = 'ANYU' }) {
  return (
    <span className="anyu-mark anyu-mark--inline" aria-label={title} role="img">
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <title>{title}</title>
        <circle cx="22" cy="56" r="7.5" fill="currentColor" opacity="0.55" />
        <circle cx="50" cy="50" r="7.5" fill="currentColor" opacity="0.82" />
        <circle cx="78" cy="44" r="7.5" fill="currentColor" />
      </svg>
    </span>
  );
}

// Expose globally for inline-Babel usage (matches the project's existing pattern).
// In a real codebase you'd `export { AnyuMark, AnyuLockup, AnyuInline }`.
if (typeof window !== 'undefined') {
  Object.assign(window, { AnyuMark, AnyuLockup, AnyuInline });
}
