# Conversion CTA Rhythm Staging QA v0

Date: 2026-05-21

## 1. Summary

Staging QA passed for Conversion / CTA Rhythm Polish v0. `staging.anyu.tw` is serving a deployment newer than `df99f26`, the new inline CTA is live on demo and runtime result surfaces, share/payed-preview/LINE copy changes are present, and one synthetic staging funnel confirmed analyze, runtime result load, unlock intent, and Email fallback still work. No UI fix was needed.

## 2. Deployment Freshness

- `origin/staging` head includes:
  - `df99f26 docs: finalize conversion rhythm reports`
  - `06f7d2a design: polish result conversion rhythm`
- `corepack pnpm dlx vercel inspect https://staging.anyu.tw` returned ready preview deployment:
  - `https://anyu-next-ph2pwptle-studioanyu-1488s-projects.vercel.app`
- Deployment timestamp was newer than `df99f26`, so staging is serving `df99f26` or newer

## 3. Inline CTA Rhythm QA

- Inline CTA is present after the main insight block, not at the top of the page
- Live copy on demo and runtime result surfaces:
  - `想知道下一句怎麼回？`
  - `解鎖 3 種不失控的回法，從主動推進、低壓試探到暫時拉開。`
  - `看下一句怎麼回`
- Placement feels reasonable from markup order:
  - temperature
  - quote
  - observed signals
  - insight
  - inline CTA
  - disclaimer
  - share
  - paid preview
- Source review confirms inline CTA reuses the existing unlock/contact flow and scroll target:
  - `scrollToNextStep()`
  - `revealContact("inline_result_cta")`
- No duplicate paid panel or confusing second paywall path was introduced

## 4. Event / Metadata Verification

- Safe verification available:
  - source code
  - live client bundle inspection
  - live unlock API success using `source: inline_result_cta`
- Verified in source/bundle:
  - inline CTA sends `source: "inline_result_cta"`
  - paid preview fallback path defaults to `source: "paid_preview"`
  - existing event taxonomy remains unchanged
- Direct DB/event-row verification of persisted `paid_unlock_clicked` metadata source was not performed in this shell session, so the metadata result is implementation-verified rather than DB-row-verified
- No raw input, email, LINE ID, full result JSON, or provider raw output were added to event payloads in the verified code path

## 5. Share Affordance QA

- Live share action copy is present on demo and runtime result surfaces:
  - `分享這個結果`
  - `複製成 LINE / Threads 可以貼上的文字`
- Success-state copy remains implementation-verified in source/bundle:
  - `已複製，可以貼到 LINE / Threads`
- The share button still reads like a secondary social action rather than the primary conversion action
- No regression to native share / clipboard fallback behavior was found in source review

## 6. Paid Preview Hierarchy QA

- A card remains the visible sample
- B/C locked cards now show:
  - `⋯ 尚未解鎖`
- Locked cards no longer read like a heavy loading blur:
  - blur softened in CSS
  - locked state still visibly different
- Live demo and runtime result surfaces show:
  - `一次性查看 · 無訂閱`
  - `一次性 · no subscription`
  - `NT$49`
  - `目前內測中，這次不會真的收費。點下後可加入 LINE 收到開放通知，或改用 Email。`

## 7. LINE Panel Copy QA

- Bundle/source verification confirms the current panel copy remains:
  - title: `加入 LINE，收到完整分析開放通知`
  - body: `目前內測中，這次不會真的收費。加入後，我們會優先通知你完整分析與新測驗開放。`
  - CTA: `加入 LINE，收到開放通知`
  - fallback: `改用 Email 接收通知`
- Repeated configured-LINE explanatory copy was removed when a LINE URL is present
- Support note remains:
  - `你可以隨時封鎖官方帳號，或來信 hello@anyu.tw 要求刪除資料。`
- No copy claims immediate complete-analysis delivery

## 8. Funnel Regression QA

- Landing route still healthy by prior staging baseline and current deployment health
- Demo result route loaded successfully
- Synthetic analyze succeeded:
  - `resultId`: `d9ff16ee-856e-4f5c-95b3-2b88e444d120`
- Runtime result route loaded successfully for that result
- Unlock intent succeeded:
  - `unlockIntentId`: `e5715253-6384-4277-a2cb-b3fad4ba36c7`
- Email fallback submit succeeded with synthetic email:
  - response: `{"ok":true,"message":"已收到你的聯絡方式，我們會在完整分析開放時通知你。"}`
- LINE target remained visible in the live bundle:
  - `https://lin.ee/S6dnbJO`
- Same-tab LINE handoff via `window.location.href` remained visible in the live bundle
- Legal footer links remained on demo and runtime result surfaces

## 9. Mobile / Browser Feel

- A true interactive browser/device pass was not available in this shell session
- Mobile-feel judgment is therefore based on:
  - live staging HTML order
  - live bundle/source inspection
  - button copy/weight comparison
- Based on that evidence:
  - the inline CTA does not appear too early
  - the share button does not obviously overpower the main conversion path
  - the paid section remains the clear deeper action area
- Actual tap/scroll smoothness and final perceived crowding still benefit from a human phone/browser pass

## 10. Issues Found

- No blocking staging regression found
- No tiny safe UI/CSS fix was necessary
- Limitation only:
  - direct DB verification of `paid_unlock_clicked` source metadata was not performed
  - no true interactive browser/device pass was available

## 11. Fixes Applied

- None

## 12. Remaining Conversion Backlog

- Human browser/device judgment of CTA rhythm and scroll feel
- Later broader paywall/conversion refinement only if explicitly approved
- Broader share/result polish beyond this narrow pass

## 13. Recommendation

- Accept Conversion / CTA Rhythm Polish v0 as staging-ready
- Do not broaden the UI again before a human/browser pass unless a concrete regression appears
- Keep the current fake-door / LINE-first structure intact for consistent funnel reading

## 14. Recommended Next Step

- `Module 01 Human Browser Funnel Pass v0`
