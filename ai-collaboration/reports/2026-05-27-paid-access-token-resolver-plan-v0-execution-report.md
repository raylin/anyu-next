# Paid Access Token Resolver Plan v0 Execution Report

## Summary

Created a planning-only `pa_` paid access token resolver plan.

No app code, DB schema, migration, payment runtime, checkout route, NewebPay endpoint, LINE behavior, prompt/result behavior, legal copy, feature flag, or production behavior was changed.

## Files Created

- `ai-collaboration/handoffs/2026-05-27-paid-access-token-resolver-plan-v0-handoff.md`
- `ai-collaboration/research/2026-05-27-paid-access-token-resolver-plan-v0.md`
- `ai-collaboration/reports/2026-05-27-paid-access-token-resolver-plan-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Planning Decisions

- `pa_` token should remain opaque random, not signed or derived.
- `pa_` token is a private bearer access proof for an entitlement.
- Token hash should remain stored on `entitlements.paid_access_token_hash`.
- Raw token should be returned only to link creation/redirect code and never stored/logged.
- Future unlock route should resolve `pa_` entitlement token first, then preserve legacy unlock-intent token behavior.
- Resolver should return a normalized access object rather than raw entitlement/payment/job rows.
- Minimal resolver should be implemented before NewebPay checkout/provider runtime.

## Resolver Architecture Recommendation

Recommended route:

```text
/m/{moduleSlug}/unlock/{token}
```

Resolver priority:

1. `pa_` token shape → entitlement resolver.
2. Otherwise → existing legacy unlock-intent resolver.

Resolver states:

- `completed`
- `pending`
- `processing`
- `failed`
- `expired`
- `revoked`
- `refunded`
- `invalid`

## Security / Privacy Recommendation

- Treat `pa_` URLs as private bearer links.
- Keep tokens hash-at-rest.
- Do not log raw token, token hash, full URL, provider payload, raw input, paid result JSON, LINE IDs, or secrets.
- Add unlock/status lookup rate limiting before payment launch.
- Use constant public error copy for invalid token misses.

## DB / Migration Recommendation

Existing token hash uniqueness is sufficient and already enforced through the partial unique index.

Before payment runtime launch, add a separate migration/decision for:

```text
unique entitlements.payment_intent_id where payment_intent_id is not null
```

Do not add a unique index on `analysis_result_id` yet; duplicate purchase policy should remain service/support-level until product rules are clearer.

## Integration Recommendation

Future NewebPay notify should call a payment access service that:

- marks payment paid idempotently,
- creates/reuses entitlement,
- issues or reuses/rotates a `pa_` token,
- creates/reuses `paid_analysis` generation job,
- triggers queue using a trigger-only payload,
- returns safe access route information.

Queue payload should stay trigger-only:

```json
{
  "jobType": "paid_analysis"
}
```

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

- `pa_` entitlement token resolver is still missing.
- `entitlements.payment_intent_id` uniqueness is currently service-level only.
- Unlock/status lookup rate limiting for bearer paid access should be planned before payment launch.
- Local working tree contains substantial unrelated dirty/untracked files, so final commit should use a clean clone.

### Opportunistic Cleanup Completed

None. This task intentionally avoided code/schema changes.

### Deferred Cleanup Candidates

- Add DB-level partial unique index for `entitlements.payment_intent_id`.
- Add paid access lookup rate limiting.
- Add operator-only fake paid success path after resolver implementation.

### Recommended Follow-up

Run `Paid Access Token Resolver Implementation v0`, then `Operator-only Fake Paid Success v0`.

## Deviations From Handoff

None.

## Git Commit

Recorded in the final Codex completion summary.

## Staging Push

Recorded in the final Codex completion summary.

## Remaining Uncertainties

- Exact NewebPay payload/hash fields remain pending provider approval.
- Refund/re-delivery SOP remains pending before production payment launch.
- Whether missing generation-job recovery should be read-only v0 or route-side idempotent recovery should be decided during implementation.

## Recommended Next Step

Implement the minimal `pa_` resolver before NewebPay checkout creation, then add operator-only fake paid success for staging QA.
