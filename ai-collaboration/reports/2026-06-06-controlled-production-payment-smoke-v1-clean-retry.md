# Controlled Production Payment Smoke v1 Clean Retry

Date: 2026-06-06

## Status

PARTIAL / FAILED AT LINE DELIVERY

The controlled production smoke reached real production payment truth and completed paid result generation. The owner confirmed the result generated and an access link opened the completed paid result. The smoke did not clean-pass because no production LINE access-link message arrived.

First remaining failure category: `line_send_failed`.

## Production Preconditions

- `qa:module01:local`: PASS before runtime enablement.
- `qa:module01:staging`: PASS before runtime enablement.
- `qa:module01:production-preflight`: PASS / `pass_ready_for_controlled_smoke` before runtime enablement.
- Production public pages were live before enablement.
- Production checkout and fake-paid/operator routes were fail-closed before enablement.
- Owner approved one NT$49 production credit-card one-time payment.
- Owner confirmed readiness to verify Email/LINE channels.

No env values, provider credentials, card details, provider payloads, or tokenized URLs were recorded.

## Runtime Enablement Window

Production runtime was temporarily enabled only for the controlled smoke:

- `ENABLE_PAYMENT_RUNTIME`
- `ENABLE_NEWEBPAY_CHECKOUT`

Production was deployed from the repo root to canonical `anyu-next`. Ads and broad traffic were not enabled.

After the smoke, production runtime and checkout were disabled again, synced back to Vercel Production, and Production was redeployed fail-closed.

## Checkout / Payment Flow

- Fresh production Module 01 result was created.
- Checkout-start rendered the production payment flow.
- Owner completed a real NT$49 production credit-card one-time payment.
- No card data or provider raw payload was captured.
- The owner initially saw a result-not-found screen due to an operator-provided wrong result URL; the corrected production result URL was then used.

## Payment Truth / ReturnURL / NotifyURL

Sanitized Admin CLI state after payment showed:

- payment status: `paid`
- entitlement status: `active`
- generation job existed
- generation status initially: `queued`

This confirms payment truth and entitlement creation occurred. The smoke did not require manual payment-state mutation.

## Processor / Generation

The first post-payment Admin CLI lookup showed paid generation was queued and no paid result existed yet.

An approved internal processor invocation was attempted through `/api/internal/jobs/process`. The first attempt failed with `processor_disabled`, exposing that production processor auth existed but the processor runtime flag was not enabled for the smoke.

Remediation during the smoke:

- `ENABLE_PAID_GENERATION_PROCESSOR` was enabled in the production mirror.
- The key was synced to Vercel Production.
- Production was redeployed.
- The internal processor was invoked once.

Processor result:

- HTTP status: 200
- processed paid-analysis jobs: 1

Final Admin CLI state after processor:

- payment status: `paid`
- entitlement status: `active`
- generation status: `completed`
- paid result exists: true
- paid result status: `completed`
- delivery artifact ready: true

The owner confirmed the result generated after refresh.

## Access-Link Delivery

Owner-reported result:

- access link opened the completed paid result
- no LINE message arrived

Final sanitized Admin CLI delivery state:

- Email contact saved: false
- Email sent: false
- Email active: false
- LINE contact saved: true
- LINE recipient secret exists: false
- LINE sent: false
- LINE active: false
- diagnosis: `paid_result_ready`, `line_contact_saved`, `access_link_missing`
- recommended action: `retry_processor_if_safe`

Interpretation:

- Paid result completion passed.
- The production LINE bind/contact path did not create the recipient secret needed for LINE push delivery.
- No LINE access-link message was sent.
- Full Email channel delivery was not established by Admin CLI for this production result.

No raw Email, LINE ID, encrypted recipient, hashes, provider payloads, or tokenized access links were recorded.

## Admin Ops Boundary

Support verification used the supported Admin API + Admin CLI path:

- `pnpm ops lookup-result --env production --id <resultId>`
- `pnpm ops lookup-result --env production --id <resultId> --json`

Direct DB support lookup was not used.

## Final Runtime Status

Production was returned to fail-closed after the smoke:

- production runtime disabled
- production checkout disabled
- public pages live
- checkout/fake-paid/operator routes fail-closed by hardened production preflight
- no ads enabled
- no broad traffic enabled

Final `qa:module01:production-preflight`: PASS / `pass_ready_for_controlled_smoke`.

## Theme Route Preservation

Theme Architecture remains archived and preserved:

- Hybrid Theme Park Model adopted.
- Module 01 = Riso-only adopted.
- Core Shell = neutral editorial adopted.
- Checkout-start v2 design reference accepted.

No runtime theme/UI implementation was performed in this smoke.

## Validation

- `qa:module01:local`: PASS before runtime enablement.
- `qa:module01:staging`: PASS before runtime enablement.
- `qa:module01:production-preflight`: PASS before runtime enablement.
- Final `qa:module01:production-preflight`: PASS after runtime shutdown and fail-closed redeploy.
- Production payment: completed once with owner card.
- Production Email/LINE sends: no clean channel-delivery pass; LINE message did not arrive.

## Blockers

- Production LINE delivery is blocked because the production result has a LINE contact but no recipient secret.
- Email delivery was not shown as saved/sent in Admin CLI for this production result.
- Processor flag readiness should be included explicitly in the smoke enablement checklist; preflight had env readiness but did not mean the processor flag was enabled during the runtime window.

## Tech Debt Review

- New technical debt introduced: none in code.
- Existing technical debt observed: active recovery-named access-link env/module names remain; LINE bind/contact state still needs production-specific recipient-secret diagnosis.
- Opportunistic cleanup completed: production runtime was restored fail-closed immediately after the smoke.
- Deferred cleanup candidates: add a smoke-specific guard that confirms `ENABLE_PAID_GENERATION_PROCESSOR=true` during a payment smoke window, without leaving checkout enabled afterward.

## Recommended Next Step

Resolve production LINE recipient-secret creation for the mobile bind path, rerun Module 01 gates, then retry only the failed delivery portion or rerun a full controlled production smoke with owner approval.
