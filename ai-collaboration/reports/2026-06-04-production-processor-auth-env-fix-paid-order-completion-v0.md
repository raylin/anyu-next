# Production Processor Auth Env Fix + Paid Order Completion v0

Date: 2026-06-04

## Completed Work

- Saved a new handoff before Production operations.
- Reviewed processor auth requirements:
  - `/api/cron/paid-generation` requires non-empty `CRON_SECRET`.
  - `/api/internal/jobs/process` accepts `INTERNAL_JOB_SECRET` or `CRON_SECRET`.
  - processor execution also requires `ENABLE_PAID_GENERATION_PROCESSOR=true`.
- Configured Production-only processor auth env:
  - `CRON_SECRET`
  - `INTERNAL_JOB_SECRET`
- Activated `ENABLE_PAID_GENERATION_PROCESSOR=true` for the authenticated processor path.
- Redeployed Production from repo root to canonical Vercel project `anyu-next`.
- Kept `ENABLE_PAYMENT_RUNTIME` and `ENABLE_NEWEBPAY_CHECKOUT` disabled.
- Invoked `/api/cron/paid-generation` once with sanitized aggregate output.
- Verified the existing paid Production order completed generation.
- Verified Email and LINE access-link rows were created and marked sent/provider-accepted.
- Verified Production returned to fail-closed checkout/operator posture.

## Architecture / Operational Decisions

- Used `/api/cron/paid-generation` for the one-time recovery because it is an authenticated, aggregate-output processor path and does not mutate payment truth.
- Set both `CRON_SECRET` and `INTERNAL_JOB_SECRET` to non-empty Production values so both intended processor auth paths are usable for future operations.
- Left checkout/runtime disabled after recovery.
- Left `ENABLE_PAID_GENERATION_PROCESSOR=true`; this enables only the authenticated processor path and does not expose checkout or fake-paid/operator routes.

## Existing Paid Order State Before Processing

Sanitized Production DB inspection showed:

- payment intent status: `paid`
- provider environment: `production`
- provider status: `SUCCESS`
- provider payment type: `CREDIT`
- NotifyURL received: yes
- entitlement: `active`
- generation job: `queued`
- Email contact: linked and transactionally consented
- LINE contact: linked and transactionally consented
- LINE encrypted recipient secret: active
- paid result: missing
- access-link rows: missing

No raw Email, LINE ID, encrypted recipient, hashes, provider payloads, tokens, tokenized URLs, or private result/source content were printed.

## Processor Invocation Result

One authenticated cron processor invocation returned:

- HTTP status: `200`
- source: `cron`
- job type: `paid_analysis`
- processed: `1`
- completed: `1`
- retry scheduled: `0`
- auth values printed: no

## Post-Processing Verification

Sanitized Production DB verification showed:

- payment intent remains `paid`
- entitlement remains `active`
- generation job status: `completed`
- paid result status: `completed`
- paid result content present: yes, not printed
- Email access-link row:
  - status: `sent`
  - purpose: `paid_result_access_link`
  - sent timestamp present
  - send attempt count: `1`
  - provider status: `accepted`
  - provider message id present
  - no failure category
- LINE access-link row:
  - status: `sent`
  - purpose: `paid_result_access_link`
  - sent timestamp present
  - send attempt count: `1`
  - provider status: `accepted`
  - no failure category
- LINE recipient secret remains active.

Owner inbox/LINE receipt and `/r/ link open verification are pending owner confirmation at report time.

## Final Production Safety

- `ENABLE_PAYMENT_RUNTIME` remains absent/disabled.
- `ENABLE_NEWEBPAY_CHECKOUT` remains absent/disabled.
- Production public pages `/`, `/refund`, and `/legal` returned 200.
- Checkout route returned 404/fail-closed.
- Fake-paid/operator routes returned 404/fail-closed.
- `qa:production:payment-preflight -- --source vercel-production --mode dry-run` returned `pass_ready_for_controlled_smoke`.
- No additional payment was run.
- No manual DB mutation was performed.
- No unrelated Email/LINE message was sent.

## Validation

- Production processor env set without printing values.
- Production redeploy completed from repo root / canonical `anyu-next`.
- Authenticated processor invocation completed one job.
- Sanitized Neon DB verification completed.
- Production fail-closed route checks passed.
- Production payment preflight passed.

## Blockers

- None for automated paid-order completion.
- Owner confirmation remains pending for:
  - Email received and `/r/ link opens paid result.
  - LINE message received and `/r/ link opens paid result.
  - Browser paid result refresh renders completed report.

## Uncertainties

- The preflight currently checks processor env-name presence but not whether `CRON_SECRET` is non-empty because values are intentionally not printed/read in normal metadata mode. This task exposed that gap.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: production preflight should detect empty `CRON_SECRET` / unusable processor auth in a safe value-available mode before smoke.
- Opportunistic cleanup completed: none.
- Deferred cleanup candidates:
  - Add a secret-safe processor-auth live check to `qa:production:payment-preflight`.
  - Align support lookup env (`SUPPORT_OPS_DATABASE_URL`) for faster sanitized Production artifact inspection.

## Suggested Next Steps

1. Owner confirms Email, LINE, `/r/ links, and browser paid result render.
2. Run `Controlled Production Payment Smoke v1 Final Assessment / Gate 1 Decision v0`.
3. Add a preflight enhancement for non-empty processor auth validation before any future paid smoke.
