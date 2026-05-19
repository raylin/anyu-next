# Module 01 Preview Deployment QA Report

## 1. Summary

The first Vercel preview deployment for Module 01 succeeded.

Preview deployment:

- deployment URL: `https://anyu-next-b5iov9p51-studioanyu-1488s-projects.vercel.app`
- inspector URL: `https://vercel.com/studioanyu-1488s-projects/anyu-next/3hghWaYAhPyMkNfhiyAgtdqT6zaU`
- deployment status: `READY`

Remote route QA from this workspace was only partially completed because the preview URL is protected by Vercel SSO and returned `401` for direct HTTP access from this environment.

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

Attempting to add it through the CLI hit Vercel’s preview-branch targeting constraint. This should be completed in the dashboard or via the correct non-production branch target.

## 3. Neon / Database Setup

The preview project already has a `DATABASE_URL` configured for Preview in Vercel.

This handoff did not run a separate remote DB query against the preview environment because the preview route flow itself was blocked by Vercel SSO access controls in this sandbox.

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

- partially blocked

What was verified:

- deployment reached `READY`
- build completed successfully on Vercel
- expected app routes were included in the build output

What was blocked:

- direct HTTP checks to `/m/ambiguous-temperature`
- direct HTTP checks to `/m/ambiguous-temperature/result/demo`
- remote analyze/unlock/contact flow execution

Blocking reason:

- Vercel preview protection / SSO returned `401` from this environment

Manual authenticated browser QA still needed:

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

- not completed from this workspace

Reason:

- preview app routes could not be exercised past SSO protection

Manual verification after authenticated preview QA:

- `analysis_requests` row inserted
- `analysis_results` row inserted
- `events` rows inserted
- `unlock_intents` row inserted
- `contact_submissions` row inserted
- `normalized_result_json` present
- `retention_expires_at` present where expected

## 9. Privacy Verification

Verified from deployment/build behavior:

- no secrets were printed
- no env values were committed

Still pending on remote preview:

- confirm preview-generated `events` exclude raw input
- confirm preview-generated `events` exclude contact values

## 10. Event Verification

Remote event verification:

- not completed from preview runtime

Reason:

- preview route execution blocked by Vercel SSO from this environment

Manual follow-up:

- complete one authenticated preview analyze flow
- confirm preview DB `events` rows exist
- confirm no raw input/contact leakage in metadata

## 11. Known Blockers

- remote route-level QA from this sandbox is blocked by Vercel SSO preview protection
- `NEXT_PUBLIC_APP_URL` still needs to be added cleanly to Preview env
- remote DB verification is pending until authenticated preview flow is executed

## 12. Fixes Needed Before Production

- complete authenticated browser QA on the preview URL
- add `NEXT_PUBLIC_APP_URL` to the preview environment cleanly
- verify preview DB rows and event privacy after a real preview flow
- decide whether preview protection settings should be adjusted for future automated QA

## 13. Recommended Next Step

`Module 01 Authenticated Preview Browser QA v0`
