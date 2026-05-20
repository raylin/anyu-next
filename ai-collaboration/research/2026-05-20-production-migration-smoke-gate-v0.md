# Production Migration + Smoke Gate v0

Date: 2026-05-20

## 1. Summary

Production migration and the tightly scoped synthetic smoke both passed.

The required runtime tables now exist on the Neon `anyu-next` `production` branch, production analyze succeeded on `https://anyu.tw`, the real result route loaded, unlock intent succeeded, synthetic Email fallback submit succeeded, legal routes loaded, and `https://www.anyu.tw` redirected to `https://anyu.tw/`.

Production launch status remains `No-Go pending final human approval / final launch decision`.

## 2. User DATABASE_URL Confirmation

Human confirmation used for this task:

```text
Production DATABASE_URL has been manually configured and is intended to point to the correct Neon anyu-next production branch.
```

Per handoff instruction, this task did not print or attempt to reveal the secret value.

## 3. Migration Command

Attempted production-context migration path:

```text
cd apps/web
corepack pnpm db:migrate
```

Safe production `vercel env run` execution still surfaced an empty `url` to Drizzle, so the command could not be completed through the Vercel runtime probe path.

Approved fallback actually used:

```text
Direct idempotent SQL application on Neon project `anyu-next`, branch `production`, database `neondb`
```

This applied the existing runtime schema without adding any new schema design beyond the already expected tables, indexes, and foreign keys.

## 4. Migration Result

Result: `passed`

Notes:

- direct Neon production-branch migration succeeded
- required runtime tables, indexes, and foreign keys were created successfully
- no destructive SQL was used

## 5. Table Verification

Required table verification after migration:

- `sessions`: present
- `events`: present
- `analysis_requests`: present
- `analysis_results`: present
- `unlock_intents`: present
- `contact_submissions`: present

Additional relational verification:

- production `analysis_results` row linked correctly to its `analysis_requests` row
- production `contact_submissions` row linked correctly to the created `unlock_intents` row

## 6. Smoke Eligibility

Smoke eligibility result: `eligible`

Gate outcomes:

- Gate A, migration: passed
- Gate B, required runtime tables present: passed

## 7. Production Smoke Result

Smoke result: `passed`

Synthetic production flow used:

- input text:
  - synthetic ambiguity scenario only
- anonymous session:
  - synthetic UUID only
- synthetic email:
  - `anyu-production-smoke@example.com`

Verified production outcomes:

- `https://anyu.tw/m/ambiguous-temperature` loaded
- valid synthetic analyze succeeded
- result created successfully
- real result route loaded with `200`
- temperature/result surfaces rendered
- observed signals rendered
- paid preview rendered
- unlock intent succeeded
- LINE-first panel rendered on the result page
- Email fallback submit succeeded with synthetic email

Key production artifacts from the smoke:

- `resultId`: `119135c5-e813-4652-b22d-f70b8480626a`
- `unlockIntentId`: `f4f38c0f-8ff1-4520-aca8-447fe24f7456`

## 8. Event / Privacy Verification

Safe production verification result: `passed`

Confirmed:

- `analysis_completed` event exists for the smoked result
- timing metadata is present on `analysis_completed`
- `contact_submitted` event exists for the synthetic Email fallback submit
- events did not contain raw synthetic input
- events did not contain the synthetic email value
- events did not contain full result JSON
- events did not contain provider raw output in the verified metadata path
- `contact_submissions` contains only the synthetic contact used for this smoke

Important note:

- verification was done using boolean and count checks only
- no raw production rows or secrets were copied into repo artifacts

## 9. Legal / LINE / Redirect Verification

Verified:

- `/privacy` returns `200`
- `/terms` returns `200`
- `/disclaimer` returns `200`
- `https://www.anyu.tw` returns `308` to `https://anyu.tw/`
- production result page includes the LINE-first surface
- production result page includes the LINE CTA text
- production result page includes Email fallback text

Observed LINE CTA verification:

- LINE-first contact surface was present
- result page contained `加入 LINE`
- Email fallback path remained available

## 10. Logs / Failures

No production smoke failure occurred.

Sanitized operational note:

- the Vercel `env run` / Drizzle path still behaved as if `DATABASE_URL` were unavailable to that probe
- direct Neon production-branch migration succeeded anyway and the subsequent live production smoke confirmed runtime DB access is functioning for the deployed app

## 11. Production Launch Decision Updates

Decision draft should now reflect:

- production migration passed
- required runtime tables are present
- production smoke passed for analyze, result load, unlock, synthetic Email fallback, legal routes, and redirect
- production DB-backed runtime behavior is now proven by live smoke, even though the safe `env run` probe path remains inconsistent
- current status remains `No-Go pending final human approval / final launch decision`

## 12. Remaining Blockers

Remaining blockers after this task:

- final approved production commit still needs explicit human selection
- final human browser / phone smoke acceptance is still pending
- manual retention cleanup SOP still needs explicit human acceptance or a stronger operational alternative
- final production launch approval is still pending
- the Vercel safe runtime-probe inconsistency around `DATABASE_URL` remains an ops/debugging note even though live runtime behavior now works

## 13. Current Go / No-Go Status

Current status: `No-Go pending final human approval / final launch decision`

Reason:

- the technical production smoke gate is now green
- launch is still blocked on human approval and remaining launch-operations acceptance items

## 14. Recommended Next Step

`Production Final Human Smoke + Launch Decision v0`
