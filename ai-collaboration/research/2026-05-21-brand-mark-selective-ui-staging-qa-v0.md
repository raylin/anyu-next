# Brand Mark Selective UI Staging QA v0

Date: 2026-05-21

## 1. Summary

Staging QA passed for the selective AnyuMark rollout. `staging.anyu.tw` is serving a deployment newer than rollout commit `311c14b`, the landing and result headers both show the selective lockup, the runtime result and unlock flow still work, the share/persona surface uses the quieter mini lockup, and public icon assets remain present. No fix was needed.

This was not a true interactive browser/devtools pass. Verification used protected staging HTML inspection, one synthetic live analyze flow, one live unlock-intent call, public asset checks, local source review, and one live client-bundle inspection for the LINE URL.

## 2. Deployment Freshness

- `origin/staging` head at verification time: `311c14b`
- `vercel inspect https://staging.anyu.tw` resolved to ready preview deployment:
  - `https://anyu-next-4whdhg3sd-studioanyu-1488s-projects.vercel.app`
  - created `2026-05-21 01:03 +08`
- Conclusion:
  - staging serves `311c14b` or newer

## 3. Landing Header QA

- Passed.
- Live landing HTML shows:
  - `anyu-wordmark anyu-wordmark-quiet`
  - embedded `anyu-wordmark-mark`
  - text brand `暗語 ANYU`
- Result:
  - mark is visible but still secondary to the main content
  - text-first brand remains readable
  - nothing in the SSR structure suggests header crowding or unstable spacing

## 4. Result Header QA

- Passed.
- Demo and live runtime result HTML both show:
  - back link remains clear
  - `Wordmark` with embedded `AnyuMark`
- Result:
  - lockup is consistent with landing
  - header does not appear to compete with the score block

## 5. Loading State QA

- Passed with limitation.
- No true interactive browser control was available here, so loading-state behavior was verified by source/bundle rather than by watching the animation in a live browser viewport.
- Verified locally:
  - `InputCard` loading state uses animated `AnyuMark`
  - elapsed-time wait copy logic remains intact
  - scroll/focus-to-loading behavior remains intact
  - reduced-motion CSS remains safe in `apps/web/src/styles/anyu-mark.css`
- Conclusion:
  - no regression evidence
  - final motion/feel judgment still benefits from human browser/device QA

## 6. Temperature Card QA

- Passed.
- Demo and live runtime result HTML confirm:
  - old purple orphan orb is gone
  - score hierarchy remains strong
  - `cold / warm / hot` labels still render
  - thinner primary temperature meter still reads clearly in source structure
- Result:
  - card does not look structurally empty after orb removal

## 7. Signal / Gradient QA

- Passed.
- Live result HTML confirms signal rows and thin bars remain present.
- Local CSS confirms:
  - primary temperature gradient is `accent2 -> rose -> accent`
  - signal rows use a stable accent fill
  - thin bar height is now intentional and consistent
- Result:
  - no readability regression detected from structure/CSS review

## 8. Share / Persona Card QA

- Passed.
- Demo and live runtime result HTML confirm:
  - old purple share dot is gone
  - mini lockup `anyu-wordmark-share` is present
  - persona/share content remains the dominant visual content
  - share button still renders
- Result:
  - mini brand treatment improves continuity without making the share shell feel logo-heavy

## 9. Favicon / Manifest QA

- Passed.
- Live public assets returned `200 OK`:
  - `/favicon.svg`
  - `/manifest.webmanifest`
  - `/icon-192.png`
  - `/icon-512.png`
  - `/apple-touch-icon.png`

## 10. Funnel Regression QA

- Passed with one source-backed limitation.
- Verified live:
  - landing route loads
  - demo result route loads
  - synthetic analyze succeeded:
    - returned runtime `resultId` `191850e4-2e18-4f83-b6a5-aba7a16e8371`
  - runtime result route loads
  - unlock intent succeeded:
    - `unlockIntentId` `5a828162-7123-4248-b96a-24511da60389`
  - legal footer links remain on landing and result
- Verified via live client bundle:
  - `getLineAddUrl` currently resolves to `https://lin.ee/S6dnbJO`
  - same-tab LINE handoff still uses `window.location.href`
  - Email fallback remains available
- Limitation:
  - no true human click-through of the contact panel or loading state in a browser viewport was performed here

## 11. Issues Found

- None requiring code changes.

## 12. Fixes Applied

- None.

## 13. Remaining UI Polish Backlog

- Human browser/device pass for the loading ornament, spacing feel, and contact-panel interaction remains useful.
- Font migration remains deferred and was not revisited in this pass.
- Conversion/paywall rhythm remains a separate polish track, not a regression item from this rollout.

## 14. Recommendation

- Accept the selective brand-mark rollout as staging-healthy.
- Do not make additional UI changes from this QA pass.

## 15. Recommended Next Step

- `Module 01 Human Browser Funnel Pass v0`
