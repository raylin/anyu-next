# Paid Delivery Recovery Link Send Hook v0 Handoff

## Date

2026-06-02

## Task

Implement a non-fatal paid-delivery completion hook that automatically sends Email recovery links to eligible checkout-start Email recovery contacts when a paid result becomes ready.

## Context

Email recovery link delivery is already implemented for completed-result Email save and verified on Preview(staging) with Resend. The remaining gap is automatic sending for users who saved Email before payment at checkout-start. Paid delivery creates/binds entitlements before queue generation; paid result readiness happens later in the paid-generation service and processor.

## Relevant Files

- `apps/web/src/lib/modules/paid-generation-service.ts`
- `apps/web/src/lib/modules/paid-generation-processor.ts`
- `apps/web/src/lib/notifications/email-recovery-link.ts`
- `apps/web/src/lib/db/payment-recovery-contacts.ts`
- `apps/web/src/lib/db/paid-result-recovery-links.ts`
- `apps/web/src/tests/email-recovery-link.test.ts`
- `apps/web/src/tests/paid-generation-service.test.ts`
- `apps/web/src/tests/paid-generation-processor.test.ts`
- `ai-collaboration/reports/`
- `ai-collaboration/summaries/summary_log.md`

## Constraints

- Do not enable production payment runtime.
- Do not modify production env or production DB.
- Do not send LINE messages.
- Do not expose raw `prl_`, `pa_`, `pcs_`, token hashes, raw Email, provider payloads, or report content.
- Email send failure must not block paid result completion.
- `EMAIL_PROVIDER=noop` must remain non-sending and must not mark links as sent.
- Production Email sending remains gated by env and payment runtime remains disabled.

## Tech Debt Policy For This Task

Small, obvious, low-risk cleanup inside the touched recovery/email hook surface is allowed. Do not redesign payment delivery, provider behavior, queue behavior, recovery schema, or Email provider architecture.

## Planned Work

1. Save this handoff.
2. Inspect paid generation completion paths and recovery link sender helpers.
3. Add a server-only helper for eligible Email contact lookup and automatic send orchestration.
4. Invoke the helper non-fatally from all paid result completion paths.
5. Add/update tests for eligibility, noop/provider behavior, duplicate prevention, non-fatal failures, and token redaction.
6. Run required validation and staging-safe QA.
7. Generate execution report, update summary log/dashboard if status changes.
8. Commit and push to `origin/staging` if validation passes.

## Git Commit And Staging Push Rule

Commit task changes with a clear message and push to `origin/staging` unless validation or safety checks block.

## Uncertainties

- Whether Preview(staging) real Resend auto-send QA should be run in this task depends on the ability to create a fresh no-card paid result with a checkout-start Email contact without exposing raw recipient or tokens. If too broad, run regressions and document real-send QA as follow-up.
