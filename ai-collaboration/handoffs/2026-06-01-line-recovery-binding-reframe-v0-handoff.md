# LINE Recovery Binding Reframe v0 Handoff

Date: 2026-06-01
Owner task: LINE Recovery Binding Reframe v0
Scope: investigation and plan first; minimal code only if clearly safe and low-risk

## Objective

Reframe existing LINE/LIFF/ContactCapture infrastructure away from legacy unlock/fulfillment semantics and into paid result recovery binding semantics. Define the safest v0 implementation path before Module 02 work continues.

## Constraints

- Do not enable production payment runtime.
- Do not change production flags.
- Do not modify production env.
- Do not apply production DB migration.
- Do not run real payments.
- Do not send LINE push.
- Do not send Email.
- Do not implement membership/login.
- Do not expose raw `pa_`, `pcs_`, tokenized URLs, raw LINE userId, raw report content, or source text.
- Do not change payment provider behavior.
- Do not implement Module 02.
- Do not commit secrets or private customer data.

## Planned Work

1. Inventory existing LINE/LIFF/ContactCapture infrastructure.
2. Inspect recovery contact LINE helper support and current public LINE copy.
3. Define new LINE recovery product semantics.
4. Design a recovery-specific LIFF state flow and fallback behavior.
5. Map LINE recovery binding to `payment_recovery_contacts`.
6. Recommend API/route shape, UI insertion points, tests, and implementation path.
7. Create report, update summary log, and update dashboard if roadmap changes.
8. Run documentation-only validation unless code changes unexpectedly.

## Validation Plan

- Docs presence check.
- Secret/private scan.
- `git diff --check`.
- Dashboard HTML sanity if dashboard changed.

## Notes

Preferred likely path: plan now; implement recovery-specific LIFF state helpers and tests in a separate follow-up before any full staging LINE bind path. No LINE push or paid report delivery should be introduced.
