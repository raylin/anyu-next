# Extraction Prompt v1.1 Execution Report

## Summary

Updated `prompts/extraction_prompt_v1.md` in place as a v1.1 prompt improvement for Taiwan-market AI consumer product discovery.

The update keeps the existing Signal Extraction v1 behavior and schema contract:

```text
1 raw input file -> 1 structured signal JSON object
```

No extraction code, provider code, CLI behavior, schema semantics, source boundaries, taxonomy, or architecture were changed.

## Files Updated

- `prompts/extraction_prompt_v1.md`
- `ai-collaboration/summaries/summary_log.md`

Additional workflow files created:

- `ai-collaboration/handoffs/2026-05-16-extraction-prompt-v1-1-handoff.md`
- `ai-collaboration/reports/2026-05-16-extraction-prompt-v1-1-execution-report.md`

## Prompt Changes

Updated the prompt to:

- default user-facing values to Traditional Chinese unless the input is clearly non-Chinese
- emphasize market signal extraction over summarization
- prefer specific emotion categories such as `曖昧不確定焦慮`, `戀愛焦慮`, `自我價值不安`, and `關係失控感`
- make `pain_point` product-oriented and focused on unmet need
- push `possible_product` toward concrete MVP concepts instead of broad app categories
- push `possible_hook` toward Taiwan-native social hooks for Threads, Dcard, Instagram Reels, and TikTok
- preserve uncertainty and avoid overclaiming about real people's intent
- avoid moralizing, therapy advice, or counseling output
- keep scoring qualitative but more useful for product analysis
- include a compact Traditional Chinese example based on the existing sample input
- strongly require valid JSON only, with no markdown, commentary, or code fences in the model output

## Why These Changes Matter

The first live extraction output was valid but too generic for MVP discovery.

These changes should make extracted signals more useful for:

- Taiwan consumer market interpretation
- relationship/conversation-analysis MVP discovery
- product angle selection
- monetization analysis
- retention analysis
- social-native hook generation

The prompt now encourages outputs like `曖昧溫度計`, `限動已讀但不回解讀器`, and `他是真的忙，還是其實在冷掉？` instead of broad English product categories or generic marketing copy.

## Validation Results

Passed:

```bash
python3 -m compileall oradar
```

Result:

```text
Listing 'oradar'...
```

Passed prompt/schema key check:

```text
missing keys: []
json only instruction: True
```

Confirmed:

- prompt still instructs the model to return JSON only
- prompt includes all required schema keys
- schema keys remain unchanged
- no code files were changed
- schema semantics were not changed
- extraction prompt remains at `prompts/extraction_prompt_v1.md`

## Live Extraction Result

Live Claude extraction was not run because `ANTHROPIC_API_KEY` is not set in the local environment.

The attempted command:

```bash
ORADAR_PROVIDER=anthropic python3 -m oradar.cli extract outputs/raw/sample_001.txt --source-type dcard_manual
```

Result:

```text
Extraction failed: ANTHROPIC_API_KEY is not set. Add it to the environment or local .env file.
```

No output JSON was saved by this task.

## Deviations From Handoff

- None.

The task was limited to prompt improvement plus required handoff, report, and summary log updates.

## Remaining Uncertainties

- Live Claude output quality still needs review after `ANTHROPIC_API_KEY` is configured.
- The prompt may need further tuning after comparing Claude and OpenAI outputs on several Taiwan-market examples.
- The prompt now encourages Traditional Chinese emotion labels, while the taxonomy file itself remains English-first. This was intentional to avoid changing taxonomy semantics in this task.

## Recommended Next Step

Run a live Claude extraction:

```bash
ORADAR_PROVIDER=anthropic python3 -m oradar.cli extract outputs/raw/sample_001.txt --source-type dcard_manual
```

Then review:

- whether output defaults to Traditional Chinese
- whether `emotion` uses a specific category such as `曖昧不確定焦慮`
- whether `possible_product` contains concrete MVP concepts
- whether `possible_hook` sounds native to Taiwan social platforms
- whether scores feel useful for MVP prioritization

