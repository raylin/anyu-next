# Payment Runtime Env / Feature Flag Matrix v0 Handoff

Date: 2026-05-30

## Task

Create a complete payment runtime environment variable and feature flag matrix for staging and production before Phase 4 queue trigger implementation.

## Scope

Documentation and audit only.

In scope:

- Inventory env var and feature flag names from source.
- Map important routes to gates/auth/config.
- Create environment matrix for local, Preview, Preview(staging), and Production.
- Document operational caveats, launch readiness, risks, and recommendations.

Out of scope:

- Env value reads or changes.
- Deployment.
- Payment runtime enablement.
- Queue trigger implementation.
- LINE delivery.
- NewebPay behavior changes.
- Public copy changes.

## Constraints

- Do not print or commit env values.
- Do not modify Vercel env.
- Do not deploy.
- Do not commit secrets, raw `pa_` tokens, tokenized URLs, provider credentials, decrypted provider payloads, raw user input, personal billing data, or private proof documents.

## Validation Plan

- Docs presence check.
- Secret/private pattern scan on new docs.
- `git diff --check`.
