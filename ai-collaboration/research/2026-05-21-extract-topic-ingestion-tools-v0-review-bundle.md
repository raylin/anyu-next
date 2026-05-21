# Extract Topic Ingestion Tools v0 Review Bundle

Date: 2026-05-21

## Scope

Extracted a clean, provider-free `tools/topic-ingestion/` pipeline for structured JSONL input so topic candidates and question seeds can be generated without touching legacy crawler code or active app runtime.

## What Landed

- Added `tools/topic-ingestion/` with:
  - `topic_ingestion/schema.py`
  - `topic_ingestion/loaders.py`
  - `topic_ingestion/extractors.py`
  - `topic_ingestion/transformers.py`
  - `topic_ingestion/exporters.py`
  - `topic_ingestion/cli.py`
- Added a small Python-first CLI with:
  - `extract`
  - `questions`
  - `pipeline`
- Added synthetic examples only:
  - `sample-input.jsonl`
  - `topic-candidates.example.jsonl`
  - `question-seeds.example.jsonl`
- Added local tests for:
  - generic and Dcard-like record normalization
  - heuristic topic extraction
  - deterministic question-seed generation
  - end-to-end CLI behavior

## Input Contract

Supported JSONL records are source-agnostic and require only:

```json
{
  "id": "source-specific-id",
  "source": "manual",
  "title": "文章標題",
  "content": "文章摘要或正文"
}
```

Optional fields remain tolerant:

- `url`
- `publishedAt`
- `metrics.likes`
- `metrics.comments`
- `metrics.shares`
- `tags`

The loader also maps Dcard-like fields into this generic shape when present.

## Output Contract

The public JSONL contract now exports camelCase keys as requested:

- topic candidates:
  - `topicId`
  - `sourceIds`
  - `evidenceCount`
  - `createdAt`
- question seeds:
  - `questionId`
  - `topicId`
  - `moduleFit`
  - `whyItWorks`
  - `createdAt`

The CLI loader for topic candidates accepts either the exported camelCase form or internal snake_case fields to stay practical for local tooling.

## Heuristic v0 Rules

- provider-free
- deterministic
- source-agnostic
- simple keyword/topic grouping first

Current built-in topic buckets include:

- `已讀不回`
- `忽冷忽熱`
- `回訊變慢`
- `曖昧不確定`
- `社群微訊號`
- `關係邊界`
- fallback `未分類關係不確定`

## Explicit Non-Goals Preserved

- no Dcard fetching
- no browser automation
- no Cloudflare workaround
- no provider / LLM calls
- no movement or deletion of legacy crawler scripts
- no change to `oradar/product_runtime.py`
- no app runtime / schema / DB / legal / production behavior changes

## Known v0 Limitations

- heuristics are intentionally narrow and currently relationship-topic biased
- no module-idea seed output was added yet
- the new tool is extracted beside legacy code, not yet integrated into a broader ingestion workflow

## Recommended Follow-Up

- if the sourcing side becomes stable, add a narrow second pass for module-idea seed generation or richer topic scoring
- keep crawler/archive decisions separate from this extracted local transformation tool
