# Repo Maintenance Guide v0

Date: 2026-05-28

## Purpose

This document defines the current active vs historical boundaries for conservative repo cleanup.

## Active Product Path

Treat these as active and do not move or delete without a scoped handoff:

- `apps/web/`
- `docs/legal/`
- `docs/operations/production-deployment-runbook.md`
- `docs/operations/module-01-metrics-report.md`
- `docs/design-system/` current v1.1 canonical docs and brand assets
- `ai-collaboration/templates/`
- `ai-collaboration/decisions/`
- `ai-collaboration/summaries/summary_log.md`

## Current Stabilization Targets

After the Module 01 production buildout, prioritize conservative maintenance in these areas:

- deployment freshness: add or document a safe runtime build/commit marker before more production traffic
- metrics: keep funnel reports privacy-safe and explicitly non-sessionized until a sessionized analytics task is approved
- paid generation: preserve schema/prompt compatibility and monitor provider/fallback source rates
- LINE fulfillment: preserve global LIFF bridge and compatibility route behavior; do not alter token or signature handling casually
- themes/styles: keep Theme A and Theme B scoped to Module 01 until a broader design-system migration is approved
- public payment/legal copy: keep payment-disabled and provider-review safety tests in place until real payment integration is approved

## Historical / Reference Path

These remain valuable, but are not the active production runtime:

- `experiments/ambiguous_temperature_v0/`
- `oradar/`
- `scripts/`
- `docs/design-system/reference/`
- `docs/design/` Claude/high-fidelity design source files if present locally or newly added
- historical `ai-collaboration/handoffs/`, `reports/`, and most `research/`

## Do Not Touch Without Approval

Do not clean up or refactor these areas opportunistically:

- DB schema and migrations
- prompt/schema semantics or version naming
- LINE webhook signature verification, LIFF ID-token verification, token suffix strategy, or short-code behavior
- payment/provider integration, checkout, legal semantics, or invoice/tax posture
- production deployment model or environment variables
- analytics event names, metadata contracts, or metrics definitions without a migration plan
- compatibility adapters for legacy/fallback paid results

## Raw Output Policy

Committed raw text fixtures are not part of the active production path.

Current policy:

- keep structured or generated historical evidence only when it remains useful
- keep raw sample or evaluation text local-only unless a future handoff explicitly approves committed fixtures
- use `.gitkeep` or metadata-only files when a folder boundary should remain visible

## Cleanup Priority

When running future cleanup:

1. index and label history first
2. preserve app/runtime and canonical docs
3. review privacy-sensitive raw assets before deleting broader historical evidence
4. archive or extract legacy tooling only after human review
5. prefer small tested extractions over broad component/system rewrites
6. record deferred debt in `ai-collaboration/research/` or the current execution report before changing architecture
