# Module 01 Staging Remote QA Report

## 1. Summary

Staging remote QA passed after one small runtime fix and one staging DB bootstrap step.

What was verified successfully:

- authenticated staging access through Vercel CLI
- `staging.anyu.tw` alias mapped to the current `staging` deployment
- staging analyze flow succeeded with synthetic input
- runtime result page loaded from the staging DB
- unlock intent and contact submissions persisted
- event ingestion persisted
- staging DB privacy checks passed
- demo route still worked

What required intervention:

- the staging Preview DB branch had no runtime tables
- the analyze runtime tried to read prompt/schema files from the repo root, which does not exist in the Vercel `apps/web` deployment root

## 2. Staging URL

- staging URL tested: `https://staging.anyu.tw`
- active deployment after fix: `https://anyu-next-d4j7hqfdl-studioanyu-1488s-projects.vercel.app`
- staging branch commit deployed: `d0fe5ad`

## 3. Staging Access Status

- direct unauthenticated `curl` to `https://staging.anyu.tw` returned `401` because Vercel protection remains enabled
- authenticated access succeeded through `vercel curl`
- `vercel inspect staging.anyu.tw` confirmed the alias points to the current `git-staging` preview deployment

## 4. Staging Environment Check

Confirmed by `vercel env ls preview`:

- `DATABASE_URL` present
- `ANTHROPIC_API_KEY` present
- `ANTHROPIC_MODEL` present
- `ORADAR_PROVIDER` present
- `NEXT_PUBLIC_APP_URL` present

Additional verification:

- runtime result row confirmed provider `anthropic`
- runtime result row confirmed model `claude-sonnet-4-20250514`

Exact Preview env values were not dumped or committed.

## 5. Neon Staging DB / Migration Status

Target Neon project:

- project: `anyu-next`
- project id: `shy-silence-43729807`
- branch used for staging verification: `preview`
- branch id: `br-fragrant-union-aoh4udf1`

Initial DB status:

- `preview` branch had no runtime tables

Local migration attempt:

- local `corepack pnpm db:migrate` against the pulled Preview env did not receive a usable `DATABASE_URL` from `vercel env pull`
- this path was not used for the final migration result

Applied migration path:

- executed the existing Drizzle SQL from `apps/web/drizzle/0000_short_harrier.sql`
- applied directly to the Neon `preview` branch

Verified tables after migration:

- `analysis_requests`
- `analysis_results`
- `contact_submissions`
- `events`
- `sessions`
- `unlock_intents`

## 6. Remote QA Flow Result

Synthetic input used:

- `他最近回訊息變慢，但還是會看我的限動。我不知道他是真的忙，還是已經沒那麼喜歡我了。`

Verified remotely:

1. staging landing route loaded
2. landing HTML showed disabled empty CTA state
3. analyze request succeeded
4. result route loaded with persisted runtime result
5. result page rendered temperature card, insight card, share preview, and paid preview
6. unlock intent succeeded
7. synthetic email contact succeeded
8. synthetic LINE contact succeeded
9. demo route still loaded

Result id verified:

- `bcc5baf7-66c9-4cd0-87c5-fd2f8b0a62c3`

## 7. Provider / Schema Validation Result

- provider used: `anthropic`
- model used: `claude-sonnet-4-20250514`
- provider call succeeded on staging
- AJV/schema validation succeeded on staging
- normalized result persisted successfully

## 8. DB Verification

For anonymous session `staging-qa-session-20260519`:

- `analysis_requests`: `2`
- `analysis_results`: `1`
- `events`: `7`
- `unlock_intents`: `1`
- `contact_submissions`: `2`

Integrity checks passed:

- `analysis_results.normalized_result_json` present
- `score` present
- `score_bucket` present
- `analysis_results.retention_expires_at` present
- `analysis_requests.retention_expires_at` present
- `analysis_requests.raw_input_redacted` present
- unlock intent linked to the generated result id

Event distribution observed:

- `analysis_completed`: `1`
- `contact_submitted`: `2`
- `input_submitted`: `2`
- `paid_unlock_clicked`: `1`
- `share_card_clicked`: `1`

Note:

- `input_submitted = 2` because one synthetic analyze attempt was issued before the prompt/schema path fix and one after

## 9. Event / Privacy Verification

Verified:

- no raw input was found in `events.metadata_json`
- no synthetic email value was found in `events.metadata_json`
- no synthetic LINE value was found in `events.metadata_json`
- no secrets were printed in the QA workflow
- no raw DB row dumps were committed
- only synthetic input and synthetic contact values were used

## 10. Contact Capture Verification

Remote API verification passed:

- unlock intent returned a valid `unlockIntentId`
- synthetic email contact submission returned success
- synthetic LINE contact submission returned success

Note:

- a true browser click/confirmation-state walkthrough was not available in this shell-only environment
- remote route/API results and persisted rows confirm the contact flow backend is healthy on staging

## 11. Demo Route Verification

- `/m/ambiguous-temperature/result/demo` loaded successfully on the authenticated staging deployment

## 12. Mobile Viewport Notes

- HTML includes the expected mobile viewport meta tag
- the page structure remains the intended narrow mobile-first shell
- interactive mobile browser QA was not directly performed from this tool environment

## 13. Issues Found

- staging Preview DB branch initially had no runtime tables
- analyze runtime assumed repo-root prompt/schema paths that are not available in the Vercel `apps/web` deployment root
- local Preview env pull did not provide a usable secret value for a local `db:migrate` command

## 14. Fixes Applied

- applied the Drizzle runtime schema to the Neon `preview` branch
- added app-local synced copies of the prompt and schema under `apps/web/src/lib/ai/assets/`
- updated the runtime loader to read the app-local assets instead of searching for repo-root files
- added a regression test for the app-local asset paths

## 15. Remaining Blockers

- interactive browser-level mobile QA is still unverified from this environment
- direct local `db:migrate` against Preview via `vercel env pull` remains unreliable because pulled secret values are not usable locally

## 16. Production Launch Readiness Assessment

Staging is now materially healthier and the core Module 01 remote flow works.

Still not equivalent to production launch readiness because:

- this was staging only
- mobile browser QA remains partial
- broader retention automation is still not implemented
- production domain/promotion is still intentionally out of scope

## 17. Recommended Next Step

`Module 01 Staging Browser Manual QA Sweep v0`
