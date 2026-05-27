# Legal / Provider-review Public Page QA v0 Review Bundle

Date: 2026-05-27

## 1. Summary

Staging public legal/provider-review QA passed at route/content level. No P0 or P1 issues were found.

Payment remains disabled. No checkout, NewebPay/ECPay redirect, card collection, owner private contact details, or business/studio/company-registration claim was observed in the checked public surfaces.

## 2. Staging Freshness

Checked staging routes on `https://staging.anyu.tw`.

The legal pages returned HTTP 200 and contained the formal 2026-05-27 public legal copy from the latest legal-copy commit, including the new service-ready privacy, terms, and disclaimer intros.

## 3. Pages Checked

- `/privacy`: HTTP 200
- `/terms`: HTTP 200
- `/disclaimer`: HTTP 200
- `/legal`: HTTP 200
- `/m/ambiguous-temperature`: HTTP 200
- `/m/ambiguous-temperature/result/demo`: HTTP 200, checked as the public demo paid-preview surface

## 4. Draft Language Removal

Public legal page text did not contain the removed draft/legal-warning phrases:

- `內測草稿`
- `基礎草稿`
- `不是最終法律版本`
- `不是法律意見`
- `正式公開前建議專業人士審閱`

No visible legal page `v0` draft framing was observed. A raw HTML scan of the Module 01 page still includes internal serialized experiment metadata containing `v0`; this was not visible body copy and was not treated as public legal draft language.

## 5. Product / Payment Copy QA

The public demo paid-preview surface included:

- planned full-analysis price `NT$49`
- current beta no-real-charge copy
- delivery through web or LINE link
- included deliverables: 3 possible states, reply strategy/copy, 48-hour observation advice, evidence-summary signals, and re-openable full result page

No wording implied payment is currently enabled.

## 6. Refund / Re-delivery QA

Terms and paid-preview surfaces include:

- generated digital content framing
- generally non-refundable after successful future paid delivery
- re-delivery/refund support for system failure, unavailable link, or duplicate payment
- support contact through `hello@anyu.tw`

No universal refund promise was observed.

## 7. Privacy / Trust QA

Privacy/trust copy includes:

- do not paste names, phone numbers, addresses, accounts, or identifiable information
- input is used for the requested analysis and necessary service delivery
- content is not publicly displayed
- content is not provided to third parties for marketing
- analysis data follows retention cleanup rules with batch-cleanup caveats

Unsupported privacy promises were not observed:

- no immediate deletion promise
- no 24-hour deletion guarantee wording
- no complete anonymity claim
- no 100% non-identifiability claim
- no vague-only `盡量去識別化` phrasing

## 8. Service Limitation QA

The disclaimer page states the service is not psychological therapy, counseling, medical diagnosis, legal advice, or fortune-telling. The paid-preview service limitation also frames ANYU as text-context organization and communication suggestions, not a relationship outcome guarantee.

The wording is conservative and readable rather than alarmist.

## 9. Invoice / Tax Posture QA

Terms include conservative individual small-scale testing invoice copy:

- currently no unified invoice
- future service type, operating scale, or legal requirement changes will be handled according to applicable rules

No permanent no-invoice, tax-exempt, company invoice, studio invoice, company, studio, or business-registration claim was observed.

## 10. Support / Contact QA

Public support contact remains `hello@anyu.tw`.

No owner personal email, phone, private address, bank details, identity documents, merchant IDs, or payment credentials were observed or recorded.

## 11. Payment-disabled Verification

Payment remains disabled.

The checked public pages did not expose:

- checkout page
- real payment button
- NewebPay redirect
- ECPay redirect
- card-data form
- claim that payment is currently enabled

## 12. Issues Found

P0: none.

P1: none.

P2:

- Interactive visual/browser QA was blocked in this environment by the known Chromium MachPort permission issue. Route/content-level staging checks passed, and local validation passed.
- A raw HTML scan of `/m/ambiguous-temperature` contains internal serialized experiment metadata with `v0`; it is not visible public body copy and does not present legal pages as draft.

## 13. Recommended Next Step

Proceed to `NewebPay Application Submission Checklist v0`, with owner review of public legal copy before submitting payment provider materials.
