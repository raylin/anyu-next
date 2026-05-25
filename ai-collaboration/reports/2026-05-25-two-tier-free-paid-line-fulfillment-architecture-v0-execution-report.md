# Two-tier Free/Paid Result + LINE Fulfillment Architecture v0 Execution Report

## Summary

Created a docs-only architecture plan for moving Module 01 from synchronous free+paid generation to a two-tier architecture where free result generation happens first and paid result generation is deferred until unlock, LINE bind, or payment success.

No app code, prompt/schema code, DB schema, LINE code, env, production behavior, payment integration, or provider calls were changed.

## Files Created

- `ai-collaboration/handoffs/2026-05-25-two-tier-free-paid-line-fulfillment-architecture-v0-handoff.md`
- `ai-collaboration/research/2026-05-25-two-tier-free-paid-line-fulfillment-architecture-v0.md`
- `ai-collaboration/reports/2026-05-25-two-tier-free-paid-line-fulfillment-architecture-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Architecture Decisions

- Recommended two-tier generation:
  - Tier 1: generate free result only on initial analyze.
  - Tier 2: generate paid result only after unlock / LINE bind / payment success.
- Recommended beta trigger: LINE bind / short-code match.
- Recommended paid-era trigger: payment success.
- Recommended first LINE friend free unlock: one complete analysis per verified LINE user.
- Recommended avoiding a full account system in early phases.
- Recommended treating LINE as owned-channel acquisition and retention infrastructure, not only delivery.

## Recommended Flow

```text
user submits input + optional context
→ generate free result quickly
→ show free result and paid teaser
→ user enters LINE/unlock/payment funnel
→ create/update unlock intent
→ generate paid result if needed
→ deliver unlocked link through web and/or LINE
```

## Data / Cache Implications

Future schema planning should separate free and paid result state. Two options were documented:

- Nullable paid-result fields on `analysis_results`.
- Separate `analysis_paid_results` table.

Cache recommendation:

- Free-result cache should not require paid result existence.
- Paid-result cache should be independent and keyed by result/input/context/prompt/schema/model dimensions.
- Paid generation should likely reuse the free result summary plus normalized input/context for coherence.

## LINE / Fulfillment Implications

LINE should support:

- Mobile LIFF bind for in-app/LINE-friendly flow.
- Desktop QR/add URL plus short-code flow.
- Pending state when paid generation starts after LINE bind.
- Delivery retry if LINE send fails.
- First LINE friend free unlock eligibility.

## Paywall Implications

Future payment should insert after the free result and before paid generation:

```text
free result → checkout → payment success → paid generation → web/LINE delivery
```

Payment provider was intentionally not selected. Future evaluation candidates documented:

- NewebPay
- ECPay
- LINE Pay

## Cost / Latency Assessment

Current model:

```text
100 free analyses → 100 free+paid generations
```

Two-tier beta model:

```text
100 free analyses → 100 free generations + paid generations only for LINE/unlock users
```

Two-tier paid model:

```text
100 free analyses → 100 free generations + paid generations only after successful payment
```

Expected benefits:

- Lower first-result latency.
- Lower provider cost.
- Lower browser timeout risk.
- Ability to make paid result richer again because it no longer blocks all free users.

## Validation Results

- `python3 -m compileall oradar`: passed.
- `python3 -m compileall tools/topic-ingestion`: passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`: passed, 25 tests.
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed, 24 files / 111 tests.
- `cd apps/web && corepack pnpm build`: passed.

## Known Technical Debt

- Analyze remains synchronous today and can still approach timeout ceilings.
- Current result shape couples free and paid result generation.
- Current fulfillment assumes paid content exists before LINE delivery.
- Future payment failure/retry behavior is not yet designed in implementation detail.

## Tech Debt Review

### New Technical Debt Introduced

None. This was documentation-only.

### Existing Technical Debt Observed

- Free and paid generation are coupled in current architecture.
- Paid-result validation failures can block free-result delivery in the current synchronous path.
- LINE fulfillment and unlock intent logic will need clearer pending/processing/ready states before two-tier implementation.

### Opportunistic Cleanup Completed

None. No code cleanup was performed because the task was architecture-only.

### Deferred Cleanup Candidates

- Split free and paid result schemas/prompts only after architecture approval.
- Add explicit paid-generation state fields or table.
- Add sanitized paid-generation error categories.
- Add pending-state UX for delayed paid result delivery.

### Recommended Follow-up

Create `Two-tier Free Analyze + Deferred Paid Generation v0` implementation plan before any migration or code changes.

## Deviations From Handoff

None.

## Git Commit

Recorded in final Codex completion summary.

## Staging Push

Recorded in final Codex completion summary.

## Remaining Uncertainties

- First-free unlock scope: once per LINE user globally or once per module.
- Paid generation trigger in beta: immediately after LINE bind or after a second explicit claim action.
- Data model: nullable paid fields vs separate paid-results table.
- Acceptable wait time after LINE bind or payment success.

## Recommended Next Step

Run a schema-aware implementation planning task for Phase 1 and get approval before any DB migration or code changes.
