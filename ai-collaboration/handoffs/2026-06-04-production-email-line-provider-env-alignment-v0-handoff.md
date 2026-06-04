# Production Email/LINE Provider Env Alignment v0 Handoff

Date: 2026-06-04

## Task

Align Production Email and LINE provider env readiness for a future controlled production credit-card smoke while keeping production payment runtime disabled.

## Context

- Production DB has clean access-link schema.
- Production access-link crypto env names are present.
- Production NewebPay provider env names are present.
- Production runtime and checkout remain disabled/fail-closed.
- Email provider env is missing.
- LINE message provider flag is missing/gated.
- Controlled production payment smoke has not run.

## Constraints

- Do not enable production payment runtime or checkout.
- Do not run real production payments.
- Do not send production Email or LINE messages.
- Do not expose secrets, provider credentials, tokenized URLs, or private values.
- Do not rotate existing production access-link secrets.
- Do not modify Preview(staging) env.

## Plan

1. Confirm exact active env names from source.
2. Verify local/operator source name presence without printing values.
3. Add missing Production Email provider env names if secure local source exists.
4. Add missing Production LINE provider flag/env names only as needed by current code.
5. Redeploy Production to activate env changes, preserving disabled runtime flags.
6. Verify Production health, public pages, and fail-closed routes.
7. Re-list Production env names presence only.
8. Document NewebPay owner-side checklist and readiness classification.
9. Update report, summary log, dashboard, commit, and push.

## Expected Report

`ai-collaboration/reports/2026-06-04-production-email-line-provider-env-alignment-v0.md`

