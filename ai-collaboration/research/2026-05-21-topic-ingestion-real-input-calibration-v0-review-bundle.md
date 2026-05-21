# Topic Ingestion Real Input Calibration v0 Review Bundle

Date: 2026-05-21

## 1. Summary

Calibrated `tools/topic-ingestion/` toward the described real-world forum/social JSONL shape, especially PTT-style records, while keeping all calibration improvements deterministic and repo-safe.

## 2. Local Raw Input Handling

- no raw calibration JSONL file was present in the accessible local paths during this session
- no raw private input was copied into the repo
- calibration was implemented from the handoff’s described PTT-style structure and validated with synthetic fixtures only
- this preserves the local-only/raw-out-of-git requirement

## 3. Source Weighting

Added documented deterministic source weights:

- `dcard`: `1.00`
- `ptt`: `0.70`
- `mobile01`: `0.35`
- `manual`: `0.80`
- `unknown`: `0.50`

Applied the weights to:

- topic scoring
- module-seed confidence
- review-pack ranking rationale

## 4. PTT Normalization

Added support for PTT-like records, including:

- `platform`
- `platform_post_id`
- `board`
- `content_raw`
- `created_at`
- `dislike_count`
- `comments`
- `extra.push_count`
- `extra.boo_count`
- `extra.raw_title`

Normalization behavior now includes:

- `Re:` stripping
- `[求助]`-style title tag extraction into tags
- board tag inclusion
- HTML/content_raw cleanup fallback
- comment-text normalization
- dislike and source-weight handling

## 5. Topic Bucket Updates

Added or widened buckets for:

- `交友疲勞`
- `外貌焦慮`
- `線下介紹懷疑`
- `自介與檔案包裝`
- `聊天能力落差`
- `回覆節奏控制`
- `婚姻與價值壓力`
- `算命當感情工具`
- `AI 詐騙戀愛焦慮`

These supplement the earlier ambiguity/relationship buckets instead of replacing them.

## 6. Risk Flags

Added deterministic risk-flag inference for:

- `gender_polarized`
- `body_shaming`
- `adult_service_reference`
- `appearance_discrimination`
- `high_toxicity`
- `sensitive_health_or_family`
- `money_status_anxiety`
- `scam_or_fraud_reference`

Risk flags now propagate into:

- topic candidates
- module seeds
- review-pack risk notes and action heuristics

## 7. Brand-safe Reframing

Calibration also widened the question/module seed layer with safer reframes for higher-risk themes, for example:

- appearance anxiety
- dating-app fatigue
- marriage/future pressure
- AI scam fear

The tool still ingests rougher upstream discourse, but downstream module ideation stays more brand-safe and less accusatory.

## 8. Review Pack Changes

The review pack now shows:

- source mix notes
- source-weight-aware rationale
- candidate risk flags
- more conservative `watch/defer` behavior for higher-toxicity candidates

## 9. Tests Added

- PTT-like loader normalization
- source-weight and risk-flag extraction behavior
- module-seed risk propagation
- review action guard for high-toxicity candidates

## 10. What Remains Out Of Scope

- provider / LLM enrichment
- source fetching / Dcard crawling / browser automation
- committing or retaining real raw calibration input
- app runtime, DB, legal, LINE, or production behavior changes

## 11. Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

## 12. Recommended Next Step

Run one true local-only calibration pass against an actual private upstream JSONL file outside git and inspect the generated review pack before doing any broader heuristic widening.
