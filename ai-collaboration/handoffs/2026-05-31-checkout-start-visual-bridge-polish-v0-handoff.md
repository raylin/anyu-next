# Checkout-Start Visual Bridge Polish v0 Handoff

## Date

2026-05-31

## Task

Polish the Module 01 checkout-start page so it feels like a trustworthy ANYU payment bridge and visually connects better with the Riso/editorial Module 01 result flow, without implementing a full Payment Shell + Module Accent abstraction.

## Context

- Result-Page Checkout Staging Sandbox QA v0 passed end-to-end.
- Production payment runtime remains disabled and fail-closed.
- ReturnURL polling UX is already implemented and should not be changed in this task.
- Claude Design Payment Shell + Module Accent exploration is reference-only.
- Direction C is the long-term reference: fixed ANYU payment shell plus thin module accent layer.

## Scope

- Checkout-start page UX/copy/visual polish only.
- Tests and documentation.
- No production runtime/env/provider behavior changes.
- No Module 02, multi-module homepage, LINE delivery, or prompt/result changes.

## Planned Work

1. Inspect checkout-start page, existing Module 01/Riso classes, paid CTA integration, ReturnURL copy, and tests.
2. Inspect local Claude Design reference files if available and copy/reference them under `ai-collaboration/design/2026-05-31-payment-shell-module-accent/` if needed.
3. Apply limited Direction C-inspired checkout-start polish:
   - ANYU/back identity area.
   - Module 01 identity block.
   - 付款 / 生成 / 完成 stepper.
   - order summary card.
   - NewebPay trust bridge copy.
   - support/refund footer.
4. Polish unavailable/fail-closed states without changing gates.
5. Add/update checkout-start tests for copy, secret safety, and fail-closed behavior.
6. Run lint, targeted tests, full tests, and build.
7. Create report, update summary log/dashboard if needed, commit, and push to `origin/staging`.

## Safety Constraints

- Do not expose `OPERATOR_TEST_SECRET`, HashKey, HashIV, TradeInfo, TradeSha, raw `pcs_`/`pa_` tokens, tokenized URLs, card data, raw user input, or private values.
- Do not include internal-test/no-charge/no-real-charge/LINE paid delivery copy.
- Keep provider notification as payment truth and web delivery as canonical paid delivery.

## Expected Deliverables

- Polished checkout-start page.
- Updated tests.
- Execution report under `ai-collaboration/reports/`.
- Summary log update.
- Dashboard update if launch UX status changes.
