# Env Mirror Final Verification + Cleanup v0

Date: 2026-06-06

## Status

PASS.

Owner filled the ignored staging and production local env mirrors. Both mirrors were cleaned, shape-verified, synced to Vercel, redeployed, and validated. Module 01 local, staging, and production preflight gates now pass. Production remains frozen/fail-closed.

No production runtime was enabled. No production checkout was enabled. No production payment, Email, or LINE message was sent.

## Why Staging Previously Passed Despite `.env.staging` Gaps

`qa:module01:staging` primarily validated hosted Preview(staging) runtime behavior:

- `staging_health` called `https://staging.anyu.tw/api/health`.
- `qa:access-link:smoke` hit deployed Preview runtime endpoints.
- `qa:result-checkout:no-card` hit deployed Preview runtime endpoints.
- Admin API and Admin CLI checks called hosted `https://staging.anyu.tw/api/admin/paid-results/[resultId]`.

The staging suite loaded local `.env.staging` indirectly for operator/test secrets used by the local runner, but it did not previously perform a full local staging mirror shape gate. Therefore Vercel Preview(staging) could already have usable host env values while the local mirror remained incomplete.

This task closes the gap by adding `stagingEnvMirror` to `qa:module01:staging`. The check verifies required local staging mirror key presence, non-empty shape, placeholder rejection, and duplicate-key rejection without printing values.

## Env Mirror Cleanup

Ignored files cleaned:

- `apps/web/.env.staging`
- `apps/web/.env.production`

Cleanup result:

- Values preserved.
- Per-key history annotations removed.
- Block-level comments retained.
- Duplicate keys removed/avoided.
- Active keys sorted into consistent sections.
- Active recovery-named keys retained for compatibility.
- Env files remain gitignored and were not committed.

Key counts after cleanup:

- `.env.staging`: 44 active keys.
- `.env.production`: 38 active keys.

Local mirror shape:

- `.env.staging`: `pass_mirror_shape`.
- `.env.production`: `pass_mirror_shape`.

## Vercel Sync

Local mirrors were treated as source-of-record and synced to matching runtime targets. Values were passed via stdin and were not printed.

Preview(staging) sync:

- `ADMIN_API_TOKEN`
- `ANALYSIS_CACHE_HASH_SECRET`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`
- `CRON_SECRET`
- `DATABASE_URL`
- `EMAIL_FROM`
- `EMAIL_PROVIDER`
- `EMAIL_RECOVERY_TEST_RECIPIENT`
- `ENABLE_NEWEBPAY_CHECKOUT`
- `ENABLE_OPERATOR_EMAIL_RECOVERY_SMOKE`
- `ENABLE_OPERATOR_FAKE_PAID_SUCCESS`
- `ENABLE_OPERATOR_LINE_RECOVERY_SMOKE`
- `ENABLE_OPERATOR_RECOVERY_LINK_SMOKE`
- `ENABLE_PAID_GENERATION_JOBS`
- `ENABLE_PAID_GENERATION_PROCESSOR`
- `ENABLE_PAID_JOB_QUEUE_TRIGGER`
- `ENABLE_PAYMENT_RUNTIME`
- `INTERNAL_JOB_SECRET`
- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_CHANNEL_SECRET`
- `LINE_RECOVERY_MESSAGE_PROVIDER`
- `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`
- `MODEL_STRATEGY`
- `NEWEBPAY_CHECKOUT_URL`
- `NEWEBPAY_ENVIRONMENT`
- `NEWEBPAY_HASH_IV`
- `NEWEBPAY_HASH_KEY`
- `NEWEBPAY_MERCHANT_ID`
- `NEWEBPAY_NOTIFY_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_LINE_ADD_URL`
- `NEXT_PUBLIC_LINE_LIFF_ID`
- `NEXT_PUBLIC_LINE_LIFF_URL`
- `OPERATOR_TEST_SECRET`
- `ORADAR_PROVIDER`
- `PAID_ACCESS_TOKEN_HASH_SECRET`
- `PAID_JOB_QUEUE_PROVIDER`
- `PAID_JOB_QUEUE_TOPIC`
- `PAYMENT_CHECKOUT_SESSION_SECRET`
- `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY`
- `PAYMENT_RECOVERY_CONTACT_HASH_SECRET`
- `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`
- `RESEND_API_KEY`

Production sync:

- `ADMIN_API_TOKEN`
- `ANALYSIS_CACHE_HASH_SECRET`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`
- `CRON_SECRET`
- `DATABASE_URL`
- `EMAIL_FROM`
- `EMAIL_PROVIDER`
- `ENABLE_NEWEBPAY_CHECKOUT`
- `ENABLE_PAID_GENERATION_JOBS`
- `ENABLE_PAID_GENERATION_PROCESSOR`
- `ENABLE_PAID_JOB_QUEUE_TRIGGER`
- `ENABLE_PAYMENT_RUNTIME`
- `INTERNAL_JOB_SECRET`
- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_CHANNEL_SECRET`
- `LINE_RECOVERY_MESSAGE_PROVIDER`
- `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`
- `MODEL_STRATEGY`
- `NEWEBPAY_CHECKOUT_URL`
- `NEWEBPAY_ENVIRONMENT`
- `NEWEBPAY_HASH_IV`
- `NEWEBPAY_HASH_KEY`
- `NEWEBPAY_MERCHANT_ID`
- `NEWEBPAY_NOTIFY_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_LINE_ADD_URL`
- `NEXT_PUBLIC_LINE_LIFF_ID`
- `NEXT_PUBLIC_LINE_LIFF_URL`
- `ORADAR_PROVIDER`
- `PAID_ACCESS_TOKEN_HASH_SECRET`
- `PAID_JOB_QUEUE_PROVIDER`
- `PAID_JOB_QUEUE_TOPIC`
- `PAYMENT_CHECKOUT_SESSION_SECRET`
- `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY`
- `PAYMENT_RECOVERY_CONTACT_HASH_SECRET`
- `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`
- `RESEND_API_KEY`

Final sync result:

- Total key updates: 82.
- Passed: 82.
- Failed: 0.

Implementation note: an initial sync attempt sent quoted env-file values literally to Vercel, causing staging AI provider calls to fail with `provider_error`. A corrected quote-stripping sync was run, followed by redeploys; staging no-card QA then passed.

## Redeploy Result

Preview(staging):

- Deployment ready: `dpl_DNgNe3Y1zm8QxxMGQmWEuZspwHuR`.
- Staging health reports `environment=preview`, `gitBranch=staging`, and expected route bundle.

Production:

- Deployment ready: `dpl_DZmtRPiN5e4ZroozX2JCdXUGXiXy`.
- Aliased to `https://anyu.tw`.
- Production runtime and checkout remain disabled/fail-closed.

## Validation

| Check | Result |
|---|---|
| Targeted `module01-release-validation-suite` test | PASS |
| `corepack pnpm lint` | PASS |
| `corepack pnpm test` | PASS |
| `corepack pnpm build` | PASS |
| `qa:module01:local` | PASS |
| `qa:module01:staging` | PASS |
| `qa:module01:production-preflight` | PASS |

`qa:module01:staging` now includes:

- `stagingEnvMirror=pass`
- `adminApiLookup=pass`
- `adminCliLookup=pass`

`qa:module01:production-preflight` returned:

- `pass_ready_for_controlled_smoke`

Production safety remained:

- Public pages live.
- Checkout route fail-closed.
- Fake-paid/operator routes fail-closed.
- No runtime enablement.

## Theme Route Preservation

Theme Architecture remains archived and preserved:

- Hybrid Theme Park Model adopted.
- Module 01 = Riso-only adopted.
- Core Shell = neutral editorial adopted.
- Module Theme Architecture Implementation Plan v0 remains future track.

No theme runtime implementation was performed.

## Tech Debt Review

New technical debt introduced:

- None.

Existing technical debt observed:

- Active recovery-named env keys remain for compatibility.
- `qa:module01:staging` still uses an externally supplied known result ID for Admin API/CLI lookup.

Opportunistic cleanup completed:

- Added local staging mirror shape gate to the reusable staging suite.
- Cleaned ignored env mirror formatting.
- Corrected Vercel sync handling for quoted env-file values.

Deferred cleanup candidates:

- Rename active recovery env keys after the production payment gate.
- Add suite-native current-result ID handoff for Admin lookup.

## Recommended Next Step

Controlled Production Payment Smoke v1 Clean Retry, only after explicit owner approval to temporarily enable production runtime/checkout for the controlled smoke window.
