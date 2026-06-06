// =============================================================
// 暗語 ANYU · Theme Architecture · Module 01 Riso flow screens
// =============================================================
// Clean, static, presentation-grade versions of every ANYU-owned
// surface in the Module 01 journey — all rendered inside the SAME
// Riso visual world. No demo-advance chrome; these are for the canvas.
//
// Proves the thesis: a user who enters 曖昧溫度計 never leaves the
// Riso world until they return to the Core Shell (main site).
// =============================================================

// ---- phone frame ----------------------------------------------------------
function StatusBar() {
  const { V2_INK } = window;
  return (
    <div style={{
      height: 44, padding: '0 26px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', fontWeight: 600, fontSize: 13.5,
      color: V2_INK, position: 'relative', zIndex: 30, background: 'var(--anyu-bg)',
      fontFamily: 'var(--anyu-font-sans)',
    }}>
      <span>9:41</span>
      <span aria-hidden="true" style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 104, height: 24, background: V2_INK, borderRadius: 14 }} />
      <span aria-hidden="true" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
        <svg width="17" height="11" viewBox="0 0 18 11"><rect x="0" y="7" width="3" height="4" rx=".5" fill={V2_INK}/><rect x="5" y="5" width="3" height="6" rx=".5" fill={V2_INK}/><rect x="10" y="2.5" width="3" height="8.5" rx=".5" fill={V2_INK}/><rect x="15" y="0" width="3" height="11" rx=".5" fill={V2_INK}/></svg>
        <svg width="25" height="11" viewBox="0 0 26 11"><rect x=".5" y=".5" width="22" height="10" rx="2.4" fill="none" stroke={V2_INK}/><rect x="2" y="2" width="19" height="7" rx="1.2" fill={V2_INK}/><rect x="23" y="3.5" width="2" height="4" rx=".7" fill={V2_INK}/></svg>
      </span>
    </div>
  );
}

// PhoneScreen — the actual 390×844 device surface (no outer bezel; the
// artboard card frame reads as the device). Scrolls if content overflows.
function PhoneScreen({ children }) {
  return (
    <div className="anyu-v2" style={{ width: 390, height: 844, background: 'var(--anyu-bg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}

// top wordmark row (shared shell chrome)
function TopRow({ back }) {
  const { AnyuWordmark, V2_DIM, V2_SANS } = window;
  return (
    <div style={{ padding: '18px 24px 4px', display: 'flex', alignItems: 'center', justifyContent: back ? 'space-between' : 'flex-end' }}>
      {back && <span style={{ fontSize: 12.5, color: V2_DIM, fontFamily: V2_SANS, whiteSpace: 'nowrap' }}>{back}</span>}
      <AnyuWordmark size="sm" />
    </div>
  );
}

// centered status hero
function StatusHero({ stampProps, eyebrow, title, subtitle, pulse, timeHint }) {
  const { V2_INK, V2_DIM, V2_ACC, V2_SANS, V2_SERIF, V2_MONO, DotPulse, AnyuStatusStamp } = window;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '12px 28px 0' }}>
      <AnyuStatusStamp {...stampProps} />
      {eyebrow && <div style={{ marginTop: 22, fontFamily: V2_MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.6, color: V2_ACC, textTransform: 'uppercase' }}>{eyebrow}</div>}
      <div style={{ marginTop: eyebrow ? 10 : 22, fontFamily: V2_SERIF, fontSize: 23, fontWeight: 500, lineHeight: 1.35, color: V2_INK, letterSpacing: '-0.3px' }}>{title}</div>
      {subtitle && <div style={{ marginTop: 10, fontSize: 13.5, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.7, maxWidth: 290 }}>{subtitle}</div>}
      {pulse && <div style={{ marginTop: 22 }}><DotPulse /></div>}
      {timeHint && <div style={{ marginTop: 16, fontFamily: V2_MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1.6, color: V2_DIM }}>{timeHint}</div>}
    </div>
  );
}

function NextSteps({ items }) {
  const { V2_DIM, V2_ACC, V2_SANS, V2_LATIN } = window;
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {items.map((t, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontFamily: V2_LATIN, fontStyle: 'italic', fontWeight: 700, fontSize: 18, color: V2_ACC, lineHeight: 1.2, flex: '0 0 auto', width: 18 }}>{i + 1}</span>
          <span style={{ fontSize: 13, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.65 }}>{t}</span>
        </div>
      ))}
    </div>
  );
}

// a small reusable "report cover" (the zine artifact) — used by paid-result
// and access-link return so they feel like the same object.
function ReportCover({ unlockedLabel = 'UNLOCKED', stampState = 'done', compact = false }) {
  const { V2_INK, V2_DIM, V2_FAINT, V2_ACC, V2_ACC2, V2_CARD, V2_SURF, V2_SANS, V2_SERIF, V2_LATIN, V2_MONO, AnyuStatusStamp } = window;
  return (
    <div style={{ position: 'relative', background: V2_CARD, border: `1.5px solid ${V2_INK}`, boxShadow: `4px 4px 0 ${V2_ACC}`, padding: '22px 22px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: V2_MONO, fontSize: 10, fontWeight: 700, letterSpacing: 1.8, color: V2_ACC, textTransform: 'uppercase' }}>MODULE · 01</div>
          <div style={{ marginTop: 8, fontFamily: V2_SERIF, fontSize: 24, fontWeight: 500, color: V2_INK, letterSpacing: '-0.2px' }}>曖昧溫度計</div>
        </div>
        <AnyuStatusStamp size={56} motif="moon" progress={1} state={stampState} rotate={-4} compact />
      </div>
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'baseline', gap: 8, fontFamily: V2_MONO, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: V2_DIM, textTransform: 'uppercase' }}>
        <span>My Persona</span><span style={{ color: V2_FAINT }}>·</span>
        <span style={{ fontFamily: V2_SANS, fontWeight: 500, fontSize: 12.5, color: V2_INK, letterSpacing: 0, textTransform: 'none' }}>節奏敏感觀察者</span>
      </div>
      {!compact && (
        <div style={{ marginTop: 12, padding: '12px 14px', background: V2_SURF, border: `1.5px solid ${V2_INK}`, borderLeft: `4px solid ${V2_ACC2}`, fontFamily: V2_SERIF, fontStyle: 'italic', fontSize: 13.5, lineHeight: 1.6, color: V2_INK }}>
          「你感受到的不是拒絕，而是節奏需要重新校準。」
        </div>
      )}
      <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1.5px dashed ${V2_INK}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: V2_MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.5, color: V2_DIM, textTransform: 'uppercase' }}>Temperature</div>
          <div style={{ marginTop: 4, display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ position: 'relative', lineHeight: 1 }}>
              <span aria-hidden="true" style={{ position: 'absolute', left: 2, top: 2, fontFamily: V2_LATIN, fontStyle: 'italic', fontWeight: 700, fontSize: 30, color: V2_ACC2, mixBlendMode: 'multiply', opacity: 0.85 }}>35</span>
              <span style={{ position: 'relative', fontFamily: V2_LATIN, fontStyle: 'italic', fontWeight: 700, fontSize: 30, color: V2_ACC }}>35</span>
            </span>
            <span style={{ fontFamily: V2_SANS, fontSize: 12, color: V2_DIM }}>邀約後降溫</span>
          </div>
        </div>
        <span style={{ fontFamily: V2_MONO, fontSize: 9, fontWeight: 700, letterSpacing: 1, color: V2_ACC2, border: `1.5px solid ${V2_ACC2}`, padding: '3px 7px', textTransform: 'uppercase' }}>{unlockedLabel}</span>
      </div>
    </div>
  );
}

// ===========================================================================
// 1 · checkout-start
// ===========================================================================
function RisoCheckoutStart() {
  const { V2_INK, V2_DIM, V2_ACC2, V2_SANS, AnyuPage, AnyuModuleHeader, AnyuPayProgress, AnyuOrderSummary, AnyuPrimaryButton, AnyuTrustLine, AnyuSupportFooter, AnyuCard } = window;
  return (
    <PhoneScreen><AnyuPage bleeds={[
      { v: 'top', offsetV: 120, h: 'right', offsetH: -34, size: 92, color: 'accent2', opacity: 0.20, rotate: 5 },
      { v: 'top', offsetV: 560, h: 'left', offsetH: -38, size: 104, color: 'accent', opacity: 0.16, rotate: -4 },
    ]}>
      <TopRow back="← 回到結果" />
      <div style={{ padding: '20px 24px 0' }}><AnyuModuleHeader moduleId="01" title="曖昧溫度計" hook="完整報告 · 下一句怎麼回" stamp="moon" /></div>
      <div style={{ padding: '22px 24px 0' }}><AnyuPayProgress active={0} /></div>
      <div style={{ padding: '22px 24px 0' }}>
        <AnyuCard shadow="accent" padding="18px 18px 18px">
          <AnyuOrderSummary product="曖昧溫度計｜完整報告" price="NT$49" note="一次性付款 · 非訂閱制" />
          <div style={{ marginTop: 14, display: 'grid', gap: 9 }}>
            {['下一句怎麼回的 3 種版本', '對方可能的 3 種狀態', '48 小時觀察策略與可收藏摘要卡'].map((t, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 9, alignItems: 'baseline' }}>
                <span aria-hidden="true" style={{ color: V2_ACC2, fontSize: 12 }}>✦</span>
                <span style={{ fontSize: 13, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.6 }}>{t}</span>
              </div>
            ))}
          </div>
        </AnyuCard>
      </div>
      <div style={{ padding: '18px 24px 0' }}><AnyuPrimaryButton shadow="accent2" endIcon="↗">前往安全付款</AnyuPrimaryButton></div>
      <div style={{ padding: '14px 24px 0' }}>
        <AnyuTrustLine>付款由 <b style={{ color: V2_INK, fontWeight: 600 }}>藍新金流</b> 安全處理，ANYU 不會看到你的卡號。付款確認以藍新通知為準。</AnyuTrustLine>
        <div style={{ marginTop: 12, fontSize: 11.5, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.65 }}>付款前需先保存你的專屬查看連結（強制流程，見 ✦ Checkout-start v2）。</div>
      </div>
      <div style={{ padding: '0 24px' }}><AnyuSupportFooter /></div>
      <div style={{ height: 28 }} />
    </AnyuPage></PhoneScreen>
  );
}

// ===========================================================================
// 2 · ReturnURL waiting
// ===========================================================================
function RisoReturnWaiting() {
  const { V2_INK, V2_SANS, AnyuPage, AnyuPayProgress, AnyuCard, AnyuTrustLine, AnyuSupportFooter, AnyuOrnamentRule } = window;
  return (
    <PhoneScreen><AnyuPage bleeds={[
      { v: 'top', offsetV: 240, h: 'left', offsetH: -40, size: 110, color: 'accent', opacity: 0.16, rotate: -3 },
      { v: 'top', offsetV: 600, h: 'right', offsetH: -32, size: 84, color: 'accent2', opacity: 0.18, rotate: 6 },
    ]}>
      <TopRow />
      <StatusHero stampProps={{ size: 96, motif: 'moon', progress: 0.28, state: 'work', rotate: -4 }} eyebrow="// 收到了" title="收到了。" subtitle="我們正在向藍新確認這筆付款 —— 通常一兩分鐘內完成。" timeHint="~ 一兩分鐘內" />
      <div style={{ padding: '28px 24px 0' }}><AnyuPayProgress active={0} /></div>
      <div style={{ padding: '4px 24px 0' }}>
        <AnyuOrnamentRule label="WHAT'S NEXT" zh="接下來會發生什麼" ornament="✦" />
        <NextSteps items={['藍新確認這筆付款（付款結果以藍新通知為準）。', '確認後，我們會立刻開始為你生成完整報告。', '好了會在這頁顯示，也會用你的 LINE / Email 通知你。']} />
      </div>
      <div style={{ padding: '22px 24px 0' }}>
        <AnyuCard shadow="accent" padding="14px 16px">
          <div style={{ fontSize: 13, color: V2_INK, fontFamily: V2_SANS, lineHeight: 1.7 }}>可以安心關掉這一頁。確認完成後它會自己更新，你不會錯過。</div>
        </AnyuCard>
      </div>
      <div style={{ padding: '16px 24px 0' }}><AnyuTrustLine>付款由藍新金流處理；ANYU 端只會收到「已付款」的通知。</AnyuTrustLine></div>
      <div style={{ padding: '0 24px' }}><AnyuSupportFooter /></div>
      <div style={{ height: 28 }} />
    </AnyuPage></PhoneScreen>
  );
}

// ===========================================================================
// 3 · paid result delivery artifact (access wrapper)
// ===========================================================================
function RisoPaidResult() {
  const { V2_INK, V2_DIM, V2_ACC, V2_SANS, V2_SERIF, V2_MONO, AnyuPage, AnyuPrimaryButton, AnyuSupportFooter, AnyuOrnamentRule } = window;
  return (
    <PhoneScreen><AnyuPage bleeds={[
      { v: 'top', offsetV: 220, h: 'right', offsetH: -34, size: 92, color: 'accent', opacity: 0.18, rotate: 5 },
      { v: 'top', offsetV: 640, h: 'left', offsetH: -36, size: 100, color: 'accent2', opacity: 0.16, rotate: -4 },
    ]}>
      <TopRow back="← 回到結果" />
      <div style={{ padding: '18px 24px 0' }}>
        <div style={{ fontFamily: V2_MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.6, color: V2_ACC, textTransform: 'uppercase' }}>// 已解鎖</div>
        <div style={{ marginTop: 10, fontFamily: V2_SERIF, fontSize: 23, fontWeight: 500, color: V2_INK }}>你的完整報告</div>
      </div>
      <div style={{ padding: '18px 24px 0' }}><ReportCover unlockedLabel="UNLOCKED" stampState="done" /></div>
      <div style={{ padding: '20px 24px 0' }}><AnyuPrimaryButton shadow="accent2" endIcon="↗">開啟完整報告</AnyuPrimaryButton></div>
      <div style={{ padding: '0 24px' }}>
        <AnyuOrnamentRule label="INSIDE" zh="這份報告包含" ornament="✦" />
        <div style={{ display: 'grid', gap: 9 }}>
          {['下一句怎麼回的 3 種版本', '對方可能的 3 種狀態', '48 小時觀察策略與摘要卡'].map((t, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 9, alignItems: 'baseline' }}>
              <span aria-hidden="true" style={{ color: 'var(--anyu-accent2)', fontSize: 12 }}>✦</span>
              <span style={{ fontSize: 13, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.6 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '18px 24px 0', textAlign: 'center', fontSize: 11.5, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.7 }}>以網頁形式交付，回 ANYU 用你的專屬查看連結查看完整報告 · 需要協助 hello@anyu.tw</div>
      <div style={{ padding: '0 24px' }}><AnyuSupportFooter /></div>
      <div style={{ height: 28 }} />
    </AnyuPage></PhoneScreen>
  );
}

// ===========================================================================
// 4 · /r/ access-link return (opening a saved link later)
// ===========================================================================
function RisoAccessReturn() {
  const { V2_INK, V2_DIM, V2_FAINT, V2_ACC, V2_ACC2, V2_CARD, V2_SANS, V2_SERIF, V2_MONO, V2_LATIN, AnyuPage, AnyuPrimaryButton, AnyuSupportFooter } = window;
  return (
    <PhoneScreen><AnyuPage bleeds={[
      { v: 'top', offsetV: 150, h: 'left', offsetH: -36, size: 100, color: 'accent', opacity: 0.16, rotate: -4 },
      { v: 'top', offsetV: 600, h: 'right', offsetH: -30, size: 86, color: 'accent2', opacity: 0.18, rotate: 6 },
    ]}>
      <TopRow />
      <div style={{ padding: '14px 24px 0', textAlign: 'center' }}>
        <div style={{ fontFamily: V2_MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.6, color: V2_ACC, textTransform: 'uppercase' }}>// 歡迎回來</div>
        <div style={{ marginTop: 10, fontFamily: V2_SERIF, fontSize: 23, fontWeight: 500, color: V2_INK, lineHeight: 1.35 }}>這份報告，一直為你留著。</div>
        <div style={{ marginTop: 9, fontSize: 13, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.7, maxWidth: 300, marginLeft: 'auto', marginRight: 'auto' }}>你從保存的連結回來了。不用登入 —— 這個連結就是你的鑰匙，請勿轉傳給他人。</div>
      </div>
      <div style={{ padding: '20px 24px 0' }}><ReportCover unlockedLabel="SAVED" stampState="done" compact /></div>
      {/* link validity */}
      <div style={{ padding: '16px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: V2_CARD, border: `1.5px solid ${V2_INK}`, borderLeft: `4px solid ${V2_ACC}` }}>
          <span aria-hidden="true" style={{ flex: '0 0 auto', width: 34, height: 34, borderRadius: '50%', border: `1.5px solid ${V2_ACC}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="17" height="17" viewBox="0 0 18 18"><circle cx="9" cy="9" r="7" fill="none" stroke={V2_ACC} strokeWidth="1.5"/><path d="M9 5v4l2.6 1.6" fill="none" stroke={V2_ACC} strokeWidth="1.5" strokeLinecap="round"/></svg>
          </span>
          <div>
            <div style={{ fontFamily: V2_MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.2, color: V2_DIM, textTransform: 'uppercase' }}>Link Active</div>
            <div style={{ marginTop: 3, fontSize: 12.5, color: V2_INK, fontFamily: V2_SANS, lineHeight: 1.5 }}>此專屬查看連結會在有效期限內保留。</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '18px 24px 0' }}><AnyuPrimaryButton shadow="accent2" endIcon="↗">開啟完整報告</AnyuPrimaryButton></div>
      <div style={{ padding: '12px 24px 0' }}>
        <button style={{ all: 'unset', cursor: 'pointer', width: '100%', height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', background: V2_CARD, border: `1.5px solid ${V2_INK}`, boxShadow: `3px 3px 0 ${V2_INK}`, fontFamily: V2_SERIF, fontWeight: 500, fontSize: 14, color: V2_INK }}>把連結再寄一份到信箱</button>
      </div>
      <div style={{ padding: '0 24px' }}><AnyuSupportFooter /></div>
      <div style={{ height: 28 }} />
    </AnyuPage></PhoneScreen>
  );
}

// ===========================================================================
// 5 · LINE bind (save / deliver the access link via LINE)
// ===========================================================================
function RisoLineBind() {
  const { V2_INK, V2_DIM, V2_ACC, V2_ACC2, V2_CARD, V2_SANS, V2_SERIF, V2_MONO, AnyuPage, AnyuPrimaryButton, AnyuSupportFooter, AnyuOrnamentRule } = window;
  return (
    <PhoneScreen><AnyuPage bleeds={[
      { v: 'top', offsetV: 170, h: 'right', offsetH: -32, size: 90, color: 'accent2', opacity: 0.18, rotate: 5 },
      { v: 'top', offsetV: 580, h: 'left', offsetH: -36, size: 100, color: 'accent', opacity: 0.16, rotate: -4 },
    ]}>
      <TopRow back="← 回到報告" />
      <div style={{ padding: '16px 24px 0' }}>
        <div style={{ fontFamily: V2_MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.6, color: V2_ACC, textTransform: 'uppercase' }}>// 連結保管</div>
        <div style={{ marginTop: 10, fontFamily: V2_SERIF, fontSize: 23, fontWeight: 500, color: V2_INK, lineHeight: 1.35 }}>把連結存進 LINE，<br/>之後一鍵就回得來。</div>
        <div style={{ marginTop: 9, fontSize: 13, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.7 }}>加入 ANYU 官方帳號，我們會把這份報告的連結用 LINE 傳給你；報告補發或更新也會通知。</div>
      </div>
      <div style={{ padding: '6px 24px 0' }}>
        <AnyuOrnamentRule label="YOU'LL GET" zh="你會收到" ornament="✦" />
        <div style={{ display: 'grid', gap: 9 }}>
          {['這份報告的專屬連結（即按即看，不需登入）', '若報告需要補發，我們直接補給你', '未來模組上線，最多一則溫柔提醒'].map((t, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 9, alignItems: 'baseline' }}>
              <span aria-hidden="true" style={{ color: V2_ACC2, fontSize: 12 }}>✦</span>
              <span style={{ fontSize: 13, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.6 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '20px 24px 0' }}><AnyuPrimaryButton shadow="accent2" endIcon="↗">加入 LINE 並接收連結</AnyuPrimaryButton></div>
      <div style={{ padding: '12px 24px 0', display: 'flex', justifyContent: 'center' }}>
        <button style={{ all: 'unset', cursor: 'pointer', fontFamily: V2_SANS, fontSize: 13, color: V2_INK, borderBottom: `1.5px solid ${V2_INK}`, paddingBottom: 1 }}>改用 Email 收連結</button>
      </div>
      <div style={{ padding: '16px 24px 0', fontSize: 11.5, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.7 }}>我們只用它送你的報告連結 · 不寄電子報 · 不分享第三方 · 隨時可解除。</div>
      <div style={{ padding: '0 24px' }}><AnyuSupportFooter /></div>
      <div style={{ height: 28 }} />
    </AnyuPage></PhoneScreen>
  );
}

// ===========================================================================
// 6 · Email save (access-link save) — form surface
// ===========================================================================
function RisoEmailSave() {
  const { V2_INK, V2_DIM, V2_FAINT, V2_ACC, V2_ACC2, V2_CARD, V2_SURF, V2_SANS, V2_SERIF, V2_MONO, AnyuPage, AnyuPrimaryButton, AnyuSupportFooter } = window;
  const Field = ({ label, placeholder, optional }) => (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, fontFamily: V2_MONO, fontSize: 10, fontWeight: 700, letterSpacing: 1.4, color: V2_DIM, textTransform: 'uppercase' }}>
        <span>{label}</span>{optional && <span style={{ color: V2_FAINT, letterSpacing: 0, textTransform: 'none', fontFamily: V2_SANS, fontWeight: 400, fontSize: 11 }}>· 選填</span>}
      </div>
      <div style={{ marginTop: 7, height: 46, display: 'flex', alignItems: 'center', padding: '0 14px', background: V2_CARD, border: `1.5px solid ${V2_INK}`, fontFamily: V2_SANS, fontSize: 13.5, color: V2_FAINT }}>{placeholder}</div>
    </div>
  );
  return (
    <PhoneScreen><AnyuPage bleeds={[
      { v: 'top', offsetV: 150, h: 'left', offsetH: -36, size: 100, color: 'accent', opacity: 0.16, rotate: -4 },
      { v: 'top', offsetV: 620, h: 'right', offsetH: -30, size: 84, color: 'accent2', opacity: 0.18, rotate: 6 },
    ]}>
      <TopRow back="← 回到報告" />
      <div style={{ padding: '16px 24px 0' }}>
        <div style={{ fontFamily: V2_MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.6, color: V2_ACC, textTransform: 'uppercase' }}>// 連結保管</div>
        <div style={{ marginTop: 10, fontFamily: V2_SERIF, fontSize: 23, fontWeight: 500, color: V2_INK, lineHeight: 1.35 }}>把連結寄到信箱，<br/>換手機也找得到。</div>
        <div style={{ marginTop: 9, fontSize: 13, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.7 }}>我們把你的專屬查看連結寄給你 —— 信件裡是連結，回 ANYU 查看完整報告。</div>
      </div>
      <div style={{ padding: '8px 24px 0' }}>
        <Field label="Email" placeholder="you@example.com" />
      </div>
      <div style={{ padding: '20px 24px 0' }}><AnyuPrimaryButton shadow="accent2" endIcon="↗">把專屬查看連結寄給我</AnyuPrimaryButton></div>
      <div style={{ padding: '16px 24px 0', fontSize: 11.5, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.7 }}>不寄電子報 · 不分享第三方 · 隨時可刪除。此專屬查看連結會在有效期限內保留。</div>
      <div style={{ padding: '0 24px' }}><AnyuSupportFooter /></div>
      <div style={{ height: 28 }} />
    </AnyuPage></PhoneScreen>
  );
}

// ===========================================================================
// 7 · expired access link (themeable error state)
// ===========================================================================
function RisoExpiredLink() {
  const { V2_INK, V2_DIM, V2_SANS, AnyuPage, AnyuCard, AnyuPrimaryButton, AnyuSupportFooter } = window;
  return (
    <PhoneScreen><AnyuPage bleeds={[
      { v: 'top', offsetV: 200, h: 'left', offsetH: -36, size: 100, color: 'rose', opacity: 0.20, rotate: -3 },
      { v: 'top', offsetV: 580, h: 'right', offsetH: -30, size: 84, color: 'accent', opacity: 0.16, rotate: 6 },
    ]}>
      <TopRow />
      <StatusHero stampProps={{ size: 96, motif: 'moon', progress: 0.15, state: 'error', rotate: -4 }} eyebrow="// 連結休息了" title={<>這個連結<br/>已經過了保留期。</>} subtitle="完整報告的查看連結有保留期限 —— 這一份已經過期了。別擔心，我們可以幫你補一份。" />
      <div style={{ padding: '26px 24px 0' }}>
        <AnyuCard shadow="rose" padding="16px 18px">
          <div style={{ fontSize: 13, color: V2_INK, fontFamily: V2_SANS, lineHeight: 1.75 }}>來信告訴我們這份報告，我們會在 3–7 個工作天內人工為你補發；若需要，也可以重新解鎖一次。</div>
        </AnyuCard>
      </div>
      <div style={{ padding: '18px 24px 0' }}>
        <AnyuPrimaryButton shadow="accent2">來信補發這份報告</AnyuPrimaryButton>
        <div style={{ marginTop: 10 }}>
          <button style={{ all: 'unset', cursor: 'pointer', width: '100%', height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', background: 'var(--anyu-card)', border: `1.5px solid ${V2_INK}`, boxShadow: `3px 3px 0 ${V2_INK}`, fontFamily: 'var(--anyu-font-serif)', fontWeight: 500, fontSize: 14, color: V2_INK }}>重新測一次溫度</button>
        </div>
      </div>
      <div style={{ padding: '16px 24px 0', textAlign: 'center', fontSize: 11.5, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.7 }}>需要協助請來信 hello@anyu.tw</div>
      <div style={{ padding: '0 24px' }}><AnyuSupportFooter /></div>
      <div style={{ height: 28 }} />
    </AnyuPage></PhoneScreen>
  );
}

Object.assign(window, {
  PhoneScreen, RisoStatusBar: StatusBar, ReportCover,
  RisoCheckoutStart, RisoReturnWaiting, RisoPaidResult,
  RisoAccessReturn, RisoLineBind, RisoEmailSave, RisoExpiredLink,
});
