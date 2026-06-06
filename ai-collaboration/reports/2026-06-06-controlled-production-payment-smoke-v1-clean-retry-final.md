# Controlled Production Payment Smoke v1 Clean Retry Final

Date: 2026-06-06

## Model / Effort

- Model used: GPT-5 Codex
- Reasoning effort used: high
- taskStartedAt: `2026-06-06T15:11:16Z`
- taskCompletedAt: `2026-06-06T15:32:45Z`
- totalWallClockDuration: about 21 minutes
- humanWaitDuration: about 2 minutes
- netCodexWorkDuration: about 18 minutes

## Result

Status: FAILED before payment

First failure category: `line_bind_failed`

The controlled production smoke did not proceed to NewebPay payment. The owner attempted the required pre-payment mobile LINE bind, including LINE login redirect, and reported bind failure. Per production gate policy, the smoke stopped at that first hard failure.

## Production Environment / Source Assertion

- environment: production
- base URL: `https://anyu.tw`
- canonical Vercel project: `anyu-next`
- deployment source: repo root
- deployed commit observed from production health: `4d2a3caa5b50`
- route bundle: `payment-foundation-2026-05-29`
- resultSourceCategory: `production_runtime`

No staging result ID was used or reported as production.

## Preflight Results

All required gates passed before runtime enablement:

- `qa:module01:local`: PASS
- `qa:module01:mock-flow`: PASS
- `qa:module01:ui`: PASS
- `qa:module01:staging`: PASS
- `qa:module01:production-preflight`: PASS / `pass_ready_for_controlled_smoke`

Before enablement, production was verified fail-closed by the hardened preflight.

## Runtime Enablement Window

Production runtime was enabled temporarily only for the controlled smoke:

- `ENABLE_PAYMENT_RUNTIME=true`
- `ENABLE_NEWEBPAY_CHECKOUT=true`

The local production mirror was updated first, then Vercel Production was synced, then Production was deployed from repo root to canonical `anyu-next`.

Disabled throughout:

- fake-paid/operator smoke routes
- ads
- broad traffic
- non-card payment methods, per owner NewebPay dashboard confirmation

## Fresh Result / Checkout-Start

A fresh production Module 01 result was created. Two initial operator-created direct API requests failed validation before owner action:

- first validation issue: invalid frontend context option
- second validation issue: `input_too_short`

A corrected valid-length request succeeded:

- production analyze API: 200
- fresh result page: 200
- fresh checkout page: 200

No tokenized URL, raw input, or private value is included in this report.

## Email Save Result

Email save was not completed for this smoke.

Reason: the smoke stopped at the required pre-payment mobile LINE bind failure before proceeding to payment. No production Email delivery was sent by this smoke.

## Mobile LINE Bind Result

Result: FAILED

Owner report:

- mobile LINE context was used
- LINE login redirect was attempted
- bind still failed

This is the first hard failure for this retry. It is distinct from the previous smoke failure (`line_bind_partial_contact_without_secret`), because this retry failed at the user-visible bind step before payment rather than after paid result completion.

## Payment Result

Payment was not run.

- no NewebPay payment submitted
- no card data observed or recorded
- no provider payload inspected or reported
- no payment/result/access-link state was manually mutated

## ReturnURL / NotifyURL / Processor / Paid Result

Not reached because payment was not run.

- ReturnURL: not reached
- NotifyURL: not reached
- entitlement: not created for this smoke
- processor/generation: not reached for paid result
- paid result: not reached

## Email / LINE Access-Link Delivery

Not reached.

- no production Email sent by this smoke
- no production LINE message sent by this smoke
- no `/r/` access-link delivery verification performed

## Admin CLI Lookup

Admin CLI lookup was not run for a paid result state because the smoke stopped before payment. Admin API + `pnpm ops` remain the supported ops boundary for any follow-up diagnosis.

If deeper diagnosis is needed, use Admin API/CLI first. Direct DB/Neon should be used only for approved read-only debugging when Admin API/CLI is insufficient, with no private values printed.

## Final Runtime Status

Production was returned fail-closed:

- `ENABLE_PAYMENT_RUNTIME=false`
- `ENABLE_NEWEBPAY_CHECKOUT=false`
- Vercel Production redeployed fail-closed
- production health: environment `production`
- public pages `/`, `/refund`, `/legal`: 200
- operator fake-paid route: 404
- final `qa:module01:production-preflight`: PASS

The checkout page for the already-created result returned 200 after shutdown, but the hardened production preflight verified the payment checkout route itself fail-closed with 404. This distinction should be preserved in future reports.

## Production Safety

- production runtime remained enabled only during the controlled smoke window
- runtime was disabled after first hard failure
- no payment occurred
- no Email was sent
- no LINE was sent
- no ads or broad traffic were enabled
- no production data was manually mutated
- no Vercel env values were changed beyond the two runtime gate flags
- no secrets, tokenized URLs, provider payloads, card data, or private identifiers were printed

## Theme Route Preservation

Theme Architecture remains archived and preserved:

- Hybrid Theme Park Model adopted
- Module 01 Riso-only direction preserved
- Core Shell neutral editorial direction preserved
- runtime theme implementation remains deferred

This production smoke did not modify UI/theme code.

## Recommended Next Task

Production LINE Bind Failure Diagnosis v0.

Recommended scope:

- reproduce with targeted local/mock/UI coverage first
- inspect LINE bind redirect/state handling
- verify LIFF production callback/domain behavior
- verify bind route error category without exposing raw LINE ID or secrets
- run staging only if deployed LIFF behavior must be proven
- do not run another production payment until LINE bind passes pre-payment checks
