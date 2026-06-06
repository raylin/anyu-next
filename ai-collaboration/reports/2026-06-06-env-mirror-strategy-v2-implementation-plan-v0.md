# Env Mirror Strategy v2 Implementation Plan v0

Date: 2026-06-06

## Summary

Owner selected strategy B: clean reset.

This plan defines the follow-up implementation task for resetting app runtime/test data, regenerating app-owned secrets, filling plain config, preserving provider credentials, syncing local mirrors to Vercel, redeploying fail-closed, and rerunning validation gates.

No env values were changed. No Vercel env was changed. No DB data was cleared. No runtime, payment, Email, or LINE operation was run.

## Strategy B Assumptions

Accepted:

- Staging affected runtime/test data can be cleared.
- Production affected runtime/test data can be cleared.
- Existing production payment smoke records are owner-test records and may be removed.
- Clean environment ownership and future migration clarity are more important than preserving current test/payment artifacts.
- App runtime should be reset to a clean, reproducible state.

Not included:

- Dropping schemas.
- Deleting migrations.
- Deleting static source/config/docs/design assets.
- Rotating provider-issued credentials.
- Changing production runtime gate posture.

This is a runtime/test-row reset plus env ownership cleanup, not a schema reset.

## Current Table Inventory

Read-only aggregate counts were collected from staging and production using local mirror `DATABASE_URL` values. No row values or connection details were printed.

| Table | Purpose | Staging count | Production count | Recommended action | Dependency notes |
| --- | --- | ---: | ---: | --- | --- |
| `analysis_paid_results` | paid result rows | 191 | 11 | clear | child of `analysis_results` and `unlock_intents` |
| `analysis_requests` | free analysis request records | 284 | 29 | needs owner decision; recommend clear for full reset | parent of `analysis_results`, `payment_intents`, `entitlements` |
| `analysis_results` | free result records and cache-linked result data | 270 | 25 | needs owner decision; recommend clear for full reset | parent of payment/access/contact/result rows |
| `contact_submissions` | support/contact form submissions | 12 | 3 | needs owner decision; recommend clear if all owner-test | child of `analysis_results` / `unlock_intents` |
| `entitlements` | paid entitlement state | 161 | 2 | clear | child of payment/result/job/unlock rows |
| `events` | app event logs | 1598 | 216 | needs owner decision; recommend clear for clean test reset | likely standalone log table |
| `generation_jobs` | paid generation jobs | 150 | 2 | clear | parent of `entitlements` |
| `line_webhook_events` | LINE webhook event audit/dedupe | 3 | 1 | needs owner decision; recommend clear for clean reset | provider audit/history; external LINE history unaffected |
| `line_webhook_rate_limits` | LINE webhook rate-limit state | 0 | 0 | clear | ephemeral runtime state |
| `paid_result_access_links` | `pal_` access-link rows | 31 | 3 | clear | depends on entitlements/payment/contact/result rows |
| `payment_access_link_contact_secrets` | encrypted LINE recipient secrets | 1 | 3 | clear | child of `payment_access_link_contacts` |
| `payment_access_link_contacts` | saved Email/LINE contact rows | 2 | 8 | clear | parent of contact secrets and access links |
| `payment_intents` | payment intent/provider state | 312 | 6 | clear | parent of entitlements/access-link/contact rows |
| `sessions` | session/pending handoff runtime state | 315 | 42 | clear | runtime/session data |
| `unlock_intents` | free-to-paid unlock intent records | 139 | 23 | clear | parent/linked payment and paid-result state |

Counts:

- Clear: 10
- Preserve: 0 runtime tables
- Needs owner decision: 5

Dependency-safe clear order for apply task:

1. `payment_access_link_contact_secrets`
2. `paid_result_access_links`
3. `payment_access_link_contacts`
4. `entitlements`
5. `analysis_paid_results`
6. `payment_intents`
7. `generation_jobs`
8. `unlock_intents`
9. `sessions`
10. `line_webhook_rate_limits`
11. optional decision tables: `contact_submissions`, `line_webhook_events`, `events`, `analysis_results`, `analysis_requests`

If using `TRUNCATE`, the apply task can use dependency-safe `TRUNCATE ... RESTART IDENTITY CASCADE` only after explicitly enumerating tables and confirming no schema/static tables are included. If using `DELETE`, use the order above.

## Preserve Scope

Preserve:

- schema migrations
- static module definitions/config
- legal/refund/support content
- design archive docs
- source code
- theme architecture archive
- Vercel project/alias configuration
- provider-issued credentials
- Neon branches and schemas

## Owner-Fill / Preserve Provider Keys

Owner/provider/DB values that Codex must not generate:

| Key | Staging required | Production required | Type | Source | Current key-name status |
| --- | --- | --- | --- | --- | --- |
| `DATABASE_URL` | yes | yes | database_url | owner/Neon trusted source | local mirror and Vercel key names present |
| `ANTHROPIC_API_KEY` | yes if Anthropic active | yes if Anthropic active | provider_credential | owner/provider | local mirror and Vercel key names present |
| `OPENAI_API_KEY` | only if OpenAI active | only if OpenAI active | provider_credential | owner/provider | example/source only unless OpenAI becomes active |
| `RESEND_API_KEY` | yes for real Email | yes for real Email | provider_credential | owner/provider | local mirror and Vercel key names present |
| `NEWEBPAY_MERCHANT_ID` | yes | yes | provider_credential | owner/NewebPay | local mirror and Vercel key names present |
| `NEWEBPAY_HASH_KEY` | yes | yes | provider_credential | owner/NewebPay | local mirror and Vercel key names present |
| `NEWEBPAY_HASH_IV` | yes | yes | provider_credential | owner/NewebPay | local mirror and Vercel key names present |
| `LINE_CHANNEL_ACCESS_TOKEN` | yes for LINE send/webhook | yes for LINE send/webhook | provider_credential | owner/LINE Developers | local mirror and Vercel key names present |
| `LINE_CHANNEL_SECRET` | yes for LINE webhook | yes for LINE webhook | provider_credential | owner/LINE Developers | local mirror and Vercel key names present |
| `LINE_MESSAGING_CHANNEL_ACCESS_TOKEN` | optional alias | optional alias | provider_credential | owner/LINE Developers | source fallback/example; recommend not canonical |

Owner-confirmed public/provider config:

| Key | Staging required | Production required | Type | Source | Notes |
| --- | --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_LINE_LIFF_URL` | yes | yes | public-provider-config | owner/LINE Developers console | primary LIFF source |
| `NEXT_PUBLIC_LINE_LIFF_ID` | compatibility | compatibility | public-provider-config | derived or owner-confirmed | can be derived from LIFF URL if policy allows |
| `LINE_LOGIN_CHANNEL_ID` | optional | optional | public-provider-config | owner/LINE Developers | explicit override only if needed |
| `NEXT_PUBLIC_LINE_ADD_URL` | yes if shown | yes if shown | public-provider-config | owner/LINE OA | public URL; no secret |

## Codex-Fill Plain Config / Flags

Codex should fill these in local mirrors according to policy, then sync to matching Vercel envs if needed. Values are not listed in this plan.

| Key | Staging category | Production category | Production default | Sync to Vercel | Redeploy required |
| --- | --- | --- | --- | --- | --- |
| `ENABLE_PAYMENT_RUNTIME` | usually disabled unless explicit smoke | disabled/fail-closed | disabled | yes if present/changed | yes |
| `ENABLE_NEWEBPAY_CHECKOUT` | enabled only for staging validation/smoke | disabled/fail-closed | disabled | yes | yes |
| `ENABLE_PAID_GENERATION_JOBS` | enabled if direct generation path used | policy-controlled | disabled while frozen | yes | yes |
| `ENABLE_PAID_GENERATION_PROCESSOR` | enabled for processor validation | disabled while frozen, enabled only for smoke/ops plan | disabled | yes | yes |
| `ENABLE_PAID_JOB_QUEUE_TRIGGER` | enabled for staging queue validation | disabled while frozen, enabled only for smoke/ops plan | disabled | yes | yes |
| `ENABLE_OPERATOR_RECOVERY_LINK_SMOKE` | enabled for staging suite | absent/disabled | disabled | yes | yes |
| `ENABLE_OPERATOR_EMAIL_RECOVERY_SMOKE` | owner-approved channel smoke only | absent/disabled | disabled | yes | yes |
| `ENABLE_OPERATOR_LINE_RECOVERY_SMOKE` | owner-approved channel smoke only | absent/disabled | disabled | yes | yes |
| `ENABLE_OPERATOR_FAKE_PAID_SUCCESS` | staging no-card validation | absent/disabled | disabled | yes | yes |
| `LINE_RECOVERY_MESSAGE_PROVIDER` | real or noop by validation mode | real provider for smoke if enabled | real provider only after gate | yes | yes |
| `EMAIL_PROVIDER` | resend/noop by validation mode | resend for real delivery | resend when smoke-ready | yes | yes |
| `EMAIL_FROM` | approved sender | approved sender | approved sender | yes | yes |
| `MODEL_STRATEGY` | runtime model policy | runtime model policy | approved default | yes | yes |
| `ORADAR_PROVIDER` | active AI provider | active AI provider | approved provider | yes | yes |
| `ANTHROPIC_MODEL` | active model | active model | approved model | yes | yes |
| `ANTHROPIC_FAST_MODEL` | if guarded strategy | if guarded strategy | only if strategy uses it | yes if used | yes |
| `ANTHROPIC_FALLBACK_MODEL` | if guarded strategy | if guarded strategy | only if strategy uses it | yes if used | yes |
| `NEWEBPAY_CHECKOUT_URL` | sandbox/staging provider endpoint | production provider endpoint | production endpoint | yes | yes |
| `NEWEBPAY_ENVIRONMENT` | sandbox/staging label | production label | production | yes | yes |
| `NEWEBPAY_NOTIFY_URL` | staging NotifyURL | production NotifyURL | production URL | yes | yes |
| `PAID_JOB_QUEUE_PROVIDER` | queue provider policy | queue provider policy | approved provider | yes | yes |
| `PAID_JOB_QUEUE_TOPIC` | queue topic policy | queue topic policy | approved topic | yes | yes |
| `NEXT_PUBLIC_APP_URL` | staging URL | production URL | production URL | yes | yes |
| `ANALYSIS_GLOBAL_DAILY_LIMIT` | numeric policy | numeric policy | production limit | yes | yes |
| `ANALYSIS_IP_HOURLY_LIMIT` | numeric policy | numeric policy | production limit | yes | yes |
| `ANALYSIS_SESSION_DAILY_LIMIT` | numeric policy | numeric policy | production limit | yes | yes |

## Codex-Generated Keys After Reset

Do not generate during this plan. Generate only in the apply task after data reset prerequisites are satisfied.

| Key | Active usage | Affected data if changed | Reset prerequisite | Staging | Production | Rename later |
| --- | --- | --- | --- | --- | --- | --- |
| `ANALYSIS_CACHE_HASH_SECRET` | analysis cache HMAC | analysis cache reuse keys | clear/invalidate analysis cache/result artifacts | yes | yes | no |
| `PAYMENT_CHECKOUT_SESSION_SECRET` | signs `pcs_` sessions | active checkout/ReturnURL sessions | clear/expire sessions and pending checkout handoffs | yes | yes | no |
| `PAID_ACCESS_TOKEN_HASH_SECRET` | hashes `pa_` paid access tokens | entitlements/paid access token hashes | clear paid access/entitlement test rows | yes | yes | no |
| `PAYMENT_RECOVERY_LINK_TOKEN_SECRET` | hashes `pal_` access links | `paid_result_access_links` | clear access-link rows | yes | yes | yes, to access-link terminology |
| `PAYMENT_RECOVERY_CONTACT_HASH_SECRET` | hashes saved contacts and LINE bind state | `payment_access_link_contacts`, bind state | clear contacts/contact secrets | yes | yes | yes |
| `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY` | encrypts contact data | encrypted contact fields | clear contacts/contact secrets | yes | yes | yes |
| `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY` | encrypts LINE recipient secret | `payment_access_link_contact_secrets` | clear contact secret rows | yes | yes | yes |
| `CRON_SECRET` | cron auth | none persistent | no data reset required | yes | yes | no |
| `INTERNAL_JOB_SECRET` | internal processor auth | none persistent | no data reset required | yes | yes | no |
| `ADMIN_API_TOKEN` | Admin API auth | none persistent | no data reset required | yes | production only if owner approves production read-only admin ops | no |
| `OPERATOR_TEST_SECRET` | staging operator smoke auth | none persistent | no data reset required | staging yes | production no/absent unless explicitly needed | no |
| `RETENTION_CLEANUP_SECRET` | optional retention cleanup auth | none persistent | no data reset required | optional | optional | no |

Staging and production generated values must be different.

Procedure rule:

1. write local mirror first
2. sync to matching Vercel environment second
3. never print values or value-derived metadata

## Keys To Remove / Deprecate

| Key / group | Action | Timing | Reason |
| --- | --- | --- | --- |
| `SUPPORT_OPS_DATABASE_URL` | remove/deprecate | apply task or cleanup task | direct DB support lookup is no longer target ops path |
| `SUPPORT_OPS_ALLOW_DATABASE_URL_FALLBACK` | remove/deprecate | apply task or cleanup task | legacy direct DB support |
| `SUPPORT_LOOKUP_ALLOW_PRODUCTION_READONLY` | remove/deprecate | apply task or cleanup task | legacy direct DB support |
| `SUPPORT_LOOKUP_DISABLE_LOCAL_ENV` | remove/deprecate | apply task or cleanup task | legacy direct DB support |
| `SUPPORT_LOOKUP_TARGET` | remove/deprecate | apply task or cleanup task | legacy direct DB support |
| `LINE_MESSAGING_CHANNEL_ACCESS_TOKEN` | keep compatibility | after production smoke | duplicate fallback alias; choose canonical later |
| `ENABLE_OPERATOR_*_SMOKE` | keep through staging/prod gate | after production smoke or channel suite | still supports release validation |
| recovery-named env vars | keep compatibility | rename later | active runtime still uses these names |
| `FULFILLMENT_TOKEN_SECRET` | keep compatibility or remove after audit | separate cleanup | legacy LINE fulfillment helper |

## v2 Apply Sequence

### A. Freeze verification

- Confirm production public pages live.
- Confirm production checkout/fake-paid/operator routes fail closed.
- Confirm production runtime remains disabled.
- Confirm no payment, Email, or LINE operation is running.

### B. Backup / aggregate snapshot

- Capture aggregate table counts only for staging and production.
- Optionally create Neon branch snapshots/restore points if available.
- Do not export raw rows or private data.

### C. Clear data

- Clear staging reset-scope tables.
- Clear production reset-scope tables.
- Preserve schema/static tables.
- Use dependency-safe order or explicit `TRUNCATE ... RESTART IDENTITY CASCADE` on the approved table list.
- Record aggregate counts before and after.

### D. Generate app-owned secrets

- Generate app-owned secrets in local mirrors first.
- Annotate generated lines with date and environment.
- Sync to corresponding Vercel env.
- Ensure staging and production values differ.
- Do not print values or value-derived metadata.

### E. Fill plain config / flags

- Write explicit policy values to `.env.staging` and `.env.production`.
- Sync to Vercel if required.
- Production runtime and checkout remain disabled/fail-closed.

### F. Owner-fill provider/DB credentials

- Owner provides/preserves provider credentials and DB URLs from trusted sources.
- Codex verifies key presence and non-empty shape only.
- Do not print values.

### G. Redeploy

- Redeploy Preview(staging) after env changes.
- Redeploy Production fail-closed after env changes.
- Production runtime remains disabled.

### H. Run validation

Run:

```bash
cd apps/web && corepack pnpm run qa:module01:local
cd apps/web && corepack pnpm run qa:module01:staging
cd apps/web && corepack pnpm run qa:module01:production-preflight
```

Expected:

- local pass
- staging pass
- production preflight returns `pass_ready_for_controlled_smoke`

### I. Result

Only after production preflight passes can the owner decide to resume Controlled Production Payment Smoke v1.

## Risk / Rollback Notes

- Clearing production owner-test records removes previous payment smoke artifacts from the app DB.
- NewebPay external merchant/payment history is not controlled by app DB reset.
- Provider credentials are not rotated by the reset.
- App-owned stateful secrets are regenerated only because affected app rows are cleared.
- Old Admin API lookups for previous owner-test result IDs may return not found after reset.
- Old `/r/` links, `pa_` tokens, and `pcs_` sessions will no longer work after reset/regeneration.
- Future production smoke will create fresh records.
- If reset fails mid-way, use Neon restore/snapshot if created; otherwise keep production frozen and do not enable runtime.

## Theme Route Preservation

Theme Architecture remains preserved and outside this plan:

- Theme Architecture assets are archived.
- Hybrid Theme Park Model adopted.
- Module 01 Riso-only adopted.
- Module Theme Architecture Implementation Plan v0 remains future work.

## Validation For This Plan

Docs-only validation:

- docs presence check
- dashboard HTML sanity
- secret/private scan
- `git diff --check`

No code, env, DB, or runtime validation was required because this plan made no operational changes.

## Recommended Next Task

Env Mirror Strategy v2 Apply / Clean Reset v0.

The apply task should execute this plan with explicit freeze checks, aggregate snapshots, table reset, local-mirror-first secret generation/config fill, Vercel sync, fail-closed redeploys, and Module 01 gate validation.
