# Two-tier Phase 1 Production Migration + Smoke v0 Review Bundle

Date: 2026-05-26

## 1. Summary

Production Phase 1 schema seams were applied and verified. Production was refreshed to code newer than `fe01379`, and the final production synthetic smoke passed: fresh analyze returned HTTP 200, user context persisted, the shadow paid-result row was created, and result/unlock/LINE route-level checks passed.

## 2. Production Migration Status

- Production branch: Neon `production`.
- Migration applied: `apps/web/drizzle/0005_two_tier_phase_1.sql`.
- Migration type: additive.
- Result: applied successfully.

## 3. Production Deployment Status

- Initial production deployment after migration: `dpl_Dbfqd2pvH3FbjqfAi9NL9a6AK8i7`.
- Final production deployment after runtime retry hotfix: `dpl_66hd3zGQjTLBKB3jZYDGFMZDTkRC`.
- Production alias: `https://anyu.tw`.
- Final deployment status: ready.

## 4. Production Schema Verification

- `analysis_requests.user_context_json`: present.
- `analysis_paid_results`: present.
- Expected indexes: present.
- Expected primary/foreign-key constraints: present.

## 5. Production Analyze Verification

- First post-migration production synthetic analyze returned HTTP 502 with sanitized `output_validation` category.
- A small runtime hotfix was applied to retry output-validation failures once with the same model before failing.
- Final production synthetic analyze returned HTTP 200.
- Final smoke cache status: fresh path, not cache.
- Current ProductResult behavior remains unchanged.
- `free_result` and `paid_result` are both present in the persisted normalized result.

## 6. user_context_json Verification

- Context persisted: yes.
- Persisted allowlisted field count: 4.
- Raw arbitrary context text was not selected or reported.
- Event metadata records only context presence/count, not context values.

## 7. analysis_paid_results Shadow Verification

- Shadow row created: yes.
- Status: completed.
- Linked analysis result: yes.
- Module/theme present: yes.
- Prompt/schema/model metadata present: yes.
- Retention expiry present: yes.
- `paid_result_json` was not selected or reported.

## 8. Result / Unlock / LINE Regression Checks

- Result page: HTTP 200.
- Unlock intent: HTTP 200.
- Unlocked route: HTTP 200.
- LIFF page route: HTTP 200.
- LIFF bind invalid request: rejected with HTTP 400.
- LINE webhook invalid signature: rejected with HTTP 401.
- LINE webhook empty-events verification ping: HTTP 200.
- No real production OA message smoke was run.

## 9. Event / Privacy Verification

- Event metadata key inspection showed only operational keys such as result/request IDs, cache status, retry metadata, timing aggregate, and context field count.
- No raw input, redacted input, provider output, full result JSON, `paid_result_json`, email, LINE user ID, fulfillment code, unlock token, tokenized URL, or secrets were selected into this bundle.

## 10. Retention Implications

`analysis_paid_results` is now live in production as a retained content table. Retention cleanup is not yet wired for this table and should be added before broader traffic, ads, or heavier production use.

## 11. Known Limitations

- One historical failed production smoke row remains with sanitized `output_validation` category and no result, as expected from the first failed attempt.
- Same-model retry improves robustness for occasional invalid structured outputs but does not replace the planned two-tier deferred paid-generation architecture.
- Production retention cleanup for `analysis_paid_results` remains pending.

## 12. Recommended Next Step

Add `analysis_paid_results` to scheduled retention cleanup before Phase 2/deferred paid generation or broader acquisition traffic.
