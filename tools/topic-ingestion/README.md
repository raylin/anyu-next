# Topic Ingestion

## Purpose

This tool extracts reusable, source-agnostic topic candidates, question seeds, and module idea seeds from structured JSONL input.

It exists to support a future ANYU trend-driven module pipeline:

```text
structured jsonl input
→ normalize records
→ topic candidates
→ question seeds
→ future module/theme ideas
```

## What This Tool Does

- loads JSONL records from any upstream source
- tolerates missing optional fields
- maps Dcard-like field names into a generic record shape when present
- extracts deterministic topic candidates using heuristic rules
- generates deterministic question seeds from topic candidates
- generates deterministic module seeds from question/topic context
- exports topic candidates, question seeds, and module seeds as JSONL

## What This Tool Does Not Do

- fetch from Dcard
- fetch from any website
- run browser automation
- bypass Cloudflare
- require provider API keys
- call an LLM/provider in v0
- use real raw/private fixtures in repo

## Input JSONL Contract

Minimum supported record:

```json
{
  "id": "source-specific-id",
  "source": "manual",
  "title": "文章標題",
  "content": "文章摘要或正文"
}
```

Optional fields:

```json
{
  "url": "optional",
  "publishedAt": "optional ISO datetime",
  "metrics": {
    "likes": 123,
    "comments": 45,
    "shares": 0
  },
  "tags": ["optional", "tags"]
}
```

The loader also maps Dcard-like fields such as:

- `source_id` → `id`
- `created_at` → `publishedAt`
- `like_count` → `metrics.likes`
- `comment_count` → `metrics.comments`
- `topics` → `tags`
- `excerpt` is merged into `content` when useful

## Topic Candidate Output

Each topic candidate is exported as JSONL, for example:

```json
{
  "topicId": "topic-yi-du-bu-hui",
  "sourceIds": ["post-001", "post-002"],
  "title": "已讀不回",
  "summary": "多人討論回覆中斷、等待焦慮與投入不確定的情境。",
  "signals": ["已讀不回", "等待焦慮", "投入不確定"],
  "audience": "22–35 relationship-curious users",
  "evidenceCount": 2,
  "score": 0.86,
  "createdAt": "2026-05-21T00:00:00+00:00"
}
```

## Question Seed Output

Each question seed is exported as JSONL, for example:

```json
{
  "questionId": "question-topic-yi-du-bu-hui-1",
  "topicId": "topic-yi-du-bu-hui",
  "question": "他是真的忙，還是其實在冷掉？",
  "moduleFit": "ambiguous-temperature",
  "whyItWorks": "這類題目帶有高不確定性，容易轉成輕量測驗。",
  "tone": "warm, subtle, slightly mysterious",
  "createdAt": "2026-05-21T00:00:00+00:00"
}
```

## Module Seed Output

Each module seed is exported as JSONL, for example:

```json
{
  "moduleId": "ambiguous-temperature-followup",
  "topicId": "topic-yi-du-bu-hui",
  "questionIds": ["question-topic-yi-du-bu-hui-1", "question-topic-yi-du-bu-hui-2"],
  "title": "他是真的忙，還是其實在冷掉？",
  "format": "mini-test",
  "audience": "22–35 relationship-curious users",
  "emotionalHook": "已讀不回、等待焦慮的矛盾感",
  "userPromise": "幫你判斷多人討論回覆中斷、等待焦慮與投入不確定的情境。更接近降溫、觀望，還是只是節奏不同。",
  "inputNeeded": ["對話片段", "最近互動變化", "見面或邀約情境"],
  "outputSections": ["溫度分數", "三個小訊號", "下一句怎麼回"],
  "monetizationFit": "paid follow-up reply strategy",
  "tone": "warm, subtle, slightly mysterious",
  "confidence": 0.45,
  "createdAt": "2026-05-21T00:00:00+00:00"
}
```

## CLI Usage

Direct module usage without install:

```bash
PYTHONPATH=tools/topic-ingestion python3 -m topic_ingestion.cli extract \
  --input tools/topic-ingestion/examples/sample-input.jsonl \
  --output /tmp/topic-candidates.jsonl
```

```bash
PYTHONPATH=tools/topic-ingestion python3 -m topic_ingestion.cli questions \
  --input /tmp/topic-candidates.jsonl \
  --output /tmp/question-seeds.jsonl
```

```bash
PYTHONPATH=tools/topic-ingestion python3 -m topic_ingestion.cli modules \
  --input /tmp/question-seeds.jsonl \
  --topics /tmp/topic-candidates.jsonl \
  --output /tmp/module-seeds.jsonl
```

```bash
PYTHONPATH=tools/topic-ingestion python3 -m topic_ingestion.cli pipeline \
  --input tools/topic-ingestion/examples/sample-input.jsonl \
  --topics-output /tmp/topic-candidates.jsonl \
  --questions-output /tmp/question-seeds.jsonl \
  --modules-output /tmp/module-seeds.jsonl
```

Optional editable install path:

```bash
python3 -m pip install -e tools/topic-ingestion
python3 -m topic_ingestion.cli extract --input ... --output ...
```

## Examples

Example files:

- `tools/topic-ingestion/examples/sample-input.jsonl`
- `tools/topic-ingestion/examples/topic-candidates.example.jsonl`
- `tools/topic-ingestion/examples/question-seeds.example.jsonl`
- `tools/topic-ingestion/examples/module-seeds.example.jsonl`

## modules Command

- input: question-seed JSONL
- optional `--topics`: topic-candidate JSONL for stronger inherited audience / signal context
- output: module-seed JSONL

If `--topics` is omitted, the command still works with question seeds alone and falls back to default relationship-oriented assumptions.

## Pipeline With Modules Output

- `pipeline` preserves the old behavior if `--modules-output` is omitted
- if `--modules-output` is provided, the pipeline emits topic candidates, question seeds, and module seeds in one local run

## How Module Seeds Should Be Used

- ideation input for future ANYU module review
- weekly or biweekly trend synthesis
- lightweight opportunity-radar product packaging discussions

These seeds are intended to help decide what to prototype next, not to act as shipping product definitions.

## What Is Not Final Product Copy

- module seed `title`
- `emotionalHook`
- `userPromise`
- `monetizationFit`

These are heuristic scaffolding fields for downstream product thinking. They are not reviewed UX copy, not legal copy, and not final module spec language.

## Privacy / Fixture Rules

- do not commit raw/private sourced JSONL
- keep repo fixtures synthetic only
- treat upstream source exports as local-only inputs unless a later handoff explicitly approves committed sanitized fixtures

## Future Integration With Sourcing Tools

This tool assumes upstream sourcing is handled elsewhere.

Future sourcing tools may provide:

- hot-post lists
- structured post exports
- aggregated trend JSONL

As long as they can emit structured JSONL, this tool should remain source-agnostic.
