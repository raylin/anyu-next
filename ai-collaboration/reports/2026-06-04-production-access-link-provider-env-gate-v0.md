# Production Access-Link / Provider Env Gate v0

Date: 2026-06-04

## Completed Work

- Saved the required handoff before operational checks.
- Verified Production freshness and fail-closed behavior without enabling runtime.
- Verified Production clean access-link DB schema read-only.
- Listed Vercel Production env names only; no values were printed.
- Added missing Production access-link crypto env names with freshly generated values:
  - `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`
  - `PAYMENT_RECOVERY_CONTACT_HASH_SECRET`
  - `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY`
  - `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`
- Did not add Email provider env or LINE access-link message-provider flag in this task.
- Did not redeploy Production.
- Did not run any payment.
- Did not send Email or LINE.

## Production Freshness And Safety

Production health:

- environment: `production`
- git branch: `main`
- route bundle: `payment-foundation-2026-05-29`
- deployment provider: Vercel

Public pages:

- `/`: 200
- `/refund`: 200
- `/legal`: 200

Fail-closed checks:

- production fake-paid operator POST: 404
- production checkout path for synthetic result: 404
- production LINE operator smoke POST: 404
- production access-link operator smoke POST: 404

Runtime flags:

- `ENABLE_NEWEBPAY_CHECKOUT` exists in Production.
- `ENABLE_PAYMENT_RUNTIME` exists in Production.
- Temporary env-pull value equality was inconclusive because pulled values were not usable for exact comparison in this local session.
- Live route behavior confirms production checkout/runtime remains fail-closed.

## Production DB Schema Verification

Read-only verification passed:

- `payment_access_link_contacts` exists.
- `paid_result_access_links` exists.
- `payment_access_link_contact_secrets` exists.
- old `payment_recovery_contacts` absent.
- old `paid_result_recovery_links` absent.
- old `payment_recovery_contact_secrets` absent.
- provider audit columns exist on `paid_result_access_links`:
  - `provider_message_id`
  - `last_send_attempt_at`
  - `send_attempt_count`
  - `last_failure_category`
  - `last_provider_status`

Aggregate row counts:

- access-link contacts: 0
- access links: 0
- access-link contact secrets: 0

No private row data was printed.

## Payment Provider Env Presence

Production env names present:

- `NEWEBPAY_MERCHANT_ID`
- `NEWEBPAY_HASH_KEY`
- `NEWEBPAY_HASH_IV`
- `NEWEBPAY_CHECKOUT_URL`
- `NEWEBPAY_NOTIFY_URL`
- `NEWEBPAY_ENVIRONMENT`
- `NEXT_PUBLIC_APP_URL`
- `ENABLE_NEWEBPAY_CHECKOUT`
- `ENABLE_PAYMENT_RUNTIME`

Exact value checks:

- Values were not printed.
- The temporary env-pull path did not provide usable value equality checks.
- Live production fail-closed behavior confirms runtime remains disabled.

## Access-Link Env Presence

Production access-link env names are now present:

- `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`
- `PAYMENT_RECOVERY_CONTACT_HASH_SECRET`
- `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY`
- `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`

Notes:

- Current code still uses recovery-named envs for access-link internals.
- Env-name alignment remains deferred.
- Existing production secrets were not rotated.
- Missing names were generated and added only to Production.
- Production was not redeployed, so a future controlled smoke needs an approved Production redeploy before these env additions are guaranteed active in runtime.

## Email Provider Env Presence

Production env names missing:

- `EMAIL_PROVIDER`
- `EMAIL_FROM`
- `RESEND_API_KEY`

Decision:

- Production Email sending is not ready for an end-to-end access-link smoke.
- No Email was sent.
- Do not set these from local env until the owner explicitly confirms the production sender/key source and desired first production Email behavior.

## LINE Provider Env Presence

Production env names present:

- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_CHANNEL_SECRET`
- `NEXT_PUBLIC_LINE_LIFF_URL`
- `NEXT_PUBLIC_LINE_LIFF_ID`
- `NEXT_PUBLIC_LINE_ADD_URL`
- `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`

Production env names missing:

- `LINE_RECOVERY_MESSAGE_PROVIDER`
- `LINE_MESSAGING_CHANNEL_ACCESS_TOKEN`

Notes:

- Current sender can fall back to `LINE_CHANNEL_ACCESS_TOKEN`, but without `LINE_RECOVERY_MESSAGE_PROVIDER=line`, access-link LINE sending defaults to noop.
- LINE bind entry env is present.
- No LINE message was sent.

## Provider Dashboard Checklist

Owner-side checklist for first production controlled smoke:

- NewebPay production shop active/approved.
- Payment method enabled: credit-card one-time only.
- Apple Pay / Google Pay / Samsung Pay pending and non-blocking.
- ATM / WebATM / convenience store / installment / rewards disabled.
- NotifyURL points to `https://anyu.tw/api/payments/newebpay/notify`.
- ReturnURL points to production Module 01 return flow.
- No sandbox credentials mixed into production.

Status:

- Payment env names are present.
- Dashboard method confirmation remains owner-side.
- Exact provider dashboard state was not mutated or independently verified from this shell.

## Readiness Classification

`blocked_missing_email_env`

Also noted:

- `blocked_missing_line_env` for real LINE access-link sending because `LINE_RECOVERY_MESSAGE_PROVIDER` is absent.
- Payment provider env names are present.
- Access-link crypto env names are now present.
- Production runtime remains fail-closed.
- Production redeploy is required before newly added access-link env names are active for any controlled smoke runtime.

If the next controlled smoke intentionally excludes Email/LINE sending, the payment/access-link schema and payment env names are ready for the next runtime-gated plan after an approved Production redeploy.

## Production Safety

- Production checkout disabled.
- Production payment runtime disabled by live behavior.
- No real payment run.
- No real credit card used.
- No production Email sent.
- No production LINE message sent.
- Production DB was read-only in this task.
- Production env was modified only to add missing access-link crypto secrets.

## Validation

Documentation-only validation:

- docs presence check passed
- dashboard HTML sanity passed
- secret/private scan passed
- `git diff --check` passed

No app code changed.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: access-link env names still use recovery terminology in active code.
- Opportunistic cleanup completed: generated and added missing production access-link crypto env names without enabling runtime.
- Deferred cleanup candidates: production Email provider env alignment, LINE access-link message-provider env alignment, env-name rename.

## Suggested Next Steps

1. Production Email/LINE Provider Env Alignment v0 if the first controlled smoke should include real provider messages.
2. Production Redeploy For Access-Link Env Activation v0 after owner approves the exact controlled smoke plan.
3. Controlled Production Payment Smoke v0 with credit-card one-time payment only.
