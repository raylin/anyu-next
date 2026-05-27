# Handoff: Evidence Anchoring v3 Staging Provider Review v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Deploy/verify the evidence anchoring schema v3 implementation on staging and run one synthetic paid-generation review to confirm provider output quality, safety, and UI rendering.

## Scope

- Staging only.
- Do not deploy production.
- Do not change schema/prompt unless a small bug fix is required.
- Do not change LINE behavior.
- Do not change payment/ads/email.
- Do not record raw input, `paid_result_json`, provider output, tokens, LINE IDs, or secrets.

## Required Review

- Staging fresh analyze succeeds.
- Unlock/deferred paid generation succeeds.
- Paid result uses schema v3.
- `evidenceSummary` exists.
- `evidenceSummary` has 3-4 items.
- Each item has `label`, `summary`, and `reason`.
- Evidence items are model-generated summaries, not raw quotes.
- No names, phone numbers, addresses, accounts, long raw quote blocks, tokenized URLs, or private identifiers appear.
- Evidence cards render on unlocked paid result page.
- Evidence does not appear in free result, share card, or LINE reply surfaces.
- Possible states / reply strategies / 48-hour plan still render.
- Provider source is preferred; record whether fallback was used as safe aggregate only.
- Legacy/fallback paid-result compatibility remains intact.

## Validation

Run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint
cd apps/web && corepack pnpm test
cd apps/web && corepack pnpm build
cd apps/web && corepack pnpm test:e2e:local
```

## Deliverables

- `ai-collaboration/research/2026-05-27-evidence-anchoring-v3-staging-provider-review-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-27-evidence-anchoring-v3-staging-provider-review-v0-execution-report.md`
- update `ai-collaboration/summaries/summary_log.md`

## Commit

```bash
git commit -m "test: review evidence anchoring staging output"
git push origin HEAD:staging
```
