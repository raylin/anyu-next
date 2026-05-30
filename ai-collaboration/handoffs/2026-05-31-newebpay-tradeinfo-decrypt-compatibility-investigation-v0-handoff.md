# NewebPay TradeInfo Decrypt Compatibility Investigation v0 Handoff

Date: 2026-05-31

## Task

Investigate why real NewebPay sandbox NotifyURL `TradeInfo` cannot be decrypted after v3/v4 both failed with `trade_info_decrypt_failed`.

## Scope

In scope:

- Inspect current NewebPay crypto helpers, NotifyURL verification, form parsing, and tests.
- Compare implementation assumptions with NewebPay sample/manual behavior.
- Add minimal safe tests or local-only probe if useful.
- Classify the likely cause and recommend the next step.

Out of scope:

- Production runtime/env changes.
- Real card usage.
- Raw provider payload, decrypted payload, token, credential, or user input recording.
- Public copy, Module 01 prompt/result behavior, LINE delivery, or broad payment flow changes.

## Safety Constraints

- Do not print, log, or commit MerchantID, HashKey, HashIV, real `TradeInfo`, real `TradeSha`, decrypted provider payload, raw provider body, raw `pa_`, raw `pcs_`, tokenized URLs, card data, raw user input, or private values.
- Do not print hashes/checksums/prefixes/suffixes/lengths of secrets.
- Any probe must report booleans/categories only and read sensitive inputs from env or untracked local files.

## Validation Plan

If code/test changes:

- `cd apps/web && corepack pnpm lint`
- targeted NewebPay crypto/notify tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`

If docs-only:

- docs presence check
- secret/private scan
- `git diff --check`

## Execution Notes

- Found a code-side compatibility mismatch between ANYU's previous Node default AES padding behavior and the public NewebPay MPG sample's manual 32-byte padding plus zero auto-padding behavior.
- Updated checkout encryption and NotifyURL decryption to use the same NewebPay-compatible 32-byte padding contract.
- Added a public MPG sample vector regression test and updated NotifyURL fixtures to use the production encryption helper.
- No real provider payload, decrypted payload, credential, card data, raw user input, or tokenized URL was printed or committed.
