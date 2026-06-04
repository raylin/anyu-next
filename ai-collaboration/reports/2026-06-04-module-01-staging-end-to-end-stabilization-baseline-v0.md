# Module 01 Staging End-to-End Stabilization Baseline v0

Date: 2026-06-04

## Status

Partial baseline.

The checkout-start UX gate and automated Preview(staging) access-link/payment simulation paths are stabilized and deployed to `origin/staging`. Production stayed frozen/fail-closed throughout. The baseline is not marked pass because real owner-verified staging Email/LINE message receipt was not rerun in this task, `qa:line-access-link:smoke` was skipped pending explicit approval for a real staging LINE send, and support lookup is blocked by missing local `SUPPORT_OPS_DATABASE_URL`.

## Production Freeze Status

Production was checked before staging work and again through the production preflight:

- public `/`, `/refund`, and `/legal`: 200
- checkout route: fail-closed
- fake-paid/operator routes: fail-closed
- `qa:production:payment-preflight -- --source vercel-production --mode dry-run`: `pass_ready_for_controlled_smoke`
- `ENABLE_PAYMENT_RUNTIME`: absent/disabled
- `ENABLE_NEWEBPAY_CHECKOUT`: absent/disabled
- no Production payment was run
- no Production Email/LINE message was sent
- no Production env, DB, or NewebPay dashboard settings were changed

## Staging Environment Reconciliation

Preview(staging) after deployment:

- `https://staging.anyu.tw/api/health`: environment `preview`
- served commit: `a50d3387605a`
- route bundle: `payment-foundation-2026-05-29`
- source branch: `staging`
- Vercel Preview(staging) env-name presence checked without values:
  - payment sandbox/provider names present
  - access-link crypto names present
  - Email provider names present
  - LINE provider names present
  - queue/processor names present
  - LIFF names present
- Neon Preview branch schema verified:
  - `payment_access_link_contacts`: exists
  - `paid_result_access_links`: exists
  - `payment_access_link_contact_secrets`: exists
  - old recovery-named access-link tables/views: absent
- Preview aggregate counts were inspected only as counts; no private row values were printed.

## UX Gate Implementation

Implemented in checkout-start:

- desktop/non-mobile:
  - Email save only
  - LINE CTA absent
  - payment provider form/fields hidden until Email save succeeds
  - disabled `繼續付款` state before save
- mobile / in-app browser:
  - LINE save appears visually above Email
  - Email fallback remains visible below LINE
  - payment provider form/fields hidden until LINE or Email save succeeds
  - LINE failure/cancel copy keeps Email fallback available
- saved state:
  - existing Email or LINE access-link contact unlocks provider handoff
  - `lineRecovery=line_saved` unlocks provider handoff
- user-facing copy remains aligned to 保存查看連結 / 專屬查看連結 / 回 ANYU 查看完整報告
- no report-body delivery promise was added

No DB/schema changes were made.

## Desktop Email-Only Result

Verified on Preview(staging) with desktop/non-mobile user agent:

- checkout-start returned 200
- Email-only save section present
- LINE CTA absent
- required save warning present
- payment provider fields hidden before save
- payment locked before save
- forbidden/internal/no-charge copy absent
- token/secret leakage checks passed
- saved Email state unlocked provider handoff:
  - saved badge present
  - provider fields present after save marker
  - payment lock absent after save marker
  - provider field values were not printed

## Mobile LINE-First Result

Verified on Preview(staging) with mobile user agent:

- checkout-start returned 200
- LINE option appeared above Email fallback
- required save warning present
- payment provider fields hidden before save
- payment locked before save
- forbidden/internal/no-charge copy absent
- token/secret leakage checks passed

Real owner-assisted mobile LINE bind was not rerun in this task. `qa:line-access-link:smoke` was skipped because it may send a real staging LINE message and explicit approval was not given in this task.

## Mobile Email Fallback Result

Verified at render/gate level:

- mobile checkout-start includes Email fallback below LINE
- Email fallback copy uses 保存查看連結 terminology
- payment remains blocked until LINE or Email save succeeds
- saved Email state unlocks provider handoff

The full mobile Email fallback paid journey was not manually repeated; automated `qa:result-checkout:no-card` and `qa:access-link:smoke` covered the staging paid readiness and `/r/ resolver path.

## ReturnURL Alignment Result

Tests and QA continue to cover the unified provider-level ReturnURL:

- staging ReturnURL target: `/payment/newebpay/return`
- production reference ReturnURL: `https://anyu.tw/payment/newebpay/return`
- NotifyURL remains `/api/payments/newebpay/notify`
- NotifyURL behavior was not changed
- ReturnURL remains non-mutating
- legacy module ReturnURL remains compatible through existing tests
- expired/invalid ReturnURL behavior is covered by tests and prior deployment work

## Staging QA Results

Validation commands:

- `cd apps/web && corepack pnpm lint`: passed
- targeted checkout/access-link/LINE/ReturnURL tests: passed
- `cd apps/web && corepack pnpm test`: passed, 80 files / 571 tests
- `cd apps/web && corepack pnpm build`: passed
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`: passed
- `cd apps/web && corepack pnpm run qa:access-link:smoke`: passed on retry after a transient paid-result readiness race
- `cd apps/web && corepack pnpm run qa:production:payment-preflight -- --source vercel-production --mode dry-run`: passed

`qa:line-access-link:smoke` was not run because it may send a real staging LINE message and was not explicitly approved during this task.

## Email / LINE User-Verified Delivery

- Email real provider delivery: not rerun in this task.
- LINE real provider delivery: not rerun in this task.
- Staging-equivalent access-link generation/resolver smoke passed without sending Email/LINE.
- Historical staging evidence still exists for real Email and LINE delivery, but this baseline does not claim fresh owner-verified inbox/LINE receipt.

## /r/ Access Result

`qa:access-link:smoke` passed:

- access link was created server-side
- `/r/` resolver verified paid-result access
- invalid-link safety verified
- cleanup by revocation verified
- raw token, token hash, paid access token, and checkout session token were not returned

## Delivery Artifact Result

`qa:result-checkout:no-card` passed:

- paid status reached completed
- paid access render passed
- completed result page markers were present
- production fail-closed checks passed

## Support Lookup Result

Support lookup was attempted against a staging completed paid-result artifact and failed safely:

- command: `cd apps/web && corepack pnpm run ops:paid-result:lookup -- --result-id <staging-result-id>`
- result: `support_ops_database_url_missing`
- required env: `SUPPORT_OPS_DATABASE_URL`
- fallback `DATABASE_URL` remains behind explicit opt-in
- no raw Email, LINE ID, encrypted recipient, hashes, tokens, source text, provider payload, or tokenized URL was printed

This is a baseline blocker for support-ops readiness until local/operator env alignment is completed.

## Tech Debt Backlog Classification

Must fix before production smoke:

- `SUPPORT_OPS_DATABASE_URL` local/operator alignment for sanitized staging/production lookup.
- Production preflight should detect empty/unusable processor secrets, not only env-name presence.
- Vercel deploy guard should keep blocking env/deploy/alias source mismatch.
- Keep desktop LINE boundary explicit: checkout-start desktop is Email-only.

Can fix after staging baseline but before Module 02:

- remaining recovery-named env vars:
  - `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`
  - `PAYMENT_RECOVERY_CONTACT_HASH_SECRET`
  - `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY`
  - `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`
  - `LINE_RECOVERY_MESSAGE_PROVIDER`
- remaining recovery-named file/module aliases:
  - `email-recovery-link`
  - `line-recovery-link`
  - `payment-recovery-contacts`
  - `payment-recovery-contact-secrets`
  - `paid-result-recovery-links`
- recovery-named endpoint/script references retained for compatibility or historical context.

Can defer until after Module 02 concept:

- broader helper/file rename away from recovery terminology.
- old historical docs/report cleanup.

Intentionally retained compatibility:

- `/r/[token]` route remains stable.
- `rlb_` LINE bind state prefix remains for now.

## Final Baseline Status

Partial.

Pass criteria met:

- Production remained frozen/fail-closed.
- Preview(staging) source/env/schema reconciliation passed.
- Desktop Email-only UX verified.
- Mobile LINE-first visual order verified.
- Mandatory save before payment verified.
- Saved state unlock verified.
- Automated staging no-card paid flow passed.
- Automated staging `/r/` access-link smoke passed.
- ReturnURL/NotifyURL behavior remains aligned.

Pass criteria not yet met:

- Fresh owner-verified staging Email inbox delivery was not rerun.
- Fresh owner-verified staging LINE delivery/link click was not rerun.
- Support lookup is blocked by missing `SUPPORT_OPS_DATABASE_URL`.
- Full manual desktop/mobile browser journey was not repeated with real provider messages.

## Recommended Next Action

Run `Support Ops Env Alignment v1`, then run an owner-approved `Module 01 Staging Manual Channel Verification v0` that explicitly permits one real staging Email and one real staging LINE message. Only after that passes should the team return to Controlled Production Payment Smoke v1.
