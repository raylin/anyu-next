# NewebPay Sandbox TradeInfo Decrypt Config Alignment v0 Handoff

Date: 2026-05-31

## Task

Align Preview(`staging`) NewebPay sandbox credentials/config after sandbox E2E v3 identified `trade_info_decrypt_failed`.

## Scope

In scope:

- Inspect NewebPay config loading for checkout and NotifyURL.
- Check secret presence only.
- Force-align branch-scoped Preview(`staging`) NewebPay sandbox env values only.
- Redeploy Preview(`staging`).
- Run sanitized config/source checks and production fail-closed checks.
- Document readiness for Fresh NewebPay Sandbox E2E Payment Smoke v4.

Out of scope:

- Production runtime/env changes.
- Code/decrypt algorithm changes unless evidence proves code-side issue.
- Real/sandbox payment execution.
- Provider payload, decrypted payload, token, card, or raw input recording.
- Public copy, prompt/result behavior, LINE delivery, or queue behavior changes.

## Safety Constraints

- Do not print, log, or commit MerchantID, HashKey, HashIV, `TradeInfo`, `TradeSha`, raw provider payloads, decrypted payloads, raw `pa_`, raw `pcs_`, tokenized URLs, card data, raw user input, or private values.
- Do not update Production env.
- Do not update general Preview unless explicitly required and documented.

## Validation Plan

- Docs presence check.
- Secret/private scan on new docs.
- `git diff --check`.
- If code changes unexpectedly: app lint/test/build.

## Execution Notes

- Source inspection confirmed checkout and NotifyURL both use `getNewebPayConfig(...)`.
- Owner approved using `apps/web/.env.local` as the secure credential source because the three NewebPay credential vars were not present in the shell.
- Force-aligned branch-scoped Preview(`staging`) NewebPay env names only.
- Redeployed Preview(`staging`) and verified health at `environment=preview`, branch `staging`, commit `ebfc83b71c84`.
- Confirmed Production remained fail-closed: checkout and fake-paid routes returned JSON 404 `not_found`.
