# NewebPay Merchant Review Public Content Implementation v0 Handoff

Date: 2026-05-30
Branch: staging

## Task
Implement public website content updates for NewebPay merchant review supplementation after the remediation plan found the root homepage did not present an obvious storefront.

## Scope
Public copy, public page structure, refund visibility, footer/navigation discoverability, and tests only.

## Constraints
- Do not enable payment runtime.
- Do not change production flags.
- Do not modify NewebPay checkout, NotifyURL, ReturnURL mutation behavior, payment provider runtime, queue trigger, LINE delivery, prompts, result schema, or paid generation behavior.
- Do not commit external proof documents, invoices, private screenshots, provider credentials, raw user input, or secrets.
- Do not fabricate business, domain, API, hosting, invoice, or vendor proof documents.

## Implementation Notes
- Replace root homepage internal foundation copy with provider-review-friendly storefront content for Module 01.
- Add product preview/mock report area using existing UI tokens and no private user content.
- Surface NT$49 one-time, non-subscription charging model.
- Surface web delivery and processing-state expectations.
- Add dedicated refund policy page and include it in legal navigation/footer.
- Keep support contact as existing public email: hello@anyu.tw.
- Keep payment runtime and provider behavior unchanged.

## Validation Plan
- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- Optional Python validation because Python areas are unchanged.

## Expected Deliverables
- Public storefront/root page update.
- Refund policy page and link visibility.
- Tests for provider-review content and refund/legal copy.
- Execution report and summary log update.
