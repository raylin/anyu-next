# Topic Ingestion Heuristic Refinement v0 Execution Report

## Summary

Refined deterministic topic-ingestion heuristics to reduce uncategorized output, improve ranking separation, strengthen Mobile01 reference-only behavior, and make risk flags affect action recommendations more directly.

## Files Created

- `ai-collaboration/handoffs/2026-05-21-topic-ingestion-heuristic-refinement-v0-handoff.md`
- `ai-collaboration/research/2026-05-21-topic-ingestion-heuristic-refinement-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-21-topic-ingestion-heuristic-refinement-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`
- `tools/topic-ingestion/README.md`
- `tools/topic-ingestion/topic_ingestion/extractors.py`
- `tools/topic-ingestion/topic_ingestion/transformers.py`
- `tools/topic-ingestion/topic_ingestion/review.py`
- `tools/topic-ingestion/tests/test_extractors.py`
- `tools/topic-ingestion/tests/test_review.py`
- `tools/topic-ingestion/tests/test_transformers.py`

## Bucket Changes

- added new deterministic buckets for platform comparison, profile strategy, real-world meeting chance, self-positioning, commitment pressure, family/marriage value conflict, partner boundary/miscommunication, appearance/personality debate, money/status positioning, and scam/fake-account anxiety
- narrowed one broad family/marriage keyword to avoid stealing money/status records

## Scoring Changes

- replaced the prior score formula with dampened evidence and engagement scaling
- added source-diversity contribution
- lowered practical score cap to reduce repeated saturation
- added risk penalties
- capped Mobile01-only topic scores lower

## Source Weighting / Mobile01 Changes

- Mobile01-only topic candidates are reference-capped
- Mobile01-only module candidates are capped in review ranking
- Mobile01-only module candidates now default to `watch` or `defer`, not `build`

## Risk / Reframe Changes

- stronger action penalties for high toxicity, adult-service references, gender polarization, body-shaming, and appearance discrimination
- new brand-safe question templates for the added buckets
- generated titles avoid carrying raw toxic framing into review artifacts

## Tests Added

- new bucket coverage against representative synthetic examples
- Dcard above Mobile01 source-weight behavior
- Mobile01-only score cap
- score distribution separation
- Mobile01-only action guard
- brand-safe reframe guard

## Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

## Known Technical Debt

- `uncategorized` still has non-trivial volume after the private rerun
- first-match topic routing is still deterministic and single-label

## Tech Debt Review

### New Technical Debt Introduced

- none

### Existing Technical Debt Observed

- remaining uncategorized volume indicates more bucket coverage may be needed
- risk-heavy private batches can now produce zero `build` candidates, which is safer but may be too conservative for some product review sessions

### Opportunistic Cleanup Completed

- tightened the scoring formula into a more review-useful spread
- documented Mobile01 reference-only behavior in the README

### Deferred Cleanup Candidates

- optional second-pass classification for uncategorized records
- optional multi-label topic routing if single-label first-match behavior proves too lossy

### Recommended Follow-up

- review the current private review pack as a human product artifact before doing another heuristic pass

## Deviations From Handoff

- none

## Git Commit

- pending at report-write time

## Staging Push

- pending at report-write time

## Remaining Uncertainties

- whether the zero-build outcome on the private rerun is the right level of conservatism
- whether remaining uncategorized records deserve more buckets or should stay as review-only signals

## Recommended Next Step

`Topic Ingestion Human Review Decision v0`
