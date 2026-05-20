# Font Migration Phase 1 Staging QA v0

## Summary

Completed a staging QA pass for the Phase 1 Latin display font migration. Staging is serving commit `7bb4e91` or newer, `Instrument Serif` is live on the landing and result surfaces, no active `Cormorant` references remain in current app/source-of-truth paths, and one synthetic staging funnel pass confirmed analyze, runtime result load, and unlock intent still work. No fix was required.

## Deployment Freshness

- `origin/staging` contains `7bb4e91` (`design: migrate latin display font`)
- `staging.anyu.tw` resolved to ready preview deployment `anyu-next-o06vnjii3-studioanyu-1488s-projects.vercel.app`
- Deployment creation time reported by Vercel was newer than the Phase 1 rollout commit, so staging is serving `7bb4e91` or newer

## Font Loading Verification

- Live staging landing HTML includes:
  - `https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap`
  - `preconnect` hints for `fonts.googleapis.com` and `fonts.gstatic.com`
- Live demo-result HTML includes the same Instrument Serif stylesheet and preconnect tags
- Live runtime-result HTML for the synthetic analyze sample also includes the same Instrument Serif stylesheet and preconnect tags
- No active `Cormorant` string was found in the inspected live staging HTML

## Landing Visual QA

- Landing route `https://staging.anyu.tw/m/ambiguous-temperature` returned `200`
- Header lockup rendered with the current selective AnyuMark treatment
- The Latin wordmark surface still renders `ANYU`, which is one of the intended `--anyu-font-latin` consumers for this phase
- No obvious structural regression was visible in the staging SSR HTML

## Result / Demo Result Visual QA

- Demo result route `https://staging.anyu.tw/m/ambiguous-temperature/result/demo` returned `200`
- Runtime result route for the synthetic sample loaded successfully
- Large temperature numerals and `/100` score treatment remained present on demo and runtime result surfaces
- Paid price numerals (`NT$49`) remained present on demo and runtime result surfaces
- Share/persona mini brand treatment remained present
- No obvious structural regression was visible in the inspected result HTML

## Mobile / Browser Readability

- The QA evidence supports that the intended font is loading on the key landing/result surfaces
- No obvious layout-break or missing-font symptom was visible in the protected staging HTML or active client bundle
- This was not a true interactive browser/devtools or real-device session, so final judgment on exact rendering feel, FOUT behavior, and numeral elegance still benefits from a human phone/browser pass

## Funnel Regression QA

- Synthetic analyze on staging succeeded with:
  - `resultId`: `cb33d228-716a-4dd3-bcce-e3c1e2938e66`
  - `redirectTo`: `/m/ambiguous-temperature/result/cb33d228-716a-4dd3-bcce-e3c1e2938e66`
- Runtime result route loaded successfully for that `resultId`
- Unlock intent succeeded with:
  - `unlockIntentId`: `6d7c981f-6969-4569-91b2-e5a6d303601c`
- Live client bundle inspection still showed the LINE-first contact path, same-tab LINE handoff via `window.location.href`, and Email fallback support

## Source Search Results

- Active app/source-of-truth paths contain `Instrument Serif` in:
  - `apps/web/src/app/layout.tsx`
  - `apps/web/src/styles/tokens.css`
  - `docs/design-system/tokens-v1.1.css`
  - `apps/web/README.md`
  - `docs/design-system/README.md`
  - `docs/design-system/anyu-design-system-v1.1.md`
- No active `Cormorant Garamond` / `Cormorant` references remained in the checked current app/source-of-truth paths
- No committed local font files were found under `apps/web/`
- Deferred typography references like `Newsreader` / `LXGW WenKai` remain outside the active Phase 1 runtime path

## Issues Found

- No staging regression requiring a tiny safe fix was found

## Fixes Applied

- None

## Remaining Typography Backlog

- Human browser/device verification for exact Instrument Serif rendering feel on:
  - wordmark Latin
  - large temperature numerals
  - share numerals
  - price numerals
- Later typography phases remain deferred:
  - Newsreader
  - LXGW WenKai

## Recommendation

- Accept Phase 1 as staging-ready based on current QA evidence
- Do not broaden into later font phases yet
- Use a human browser/device funnel pass for final rendering confidence before broader typography work

## Recommended Next Step

- `Module 01 Human Browser Funnel Pass v0`
