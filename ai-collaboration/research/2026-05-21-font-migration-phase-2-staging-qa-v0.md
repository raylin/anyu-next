# Font Migration Phase 2 Staging QA v0

Date: 2026-05-21

## 1. Summary

Staging QA passed for Font Migration Phase 2 editorial reading. `staging.anyu.tw` is serving a deployment newer than `d8bef11`, `Newsreader` is live on landing, demo result, and runtime result surfaces, `.t-reading` remains scoped to selected long-form result copy, and one synthetic staging funnel confirmed analyze, runtime result load, unlock intent, and Email fallback still work. No fix was needed.

This was not a true interactive browser/devtools or real-device session. Verification used protected staging HTML inspection, one synthetic live analyze flow, one live unlock-intent call, one synthetic Email fallback call, and local source inspection for the LINE panel behavior.

## 2. Deployment Freshness

- `origin/staging` head at verification time: `d8bef11`
- `corepack pnpm dlx vercel inspect https://staging.anyu.tw` resolved to ready preview deployment:
  - `https://anyu-next-6qpzt00tp-studioanyu-1488s-projects.vercel.app`
  - created `2026-05-21 07:20:34 +08`
- Conclusion:
  - staging serves `d8bef11` or newer

## 3. Font Loading Verification

- Live landing HTML includes:
  - `https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,300;1,6..72,400&display=swap`
  - preconnect hints for `fonts.googleapis.com` and `fonts.gstatic.com`
- Live demo-result HTML includes the same stylesheet and preconnect tags
- Live runtime-result HTML for the synthetic sample also includes the same stylesheet and preconnect tags
- `Instrument Serif` still loads alongside `Newsreader`
- No active `LXGW WenKai` string was found in the checked source/runtime path
- No active `Cormorant` string was found in the inspected live staging HTML

## 4. Insight / Long-form Readability QA

- Demo result and live runtime result both show:
  - `class="anyu-copy t-reading"`
  - `class="anyu-reassurance t-reading"`
- The editorial reading treatment is confined to the intended long-form paragraphs
- Paragraph content remains structurally readable in the protected HTML:
  - comfortable line breaks
  - no obvious overflow
  - no broken wrapping or collapsed spacing
- Based on the markup/CSS evidence, the treatment reads more editorial without obviously slowing down the surrounding result flow

## 5. Paid Preview Sample QA

- Demo result and live runtime result both show:
  - `class="anyu-reply-copy t-reading"` on the visible A-card sample reply
- Locked B/C cards remain unchanged:
  - `anyu-reply-copy anyu-reply-copy-locked`
  - `⋯ 尚未解鎖`
- Price, CTA, and support copy remain unchanged:
  - `NT$49`
  - `一次性 · no subscription`
  - `解鎖下一句怎麼回 — NT$49`
- The reading serif appears only on the visible editorial sample, not across the whole paid section

## 6. Scope Verification

- Verified as not widened to:
  - transition CTA button
  - share action button
  - subtle note beneath the transition card
  - landing textarea/helper surfaces
  - legal footer links
- Source checks confirm the active `.t-reading` usage remains limited to:
  - `AiTemperatureResult` insight paragraph
  - `AiTemperatureResult` reassurance paragraph
  - `PaidPreviewCard` sample reply paragraph
- Source checks also confirm:
  - LINE panel title remains `加入 LINE，收到完整分析開放通知`
  - LINE CTA remains `加入 LINE，收到開放通知`
  - Email fallback remains `改用 Email 接收通知`
  - same-tab LINE handoff still uses `window.location.href`

## 7. Mobile / Browser Rendering

- A true interactive browser/device session was not available in this shell environment
- Final judgment on:
  - exact Newsreader weight on mobile
  - possible FOUT timing
  - scroll rhythm and tap feel
  still benefits from a human phone/browser pass
- No obvious font-loading or layout-break symptom was visible in the protected HTML or active source checks

## 8. Funnel Regression QA

- Landing route loaded successfully
- Demo result route loaded successfully
- Synthetic analyze on staging succeeded:
  - `resultId`: `27408870-1c13-4bca-b076-49db72c11b86`
  - `redirectTo`: `/m/ambiguous-temperature/result/27408870-1c13-4bca-b076-49db72c11b86`
- Runtime result route loaded successfully for that result
- Unlock intent succeeded:
  - `unlockIntentId`: `a2c5a0a4-fd35-4576-bea5-c56be98e04c0`
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

- Human browser/device verification for exact Newsreader rendering feel on:
  - insight long-form paragraphs
  - reassurance paragraphs
  - paid-preview sample reply
- Phase 3 `LXGW WenKai` remains deferred

## 12. Recommendation

- Accept Font Migration Phase 2 as staging-ready based on current QA evidence
- Do not widen `Newsreader` to additional surfaces from this QA pass
- Keep later typography work separate from this validated narrow rollout

## 13. Recommended Next Step

- `Module 01 Human Browser Funnel Pass v0`
