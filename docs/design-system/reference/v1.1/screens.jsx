// screens.jsx — full mobile screens (S1 / S1' / S2 / S3 / S4 / S5 / S6 / S7).
// One <Phone> per artboard. All visuals use anyu-tokens-v1.1.css; no inline hex.

function SectionScreens() {
  const { DCSection, DCArtboard } = window;
  return (
    <DCSection
      id="screens"
      title="03 · 高保真畫面（給 Coding Agent 直接轉錄）"
      subtitle="iPhone 14 · 390 × 844 · 每張都已 token 化。任何 inline hex / font-family 都是 bug。"
    >
      <DCArtboard id="S1"      label="S1 · Landing（空）"   width={390} height={896}><PhoneS1 /></DCArtboard>
      <DCArtboard id="S1p"     label="S1' · Landing（填入 + 已選 chip）" width={390} height={896}><PhoneS1Filled /></DCArtboard>
      <DCArtboard id="S2"      label="S2 · Loading"          width={390} height={896}><PhoneS2 /></DCArtboard>
      <DCArtboard id="S3"      label="S3 · Result"            width={390} height={896}><PhoneS3 /></DCArtboard>
      <DCArtboard id="S4"      label="S4 · Share preview"     width={390} height={896}><PhoneS4 /></DCArtboard>
      <DCArtboard id="S5"      label="S5 · Paid preview"      width={390} height={896}><PhoneS5 /></DCArtboard>
      <DCArtboard id="S6"      label="S6 · Contact capture"   width={390} height={896}><PhoneS6 /></DCArtboard>
      <DCArtboard id="S7"      label="S7 · Confirmation"      width={390} height={896}><PhoneS7 /></DCArtboard>
      <DCArtboard id="S3-dark" label="S3 · Result · Dark"     width={390} height={896}><PhoneS3Dark /></DCArtboard>
    </DCSection>
  );
}

/* =========================================================================
 *  S1 · Landing (empty)
 * ========================================================================= */

function PhoneS1() {
  const { Phone, AnyuMark, Moon, SectionLabel, Chip, PrimaryCTA } = window;
  return (
    <Phone statusTime="21:47">
      <div style={s1.page}>
        {/* faint top-right glow — accent2 atmosphere (allowed once per screen) */}
        <div aria-hidden="true" style={s1.glow} />

        {/* Header */}
        <div style={s1.header}>
          <AnyuMark size={11} color="var(--anyu-dim)" />
          <Moon phase={0.55} size={28} color="var(--anyu-accent)" />
        </div>

        {/* Hero */}
        <div style={{ marginTop: 28, padding: '0 24px' }}>
          <SectionLabel color="var(--anyu-accent)">module · 01 · 曖昧溫度計</SectionLabel>
          <h1 style={s1.hero}>
            他是真的忙，<br />
            還是其實在<em style={s1.heroAccent}>冷</em>掉？
          </h1>
          <p style={s1.lead}>
            貼上對話或描述情境，<br />AI 幫你讀出關係溫度，與下一句怎麼回。
          </p>
        </div>

        {/* Input card */}
        <div style={{ padding: '0 24px', marginTop: 22 }}>
          <div style={s1.input}>
            <div style={s1.inputHint}>// 貼一段對話 · 或用自己的話描述</div>
            <div style={s1.inputPlaceholder}>
              例：「禮拜三他說在忙；昨晚看到他發限動跟朋友吃飯；今天早上他終於回我『晚點聊』⋯」
            </div>
            <div style={s1.inputDivider} />
            <div style={s1.inputPrivacy}>
              請不要貼姓名 / 電話 / 地址 · 對話會在分析後 24 小時內刪除
            </div>
          </div>
        </div>

        {/* Situation chips */}
        <div style={{ padding: '0 24px', marginTop: 22 }}>
          <SectionLabel>情境 · 可選</SectionLabel>
          <div style={s1.chips}>
            <Chip>已讀不回</Chip>
            <Chip>忽冷忽熱</Chip>
            <Chip>看限動不回我</Chip>
            <Chip>不確定 / 跳過</Chip>
          </div>
        </div>

        {/* CTA */}
        <div style={s1.ctaWrap}>
          <PrimaryCTA disabled>先貼一段對話</PrimaryCTA>
          <div style={s1.ctaHint}>免費 · 約 8 秒 · 結果可截圖分享</div>
        </div>
      </div>
    </Phone>
  );
}

const s1 = {
  page: { padding: '14px 0 28px', position: 'relative', minHeight: '100%' },
  glow: {
    position: 'absolute', top: -80, right: -60,
    width: 260, height: 260, borderRadius: '50%',
    background: 'radial-gradient(circle, var(--anyu-accent2-15) 0%, transparent 65%)',
    filter: 'blur(8px)', pointerEvents: 'none',
  },
  header: {
    padding: '0 24px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  hero: {
    margin: '16px 0 0',
    fontFamily: 'var(--anyu-font-serif)',
    fontSize: 30, fontWeight: 500, lineHeight: 1.35,
    letterSpacing: '-0.3px',
    color: 'var(--anyu-ink)',
  },
  heroAccent: {
    fontFamily: 'var(--anyu-font-latin)',
    fontStyle: 'italic',
    fontWeight: 400,
    color: 'var(--anyu-accent)',
  },
  lead: {
    margin: '12px 0 0',
    fontSize: 14, lineHeight: 1.7,
    color: 'var(--anyu-dim)',
    fontFamily: 'var(--anyu-font-sans)',
  },
  input: {
    background: 'var(--anyu-card)',
    border: '1px solid var(--anyu-line)',
    borderRadius: 'var(--anyu-radius-xl)',
    boxShadow: 'var(--anyu-shadow-sm)',
    padding: 20,
  },
  inputHint: {
    fontFamily: 'var(--anyu-font-mono)',
    fontSize: 11, color: 'var(--anyu-dim)',
    letterSpacing: 1.5, marginBottom: 12,
  },
  inputPlaceholder: {
    fontSize: 14, lineHeight: 1.7,
    color: 'var(--anyu-faint)',
    fontStyle: 'italic',
    fontFamily: 'var(--anyu-font-sans)',
  },
  inputDivider: { margin: '16px 0', borderTop: '1px dashed var(--anyu-line)' },
  inputPrivacy: {
    fontSize: 12, lineHeight: 1.6,
    color: 'var(--anyu-dim)',
    fontFamily: 'var(--anyu-font-sans)',
  },
  chips: {
    marginTop: 12,
    display: 'flex', flexWrap: 'wrap', gap: 8,
  },
  ctaWrap: {
    padding: '0 24px',
    marginTop: 32,
  },
  ctaHint: {
    marginTop: 10,
    fontSize: 11, color: 'var(--anyu-faint)',
    textAlign: 'center', lineHeight: 1.6,
    fontFamily: 'var(--anyu-font-sans)',
  },
};

/* =========================================================================
 *  S1' · Landing (filled + situation chosen)
 * ========================================================================= */

function PhoneS1Filled() {
  const { Phone, AnyuMark, Moon, SectionLabel, Chip, PrimaryCTA } = window;
  return (
    <Phone statusTime="21:47">
      <div style={{ position: 'relative', minHeight: '100%', padding: '14px 0 28px' }}>
        <div style={{ padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <AnyuMark size={11} color="var(--anyu-dim)" />
          <Moon phase={0.55} size={28} color="var(--anyu-accent)" />
        </div>

        <div style={{ marginTop: 22, padding: '0 24px' }}>
          <SectionLabel color="var(--anyu-accent)">module · 01 · 曖昧溫度計</SectionLabel>
          <h1 style={{ margin: '14px 0 0', fontFamily: 'var(--anyu-font-serif)', fontSize: 24, fontWeight: 500, lineHeight: 1.4, color: 'var(--anyu-ink)', letterSpacing: '-0.2px' }}>
            看看這段是<em style={s1.heroAccent}>冷掉</em>還是只是<em style={s1.heroAccent}>忙</em>。
          </h1>
        </div>

        {/* Filled input card — focused state */}
        <div style={{ padding: '0 24px', marginTop: 18 }}>
          <div style={s1Filled.input}>
            <div style={s1Filled.inputHeader}>
              <span style={{ fontFamily: 'var(--anyu-font-mono)', fontSize: 11, color: 'var(--anyu-accent)', letterSpacing: 1.5 }}>// 你貼的對話</span>
              <span style={{ fontFamily: 'var(--anyu-font-mono)', fontSize: 11, color: 'var(--anyu-dim)' }}>4 / 12 句</span>
            </div>
            <div style={s1Filled.inputBody}>
              <span style={{ color: 'var(--anyu-accent2)', fontWeight: 500 }}>他</span>：在忙啦晚點聊<br />
              <span style={{ color: 'var(--anyu-dim)', fontSize: 12 }}>（晚上 21:14 · 已讀 30 分）</span><br />
              <span style={{ color: 'var(--anyu-accent2)', fontWeight: 500 }}>他</span>：（限動：跟朋友打球）<br />
              <span style={{ color: 'var(--anyu-rose)', fontWeight: 500 }}>你</span>：那今晚要一起吃飯嗎<br />
              <span style={{ color: 'var(--anyu-accent2)', fontWeight: 500 }}>他</span>：再看看
            </div>
            <div style={s1.inputDivider} />
            <div style={s1.inputPrivacy}>
              請不要貼姓名 / 電話 / 地址 · 對話會在分析後 24 小時內刪除
            </div>
          </div>
        </div>

        <div style={{ padding: '0 24px', marginTop: 20 }}>
          <SectionLabel>情境</SectionLabel>
          <div style={s1.chips}>
            <Chip>已讀不回</Chip>
            <Chip active>回訊變慢但看限動</Chip>
            <Chip>忽冷忽熱</Chip>
          </div>
        </div>

        <div style={{ padding: '0 24px', marginTop: 36 }}>
          <PrimaryCTA>分析我的曖昧溫度 →</PrimaryCTA>
          <div style={s1.ctaHint}>免費 · 約 8 秒 · 結果可截圖分享</div>
        </div>
      </div>
    </Phone>
  );
}

const s1Filled = {
  input: {
    background: 'var(--anyu-card)',
    border: '1.5px solid var(--anyu-accent-45)',
    borderRadius: 'var(--anyu-radius-xl)',
    boxShadow: '0 0 0 4px var(--anyu-accent-12)',
    padding: 20,
  },
  inputHeader: {
    display: 'flex', justifyContent: 'space-between',
    marginBottom: 12,
  },
  inputBody: {
    fontSize: 14, lineHeight: 1.75,
    color: 'var(--anyu-ink)',
    fontFamily: 'var(--anyu-font-sans)',
  },
};

/* =========================================================================
 *  S2 · Loading
 * ========================================================================= */

function PhoneS2() {
  const { Phone, AnyuMark, Moon, SectionLabel } = window;
  return (
    <Phone statusTime="21:47">
      <div style={s2.page}>
        <div aria-hidden="true" style={s2.glow} />
        <div style={s2.header}>
          <AnyuMark size={11} color="var(--anyu-dim)" />
          <span style={{ fontFamily: 'var(--anyu-font-mono)', fontSize: 11, color: 'var(--anyu-faint)', letterSpacing: 1.5 }}>~ 8s</span>
        </div>

        <div style={s2.center}>
          <Moon phase={0.55} size={84} color="var(--anyu-accent)" soft />
          <h2 style={s2.title}>讀著你貼上的對話⋯</h2>
          <p style={s2.subtitle}>
            我們在比對節奏、回應時差<br />與情緒投入的細節。
          </p>
          <div style={s2.dots}>
            <i style={{ ...s2.dot, animationDelay: '0ms' }} />
            <i style={{ ...s2.dot, animationDelay: '200ms' }} />
            <i style={{ ...s2.dot, animationDelay: '400ms' }} />
          </div>
        </div>

        <div style={s2.tipCard}>
          <SectionLabel color="var(--anyu-accent)" withSlash>reminder</SectionLabel>
          <div style={s2.tipBody}>
            這不是判決 — 是給你一個多看一眼的角度。
          </div>
        </div>
      </div>
    </Phone>
  );
}

const s2 = {
  page: { padding: '14px 0 24px', position: 'relative', minHeight: '100%', display: 'flex', flexDirection: 'column' },
  glow: {
    position: 'absolute', top: 140, left: '50%',
    width: 300, height: 300, marginLeft: -150, borderRadius: '50%',
    background: 'radial-gradient(circle, var(--anyu-accent-20) 0%, transparent 60%)',
    filter: 'blur(28px)', pointerEvents: 'none',
  },
  header: {
    padding: '0 24px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  center: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '0 24px',
    position: 'relative',
  },
  title: {
    margin: '32px 0 0',
    fontFamily: 'var(--anyu-font-serif)',
    fontSize: 20, fontWeight: 500, lineHeight: 1.5,
    color: 'var(--anyu-ink)',
    textAlign: 'center',
    letterSpacing: '-0.2px',
  },
  subtitle: {
    margin: '10px 0 0',
    fontSize: 13, lineHeight: 1.7,
    color: 'var(--anyu-dim)',
    textAlign: 'center', maxWidth: 260,
    fontFamily: 'var(--anyu-font-sans)',
  },
  dots: { marginTop: 28, display: 'flex', gap: 14 },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    background: 'var(--anyu-accent)',
    animation: 'anyu-pulse 1400ms infinite ease-in-out',
    display: 'block',
  },
  tipCard: {
    margin: '0 24px',
    padding: '14px 16px',
    background: 'var(--anyu-card)',
    border: '1px solid var(--anyu-line)',
    borderRadius: 12,
  },
  tipBody: {
    marginTop: 6,
    fontSize: 13, lineHeight: 1.6,
    color: 'var(--anyu-ink)',
    fontFamily: 'var(--anyu-font-sans)',
  },
};

/* =========================================================================
 *  S3 · Result
 * ========================================================================= */

function PhoneS3({ dark = false }) {
  const { Phone, AnyuMark, Moon, SectionLabel, Signal } = window;
  return (
    <Phone statusTime="21:55" dark={dark}>
      <div style={{ padding: '14px 24px 24px' }}>
        {/* Top nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: dark ? 'var(--anyu-dim-onDark)' : 'var(--anyu-dim)', fontFamily: 'var(--anyu-font-sans)' }}>← 重新分析</span>
          <AnyuMark size={10} color={dark ? 'var(--anyu-faint-onDark)' : 'var(--anyu-faint)'} />
        </div>

        {/* Temperature signature card */}
        <div style={dark ? s3.tempCardDark : s3.tempCard}>
          <div aria-hidden="true" style={s3.tempGlow} />
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <SectionLabel color={dark ? 'var(--anyu-faint-onDark)' : 'var(--anyu-dim)'}>當前溫度</SectionLabel>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 10 }}>
                <span style={s3.tempNumber}>42</span>
                <span style={{ ...s3.tempUnit, color: dark ? 'var(--anyu-faint-onDark)' : 'var(--anyu-faint)' }}>/100</span>
              </div>
              <div style={{ ...s3.tempLabel, color: dark ? 'var(--anyu-ink-onDark)' : 'var(--anyu-ink)' }}>
                溫差期 · 他在但他飄
              </div>
            </div>
            <Moon phase={0.42} size={50} color="var(--anyu-accent)" />
          </div>

          <div style={s3.tempBarTrack}>
            <div style={s3.tempBarFill} />
          </div>
          <div style={s3.tempScaleRow}>
            <span style={{ color: dark ? 'var(--anyu-dim-onDark)' : 'var(--anyu-dim)' }}>COLD</span>
            <span style={{ color: dark ? 'var(--anyu-dim-onDark)' : 'var(--anyu-dim)' }}>WARM</span>
            <span style={{ color: dark ? 'var(--anyu-dim-onDark)' : 'var(--anyu-dim)' }}>HOT</span>
          </div>
        </div>

        {/* One-sentence read */}
        <div style={dark ? s3.quoteCardDark : s3.quoteCard}>
          <span aria-hidden="true" style={s3.quoteMark}>“</span>
          <div style={{ paddingLeft: 18, fontFamily: 'var(--anyu-font-serif)', fontSize: 17, lineHeight: 1.65, color: dark ? 'var(--anyu-ink-onDark)' : 'var(--anyu-ink)', fontStyle: 'italic' }}>
            你不是想太多 ——<br />
            是訊號太小聲。
          </div>
        </div>

        {/* Signals — NOT wrapped in a card (v1.1) */}
        <div style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <SectionLabel color={dark ? 'var(--anyu-dim-onDark)' : 'var(--anyu-dim)'}>他這邊的訊號</SectionLabel>
            <span style={{ fontFamily: 'var(--anyu-font-mono)', fontSize: 10.5, color: dark ? 'var(--anyu-faint-onDark)' : 'var(--anyu-faint)', letterSpacing: 1.2 }}>3 個維度</span>
          </div>
          <SignalThemed label="主動度"    value={28} hint="多半你先開話題" dark={dark} />
          <SignalThemed label="即時性"    value={45} hint="平均回訊延遲 38 分" dark={dark} />
          <SignalThemed label="情緒投入" value={35} hint="短句多、提問少" dark={dark} />
        </div>

        {/* Insight card */}
        <div style={dark ? s3.insightDark : s3.insight}>
          <SectionLabel color="var(--anyu-accent)" withSlash>讓你卡住的</SectionLabel>
          <div style={{ marginTop: 10, fontSize: 14.5, lineHeight: 1.75, color: dark ? 'var(--anyu-ink-onDark)' : 'var(--anyu-ink)', fontFamily: 'var(--anyu-font-serif)' }}>
            不是他沒回訊息 —<br />
            是他<u style={{ textDecorationColor: 'var(--anyu-accent)', textDecorationThickness: 1.5, textUnderlineOffset: 4 }}>明明有在活動</u>，卻暫時沒有接你的邀約。
          </div>
          <div style={s3.insightDivider} />
          <div style={{ fontSize: 13.5, color: dark ? 'var(--anyu-dim-onDark)' : 'var(--anyu-dim)', lineHeight: 1.7, fontStyle: 'italic', fontFamily: 'var(--anyu-font-serif)' }}>
            「現在最不該做的，是把壓力全部丟到自己身上。」
          </div>
        </div>

        {/* Dual CTA */}
        <div style={{ marginTop: 22, display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }}>分享 ↗</button>
          <button className="btn btn-primary" style={{ flex: 1.7, borderRadius: 999, padding: '13px 0', fontSize: 14, fontFamily: 'var(--anyu-font-serif)' }}>
            下一句怎麼回 · NT$49
          </button>
        </div>
      </div>
    </Phone>
  );
}

function PhoneS3Dark() { return <PhoneS3 dark />; }

function SignalThemed({ label, value, hint, dark }) {
  return (
    <div className="signal" style={{ marginBottom: 22 }}>
      <span className="signal-label" style={{ color: dark ? 'var(--anyu-ink-onDark)' : 'var(--anyu-ink)' }}>{label}</span>
      <span className="signal-value" style={{ color: dark ? 'var(--anyu-ink-onDark)' : 'var(--anyu-ink)' }}>{value}</span>
      <div className="signal-bar" style={{ background: dark ? 'var(--anyu-line-onDark)' : 'var(--anyu-line)' }}>
        <i style={{ width: `${value}%` }} />
      </div>
      <div className="signal-hint" style={{ color: dark ? 'var(--anyu-dim-onDark)' : 'var(--anyu-dim)' }}>{hint}</div>
    </div>
  );
}

const s3 = {
  tempCard: {
    marginTop: 18,
    padding: '22px 24px 18px',
    background: 'var(--anyu-card)',
    border: '1px solid var(--anyu-line)',
    borderRadius: 'var(--anyu-radius-2xl)',
    boxShadow: 'var(--anyu-shadow-lg)',
    position: 'relative', overflow: 'hidden',
  },
  tempCardDark: {
    marginTop: 18,
    padding: '22px 24px 18px',
    background: 'rgba(245,236,221,.04)',
    border: '1px solid var(--anyu-line-onDark)',
    borderRadius: 'var(--anyu-radius-2xl)',
    boxShadow: 'inset 0 0 0 1px var(--anyu-line-onDark)',
    position: 'relative', overflow: 'hidden',
  },
  tempGlow: {
    position: 'absolute', top: -36, right: -36,
    width: 160, height: 160, borderRadius: '50%',
    background: 'radial-gradient(circle, var(--anyu-accent-20) 0%, transparent 65%)',
    pointerEvents: 'none',
  },
  tempNumber: {
    fontFamily: 'var(--anyu-font-latin)',
    fontStyle: 'italic',
    fontWeight: 300,
    fontSize: 64, lineHeight: 1,
    color: 'var(--anyu-accent)',
  },
  tempUnit: {
    fontFamily: 'var(--anyu-font-mono)',
    fontSize: 13, letterSpacing: 0.5,
  },
  tempLabel: {
    marginTop: 6,
    fontFamily: 'var(--anyu-font-serif)',
    fontSize: 16, lineHeight: 1.4,
  },
  tempBarTrack: {
    marginTop: 18,
    height: 6, borderRadius: 3,
    background: 'var(--anyu-mist)',
    overflow: 'hidden',
  },
  tempBarFill: {
    width: '42%', height: '100%',
    background: 'linear-gradient(90deg, var(--anyu-rose), var(--anyu-accent))',
    borderRadius: 3,
  },
  tempScaleRow: {
    marginTop: 8,
    display: 'flex', justifyContent: 'space-between',
    fontFamily: 'var(--anyu-font-mono)',
    fontSize: 10, letterSpacing: 1.5,
  },
  quoteCard: {
    marginTop: 14,
    padding: '20px 22px',
    background: 'var(--anyu-mist)',
    borderRadius: 'var(--anyu-radius-xl)',
    position: 'relative',
  },
  quoteCardDark: {
    marginTop: 14,
    padding: '20px 22px',
    background: 'rgba(245,236,221,.06)',
    borderRadius: 'var(--anyu-radius-xl)',
    position: 'relative',
  },
  quoteMark: {
    position: 'absolute',
    top: 10, left: 18,
    fontFamily: 'var(--anyu-font-serif)',
    fontSize: 36, lineHeight: 1,
    color: 'var(--anyu-accent)',
    opacity: 0.6, fontStyle: 'italic',
  },
  insight: {
    marginTop: 24,
    padding: '18px 20px',
    background: 'var(--anyu-card)',
    border: '1px solid var(--anyu-line)',
    borderRadius: 'var(--anyu-radius-lg)',
    boxShadow: 'var(--anyu-shadow-sm)',
  },
  insightDark: {
    marginTop: 24,
    padding: '18px 20px',
    background: 'rgba(245,236,221,.04)',
    border: '1px solid var(--anyu-line-onDark)',
    borderRadius: 'var(--anyu-radius-lg)',
  },
  insightDivider: {
    margin: '14px 0',
    borderTop: '1px dashed var(--anyu-line)',
  },
};

/* =========================================================================
 *  S4 · Share preview
 * ========================================================================= */

function PhoneS4() {
  const { Phone, AnyuMark, Moon, SectionLabel } = window;
  return (
    <Phone statusTime="21:58">
      <div style={{ padding: '14px 24px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--anyu-dim)', fontFamily: 'var(--anyu-font-sans)' }}>← 結果</span>
          <SectionLabel>SHARE CARD</SectionLabel>
        </div>

        <div style={s4.card}>
          {/* watercolor blobs */}
          <div aria-hidden="true" style={s4.blobA} />
          <div aria-hidden="true" style={s4.blobB} />

          <div style={s4.cardHeader}>
            <AnyuMark size={10.5} color="rgba(42,36,25,.75)" />
            <Moon phase={0.42} size={32} color="var(--anyu-accent)" />
          </div>

          <div style={{ position: 'relative', marginTop: 24 }}>
            <SectionLabel color="var(--anyu-accent)" withSlash>my persona</SectionLabel>
            <div style={s4.persona}>
              微訊號<br />觀察家
            </div>
          </div>

          <div style={s4.quoteWrap}>
            <div style={s4.rule} />
            <div style={s4.quote}>
              「你不是想太多，<br />
              只是你太會看見細節。」
            </div>
          </div>

          <div style={s4.cardFooter}>
            <div>
              <SectionLabel color="rgba(42,36,25,.55)">temperature</SectionLabel>
              <div style={s4.tempBig}>42°</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <SectionLabel color="rgba(42,36,25,.55)">測一次 ↗</SectionLabel>
              <div style={s4.link}>anyu.app</div>
            </div>
          </div>
        </div>

        {/* 3 share buttons */}
        <div style={s4.buttons}>
          <button className="btn btn-ghost">IG Story</button>
          <button className="btn btn-ghost">儲存</button>
          <button className="btn btn-ghost">複製連結</button>
        </div>

        <div style={s4.privacyNote}>
          卡片不含原始對話 · 只有你的觀察家類型與一句話
        </div>
      </div>
    </Phone>
  );
}

const s4 = {
  card: {
    marginTop: 14,
    aspectRatio: '4/5',
    background: 'linear-gradient(160deg, #fbf5e9 0%, #f4e7d3 100%)',
    borderRadius: 'var(--anyu-radius-3xl)',
    padding: 26,
    position: 'relative', overflow: 'hidden',
    boxShadow: 'var(--anyu-shadow-xl)',
  },
  blobA: {
    position: 'absolute',
    top: -50, right: -40,
    width: 220, height: 220, borderRadius: '50%',
    background: 'radial-gradient(circle at 30% 30%, rgba(155,126,176,.42), transparent 60%)',
    filter: 'blur(4px)',
  },
  blobB: {
    position: 'absolute',
    bottom: -60, left: -50,
    width: 240, height: 240, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(205,138,120,.35), transparent 65%)',
    filter: 'blur(2px)',
  },
  cardHeader: {
    position: 'relative',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  persona: {
    position: 'relative',
    marginTop: 10,
    fontFamily: 'var(--anyu-font-serif)',
    fontWeight: 500,
    fontSize: 38, lineHeight: 1.15,
    color: 'var(--anyu-ink)',
    letterSpacing: '-0.4px',
  },
  quoteWrap: {
    position: 'absolute',
    left: 26, right: 26, top: '54%',
  },
  rule: { width: 32, height: 1.5, background: 'var(--anyu-accent)', marginBottom: 14 },
  quote: {
    fontFamily: 'var(--anyu-font-serif)',
    fontStyle: 'italic',
    fontSize: 17, fontWeight: 400, lineHeight: 1.65,
    color: 'var(--anyu-ink)',
  },
  cardFooter: {
    position: 'absolute',
    left: 26, right: 26, bottom: 26,
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  tempBig: {
    marginTop: 4,
    fontFamily: 'var(--anyu-font-latin)',
    fontStyle: 'italic',
    fontSize: 34, lineHeight: 1,
    color: 'var(--anyu-accent)',
  },
  link: {
    marginTop: 4,
    fontFamily: 'var(--anyu-font-serif)',
    fontSize: 12,
    color: 'var(--anyu-ink)',
  },
  buttons: {
    marginTop: 16,
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
  },
  privacyNote: {
    marginTop: 12,
    padding: 12,
    background: 'var(--anyu-mist)',
    borderRadius: 10,
    fontSize: 12, color: 'var(--anyu-ink)',
    lineHeight: 1.6, textAlign: 'center',
    fontFamily: 'var(--anyu-font-sans)',
  },
};

/* =========================================================================
 *  S5 · Paid preview
 * ========================================================================= */

function PhoneS5() {
  const { Phone, AnyuMark, SectionLabel, LockIcon } = window;
  return (
    <Phone statusTime="22:04">
      <div style={{ padding: '14px 24px 24px', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--anyu-dim)', fontFamily: 'var(--anyu-font-sans)' }}>← 結果</span>
          <AnyuMark size={10} color="var(--anyu-faint)" />
        </div>

        <div style={{ marginTop: 22 }}>
          <SectionLabel>下一句怎麼回 · 完整策略</SectionLabel>
          <h2 style={s5.title}>
            三種<em style={s1.heroAccent}>不失控</em>的<br />回法 · 你選一種。
          </h2>
          <p style={s5.subtitle}>
            幫你保留主動權，也不把自己放低。<br />
            每一種都附 <em style={{ color: 'var(--anyu-accent)', fontStyle: 'normal' }}>為什麼這樣回</em> 的小段分析。
          </p>
        </div>

        {/* 3 cards — A is dark sample, B/C are light + blurred body */}
        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <PaidCardSample />
          <PaidCardLocked letter="B" tag="低壓試探" body="「看你在跟朋友打球，那就先好好玩——哪天⋯」" />
          <PaidCardLocked letter="C" tag="尊嚴守門" body="「這幾天忙的話，等你⋯」" />
        </div>

        <div style={{ flex: 1, minHeight: 24 }} />

        {/* Paywall */}
        <div style={s5.paywall}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <SectionLabel color="var(--anyu-accent)">one-time · no sub</SectionLabel>
              <div style={s5.paywallTitle}>解鎖一次完整回覆策略</div>
            </div>
            <div style={s5.price}>NT$49</div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 16, borderRadius: 12, padding: '14px 0', fontSize: 15 }}>
            解鎖下一句怎麼回
          </button>
          <div style={s5.paywallHint}>
            目前內測 · 點下後留 Email，這次不會真的收費
          </div>
        </div>
      </div>
    </Phone>
  );
}

function PaidCardSample() {
  const { SectionLabel } = window;
  return (
    <div style={s5.cardSample} className="on-dark">
      <div style={s5.cardHeader}>
        <div style={s5.letterChipDark}>A</div>
        <SectionLabel color="var(--anyu-accent)">保留主動權</SectionLabel>
      </div>
      <div style={s5.sampleBody}>
        「最近你好像在忙；我這週四五有空，你想再聊聊嗎？」
      </div>
      <div style={s5.sampleDivider} />
      <div style={s5.sampleWhy}>
        <span style={{ color: 'var(--anyu-accent)', fontStyle: 'normal', fontFamily: 'var(--anyu-font-mono)', fontSize: 11, letterSpacing: 1.2 }}>為什麼這樣回 ·</span>
        <span> 把球給回去，但不催。</span>
      </div>
    </div>
  );
}

function PaidCardLocked({ letter, tag, body }) {
  const { LockIcon, SectionLabel } = window;
  return (
    <div style={s5.cardLocked}>
      <div style={s5.cardHeader}>
        <div style={s5.letterChipLight}>{letter}</div>
        <SectionLabel color="var(--anyu-dim)">{tag}</SectionLabel>
      </div>
      <div style={{ ...s5.lockedBody }} aria-hidden="true">{body}</div>
      <div style={{ position: 'absolute', right: 14, bottom: 14 }}>
        <LockIcon size={14} />
      </div>
    </div>
  );
}

const s5 = {
  title: {
    margin: '10px 0 0',
    fontFamily: 'var(--anyu-font-serif)',
    fontSize: 24, fontWeight: 500, lineHeight: 1.4,
    color: 'var(--anyu-ink)',
    letterSpacing: '-0.2px',
  },
  subtitle: {
    margin: '12px 0 0',
    fontSize: 13.5, lineHeight: 1.7,
    color: 'var(--anyu-dim)',
    fontFamily: 'var(--anyu-font-sans)',
  },
  cardSample: {
    padding: 16,
    background: 'var(--anyu-ink-dark)',
    borderRadius: 'var(--anyu-radius-lg)',
    position: 'relative',
  },
  cardLocked: {
    padding: 16,
    background: 'var(--anyu-card)',
    border: '1px solid var(--anyu-line)',
    borderRadius: 'var(--anyu-radius-lg)',
    position: 'relative',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex', alignItems: 'center', gap: 12,
    marginBottom: 10,
  },
  letterChipDark: {
    width: 24, height: 24, borderRadius: 12,
    background: 'var(--anyu-accent)',
    color: 'var(--anyu-ink-dark)',
    fontFamily: 'var(--anyu-font-latin)',
    fontSize: 14, fontStyle: 'italic', fontWeight: 500,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  letterChipLight: {
    width: 24, height: 24, borderRadius: 12,
    background: 'transparent',
    color: 'var(--anyu-accent)',
    border: '1px solid var(--anyu-accent-45)',
    fontFamily: 'var(--anyu-font-latin)',
    fontSize: 14, fontStyle: 'italic', fontWeight: 500,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  sampleBody: {
    fontSize: 14, lineHeight: 1.7,
    color: 'var(--anyu-ink-onDark)',
    fontFamily: 'var(--anyu-font-sans)',
  },
  sampleDivider: {
    margin: '12px 0',
    borderTop: '1px dashed var(--anyu-line-onDark)',
  },
  sampleWhy: {
    fontSize: 13, lineHeight: 1.65,
    color: 'var(--anyu-dim-onDark)',
    fontStyle: 'italic',
    fontFamily: 'var(--anyu-font-sans)',
  },
  lockedBody: {
    fontSize: 14, lineHeight: 1.7,
    color: 'var(--anyu-ink)',
    fontFamily: 'var(--anyu-font-sans)',
    filter: 'blur(4.5px)',
    userSelect: 'none',
  },
  paywall: {
    marginTop: 18,
    padding: 20,
    background: 'var(--anyu-card)',
    border: '1px solid var(--anyu-accent-45)',
    borderRadius: 'var(--anyu-radius-lg)',
    boxShadow: 'var(--anyu-shadow-lg)',
  },
  paywallTitle: {
    marginTop: 6,
    fontFamily: 'var(--anyu-font-serif)',
    fontSize: 17, fontWeight: 500, lineHeight: 1.4,
    color: 'var(--anyu-ink)',
  },
  price: {
    fontFamily: 'var(--anyu-font-latin)',
    fontStyle: 'italic',
    fontSize: 28, lineHeight: 1,
    color: 'var(--anyu-accent)',
  },
  paywallHint: {
    marginTop: 10,
    fontSize: 11.5, lineHeight: 1.5,
    color: 'var(--anyu-dim)',
    textAlign: 'center',
    fontFamily: 'var(--anyu-font-sans)',
  },
};

/* =========================================================================
 *  S6 · Contact capture
 * ========================================================================= */

function PhoneS6() {
  const { Phone, AnyuMark, Moon, SectionLabel } = window;
  return (
    <Phone statusTime="22:06">
      <div style={{ padding: '14px 24px 24px', minHeight: '100%', display: 'flex', flexDirection: 'column', background: 'var(--anyu-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 18, color: 'var(--anyu-dim)', cursor: 'pointer' }} aria-label="關閉">×</span>
          <AnyuMark size={10} color="var(--anyu-faint)" />
        </div>

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
          <Moon phase={0.55} size={56} color="var(--anyu-accent)" soft />
        </div>

        <div style={{ marginTop: 22, textAlign: 'center' }}>
          <SectionLabel>目前內測中</SectionLabel>
          <h2 style={s6.title}>這次不會真的收費。</h2>
          <p style={s6.subtitle}>
            留下 LINE 或 Email，<br />
            我們會在 24 小時內人工送你一次完整分析。
          </p>
        </div>

        <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="Email" placeholder="you@example.com" active />
          <Field label="LINE ID（可選）" placeholder="@your_id" />

          {/* Consent */}
          <div style={s6.consent}>
            <span style={s6.checkbox} aria-checked="true" role="checkbox" tabIndex={0}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="var(--anyu-surface)" strokeWidth="1.8" strokeLinecap="round">
                <path d="M1.5 5L4 7.5 8.5 2" />
              </svg>
            </span>
            <label style={s6.consentLabel}>
              我同意把這段對話用於改善分析準確度（會去識別化處理）
            </label>
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 24 }} />

        <button className="btn btn-accent">送出 · 等我們的完整分析</button>
        <div style={s6.footer}>不寄電子報 · 不分享第三方 · 隨時可刪除</div>
      </div>
    </Phone>
  );
}

function Field({ label, placeholder, active = false }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--anyu-font-mono)', fontSize: 11, color: 'var(--anyu-dim)', letterSpacing: 0.5, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{
        padding: '13px 14px',
        background: 'var(--anyu-card)',
        borderRadius: 10,
        border: active ? '1.5px solid var(--anyu-accent-45)' : '1.5px solid var(--anyu-line)',
        boxShadow: active ? '0 0 0 4px var(--anyu-accent-12)' : 'none',
        display: 'flex', alignItems: 'center',
      }}>
        <span style={{
          fontSize: 14,
          color: active ? 'var(--anyu-ink)' : 'var(--anyu-faint)',
          fontStyle: active ? 'normal' : 'italic',
          fontFamily: 'var(--anyu-font-sans)',
        }}>{placeholder}</span>
        {active && <span style={{ display: 'inline-block', width: 1.5, height: 16, background: 'var(--anyu-accent)', marginLeft: 2, animation: 'anyu-pulse 1100ms infinite' }} />}
      </div>
    </div>
  );
}

const s6 = {
  title: {
    margin: '14px 0 0',
    fontFamily: 'var(--anyu-font-serif)',
    fontSize: 22, fontWeight: 500, lineHeight: 1.5,
    color: 'var(--anyu-ink)',
    letterSpacing: '-0.2px',
  },
  subtitle: {
    margin: '12px 0 0',
    fontSize: 14, lineHeight: 1.7,
    color: 'var(--anyu-dim)',
    fontFamily: 'var(--anyu-font-sans)',
  },
  consent: {
    padding: 14,
    background: 'var(--anyu-mist)',
    borderRadius: 10,
    display: 'flex', gap: 10, alignItems: 'flex-start',
  },
  checkbox: {
    width: 18, height: 18, borderRadius: 4,
    background: 'var(--anyu-accent)',
    border: '1.5px solid var(--anyu-accent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginTop: 1, cursor: 'pointer',
  },
  consentLabel: {
    fontSize: 12.5, lineHeight: 1.6,
    color: 'var(--anyu-ink)',
    fontFamily: 'var(--anyu-font-sans)',
    cursor: 'pointer',
  },
  footer: {
    marginTop: 10,
    fontSize: 11, color: 'var(--anyu-dim)',
    textAlign: 'center',
    fontFamily: 'var(--anyu-font-sans)',
  },
};

/* =========================================================================
 *  S7 · Confirmation
 * ========================================================================= */

function PhoneS7() {
  const { Phone, AnyuMark, Moon, SectionLabel } = window;
  return (
    <Phone statusTime="22:07">
      <div style={{ padding: '14px 24px', minHeight: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div aria-hidden="true" style={s7.glow} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--anyu-dim)', fontFamily: 'var(--anyu-font-sans)' }}>← 結果</span>
          <AnyuMark size={10} color="var(--anyu-faint)" />
        </div>

        <div style={s7.center}>
          <Moon phase={0.6} size={92} color="var(--anyu-accent)" soft />
          <SectionLabel color="var(--anyu-accent)">received</SectionLabel>
          <h2 style={s7.title}>已經收到了。</h2>
          <p style={s7.body}>
            我們會在 24 小時內，<br />
            把完整的回覆策略寄給你。
          </p>
          <div style={s7.divider} />
          <p style={s7.softLine}>
            「現在最不該做的，<br />
            是把壓力全部丟到自己身上。」
          </p>
        </div>

        <div style={s7.footer}>
          <AnyuMark size={10} color="var(--anyu-faint)" />
        </div>
      </div>
    </Phone>
  );
}

const s7 = {
  glow: {
    position: 'absolute', top: 180, left: '50%',
    width: 320, height: 320, marginLeft: -160, borderRadius: '50%',
    background: 'radial-gradient(circle, var(--anyu-accent-20) 0%, transparent 60%)',
    filter: 'blur(40px)', pointerEvents: 'none',
  },
  center: {
    flex: 1, position: 'relative',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    textAlign: 'center',
    gap: 18,
  },
  title: {
    margin: '8px 0 0',
    fontFamily: 'var(--anyu-font-serif)',
    fontSize: 28, fontWeight: 500, lineHeight: 1.4,
    color: 'var(--anyu-ink)',
    letterSpacing: '-0.3px',
  },
  body: {
    margin: 0,
    fontSize: 14.5, lineHeight: 1.75,
    color: 'var(--anyu-dim)',
    fontFamily: 'var(--anyu-font-sans)',
  },
  divider: {
    width: 32, height: 1.5,
    background: 'var(--anyu-accent)',
    marginTop: 8,
  },
  softLine: {
    margin: 0,
    fontFamily: 'var(--anyu-font-serif)',
    fontStyle: 'italic',
    fontSize: 15, lineHeight: 1.7,
    color: 'var(--anyu-ink)',
    maxWidth: 280,
  },
  footer: {
    paddingBottom: 32,
    display: 'flex', justifyContent: 'center',
  },
};

Object.assign(window, {
  SectionScreens,
  PhoneS1, PhoneS1Filled, PhoneS2, PhoneS3, PhoneS3Dark, PhoneS4, PhoneS5, PhoneS6, PhoneS7,
});
