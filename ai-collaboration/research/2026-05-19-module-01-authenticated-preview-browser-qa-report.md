# Module 01 Authenticated Preview Browser QA Report

## 1. Summary

Authenticated preview QA was partially completed against the protected Vercel preview deployment.

What succeeded:

- authenticated preview access path
- preview landing route load
- preview demo route load
- preview health API load
- deployment/build verification

What failed:

- preview analyze runtime
- preview events persistence
- preview contact persistence

Current classification:

- preview DB/runtime write-path issue

## 2. Preview URL

- preview URL tested: `https://anyu-next-b5iov9p51-studioanyu-1488s-projects.vercel.app`
- inspector URL: `https://vercel.com/studioanyu-1488s-projects/anyu-next/3hghWaYAhPyMkNfhiyAgtdqT6zaU`

## 3. Vercel SSO / Access Status

- direct unauthenticated HTTP access from the sandbox remained blocked by Vercel SSO
- authenticated access succeeded through Vercel CLI protected-preview bypass

This means protected preview access is functioning, even though a literal browser session was not available inside this tool environment.

## 4. Preview Environment Check

Confirmed preview env names:

- `DATABASE_URL`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`
- `ORADAR_PROVIDER`

Not confirmed in preview env output:

- `NEXT_PUBLIC_APP_URL`

Additional note:

- local code search found `NEXT_PUBLIC_APP_URL` referenced only in documentation, not in the current runtime path
- it should still be added for completeness, but it does not explain the current remote runtime failure

## 5. Neon Preview DB / Migration Status

The preview environment advertises a `DATABASE_URL`, but remote runtime behavior suggests the preview DB-backed write path is not healthy.

This handoff did not execute a separate preview migration command.

Status:

- preview DB target exists in env naming
- actual preview write-path health is failing
- migration status against preview branch remains unconfirmed

## 6. Authenticated Browser QA Result

Verified through authenticated preview access:

1. preview page loads after protected access: yes
2. demo route loads after protected access: yes
3. analyze route request reached the app: yes
4. analyze returned success: no
5. result route for a real preview result: not reached because analyze failed
6. unlock/contact full remote flow: not reached because analyze failed
7. mobile viewport: not verified from this tool environment

Remote analyze response:

- `{"ok":false,"error":"analyze_failed","message":"分析暫時失敗，請晚點再試一次。"}`

## 7. Provider / Schema Validation Result

Remote preview provider/schema path could not be confirmed as successful because analyze failed before producing a persisted result.

What is known:

- the preview route executed the analyze handler
- the failure happened inside the runtime path after request validation
- local live QA already proved Anthropic + AJV + persistence works in the local environment

## 8. DB Verification

Remote preview DB verification did not complete successfully.

Evidence pointing to preview DB/runtime write failure:

- `/api/events` returned `event_store_failed`
- `/api/contact` returned `contact_store_failed`

That means multiple preview write paths are failing, not just analyze.

## 9. Event / Privacy Verification

Verified:

- no secrets were printed
- no env values were printed
- only synthetic preview payloads were used

Still pending:

- confirm preview `events` rows exist
- confirm preview `events` exclude raw input
- confirm preview `events` exclude synthetic contact values

## 10. Contact Capture Verification

Full preview contact-capture verification was not possible because:

- real analyze did not succeed
- no real remote result ID was generated

However, a direct synthetic contact API test did reach the app and returned:

- `contact_store_failed`

## 11. Demo Route Verification

Demo route verification passed remotely through authenticated preview access.

`/m/ambiguous-temperature/result/demo` returned the expected result shell HTML.

## 12. Issues Found

- preview analyze failed remotely
- preview events persistence failed remotely
- preview contact persistence failed remotely
- `NEXT_PUBLIC_APP_URL` not confirmed in preview env output

## 13. Fixes Applied

- authenticated the Vercel CLI
- corrected local Vercel project linking so repo root matched the project’s configured `apps/web` Root Directory
- no application code fixes were applied

## 14. Remaining Blockers

- preview DB-backed write paths are failing
- preview DB verification remains incomplete
- full remote flow QA remains blocked until preview writes succeed

## 15. Production Launch Readiness Assessment

Not production-ready yet.

Reason:

- local runtime path is verified
- preview deployment is successful
- preview access is successful
- but preview runtime writes are failing, so broader rollout should not proceed until preview environment behavior matches local behavior

## 16. Recommended Next Step

`Module 01 Preview Runtime Failure Triage v0`
