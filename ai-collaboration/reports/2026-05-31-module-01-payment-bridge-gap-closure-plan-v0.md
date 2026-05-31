# Module 01 Payment Bridge Gap Closure Plan v0

Date: 2026-05-31

## Executive Summary

Module 01 payment readiness is strong. The provider-critical path has already passed through sandbox card payment and the real result-page CTA path:

```text
result page CTA
→ checkout-start
→ NewebPay sandbox
→ ReturnURL/status/access
→ NotifyURL verified
→ payment_intent paid
→ entitlement / paid access hash / generation_job
→ Vercel Queue
→ completed paid result
```

The remaining gaps are not provider correctness gaps. They are product-UX continuity, repeatable QA, and future multi-module architecture boundaries.

Recommended next implementation task:

1. `Result-Page Checkout No-Card QA Bypass v0`
2. Then `ReturnURL Visual Continuity Polish v0`
3. Keep full Payment Shell + Module Accent abstraction and multi-module return abstraction deferred until Module 02 payment requirements exist.

## 1. Five Payment UX Concerns

| Concern | Status | Current Evidence | Recommendation |
|---|---|---|---|
| A. LINE mobile / LIFF CTA timing | planned but not implemented | LINE/LIFF exists for legacy unlock/short-code fulfillment. Launch copy now avoids paid LINE delivery promises. | Keep LINE out of checkout-start. Later use it only for notification/save-for-later/support after paid notification is explicitly designed. |
| B. ReturnURL polling and possible LINE notification | partially addressed | `PaymentReturnPoller` now polls status, keeps ReturnURL non-mutating, and handles waiting/processing/ready/failed/invalid states. | Do small visual continuity polish next if UX polish is prioritized. Do not add LINE notification yet. |
| C. First-party visual continuity across input/result/checkout-start/ReturnURL/access | partially addressed | Result and checkout-start now use Module 01/Riso continuity. ReturnURL/access use ModuleThemeBoundary but still have simpler generic card structure. | Small ReturnURL visual polish is justified. Avoid full shell abstraction until Module 02 proves shared needs. |
| D. No-card development/test path for result-page checkout flow | planned but not implemented | Sandbox helper tests provider card flow. Fake-paid QA tests downstream artifacts. No script currently verifies result page CTA → checkout-start → fake paid → status/access without card entry. | Highest-value next task: add a script-driven staging-only no-card QA path using server-side operator secret only. |
| E. Unified callback / multi-module payment return abstraction | deferred | NotifyURL is already provider-level unified. ReturnURL is module-specific. `pcs_` carries module context. | Keep module-specific ReturnURL for Module 01. Revisit when Module 02 has payment design. |

## 2. Current Implementation Inventory

### Result Page

- Route: `/m/[moduleSlug]/result/[resultId]`
- File: `apps/web/src/app/m/[moduleSlug]/result/[resultId]/page.tsx`
- Computes `checkout_available` only when `canStartNewebPayCheckoutFromResult()` allows it.
- Passes `checkoutHref` to `AiTemperatureResult` only when checkout is available.
- Production-disabled state remains review-pending / disabled.

### Paid CTA

- File: `apps/web/src/components/anyu/PaidPreviewCard.tsx`
- Uses `buildPaidCtaViewModel()`.
- Launch-aligned states exist for review pending, checkout available, waiting, processing, ready, failure/support, invalid/expired, and already unlocked.
- Does not use ContactCapture as the main paid CTA.

### Checkout-Start

- Route: `/m/[moduleSlug]/result/[resultId]/checkout`
- File: `apps/web/src/app/m/[moduleSlug]/result/[resultId]/checkout/page.tsx`
- Server-rendered checkout creation.
- Uses Module 01 visual bridge:
  - ANYU wordmark / back link
  - `MODULE 01`
  - payment stepper
  - order summary
  - NewebPay trust bridge
  - support/refund footer
- Server-side operator gate can be used for staging while production runtime remains off.
- Does not expose `OPERATOR_TEST_SECRET`, HashKey, or HashIV.

### ReturnURL

- Route: `/m/[moduleSlug]/payment/return`
- Files:
  - `apps/web/src/app/m/[moduleSlug]/payment/return/page.tsx`
  - `apps/web/src/components/modules/ai-temperature/PaymentReturnPoller.tsx`
- Non-mutating.
- Polls payment status via `POST /api/modules/[moduleSlug]/payment/status`.
- States:
  - `waiting_for_payment`
  - `paid_processing`
  - `paid_ready`
  - `paid_failed`
  - `invalid_session`
  - `expired_session`
  - `timeout`
- Ready state shows `查看完整報告`.

### Payment Access

- Route: `/m/[moduleSlug]/payment/access`
- File: `apps/web/src/app/m/[moduleSlug]/payment/access/page.tsx`
- Resolves `pcs_` checkout handoff.
- Renders completed paid result only when state is `paid_ready`.
- Otherwise shows safe fallback.

### NotifyURL

- Route: `/api/payments/newebpay/notify`
- File: `apps/web/src/app/api/payments/newebpay/notify/route.ts`
- Provider-level unified callback.
- Responds `1|OK` or `0|ERROR`.
- Logs safe category-only diagnostics.
- No module-specific NotifyURL route is needed for Module 01.

### Sandbox Helper

- Script: `apps/web/scripts/newebpay-sandbox-e2e-helper.mjs`
- Modes:
  - `create-checkout`
  - `poll-status`
  - `verify-after-payment`
- Generates a temporary NewebPay form under `/private/tmp`.
- Proves provider E2E, but bypasses the result-page CTA UI path.

### Fake-Paid QA Runner

- Script: `apps/web/scripts/authorized-fake-paid-qa.mjs`
- Route: `POST /api/operator/fake-paid-success`
- Creates/reuses paid delivery artifacts without provider payment.
- Useful for downstream delivery QA, but it currently starts from API/operator flow, not result page → checkout-start.

### LINE / LIFF

- Current LINE/LIFF code supports legacy unlock/fulfillment short-code and diagnostics.
- Public copy frames LINE as notification/support, not paid report delivery.
- LINE should remain outside the core paid delivery promise.

### Claude Design Reference

- Stored under `ai-collaboration/design/2026-05-31-payment-shell-module-accent/`.
- Direction C is the product reference:
  - fixed ANYU payment shell
  - thin module accent layer
  - checkout-start and ReturnURL as the key bridge screens
- Prototype includes demo-only LINE/Email notification and no-charge copy that must not be reused.

## 3. Gap 1: ReturnURL Visual Continuity

Current state:

- ReturnURL has strong state/copy behavior.
- It uses ModuleThemeBoundary, AnyuMark, waiting bar, process steps, and support/refund links.
- It does not yet share the checkout-start bridge elements:
  - top wordmark/back link
  - Module 01 identity block
  - payment stepper shell
  - order summary/trust-line rhythm

Options:

| Option | Assessment |
|---|---|
| No change | Acceptable for launch, because state/copy is safe and validated. |
| Small ReturnURL visual polish | Best near-term UX option. Bring ReturnURL closer to checkout-start without changing payment logic. |
| Shared payment bridge wrapper | Reasonable only if it is a small local helper used by checkout-start and ReturnURL. Medium risk because it touches two validated screens. |
| Full Payment Shell abstraction | Too early before Module 02 payment requirements. |

Recommendation:

- Do `ReturnURL Visual Continuity Polish v0` only if owner wants another payment UX task before Module 02.
- Keep it small:
  - add wordmark/back-to-result or safe neutral navigation
  - reuse `付款 / 生成 / 完成` stepper with active state
  - keep existing poller logic unchanged
  - no shared global shell yet

Smoke gate:

- ReturnURL poller tests.
- Result-page checkout staging sandbox QA or no-card QA after implementation.
- Production fail-closed checks.

## 4. Gap 2: No-Card Result-Page Checkout QA Bypass

Goal:

```text
fresh analyze/result
→ result page CTA visible
→ checkout-start renders
→ server-side operator fake-paid success
→ ReturnURL/status/access verifies paid_ready
→ completed paid result renders
```

Evaluated options:

| Option | Risk | Value | Notes |
|---|---:|---:|---|
| A. QA script drives result page/checkout-start then calls operator fake-paid server-side | Low | High | Best option. No browser secret exposure. No fake UI. Production impossible if route stays gated. |
| B. Hidden operator-only test mode on checkout-start | Medium | Medium | Adds user-facing route complexity and risk of accidental exposure. Avoid for now. |
| C. Helper-only path | Low | Medium | Existing helper is useful but does not cover result-page CTA/checkout-start UX. |
| D. Do nothing | Low | Low | Leaves repeated sandbox card entry as the only full path proof. |

Recommendation:

- Implement `Result-Page Checkout No-Card QA Bypass v0` as a script, not a UI feature.
- Extend or add a QA script that:
  - loads `.env.local` through existing local env loader
  - creates fresh staging result
  - fetches result page and asserts paid CTA + checkout-start href
  - fetches checkout-start and asserts bridge/form/copy
  - calls `POST /api/operator/fake-paid-success` with `OPERATOR_TEST_SECRET` from server-side script only
  - polls `POST /api/modules/[moduleSlug]/payment/status` or paid access status
  - verifies access page renders completed paid result
  - confirms production checkout/fake-paid remain 404

Important limitation:

- This bypass proves ANYU UI and downstream delivery, not NewebPay provider behavior.
- Keep sandbox card smoke as final provider proof before production launch.

## 5. Gap 3: LINE / LIFF Role

Near-term:

- Do not add LINE to checkout-start.
- Do not add LINE as paid delivery.
- Keep web access canonical.
- Keep LINE as:
  - support
  - save-for-later
  - future notification
  - legacy short-code continuity

Potential future CTA placements:

| Surface | Recommendation |
|---|---|
| Free result | Secondary only; do not compete with paid CTA. |
| Checkout-start | Avoid. Payment confidence should stay focused. |
| ReturnURL waiting | Best future location for optional completion notification. |
| Paid ready | Optional save/remind CTA after the primary access CTA. |
| Completed result | Possible share/save path, but requires privacy and retention decision. |

Do not implement LINE notification until there is a dedicated paid-notification design and data retention decision.

## 6. Gap 4: Multi-Module Return Abstraction

Current architecture:

- NotifyURL is already unified at provider level:
  `/api/payments/newebpay/notify`
- ReturnURL is currently module-specific:
  `/m/[moduleSlug]/payment/return`
- `pcs_` session carries module context and access handoff.

Recommendation:

- Keep module-specific ReturnURL for Module 01.
- Do not introduce `/payment/return` yet.
- When Module 02 payment exists, add a route descriptor or module registry entry for payment surfaces:
  - result route
  - checkout-start route
  - return route
  - access route
  - product label
  - price
  - paid artifact label

Avoid over-abstracting before the second paid module proves what actually varies.

## 7. Refactor Risk Boundaries

### Safe During Review Wait

- Documentation and plans.
- QA helper/script improvements.
- Copy tests and no-secret assertions.
- Small visual polish that does not change routes, tokens, provider fields, or payment state transitions.
- Dashboard/status updates.

### Medium Risk: Requires Smoke Gate

- Shared local wrapper between checkout-start and ReturnURL.
- Result-page checkout no-card QA script.
- ReturnURL visual polish.
- Payment status/access presentation changes.
- Any changes touching `pcs_` handoff, access path construction, or poller state mapping.

Required smoke gates:

- normal analyze/result
- result-page CTA and checkout-start HTML smoke
- no-card fake-paid QA once implemented
- sandbox card E2E only before production launch or after provider/crypto changes
- production checkout/fake-paid fail-closed checks

### Should Not Do Yet

- Full Payment Shell + Module Accent framework.
- Unified `/payment/return`.
- LINE paid notification/delivery.
- Module 02 implementation.
- Production payment runtime enablement.
- Production DB migration apply unless in launch gate.
- Provider behavior changes without evidence.

## 8. Recommended Next Tasks

### 1. Result-Page Checkout No-Card QA Bypass v0

- Priority: P1.
- Why: Highest leverage for repeated safe QA while waiting for merchant approval.
- Risk: low-medium.
- Touches runtime: no, if implemented as script-only against existing routes.
- Smoke gate: script dry runs, fake-paid QA, production fail-closed.

### 2. ReturnURL Visual Continuity Polish v0

- Priority: P1/P2.
- Why: The current poller is functionally strong; visual continuity can still improve trust after provider return.
- Risk: medium because ReturnURL is already validated.
- Touches runtime: presentation only.
- Smoke gate: ReturnURL/poller tests and no-card QA or sandbox smoke.

### 3. Payment Shell + Module Accent Implementation Plan v0

- Priority: P2.
- Why: Convert Claude Direction C into an implementation boundary before Module 02, without coding the abstraction yet.
- Risk: low as planning.
- Touches runtime: no.

### 4. Module 02 Concept Spec: 職場暗流雷達 v0

- Priority: P2.
- Why: Product direction should progress while payment launch waits.
- Risk: low if kept to spec only.
- Touches runtime: no.

### 5. Multi-module Homepage Review after Claude Design

- Priority: P2/P3.
- Why: Homepage should not broaden before Module 02 direction is clearer.
- Risk: low as review, higher if implemented too early.
- Touches runtime: no if planning only.

## 9. Suggested Task Order

Recommended sequence:

1. `Result-Page Checkout No-Card QA Bypass v0`
2. `ReturnURL Visual Continuity Polish v0`
3. `Module 02 Concept Spec: 職場暗流雷達 v0`
4. `Payment Shell + Module Accent Implementation Plan v0`

If NewebPay approval arrives before these are complete, switch to:

1. `Production Payment Config Dry-Run v0`
2. production unique-index migration gate
3. controlled production payment smoke

Production runtime should remain disabled until the explicit launch gate decision.

## Validation

- Documentation presence check: pending at report creation.
- Secret/private scan: pending at report creation.
- `git diff --check`: pending at report creation.
- No app code changes were made.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed:
  - no script-driven no-card QA for result-page checkout path yet
  - ReturnURL visual shell is less complete than checkout-start
  - full Payment Shell abstraction remains intentionally deferred
- Opportunistic cleanup completed: none; planning-only task.
- Deferred cleanup candidates:
  - no-card QA script
  - ReturnURL visual bridge polish
  - module payment route descriptor after Module 02 design
