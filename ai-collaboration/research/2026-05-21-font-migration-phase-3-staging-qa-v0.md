# Font Migration Phase 3 Staging QA v0

Date: 2026-05-21

## 1. Summary

Staging QA passed for Font Migration Phase 3 kai quote typography. `staging.anyu.tw` is serving a deployment newer than `3d7aa7d`, the `LXGW WenKai` stylesheet is live on landing, demo result, and runtime result surfaces, and kai typography remains narrowly scoped to the intended short quote surfaces only. One synthetic staging funnel also confirmed analyze, runtime result load, unlock intent, and Email fallback still work. No fix was needed.

This was not a true interactive browser/devtools or real-device session. Verification used protected staging HTML inspection, one synthetic live analyze flow, one live unlock-intent call, one synthetic Email fallback call, and local source inspection for the LINE panel behavior.

## 2. Deployment Freshness

- `origin/staging` head at verification time: `3d7aa7d`
- `corepack pnpm dlx vercel inspect https://staging.anyu.tw` resolved to ready preview deployment:
  - `https://anyu-next-hq6lf905z-studioanyu-1488s-projects.vercel.app`
  - created `2026-05-21 07:37:17 +08`
- Conclusion:
  - staging serves `3d7aa7d` or newer

## 3. Font Loading Verification

- Live landing HTML includes:
  - `https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,300;1,6..72,400&display=swap`
  - `https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/style.css`
  - preconnect hints for `fonts.googleapis.com` and `fonts.gstatic.com`
- Live demo-result HTML includes the same stylesheet set
- Live runtime-result HTML for the synthetic sample also includes the same stylesheet set
- `Instrument Serif` still loads
- `Newsreader` still loads
- No active `Cormorant` string was found in the inspected live staging HTML
- No font files are committed; source check stayed on external stylesheet loading only

## 4. Result Hook Quote QA

- Demo result and live runtime result both show:
  - `class="anyu-lead-quote t-quote"`
- The hook quote treatment reads as the intended narrow whisper-like surface from structure and token scope:
  - single short sentence
  - isolated inside the quote card
  - not widened into surrounding body text
- No forced italic/slant remains on the kai quote utility path
- No obvious overflow or broken wrapping was visible in the inspected demo/runtime HTML

## 5. Share-card Quote QA

- Demo result and live runtime result both show:
  - `class="anyu-share-quote t-kai-quote"`
- Persona, temperature, and share actions remain structurally separate from the quote surface
- The quote does not compete with the persona label or score hierarchy in markup order
- No obvious ornamental spillover was visible in the protected HTML

## 6. Scope Verification

- Verified as not widened to:
  - insight long paragraphs
  - reassurance long text
  - paid-preview sample reply
  - transition CTA button
  - share action button
  - landing input/helper surfaces
  - legal footer links
  - mono labels
- Source checks confirm active kai usage remains limited to:
  - `AiTemperatureResult` lead quote
  - `ShareCardPreview` share quote
- Source checks also confirm:
  - long-form editorial surfaces remain `t-reading`
  - LINE panel title remains `加入 LINE，收到完整分析開放通知`
  - LINE CTA remains `加入 LINE，收到開放通知`
  - Email fallback remains `改用 Email 接收通知`
  - same-tab LINE handoff still uses `window.location.href`

## 7. Mobile / Browser Rendering

- A true interactive browser/device session was not available in this shell environment
- Final judgment on:
  - exact handwritten/whisper feel of `LXGW WenKai`
  - possible FOUT timing
  - quote wrapping on real phones
  still benefits from a human phone/browser pass
- No obvious font-loading or layout-break symptom was visible in the protected HTML or active source checks

## 8. Funnel Regression QA

- Landing route loaded successfully
- Demo result route loaded successfully
- Synthetic analyze on staging succeeded:
  - `resultId`: `a13ab5c7-e9e8-4407-aea3-21b2ebb3f7eb`
  - `redirectTo`: `/m/ambiguous-temperature/result/a13ab5c7-e9e8-4407-aea3-21b2ebb3f7eb`
- Runtime result route loaded successfully for that result
- Unlock intent succeeded:
  - `unlockIntentId`: `8fdc88c4-c13b-4bfd-bcbf-64e6ffb87e30`
- Email fallback submit succeeded with synthetic email:
  - response: `{"ok":true,"message":"已收到你的聯絡方式，我們會在完整分析開放時通知你。"}`
- Legal footer links remain present on demo and runtime result surfaces
- LINE-first panel behavior remains source-verified:
  - target URL `https://lin.ee/S6dnbJO`
  - same-tab handoff via `window.location.href`
  - Email fallback still available

## 9. Issues Found

- No blocking staging regression found
- No tiny safe fix was necessary
- Limitation only:
  - no true interactive browser/device pass was available

## 10. Fixes Applied

- None

## 11. Remaining Typography Backlog

- Human browser/device verification for exact kai rendering feel on:
  - result hook quote
  - share-card quote
- No broader typography expansion is justified from this pass

## 12. Recommendation

- Accept Font Migration Phase 3 as staging-ready based on current QA evidence
- Do not widen `LXGW WenKai` to additional surfaces from this QA pass
- Keep the current font split intact:
  - `Instrument Serif` for Latin display
  - `Newsreader` for long-form reading
  - `LXGW WenKai` for short quote/whisper surfaces

## 13. Recommended Next Step

- `Module 01 Human Browser Funnel Pass v0`
