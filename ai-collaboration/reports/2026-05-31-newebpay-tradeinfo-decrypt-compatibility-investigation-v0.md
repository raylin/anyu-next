# NewebPay TradeInfo Decrypt Compatibility Investigation v0

Date: 2026-05-31

## Completed Work

- Inspected current NewebPay checkout encryption, NotifyURL decryption, TradeSha generation, form parsing, and NotifyURL tests.
- Compared ANYU implementation with a public NewebPay MPG sample excerpt.
- Found a code-side compatibility mismatch: NewebPay sample logic uses AES-256-CBC with manual 32-byte padding and zero auto-padding, while ANYU previously relied on Node/OpenSSL default PKCS padding.
- Updated checkout TradeInfo encryption to use NewebPay-compatible manual 32-byte padding.
- Updated NotifyURL TradeInfo decryption to disable auto-padding and strip/validate NewebPay-compatible 32-byte padding.
- Added a public-sample crypto regression test and updated NotifyURL service test fixtures to use the production TradeInfo encryption helper.

## Crypto Compatibility Findings

Current implementation after fix:

- AES algorithm: `aes-256-cbc`.
- Key encoding: configured HashKey string is passed directly to Node crypto.
- IV encoding: configured HashIV string is passed directly to Node crypto.
- Padding: manual NewebPay-style padding to a 32-byte boundary, then `setAutoPadding(false)`.
- Hex handling: encrypted bytes are encoded as lower-case hex for `TradeInfo`; NotifyURL decrypt reads `TradeInfo` as hex.
- TradeSha order: `HashKey=<HashKey>&<TradeInfo>&HashIV=<HashIV>`, SHA256, uppercase hex.
- Form parsing: NotifyURL route supports form POST shape and preserves provider fields as strings before verification.
- Checkout encryption and NotifyURL decryption now share the same padding contract.

Public sample comparison:

- Public NewebPay sample excerpt uses AES-256-CBC with manual padding size `32`, OpenSSL zero padding, `bin2hex`, and uppercase SHA256 for `TradeSha`.
- ANYU's previous Node default auto-padding used AES block-size PKCS padding behavior and could reject real provider payloads when NewebPay padding length exceeded 16 bytes.
- The new test `newebpay-crypto-compatibility.test.ts` verifies ANYU encryption against the public MPG sample `TradeInfo` vector.

Reference used:

- `https://www.hooks.com.tw/download/125065`

## Root Cause Classification

Classification: `padding_mismatch` / `code_decrypt_algorithm_mismatch`.

The repeated sandbox category `trade_info_decrypt_failed` is now most likely explained by the padding mismatch, not general route transport, missing fields, payment status polling, queue integration, or broad config helper mismatch.

## Safe Probe Result

- No real provider `TradeInfo` / `TradeSha` local decrypt probe was added or run.
- No real callback payload, decrypted provider payload, credentials, tokenized URL, card data, or user input was printed or committed.
- A real-payload probe was not necessary after the public sample vector identified a concrete code compatibility mismatch.

## Behavior Boundaries

- Production payment runtime was not enabled.
- Production flags and env were not changed.
- NewebPay payment flow semantics were not broadened.
- LINE delivery, refund tooling, public copy, Module 01 prompt/result behavior, schemas, and queue behavior were not changed.
- `TradeSha` calculation order remains unchanged.

## Validation

Validation to complete before commit:

- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm vitest run src/tests/newebpay-crypto-compatibility.test.ts src/tests/newebpay-notify-service.test.ts`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- docs presence check
- secret/private scan on changed docs
- `git diff --check`

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: a dedicated secret-safe sandbox E2E helper would still reduce manual HTML/payment-form handling.
- Opportunistic cleanup completed: NotifyURL test fixture now uses the production encryption helper instead of duplicating crypto behavior.
- Deferred cleanup candidates: add official-provider sample fixtures if NewebPay supplies canonical current MPG v2.0 vectors.

## Recommended Next Step

Deploy this fix to Preview(`staging`), then run **Fresh NewebPay Sandbox E2E Payment Smoke v5** using sandbox credit-card one-time payment only.
