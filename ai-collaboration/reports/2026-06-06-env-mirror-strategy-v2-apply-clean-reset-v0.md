# Env Mirror Strategy v2 Apply / Clean Reset v0

Date: 2026-06-06

## Status

PARTIAL / BLOCKED FOR PRODUCTION SMOKE.

Strategy B clean reset was applied. Staging and production runtime/test rows were cleared, app-owned internal/stateful secrets were regenerated local-mirror-first and synced to the matching Vercel environment, and both environments were redeployed. Module 01 local and staging gates pass. Hardened production preflight remains blocked only on the owner-fill LINE provider token in the local production mirror.

No production runtime was enabled. No production checkout was opened. No payment, Email, or LINE message was sent.

## Production Freeze Precheck

Production was checked before changes and again during validation:

- Public `/`, `/refund`, and `/legal`: live.
- Production checkout route: fail-closed.
- Production fake-paid/operator routes: fail-closed.
- `ENABLE_PAYMENT_RUNTIME`: disabled.
- `ENABLE_NEWEBPAY_CHECKOUT`: disabled.
- No production payment was running or initiated.
- No production Email/LINE send was triggered.

## Reset Scope

Owner approved clearing both the 10 direct-clear tables and the 5 decision tables recommended for full reset. Schema, migrations, source-managed files, legal/support content, and design archives were preserved.

Tables cleared in staging and production:

| Table | Staging Before | Staging After Reset | Production Before | Production After Reset | Action |
|---|---:|---:|---:|---:|---|
| `payment_access_link_contact_secrets` | 1 | 0 | 3 | 0 | clear |
| `paid_result_access_links` | 31 | 0 | 3 | 0 | clear |
| `payment_access_link_contacts` | 2 | 0 | 8 | 0 | clear |
| `entitlements` | 161 | 0 | 2 | 0 | clear |
| `analysis_paid_results` | 191 | 0 | 11 | 0 | clear |
| `payment_intents` | 312 | 0 | 6 | 0 | clear |
| `generation_jobs` | 150 | 0 | 2 | 0 | clear |
| `unlock_intents` | 139 | 0 | 23 | 0 | clear |
| `sessions` | 315 | 0 | 42 | 0 | clear |
| `line_webhook_rate_limits` | 0 | 0 | 0 | 0 | clear |
| `contact_submissions` | 12 | 0 | 3 | 0 | clear |
| `line_webhook_events` | 3 | 0 | 1 | 0 | clear |
| `events` | 1598 | 0 | 216 | 0 | clear |
| `analysis_results` | 270 | 0 | 25 | 0 | clear |
| `analysis_requests` | 284 | 0 | 29 | 0 | clear |

Post-validation note: staging safe QA repopulated expected test rows after the reset. Production remained at zero for all reset-scope tables after validation.

## Generated Keys

Generated fresh app-owned values after the reset. Values were written to the local mirror first, then synced to Vercel. Staging and production values are different. No values or value-derived metadata are recorded here.

Preview(staging):

- `ADMIN_API_TOKEN`
- `ANALYSIS_CACHE_HASH_SECRET`
- `CRON_SECRET`
- `INTERNAL_JOB_SECRET`
- `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`
- `OPERATOR_TEST_SECRET`
- `PAID_ACCESS_TOKEN_HASH_SECRET`
- `PAYMENT_CHECKOUT_SESSION_SECRET`
- `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY`
- `PAYMENT_RECOVERY_CONTACT_HASH_SECRET`
- `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`

Production:

- `ADMIN_API_TOKEN`
- `ANALYSIS_CACHE_HASH_SECRET`
- `CRON_SECRET`
- `INTERNAL_JOB_SECRET`
- `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`
- `PAID_ACCESS_TOKEN_HASH_SECRET`
- `PAYMENT_CHECKOUT_SESSION_SECRET`
- `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY`
- `PAYMENT_RECOVERY_CONTACT_HASH_SECRET`
- `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`

## Config / Flag Keys Set

Codex set active plain config and runtime flags in the ignored local mirrors and synced non-empty values to matching Vercel targets.

Preview(staging):

- `ANTHROPIC_MODEL`
- `EMAIL_FROM`
- `EMAIL_PROVIDER`
- `ENABLE_NEWEBPAY_CHECKOUT`
- `ENABLE_OPERATOR_EMAIL_RECOVERY_SMOKE`
- `ENABLE_OPERATOR_FAKE_PAID_SUCCESS`
- `ENABLE_OPERATOR_LINE_RECOVERY_SMOKE`
- `ENABLE_OPERATOR_RECOVERY_LINK_SMOKE`
- `ENABLE_PAID_GENERATION_JOBS`
- `ENABLE_PAID_GENERATION_PROCESSOR`
- `ENABLE_PAID_JOB_QUEUE_TRIGGER`
- `ENABLE_PAYMENT_RUNTIME`
- `LINE_RECOVERY_MESSAGE_PROVIDER`
- `MODEL_STRATEGY`
- `NEWEBPAY_CHECKOUT_URL`
- `NEWEBPAY_ENVIRONMENT`
- `NEWEBPAY_NOTIFY_URL`
- `NEXT_PUBLIC_APP_URL`
- `ORADAR_PROVIDER`
- `PAID_JOB_QUEUE_PROVIDER`
- `PAID_JOB_QUEUE_TOPIC`

Production:

- `ANTHROPIC_MODEL`
- `EMAIL_FROM`
- `EMAIL_PROVIDER`
- `ENABLE_NEWEBPAY_CHECKOUT`
- `ENABLE_PAID_GENERATION_JOBS`
- `ENABLE_PAID_GENERATION_PROCESSOR`
- `ENABLE_PAID_JOB_QUEUE_TRIGGER`
- `ENABLE_PAYMENT_RUNTIME`
- `LINE_RECOVERY_MESSAGE_PROVIDER`
- `MODEL_STRATEGY`
- `NEWEBPAY_CHECKOUT_URL`
- `NEWEBPAY_ENVIRONMENT`
- `NEWEBPAY_NOTIFY_URL`
- `NEXT_PUBLIC_APP_URL`
- `ORADAR_PROVIDER`
- `PAID_JOB_QUEUE_PROVIDER`
- `PAID_JOB_QUEUE_TOPIC`

## Preserved Provider / DB Keys

Existing non-empty local mirror values were preserved and synced where applicable by key name only. Values were not printed.

Preview(staging):

- `ANTHROPIC_API_KEY`
- `DATABASE_URL`
- `EMAIL_RECOVERY_TEST_RECIPIENT`
- `NEWEBPAY_HASH_IV`
- `NEWEBPAY_HASH_KEY`
- `NEWEBPAY_MERCHANT_ID`
- `NEXT_PUBLIC_LINE_ADD_URL`
- `RESEND_API_KEY`

Production:

- `ANTHROPIC_API_KEY`
- `DATABASE_URL`
- `NEWEBPAY_HASH_IV`
- `NEWEBPAY_HASH_KEY`
- `NEWEBPAY_MERCHANT_ID`
- `NEXT_PUBLIC_LINE_ADD_URL`
- `NEXT_PUBLIC_LINE_LIFF_ID`
- `NEXT_PUBLIC_LINE_LIFF_URL`
- `RESEND_API_KEY`

## Owner-Fill Remaining

Only true owner/provider blanks remain in local mirrors.

Preview(staging):

- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_CHANNEL_SECRET`
- `NEXT_PUBLIC_LINE_LIFF_ID`
- `NEXT_PUBLIC_LINE_LIFF_URL`

Production:

- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_CHANNEL_SECRET`

Production preflight currently blocks on the local mirror shape for `LINE_CHANNEL_ACCESS_TOKEN`. The Vercel key name is present, but hardened preflight requires the local production mirror to hold a non-empty usable owner-approved value before controlled smoke.

## Removed / Deprecated Mirror Entries

The rewritten ignored mirrors exclude the legacy/direct-support DB path and unused broad owner-fill entries. Active recovery-named env keys are retained only where source still uses them.

Removed or not carried forward as active mirror entries:

- `SUPPORT_OPS_DATABASE_URL`
- Direct DB support lookup env path
- Broad owner-fill placeholders for flags/plain config/internal auth
- Duplicate inactive LINE/provider aliases not selected as canonical
- Production operator smoke flags not required for production smoke

Retained active legacy names for compatibility:

- `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`
- `PAYMENT_RECOVERY_CONTACT_HASH_SECRET`
- `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY`
- `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`
- `LINE_RECOVERY_MESSAGE_PROVIDER`

These should be renamed later only after the payment gate.

## Vercel Sync

Vercel env sync was performed from local mirrors to matching host targets:

- Preview(staging): 40 key updates passed.
- Production: 36 key updates passed.
- Total: 76 passed, 0 failed.

Owner-fill blanks were not synced. No Vercel-only secrets were created.

## Redeploy Result

Preview(staging):

- Deployment completed.
- Ready deployment: `dpl_4GKW5eib1sTJyeYf5rWFmvjuAHpA`.
- Runtime health served `environment=preview`, `gitBranch=staging`, and expected route bundle during staging QA.

Production:

- Fail-closed production redeploy completed.
- Ready deployment: `dpl_Dwzcna6WSLBjPx85QMY6bZFMVraM`.
- Aliased to `https://anyu.tw`.
- Production runtime and checkout remain disabled.

## Validation Gates

| Gate | Result | Notes |
|---|---|---|
| `qa:module01:local` | PASS | Lint, targeted tests, full tests, and build passed. |
| `qa:module01:staging` | PASS | Access-link smoke, no-card checkout/result, Admin API lookup, and Admin CLI lookup passed. No real Email/LINE sent. |
| `qa:module01:production-preflight` | BLOCKED | Blocker is local production mirror `LINE_CHANNEL_ACCESS_TOKEN` empty. Production safety checks passed and routes remain fail-closed. |

Additional safe staging artifact setup:

- One staging no-card QA artifact was created after reset to provide a current Admin API/CLI lookup target.
- It did not send Email or LINE.
- No tokenized URLs were recorded.

## Production Preflight Blocker

Readiness category:

- `blocked_empty_local_mirror_secret`

Specific blocker:

- `line_channel_access_token`
- empty local production mirror key: `LINE_CHANNEL_ACCESS_TOKEN`

Not blocked:

- NewebPay provider key names and local mirror shape.
- Database key name and local mirror shape.
- AI provider key name and local mirror shape.
- Resend key name and local mirror shape.
- Payment/session/access-link app-owned crypto.
- `CRON_SECRET`.
- `INTERNAL_JOB_SECRET`.
- `ADMIN_API_TOKEN`.
- Processor readiness env names.
- Production fail-closed safety.

## Theme Route Preservation

Theme Architecture remains archived and preserved:

- Hybrid Theme Park Model adopted.
- Module 01 = Riso-only adopted.
- Core Shell = neutral editorial adopted.
- Shared Flow Templates = structure shared, module-themed.

This clean reset did not implement, alter, or discard runtime theme work. The future theme task remains Module Theme Architecture Implementation Plan v0 after the payment gate or owner decision.

## Tech Debt Review

New technical debt introduced:

- None in tracked code. Ignored env mirrors were rewritten and synced operationally.

Existing technical debt observed:

- Active recovery-named env keys remain for compatibility.
- `qa:module01:staging` still needs an explicit known result ID for Admin API/CLI lookup after DB reset.
- Production preflight host value shape is intentionally unverified for protected Vercel values; local mirror shape is the v0 verification boundary.

Opportunistic cleanup completed:

- Removed broad unused owner-fill mirror entries from ignored env mirrors.
- Replaced Vercel-only generated internal secrets with local-mirror-first generated values.

Deferred cleanup candidates:

- Rename active recovery-named envs to access-link names after payment gate.
- Add a suite-native way to persist a fresh safe Admin lookup result ID after staging reset.
- Implement `qa:module01:staging:channels` only with explicit owner approval.

## Recommended Next Step

Owner fills the listed LINE provider values in the ignored production mirror from a trusted provider source, then rerun an Env Mirror Final Verification / `qa:module01:production-preflight`.

Controlled Production Payment Smoke v1 Clean Retry should not resume until hardened production preflight returns `pass_ready_for_controlled_smoke`.
