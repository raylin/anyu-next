# Summary Log

Persistent agent memory for Opportunity Radar summaries under `ai-collaboration/summaries/`.

## 2026-05-16 Foundation Review

### Completed Changes

- Reviewed the repository foundation before feature implementation.
- Created `ai-collaboration/reports/2026-05-16-foundation-review-report.md`.
- Confirmed `schemas/signal_schema_v1.json` is valid JSON.

### Learnings

- The collaboration workflow is clear and usable.
- Signal Schema v1 is usable for manual extraction testing.
- The emotion taxonomy is reasonable for v1 but may need tie-breaking guidance after sample testing.
- The extraction prompt is specific enough for manual v1 testing but may need examples and scoring calibration before automation.

### Unresolved Questions

- The canonical summary log path is inconsistent between existing docs and this review request.
- Source collection boundaries, score calibration, and multi-signal handling need human review before implementation.

## 2026-05-16 Foundation Review Before Signal Extraction v1

### Task Completed

- Reviewed the repository foundation before Signal Extraction v1.
- Updated `ai-collaboration/reports/2026-05-16-foundation-review-report.md` using the required review structure.
- Confirmed `schemas/signal_schema_v1.json` is valid JSON.

### Key Findings

- The collaboration workflow is clear and enforceable.
- Signal Schema v1 is usable for the first local extraction milestone.
- The taxonomy is reasonable for v1 and supports relationship/conversation analysis, but Taiwan-specific context is not yet explicit.
- The extraction prompt is specific enough for manual testing but needs calibration before automation.

### Unresolved Questions

- Which summary log path should be canonical?
- Should one raw input produce one signal or multiple signal records?
- What source boundaries and scoring thresholds should apply to the first sample set?

### Signal Extraction v1 Readiness

- Conditionally ready to proceed after resolving the canonical summary log path and documenting initial source/output-shape decisions.

## 2026-05-16 Foundation Fixes Before Signal Extraction v1

### Task Completed

- Applied approved foundation decisions before Signal Extraction v1.
- Updated operating documentation, schema scoring/source constraints, prompt guidance, and taxonomy scoring guidance.
- Deprecated root `summary_log.md` and confirmed `ai-collaboration/summaries/summary_log.md` as canonical.
- Created `ai-collaboration/reports/2026-05-16-foundation-fixes-execution-report.md`.

### Decisions Applied

- Canonical summary log path is `ai-collaboration/summaries/summary_log.md`.
- Signal Extraction v1 uses `1 raw input file -> 1 structured signal JSON object`.
- Allowed v1 source types are `manual_paste`, `dcard_manual`, and `reddit_manual`.
- Scoring fields use integer values from 0 to 10.

### Signal Extraction v1 Readiness

- Ready to proceed from a foundation perspective.

### Unresolved Questions

- Raw input file formatting conventions and the first sample set still need to be defined during implementation planning.
- Score calibration should be tested against real examples.

## 2026-05-16 Paste-Back Completion Summary Rule

### Task Completed

- Added the paste-back completion summary requirement to the collaboration workflow.
- Updated operating docs and templates so every future Codex task ends with a review-friendly final CLI summary.
- Created `ai-collaboration/reports/2026-05-16-paste-back-summary-rule-execution-report.md`.

### Rule Added

- Every future Codex task must save a full report, append `ai-collaboration/summaries/summary_log.md`, and end with the required `Codex Completion Summary` format.

### Signal Extraction v1 Readiness

- Signal Extraction v1 remains ready to proceed from a foundation perspective.

### Unresolved Questions

- None for this workflow-rule update.

## 2026-05-16 Normalize Collaboration Templates Path

### Task Completed

- Normalized the canonical collaboration templates path to `ai-collaboration/templates/`.
- Moved handoff, execution report, and decision log templates into the canonical directory.
- Left root `templates/README.md` as a deprecation pointer.
- Created `ai-collaboration/reports/2026-05-16-normalize-templates-path-execution-report.md`.

### Rule Applied

- Future collaboration templates should be read from and maintained under `ai-collaboration/templates/`.

### Signal Extraction v1 Readiness

- Signal Extraction v1 remains ready to proceed from a foundation perspective.

### Unresolved Questions

- Historical reports and handoffs still mention root `templates/` where that was accurate at the time; they were left unchanged for historical integrity.

## 2026-05-16 Signal Extraction v1

### Task Completed

- Implemented the first functional Signal Extraction v1 CLI.
- Added a Python package under `oradar/` with config loading, prompt assembly, OpenAI API calling, JSON parsing, schema validation, and output writing.
- Added `.env.example`, `.gitignore`, `pyproject.toml`, and a synthetic sample input at `outputs/raw/sample_001.txt`.
- Created `ai-collaboration/reports/2026-05-16-signal-extraction-v1-execution-report.md`.

### Key Implementation Details

- v1 supports `1 raw input file -> 1 structured signal JSON object`.
- Allowed source types are `manual_paste`, `dcard_manual`, and `reddit_manual`.
- The direct local command is `python3 -m oradar.cli extract outputs/raw/sample_001.txt --source-type dcard_manual`.
- The expected output path is `outputs/structured/sample_001.signal.json` after a successful live API run.

### Validation Results

- `python3 -m compileall oradar` passed.
- CLI help rendered successfully.
- Invalid source type validation worked.
- Local schema validator smoke test passed.
- Live OpenAI extraction was not completed because `OPENAI_API_KEY` is not set.

### Unresolved Questions

- Live extraction output quality needs review after an API key is configured.
- Score calibration should be reviewed against real examples.

### Signal Extraction v1 Readiness

- Ready for review after running a live extraction with `OPENAI_API_KEY`.

## 2026-05-16 Anthropic Provider Support

### Task Completed

- Added Anthropic Claude provider support to Signal Extraction v1.
- Added provider selection through `ORADAR_PROVIDER=openai|anthropic`.
- Created a thin provider dispatch layer in `oradar/providers.py`.
- Updated `.env.example` and README with Anthropic configuration and run commands.
- Created `ai-collaboration/reports/2026-05-16-anthropic-provider-support-execution-report.md`.

### Provider Support Added

- OpenAI remains the default provider.
- Anthropic is supported with `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL`.
- Default Anthropic model is `claude-sonnet-4-20250514`.

### Validation Results

- `python3 -m compileall oradar` passed.
- `python3 -m oradar.cli --help` passed.
- Unsupported provider validation worked.
- OpenAI missing-key error handling worked.
- Anthropic missing-key error handling worked.
- Live Anthropic extraction was not performed because `ANTHROPIC_API_KEY` is not set.

### Unresolved Questions

- Live Claude extraction output quality needs review after an API key is configured.
- The default Anthropic model may need adjustment if unavailable for the account.

### Anthropic Extraction Readiness

- Ready for review after running a live extraction with `ANTHROPIC_API_KEY`.

## 2026-05-16 Extraction Prompt v1.1

### Task Completed

- Improved `prompts/extraction_prompt_v1.md` in place as v1.1.
- Added Traditional Chinese defaults, Taiwan-market interpretation guidance, specific emotion category guidance, product-oriented pain point guidance, concrete MVP examples, Taiwan-native hook examples, uncertainty rules, and stronger JSON-only output instructions.
- Created `ai-collaboration/reports/2026-05-16-extraction-prompt-v1-1-execution-report.md`.

### Prompt Changes Made

- User-facing values should default to Traditional Chinese unless input is clearly non-Chinese.
- Emotion labels should be specific, such as `曖昧不確定焦慮`, rather than generic labels like `anxiety`.
- `possible_product` should contain small testable MVP concepts.
- `possible_hook` should sound native to Threads, Dcard, Instagram Reels, or TikTok.
- The prompt now includes a compact sample output using the relationship anxiety sample.

### Validation Results

- `python3 -m compileall oradar` passed.
- Prompt/schema key check found no missing required schema keys.
- JSON-only instruction check passed.
- Live Claude extraction was not run because `ANTHROPIC_API_KEY` is not set.

### Output Review Readiness

- Ready for ChatGPT review after a live Claude extraction is run with `ANTHROPIC_API_KEY`.

### Unresolved Questions

- Whether Claude output quality improves enough with v1.1 needs live validation.
- The taxonomy remains English-first while prompt output now prefers Traditional Chinese categories; this may need future alignment if repeated outputs look inconsistent.

## 2026-05-16 Source Field Cleanup

### Task Completed

- Cleaned Signal Extraction v1 source-field handling so structured outputs no longer use local absolute file paths.
- Updated the extractor to derive `source_id` from the raw input filename stem and enforce `signal["source"] = source_id` before validation/save.
- Added a minimal prompt clarification to use `source_id`.
- Regenerated `outputs/structured/sample_001.signal.json` through live Anthropic extraction.
- Created `ai-collaboration/reports/2026-05-16-source-field-cleanup-execution-report.md`.

### Source Field Cleanup Behavior

- `outputs/raw/sample_001.txt` now produces `"source": "sample_001"`.
- Absolute paths, user directories, project directories, and file extensions are excluded from the final `source` value.

### Validation Results

- `python3 -m compileall oradar` passed.
- `python3 -m oradar.cli --help` passed.
- Source cleanup smoke test passed.
- Live Anthropic extraction passed after network approval.
- Saved output validation passed.

### Live Extraction

- Live extraction was run with `ORADAR_PROVIDER=anthropic`.
- Output path: `outputs/structured/sample_001.signal.json`.

### Sample Set v1 Readiness

- Ready to proceed.

### Unresolved Questions

- Future source identifier collision handling may be needed if different directories contain files with the same stem.

## 2026-05-16 Relationship Sample Set v1

### Task Completed

- Created Relationship Sample Set v1 with 10 synthetic Traditional Chinese raw samples under `outputs/raw/`.
- Ran live Anthropic Signal Extraction v1.1 for all 10 samples.
- Generated 10 structured signal JSON files under `outputs/structured/`.
- Created `ai-collaboration/reports/2026-05-16-sample-set-v1-execution-report.md`.

### Samples Created

- `sample_001` through `sample_010`
- Themes covered: 回訊變慢但看限動, 已讀不回, 忽冷忽熱, 前任突然聯絡, 半夜找你, 說忙但發文, 簡短回覆, 分手後看限動, 朋友以上戀人未滿, 備胎焦慮.

### Extraction Results

- Live Anthropic extraction was run after network approval.
- Structured outputs generated: 10 of 10.
- Failed samples: none.

### Validation Results

- `python3 -m compileall oradar` passed.
- `python3 -m oradar.cli --help` passed.
- All 10 structured outputs passed JSON parsing and schema validation.
- All outputs have `source` equal to the input filename stem and `platform` equal to `dcard_manual`.
- All score fields are integers from 0 to 10.
- User-facing values are mostly Traditional Chinese.

### Review Readiness

- Outputs are ready for ChatGPT review.

### Unresolved Questions

- Emotion label normalization may be needed later because several outputs use nuanced labels such as `關係失控感` and `關係定位焦慮`.
- Monetization scores are clustered and may need future calibration.

## 2026-05-16 Sample Set v1 Review Bundle

### Task Completed

- Created a compact ChatGPT Web review bundle from the 10 structured Sample Set v1 outputs.
- Created `ai-collaboration/research/2026-05-16-sample-set-v1-review-bundle.md`.
- Created `ai-collaboration/reports/2026-05-16-sample-set-v1-review-bundle-execution-report.md`.

### Review Bundle Path

- `ai-collaboration/research/2026-05-16-sample-set-v1-review-bundle.md`

### Inclusion Status

- All 10 structured outputs were included.

### Validation Results

- Bundle contains 10 detailed signal sections.
- No local absolute paths were found.
- Bundle is paste-friendly markdown.

### ChatGPT Review Readiness

- Ready for ChatGPT review.

## 2026-05-16 Extraction Prompt v1.2

### Task Completed

- Updated `prompts/extraction_prompt_v1.md` in place as Extraction Prompt v1.2.
- Created `ai-collaboration/handoffs/2026-05-16-extraction-prompt-v1-2-handoff.md`.
- Created `ai-collaboration/reports/2026-05-16-extraction-prompt-v1-2-execution-report.md`.

### Prompt Changes Made

- Added stronger emotion normalization guidance to avoid broad catch-all labels such as `關係失控感`.
- Added field-specific scoring calibration for emotion intensity, shareability, monetization, and retention.
- Added possible product guidance for acquisition, monetization, and retention role diversity while keeping the schema unchanged.
- Added hook diversity guidance for curiosity, self-recognition, and action hooks.
- Reinforced uncertainty preservation and discouraged claims about another person's hidden intent.

### Validation Results

- `python3 -m compileall oradar` passed.
- Static prompt/schema check passed: JSON keys still match `schemas/signal_schema_v1.json`.
- JSON-only output instruction remains present.
- User-facing values still default to Traditional Chinese.

### Live Extraction

- Live Anthropic extraction was run with `ORADAR_PROVIDER=anthropic`.
- Rerun samples: `sample_002`, `sample_003`, and `sample_010`.
- All three reruns completed successfully and passed schema validation.

### Review Readiness

- Outputs are ready for ChatGPT review.
- Product Spec v0 is ready to proceed using v1.2 as the current extraction baseline.

### Unresolved Questions

- Shareability scores still trend high on relationship samples and should be monitored in future sample sets.
- Human review should confirm whether hook tone is Taiwan social-native without becoming too sensational.

## 2026-05-16 Product Spec v0 — 曖昧溫度計

### Task Completed

- Created Product Spec v0 for `曖昧溫度計`.
- Created `ai-collaboration/handoffs/2026-05-16-product-spec-v0-handoff.md`.
- Created `ai-collaboration/reports/2026-05-16-product-spec-v0-execution-report.md`.

### Product Spec Path

- `ai-collaboration/research/2026-05-16-product-spec-v0-ambiguous-relationship-temperature.md`

### Core Product Direction

- Free entry: `曖昧溫度計` relationship-temperature insight.
- Paid unlock: `下一句怎麼回` and three reply strategy modes.
- v0 input is text only; screenshot upload and OCR are out of scope.
- Recommended paywall: free insight / paid action.

### Review Readiness

- Spec is ready for ChatGPT review.
- No product code was added.
- No extraction prompt, schema, taxonomy, provider code, or CLI behavior was changed.

### Unresolved Questions

- Which situation type converts best remains unknown.
- Pricing needs validation before implementation.
- The scoring model and tone boundaries need human review before becoming implementation contracts.

## 2026-05-16 Experiment Spec v0 — 曖昧溫度計 Fake Door Test

### Task Completed

- Created Experiment Spec v0 for the `曖昧溫度計` fake-door test.
- Created `ai-collaboration/handoffs/2026-05-16-experiment-spec-v0-handoff.md`.
- Created `ai-collaboration/reports/2026-05-16-experiment-spec-v0-execution-report.md`.

### Experiment Spec Path

- `ai-collaboration/research/2026-05-16-experiment-spec-v0-ambiguous-temperature-fake-door.md`

### Core Experiment Direction

- Validate whether users paste relationship context for a quick `曖昧溫度` result.
- Validate fake paid unlock intent for `下一句怎麼回 — NT$49`.
- Test only three primary situation types: `已讀不回`, `忽冷忽熱`, and `回訊變慢但看限動`.
- Keep `前任` and `備胎` out of primary acquisition hooks for v0.
- Use local JSONL as a sufficient v0 event logging direction without analytics SaaS.

### Review Readiness

- Spec is ready for ChatGPT review.
- No product code was added.
- No extraction prompt, research signal schema, provider code, CLI behavior, or sample outputs were changed.

### Unresolved Questions

- Which situation type converts best remains unknown.
- Whether `NT$49` is the right fake-door price needs validation.
- Whether free results should be manual first or generated by a future internal prompt remains undecided.

## 2026-05-16 Product Runtime Prompt + Schema v0

### Task Completed

- Created the first Product Runtime Track prompt and schema for `曖昧溫度計`.
- Created three raw product sample inputs.
- Added a separated dev-only product sample generator script.
- Generated three live Anthropic product result JSON outputs.
- Created a product result review bundle.
- Created `ai-collaboration/reports/2026-05-16-product-runtime-prompt-schema-v0-execution-report.md`.

### Product Runtime Prompt Path

- `prompts/product_result_prompt_v0.md`

### Product Runtime Schema Path

- `schemas/product_result_schema_v0.json`

### Product Samples

- Raw samples:
  - `outputs/product_samples/raw/product_sample_001.txt`
  - `outputs/product_samples/raw/product_sample_002.txt`
  - `outputs/product_samples/raw/product_sample_003.txt`
- Generated outputs:
  - `outputs/product_samples/generated/product_sample_001.result.json`
  - `outputs/product_samples/generated/product_sample_002.result.json`
  - `outputs/product_samples/generated/product_sample_003.result.json`

### Review Readiness

- Outputs are ready for ChatGPT review.
- Live Anthropic generation was performed.
- Existing research extraction prompt, signal schema, extraction outputs, provider behavior, and CLI behavior were not changed.

### Unresolved Questions

- Whether `personal_pattern_candidate.should_store` should default to `true` needs review.
- Temperature scores clustered between 35 and 42 and may need calibration.
- Share-card personas and emotional language need human review for tone and privacy comfort.

## 2026-05-16 Git Commit

### Task Completed

- Prepared the current repository state for git commit.
- Created `ai-collaboration/handoffs/2026-05-16-git-commit-handoff.md`.
- Created `ai-collaboration/reports/2026-05-16-git-commit-execution-report.md`.
- Confirmed `.env` is ignored and not intended for commit.
- Removed ignored Python bytecode cache before staging.

### Commit Scope

- Broad project-foundation commit covering collaboration workflow, Signal Extraction v1, sample sets, product/experiment specs, and product runtime prompt/schema artifacts.

### Validation Results

- `python3 -m compileall oradar` passed before commit.
- `python3 -m py_compile scripts/generate_product_sample.py` passed before commit.

### Unresolved Questions

- None for the commit itself.

## 2026-05-16 Product Runtime Prompt v0.1 Cleanup

### Task Completed

- Calibrated `prompts/product_result_prompt_v0.md` after the first `曖昧溫度計` product output review.
- Added the mandatory workflow rule that every completed handoff must end with a git commit.
- Updated `AGENTS.md`, `WORKING_AGREEMENT.md`, `README.md`, and collaboration templates with the commit requirement.
- Reran all three product samples with live Anthropic generation.
- Updated `ai-collaboration/research/2026-05-16-product-result-v0-review-bundle.md`.
- Created `ai-collaboration/reports/2026-05-16-product-runtime-prompt-v0-1-cleanup-execution-report.md`.

### Prompt Changes Made

- Clarified that `temperature_score` measures observable interaction warmth, not relationship safety or romantic success probability.
- Added score calibration bands for the primary situation types.
- Made share-card guidance identity-safe and less exposing.
- Made `personal_pattern_candidate.should_store` default to `false` with stricter evidence requirements for `true`.
- Shifted paid preview toward immediate action value.
- Shifted paid result tone toward a smart friend rather than a consultant report.

### Validation Results

- `python3 -m compileall oradar` passed.
- `python3 -m py_compile scripts/generate_product_sample.py` passed.
- `schemas/product_result_schema_v0.json` remains valid JSON.
- All regenerated product outputs validate against `schemas/product_result_schema_v0.json`.
- Share cards do not include raw conversation text and are more identity-safe.
- Personal pattern candidates are non-diagnostic.
- `should_store` is not blindly true for all samples; all three regenerated outputs use `false`.
- Temperature scores improved from `35, 35, 42` to `35, 52, 52`.

### Live Generation

- Live Anthropic generation was run for:
  - `outputs/product_samples/raw/product_sample_001.txt`
  - `outputs/product_samples/raw/product_sample_002.txt`
  - `outputs/product_samples/raw/product_sample_003.txt`

### Review Readiness

- Outputs are ready for ChatGPT review.
- Top review issues: the `52/52` tie across samples 002 and 003, repeated `微訊號觀察家` share persona, and `medium` confidence across all personal pattern candidates.

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Unresolved Questions

- Whether `product_sample_002` and `product_sample_003` should be differentiated beyond the current tied score of 52.
- Whether share-card persona variety should be enforced more strongly.
- Whether one-off product samples should default personal pattern confidence to `low`.

## 2026-05-16 Prototype Skeleton v0

### Task Completed

- Built the local fake-door prototype under `experiments/ambiguous_temperature_v0/`.
- Added a small standard-library web server with static UI and JSON API endpoints.
- Added reusable local JSONL logging for events, submissions, and contact submissions.
- Added experiment-specific runtime helpers and shared product runtime generation reuse.
- Updated `.gitignore` to ignore `outputs/experiments/**/*.jsonl`.
- Created `ai-collaboration/reports/2026-05-16-prototype-skeleton-v0-execution-report.md`.

### Prototype Path

- `experiments/ambiguous_temperature_v0/`

### Implementation Approach

- Python standard-library HTTP server
- static HTML, CSS, and JavaScript
- shared runtime logic extracted to `oradar/product_runtime.py`
- local JSONL append-only logging

### Validation Results

- `python3 -m compileall oradar` passed.
- `python3 -m py_compile experiments/ambiguous_temperature_v0/*.py` passed.
- `python3 -m py_compile scripts/generate_product_sample.py` passed.
- Local smoke test passed for:
  - `/health`
  - page HTML render
  - live `/api/analyze` generation with Anthropic
  - `/api/contact` fake-door contact capture

### Known Technical Debt

- None.

### Review Readiness

- Prototype is ready for ChatGPT review.
- Top review issues: whether the standard-library server is the right interim shape, whether the log schema is sufficient for experiment analysis, and whether the conversation-snippet heuristic should change before real usage.

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Unresolved Questions

- OpenAI-backed product runtime was not live-tested in this task.
- The conversation-snippet heuristic is intentionally simple and may need real-usage feedback.
- Future aggregation/reporting over JSONL experiment logs is still out of scope.

## 2026-05-16 Prototype Review Packet

### Task Completed

- Created the prototype review packet at `ai-collaboration/research/2026-05-16-prototype-skeleton-v0-review-packet.md`.
- Created `ai-collaboration/reports/2026-05-16-prototype-review-packet-execution-report.md`.
- Documented the prototype directory structure, UI flow, API routes, runtime integration, log schemas, privacy handling, technical debt review, known limitations, and questions for ChatGPT review.

### Review Packet Path

- `ai-collaboration/research/2026-05-16-prototype-skeleton-v0-review-packet.md`

### Review Readiness

- Packet is ready for ChatGPT review.
- Real user data was excluded.
- Synthetic examples were used for events, submissions, and contact capture.

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.
