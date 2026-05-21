# Topic Ingestion Trend Review Pack v0 Review Bundle

Date: 2026-05-21

## 1. Summary

Added a deterministic Markdown review-pack generator to `tools/topic-ingestion/` so the local pipeline now ends in a human-readable weekly/biweekly review artifact instead of only structured seed files.

## 2. Review Pack Contract

- output format: Markdown
- primary section shape:
  - `# Topic Ingestion Trend Review Pack`
  - `Generated At`
  - `## 1. Summary`
  - `## 2. Top Module Seed Candidates`
  - `## 3. Best Mini-Test Opportunities`
  - `## 4. Relationship / Ambiguity Themes`
  - `## 5. Monetization Fit Notes`
  - `## 6. Risk / Sensitivity Notes`
  - `## 7. Recommended Human Review Questions`
  - `## 8. Candidate Table`
  - `## 9. Deferred / Low-Fit Candidates`
- explicit disclaimer:
  - `Scores are heuristic ranking scaffolding, not a truth metric.`

## 3. Ranking / Action Heuristics

- deterministic only
- uses:
  - module `confidence`
  - topic `score` and `evidenceCount` when provided
  - presence of a non-empty `emotionalHook`
  - `mini-test` format bonus
  - monetization-fit bonus
  - `ambiguous-temperature` fit bonus from linked question seeds
- recommended actions are limited to:
  - `build`
  - `watch`
  - `defer`

## 4. CLI Changes

- added `review` command:
  - `python -m topic_ingestion.cli review --modules ... --topics ... --questions ... --output /tmp/trend-review-pack.md`
- `--topics` and `--questions` are optional
- review generation still works from module seeds alone if optional context is omitted

## 5. Pipeline Changes

- `pipeline` now accepts optional `--review-output`
- if `--review-output` is present:
  - module seeds are generated internally even if `--modules-output` is not requested
  - Markdown review output is written to the requested path
- if `--review-output` is omitted:
  - prior topic/question/module behavior remains unchanged

## 6. Examples Added

- `tools/topic-ingestion/examples/trend-review-pack.example.md`

## 7. Tests Added

- review-pack generation with topic/question enrichment
- review-pack generation without optional context
- deterministic ranking behavior
- `recommendedAction` bounded to `build/watch/defer`
- CLI `review` command writes Markdown
- `pipeline` with `--review-output`
- prior pipeline behavior still preserved when review output is omitted

## 8. What Is Still Out Of Scope

- provider / LLM enrichment
- source fetching / Dcard crawling / browser automation
- JSON review-pack schema or CMS-like storage
- app runtime, DB, legal, LINE, or production behavior changes

## 9. Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

## 10. Recommended Next Step

Use the extracted toolchain on a real local-only upstream JSONL batch and generate an actual review packet for human module selection, rather than widening the heuristics again immediately.
