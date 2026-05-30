# Post-Sandbox Next Sprint Scan with Multi-Module Direction v0

Date: 2026-05-31

## Summary

Fresh NewebPay Sandbox E2E Payment Smoke v5 removed the largest provider-flow unknown. The safest review-wait sprint is not more payment plumbing and not a full second paid product. It should combine:

- Module 01 launch UX lock-down.
- A lightweight homepage / cross-link direction that preserves merchant-review clarity.
- Module 02 concept/spec exploration without implementing a second paid flow.
- Small QA/tooling cleanup that lowers launch risk.

Recommended next 3 tasks:

1. `Module 01 Launch UX Lock + Multi-State Paid CTA Plan v0`
2. `Module 02 Concept Spec + Homepage Cross-Link Plan v0`
3. `Secret-Safe NewebPay Sandbox E2E Helper v0`

## 1. Current State Confirmation

| Area | Current status |
|---|---|
| Module 01 product flow | Low-key production active / monitor. Free analysis, paid preview, paid delivery, and session-bound paid access exist. |
| Public homepage/storefront | Production public content is live and merchant-review aligned: product/service, preview, NT$49, one-time payment, web delivery, refund/support, `/refund`, and `/legal`. |
| Payment runtime | Production payment runtime remains disabled. Production checkout and fake-paid routes fail closed. |
| NewebPay sandbox | Sandbox v5 passed end-to-end after the NewebPay-compatible 32-byte TradeInfo padding fix. |
| Queue | Vercel Queues adapter, targeted generationJobId consumer, queue-mode smoke, dashboard observation, and sandbox v5 queue path are proven. |
| Support/refund SOP | Owner/operator SOP exists for duplicate payments, paid-but-no-result, stuck processing, access failures, generation failure, and refund requests. |
| Launch gate | Production Payment Launch Gate Plan exists. Hard blockers remain merchant approval/formal credentials, production config dry-run, and controlled production smoke. |
| Merchant review | Supplement submitted externally; review outcome is pending. |
| Dashboard | Dashboard reflects sandbox E2E pass and production-disabled posture. It needed a small update for review-wait multi-module sprint direction. |

## 2. Module 01 Stabilization Review

Source surfaces inspected:

- `apps/web/src/app/page.tsx`
- `apps/web/src/app/m/[moduleSlug]/page.tsx`
- `apps/web/src/app/m/[moduleSlug]/result/[resultId]/page.tsx`
- `apps/web/src/app/m/[moduleSlug]/payment/return/page.tsx`
- `apps/web/src/app/m/[moduleSlug]/payment/access/page.tsx`
- `apps/web/src/components/modules/ai-temperature/AiTemperatureLanding.tsx`
- `apps/web/src/components/modules/ai-temperature/AiTemperatureResult.tsx`
- `apps/web/src/components/anyu/PaidPreviewCard.tsx`
- `apps/web/src/content/modules/index.ts`
- `apps/web/src/content/modules/ai-temperature.ts`
- `apps/web/src/lib/modules/types.ts`

### Lock Before Broader Traffic

Do not change these unless a concrete bug or launch-gate requirement appears:

| Area | Lock recommendation | Why |
|---|---|---|
| Analyze prompt/result semantics | Lock | Evidence Anchoring and Module 01 output quality have already been tuned. |
| Result schema / prompt version | Lock | Schema/prompt changes create regression risk and require explicit decision logs. |
| NewebPay checkout/notify/access behavior | Lock | Sandbox E2E passed; avoid destabilizing provider flow before production launch. |
| Queue consumer targeting | Lock | Exact generationJobId processing is proven and should stay narrow. |
| Public product/price/refund copy | Lock unless owner approves policy change | Merchant-review evidence depends on clarity and consistency. |
| NT$49 launch price | Lock unless owner makes pricing decision | Price must stay consistent across homepage, checkout amount, and provider payment. |
| Production disabled posture | Lock until launch gate | Prevents accidental broad public payment exposure. |

### Small Polish Worth Doing

| Item | Why now | Risk |
|---|---|---:|
| Multi-state paid CTA plan | `PaidPreviewCard` still references internal-test/no-charge and LINE-or-Email era copy. This should be aligned before production payment launch. | Low if planned first |
| Mobile CTA / contrast pass | Low-risk conversion polish before any broader traffic. | Low |
| Payment-disabled vs launch-ready copy states | Helps avoid confusing users while review is pending. | Low |
| Support/refund response-window confirmation | Public/SOP wording should match owner operations. | Low |
| Result-to-checkout launch path review | Ensures the free result, paid preview, checkout, ReturnURL, and access pages feel coherent. | Medium if implemented without plan |

### Regression Protection

Recommended smoke/test protections before production payment launch:

- Module 01 analyze route validation and result rendering.
- Free result page render with paid preview visible.
- Checkout route disabled/fail-closed production behavior.
- Checkout creation happy path in staging/sandbox.
- NotifyURL valid, invalid, malformed, duplicate, amount mismatch, and payment_intent matching tests.
- Queue consumer exact generationJobId behavior.
- Session-bound ReturnURL/status/access render.
- Secret-safe sandbox E2E helper once implemented.

## 3. Homepage / Entry Portal Direction

The current homepage is correctly optimized for NewebPay merchant review. It should not be replaced with a broad portal while review is pending.

Low-risk evolution path:

1. Keep Module 01 product/service/price/refund evidence visible and above any broad portal content.
2. Add a small `更多暗語測驗 / 即將推出` section only after Module 02 concept direction is selected.
3. Use cross-link cards as gentle signals, not a full product catalog yet.
4. Keep NT$49, refund, support, and legal links visible for merchant-review clarity.
5. After merchant approval and production payment launch, consider a hybrid homepage: ANYU brand hero, featured Module 01, coming-soon module cards, and persistent product/legal block.

Avoid:

- Hiding Module 01 price/refund/support content.
- Making the homepage look like a broad SaaS portal before there are multiple real modules.
- Adding many vague coming-soon cards without a selected Module 02 direction.

## 4. Second Module / Second Model Exploration

| Option | Product learning | Risk | Scope | Recommendation |
|---|---:|---:|---|---|
| A. Research/spec only for Module 02 | High | Low | Docs/spec | Do now. |
| B. Coming-soon placeholder/cross-link only | Medium | Low | Homepage/content | Do after Module 02 concept is selected. |
| C. Lightweight free-only second module | Medium-High | Medium | New prompt/UI/result surface | Defer until Module 01 launch UX is locked. |
| D. Full paid second module | High | High | Product + payment/result integration | Do not do before Module 01 production launch. |
| E. Do nothing until launch | Low | Low | None | Too passive; wastes review-wait window. |

Recommendation: start with **Module 02 concept/spec + homepage cross-link plan**, not implementation.

## 5. Candidate Module 02 Directions

| Candidate | One-line hook | Input type | Free output idea | Future paid output idea | Shareability | Complexity | Fit |
|---|---|---|---|---|---:|---:|---|
| 關係紅旗雷達 | 這是紅旗，還是我太敏感？ | Recent interaction or boundary incident | Red/yellow/green signal map and emotional risk read | Boundary script, decision tree, 7-day observation plan | High | Medium | Strong relationship insight; actionable but must avoid over-certainty. |
| 社群微訊號讀心卡 | 他看限動卻不回，是什麼訊號？ | Social behavior pattern | Signal clusters and ambiguity read | Low-pressure response plan and what-not-to-do list | High | Low-Medium | Taiwan-market friendly, shareable, adjacent to Module 01 but distinct. |
| 價值觀落差雷達 | 我們是不是看著不同的未來？ | Recurring disagreement or future-plan mismatch | Mismatch domains and conversation risk | Deep compatibility questions and next-conversation guide | Medium | Medium-High | Expands beyond ambiguity into relationship depth. |
| 邊界感翻譯器 | 我拒絕了，為什麼他還是不懂？ | Boundary scenario and response history | Boundary clarity read and emotional pattern | Exact wording, escalation ladder, safety-aware next steps | Medium | Medium | Useful and premium, but needs careful tone/safety boundaries. |
| 心動慣性圖譜 | 我是不是每次都被同一種人吸引？ | Repeated pattern across 2-3 experiences | Attraction pattern archetype | Personal Insight Graph seed and pattern interruption guide | High | Medium | Best bridge toward repeated mini-tests and richer personal insight graph. |

Best first spec candidate: **社群微訊號讀心卡** if the goal is low implementation risk and shareability, or **心動慣性圖譜** if the goal is to seed the Personal Insight Graph direction earlier.

## 6. Cross-Link / Multi-Module Architecture Scan

Current architecture:

- Routing is already slug-based: `/m/[moduleSlug]`, result routes, payment return/access routes, and module API routes.
- Module metadata exists in `apps/web/src/content/modules/*`.
- Only `aiTemperatureModule` exists today.
- Page rendering is still Module 01-specific: module landing/result/access components use `AiTemperature*` and `UnlockCompleted`.
- Homepage is hand-authored provider-review storefront, not module-card driven.
- Payment/result infrastructure can likely be reused, but result rendering and module-specific visual adapters remain Module 01-specific.

Minimal abstraction recommendation:

| Now | Later |
|---|---|
| Keep existing routing. | Generalize result renderer only after Module 02 spec proves different shape needs. |
| Define Module 02 metadata/spec in docs. | Add module catalog metadata fields when the first real cross-link card is implemented. |
| Add at most a small homepage coming-soon section after concept selection. | Build full portal once there are 3-5 credible module concepts or 2 implemented modules. |
| Keep checkout/payment infrastructure unchanged. | Share paid unlock infrastructure when a second paid module is actually built. |

Avoid over-abstracting before Module 02’s input/output shape is selected.

## 7. Code Quality / Cleanup Candidates

| Priority | Item | Value | Risk if deferred | Recommendation |
|---|---|---|---|---|
| P1 | Module 01 launch UX / paid CTA state plan | High | Confusing user-facing copy at launch | Do next. |
| P1 | Module 02 concept spec + homepage cross-link plan | High | Multi-module direction stays abstract | Do next. |
| P1 | Secret-safe sandbox E2E helper | High | Future smokes remain ad hoc and error-prone | Do this sprint. |
| P2 | Env readiness / production dry-run preflight | High after approval | Formal credential setup may be rushed | Prepare before approval if time remains. |
| P2 | Mobile CTA / contrast review | Medium | Conversion friction | Do after UX state plan. |
| P2 | Release branch documentation sync | Medium | Main/staging docs drift before launch | Do before production launch gate. |
| P2 | Old Vercel project/domain ambiguity cleanup | Medium | Owner/deployment confusion | Owner UI action before launch. |
| P2 | `payment_success_future` stale label | Medium | Internal confusion | Plan cleanup; avoid risky migration now. |
| P3 | Queue audit persistence | Medium after traffic | Less incident visibility | Defer until real traffic need. |
| P3 | Full Module 02 implementation | Product learning | Distraction from launch | Defer until Module 01 launch UX locked. |
| P3 | LINE delivery / refund tooling automation | Operational expansion | Scope creep | Defer until production payments are stable. |

## 8. Recommended Next Sprint Plan

### Product / Copy / UX

1. `Module 01 Launch UX Lock + Multi-State Paid CTA Plan v0`
   - Define copy and behavior for runtime disabled, review-wait, staging sandbox, controlled smoke, and public launch states.
   - Include homepage/result/paid preview/checkout/ReturnURL/access/support copy alignment.

2. `Module 01 Mobile CTA + Result Value Polish Review v0`
   - Review mobile CTA visibility, contrast, paid value promise, and result-to-checkout path.
   - Keep changes visual/copy-only if implemented later.

### Architecture / Spec

1. `Module 02 Concept Spec + Homepage Cross-Link Plan v0`
   - Select one Module 02 candidate.
   - Define module hook, input, free output, future paid output, safety boundaries, share card idea, and homepage cross-link copy.
   - Do not implement runtime.

2. `Module Catalog Metadata Plan v0`
   - Only if a homepage cross-link is approved.
   - Define minimal metadata fields; avoid full portal abstraction.

### QA / Tooling

1. `Secret-Safe NewebPay Sandbox E2E Helper v0`
   - Generate temporary checkout form outside repo.
   - Poll sanitized state.
   - Never print provider payloads, tokens, raw input, or secrets.

2. `Production Payment Config Dry-Run Plan / Preflight Script v0`
   - Prepare for approval/formal credentials while keeping runtime disabled.

### Deferred Payment Launch Tasks

- `Production Payment Config Dry-Run v0`
- `Controlled Production Payment Smoke v0`
- `First 10 Payments Monitoring Checklist v0`

Run these only when NewebPay approval/formal credential readiness is available.

## 9. Guardrails

Do not do yet:

- Do not enable production payment runtime.
- Do not enable public production checkout.
- Do not configure production provider credentials before approval/formal readiness.
- Do not run real payments.
- Do not start ads or broader traffic.
- Do not implement LINE delivery.
- Do not implement a full portal/account system.
- Do not implement full paid Module 02.
- Do not change Module 01 prompt/schema semantics without explicit approval and decision logging.

## Owner Actions

- Wait for NewebPay review outcome.
- Decide preferred Module 02 direction: low-risk/shareable `社群微訊號讀心卡` vs deeper Personal Insight Graph seed `心動慣性圖譜`.
- Confirm refund response window and launch-week support monitoring cadence.
- Clean old Vercel domain/project ambiguity in UI when convenient.

## Recommended Next Step

Run `Module 01 Launch UX Lock + Multi-State Paid CTA Plan v0` first.

Reason: Module 01 is the product that will launch payment first, and current in-product paid preview copy still reflects the internal-test / no-charge / LINE-or-Email era. Locking that state model reduces launch confusion without increasing production risk.

Then run `Module 02 Concept Spec + Homepage Cross-Link Plan v0` to start the multi-module direction without implementing risky new runtime behavior.

## Tech Debt Review

- New technical debt introduced: none; this task is documentation-only.
- Existing technical debt observed: result/access rendering is still Module 01-specific despite generic slug routing; paid preview copy is not launch-aligned; dashboard/source-of-truth docs need periodic refresh.
- Opportunistic cleanup completed: dashboard next-sprint direction updated to prevent stale “only payment launch” framing while review is pending.
- Deferred cleanup candidates: sandbox E2E helper, env preflight script, stale internal naming cleanup, release branch documentation sync.
