# Module 01 Preview Deployment QA Report

## 1. Summary

The first Vercel preview deployment for Module 01 succeeded and the protected preview routes were reached through Vercel’s authenticated bypass tooling.

Preview deployment:

- deployment URL: `https://anyu-next-b5iov9p51-studioanyu-1488s-projects.vercel.app`
- inspector URL: `https://vercel.com/studioanyu-1488s-projects/anyu-next/3hghWaYAhPyMkNfhiyAgtdqT6zaU`
- deployment status: `READY`

Remote QA result:

- landing route: reachable
- demo result route: reachable
- health API: reachable
- analyze API: reachable but failed with app-level `analyze_failed`
- events API: reachable but failed with `event_store_failed`
- contact API: reachable but failed with `contact_store_failed`

This is now classified as a preview DB/runtime write-path issue, not a preview-access issue.

## 2. Environment Setup

Local env presence remained valid:

- `DATABASE_URL`: present
- `ANTHROPIC_API_KEY`: present
- `ANTHROPIC_MODEL`: present
- `ORADAR_PROVIDER`: present
- `NEXT_PUBLIC_APP_URL`: present locally

Vercel preview env names confirmed:

- `DATABASE_URL`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`
- `ORADAR_PROVIDER`

Observed gap:

- `NEXT_PUBLIC_APP_URL` was not listed in the preview env output

Additional note:

- local code search found `NEXT_PUBLIC_APP_URL` referenced only in documentation, not in the current runtime path
- it should still be added for completeness, but it does not explain the current preview write-path failures

## 3. Neon / Database Setup

The preview project already has a `DATABASE_URL` configured for Preview in Vercel according to `vercel env ls preview`.

However:

- pulling preview env locally produced an empty `DATABASE_URL` value in the temp export
- remote preview write-paths failed consistently

That means the preview DB target is not yet independently verified as healthy from this workflow.

## 4. Drizzle Migration Result

No preview-specific remote migration command was executed from this handoff.

Known state entering the handoff:

- local/dev migration already succeeded
- runtime schema and migration artifacts are current

Manual remote follow-up if preview DB is a separate branch/database:

```bash
cd apps/web
corepack pnpm db:generate
corepack pnpm db:migrate
```

Target env type:

- preview

## 5. Local Live QA

Local live QA was already verified in the prior handoff and remained the baseline for this retry.

This handoff did not re-run the full local analyze/contact flow because the focus was preview deployment and remote access.

## 6. Vercel Preview Deployment

Completed:

- authenticated Vercel CLI on this machine
- discovered existing `anyu-next` Vercel project
- corrected local project linkage so it matched the project’s configured `apps/web` Root Directory
- deployed a new preview successfully

Deployment result:

- project: `studioanyu-1488s-projects/anyu-next`
- target: `preview`
- status: `READY`

## 7. Preview QA

Remote preview QA status:

- partially completed

Verified through authenticated Vercel bypass:

- preview landing page HTML rendered
- preview demo result page HTML rendered
- health endpoint returned `{ "ok": true, "service": "anyu-next-web" }`

Remote runtime failure checks:

- analyze request with synthetic input returned:
  - `{"ok":false,"error":"analyze_failed","message":"分析暫時失敗，請晚點再試一次。"}`
- safe synthetic events request returned:
  - `{"ok":false,"error":"event_store_failed","message":"目前事件收集服務忙碌中，請稍後再試。"}`
- synthetic contact request returned:
  - `{"ok":false,"error":"contact_store_failed","message":"目前聯絡收集服務忙碌中，請稍後再試。"}`

Interpretation:

- preview route access is working
- preview app build is working
- preview DB-backed write paths are failing

Manual authenticated browser QA still needed after the DB/runtime issue is fixed:

1. sign into the Vercel team in a browser
2. open the preview URL
3. verify:
   - `/m/ambiguous-temperature`
   - `/m/ambiguous-temperature/result/demo`
   - real analyze flow
   - unlock/contact flow
   - mobile viewport
   - friendly error states

## 8. DB Verification

Remote preview DB verification:

- not completed successfully

Reason:

- preview app routes were reachable, but all preview DB-backed write paths failed

Manual verification after the preview write-path issue is fixed:

- `analysis_requests` row inserted
- `analysis_results` row inserted
- `events` rows inserted
- `unlock_intents` row inserted
- `contact_submissions` row inserted
- `normalized_result_json` present
- `retention_expires_at` present where expected

## 9. Privacy Verification

Verified:

- no secrets were printed
- no env values were committed
- only synthetic input and synthetic contact values were used for remote requests

Still pending on remote preview:

- confirm preview-generated `events` exclude raw input
- confirm preview-generated `events` exclude contact values

## 10. Event Verification

Remote event verification:

- request path reached
- DB-backed event persistence failed

Evidence:

- `/api/events` returned `event_store_failed`

Manual follow-up after fixing preview DB/runtime writes:

- complete one authenticated preview analyze flow
- confirm preview DB `events` rows exist
- confirm no raw input/contact leakage in metadata

## 11. Known Blockers

- preview DB/runtime write paths are failing remotely
- `NEXT_PUBLIC_APP_URL` still needs to be added cleanly to Preview env
- authenticated browser-side full QA should wait until preview write-path failures are fixed or explained

## 12. Fixes Needed Before Production

- diagnose why preview DB-backed writes fail for analyze, events, and contact
- add `NEXT_PUBLIC_APP_URL` to the preview environment cleanly
- verify preview DB rows and event privacy after a successful real preview flow
- complete authenticated browser QA after the write-path issue is resolved

## 13. Recommended Next Step

`Module 01 Preview Runtime Failure Triage v0`
