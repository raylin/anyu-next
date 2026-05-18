# Module 01 Local Live QA Verification Report

## 1. Summary

Local live QA passed for Module 01 using the configured `apps/web/.env.local`.

The verified local flow covered:

- analyze request
- provider call
- schema validation
- result persistence
- result route data load
- unlock intent
- email contact submission
- LINE contact submission
- demo route verification
- DB and privacy checks

No application code fixes were required during this QA pass.

## 2. Environment Presence Check

Required env presence under `apps/web/.env.local`:

- `DATABASE_URL`: present
- `ANTHROPIC_API_KEY`: present
- `ANTHROPIC_MODEL`: present
- `ORADAR_PROVIDER`: present
- `NEXT_PUBLIC_APP_URL`: present

Values were not printed.

## 3. Migration Result

Commands run in `apps/web`:

- `corepack pnpm db:generate`
- `corepack pnpm db:migrate`

Result:

- `db:generate` reported no new schema diff
- `db:migrate` applied successfully against the configured local/dev Neon target

## 4. Local Live Flow Result

Synthetic sample used:

- one relationship-ambiguity text sample only
- no real private user content used

Flow result:

- empty CTA logic: verified
- valid input CTA logic: verified
- situation selection value: verified
- analyze route: success
- returned redirect: `/m/ambiguous-temperature/result/[resultId]`
- result route data path: verified
- temperature / insight / share / paid preview data path: verified through persisted result and result-page load
- unlock intent: success
- email contact submit: success
- LINE contact submit: success
- confirmation state: success

## 5. Provider / Schema Validation Result

- provider used: `anthropic`
- model used: `claude-sonnet-4-20250514`
- provider call succeeded: yes
- AJV/schema validation passed: yes
- normalized result persisted: yes

## 6. DB Verification

Observed record deltas for the QA session:

- `analysis_requests`: +1
- `analysis_results`: +1
- `events`: +5
- `unlock_intents`: +1
- `contact_submissions`: +2

Verified:

- `analysis_results.normalized_result_json` exists
- `analysis_results.score` exists
- `analysis_results.score_bucket` exists
- `analysis_results.retention_expires_at` is set
- `analysis_requests.retention_expires_at` is set
- unlock intent row exists
- two contact submission rows exist for the synthetic email and LINE tests

Note on request input storage:

- `analysis_requests.raw_input_redacted` was populated
- because the QA sample contained no email / phone / handle-like tokens, the stored redacted value matched the synthetic input text
- this does not affect the event privacy outcome, since events still excluded raw input entirely

## 7. Event / Privacy Verification

Verified:

- raw input not present in event metadata
- synthetic email not present in event metadata
- synthetic LINE ID not present in event metadata
- forbidden metadata keys like `text`, `rawText`, `input`, and `conversation` were not present
- provider keys were not printed
- `DATABASE_URL` was not printed
- only synthetic input was used

Observed event names for this QA session:

- `input_submitted`
- `analysis_completed`
- `paid_unlock_clicked`
- `contact_submitted`
- `contact_submitted`

## 8. Contact Capture Verification

- unlock intent was created successfully
- email contact submission succeeded
- LINE contact submission succeeded
- confirmation message returned successfully for both submissions

## 9. Demo Route Verification

Demo result route verification passed.

The demo route path remained valid alongside the real DB-backed result path.

## 10. Issues Found

- no blocking issues found in the local live QA flow

## 11. Fixes Applied

- no product/runtime fixes applied
- one temporary local QA runner script was created outside the committed repo surface and removed after verification

## 12. Remaining Blockers

- no local blocker remains for the verified Module 01 runtime path
- preview deployment and remote QA are still separate steps
- scheduled deletion remains a broader pre-public-launch concern, not a blocker for this local verification task

## 13. Recommended Next Step

`Module 01 Preview Deployment + Remote QA Retry v0`
