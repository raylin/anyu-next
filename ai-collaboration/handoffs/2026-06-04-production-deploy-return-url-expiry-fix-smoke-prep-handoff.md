# Production Deploy ReturnURL Expiry Fix + Controlled Smoke v1 Retry Prep Handoff

Date: 2026-06-04

## Task

Deploy commit `5e0e1ee` or newer to canonical Production project `anyu-next` while keeping runtime disabled, verify fail-closed safety, and prepare for the next controlled Production payment smoke retry.

## Context

- Controlled Production Payment Smoke v1 Retry reached checkout-start.
- Owner confirmed pre-payment Email save worked.
- Owner confirmed pre-payment LINE bind worked.
- NewebPay payment link/form expired before card payment.
- Production runtime was disabled again and fail-closed was verified.
- Commit `5e0e1ee` fixes ReturnURL expired/failed browser-return UX so it renders terminal support/expired state instead of indefinite `付款確認中`.
- NotifyURL remains payment truth.
- ReturnURL remains non-mutating.

## Constraints

- Do not enable Production payment runtime.
- Do not enable Production checkout.
- Do not run real payment.
- Do not send Email or LINE messages.
- Deploy from repo root only, not `apps/web`.
- Do not expose provider payloads, tokens, secrets, or tokenized URLs.
- Do not modify NewebPay dashboard settings.

## Planned Work

1. Confirm local source is at `5e0e1ee` or newer.
2. Deploy Production from repo root to canonical Vercel project `anyu-next`.
3. Verify `anyu.tw` and `www.anyu.tw` point to the canonical deployment.
4. Verify Production health and public pages.
5. Verify checkout/fake-paid/operator routes remain fail-closed.
6. Safely test ReturnURL invalid/expired UX without real payment or token disclosure if possible.
7. Run `qa:production:payment-preflight -- --source vercel-production --mode dry-run`.
8. Document results, commit, and push to `origin/staging`.

## Current State

- Handoff saved before Production deployment.
- Pre-deploy Production preflight passed with `pass_ready_for_controlled_smoke`.
- Deployed commit `5e0e1ee` from repo root to canonical `anyu-next`.
- Production deployment ID: `dpl_CnJumu2bAeJTR9mT9FTs3ofumTbJ`.
- `anyu.tw` and `www.anyu.tw` health return commit `5e0e1ee924d4`.
- Production public pages return 200.
- Checkout/fake-paid/operator routes remain fail-closed.
- Safe ReturnURL expired-state check passed without tokenized URL or payment mutation.
- Post-deploy Production preflight passed with `pass_ready_for_controlled_smoke`.
- Next action: run Controlled Production Payment Smoke v1 Clean Retry with Fresh NewebPay Form.
