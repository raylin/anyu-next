# Production Deployment Runbook v0

Date: 2026-05-20

## 1. Purpose

This runbook defines the manual, human-approved process for deploying ANYU Module 01 to production.

Current approved low-key launch record:

- `ai-collaboration/decisions/2026-05-20-production-launch-decision-final-v0.md`

## 2. Production Deployment Principle

Production deployment follows a stricter rule than staging:

- staging push is part of the normal completed-handoff workflow when validation and safety checks pass
- production deploy is never automatic
- production deploy requires explicit human approval
- production deploy requires a completed Production Launch Decision record
- production deploy must be treated as a separate operational action, not an implied outcome of a successful staging pass

## 3. Current Environments

Current environment model:

```text
local/dev:
  developer machine + Neon dev branch

staging:
  branch: origin/staging
  domain: https://staging.anyu.tw
  DB: Neon preview/staging branch
  purpose: QA, review, beta

production:
  branch: main or approved production commit
  domain: https://anyu.tw
  DB: Neon production branch
  purpose: public users
```

Open status:

- the exact long-term production branch strategy is still a repo decision
- current recommendation is `main` or an explicitly approved production commit promoted through a human review step

## 4. Production Approval Gate

Production deployment requires all of the following:

- staging QA passed
- legal routes verified
- LINE CTA verified
- abuse guards verified
- production env configured
- production DB migration plan reviewed
- retention cleanup SOP defined
- rollback plan defined
- human approval recorded in a Production Launch Decision record

If any one of those items is missing, production deployment should not proceed.

## 5. Pre-Production Checklist

Before production deployment:

- latest staging-approved commit selected
- all required validation passes on that commit
- no unresolved blockers remain
- no `.env`, secrets, raw user content, or DB dumps are staged or copied into docs
- known launch risks are explicitly accepted
- Production Launch Decision record is completed and approved by the human operator

## 6. Environment Variables Checklist

Production env vars should include:

```text
DATABASE_URL=<Neon production pooled connection string>
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-sonnet-4-20250514
ORADAR_PROVIDER=anthropic
MODEL_STRATEGY=sonnet_default
ANALYSIS_CACHE_HASH_SECRET=<strong random secret>
RETENTION_CLEANUP_SECRET=<strong random secret> or CRON_SECRET=<strong random secret>
ANTHROPIC_FAST_MODEL=claude-haiku-4-5-20251001 optional / not default
ANTHROPIC_FALLBACK_MODEL=claude-sonnet-4-20250514 optional
NEXT_PUBLIC_APP_URL=https://anyu.tw
NEXT_PUBLIC_LINE_ADD_URL=<production LINE OA add-friend URL>
NEXT_PUBLIC_LINE_LIFF_ID=<production LIFF ID>
NEXT_PUBLIC_LINE_LIFF_URL=<production LIFF URL>
LINE_CHANNEL_SECRET=<production LINE channel secret>
LINE_CHANNEL_ACCESS_TOKEN=<production LINE channel access token>
LINE_LOGIN_CHANNEL_ID=<production LINE Login channel ID, optional if LIFF ID prefix matches>
FULFILLMENT_TOKEN_SECRET=<strong random secret>
ANALYSIS_SESSION_DAILY_LIMIT=3
ANALYSIS_IP_HOURLY_LIMIT=10
ANALYSIS_GLOBAL_DAILY_LIMIT=200
OPERATOR_TEST_SECRET=<strong random secret, optional, only if operator QA bypass is explicitly approved>
```

Important rule:

- do not set production `MODEL_STRATEGY` to `haiku_retry_sonnet_fallback` unless a separate production approval explicitly approves that model strategy
- do not set production `OPERATOR_TEST_SECRET` unless operator test mode is explicitly approved for controlled QA; absence disables the mode

## 7. Neon Production Database Checklist

Neon production checklist:

- create or confirm a dedicated Neon production branch
- confirm region `ap-southeast-1` if using the current infra plan
- use a pooled serverless connection string for production
- set `DATABASE_URL` only in Vercel production env
- do not reuse a dev, local, or preview branch as production
- verify the production branch contains the expected runtime tables before launch
- confirm the active production `DATABASE_URL` actually targets the Neon `anyu-next` `production` branch without exposing secrets
- if runtime still does not see `DATABASE_URL` after secret update, stop before smoke and resolve env/runtime mismatch first

## 8. Drizzle Migration Checklist

Production migration checklist:

- review generated migration files before production use
- current launch baseline includes the idempotent analyze cache migration `apps/web/drizzle/0001_wooden_king_cobra.sql`
- request-state / polling UX requires `apps/web/drizzle/0002_analyze_request_state.sql`
- LINE fulfillment requires `apps/web/drizzle/0003_line_fulfillment.sql`
- LINE webhook idempotency/rate guard requires `apps/web/drizzle/0004_line_webhook_hardening.sql`
- run migration against production only after explicit approval
- record migration command and result in the launch record or launch report
- verify required tables exist after migration
- never paste `DATABASE_URL` into reports or logs

Expected command shape:

```bash
cd apps/web
corepack pnpm db:migrate
```

Rule:

- only run this command when production `DATABASE_URL` is intentionally configured for that session
- if the safe Vercel `env run` path still behaves as if `DATABASE_URL` is unavailable but a human has explicitly confirmed the target and a production migration is approved, a direct Neon production-branch migration may be used instead, with the fallback documented in the launch report

## 9. Vercel Production Deployment Checklist

Expected Vercel project settings:

- Root Directory: `apps/web`
- Framework Preset: `Next.js`
- Build Command: `corepack pnpm build`
- Install Command: `corepack pnpm install --frozen-lockfile`
- Production branch: `main` or another explicitly approved branch / commit path

Deployment options:

- Option A:
  - merge approved staging commit into `main`
- Option B:
  - promote exact approved deployment if Vercel promotion flow is deliberately chosen and documented

Recommended v0 approach:

- merge the approved staging commit into `main` only after the Production Launch Decision is completed
- complete production project/domain normalization before final launch approval
- current recommended target is `anyu-next` owning `anyu.tw` and `www.anyu.tw`
- after normalization, verify `www.anyu.tw` redirects to `https://anyu.tw` rather than serving a parallel canonical host

Do not auto-push `main`.

## 10. Domain / DNS Checklist

Production domain checklist:

- production domain: `anyu.tw`
- canonical domain policy: `anyu.tw` primary, `www.anyu.tw` redirects to apex
- verify DNS points to Vercel
- verify SSL certificate is active
- verify `https://anyu.tw` loads successfully
- verify redirect policy for `https://www.anyu.tw`

Open question:

- production project/domain normalization should be complete before production launch
- `www.anyu.tw` must redirect to apex before launch approval, whether via Vercel config or a narrow app-level redirect

## 11. NEXT_PUBLIC Env Rebuild Rule

Important operational rule:

- any change to `NEXT_PUBLIC_*` env variables requires rebuild and redeploy
- server-side env changes that affect runtime behavior, including `ANALYSIS_CACHE_HASH_SECRET`, also require a fresh deployment before the new value is active
- after redeploy, verify the alias or domain points to the new deployment
- do not assume Vercel env changes affect already-built frontend bundles

This rule applies to staging and production.

## 12. Operator Test Mode

Operator test mode is for controlled Module 01 QA only. It must not be used as a public product affordance.

Activation:

- configure `OPERATOR_TEST_SECRET` only in the target environment that should allow operator QA
- send analyze API requests with the `x-operator-test-secret` request header
- if `OPERATOR_TEST_SECRET` is unset, missing, or mismatched, traffic behaves as normal public traffic

Allowed relaxation:

- valid operator test requests skip the in-memory per-IP analyze limit
- valid operator test requests skip the persisted per-session analyze limit
- the global daily analyze cap remains enforced

Protections that remain enforced:

- input validation
- relationship-content and prompt-injection guards
- provider/model hard limits and provider errors
- LINE webhook signature verification
- LIFF ID token verification
- secret and token redaction rules

Analytics/event behavior:

- operator requests are marked with safe metadata: `operatorTest: true` and `testModeSource: "header"`
- do not log, store, or paste the operator secret
- operator-marked events should be excluded from product analytics review when measuring public conversion

Current v0 limitation:

- mobile manual testing does not receive a public test-mode UI or query-only bypass
- use an API client or controlled QA tooling that can send the header; a signed short-lived mobile operator link would require a separate approved follow-up

## 13. Module 01 Smoke Test

Minimum production smoke test:

Gate before smoke:

- runtime must see non-empty `DATABASE_URL`
- production branch schema must already contain required runtime tables
- production branch schema must include request-state columns on `analysis_requests`
- production env should include non-empty `ANALYSIS_CACHE_HASH_SECRET` so identical-input cache reuse stays active after deploy
- production env should include LINE fulfillment env only after production LINE OA / LIFF setup is confirmed

1. open `/m/ambiguous-temperature`
2. confirm landing loads and CTA behavior is correct
3. submit one synthetic analyze input
4. confirm real result route loads
5. confirm paid unlock opens the LINE fulfillment panel
6. confirm LINE CTA exists and points at the production LIFF URL through env-built config
7. confirm short-code fallback appears
8. confirm Email fallback still works
9. confirm legal footer links load
10. confirm `/m/ambiguous-temperature/result/demo` still works if retained intentionally

Use synthetic content only for QA.

For UI-heavy changes, optionally run local Playwright smoke before handoff completion.

Minimal happy-path production smoke evidence should include:

- analyze response success
- analyze request status row reaches `completed`, or the status endpoint returns completed for the synthetic request
- real result route `200`
- unlock intent success
- fulfillment code/token generated
- unlocked route loads for the synthetic result
- LINE webhook rejects an invalid signature
- synthetic Email fallback success if tested
- privacy-safe event verification with no raw input or contact leakage

## 14. Legal / Trust Checklist

Before production:

- `/privacy` loads
- `/terms` loads
- `/disclaimer` loads
- `/legal` loads
- `hello@anyu.tw` is visible where expected
- copy does not claim:
  - immediate complete-analysis delivery if not true
  - LINE automation if not true
  - automatic deletion guarantees that are not yet implemented

## 15. LINE Funnel / Fulfillment Checklist

Before production:

- `NEXT_PUBLIC_LINE_ADD_URL` is configured in production env
- `NEXT_PUBLIC_LINE_LIFF_ID` is configured in production env
- `NEXT_PUBLIC_LINE_LIFF_URL` is configured in production env
- `LINE_CHANNEL_SECRET` is configured as a server-only production env var
- `LINE_CHANNEL_ACCESS_TOKEN` is configured as a server-only production env var
- `LINE_LOGIN_CHANNEL_ID` is configured if the production LINE Login channel ID cannot be derived from the LIFF ID prefix
- production LINE webhook URL is `https://anyu.tw/api/line/webhook`
- production LIFF endpoint URL is `https://anyu.tw/m/ambiguous-temperature/line/fulfill`
- production DB has `0004_line_webhook_hardening.sql` applied after explicit approval
- LIFF primary path has been verified with an operator-owned LINE account
- short-code fallback path has been verified with an operator-owned LINE account
- LINE fulfillment panel is live
- Email fallback is live
- welcome-message and OA profile basics are set in LINE backend
- product copy promises complete-analysis link only after fulfillment is verified
- no raw input, LINE message text, email, or token values appear in events/logs

Reference record:

- `ai-collaboration/research/2026-05-20-anyu-line-oa-setup-record-v0.md`
- `ai-collaboration/research/line/line-oa-production-setup.md`
- `ai-collaboration/research/line/line-fulfillment-env-matrix.md`
- profile image asset: `docs/design-system/brand/exports/line-profile-1024.png`

## 16. Abuse Guard / Cost Cap Checklist

Before production:

- session limit configured
- IP hourly limit configured
- global daily limit configured
- current model default is still the approved launch candidate
- no unapproved model strategy flag is active
- abuse guard behavior has been verified recently on staging
- provider key presence alone is not enough; production smoke should still verify an actual provider call after DB readiness is real

## 17. Retention Cleanup SOP

Until stronger automation exists, production needs an explicit retention cleanup SOP:

- review analysis and contact retention status at least daily or every 48 hours
- identify rows older than `retention_expires_at`
- delete or mark deleted rows according to the approved policy
- verify events still exclude raw input and contact values
- document cleanup completion in an ops log or launch operations note

Scheduled retention cleanup v0 now covers:

- `analysis_requests`
- `analysis_results`
- `analysis_paid_results`

Current mechanism:

- Vercel cron path: `/api/cron/retention-cleanup`
- cadence: daily at `17:00 UTC`
- secret required: `RETENTION_CLEANUP_SECRET` or `CRON_SECRET`
- `dryRun=1` returns aggregate counts only, including an `analysisPaidResults` block

`analysis_paid_results` cleanup policy:

- uses `analysis_paid_results.retention_expires_at`
- scrubs in place rather than hard-deleting rows
- sets `paid_result_json = NULL`
- sets `status = 'expired'`
- sets `error_code = 'retention_expired'`
- preserves identifiers and analysis-result links for aggregate/reference integrity
- never returns raw paid-result JSON in dry-run output

Still not cleaned automatically in v0:

- `events`
- `unlock_intents`
- `contact_submissions`
- `sessions`

Pre-launch rule:

- scheduled deletion is still a known risk if not implemented
- manual cleanup is still required only for the non-target tables above unless a later retention-policy decision expands scope

## 18. Rollback Plan

If production deployment misbehaves:

1. stop any additional promotion steps
2. identify the last known-good deployment or commit
3. repoint production alias or redeploy the last known-good commit
4. verify landing, analyze, result, unlock, contact, and legal routes
5. document rollback cause and next remediation task

Rollback must not rely on guessing. Use a known-good staging-approved or previously healthy production deployment.

## 19. Post-Launch Monitoring

First post-launch checks:

- Vercel deployment health
- analyze route success/failure behavior
- contact submission behavior
- event ingestion health
- Neon production DB writes
- model latency and failure rate
- LINE CTA live behavior
- abuse/cost caps not being hit unexpectedly

Recommended early cadence:

- immediate check after deployment
- another check within the first hour
- daily checks during the first low-key launch window

## 20. Known Launch Risks

Known production-launch risks:

- `NEXT_PUBLIC_*` env drift can create invisible frontend bundle mismatch
- production DB migration may still diverge from preview if done carelessly
- LINE CTA flow can be operationally correct in code but still fail if env or alias freshness is wrong
- retention cleanup is still partly manual
- `events`, `unlock_intents`, contact data, and sessions remain outside scheduled retention cleanup v0
- current model remains provider-dominant in latency, which affects perceived responsiveness
- protected staging verification does not fully replace production real-user conditions

## 21. What Must Not Happen Automatically

The following must not happen automatically:

- production deployment after a normal handoff
- production alias switch after a staging push
- production DB migration after a staging validation pass
- production env change without rebuild/redeploy verification
- production model-strategy switch without separate approval

## 22. Production Launch Decision Record

Use the canonical decision template:

- `ai-collaboration/templates/production_launch_decision_template.md`

That record should capture:

- approved commit
- approval status
- env readiness
- DB readiness
- QA outcome
- known risks accepted
- rollback contact/owner

## 23. Recommended Next Step

`Production Launch Decision Draft v0`
