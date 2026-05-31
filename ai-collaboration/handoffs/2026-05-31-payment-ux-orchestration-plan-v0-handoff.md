# Payment UX Orchestration Plan v0 Handoff

## Date

2026-05-31

## Task

Create a planning document for payment UX orchestration across checkout-start, NewebPay provider handoff, ReturnURL/polling, LINE/LIFF notification opportunities, QA bypass, and future multi-module callback/return structure.

## Context

- Module 01 checkout CTA wiring is implemented at `/m/[moduleSlug]/result/[resultId]/checkout`.
- Result-page checkout staging sandbox QA was started and paused at manual payment handoff.
- Production payment runtime remains disabled and fail-closed.
- Web access remains canonical paid delivery; LINE delivery is not implemented.
- Module 02 and multi-module homepage remain separate planning/design tracks.

## Relevant Files

- `apps/web/src/app/m/[moduleSlug]/result/[resultId]/page.tsx`
- `apps/web/src/app/m/[moduleSlug]/result/[resultId]/checkout/page.tsx`
- `apps/web/src/components/anyu/PaidPreviewCard.tsx`
- `apps/web/src/app/api/modules/[moduleSlug]/checkout/newebpay/route.ts`
- `apps/web/src/app/m/[moduleSlug]/payment/return/page.tsx`
- `apps/web/src/app/api/modules/[moduleSlug]/payment/status/route.ts`
- `apps/web/src/app/m/[moduleSlug]/payment/access/page.tsx`
- `apps/web/src/app/m/[moduleSlug]/unlock/[unlockToken]/page.tsx`
- `apps/web/src/app/line/fulfill/page.tsx`
- `apps/web/src/app/m/[moduleSlug]/line/fulfill/page.tsx`
- `apps/web/src/app/api/line/fulfillment/bind-liff/route.ts`
- `apps/web/src/app/api/line/webhook/route.ts`
- `apps/web/src/app/api/operator/fake-paid-success/route.ts`
- `apps/web/scripts/newebpay-sandbox-e2e-helper.mjs`

## Constraints

- Planning only; do not implement payment UX changes.
- Do not enable production payment runtime or change env values.
- Do not run payments.
- Do not implement LINE delivery, Module 02, multi-module homepage, or provider behavior changes.
- Do not expose or commit secrets, provider payloads, raw tokens, tokenized URLs, raw input, card data, or private values.

## Planned Work

1. Save this handoff.
2. Inspect current payment UX, LINE/LIFF, fake-paid, and sandbox helper surfaces.
3. Document current result page to paid access user journey.
4. Recommend LINE/LIFF CTA timing boundaries.
5. Recommend ReturnURL/polling UX improvements.
6. Recommend provider jump visual bridge improvements.
7. Recommend a safe staging-only QA bypass approach.
8. Recommend multi-module callback/return direction.
9. Create report, update summary/dashboard if needed, validate docs, commit, and push.

## Uncertainties

- Result-page checkout staging sandbox QA remains paused and should be resumed or superseded later.
- LINE notification/save-for-later strategy needs owner prioritization before implementation.
