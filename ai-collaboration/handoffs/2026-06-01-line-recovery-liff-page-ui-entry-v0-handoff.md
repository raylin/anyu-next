# LINE Recovery LIFF Page / UI Entry v0 Handoff

Date: 2026-06-01
Owner task: LINE Recovery LIFF Page / UI Entry v0
Scope: minimal recovery-specific LIFF page/UI entry + tests

## Objective

Add a minimal recovery-specific LIFF UI entry that runs in LINE context, obtains a LIFF ID token, calls `POST /api/line/recovery/bind-liff` with signed `rlb_` recovery state, and returns users to the original recovery surface with safe success/failure state.

## Constraints

- Do not enable production payment runtime.
- Do not change production flags or env.
- Do not apply production DB migration.
- Do not run real payments.
- Do not send LINE push or Email.
- Do not implement membership/login.
- Do not expose raw `pa_`, `pcs_`, unlock tokens, short codes, tokenized URLs, raw LINE user IDs, provider payloads, report content, raw Email, or private customer data.
- Do not reuse legacy unlock/fulfillment semantics for recovery.
- Do not change payment provider behavior.
- Do not implement Module 02.

## Planned Work

1. Inspect existing LIFF client patterns, legacy `LineFulfillBridge`, recovery bind route, recovery bind state helper, and current recovery UI copy.
2. Add a route such as `/line/recovery/bind` with a minimal client component.
3. The page accepts only signed `rlb_` state, initializes LIFF if available, gets ID token, calls the recovery bind API, and navigates to returned safe path.
4. Add non-LINE/desktop fallback copy that points users back to Email recovery.
5. Add tests for copy, token exclusion, route call shape, non-LINE fallback, and existing legacy test compatibility.
6. Create report, update summary log, update dashboard if status changes.
7. Run lint, targeted tests, full tests, and build.

## Validation Plan

- `cd apps/web && corepack pnpm lint`
- targeted LIFF/LINE/recovery tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`

## Notes

Owner-assisted real LIFF staging smoke may be pending if no LINE test account/context is available during this task.
