# NewebPay Runtime Integration Plan v0 Execution Report

## Summary

Created a planning-only NewebPay runtime integration plan.

No app code, DB schema, payment runtime, checkout route, provider integration, queue provider integration, LINE behavior, prompt/schema behavior, or production behavior was changed.

## Files Created

- `ai-collaboration/handoffs/2026-05-27-newebpay-runtime-integration-plan-v0-handoff.md`
- `ai-collaboration/research/2026-05-27-newebpay-runtime-integration-plan-v0.md`
- `ai-collaboration/reports/2026-05-27-newebpay-runtime-integration-plan-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Planning Decisions

- Treat NewebPay `NotifyURL` as primary payment truth after server-side verification.
- Treat `ReturnURL` as UX only unless independently verified.
- Create entitlement only after verified paid notification.
- Create paid analysis generation job only after entitlement is active.
- Keep LINE optional after payment, not required for web access.
- Keep short-code as recovery/fallback, not primary paid access.
- Keep `payment_success_future` trigger source initially to avoid constant/event churn.
- Keep payment runtime disabled until provider approval and staging gates pass.

## Runtime Architecture Recommendation

Future routes:

- `POST /api/modules/[moduleSlug]/payment/checkout`
- `GET|POST /api/payments/newebpay/return`
- `POST /api/payments/newebpay/notify`
- Optional `GET /api/payments/[paymentIntentId]/status`

All routes should be gated by a top-level payment runtime flag and should avoid raw provider payload storage.

## Payment / Entitlement Recommendation

- `payment_intents` remains the order/payment source of truth.
- `entitlements` remains the access source of truth.
- Verified paid notify creates or reuses one `single_paid_analysis` entitlement.
- Raw `pa_` token is returned only to link creation code.
- DB stores only paid access token hash.
- Future `/m/{moduleSlug}/unlock/{token}` should resolve `pa_` entitlement tokens first, then preserve legacy unlock intent token behavior.

## Queue Trigger Recommendation

Use a QStash-like trigger-only queue first.

Recommended queue payload:

```json
{
  "jobType": "paid_analysis"
}
```

The queue wrapper should call the existing processor to claim due `paid_analysis` jobs with `limit = 1`. Avoid job IDs, dedupe keys, entitlement IDs, result IDs, tokens, raw content, and LINE IDs in queue payloads.

If queue publish fails after payment success, keep payment paid, entitlement active, and generation job queued; recover through retry, cron/manual processor, or operator support.

## Validation Results

Passed:

- `python3 -m compileall oradar`
- `python3 -m compileall tools/topic-ingestion`
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`
- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`

Playwright was not required because this task made no app code changes.

## Tech Debt Review

### New Technical Debt Introduced

None. Planning-only task.

### Existing Technical Debt Observed

- Unlocked route currently resolves legacy LINE/short-code fulfillment tokens only; `pa_` entitlement token resolver is still needed before web checkout can land directly on paid access.
- Entitlement uniqueness by `payment_intent_id` is currently a service-level recommendation, not a DB-level unique constraint.
- Production health/build marker parity remains an operational improvement candidate from prior migration gates.
- Local working tree contains substantial unrelated dirty/untracked files, so commit/push should use a clean clone to avoid staging unrelated changes.

### Opportunistic Cleanup Completed

None. The task was constrained to planning and docs.

### Deferred Cleanup Candidates

- Decide whether to add a unique partial index for `entitlements.payment_intent_id`.
- Decide whether to rename `payment_success_future` to `payment_success` in a deliberate constants/test migration.
- Add `pa_` token resolver before implementing provider checkout.

### Recommended Follow-up

Run `Paid Access Token Resolver Plan v0`, then operator-only fake paid success before NewebPay provider runtime.

## Deviations From Handoff

None. No code was implemented.

## Git Commit

Recorded in the final Codex completion summary.

## Staging Push

Recorded in the final Codex completion summary.

## Remaining Uncertainties

- Exact NewebPay sandbox/production payload shape should be confirmed against provider docs after account approval.
- Provider-specific return payload trust level depends on NewebPay’s signed return fields and should be verified before implementation.
- Refund SOP should be finalized before production payment launch.

## Recommended Next Step

Run `Paid Access Token Resolver Plan v0` and then a fake-payment operator-only architecture test. Do not implement NewebPay provider runtime until provider approval and sandbox/test parameters are available.
