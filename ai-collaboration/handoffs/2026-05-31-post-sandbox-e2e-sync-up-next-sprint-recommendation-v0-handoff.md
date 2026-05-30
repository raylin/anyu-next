# Post-Sandbox E2E Sync-Up / Next Sprint Recommendation v0 Handoff

Date: 2026-05-31

## Task

Produce a grounded next-sprint recommendation after Fresh NewebPay Sandbox E2E Payment Smoke v5 passed.

## Scope

In scope:

- Confirm current state from source, dashboard, and recent reports.
- Identify safe work categories while waiting for NewebPay merchant review.
- Rank candidate tasks by priority, risk, impact, runtime touch, and recommended Codex task title.
- Review product and engineering opportunities at a planning level.
- Clearly state guardrails and owner decisions.

Out of scope:

- Runtime behavior changes.
- Production payment enablement.
- Vercel env changes.
- Deployment.
- Real payments.
- LINE delivery.
- NewebPay production behavior changes.
- Secrets or private values.

## Validation Plan

- docs presence check
- secret/private scan
- `git diff --check`

If code changes unexpectedly:

- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`

## Execution Notes

- Confirmed dashboard already reflects sandbox E2E pass and production disabled posture.
- Inspected public homepage, Module 01 landing/result/payment pages, paid preview component, refund/legal pages, and known tech debt reports.
- Identified the highest-value next sprint as payment-launch UX alignment because `PaidPreviewCard` still shows internal-test / no-charge / LINE-or-Email copy while the public homepage presents NT$49 web delivery.
- Created a planning report with ranked candidate tasks and guardrails.
