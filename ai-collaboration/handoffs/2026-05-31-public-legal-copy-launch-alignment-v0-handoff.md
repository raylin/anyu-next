# Public Legal Copy Launch Alignment v0 Handoff

## Date

2026-05-31

## Task

Audit and align public legal / policy / support copy for Module 01 launch readiness after the multi-state paid CTA implementation.

## Context

Module 01「曖昧溫度計」now has state-driven paid CTA copy. Production-disabled result pages show a review-pending disabled CTA and no longer foreground internal-test, no-charge, or LINE delivery language. The remaining known cleanup is broader terms/privacy/legal copy that may still include internal-test or LINE-era references outside the result-payment surface.

Production payment runtime remains disabled. NewebPay merchant review/formal approval remains external. This task is public copy cleanup only.

## Relevant Files

- `apps/web/src/content/legal.ts`
- `apps/web/src/app/legal/page.tsx`
- `apps/web/src/app/refund/page.tsx`
- `apps/web/src/app/page.tsx`
- `apps/web/src/components/anyu/LegalFooter.tsx`
- `apps/web/src/components/modules/ai-temperature/*`
- `ai-collaboration/reports/`
- `ai-collaboration/summaries/summary_log.md`
- `ai-collaboration/dashboard/anyu-project-dashboard.html`

## Constraints

- Do not enable payment runtime.
- Do not change production flags, Vercel env, or deploy.
- Do not run real payments.
- Do not implement checkout wiring, Module 02, homepage portal, LINE delivery, or payment provider runtime changes.
- Do not change Module 01 prompt/result generation behavior.
- Do not commit secrets, credentials, raw tokens, tokenized URLs, raw user input, private billing, or proof documents.

## Tech Debt Policy For This Task

Small launch-copy cleanup and tests are in scope. Runtime behavior, architecture, and product-flow changes are out of scope.

## Planned Work

1. Save this handoff.
2. Audit public legal/policy/support surfaces for stale internal-test, no-charge, contact-capture, and LINE-era language.
3. Classify findings by public launch-facing, internal/operator-only, historical docs, future note, or allowed retention mention.
4. Update launch-facing public copy to align with NT$49 one-time web-delivered AI report/service, provider notification truth, support/refund scenarios, and 3-7 business day response window.
5. Add/update tests for legal/refund copy and no launch-facing LINE/internal-test/no-charge promises.
6. Create execution report.
7. Append `ai-collaboration/summaries/summary_log.md` and update dashboard if status changed.
8. Run requested validation.
9. Commit and push to `origin/staging`.

## Uncertainties

- Whether owner wants all Terms/Privacy LINE mentions removed, or only paid-delivery promises removed. Default: keep LINE only as a future/optional communication channel if needed, and do not promise paid delivery through LINE.
