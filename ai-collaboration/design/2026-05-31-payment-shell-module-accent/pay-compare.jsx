// =============================================================
// 暗語 ANYU · Payment Shell · Direction A & B (comparison only)
// =============================================================
// Shown side-by-side with Direction C on the two pivotal screens:
//   checkout-start  ·  ReturnURL waiting
//
// A = 保守：最少改動。v2 tokens but restrained — calm, typographic,
//     almost no riso ornament. Risk: still reads a little generic /
//     discontinuous from the editorial result page.
// B = 中間：full riso editorial applied directly to payment. Rich,
//     but module identity styling is woven THROUGHOUT — every new
//     module re-does the whole thing.
// C = 可延展 (in pay-screens-c.jsx): editorial AND systematised into
//     a fixed shell + a thin accent slot.
// =============================================================

// ---------- Direction A · checkout-start ----------
function AcheckoutStart() {
  const {
    V2_INK, V2_DIM, V2_FAINT, V2_ACC, V2_CARD, V2_SURF, V2_SANS, V2_SERIF, V2_LATIN, V2_MONO,
    AnyuPage, AnyuWordmark, AnyuPrimaryButton,
  } = window;
  return (
    <AnyuPage bleeds={[]} grain={false}>
      <div style={{ padding: '18px 24px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button style={{ all: 'unset', fontSize: 12.5, color: V2_DIM, fontFamily: V2_SANS, whiteSpace: 'nowrap' }}>← 回到結果</button>
        <AnyuWordmark size="sm" />
      </div>

      <div style={{ padding: '34px 24px 0', textAlign: 'center' }}>
        <div style={{ fontFamily: V2_MONO, fontSize: 10, fontWeight: 700, letterSpacing: 1.6, color: V2_DIM, textTransform: 'uppercase' }}>
          付款 · 步驟 1 / 3
        </div>
        <div style={{ marginTop: 14, fontFamily: V2_SERIF, fontSize: 22, fontWeight: 500, color: V2_INK }}>
          解鎖完整報告
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: V2_DIM, fontFamily: V2_SANS }}>
          曖昧溫度計 · 完整報告
        </div>
      </div>

      <div style={{ padding: '26px 24px 0' }}>
        <div style={{
          background: V2_CARD, border: `1.5px solid ${V2_INK}`, borderRadius: 2, padding: '18px 20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontFamily: V2_SERIF, fontSize: 15, color: V2_INK }}>完整報告</span>
            <span style={{ fontFamily: V2_LATIN, fontStyle: 'italic', fontWeight: 700, fontSize: 22, color: V2_INK }}>NT$49</span>
          </div>
          <div style={{ marginTop: 6, fontSize: 11.5, color: V2_DIM, fontFamily: V2_SANS }}>
            一次性付款 · 非訂閱制
          </div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid var(--anyu-line-soft)`, display: 'grid', gap: 8 }}>
            {['下一句怎麼回的 3 種版本', '對方可能的 3 種狀態', '48 小時觀察與摘要卡'].map((t, i) => (
              <div key={i} style={{ fontSize: 12.5, color: V2_DIM, fontFamily: V2_SANS }}>· {t}</div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 24px 0' }}>
        <AnyuPrimaryButton shadow="ink">前往安全付款</AnyuPrimaryButton>
      </div>
      <div style={{ padding: '14px 24px 0', fontSize: 11.5, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.65, textAlign: 'center' }}>
        付款由藍新金流安全處理，付款確認以藍新通知為準。<br/>目前內測中，這次不會真的收費。
      </div>
      <div style={{ padding: '18px 24px 0', display: 'flex', justifyContent: 'center', gap: 10, fontSize: 12, color: V2_INK, fontFamily: V2_SANS }}>
        <span style={{ borderBottom: `1px solid ${V2_INK}` }}>退款政策</span>
        <span style={{ color: V2_FAINT }}>·</span>
        <span style={{ borderBottom: `1px dotted ${V2_INK}` }}>hello@anyu.tw</span>
      </div>
      <div style={{ height: 30 }} />
    </AnyuPage>
  );
}

// ---------- Direction A · ReturnURL waiting ----------
function AReturnWaiting() {
  const {
    V2_INK, V2_DIM, V2_ACC, V2_SANS, V2_SERIF, V2_MONO, DotPulse,
    AnyuPage, AnyuWordmark,
  } = window;
  return (
    <AnyuPage bleeds={[]} grain={false}>
      <div style={{ padding: '18px 24px 4px', display: 'flex', justifyContent: 'flex-end' }}>
        <AnyuWordmark size="sm" />
      </div>
      <div style={{
        padding: '90px 28px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      }}>
        <DotPulse />
        <div style={{ marginTop: 26, fontFamily: V2_SERIF, fontSize: 21, fontWeight: 500, color: V2_INK }}>
          收到了，正在確認付款
        </div>
        <div style={{ marginTop: 10, fontSize: 13, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.7, maxWidth: 280 }}>
          我們正在向藍新確認這筆付款，確認後這頁會自動更新。
        </div>
        <div style={{ marginTop: 18, fontFamily: V2_MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1.4, color: V2_DIM }}>
          ~ 一兩分鐘內
        </div>
      </div>
      <div style={{ padding: '40px 24px 0', textAlign: 'center', fontSize: 11.5, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.7 }}>
        付款確認以藍新通知為準 · 需要協助 hello@anyu.tw
      </div>
    </AnyuPage>
  );
}

// ---------- Direction B · checkout-start (maximal editorial) ----------
function BcheckoutStart() {
  const {
    V2_INK, V2_DIM, V2_FAINT, V2_ACC, V2_ACC2, V2_ROSE, V2_CARD, V2_SURF, V2_SANS, V2_SERIF, V2_LATIN, V2_MONO,
    AnyuPage, AnyuWordmark, AnyuMoonStamp, AnyuOrnamentRule, AnyuPrimaryButton, AnyuPullQuote,
  } = window;
  return (
    <AnyuPage bleeds={[
      { v: 'top', offsetV: 90, h: 'right', offsetH: -30, size: 96, color: 'accent2', opacity: 0.3, rotate: 6 },
      { v: 'top', offsetV: 520, h: 'left', offsetH: -40, size: 120, color: 'accent', opacity: 0.2, rotate: -5 },
      { v: 'top', offsetV: 980, h: 'right', offsetH: -26, size: 80, color: 'rose', opacity: 0.3, rotate: 6 },
    ]}>
      <div style={{ padding: '18px 24px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button style={{ all: 'unset', fontSize: 12.5, color: V2_DIM, fontFamily: V2_SANS, whiteSpace: 'nowrap' }}>← 回到結果</button>
        <AnyuWordmark size="sm" />
      </div>

      <div style={{ padding: '26px 24px 0' }}>
        <div style={{ fontFamily: V2_MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.8, color: V2_ACC, textTransform: 'uppercase' }}>
          // CHECKOUT · MODULE 01
        </div>
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: V2_SERIF, fontSize: 30, fontWeight: 500, lineHeight: 1.2, color: V2_INK, letterSpacing: '-0.4px' }}>
              下一句怎麼回，<br/>給你 3 種版本。
            </div>
          </div>
          <AnyuMoonStamp size={64} rotate={-5} />
        </div>
      </div>

      {/* big ghost price */}
      <div style={{ padding: '22px 24px 0' }}>
        <div style={{
          background: V2_CARD, border: `1.5px solid ${V2_INK}`, boxShadow: `4px 4px 0 ${V2_ACC}`, padding: '18px 20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontFamily: V2_MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.4, color: V2_DIM, textTransform: 'uppercase' }}>ONE-TIME · NO SUB</div>
              <div style={{ marginTop: 6, fontFamily: V2_SERIF, fontSize: 15, color: V2_INK }}>曖昧溫度計｜完整報告</div>
            </div>
            <div style={{ position: 'relative', lineHeight: 1 }}>
              <span aria-hidden="true" style={{ position: 'absolute', left: 2, top: 2, fontFamily: V2_LATIN, fontStyle: 'italic', fontWeight: 700, fontSize: 34, color: V2_ACC2, mixBlendMode: 'multiply', opacity: 0.85 }}>NT$49</span>
              <span style={{ position: 'relative', fontFamily: V2_LATIN, fontStyle: 'italic', fontWeight: 700, fontSize: 34, color: V2_ACC }}>NT$49</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 24px' }}>
        <AnyuOrnamentRule label="WHAT'S INSIDE" zh="這次包含什麼" ornament="✦" />
        <div style={{ display: 'grid', gap: 10 }}>
          {['下一句怎麼回的 3 種版本', '對方可能的 3 種狀態', '48 小時觀察策略與可收藏摘要卡'].map((t, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 12, alignItems: 'baseline' }}>
              <span style={{ fontFamily: V2_LATIN, fontStyle: 'italic', fontWeight: 700, fontSize: 18, color: V2_ACC }}>{`0${i + 1}`}</span>
              <span style={{ fontSize: 13.5, color: V2_INK, fontFamily: V2_SANS, lineHeight: 1.6 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '22px 24px 0' }}>
        <AnyuPrimaryButton shadow="accent2" endIcon="↗">前往安全付款</AnyuPrimaryButton>
      </div>
      <div style={{ padding: '14px 24px 0', fontSize: 11.5, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.65, textAlign: 'center' }}>
        付款由藍新金流安全處理 · 付款確認以藍新通知為準 · 內測中不會真的收費
      </div>
      <div style={{ padding: '16px 24px 0', display: 'flex', justifyContent: 'center', gap: 10, fontSize: 12, color: V2_INK, fontFamily: V2_SANS }}>
        <span style={{ borderBottom: `1.5px solid ${V2_INK}` }}>退款政策</span>
        <span style={{ color: V2_FAINT }}>·</span>
        <span style={{ borderBottom: `1px dotted ${V2_INK}` }}>hello@anyu.tw</span>
      </div>
      <div style={{ height: 30 }} />
    </AnyuPage>
  );
}

// ---------- Direction B · ReturnURL waiting (maximal editorial) ----------
function BReturnWaiting() {
  const {
    V2_INK, V2_DIM, V2_ACC, V2_ACC2, V2_SANS, V2_SERIF, V2_MONO,
    AnyuPage, AnyuWordmark, AnyuMoonStamp, AnyuOrnamentRule, AnyuPullQuote, DotPulse,
  } = window;
  return (
    <AnyuPage bleeds={[
      { v: 'top', offsetV: 120, h: 'left', offsetH: -40, size: 120, color: 'accent', opacity: 0.2, rotate: -4 },
      { v: 'top', offsetV: 520, h: 'right', offsetH: -30, size: 90, color: 'accent2', opacity: 0.26, rotate: 6 },
    ]}>
      <div style={{ padding: '18px 24px 4px', display: 'flex', justifyContent: 'flex-end' }}>
        <AnyuWordmark size="sm" />
      </div>
      <div style={{ padding: '24px 28px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <AnyuMoonStamp size={100} rotate={-4} />
        <div style={{ marginTop: 22, fontFamily: V2_MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.8, color: V2_ACC, textTransform: 'uppercase' }}>
          // 收到了 · 確認中
        </div>
        <div style={{ marginTop: 12, fontFamily: V2_SERIF, fontSize: 26, fontWeight: 500, lineHeight: 1.3, color: V2_INK, letterSpacing: '-0.3px' }}>
          收到了。<br/>正在向藍新確認。
        </div>
        <div style={{ marginTop: 12, fontSize: 13.5, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.7, maxWidth: 290 }}>
          付款結果以藍新通知為準。確認完成後，我們會立刻開始生成你的完整報告。
        </div>
        <div style={{ marginTop: 22 }}><DotPulse /></div>
      </div>

      <div style={{ padding: '6px 24px 0' }}>
        <AnyuOrnamentRule label="WHAT'S NEXT" zh="接下來會發生什麼" ornament="✦" />
      </div>
      <div style={{ padding: '0 24px' }}>
        <AnyuPullQuote accent="accent2">可以安心關掉這一頁 —— 好了它會自己更新，也會用 LINE / Email 通知你。</AnyuPullQuote>
      </div>
      <div style={{ padding: '20px 24px 0', textAlign: 'center', fontSize: 11.5, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.7 }}>
        ~ 一兩分鐘內 · 需要協助 hello@anyu.tw
      </div>
      <div style={{ height: 30 }} />
    </AnyuPage>
  );
}

Object.assign(window, {
  AcheckoutStart, AReturnWaiting, BcheckoutStart, BReturnWaiting,
});
