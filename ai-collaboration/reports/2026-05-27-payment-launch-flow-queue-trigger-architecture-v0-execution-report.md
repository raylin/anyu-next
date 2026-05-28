# Payment Launch Flow + Queue Trigger Architecture v0 Execution Report

## Summary

Created a planning architecture for post-payment durable paid-result generation. The plan connects future NewebPay payment success, payment intent/order state, entitlement, `generation_jobs`, queue trigger, web polling, optional LINE delivery, and short-code recovery. No app code, DB schema, payment behavior, LINE behavior, prompt/schema/cache behavior, production behavior, or external queue integration was changed.

## Files Created

- `ai-collaboration/handoffs/2026-05-27-payment-launch-flow-queue-trigger-architecture-v0-handoff.md`
- `ai-collaboration/research/2026-05-27-payment-launch-flow-queue-trigger-architecture-v0.md`
- `ai-collaboration/reports/2026-05-27-payment-launch-flow-queue-trigger-architecture-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Architecture Recommendation

Use web payment as the primary paid-access path and keep LINE as optional delivery/retention. Payment success should create entitlement and trigger paid generation independently of LINE. Keep the current unlocked route/polling surface for v0, but make payment/entitlement the future authorization truth instead of LINE binding.

## Payment / Entitlement Recommendation

Add future `payment_intents` for provider/order lifecycle and future `entitlements` for product access. Keep them separate from `unlock_intents`. `unlock_intents` should remain fulfillment/link/session infrastructure for LINE/LIFF and short-code flows.

## Queue Trigger Recommendation

Prefer a QStash-like signed webhook queue for payment launch after a staging POC. The queue should publish only a reference-only trigger and call a dedicated authenticated callback wrapper that invokes the existing paid-generation processor. Keep Vercel Hobby daily cron as recovery/readiness only.

## UX Recommendation

Payment success should send the user to `/m/{moduleSlug}/unlock/{token}`. The page should poll through queued/processing/retry states and render completed paid content when `analysis_paid_results` is ready. LINE delivery should become a secondary "save/send to LINE" option after payment; short-code should be fallback/recovery.

## Validation Results

- `python3 -m compileall oradar`: passed.
- `python3 -m compileall tools/topic-ingestion`: passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`: passed, 25 tests.
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed, 39 files / 261 tests.
- `cd apps/web && corepack pnpm build`: passed.
- Playwright was not run; this was a docs/planning-only task with no code or UI changes.

## Tech Debt Review

### New Technical Debt Introduced

None; this was docs/research only.

### Existing Technical Debt Observed

- Current paid request route still depends on `unlockIntentId`, which is fulfillment-shaped rather than payment-shaped.
- Vercel Hobby daily cron remains too low-frequency for post-payment user-perceived latency.
- Payment/order and entitlement models do not exist yet.
- Queue provider auth/publisher/callback adapter does not exist yet.

### Opportunistic Cleanup Completed

None; no code changes were made.

### Deferred Cleanup Candidates

- Extract a neutral paid-access token model instead of overloading LINE-specific `unlock_intents`.
- Add a queue callback wrapper rather than exposing queue traffic directly to the internal processor endpoint.
- Consolidate payment launch metrics into the existing safe metrics/reporting path once event names are approved.

### Recommended Follow-up

Run a `Payment/Entitlement Schema Plan v0` before any DB migration, or a staging-only QStash proof if payment approval makes the trigger path urgent.

## Deviations From Handoff

None.

## Git Commit

Pending until final commit step.

## Staging Push

Pending until final push step.

## Remaining Uncertainties

- NewebPay approval timing.
- Whether owner prefers a new queue vendor or Vercel Pro Cron.
- Whether v0 should reuse `unlock_intents.fulfillmentToken` or introduce a neutral paid-access token model.
- Final refund/re-delivery policy wording remains a separate legal/ops decision.

## Recommended Next Step

Do not implement payment or queue integration yet. First approve the payment/entitlement data model, then run a staging-only QStash proof with reference-only payloads.
