# Repeated / Concurrency Paid-Generation Benchmark v0 Handoff

Shared policy:
Follow `AGENTS.md` and `ai-collaboration/process/*.md`.

## Metadata

- taskStartedAt: 2026-06-09T14:52:28Z
- model / effort: GPT-5 Codex, high effort
- branch: `staging`
- production scope: none

## Goal

Benchmark and harden local/mock paid-generation behavior under repeated requests, polling, retry, and lightweight concurrency without real payment, real Email, real LINE, production runtime, Vercel env changes, or production DB mutation.

## Initial Plan

1. Inventory the current paid-generation chain from payment intent through entitlement, access token, generation job, paid artifact, processor, polling/status route, and `/r` access-link.
2. Build a scenario matrix for repeated polling, repeated generation triggers, repeated processor invocations, same-token concurrency, invalid/expired repeated access, failed/stuck recovery, and completed repeated access.
3. Add focused deterministic tests first; fix narrowly only if tests reveal unsafe non-idempotent behavior.
4. Run required local validation gates and document skipped deployed/real-channel gates.

## Hard Constraints

- Do not run production runtime or production payment.
- Do not send real Email or LINE.
- Do not modify Vercel env or NewebPay config.
- Do not mutate production DB.
- Do not change product/legal copy or visual surfaces except test markers if needed.
- Do not expose secrets, private values, raw tokens, provider payloads, or tokenized URLs.
- Do not use ad hoc scripts.

## Expected Report

Create `ai-collaboration/reports/2026-06-09-repeated-concurrency-paid-generation-benchmark-v0.md` with inventory, scenario matrix, automated coverage, fixes if any, validation, production untouched confirmation, remaining risks, and next recommendation.
