# Production LINE Bind Identity Completion Fix v0 Handoff

Date: 2026-06-04

## Task

Diagnose and fix the Production LINE bind identity completion failure visible as `LINE 身分確認沒有完成`, then verify the fix safely without running payment.

## Context

- Controlled Production Payment Smoke v1 Clean Retry was aborted before card payment.
- Production preflight passed.
- Runtime was temporarily enabled only for the smoke window.
- Checkout-start rendered correctly.
- Owner confirmed Email save worked.
- Owner attempted LINE save/bind and saw `LINE 身分確認沒有完成`.
- Runtime flags were removed and Production redeployed fail-closed.
- No payment, Email access-link send, or LINE access-link message occurred.

## Constraints

- Do not run real payment.
- Do not send Email or LINE access-link messages.
- Do not expose idToken, raw LINE userId, LIFF state, cookies, tokenized URLs, `pa_`, `pcs_`, `pal_`, encrypted recipient values, hashes, or provider payloads.
- Do not weaken LINE identity validation.
- Deploy from repo root to canonical `anyu-next` only if code/env fix is needed.
- If runtime is needed for owner bind retry, enable only briefly and disable again immediately after.

## Planned Work

1. Inspect current LINE bind client/server flow and tests.
2. Identify exact source of `LINE 身分確認沒有完成`.
3. Check Production LINE env names presence only.
4. Add safe diagnostics and narrow fix if needed.
5. Run lint, targeted LINE tests, full tests, and build.
6. Deploy fix to Production fail-closed if code changed.
7. Run owner-assisted LINE bind retry with no payment, using short runtime window only if necessary.
8. Verify sanitized DB state if support DB access is available.
9. Disable runtime/fail-closed after retry.
10. Document, commit, and push.

## Current State

- Handoff saved before diagnosis.
