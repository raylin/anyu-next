# Duplicate / Resend Policy Plan v0 Handoff

## Date

2026-06-03

## Task

Define a safe duplicate/resend policy for Module 01 paid result access links across Email, LINE, paid delivery hooks, support/operator actions, and QA tooling.

## Context

Module 01 Email and LINE access-link delivery is staging-proven. Email and LINE send safe `/r/` dedicated view links back to ANYU, not report body content. User-facing copy now uses 保存查看連結 / 專屬查看連結 / 回 ANYU 查看完整報告. Internal DB/schema/routes still intentionally use recovery naming. Production payment runtime, production recovery DB/env, and production provider sends remain gated.

## Relevant Files

- `apps/web/src/lib/notifications/email-recovery-link.ts`
- `apps/web/src/lib/notifications/line-recovery-link.ts`
- `apps/web/src/lib/db/paid-result-recovery-links.ts`
- `apps/web/src/lib/db/payment-recovery-contacts.ts`
- `apps/web/src/lib/db/payment-recovery-contact-secrets.ts`
- `apps/web/src/lib/modules/paid-generation-service.ts`
- `apps/web/src/lib/modules/paid-generation-processor.ts`
- `apps/web/src/lib/payments/newebpay/notify-service.ts`
- `apps/web/src/app/api/operator/recovery-link-smoke/route.ts`
- `apps/web/src/app/api/operator/email-recovery-smoke/route.ts`
- `apps/web/src/app/api/operator/line-recovery-smoke/route.ts`
- `ai-collaboration/reports/`

## Constraints

- Planning only.
- Do not implement runtime changes.
- Do not send Email or LINE messages.
- Do not modify env, production flags, production DB, payment provider behavior, or schema.
- Do not rename DB/schema broadly.
- Do not commit secrets or private customer data.

## Planned Work

1. Save this handoff.
2. Audit current implementation and reports for access-link creation, send attempts, status updates, and duplicate prevention.
3. Define duplicate scenarios and v0 resend policy.
4. Define send status semantics, rate limits, support/operator policy, provider-specific policy, and data model implications.
5. Create execution report under `ai-collaboration/reports/`.
6. Append `ai-collaboration/summaries/summary_log.md`.
7. Update dashboard if roadmap/status changes.
8. Run documentation-only validation.
9. Commit and push to `origin/staging` if validation passes.

## Uncertainties

- Whether the first implementation should prioritize a support/operator-only resend helper or a public self-service resend surface. The expected recommendation is support/operator-only first.
