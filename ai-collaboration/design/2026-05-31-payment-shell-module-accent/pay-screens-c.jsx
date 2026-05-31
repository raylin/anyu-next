// =============================================================
// 暗語 ANYU · Payment Shell · Direction C (recommended)
// =============================================================
// The full 6-state payment flow, built as ONE shell with Module 01
// accent. Every screen is shell scaffolding + a thin accent layer.
//
//   checkout-start → [藍新 third-party] → return-waiting
//                  → processing → ready → access-wrapper
//                  (生成失敗 → failed/support)
//
// PayFlowPhone is controlled: { screen, go }. The doc renders a rail.
// =============================================================

// Shared screen scaffold: page + top wordmark/back.
function PayScreen({ children, back, onBack, bleeds }) {
  const { AnyuPage, AnyuWordmark, V2_DIM, V2_SANS } = window;
  return (
    <AnyuPage bleeds={bleeds || [
      { v: 'top', offsetV: 120, h: 'right', offsetH: -34, size: 92, color: 'accent2', opacity: 0.20, rotate: 5 },
      { v: 'top', offsetV: 560, h: 'left', offsetH: -38, size: 104, color: 'accent', opacity: 0.16, rotate: -4 },
    ]}>
      <div style={{
        padding: '18px 24px 4px', display: 'flex', alignItems: 'center',
        justifyContent: back ? 'space-between' : 'flex-end',
      }}>
        {back && (
          <button onClick={onBack} style={{
            all: 'unset', cursor: 'pointer', fontSize: 12.5, color: V2_DIM, fontFamily: V2_SANS,
            whiteSpace: 'nowrap',
          }}>{back}</button>
        )}
        <AnyuWordmark size="sm" />
      </div>
      {children}
    </AnyuPage>
  );
}

// Centered status hero used by waiting / processing / ready / failed.
function StatusHero({ stampProps, eyebrow, title, subtitle, pulse, timeHint }) {
  const { V2_INK, V2_DIM, V2_ACC, V2_SANS, V2_SERIF, V2_MONO, DotPulse, AnyuStatusStamp } = window;
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      padding: '14px 28px 0',
    }}>
      <AnyuStatusStamp {...stampProps} />
      {eyebrow && (
        <div style={{
          marginTop: 22, fontFamily: V2_MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.6,
          color: V2_ACC, textTransform: 'uppercase',
        }}>{eyebrow}</div>
      )}
      <div style={{
        marginTop: eyebrow ? 10 : 22, fontFamily: V2_SERIF, fontSize: 23, fontWeight: 500,
        lineHeight: 1.35, color: V2_INK, letterSpacing: '-0.3px',
      }}>{title}</div>
      {subtitle && (
        <div style={{
          marginTop: 10, fontSize: 13.5, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.7, maxWidth: 290,
        }}>{subtitle}</div>
      )}
      {pulse && <div style={{ marginTop: 22 }}><DotPulse /></div>}
      {timeHint && (
        <div style={{
          marginTop: 16, fontFamily: V2_MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1.6,
          color: V2_DIM,
        }}>{timeHint}</div>
      )}
    </div>
  );
}

// Small "what happens next" mini-timeline (used on the waiting page).
function NextSteps({ items }) {
  const { V2_INK, V2_DIM, V2_ACC, V2_SANS, V2_LATIN } = window;
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {items.map((t, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{
            fontFamily: V2_LATIN, fontStyle: 'italic', fontWeight: 700, fontSize: 18,
            color: V2_ACC, lineHeight: 1.2, flex: '0 0 auto', width: 18,
          }}>{i + 1}</span>
          <span style={{ fontSize: 13, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.65 }}>{t}</span>
        </div>
      ))}
    </div>
  );
}

// -------------------------------------------------------------
// 1 · checkout-start
// -------------------------------------------------------------
function PayCheckoutStart({ go }) {
  const {
    V2_INK, V2_DIM, V2_ACC, V2_ACC2, V2_SANS, V2_SERIF, V2_MONO,
    AnyuModuleHeader, AnyuPayProgress, AnyuOrderSummary,
    AnyuPrimaryButton, AnyuTrustLine, AnyuSupportFooter, AnyuCard,
  } = window;
  return (
    <PayScreen back="← 回到結果" onBack={() => go('result-stub')}>
      <div style={{ padding: '24px 24px 0' }}>
        <AnyuModuleHeader moduleId="01" title="曖昧溫度計" hook="完整報告 · 下一句怎麼回" stamp="moon" />
      </div>

      <div style={{ padding: '24px 24px 0' }}>
        <AnyuPayProgress active={0} />
      </div>

      <div style={{ padding: '22px 24px 0' }}>
        <AnyuCard shadow="accent" padding="18px 18px 18px">
          <AnyuOrderSummary product="曖昧溫度計｜完整報告" price="NT$49" note="一次性付款 · 非訂閱制" />
          <div style={{ marginTop: 14, display: 'grid', gap: 9 }}>
            {[
              '下一句怎麼回的 3 種版本',
              '對方可能的 3 種狀態',
              '48 小時觀察策略與可收藏摘要卡',
            ].map((t, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 9, alignItems: 'baseline' }}>
                <span aria-hidden="true" style={{ color: V2_ACC2, fontSize: 12 }}>✦</span>
                <span style={{ fontSize: 13, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.6, minWidth: 0 }}>{t}</span>
              </div>
            ))}
          </div>
        </AnyuCard>
      </div>

      <div style={{ padding: '18px 24px 0' }}>
        <AnyuPrimaryButton shadow="accent2" endIcon="↗" onClick={() => go('redirect')}>
          前往安全付款
        </AnyuPrimaryButton>
      </div>

      <div style={{ padding: '14px 24px 0' }}>
        <AnyuTrustLine>
          付款由 <b style={{ color: V2_INK, fontWeight: 600 }}>藍新金流</b> 安全處理，ANYU 不會看到你的卡號。
          付款確認以藍新通知為準。
        </AnyuTrustLine>
        <div style={{
          marginTop: 12, fontSize: 11.5, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.65,
        }}>目前內測中，這次不會真的收費。</div>
      </div>

      <div style={{ padding: '0 24px' }}>
        <AnyuSupportFooter onRefund={() => go('refund')} />
      </div>
      <div style={{ height: 28 }} />
    </PayScreen>
  );
}

// -------------------------------------------------------------
// 2 · ReturnURL waiting — quiet "收到了" (certainty first)
// -------------------------------------------------------------
function PayReturnWaiting({ go }) {
  const {
    V2_INK, V2_DIM, V2_ACC, V2_SANS, V2_SERIF, V2_MONO,
    AnyuPayProgress, AnyuCard, AnyuTrustLine, AnyuSupportFooter, AnyuOrnamentRule,
  } = window;
  return (
    <PayScreen bleeds={[
      { v: 'top', offsetV: 240, h: 'left', offsetH: -40, size: 110, color: 'accent', opacity: 0.16, rotate: -3 },
      { v: 'top', offsetV: 600, h: 'right', offsetH: -32, size: 84, color: 'accent2', opacity: 0.18, rotate: 6 },
    ]}>
      <StatusHero
        stampProps={{ size: 96, motif: 'moon', progress: 0.28, state: 'work', rotate: -4 }}
        eyebrow="// 收到了"
        title="收到了。"
        subtitle="我們正在向藍新確認這筆付款 —— 通常一兩分鐘內完成。"
        timeHint="~ 一兩分鐘內"
      />

      <div style={{ padding: '28px 24px 0' }}>
        <AnyuPayProgress active={0} />
      </div>

      <div style={{ padding: '4px 24px 0' }}>
        <AnyuOrnamentRule label="WHAT'S NEXT" zh="接下來會發生什麼" ornament="✦" />
        <NextSteps items={[
          '藍新確認這筆付款（付款結果以藍新通知為準）。',
          '確認後，我們會立刻開始為你生成完整報告。',
          '好了會在這頁顯示，也會用你的 LINE / Email 通知你。',
        ]} />
      </div>

      <div style={{ padding: '22px 24px 0' }}>
        <AnyuCard shadow="accent" padding="14px 16px">
          <div style={{ fontSize: 13, color: V2_INK, fontFamily: V2_SANS, lineHeight: 1.7 }}>
            可以安心關掉這一頁。確認完成後它會自己更新，你不會錯過。
          </div>
        </AnyuCard>
      </div>

      <div style={{ padding: '16px 24px 0' }}>
        <AnyuTrustLine>付款由藍新金流處理；ANYU 端只會收到「已付款」的通知。</AnyuTrustLine>
      </div>

      <div style={{ padding: '0 24px' }}>
        <AnyuSupportFooter onRefund={() => go('refund')} />
      </div>

      {/* demo-only advance */}
      <DemoAdvance label="模擬：藍新已通知付款 →" onClick={() => go('processing')} />
      <div style={{ height: 24 }} />
    </PayScreen>
  );
}

// -------------------------------------------------------------
// 3 · processing — payment confirmed, report generating
// -------------------------------------------------------------
function PayProcessing({ go }) {
  const {
    V2_INK, V2_DIM, V2_ACC, V2_ACC2, V2_SANS, V2_SERIF, V2_MONO,
    AnyuPayProgress, AnyuCard, AnyuSupportFooter,
  } = window;
  return (
    <PayScreen bleeds={[
      { v: 'top', offsetV: 200, h: 'left', offsetH: -38, size: 108, color: 'accent', opacity: 0.18, rotate: -3 },
      { v: 'top', offsetV: 560, h: 'right', offsetH: -30, size: 86, color: 'accent2', opacity: 0.22, rotate: 6 },
    ]}>
      <StatusHero
        stampProps={{ size: 96, motif: 'moon', progress: 0.7, state: 'work', rotate: -4 }}
        eyebrow="// 生成中"
        title={<>付款已確認，<br/>正在生成你的完整報告。</>}
        subtitle="我們在把溫度、訊號與下一句回法，整理成一份可以收藏的報告。"
        pulse
        timeHint="~ 30 秒"
      />

      <div style={{ padding: '28px 24px 0' }}>
        <AnyuPayProgress active={1} />
      </div>

      <div style={{ padding: '22px 24px 0' }}>
        <AnyuCard shadow="accent2" padding="14px 16px">
          <div style={{
            fontFamily: V2_MONO, fontSize: 10, fontWeight: 700, letterSpacing: 1.6,
            color: V2_ACC, textTransform: 'uppercase',
          }}>// REMINDER</div>
          <div style={{ marginTop: 8, fontSize: 13, color: V2_INK, fontFamily: V2_SANS, lineHeight: 1.7 }}>
            這不是判決 —— 是給你一個多看一眼的角度。
          </div>
        </AnyuCard>
      </div>

      <div style={{ padding: '0 24px' }}>
        <AnyuSupportFooter onRefund={() => go('refund')} />
      </div>

      <DemoAdvance label="模擬：報告生成完成 →" onClick={() => go('ready')} sub="（或看「生成失敗」分支）" subOnClick={() => go('failed')} />
      <div style={{ height: 24 }} />
    </PayScreen>
  );
}

// -------------------------------------------------------------
// 4 · ready — report ready
// -------------------------------------------------------------
function PayReady({ go }) {
  const {
    V2_INK, V2_DIM, V2_ACC, V2_SANS, V2_SERIF, V2_MONO,
    AnyuPayProgress, AnyuPrimaryButton, AnyuSupportFooter,
  } = window;
  return (
    <PayScreen bleeds={[
      { v: 'top', offsetV: 180, h: 'right', offsetH: -32, size: 92, color: 'accent2', opacity: 0.20, rotate: 5 },
      { v: 'top', offsetV: 560, h: 'left', offsetH: -36, size: 100, color: 'accent', opacity: 0.16, rotate: -4 },
    ]}>
      <StatusHero
        stampProps={{ size: 96, motif: 'moon', progress: 1, state: 'done', rotate: -4 }}
        eyebrow="// 完成"
        title="完整報告已經準備好。"
        subtitle="為你保留了一份。隨時回來，都看得到。"
      />

      <div style={{ padding: '28px 24px 0' }}>
        <AnyuPayProgress active={3} />
      </div>

      <div style={{ padding: '24px 24px 0' }}>
        <AnyuPrimaryButton shadow="accent2" endIcon="↗" onClick={() => go('access')}>
          進入完整報告
        </AnyuPrimaryButton>
      </div>

      <div style={{
        padding: '14px 24px 0', textAlign: 'center',
        fontSize: 11.5, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.7,
      }}>
        完整報告以網頁形式交付，這個連結為你保留 30 天。
      </div>

      <div style={{ padding: '0 24px' }}>
        <AnyuSupportFooter onRefund={() => go('refund')} />
      </div>
      <div style={{ height: 28 }} />
    </PayScreen>
  );
}

// -------------------------------------------------------------
// 5 · failed / support — paid, but report can't be made yet
// -------------------------------------------------------------
function PayFailed({ go }) {
  const {
    V2_INK, V2_DIM, V2_ACC, V2_ROSE, V2_CARD, V2_SANS, V2_SERIF, V2_MONO,
    AnyuPayProgress, AnyuCard, AnyuPrimaryButton, AnyuSupportFooter,
  } = window;
  return (
    <PayScreen bleeds={[
      { v: 'top', offsetV: 200, h: 'left', offsetH: -36, size: 100, color: 'rose', opacity: 0.22, rotate: -3 },
      { v: 'top', offsetV: 560, h: 'right', offsetH: -30, size: 84, color: 'accent', opacity: 0.16, rotate: 6 },
    ]}>
      <StatusHero
        stampProps={{ size: 96, motif: 'moon', progress: 0.55, state: 'error', rotate: -4 }}
        eyebrow="// 暫時生不出來"
        title={<>付款成功了，<br/>但報告暫時生不出來。</>}
        subtitle="別擔心 —— 這筆 NT$49 不會重複收費，你的名額已經保留。"
      />

      <div style={{ padding: '28px 24px 0' }}>
        <AnyuPayProgress active={1} error />
      </div>

      <div style={{ padding: '22px 24px 0' }}>
        <AnyuCard shadow="rose" padding="16px 18px">
          <div style={{ fontSize: 13, color: V2_INK, fontFamily: V2_SANS, lineHeight: 1.75 }}>
            可能是這段對話太短，或我們這邊一時忙不過來。你可以再試一次，
            或讓我們用 LINE / Email 在生好後直接補發給你。
          </div>
        </AnyuCard>
      </div>

      <div style={{ padding: '18px 24px 0' }}>
        <AnyuPrimaryButton shadow="accent2" onClick={() => go('processing')}>再試一次生成</AnyuPrimaryButton>
        <div style={{ marginTop: 10 }}>
          <button onClick={() => go('access')} style={{
            all: 'unset', cursor: 'pointer', width: '100%', height: 46,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: V2_CARD, border: `1.5px solid ${V2_INK}`, boxShadow: `3px 3px 0 ${V2_INK}`,
            fontFamily: V2_SERIF, fontWeight: 500, fontSize: 14, color: V2_INK, borderRadius: 2,
          }}>用 LINE / Email 讓我們補發</button>
        </div>
      </div>

      <div style={{
        padding: '14px 24px 0', textAlign: 'center',
        fontSize: 11.5, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.7,
      }}>
        補發或退款會在 3–7 個工作天內人工處理。需要協助請來信 hello@anyu.tw。
      </div>

      <div style={{ padding: '0 24px' }}>
        <AnyuSupportFooter onRefund={() => go('refund')} />
      </div>
      <div style={{ height: 28 }} />
    </PayScreen>
  );
}

// -------------------------------------------------------------
// 6 · access-wrapper — the gateway before/after the full report
// -------------------------------------------------------------
function PayAccess({ go }) {
  const {
    V2_INK, V2_DIM, V2_FAINT, V2_ACC, V2_ACC2, V2_CARD, V2_SURF, V2_SANS, V2_SERIF, V2_LATIN, V2_MONO,
    AnyuPrimaryButton, AnyuWordmark, AnyuStatusStamp, AnyuSupportFooter, AnyuOrnamentRule,
  } = window;
  return (
    <PayScreen back="← 回到結果" onBack={() => go('result-stub')} bleeds={[
      { v: 'top', offsetV: 220, h: 'right', offsetH: -34, size: 92, color: 'accent', opacity: 0.18, rotate: 5 },
      { v: 'top', offsetV: 640, h: 'left', offsetH: -36, size: 100, color: 'accent2', opacity: 0.16, rotate: -4 },
    ]}>
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{
          fontFamily: V2_MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.6,
          color: V2_ACC, textTransform: 'uppercase',
        }}>// 已解鎖</div>
        <div style={{ marginTop: 10, fontFamily: V2_SERIF, fontSize: 23, fontWeight: 500, color: V2_INK }}>
          你的完整報告
        </div>
      </div>

      {/* report "cover" — a zine cover with unlock seal */}
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{
          position: 'relative', background: V2_CARD,
          border: `1.5px solid ${V2_INK}`, boxShadow: `4px 4px 0 ${V2_ACC}`,
          padding: '22px 22px 20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{
                fontFamily: V2_MONO, fontSize: 10, fontWeight: 700, letterSpacing: 1.8,
                color: V2_ACC, textTransform: 'uppercase',
              }}>MODULE · 01</div>
              <div style={{ marginTop: 8, fontFamily: V2_SERIF, fontSize: 24, fontWeight: 500, color: V2_INK, letterSpacing: '-0.2px' }}>
                曖昧溫度計
              </div>
            </div>
            <AnyuStatusStamp size={56} motif="moon" progress={1} state="done" rotate={-4} compact />
          </div>

          <div style={{
            marginTop: 16, display: 'flex', alignItems: 'baseline', gap: 8,
            fontFamily: V2_MONO, fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
            color: V2_DIM, textTransform: 'uppercase',
          }}>
            <span>My Persona</span>
            <span style={{ color: V2_FAINT }}>·</span>
            <span style={{ fontFamily: V2_SANS, fontWeight: 500, fontSize: 12.5, color: V2_INK, letterSpacing: 0, textTransform: 'none' }}>
              節奏敏感觀察者
            </span>
          </div>

          <div style={{
            marginTop: 12, padding: '12px 14px', background: V2_SURF,
            border: `1.5px solid ${V2_INK}`, borderLeft: `4px solid ${V2_ACC2}`,
            fontFamily: V2_SERIF, fontStyle: 'italic', fontSize: 13.5, lineHeight: 1.6, color: V2_INK,
          }}>「你感受到的不是拒絕，而是節奏需要重新校準。」</div>

          <div style={{
            marginTop: 16, paddingTop: 12, borderTop: `1.5px dashed ${V2_INK}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          }}>
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
            <span style={{
              fontFamily: V2_MONO, fontSize: 9, fontWeight: 700, letterSpacing: 1,
              color: V2_ACC2, border: `1.5px solid ${V2_ACC2}`, padding: '3px 7px', textTransform: 'uppercase',
            }}>Unlocked</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 24px 0' }}>
        <AnyuPrimaryButton shadow="accent2" endIcon="↗" onClick={() => go('opened')}>開啟完整報告</AnyuPrimaryButton>
      </div>

      <div style={{ padding: '0 24px' }}>
        <AnyuOrnamentRule label="INSIDE" zh="這份報告包含" ornament="✦" />
        <div style={{ display: 'grid', gap: 9 }}>
          {['下一句怎麼回的 3 種版本', '對方可能的 3 種狀態', '48 小時觀察策略與摘要卡'].map((t, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 9, alignItems: 'baseline' }}>
              <span aria-hidden="true" style={{ color: V2_ACC2, fontSize: 12 }}>✦</span>
              <span style={{ fontSize: 13, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.6, minWidth: 0 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        padding: '18px 24px 0', textAlign: 'center',
        fontSize: 11.5, color: V2_DIM, fontFamily: V2_SANS, lineHeight: 1.7,
      }}>
        以網頁形式交付，連結保留 30 天 · 需要協助 hello@anyu.tw
      </div>

      <div style={{ padding: '0 24px' }}>
        <AnyuSupportFooter onRefund={() => go('refund')} />
      </div>
      <div style={{ height: 28 }} />
    </PayScreen>
  );
}

// demo-only nudge button rendered at the bottom of timed screens
function DemoAdvance({ label, onClick, sub, subOnClick }) {
  const { V2_FAINT, V2_DIM, V2_MONO } = window;
  return (
    <div style={{ padding: '26px 24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <button onClick={onClick} style={{
        all: 'unset', cursor: 'pointer',
        fontFamily: V2_MONO, fontSize: 10, fontWeight: 700, letterSpacing: 1, color: V2_DIM,
        border: `1px dashed ${V2_FAINT}`, padding: '6px 12px', borderRadius: 2,
      }}>{label}</button>
      {sub && (
        <button onClick={subOnClick} style={{
          all: 'unset', cursor: 'pointer',
          fontFamily: V2_MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, color: V2_FAINT,
        }}>{sub}</button>
      )}
    </div>
  );
}

Object.assign(window, {
  PayScreen, StatusHero, NextSteps, DemoAdvance,
  PayCheckoutStart, PayReturnWaiting, PayProcessing, PayReady, PayFailed, PayAccess,
});
