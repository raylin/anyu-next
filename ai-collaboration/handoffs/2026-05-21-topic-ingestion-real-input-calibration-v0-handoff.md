# Handoff: Topic Ingestion Real Input Calibration v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Calibrate `tools/topic-ingestion/` against real-world raw structured input while keeping raw data local-only and out of git.

This task should improve the extractor's handling of real forum/social JSONL formats, especially PTT-style records with long content, comments, HTML/raw fields, title prefixes, and high-toxicity relationship discourse.

The task should also encode source-weighting strategy:

```text
Dcard = highest weight
PTT = secondary / controversy and counter-signal weight
Mobile01 = reference only / low weight
```

This is a calibration + deterministic heuristic improvement task.

Do not commit raw input.

Do not add LLM/provider enrichment.

Do not implement sourcing/crawling.

Do not change app runtime, model, prompt/schema, DB schema, legal semantics, LINE flow, auth, payment, portal, production ops behavior, or product logic.

## Background

Topic ingestion v0 toolchain is complete.

Current local loop:

```text
source JSONL
→ topic candidates
→ question seeds
→ module seeds
→ trend review pack
```

Completed tasks:

```text
Extract Topic Ingestion Tools v0
Topic Ingestion Module Seed v0
Topic Ingestion Trend Review Pack v0
```

User provided a real raw input sample containing PTT-style `Boy-Girl` records.

Observed traits:

```text
- platform/title/content/content_raw/comments/extra fields
- title often starts with Re:
- PTT board tags like [求助], [分享], [心情]
- content_raw contains HTML, push comments, images, iframes, signatures
- content includes high-toxicity relationship/dating-market discourse
- comments contain important social consensus/counter-signal
```

User weighting rule:

```text
Dcard should carry the highest source weight.
PTT should be second.
Mobile01 should be reference-only.
```

Interpretation:

```text
Dcard = closest to target market and consumer tone
PTT = useful for controversy, strong opinions, counter-signals, and edge cases
Mobile01 = useful background/reference, not primary product direction
```

## Scope

Do:

1. Use the user-provided raw input as local-only calibration input if available.
2. Do not commit the raw input.
3. Run current topic-ingestion pipeline on the local raw input if available.
4. Identify output quality issues.
5. Improve normalization for PTT-like records.
6. Add source weighting support.
7. Add relationship/dating-market topic buckets.
8. Add risk flags for toxic/sensitive discourse.
9. Add brand-safe reframing helpers for module seeds/review pack.
10. Add tests using synthetic fixtures only.
11. Update README/docs.
12. Create review bundle, execution report, summary log.
13. Commit and push to `origin/staging`.

Do not:

- commit the real raw input
- commit real PTT/Dcard/Mobile01 raw content
- call provider/LLM
- fetch new data
- implement crawlers
- add external source integration
- change apps/web runtime
- change production behavior

## Source Weighting Requirements

Implement source weighting in the tool.

Default source weights:

```text
dcard: 1.00
ptt: 0.70
mobile01: 0.35
manual: 0.80
unknown: 0.50
```

If current scoring architecture is too simple, add a small source weight helper and apply it to topic score/review ranking.

Rules:

```text
Dcard signals should rank higher when otherwise similar.
PTT signals should still matter when engagement/controversy is high.
Mobile01 should rarely become build recommendation by itself unless reinforced by stronger sources.
```

Do not overfit weights; keep them documented and easy to tune.

## PTT Normalization Requirements

Add support for PTT-like generic records:

```json
{
  "platform": "ptt",
  "platform_post_id": "...",
  "url": "...",
  "board": "Boy-Girl",
  "title": "Re: [求助] ...",
  "content": "...",
  "content_raw": "...",
  "author_id": "...",
  "created_at": "...",
  "like_count": 31,
  "dislike_count": 5,
  "comment_count": 94,
  "comments": [...],
  "extra": {
    "push_count": 36,
    "boo_count": 5,
    "raw_title": "..."
  }
}
```

Normalize to generic input contract:

```text
id = platform_post_id or id
source = platform
title = normalized title
content = clean content
url = url
publishedAt = created_at
metrics.likes = like_count or extra.push_count
metrics.dislikes = dislike_count or extra.boo_count
metrics.comments = comment_count or len(comments)
tags = board/tag-derived labels
comments = cleaned comment content if supported internally
```

### Title cleanup

Normalize:

```text
Re: [求助] 求推薦工程師宅男交友軟體
```

into:

```text
求推薦工程師宅男交友軟體
```

while preserving tags separately:

```text
["求助"]
```

### Content cleanup

Prefer `content` over `content_raw`.

If falling back to `content_raw`:

```text
strip HTML
remove quoted blocks
remove signature/Sent from lines
remove pure URL/image/iframe lines
remove PTT metadata lines
```

### Comments

Use `comments[].content`, not `content_raw`.

Comments should contribute to:

```text
engagement evidence
counter-signals
theme signals
risk flags
```

Do not export raw comment text into final review pack unless synthetic.

## Topic Bucket Improvements

Add or improve deterministic buckets for this real input style:

```text
dating_app_fatigue
dating_market_appearance_anxiety
offline_matchmaking_skepticism
profile_self_presentation
conversation_skill_gap
reply_time_control
relationship_boundary_conflict
marriage_labor_value_conflict
fortune_telling_as_relationship_tool
ai_dating_scam_fear
```

These should supplement, not replace, existing relationship buckets.

## Risk Flags

Add `riskFlags` to topic candidates and/or module seeds if not already present.

Suggested flags:

```text
gender_polarized
body_shaming
adult_service_reference
appearance_discrimination
high_toxicity
sensitive_health_or_family
money_status_anxiety
scam_or_fraud_reference
```

The review pack should surface risk flags in risk/sensitivity notes.

High risk should not automatically delete a candidate, but should push toward:

```text
watch
defer
or brand-safe reframing
```

## Brand-safe Reframing

Add deterministic reframing helpers so raw toxic topics do not become ANYU product copy.

Examples:

Raw topic:

```text
交友市場外貌殘酷 / 普男被淘汰
```

Brand-safe reframes:

```text
你的交友疲勞，是條件問題，還是平台節奏問題？
為什麼你努力聊天，卻總是卡在第一步？
```

Raw topic:

```text
女生都看臉 / 交友軟體沒救
```

Brand-safe reframe:

```text
你卡住的是照片、自介，還是聊天節奏？
```

Raw topic:

```text
對方一直逼婚 / 要日期
```

Brand-safe reframe:

```text
你們是在談未來，還是在互相逼對方給答案？
```

Do not rewrite into accusatory, misogynistic, misandrist, body-shaming, or adult-service-forward language.

## Review Pack Calibration

Update review pack behavior:

```text
- Show source mix/weight note.
- Show risk flags.
- Prefer build recommendations for brand-safe, actionable, lower-toxicity module ideas.
- Controversial/high-toxicity PTT topics can be watch/defer unless reframed.
```

## Synthetic Tests Only

Add synthetic test records that mimic structure without copying real content.

Synthetic examples can include:

```text
platform=ptt with Re: title, content_raw HTML, comments, push/boo counts
platform=dcard with similar topic but softer consumer tone
platform=mobile01 as reference-only signal
```

Do not use the user's raw text in tests.

## Files Likely To Update

Likely files:

```text
tools/topic-ingestion/README.md
tools/topic-ingestion/topic_ingestion/loaders.py
tools/topic-ingestion/topic_ingestion/schema.py
tools/topic-ingestion/topic_ingestion/extractors.py
tools/topic-ingestion/topic_ingestion/transformers.py
tools/topic-ingestion/topic_ingestion/review.py
tools/topic-ingestion/tests/test_loaders.py
tools/topic-ingestion/tests/test_extractors.py
tools/topic-ingestion/tests/test_transformers.py
tools/topic-ingestion/tests/test_review.py
```

Add a new helper if clean:

```text
tools/topic-ingestion/topic_ingestion/normalizers.py
tools/topic-ingestion/topic_ingestion/risk.py
```

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-21-topic-ingestion-real-input-calibration-v0-review-bundle.md
```

Required sections:

```markdown
# Topic Ingestion Real Input Calibration v0 Review Bundle

Date: 2026-05-21

## 1. Summary

## 2. Local Raw Input Handling

## 3. Source Weighting

## 4. PTT Normalization

## 5. Topic Bucket Updates

## 6. Risk Flags

## 7. Brand-safe Reframing

## 8. Review Pack Changes

## 9. Tests Added

## 10. What Remains Out Of Scope

## 11. Validation Results

## 12. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-topic-ingestion-real-input-calibration-v0-execution-report.md
```

Report structure:

```markdown
# Topic Ingestion Real Input Calibration v0 Execution Report

## Summary

## Files Created

## Files Updated

## Calibration Input Handling

## Source Weighting Changes

## Normalization Changes

## Topic / Risk Changes

## Review Pack Changes

## Tests Added

## Validation Results

## Known Technical Debt

## Tech Debt Review

### New Technical Debt Introduced

### Existing Technical Debt Observed

### Opportunistic Cleanup Completed

### Deferred Cleanup Candidates

### Recommended Follow-up

## Deviations From Handoff

## Git Commit

## Staging Push

## Remaining Uncertainties

## Recommended Next Step
```

## Summary Log

Append to:

```text
ai-collaboration/summaries/summary_log.md
```

Include:

- date
- task completed
- calibration summary
- source weighting summary
- validation result
- commit hash
- staging push status

## Validation

Run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
```

Always run app validation too:

```bash
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

No need to run Playwright unless app code changes, which should not happen.

## Constraints

Do not implement:

```text
Dcard crawler
Cloudflare workaround
browser automation
external sourcing integration
provider-assisted enrichment
runtime app changes
DB schema changes
model switch
async polling
streaming
ads launch
real payment
LINE API
LIFF
auth
portal
UI changes
```

Do not modify:

```text
active production app code
product prompt/schema
DB schema
provider/model
legal semantics
design system assets
LINE funnel behavior
production ops behavior
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
real contact values
raw private user content
font files
screenshots / test artifacts / videos / traces
raw sourced JSONL
the user's real calibration input
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "tools: calibrate topic ingestion inputs"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files/test artifacts/raw JSONL are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- calibration input handling
- source weighting changes
- PTT normalization changes
- topic/risk/reframe changes
- review pack changes
- tests added
- validation results
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
