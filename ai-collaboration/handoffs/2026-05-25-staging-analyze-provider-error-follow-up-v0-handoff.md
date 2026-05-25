# Handoff: Staging Analyze Provider Error Follow-up v0

Date: 2026-05-25

Task source: user request in Codex CLI on 2026-05-26 Asia/Taipei.

## Objective

Diagnose and fix staging fresh analyze HTTP 502 `provider_error` observed after applying Two-tier Phase 1 migration `0005` to staging. Fresh analyze must succeed so `analysis_requests.user_context_json` and `analysis_paid_results` shadow writes can be verified.

## Scope

Focus on fresh analyze path only: provider call, prompt/schema v2, JSON parse/schema validation, paid-result semantic validation, result persistence, user_context_json persistence, and shadow `analysis_paid_results` write.

Do not switch analyze to free-only, implement deferred paid generation, apply production 0005, deploy production, change LINE/payment/email/ads behavior, or dump raw input/provider output/paid_result_json/secrets/tokenized URLs.

## Required Verification

After fix, verify staging with sanitized synthetic input/context:

- fresh staging analyze returns HTTP 200
- result page loads
- `analysis_requests.user_context_json` persists allowlisted context
- `analysis_paid_results` shadow row is created with completed status
- current ProductResult behavior remains unchanged
- unlock intent and unlocked route work
- no raw input/provider output/paid_result_json/secrets in logs/events/reports

## Required Artifacts

- `ai-collaboration/research/2026-05-25-staging-analyze-provider-error-follow-up-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-25-staging-analyze-provider-error-follow-up-v0-execution-report.md`
- update `ai-collaboration/summaries/summary_log.md`

## Required Validation

- `python3 -m compileall oradar`
- `python3 -m compileall tools/topic-ingestion`
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`
- `cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build`
- `cd apps/web && corepack pnpm test:e2e:local`

## Commit

`fix: restore staging fresh analyze`
