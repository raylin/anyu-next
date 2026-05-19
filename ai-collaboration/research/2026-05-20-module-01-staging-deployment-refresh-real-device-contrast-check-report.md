# Module 01 Staging Deployment Refresh + Real-Device Contrast Check Report

## 1. Summary

`https://staging.anyu.tw` is now serving commit `cedd219` or newer.

The staging alias was refreshed to a newer deployment than the stale one seen in the previous handoff, and the refreshed deployment passed:

- landing route load
- demo result route load
- live analyze with synthetic input
- runtime result route load
- unlock intent submit
- contact submit

The v1.1 reapplication is visibly present in the live staging HTML and route behavior.

## 2. Staging URL

- primary: `https://staging.anyu.tw/m/ambiguous-temperature`
- demo: `https://staging.anyu.tw/m/ambiguous-temperature/result/demo`

## 3. Deployment Freshness Check

- local `origin/staging` already included `cedd219`
- `vercel inspect https://staging.anyu.tw` resolved to:
  - deployment URL: `https://anyu-next-5cd8bm1el-studioanyu-1488s-projects.vercel.app`
  - status: `Ready`
  - target: `preview`
- the prior stale deployment was `anyu-next-9jb404t5x-studioanyu-1488s-projects.vercel.app`
- current staging is therefore serving a newer deployment than the stale one documented in the previous task

## 4. Alias / Domain Check

- `vercel alias ls` showed:
  - `staging.anyu.tw` → `anyu-next-5cd8bm1el-studioanyu-1488s-projects.vercel.app`
  - `anyu-next-git-staging-studioanyu-1488s-projects.vercel.app` → same deployment
- no production alias changes were made
- `anyu.tw` was untouched

## 5. Staging Smoke Result

Passed:

- landing loads on staging
- demo result loads on staging
- `/api/health` returns `{ "ok": true, "service": "anyu-next-web" }`
- live analyze returned:
  - `ok: true`
  - a real `resultId`
  - a runtime redirect path
- runtime result route loaded using the returned `resultId`
- unlock intent returned `ok: true`
- contact submit returned `ok: true`

Synthetic input used:

`他最近回訊息變慢，但還是會看我的限動。我不知道他是真的忙，還是已經沒那麼喜歡我了。`

## 6. Real-Device / Browser QA Method

True real-device interaction was not available in this shell environment.

QA method used:

- authenticated protected-route staging fetches via `vercel curl`
- live HTML inspection of landing, demo result, and runtime result routes
- live API exercise of analyze, unlock-intent, and contact routes
- comparison against the v1.1 design rules and current CSS/component structure

This is a browser-style staging verification pass, not a literal touch-device session.

## 7. Landing Contrast Findings

- chips now render with the updated default/active hierarchy and no longer read like disabled ghost pills
- selected chip state is structurally clear in the live HTML (`anyu-chip-active`)
- primary CTA text and helper copy match the newer v1.1-adoption pass
- the old stale helper copy `通常數十秒內` is gone, confirming the refreshed deployment is live
- brand hierarchy remains present but quieter than the hook

## 8. Loading State Findings

- live analyze succeeded, so the loading path is active in the deployment
- this shell environment cannot visually watch the in-flight loading animation frame by frame
- based on the deployed code path and successful long-running analyze request, no runtime breakage was introduced by the v1.1 loading treatment
- a true interactive browser pass is still preferable for final judgment of perceived rhythm and reassurance

## 9. Observed Signal Findings

- observed signals now render as a plain section/list structure rather than the older pale-card drift
- labels (`主動度`, `即時性`, `情緒投入`) are strong text, not faded helper text
- numeric values are readable and no longer use the weaker accent-number treatment
- hints remain readable and look like intentional secondary text, not disabled content
- the result now follows the v1.1 “signal list on page background” intent closely enough for staging

## 10. Paid Preview Findings

- Card A now renders as the dark readable sample card
- B/C remain light locked cards
- titles and labels remain readable while only body content is blurred/locked
- `ONE-TIME · NO SUB`, price, and CTA all remain structurally readable
- the section no longer has the previous “gray fog” hierarchy problem

## 11. Contact / Share Findings

- runtime result page still renders the share surface and contact area without regression
- unlock intent succeeded on staging
- contact submit succeeded on staging with synthetic data
- no new readability problem was found in the confirmation-capable contact path from this route/API sweep

## 12. Issues Found

- no deployment freshness blocker remains
- no obvious runtime regression was found
- no clear contrast bug required a same-task patch from this environment
- remaining limitation is QA-method fidelity rather than deployed correctness

## 13. Fixes Applied

- no code fix was needed in this handoff
- staging freshness was resolved by waiting for / verifying the newer Vercel deployment and alias target, not by changing app code

## 14. Remaining Blockers

- no true real-device/touch/browser-devtools session was available here
- final human judgment on contrast, scroll rhythm, and loading feel should still happen on an actual phone

## 15. Production Launch Readiness Impact

- positive
- the previously stale staging alias blocker is resolved
- the v1.1 design adoption is now visibly live on staging
- the core runtime path still works on staging after the design-system reapplication

## 16. Recommended Next Step

`Module 01 Human Real-Phone QA Signoff v0`
