// =============================================================
// 暗語 ANYU · Theme Architecture · Module 02 Radar theme preview
// =============================================================
// Proof the architecture scales: Module 02「職場暗流雷達」reuses the
// EXACT shell templates (checkout, waiting, result cover, access link)
// and only swaps a Theme Pack:
//   accent  群青紫 → 鋼藍   #2b5e86
//   accent2 洋紅   → 訊號綠 #1f8a5b
//   rose    朱橘   → 訊號琥珀 #c0863a
//   motif   月相顯影 → 雷達掃描
//   語言    顯影/溫度/校準 → 掃描/收斂/定位
// Moving homepage → Module 02 feels like a TRANSITION, not a rupture.
// =============================================================

const M2_TOKENS = { accent: '#2b5e86', accent2: '#1f8a5b', rose: '#c0863a' };

function M2Top({ back }) {
  const { AnyuWordmark, V2_DIM, V2_SANS } = window;
  return (
    <div style={{ padding: '18px 24px 4px', display: 'flex', alignItems: 'center', justifyContent: back ? 'space-between' : 'flex-end' }}>
      {back && <span style={{ fontSize: 12.5, color: V2_DIM, fontFamily: V2_SANS, whiteSpace: 'nowrap' }}>{back}</span>}
      <AnyuWordmark size="sm" />
    </div>
  );
}

// radar report cover (mirrors Module 01 ReportCover, radar skin)
function M2ReportCover() {
  const { V2_INK, V2_DIM, V2_FAINT, V2_ACC, V2_ACC2, V2_CARD, V2_SURF, V2_SANS, V2_SERIF, V2_LATIN, V2_MONO, AnyuStatusStamp } = window;
  return (
    <div style={{ position: 'relative', background: V2_CARD, border: `1.5px solid ${V2_INK}`, boxShadow: `4px 4px 0 ${V2_ACC}`, padding: '22px 22px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: V2_MONO, fontSize: 10, fontWeight: 700, letterSpacing: 1.8, color: V2_ACC, textTransform: 'uppercase' }}>MODULE · 02</div>
          <div style={{ marginTop: 8, fontFamily: V2_SERIF, fontSize: 24, fontWeight: 500, color: V2_INK, letterSpacing: '-0.2px' }}>職場暗流雷達</div>
        </div>
        <AnyuStatusStamp size={56} motif="radar" progress={1} state="done" rotate={-4} compact />
      </div>
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'baseline', gap: 8, fontFamily: V2_MONO, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: V2_DIM, textTransform: 'uppercase' }}>
        <span>My Persona</span><span style={{ color: V2_FAINT }}>·</span>
        <span style={{ fontFamily: V2_SANS, fontWeight: 500, fontSize: 12.5, color: V2_INK, letterSpacing: 0, textTransform: 'none' }}>暗流定位者</span>
      </div>
      <div style={{ marginTop: 12, padding: '12px 14px', background: V2_SURF, border: `1.5px solid ${V2_INK}`, borderLeft: `4px solid ${V2_ACC2}`, fontFamily: V2_SERIF, fontStyle: 'italic', fontSize: 13.5, lineHeight: 1.6, color: V2_INK }}>
        「真正的決定，常常不在會議桌上做完。」
      </div>
      <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1.5px dashed ${V2_INK}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: V2_MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.5, color: V2_DIM, textTransform: 'uppercase' }}>Signal</div>
          <div style={{ marginTop: 4, display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ position: 'relative', lineHeight: 1 }}>
              <span aria-hidden="true" style={{ position: 'absolute', left: 2, top: 2, fontFamily: V2_LATIN, fontStyle: 'italic', fontWeight: 700, fontSize: 30, color: V2_ACC2, mixBlendMode: 'multiply', opacity: 0.85 }}>62</span>
              <span style={{ position: 'relative', fontFamily: V2_LATIN, fontStyle: 'italic', fontWeight: 700, fontSize: 30, color: V2_ACC }}>62</span>
            </span>
            <span style={{ fontFamily: V2_SANS, fontSize: 12, color: V2_DIM }}>暗流偏強</span>
          </div>
        </div>
        <span style={{ fontFamily: V2_MONO, fontSize: 9, fontWeight: 700, letterSpacing: 1, color: V2_ACC2, border: `1.5px solid ${V2_ACC2}`, padding: '3px 7px', textTransform: 'uppercase' }}>Unlocked</span>
      </div>
    </div>
  );
}

// Module 02 · checkout-start — SAME template as M01, radar theme pack
function Module02Checkout() {
  const { V2_INK, V2_DIM, V2_ACC2, V2_SANS, AnyuPage, AnyuModuleHeader, AnyuPayProgress, AnyuOrderSummary, AnyuPrimaryButton, AnyuTrustLine, AnyuSupportFooter, AnyuCard, PhoneScreen } = window;
  return (
    <PhoneScreen><AnyuPage tokens={M2_TOKENS} bleeds={[
      { v: 'top', offsetV: 120, h: 'right', offsetH: -34, size: 92, color: 'accent2', opacity: 0.18, rotate: 5 },
      { v: 'top', offsetV: 560, h: 'left', offsetH: -38, size: 104, color: 'accent', opacity: 0.16, rotate: -4 },
    ]}>
      <M2Top back="← 回到結果" />
      <div style={{ padding: '20px 24px 0' }}><AnyuModuleHeader moduleId="02" title="職場暗流雷達" hook="完整報告 · 這場會議的真正訊號" stamp="radar" /></div>
      <div style={{ padding: '22px 24px 0' }}><AnyuPayProgress active={0} /></div>
      <div style={{ padding: '22px 24px 0' }}>
        <AnyuCard shadow="accent" padding="18px 18px 18px">
          <AnyuOrderSummary product="職場暗流雷達｜完整報告" price="NT$49" note="一次性付款 · 非訂閱制" />
          <div style={{ marginTop: 14, display: 'grid', gap: 9 }}>
            {['誰在推動、誰在觀望的 3 種訊號', '這場對話真正的 3 條暗流', '下一步怎麼站位的可收藏摘要卡'].map((t, i) => (
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
        <div style={{ marginTop: 12, fontSize: 11.5, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.65 }}>付款前需先保存你的專屬查看連結。</div>
      </div>
      <div style={{ padding: '0 24px' }}><AnyuSupportFooter /></div>
      <div style={{ height: 28 }} />
    </AnyuPage></PhoneScreen>
  );
}

// Module 02 · ReturnURL waiting — SAME template, radar language (掃描/收斂)
function Module02Waiting() {
  const { V2_INK, V2_DIM, V2_ACC, V2_SANS, V2_SERIF, V2_MONO, DotPulse, AnyuPage, AnyuPayProgress, AnyuCard, AnyuTrustLine, AnyuSupportFooter, AnyuOrnamentRule, AnyuStatusStamp, PhoneScreen } = window;
  return (
    <PhoneScreen><AnyuPage tokens={M2_TOKENS} bleeds={[
      { v: 'top', offsetV: 240, h: 'left', offsetH: -40, size: 110, color: 'accent', opacity: 0.16, rotate: -3 },
      { v: 'top', offsetV: 600, h: 'right', offsetH: -32, size: 84, color: 'accent2', opacity: 0.18, rotate: 6 },
    ]}>
      <M2Top />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '12px 28px 0' }}>
        <AnyuStatusStamp size={96} motif="radar" progress={0.3} state="work" rotate={-4} />
        <div style={{ marginTop: 22, fontFamily: V2_MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.6, color: V2_ACC, textTransform: 'uppercase' }}>// 收到了</div>
        <div style={{ marginTop: 10, fontFamily: V2_SERIF, fontSize: 23, fontWeight: 500, lineHeight: 1.35, color: V2_INK, letterSpacing: '-0.3px' }}>收到了。</div>
        <div style={{ marginTop: 10, fontSize: 13.5, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.7, maxWidth: 290 }}>我們正在向藍新確認這筆付款 —— 通常一兩分鐘內完成。</div>
        <div style={{ marginTop: 16, fontFamily: V2_MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1.6, color: V2_DIM }}>~ 一兩分鐘內</div>
      </div>
      <div style={{ padding: '28px 24px 0' }}><AnyuPayProgress active={0} /></div>
      <div style={{ padding: '4px 24px 0' }}>
        <AnyuOrnamentRule label="WHAT'S NEXT" zh="接下來會發生什麼" ornament="✦" />
        <div style={{ display: 'grid', gap: 14 }}>
          {['藍新確認這筆付款（付款結果以藍新通知為準）。', '確認後，雷達會開始掃描這場對話的暗流。', '收斂定位完成會在這頁顯示，也會用 LINE / Email 通知你。'].map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontFamily: 'var(--anyu-font-latin)', fontStyle: 'italic', fontWeight: 700, fontSize: 18, color: V2_ACC, lineHeight: 1.2, width: 18 }}>{i + 1}</span>
              <span style={{ fontSize: 13, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.65 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '22px 24px 0' }}>
        <AnyuCard shadow="accent" padding="14px 16px"><div style={{ fontSize: 13, color: V2_INK, fontFamily: V2_SANS, lineHeight: 1.7 }}>可以安心關掉這一頁。掃描完成後它會自己更新，你不會錯過。</div></AnyuCard>
      </div>
      <div style={{ padding: '16px 24px 0' }}><AnyuTrustLine>付款由藍新金流處理；ANYU 端只會收到「已付款」的通知。</AnyuTrustLine></div>
      <div style={{ padding: '0 24px' }}><AnyuSupportFooter /></div>
      <div style={{ height: 28 }} />
    </AnyuPage></PhoneScreen>
  );
}

// Module 02 · result delivery artifact (radar report cover)
function Module02Result() {
  const { V2_INK, V2_DIM, V2_ACC, V2_SANS, V2_SERIF, V2_MONO, AnyuPage, AnyuPrimaryButton, AnyuSupportFooter, AnyuOrnamentRule, PhoneScreen } = window;
  return (
    <PhoneScreen><AnyuPage tokens={M2_TOKENS} bleeds={[
      { v: 'top', offsetV: 220, h: 'right', offsetH: -34, size: 92, color: 'accent', opacity: 0.18, rotate: 5 },
      { v: 'top', offsetV: 640, h: 'left', offsetH: -36, size: 100, color: 'accent2', opacity: 0.16, rotate: -4 },
    ]}>
      <M2Top back="← 回到結果" />
      <div style={{ padding: '18px 24px 0' }}>
        <div style={{ fontFamily: V2_MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.6, color: V2_ACC, textTransform: 'uppercase' }}>// 已定位</div>
        <div style={{ marginTop: 10, fontFamily: V2_SERIF, fontSize: 23, fontWeight: 500, color: V2_INK }}>你的完整報告</div>
      </div>
      <div style={{ padding: '18px 24px 0' }}><M2ReportCover /></div>
      <div style={{ padding: '20px 24px 0' }}><AnyuPrimaryButton shadow="accent2" endIcon="↗">開啟完整報告</AnyuPrimaryButton></div>
      <div style={{ padding: '0 24px' }}>
        <AnyuOrnamentRule label="INSIDE" zh="這份報告包含" ornament="✦" />
        <div style={{ display: 'grid', gap: 9 }}>
          {['誰在推動、誰在觀望的訊號圖', '這場對話真正的 3 條暗流', '下一步怎麼站位的摘要卡'].map((t, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 9, alignItems: 'baseline' }}>
              <span aria-hidden="true" style={{ color: 'var(--anyu-accent2)', fontSize: 12 }}>✦</span>
              <span style={{ fontSize: 13, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.6 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '18px 24px 0', textAlign: 'center', fontSize: 11.5, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.7 }}>以網頁形式交付，回 ANYU 用你的專屬查看連結查看 · 需要協助 hello@anyu.tw</div>
      <div style={{ padding: '0 24px' }}><AnyuSupportFooter /></div>
      <div style={{ height: 28 }} />
    </AnyuPage></PhoneScreen>
  );
}

Object.assign(window, {
  M2_TOKENS, M2ReportCover,
  Module02Checkout, Module02Waiting, Module02Result,
});
