# Checkout-Start Recovery Soft Gate UX v0 Handoff

Date: 2026-06-01

## Task

Implement the first checkout-start recovery soft gate UX and server-side recovery contact capture for Module 01.

## Scope

- Checkout-start recovery UI.
- Email recovery contact capture.
- Skip-with-warning flow.
- Marketing consent only if it stays separate and low-risk.
- LINE option can remain deferred if recovery-specific LIFF binding is not safe for v0.
- Tests, execution report, summary log, dashboard update, commit, and staging push.

## Guardrails

- Do not enable production payment runtime.
- Do not modify Vercel env or production flags.
- Do not send Email or LINE push.
- Do not implement membership/login.
- Do not expose raw `pa_`, raw `pcs_`, raw Email, raw LINE IDs, provider payloads, or secrets.
- Do not change NewebPay provider behavior.
- Do not implement Module 02.

## Planned Validation

- `cd apps/web && corepack pnpm lint`
- targeted checkout-start/recovery tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- docs presence check
- secret/private scan
- `git diff --check`
