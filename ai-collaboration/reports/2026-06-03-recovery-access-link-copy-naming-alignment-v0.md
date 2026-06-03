# Recovery / Access Link User-Facing Copy + Engineering Naming Alignment v0

## Date

2026-06-03

## Completed Work

- Audited user-facing recovery/access-link copy across checkout-start, paid-ready, completed result, Email template, LINE template, LIFF bind page, `/r/` invalid/processing pages, delivery artifact, QA helpers, and tests.
- Reframed primary user-facing language from “找回方式 / 找回連結 / LINE 找回 / Email 找回” toward:
  - 保存查看連結
  - 專屬查看連結
  - 回 ANYU 查看完整報告
- Updated checkout-start copy to explain that, after payment, ANYU sends a safe report viewing link to Email or LINE, and that web remains the canonical viewing surface.
- Updated completed-result save/status copy to describe saved/sent access links without implying Email/LINE contains the report body.
- Updated Email and LINE access-link templates to use “此專屬查看連結將保留 90 天” while keeping the message link-only.
- Updated `/r/` invalid/expired/processing page copy to say 查看連結 and keep support fallback via `hello@anyu.tw`.
- Updated no-card QA string detection and targeted tests for the new terminology.
- Updated dashboard status to record user-facing access-link wording and the deferred engineering naming migration.

## Architecture Decisions

- No DB schema, table, column, token prefix, route behavior, or provider behavior was renamed or changed.
- Internal implementation names such as `recovery`, `payment_recovery_contacts`, `paid_result_recovery_links`, and `prl_` remain intact for launch stability.
- Future engineering naming should introduce aliases such as `reportAccessLink` and `paidResultAccessLink` before any broad rename or DB migration.

## Blockers

- None.

## Uncertainties

- Some support/legal contexts still use 補發 or 協助查詢-style fallback wording. This is intentional because the task only reframed primary product copy, not support/refund policy language.

## Suggested Next Steps

- Run a staging visual/copy smoke after deployment to confirm the checkout-start, completed-result, `/r/`, Email, and LINE surfaces read correctly in context.
- Plan Duplicate / Resend Policy v0 before production payment capability is enabled.
- Continue with Module 02 Concept Spec only after owner accepts the updated Module 01 access-link copy direction.

## Known Technical Debt

- Internal recovery naming is still pervasive in helpers, routes, tests, DB tables, and QA scripts. This is intentionally deferred and documented rather than silently renamed.

## Tech Debt Review

### New Technical Debt Introduced

- None.

### Existing Technical Debt Observed

- Internal naming now differs from user-facing language: product says access/view link, implementation still says recovery. This is acceptable short-term but should be migrated gradually with aliases.

### Opportunistic Cleanup Completed

- Updated QA smoke detectors to validate the new checkout-start access-link copy.
- Updated delivery artifact status helper labels to use 查看連結.

### Deferred Cleanup Candidates

- Introduce `reportAccessLink` / `paidResultAccessLink` aliases in service-layer docs/types before any broad internal rename.
- Consider later renaming visible CSS/kicker labels where they still expose implementation concepts, while preserving class names for styling stability.

### Recommended Follow-up

- Duplicate / Resend Policy Plan v0.

## Validation

- Targeted copy/template/access-link tests: `corepack pnpm vitest run src/tests/newebpay-checkout-start-page.test.tsx src/tests/paid-result-recovery-save-section.test.tsx src/tests/payment-return-poller.test.tsx src/tests/newebpay-return-page.test.tsx src/tests/email-recovery-link.test.ts src/tests/line-recovery-link.test.ts src/tests/line-recovery-liff-page.test.tsx src/tests/paid-result-recovery-link-page.test.tsx src/tests/result-checkout-no-card-qa.test.ts src/tests/paid-result-delivery-artifact.test.ts` passed.
- Full validation results are recorded in the final completion summary.

## Git Commit

- Commit hash: `pending`
- Commit message: `copy: align recovery access link wording`

## Staging Push

- Push status: `pending`
- Push command: `git push origin HEAD:staging`
