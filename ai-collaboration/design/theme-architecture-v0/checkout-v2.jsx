// =============================================================
// 暗語 ANYU · Theme Architecture · PATCH — Checkout-start v2
// =============================================================
// Product-flow correction (visual reference only — flow/copy must follow
// product source-of-truth, see CHECKOUT_PATCH_MEMO.md):
//   · 付款前「強制」先保存專屬查看連結，才 unlock 付款 CTA
//   · Desktop = Email-only 保存（無 LINE CTA）
//   · Mobile  = LINE 卡片在上、Email fallback 在下
//   · 文案：保存查看連結 / 專屬查看連結 / 回 ANYU 查看完整報告
//   · 不承諾 Email/LINE 寄送報告正文；不寫固定天數；無內測字樣；
//     無 consent checkbox；無 LINE ID 選填欄
// All Module 01 (Riso) themed.
// =============================================================

const RETENTION_COPY = '此專屬查看連結會在有效期限內保留。'; // retention copy → follow product policy

// padlock glyph (simple shape)
function Lock({ size = 13, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden="true" style={{ flex: '0 0 auto' }}>
      <rect x="2.5" y="6" width="9" height="6.5" rx="1" fill="none" stroke={color} strokeWidth="1.4"/>
      <path d="M4.3 6V4.4a2.7 2.7 0 015.4 0V6" fill="none" stroke={color} strokeWidth="1.4"/>
    </svg>
  );
}
// generic chat-bubble glyph for the LINE save card (not LINE branded UI)
function ChatGlyph({ size = 18, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3 4h14a1 1 0 011 1v8a1 1 0 01-1 1H8l-4 3v-3H3a1 1 0 01-1-1V5a1 1 0 011-1z" fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

// Email field (filled = saved state)
function EmailField({ filled }) {
  const { V2_INK, V2_FAINT, V2_ACC, V2_CARD, V2_SANS, V2_MONO } = window;
  return (
    <div>
      <div style={{ fontFamily: V2_MONO, fontSize: 10, fontWeight: 700, letterSpacing: 1.4, color: 'var(--anyu-dim)', textTransform: 'uppercase' }}>Email</div>
      <div style={{ marginTop: 7, height: 46, display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', background: V2_CARD, border: `1.5px solid ${V2_INK}`, boxShadow: filled ? `3px 3px 0 ${V2_ACC}` : 'none' }}>
        <span style={{ fontFamily: V2_SANS, fontSize: 13.5, color: filled ? V2_INK : V2_FAINT, flex: 1 }}>{filled ? 'you@example.com' : 'you@example.com'}</span>
        {filled && (
          <span style={{ flex: '0 0 auto', width: 18, height: 18, borderRadius: '50%', background: V2_ACC, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5 L4 7.5 L10 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
        )}
      </div>
    </div>
  );
}

// pay CTA — locked until the access link is saved
function PayCTA({ locked }) {
  const { V2_INK, V2_DIM, V2_BG, V2_SANS, V2_SERIF, AnyuPrimaryButton } = window;
  if (!locked) return <AnyuPrimaryButton shadow="accent2" endIcon="↗">前往安全付款</AnyuPrimaryButton>;
  return (
    <div>
      <div aria-disabled="true" style={{ width: '100%', height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: V2_BG, border: `1.5px dashed ${V2_INK}`, opacity: 0.5, cursor: 'not-allowed', fontFamily: V2_SERIF, fontWeight: 500, fontSize: 15, color: V2_INK }}>
        <Lock size={14} color={V2_INK} /> 前往安全付款
      </div>
      <div style={{ marginTop: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11.5, color: V2_DIM, fontFamily: V2_SANS }}>
        <span aria-hidden="true" style={{ color: 'var(--anyu-accent)' }}>↑</span> 請先保存你的專屬查看連結，才能繼續付款。
      </div>
    </div>
  );
}

// shared "what you get" bullets (report viewed on ANYU — no email-body promise)
function InsideBullets() {
  const { V2_DIM, V2_ACC2, V2_SANS } = window;
  return (
    <div style={{ display: 'grid', gap: 9 }}>
      {['下一句怎麼回的 3 種版本', '對方可能的 3 種狀態', '48 小時觀察策略與可收藏摘要卡'].map((t, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 9, alignItems: 'baseline' }}>
          <span aria-hidden="true" style={{ color: V2_ACC2, fontSize: 12 }}>✦</span>
          <span style={{ fontSize: 13, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.6 }}>{t}</span>
        </div>
      ))}
    </div>
  );
}

// ===========================================================================
// Desktop checkout-start — Email-only save gate (pre-save / locked state)
// ===========================================================================
function DesktopCheckout() {
  const { V2_INK, V2_DIM, V2_FAINT, V2_ACC, V2_CARD, V2_SURF, V2_SANS, V2_SERIF, V2_MONO, AnyuPage, AnyuModuleHeader, AnyuOrderSummary, AnyuTrustLine, AnyuOrnamentRule } = window;
  return (
    <div style={{ width: 1000, height: 660, background: V2_CARD, border: `1.5px solid ${V2_INK}`, boxShadow: `6px 6px 0 ${V2_ACC}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* browser chrome */}
      <div style={{ height: 42, flex: '0 0 42px', borderBottom: `1.5px solid ${V2_INK}`, display: 'flex', alignItems: 'center', gap: 14, padding: '0 16px', background: V2_SURF }}>
        <span style={{ display: 'inline-flex', gap: 7 }}>
          {[V2_FAINT, V2_FAINT, V2_FAINT].map((c, i) => <span key={i} style={{ width: 11, height: 11, borderRadius: '50%', border: `1.5px solid ${V2_INK}`, background: 'transparent' }} />)}
        </span>
        <span style={{ flex: 1, maxWidth: 460, height: 24, display: 'flex', alignItems: 'center', padding: '0 12px', background: V2_CARD, border: `1.5px solid ${V2_INK}`, fontFamily: V2_MONO, fontSize: 10.5, color: V2_DIM, letterSpacing: 0.4 }}>anyu.tw/m/ai-temperature/checkout</span>
        <span style={{ fontFamily: V2_MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.2, color: V2_FAINT, textTransform: 'uppercase' }}>Desktop</span>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <AnyuPage bleeds={[
          { v: 'top', offsetV: 90, h: 'right', offsetH: -40, size: 110, color: 'accent2', opacity: 0.16, rotate: 5 },
          { v: 'top', offsetV: 380, h: 'left', offsetH: -44, size: 120, color: 'accent', opacity: 0.14, rotate: -4 },
        ]}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.06fr', gap: 40, padding: '40px 52px 0', maxWidth: 980, margin: '0 auto', alignItems: 'start' }}>
            {/* left · identity + order */}
            <div>
              <AnyuModuleHeader moduleId="01" title="曖昧溫度計" hook="完整報告 · 下一句怎麼回" stamp="moon" />
              <div style={{ marginTop: 22 }}><AnyuOrderSummary product="曖昧溫度計｜完整報告" price="NT$49" note="一次性付款 · 非訂閱制" /></div>
              <div style={{ marginTop: 16 }}><InsideBullets /></div>
              <div style={{ marginTop: 18 }}><AnyuTrustLine>付款由 <b style={{ color: V2_INK, fontWeight: 600 }}>藍新金流</b> 安全處理，ANYU 不會看到你的卡號。付款確認以藍新通知為準。</AnyuTrustLine></div>
            </div>
            {/* right · the mandatory save gate */}
            <div style={{ background: V2_CARD, border: `1.5px solid ${V2_INK}`, boxShadow: `4px 4px 0 ${V2_ACC}`, padding: '22px 24px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: 'var(--anyu-font-latin)', fontStyle: 'italic', fontWeight: 700, fontSize: 18, color: V2_ACC }}>1</span>
                <span style={{ fontFamily: V2_MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.4, color: V2_ACC, textTransform: 'uppercase' }}>先保存你的專屬查看連結</span>
              </div>
              <div style={{ marginTop: 10, fontSize: 13, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.7 }}>報告完成後，你會回 ANYU 用這個專屬查看連結看完整報告。先把它存到信箱，才能繼續付款。</div>
              <div style={{ marginTop: 16 }}><EmailField filled={false} /></div>
              <div style={{ marginTop: 14 }}>
                <button style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', width: '100%', height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: V2_ACC, color: 'var(--anyu-ink-onDark)', border: `1.5px solid ${V2_INK}`, boxShadow: `4px 4px 0 ${V2_INK}`, fontFamily: V2_SERIF, fontWeight: 500, fontSize: 14.5 }}>保存查看連結</button>
              </div>
              <div style={{ marginTop: 11, fontSize: 11, color: V2_FAINT, fontFamily: V2_SANS, lineHeight: 1.65 }}>{RETENTION_COPY}</div>

              <div style={{ margin: '20px 0 16px', height: 1.5, background: V2_INK, opacity: 0.85 }} />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
                <span style={{ fontFamily: 'var(--anyu-font-latin)', fontStyle: 'italic', fontWeight: 700, fontSize: 18, color: V2_FAINT }}>2</span>
                <span style={{ fontFamily: V2_MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.4, color: V2_FAINT, textTransform: 'uppercase' }}>前往安全付款</span>
              </div>
              <PayCTA locked />
            </div>
          </div>
          <div style={{ height: 28 }} />
        </AnyuPage>
      </div>
    </div>
  );
}

// ===========================================================================
// Mobile checkout-start — LINE save (top) + Email fallback (below), gated
// ===========================================================================
function MobileCheckout() {
  const { V2_INK, V2_DIM, V2_FAINT, V2_ACC, V2_ACC2, V2_CARD, V2_SURF, V2_SANS, V2_SERIF, V2_MONO, AnyuPage, AnyuModuleHeader, AnyuOrderSummary, AnyuTrustLine, AnyuOrnamentRule, PhoneScreen, AnyuWordmark } = window;
  return (
    <PhoneScreen><AnyuPage bleeds={[
      { v: 'top', offsetV: 130, h: 'right', offsetH: -34, size: 92, color: 'accent2', opacity: 0.20, rotate: 5 },
      { v: 'top', offsetV: 640, h: 'left', offsetH: -38, size: 104, color: 'accent', opacity: 0.16, rotate: -4 },
    ]}>
      <div style={{ padding: '18px 24px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12.5, color: V2_DIM, fontFamily: V2_SANS, whiteSpace: 'nowrap' }}>← 回到結果</span>
        <AnyuWordmark size="sm" />
      </div>
      <div style={{ padding: '18px 24px 0' }}><AnyuModuleHeader moduleId="01" title="曖昧溫度計" hook="完整報告 · 下一句怎麼回" stamp="moon" /></div>
      <div style={{ padding: '20px 24px 0' }}><AnyuOrderSummary product="曖昧溫度計｜完整報告" price="NT$49" note="一次性付款 · 非訂閱制" /></div>

      <div style={{ padding: '4px 24px 0' }}>
        <AnyuOrnamentRule label="STEP 1" zh="先保存你的專屬查看連結" ornament="✦" />
        <div style={{ fontSize: 12.5, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.65, marginBottom: 14 }}>報告完成後，回 ANYU 用這個專屬連結查看完整報告。先保存它，才能繼續付款。</div>
        {/* LINE save card — ON TOP (primary) */}
        <div style={{ background: V2_CARD, border: `1.5px solid ${V2_INK}`, boxShadow: `4px 4px 0 ${V2_ACC}`, padding: '15px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ flex: '0 0 auto', width: 30, height: 30, borderRadius: 4, border: `1.5px solid ${V2_INK}`, background: V2_SURF, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChatGlyph size={17} color={V2_ACC} /></span>
            <div>
              <div style={{ fontFamily: V2_SERIF, fontSize: 15, fontWeight: 500, color: V2_INK }}>用 LINE 保存查看連結</div>
              <div style={{ marginTop: 2, fontSize: 11.5, color: V2_DIM, fontFamily: V2_SANS }}>保存後，回 ANYU 一鍵查看完整報告</div>
            </div>
          </div>
          <button style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', marginTop: 12, width: '100%', height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: V2_INK, color: 'var(--anyu-ink-onDark)', border: `1.5px solid ${V2_INK}`, boxShadow: `3px 3px 0 ${V2_ACC2}`, fontFamily: V2_SERIF, fontWeight: 500, fontSize: 14.5 }}>用 LINE 保存 <span style={{ color: V2_ACC2, fontFamily: 'var(--anyu-font-latin)', fontStyle: 'italic', fontWeight: 700 }}>↗</span></button>
          <div style={{ marginTop: 9, fontSize: 11, color: V2_FAINT, fontFamily: V2_SANS, lineHeight: 1.6 }}>LINE 沒完成？<span style={{ color: V2_INK, borderBottom: `1px solid ${V2_INK}` }}>重試 LINE</span>，或改用下方 Email。</div>
        </div>
        {/* Email fallback — BELOW */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontFamily: V2_MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.2, color: V2_FAINT, textTransform: 'uppercase', marginBottom: 9 }}>或用 Email 保存</div>
          <EmailField filled={false} />
          <button style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', marginTop: 10, width: '100%', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: V2_CARD, border: `1.5px solid ${V2_INK}`, boxShadow: `3px 3px 0 ${V2_INK}`, fontFamily: V2_SERIF, fontWeight: 500, fontSize: 13.5, color: V2_INK }}>用 Email 保存查看連結</button>
        </div>
        <div style={{ marginTop: 11, fontSize: 11, color: V2_FAINT, fontFamily: V2_SANS, lineHeight: 1.65 }}>{RETENTION_COPY}</div>
      </div>

      <div style={{ padding: '6px 24px 0' }}>
        <AnyuOrnamentRule label="STEP 2" zh="前往安全付款" ornament="✦" />
        <PayCTA locked />
      </div>
      <div style={{ padding: '16px 24px 0' }}><AnyuTrustLine>付款由 <b style={{ color: V2_INK, fontWeight: 600 }}>藍新金流</b> 安全處理，ANYU 不會看到你的卡號。</AnyuTrustLine></div>
      <div style={{ height: 30 }} />
    </AnyuPage></PhoneScreen>
  );
}

// ===========================================================================
// saved → unlocked mini compare (the gate's two states)
// ===========================================================================
function SavedUnlockedCompare() {
  const { V2_INK, V2_DIM, V2_FAINT, V2_ACC, V2_CARD, V2_SANS, V2_SERIF, V2_MONO } = window;
  const State = ({ tag, saved }) => (
    <div style={{ flex: 1, background: V2_CARD, border: `1.5px solid ${V2_INK}`, boxShadow: `4px 4px 0 ${saved ? V2_ACC : 'rgba(26,22,38,.14)'}`, padding: '18px 18px 20px' }}>
      <div style={{ fontFamily: V2_MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.2, color: saved ? V2_ACC : V2_FAINT, textTransform: 'uppercase', marginBottom: 12 }}>{tag}</div>
      <EmailField filled={saved} />
      <div style={{ marginTop: 14 }}><PayCTA locked={!saved} /></div>
    </div>
  );
  return (
    <div style={{ width: 720, background: V2_CARD, border: `1.5px solid ${V2_INK}`, boxShadow: `5px 5px 0 ${V2_ACC}`, padding: '26px 28px' }}>
      <div style={{ fontFamily: V2_MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.4, color: V2_ACC, textTransform: 'uppercase' }}>// GATE · 兩個狀態</div>
      <div style={{ marginTop: 10, fontFamily: V2_SERIF, fontSize: 21, fontWeight: 500, color: V2_INK, letterSpacing: '-0.3px' }}>保存查看連結 → 解鎖付款</div>
      <div style={{ marginTop: 16, display: 'flex', gap: 18, alignItems: 'center' }}>
        <State tag="未保存 · 付款鎖住" saved={false} />
        <span aria-hidden="true" style={{ fontFamily: 'var(--anyu-font-latin)', fontStyle: 'italic', fontWeight: 700, fontSize: 24, color: V2_ACC }}>→</span>
        <State tag="已保存 · 付款解鎖" saved={true} />
      </div>
    </div>
  );
}

Object.assign(window, { DesktopCheckout, MobileCheckout, SavedUnlockedCompare });
