# Production Deploy + LINE Bind Retry v0 Handoff

Date: 2026-06-04

## Task

Deploy commit `538eccb` to Production while keeping payment runtime disabled, then run an owner-assisted Production LINE bind retry to verify the LIFF state parser fix before rerunning Controlled Production Payment Smoke v1.

## Context

- Controlled Production Payment Smoke v1 was aborted before payment.
- Production preflight passed and runtime was temporarily enabled for v1.
- Owner attempted LINE bind before payment and saw `這個 LINE 查看連結已失效`.
- Sanitized DB verification showed an Email contact only; no LINE contact and no LINE recipient secret.
- Production runtime/checkout/queue/processor flags were disabled again and fail-closed was verified.
- Root cause: LINE OAuth direct `state` could override the valid `rlb_` bind state inside `liff.state`.
- Commit `538eccb` fixes parser selection and adds regression coverage.

## Relevant Files

- `apps/web/src/lib/line/recovery-liff-context.ts`
- `apps/web/src/tests/line-recovery-liff-page.test.tsx`
- `ai-collaboration/reports/2026-06-04-controlled-production-payment-smoke-v1-line-bind-abort-fix.md`
- `ai-collaboration/dashboard/anyu-project-dashboard.html`

## Constraints

- Do not enable production payment runtime.
- Do not enable production checkout.
- Do not run a payment.
- Do not send Email or LINE access-link messages.
- Do not manually mutate Production DB.
- Do not expose raw LINE user ID, encrypted recipient, recipient hash, `pa_`, `pcs_`, `pal_`, tokenized URLs, provider payloads, or raw result content.
- Do not change NewebPay dashboard settings.
- Do not commit secrets/private data.

## Planned Work

1. Deploy commit `538eccb` to Production.
2. Confirm Production health, commit, public pages, and fail-closed runtime/checkout/operator behavior.
3. Coordinate owner-assisted LINE bind retry using a Production pre-payment checkout surface if available while runtime remains disabled.
4. Verify sanitized Production DB contact and recipient-secret creation if bind succeeds.
5. Document success/failure classification.
6. Update report, summary log, and dashboard.
7. Run docs/redaction checks.
8. Commit documentation updates and push to `origin/staging`.

## Uncertainties

- With checkout/runtime disabled, the existing checkout page may or may not remain usable enough for the LINE CTA retry. If it is not reachable, do not enable checkout in this task; document the blocker and recommend a runtime-disabled LINE bind smoke helper or a separate approved retry window.

## Current State

- Production deployment completed from local source commit `538eccb87e2f40593340ed3b1b19b90f0ab92e89`.
- Vercel deployment id: `dpl_FZiXV9L7EgbwahgSZo6tUF6WLTdV`.
- `anyu.tw` was aliased to the new deployment.
- Production health is reachable with environment `production` and route bundle `payment-foundation-2026-05-29`; git commit metadata reports `unknown` because the deploy was local CLI-based.
- Public pages `/`, `/refund`, and `/legal` return 200.
- Dry-run production payment preflight still returns `pass_ready_for_controlled_smoke`.
- Checkout and fake-paid routes remain fail-closed.
- A fresh synthetic Production result was created to check retry feasibility, but checkout/runtime disabled state rendered checkout unavailable and did not expose the LINE save CTA.
- Owner-assisted LINE bind retry was not run because enabling checkout/runtime is prohibited in this task.
- Read-only aggregate DB check showed no LINE contact and no LINE recipient secret rows.
