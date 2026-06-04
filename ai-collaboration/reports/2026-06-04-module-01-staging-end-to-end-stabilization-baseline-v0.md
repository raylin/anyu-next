# Module 01 Staging End-to-End Stabilization Baseline v0

Date: 2026-06-04

## Status

In progress. Initial implementation and local validation are complete; Preview(staging) deployment and broad staging E2E validation remain to be completed after this code is pushed to `origin/staging`.

## Production Freeze Status

Production was checked before staging work:

- public `/`, `/refund`, and `/legal`: 200
- checkout route: fail-closed
- fake-paid/operator routes: fail-closed
- `qa:production:payment-preflight -- --source vercel-production --mode dry-run`: `pass_ready_for_controlled_smoke`
- `ENABLE_PAYMENT_RUNTIME`: absent/disabled
- `ENABLE_NEWEBPAY_CHECKOUT`: absent/disabled
- no Production payment was run
- no Production Email/LINE message was sent
- no Production env or DB changes were made

## Staging Environment Reconciliation

Preview(staging) before this implementation push:

- `https://staging.anyu.tw/api/health`: environment `preview`
- route bundle: `payment-foundation-2026-05-29`
- served commit before UX-gate implementation: `1a1c430d7b4e`
- public staging pages checked: `/`, `/refund`, `/legal` returned 200
- Vercel Preview(staging) env-name presence checked without values:
  - payment sandbox/provider names present
  - access-link crypto names present
  - Email provider names present
  - LINE provider names present
  - queue/processor names present
  - LIFF names present
- Neon Preview branch schema verified:
  - `payment_access_link_contacts`: exists
  - `paid_result_access_links`: exists
  - `payment_access_link_contact_secrets`: exists
  - old recovery-named access-link tables/views: absent

## UX Gate Implementation

Implemented in checkout-start page:

- desktop/non-mobile:
  - Email save only
  - LINE CTA absent
  - payment provider form/fields hidden until Email save exists
  - payment button shows locked disabled state before save
- mobile / in-app browser:
  - LINE save appears above Email
  - Email fallback remains visible below LINE
  - payment provider form/fields hidden until LINE or Email save exists
  - LINE failure copy keeps Email fallback available
- saved state:
  - existing Email or LINE access-link contact unlocks provider handoff
  - `lineRecovery=line_saved` also unlocks provider handoff
- user-facing copy remains aligned to 保存查看連結 / 專屬查看連結 / 回 ANYU 查看完整報告.

No DB/schema changes were made.

## ReturnURL Alignment

Local tests continue to assert unified provider-level ReturnURL:

- staging ReturnURL target: `/payment/newebpay/return`
- NotifyURL remains `/api/payments/newebpay/notify`
- ReturnURL remains non-mutating
- legacy module ReturnURL remains covered by existing tests

## Local Validation Completed

- `cd apps/web && corepack pnpm lint`: passed
- targeted checkout/access-link/LINE/ReturnURL tests: passed, 68 tests
- `cd apps/web && corepack pnpm test`: passed, 80 files / 571 tests
- `cd apps/web && corepack pnpm build`: passed
- `qa:production:payment-preflight -- --source vercel-production --mode dry-run`: passed before implementation

## Staging E2E Matrix

Pending after Preview(staging) deploy:

- desktop Email-only path
- mobile LINE-first path
- mobile Email fallback path
- failure/fallback behavior
- support lookup
- `qa:access-link:smoke`
- `qa:result-checkout:no-card`
- `qa:line-access-link:smoke` only if owner-approved because it may send a real staging LINE message

## Tech Debt Backlog Checkpoint

Must fix before production smoke:

- production preflight should validate processor auth usability / non-empty secret, not only env-name presence
- staging/prod deploy-source and env-source must be checked before any Production runtime window
- desktop LINE boundary should remain explicit: desktop is Email-only for checkout-start

Can fix after staging baseline but before Module 02:

- `SUPPORT_OPS_DATABASE_URL` local alignment for faster sanitized Production/Staging lookup
- remaining recovery-named env vars:
  - `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`
  - `PAYMENT_RECOVERY_CONTACT_HASH_SECRET`
  - `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY`
  - `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`
  - `LINE_RECOVERY_MESSAGE_PROVIDER`
- remaining recovery-named file/module aliases:
  - `email-recovery-link`
  - `line-recovery-link`
  - `payment-recovery-contacts`
  - `payment-recovery-contact-secrets`
  - `paid-result-recovery-links`

Can defer until after Module 02 concept:

- broader helper/file rename away from recovery terminology
- old QA script alias cleanup where compatibility remains useful

Intentionally retained compatibility:

- `/r/[token]` route remains stable.
- `rlb_` LINE bind state prefix remains for now.

## Current Baseline Classification

Partial: implementation and local validation passed; Preview(staging) E2E validation is pending deployment of this commit.

## Recommended Next Action

Push implementation to `origin/staging`, wait for Preview(staging) to serve the new commit, then run the staging E2E matrix and update this report with final pass/partial/blocked status.
