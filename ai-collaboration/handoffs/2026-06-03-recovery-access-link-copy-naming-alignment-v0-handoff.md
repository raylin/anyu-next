# Recovery / Access Link User-Facing Copy + Engineering Naming Alignment v0 Handoff

## Date

2026-06-03

## Task

Align Module 01 user-facing recovery/access-link copy toward the access-link product promise while documenting a future engineering naming migration path without broad internal renames.

## Context

Module 01 Email and LINE access-link delivery is staging-proven. Email and LINE send safe `/r/` links back to ANYU, not report body content. Web remains the canonical report viewing surface. Current source and documentation still use “recovery / 找回” heavily; owner prefers user-facing wording such as 保存查看連結, 專屬查看連結, and 回 ANYU 查看完整報告.

## Relevant Files

- `apps/web/src/app/m/[moduleSlug]/result/[resultId]/checkout/page.tsx`
- `apps/web/src/app/m/[moduleSlug]/unlock/[unlockToken]/page.tsx`
- `apps/web/src/app/r/[recoveryToken]/page.tsx`
- `apps/web/src/app/line/recovery/bind/page.tsx`
- `apps/web/src/components/line/LineRecoveryBindBridge.tsx`
- `apps/web/src/components/modules/ai-temperature/PaymentReturnPoller.tsx`
- `apps/web/src/lib/notifications/email-recovery-link.ts`
- `apps/web/src/lib/notifications/line-recovery-link.ts`
- `apps/web/src/tests/`
- `ai-collaboration/dashboard/anyu-project-dashboard.html`

## Constraints

- Do not enable production payment runtime.
- Do not change production flags, env, DB, or provider behavior.
- Do not send Email or LINE messages.
- Do not rename DB tables/columns, token prefixes, or broad helper internals.
- Do not change `/r/` resolver behavior.
- Do not commit secrets or private customer data.

## Tech Debt Policy For This Task

Small copy/test cleanup inside touched surfaces is allowed. Broad internal naming migrations are explicitly deferred. Any remaining “recovery” internal naming should be documented as intentional until a later migration task.

## Planned Work

1. Audit visible copy containing recovery/找回/save/access-link terms.
2. Update user-facing checkout-start, paid-ready, completed-result, Email, LINE, LIFF, and invalid-link copy where appropriate.
3. Update tests to assert access-link wording and no report-body delivery promise.
4. Document that internal recovery naming remains intentionally intact.
5. Update dashboard, execution report, and summary log.
6. Run required validation.
7. Commit and push to `origin/staging` if validation and safety checks pass.

## Uncertainties

- Some support/failure contexts may still naturally use 協助查詢 or 協助找回. The preferred approach is to avoid “找回” as primary CTA/product wording while allowing it in fallback/support copy where clearer.
