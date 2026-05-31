# ReturnURL Polling UX Polish v0

Date: 2026-05-31

## Completed Work

- Added a client-side `PaymentReturnPoller` for the Module 01 NewebPay ReturnURL page.
- Updated `/m/[moduleSlug]/payment/return` to render the poller inside the existing Module 01 theme shell.
- Kept ReturnURL non-mutating: it only resolves the existing `pcs_` checkout handoff and polls the payment status endpoint.
- Added state-specific launch-safe copy for waiting, processing, ready, failed/support, invalid/expired, and timeout states.
- Added a visible ready-state CTA to continue to the session-bound paid access page.
- Added support/refund links and the 3-7 business day handling window to error and fallback states.
- Added tests for ReturnURL rendering and the poller component.

## Polling Behavior

- Poll target: `/api/modules/[moduleSlug]/payment/status`.
- Poll body: the existing checkout session token, sent only in the request body.
- Poll interval: 3 seconds after an initial short delay.
- Timeout: 120 seconds, after which the page stops polling and shows a safe support-oriented message.
- Terminal states stop polling:
  - `paid_ready`
  - `paid_failed`
  - `invalid_session`
  - `expired_session`
  - `timeout`

The poller does not log the checkout token, expose raw `pa_` tokens, or mutate payment state.

## State Copy Updates

| State | User-facing behavior |
| --- | --- |
| `waiting_for_payment` | Shows `付款確認中` and explicitly says browser return does not mean payment is complete. |
| `paid_processing` | Shows `完整報告生成中` and explains that the report will appear on this page after generation. |
| `paid_ready` | Shows `完整報告已準備好` and a visible `查看完整報告` CTA. |
| `paid_failed` | Shows `報告暫時無法完成`, support/refund framing, and `hello@anyu.tw`. |
| `invalid_session` / `expired_session` | Shows `這個付款狀態連結已失效`, support/refund links, and safe next steps. |
| `timeout` | Shows that payment confirmation is still in progress and asks the user to retry later or contact support. |

## Architecture Decisions

- ReturnURL remains read-only. NotifyURL remains the payment truth.
- The ready state uses a visible button instead of auto-redirect. Auto-redirect can be revisited after real user behavior is observed.
- The task intentionally reused the existing Module 01 shell and paid-wait visual primitives instead of introducing a new payment shell system.
- LINE/LIFF remains out of scope. Web access remains canonical paid delivery.

## Files Changed

- `apps/web/src/app/m/[moduleSlug]/payment/return/page.tsx`
- `apps/web/src/components/modules/ai-temperature/PaymentReturnPoller.tsx`
- `apps/web/src/tests/newebpay-return-page.test.tsx`
- `apps/web/src/tests/payment-return-poller.test.tsx`
- `ai-collaboration/handoffs/2026-05-31-returnurl-polling-ux-polish-v0-handoff.md`
- `ai-collaboration/reports/2026-05-31-returnurl-polling-ux-polish-v0.md`
- `ai-collaboration/summaries/summary_log.md`
- `ai-collaboration/dashboard/anyu-project-dashboard.html`

## Validation

- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm test -- src/tests/newebpay-return-page.test.tsx src/tests/payment-return-poller.test.tsx src/tests/payment-status-route.test.ts src/tests/payment-access-page.test.tsx`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`

All passed.

## Safety Checks

- No production runtime flags changed.
- No Vercel env values changed.
- No provider/payment verification behavior changed.
- No real payment was run.
- No LINE delivery was added.
- No secrets, provider credentials, raw provider payloads, raw `pcs_`/`pa_` tokens, tokenized URLs, card data, or raw user input were recorded.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: checkout-start visual bridge polish remains pending; full staging result-page checkout smoke remains pending.
- Opportunistic cleanup completed: removed trivial memoization from the new poller before finalizing.
- Deferred cleanup candidates: future Payment Shell / Module Accent system should wait for Claude Design output.

## Blockers / Uncertainties

- Result-Page Checkout Staging Sandbox QA v0 still needs a browser/manual sandbox pass through the real CTA path.
- The final payment shell visual language should not be over-designed until Claude Design direction is available.

## Recommended Next Step

Run `Result-Page Checkout Staging Sandbox QA v0` if a real end-to-end browser checkout pass is desired, then implement `Checkout-Start Visual Bridge Polish v0`.
