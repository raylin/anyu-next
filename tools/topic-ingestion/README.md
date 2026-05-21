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
- generates deterministic markdown trend review packs from module/topic/question context
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

PTT-like records are also supported in v0, including:

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

PTT title cleanup removes leading `Re:` and preserves title tags such as `[求助]` as tags instead of leaving them in the visible title.

## Source Weighting

Default source weights:

- `dcard`: `1.00`
- `ptt`: `0.70`
- `mobile01`: `0.35`
- `manual`: `0.80`
- `unknown`: `0.50`

These weights affect topic scoring and review ranking in a small, deterministic way.

- Dcard is treated as the closest consumer-tone signal.
- PTT is useful for stronger controversy and counter-signal evidence.
- Mobile01 is treated as low-weight reference material.

Mobile01-only candidates are capped more conservatively in scoring and should normally land as `watch` or `defer`, not `build`, unless reinforced by Dcard or PTT signals in a later batch.

## Risk Flags

Topic candidates and module seeds can now carry deterministic `riskFlags`, for example:

- `gender_polarized`
- `body_shaming`
- `adult_service_reference`
- `appearance_discrimination`
- `high_toxicity`
- `sensitive_health_or_family`
- `money_status_anxiety`
- `scam_or_fraud_reference`

These flags do not auto-delete candidates, but they can reduce ranking and push recommendations toward `watch` or `defer`.

High-toxicity, adult-service, gender-polarized, body-shaming, or appearance-discrimination flags now affect action labels directly. They remain useful as watch signals, but should not become build recommendations without explicit human review and brand-safe reframing.

## Brand-safe Reframing

The tool is allowed to ingest rougher source language, but generated question and module seed output should stay brand-safe.

In practice that means:

- avoid accusatory gender-war framing
- avoid body-shaming copy
- avoid adult-service-forward framing
- prefer actionable self-reflection or interaction-interpretation wording

The module seeds and review pack are still ideation scaffolding, not final ANYU copy.

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

## Trend Review Pack

The review pack is a Markdown artifact for human review. It is meant to support a weekly or biweekly decision loop after deterministic seeds have already been generated.

The review pack includes:

- summary counts
- top module seed candidates
- best mini-test opportunities
- relationship / ambiguity themes
- monetization fit notes
- risk / sensitivity notes
- recommended human review questions
- candidate table
- deferred / low-fit candidates

The review pack also surfaces:

- source mix notes
- risk flags
- heuristic action labels that prefer safer, more actionable ideas over higher-toxicity controversy

## Scoring Notes

Topic scores use dampened engagement and evidence scaling so high-volume topics do not all collapse to the same maximum score. Source diversity helps, source weight helps, and Mobile01-only topics are reference-capped.

Scores remain heuristic scaffolding. They are meant to create review separation, not to prove demand.

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
PYTHONPATH=tools/topic-ingestion python3 -m topic_ingestion.cli review \
  --modules /tmp/module-seeds.jsonl \
  --topics /tmp/topic-candidates.jsonl \
  --questions /tmp/question-seeds.jsonl \
  --output /tmp/trend-review-pack.md
```

```bash
PYTHONPATH=tools/topic-ingestion python3 -m topic_ingestion.cli pipeline \
  --input tools/topic-ingestion/examples/sample-input.jsonl \
  --topics-output /tmp/topic-candidates.jsonl \
  --questions-output /tmp/question-seeds.jsonl \
  --modules-output /tmp/module-seeds.jsonl \
  --review-output /tmp/trend-review-pack.md
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
- `tools/topic-ingestion/examples/trend-review-pack.example.md`

## modules Command

- input: question-seed JSONL
- optional `--topics`: topic-candidate JSONL for stronger inherited audience / signal context
- output: module-seed JSONL

If `--topics` is omitted, the command still works with question seeds alone and falls back to default relationship-oriented assumptions.

## Pipeline With Modules Output

- `pipeline` preserves the old behavior if `--modules-output` is omitted
- if `--modules-output` is provided, the pipeline emits topic candidates, question seeds, and module seeds in one local run

## review Command

- input: module-seed JSONL
- optional `--topics`: topic-candidate JSONL for stronger theme/evidence summaries
- optional `--questions`: question-seed JSONL for rationale context
- output: markdown review pack

If `--topics` or `--questions` are omitted, the review pack still renders using module-seed fields alone.

## Pipeline With Review Output

- `pipeline` preserves earlier behavior if `--review-output` is omitted
- if `--review-output` is supplied, the pipeline will generate module seeds internally even if you do not separately save `--modules-output`
- the review pack is always markdown-first in v0

## How To Use The Review Pack

- treat it as a local decision-support artifact
- use it in weekly or biweekly trend review
- use it to decide what to prototype, watch, or defer
- pass it to a human reviewer or ChatGPT/Claude for discussion, not for automatic execution

## Scores Are Heuristic

- ranking and recommended actions are deterministic heuristics
- they are useful scaffolding for review, not objective product truth
- they should not be used as final strategy without human judgment

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
