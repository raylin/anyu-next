# Module 01 Preview Deployment QA Report

Status: `blocked_pending_user_setup`

## 1. Summary

This handoff verified repo readiness, command readiness, and validation status for the first preview deployment QA pass.

Live preview QA could not be executed in this workspace because:

- required runtime env vars are not configured locally
- `vercel` CLI is not available locally
- no preview Neon / Vercel target was provided in the workspace

The app itself remains buildable and testable without secrets.

## 2. Environment Setup

Checked local environment status:

- `DATABASE_URL`: missing
- `ANTHROPIC_API_KEY`: missing
- `ANTHROPIC_MODEL`: missing
- `ORADAR_PROVIDER`: missing
- `NEXT_PUBLIC_APP_URL`: missing
- `OPENAI_API_KEY`: not required for the primary path and not checked for blocking
- `OPENAI_MODEL`: not required for the primary path and not checked for blocking

Required manual local setup:

1. create `apps/web/.env.local`
2. set:
   - `DATABASE_URL`
   - `ANTHROPIC_API_KEY`
   - `ANTHROPIC_MODEL`
   - `ORADAR_PROVIDER=anthropic`
   - `NEXT_PUBLIC_APP_URL`
3. optionally set:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL`

## 3. Neon / Database Setup

Blocked in this workspace because no Neon project or connection string is available here.

Required manual Neon steps:

1. create a Neon project in `ap-southeast-1`
2. create or confirm the preview/staging database
3. copy the pooled `DATABASE_URL` intended for serverless usage
4. set that `DATABASE_URL` in:
   - local `apps/web/.env.local`
   - Vercel preview environment
5. verify the target is preview/staging, not production

## 4. Drizzle Migration Result

Migration status:

- migration scripts are present:
  - `corepack pnpm db:generate`
  - `corepack pnpm db:migrate`
- `apps/web/drizzle.config.ts` is present and points at `src/lib/db/schema.ts`
- migration was **not run** because `DATABASE_URL` is missing in this workspace

Target env type:

- not executed

Expected tables after migration:

- `sessions`
- `events`
- `analysis_requests`
- `analysis_results`
- `unlock_intents`
- `contact_submissions`

Manual commands to run after env is configured:

```bash
cd apps/web
corepack pnpm db:generate
corepack pnpm db:migrate
```

## 5. Local Live QA

Local live QA status:

- not run

Reason:

- required runtime env vars are missing locally

Manual local QA steps after env is configured:

1. `cd apps/web`
2. `corepack pnpm dev`
3. visit `/m/ambiguous-temperature`
4. verify:
   - empty CTA disabled
   - valid input enables CTA
   - chip selection works
   - analyze submits and redirects to `/m/ambiguous-temperature/result/[resultId]`
   - result page loads from DB
   - share preview renders
   - unlock opens contact capture
   - email and LINE test submissions succeed

Use synthetic sample text only.

## 6. Vercel Preview Deployment

Preview deployment status:

- not run

Reason:

- `vercel` CLI is not installed in this workspace
- no linked Vercel project metadata is available here

Recommended Vercel project settings:

- Root Directory: `apps/web`
- Framework Preset: `Next.js`
- Build Command: `corepack pnpm build`
- Install Command: `corepack pnpm install --frozen-lockfile`

Exact manual preview steps:

```bash
vercel link
vercel env add DATABASE_URL preview
vercel env add ANTHROPIC_API_KEY preview
vercel env add ANTHROPIC_MODEL preview
vercel env add ORADAR_PROVIDER preview
vercel env add NEXT_PUBLIC_APP_URL preview
vercel --cwd apps/web
```

If workspace-root linking is required by your Vercel setup, ensure the Vercel project still uses `apps/web` as Root Directory.

## 7. Preview QA

Preview QA status:

- not run

Manual preview checks after deploy:

- preview URL root loads
- `/m/ambiguous-temperature` works
- `/m/ambiguous-temperature/result/demo` works
- real analyze flow works
- unlock/contact flow works
- friendly error states remain non-technical
- mobile viewport remains usable

## 8. DB Verification

DB verification status:

- not run

Manual DB checks after live QA:

- `analysis_requests` row created
- `analysis_results` row created
- `events` rows created
- `unlock_intents` row created after unlock
- `contact_submissions` row created after submit

Also verify:

- `normalized_result_json` is populated on `analysis_results`
- `retention_expires_at` is set where expected
- no raw input text appears in `events`
- contact values do not appear in `events`

## 9. Privacy Verification

Verified from implementation and prior tests:

- events reject obvious raw-text-like metadata keys
- no-env runtime still returns friendly errors without exposing config details

Still pending live verification:

- confirm preview DB rows do not place raw text in `events`
- confirm contact values are confined to contact storage only

Manual retention cleanup policy for preview / low-key launch:

- manual cleanup is acceptable for preview / low-key launch only
- review `analysis_requests` and `analysis_results` daily or every 48h
- delete or mark deleted rows past `retention_expires_at`
- scheduled deletion is required before broader public launch

## 10. Event Verification

Verified locally via tests and implementation review:

- passive events exist for `page_view`, `input_started`, `analysis_started`, `analysis_failed`, and `share_card_clicked`
- event API returns friendly `config_error` output when unconfigured

Still pending live preview verification:

- event inserts in preview DB
- passive events do not crash the client if the event API fails

## 11. Known Blockers

- `blocked_pending_user_setup`
- missing local `DATABASE_URL`
- missing local Anthropic env
- missing local `NEXT_PUBLIC_APP_URL`
- missing `vercel` CLI / preview deployment access
- no linked Vercel preview project metadata in this workspace

## 12. Fixes Needed Before Production

- complete real preview QA with live env
- run Drizzle migration against preview/staging
- verify DB rows and retention fields live
- verify Vercel preview config for `apps/web`
- decide whether manual retention cleanup is acceptable beyond preview
- add scheduled deletion before broader public launch

## 13. Recommended Next Step

`Module 01 Preview Env Setup + Live QA Retry v0`
