# Landing Context Chips + Hero Cleanup v0 Review Bundle

Date: 2026-05-25

## 1. Summary

Module 01 landing was cleaned up to reduce repeated title text, remove the redundant AI-forward hero support line, simplify optional context collection, and clarify reply-tone chip copy.

## 2. User Feedback Addressed

- Reduced repeated `曖昧溫度計` usage in the hero area.
- Removed the hero support sentence that repeated the input card and emphasized AI.
- Removed the visible top-level `情境` chip group because it overlapped with the textarea and `最卡的點`.
- Clarified that reply tone means the user's reply to the other person.
- Replaced `直接但不逼` with `坦白但不施壓`.
- Made optional context chips collapsible by default.

## 3. Hero Cleanup

Hero now uses:

```text
MODULE · 01
曖昧溫度計
他是真的忙，還是其實在冷掉？
```

The previous support line is no longer rendered in the hero:

```text
貼上對話或描述情境，AI 幫你讀出關係溫度，與下一句怎麼回。
```

## 4. Title Repetition Reduction

- Removed the top-left small module label from the landing topbar.
- Changed the eyebrow from `module · 01 · 曖昧溫度計` to `MODULE · 01`.
- Kept the right-side ANYU wordmark intact.
- Kept `曖昧溫度計` as the main H1.

## 5. Context Chip Taxonomy Changes

- Removed the visible `情境 · 可選` chip group from the input card.
- Preserved existing backend/API `situation` behavior by defaulting the hidden situation value to `不確定 / 跳過`.
- Kept optional context fields:
  - `relationshipStage`
  - `userGoal`
  - `primaryPain`
  - `replyTone`
- Kept `最卡的點` as the main blocker-selection surface.

## 6. Reply Tone Copy Changes

- Changed label to `你想回給對方的語氣 · 可選`.
- Replaced `直接但不逼` with `坦白但不施壓`.
- Kept other tone options unchanged.

## 7. Optional Context Collapse

Implemented.

- The section defaults collapsed when no context is selected.
- The header is an accessible button labeled `讓結果更貼近你（選填）`.
- The section expands on click.
- If context is selected, the body remains visible because selected context is present in state.
- Selected chips are still passed through the existing user context payload.

## 8. Tests Updated

- Updated helper tests for `MODULE · 01`.
- Updated context tests for the clarified reply-tone label and new option copy.
- Updated component tests after removing top-level situation chip props from `InputCard`.
- Updated Playwright landing smoke for removed hero support copy, removed `情境` group, collapsible context behavior, and new reply-tone copy.

## 9. Validation Results

- Focused Vitest check passed: `corepack pnpm test -- ai-temperature-ui anyu-mark ai-temperature-result result-cache analyze-route-cache`.
- `python3 -m compileall oradar` passed.
- `python3 -m compileall tools/topic-ingestion` passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed: 25 tests.
- `corepack pnpm lint` passed.
- `corepack pnpm test` passed: 24 files, 105 tests.
- `corepack pnpm build` passed.
- `corepack pnpm test:e2e:local` passed: 9 Playwright tests.

## 10. Staging / Visual Notes

- Staging visual verification pending until after commit/push and deployment refresh.

## 11. Known Limitations

- The hidden/default `situation` field remains for API compatibility and analytics continuity.
- The `description` field remains in module config but is no longer rendered in the landing hero.

## 12. Recommended Next Step

Run full validation, commit, push to `origin/staging`, and verify staging route health after deployment refresh.
