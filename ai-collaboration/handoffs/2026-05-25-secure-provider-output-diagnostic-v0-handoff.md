# Handoff: Secure Provider Output Diagnostic v0

Date: 2026-05-25

## Problem

Paid generation provider path remains unreliable. Final staging smoke still completed through fallback with `fallbackReason: output_validation`. We need field-level diagnostics without storing or printing raw provider output.

## Goal

Create a secure diagnostic path that identifies why provider-generated paid results fail schema/semantic validation, recording only sanitized field-level failure categories.

## Requirements

1. Do not persist raw provider output.
2. Do not print raw provider output.
3. Do not commit raw provider output.
4. Do not record raw input, paid_result_json, full result JSON, secrets, tokens, LINE IDs, email, or tokenized URLs.
5. Diagnostic output may include only:
   - parse success/failure
   - schema validation failure path(s)
   - missing field names
   - invalid field type names
   - array count summaries
   - semantic validation category
   - aggregate text length
   - copyableMessages count
   - provider/fallback source
6. Run diagnostic on staging synthetic paid-generation flow.
7. Use at least one synthetic case from the previous handoff.
8. After identifying the mismatch, apply the smallest targeted prompt/adapter/validator fix if safe.
9. Verify provider path succeeds without fallback on staging.
10. Keep fallback as fail-safe, not primary path.
11. Do not deploy production.
12. Do not wire LINE bind/webhook generation.
13. Do not implement payment/email/ads.

## Validation

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
cd apps/web && corepack pnpm test:e2e:local
```

## Required Artifacts

- `ai-collaboration/research/2026-05-25-secure-provider-output-diagnostic-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-25-secure-provider-output-diagnostic-v0-execution-report.md`
- `ai-collaboration/summaries/summary_log.md`

## Commit

```bash
git status --short
git add .
git commit -m "test: diagnose paid provider output safely"
git rev-parse --short HEAD
git push origin HEAD:staging
```
