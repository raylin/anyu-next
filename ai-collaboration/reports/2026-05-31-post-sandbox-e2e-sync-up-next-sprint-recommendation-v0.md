# Post-Sandbox E2E Sync-Up / Next Sprint Recommendation v0

Date: 2026-05-31

## Summary

Fresh NewebPay Sandbox E2E Payment Smoke v5 changed the project state: the provider-payment engineering path is no longer the main unknown. The highest-value work while waiting for NewebPay review is now launch-readiness polish that keeps production payment disabled.

Recommendation: use the review waiting window for **payment-launch UX alignment, secret-safe QA tooling, and production-launch runbook readiness**, not new product expansion.

Top 3 recommended Codex tasks:

1. **Module 01 Payment Launch UX Alignment Plan v0**
2. **Secret-Safe NewebPay Sandbox E2E Helper v0**
3. **Production Payment Config Dry-Run Plan / Preflight Script v0**

## 1. Current State Confirmation

| Area | Current status |
|---|---|
| Product / Module 01 | Low-key production active / monitor. Free analysis and paid-report value proposition exist. |
| Public production pages | `anyu.tw`, `/refund`, and `/legal` are live with product/service/price/refund/support content. |
| Payment runtime | Production runtime remains disabled. Production checkout and fake-paid routes fail closed. |
| NewebPay sandbox | Fresh sandbox v5 passed end-to-end after TradeInfo 32-byte padding fix. |
| Queue | Vercel Queues adapter, targeted processor, staging smoke, dashboard observation, and sandbox v5 path are proven. |
| Manual fallback | Manual processor fallback was previously retested and passed. It was not needed in v5. |
| Support/refund SOP | SOP exists for duplicate payment, paid-but-no-result, stuck processing, access issues, generation failure, and refund requests. |
| Launch gate | Production launch plan exists; next formal step after approval is production config dry-run with runtime still disabled. |
| Merchant review | Supplement submitted externally; waiting for NewebPay review / formal production credential readiness. |

## 2. Safe Work Categories During Review Wait

| Category | Safe now? | Notes |
|---|---:|---|
| Product conversion / landing | Yes | Public homepage is review-ready; optimize only if changes are low-risk and not misleading about disabled payment. |
| Paid result value | Yes | Strong candidate: review free result → paid preview → paid result promise/value consistency. |
| UX / mobile polish | Yes | Low-risk if visual-only and validated; avoid changing runtime flow semantics. |
| QA tooling / sandbox helper | Yes | High leverage: v5 required repeated ad hoc scripts and manual forms. |
| Env/preflight scripts | Yes | Useful if they report only presence/categories and never values. |
| Dashboard/reporting | Yes | Keep lightweight; dashboard is current after v5. |
| Tech debt / cleanup | Yes | Best targets are stale naming/docs, QA helpers, and launch checklists. Avoid schema churn unless explicitly approved. |
| Launch readiness docs | Yes | Useful while review is pending. |
| Deferred post-launch items | Defer | LINE delivery, refund tooling automation, broad ads, new product portal. |

## 3. Ranked Candidate Tasks

### P0

No code P0 exists while production payment remains disabled and sandbox E2E has passed.

Operational P0 if approval arrives:

| Task | Why it matters | Risk | Impact | Scope | Runtime touch | Recommended Codex task title |
|---|---|---:|---:|---|---|---|
| Production config dry-run | Prevents launch mistakes with real credentials. | Medium | High | Ops/docs + safe preflight | Env inspection only; no enablement | `Production Payment Config Dry-Run v0` |

### P1: Best To Do Now

| Task | Why it matters | Risk | Impact | Scope | Runtime touch | Recommended Codex task title |
|---|---|---:|---:|---|---|---|
| Align in-product paid CTA/copy for launch | Homepage says NT$49 web delivery; result CTA still says internal test / no charge / LINE or Email. This mismatch should be resolved before production payment launch. | Low-Medium | High | Product UX plan, then small implementation later | Copy/UI only if implemented | `Module 01 Payment Launch UX Alignment Plan v0` |
| Secret-safe sandbox E2E helper | v5 required temporary scripts, manual form generation, and careful polling. A helper reduces future smoke risk. | Low | High | Script/test tooling | Staging/operator tooling only | `Secret-Safe NewebPay Sandbox E2E Helper v0` |
| Production payment env/config dry-run plan/preflight | Owner will need a deterministic checklist before real credentials are configured. | Low | High | Docs or safe script | No runtime enablement | `Production Payment Config Dry-Run Plan / Preflight Script v0` |

### P2: Useful But Not Urgent

| Task | Why it matters | Risk | Impact | Scope | Runtime touch | Recommended Codex task title |
|---|---|---:|---:|---|---|---|
| Payment launch visual/mobile QA | Reduce friction for first real users after launch. | Low | Medium | Browser QA + minor CSS recommendations | UI only if implemented later | `Module 01 Mobile Checkout UX Review v0` |
| Payment/support observability checklist | Helps first-week operations stay boring. | Low | Medium | Docs/checklist | None | `First 10 Payments Monitoring Checklist v0` |
| Rename stale `payment_success_future` label | Reduces ops confusion; behavior is correct. | Medium | Medium | Code/tests, possibly DB data consideration | Internal labels only | `Payment Trigger Source Naming Cleanup Plan v0` |
| Main/staging docs sync | Avoid release-source confusion before launch. | Low | Medium | Git/ops docs | None | `Release Branch Documentation Sync v0` |
| Old Vercel project/domain cleanup | Avoid domain/project ambiguity. | Low | Medium | Owner UI action + report | None | `Vercel Domain Ownership Cleanup v0` |

### P3: Defer Until After Real Payment Launch

| Task | Why defer | Risk if done now | Recommended Codex task title |
|---|---|---:|---|
| LINE delivery | Adds another delivery channel before payment launch is proven. | High distraction | `LINE Paid Delivery Planning v0` |
| Refund tooling automation | Manual SOP is sufficient for first low-volume launch. | Medium distraction | `Refund Tooling Design v0` |
| Ads / broader traffic prep | Payment launch gate is not complete. | High business risk | `Post-Launch Traffic Ramp Plan v0` |
| New product portal / account system | Not needed for first paid validation. | High scope creep | Defer |

## 4. Product Opportunities

Source surfaces reviewed:

- Root homepage: `apps/web/src/app/page.tsx`
- Module 01 landing: `apps/web/src/app/m/[moduleSlug]/page.tsx`
- Result page: `apps/web/src/app/m/[moduleSlug]/result/[resultId]/page.tsx`
- Paid preview CTA: `apps/web/src/components/anyu/PaidPreviewCard.tsx`
- Return/access pages: `apps/web/src/app/m/[moduleSlug]/payment/return/page.tsx`, `apps/web/src/app/m/[moduleSlug]/payment/access/page.tsx`
- Refund/legal pages: `apps/web/src/app/refund/page.tsx`, `apps/web/src/app/legal/page.tsx`

Main finding:

- The public homepage is aligned for merchant review: product/service, NT$49, one-time charge, web delivery, refund/support, limitations.
- The in-product result paid preview still says: “目前內測不會真的收費” and “網頁或 LINE 連結交付”. That is safe while payment runtime is disabled, but it will conflict with the launch flow after production checkout is enabled.

Recommendation:

- Next sprint should start with **landing/result payment-launch UX alignment**, not deeper provider engineering.
- The best narrow scope is a planning/review task that defines the exact copy/state behavior for:
  - runtime disabled
  - staging/operator sandbox
  - production controlled smoke
  - production public checkout

Do not implement the copy change until the owner confirms whether the result page should still show the internal-test path while review is pending.

## 5. Engineering Cleanup Opportunities

| Item | Recommendation before production launch | Why |
|---|---|---|
| Sandbox E2E helper | Do now. | Repeated manual scripts are the highest-friction QA step. |
| Env readiness script | Do before production config dry-run. | Reduces risk when formal credentials arrive. |
| QA runner aliases | Useful with helper. | Makes queue/manual/sandbox checks repeatable. |
| Dashboard update cadence | Keep manual for now. | Dashboard is current; automation is not needed yet. |
| `payment_success_future` naming | Plan now, implement later unless migration-free. | Stale but not launch-blocking. |
| Entitlement/payment uniqueness | No immediate action. | E2E/idempotency has passed; avoid schema churn. |
| Old Vercel project/domain ambiguity | Owner UI cleanup before launch if possible. | Avoids deployment/domain confusion. |
| Local git/FETCH_HEAD issue | Monitor. | No current lock issue. |
| Main/staging sync policy | Do before production launch gate. | Staging has recent docs commits; main is production source-of-truth for future launches. |

## 6. Guardrails While Waiting

Do not:

- Enable production payment runtime.
- Enable public production checkout.
- Modify production env or flags.
- Run real payments.
- Start ads or broader traffic.
- Add LINE paid delivery unless explicitly prioritized.
- Add a major product portal/account system.
- Configure provider production credentials before approval/formal credential readiness.
- Change NewebPay production behavior outside a named launch-gate task.

## 7. Recommended Next 3 Tasks

### 1. Module 01 Payment Launch UX Alignment Plan v0

Codex action:

- Review public homepage, result paid preview, disabled-payment copy, checkout CTA path, return/access pages, refund/legal references.
- Produce a state-by-state UX/copy plan before implementation.

Owner decision:

- Confirm whether result page should keep “內測不收費” until approval, or switch to launch-ready copy behind a feature flag/state.

### 2. Secret-Safe NewebPay Sandbox E2E Helper v0

Codex action:

- Plan or implement a helper that creates a source result, creates a checkout, writes a temporary form outside the repo, stores a local state file, and polls sanitized status after owner payment.
- Must never print `TradeInfo`, `TradeSha`, `pcs_`, `pa_`, provider secrets, tokenized URLs, or raw user input.

Owner decision:

- Confirm whether this should be implemented now or kept as a runbook until the next sandbox smoke.

### 3. Production Payment Config Dry-Run Plan / Preflight Script v0

Codex action:

- Define safe production env readiness checks by env name only.
- Verify fail-closed behavior with runtime disabled.
- Prepare exact dry-run checklist for formal production credentials.

Owner decision:

- Confirm whether formal credentials/approval are available. If not, this remains a ready-to-run plan.

## Dashboard Status

The dashboard is already current after `ANYU Project Dashboard Update after Sandbox E2E Pass v0`; no dashboard edit was needed in this task.

## Recommended Next Step

Run **Module 01 Payment Launch UX Alignment Plan v0** first.

Reason: sandbox E2E is now proven, but the user-facing in-product paid CTA still reflects the internal-test / LINE-or-Email era. Aligning that before production payment config work reduces launch confusion without increasing production risk.

