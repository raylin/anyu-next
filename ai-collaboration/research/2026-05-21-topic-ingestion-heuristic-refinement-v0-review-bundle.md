# Topic Ingestion Heuristic Refinement v0 Review Bundle

Date: 2026-05-21

## 1. Summary

Refined `tools/topic-ingestion/` heuristics based on the first private-batch dry run. The pass focused on reducing `uncategorized`, improving score separation, strengthening Mobile01 reference-only behavior, and making risk flags affect review actions more clearly.

## 2. Dry-run Findings Used

Used the sanitized findings from `Topic Ingestion Private Batch Dry Run v0`:

- 75 private input records
- 30 Dcard / 15 PTT / 30 Mobile01 source mix
- previous topic candidates: 11
- previous uncategorized bucket was the top bucket with 24 records
- previous score saturation repeatedly hit `0.95`
- previous action spread: 1 build / 7 watch / 3 defer

No raw private input or generated private output was committed.

## 3. Bucket Coverage Changes

Added deterministic buckets for:

- `交友平台比較`
- `交友檔案策略`
- `現實認識機會`
- `關係市場自我定位`
- `承諾壓力`
- `家庭婚姻價值衝突`
- `伴侶邊界與誤會`
- `外貌與個性拉扯`
- `金錢與狀態定位`
- `交友詐騙與假帳號焦慮`

Also narrowed an overly broad family/marriage keyword so financial-positioning records are less likely to be misrouted.

## 4. Scoring / Ranking Changes

- replaced the previous more saturation-prone score formula with dampened evidence and engagement scaling
- added source-diversity influence
- reduced score cap from repeated `0.95` behavior to a practical max of `0.91`
- added risk penalties into topic score and review ranking
- capped Mobile01-only topic scores lower

## 5. Mobile01 Reference-only Behavior

- Mobile01-only topics are capped in topic scoring
- Mobile01-only module candidates are capped in review ranking
- Mobile01-only module candidates now default to `watch` or `defer` rather than `build`

## 6. Risk Flag Action Changes

- `high_toxicity` and `adult_service_reference` push candidates toward `watch` or `defer`
- `gender_polarized`, `body_shaming`, and `appearance_discrimination` now also prevent easy `build` labels
- risk flags remain surfaced in the review pack rather than hidden or discarded

## 7. Brand-safe Reframing Changes

Added brand-safe question templates for the new buckets, including:

- platform choice
- profile strategy
- real-world meeting chance
- self-positioning
- commitment pressure
- family/marriage value conflict
- money/status pressure
- scam/fake-account anxiety

The wording avoids carrying raw toxic framing into module seed titles.

## 8. Tests Added

- representative synthetic records no longer fall into `uncategorized`
- Dcard otherwise-similar records score above Mobile01 records
- Mobile01-only records are capped lower
- sample score distribution has separation
- Mobile01-only module candidates do not become `build` by default
- brand-safe generated titles avoid toxic raw phrasing

## 9. Optional Private Batch Re-run Result

The private batch still existed under `.local/`, so the pipeline was rerun locally. Generated private outputs remained ignored and were not committed.

Sanitized aggregate result after refinement:

- topic candidates: 16, previously 11
- question seeds: 32, previously 22
- module seeds: 16, previously 11
- uncategorized evidence count: 12, previously 24
- score range: 0.53 to 0.87
- score median: 0.74
- unique topic scores: 15
- action spread: 0 build / 8 watch / 8 defer

Interpretation:

- bucket coverage improved materially
- score separation improved
- review actions became more conservative for this risk-heavy private batch
- remaining `uncategorized` volume still needs a later pass

## 10. What Remains Out Of Scope

- provider / LLM enrichment
- source fetching or crawler behavior
- committing private input or generated private outputs
- machine-learning ranking
- app runtime, DB, legal, LINE, or production behavior changes

## 11. Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

## 12. Recommended Next Step

Run one more small refinement pass only if the remaining 12 uncategorized records are still too broad after human review. Otherwise, pause heuristic work and use the current review pack for product judgment.
