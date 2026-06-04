# Production Email/LINE Provider Env Alignment v0

Date: 2026-06-04

## Completed Work

- Saved the required handoff before env alignment.
- Confirmed exact active env names from source.
- Verified local secure env-name presence without printing values.
- Added Production Email provider env names:
  - `EMAIL_PROVIDER`
  - `EMAIL_FROM`
  - `RESEND_API_KEY`
- Added Production LINE access-link provider flag:
  - `LINE_RECOVERY_MESSAGE_PROVIDER`
- Reused existing Production LINE Messaging API token env:
  - `LINE_CHANNEL_ACCESS_TOKEN`
- Reused existing Production LIFF/public LINE env names:
  - `NEXT_PUBLIC_LINE_LIFF_URL`
  - `NEXT_PUBLIC_LINE_LIFF_ID`
  - `NEXT_PUBLIC_LINE_ADD_URL`
- Redeployed the existing Production deployment to activate env changes.
- Verified Production health, public pages, and fail-closed payment/operator routes after redeploy.
- Verified Production DB remains on the clean access-link schema with zero access-link rows.

No Email, LINE message, payment, checkout, or production runtime enablement occurred.

## Active Env Requirements Confirmed

Email access-link delivery uses:

- `EMAIL_PROVIDER`
- `EMAIL_FROM`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL`

LINE access-link delivery uses:

- `LINE_RECOVERY_MESSAGE_PROVIDER`
- `LINE_MESSAGING_CHANNEL_ACCESS_TOKEN` or fallback `LINE_CHANNEL_ACCESS_TOKEN`
- `NEXT_PUBLIC_APP_URL`
- `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`
- `PAYMENT_RECOVERY_CONTACT_HASH_SECRET`

LINE bind flow uses:

- `NEXT_PUBLIC_LINE_LIFF_URL`
- `NEXT_PUBLIC_LINE_LIFF_ID`
- `PAYMENT_RECOVERY_CONTACT_HASH_SECRET`
- `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY`
- `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`

Access-link generation/contact identity still uses recovery-named envs internally:

- `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`
- `PAYMENT_RECOVERY_CONTACT_HASH_SECRET`
- `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY`
- `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`

Env-name alignment remains deferred.

## Production Env Alignment

Added to Vercel Production:

- `EMAIL_PROVIDER`
- `EMAIL_FROM`
- `RESEND_API_KEY`
- `LINE_RECOVERY_MESSAGE_PROVIDER`

Already present in Vercel Production:

- payment provider env names
- access-link crypto env names
- LINE channel/LIFF env names

Rules followed:

- Values were never printed.
- Lengths, prefixes, suffixes, hashes, and checksums were not printed.
- Existing access-link secrets were not rotated.
- Preview(staging) env was not modified.

## Production Redeploy Result

Redeploy method:

- Rebuilt the existing Production deployment by deployment ID using Vercel `redeploy`.
- Explicit Production target was used.
- First redeploy attempt without explicit scope was blocked by Vercel team scope selection; rerun with explicit scope succeeded.

Redeployed Production deployment:

- deployment id: `dpl_BPRGycu2c1kz8yyw4Gbbudo25bPw`
- URL: `https://anyu-next-e39zu4dm1-studioanyu-1488s-projects.vercel.app`
- alias: `https://anyu.tw`
- status: Ready

Production health after redeploy:

- environment: `production`
- branch: `main`
- route bundle: `payment-foundation-2026-05-29`

## Fail-Closed Verification

After redeploy:

- `/`: 200
- `/refund`: 200
- `/legal`: 200
- production fake-paid operator POST: 404
- production synthetic checkout path: 404
- production LINE operator smoke POST: 404
- production access-link operator smoke POST: 404

No provider form was generated.
No payment was run.
No Email or LINE message was sent.

## Production DB Verification

Read-only Production DB verification:

- `payment_access_link_contacts` exists.
- `paid_result_access_links` exists.
- `payment_access_link_contact_secrets` exists.
- old `payment_recovery_contacts` absent.
- old `paid_result_recovery_links` absent.
- old `payment_recovery_contact_secrets` absent.

Aggregate row counts:

- access-link contacts: 0
- access links: 0
- access-link contact secrets: 0

No private row data was printed.

## Provider Dashboard Checklist

Owner-side confirmation still needed before controlled production smoke:

- credit-card one-time payment enabled
- Apple Pay / Google Pay / Samsung Pay pending and non-blocking
- ATM / WebATM / convenience store / installment / rewards disabled
- NotifyURL points to `https://anyu.tw/api/payments/newebpay/notify`
- ReturnURL points to production Module 01 return flow
- no sandbox credential mix

## Readiness Classification

`blocked_provider_dashboard_confirmation`

Reason:

- Production payment, access-link, Email, and LINE provider env names are present.
- Production was redeployed to activate env changes.
- Production remains fail-closed.
- Owner-side NewebPay dashboard method/URL confirmation remains the final blocker before controlled production smoke.

If owner confirms the dashboard checklist, the next task can be Controlled Production Payment Smoke v0 with credit-card one-time payment only.

## Production Safety

- Production checkout remained disabled.
- Production payment runtime remained disabled by live behavior.
- No real payment was run.
- No real credit card was used.
- No production Email was sent.
- No production LINE message was sent.
- Production DB was read-only in this task.

## Validation

Documentation-only validation:

- docs presence check passed
- dashboard HTML sanity passed
- secret/private scan passed
- `git diff --check` passed

No app code changed.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: access-link internals still use recovery-named envs and endpoint/script names.
- Opportunistic cleanup completed: aligned Production Email/LINE provider env names and activated them via redeploy.
- Deferred cleanup candidates: env-name rename; recovery-named file/module route cleanup after production smoke.

## Suggested Next Steps

1. Owner confirms NewebPay dashboard checklist.
2. Controlled Production Payment Smoke v0 with credit-card one-time payment only.
3. If smoke passes, define Soft Public Availability Gate v0.
