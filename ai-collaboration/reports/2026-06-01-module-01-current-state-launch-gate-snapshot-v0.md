# Module 01 Current State / Launch-Gate Snapshot v0

Date: 2026-06-01
Branch: `staging`
Scope: documentation/status sync only

## 1. Executive Summary

- Module 01「曖昧溫度計」is low-key production active / monitor for public content, but production payment runtime remains disabled and fail-closed.
- Staging has proven the real result-page checkout path end-to-end: result page CTA -> checkout-start -> NewebPay sandbox card payment -> ReturnURL/status/access -> completed paid result.
- Staging has also proven the no-card result checkout QA path for fast regression: result page CTA -> checkout-start -> operator fake-paid -> queue -> completed paid access.
- Payment UX is launch-aligned: paid CTA state model, checkout-start bridge, ReturnURL polling, public legal/refund/support copy, and LINE-era paid delivery copy cleanup are complete.
- Recovery v0 is staging-proven: checkout-start Email recovery soft gate, `payment_recovery_contacts` staging schema, Preview(staging) recovery secrets, completed-result Email save, and masked saved-state display all pass.
- Payment data integrity is stronger on staging: `entitlements(payment_intent_id)` partial unique index is applied and verified on the staging DB; production remains gated.
- NewebPay formal merchant approval is still external and is only the Payment Capability Gate, not the commercial Growth / Ads Launch Gate.
- Production DB migrations for entitlement uniqueness and recovery contacts are not applied yet by design.
- LINE, Email sending, magic recovery links, lightweight membership, Module 02 implementation, and Personal Insight Graph remain future/deferred.
- Module 02 concept/spec work can start now because Module 01’s validated payment/recovery paths are protected by smoke tests, but full Module 02 implementation and homepage portal changes should still wait for concept/design clarity.

## 2. Launch Gate Model

### Gate 1: Payment Capability Gate

Purpose: make production payment technically possible for controlled use.

Required before enabling production payment capability:

- NewebPay formal approval.
- Production MerchantID / HashKey / HashIV and gateway details available to owner/operator, never committed.
- Production Payment Config Dry-Run with runtime still disabled.
- Production DB migration gates:
  - `entitlements_payment_intent_unique_idx`.
  - `payment_recovery_contacts`.
- Production recovery env configured only when production recovery DB is approved.
- Controlled production payment smoke plan approved.
- Rollback and manual recovery runbook ready.

Status: not complete. External approval and production gates remain pending.

### Gate 2: Soft Public Availability Gate

Purpose: allow low/no-traffic production checkout after controlled smoke, without growth pressure.

Required:

- Gate 1 completed.
- One controlled production payment smoke passed.
- Production checkout/fake-paid failure behavior verified before and after flag changes.
- Support/refund SOP active and monitored.
- Recovery identity path available or support fallback clearly documented.
- Monitoring and rollback thresholds ready.
- No paid ads yet.

Status: future. This should happen only after Gate 1.

### Gate 3: Growth / Ads Launch Gate

Purpose: begin intentional commercial traffic.

Required:

- Gate 2 stable for an agreed observation window.
- Conversion tracking and attribution plan.
- Stop-loss thresholds for payment errors, queue failures, generation failures, refund/support volume, API spend, and ad spend.
- Support response cadence and owner availability.
- Channel/LINE re-engage readiness if retention is part of the launch.
- Budget caps and rollback decision owner.

Status: future. NewebPay approval does not equal commercial launch.

## 3. Current Staging Proof Matrix

| Area | Status | Latest evidence | Remaining caveat |
| --- | --- | --- | --- |
| Free analyze/result path | Passed | `2026-05-31-result-page-checkout-staging-sandbox-qa-v0.md`; `2026-05-31-result-page-checkout-no-card-qa-bypass-v0.md` | Continue using fresh QA suffixes to avoid cached jobs. |
| Result-page CTA path | Passed | `2026-05-31-result-page-checkout-staging-sandbox-qa-v0.md` | Production CTA remains disabled until flags/gates change. |
| Checkout-start page | Passed | `2026-05-31-checkout-start-visual-bridge-staging-smoke-v0.md`; no-card QA reports | Provider form contains required provider fields but payload values are not reportable. |
| NewebPay sandbox payment | Passed | `2026-05-31-fresh-newebpay-sandbox-e2e-payment-smoke-v5.md`; `2026-05-31-result-page-checkout-staging-sandbox-qa-v0.md` | Provider proof still requires real sandbox card smoke after payment-provider changes. |
| NotifyURL decrypt/verify | Passed | `2026-05-31-fresh-newebpay-sandbox-e2e-payment-smoke-v5.md`; `2026-05-31-result-page-checkout-staging-sandbox-qa-v0.md` | Production credentials/URLs remain unproven. |
| Paid transition | Passed | `2026-05-31-result-page-checkout-staging-sandbox-qa-v0.md` | Production transition remains gated. |
| Delivery artifacts | Passed | `2026-05-31-result-page-checkout-staging-sandbox-qa-v0.md` | Entitlement uniqueness applied on staging only. |
| Vercel Queue | Passed | `2026-05-31-result-page-checkout-staging-sandbox-qa-v0.md`; `2026-05-31-result-page-checkout-no-card-qa-bypass-v0.md` | Queue audit persistence remains future tech debt. |
| ReturnURL polling | Passed | `2026-05-31-returnurl-polling-ux-polish-v0.md`; sandbox QA reports | Full visual shell abstraction deferred. |
| Paid access render | Passed | `2026-05-31-result-page-checkout-staging-sandbox-qa-v0.md`; no-card QA reports | Web access remains canonical paid delivery. |
| No-card QA | Passed | `2026-05-31-result-page-checkout-no-card-qa-bypass-v0.md`; `2026-06-01-paid-result-save-cta-browser-email-save-smoke-v0.md` | Does not replace provider sandbox smoke. |
| Recovery soft gate | Passed | `2026-06-01-checkout-start-recovery-soft-gate-staging-qa-v0.md`; `2026-06-01-recovery-contact-preview-staging-env-alignment-v0.md` | Production recovery DB/env not applied. |
| Completed-result Email save | Passed | `2026-06-01-paid-result-save-cta-browser-email-save-smoke-v0.md` | Email sending/magic links not implemented. |
| Production fail-closed checks | Passed | `2026-05-31-result-page-checkout-staging-sandbox-qa-v0.md`; no-card QA reports; browser Email smoke report | Must be rerun around any production env/flag work. |

## 4. Current Production Posture

- Production public pages are live for merchant review: storefront, price, refund, legal, and support surfaces.
- Production payment runtime is disabled.
- Production checkout route fails closed.
- Production fake-paid route fails closed.
- Production recovery DB migration is not applied.
- Production entitlement unique index migration is not applied.
- Production recovery env is not configured for live use.
- Production NewebPay formal credentials are not enabled.
- Production is not growth/ads launched.

## 5. Payment And Recovery Readiness

| Area | Current readiness |
| --- | --- |
| Checkout route / checkout-start | Implemented, staging-proven, launch-aligned, explicit NewebPay handoff. |
| NewebPay NotifyURL | Implemented and staging-proven with real sandbox provider callback after TradeInfo compatibility fix. |
| ReturnURL | Non-mutating, polls status, uses provider notification as payment truth, launch-safe copy. |
| Access page | Session-bound access and paid access token result rendering pass on staging. |
| Paid generation queue | Vercel Queue path and no-card queue regression pass; manual fallback exists. |
| Recovery identity | `payment_recovery_contacts` schema/service exists and is staging-applied. |
| Email save | Checkout-start and completed-result Email save are staging-proven. No Email sending. |
| LINE | Deferred as recovery/support/owned-channel identity, not paid report delivery. |
| Support/refund SOP | Ready; public copy uses web delivery and 3-7 working day handling window. |

## 6. QA Tooling Readiness

| Command | Validates | When to run | Replaces provider smoke? |
| --- | --- | --- | --- |
| `corepack pnpm run qa:env:preflight -- <mode>` | Env name presence/readiness for specific QA modes without printing values. | Before local/staging QA runs or after env changes. | No. |
| `corepack pnpm run qa:fake-paid` | Operator fake-paid delivery, paid artifacts, processor/queue mode depending config. | After payment delivery, queue, processor, or paid access changes. | No. |
| `corepack pnpm run qa:newebpay:sandbox -- create-checkout / poll-status / verify-after-payment` | Real sandbox checkout creation, owner-submitted sandbox payment follow-up, paid status/access verification. | After provider checkout/notify/ReturnURL changes or before production payment gate confidence. | Yes for sandbox provider proof, not production proof. |
| `corepack pnpm run qa:result-checkout:no-card` | Result-page CTA, checkout-start render, operator fake-paid downstream artifacts, queue completion, paid access, production fail-closed. | Fast regression after result/checkout/recovery/access changes. | No. It does not submit NewebPay payment. |

## 7. Deferred Launch Blockers / Gates

Hard blockers before enabling production payment capability:

- NewebPay formal approval and production credential readiness.
- Production Payment Config Dry-Run with runtime disabled.
- Production DB migration gates:
  - entitlement `payment_intent_id` partial unique index.
  - `payment_recovery_contacts` table.
- Production recovery env only after DB gate approval.
- Controlled Production Payment Smoke.
- Rollback/runbook confirmation.
- Support monitoring cadence for launch window.

Non-blockers before Module 02 concept work:

- NewebPay approval.
- Production runtime enablement.
- Production DB migrations.
- LINE push.
- Email sending.
- Full membership.
- Growth/ads launch.

## 8. Recovery / LINE / Membership Roadmap

- Recovery identity is v0, not membership.
- LINE and Email are recovery identities/channels, not canonical paid report delivery.
- Email save is staging-proven before payment and after completed result.
- LINE recovery binding is deferred until recovery-specific LIFF state exists.
- Email sending, magic links, and support-assisted recovery links are deferred.
- Lightweight membership can later grow from recovery identity, but should not be introduced before production payment and Module 02 direction are clearer.
- Personal Insight Graph remains future; no heavy database/memory system should be built during this gate.

## 9. Module 02 Readiness

Module 02 Concept Spec can start now.

Reasons:

- Module Grammar v0 is complete and provides a product architecture contract.
- Module 01’s core launch path is stable enough and protected by sandbox/no-card/recovery smoke checks.
- Payment and recovery architecture conceptually supports future modules without requiring a new payment abstraction now.
- NewebPay approval is not required for product/spec work.
- Production runtime enablement is not required for Module 02 concept work.

Recommendation:

- Next product task should be `Module 02 Concept Spec: 職場暗流雷達 v0`.
- Do not start full Module 02 implementation yet.
- Do not implement multi-module homepage portal yet; wait until Module 02 concept and Claude Design direction are reconciled.

## 10. Risk / Refactor Boundaries During Review Wait

Safe during NewebPay review wait:

- Product spec work.
- Module 02 concept/spec.
- UX polish that does not change payment provider behavior.
- QA tooling and smoke automation.
- Dashboard/reporting/status sync.
- Module grammar and copy planning.
- Controlled refactor with smoke gates.

Medium risk; require smoke gate:

- Checkout-start / ReturnURL / access page refactors.
- Paid delivery artifact helper changes.
- Queue processor or payment status changes.
- Recovery contact service changes.

Required smoke gates for medium-risk changes:

- Normal analyze/result smoke.
- `qa:result-checkout:no-card`.
- Relevant targeted tests.
- Production fail-closed checks.
- Real sandbox provider smoke if checkout/NotifyURL/provider behavior changes.

Still gated:

- Production payment runtime.
- Production provider credentials.
- Production DB migrations.
- LINE push.
- Email sending.
- Membership/login.
- Paid ads / growth launch.

## 11. Recommended Next 3 Tasks

1. `Module 02 Concept Spec: 職場暗流雷達 v0`
   - Why: Product exploration can proceed without touching production payment, and Module Grammar v0 should now be used to derive the second module rather than inventing a standalone test.

2. `Recovery Link / Support-Assisted Recovery Plan v0`
   - Why: Recovery identity and Email save are proven, but actual recovery still needs a short-lived link/support workflow that avoids raw `pa_`/`pcs_` exposure.

3. `Production Payment Config Dry-Run Plan v0`
   - Why: If NewebPay approval arrives, the team needs a ready sequence for production env configuration with runtime still disabled, production DB gates, and controlled smoke preparation.

Alternate if design is the priority:

- `Payment Shell + Module Accent Implementation Plan v0`, but implementation should wait until Module 02 concept clarifies reusable accent requirements.

## 12. Dashboard Update

Dashboard updated to reflect:

- Current phase: Module 01 launch-gate snapshot complete.
- Payment recovery is staging-verified through completed-result Email save.
- Launch gate model now separates Payment Capability, Soft Public Availability, and Growth / Ads Launch.
- Next recommendation prioritizes Module 02 concept/spec unless launch-support or provider approval work becomes more urgent.

## 13. Validation

Documentation-only validation:

- docs presence check: passed.
- dashboard HTML sanity: passed.
- secret/private scan: passed.
- `git diff --check`: passed.

No app code changed; lint/test/build are not required unless unexpected code changes appear.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed:
  - Production DB migration gates remain manual and separate.
  - Queue audit persistence remains deferred.
  - Browser/manual QA is still needed for real provider and server-action form proofs.
  - Production/support recovery link flow remains unimplemented.
- Opportunistic cleanup completed: dashboard gate/status wording updated.
- Deferred cleanup candidates:
  - Production DB migration gate runbooks for entitlement uniqueness and recovery contacts.
  - Recovery link/support-assisted recovery design.
  - Queue audit persistence.
  - Non-tokenized operator-only browser form verification helper if repeated manual browser smokes become frequent.

## Suggested Next Step

Run `Module 02 Concept Spec: 職場暗流雷達 v0` if product exploration is the priority. If NewebPay approval arrives first, run `Production Payment Config Dry-Run Plan v0` with runtime still disabled.
