# Controlled Production Payment Smoke v1 Clean Retry with Fresh NewebPay Form

Date: 2026-06-04

## Completed Work

- Saved the handoff before Production operations.
- Ran final Production payment preflight before runtime enablement.
- Confirmed Production was fail-closed before the smoke window.
- Temporarily enabled only:
  - `ENABLE_PAYMENT_RUNTIME`
  - `ENABLE_NEWEBPAY_CHECKOUT`
- Redeployed from repo root to canonical Vercel project `anyu-next`.
- Created a fresh Production Module 01 result with non-private smoke input.
- Verified checkout-start before owner actions:
  - NT$49 present.
  - Email / LINE 保存查看連結 copy present.
  - no internal-test/no-charge copy.
  - no Email/LINE report-body delivery promise.
  - provider form fields present, values not printed.
- Owner completed pre-payment Email save successfully.
- Owner attempted pre-payment LINE bind.
- LINE bind failed with safe visible copy: `LINE 身分確認沒有完成`.
- Aborted before card payment.
- Removed the two runtime flags again.
- Redeployed Production fail-closed from repo root.
- Verified final Production safety and preflight.

## Production Preflight Result

Command:

```bash
cd apps/web && corepack pnpm run qa:production:payment-preflight -- --source vercel-production --mode dry-run
```

Result before runtime enablement:

- `ok`: true.
- `readiness`: `pass_ready_for_controlled_smoke`.
- canonical project linking: aligned.
- public pages: live.
- checkout/fake-paid: fail-closed.
- redaction: no values, lengths, prefixes, suffixes, hashes, checksums, provider payloads, or tokens printed.

Result after abort/fail-closed redeploy:

- `ok`: true.
- `readiness`: `pass_ready_for_controlled_smoke`.
- checkout/fake-paid remain fail-closed.

## Runtime Enablement Window

- Runtime-enabled deployment ID: `dpl_D7XTGHTP9HXZPYn2M6eUu99a4LGo`.
- Final fail-closed deployment ID: `dpl_zEbecCgUq5ARLZg2mF8rxF6QJ8SA`.
- Deploy path: repo root to canonical `anyu-next`.
- No deploy was run from `apps/web`.
- Fake-paid/operator routes were not enabled.
- No ads or broad traffic were enabled.

## Fresh Checkout Result

- Fresh Production result was created using non-private smoke text.
- Checkout-start rendered expected payment and save-link UI.
- Provider form was available.
- Provider payload values were not printed.
- The owner did not proceed to card payment because LINE bind failed first.

## Pre-Payment Email Save Result

- Owner-confirmed result: Email save passed.
- No Email delivery was sent in this task because payment was not completed.
- No raw Email or tokenized URL was printed.

## Pre-Payment LINE Bind Result

- Owner-confirmed result: failed.
- Safe visible copy: `LINE 身分確認沒有完成`.
- Failure classification: `line_bind_failed`.
- More specific category: `id_token_missing_or_incomplete_line_identity`.

Expected success DB checkpoint was not reached:

- No confirmed LINE contact/recipient-secret state for this fresh payment context.
- Local support lookup could not run because `SUPPORT_OPS_DATABASE_URL` is not configured in this shell and `DATABASE_URL` fallback is intentionally blocked without explicit opt-in.
- No DB target was guessed.

## Payment Result

- No card payment was submitted.
- Payment method was not used.
- ReturnURL / NotifyURL / paid transition were not exercised in this retry.
- Paid result render was not exercised in this retry.
- Email and LINE access-link delivery were not exercised in this retry.

## Production Safety Result

Final state after abort:

- Production runtime disabled.
- Production checkout disabled.
- Public `/`, `/refund`, `/legal`: 200.
- Checkout API: 404 `not_found`.
- Fake-paid route: 404.
- Operator access-link smoke route: 404.
- No provider form generated after disabling.
- No payment run.
- No Email sent.
- No LINE message sent.
- No manual DB mutation.
- No NewebPay dashboard setting changed.

## Architecture Decisions

- Aborted before card payment because LINE bind failed at the explicit checkpoint.
- Disabled runtime immediately after abort.
- Did not manually mutate DB or retry LINE repeatedly inside the runtime window.
- Did not guess a Production DB target when support lookup env was missing.

## Blockers

- Production LINE bind currently fails with `LINE 身分確認沒有完成` in the clean v1 retry.
- Controlled Production Payment Smoke v1 remains incomplete.
- Sanitized DB verification for the fresh result is blocked locally until `SUPPORT_OPS_DATABASE_URL` is available or another approved read-only Production DB path is provided.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed:
  - Production support lookup requires explicit local support DB env alignment before operators can quickly inspect fresh smoke artifacts.
  - LINE bind failure copy needs a narrower production diagnosis path for id token / LIFF identity completion.
- Opportunistic cleanup completed: none.
- Deferred cleanup candidates:
  - Add a Production LINE bind diagnostic checklist that remains token-safe.
  - Align local `SUPPORT_OPS_DATABASE_URL` for controlled smoke sessions.

## Suggested Next Steps

1. Run `Production LINE Bind Identity Completion Fix v0` or equivalent focused investigation.
2. Verify LINE bind on Production with runtime enabled only long enough to expose checkout-start, then disable again.
3. Retry Controlled Production Payment Smoke v1 only after LINE bind passes in the fresh runtime window.
