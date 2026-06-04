# Module 01 Staging Baseline Completion v1

Date: 2026-06-04

## Status

Partial.

The user-facing staging Email and LINE access-link paths were completed and owner-verified: both real staging messages were received and both `/r/` links opened completed paid results. Production remained frozen/fail-closed. The baseline is still not marked pass because `ops:paid-result:lookup` remains blocked by missing `SUPPORT_OPS_DATABASE_URL`, and the task's pass criteria require support lookup to work.

## Production Freeze Status

Production was checked before staging activity:

- `https://anyu.tw/api/health`: production reachable
- public `/`, `/refund`, and `/legal`: 200
- checkout route: 404 fail-closed
- operator fake-paid route: 404 fail-closed on POST
- operator access-link smoke route: 404 fail-closed on POST
- `qa:production:payment-preflight -- --source vercel-production --mode dry-run`: `pass_ready_for_controlled_smoke`
- runtime flags remained disabled/absent:
  - `ENABLE_PAYMENT_RUNTIME`
  - `ENABLE_NEWEBPAY_CHECKOUT`
- no Production payment was run
- no Production Email/LINE message was sent
- no Production env, DB, or provider dashboard setting was changed

## Staging Freshness And Env Status

Preview(staging) checks:

- `https://staging.anyu.tw/api/health`: 200
- environment: `preview`
- served commit: `cd71d5481683` / `cd71d5481683683d29104a567580f75a42d43bf0`
- route bundle: `payment-foundation-2026-05-29`

Preview(staging) clean access-link schema was verified with schema/aggregate-only checks:

- `payment_access_link_contacts`: exists
- `paid_result_access_links`: exists
- `payment_access_link_contact_secrets`: exists
- old recovery-named tables/views: absent
- values, hashes, encrypted recipients, tokens, provider payloads, and raw user data were not printed

## Support Lookup Alignment Result

Support lookup remains blocked.

Checks performed:

- `qa:env:preflight -- support-ops-lookup`: failed safely with missing `SUPPORT_OPS_DATABASE_URL`
- local `.env.local` and `.env` were checked by key presence only
- local `DATABASE_URL` was tested and rejected because it does not point to the Preview clean access-link schema
- Vercel Preview env pull to `/private/tmp` did not provide non-empty usable values for this local operator process
- temporary env pull files were removed after inspection

No connection string, value length, prefix, suffix, hash, checksum, or secret was printed.

Impact:

- `ops:paid-result:lookup` could not be run against the staging artifacts.
- Support lookup remains a required blocker before marking the staging baseline pass.

## Desktop Email-Only Result

Fresh Preview(staging) desktop/non-mobile render verification passed:

- Email save shown
- LINE CTA absent
- payment handoff blocked before Email save
- copy uses 保存查看連結 / 專屬查看連結
- no recovery wording as primary CTA
- no Email report-body delivery promise
- no internal-test/no-charge copy
- saved Email state unlocks provider handoff
- provider field values were not printed

## Mobile LINE-First Result

Fresh Preview(staging) mobile render verification passed:

- LINE option appears visually above Email fallback
- Email fallback appears below LINE
- payment handoff blocked before LINE or Email save
- copy uses 保存查看連結 / 專屬查看連結
- no LINE report-body delivery promise
- no internal-test/no-charge copy

The real LINE message smoke also passed:

- `qa:line-access-link:smoke`: passed
- runtime operator LINE access-link message smoke returned `lineMessageSent=true`
- LINE contact was bound
- recipient secret was resolved server-side
- access link was created
- access link status was sent before owner click
- no raw token, token hash, raw LINE user ID, encrypted recipient, recipient hash, paid access token, checkout session token, or report content was returned
- owner confirmed the real staging LINE message was received
- owner confirmed the LINE `/r/` link opened the completed paid result

## Mobile Email Fallback Result

Verified at UI/gate level:

- mobile checkout-start shows LINE first
- Email fallback remains visible below LINE
- payment remains blocked if neither save method succeeds
- saved Email state unlocks payment handoff
- LINE is not required if Email succeeds

A separate full mobile Email fallback paid journey was not run because the desktop Email real-message path already covered Email provider delivery, and the mobile render/gate check covered fallback visibility and unlock behavior.

## Real Email Receipt / Link Result

An approved real staging Email access-link message was sent through the Preview(staging) operator Email auto-send path:

- source result created on Preview(staging)
- fake paid/operator staging path created payment/entitlement/generation state
- paid generation processor completed
- Email recovery/access-link auto-send hook exercised
- `emailSent=true`
- access link created
- access link had sent state before owner click
- no raw recovery/access token, token hash, raw Email, paid access token, checkout session token, or report content was returned
- owner confirmed the Email was received
- owner confirmed the Email `/r/` link opened the completed paid result

The local ad hoc sanitizer overmatched safe boolean field names in the response, but the route response itself explicitly returned all raw/private-return flags as false. No second Email was sent.

## Real LINE Receipt / Link Result

An approved real staging LINE access-link message was sent through `qa:line-access-link:smoke`:

- fake paid/operator staging path completed
- LINE contact bound
- encrypted recipient secret resolved server-side
- LINE message sent
- access link created
- access link had sent state before owner click
- no raw LINE ID, encrypted recipient, recipient hash, raw token, token hash, paid access token, checkout session token, provider payload, or report content was returned
- owner confirmed the LINE message was received
- owner confirmed the LINE `/r/` link opened the completed paid result

## /r/ Result

Owner-confirmed:

- Email `/r/` link opens completed paid result
- LINE `/r/` link opens completed paid result

Sanitized DB aggregate after owner clicks:

- Email access-link row exists with `sent_at` and `used_at`
- LINE access-link rows exist with `sent_at` and `used_at`
- LINE recipient secret row remains active
- raw token, token hash, raw Email, raw LINE ID, encrypted recipient, and hashes were not printed

## Delivery Artifact Result

Verified through automated QA and owner link-open checks:

- `qa:result-checkout:no-card`: passed
- paid status reached completed
- paid access render passed
- completed result markers were visible
- owner-confirmed `/r/` links opened completed paid result
- delivery artifact/report reference behavior is covered by the completed paid-result render path

## Support Lookup Result

Blocked:

- `ops:paid-result:lookup` could not run because the required `SUPPORT_OPS_DATABASE_URL` was not available to the operator process.
- The local fallback `DATABASE_URL` was not used because it does not target the Preview clean access-link schema.
- Vercel Preview env pull produced key names but not usable non-empty values for this local process.
- No raw/private support lookup output was produced.

## QA / Validation Results

Passed:

- `cd apps/web && corepack pnpm lint`
- targeted checkout/access-link/LINE/ReturnURL/support tests: 7 files / 52 tests
- `cd apps/web && corepack pnpm test`: 80 files / 571 tests
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm run qa:access-link:smoke`
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`
- `cd apps/web && corepack pnpm run qa:line-access-link:smoke`
- `cd apps/web && corepack pnpm run qa:production:payment-preflight -- --source vercel-production --mode dry-run`

Blocked:

- `cd apps/web && corepack pnpm run qa:env:preflight -- support-ops-lookup`: missing `SUPPORT_OPS_DATABASE_URL`
- `cd apps/web && corepack pnpm run ops:paid-result:lookup -- --result-id <staging-result-id>`: not run because preflight blocked

## Tech Debt Backlog Classification

Must fix before production smoke:

- `SUPPORT_OPS_DATABASE_URL` persistence/local bootstrap for staging and future production support lookup.
- Production preflight empty-secret validation for processor/auth secrets.
- Vercel deploy guard hardening to keep source/env/alias aligned.

Can fix after staging baseline before Module 02:

- recovery-named env vars:
  - `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`
  - `PAYMENT_RECOVERY_CONTACT_HASH_SECRET`
  - `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY`
  - `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`
  - `LINE_RECOVERY_MESSAGE_PROVIDER`
- recovery-named file/module aliases:
  - `email-recovery-link`
  - `line-recovery-link`
  - `payment-recovery-contacts`
  - `payment-recovery-contact-secrets`
  - `paid-result-recovery-links`
- recovery-named endpoint/script names:
  - `/api/operator/email-recovery-smoke`
  - `/api/operator/recovery-link-smoke`
  - `/api/operator/line-recovery-smoke`
  - route/helper names under LINE recovery bind paths

Can defer until after Module 02 concept:

- broad helper/file cleanup away from recovery terminology.
- old historical report cleanup.

Intentionally retained compatibility:

- `/r/[token]` route remains stable.
- `rlb_` LINE bind state prefix remains for now.
- Desktop LINE UX boundary remains intentional: desktop/non-mobile checkout-start is Email-only.

Staging/production drift found:

- Production remains frozen/fail-closed by design.
- Local `.env.local` `DATABASE_URL` is not the Preview clean access-link schema target.
- Vercel Preview env pull did not provide usable local DB values for `SUPPORT_OPS_DATABASE_URL`.

## Final Baseline Status

Partial.

Pass criteria met:

- Production frozen/fail-closed.
- Staging environment trusted.
- Desktop Email-only mandatory save verified.
- Mobile LINE-first visual order verified.
- Mandatory save before payment verified.
- Real staging Email received and `/r/` opens paid result.
- Real staging LINE received and `/r/` opens paid result.
- `/r/` access works.
- Delivery artifact/completed paid-result render path works.
- No token/private leakage in command/report output.

Pass criteria not met:

- Support lookup env is not aligned.
- `ops:paid-result:lookup` did not run against the staging artifacts.

## Recommended Next Action

Run `Support Ops DB URL Bootstrap v1` to provide a local/operator-only `SUPPORT_OPS_DATABASE_URL` for Preview(staging), then rerun only the support lookup verification against the already-created staging artifacts. Do not return to Production smoke until support lookup passes and the owner accepts the staging baseline.
