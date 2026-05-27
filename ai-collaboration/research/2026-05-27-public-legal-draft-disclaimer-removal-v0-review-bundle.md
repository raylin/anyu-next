# Public Legal Draft Disclaimer Removal v0 Review Bundle

Date: 2026-05-27

## 1. Summary

Removed public-facing draft/legal-advice warning language from ANYU public privacy, terms, disclaimer, and legal index surfaces. Replaced it with formal, conservative service-document intro copy suitable for low-key beta and payment provider review.

No payment behavior, checkout, LINE behavior, paid generation, prompt/schema/cache/DB, or production payment behavior was changed.

## 2. Draft Language Removed

Removed public runtime references to:

- `v0` in legal page headings, visible version labels, metadata descriptions, and public legal body copy
- `內測階段的基礎草稿`
- `不是最終法律版本`
- `不是法律意見`
- `正式公開前`
- `合格專業人士審閱`

Internal task/report filenames and historical internal docs were not modified.

## 3. Replacement Intro Copy

Privacy now introduces how ANYU handles user-provided text and service usage information, with an update clause tied to service, payment, or legal requirement changes.

Terms now introduces service rules, delivery method, and user/service rights and obligations, with a similar update clause.

Disclaimer now introduces service scope and limits, explicitly framing ANYU as text-context organization and communication suggestions, not therapy, counseling, medical diagnosis, legal advice, or fortune-telling.

## 4. Privacy Copy Check

Privacy copy still states:

- users do not need to provide names or contact details for analysis
- users should not paste names, phone numbers, addresses, accounts, or identifying information
- submitted text is used for the requested analysis and necessary service delivery
- content is not publicly displayed
- content is not provided to third parties for marketing use
- analysis data follows retention cleanup rules with batch cleanup caveats

No immediate deletion, 24-hour deletion guarantee, complete anonymity, or 100% de-identification promise was added.

## 5. Refund / Delivery Copy Check

Terms still state planned future one-time digital delivery for full analysis, planned NT$49 pricing, no real charge during beta, web/LINE delivery, and support for re-delivery or refund when paid delivery fails, links cannot open, or duplicate payment occurs.

## 6. Invoice / Tax Copy Check

Invoice copy remains conservative: the service is currently offered as individual small-scale testing and does not issue unified invoices yet; future service type, operating scale, or legal requirement changes will be handled according to applicable rules.

No company, studio, business-registration, tax-exemption, or permanent no-invoice claim was added.

## 7. Support / Contact Copy Check

Public support remains `hello@anyu.tw`.

No owner personal email, phone, address, bank details, identity documents, or private applicant details were added.

## 8. Payment-disabled Verification

Payment remains disabled. Public copy still states the current beta does not really charge money.

No checkout, NewebPay/ECPay integration, payment webhook, payment DB schema, or real payment behavior was added.

## 9. Tests Added

Added legal-content assertions that public legal copy:

- uses formal service-ready intros
- does not contain the removed draft/legal-advice warning phrases
- keeps payment-disabled copy
- keeps refund/re-delivery copy
- keeps privacy retention boundaries concrete
- keeps invoice copy conservative
- keeps support email as `hello@anyu.tw`
- does not publish private applicant or business-registration claims

## 10. Staging QA Notes

After staging deployment, check:

- `/privacy`
- `/terms`
- `/disclaimer`
- `/legal`

Confirm the pages no longer show draft/legal-advice warnings, still read conservatively, still expose support/refund/privacy/invoice information, and do not expose checkout or private owner contact details.

## 11. Remaining Owner Actions

- Review the final public legal copy before payment provider submission.
- Decide whether provider review requires public phone/address/applicant details in a separate owner-approved task.
- Confirm invoice/tax posture before real payment launch.

## 12. Recommended Next Step

Deploy to staging, perform the legal-page QA checklist, then proceed with payment provider application preparation only after owner review.
