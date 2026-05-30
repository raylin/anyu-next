# NewebPay Merchant Review Public Content Implementation v0 Execution Report

Date: 2026-05-30
Branch: staging

## Summary
Implemented public website content updates to make ANYU / Module 01 visible as a provider-review-ready digital service storefront. The root page now introduces the service, shows a product preview, displays price and charging model, explains web delivery, surfaces refund/support policy, and links to legal/refund pages.

No payment runtime, NewebPay provider behavior, checkout/notify mutation logic, queue trigger, LINE delivery, prompt, schema, or production flag behavior was changed.

## Pages And Files Changed
- `apps/web/src/app/page.tsx`: replaced internal foundation copy with public storefront content for `曖昧溫度計｜AI 關係互動分析報告`.
- `apps/web/src/app/refund/page.tsx`: added dedicated refund policy route.
- `apps/web/src/app/legal/page.tsx`: updated legal index copy to mention refund/refund-reissue policy.
- `apps/web/src/components/anyu/LegalFooter.tsx`: added `服務介紹` link and surfaced refund policy through shared legal links.
- `apps/web/src/content/legal.ts`: added `refundPageContent` and included `/refund` in public legal links.
- `apps/web/src/styles/globals.css`: added storefront and product-preview styling using existing ANYU design tokens.
- `apps/web/src/tests/legal-content.test.ts`: updated legal/refund content assertions.
- `apps/web/src/tests/homepage-provider-review-content.test.tsx`: added storefront provider-review content assertions.

## Product / Service Content Added
The root page now clearly states:

- Product/service name: `曖昧溫度計｜AI 關係互動分析報告`
- Service type: digital AI-assisted relationship interaction analysis service
- Free initial analysis availability
- Paid complete report / deeper interpretation
- Evidence/signal summary from user-provided context
- Web-based result delivery
- Support contact: `hello@anyu.tw`
- Service limitation: not therapy, counseling, fortune-telling, or relationship-result guarantee

## Product Preview / Image Approach
Implemented a screenshot-like product preview card instead of committing external screenshots. It uses a synthetic mock report area with:

- price badge
- visual temperature meter
- sample report headline
- included feature chips

The preview contains no private user data, raw input, tokenized URL, provider data, or real customer content.

## Price And Charging Model
Displayed on the public root page and refund policy:

- `單次完整報告解鎖：NT$ 49`
- `一次性付款，非訂閱制`
- no recurring subscription wording

Price source: existing provider-review/legal copy already stated planned/expected Module 01 full analysis price as NT$49. This implementation surfaces that price publicly for review clarity.

## Delivery Method
Displayed as web delivery:

- payment completion and confirmation leads to a web full report
- if AI result generation takes time, the page shows a processing/waiting state until ready

This matches the current payment access handoff foundation without changing runtime behavior.

## Refund Policy Visibility
Added a dedicated `/refund` page and public footer/legal navigation link.

The refund policy states:

- duplicate payments may request refund/support
- successful payment without generated report may request refund/reissue
- system issue causing paid result link failure may request refund/reissue
- clear payment/system abnormality may request support/refund
- once the digital AI report is generated and available, refunds generally are not provided solely for subjective preference
- support route is `hello@anyu.tw`

The page avoids overpromising legal certainty and notes processing timing may depend on payment/system checks.

## Footer / Navigation
Public footer now includes:

- service introduction link (`/`)
- refund policy (`/refund`)
- privacy policy (`/privacy`)
- terms (`/terms`)
- disclaimer (`/disclaimer`)

## Owner Materials Still Needed
These materials remain owner-provided and must stay outside the repo:

- domain registration or DNS proof for `anyu.tw`
- Vercel project/billing/invoice or hosting/platform proof
- AI/API provider invoice or billing proof, if applicable
- website screenshots showing service, price, delivery, and refund policy
- NewebPay test order or checkout screenshots if available later
- self-developed system statement if no vendor invoice exists
- any additional platform/service invoices requested by NewebPay

## Architecture / Behavior Decisions
- Used root homepage as the provider-review storefront because it is the most likely page NewebPay reviewers inspect first.
- Added a dedicated refund route instead of hiding refund policy inside Terms only.
- Used mock product preview rather than real screenshots to avoid committing private data or raw examples.
- Kept NewebPay/provider names out of public user-facing copy to avoid exposing implementation details or implying provider endorsement.

## Validation
- Targeted content tests: `cd apps/web && corepack pnpm test -- src/tests/legal-content.test.ts src/tests/homepage-provider-review-content.test.tsx` passed. The command executed the configured test runner successfully.
- Full validation results are recorded in the completion summary after final validation.

## Blockers / Questions
- Owner should confirm whether refund processing time should be stated as a concrete number of business days before final NewebPay submission.
- Owner should confirm whether support remains email-only or whether LINE OA support should also be listed.
- Owner still needs to prepare external supporting documents and send them to NewebPay customer service separately.

## Tech Debt Review
- New technical debt introduced: none known.
- Existing technical debt observed: payment runtime is still intentionally gated and not public; public copy must remain aligned if launch status changes.
- Opportunistic cleanup completed: root homepage no longer presents internal foundation/status copy.
- Deferred cleanup candidates: prepare a screenshot capture checklist/package and final supplement email draft after owner confirms external documents.

## Recommended Next Step
Prepare NewebPay supplement email draft and external proof checklist/package for owner review using the updated public pages as screenshot sources.
