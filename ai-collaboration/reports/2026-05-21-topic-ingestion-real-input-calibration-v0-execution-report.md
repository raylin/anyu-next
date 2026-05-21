# Topic Ingestion Real Input Calibration v0 Execution Report

## Summary

Calibrated the local topic-ingestion pipeline toward real-world PTT-style forum input, added source weighting, widened topic buckets, introduced deterministic risk flags, and made review ranking more conservative for toxic/sensitive discourse.

## Files Created

- `ai-collaboration/handoffs/2026-05-21-topic-ingestion-real-input-calibration-v0-handoff.md`
- `ai-collaboration/research/2026-05-21-topic-ingestion-real-input-calibration-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-21-topic-ingestion-real-input-calibration-v0-execution-report.md`
- `tools/topic-ingestion/topic_ingestion/normalizers.py`
- `tools/topic-ingestion/topic_ingestion/risk.py`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`
- `tools/topic-ingestion/README.md`
- `tools/topic-ingestion/examples/topic-candidates.example.jsonl`
- `tools/topic-ingestion/examples/module-seeds.example.jsonl`
- `tools/topic-ingestion/examples/trend-review-pack.example.md`
- `tools/topic-ingestion/topic_ingestion/schema.py`
- `tools/topic-ingestion/topic_ingestion/loaders.py`
- `tools/topic-ingestion/topic_ingestion/extractors.py`
- `tools/topic-ingestion/topic_ingestion/transformers.py`
- `tools/topic-ingestion/topic_ingestion/review.py`
- `tools/topic-ingestion/topic_ingestion/cli.py`
- `tools/topic-ingestion/tests/test_loaders.py`
- `tools/topic-ingestion/tests/test_extractors.py`
- `tools/topic-ingestion/tests/test_transformers.py`
- `tools/topic-ingestion/tests/test_review.py`

## Calibration Input Handling

- no raw calibration JSONL file was available in the accessible local filesystem during this session
- no raw/private input was copied into the repo
- calibration was based on the provided real-input shape and characteristics from the handoff, then verified with synthetic fixtures only

## Source Weighting Changes

Added deterministic source weights:

- Dcard `1.00`
- PTT `0.70`
- Mobile01 `0.35`
- manual `0.80`
- unknown `0.50`

Applied them to topic scoring, module confidence, and review ranking so otherwise-similar Dcard signals outrank weaker-source analogs.

## Normalization Changes

- added source canonicalization
- added PTT title cleanup with `Re:` stripping and title-tag extraction
- added `content_raw` fallback cleanup
- added cleaned comment extraction
- added dislikes support
- added board/tag normalization

## Topic / Risk Changes

- added relationship-forum-specific topic buckets such as `交友疲勞`, `外貌焦慮`, `聊天能力落差`, and `AI 詐騙戀愛焦慮`
- added deterministic risk flags for polarization, body-shaming, toxicity, status anxiety, scam references, and related sensitivities
- propagated risk flags into topic candidates and module seeds

## Review Pack Changes

- review summary now shows source mix note
- candidate sections now show source mix and risk flags
- rationale now mentions source weight
- higher-risk candidates are pushed toward `watch` or `defer` more easily

## Tests Added

- PTT-like normalization coverage
- source-weight / risk extraction coverage
- risk propagation to module seeds
- review action guard for toxic candidates

## Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

## Known Technical Debt

- calibration still lacks one true local run against the user’s actual private JSONL sample
- topic matching remains first-match deterministic rather than multi-label

## Tech Debt Review

### New Technical Debt Introduced

- none

### Existing Technical Debt Observed

- topic heuristics are still narrow and order-sensitive when a single record matches multiple buckets
- source weighting and risk policies are intentionally simple and will need future tuning against real private batches

### Opportunistic Cleanup Completed

- introduced explicit helper modules for normalization and risk handling instead of spreading calibration logic through one large loader
- aligned committed examples to the new source-weight/risk-aware contract

### Deferred Cleanup Candidates

- optional multi-label topic scoring if first-match behavior becomes limiting
- stronger non-relationship defaults if upstream sourcing broadens beyond current dating/relationship discourse

### Recommended Follow-up

- run one local-only calibration batch with a real private input file outside git and inspect the review pack manually

## Deviations From Handoff

- the real raw calibration input was not available as a local file in this session, so no live private batch run was performed

## Git Commit

- pending at report-write time

## Staging Push

- pending at report-write time

## Remaining Uncertainties

- how much first-match topic routing will matter once real PTT batches include denser mixed discourse
- whether Mobile01 should eventually be penalized even more strongly in review ranking

## Recommended Next Step

`Topic Ingestion Private Batch Dry Run v0`
