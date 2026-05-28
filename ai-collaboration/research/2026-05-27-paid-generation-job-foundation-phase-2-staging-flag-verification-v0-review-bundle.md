# Paid Generation Job Foundation Phase 2 Staging Flag Verification v0 Review Bundle

Date: 2026-05-27

## 1. Summary

Staging verification passed for Phase 2 paid generation job mirroring.

Flag-off behavior remained unchanged and wrote no `generation_jobs` rows. After enabling `ENABLE_PAID_GENERATION_JOBS=true` for Vercel Preview/Staging only and redeploying staging, a synthetic paid-generation flow completed successfully, created one `paid_analysis` job, mirrored lifecycle to `completed`, and kept delivery truth in `analysis_paid_results`.

No production migration, production flag, or production deployment was touched.

## 2. Staging Freshness

- Staging URL: `https://staging.anyu.tw`
- Health route: passed
- Environment: Preview
- Branch: `staging`
- Commit served: `21c1907f61f6`
- Fresh flag-on preview deployment: `dpl_8xAhjimEkoXLGdT8wafA8V34DxUN`
- Alias: `staging.anyu.tw` points to the fresh preview deployment

## 3. Flag-off Verification

Initial `generation_jobs` count: `0`.

Flag-off route/API smoke:

- Landing/result route path: passed through fresh result route check
- Fresh synthetic analyze: HTTP `200`
- Result route: HTTP `200`
- Unlock intent: HTTP `200`
- Paid generation request: HTTP `200`, external status `completed`
- Paid status route: HTTP `200`, external status `completed`
- Unlocked route: HTTP `200`
- LIFF bridge: HTTP `200`
- Invalid LIFF bind: HTTP `401`
- Invalid LINE webhook signature: HTTP `401`
- Empty-events webhook verification: HTTP `200`

Final flag-off `generation_jobs` count: `0`.

## 4. Flag-on Verification

Enabled `ENABLE_PAID_GENERATION_JOBS=true` for Vercel Preview/Staging branch `staging` only.

Flag-on route/API smoke:

- Fresh synthetic analyze: HTTP `200`
- Result route: HTTP `200`
- Unlock intent: HTTP `200`
- Paid generation request: HTTP `200`, external status `completed`
- Repeat paid generation request: HTTP `200`, external status `completed`, reused existing paid result
- Paid status route: HTTP `200`, external status `completed`
- Unlocked route: HTTP `200`

Final `generation_jobs` count: `1`.

## 5. Job Lifecycle Verification

Safe lifecycle fields for the synthetic flag-on job:

- Job type: `paid_analysis`
- Trigger source: `web_unlock`
- Status: `completed`
- Attempt count: `1`
- Output ref type: `analysis_paid_result`
- Output ref present: yes
- Source: `provider`
- Error category present: no
- Lock present after completion: no

Duplicate/reuse check:

- Repeating the paid generation request did not create another job.
- Total `generation_jobs` count remained `1`.

Delivery truth:

- Matching completed `analysis_paid_results` rows: `1`

## 6. Status Route Verification

Live completed-path mapping passed:

- Completed paid result exists → status route returned external `completed`.
- Response did not expose job ID, dedupe key, attempt count, lock fields, internal status, or internal error details.

Queued/retry/failed-final mapping remains covered by unit tests from the Phase 2 implementation.

## 7. LINE / LIFF / Short-code Regression

Route-level regressions passed:

- LIFF bridge safe fallback/debug route: HTTP `200`
- Invalid LIFF bind rejects: HTTP `401`
- Invalid LINE webhook signature rejects: HTTP `401`
- Empty-events webhook verification returns HTTP `200`

No real LINE client, real short-code, or production OA smoke was run.

## 8. Privacy / Data Safety

Reports record only route statuses, safe counts, external statuses, job type, lifecycle status, trigger source, source category, and boolean output/error/lock presence.

Not recorded:

- raw input
- redacted input text
- paid result JSON
- provider output
- tokens
- tokenized URLs
- LINE IDs
- ID tokens
- short codes
- secrets
- dedupe keys
- job IDs

## 9. Issues Found

No P0/P1/P2 issues found.

Notes:

- One first flag-off smoke attempt used an outdated unlock-intent payload shape and returned expected validation errors. It was corrected and rerun successfully. This was an operator test issue, not an application regression.

## 10. Production Readiness Recommendation

Do not enable production flag yet.

Production remains gated on:

- explicit approval to apply `0006_generation_jobs.sql` to production
- production migration verification
- separate production flag/deployment decision

## 11. Recommended Next Step

Proceed to `Paid Generation Job Foundation Phase 2 Production Migration Gate v0` if the owner wants the production schema ready, or `Phase 3 Processor / Cron Plan v0` if the next priority is turning the mirror into an asynchronous processing foundation.
