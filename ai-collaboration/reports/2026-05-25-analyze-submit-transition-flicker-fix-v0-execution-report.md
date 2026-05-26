# Analyze Submit Transition Flicker Fix v0 Execution Report

## Summary

Fixed the Module 01 analyze submit flicker by keeping the landing/input UI in an explicit navigating state after successful analyze and before result-page navigation completes.

## Completed Work

- Saved the task handoff in `ai-collaboration/handoffs/`.
- Replaced the single landing submit boolean with explicit submit phases: `idle`, `analyzing`, and `navigating`.
- Kept the CTA disabled/loading during the post-success navigation transition.
- Added `正在打開結果⋯` transition copy for the success-to-result handoff.
- Preserved failure behavior so failed, timed-out, or expired requests return to idle with safe retry/error affordance.
- Added a regression test for the guarded success/navigating state.

## Root Cause

`AiTemperatureLanding` called `router.push(...)` after successful analyze, then the outer `finally` block reset submit state to idle before the route transition visibly completed. This created the observed sequence:

`分析按鈕 → 分析中 → 分析按鈕 → 結果頁`

## State Transition Fix

The success path now sets `submitPhase` to `navigating` before `router.push(...)` and marks the outer cleanup as not eligible to reset to idle. Only failure, timeout, invalid response, expired recovery, or canceled paths reset to `idle`.

## Theme A / B Behavior

Theme A and Theme B share the same landing submit flow and loading UI. No theme assignment, theme carryover, or theme styling logic was changed.

## Tests Added

- Added a source-level regression test in `apps/web/src/tests/ai-temperature-ui.test.ts` covering:
  - explicit submit phases
  - successful analyze entering `navigating`
  - guarded idle reset
  - navigating CTA copy
  - removal of unconditional `setIsSubmitting(false)` cleanup

## Validation Results

- `cd apps/web && corepack pnpm test -- ai-temperature-ui`: passed, 28 files and 168 tests.
- `python3 -m compileall oradar`: passed.
- `python3 -m compileall tools/topic-ingestion`: passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`: passed, 25 tests.
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed, 28 files and 168 tests.
- `cd apps/web && corepack pnpm build`: passed.
- `cd apps/web && corepack pnpm test:e2e:local`: blocked by local Chromium launch failure before assertions. The e2e build/start step ran, then Chromium failed with `MachPortRendezvousServer ... Permission denied (1100)`, matching the known local Playwright/MachPort environment issue.

## Architecture Decisions

- Used a local component-level state machine instead of adding a broader async navigation framework.
- Kept backend/API contracts unchanged.
- Kept failure recovery behavior explicit and retryable.

## Blockers

- None at implementation time.

## Uncertainties

- Local Playwright may remain blocked by the known Chromium/MachPort permission issue.
- Staging visual QA is still recommended because the bug is timing/transition-sensitive.

## Tech Debt Review

### New Technical Debt Introduced

- None.

### Existing Technical Debt Observed

- The web test environment is Node-only, so true DOM-level interaction testing is not available in Vitest.

### Opportunistic Cleanup Completed

- Replaced ambiguous boolean submit state with named phases in the touched component.

### Deferred Cleanup Candidates

- Add jsdom or component-level browser tests for client interaction regressions if the project decides to support component rendering tests.

### Recommended Follow-up

- Run staging manual QA in both themes and confirm the CTA sequence remains loading/navigating until the result page appears.

## Git Commit

- Pending.

## Staging Push

- Pending.
