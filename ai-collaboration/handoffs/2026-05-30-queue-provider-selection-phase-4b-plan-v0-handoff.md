# Queue Provider Selection / Phase 4B Plan v0 Handoff

Date: 2026-05-30

## Task

Plan Phase 4B queue provider selection and real provider wiring before implementation.

## Scope

In scope:

- Review current Phase 4A queue trigger abstraction and tests.
- Compare realistic queue/orchestration options for a one-person Vercel-hosted product.
- Recommend a Phase 4B provider and adapter design.
- Plan webhook/processor auth, idempotency, failure behavior, env names, tests, and staging QA.
- Produce report, handoff, summary log, commit, and staging push.

Out of scope:

- Real provider wiring.
- External queue calls.
- Env changes.
- Deploys.
- Payment runtime enablement.
- LINE delivery.
- NewebPay checkout/notify/payment behavior changes.
- Public copy or prompt/result changes.

## Constraints

- Planning/documentation only.
- Do not include secrets, provider credentials, queue credentials, raw tokens, tokenized URLs, decrypted payloads, raw input, private billing, or proof documents.
- Vercel Hobby Cron must not be recommended as the primary paid generation trigger.

## Validation Plan

- Docs presence check.
- Secret/private scan on new docs.
- `git diff --check`.
