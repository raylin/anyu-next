# Legacy ContactCapture / LINE-era Copy Cleanup v0 Handoff

## Date

2026-05-31

## Task

Audit and clean up legacy ContactCapture / LINE-era copy so no active user-facing launch path implies internal test, no-charge payment, or LINE delivery for paid reports unless clearly internal/legacy/future-only.

## Context

Module 01 paid CTA is now state-driven and launch-aligned. Public legal/refund/terms copy is also launch-aligned. Production payment runtime remains disabled, and NewebPay merchant review/formal approval remains external.

Known remaining cleanup from Public Legal Copy Launch Alignment v0: legacy ContactCapture / LINE-first copy still contains internal-test / LINE-first wording outside the main launch-facing paid CTA path.

## Relevant Files

- `apps/web/src/components/anyu/ContactCapture.tsx`
- `apps/web/src/lib/modules/ai-temperature-ui.ts`
- `apps/web/src/components/modules/ai-temperature/AiTemperatureResult.tsx`
- `apps/web/src/components/anyu/PaidPreviewCard.tsx`
- `apps/web/src/components/line/*`
- `apps/web/src/tests/contact-capture.test.tsx`
- `apps/web/src/tests/ai-temperature-result.test.tsx`
- `apps/web/src/tests/ai-temperature-ui.test.ts`
- `ai-collaboration/reports/`
- `ai-collaboration/summaries/summary_log.md`

## Constraints

- Copy/usage cleanup only.
- Do not enable payment runtime.
- Do not change production flags, Vercel env, or deploy.
- Do not run real payments.
- Do not implement checkout wiring, Module 02, homepage portal, or LINE delivery.
- Do not change Module 01 prompt/result generation behavior.
- Do not change payment provider runtime logic.
- Do not commit secrets, credentials, raw tokens, tokenized URLs, raw user input, private billing, or proof documents.

## Tech Debt Policy For This Task

Small copy cleanup and tests are in scope. Removing or rewriting legacy LINE infrastructure is out of scope unless it is clearly dead and low-risk. Runtime behavior should remain unchanged.

## Planned Work

1. Save this handoff.
2. Search ContactCapture / LINE-era / internal-test / no-charge / delivery wording across active UI and tests.
3. Classify findings as active launch-facing, legacy/internal-only, future support/notification, dead/unused, or historical docs.
4. Update active or ambiguous launch-facing copy to web delivery and support language.
5. Preserve safe legacy/internal behavior and document why it remains.
6. Update tests.
7. Create execution report and summary log entry.
8. Run lint, targeted tests, full tests, and build.
9. Commit and push to `origin/staging`.

## Uncertainties

- Whether owner wants LINE contact/fulfillment removed entirely later. Default for this task: keep legacy behavior, clean wording so it does not imply launch paid delivery.
