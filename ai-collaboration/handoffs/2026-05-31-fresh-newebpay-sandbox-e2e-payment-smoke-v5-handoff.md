# Fresh NewebPay Sandbox E2E Payment Smoke v5 Handoff

Date: 2026-05-31

## Task

Run a fresh NewebPay sandbox E2E payment smoke after the TradeInfo 32-byte padding compatibility fix at commit `bdedda3`.

## Scope

In scope:

- Verify Preview(`staging`) freshness and production disabled posture.
- Create a fresh Module 01 source result and NewebPay sandbox checkout.
- Generate a temporary local payment form outside the repo.
- Pause for owner browser payment with sandbox credit-card one-time payment only.
- After owner confirmation, poll sanitized session-bound status and logs.
- Document NotifyURL result/category, paid transition, delivery artifacts, queue completion, paid access rendering, and production safety.

Out of scope:

- Production runtime/env/flag changes.
- Real card usage.
- Provider credential, raw provider payload, decrypted payload, `pa_`, `pcs_`, tokenized URL, card data, or raw user input recording.
- Public copy, Module 01 prompt/result behavior, LINE delivery, or broad payment flow changes.

## Safety Constraints

- Do not print or commit MerchantID, HashKey, HashIV, `TradeInfo`, `TradeSha`, decrypted provider payload, raw provider body, raw `pa_`, raw `pcs_`, tokenized URLs, card data, raw user input, or private values.
- Temporary payment form must stay outside the repo.
- Use sandbox credit-card one-time payment only.
- Production payment runtime must remain disabled and fail-closed.

## Validation Plan

If no code changes:

- staging smoke checks
- docs presence check
- secret/private scan
- `git diff --check`

If code changes unexpectedly:

- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`

## Execution Notes

- Initial checkout creation was blocked because the local shell did not have a usable `OPERATOR_TEST_SECRET`.
- Owner added `OPERATOR_TEST_SECRET` to `apps/web/.env.local`; staging still rejected the header, so branch-scoped Preview(`staging`) `OPERATOR_TEST_SECRET` was updated from the local value without printing it.
- A fresh Preview(`staging`) deployment was triggered by pushing this handoff commit to `origin/staging`.
- Fresh checkout run `20260530173208` succeeded and generated a temporary local form outside the repo.
- Owner submitted sandbox credit-card one-time payment and returned to staging.
- Payment status reached `paid_ready` on the first poll after owner confirmation.
- Session-bound paid access page rendered completed content; duplicate status reload remained `paid_ready`.
- Production remained disabled and fail-closed.
