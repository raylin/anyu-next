# NewebPay Supplement Email Draft and Attachment Checklist v0 Handoff

Date: 2026-05-30
Branch: staging

## Task

Prepare a documentation-only NewebPay merchant review supplement package draft for owner review.

## Scope

- Summarize public website updates completed in the previous implementation.
- Create an external attachment checklist with placeholders only.
- Draft a self-developed system statement.
- Draft a Traditional Chinese NewebPay customer service email.
- Add owner confirmation checklist before sending.

## Constraints

- Do not modify payment runtime, production flags, NewebPay checkout/notify behavior, queue trigger, LINE delivery, prompts, schemas, or public website copy.
- Do not commit private attachments, invoices, screenshots with private data, provider credentials, API keys, account IDs, raw billing details, tokenized URLs, raw user input, or secrets.
- Do not fabricate invoices, contracts, domain proof, hosting proof, API proof, or business registration materials.
- Use only attachment names/placeholders in the repo.

## Notes

- Public support email has been verified as `hello@anyu.tw` in current site/legal copy.
- Root homepage and `/refund` page already include the review-critical public content from the prior implementation.
- Owner must prepare and send external proof documents outside the repository.

## Validation Plan

- Docs presence check.
- Secret/private pattern scan on new docs and summary log.
- `git diff --check`.
