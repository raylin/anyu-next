# Handoff: Unlocked Paid Link Pending State Flicker Fix v0

Date: 2026-05-27

## Problem

During production operator smoke, opening the LINE full-analysis link shows a brief incorrect intermediate state.

Observed sequence:

```text
LINE full-analysis link
→ waiting reminder
→ briefly shows「取得完整連結」
→ then enters polling / 正在整理完整分析
```

This is similar to the previous analyze submit flicker. The unlocked route briefly falls back to a claim/idle CTA state before recognizing that paid result generation is pending.

## Goal

When a user opens an unlocked link from LINE or short-code fulfillment, the page should never briefly show「取得完整連結」if the paid result is already requested, processing, or expected through fulfillment. It should go directly to the paid-result pending polling state, then auto-render completed content when ready.

## Expected Behavior

1. If paid result is completed, unlocked route directly renders paid content.
2. If paid result is processing or requested, unlocked route directly renders「正在整理你的完整分析」polling state.
3. If paid result is missing but the unlock token/intent indicates fulfillment was already claimed from LINE/short-code, treat as pending/requested and show polling/waiting state.
4. Only show「取得完整連結」or claim CTA when the user is truly on a pre-claim/free result surface.
5. Failed/expired states should still show safe failure/expired copy.

## Scope

- Focus on unlocked route state selection and client pending/polling UI.
- Do not change paid generation provider logic.
- Do not change LINE webhook semantics.
- Do not change LIFF bind semantics.
- Do not change prompt/schema/cache/DB unless absolutely necessary.
- Do not change payment/email/ads.
- Do not deploy production unless explicitly approved after staging verification.

## Investigate

- `apps/web/src/app/m/[moduleSlug]/unlock/[unlockToken]/page.tsx`
- `PaidResultPendingPoller`
- paid-result status route
- unlockIntent / paidResult status helpers
- any component that renders「取得完整連結」

## Implementation Guidance

- Add/clarify an explicit route state such as completed, processing, requested, claimed_missing, not_requested, failed, expired.
- For unlock-token route, prefer fulfillment-aware state over generic missing state.
- Avoid rendering claim CTA during hydration if server already knows token/intent is fulfillment-linked.
- If client must hydrate status, initial UI should be pending/waiting, not claim CTA.
- Preserve theme carryover and hide theme switch downstream.

## Tests

- unlocked route with processing paid result renders polling state, not claim CTA.
- unlocked route with fulfillment-linked but missing paid result renders pending state, not claim CTA.
- completed paid result renders paid content.
- failed paid result renders safe failure state.
- pre-claim result page still shows unlock/claim CTA as expected.
- theme carryover remains intact.
- no tokenized URL / unlock token / LINE ID appears in event metadata.

## Validation

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint
cd apps/web && corepack pnpm test
cd apps/web && corepack pnpm build
cd apps/web && corepack pnpm test:e2e:local
```

## Required Artifacts

- `ai-collaboration/handoffs/2026-05-27-unlocked-paid-link-pending-state-flicker-fix-v0-handoff.md`
- `ai-collaboration/research/2026-05-27-unlocked-paid-link-pending-state-flicker-fix-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-27-unlocked-paid-link-pending-state-flicker-fix-v0-execution-report.md`
- `ai-collaboration/summaries/summary_log.md`

## Commit

```bash
git commit -m "fix: show pending state for unlocked paid links"
git push origin HEAD:staging
```
