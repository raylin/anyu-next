# Production Gate Hardening v0

## Date

2026-06-06

## Final Status

BLOCKED for Controlled Production Payment Smoke v1.

The hardening itself was implemented and tested. The hardened production preflight now correctly blocks because `apps/web/.env.production` is missing critical production mirror entries required to verify local value shape before smoke readiness.

No env values were changed.

## Production Freeze Result

- Production public pages remain live.
- Production checkout remains fail-closed.
- Production fake-paid/operator routes remain fail-closed.
- Production runtime was not enabled.
- No production payment was run.
- No production Email or LINE message was sent.

The production checks were read-only.

## Critical Env List Derived From Source

Derived from payment checkout, NotifyURL/ReturnURL, processor routes, queue helpers, AI provider runtime, access-link delivery, Email/LINE senders, and Admin API code.

Categories checked:

- NewebPay provider config:
  - `NEWEBPAY_MERCHANT_ID`
  - `NEWEBPAY_HASH_KEY`
  - `NEWEBPAY_HASH_IV`
  - `NEWEBPAY_CHECKOUT_URL`
  - `NEWEBPAY_NOTIFY_URL`
  - `NEWEBPAY_ENVIRONMENT`
  - `NEXT_PUBLIC_APP_URL`
- Runtime flags:
  - `ENABLE_PAYMENT_RUNTIME`
  - `ENABLE_NEWEBPAY_CHECKOUT`
  - `ENABLE_PAID_JOB_QUEUE_TRIGGER`
  - `ENABLE_PAID_GENERATION_PROCESSOR`
- Checkout/session:
  - `PAYMENT_CHECKOUT_SESSION_SECRET`
- Paid access:
  - `PAID_ACCESS_TOKEN_HASH_SECRET`
- Queue:
  - `PAID_JOB_QUEUE_PROVIDER`
  - `PAID_JOB_QUEUE_TOPIC`
- Processor/auth:
  - `ENABLE_PAID_GENERATION_PROCESSOR`
  - `INTERNAL_JOB_SECRET`
  - `CRON_SECRET`
- AI provider:
  - one of `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`
- Access-link crypto:
  - `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`
  - `PAYMENT_RECOVERY_CONTACT_HASH_SECRET`
  - `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY`
  - `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`
- Email provider:
  - `EMAIL_PROVIDER`
  - `EMAIL_FROM`
  - `RESEND_API_KEY`
- LINE provider / LIFF:
  - `LINE_RECOVERY_MESSAGE_PROVIDER`
  - `NEXT_PUBLIC_LINE_LIFF_URL`
  - one of `LINE_MESSAGING_CHANNEL_ACCESS_TOKEN` or `LINE_CHANNEL_ACCESS_TOKEN`
  - `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`
- Database:
  - `DATABASE_URL`
- Admin API:
  - `ADMIN_API_TOKEN` is tracked as ops-readiness, but not required for payment smoke readiness.

## Empty-Secret Hardening Result

Implemented:

- local production mirror shape checks for critical secrets in `apps/web/.env.production`
- non-empty-after-trim validation
- placeholder rejection for obvious labels such as `TODO`, `CHANGE_ME`, `placeholder`, `dummy`, `example`, and similar values
- separate any-of validation for LINE provider token and AI provider token
- output categories:
  - `missing_env_name`
  - `empty_local_mirror_secret`
  - `placeholder_local_mirror_secret`
  - `host_value_shape_unverified`
  - `pass_mirror_shape`
- no values, lengths, prefixes, suffixes, hashes, or checksums printed

Current hardened preflight result:

- `qa:module01:production-preflight`: blocked
- readiness: `blocked_missing_local_mirror_secret`

Missing local production mirror entries reported by name only:

- `PAYMENT_CHECKOUT_SESSION_SECRET`
- `PAID_ACCESS_TOKEN_HASH_SECRET`
- `INTERNAL_JOB_SECRET`
- `CRON_SECRET`
- `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`
- `PAYMENT_RECOVERY_CONTACT_HASH_SECRET`
- `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY`
- `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`
- LINE channel access token any-of group

Vercel Production env-name presence is separate from local mirror shape. The Vercel host value shape remains `host_value_shape_unverified` because sensitive Vercel values are not readable safely.

## Processor Readiness Result

Source inspection:

- `/api/cron/paid-generation` requires `CRON_SECRET` and `ENABLE_PAID_GENERATION_PROCESSOR`.
- `/api/internal/jobs/process` requires `INTERNAL_JOB_SECRET` or `CRON_SECRET`, plus `ENABLE_PAID_GENERATION_PROCESSOR`.
- Paid generation requires an AI provider credential path.

Hardened preflight now requires:

- `CRON_SECRET`
- `INTERNAL_JOB_SECRET`
- `ENABLE_PAID_GENERATION_PROCESSOR`
- one AI provider token name

Current Vercel Production host names are present for processor auth, but local mirror shape is incomplete, so smoke readiness remains blocked.

## Vercel Canonical Deploy Guard Result

Implemented/hardened:

- canonical project name expectation: `anyu-next`
- canonical root directory expectation: `apps/web`
- root `.vercel/project.json` must point to canonical project
- `apps/web/.vercel/project.json` must remain absent or not introduce an app-level project target
- project mismatch blocks readiness
- app-level Vercel project file recurrence blocks readiness

Current read-only result:

- root project link: canonical
- apps/web project link: absent
- local project link guard: pass

Alias target inspection remains a local-guard boundary in v0. Production health and fail-closed route checks still verify the live public target behavior. If deeper alias-to-project proof is required, add a separate Vercel alias inspection helper before smoke.

## Runtime Config-Shape Check Decision

No runtime config-shape endpoint was added in v0.

Reason:

- a safe endpoint would require explicit admin-auth deployment and production runtime surface review
- local mirror shape plus Vercel host env-name presence is the safer v0 boundary
- host sensitive value shape is reported as `host_value_shape_unverified`, not silently passed

## Env Reconciliation Performed

None.

No local env files were modified.
No Vercel env values were modified.
No production redeploy was performed.

## Module Validation Gate Results

| Gate | Result | Notes |
| --- | --- | --- |
| `qa:module01:local` | pass | lint, targeted tests, full tests, build |
| `qa:module01:staging` | pass | no real Email/LINE sends |
| `qa:module01:production-preflight` | blocked | `blocked_missing_local_mirror_secret` |

Additional validation:

- lint: pass
- targeted production preflight tests: pass
- full tests: pass
- build: pass

## Theme Route Preservation

Theme Architecture remains archived and adopted as visual architecture reference.

This task did not implement theme UI and does not supersede the theme track. Module 01 Riso unification remains the next design implementation track after payment gate work, or whenever the owner chooses.

## Blockers

Before Controlled Production Payment Smoke v1:

1. Reconcile `apps/web/.env.production` with Vercel Production for the missing critical mirror keys.
2. Do not print or commit values.
3. Rerun `qa:module01:production-preflight`.
4. Proceed only after the hardened preflight returns `pass_ready_for_controlled_smoke`.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: Vercel alias-to-project proof remains indirect in v0.
- Opportunistic cleanup completed: preflight now distinguishes local mirror value shape, host name presence, and host value-shape-unverified state.
- Deferred cleanup candidates: optional Admin-authenticated runtime config-shape endpoint or Vercel alias inspection helper.

## Suggested Next Steps

Resolve the production gate blocker by reconciling the local production env mirror with required critical keys, then rerun the hardened production preflight.
