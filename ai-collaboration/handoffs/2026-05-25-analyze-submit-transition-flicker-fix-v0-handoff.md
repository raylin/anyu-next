# Analyze Submit Transition Flicker Fix v0 Handoff

## Task

Fix the Module 01 analyze submit transition so the landing CTA does not briefly return to the idle state after successful analyze and before result-page navigation.

## Problem

Observed sequence:

- User taps `分析我的曖昧溫度`
- UI enters analyzing state
- Analyze succeeds
- CTA briefly returns to idle `分析我的曖昧溫度`
- App navigates to result page

This flicker can make users think analysis stopped or that they should tap again.

## Goal

Keep the Module 01 landing/input UI in a loading or navigating state until the result page is reached.

## Scope

- Focus only on Module 01 landing/input analyze submit UI state.
- Do not change analyze API behavior.
- Do not change free-only analyze logic.
- Do not change paid generation.
- Do not change LINE fulfillment.
- Do not change prompt/schema/cache/DB.
- Do not change theme assignment/carryover except for respecting current theme during loading/navigating UI.
- Do not deploy production.

## Expected Behavior

1. User taps analyze.
2. UI enters analyzing/loading state.
3. When analyze succeeds, UI enters a transition/navigating state.
4. CTA must not return to idle before navigation.
5. Transition copy may be `正在打開結果⋯`.
6. Analyze failure may return to error/idle with retry affordance.
7. Theme A and Theme B behave consistently.

## Implementation Notes

- Add a distinct navigating/submitted-success state if needed.
- Avoid resetting submitting/analyzing state to false after success before navigation completes.
- If using a `finally` block, reset to idle only on failure/cancel.
- Prevent duplicate submit clicks during navigating state.
- Keep disabled CTA / busy state accessible.

## Validation

- `python3 -m compileall oradar`
- `python3 -m compileall tools/topic-ingestion`
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`
- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm test:e2e:local`

If Playwright is blocked by the known Chromium/MachPort issue, record that honestly.

## Required Artifacts

- `ai-collaboration/handoffs/2026-05-25-analyze-submit-transition-flicker-fix-v0-handoff.md`
- `ai-collaboration/reports/2026-05-25-analyze-submit-transition-flicker-fix-v0-execution-report.md`
- `ai-collaboration/research/2026-05-25-analyze-submit-transition-flicker-fix-v0-review-bundle.md`
- `ai-collaboration/summaries/summary_log.md`

## Commit

`fix: keep analyze loading through navigation`
