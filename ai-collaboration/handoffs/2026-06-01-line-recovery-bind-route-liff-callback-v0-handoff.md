# LINE Recovery Bind Route / LIFF Callback v0 Handoff

Date: 2026-06-01
Owner task: LINE Recovery Bind Route / LIFF Callback v0
Scope: staging-safe recovery binding route/callback + tests only

## Objective

Implement a minimal recovery-specific LINE bind route/callback path that consumes signed `rlb_` recovery state, verifies LINE identity through LIFF-compatible server input, and binds the verified LINE user to `payment_recovery_contacts` as hash-only recovery identity. This must not reuse legacy unlock/fulfillment semantics and must not send LINE messages.

## Constraints

- Do not enable production payment runtime.
- Do not change production flags or env.
- Do not apply production DB migration.
- Do not run real payments.
- Do not send LINE push or Email.
- Do not implement membership/login.
- Do not expose raw `pa_`, `pcs_`, unlock tokens, short codes, tokenized URLs, provider payloads, report content, raw LINE user IDs, raw Email, or private customer data.
- Do not reuse legacy unlock/fulfillment semantics for recovery.
- Do not change payment provider behavior.
- Do not implement Module 02.

## Planned Work

1. Inspect existing LINE/LIFF route conventions, identity verification, legacy fulfillment bridge, recovery bind state helper, and recovery contact helpers.
2. Add recovery-specific route/callback API using `rlb_` state and verified LIFF identity.
3. Return only safe redirect/status behavior and sanitized error categories.
4. Keep UI minimal or route-only if UI integration is broader than v0.
5. Add tests for valid bind, raw ID exclusion, expired/tampered state, unsafe return path rejection, marketing opt-in separation, and Email/legacy regressions.
6. Create report, update summary log, update dashboard if status changes.
7. Run lint, targeted tests, full tests, and build.

## Validation Plan

- `cd apps/web && corepack pnpm lint`
- targeted LINE/recovery tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`

## Notes

Full staging LIFF smoke may require owner-assisted LINE test account/context. If unavailable, document as blocked manual QA and rely on route/helper tests for this task.
