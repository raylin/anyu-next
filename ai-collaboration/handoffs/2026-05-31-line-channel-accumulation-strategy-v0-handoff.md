# LINE Channel Accumulation Strategy v0 Handoff

Date: 2026-05-31
Task: LINE Channel Accumulation Strategy v0

## Goal

Plan how ANYU should use LINE as a consent-based retention and owned-channel layer without conflicting with web-based paid delivery.

## Scope

Documentation and planning only. No implementation, schema change, LINE push, payment behavior change, production flag change, or env change.

## Required Work

- Inventory existing LINE/LIFF/ContactCapture/short-code/webhook/fulfillment infrastructure.
- Reposition LINE as save-for-later, notification, support, new module, early access, discount, and future insight channel.
- Map CTA timing across homepage, free result, paid CTA, checkout-start, ReturnURL, paid ready, and completed result.
- Plan future data model/event strategy without implementing schema.
- Define early segmentation, message cadence, consent/compliance, implementation phases, Module 02 relation, and next tasks.

## Safety Constraints

- Do not promise LINE paid report delivery.
- Do not implement LINE delivery or push messages.
- Do not change production payment behavior.
- Do not commit secrets, LINE IDs, raw inputs, tokens, provider payloads, or private values.
