# Controlled Production Payment Smoke Retry with Scoped Runtime Config v1 Handoff

## Task

Run one controlled production Module 01 payment smoke using scoped runtime config.

## Shared Policy References

- `AGENTS.md`
- `ai-collaboration/process/codex-operating-policy.md`
- `ai-collaboration/process/qa-validation-policy.md`
- `ai-collaboration/process/env-mirror-policy.md`
- `ai-collaboration/process/admin-ops-boundary.md`
- `ai-collaboration/process/production-gate-policy.md`
- `ai-collaboration/process/handoff-template.md`
- `ai-collaboration/process/report-template.md`

## Scope

- Run final pre-open gates.
- Open Module 01 production payment window through scoped runtime config only if gates pass.
- Create one fresh production Module 01 result using tracked fixture only.
- Verify pre-payment Email save and mobile LINE bind before any provider payment.
- Proceed to one NT$49 credit-card one-time payment only if both saves pass.
- Verify NotifyURL, processor, paid result, Email/LINE access-link delivery, and Admin/Ops state.
- Close `payment.window.enabled` and confirm final fail-closed state.

## Do Not

- Do not use Vercel env toggles or redeploy for runtime open/close.
- Do not use `ENABLE_PAYMENT_RUNTIME` or `ENABLE_NEWEBPAY_CHECKOUT`.
- Do not expose card data, provider payloads, raw Email/LINE identity, idToken, state, hashes, encrypted recipient, or tokenized URLs.
- Do not mutate DB manually.
- Do not run production payment before Email save and LINE bind both pass.
- Do not send Email/LINE except the product delivery path after a real paid smoke.
- Do not implement theme UI or Module 02.

## Stop Conditions

- Stop before runtime open if any required pre-open gate fails.
- Stop before payment if Email save or LINE bind fails.
- Always close runtime config unless owner explicitly chooses soft availability.

## Reporting Requirements

- Use canonical report and completion summary.
- Include timing fields, first failure category if any, runtime open/close, Admin/Ops state, and final production status.
- Separate command exit code from gate status.

## Recommended Next Task

- Clean pass: Controlled Production Payment Smoke Final Assessment / Gate 1 Decision v0.
- Failure: resolve first failure category with targeted tests/Admin-Ops diagnostics before another production attempt.
