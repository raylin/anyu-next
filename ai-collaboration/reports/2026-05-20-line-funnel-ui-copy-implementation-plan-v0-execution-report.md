# LINE Funnel UI Copy + Implementation Plan v0 Execution Report

## Summary

Translated the approved LINE funnel strategy into concrete Module 01 UI copy, CTA hierarchy, config needs, event requirements, and staged implementation milestones for a future LINE-first contact funnel.

## Files Created

- `ai-collaboration/handoffs/2026-05-20-line-funnel-ui-copy-implementation-plan-v0-handoff.md`
- `ai-collaboration/research/2026-05-20-line-funnel-ui-copy-implementation-plan-v0.md`
- `ai-collaboration/reports/2026-05-20-line-funnel-ui-copy-implementation-plan-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Strategy Translation

- moved the strategy from abstract LINE-first direction into exact product-surface recommendations
- defined how the current generic contact capture should evolve into a primary LINE CTA with secondary Email fallback
- clarified that v0 still uses manual or semi-manual fulfillment rather than automation

## UI Copy Decisions

- primary panel title: `加入 LINE，領取完整分析`
- primary CTA: `加入 LINE 領取完整分析`
- secondary CTA: `改用 Email 接收`
- retained internal-test note: `目前內測中，這次不會真的收費。`

## Event / Metrics Decisions

- recommended adding or mapping `line_add_clicked` and `email_fallback_opened`
- preserved privacy rule that LINE ID and Email must not be stored in events
- recommended safe metadata only: module, result, unlock, method, source

## Implementation Milestones

- Milestone A: LINE-first Contact UI v0
- Milestone B: LINE OA Setup v0
- Milestone C: Fulfillment Code v0
- Milestone D: Automation Later

## Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

## Known Technical Debt

- The current app still uses a generic combined contact form, so the intended LINE-first hierarchy is not yet expressed in the product.

## Tech Debt Review

### New Technical Debt Introduced

- None.

### Existing Technical Debt Observed

- The current fake-door surface and contact form still blend LINE and Email into one generic capture state, which weakens the intended Taiwan-first LINE strategy.

### Opportunistic Cleanup Completed

- None. This pass stayed documentation-only and did not change product behavior.

### Deferred Cleanup Candidates

- A future implementation pass should align paid-preview, contact-panel, and event-taxonomy details to the LINE-first hierarchy documented here.

### Recommended Follow-up

- Implement the scoped contact-surface changes after the LINE OA add-friend URL and preferred mobile-open behavior are confirmed.

## Deviations From Handoff

- None.

## Git Commit

- Pending at report-write time; final commit hash is reported in the final Codex Completion Summary.

## Staging Push

- Pending at report-write time; final staging push status is reported in the final Codex Completion Summary.

## Remaining Uncertainties

- Final `NEXT_PUBLIC_LINE_ADD_URL` value is still unknown.
- Mobile same-tab versus new-tab behavior for the LINE CTA should be validated with a real device before implementation.

## Recommended Next Step

- `LINE Funnel Contact UI Implementation v0`
