# Payment Runtime Activation Prep v0 Handoff

Shared policy:
Follow `AGENTS.md` and `ai-collaboration/process/*.md`.

## Metadata

- taskStartedAt: 2026-06-09T15:46:52Z
- model / effort: GPT-5 Codex, high effort
- branch: `staging`
- production scope: none

## Goal

Prepare a controlled payment runtime activation checklist/runbook without enabling runtime, running real payment, mutating production data, changing Vercel env, or changing provider configuration.

## Initial Plan

1. Inventory runtime gates, provider/static env requirements, runtime config controls, Admin/Ops requirements, processor/queue requirements, and fallback paths.
2. Classify production readiness across schema, NotifyURL/ReturnURL, entitlement/job/polling, access-link, Admin/Ops, and operator/no-card helper surfaces.
3. Draft activation, close/rollback, smoke, monitoring, and blocker classification sections.
4. Run documentation and local validation gates only.

## Hard Constraints

- Do not open production runtime.
- Do not run production payment or real NewebPay checkout.
- Do not send real Email or LINE.
- Do not mutate production DB.
- Do not modify Vercel env or NewebPay config.
- Do not change payment/provider behavior or product/legal copy.
- Do not expose secrets, tokenized URLs, provider payloads, or private values.

## Expected Report

Create `ai-collaboration/reports/2026-06-09-payment-runtime-activation-prep-v0.md` with runtime gate inventory, production readiness inventory, activation runbook, rollback/close plan, smoke/monitoring matrix, blocker classification, validation, production untouched confirmation, and next recommendation.
