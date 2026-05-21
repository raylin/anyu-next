# Topic Ingestion Private Batch Dry Run v0

Date: 2026-05-21

## Scope

Ran a local-only private batch dry run for `tools/topic-ingestion/` against:

```text
.local/topic-ingestion/private-batch/input.jsonl
```

All raw input and generated batch outputs stayed under `.local/` and were kept out of git.

## Aggregate Findings

- input records: `75`
- topic candidates: `11`
- question seeds: `22`
- module seeds: `11`

## Source Mix

- `dcard`: `30`
- `ptt`: `15`
- `mobile01`: `30`

## Top Topic Buckets

By current score/evidence ordering, the strongest buckets were:

- `topic-uncategorized-relationship-uncertainty`
- `topic-dating-market-appearance-anxiety`
- `topic-guan-xi-bian-jie`
- `topic-she-qun-wei-xun-hao`
- `topic-marriage-labor-value-conflict`

## Risk Flag Counts

- `money_status_anxiety`: `10`
- `body_shaming`: `9`
- `gender_polarized`: `9`
- `high_toxicity`: `8`
- `scam_or_fraud_reference`: `8`
- `appearance_discrimination`: `4`
- `adult_service_reference`: `3`
- `sensitive_health_or_family`: `3`

## Review-Pack Usefulness

The generated review pack looks structurally useful.

Observed positives:

- source-mix note rendered correctly
- risk flags surfaced correctly
- heuristic disclaimer was present
- ranking/action output was usable for review
- the calibrated build/watch/defer behavior was more conservative than earlier passes

Current ranked action spread across all module seeds:

- `build`: `1`
- `watch`: `7`
- `defer`: `3`

## Extractor Issues Observed

- the `uncategorized` bucket is still too large, which suggests the new bucket set does not yet cover enough of the private batch’s real discourse
- topic matching is still first-match deterministic, so overlapping records can be absorbed into one bucket even when another calibrated bucket is also plausible
- score saturation at `0.95` appears frequently among top buckets, which reduces separation quality for review ranking
- Mobile01 still contributes strongly when volume is high, even with reduced source weight, so reference-only behavior is only partially enforced right now
- several top buckets accumulated many risk flags at once, which is useful for safety but may still require cleaner brand-safe grouping downstream

## Recommended Improvements

- split or reduce the `uncategorized` bucket with a second pass of deterministic sub-buckets
- reduce score saturation so high-volume buckets separate more meaningfully
- consider a stronger Mobile01 penalty in topic scoring or review ranking
- consider limited multi-label or fallback-secondary routing for records with overlapping themes
- add one more deterministic reframe layer for high-risk appearance / gender-polarized discourse before module titles are reviewed by humans
