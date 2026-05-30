# NewebPay Sandbox E2E Smoke Plan v0 Handoff

Date: 2026-05-30

## Task

Create an ANYU-specific NewebPay sandbox end-to-end smoke plan for checkout -> NotifyURL -> paid delivery -> queue -> paid result access once sandbox credentials are available.

## Scope

In scope:

- Document sandbox credential/env checklist by env var name only.
- Map ANYU routes to the NewebPay sandbox flow.
- Define Preview(`staging`) setup, E2E sequence, expected states, safety checks, failure categories, and observability checklist.
- Update summary log.

Out of scope:

- Runtime, env, production flag, deployment, checkout/notify/payment behavior, LINE, prompt/result, or public copy changes.
- Real payments.
- Provider credentials or sandbox secrets.

## Constraints

- Planning/checklist only.
- Do not include MerchantID, HashKey, HashIV, card data, raw provider payloads, decrypted payloads, raw `pa_`, `pcs_`, tokenized URLs, raw user input, private billing, or proof documents.

## Validation Plan

- Docs presence check.
- Secret/private scan.
- `git diff --check`.
