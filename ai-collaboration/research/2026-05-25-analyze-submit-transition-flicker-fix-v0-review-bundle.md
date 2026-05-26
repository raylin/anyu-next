# Analyze Submit Transition Flicker Fix v0 Review Bundle

## 1. Summary

Fixed the Module 01 analyze submit transition so a successful analyze no longer returns the CTA to the idle `分析我的曖昧溫度` state before result navigation. The landing component now distinguishes `idle`, `analyzing`, and `navigating` phases.

## 2. Root Cause

`AiTemperatureLanding` used one `isSubmitting` boolean and reset it in the outer `finally` block. On successful analyze, `router.push(...)` was called, but the `finally` block still ran immediately after and set the state back to idle while route navigation was still pending.

## 3. Fix

- Replaced the single submit boolean with explicit submit phases.
- Set phase to `analyzing` on submit.
- Set phase to `navigating` before successful result navigation.
- Reset to `idle` only for failure, timeout, invalid response, or expired recovery paths.
- Added transition CTA/status copy: `正在打開結果⋯`.

## 4. Behavior

- Success path: button remains disabled/loading and shows navigating copy until navigation.
- Processing path: polling completion also enters navigating state before `router.push(...)`.
- Failure path: returns to idle with safe retry/error copy.
- Duplicate submit clicks remain blocked during analyzing and navigating.

## 5. Theme A / Theme B

Both themes use the same Module 01 landing component and `InputCard`, so the transition behavior is shared. No theme assignment, theme carryover, or theme styling logic was changed.

## 6. Tests Added

- Added a source-level regression test confirming the explicit `navigating` phase, success-path `router.push(...)` transition, guarded idle reset, and navigating CTA copy.

## 7. Product / Backend Safety

- No analyze API behavior changed.
- No free-only analyze logic changed.
- No paid generation changed.
- No LINE fulfillment changed.
- No prompt/schema/cache/DB changes.
- No production deployment performed.

## 8. Known Limitations

- The repo’s Vitest config uses a Node test environment, so this pass uses source-level regression coverage instead of a browser-rendered component test.
- Local Playwright may still be blocked by the known Chromium/MachPort environment issue.

## 9. Recommended Next Step

Run a staging UI smoke for both Theme A and Theme B and confirm the sequence is `分析按鈕 → 分析中 → 正在打開結果⋯ → 結果頁`.
