# Two-tier Phase 1 Migration Live Verification v0 Review Bundle

Date: 2026-05-25

## 1. Summary

Staging `0005_two_tier_phase_1.sql` was applied to the Neon `preview` branch and schema verification passed. Route-level result, unlock, LIFF, and webhook regression checks passed on staging.

The full staging gate did not pass because two fresh synthetic analyze attempts returned `provider_error` before result persistence. Because no fresh result was created, the `analysis_paid_results` shadow-write path could not be verified. Production migration was not applied.

## 2. Migration Status

Staging:

- Branch: Neon `preview`
- Migration: `0005_two_tier_phase_1.sql`
- Status: applied
- Additive safety: confirmed

Production:

- Branch: Neon `production`
- Migration: not applied
- Reason: staging fresh-analyze/shadow-write gate did not pass

## 3. Staging Schema Verification

Verified on staging:

- `analysis_paid_results` table exists.
- `analysis_requests.user_context_json` exists.
- `analysis_paid_results` indexes exist:
  - primary key
  - result lookup
  - unlock intent lookup
  - status lookup
  - module/theme/status/retention lookup

No private rows or result JSON were dumped.

## 4. Staging Analyze Verification

Fresh analyze attempts:

- Attempt 1: HTTP 502 `provider_error`, about 66s, no result ID.
- Attempt 2: HTTP 502 `provider_error`, about 67s, no result ID.

Cached analyze check:

- HTTP 200
- Existing result returned
- Cache hit: yes
- Result ID present: yes

Interpretation:

- The migration itself did not block request creation or context persistence.
- Fresh provider generation failed before result/shadow persistence, so the shadow paid-result seam remains unverified in live staging.

## 5. user_context_json Verification

Verified from failed fresh analyze request records:

- `user_context_json` persisted: yes
- Field count: 4
- Result attached: no, because provider generation failed

No context values were included in this bundle.

## 6. analysis_paid_results Shadow Verification

Shadow write status:

- Shadow row created: no
- Reason: fresh analyze did not create an `analysis_results` row due to provider failure before persistence.
- Recent completed shadow rows: 0

This remains the main blocker before production migration.

## 7. Result / Unlock / LINE Regression Checks

Using an existing cached staging result:

- Result page: HTTP 200
- Unlock intent route: HTTP 200
- Fulfillment code present: yes
- Unlock token present: yes
- Unlocked route: HTTP 200
- LIFF fulfill page route: HTTP 200
- LIFF bind with invalid ID token: HTTP 401
- LINE webhook with invalid signature: HTTP 401

No fulfillment code, unlock token, tokenized URL, LINE ID, or private message content was recorded.

## 8. Production Migration / Smoke Status

Production migration was skipped.

Production schema remains unchanged:

- `analysis_paid_results`: absent
- `analysis_requests.user_context_json`: absent

Production app deployment should not move to commit `c3cdf9a` or later until production `0005` is applied, because that runtime writes the new column/table on fresh analyze.

## 9. Event / Privacy Verification

Reviewed recent staging event metadata keys only.

No forbidden metadata keys were observed for:

- raw input
- redacted input
- context values
- full result JSON
- paid result JSON
- provider raw output
- email
- LINE user ID
- fulfillment code
- unlock token
- tokenized URL
- secret names with values

Observed metadata keys were limited to safe IDs, status, cache flags, timing, model names, privacy flags, and context counts.

## 10. Retention Implications

`analysis_paid_results` is a new retained content table.

Retention cleanup is not wired yet. Before broader traffic, ads, or deferred paid generation, scheduled cleanup should delete/expire:

- `analysis_paid_results.paid_result_json`
- `analysis_paid_results` rows past `retention_expires_at`

## 11. Known Limitations

- Fresh staging analyze currently fails with provider errors, blocking live shadow-write verification.
- Cache-hit shadow backfill remains deferred.
- Production `0005` remains pending.
- No real LINE OA smoke was run; this migration did not require it.

## 12. Recommended Next Step

Diagnose staging fresh analyze provider failures before applying production `0005`.

Recommended next handoff:

```text
Staging Analyze Provider Error Follow-up v0
```

After fresh analyze succeeds, rerun migration verification to confirm `analysis_paid_results` shadow rows are created, then apply production `0005`.
