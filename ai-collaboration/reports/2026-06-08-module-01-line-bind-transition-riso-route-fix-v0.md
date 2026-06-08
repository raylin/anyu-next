# Module 01 LINE Bind Transition Riso Route Fix v0

## Metadata

- task name: Module 01 LINE Bind Transition Riso Route Fix v0
- date: 2026-06-08
- report path: `ai-collaboration/reports/2026-06-08-module-01-line-bind-transition-riso-route-fix-v0.md`
- commit: pending final commit
- branch / push status: pending
- model / effort: GPT-5 Codex, high effort
- taskStartedAt: 2026-06-08T02:31:33Z
- taskCompletedAt: 2026-06-08T02:33:36Z
- totalWallClockDuration: 2m03s
- humanWaitDuration: 0m
- netCodexWorkDuration: 2m03s

## Context

- why this task exists: Owner review showed the live LINE bind transition/loading/success page on staging still looked generic after prior Riso polish.
- upstream blocker / mainline context: Module 01 is Riso-only at runtime, but the actual route used by LINE transition needed verification before further visual work.
- out-of-scope items: checkout save redesign, production runtime/payment, real Email/LINE, Vercel env, DB mutation, Module 02, CoreShell redesign, LIFF bind logic, Email save logic, payment/access-link behavior, and archived copy replacement.

## Live Route Ownership Finding

- primary checkout-created href:
  - `createLineRecoveryBindHref()` builds `/line/recovery/bind?...` when no LIFF URL is configured.
  - when `NEXT_PUBLIC_LINE_LIFF_URL` points to `https://liff.line.me/<liffId>`, the generated user-facing href is `https://liff.line.me/<liffId>?rlb=...&returnPath=...`.
- relevant app route patterns:
  - `/line/recovery/bind`: direct recovery bind route.
  - `/line/fulfill`: global legacy LIFF entry route.
  - `/m/[moduleSlug]/line/fulfill`: module-scoped legacy LIFF entry route.
- rendering component chain:
  - `/line/recovery/bind` already rendered:
    - `LineRecoveryBindPage`
    - `main.anyu-shell`
    - `ModuleThemeBoundary`
    - `LineRecoveryBindBridge`
  - `/line/fulfill` with recovery state previously rendered:
    - `GlobalLineFulfillPage`
    - `LineRecoveryBindBridge` directly
  - `/m/[moduleSlug]/line/fulfill` with recovery state previously rendered:
    - `ModuleLineFulfillPage`
    - `LineRecoveryBindBridge` directly
- whether v1 edited the correct component:
  - v1 improved `LineRecoveryBindBridge`, but it did not fix every live route that renders the bridge.
  - the likely staging miss was the legacy LIFF recovery entry route rendering the bridge outside `ModuleThemeBoundary`.
- root cause:
  - recovery `liff.state` handling in `/line/fulfill` and `/m/[moduleSlug]/line/fulfill` bypassed the Module 01 Riso shell, leaving the transition page visually outside the intended Riso route context.

## Scope

- what changed: wrapped recovery-state branches of both LIFF fulfillment entry routes in the Module 01 Riso shell.
- what did not change: `LineRecoveryBindBridge` LIFF logic, bind API calls, diagnostics, redirect behavior, Email save, checkout save UI, payment/access-link logic, runtime config, production state, and provider behavior.

## Implementation Summary

- files / areas changed:
  - `apps/web/src/app/line/fulfill/page.tsx`
  - `apps/web/src/app/m/[moduleSlug]/line/fulfill/page.tsx`
  - `apps/web/src/tests/line-recovery-liff-page.test.tsx`
- key design decisions:
  - route fix over broader visual churn.
  - global legacy recovery LIFF route resolves to Module 01 Riso because recovery bind is currently Module 01-only.
  - module-scoped legacy recovery LIFF route uses the route module if available, with Module 01 fallback.
- local / opportunistic cleanup decisions:
  - removed directly related generic route residue by ensuring the actual recovery transition route path uses `ModuleThemeBoundary`.

## Surfaces Changed

- `/line/fulfill` recovery state:
  - now renders `main.anyu-shell` + `ModuleThemeBoundary` + `LineRecoveryBindBridge`.
- `/m/[moduleSlug]/line/fulfill` recovery state:
  - now renders `main.anyu-shell` + `ModuleThemeBoundary` + `LineRecoveryBindBridge`.
- `/line/recovery/bind`:
  - unchanged because it already used the Riso shell.

## Old Theme / Generic Residue Removed

- Removed the direct unwrapped `LineRecoveryBindBridge` rendering path for recovery state in both legacy fulfillment routes when Module 01 config is available.
- No broad CSS cleanup was performed.
- Non-recovery `LineFulfillBridge` legacy fulfillment path was not changed because it is outside this access-link recovery transition scope.

## Regression Coverage

- updated `line-recovery-liff-page.test.tsx` to assert that recovery `liff.state` through:
  - global `/line/fulfill`
  - module `/m/[moduleSlug]/line/fulfill`
  renders:
  - `data-shell="module"`
  - `data-theme="ai-temperature-riso"`
  - `data-module-theme="riso"`
  - `data-riso-flow="line-bind"`
  - `anyu-riso-reference-panel`
- existing tests continue to assert:
  - copy semantics remain unchanged.
  - token-like legacy fulfillment state is rejected.
  - private LINE/idToken/unlock token values are not rendered.

## Visual Result Summary

- The actual LIFF recovery entry routes now place the LINE bind transition/loading/success/fallback bridge inside the Module 01 Riso shell.
- The page should no longer lose the Riso shell/theme markers when entered through legacy LIFF fulfillment routes.
- This task intentionally did not further revise checkout save UI or unrelated Module 01 surfaces.

## Validation

- commands run:
  - `cd apps/web && corepack pnpm lint`: pass.
  - `cd apps/web && corepack pnpm test src/tests/line-recovery-liff-page.test.tsx`: pass, 1 file / 9 tests.
  - `cd apps/web && corepack pnpm test`: pass, 104 files / 713 tests.
  - `cd apps/web && corepack pnpm build`: pass.
  - `cd apps/web && corepack pnpm run qa:module01:ui`: pass, 5 Playwright tests.
  - `cd apps/web && corepack pnpm run qa:module01:local`: pass, `gateStatus=pass`.
  - `cd apps/web && corepack pnpm run qa:module01:mock-flow`: pass.
- gateStatus: pass
- commandExitCode: 0 for final validation commands
- requiredChecksStatus: pass
- optionalChecksStatus: not_applicable
- targetDeployCommit: not_applicable
- deployedCommitAtGateStart: not_applicable
- deployedCommitAtGateEnd: not_applicable
- freshnessStatus: not_applicable
- gates skipped and why:
  - `qa:result-checkout:no-card`: skipped because checkout/access-link behavior code was not touched.
  - production runtime/payment/preflight: skipped because not allowed and not needed.
  - real Email/LINE: skipped because not allowed.
  - staging channel sends: skipped because not allowed.

## Safety

- production runtime enabled: no
- payment run: no
- Email sent: no
- LINE sent: no
- Vercel env changed: no
- DB mutated: no
- secrets/private data exposed: no

## Result

- result: pass
- first failure category: not_applicable
- blocker status: not_applicable

## Remaining Visual Gaps

- Owner staging visual review is still required to confirm the live LINE transition now matches the Riso route context.
- Broader reference-aligned fixes for checkout save, ReturnURL, paid result, `/r`, expired, invalid, and pending states remain separate work.

## Tech Debt / Cleanup Notes

- new technical debt introduced: none.
- existing technical debt observed:
  - legacy non-recovery `LineFulfillBridge` remains generic and may need a separate lifecycle/relevance decision later.
- opportunistic cleanup completed:
  - directly related recovery route shell bypass removed.
- deferred cleanup candidates:
  - owner screenshot-driven follow-up for any remaining LINE transition visual differences.

## Decisions Made

- Fix route ownership before additional visual styling.
- Keep scope to recovery-state LIFF entry routes only.
- Do not change checkout save UI in this task.

## Uncertainties / Blockers

- No functional blockers.
- If owner still sees generic UI after deployment, next step is to inspect the exact URL/path from the screenshot without exposing tokens.

## Recommended Next Step

Owner visual review of LINE bind transition page on staging, then continue reference-aligned fixes using owner comparison screenshots.

## Paste-Back Context

Module 01 LINE Bind Transition Riso Route Fix v0 identified the likely staging miss: recovery `liff.state` through `/line/fulfill` and `/m/[moduleSlug]/line/fulfill` rendered `LineRecoveryBindBridge` directly, bypassing `ModuleThemeBoundary`. Both recovery branches now wrap the bridge in the Module 01 Riso shell. Route-level tests assert Module/Riso markers and the Riso line-bind panel on those live routes. Validation passed; production was untouched.
