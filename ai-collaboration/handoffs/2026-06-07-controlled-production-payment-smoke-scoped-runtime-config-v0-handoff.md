# Controlled Production Payment Smoke Retry with Scoped Runtime Config v0 Handoff

- taskStartedAt: 2026-06-07T07:54:33Z
- model / effort: GPT-5 Codex, high
- current commit: `f197b87`
- scope: controlled production payment smoke using scoped runtime config

## Shared Policy

Follow `AGENTS.md` and:

- `ai-collaboration/process/codex-operating-policy.md`
- `ai-collaboration/process/qa-validation-policy.md`
- `ai-collaboration/process/env-mirror-policy.md`
- `ai-collaboration/process/admin-ops-boundary.md`
- `ai-collaboration/process/production-gate-policy.md`
- `ai-collaboration/process/handoff-template.md`
- `ai-collaboration/process/report-template.md`

## Critical Rules

- Stop at first hard failure.
- Do not continue to owner manual action unless pre-open gates pass.
- Use scoped runtime config; do not use Vercel env toggles or redeploy for runtime open/close.
- Do not use `ENABLE_PAYMENT_RUNTIME` or `ENABLE_NEWEBPAY_CHECKOUT`.
- Use tracked Module 01 fixture only.
- Do not expose card data, provider payloads, tokenized URLs, raw Email, raw LINE identity, idToken, bind state, encrypted recipient, or hashes.
- Use Admin API / `pnpm ops` before any direct DB debugging.
- Always close `payment.window.enabled=false` unless owner explicitly chooses soft availability.

## Required Flow

1. Run final pre-open gates.
2. Open `payment.window.enabled=true` for module `ai-temperature`.
3. Create fresh production Module 01 result from tracked fixture.
4. Verify Email save and mobile LINE bind before payment.
5. Owner pays one NT$49 credit-card one-time payment only after save/bind pass.
6. Verify ReturnURL, NotifyURL, processor, paid result, Email/LINE `/r/` delivery, and Admin CLI state.
7. Close `payment.window.enabled=false`.
8. Create canonical report, update summary/dashboard, validate docs, commit, and push.

## Out of Scope

- no ads
- no broad traffic
- no non-card payment methods
- no Vercel env changes
- no deployment for runtime open/close
- no theme UI
- no Module 02
