# Module 01 Launch Readiness Checklist

## 1. Environment Variables

Required app env:

- `DATABASE_URL`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `ORADAR_PROVIDER=anthropic`
- `NEXT_PUBLIC_APP_URL`

Expected behavior:

- lint, test, and build should pass without live env
- live analyze requires `DATABASE_URL` plus one provider key
- `/m/ambiguous-temperature/result/demo` should stay available without env

## 2. Neon Database Setup

- create a Neon project in `ap-southeast-1`
- confirm the target branch/database that will back Module 01
- set `DATABASE_URL` in Vercel for the target environment
- verify app connectivity from the deployed build
- verify `analysis_results` insert works
- verify `events` insert works
- verify `contact_submissions` insert works

## 3. Drizzle Migration

- run `corepack pnpm db:generate`
- review generated SQL before applying
- run migration against the intended database
- verify required tables exist:
  - `sessions`
  - `events`
  - `analysis_requests`
  - `analysis_results`
  - `unlock_intents`
  - `contact_submissions`

## 4. Provider Key Setup

- set `ANTHROPIC_API_KEY` for primary runtime
- confirm `ANTHROPIC_MODEL` matches intended launch model
- set `OPENAI_API_KEY` and `OPENAI_MODEL` only if fallback is desired
- verify analyze returns a schema-valid result
- confirm provider failures surface only friendly user copy

## 5. Vercel Deployment

- confirm production project points at `apps/web`
- confirm all required env vars are configured
- deploy a preview build first
- verify API routes are reachable in preview
- promote to production only after manual QA passes

## 6. Domain Setup

- confirm the target domain is `anyu.tw`
- confirm Vercel domain attachment and HTTPS
- verify `NEXT_PUBLIC_APP_URL` matches the deployed environment

## 7. Manual QA Flow

- visit `/m/ambiguous-temperature`
- confirm empty CTA is disabled
- type enough text to enable CTA
- change situation chip
- submit analyze
- arrive at `/m/ambiguous-temperature/result/[resultId]`
- confirm temperature card renders
- confirm share preview renders
- confirm paid preview renders
- click unlock
- confirm contact capture appears even if unlock-intent storage fails
- submit one email flow
- submit one LINE ID flow
- verify event rows exist for the tested flow
- verify raw text is not present in event rows
- confirm demo route still works
- confirm mobile viewport remains usable
- confirm all user-facing errors stay non-technical

## 8. Privacy / Data Retention

Minimum checks before launch:

- raw text must not be stored in `events`
- contact values must not be stored in `events`
- analysis request input must be redacted or retention-limited
- `retention_expires_at` must be set on retained request/result records
- privacy copy must not make absolute guarantees
- a manual deletion path should be defined, even if simple

Pre-launch decision needed:

- scheduled deletion is not implemented yet; confirm whether manual cleanup is acceptable for the first low-key launch

## 9. Analytics Verification

Verify the following events can be inserted without crashing the client:

- `page_view`
- `input_started`
- `analysis_started`
- `analysis_failed`
- `input_submitted`
- `analysis_completed`
- `paid_unlock_clicked`
- `contact_submitted`
- `share_card_clicked`

Also verify:

- metadata contains only safe fields
- no raw input is included
- no contact values are included

## 10. Known Launch Blockers

- no live DB/provider verification has been completed in this workspace yet
- retention cleanup job is still deferred
- passive analytics are best-effort and depend on runtime DB availability
- no email/LINE delivery exists for contact follow-up yet

## 11. Nice-To-Have After Launch

- share PNG / OG generation
- richer privacy review and stronger PII detection
- better analytics dashboarding or reporting
- fallback contact resend/retry workflow
- post-launch retention cleanup automation
