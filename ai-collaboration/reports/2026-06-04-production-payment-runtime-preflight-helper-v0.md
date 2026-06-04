# Production Payment Runtime Preflight Helper v0

Date: 2026-06-04

## Completed Work

- Added a secret-safe local production payment runtime preflight command:
  - `cd apps/web && corepack pnpm run qa:production:payment-preflight -- --source vercel-production --mode dry-run`
- Added two preflight modes:
  - `dry-run`: expects production runtime to remain fail-closed while verifying dependency presence.
  - `smoke-ready`: verifies the same dependency categories before a controlled runtime-enable window; it does not enable flags.
- Added Vercel Production env-name metadata support.
- Added optional local/env-file mode for tests and local operator use.
- Added optional DB schema check support when an explicit local production preflight DB URL is provided.
- Added live production safety checks:
  - public pages
  - checkout fail-closed
  - fake-paid fail-closed
  - NotifyURL route reachability
  - ReturnURL route reachability
- Added targeted tests for the exact missing-env classes that caused Controlled Production Payment Smoke v0 to stall.

## Why This Was Needed

Controlled Production Payment Smoke v0 proved that NewebPay production payment truth worked, but the first delivery path stalled because preflight did not detect missing runtime dependencies:

- checkout session signing secret
- paid access token hash secret
- paid queue trigger flags/provider/topic
- paid generation processor flag

After those env names were added and the owner resent NotifyURL, production completed entitlement creation, generation, paid result persistence, and Email access-link provider acceptance. This helper turns those operational learnings into a repeatable gate before Controlled Production Payment Smoke v1.

## Command Added

```bash
cd apps/web && corepack pnpm run qa:production:payment-preflight -- --source vercel-production --mode dry-run
```

Useful variants:

```bash
cd apps/web && corepack pnpm run qa:production:payment-preflight -- --source vercel-production --mode smoke-ready
cd apps/web && corepack pnpm run qa:production:payment-preflight -- --source local --mode dry-run --skip-network
cd apps/web && corepack pnpm run qa:production:payment-preflight -- --source local --mode dry-run --check-db
```

The command prints sanitized JSON only.

## Env Categories Checked

Payment provider:

- `NEWEBPAY_MERCHANT_ID`
- `NEWEBPAY_HASH_KEY`
- `NEWEBPAY_HASH_IV`
- `NEWEBPAY_CHECKOUT_URL`
- `NEWEBPAY_NOTIFY_URL`
- `NEWEBPAY_ENVIRONMENT`
- `NEXT_PUBLIC_APP_URL`

Runtime flags:

- `ENABLE_PAYMENT_RUNTIME`
- `ENABLE_NEWEBPAY_CHECKOUT`
- `ENABLE_PAID_JOB_QUEUE_TRIGGER`
- `ENABLE_PAID_GENERATION_PROCESSOR`

Checkout/session:

- `PAYMENT_CHECKOUT_SESSION_SECRET`

Paid access:

- `PAID_ACCESS_TOKEN_HASH_SECRET`

Queue/processor:

- `PAID_JOB_QUEUE_PROVIDER`
- `PAID_JOB_QUEUE_TOPIC`
- `ENABLE_PAID_GENERATION_PROCESSOR`

Access-link:

- `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`
- `PAYMENT_RECOVERY_CONTACT_HASH_SECRET`
- `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY`
- `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`

Email:

- `EMAIL_PROVIDER`
- `EMAIL_FROM`
- `RESEND_API_KEY`

LINE:

- `LINE_RECOVERY_MESSAGE_PROVIDER`
- `NEXT_PUBLIC_LINE_LIFF_URL`
- one of `LINE_MESSAGING_CHANNEL_ACCESS_TOKEN` or `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`

Database:

- `DATABASE_URL` presence by env metadata
- optional schema verification when a safe local DB URL is explicitly provided

## Readiness Categories

- `pass_ready_for_controlled_smoke`
- `blocked_missing_payment_env`
- `blocked_missing_runtime_secret`
- `blocked_missing_checkout_session_secret`
- `blocked_missing_paid_access_secret`
- `blocked_missing_queue_env`
- `blocked_missing_processor_env`
- `blocked_missing_access_link_env`
- `blocked_missing_email_env`
- `blocked_missing_line_env`
- `blocked_db_schema`
- `blocked_runtime_flags_not_expected`
- `blocked_unknown`

## Production Preflight Result

Command run:

```bash
cd apps/web && corepack pnpm run qa:production:payment-preflight -- --source vercel-production --mode dry-run
```

Result:

- readiness: `pass_ready_for_controlled_smoke`
- payment provider env names: present
- checkout session secret name: present
- paid access secret name: present
- queue env names: present
- processor env names: present
- access-link env names: present
- Email provider env names: present
- LINE provider env names: present
- production public pages: live
- production checkout: fail-closed
- production fake-paid: fail-closed
- NotifyURL route: reachable
- ReturnURL route: reachable

Important caveat:

- Vercel env metadata is presence-only. It cannot verify actual boolean values. The helper therefore relies on live route behavior to prove `dry-run` fail-closed status.

## Production DB Schema Result

Verified read-only through Neon MCP:

- required payment/access-link tables are present
- provider audit columns are present on `paid_result_access_links`
- aggregate production counts currently reflect one controlled-smoke artifact:
  - one payment intent
  - one access-link contact
  - one access-link row

No row values, credentials, tokens, hashes, raw Email, LINE identifiers, provider payloads, or source text were printed.

## Tests / Validation

- Targeted preflight tests passed.
- `cd apps/web && corepack pnpm lint` passed.
- `cd apps/web && corepack pnpm test src/tests/production-payment-runtime-preflight.test.ts` passed.
- `cd apps/web && corepack pnpm test` passed: 80 files, 562 tests.
- `cd apps/web && corepack pnpm build` passed.
- Production dry-run preflight passed against Vercel Production env-name metadata and live route checks.
- Docs presence, dashboard HTML sanity, targeted secret/private scan, and `git diff --check` passed.
- The helper detects:
  - missing checkout session secret
  - missing paid access secret
  - missing queue env
  - missing processor env
  - missing Email env
  - missing LINE env
  - runtime flags unexpectedly enabled in local dry-run mode
- Sanitized output test rejects tokenized URLs, DB URLs, and bearer/token patterns.

## Architecture Decisions

- Added a dedicated `qa:production:payment-preflight` command instead of only extending staging-oriented `qa:env:preflight`.
- Kept the command read-only and non-mutating.
- Kept DB schema checks optional for the local command, because the safest production DB verification path in this workspace remains Neon MCP unless an explicit preflight DB URL is provided.
- Did not rename recovery-named env variables in this task; current runtime still uses those names internally.

## Blockers

- None for helper readiness.

## Uncertainties

- Controlled Production Payment Smoke v1 still needs owner confirmation for the intended LINE coverage path:
  - Email-only repeat smoke, or
  - Email plus production LINE bind/message coverage in the same paid context.

## Tech Debt Review

- New technical debt introduced: the helper reports Vercel env presence by name only and cannot validate Vercel env values.
- Existing technical debt observed: access-link env names still use recovery terminology internally.
- Opportunistic cleanup completed: production preflight now centralizes the v0 runtime dependency checklist.
- Deferred cleanup candidates:
  - add an authenticated internal runtime config-shape endpoint that reports name-only readiness from actual deployed runtime
  - add provider dashboard checklist automation if NewebPay exposes a safe API later
  - align recovery-named env names behind access-link aliases after production smoke is stable

## Suggested Next Steps

1. Controlled Production Payment Smoke v1.
2. If v1 includes LINE, bind LINE on the production paid context before expecting LINE access-link delivery.
3. Production Soft Availability Decision Record v0 only after v1 passes without recovery intervention.
