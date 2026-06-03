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

## 2026-05-20 ANYU Design System v1.1 Adoption

### Task Completed

- Adopted ANYU Design System v1.1 as the current canonical implementation source of truth.
- Preserved the uploaded high-fidelity v1.1 reference bundle under `docs/design-system/reference/v1.1/`.
- Synced the canonical token file to `docs/design-system/tokens-v1.1.css` and the app token copy to `apps/web/src/styles/tokens.css`.
- Reapplied the current Module 01 staging UI to the stricter v1.1 pairing and readability rules.

### Key Learnings

- Most of the staging drift was not missing tokens; it was incorrect surface/ink pairing and over-softened text hierarchy.
- The biggest readability win came from removing pale-card signal treatments and restoring dark/light pairing discipline.
- A narrow CSS-first pass was enough to correct the most obvious drift without touching runtime or data flow.

### Unresolved Questions

- Whether the full-screen v1.1 loading experience should replace the current inline loading treatment.
- Whether the share surface should move closer to the fuller v1.1 multi-action flow before launch review.
- Real-device contrast and rhythm still need one more pass after staging updates land.

## 2026-05-20 Module 01 Staging Deployment Refresh + Contrast Check

### Task Completed

- Verified that `https://staging.anyu.tw` now serves the newer post-`cedd219` staging deployment.
- Confirmed landing, demo result, live analyze, runtime result, unlock intent, and contact submit all work on refreshed staging using synthetic input.
- Documented the contrast/readability findings for the v1.1 adoption pass.

### Key Learnings

- The main blocker was deployment freshness, not another staging-only design regression.
- The live staging HTML now reflects the v1.1 adoption pass, including the new landing helper copy and the paid/signal hierarchy.
- The runtime path survived the design-system adoption without introducing new staging failures.

### Unresolved Questions

- A true human phone pass is still the best way to finalize perceived loading feel and contrast in real lighting conditions.
- If additional polish is needed from that phone pass, it should stay narrow and evidence-based.

## 2026-05-20 Module 01 Model Latency Evaluation

### Task Completed

- Measured the current Anthropic baseline model with a local evaluator harness using the real app prompt/schema assets.
- Probed two Haiku-class candidate model names for availability.
- Documented the latency, schema-stability, and recommendation outcome for Module 01 launch planning.

### Key Learnings

- Current baseline `claude-sonnet-4-20250514` is stable but slow, with a direct median around 28 seconds on the synthetic set.
- The tested Haiku candidate names were not available on the current Anthropic account.
- The model itself appears to be the main source of wait time; parsing/validation overhead is minor by comparison.

### Unresolved Questions

- Whether a different faster Anthropic model name is available on this specific account.
- Whether the next speed improvement should come from model switching or UX/runtime mitigation if no faster safe model is accessible.
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

## 2026-05-20 - Module 01 Input Guidance Counter Tuning v0.6

### Completed

- restored numeric progress for the `<30` input state as `current / 30`
- kept the softened v0.5 guidance copy and avoided duplicate remaining-count messaging
- kept the hard-limit `current / 4000` counter for over-limit input

### Learnings

- the useful signal was the numeric threshold progress itself, not the old “再補 N 個字” sentence
- the existing helper layer could support this tuning without touching thresholds or runtime behavior

### Unresolved Questions

- whether the short-input counter feels helpful enough on a real phone without reading as pressure
- whether the `30–119` band ever needs a subtle optional `current / 120` cue

### Validation

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Staging Push Status

- Pending at summary-write time; final staging push status is reported in the final Codex Completion Summary after commit/push are attempted.

## 2026-05-20 Production Env + Launch Checklist Sync v0

### Task Completed

- updated `ai-collaboration/decisions/2026-05-20-production-launch-decision-draft-v0.md`
- synced completed legal, LINE, brand-asset, abuse-guard, and staging-QA status into the launch decision draft
- updated `docs/operations/production-deployment-runbook.md` with the LINE setup record, brand asset path, and current public LINE URL reference
- created `ai-collaboration/reports/2026-05-20-production-env-launch-checklist-sync-v0-execution-report.md`

### Launch Decision Draft Updated

- `ai-collaboration/decisions/2026-05-20-production-launch-decision-draft-v0.md`

### Current Go / No-Go Status

- `No-Go`

### Remaining Blockers

- production Vercel env readiness not yet verified
- Neon production branch not yet created or confirmed
- production DB migration plan not yet verified
- final production candidate commit not yet selected
- final human phone/browser smoke not yet accepted
- manual retention cleanup SOP not yet explicitly accepted or replaced
- `www.anyu.tw` redirect policy not yet confirmed
- production domain / DNS readiness not yet verified

### Learnings

- The product-side launch work is largely synced; the remaining blockers are operational launch prerequisites.
- The decision draft is now a more accurate launch gate and less of a partial placeholder.

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Staging Push Status

- Pending at summary-write time; final staging push status is reported in the final Codex Completion Summary after commit/push are attempted.

## 2026-05-20 ANYU LINE OA Setup Record v0

### Task Completed

- created `ai-collaboration/research/2026-05-20-anyu-line-oa-setup-record-v0.md`
- recorded the LINE OA identity, add-friend URL, QR URL, profile image asset, and welcome-message baseline
- added small cross-references from existing LINE strategy/plan docs and the production runbook
- created the execution report for the setup-record task

### LINE OA Setup Record Path

- `ai-collaboration/research/2026-05-20-anyu-line-oa-setup-record-v0.md`

### Add-Friend URL

- `https://lin.ee/S6dnbJO`

### Profile Image Asset

- `docs/design-system/brand/exports/line-profile-1024.png`

### Learnings

- The manual LINE OA state is now stable enough to treat as a launch reference artifact instead of relying on scattered handoff notes.
- Small cross-references are enough here; full doc rewrites were unnecessary.

### Unresolved Questions

- What exact category was chosen in the LINE backend?
- Does the final live welcome message differ in any small way from the documented baseline?

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Staging Push Status

- Pending at summary-write time; final staging push status is reported in the final Codex Completion Summary after commit/push are attempted.

## 2026-05-20 ANYU Brand Mark Asset Export v0

### Task Completed

- exported LINE profile assets under `docs/design-system/brand/exports/`
- exported app/public icon assets under `apps/web/public/`
- added `apps/web/scripts/export-brand-assets.mjs`
- added `apps/web/public/manifest.webmanifest`
- added export usage docs and asset existence checks

### Exported Asset Paths

- `docs/design-system/brand/exports/line-profile-1024.png`
- `docs/design-system/brand/exports/line-profile-640.png`
- `docs/design-system/brand/exports/app-icon-512.png`
- `docs/design-system/brand/exports/app-icon-192.png`
- `apps/web/public/icon-512.png`
- `apps/web/public/icon-192.png`
- `apps/web/public/apple-touch-icon.png`

### LINE Profile Recommendation

- use `docs/design-system/brand/exports/line-profile-1024.png`

### Learnings

- The canonical SVG was clean enough to drive deterministic raster exports.
- macOS Quick Look was the viable built-in raster path in this environment after `sips` failed on SVG conversion.

### Unresolved Questions

- Is macOS-only regeneration acceptable for now, or should cross-platform export become the next cleanup task?
- Is an OG brand-mark export needed before launch-asset work moves forward?

### Validation Results

- `corepack pnpm brand:export` passed
- exported PNGs exist, are non-empty, and match expected dimensions
- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Staging Push Status

- Pending at summary-write time; final staging push status is reported in the final Codex Completion Summary after commit/push are attempted.

## 2026-05-20 ANYU Brand Mark v1.1 Adoption v0

### Task Completed

- verified the inbox brand-mark bundle under `ai-collaboration/inbox/2026-05-20-brand-mark-v1.1/`
- preserved the raw bundle under `docs/design-system/reference/brand-v1.1/`
- created canonical brand-mark docs/assets under `docs/design-system/brand/`
- merged brand-mark tokens into `docs/design-system/tokens-v1.1.css` and `apps/web/src/styles/tokens.css`
- added `apps/web/src/components/anyu/AnyuMark.tsx`
- added `apps/web/src/styles/anyu-mark.css`
- added `apps/web/public/favicon.svg`
- updated design/app docs and tests

### Learnings

- The inbox bundle was complete and clean enough to adopt directly into canonical and reference layers.
- Favicon adoption is a safe first production use of the new mark without forcing a broad UI refresh.

### Unresolved Questions

- Should the app keep the current text-first `Wordmark` across shared shells for now?
- Is a formal `AnyuLockup` component worth adding later?
- Is favicon-only production adoption sufficient before any broader brand rollout?

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Staging Push Status

- Pending at summary-write time; final staging push status is reported in the final Codex Completion Summary after commit/push are attempted.

## 2026-05-20 Production Launch Decision Draft v0

### Task Completed

- created `ai-collaboration/decisions/2026-05-20-production-launch-decision-draft-v0.md`
- copied the handoff into `ai-collaboration/handoffs/2026-05-20-production-launch-decision-draft-v0-handoff.md`
- created `ai-collaboration/reports/2026-05-20-production-launch-decision-draft-v0-execution-report.md`
- documented the current production recommendation as `No-Go`
- recorded the main blockers before any `anyu.tw` production launch

### Decision Draft Path

- `ai-collaboration/decisions/2026-05-20-production-launch-decision-draft-v0.md`

### Current Go / No-Go Recommendation

- `No-Go`

### Main Blockers

- production env vars not yet verified
- Neon production branch and migration readiness not yet verified
- final approved production commit not yet selected
- final human phone/browser smoke pass not yet accepted
- manual retention cleanup SOP not yet explicitly accepted
- `www.anyu.tw` redirect policy still undecided

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Learnings

- The production runbook and launch-decision template were sufficient to produce a real draft without changing app/runtime state.
- The biggest remaining launch blockers are operational rather than code-level.

### Unresolved Questions

- Which exact commit from `origin/staging` should be the approved production candidate?
- Will production promotion use `main`, or another explicitly approved commit path?
- What should `www.anyu.tw` do at launch?

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Staging Push Status

- Pending at summary-write time; final staging push status is reported in the final Codex Completion Summary after commit/push are attempted.

## 2026-05-20 Production Deployment Runbook v0

### Task Completed

- created `docs/operations/production-deployment-runbook.md`
- created `docs/operations/README.md`
- created `ai-collaboration/templates/production_launch_decision_template.md`
- clarified in repo workflow docs that staging push is routine but production deployment is manual and human-approved only
- created `ai-collaboration/reports/2026-05-20-production-deployment-runbook-v0-execution-report.md`

### Learnings

- staging-first workflow needs a separate production runbook so “validated and pushed to staging” is never confused with “ready to auto-promote to production”
- public env rebuild rules deserve explicit production visibility because stale `NEXT_PUBLIC_*` bundles are an operational risk, not just a staging annoyance

### Unresolved Questions

- long-term production branch strategy is still open
- `www.anyu.tw` redirect policy should still be confirmed before production launch

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Staging Push Status

- Pending at summary-write time; final staging push status is reported in the final Codex Completion Summary after commit/push are attempted.

## 2026-05-20 LINE CTA Env Hotfix + Staging Verification v0

### Task Completed

- confirmed app code already used `NEXT_PUBLIC_LINE_ADD_URL` correctly
- confirmed Vercel env already contained `NEXT_PUBLIC_LINE_ADD_URL`
- identified stale staging deployment as the real cause of the fallback-to-Email behavior
- created a fresh preview deployment and repointed `staging.anyu.tw`
- verified the live client bundle now contains the LINE URL, LINE-first strings, and same-tab navigation path
- created `ai-collaboration/research/2026-05-20-line-cta-env-hotfix-staging-verification-v0.md`
- created `ai-collaboration/reports/2026-05-20-line-cta-env-hotfix-staging-verification-v0-execution-report.md`

### Learnings

- `NEXT_PUBLIC_*` bugs can present like app logic regressions even when the real issue is simply that a public env change was never rebuilt into the active bundle
- protected staging verification is still workable from shell-only tooling when HTML and client bundle inspection are used carefully

### Unresolved Questions

- a true protected-browser click pass is still useful to confirm the final human interaction feel into LINE

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Staging Push Status

- Pending at summary-write time; final staging push status is reported in the final Codex Completion Summary after commit/push are attempted.

## 2026-05-20 LINE Funnel Contact UI Implementation v0

### Task Completed

- implemented a LINE-first contact-notification UI for Module 01 after paid unlock
- added `NEXT_PUBLIC_LINE_ADD_URL` support and documented the public add-friend URL in `.env.example`
- added `line_add_clicked` and `email_fallback_opened` event support
- kept Email as a visually secondary fallback using the existing `/api/contact` path
- created `ai-collaboration/research/2026-05-20-line-funnel-contact-ui-implementation-v0-review-bundle.md`
- created `ai-collaboration/reports/2026-05-20-line-funnel-contact-ui-implementation-v0-execution-report.md`

### Learnings

- the current fake-door/result structure can support a LINE-first funnel without touching the analyze/runtime path
- env-driven public URL configuration is enough for v0, but live staging still needs explicit env verification

### Unresolved Questions

- whether `NEXT_PUBLIC_LINE_ADD_URL` is already configured in preview/staging
- same-tab LINE handoff still benefits from a protected staging/browser pass on real devices

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed
- render tests verified the LINE-first panel copy and missing-URL fallback
- attempted local dev HTTP smoke could not complete because the local dev server was not reachable from this shell session

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Staging Push Status

- Pending at summary-write time; final staging push status is reported in the final Codex Completion Summary after commit/push are attempted.

## 2026-05-20 LINE Funnel UI Copy + Implementation Plan v0

### Task Completed

- created `ai-collaboration/research/2026-05-20-line-funnel-ui-copy-implementation-plan-v0.md`
- translated the approved LINE funnel strategy into exact paid-preview, contact-panel, CTA, and fallback copy recommendations
- defined required env/config for `NEXT_PUBLIC_LINE_ADD_URL`
- defined recommended event tracking and manual/semi-manual fulfillment flow
- created `ai-collaboration/reports/2026-05-20-line-funnel-ui-copy-implementation-plan-v0-execution-report.md`

### Learnings

- the current app structure already has a clean place to introduce a future LINE-primary CTA without changing the whole result flow
- keeping Email visible but clearly secondary is the lowest-risk way to align strategy and user trust

### Unresolved Questions

- final LINE OA add-friend URL is still unknown
- mobile same-tab versus new-tab behavior for the LINE CTA should still be validated before implementation

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Staging Push Status

- Pending at summary-write time; final staging push status is reported in the final Codex Completion Summary after commit/push are attempted.

## 2026-05-20 LINE Funnel Strategy v0

### Task Completed

- created `ai-collaboration/research/2026-05-20-line-funnel-strategy-v0.md`
- defined LINE as the primary Taiwan v0 retention and complete-analysis delivery channel
- kept Email as a secondary fallback rather than removing it
- defined v0 funnel placement, OA minimum setup, welcome message drafts, rich menu draft, delivery model, metrics, and implementation milestones
- created `ai-collaboration/reports/2026-05-20-line-funnel-strategy-v0-execution-report.md`

### Learnings

- the existing legal drafts already support a LINE-primary, Email-fallback direction as long as the product does not overclaim automation
- the simplest launch-safe path is still manual or semi-manual LINE delivery first, with automation deferred until volume justifies it

### Unresolved Questions

- final LINE OA add-friend URL is still unknown
- acceptable manual delivery volume for v0 is still undecided

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Staging Push Status

- Pending at summary-write time; final staging push status is reported in the final Codex Completion Summary after commit/push are attempted.

## 2026-05-20 Workflow Tech Debt Reporting Rule v0

### Task Completed

- added an explicit workflow rule requiring tech debt reporting in every execution report and final Codex completion summary
- updated canonical workflow docs in `AGENTS.md`, `WORKING_AGREEMENT.md`, and `README.md`
- updated `ai-collaboration/templates/handoff_template.md` with task-level tech debt policy guidance
- updated `ai-collaboration/templates/execution_report_template.md` with a structured `Tech Debt Review` section and final-summary tech debt notes block
- created `ai-collaboration/reports/2026-05-20-workflow-tech-debt-reporting-rule-v0-execution-report.md`

### Learnings

- workflow changes are more durable when the instructions, templates, and final completion summary format are updated in the same pass
- structured tech debt notes are a low-cost way to preserve cleanup context for later handoffs without broadening current task scope

### Unresolved Questions

- whether future workflow-rule changes should eventually be centralized into a more single-source policy file to reduce duplicate maintenance

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Staging Push Status

- Pending at summary-write time; final staging push status is reported in the final Codex Completion Summary after commit/push are attempted.

## 2026-05-20 - Legal Route + Footer Browser QA v0

### Completed

- verified staging freshness for the legal-page deployment
- checked live staging legal routes and Module 01 footer legal links
- confirmed `hello@anyu.tw` is present where expected
- applied one tiny consistency fix to `/legal` so it also shows version/date/contact meta

### Learnings

- the legal pages themselves were already solid after implementation; the only real inconsistency was the lighter `/legal` index metadata
- protected staging HTML inspection is still enough to catch footer/link/content regressions when a full browser runtime is unavailable

### Unresolved Questions

- a true human device/browser pass is still better for final readability/tap-feel judgment
- runtime result route footer was inferred from shared component structure rather than separately re-hit on staging in this pass

### Validation

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Staging Push Status

- Pending at summary-write time; final staging push status is reported in the final Codex Completion Summary after commit/push are attempted.

## 2026-05-20 - Legal Page Implementation v0

### Completed

- implemented public legal routes at `/privacy`, `/terms`, `/disclaimer`, and `/legal`
- applied `hello@anyu.tw` as the v0 public contact/deletion email in legal drafts and rendered pages
- added quiet legal footer links to the Module 01 landing and result flows
- aligned landing/result/contact short notices with the reviewed legal draft copy

### Learnings

- deploy-safe legal rendering is simplest when the app keeps its own app-local legal content module, even if docs remain the human review source
- the biggest ongoing maintenance risk is docs/app legal copy drift, not route implementation complexity

### Unresolved Questions

- whether `/legal` should remain as a public index page long-term
- whether footer legal links should eventually expand beyond Module 01 pages

### Validation

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Staging Push Status

- Pending at summary-write time; final staging push status is reported in the final Codex Completion Summary after commit/push are attempted.

## 2026-05-20 - Legal Baseline Content Draft v0

### Completed

- drafted first-pass legal/trust markdown for privacy policy, terms, disclaimer, UI notices, LINE funnel disclosure, and persona/insight consent
- created the legal review bundle under `ai-collaboration/research/2026-05-20-legal-baseline-content-review-v0.md`
- kept the drafts conservative about retention, deletion, LINE automation, and future personalization

### Learnings

- the current product state supports warm, practical legal copy as long as it avoids promising automation or deletion flows that are not fully implemented
- the biggest unresolved content gap is no final public deletion/contact channel yet

### Unresolved Questions

- should the 24-hour retention target stay as a goal or become a firmer promise later
- should LINE be described as primary now or as near-future default
- what exact email or form should be listed for privacy/deletion requests before launch

### Validation

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Staging Push Status

- Pending at summary-write time; final staging push status is reported in the final Codex Completion Summary after commit/push are attempted.

## 2026-05-18 Module 01 UI Port v0

### Task Completed

- implemented Module 01 UI shell routes:
  - `/m/ambiguous-temperature`
  - `/m/ambiguous-temperature/result/demo`
- added shared ANYU UI components for privacy helper, input card, temperature card, share preview, paid preview, and contact placeholder
- added module-specific landing and result shell components
- created `ai-collaboration/research/2026-05-18-module-01-ui-port-v0-review-bundle.md`
- created `ai-collaboration/reports/2026-05-18-module-01-ui-port-v0-execution-report.md`

### Review Bundle Path

- `ai-collaboration/research/2026-05-18-module-01-ui-port-v0-review-bundle.md`

### Validation Result

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed
- local route checks for landing and demo result returned `200 OK`

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

## 2026-05-18 Module 01 Migration Plan v0

### Task Completed

- created `ai-collaboration/handoffs/2026-05-18-module-01-migration-plan-v0-handoff.md`
- created `ai-collaboration/research/2026-05-18-module-01-migration-plan-v0.md`
- created `ai-collaboration/reports/2026-05-18-module-01-migration-plan-v0-execution-report.md`

### Migration Plan Summary

- captured the migration path from `experiments/ambiguous_temperature_v0/` into `apps/web/`
- identified what should be reused, rewritten, deferred, or explicitly not migrated
- preserved the generic module-registry route direction already present in `apps/web/`

### Repo Details

- migration plan path: `ai-collaboration/research/2026-05-18-module-01-migration-plan-v0.md`
- source prototype path: `experiments/ambiguous_temperature_v0/`
- target app path: `apps/web/`

### Recommended Next Step

- `Module 01 UI Port v0`

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

## 2026-05-18 Root README / Repo Alignment v0

### Task Completed

- rewrote `README.md` around `anyu-next` as the C-stage production foundation for `暗語 ANYU`
- aligned `apps/web/README.md` with its current role as the production Next.js app foundation
- checked and updated `docs/design-system/README.md`
- checked and tightened the legacy status wording in `experiments/ambiguous_temperature_v0/README.md`
- created `ai-collaboration/reports/2026-05-18-root-readme-repo-alignment-v0-execution-report.md`

### README Alignment Summary

- root README now explains the repo as both a production app foundation and a retained research/prototype workspace
- `apps/web/` is explicitly documented as the production app path
- `docs/design-system/` is explicitly documented as canonical
- `experiments/ambiguous_temperature_v0/` is explicitly documented as legacy/reference only

### Repo Details

- production app path: `apps/web/`
- design system canonical path: `docs/design-system/`
- legacy prototype status: legacy local validation prototype, not the production frontend foundation

### Recommended Next Step

- `Module 01 Migration Plan v0`

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

## 2026-05-18 Repo Foundation Setup v0

### Task Completed

- created the `anyu-next` production app foundation under `apps/web/`
- promoted the ANYU design system into `docs/design-system/`
- synced the app token copy to `apps/web/src/styles/tokens.css`
- strengthened root `.gitignore` for the mixed Python + Next.js workspace
- marked `experiments/ambiguous_temperature_v0/` as a legacy/reference prototype
- created `ai-collaboration/research/2026-05-18-repo-foundation-structure-report.md`
- created `ai-collaboration/reports/2026-05-18-repo-foundation-setup-v0-execution-report.md`

### Repo Details

- repo name: `anyu-next`
- app path: `apps/web/`
- design system canonical path: `docs/design-system/`
- package manager: `pnpm`

### Gitignore Update Summary

- added ignore coverage for Node / Next / Vercel artifacts
- preserved `.env.example` while ignoring local env files
- added runtime log, browser cache, and broader Python cache coverage
- preserved targeted ignores for local experiment outputs

### Repo Structure Report Path

- `ai-collaboration/research/2026-05-18-repo-foundation-structure-report.md`

### Validation Result

- `python3 -m compileall oradar` passed
- `corepack pnpm install` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed
- `corepack pnpm --version` returned `11.1.2`
- `node --version` returned `v24.15.0`

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

## 2026-05-16 Product Validation Calibration v0

### Task Completed

- Created 30 synthetic product evaluation inputs under `outputs/product_eval/raw/`.
- Added `scripts/run_product_eval.py`.
- Ran live generation for all 30 synthetic inputs and wrote outputs under `outputs/product_eval/generated/`.
- Created `ai-collaboration/research/2026-05-16-product-validation-calibration-v0-review-bundle.md`.
- Created Dcard calibration preparation files under `ai-collaboration/research/dcard_calibration/`.
- Created `ai-collaboration/reports/2026-05-16-product-validation-calibration-v0-execution-report.md`.

### Counts

- Synthetic inputs created: `30`
- Generated outputs: `30`

### Review Bundle Path

- `ai-collaboration/research/2026-05-16-product-validation-calibration-v0-review-bundle.md`

### Dcard Calibration Template Path

- `ai-collaboration/research/dcard_calibration/dcard_topic_calibration_template.md`

### Validation Results

- `python3 -m compileall oradar` passed.
- `python3 -m py_compile experiments/ambiguous_temperature_v0/*.py` passed.
- `python3 -m py_compile scripts/generate_product_sample.py` passed.
- `python3 -m py_compile scripts/run_product_eval.py` passed.
- `outputs/product_eval/raw/eval_manifest.json` is valid JSON.
- `ai-collaboration/research/dcard_calibration/dcard_topic_calibration_schema.json` is valid JSON.
- Live generation succeeded for all 30 synthetic inputs.

### Known Technical Debt

- None.

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

## 2026-05-16 Minimal Experiment Analysis Report

### Task Completed

- Added `experiments/ambiguous_temperature_v0/analyze_results.py`.
- Added a local markdown experiment report generator for the fake-door prototype logs.
- Updated the prototype README with analysis-script usage, generated report path, privacy note, and fake-door metric interpretation guidance.
- Created `ai-collaboration/reports/2026-05-16-minimal-experiment-analysis-report-execution-report.md`.

### Analysis Script Path

- `experiments/ambiguous_temperature_v0/analyze_results.py`

### Output Report Path

- `outputs/experiments/ambiguous_temperature_v0/experiment_report.md`

### Validation Results

- `python3 -m compileall oradar` passed.
- `python3 -m py_compile experiments/ambiguous_temperature_v0/*.py` passed.
- `python3 -m py_compile scripts/generate_product_sample.py` passed.
- `python3 experiments/ambiguous_temperature_v0/analyze_results.py` passed.
- Generated report was checked to confirm raw input text and contact values are not printed.

### Known Technical Debt

- None.

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

## 2026-05-16 Product Runtime Prompt v0.2 Calibration

### Task Completed

- Calibrated `prompts/product_result_prompt_v0.md` to v0.2 in place.
- Reran the 30-sample synthetic product evaluation with live Anthropic generation.
- Updated `scripts/run_product_eval.py` to emit richer evaluation summary metrics.
- Updated `ai-collaboration/research/2026-05-16-product-validation-calibration-v0-review-bundle.md`.
- Created `ai-collaboration/reports/2026-05-16-product-runtime-prompt-v0-2-calibration-execution-report.md`.

### Prompt Changes

- strengthened `temperature_score` calibration bands and scenario examples
- expanded share-card persona families and anti-repetition guidance
- forced `personal_pattern_candidate.should_store` to always be `false` in v0
- strengthened reply-strategy instructions to prefer quoted concrete message examples

### Evaluation Rerun Status

- live generation ran for all `30` synthetic inputs
- temperature range changed from `25-55` to `35-62`
- outputs above `60` changed from `0` to `2`
- unique share-card personas increased from `21` to `25`
- `微訊號觀察家` dropped from `8` uses to `1`
- `should_store=true` count dropped from `2` to `0`

### Validation Results

- `python3 -m compileall oradar` passed.
- `python3 -m py_compile experiments/ambiguous_temperature_v0/*.py` passed.
- `python3 -m py_compile scripts/generate_product_sample.py` passed.
- `python3 -m py_compile scripts/run_product_eval.py` passed.
- `outputs/product_eval/raw/eval_manifest.json` parses as valid JSON.
- `outputs/product_eval/generated/eval_generation_summary.json` parses as valid JSON.
- all 30 generated outputs passed local structural validation against `schemas/product_result_schema_v0.json`.

### Known Technical Debt

- None.

### Review Bundle Path

- `ai-collaboration/research/2026-05-16-product-validation-calibration-v0-review-bundle.md`

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Unresolved Questions

- Whether `已讀不回` is now slightly too warm after the v0.2 lift.
- Whether `18/30` strict reply-strategy example compliance is enough for the next phase.
- Whether `confidence` should move off all-`medium` outputs before Dcard calibration.

## 2026-05-16 Dcard Topic Calibration v0

### Task Completed

- Added `scripts/dcard_topic_calibration.py` for semi-automated public URL processing.
- Added `ai-collaboration/research/dcard_calibration/dcard_urls.txt`.
- Updated the Dcard calibration README, manual note template, and schema.
- Added `ai-collaboration/research/dcard_calibration/2026-05-16-dcard-topic-calibration-v0-review-bundle.md`.
- Created `ai-collaboration/reports/2026-05-16-dcard-topic-calibration-v0-execution-report.md`.

### Workflow Paths

- script: `scripts/dcard_topic_calibration.py`
- URL input: `ai-collaboration/research/dcard_calibration/dcard_urls.txt`
- review bundle: `ai-collaboration/research/dcard_calibration/2026-05-16-dcard-topic-calibration-v0-review-bundle.md`

### Dcard Data Status

- real Dcard URLs processed: `0`
- real Dcard data collected: `no`
- current bundle is workflow-ready and waiting on public URL input

### Validation Results

- `python3 -m compileall oradar` passed.
- `python3 -m py_compile experiments/ambiguous_temperature_v0/*.py` passed.
- `python3 -m py_compile scripts/generate_product_sample.py` passed.
- `python3 -m py_compile scripts/run_product_eval.py` passed.
- `python3 -m py_compile scripts/dcard_topic_calibration.py` passed.
- `python3 scripts/dcard_topic_calibration.py` exited cleanly with no URLs present.
- `ai-collaboration/research/dcard_calibration/dcard_topic_calibration_schema.json` parses as valid JSON.

### Known Technical Debt

- None.

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Unresolved Questions

- Whether public Dcard pages expose enough useful metadata for lightweight calibration without manual supplementation.
- Whether `product_mapping` is sufficient or a separate monetization-strength field will eventually be useful.
- Whether future calibration should remain summary-only or allow short approved snippets when metadata is thin.

## 2026-05-17 Dcard Browser Topic Scan v0

### Task Completed

- Added `scripts/dcard_browser_topic_scan.py`.
- Added `ai-collaboration/research/dcard_calibration/dcard_browser_topic_scan_notes.jsonl`.
- Added `ai-collaboration/research/dcard_calibration/2026-05-17-dcard-browser-topic-scan-review-bundle.md`.
- Updated the Dcard calibration README with browser-scan setup and usage notes.
- Created `ai-collaboration/reports/2026-05-17-dcard-browser-topic-scan-v0-execution-report.md`.

### Workflow Paths

- script: `scripts/dcard_browser_topic_scan.py`
- notes output: `ai-collaboration/research/dcard_calibration/dcard_browser_topic_scan_notes.jsonl`
- review bundle: `ai-collaboration/research/dcard_calibration/2026-05-17-dcard-browser-topic-scan-review-bundle.md`

### Run Result

- command run: `python3 scripts/dcard_browser_topic_scan.py --max-posts 5 --max-comments 3`
- result: setup blocker
- Playwright was not installed, so no browser session launched
- URLs discovered: `0`
- articles processed: `0`

### Validation Results

- `python3 -m compileall oradar` passed.
- `python3 -m py_compile scripts/dcard_browser_topic_scan.py` passed.
- `python3 -m py_compile scripts/dcard_topic_calibration.py` passed.
- `python3 -m py_compile scripts/run_product_eval.py` passed.
- browser scan script exited cleanly with manual setup instructions.

### Known Technical Debt

- None.

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Unresolved Questions

- Whether a normal Playwright browser session can access Dcard public pages without a browser-visible block wall.
- Whether the current selectors are robust enough once live pages are available.
- Whether `max-posts=5` is the right first smoke-test size after setup.

## 2026-05-17 Dcard Browser Topic Scan Smoke Test

### Task Completed

- Created `ai-collaboration/handoffs/2026-05-17-dcard-browser-topic-scan-smoke-test-handoff.md`.
- Installed Playwright into a local `.venv/`.
- Downloaded Chromium into `.playwright-browsers/`.
- Ran a real browser smoke test for `scripts/dcard_browser_topic_scan.py`.
- Updated the browser review bundle with the actual Cloudflare failure mode.
- Created `ai-collaboration/reports/2026-05-17-dcard-browser-topic-scan-smoke-test-execution-report.md`.

### Workflow Paths

- script: `scripts/dcard_browser_topic_scan.py`
- output notes: `ai-collaboration/research/dcard_calibration/dcard_browser_topic_scan_notes.jsonl`
- review bundle: `ai-collaboration/research/dcard_calibration/2026-05-17-dcard-browser-topic-scan-review-bundle.md`

### Run Result

- command run: `PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers .venv/bin/python scripts/dcard_browser_topic_scan.py --max-posts 5 --max-comments 3`
- result: browser launched, but board page was blocked by Cloudflare before any article discovery
- URLs discovered: `0`
- articles processed: `0`

### Validation Results

- `python3 -m py_compile scripts/dcard_browser_topic_scan.py` passed.
- local Playwright install succeeded inside `.venv/`.
- local Chromium install succeeded inside `.playwright-browsers/`.
- browser diagnostic confirmed page title `Attention Required! | Cloudflare`.

### Known Technical Debt

- None.

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Unresolved Questions

- Whether the Cloudflare block is environment-specific or a stable response to browser automation.
- Whether Dcard calibration should now pivot to manual browser reading plus manual notes.
- Whether the Playwright script should remain as a diagnostic-only tool.

## 2026-05-17 External Dcard JSON Calibration v0

### Task Completed

- Added `scripts/external_dcard_json_calibration.py`.
- Created `ai-collaboration/research/dcard_calibration/external_json/` outputs.
- Ran calibration on `ai-collaboration/output-0517.jsonl`.
- Generated notes, summary JSON, and review bundle.
- Updated the Dcard calibration README.
- Created `ai-collaboration/reports/2026-05-17-external-dcard-json-calibration-v0-execution-report.md`.

### Input Source

- `ai-collaboration/output-0517.jsonl`

### Output Paths

- notes: `ai-collaboration/research/dcard_calibration/external_json/external_dcard_calibration_notes.jsonl`
- summary: `ai-collaboration/research/dcard_calibration/external_json/external_dcard_calibration_summary.json`
- review bundle: `ai-collaboration/research/dcard_calibration/external_json/2026-05-17-external-dcard-json-calibration-v0-review-bundle.md`

### Processing Results

- posts processed: `20`
- skipped posts: `0`
- top product families:
  - `伴侶價值觀雷達`
  - `關係紅旗雷達`
  - `親密落差解讀`
- current MVP family count (`曖昧溫度計` + `下一句怎麼回`): `5`
- broader adjacent family count: `11`

### Validation Results

- `python3 -m compileall oradar` passed.
- `python3 -m py_compile scripts/external_dcard_json_calibration.py` passed.
- `python3 -m py_compile scripts/dcard_topic_calibration.py` passed.
- `python3 -m py_compile scripts/dcard_browser_topic_scan.py` passed.
- `python3 -m py_compile scripts/run_product_eval.py` passed.
- notes JSONL parses and contains `20` rows.
- summary JSON parses successfully.
- privacy minimization check passed.

### Known Technical Debt

- None.

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Unresolved Questions

- Whether `關係紅旗雷達` should be the next product family after `曖昧溫度計`.
- Whether `親密落差解讀` is too sensitive for an early paid consumer surface.
- Whether `Relationship Radar general` should be broken into narrower future families sooner.

## 2026-05-17 Product Map Calibration Note v0

### Task Completed

- Created `ai-collaboration/research/2026-05-17-product-map-calibration-note-v0.md`.
- Created `ai-collaboration/reports/2026-05-17-product-map-calibration-note-v0-execution-report.md`.
- Captured the first MVP decision, future product family map, `暗語 ANYU` brand candidate, standalone theme-page model, portal model, and weekly/biweekly launch model.

### Key Decisions Captured

- first MVP remains `曖昧溫度計 + 下一句怎麼回`
- `暗語 ANYU` is documented as a future mother-brand / portal candidate
- standalone theme page plus future portal model is captured
- weekly / biweekly launch operating model is captured

### Recommended Next Step

- `Visual Direction Exploration v0`

### Validation Results

- note file exists
- execution report exists
- `python3 -m compileall oradar` passed

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

## 2026-05-18 ANYU Design System Implementation v1.0

### Task Completed

- Stored the ANYU design system source under `ai-collaboration/research/design/2026-05-18-anyu-design-system-v1.md`.
- Stored and used design tokens from `experiments/ambiguous_temperature_v0/static/tokens.css`.
- Applied the design system visual layer to `experiments/ambiguous_temperature_v0/`.
- Created `ai-collaboration/research/design/2026-05-18-anyu-design-system-implementation-review-bundle.md`.
- Created `ai-collaboration/reports/2026-05-18-anyu-design-system-implementation-execution-report.md`.

### Prototype Paths

- design system source: `ai-collaboration/research/design/2026-05-18-anyu-design-system-v1.md`
- tokens path: `experiments/ambiguous_temperature_v0/static/tokens.css`
- prototype path: `experiments/ambiguous_temperature_v0/`
- review bundle: `ai-collaboration/research/design/2026-05-18-anyu-design-system-implementation-review-bundle.md`

### What Changed

- added `暗語 ANYU` brand hierarchy and `module · 01 · 曖昧溫度計` landing structure
- moved prototype styling to token-based CSS
- refreshed landing, result, share preview, paid CTA, and contact capture visuals without changing API contracts or event names
- added chip-based situation selection UI over the existing hidden form control

### Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m py_compile experiments/ambiguous_temperature_v0/*.py` passed
- `python3 -m py_compile scripts/generate_product_sample.py` passed
- `python3 -m py_compile scripts/run_product_eval.py` passed
- local server started at `http://127.0.0.1:8010`
- `GET /health` passed
- `POST /api/events` passed
- `POST /api/contact` passed with synthetic payload
- headless browser landing-page render check passed
- live analyze call timed out in this environment

### Learnings

- the design system fits the existing single-page prototype without needing runtime changes
- the hidden-state rule had to be restored explicitly in the new stylesheet to keep the fake-door flow intact
- the current schema supports the refreshed result layout, but not the richer three-dimension signal model described in the design document

### Unresolved Questions

- whether `暗語 ANYU` should be louder or quieter on the first standalone module page
- whether contact capture should remain inline or move to a bottom sheet later
- whether provider timeout is local-environment-specific or a runtime issue to investigate separately

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

## 2026-05-18 ANYU Prototype Mobile Visual Polish v0.1

### Task Completed

- created `ai-collaboration/handoffs/2026-05-18-anyu-mobile-visual-polish-v0-1-handoff.md`
- created `ai-collaboration/research/design/2026-05-18-anyu-mobile-visual-polish-review-bundle.md`
- created `ai-collaboration/reports/2026-05-18-anyu-mobile-visual-polish-execution-report.md`
- tightened the mobile landing layout in `experiments/ambiguous_temperature_v0/`

### Main Changes

- reduced the first-screen vertical footprint
- moved the long ANYU tagline under the wordmark and used `曖昧溫度計` as the short right-side label
- made the primary CTA explicitly disabled when the input is empty and enabled when the input is filled
- improved unselected chip contrast and hover/focus affordance
- slightly strengthened hero accent readability for `冷掉`

### Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m py_compile experiments/ambiguous_temperature_v0/*.py` passed
- `python3 -m py_compile scripts/generate_product_sample.py` passed
- `python3 -m py_compile scripts/run_product_eval.py` passed
- local prototype server started successfully
- headless browser mobile render check passed
- empty CTA state showed `先貼一段對話`
- filled CTA state showed `分析我的曖昧溫度`

### Learnings

- the layout improved more from spacing and state clarity than from any structural redesign
- the topbar needed hierarchy cleanup more than extra brand copy
- chip contrast had to be restored with both border and surface, not text color alone

### Unresolved Questions

- whether the brand subline under `暗語 ANYU` should remain visible on the first screen
- whether the disabled CTA should stay muted ink or move to a lighter surface treatment
- whether the hero should tighten one more step for short mobile viewports

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

## 2026-05-18 C-stage Frontend Stack Selection Prep

### Task Completed

- created `ai-collaboration/handoffs/2026-05-18-c-stage-frontend-stack-selection-prep-handoff.md`
- created `ai-collaboration/research/2026-05-18-c-stage-frontend-stack-selection-prep.md`
- created `ai-collaboration/reports/2026-05-18-c-stage-frontend-stack-selection-prep-execution-report.md`

### Main Decision Captured

- formal stack selection should optimize for a multi-module AI-native insight system, not merely productionizing the current prototype

### Candidate Stacks Covered

- `Next.js full-stack`
- `Next.js frontend + Python backend`
- `Astro static-first + serverless`
- `Keep Python prototype and deploy lightly`

### Recommended Next Step

- `Formal Tech Stack Selection v0`

### Validation Results

- prep document exists
- execution report exists
- `python3 -m compileall oradar` passed

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

## 2026-05-18 Formal Tech Stack Selection v0

### Task Completed

- created `ai-collaboration/handoffs/2026-05-18-formal-tech-stack-selection-v0-handoff.md`
- created `ai-collaboration/research/2026-05-18-formal-tech-stack-selection-v0.md`
- created `ai-collaboration/reports/2026-05-18-formal-tech-stack-selection-v0-execution-report.md`

### Selected Stack

- `Next.js` full-stack
- `React`
- `TypeScript` strict mode
- `Next.js App Router`
- `Vercel`
- `Neon PostgreSQL ap-southeast-1`
- `Drizzle ORM`
- `Vitest`

### Auth Decision

- no required auth in v0

### Design System Placement Decision

- canonical future home under `docs/design-system/`
- app copy target under `apps/web/src/styles/tokens.css`

### Repo Organization Decision

- production app target under `apps/web/`
- experiments remain as reference
- collaboration and research paths stay stable for now

### Recommended Next Step

- `Repo Foundation Setup v0`

### Validation Results

- stack selection document exists
- execution report exists
- `python3 -m compileall oradar` passed

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

## 2026-05-18 Module 01 Runtime + DB Integration v0

### Task Completed

- implemented runtime + persistence flow for `apps/web` Module 01
- added analyze, events, unlock intent, and contact APIs
- added Drizzle runtime tables for `sessions`, `events`, `analysis_requests`, `analysis_results`, `unlock_intents`, and `contact_submissions`
- created `ai-collaboration/research/2026-05-18-module-01-runtime-db-integration-v0-review-bundle.md`
- created `ai-collaboration/reports/2026-05-18-module-01-runtime-db-integration-v0-execution-report.md`

### Runtime Decisions

- normalized result JSON is the UI source of truth for stored results
- Anthropic is the primary provider path, with lightweight OpenAI fallback support
- `/m/ambiguous-temperature/result/demo` stays available as an internal review route alongside DB-backed real result pages

### Privacy / Storage Learnings

- event payloads now reject obvious raw-text metadata keys
- input redaction is basic and limited to email / phone / handle-like patterns in v0
- raw text remains excluded from event storage, while redacted request text is separated from result and contact records

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed
- local GET smoke checks for `/m/ambiguous-temperature` and `/m/ambiguous-temperature/result/demo` returned `200 OK`
- live analyze could not be exercised end-to-end because local `DATABASE_URL` and provider keys are not configured

### Recommended Next Step

- `Module 01 Launch Readiness v0`

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

## 2026-05-18 Module 01 Launch Readiness v0

### Task Completed

- added passive client-side launch-readiness events for `page_view`, `input_started`, `analysis_started`, `analysis_failed`, and `share_card_clicked`
- added unlock-intent fallback so contact capture still opens even when intent persistence fails
- tightened user-facing analyze/contact error copy
- created `ai-collaboration/research/2026-05-18-module-01-launch-readiness-checklist.md`
- created `ai-collaboration/research/2026-05-18-module-01-launch-readiness-v0-review-bundle.md`
- created `ai-collaboration/reports/2026-05-18-module-01-launch-readiness-v0-execution-report.md`

### Launch Readiness Learnings

- passive analytics can be added safely as best-effort client calls without making the UI depend on event persistence success
- unlock-intent storage should not block contact capture in the first launch flow
- privacy and retention expectations need to be explicit in launch docs because deletion automation is still deferred

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed
- local build/test still work without `DATABASE_URL` or provider keys
- no-env route tests verify friendly `config_error` responses for analyze and events APIs

### Recommended Next Step

- `Module 01 Preview Deployment + Manual QA v0`

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

## 2026-05-18 Module 01 Preview Deployment + Manual QA v0

### Task Completed

- verified local preview-QA prerequisites and found live env unavailable in this workspace
- verified standard validation still passes
- created `ai-collaboration/research/2026-05-18-module-01-preview-deployment-qa-report.md`
- created `ai-collaboration/reports/2026-05-18-module-01-preview-deployment-manual-qa-v0-execution-report.md`
- updated `apps/web/README.md` with explicit preview deployment settings and commands

### Live QA / Deployment Status

- live QA did not run because required runtime env vars are missing locally
- Drizzle migration did not run because `DATABASE_URL` is missing locally
- Vercel preview deployment did not run because `vercel` CLI is not available in this workspace

### Blockers

- `blocked_pending_user_setup`
- missing local `DATABASE_URL`
- missing local Anthropic env
- missing local `NEXT_PUBLIC_APP_URL`
- missing `vercel` CLI or linked preview deployment access

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Recommended Next Step

- `Module 01 Preview Env Setup + Live QA Retry v0`

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

## 2026-05-19 Module 01 Local Live QA Verification v0

### Task Completed

- verified required local runtime env presence without printing values
- ran `corepack pnpm db:generate` and `corepack pnpm db:migrate`
- executed real local analyze, unlock intent, email contact, and LINE contact flows with synthetic test input
- created `ai-collaboration/research/2026-05-19-module-01-local-live-qa-verification-report.md`
- created `ai-collaboration/reports/2026-05-19-module-01-local-live-qa-verification-v0-execution-report.md`

### Local Live QA Result

- local live QA passed
- provider call succeeded with Anthropic
- AJV/schema validation passed
- normalized result persisted and was loadable through the result-page data path

### Privacy Verification

- raw input not present in events
- synthetic contact values not present in events
- retention fields set on request/result records
- synthetic input only used

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Recommended Next Step

- `Module 01 Preview Deployment + Remote QA Retry v0`

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

## 2026-05-19 Module 01 Preview Deployment + Remote QA Retry v0

### Task Completed

- authenticated Vercel CLI on this machine
- discovered and linked the existing `anyu-next` Vercel project correctly at repo root
- deployed a new preview successfully
- created `ai-collaboration/research/2026-05-19-module-01-preview-deployment-qa-report.md`
- created `ai-collaboration/reports/2026-05-19-module-01-preview-deployment-remote-qa-retry-v0-execution-report.md`

### Preview Deployment Status

- preview deployment succeeded and reached `READY`
- authenticated preview access worked through Vercel CLI bypass
- landing, demo route, and health endpoint responded successfully
- remote analyze, events, and contact write paths failed in preview

### Blockers

- preview DB-backed write paths are failing remotely
- `NEXT_PUBLIC_APP_URL` was not confirmed in preview env output
- remote DB/event verification is still pending until the preview write-path issue is resolved

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed
- Vercel preview deployment reached `READY`

### Recommended Next Step

- `Module 01 Preview Runtime Failure Triage v0`

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

## 2026-05-19 Module 01 Authenticated Preview Browser QA v0

### Task Completed

- verified protected preview access using authenticated Vercel CLI bypass
- verified preview landing route, demo route, and health endpoint remotely
- exercised preview analyze, events, and contact APIs with synthetic payloads
- created `ai-collaboration/research/2026-05-19-module-01-authenticated-preview-browser-qa-report.md`
- created `ai-collaboration/reports/2026-05-19-module-01-authenticated-preview-browser-qa-v0-execution-report.md`

### Authenticated Preview QA Status

- preview access passed
- landing/demo/health checks passed
- preview DB-backed write paths failed for analyze, events, and contact

### DB / Privacy Verification Status

- remote DB verification is blocked by preview write failures
- no secrets were printed
- only synthetic payloads were used

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed
- Vercel preview deployment remained `READY`

### Recommended Next Step

- `Module 01 Preview Runtime Failure Triage v0`

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

## 2026-05-19 Add Staging Push Workflow Rule

### Task Completed

- added the staging push rule to `AGENTS.md`
- added the staging push rule to `WORKING_AGREEMENT.md`
- updated `README.md` workflow guidance
- updated `ai-collaboration/templates/handoff_template.md`
- updated `ai-collaboration/templates/execution_report_template.md`
- created `ai-collaboration/reports/2026-05-19-staging-push-workflow-rule-execution-report.md`

### Workflow Change

- completed handoffs now require commit plus push to `origin/staging` when validation and safety checks pass
- final completion summaries must include both commit hash and staging push status

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Staging Push Status

- Pending at summary-write time; final staging push status is reported in the final Codex Completion Summary after commit/push are attempted.

## 2026-05-20 - Module 01 Input Guidance + Indicator v0.5

### Completed

- softened Module 01 input guidance states and CTA labels without changing the server-side validation thresholds
- added a subtle four-dot context-health indicator to the landing guidance card
- removed remaining-count pressure from normal input states and kept explicit count only for true over-limit input

### Learnings

- the landing guidance reads calmer when framed as “context quality” rather than “characters remaining”
- the existing shared helper layer was enough to drive both copy and indicator state without touching runtime logic

### Unresolved Questions

- whether the indicator reads clearly enough on a real bright mobile screen
- whether a later human-browser pass should tune the dot prominence further

### Report Path

- `ai-collaboration/research/2026-05-20-module-01-input-guidance-indicator-v0-5.md`

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

## 2026-05-20 - Module 01 Input Validation + Abuse Guard v0

### Completed Changes

- added stronger Module 01 analyze validation with a 30-character minimum, 4,000-character hard max, and soft long-input hinting
- blocked obvious prompt-injection and clearly unrelated generic requests before provider cost is incurred
- added pragmatic cost guards: session daily cap, IP hourly cap, and global daily cap

### Learnings

- `analysis_requests` is already sufficient for persisted session/global cost controls without a schema change
- an in-memory IP limiter is acceptable as a small v0 compromise, but it is not durable across all serverless instances
- friendly product-style rejection copy can be added without widening runtime or provider internals

### Unresolved Questions

- whether staging abuse verification should include repeated protected-preview bursts from a browser session
- when the process-local IP guard should be replaced by a durable shared limiter

## 2026-05-20 - Module 01 Staging Abuse Guard Verification v0

### Completed Changes

- verified the live staging guard behavior for valid, short, overly long, prompt-injection, unrelated-content, and borderline relationship-like synthetic inputs
- confirmed staging was serving a fresh deployment at or newer than `803fbdc`
- recorded the limits of direct staging DB inspection from this shell while still documenting privacy-safe response behavior

### Learnings

- the soft max behaves correctly: `2000–4000` is still allowed while `>4000` is rejected
- the current relationship-content heuristic is acceptable for v0 because longer generic coding input was rejected while borderline relationship language still passed
- preview env pull in this shell context exposes env names but not usable secret values, which limits direct DB verification

### Unresolved Questions

- whether a later authenticated browser + direct DB access pass should explicitly verify blocked-case row absence on the preview DB
- whether preview should carry explicit `ANALYSIS_*` overrides or continue relying on code defaults

## 2026-05-20 - Module 01 Staging Contact + Unlock Post-Guard Regression Check v0

### Completed Changes

- verified the live staging happy path for valid analyze, runtime result load, unlock intent, synthetic email submit, and synthetic LINE submit
- verified the missing-consent case still returns friendly validation copy
- documented the current boundary between route/API verification and exact staging DB row confirmation

### Learnings

- the abuse-guard pass did not regress the fake-door funnel behavior
- success-state collapse after contact submit remains coherent in source and matches the returned success API copy
- the local Neon env available in this shell is not the same branch/database as the live staging deployment

### Unresolved Questions

- whether a true human browser/device pass should explicitly confirm the post-submit success-collapse feel
- whether a branch-aligned staging DB access path should be added for future remote QA verification

## 2026-05-20 - Module 01 Micro UX Fixes v0.4

### Completed Changes

- added richer context-quality guidance bands for the landing textarea without changing the current 30-character hard minimum
- added blur + scroll/focus behavior so the loading panel becomes the active target after analyze submit
- improved the share affordance with a stronger primary button label and clearer social-copy support text

### Learnings

- the guidance UI reads more clearly when it is separated from pricing/share notes
- loading state accessibility and mobile attention flow can be improved without touching runtime behavior
- the current share flow already had enough logic underneath; it mainly needed clearer presentation

### Unresolved Questions

- how the new loading focus feels on a real phone with the soft keyboard open
- whether the share action needs one more pass to distinguish native share from copy behavior more explicitly

## 2026-05-20 — Module 01 Haiku Staging Trial v0

### Task Completed

- added an env-driven guarded Anthropic strategy for Module 01: Haiku primary, retry once on invalid output, Sonnet fallback
- deployed the guarded strategy to preview branch `staging` temporarily and confirmed one live staging sample through the real route plus Neon verification
- reverted `MODEL_STRATEGY` on preview branch `staging` back to `sonnet_default` after the partial trial

### Key Learnings

- the guarded strategy code path works in the real staging analyze route
- one confirmed live sample persisted with `modelStrategy=haiku_retry_sonnet_fallback`, `finalModel=claude-haiku-4-5-20251001`, `retryCount=0`, and `fallbackUsed=false`
- repeated automated protected-preview POSTs were intercepted by Vercel’s browser security checkpoint, so the intended 5-sample trial did not complete

### Unresolved Questions

- whether the retry/fallback path will be exercised in a real authenticated staging run is still unknown
- whether a protected-preview bypass secret or true browser session is needed for future multi-sample remote QA is still open

### Report Path

- `ai-collaboration/reports/2026-05-20-module-01-haiku-staging-trial-v0-execution-report.md`

### Validation Result

- compileall, lint, test, and build passed
- one live staging analyze sample plus Neon preview-branch verification passed

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Staging Push Status

- Pending at summary-write time; final staging push status is reported in the final Codex Completion Summary after commit/push are attempted.

## 2026-05-20 — Module 01 Haiku Repair Trial v0

### Task Completed

- evaluated four Haiku reliability strategies for Module 01: `direct`, `retry-on-invalid`, `repair-on-invalid`, and `sonnet-fallback`
- extended the local evaluator to support strategy execution, repair prompts, fallback routing, and per-stage token/latency accounting

### Key Learnings

- direct Haiku is still not reliable enough: `4/5`
- retry-on-invalid was the strongest narrow guard in this run: `5/5`, median `18,526 ms`, estimated `$14.495 / 1,000`
- repair-on-invalid is not viable: `3/5` and weaker cost/latency tradeoff
- sonnet-fallback stayed directionally promising, but fallback did not actually trigger in this run

### Unresolved Questions

- whether retry-on-invalid remains stable across a larger or noisier sample is still unknown
- whether Sonnet fallback is worth the extra runtime complexity is still unproven without an exercised fallback path

### Report Path

- `ai-collaboration/reports/2026-05-20-module-01-haiku-repair-trial-v0-execution-report.md`

### Validation Result

- evaluator strategy runs completed
- compileall, lint, test, and build pending at summary-write time

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Staging Push Status

- Pending at summary-write time; final staging push status is reported in the final Codex Completion Summary after commit/push are attempted.

## 2026-05-20 Module 01 Faster Model Discovery + Cost Evaluation v0

### Task Completed

- queried the Anthropic Models API for account-visible model IDs
- extended `apps/web/scripts/evaluate-model-latency.mjs` to support model discovery, token usage capture, and cost estimation
- evaluated the current Sonnet baseline, available Sonnet 4.6, and available Haiku 4.5 on the same 5 synthetic cases
- created `ai-collaboration/research/2026-05-20-module-01-faster-model-discovery-cost-evaluation-v0.md`
- created `ai-collaboration/reports/2026-05-20-module-01-faster-model-discovery-cost-evaluation-v0-execution-report.md`

### Available Faster Model Result

- account-visible relevant models included `claude-sonnet-4-6` and `claude-haiku-4-5-20251001`
- Haiku 4.5 is actually available on this account
- Sonnet 4.6 is also available on this account

### Cost Per 1,000 Summary

- `claude-sonnet-4-20250514`: about `$37.37 / 1,000`
- `claude-sonnet-4-6`: about `$43.226 / 1,000`
- `claude-haiku-4-5-20251001`: about `$14.867 / 1,000`

### Recommendation

- keep the current model for now
- do not switch to Sonnet 4.6
- only consider a guarded Haiku staging trial if we accept or mitigate JSON reliability risk first

### Learnings

- provider-side discovery is the reliable way to confirm available model IDs on this account
- Haiku 4.5 has the expected cost/latency advantage, but current JSON stability is not yet strong enough for an immediate switch

### Unresolved Questions

- whether Haiku reliability becomes acceptable with retry/repair safeguards
- whether the cost savings justify a controlled staging experiment despite the current `1/5` parse failure

### Validation Results

- Anthropic model discovery succeeded outside the sandbox
- live evaluator runs succeeded for baseline, Sonnet 4.6, and Haiku 4.5
- `python3 -m compileall oradar` pending at summary-write time
- `corepack pnpm lint` pending at summary-write time
- `corepack pnpm test` pending at summary-write time
- `corepack pnpm build` pending at summary-write time

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Staging Push Status

- Pending at summary-write time; final staging push status is reported in the final Codex Completion Summary after commit/push are attempted.

## 2026-05-20 Module 01 Staging Timing Verification v0

### Task Completed

- verified live staging deployment freshness for the wait-state instrumentation pass
- ran two synthetic staging analyze flows through protected preview access
- verified runtime result loading from returned `resultId`
- verified `analysis_completed` event metadata now includes safe timing aggregates
- confirmed the deployed landing bundle contains the new elapsed-time wait-state strings and `65_000ms` timeout constant
- created `ai-collaboration/research/2026-05-20-module-01-staging-timing-verification-v0.md`
- created `ai-collaboration/reports/2026-05-20-module-01-staging-timing-verification-v0-execution-report.md`

### Staging Timing Verification Status

- deployment freshness: passed
- staging analyze flow: passed
- runtime result route: passed
- event timing metadata presence: passed
- privacy verification: passed

### Latency Classification

- `provider-dominant`
- sample A total/provider latency: `27,972ms / 24,688ms`
- sample B total/provider latency: `26,347ms / 23,931ms`
- provider share remained roughly `88–91%` across both samples

### Learnings

- the new event metadata shape is sufficient to diagnose the main latency source without widening the event taxonomy
- current staging latency is not mainly a DB-write or cold-start problem

### Unresolved Questions

- whether a faster Anthropic model is available on this account under a different valid name
- whether the human perception of the new slow-wait copy is good enough without a model change

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Staging Push Status

- Pending at summary-write time; final staging push status is reported in the final Codex Completion Summary after commit/push are attempted.

## 2026-05-20 Module 01 Wait-State + Runtime Instrumentation v0

### Task Completed

- added server-side timing instrumentation for the Module 01 analyze route
- added `apps/web/src/lib/runtime/timing.ts` for stable phase marking and safe timing summaries
- attached safe latency metadata to `analysis_completed` event records
- upgraded the landing wait-state UX to elapsed-time-aware reassurance copy
- added a generous client timeout guard for analyze submit
- created `ai-collaboration/research/2026-05-20-module-01-wait-state-runtime-instrumentation-v0.md`
- created `ai-collaboration/reports/2026-05-20-module-01-wait-state-runtime-instrumentation-v0-execution-report.md`

### Timing Instrumentation Summary

- phases now tracked are `request_received`, `input_validated`, `input_redacted`, `analysis_request_stored`, `provider_started`, `provider_completed`, `schema_validated`, `analysis_result_stored`, and `response_ready`
- event-safe metrics now include total latency plus approximate provider, validation, and DB write durations
- timing is stored on the existing `analysis_completed` event metadata rather than a new event name

### Wait-State UX Summary

- loading copy now changes by elapsed-time stage instead of looping generic messages
- slow-state reassurance begins after roughly `8s`
- explicit long-wait acknowledgement begins after roughly `20s`
- a friendly retry-oriented timeout message now exists for client-side timeout failure

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Learnings

- the smaller safe implementation path was to enrich `analysis_completed` metadata rather than expanding the event taxonomy
- duplicate input redaction in the runtime path was unnecessary and could be removed without changing behavior

### Unresolved Questions

- live event-row verification of the new timing metadata still needs a running dev/staging pass
- real user perception of the new `40s+` wait copy still benefits from a human staging check

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Staging Push Status

- Pending at summary-write time; final staging push status is reported in the final Codex Completion Summary after commit/push are attempted.

## 2026-05-20 Module 01 Staging UX Polish v0.2

### Task Completed

- improved chip/button contrast on staging
- improved observed-signal card readability on mobile
- made rotating loading messages more visually noticeable
- removed redundant `by 暗語 ANYU` landing subtitle copy
- created `ai-collaboration/research/2026-05-20-module-01-staging-ux-polish-v0-2-review-bundle.md`
- created `ai-collaboration/reports/2026-05-20-module-01-staging-ux-polish-v0-2-execution-report.md`

### UX Polish Summary

- chips should read more clearly as interactive
- signal cards should be easier to read on mobile screenshots
- loading-state change should be more noticeable
- landing hero is slightly cleaner and tighter

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Recommended Next Step

- `Module 01 Staging Real-Device Contrast Check v0`

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Staging Push Status

- Pending at summary-write time; final staging push status is reported in the final Codex Completion Summary after commit/push are attempted.

## 2026-05-19 Module 01 Staging UX Polish v0.1

### Task Completed

- polished the Module 01 landing header/brand treatment to move the CTA higher
- added rotating loading reassurance for long analyze waits
- added a lightweight share-text action with native-share/clipboard fallback
- improved the post-submit contact success state
- created `ai-collaboration/research/2026-05-19-module-01-staging-ux-polish-v0-1-review-bundle.md`
- created `ai-collaboration/reports/2026-05-19-module-01-staging-ux-polish-v0-1-execution-report.md`

### UX Polish Summary

- above-the-fold conversion rhythm improved
- mother brand is quieter on landing
- waiting experience is calmer
- sharing is more convenient on mobile without PNG generation

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Recommended Next Step

- `Module 01 Model Latency Evaluation v0`

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Staging Push Status

- Pending at summary-write time; final staging push status is reported in the final Codex Completion Summary after commit/push are attempted.

## 2026-05-19 Module 01 Staging Browser Manual QA Sweep v0

### Task Completed

- reviewed the staging landing, runtime result, and demo result routes through authenticated staging access
- ran a fresh synthetic staging analyze flow for QA context
- inspected current Module 01 source and responsive CSS for mobile/browser polish
- created `ai-collaboration/research/2026-05-19-module-01-staging-browser-manual-qa-sweep-report.md`
- created `ai-collaboration/reports/2026-05-19-module-01-staging-browser-manual-qa-sweep-v0-execution-report.md`

### Staging URL Tested

- `https://staging.anyu.tw`

### QA Method

- authenticated `vercel curl` route checks
- remote HTML inspection
- source/CSS inspection
- no true interactive browser/devtools session available in this environment

### Fixes Applied

- softened landing latency expectation copy
- softened analyze loading status copy

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Recommended Next Step

- `Module 01 Staging Real-Device QA Pass v0`

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Staging Push Status

- Pending at summary-write time; final staging push status is reported in the final Codex Completion Summary after commit/push are attempted.

## 2026-05-19 Module 01 Staging Remote QA v0

### Task Completed

- verified authenticated staging access for `https://staging.anyu.tw`
- confirmed staging alias mapped to the current `staging` preview deployment
- verified staging env-name presence in Vercel Preview
- identified and fixed the staging-only prompt/schema path bug
- applied the runtime schema to the Neon `preview` branch
- verified real staging analyze, result, unlock, contact, and event flows with synthetic payloads
- created `ai-collaboration/research/2026-05-19-module-01-staging-remote-qa-report.md`
- created `ai-collaboration/reports/2026-05-19-module-01-staging-remote-qa-v0-execution-report.md`

### Staging URL

- `https://staging.anyu.tw`

### Remote QA Status

- staging landing route passed
- staging demo route passed
- staging analyze flow passed after the app-local asset fix and Preview DB bootstrap
- DB-backed result route passed
- unlock intent passed
- email and LINE contact submissions passed
- direct event ingestion passed

### DB / Privacy Verification Status

- Neon `preview` branch contains the expected runtime tables
- normalized result, retention fields, unlock intent, and contact rows were verified
- raw input was not present in event metadata
- synthetic contact values were not present in event metadata

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Recommended Next Step

- `Module 01 Staging Browser Manual QA Sweep v0`

### Commit Hash

- Pending at summary-write time; final commit hash is reported in the final Codex Completion Summary because a commit cannot contain its own final hash without changing that hash.

### Staging Push Status

- Pending at summary-write time; final staging push status is reported in the final Codex Completion Summary after commit/push are attempted.

## 2026-05-20 Production Env Readiness Verification v0

### Task Completed

- Verified Vercel production env/status for both the prepared app project `anyu-next` and the currently production-facing project `anyu`.
- Verified current production domain/deployment mapping, high-level DNS/HTTPS status, and Neon production-branch readiness.
- Updated the production launch decision draft to reflect the actual verified blockers instead of generic pending status.

### Key Learnings

- The main production blocker is project/domain/env drift, not missing app functionality.
- `anyu-next` is the repo-aligned app project, but `https://anyu.tw` currently serves a different Vercel project, `anyu`.
- `anyu-next` has a ready Neon production branch, but active production DB linkage is still not safe to trust until the production-facing Vercel project is normalized.
- `www.anyu.tw` is still unhealthy and returns `521`.

### Unresolved Questions

- Whether production should be normalized onto `anyu-next` or whether `anyu` should be fully repurposed for the current app.
- Whether the active production `DATABASE_URL` already points at the `anyu-next` production branch.
- What final `www.anyu.tw` redirect/DNS policy should be used at launch.

## 2026-05-20 Production Project + Domain Normalization v0

### Task Completed

- Verified the current Vercel project/domain split across `anyu-next` and `anyu`.
- Compared normalization options and documented a safe manual plan.
- Updated the production launch decision draft and runbook with the explicit normalization prerequisite.

### Recommendation

- Choose `Option A`.
- Make `anyu-next` the production Vercel project.
- Move `anyu.tw` and `www.anyu.tw` to `anyu-next` only after explicit human approval.

### Current Go / No-Go Status

- `No-Go`

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Unresolved Questions

- Whether any hidden dependency still requires the old `anyu` project.
- Whether the active production `DATABASE_URL` already points at Neon `anyu-next` `production`.
- Whether production should launch from `main` or an explicitly approved production commit path.

## 2026-05-20 Production Domain Move Approval + Env Finalization v0

### Task Completed

- Finalized approved public production env values on `anyu-next`.
- Created a healthy `anyu-next` production deployment.
- Verified that `anyu.tw` and `www.anyu.tw` now serve the new `anyu-next` production deployment.

### Domain Normalization Status

- `anyu.tw` now serves `anyu-next`
- `www.anyu.tw` now serves `anyu-next`
- `www -> apex` redirect is still pending

### Env Finalization Status

- required non-secret production env names for the launch candidate are now present on `anyu-next`
- `DATABASE_URL` and `ANTHROPIC_API_KEY` still require secret-safe/manual confirmation

### Current Go / No-Go Status

- `No-Go`

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Unresolved Questions

- whether `DATABASE_URL` truly points to Neon `anyu-next` `production`
- how `www.anyu.tw -> https://anyu.tw` should be finalized in production config
- whether stale Vercel domain-inspection ownership output needs manual cleanup

## 2026-05-20 Production Redirect + DB Target Confirmation v0

### Task Completed

- Added a narrow host-based redirect so `www.anyu.tw` now redirects to `https://anyu.tw`.
- Deployed a fresh healthy `anyu-next` production build and verified apex/redirect behavior live.
- Ran a safe production env-run probe for `DATABASE_URL` and `ANTHROPIC_API_KEY` readiness.

### Redirect Status

- `anyu.tw` returns `200`
- `www.anyu.tw` returns `308` to `https://anyu.tw/`

### DB / Provider Status

- `ANTHROPIC_API_KEY` appears present in the safe probe
- `DATABASE_URL` could not be confirmed and appears blank/unusable in the same safe probe

### Current Go / No-Go Status

- `No-Go`

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Unresolved Questions

- whether production `DATABASE_URL` is truly blank or just inaccessible through the current safe probe path
- whether production DB migration is still required once the secret is repaired or confirmed
- whether the team later wants the redirect moved from app-level config to Vercel/domain-level config

## 2026-05-21 Production DATABASE_URL Repair + Smoke Gate v0

### Task Completed

- Repaired production `DATABASE_URL` by explicitly overriding it from the Neon `anyu-next` production branch connection string.
- Re-ran the safe production runtime probe for `DATABASE_URL` and `ANTHROPIC_API_KEY`.
- Checked production branch schema state and stopped before smoke when both DB gates failed.

### DATABASE_URL Confirmation Status

- intended secret target was repaired
- runtime still reported `DATABASE_URL` absent

### Schema State

- required runtime tables were not present in the production branch listing used for this pass

### Smoke Result

- not run

### Current Go / No-Go Status

- `No-Go`

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Unresolved Questions

- whether a fresh post-secret-update production deploy is still needed for runtime to see `DATABASE_URL`
- whether the empty production branch means migration was never run
- whether the next approved step should combine migration with env/runtime debug

## 2026-05-21 Production Migration + Smoke Gate v0

### Task Completed

- Ran the approved production migration through a direct Neon production-branch transaction after the safe `vercel env run` / Drizzle path still saw empty `url`.
- Verified the required runtime tables now exist on the Neon `anyu-next` `production` branch.
- Ran a tightly scoped synthetic production smoke for analyze, real result load, unlock, synthetic Email fallback, legal routes, and apex / `www` redirect.

### Migration Result

- production migration passed
- required runtime tables are now present

### Smoke Result

- production smoke was run
- production smoke passed

### Event / Privacy Result

- `analysis_completed` and `contact_submitted` were verified
- timing metadata was present
- no raw synthetic input or synthetic email leakage was found in verified event metadata

### Current Go / No-Go Status

- `No-Go pending final human approval / final launch decision`

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- which exact production candidate commit should be approved from `origin/staging`
- whether final human browser / phone smoke is accepted
- whether manual retention cleanup burden is explicitly accepted for launch

## 2026-05-21 Production Launch Decision Finalization v0

### Task Completed

- Created the final production launch decision record for Module 01.
- Recorded human production smoke acceptance and converted launch status from draft `No-Go` to final low-key `GO`.
- Linked the final decision from the superseded draft and the production runbook.

### Final Decision

- `GO for low-key production launch`

### Launch Scope

- Module 01 only
- free analysis
- fake-door `NT$49` paid intent
- LINE-first notification flow
- Email fallback
- no ads yet
- no real payment

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- whether broader public traffic should wait for scheduled cleanup implementation or only explicit re-approval
- whether future production promotions should standardize on `main` only or keep an approved-commit path

## 2026-05-21 Production 24–48h Monitoring Checkpoint v0

### Task Completed

- Reviewed the first low-key production monitoring window after launch decision finalization.
- Verified route health, aggregate funnel metrics, latency/error metrics, privacy-safe event behavior, and retention status.
- Found no production issue requiring a fix.

### Production Health Status

- healthy

### Event / Privacy Status

- passed

### Retention Status

- no overdue retained rows found yet
- manual retention review should still be repeated within the accepted `24–48h` window

### Recommendation

- keep the launch low-key
- do not start ads or broader traffic yet
- run a focused retention cleanup review next

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- when broader public traffic should be reconsidered
- whether retention automation should be implemented before any scale-up

## 2026-05-21 Production Retention Cleanup Review v0

### Task Completed

- Reviewed production retention coverage for `analysis_requests` and `analysis_results`.
- Verified overdue retained row counts and determined no manual cleanup was required yet.
- Re-ran a safe aggregate event/privacy scan and found no leakage.

### Overdue Row Status

- `analysis_requests`: `0`
- `analysis_results`: `0`

### Cleanup Action

- none required

### Event / Privacy Status

- passed

### Current Launch Status

- low-key production `GO` remains acceptable

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- whether future retention policy should extend explicit timestamps to additional related tables
- when scheduled cleanup should become mandatory before scale-up

## 2026-05-21 Module 01 UI Polish Backlog Consolidation v0

### Task Completed

- Consolidated the Module 01 UI polish backlog into a single prioritized planning artifact.
- Preserved stable reference copies of `STAGING_AUDIT_v1.1.md` and `FONT_MIGRATION_v1.1.md` under `docs/design-system/reference/ui-polish-v1.1/`.
- Recommended the first implementation handoff based on current production-safe scope.

### Backlog Path

- `ai-collaboration/research/2026-05-21-module-01-ui-polish-backlog-consolidation-v0.md`

### Source Files Reviewed

- `docs/design-system/reference/ui-polish-v1.1/STAGING_AUDIT_v1.1.md`
- `docs/design-system/reference/ui-polish-v1.1/FONT_MIGRATION_v1.1.md`

### First Recommended Implementation

- `Brand Mark Selective UI Rollout v0`

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- whether font migration Phase 1 should come immediately after the brand-rollout pass
- whether share/persona should use mini lockup first or a stronger stamp treatment

## 2026-05-21 Brand Mark Selective UI Rollout v0

### Task Completed

- Added a selective `AnyuMark` lockup mode to `Wordmark` and applied it to the landing header, result header, and share/persona surface.
- Replaced the loading moon/dots ornament with animated `AnyuMark`.
- Removed the orphan purple orb/share dot and aligned temperature/signal bars to the v1.1 audit direction.
- Added rollout-focused render/CSS guard tests.

### Review Bundle

- `ai-collaboration/research/2026-05-21-brand-mark-selective-ui-rollout-v0-review-bundle.md`

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- whether the selective mark rollout should expand further before any font migration work
- whether the next polish pass should target staging QA or conversion/paywall rhythm first

## 2026-05-21 Brand Mark Selective UI Staging QA v0

### Task Completed

- Verified staging deployment freshness for the selective AnyuMark rollout.
- Checked live landing, demo result, runtime result, unlock intent, and public icon assets on staging.
- Confirmed the selective brand-mark rollout is staging-healthy and did not require a tiny fix.

### QA Result Summary

- landing header: passed
- result header: passed
- loading state: passed with source/bundle verification limitation
- temperature/share/signal/icon checks: passed
- funnel regression: passed

### Fixes Applied

- none

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- exact human viewport feel of the loading ornament and selective lockup still benefits from a true browser/device pass
- whether the next step should be human funnel QA before any broader polish work

## 2026-05-21 Font Migration Phase 1: Latin Display v0

### Task Completed

- Loaded Instrument Serif in the production app layout.
- Updated canonical and app Latin display tokens from Cormorant Garamond to Instrument Serif.
- Removed active Cormorant references from current source-of-truth token/docs paths and added guard tests.

### Font Migration Phase

- Phase 1 only: Latin display
- deferred: Newsreader and LXGW WenKai

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed
- staging route checks for landing/demo result returned `200`

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- exact real-browser/mobile rendering feel of Instrument Serif on wordmark and large numerals
- whether the next step should be dedicated staging QA before any later font phase

## 2026-05-21 - Font Migration Phase 1 Staging QA v0

### Completed Changes

- completed a focused staging QA pass for the Instrument Serif Phase 1 Latin display migration
- verified `staging.anyu.tw` is serving `7bb4e91` or newer
- confirmed live staging landing, demo result, and runtime result HTML load `Instrument Serif`
- confirmed no active `Cormorant` references remain in current app/source-of-truth paths
- verified one synthetic staging analyze, runtime result load, and unlock intent still work

### Learnings

- the Phase 1 font swap is live on the intended landing/result surfaces without any obvious protected-staging regression
- the current QA method can confirm font loading and structural health from protected HTML and bundle inspection, but exact rendering feel still benefits from a true browser/device pass
- later typography work should remain separate from this Phase 1 verification because Newsreader and LXGW WenKai are still intentionally deferred

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed
- staging route checks for landing, demo result, and one runtime result returned healthy responses

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- exact real-browser/mobile rendering feel of Instrument Serif on wordmark and large numerals
- whether the next step should be human browser/device funnel QA before any later typography phase

## 2026-05-21 - Conversion / CTA Rhythm Polish v0

### Completed Changes

- added an inline result-page next-step CTA that reuses the existing unlock/contact flow
- made the share action more social/button-like with clearer support copy
- clarified the paid preview hierarchy with softer locked-state treatment and clearer one-time/no-subscription cues
- compressed the LINE panel by removing repeated configured-LINE explanatory copy while keeping the same flow
- added focused render/event tests for the new CTA rhythm and metadata source path

### Learnings

- the result page can expose the next useful action earlier without turning into a hard-sell/paywall pattern
- reusing the existing `paid_unlock_clicked` event with a safe `source` field is cleaner than creating a new event name for this pass
- reducing repeated LINE explanation improves clarity without changing legal semantics or backend behavior
- the repo had an existing Vitest include gap that excluded `.test.tsx` render tests until this pass corrected it

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed
- live staging demo-result smoke passed after push

### Commit / Push

- commit: `06f7d2a`
- staging push: `pushed to origin/staging`

### Unresolved Questions

- exact human perception of the new CTA rhythm and share emphasis on a real phone viewport
- whether the next step should be a dedicated staging QA pass before any broader conversion/paywall polish

## 2026-05-21 - Conversion CTA Rhythm Staging QA v0

### Completed Changes

- completed a focused staging QA pass for the conversion/CTA rhythm polish work
- verified staging is serving `df99f26` or newer
- confirmed the new inline CTA, updated share copy, revised paid-preview hierarchy, and compressed LINE panel copy are live
- ran one synthetic runtime funnel covering analyze, result load, unlock intent, and Email fallback

### Learnings

- the new inline CTA appears late enough in the result flow to feel like a next-step prompt rather than a hard interruption
- the share action still reads secondary while the paid/LINE path stays clearer
- safe implementation verification of unlock-event `source` is strong from source/bundle/live route behavior, even though direct DB-row confirmation was not done in this pass

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed
- synthetic staging analyze, runtime result load, unlock intent, and Email fallback all passed

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- exact human perception of the inline CTA rhythm and scroll landing on a real phone viewport
- whether direct persisted-event verification should be done later in a DB-accessible QA pass

## 2026-05-21 - Font Migration Phase 2: Editorial Reading v0

### Completed Changes

- loaded `Newsreader` in the app layout alongside the existing `Instrument Serif` loader
- added `--anyu-font-reading` plus `.t-reading` and `.t-reading-lg` to canonical and app token files
- applied editorial reading typography only to selected long-form result surfaces: insight, reassurance, and paid-preview sample reply
- updated active design-system/app docs and added guard tests to keep the reading font scoped

### Learnings

- the result flow has a small set of genuinely long-form editorial surfaces that can take a reading serif without widening into a global typography change
- Phase 2 stays low-risk when it is tokenized and enforced through render tests that explicitly exclude CTA/share/subtle-note surfaces
- adding Newsreader to the existing layout loader is enough for this phase; there was no need to introduce local font packaging or Phase 3 work

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed
- route smoke for landing/demo result was not run in this shell session

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- exact real-browser/mobile rendering feel of Newsreader on insight/reassurance and the paid-preview sample reply
- whether the next step should be a narrow staging QA pass before any later typography phase

## 2026-05-21 - Font Migration Phase 2 Staging QA v0

### Completed Changes

- completed a focused staging QA pass for the Newsreader editorial-reading rollout
- verified staging is serving `d8bef11` or newer
- confirmed `Newsreader` loads on landing, demo result, and one runtime result surface alongside `Instrument Serif`
- confirmed `.t-reading` remains scoped to insight, reassurance, and the paid-preview sample reply
- ran one synthetic runtime funnel covering analyze, result load, unlock intent, and Email fallback

### Learnings

- the Phase 2 rollout stays visually narrow because the reading font appears only on the long-form result surfaces that already behave like editorial copy
- locked paid-preview cards, CTA/buttons, and surrounding UI remain structurally separate from the reading treatment
- protected staging HTML plus source verification is enough to establish scope correctness, but not final human judgment on exact mobile rendering feel

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed
- live staging landing, demo result, runtime result, unlock intent, and Email fallback checks passed

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- exact human perception of Newsreader on a real phone viewport
- whether a later true browser/device pass finds any subjective FOUT or weight issue

## 2026-05-21 - Font Migration Phase 3: Kai Quote v0

### Completed Changes

- loaded `LXGW WenKai` in the app layout alongside the existing `Instrument Serif` and `Newsreader` loaders
- added `--anyu-font-kai` plus `.t-kai` and `.t-kai-quote` to canonical and app token files
- updated `.t-quote` to use the kai token without forced italic
- applied kai typography only to the result hook quote and the share/persona quote
- updated active design-system/app docs and added render-test guardrails for the narrow quote scope

### Learnings

- the quote surfaces can take a more handwritten/private tone without disturbing the broader result reading rhythm when kept to very short copy only
- Phase 3 remains low-risk when it reuses token utilities and removes conflicting local serif/italic declarations
- the right separation now is clear: `Instrument Serif` for Latin display, `Newsreader` for long-form reading, and `LXGW WenKai` for short whisper-like quote surfaces

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed
- route smoke for landing/demo result was not run in this shell session

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- exact real-browser/mobile rendering feel of `LXGW WenKai` on the lead quote and share quote
- whether the next step should be a narrow staging QA pass before shifting back to technical UX work

## 2026-05-21 - Font Migration Phase 3 Staging QA v0

### Completed Changes

- completed a focused staging QA pass for the LXGW WenKai kai-quote rollout
- verified staging is serving `3d7aa7d` or newer
- confirmed the external `LXGW WenKai` stylesheet loads on landing, demo result, and one runtime result surface
- confirmed kai remains scoped to the result hook quote and share-card quote, while `t-reading` remains on the long-form paragraphs
- ran one synthetic runtime funnel covering analyze, result load, unlock intent, and Email fallback

### Learnings

- the kai treatment remains visually narrow because it is confined to short quote surfaces and does not interfere with the long-form Newsreader rhythm
- the three-way font split is now structurally clear in the app: display, reading, and whisper/quote each stay in their own lane
- protected staging HTML plus source verification is enough to establish scope correctness, but not final human judgment on exact quote feel on real devices

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed
- live staging landing, demo result, runtime result, unlock intent, and Email fallback checks passed

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- exact human perception of LXGW WenKai on a real phone viewport
- whether a later true browser/device pass finds any subjective decorative or FOUT issue

## 2026-05-21 - Claude Patch Reconciliation + Final UI Finishing Plan v0

### Completed Changes

- reconciled the latest Claude Design polish direction against the current implemented ANYU UI state
- reviewed the preserved staging audit and font migration references together with the consolidated UI backlog
- documented the moon-versus-AnyuMark decision explicitly so the next pass does not regress brand direction
- produced a narrow final UI finishing plan with adopt/adapt/defer/reject classifications

### Learnings

- the current app has already completed most of the original audit’s structural/system work, so the remaining pass should be a finishing pass rather than another broad redesign
- “restore moon icons” is best treated as a request for stronger spiritual/brand accent, not literal icon restoration
- the final open UI work is now mostly about tone, hierarchy, spacing, and card finishing, not typography or brand-foundation changes

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- whether the share/persona card should get only subtle background layering or a very light stamp-like accent in the final pass
- exact screenshot-level judgment will still depend on the future post-implementation review pass

## 2026-05-21 - Final UI Finishing Pass v0

### Completed Changes

- completed the final narrow Module 01 UI finishing pass from the reconciliation plan
- softened the landing disabled CTA treatment and lowered the visual weight of the privacy helper
- added a subtle inline de-identification reminder above the landing submit CTA
- made the result quote card warmer and more intentional, added the approved insight soft-ending line, and softened the inline next-step CTA card
- normalized key landing/result/share labels onto reusable tokenized mono-label helper classes
- added subtle share/persona layer polish and a light locked B/C preview refinement
- updated render/token tests and kept canonical/app token files in sync

### Learnings

- the remaining open polish work was mostly about tone and rhythm, not structure; small surface changes were enough to move the UI closer to the final desired mood
- tokenized label helpers are cleaner than scattering small label-tone overrides across components
- the AnyuMark direction still holds without needing any moon restoration once the surrounding quote/card surfaces are tuned properly

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- exact screenshot-level judgment of the softened CTA, quote-card treatment, and share-card layering on a real phone viewport
- whether a future review wants any stronger share/persona accent or treats this pass as visually complete

## 2026-05-21 - Module 01 Final UI Screenshot Review Pack v0

### Completed Changes

- created the final Module 01 UI screenshot/review pack artifact
- confirmed staging landing and demo-result surfaces are serving the final finishing-pass UI markers
- ran one synthetic staging analyze, fetched the runtime result, verified unlock intent, and verified synthetic Email fallback
- verified staging legal routes and documented exact manual screenshot instructions because screenshot capture was unavailable in this session

### Learnings

- live staging HTML is enough to confirm the final finishing-pass markers, typography loaders, and major UI copy hierarchy even when screenshot tooling is unavailable
- the UI now appears materially aligned with the approved AnyuMark direction, the three font phases, and the final finishing plan
- the only major remaining review gap is subjective screenshot/device judgment, not structural implementation uncertainty

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- exact mobile screenshot feel of the softened CTA, loading state, and layered cards
- whether external design review will want any stronger share/persona emphasis once real screenshots are available

## 2026-05-21 - Local Playwright UI Smoke v0

### Completed Changes

- added a local-only Playwright smoke layer under `apps/web/e2e/`
- added local scripts for Playwright install, build, smoke run, UI mode, and chromium-only verification
- configured a local production-like Playwright server on `127.0.0.1:3001`
- added smoke coverage for landing/input guidance, demo result, inline CTA reveal, LINE-first / Email fallback flow, and legal routes
- documented the local smoke command in `apps/web/README.md` and noted the optional use in the production runbook

### Learnings

- the demo route is enough to protect the core polished UI funnel without introducing provider or DB dependencies into local browser tests
- same-tab LINE navigation is harder to verify than an anchor href, so a tiny testability-only attribute is useful without affecting UI behavior
- the existing repo-local `.playwright-browsers/` cache can be reused, but a new Playwright package revision may still require a matching Chromium install step

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed
- `corepack pnpm test:e2e:local` passed

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- whether future runtime analyze smoke should use a mock path or a safe local provider-backed path
- whether the LINE CTA should remain button-driven long term or eventually expose a directly inspectable link primitive

## 2026-05-21 - Result Cache + Idempotent Analyze v0

### Completed Changes

- added request-side analyze cache metadata to `analysis_requests`
- generated Drizzle migration `apps/web/drizzle/0001_wooden_king_cobra.sql`
- added normalized redacted-input cache hashing via `ANALYSIS_CACHE_HASH_SECRET`
- updated the analyze route to reuse an existing unexpired result before persisted limits or provider work
- added focused tests for cache hashing plus analyze-route cache hit/miss behavior
- documented the new env / production migration expectations in `apps/web/README.md` and `docs/operations/production-deployment-runbook.md`

### Learnings

- request-side cache metadata is enough for a narrow v0 retry/idempotency layer without introducing a separate cache table
- moving cache lookup ahead of persisted daily limits gives the expected “same result on retry” behavior without consuming extra analysis rows
- production should not silently fall back to a weak cache secret; disabling reuse is safer than pretending the cache is active

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- whether a future pass should add explicit concurrency control for simultaneous identical analyze requests
- when the new migration should be applied in the live production DB relative to other launch operations

## 2026-05-21 - Result Cache Migration + Live Verification v0

### Completed Changes

- added `ANALYSIS_CACHE_HASH_SECRET` to the staging preview branch env and production env
- applied the cache metadata migration live on Neon `preview` and `production`
- verified staging miss → hit behavior after a deployment refresh
- verified production miss → hit behavior after a fresh production code deploy of the cache-enabled app
- documented the deployment-refresh requirement for `ANALYSIS_CACHE_HASH_SECRET` in app/ops docs

### Learnings

- Vercel env-secret presence alone was not enough; the cache only became live after a fresh deployment
- production verification required the actual cache-enabled app code to be deployed, not just a redeploy of the older production snapshot
- the current v0 implementation behaves correctly once env, schema, and deployed code are aligned

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- no blocking uncertainty remains for live cache activation
- simultaneous identical misses still are not concurrency-locked by design

## 2026-05-21 - Scheduled Retention Cleanup v0

### Completed Changes

- added a secret-guarded scheduled cleanup route at `/api/cron/retention-cleanup`
- added runtime cleanup logic for expired `analysis_requests` and `analysis_results`
- added a daily Vercel cron schedule in `apps/web/vercel.json`
- updated app/ops docs and the final production launch decision to reflect scheduled cleanup coverage
- verified unauthorized and authorized dry-run behavior live on preview and production

### Learnings

- the active Vercel plan rejected the intended 12-hour cron cadence, so the rollout had to settle on a valid daily schedule
- the current schema makes in-place scrubbing safer than hard deletion because result rows are still referenced downstream
- live cron verification is straightforward once the secret and fresh deployment are both in place

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- whether future retention policy should extend explicit timestamps and scheduled cleanup to `unlock_intents` and `contact_submissions`
- whether daily cadence remains sufficient if production volume grows beyond the current low-key launch

## 2026-05-21 - Repo Architecture + MVP Leftover Audit v0

### Completed Changes

- audited the current repo structure after low-key production launch, UI stabilization, local Playwright smoke, result cache rollout, and scheduled retention cleanup
- classified active production paths, historical evidence, legacy prototype areas, archive candidates, and security/privacy review areas
- created the audit report at `ai-collaboration/research/2026-05-21-repo-architecture-mvp-leftover-audit-v0.md`

### Learnings

- active production-critical code is now concentrated cleanly in `apps/web/`, but repo sprawl has shifted into collaboration history and retained prototype/research evidence
- there is no sign of committed live secrets, but committed raw sample text in `outputs/` deserves explicit human review before broader growth
- the next cleanup pass should focus on indexing and archive boundaries first, not deletion

### Validation Results

- audit/reporting task only; no runtime or schema change was made
- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- whether committed raw sample text under `outputs/` should remain in git
- whether `oradar/`, `scripts/`, and `experiments/ambiguous_temperature_v0/` should stay in the main repo root as active reference material or move toward a clearer archive boundary

## 2026-05-21 - Repo Cleanup Pass v0

### Completed Changes

- removed committed raw text fixtures from `outputs/raw/`, `outputs/product_eval/raw/`, and `outputs/product_samples/raw/`
- strengthened `.gitignore` so future raw fixtures, trace archives, blob reports, and `ai-collaboration/inbox/` stay untracked
- added `ai-collaboration/README.md` and `docs/operations/repo-maintenance.md`
- documented `oradar/` as mostly reusable extraction tooling plus one historical Python-side product runtime helper

### Learnings

- the highest-confidence repo cleanup win was privacy-risk reduction, not broad archival
- `oradar/` is not the Dcard crawler itself; the fetch/browser-calibration path mostly lives in `scripts/`
- generated and structured outputs can stay committed while raw text fixtures move back to local-only status

### Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- whether historical product-eval and sample-generation scripts should later get fresh private local fixtures outside git
- whether `oradar/product_runtime.py` should remain in place until a later extraction/archive pass

## 2026-05-21 - Oradar Topic Tool Extraction Plan v0

### Completed Changes

- inventoried all tracked `oradar/` source files and adjacent topic-related `scripts/`
- classified reusable ingestion/tooling pieces versus historical Python product runtime and legacy Dcard acquisition paths
- created the extraction plan at `ai-collaboration/research/2026-05-21-oradar-topic-tool-extraction-plan-v0.md`

### Learnings

- `oradar/` itself is not the Dcard crawler layer; the blocked acquisition logic mainly lives in `scripts/`
- the strongest future extraction candidate is `scripts/external_dcard_json_calibration.py`, not the fetch/browser scripts
- Python is the most natural first extraction target because the reusable current logic is already Python and not app-runtime coupled

### Validation Results

- planning/inventory task only; no runtime, schema, or app behavior change was made
- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- whether future topic-ingestion should stay heuristic-first or include optional provider-assisted enrichment
- whether `oradar/product_runtime.py` should eventually be archived once historical Python product-eval usage is no longer needed

## 2026-05-21 - Extract Topic Ingestion Tools v0

### Completed Changes

- created `tools/topic-ingestion/` as a standalone local Python tool for JSONL normalization, topic extraction, and question-seed generation
- added `extract`, `questions`, and `pipeline` CLI commands plus synthetic examples and README usage docs
- added focused tests covering tolerant loaders, heuristic topic grouping, deterministic question generation, and end-to-end CLI output contracts

### Learnings

- the extracted tool works best as a source-agnostic downstream transformer, not as a crawler or acquisition layer
- internal Python dataclasses can stay snake_case while the public JSONL contract still exports the required camelCase fields
- a small dedicated `tools/` boundary is clearer than widening `oradar/` for this use case

### Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- whether a later pass should add module-idea seed generation once upstream sourcing stabilizes
- whether older topic-related scripts should eventually be archived after this extracted path becomes the preferred local workflow

## 2026-05-21 - Topic Ingestion Module Seed v0

### Completed Changes

- extended `tools/topic-ingestion/` with deterministic module-seed generation on top of topic candidates and question seeds
- added a `modules` CLI command plus optional `--modules-output` support for the existing `pipeline` command
- added synthetic module-seed examples and tests covering contract shape, defaults, and old pipeline compatibility

### Learnings

- the most natural v0 module-seed path is question-driven with optional topic enrichment, not topic-only generation
- the extracted tool can now complete a full local ideation loop without needing any provider or crawler dependency
- keeping the public JSONL contract in camelCase avoids downstream ambiguity while internal Python code stays simple

### Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- whether a later pass should add a separate module-seed review/ranking pack for human ideation workflows
- whether non-relationship topics will need broader default `inputNeeded` / `outputSections` sets once sourcing expands

## 2026-05-21 - Topic Ingestion Trend Review Pack v0

### Completed Changes

- added a markdown-first trend review pack generator to `tools/topic-ingestion/`
- added a `review` CLI command plus optional `--review-output` support in `pipeline`
- added a synthetic markdown review example and tests for ranking, action labels, markdown generation, and pipeline compatibility

### Learnings

- the first useful human-review layer works well as Markdown rather than another structured schema
- module seeds alone are enough to render a review pack, but topic/question context improves theme and rationale sections
- heuristic review output is most useful as decision scaffolding, not as a hidden strategy engine

### Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- whether a later pass should emit a compact JSON review summary in addition to Markdown
- whether broader non-relationship topics will need different default risk/review-question heuristics

## 2026-05-21 - Topic Ingestion Real Input Calibration v0

### Completed Changes

- calibrated `tools/topic-ingestion/` toward the described real-world PTT/forum JSONL shape without committing any raw input
- added source weighting, wider relationship-forum topic buckets, deterministic risk flags, and safer review ranking behavior
- added helper modules for normalization and risk handling plus synthetic tests for PTT-like records and toxic-discourse cases

### Learnings

- the current tool benefits from explicit source weighting because Dcard-like and PTT-like signals should not rank equally by default
- PTT-style inputs need comment-aware normalization and title cleanup more than new ingestion architecture
- risk flags are enough for a useful v0 brand-safety guard without needing provider moderation or hidden filtering

### Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- a true private-batch dry run is still needed because no raw calibration JSONL file was present in the accessible local paths for this session
- first-match topic routing may need widening if real PTT batches frequently contain overlapping themes in one record

## 2026-05-21 - Topic Ingestion Private Batch Dry Run v0

### Completed Changes

- confirmed the private batch input exists at `.local/topic-ingestion/private-batch/input.jsonl`
- added `.local/` to `.gitignore` and ran the full local topic-ingestion pipeline under `.local/`
- recorded a sanitized dry-run report with aggregate counts, source mix, top topic buckets, risk-flag counts, and extractor observations

### Learnings

- the dry run is structurally useful, but the current calibrated extractor still leaves too much volume in `uncategorized`
- Dcard/PTT/Mobile01 weighting works, but Mobile01 still has meaningful influence when batch volume is high
- risk surfacing is useful and the build/watch/defer distribution now feels conservative enough for human review

### Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- whether Mobile01 should be penalized more aggressively in review ranking
- whether the next refinement should focus on bucket coverage or on relaxing score saturation first

## 2026-05-21 - Topic Ingestion Heuristic Refinement v0

### Completed Changes

- refined `tools/topic-ingestion/` buckets, scoring, Mobile01 handling, risk action rules, and brand-safe templates based on the first private dry-run report
- added synthetic tests for new bucket coverage, Dcard/Mobile01 score separation, Mobile01 action behavior, score distribution, and brand-safe reframing
- reran the private batch locally under `.local/` and recorded only sanitized aggregate deltas in the review bundle

### Learnings

- uncategorized evidence dropped from 24 to 12 after adding targeted buckets, but it is still not negligible
- score saturation improved: the private rerun had a 0.53 to 0.87 score range and 15 unique scores
- Mobile01 and risk penalties now make the private review output much more conservative, producing 0 build / 8 watch / 8 defer

### Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- whether the zero-build result is the right level of conservatism for a risk-heavy private batch
- whether remaining uncategorized records should get another bucket pass or stay as broad review-only signals

## 2026-05-21 - Module Seed Concept Development v0

### Completed Changes

- saved the Module Seed Concept Development v0 handoff into `ai-collaboration/handoffs/`
- developed the selected `Commitment Pressure Check` seed into the `答案壓力計` concept brief
- documented target user, emotional JTBD, product promise, result structure, possible axes, fake-door direction, safety notes, Module 01 relationship, validation plan, and next step

### Learnings

- `答案壓力計` is a stronger Module 02 candidate than social-signal or boundary concepts because it is emotionally distinct from Module 01 while staying in ANYU's warm relationship-insight lane
- the concept should remain reflection-oriented and avoid commitment, therapy, marriage-counseling, or stay/leave decision authority
- a new prompt/schema plan should be created before implementation rather than adapting Module 01 schema silently

### Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed, 25 tests
- `corepack pnpm lint` passed
- `corepack pnpm test` passed, 21 files / 74 tests
- `corepack pnpm build` passed

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- whether `答案壓力計` should remain the public name or be softened before first user-facing test
- whether the first module scope should include established relationships or focus only on ambiguous/situationship pressure
- how much safety/coercion guardrail copy should appear in the user-facing result without making the module clinical

## 2026-05-21 - Analyze Request State + Polling UX v0

### Completed Changes

- saved the Analyze Request State + Polling UX v0 handoff into `ai-collaboration/handoffs/`
- added request-state fields and migration for `analysis_requests`
- updated the analyze route to record request phases, completion, and failure state
- added a privacy-safe request status endpoint at `/api/modules/[moduleSlug]/analyze/requests/[requestId]`
- updated the Module 01 client flow to support safe recovery metadata and future processing/poll responses without storing raw input
- updated docs and runbook with request-state behavior and migration requirements

### Learnings

- the current app can support honest request-state recovery metadata, but not true async provider execution without a new worker/queue architecture
- cache hits remain the strongest immediate resilience path because they skip duplicate provider calls and duplicate request/result rows
- request status metadata must stay narrow: request/result IDs, status/phase, elapsed time, retryability, and safe error categories only

### Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed, 25 tests
- `corepack pnpm lint` passed
- `corepack pnpm test` passed, 22 files / 79 tests
- `corepack pnpm build` passed
- `corepack pnpm test:e2e:local` passed, 9 tests

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- whether a future worker/queue is worth the complexity if provider latency remains around 25-30 seconds
- whether internal QA needs a visible request-status inspection surface or API-only status is sufficient

## 2026-05-21 - Analyze Request State Migration + Live Verification v0

### Completed Changes

- saved the Analyze Request State Migration + Live Verification v0 handoff into `ai-collaboration/handoffs/`
- applied `0002_analyze_request_state.sql` to the Neon staging/preview branch
- verified staging request-state schema, fresh analyze completion, poll endpoint, cache hit, result page, unlock intent, Email fallback, and event metadata privacy
- applied `0002_analyze_request_state.sql` to the Neon production branch
- verified production request-state schema
- stopped production smoke before analyze because the live production app does not yet serve the request-state poll endpoint

### Learnings

- staging is fully migrated and request-state behavior is working end to end
- production DB is migrated, but production app freshness is not aligned with commit `1d9700d`
- future live-verification handoffs should check live app route/version freshness before applying production DB migrations

### Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed, 25 tests
- `corepack pnpm lint` passed
- `corepack pnpm test` passed, 22 files / 79 tests
- `corepack pnpm build` passed
- local Playwright not rerun because this task changed no UI code

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- which deployment or commit currently backs `https://anyu.tw`
- whether production should be refreshed from `origin/staging` or another approved production commit path before rerunning production request-state smoke

## 2026-05-21 - Production App Refresh + Request-State Smoke v0

### Completed Changes

- saved the Production App Refresh + Request-State Smoke v0 handoff into `ai-collaboration/handoffs/`
- deployed current repo HEAD `9433a01` to Vercel production for project `anyu-next`
- confirmed `https://anyu.tw` now serves the request-state poll route instead of generic app 404
- ran one synthetic production analyze and verified completed request state
- verified poll endpoint completed response, same-input cache hit, result page, unlock intent, LINE panel, Email fallback, and event metadata privacy

### Learnings

- production app freshness is now aligned with request-state DB migration
- the poll route freshness check is a useful pre-analyze guard for future production smoke tasks
- an app-exposed version/commit marker would make future deployment freshness checks less indirect

### Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed, 25 tests
- `corepack pnpm lint` passed
- `corepack pnpm test` passed, 22 files / 79 tests
- `corepack pnpm build` passed
- local Playwright not rerun because no app code changed; production browser-level smoke covered the affected funnel path

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- whether an app version/commit health marker should be added in a future ops-hardening task

## 2026-05-21 - Production Low-Key Monitoring Follow-up v1

### Completed Changes

- saved the Production Low-Key Monitoring Follow-up v1 handoff into `ai-collaboration/handoffs/`
- checked production route health after the request-state production refresh
- reviewed aggregate analyze/request-state/cache/latency/funnel/privacy/abuse indicators for the post-refresh window
- checked retention cleanup route authorization behavior and direct overdue DB counts
- documented findings in the production monitoring report and execution report

### Learnings

- production remains healthy in the post-refresh window
- request-state and cache behavior are working together: one fresh request and one cache hit, with no failed/stuck requests
- retention overdue counts are zero, but authorized dry-run verification needs an operator context with a usable cleanup secret
- provider latency remains the main perceived-wait risk in synchronous v0

### Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed, 25 tests
- `corepack pnpm lint` passed
- `corepack pnpm test` passed, 22 files / 79 tests
- `corepack pnpm build` passed
- local Playwright not run because no app code changed

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- whether the next scheduled cron run has executed after the production refresh
- whether an app version/commit health marker should be added for future freshness checks

## 2026-05-21 - LINE Fulfillment Automation Architecture v0

### Completed Changes

- saved the LINE Fulfillment Automation Architecture v0 handoff into `ai-collaboration/handoffs/`
- reviewed the current Module 01 unlock/contact flow, current `unlock_intents` shape, event boundaries, legal/UI notices, and existing LINE funnel/OA documentation
- created the architecture report at `ai-collaboration/research/2026-05-21-line-fulfillment-automation-architecture-v0.md`
- created the execution report at `ai-collaboration/reports/2026-05-21-line-fulfillment-automation-architecture-v0-execution-report.md`

### Learnings

- current LINE-first capture is notification-oriented; it records unlock intent and sends users to the LINE add URL but cannot bind a LINE user to a result or deliver an unlocked link
- the recommended MVP is a dual path: LIFF for mobile-primary automatic binding and short-code matching through LINE OA for desktop/fallback
- extending `unlock_intents` is the simplest v0 data model because it already owns the result/module/session context for one fulfillment lifecycle
- unlocked content should use already persisted result data in v0; adding new paid-result generation needs a separate prompt/schema decision

### Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed, 25 tests
- `corepack pnpm lint` passed
- `corepack pnpm test` passed, 22 files / 79 tests
- `corepack pnpm build` passed
- local Playwright not run because no app code changed

### Commit / Push

- commit: pending at summary-update time
- staging push: pending at summary-update time

### Unresolved Questions

- exact LINE channel / LIFF scope behavior must be verified with the current OA setup
- product must confirm whether existing normalized result data is sufficient for a credible complete-analysis page
- final expiration windows for short codes and unlocked tokens need product/security approval

## 2026-05-21 - LINE Fulfillment Setup Record Templates v0

### Completed Changes

- saved the LINE Fulfillment Setup Record Templates v0 handoff into `ai-collaboration/handoffs/`
- created staging/test LINE OA setup template at `ai-collaboration/research/line/line-oa-staging-setup.md`
- created production LINE OA setup template at `ai-collaboration/research/line/line-oa-production-setup.md`
- created LINE fulfillment env matrix at `ai-collaboration/research/line/line-fulfillment-env-matrix.md`
- created execution report at `ai-collaboration/reports/2026-05-21-line-fulfillment-setup-record-templates-v0-execution-report.md`

### Learnings

- staging/test LINE OA and production LINE OA need separate records to prevent cross-environment fulfillment mistakes
- the env matrix should be the source-of-truth template for future implementation and ops review
- secret fields should remain status-only in repo docs; actual values belong only in Vercel/LINE consoles

### Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed, 25 tests
- `corepack pnpm lint` passed
- `corepack pnpm test` passed, 22 files / 79 tests
- `corepack pnpm build` passed
- local Playwright not run because no app code changed

### Commit / Push

- commit: pending at summary-update time
- staging push: pending at summary-update time

### Unresolved Questions

- actual staging/test OA and production OA setup values remain pending until an operator fills them from LINE/Vercel consoles

## 2026-05-21 - LINE Fulfillment Automation MVP v0

### Completed Changes

- saved the LINE Fulfillment Automation MVP v0 handoff into `ai-collaboration/handoffs/`
- extended `unlock_intents` with LINE fulfillment migration/schema fields
- added fulfillment helpers for code generation, token generation, hashing, expiry, LIFF URL building, and LINE signature verification
- updated `/api/unlock-intent` to return fulfillment code/token, LIFF URL, add-friend URL, and expiry
- added LIFF bind API, LINE webhook API, LIFF bridge page, and unlocked result route
- updated the result contact panel to fulfillment-oriented LINE copy with short-code fallback
- updated setup docs, app README, production runbook, tests, and Playwright expectations
- created review bundle at `ai-collaboration/research/2026-05-21-line-fulfillment-automation-mvp-v0-review-bundle.md`
- created execution report at `ai-collaboration/reports/2026-05-21-line-fulfillment-automation-mvp-v0-execution-report.md`

### Learnings

- short-code webhook delivery needs access to the unlock token after code matching, so the MVP stores the high-entropy token plus token hash
- LIFF path can be implemented as a bridge page that redirects to the canonical unlocked route and leaves result rendering outside LIFF
- staging and production LINE smoke require deploy + migration first; local validation can verify code paths but not live LINE console behavior

### Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed, 25 tests
- `corepack pnpm lint` passed
- `corepack pnpm test` passed, 23 files / 85 tests
- `corepack pnpm build` passed
- `corepack pnpm test:e2e:local` passed, 9 Playwright tests

### Staging Smoke

- not run; requires staging deploy and `0003_line_fulfillment.sql` migration first

### Production Smoke

- not run; requires explicit production deployment/migration approval after staging smoke passes

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- whether current LINE LIFF setup should support server-side ID token verification in the next hardening pass
- whether staging webhook verification passes after deploy
- whether production promotion should wait for another review after staging smoke

## 2026-05-21 - LINE Fulfillment Staging Deploy + Smoke v0

### Completed Changes

- saved the LINE Fulfillment Staging Deploy + Smoke v0 handoff into `ai-collaboration/handoffs/`
- applied `apps/web/drizzle/0003_line_fulfillment.sql` to the staging/preview Neon branch `br-fragrant-union-aoh4udf1`
- verified new `unlock_intents` fulfillment columns and indexes on staging
- verified staging serves new LINE fulfillment routes
- ran synthetic staging analyze, unlock intent, unlocked route, LIFF bind API, webhook invalid-signature, and event/privacy checks
- updated staging LINE setup docs and env matrix to reflect live public-env mismatch
- created review bundle at `ai-collaboration/research/2026-05-21-line-fulfillment-staging-deploy-smoke-v0-review-bundle.md`
- created execution report at `ai-collaboration/reports/2026-05-21-line-fulfillment-staging-deploy-smoke-v0-execution-report.md`

### Learnings

- staging migration succeeded and the core fulfillment backend paths work on the preview DB
- staging currently returns `liffUrl: null` from unlock intent and emits the old production OA add-friend URL, so Preview public LINE env is mismatched or stale
- route freshness proves the implementation is live, but Vercel CLI is unavailable in this shell for exact deployment commit/env inspection
- real test OA short-code smoke should wait until public staging LINE env is corrected and redeployed

### Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed, 25 tests
- `corepack pnpm lint` passed
- `corepack pnpm test` passed, 23 files / 85 tests
- `corepack pnpm build` passed
- `corepack pnpm test:e2e:local` passed, 9 Playwright tests

### Staging Smoke

- partial pass
- migration passed
- analyze/unlock/unlocked route/LIFF bind/webhook invalid-signature/event privacy checks passed
- blocked for real test OA smoke by public LINE env mismatch

### Production Smoke

- not run; production deploy and migration were explicitly out of scope

### Commit / Push

- commit: pending at summary-write time
- staging push: pending at summary-write time

### Unresolved Questions

- whether Vercel Preview env values are incorrect or only missing from the current deployment build
- whether LINE console webhook verification passes after env correction
- whether real test OA short-code reply succeeds after public env correction and redeploy

## 2026-05-21 - LINE Public Env Sync v0

### Completed Changes

- saved the LINE Public Env Sync v0 handoff into `ai-collaboration/handoffs/`
- read staging, production, and env-matrix LINE setup docs
- set Vercel Preview `(staging)` public LINE env values for staging LIFF and test OA
- set Vercel Production public LINE env values for production LIFF and real OA
- triggered a fresh staging rebuild via docs-only push `72d601e`
- verified staging `/api/unlock-intent` now returns a non-null staging LIFF URL and test OA add-friend URL
- updated staging setup docs and env matrix to mark Preview/Staging public LINE env live-verified
- created execution report at `ai-collaboration/reports/2026-05-21-line-public-env-sync-v0-execution-report.md`

### Learnings

- Preview/Staging needed branch-scoped `Preview (staging)` public env overrides, not the stale broad Preview value
- staging now emits `https://liff.line.me/2010157793-Q4JeeYv0` and `https://lin.ee/5uL4e9q` from unlock intent
- production public env values are set, but production still needs a fresh deployment before those `NEXT_PUBLIC_*` values are live

### Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed, 25 tests
- `corepack pnpm lint` passed
- `corepack pnpm test` passed, 23 files / 85 tests
- `corepack pnpm build` passed

### Staging Redeploy

- triggered via docs-only staging branch push `72d601e`
- live staging env verification passed after redeploy

### Production Redeploy

- not run; pending explicit approval

### Commit / Push

- commit: pending at summary-update time
- staging push: pending at summary-update time

### Unresolved Questions

- whether production deployment should be refreshed before or after the next real test-OA short-code staging smoke
- whether LINE console webhook verification now passes with corrected staging public env

## 2026-05-21 - LINE Fulfillment Real Staging Test OA Smoke v0

### Completed Changes

- saved the LINE Fulfillment Real Staging Test OA Smoke v0 handoff into `ai-collaboration/handoffs/`
- verified staging `/api/unlock-intent` returns the staging LIFF URL and test OA add-friend URL
- verified staging DB has the LINE fulfillment migration columns and indexes
- created a synthetic staging result/unlock intent and verified valid/invalid unlocked routes
- verified LIFF page load, invalid bind rejection, valid synthetic LIFF bind, and invalid webhook signature rejection
- verified staging event metadata excludes raw input, LINE user ID, code, token, email, message text, provider output, and server secrets
- updated the staging LINE setup record with route-level smoke status
- created review bundle at `ai-collaboration/research/2026-05-21-line-fulfillment-real-staging-test-oa-smoke-v0-review-bundle.md`
- created execution report at `ai-collaboration/reports/2026-05-21-line-fulfillment-real-staging-test-oa-smoke-v0-execution-report.md`

### Learnings

- staging public LINE env is now live and correctly points to LIFF `2010157793-Q4JeeYv0` and test OA add URL `https://lin.ee/5uL4e9q`
- LIFF bind can mark a staging unlock intent as delivered without leaking LINE user ID into events
- route-level webhook signature rejection works, but true bot reply smoke still requires LINE console webhook verification and a human LINE message

### Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed, 25 tests
- `corepack pnpm lint` passed
- `corepack pnpm test` passed, 23 files / 85 tests
- `corepack pnpm build` passed
- `corepack pnpm test:e2e:local` passed, 9 Playwright tests

### Staging Smoke

- route-level smoke passed
- real test OA short-code reply not run; pending LINE console webhook verification / human device smoke

### Production Smoke

- not run; production deploy, env changes, migration, and production OA messages were out of scope

### Commit / Push

- commit: pending at summary-update time
- staging push: pending at summary-update time

### Unresolved Questions

- whether LINE console webhook verification passes for the test OA
- whether the real test OA short-code reply succeeds after a human sends a fresh code through LINE

## 2026-05-21 - Record Staging LINE Fulfillment Manual Smoke v0

### Completed Changes

- saved the manual staging LINE fulfillment smoke recording handoff into `ai-collaboration/handoffs/`
- updated the real staging smoke review bundle with sanitized manual pass status
- updated the execution report with sanitized manual pass status
- updated the staging LINE setup record to mark webhook and short-code smoke working
- recorded that production was not touched

### Learnings

- staging/test OA webhook worked in the manual smoke
- user-pasted fulfillment short code triggered a bot reply with a complete-analysis unlocked URL
- opening the returned unlocked URL worked and showed correct unlocked content
- no real LINE user ID, code, token, tokenized URL, raw input, or private message content was recorded

### Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed, 25 tests
- `corepack pnpm lint` passed
- `corepack pnpm test` passed, 23 files / 85 tests
- `corepack pnpm build` passed

### Production Smoke

- not run; production remained untouched

### Commit / Push

- commit: pending at summary-update time
- staging push: pending at summary-update time

### Unresolved Questions

- none for the staging/test OA manual smoke record

## 2026-05-21 - LIFF ID Token Verification + Webhook Hardening v0

### Completed Changes

- saved the LIFF ID Token Verification + Webhook Hardening v0 handoff into `ai-collaboration/handoffs/`
- changed LIFF bind to send and verify LINE ID tokens server-side instead of trusting client-provided user IDs
- added database-backed LINE webhook event dedupe
- added database-backed invalid short-code attempt rate guard
- strengthened event metadata guard for LINE identity, code, token, URL, raw text, provider output, and secret-like keys
- added `apps/web/drizzle/0004_line_webhook_hardening.sql`
- applied and verified the hardening tables on the staging Neon branch only
- updated LINE fulfillment docs and production runbook with the new migration/env requirements
- created review bundle at `ai-collaboration/research/2026-05-21-liff-id-token-webhook-hardening-v0-review-bundle.md`
- created execution report at `ai-collaboration/reports/2026-05-21-liff-id-token-webhook-hardening-v0-execution-report.md`

### Learnings

- LINE ID token verification can use optional `LINE_LOGIN_CHANNEL_ID` or derive the channel ID from the LIFF ID prefix
- webhook dedupe can use LINE `webhookEventId` when present and a hashed fallback key otherwise
- invalid-code rate guard can stay privacy-safe by storing hashed LINE user ID only

### Migration Status

- staging migration applied: yes
- production migration applied: no
- production migration required before production LINE fulfillment activation: `apps/web/drizzle/0004_line_webhook_hardening.sql`

### Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed, 25 tests
- `corepack pnpm lint` passed
- `corepack pnpm test` passed, 24 files / 94 tests
- `corepack pnpm build` passed
- `corepack pnpm test:e2e:local` passed, 9 Playwright tests

### Staging Verification Status

- staging DB migration verified
- staging invalid-signature webhook smoke passed
- new deployed route-level smoke pending staging deployment from this commit

### Commit / Push

- commit: pending at summary-update time
- staging push: pending at summary-update time

### Unresolved Questions

- whether staging LIFF runtime returns an ID token with the expected channel audience after deployment
- whether production should explicitly set `LINE_LOGIN_CHANNEL_ID` or rely on LIFF ID prefix derivation

## 2026-05-24 - LINE Fulfillment Hardening Staging Smoke v0

### Completed Changes

- saved the LINE Fulfillment Hardening Staging Smoke v0 handoff into `ai-collaboration/handoffs/`
- verified staging DB has `line_webhook_events` and `line_webhook_rate_limits` plus expected indexes
- verified staging public LINE env still returns staging LIFF ID and test OA add URL
- verified existing synthetic analyze/unlock/unlocked route flow still works
- verified hardened LIFF bind rejects client-only user ID and invalid ID token
- verified webhook invalid signature rejection on staging
- verified staging event metadata remains safe
- updated staging setup notes
- created review bundle at `ai-collaboration/research/2026-05-21-line-fulfillment-hardening-staging-smoke-v0-review-bundle.md`
- created execution report at `ai-collaboration/reports/2026-05-21-line-fulfillment-hardening-staging-smoke-v0-execution-report.md`

### Staging Hardening Smoke Status

- route-level smoke passed
- exact commit marker not exposed; freshness verified by hardened LIFF bind behavior

### Migration Status

- staging migration `0004` objects verified
- production migration not run

### LIFF Verification Status

- client-only `liffUserId` rejected
- invalid `idToken` rejected
- valid live ID token test pending manual LIFF in-app smoke

### Webhook Hardening Status

- invalid signature rejection passed
- duplicate/rate guard DB objects verified
- signed duplicate/rate guard live smoke not run because it requires server secret handling

### Manual Test OA Status

- not repeated in this pass; previous manual staging/test OA short-code smoke remains passed

### Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed, 25 tests
- `corepack pnpm lint` passed
- `corepack pnpm test` passed, 24 files / 94 tests
- `corepack pnpm build` passed
- `corepack pnpm test:e2e:local` passed, 9 Playwright tests

### Commit / Push

- commit: pending at summary-update time
- staging push: pending at summary-update time

### Unresolved Questions

- whether real staging LIFF in-app runtime returns and binds a valid ID token as expected
- whether production should explicitly configure `LINE_LOGIN_CHANNEL_ID`

## 2026-05-24 - Paid Result Value + Context Input Plan v0

### Completed Changes

- saved the Paid Result Value + Context Input Plan v0 handoff into `ai-collaboration/handoffs/`
- audited the current `paid_result` schema and unlocked page structure
- created paid result upgrade plan at `ai-collaboration/research/2026-05-21-paid-result-value-context-input-plan-v0.md`
- created execution report at `ai-collaboration/reports/2026-05-21-paid-result-value-context-input-plan-v0-execution-report.md`
- made no app code, prompt/schema, DB, UI, LINE fulfillment, model, provider, or production changes

### Learnings

- current unlocked result is structurally closer to a free-result extension than a paid-quality NT$49 package
- target paid result should include 7-9 sections, 6-9 copyable messages, 3 possible states, 3 signal deep dives, a 24/48-hour plan, and a summary card
- optional context chips should map into structured prompt variables and cache-key fields, not raw appended prompt text

### Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed, 25 tests
- `corepack pnpm lint` passed
- `corepack pnpm test` passed, 24 files / 94 tests
- `corepack pnpm build` passed

### Commit / Push

- commit: pending at summary-update time
- staging push: pending at summary-update time

### Unresolved Questions

- whether context chips should ship with the schema/prompt upgrade or immediately after it
- exact final paid-result length after staging value review

## 2026-05-24 - Paid Result Prompt Schema Upgrade v0

### Completed Changes

- saved the Paid Result Prompt Schema Upgrade v0 handoff into `ai-collaboration/handoffs/`
- implemented optional context chips for Module 01 landing/input flow
- added server-side allowlist validation for `relationshipStage`, `userGoal`, `primaryPain`, and `replyTone`
- passed context as structured prompt metadata and safe behavioral notes
- upgraded generated `paid_result` to v1 richer sections with possible states, signal deep dives, reply strategies, next-48-hour plan, avoid list, soft insight, and summary card
- bumped prompt version to `product_result_prompt_v0.3`, schema version to `product_result_schema_v1`, and analysis cache key version to `v2`
- included context dimensions in cache key hashing
- updated unlocked/result routes to render rich paid results while adapting legacy old-format results for display
- updated demo result, retention cleanup placeholder, and tests

### Learnings

- the existing JSON result storage can support the richer paid output without a DB schema migration
- legacy paid-result compatibility belongs in the display adapter, not the generation schema
- event metadata can safely track context adoption with booleans/counts only

### Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed, 25 tests
- `corepack pnpm lint` passed
- `corepack pnpm test` passed, 24 files / 97 tests
- `corepack pnpm build` passed
- `corepack pnpm test:e2e:local` passed, 9 Playwright tests

### Commit / Push

- commit: pending at summary-update time
- staging push: pending at summary-update time

### Unresolved Questions

- whether the first context chip set is too broad or should be simplified after staging review
- whether the unlocked page should add copy buttons for each paid reply message
- whether schema file resolution should become version-aware before adding another schema version

## 2026-05-25 - Paid Result Staging Value Review v0

### Completed Changes

- saved the Paid Result Staging Value Review v0 handoff into `ai-collaboration/handoffs/`
- ran staging synthetic value review for paid result v1
- fixed context allowlist mismatch so the handoff's recommended context values are accepted
- split `product_result_schema_v1.json` from the legacy v0 schema file and added version-aware schema resolution
- raised Anthropic output token budget for richer paid-result JSON
- refreshed staging preview deployment and reassigned `staging.anyu.tw`
- verified rich unlocked result structure, cache behavior, invalid unlock safety, paid preview copy, and event metadata privacy
- created review bundle and execution report

### Staging Value Review Summary

- paid result v1 is materially richer than the free result and includes the expected structured sections
- same text/context produced a cache hit on repeat; same text with different context produced a cache miss and a separate result
- event metadata stores context booleans/counts only and did not include raw context values or forbidden operational markers
- primary reviewed paid result was slightly below the rough 1,800+ character target
- one generated guardrail used a phrase from the prompt's forbidden substring list, so prompt/validator safety needs one more pass

### Opportunistic Cleanup Summary

- completed version-aware schema file resolution
- restored v0 schema file to legacy v0 and added v1 schema file
- updated paid preview copy to promise 3 next replies, 3 possible states, 48-hour strategy, and summary card
- aligned tests with the revised context chips and schema resolution

### Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed, 25 tests
- `corepack pnpm lint` passed
- `corepack pnpm test` passed, 24 files / 98 tests
- `corepack pnpm build` passed
- `corepack pnpm test:e2e:local` passed, 9 Playwright tests

### Commit / Push

- stabilization commit: `71026c0`, pushed to `origin/staging`
- final review commit: pending at summary-update time
- staging push: pending at summary-update time

### Unresolved Questions

- whether forbidden paid-result substrings should be enforced with semantic validation and provider retry
- whether to enforce a paid-result minimum length target in prompt only or runtime validation
- whether to add copy buttons for unlocked reply messages

## 2026-05-25 - Paid Result Prompt Safety / Value Refinement v0

### Completed Changes

- saved the Paid Result Prompt Safety / Value Refinement v0 handoff into `ai-collaboration/handoffs/`
- read the paid-result staging value review, execution report, schema-upgrade review bundle, and value/context plan
- refined paid-result prompt guidance to v0.4
- added product result schema v2 with required reply strategy `tone`, `possibleReaction`, and `followUpIfTheyReply`
- added runtime paid-result semantic validation for forbidden phrasing and minimum value depth
- updated Module 01 prompt/schema versions to `product_result_prompt_v0.4` and `product_result_schema_v2`
- updated demo/retention fixtures, unlocked route rendering, and tests
- refreshed staging and ran one synthetic-safe staging review
- created review bundle and execution report

### Safety / Value Refinement Summary

- forbidden paid-result substrings are now runtime-enforced for schema v2 outputs
- semantic validation checks section counts, copyable message count, concrete 48-hour plan, summary card, avoid list, soft insight, and aggregate paid-result text length
- staging synthetic result passed with 3 states, 3 signal dives, 3 reply strategies, 6 copyable messages, v2 fields present, 2,246 paid-result JSON chars, and no forbidden substring match
- repeat same input/context returned a cache hit under the new prompt/schema versions
- event metadata still excludes raw context values and paid result text

### Validation Results

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed, 25 tests
- `corepack pnpm lint` passed
- `corepack pnpm test` passed, 24 files / 104 tests
- `corepack pnpm build` passed
- `corepack pnpm test:e2e:local` passed, 9 Playwright tests

### Staging Review Status

- refreshed staging deployment and alias for implementation commit `d754dfb`
- staging synthetic review passed

### Commit / Push

- implementation commit: `d754dfb`, pushed to `origin/staging`
- final docs/report commit: pending at summary-update time
- staging push: pending at summary-update time

### Unresolved Questions

- whether semantic validation should retry once instead of failing safe
- whether ChatGPT wants one more paid-result tone sample before title hierarchy polish
## 2026-05-25 - Landing / Share Title Hierarchy Polish v0

Completed changes:
- Saved the landing/share title hierarchy polish handoff under `ai-collaboration/handoffs/`.
- Updated Module 01 so `曖昧溫度計` is the primary title and `他是真的忙，還是其實在冷掉？` is the subtitle.
- Preserved the previous helper sentence as module description copy and rendered it quieter on the landing hero.
- Updated share preview and route metadata/Open Graph copy to use the module-first hierarchy.
- Updated unit and Playwright smoke assertions for the new copy contract.

Learnings:
- The previous landing implementation split the emotional question on punctuation for display; the new shorter module title no longer needs that behavior.
- Share preview readability improves when the module identity appears before persona-specific copy.

Unresolved questions:
- Staging visual verification should be confirmed after the completed commit is deployed to staging.
## 2026-05-25 - Landing Context Chips + Hero Cleanup v0

Completed changes:
- Saved the landing context chips and hero cleanup handoff under `ai-collaboration/handoffs/`.
- Removed the redundant AI-forward hero support line from Module 01 landing.
- Reduced repeated `曖昧溫度計` in the hero area by removing the top-left module label and changing the eyebrow to `MODULE · 01`.
- Removed the visible top-level `情境` chip group while preserving the existing `situation` API fallback.
- Added a collapsible optional context section labeled `讓結果更貼近你（選填）`.
- Clarified reply-tone copy to `你想回給對方的語氣 · 可選` and replaced `直接但不逼` with `坦白但不施壓`.

Learnings:
- The textarea plus `最卡的點` carries the useful situational signal without needing a separate visible `情境` chip group.
- Keeping the hidden `situation` fallback avoids unnecessary analyze/cache/API contract churn.

Unresolved questions:
- Full validation passed; commit hash, staging push status, and staging route freshness to be recorded after completion.
## 2026-05-25 - Context Chips Default Expanded v0

Completed changes:
- Saved the context chips default-expanded handoff under `ai-collaboration/handoffs/`.
- Changed Module 01 optional context chips to render expanded by default.
- Kept the existing toggle so users can still collapse and reopen the section.
- Updated Playwright smoke expectations for default-visible context chips.

Learnings:
- The optional context section can remain visible without changing payload semantics or making any field required.

Unresolved questions:
- Validation passed; commit hash and staging push status to be recorded after completion.
## 2026-05-25 - LINE Fulfillment Production Activation v0

Completed changes:
- Saved the production activation handoff under `ai-collaboration/handoffs/`.
- Verified required Vercel Production LINE env names without printing server secret values.
- Verified production public LINE values for production LIFF and production OA.
- Applied production Neon migrations `0003_line_fulfillment.sql` and `0004_line_webhook_hardening.sql`.
- Deployed current approved app code to production and aliased it to `https://anyu.tw`.
- Ran synthetic production analyze, unlock intent, unlocked route, LIFF page, LIFF bind hardening, and webhook invalid-signature smoke checks.
- Updated production LINE setup docs and env matrix with sanitized activation status.

Learnings:
- Safe Vercel production env pull still returns an empty `DATABASE_URL`, so direct Neon production branch tooling remained necessary for migration verification/application.
- Production app/database fulfillment is activated, but real OA short-code smoke depends on LINE Console webhook verification and linked bot confirmation.

Unresolved questions:
- LINE Console production webhook verification / linked bot status.
- Real production OA short-code smoke with an operator-owned LINE account remains pending.
- Local validation passed; commit hash and staging push status to be recorded after completion.
## 2026-05-25 - LINE Webhook Verification Empty Events Fix v0

Completed changes:
- Saved the webhook verification fix handoff under `ai-collaboration/handoffs/`.
- Updated `/api/line/webhook` so LINE Console verification pings with `events: []` return HTTP 200 without requiring a signature.
- Preserved signature enforcement for non-empty webhook events.
- Added tests for empty verification ping, missing signature rejection, and invalid signature rejection.

Learnings:
- LINE Console verification can use an empty event batch, so it needs a safe no-op path distinct from real webhook deliveries.

Unresolved questions:
- Full validation passed.
- Commit `57a83b5` pushed to `origin/staging`.
- Production deployed as `dpl_3XzaJiw58oJs2DLLJ4o9QU2RCNHC`; empty-events verification returned 200 and non-empty invalid signature returned 401.
## 2026-05-25 - Analyze Timeout Diagnosis + Hotfix v0

Completed changes:
- Saved the analyze timeout diagnosis hotfix handoff under `ai-collaboration/handoffs/`.
- Diagnosed the analyze CTA timeout as a synchronous route duration/client timeout mismatch plus a brittle paidResult v2 semantic-validation false-fail.
- Added explicit analyze route `maxDuration = 90`.
- Increased client analyze timeout from 65s to 95s.
- Tightened paid-result prompt output from 1,800-2,800 characters to 1,200-1,800 characters and exactly 6 copyable messages.
- Relaxed broad semantic forbidden substrings while keeping unsafe/shaming/manipulative phrases blocked.
- Added tests covering route duration, client timeout, prompt concision, output budget guard, and semantic rejection behavior.
- Deployed staging and production; sanitized analyze smoke passed on both.

Learnings:
- The post-paidResult v2 analyze path can take 60-70s even when healthy, so a 65s client timeout was too low.
- Reducing Anthropic output budget to 3,072 tokens caused truncation/validation risk; v2 still needs 4,096 token headroom.
- Semantic validation should not hard-fail broad style terms because the model can produce safe text that still contains common words.

Unresolved questions:
- Analyze remains close to the synchronous request ceiling; async request-state/polling should be considered for reliability.
- Human review should confirm that the concise paid result still feels valuable enough.
- Commit hash and staging push status to be recorded after completion.
## 2026-05-26 - Two-tier Free/Paid Result + LINE Fulfillment Architecture v0

Completed changes:
- Saved the two-tier architecture handoff under `ai-collaboration/handoffs/`.
- Created a docs-only architecture plan for splitting initial free-result generation from deferred paid-result generation.
- Recommended Phase 1 beta flow: free result first, paid result generated after LINE bind / short-code match.
- Recommended first LINE friend free unlock: one complete analysis per verified LINE user.
- Documented future paywall insertion after free result and before paid generation.
- Documented future data/cache/fulfillment/payment implications without changing schema or code.

Learnings:
- Two-tier architecture is the cleanest path to reduce first-result latency and provider cost while preserving richer paid output.
- LINE should be treated as owned-channel acquisition/retention infrastructure, not only a delivery mechanism.
- Future implementation needs explicit paid generation state and pending delivery behavior before payment is added.
- Validation passed: compileall, topic-ingestion unit tests, web lint, web unit tests, and web build.

Unresolved questions:
- Whether first-free unlock is global per LINE user or per module.
- Whether Phase 1 paid generation should trigger immediately after LINE bind or after an explicit claim action.
- Whether schema should use nullable paid fields on `analysis_results` or a separate `analysis_paid_results` table.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-26 - Two-tier Free Analyze + Deferred Paid Generation v0 Implementation Plan

Completed changes:
- Saved the implementation-plan handoff under `ai-collaboration/handoffs/`.
- Inspected current DB schema, migrations, analyze route, result cache, runtime prompt path, unlock intent route, LIFF bind, LINE webhook, result page, and unlock page.
- Created a schema-aware implementation plan for free-first analyze and deferred paid generation.
- Recommended separate `analysis_paid_results` storage instead of nullable paid fields on `analysis_results`.
- Recommended adding `analysis_requests.user_context_json` so deferred paid generation can use the original context without a second user submission.
- Recommended Phase 1 additive schema/service seams before any behavior switch.

Learnings:
- Current `ProductResult` requires `paid_result`, and the free result page still reads paid-result content for reassurance, so a display adapter is required before free-only analyze can ship.
- Unlock page and LINE fulfillment assume paid content already exists, so pending paid-generation states must be added before deferred fulfillment.
- LINE webhook should not block on paid generation; a small idempotent background processor is needed for short-code flow.
- Validation passed: compileall, topic-ingestion unit tests, web lint, web unit tests, and web build.

Unresolved questions:
- Whether Vercel Cron/internal processing is acceptable for Phase 1/3 paid generation, or whether a queue should be required.
- Whether paid generation should trigger automatically after LINE bind or after explicit in-LIFF claim.
- Whether first-free unlock should be enabled with Phase 3 or deferred until after pending fulfillment is stable.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-26 - Two-tier Phase 1 Schema + Service Seams v0

Completed changes:
- Saved the Phase 1 schema/service-seams handoff under `ai-collaboration/handoffs/`.
- Added additive migration `apps/web/drizzle/0005_two_tier_phase_1.sql`.
- Added nullable `analysis_requests.user_context_json` for validated context chips.
- Added `analysis_paid_results` table and Drizzle schema relations for future paid-result lifecycle separation.
- Added paid-result repository helpers and free/paid result adapter helpers.
- Preserved current analyze/result/unlock/LINE behavior while adding best-effort shadow paid-result writes on fresh analyze.
- Added tests for migration/schema seams, adapters, context persistence, unchanged analyze response shape, and shadow writes.

Learnings:
- Phase 1 can be additive with no user-visible behavior switch.
- Fresh analyze now depends on the additive migration for `user_context_json` and `analysis_paid_results`, so live environments need migration verification before deployment.
- Cache-hit shadow backfill and paid-result retention cleanup should remain separate follow-up tasks.

Unresolved questions:
- Whether to add cache-hit shadow backfill after migration verification.
- Whether `analysis_paid_results` retention cleanup should ship before Phase 2 or before broader traffic.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-26 - Two-tier Phase 1 Migration Live Verification v0

Completed changes:
- Saved the migration live-verification handoff under `ai-collaboration/handoffs/`.
- Applied `0005_two_tier_phase_1.sql` to Neon staging/preview.
- Verified staging schema: `analysis_paid_results`, `analysis_requests.user_context_json`, and expected indexes exist.
- Ran staging analyze checks: cached analyze passed, but two fresh analyze attempts failed with `provider_error` before result persistence.
- Verified `user_context_json` persisted 4 allowlisted fields on failed fresh request records.
- Verified staging result/unlock/LIFF/webhook route-level regressions using an existing cached result.
- Skipped production migration because staging did not pass the fresh analyze/shadow-write gate.

Learnings:
- The additive staging migration is valid and context persistence works even when provider generation fails.
- Shadow paid-result verification needs a successful fresh analyze because cache hits intentionally do not backfill shadow rows.
- Production must not move to the Phase 1 runtime until production `0005` is applied, but production `0005` should wait until staging fresh analyze is healthy.

Unresolved questions:
- Root cause of staging fresh analyze `provider_error` failures.
- Whether live shadow writes succeed once fresh analyze succeeds.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-26 - Staging Analyze Provider Error Follow-up v0

Completed changes:
- Saved the follow-up handoff under `ai-collaboration/handoffs/`.
- Diagnosed the staging fresh analyze failure path across provider generation, paid-result v2 validation, request/result persistence, user context persistence, and shadow paid-result storage.
- Confirmed shadow paid-result writes are best-effort and cannot cause analyze failure.
- Added runtime classification so `PaidResultSemanticValidationError` is treated as output validation for guarded retry/fallback paths.
- Added sanitized internal `output_validation` failure categorization for future analyze request failures.
- Added tests for semantic-validation retry classification and sanitized failure categorization.
- Redeployed staging and verified fresh analyze now completes with a completed shadow `analysis_paid_results` row.

Learnings:
- The historical failed records only stored generic `provider_error` / `provider`, so their exact provider subcause was not recoverable after the fact.
- The final fresh staging analyze completed with 4 allowlisted user context fields persisted and a completed shadow paid-result row.
- Exact requested synthetic input had become a cache hit, so a near-identical synthetic variant was needed to verify fresh persistence.
- Validation passed: compileall, topic-ingestion unit tests, web lint, web unit tests, web build, and local Playwright smoke.

Unresolved questions:
- Production `0005` remains pending and was intentionally not applied.
- Production deploy remains pending until the production migration gate is approved.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-26 - Two-tier Phase 1 Production Migration + Smoke v0

Completed changes:
- Saved the production migration/smoke handoff under `ai-collaboration/handoffs/`.
- Verified production Phase 1 schema objects were missing, then applied `0005_two_tier_phase_1.sql` to Neon production.
- Verified production `analysis_requests.user_context_json`, `analysis_paid_results`, expected indexes, and constraints.
- Deployed production after migration.
- Diagnosed first production smoke failure as sanitized `output_validation`.
- Added one same-model retry for output-validation failures without changing prompt/schema/provider/model defaults.
- Redeployed production and verified final synthetic fresh analyze returned HTTP 200.
- Verified production user context persistence, shadow paid-result creation, result/unlock/unlocked/LIFF routes, invalid LIFF bind rejection, invalid webhook signature rejection, and empty-events webhook verification handling.

Learnings:
- Production schema migration was additive and applied cleanly.
- Production fresh analyze can still be sensitive to model output variability; same-model retry recovered the smoke path while preserving current behavior.
- Final production smoke persisted 4 allowlisted context fields and created a completed `analysis_paid_results` shadow row.
- Event metadata remained privacy-safe, with operational keys only.
- Validation passed: compileall, topic-ingestion unit tests, web lint, web unit tests, web build, and local Playwright smoke.

Unresolved questions:
- `analysis_paid_results` retention cleanup remains pending and should be added before broader production traffic or ads.
- Whether output-validation retry metrics should be monitored separately as traffic grows.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-26 - Analysis Paid Results Retention Cleanup v0

Completed changes:
- Saved the retention cleanup handoff under `ai-collaboration/handoffs/`.
- Added `analysis_paid_results` to scheduled retention cleanup coverage.
- Implemented scrub-in-place cleanup for expired paid-result rows by clearing `paid_result_json` and marking rows expired.
- Extended dry-run output with aggregate `analysisPaidResults` counts.
- Added tests for paid-result dry-run counts, cleanup scrub count, already scrubbed rows, and route response shape.
- Updated the production runbook and web README.
- Deployed refreshed staging and production builds.

Learnings:
- Staging and production both have `analysis_paid_results` rows with retention timestamps and no overdue eligible rows at verification time.
- Unauthorized retention route checks returned HTTP 401 on staging and production.
- Authorized live route dry-run could not be completed from local tooling because env pulls did not provide a usable cleanup secret value.
- Direct Neon aggregate checks verified staging `analysis_paid_results` total 2 / eligible 0 and production total 1 / eligible 0.
- Validation passed: compileall, topic-ingestion unit tests, web lint, web unit tests, and web build.

Unresolved questions:
- Need one authorized production route dry-run from an environment with direct cleanup-secret access.
- Retention policy for `events`, `unlock_intents`, contact data, and sessions remains future work.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-26 - Paid Results Retention Authorized Dry-run Follow-up v0

Completed changes:
- Saved the follow-up handoff under `ai-collaboration/handoffs/`.
- Confirmed production `CRON_SECRET` is listed as configured in Vercel.
- Confirmed production retention cleanup route still rejects unauthorized dry-run requests with HTTP 401.
- Attempted to access the cleanup secret through production env pull without printing values, but no usable secret value was available.
- Did not run authorized dry-run because direct usable cleanup-secret access was unavailable.
- Recorded fallback direct Neon aggregate counts in the existing report and review bundle.

Learnings:
- Production route protection remains active.
- Current local secure tooling can confirm the secret name exists but cannot retrieve a usable value for authorized manual dry-run.
- Fallback aggregate counts: `analysisRequests` eligible 1, `analysisResults` eligible 6, `analysisPaidResults` total 1 / with retention 1 / overdue 0 / eligible 0.
- No destructive cleanup was run and no raw content or secrets were recorded.

Unresolved questions:
- An operator with direct `RETENTION_CLEANUP_SECRET` or `CRON_SECRET` access still needs to run the exact authorized route dry-run.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-26 - Two-tier Phase 2A Free-only Analyze Compatibility v0

Completed changes:
- Saved the Phase 2A handoff under `ai-collaboration/handoffs/`.
- Added free-only prompt/schema assets: `product_result_prompt_free_v0.1` and `product_result_schema_free_v1`.
- Switched Module 01 analyze to generate the free result first without `paid_result`.
- Made product-result display and unlocked route compatible with missing paid content.
- Kept legacy full-result support for existing/demo results.
- Updated tests for free-only validation, analyze persistence, cache/shadow behavior, and asset paths.
- Deployed staging and ran synthetic free-only analyze compatibility smoke.

Learnings:
- Fresh staging free-only analyze completed in about 20.7s versus the prior 60-70s full paid-result baseline.
- Repeat staging analyze for the same text/context returned a cache hit in about 1.5s.
- New free-only result persisted without `paid_result`, created no `analysis_paid_results` shadow row, and retained 4 allowlisted user context fields.
- Result page, unlock intent, unlocked pending page, and LIFF route all returned HTTP 200.
- Event metadata remained privacy-safe, with operational keys only.
- Validation passed: compileall, topic-ingestion unit tests, web lint, web unit tests, web build, and local Playwright smoke.

Unresolved questions:
- Deferred paid-result generation and LINE delivery completion remain for Phase 2B/3.
- Production deployment was intentionally skipped pending explicit approval.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-26 - Two-tier Phase 2B Deferred Paid Generation Service v0

Completed changes:
- Saved the Phase 2B handoff under `ai-collaboration/handoffs/`.
- Added a deferred paid-generation API route for Module 01 unlock intents.
- Added paid prompt/schema assets and a paid-generation service that stores completed paid content in `analysis_paid_results`.
- Kept initial analyze free-only and kept paid generation separate from the free result cache.
- Updated unlocked route states for completed, processing, failed, missing, and legacy embedded paid content.
- Added client-side unlock follow-up call to request paid generation after unlock intent creation.
- Added safe paid-generation events and tests for route behavior, asset paths, and fallback paid-result validity.
- Deployed staging and verified synthetic deferred paid generation completed, duplicate request reused the completed row, and unlocked route rendered paid content.

Learnings:
- CLI preview deployments do not automatically use branch-scoped `Preview (staging)` model strategy env values, so staging verification used non-secret model env overrides.
- Deferred provider paid generation was unreliable in staging, surfacing as provider/runtime failures and then output-validation failures.
- A controlled template fallback using only free-result and allowlisted-context data allowed the paid lifecycle to complete while still validating schema/semantic requirements.
- Final staging DB verification showed initial result stayed free-only, 4 context fields persisted, `analysis_paid_results` completed with retention set, and event metadata keys remained operational only.
- Validation passed: compileall, topic-ingestion unit tests, web lint, web unit tests, web build, and local Playwright smoke.

Unresolved questions:
- Whether the controlled fallback is acceptable beyond staging proof or should be replaced by a background/provider retry path before production.
- Whether Phase 3 should use synchronous route generation, background execution, or polling for LINE delivery.
- A database uniqueness/index strategy for one paid row per result/prompt/schema remains deferred.
- Production deployment was intentionally skipped pending explicit approval.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-26 - Paid Generation Provider Reliability Follow-up v0

Completed changes:
- Saved the provider reliability follow-up handoff under `ai-collaboration/handoffs/`.
- Tightened the paid-generation prompt with an explicit JSON skeleton and exact copyable-message counts.
- Added provider output normalization for `{ paid_result: ... }` wrappers.
- Added one provider retry on output-validation failures before fallback.
- Added safe completed-event metadata for `source` and fallback `fallbackReason`.
- Lowered the compact paid semantic text floor from 1,200 to 900 characters while preserving structural and safety checks.
- Added unit tests for provider success, retry-before-fallback, fallback source/reason metadata, wrapper normalization, and compact semantic threshold.

Learnings:
- Provider path did succeed once in staging with model `claude-haiku-4-5-20251001`, but final staging smoke still completed via fallback.
- Final staging fallback reason was safely recorded as `output_validation`.
- User-facing deferred paid generation still completed, repeat request reused the completed row, and unlocked route rendered paid content.
- Local Vercel preview env pull did not provide usable provider secrets, so raw provider-output diagnosis could not be run locally.
- Validation passed: compileall, topic-ingestion unit tests, web lint, web unit tests, web build, and local Playwright smoke.

Unresolved questions:
- Provider path is not reliable enough to treat as primary; exact field-level provider mismatch remains unknown.
- Need secure transient provider-output diagnostics or sanitized validation-debug tooling before Phase 3 treats provider paid generation as stable.
- Production deployment was intentionally skipped.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-26 - Secure Provider Output Diagnostic v0

Completed changes:
- Saved the secure provider diagnostic handoff under `ai-collaboration/handoffs/`.
- Added in-memory sanitized diagnostics for paid provider parse/schema/semantic validation failures.
- Attached diagnostics only to fallback completion metadata; no raw provider output or paid JSON is persisted.
- Ran staging synthetic diagnostic flow and identified parse failure before schema/semantic validation.
- Increased paid-generation provider output budget from 2,400 to 3,600 tokens.
- Redeployed staging and verified paid generation completed through provider without fallback.
- Added tests for sanitized diagnostics, output budget, and fallback metadata.

Learnings:
- The previous fallback reason `output_validation` was caused by parse failure, consistent with malformed/truncated JSON.
- After raising output budget, final staging paid row used provider model `claude-haiku-4-5-20251001` and event metadata recorded `source: provider`.
- Repeat paid request reused the completed row and unlocked route rendered paid content.
- Fallback remains available but was not used in the final smoke.
- Validation passed: compileall, topic-ingestion unit tests, web lint, web unit tests, web build, and local Playwright smoke.

Unresolved questions:
- Only one final synthetic staging case was verified after the output-budget fix.
- Deferred paid generation remains synchronous and should still be revisited before broader LINE traffic.
- Production deployment was intentionally skipped.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-26 - Two-tier Phase 3 LINE Bind Trigger + Delivery v0

Completed changes:
- Saved the Phase 3 LINE bind trigger handoff under `ai-collaboration/handoffs/`.
- Wired LIFF bind to request deferred paid generation after verified LINE identity binding.
- Updated LIFF bind response with safe `paidStatus`.
- Changed short-code webhook reply copy to an honest processing message with unlocked link.
- Scheduled short-code paid generation after webhook response instead of blocking LINE on provider latency.
- Added tests for LIFF paid-generation trigger and valid short-code pending-link behavior.
- Deployed staging and verified deferred paid-generation provider path still completed.

Learnings:
- Trigger decision: LIFF/web can await paid generation; webhook should respond quickly and use after-response generation.
- Final staging deferred paid verification completed with provider model `claude-haiku-4-5-20251001`; fallback was not used.
- Existing unlocked route states were sufficient, so no new status API was needed for this MVP.
- Real LIFF ID-token smoke and manual test-OA short-code smoke cannot be completed from shell and remain manual staging checks.
- Validation passed: compileall, topic-ingestion unit tests, web lint, web unit tests, web build, and local Playwright smoke.

Unresolved questions:
- Next `after` is not a durable queue; a future background/polling design may be needed before broader LINE traffic.
- Manual staging LINE test OA smoke remains pending.
- Production deployment was intentionally skipped.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-26 - Two-tier Phase 3 Staging Manual Smoke v0

Completed changes:
- Saved the Phase 3 staging manual smoke handoff under `ai-collaboration/handoffs/`.
- Verified `staging.anyu.tw` points to a fresh ready Vercel preview deployment after the Phase 3 staging push.
- Ran shell-safe staging synthetic paid-generation smoke.
- Verified paid generation completed, duplicate request reused the completed row, and unlocked route rendered paid content.
- Verified safe DB/event status: provider source, fallback not used, retention set.
- Recorded real LIFF bind and real test-OA short-code smoke as pending manual operator verification.

Learnings:
- Shell-safe staging service path remains healthy after Phase 3.
- Final verification used provider model and did not fall back.
- The shell cannot complete real LIFF ID-token or test-OA short-code flows without human LINE client interaction.
- Next-after risk decision remains gated: keep as staging / low-volume beta only until manual LINE smoke passes.
- Validation passed: compileall, topic-ingestion unit tests, web lint, web unit tests, and web build.

Unresolved questions:
- Real LIFF bind smoke remains pending.
- Real staging/test OA short-code smoke remains pending.
- Production deployment was intentionally skipped.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-26 - LIFF Fulfillment Redirect Context Fix v0

Completed changes:
- Saved the LIFF fulfillment redirect context fix handoff under `ai-collaboration/handoffs/`.
- Updated LIFF URL generation so staging LINE CTA URLs include the module fulfillment route path on `liff.line.me`.
- Added a LIFF context parser that reads direct query params and LINE `liff.state` redirects.
- Updated the LIFF bridge page to use the parser and retain safe short-code fallback when context is missing.
- Updated tests for LIFF URL generation, `liff.state` parsing, missing-context behavior, and bind response unlock target.
- Refreshed staging alias to a preview deployment with the fix and ran route-level staging smoke.

Learnings:
- The likely redirect failure was context loss through LINE LIFF redirect/login mechanics; the bridge only read direct query params before this fix.
- Staging setup docs still expect endpoint `https://staging.anyu.tw/m/ambiguous-temperature/line/fulfill`.
- Route-level staging smoke verified generated LIFF URLs now include `/m/ambiguous-temperature/line/fulfill` and required context params.
- Direct query and `liff.state` route checks rendered the LINE fulfillment page and did not render homepage.
- Validation passed: compileall, topic-ingestion unit tests, web lint, web unit tests, web build, and local Playwright smoke after port-binding escalation.

Unresolved questions:
- Real mobile LINE/LIFF smoke still requires human/operator verification with the staging test OA.
- If LINE Console endpoint differs from the setup record, it should be corrected before production consideration.
- Production deployment was intentionally skipped.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-26 - Global LIFF Fulfillment Bridge v0

Completed changes:
- Saved the global LIFF fulfillment bridge handoff under `ai-collaboration/handoffs/`.
- Added canonical `/line/fulfill` bridge for module-agnostic LINE Console endpoint use.
- Kept `/m/[moduleSlug]/line/fulfill` as compatibility route.
- Updated generated LIFF URLs to use `/line/fulfill` and carry `moduleSlug`, unlock intent, unlock token, and short-code fallback context.
- Updated context parsing for direct query params, `liff.state`, and legacy module-route state paths.
- Added server-provided initial search context so missing/unsupported context renders safe fallback without homepage redirect.
- Added bind API module mismatch validation.
- Updated staging/production LINE setup docs and env matrix with global LIFF endpoint guidance.
- Refreshed staging alias and ran sanitized route-level smoke.

Learnings:
- The likely mobile 404 cause is brittle module-specific LIFF endpoint handling through LINE's redirect/login mechanics.
- A stable `/line/fulfill` endpoint lets one LIFF app support future modules using `moduleSlug` context.
- Staging route-level smoke verified the generated LIFF URL path is `/2010157793-Q4JeeYv0/line/fulfill` with module context.
- Missing/unsupported context routes render safe fallback and do not render homepage.
- Validation passed for compileall, topic-ingestion tests, web lint, web unit tests, and web build.

Unresolved questions:
- Local Playwright browser execution is blocked in this harness by Chromium MachPort permission errors, though the e2e build step succeeds.
- Staging LINE Console must be updated manually to `https://staging.anyu.tw/line/fulfill`.
- Real mobile staging LIFF smoke remains pending after the console endpoint update.
- Production deployment was intentionally skipped.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-26 - LIFF Post-bind Unlock Redirect 404 Fix v0

Completed changes:
- Saved the LIFF post-bind redirect fix handoff under `ai-collaboration/handoffs/`.
- Replaced environment-derived absolute LIFF bind redirect URL with a root-relative `unlockedPath`.
- Added `buildModuleUnlockPath` for `/m/{moduleSlug}/unlock/{unlockToken}` path generation.
- Updated LIFF bridge navigation to normalize and validate redirect target shape before `window.location.assign`.
- Preserved compatibility for legacy absolute `unlockedUrl` responses by normalizing them to same-origin path shape.
- Updated bind route and fulfillment helper tests.
- Refreshed staging alias and verified the redacted unlock route shape returns HTTP 200.

Learnings:
- The likely mobile 404 cause was fragile absolute URL construction after bind.
- The safer LIFF bind contract is a root-relative path that never depends on Vercel/base-url env resolution.
- Route-level staging smoke can verify the unlock route shape and status without recording tokens.
- Full post-bind verification still requires a real LINE ID token from mobile LIFF.
- Validation passed for compileall, topic-ingestion tests, web lint, web unit tests, and web build.

Unresolved questions:
- Real mobile staging LIFF smoke remains pending.
- Local Playwright browser execution remains blocked by Chromium MachPort permission errors in this harness.
- Production deployment was intentionally skipped.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-26 - LIFF Runtime Navigation Diagnostic v0

Completed changes:
- Saved the LIFF runtime navigation diagnostic handoff under `ai-collaboration/handoffs/`.
- Added temporary `/line/fulfill?debug=1` diagnostic panel for the LIFF bridge.
- Added sanitized diagnostic formatting for pathname, search param keys, context source, context-presence booleans, allowlisted module slug, bind status, unlocked-path shape, navigation method, and safe error code.
- Suppressed automatic post-bind navigation in debug mode so a real mobile operator can capture the rendered sanitized panel.
- Added tests for diagnostic redaction, direct-query context, `liff.state` context, legacy-state context, and debug flag behavior.
- Refreshed staging alias and verified `/line/fulfill?debug=1` returns HTTP 200 with the diagnostic panel.

Learnings:
- Route-level smoke still cannot reproduce the real mobile LIFF 404 because the bind path requires a real LINE runtime and ID token.
- Diagnostic output must be limited to rendered panel fields; full URLs, page source, and network logs can include runtime/query data and should not be shared.
- The diagnostic panel intentionally reports token/code/intent presence only, never actual values.
- Validation passed for compileall, topic-ingestion unit tests, web lint, web unit tests, and web build.

Unresolved questions:
- Real mobile LIFF post-bind 404 still needs a human/operator screenshot or copy of only the sanitized diagnostic panel.
- Local Playwright browser execution remains blocked by Chromium MachPort permission errors in this harness.
- Production deployment was intentionally skipped.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-26 - LIFF URL Path Duplication 404 Fix v0

Completed changes:
- Saved the LIFF URL path duplication fix handoff under `ai-collaboration/handoffs/`.
- Updated LIFF URL generation so `liff.line.me` URLs keep only the LIFF ID path and carry fulfillment context as query params.
- Added defensive normalization for stale LIFF base env values that accidentally include `/line/fulfill`.
- Added optional debug propagation from result pages to `/api/unlock-intent` so generated LIFF URLs can carry `debug=1`.
- Updated LINE fulfillment unit tests for base-only LIFF URLs, route-path stripping, debug propagation, direct query parsing, and `liff.state` parsing.
- Refreshed staging alias to a preview deployment and verified live unlock-intent LIFF URL shape.

Learnings:
- The likely real mobile 404 cause was generated LIFF URL path duplication: the app appended `/line/fulfill` after the LIFF ID while LINE Console already pointed to the app bridge endpoint.
- Live staging unlock-intent now returns a LIFF URL shaped `https://liff.line.me/{LIFF_ID}?<context>`.
- Live staging shape check confirmed no `/line/fulfill` or `/m/` path after the LIFF ID, and confirmed `debug=1` can travel through generated query context.
- Validation passed for compileall, topic-ingestion unit tests, web lint, web unit tests, and web build.

Unresolved questions:
- Real mobile staging LIFF retest remains pending.
- Local Playwright browser execution remains blocked by Chromium MachPort permission errors in this harness.
- Production deployment was intentionally skipped.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-26 - Record Successful LIFF Staging Smoke v0

Completed changes:
- Saved the documentation follow-up handoff under `ai-collaboration/handoffs/`.
- Updated the Two-tier Phase 3 staging manual smoke execution report with sanitized real mobile LIFF pass status.
- Updated the corresponding review bundle with sanitized pass status and remaining short-code smoke gap.
- Updated the staging LINE setup record checklist and change log.

Learnings:
- Real mobile staging LIFF now passes after the LIFF URL path duplication fix.
- The flow no longer hits a generic 404 and no longer drops to homepage.
- LIFF bind succeeds, post-bind navigation reaches the correct unlocked route, and paid content renders successfully.
- Production was not touched.

Unresolved questions:
- Real staging/test OA short-code smoke remains pending.
- No sensitive runtime values were recorded; docs intentionally contain only sanitized pass/fail status.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-26 - Record Short-code Staging Smoke v0

Completed changes:
- Saved the documentation follow-up handoff under `ai-collaboration/handoffs/`.
- Updated the Two-tier Phase 3 staging manual smoke execution report with sanitized real staging/test OA short-code pass status.
- Updated the corresponding review bundle with sanitized short-code pass status.
- Updated the staging LINE setup record checklist and change log.

Learnings:
- Real staging/test OA short-code flow now passes.
- The user pasted the fulfillment short code into the staging/test OA; the bot replied successfully.
- The returned link opened, reached the correct unlocked route, and paid content rendered successfully.
- Production was not touched.

Unresolved questions:
- No sensitive runtime values were recorded; docs intentionally contain only sanitized pass/fail status.
- Production activation still requires a separate manual decision record.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-26 - Module 01 Dual Theme v2 Riso Implementation v0

Completed changes:
- Saved the provided dual-theme v2 Riso handoff under `ai-collaboration/handoffs/`.
- Added a Module 01-only theme variant layer with `classic` and `riso`.
- Added client-first 50/50 A/B assignment with localStorage persistence.
- Added a manual `柔和 / 鮮明` toggle that persists manual override.
- Implemented scoped `.anyu-v2` Riso Editorial styling across landing/input, chips, loading, result, paid preview, contact/LINE, share, and unlocked surfaces.
- Added safe `themeVariant` and `themeSource` metadata where practical.
- Added unit and Playwright smoke coverage for theme assignment/toggle behavior.

Learnings:
- The existing `tokens.css` is intentionally snapshot-tested as the Theme A v1.1 canonical token copy, so Theme B tokens must remain scoped outside that file.
- Theme B preserves product/data contracts by styling current components instead of replacing funnel logic.
- Client-first assignment avoids cookies/global theming but can briefly show Theme A before hydration.
- Required compile, unit, lint, and build validation passed after implementation.

Unresolved questions:
- Full visual fidelity needs staging/mobile screenshot review against the v2 source files.
- Local Playwright e2e remains blocked by the known Chromium MachPort permission issue before page-level assertions run.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-26 - Module 01 Dual Theme Visual Fidelity Pass v0

Completed changes:
- Saved the visual fidelity pass handoff under `ai-collaboration/handoffs/`.
- Fixed Theme B temperature card background so it uses a light/white surface instead of black fill.
- Removed unintended decorative background treatment from the share card surface.
- Updated the share CTA through shared share-action primary styling so both themes use the intended dark button treatment.
- Aligned share-card width through the shared share-preview constraint.
- Adjusted the featured paid preview block to keep dark body, white text, and magenta lower-note/accent treatment.
- Restored subtle editorial background blobs for Theme B only.
- Added a CSS contract test for the fidelity fixes.

Learnings:
- The black temperature panel and patterned share card came from Theme B CSS overrides, not product components.
- Share CTA and share width were shared design consistency issues and are better fixed in shared CSS constraints.
- The fidelity pass did not require changes to analyze, paid generation, LINE, routing, prompts, schemas, cache, DB, or event semantics.
- Required compile, unit, lint, and build validation passed; Playwright remained blocked before page assertions by the local Chromium MachPort permission issue.

Unresolved questions:
- Final fidelity still needs staging/mobile screenshot review.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-26 - Module 01 Dual Theme Fidelity + Theme Carryover v0

Completed changes:
- Saved the fidelity/theme carryover handoff under `ai-collaboration/handoffs/`.
- Simplified the visible Module 01 theme switch into two compact swatches with accessible labels only.
- Preserved manual override persistence and first-visit A/B assignment behavior.
- Added safe theme carryover through unlock intent creation, LIFF URL context, LIFF bind redirect, short-code webhook links, and unlocked route initial theme restoration.
- Used compact `.c` / `.r` unlock-token suffixes plus `themeVariant` / `themeSource` query hints instead of a DB migration.
- Fixed the Theme B quote-card accent so it behaves like an edge accent instead of overlapping text.
- Added tests for theme helper carryover, LIFF URL context, LIFF bind redirects, short-code links, compact switch rendering, safe metadata, and CSS fidelity contracts.

Learnings:
- LocalStorage alone is insufficient for LIFF and LINE in-app browser continuity, so the selected theme needs to travel in fulfillment context.
- Theme carryover can be implemented without a DB migration by using safe URL context and a non-sensitive token suffix for new unlock tokens.
- Legacy unlock tokens without a suffix can safely fall back to localStorage/A-B/default behavior.
- Required compile, unit, lint, and build validation passed; Playwright remained blocked before page assertions by the local Chromium MachPort permission issue.

Unresolved questions:
- Staging real-device QA is still needed for Theme B LIFF and short-code unlocked-route continuity.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-26 - Module 01 Share Card + Theme Switch Fix v0

Completed changes:
- Saved the share-card/theme-switch fix handoff under `ai-collaboration/handoffs/`.
- Updated the shared share-card wrapper and shell so desktop width/margins align with other major cards across Theme A and Theme B.
- Rebalanced the share-card poster composition to reduce unused middle whitespace without adding private/source content.
- Routed the share CTA through the shared `Button` component and reduced one-off button styling.
- Kept the theme switch as compact visual swatches with accessibility labels only, with no visible theme/debug wording.
- Updated result, CSS contract, and Playwright smoke tests for the visual fixes.

Learnings:
- The remaining share-card issue was a shared container/composition problem, not a Theme B-only styling issue.
- The CTA was better fixed by using the existing shared button path rather than theme-specific share-card CSS.
- The theme switch behavior already persisted and carried over correctly; this pass only removed the remaining visible wrapper wording.

Unresolved questions:
- Staging screenshot QA is still needed to confirm final desktop share-card alignment in both themes.
- Local Playwright may remain blocked by the known Chromium/MachPort permission issue.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-26 - Module 01 Theme Carryover Bridge + Accent Direction Fix v0

Completed changes:
- Saved the theme carryover bridge/accent fix handoff under `ai-collaboration/handoffs/`.
- Moved the Theme B quote-card accent back to the left edge with reserved left padding to avoid text overlap.
- Updated LIFF fulfillment context parsing so unlock-token suffixes can recover the selected theme when explicit query hints are absent.
- Wrapped the LIFF bridge transition surface in the existing Module 01 theme boundary when a supported module is available.
- Passed server search params into global and compatibility LIFF bridge pages so carried theme hints can render before hydration.
- Added tests for bridge theme rendering, token-suffix recovery, and quote-card left-edge accent CSS.

Learnings:
- The bridge visual discontinuity came from the transition component rendering outside the Module 01 theme wrapper, not from LIFF bind logic.
- Query / LIFF state theme hints already existed in generated URLs; the bridge needed to apply them visually.
- Unlock-token suffixes are useful as a non-sensitive fallback when a WebView loses explicit query theme context.

Unresolved questions:
- Staging real-device LIFF visual QA is still needed to verify the transition surface in LINE WebView for both themes.
- Local Playwright may remain blocked by the known Chromium/MachPort permission issue.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-27 - Module 01 Input Quality + Pending Paid UX Polish v0

Completed changes:
- Saved the provided input-quality/pending-paid UX polish handoff under `ai-collaboration/handoffs/`.
- Raised Module 01 analyze hard minimum to 80 visible non-space characters with recommended and rich tiers at 140 and 240.
- Updated input guidance labels and helper copy to encourage richer input without making context chips required.
- Replaced the short textarea placeholder with a longer concrete example that models relationship stage, interaction timeline, specific signals, and uncertainty.
- Added a privacy-safe paid-result status endpoint and a polling pending-state UI for unlocked paid-result pages.
- Hid the theme switch on LINE/LIFF bridge and unlocked paid surfaces while preserving carried theme styling.
- Localized paid likelihood display to `高` / `中` / `低`.
- Strengthened paid-generation prompt guidance to avoid unnecessary English/code-switching.

Learnings:
- The thin paid-result issue is best addressed first by improving the input floor and expectation-setting rather than changing the two-tier architecture.
- The pending paid-result page can become self-updating with a safe status endpoint that returns only aggregate status metadata.
- Prompt-language guidance can reduce awkward English mixing without introducing brittle runtime rejection of legitimate terms like LINE, ANYU, or user-provided English.

Unresolved questions:
- Full final validation, commit hash, and staging push status to be recorded in final completion summary.
- Staging manual QA is still needed for live LINE/LIFF pending-to-completed behavior.
- Local Playwright may remain blocked by the known Chromium/MachPort permission issue.
## 2026-05-27 - Analyze Submit Transition Flicker Fix v0

Completed changes:
- Saved the analyze submit transition flicker handoff under `ai-collaboration/handoffs/`.
- Replaced the Module 01 landing submit boolean with explicit `idle`, `analyzing`, and `navigating` phases.
- Kept the CTA disabled/loading after successful analyze by entering `navigating` before result navigation.
- Added `正在打開結果⋯` transition copy so the success-to-result handoff does not look idle.
- Preserved failure/timeout behavior so the UI can return to idle with safe retry/error copy.
- Added a regression test for the success/navigating state and guarded idle reset.

Learnings:
- The flicker came from an outer `finally` cleanup resetting submit state after `router.push(...)` was started.
- A tiny local state machine is enough here; broader routing or analyze API changes were unnecessary.
- Both Theme A and Theme B inherit the fix because they share the same landing submit component.

Unresolved questions:
- Compile, unit, lint, and build validation passed; commit hash and staging push status to be recorded in final completion summary.
- Staging visual QA is still recommended because this was a timing-sensitive transition issue.
- Local Playwright may remain blocked by the known Chromium/MachPort permission issue.
## 2026-05-27 - Module 01 Pre-production Staging QA v0

Completed changes:
- Saved the pre-production staging QA handoff under `ai-collaboration/handoffs/`.
- Ran staging-safe route/API QA against `https://staging.anyu.tw`.
- Verified health, landing, demo result, input threshold rejection, valid analyze completion, runtime result render, unlock intent, LIFF URL shape, global bridge, pending paid UI, paid-generation status, unlocked paid route, theme carryover, and hidden downstream theme switch.
- Created the required review bundle and execution report.
- Did not change code or deploy production.

Learnings:
- Staging served latest behavioral indicators including the 80-character input floor and deployed `正在打開結果⋯` navigating copy.
- Fresh staging analyze completed successfully in roughly 20.5 seconds during this pass.
- Generated LIFF URLs retained the fixed `https://liff.line.me/:liffId?<context>` shape with no extra path after the LIFF ID.
- No P0 or P1 issues were found in automated staging checks.

Unresolved questions:
- Exact deployed commit is still not exposed by the runtime.
- Real mobile LIFF and real staging/test OA short-code flows were not re-run in this task; prior manual smoke records remain the basis for those checks.
- Required no-code-change validation passed; commit hash and staging push status to be recorded in final completion summary.
## 2026-05-27 - Two-tier + Dual Theme Production Activation Decision v0

Completed changes:
- Saved the production activation decision handoff under `ai-collaboration/handoffs/`.
- Reviewed the latest Module 01 readiness reports covering pre-production staging QA, real staging LIFF and short-code smoke, two-tier paid generation, dual-theme carryover, input quality, pending paid UX, LIFF bridge fixes, production migration smoke, and retention cleanup.
- Created a production activation decision record with rollout scope, GO/NO-GO decision, accepted risks, no-go conditions, production smoke checklist, rollback plan, monitoring plan, and ads/broader-traffic blockers.
- Created the required execution report.
- Did not change code, deploy production, run production smoke, apply migrations, or change env/LINE Console configuration.

Learnings:
- Decision is GO for low-key production activation only, and NO-GO for ads/broader traffic.
- The main accepted low-key beta risk is webhook-triggered paid generation using Next `after` rather than durable queueing.
- Broader traffic should wait for durable delivery or stronger monitoring, provider/fallback metrics, and stable production LINE observations.

Unresolved questions:
- Human approval is still required before any production activation task.
- Human should decide whether prior real staging LIFF/short-code smoke is sufficient or whether to run one final manual staging check first.
- Required docs-only validation passed; commit hash and staging push status to be recorded in final completion summary.
## 2026-05-27 - Module 01 Low-key Production Activation + Smoke v0

Completed changes:
- Saved the low-key production activation handoff under `ai-collaboration/handoffs/`.
- Ran required local validation before production work.
- Verified production env presence without printing values.
- Verified production DB schema objects/columns with metadata-only Neon queries.
- Deployed candidate commit `7c891c9` to Vercel production and aliased it to `https://anyu.tw`.
- Ran sanitized production route/API smoke for health, landing, input threshold, analyze, result, unlock intent, LIFF URL shape, global bridge, deferred paid generation, paid status, unlocked paid route, theme carryover, hidden downstream switch, and empty-events webhook verification.
- Created the required production smoke review bundle and execution report.

Learnings:
- Production route/API activation passed for low-key beta exposure.
- Fresh production analyze completed in about 21.6 seconds and fresh paid generation completed in about 42.8 seconds.
- Production LIFF URL shape is fixed: `https://liff.line.me/:liffId?<context>` with no route path after the LIFF ID.
- Recent production paid-generation event aggregate showed provider source for the smoke window.

Unresolved questions:
- Real mobile production LIFF operator smoke remains pending.
- Real production OA short-code operator smoke remains pending.
- A possible English-mix page-payload scan needs manual visual review to distinguish visible paid content from non-visible payload/bundled text.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-27 - Module 01 Conversion Trust Copy Polish v0

Completed changes:
- Saved the conversion/trust copy polish handoff under `ai-collaboration/handoffs/`.
- Clarified free-result prompt boundaries so the free result feels useful but not complete.
- Updated paid-result prompt guidance and fallback/demo paid content to include responsible lower-priority / unequal-investment possibilities.
- Replaced vague de-identification UX copy with concrete no-contact-needed, no-public-display, no-third-party-marketing, and retention-rule language.
- Updated privacy-policy draft sections for pasted text, event records, and retention timing without overpromising immediate deletion or total anonymity.
- Strengthened the paid preview 48-hour teaser and softened the share persona label.
- Added/updated tests for prompt guidance, fallback paid states, privacy copy, result rendering, and E2E copy expectations.

Learnings:
- The trust copy needed concrete data-use boundaries more than broad de-identification language.
- The free/paid boundary is now explicit in both the free-only prompt and the full product-result prompt.
- Paid state guidance now avoids over-explaining every ambiguous behavior as busyness, stress, fear, or tenderness.

Unresolved questions:
- Provider-generated future paid results still need staging output review after deployment.
- No staging visual QA was run in this implementation pass.
- Full local validation passed, including Playwright E2E.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-27 - Unlocked Paid Link Pending State Flicker Fix v0

Completed changes:
- Saved the unlocked paid-link pending-state flicker handoff under `ai-collaboration/handoffs/`.
- Added explicit unlocked route state selection for completed, processing, requested, claimed-missing, not-requested, failed, and expired states.
- Treated fulfilled LINE/short-code links with no paid row as pending instead of generic missing.
- Updated the LIFF bridge to navigate immediately in non-debug success flow before rendering a transient success CTA.
- Added route-state, paid-status, and LIFF bridge regression tests.

Learnings:
- The production-observed flicker was consistent with a fulfilled link being briefly treated like an idle/claim state before pending polling was established.
- Fulfillment status is the right server-known signal for distinguishing claimed-missing from truly not-requested.
- Debug LIFF mode can keep the success diagnostic state; normal LIFF mode should navigate before rendering it.

Unresolved questions:
- Real mobile LINE behavior still needs staging/operator verification after deployment.
- Production refresh/smoke remains needed after this fix is promoted.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-27 - Module 01 Follow-up Interaction + Evidence Anchoring Plan v0

Completed changes:
- Saved the follow-up interaction/evidence anchoring planning handoff under `ai-collaboration/handoffs/`.
- Created a planning report for short-input perceived wait, evidence anchoring, raw quote risks, follow-up interaction models, pricing/packaging, LINE UX, data model implications, privacy/retention, and MVP phasing.
- Recommended keeping one-time NT$49 full analysis for low-key beta while planning a future 3-use relationship pack.
- Recommended paid evidence anchors as model-generated summaries, not raw quotes.

Learnings:
- The strongest tester signal is repeat use over time, not just deeper one-time analysis.
- Evidence anchoring can improve trust without retaining or displaying raw source quotes.
- Short-input latency should be monitored before adding model/schema branching.

Unresolved questions:
- Production monitoring is needed before prioritizing actual short-input latency work.
- Relationship session retention and entitlement model require human approval before implementation.
- Required docs-task validation passed.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-27 - Module 01 Operator Test Mode v0

Completed changes:
- Saved the operator test mode handoff under `ai-collaboration/handoffs/`.
- Added a secret-gated `x-operator-test-secret` / `OPERATOR_TEST_SECRET` operator mode for Module 01 analyze requests.
- Relaxed only the per-IP and per-session analyze limits for valid operator requests while preserving input validation, content guards, provider behavior, and the global daily cap.
- Marked operator analyze events with safe metadata: `operatorTest: true` and `testModeSource: "header"`.
- Added tests for valid operator mode, invalid/missing credentials, input validation in operator mode, and metadata safety.
- Documented operator mode activation and constraints in the production deployment runbook.

Learnings:
- A header-secret v0 keeps the bypass server/API-tool oriented and avoids exposing a public query-only control.
- Keeping the global daily cap active preserves a cost-safety boundary while removing common QA false negatives.
- Mobile-friendly operator testing would need a separate signed-link design rather than extending this v0 silently.

Unresolved questions:
- Whether production should configure `OPERATOR_TEST_SECRET` remains an explicit operator decision.
- A short-lived mobile operator link may be useful later but needs separate approval.
- Full validation passed, including local Playwright E2E.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-27 - Module 01 Funnel Metrics Report v0

Completed changes:
- Saved the funnel metrics report handoff under `ai-collaboration/handoffs/`.
- Added a read-only Module 01 funnel metrics CLI at `apps/web/scripts/module-01-funnel-report.mjs`.
- Added `corepack pnpm module01:metrics` with date range, last-window, operator inclusion, markdown, JSON, and output path options.
- Implemented aggregate funnel counts, conversion rates, threshold hints, theme splits, manual override counts, provider/fallback split, LINE fulfillment summaries, and safe error category summaries.
- Excluded `operatorTest` events by default and marked include-operator reports clearly.
- Added synthetic fixture tests for aggregation, rates, operator filtering, theme/provider splits, privacy guardrails, markdown output, and CLI parsing.
- Added operations documentation for running and interpreting the report.

Learnings:
- Current event coverage supports most funnel steps, but unlocked-result page-view and webhook-invalid-signature metrics are documented gaps.
- The app does not currently include a TypeScript script runner, so a `.mjs` CLI is the lowest-risk implementation path.
- Low-key traffic reports should be interpreted as directional monitoring, not statistically strong A/B evidence.

Unresolved questions:
- Whether to add a safe unlocked-result page-view event is a separate analytics semantics decision.
- Production data was not queried in this task.
- Full validation passed; Playwright was not required because no UI code changed.
- Commit hash and staging push status to be recorded in final completion summary.
## 2026-05-27 - Module 01 Production Refresh + Short-code Smoke Record v1

Completed changes:
- Saved the production refresh v1 handoff under `ai-collaboration/handoffs/`.
- Recorded production refresh to candidate `092ba20` / deployment `dpl_4mukHzrtG27bix8UNcrfoLoTynuE`.
- Recorded sanitized route/API smoke status from the production refresh.
- Recorded the production short-code OA smoke as passed after the operator corrected a production/staging LINE secret/token mismatch.
- Added an operations note that silent production OA no-reply can be caused by production/staging LINE channel secret or access token mismatch.
- Updated the production LIFF endpoint checklist to the global `/line/fulfill` bridge.

Learnings:
- A healthy webhook route and valid empty-events verification do not prove the production OA is using the matching production channel credentials.
- For silent OA no-reply, first check LINE Console linked bot, webhook enabled state, and production-scoped secret/token pairing before assuming app webhook logic failed.

Unresolved questions:
- Production mobile LIFF operator smoke remains unrecorded in this v1 report.
- Full validation passed; commit hash and staging push status to be recorded in final completion summary.
## 2026-05-27 - Module 01 Low-key Production Monitoring v0

Completed changes:
- Saved the low-key production monitoring handoff under `ai-collaboration/handoffs/`.
- Confirmed production alias still points to deployment `dpl_4mukHzrtG27bix8UNcrfoLoTynuE` for candidate `092ba20`.
- Recorded production short-code smoke as passed after LINE production/staging secret/token mismatch was corrected.
- Recorded production LIFF operator smoke as pending / unconfirmed.
- Ran aggregate-only production metrics on the confirmed Neon `anyu-next` production branch with operator traffic excluded.
- Created a sanitized low-key production metrics report under `ai-collaboration/reports/metrics/`.

Learnings:
- Last-24-hour production event volume is too low and smoke/operator-heavy for conversion conclusions.
- Aggregate health looks acceptable in the small window: paid generation completed 4/4 with provider source and no fallback; recorded fulfillment failures were 0.
- Some server-side events do not carry theme metadata, so theme split includes `unknown:unknown`.

Unresolved questions:
- Production mobile LIFF operator smoke still needs a sanitized pass/fail record.
- `unlocked_result_view` remains unavailable until a safe unlocked page-view event exists.
- Full validation passed; commit hash and staging push status to be recorded in final completion summary.
## 2026-05-27 - Module 01 Unlocked Result View Metrics Fix v0

Completed changes:
- Saved the unlocked result view metrics handoff under `ai-collaboration/handoffs/`.
- Added the `unlocked_result_view` event to the safe event registry.
- Added a client-side once-per-mount tracker that emits only when completed unlocked paid content renders.
- Added safe metadata for module/theme/source/status/result-age bucket without passing paid content, tokens, LINE identifiers, raw input, URLs, or secrets.
- Updated the Module 01 funnel metrics report to map the final unlocked-result step and add data quality warnings for smoke/API-heavy or non-sessionized counts.
- Added tests for event registration, metadata safety, paid-result source mapping, age bucketing, and metrics warning output.

Learnings:
- The final funnel step is best tracked at the completed paid-content render surface rather than inferred from paid generation completion.
- Current funnel reports remain event-count based, so downstream counts can exceed upstream counts during route/API smoke and operator verification.
- Low landing volume should be called out directly to avoid over-reading conversion rates.

Unresolved questions:
- Whether to build sessionized funnel reporting remains a separate analytics decision.
- Operator-test status is supported by tracker metadata but is not automatically inferable from existing unlock intent records.
- Full non-E2E validation passed; Playwright was attempted but blocked by the known local Chromium MachPort permission failure.
- Commit hash and staging push status are recorded in the final completion summary.
## 2026-05-27 - Module 01 Low-key Production Monitoring Metrics Rerun v0

Completed changes:
- Saved the metrics-rerun handoff under `ai-collaboration/handoffs/`.
- Updated the low-key production monitoring execution report and review bundle with the latest sanitized production metrics rerun.
- Recorded that production is now on candidate `4c2487a` / deployment `dpl_Ffzzri9CYMk6PMEmw4c8BGRXQqJh`.
- Recorded included events increasing from 61 to 75.
- Recorded `unlocked_result_view = 1`, confirming the completed paid-content view tracker is working in production.
- Recorded `paid_generation_requested = 5` and `paid_generation_completed = 5`.
- Kept ads and broader traffic blocked because the report remains WARN due to smoke-heavy / non-sessionized traffic and downstream counts exceeding upstream counts.

Learnings:
- The new unlocked paid-content view tracker is now visible in production aggregate metrics.
- The latest metrics are useful as a health check, but still not valid for conversion conclusions.

Unresolved questions:
- Production mobile LIFF operator smoke remains pending unless separately confirmed.
- Conversion interpretation should wait for cleaner, higher-volume traffic.
- Validation results, commit hash, and staging push status are recorded in the final completion summary.
## 2026-05-27 - Module 01 Production LIFF Smoke Pass v0

Completed changes:
- Saved the production LIFF smoke pass handoff under `ai-collaboration/handoffs/`.
- Updated the low-key production monitoring execution report and review bundle with a sanitized production LIFF pass record.
- Recorded production LIFF smoke as passed with paid content completed/rendered successfully.
- Recorded theme carryover as correct.
- Recorded no 404, no homepage drop, and no processing stuck/error.
- Reconfirmed production short-code smoke was already recorded as passed.
- Reconfirmed low-key production remains active/monitor while ads and broader traffic remain blocked.

Learnings:
- Production short-code and LIFF fulfillment paths are now both recorded as passing at the operator-smoke level.
- Low-key production can continue as monitoring only, but traffic remains too smoke-heavy for conversion conclusions.

Unresolved questions:
- Conversion interpretation still needs cleaner, higher-volume traffic.
- Validation results, commit hash, and staging push status are recorded in the final completion summary.
## 2026-05-27 - Module 01 Follow-up Interaction + Evidence Anchoring Plan v0 Refresh

Completed changes:
- Re-read the duplicate follow-up/evidence anchoring handoff and confirmed it matches the saved repo handoff.
- Refreshed the existing planning report to reflect the current low-key production state: production short-code and LIFF operator smoke are now recorded as passed.
- Kept the plan docs-only with no code, prompt, schema, DB, LINE, payment, ads, legal, or production behavior changes.

Learnings:
- The product direction remains: keep one-time NT$49 full analysis during low-key beta, plan paid evidence-summary cards next, then test a 3-use relationship pack/follow-up experience after cleaner monitoring signal.
- Evidence anchoring should still use model-generated summaries rather than raw quotes.

Unresolved questions:
- Relationship-session retention and entitlement design still require human approval before implementation.
- Validation results, commit hash, and staging push status are recorded in the final completion summary.
## 2026-05-27 - Evidence Anchoring Schema + Prompt Plan v0

Completed changes:
- Saved the evidence anchoring schema/prompt planning handoff under `ai-collaboration/handoffs/`.
- Created a planning report for paid-only Module 01 evidence anchoring.
- Recommended future schema v3 field `paid_result.evidence_summary` with a title and 3-4 structured `{ label, summary, reason }` cards.
- Recommended model-generated evidence summaries rather than raw quotes.
- Recommended rendering evidence cards only on unlocked paid result surfaces after the paid summary and before possible states.
- Documented prompt requirements, privacy/retention boundaries, validation rules, legacy/fallback compatibility, cost/latency impact, and future follow-up-session relationship.

Learnings:
- Evidence anchoring can improve trust without replaying private text if it remains summary-based and paid-only.
- Evidence summaries should follow `analysis_paid_results` retention cleanup by living inside `paid_result_json`.
- Fallback and legacy results should omit the section unless safe high-quality evidence can be produced.

Unresolved questions:
- Human approval is required before schema v3 or prompt implementation.
- Privacy copy should be reviewed before production exposure of evidence summaries.
- Full required validation passed; commit hash and staging push status are recorded in the final completion summary.
## 2026-05-27 - Evidence Anchoring Schema v3 Implementation v0

Completed changes:
- Saved the implementation handoff under `ai-collaboration/handoffs/`.
- Added paid-result schema v3 requiring a paid-only `evidenceSummary` section with 3-4 `{ label, summary, reason }` cards.
- Updated the paid prompt to request safe evidence summaries without raw message logs, identifiers, long quotes, or final judgments.
- Bumped deferred paid generation to `paid_result_prompt_v0.2` and `paid_result_schema_v3`.
- Added runtime evidence semantic validation for item count, length, identifier-like text, and long quote-like text.
- Rendered evidence cards only on unlocked paid result pages when v3 evidence exists.
- Preserved legacy completed paid rows and fallback paid results that do not include evidence.
- Added tests for provider schema enforcement, evidence privacy boundaries, unlocked rendering, LINE reply exclusion, and legacy completed status compatibility.

Learnings:
- The app’s paid-result JSON contract is camelCase, so the planned `paid_result.evidence_summary` is implemented as `paid_result.evidenceSummary`.
- Evidence anchoring can be added without DB migration because paid-result JSON already lives in `analysis_paid_results.paid_result_json`.
- Legacy status fallback is needed during schema version rollover so old completed links do not appear pending.

Unresolved questions:
- Live staging provider adherence to the new evidence prompt remains pending until the commit is deployed to staging.
- Evidence quality should be reviewed with one synthetic paid-generation run before production exposure.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.
## 2026-05-27 - Payment Provider Application Prep + NewebPay Evaluation v0

Completed changes:
- Saved the payment-provider application handoff under `ai-collaboration/handoffs/`.
- Created a docs-only NewebPay application readiness and ECPay backup comparison note.
- Recommended applying to NewebPay first and keeping ECPay as backup.
- Drafted provider-facing ANYU product description, storefront copy, refund policy direction, privacy/trust copy requirements, first payment method recommendation, and future payment integration flow.
- Identified missing owner actions: applicant type, documents, bank account, tax/invoice posture, provider-facing support/contact details, and approval of storefront/refund copy.
- No payment integration, checkout, production behavior, LINE behavior, prompt/schema/cache/DB, or legal runtime copy was changed.

Learnings:
- NewebPay appears suitable for a first one-time digital content/service unlock using a hosted/redirect payment flow.
- ECPay’s official preparation checklist is useful as a general readiness benchmark even if it remains the backup provider.
- Current ANYU public pages are directionally ready but need a provider-review-specific storefront/refund copy pass before application submission.

Unresolved questions:
- Owner must choose applicant type and confirm business/tax/invoice posture.
- NewebPay official review-time SLA was not found in reviewed official pages.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.
## 2026-05-27 - Provider-review Storefront + Legal Copy Pass v0

Completed changes:
- Saved the provider-review storefront/legal copy handoff under `ai-collaboration/handoffs/`.
- Created a docs-only review bundle with provider-facing product description, storefront copy, refund/re-delivery policy draft, privacy/trust copy, service limitation copy, support copy, placement recommendations, owner decisions, and application checklist.
- Created an execution report documenting current gaps and next steps.
- Kept payment disabled and did not change runtime public pages, payment code, checkout, DB schema, LINE behavior, paid generation, prompt/schema/cache, ads, or production behavior.

Learnings:
- Current public pages are sufficient for low-key production but still need provider-review-specific product/refund/support copy before payment application submission.
- The safest next step is owner copy approval followed by a narrow app-copy pass, not payment integration.

Unresolved questions:
- Owner must decide applicant type, tax/invoice posture, public contact/business disclosure, and whether `hello@anyu.tw` is formal support.
- Provider review may require public phone/address/company details; this should not be invented by Codex.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.
## 2026-05-27 - Provider-review Public Copy Implementation v0

Completed changes:
- Saved the public copy implementation handoff under `ai-collaboration/handoffs/`.
- Updated Module 01 paid preview runtime copy with planned future `NT$49` one-time full-analysis pricing, current no-charge beta wording, digital web/LINE delivery, included content, privacy/trust note, and refund/re-delivery support copy.
- Updated unlocked full-analysis header copy with current no-charge and service-limitation wording.
- Updated shared legal content with future-payment digital delivery, refund/re-delivery, support, payment-provider privacy, and individual small-scale/no-unified-invoice posture copy.
- Added targeted tests for payment-disabled copy, support email, privacy boundaries, no checkout/provider claims, and no company/studio/business-registration claims.
- Created the required review bundle and execution report.

Learnings:
- Provider-review public copy can be implemented without changing payment behavior if every paid reference is framed as future/planned and paired with current no-charge beta language.
- Copy safety tests are useful guardrails against accidentally implying checkout availability or business-registration status.

Unresolved questions:
- NewebPay may still require public phone/address/applicant details.
- Invoice/tax wording should be reviewed before real payment launch.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.
## 2026-05-27 - Provider-review Copy Visual Grouping Polish v0

Completed changes:
- Saved the visual grouping handoff under `ai-collaboration/handoffs/`.
- Reworked Module 01 paid-preview provider-review copy into product/value, delivery/beta, included-content, trust/policy, and service-limitation sections.
- Added compact included-content chips and a grouped `交付與隱私` panel.
- Added Theme A/Theme B-compatible styling for the grouped panels.
- Updated tests for grouped paid-preview copy and both theme wrappers.
- Created the required review bundle and execution report.

Learnings:
- Provider-review copy can remain complete without overwhelming the conversion card when policy details are grouped into a compact panel.
- Theme B needs sharper bordered panels for the same information hierarchy, while Theme A works better with soft chip/card treatment.

Unresolved questions:
- Staging visual QA may still request minor spacing/height tuning.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.
## 2026-05-27 - Public Legal Draft Disclaimer Removal v0

Completed changes:
- Saved the public legal draft-disclaimer removal handoff under `ai-collaboration/handoffs/`.
- Removed public-facing draft/non-final/legal-advice warning language from privacy, terms, disclaimer, metadata descriptions, and legal index copy.
- Replaced legal page intros with formal service-ready copy while preserving conservative privacy, refund/re-delivery, support, invoice, and service-limitation boundaries.
- Added tests that public legal copy does not contain draft/legal-advice warning phrases and still avoids checkout/provider/business-registration/private-contact claims.
- Created the required review bundle and execution report.

Learnings:
- Public legal readiness required removing not only the explicit draft disclaimer, but also visible `v0` labels from legal headings, metadata, and the legal index.
- Payment-provider-facing copy can remain conservative without saying the documents are draft or awaiting professional review.

Unresolved questions:
- Owner/legal review remains needed before real payment launch.
- Payment provider may still require public phone/address/applicant details in a separate owner-approved task.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.
## 2026-05-27 - Legal / Provider-review Public Page QA v0

Completed changes:
- Saved the legal/provider-review public-page QA handoff under `ai-collaboration/handoffs/`.
- Ran staging route/content checks for `/privacy`, `/terms`, `/disclaimer`, `/legal`, `/m/ambiguous-temperature`, and the demo paid-preview result route.
- Confirmed formal 2026-05-27 public legal copy is live on staging and visible draft/non-final/legal-advice warning phrases are absent from legal pages.
- Confirmed provider-review paid-preview copy, refund/re-delivery policy, privacy/trust boundaries, service limitation copy, conservative invoice posture, and `hello@anyu.tw` support contact are visible.
- Confirmed payment remains disabled and no checkout/provider redirect/card collection/private owner details/business-registration claims were observed.
- Created the required review bundle and execution report.

Learnings:
- The staging legal pages are suitable to proceed toward payment-provider application checklist work from a public-copy QA perspective.
- Raw Module 01 HTML still includes internal serialized `v0` experiment metadata; this is not visible public legal copy but should be remembered if a provider performs source-level scans.

Unresolved questions:
- NewebPay may require public phone/address/applicant details in a separate owner-approved task.
- Interactive staging browser QA was blocked locally by the known Chromium MachPort permission issue; route/content QA and local validation passed.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.
## 2026-05-28 - Evidence Anchoring v3 Staging Provider Review v0

Completed changes:
- Saved the evidence anchoring v3 staging provider review handoff under `ai-collaboration/handoffs/`.
- Ran one staging-only synthetic fresh analyze, unlock intent, deferred paid-generation request, paid-status poll, and unlocked route check.
- Confirmed staging generated a completed `paid_result_schema_v3` paid result from the provider path without fallback.
- Confirmed `evidenceSummary` exists as an object with 3 items and every item has `label`, `summary`, and `reason`.
- Confirmed field-level evidence safety checks passed without recording raw input, raw provider output, full paid JSON, tokens, LINE IDs, or secrets.
- Confirmed evidence cards rendered on the unlocked paid result route and did not appear on fetched free/landing surfaces or LINE reply helpers.
- Created the required review bundle and execution report.

Learnings:
- The v3 evidence prompt/schema path works on a live staging provider sample.
- Evidence summaries were concise and appeared as model-generated summaries rather than raw quote blocks.
- Staging freshness still has to be proven behaviorally because runtime does not expose an exact commit marker.

Unresolved questions:
- One synthetic sample is not enough to judge long-term provider-output quality.
- Owner visual review is still recommended before production refresh.
- Production refresh/smoke remains a separate explicit approval task.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.
## 2026-05-28 - Evidence Anchoring v3 Production Refresh + Smoke v0

Completed changes:
- Saved the production refresh/smoke handoff under `ai-collaboration/handoffs/`.
- Confirmed approved production candidate `9b58ab0` includes implementation commit `0d9ec2e` and the staging provider review.
- Ran required validation before production refresh.
- Deployed production from the repository root and aliased deployment `dpl_EyjzwnraEgbyGEByqjNL1wWWdNtv` / `https://anyu-next-l42vsudp2-studioanyu-1488s-projects.vercel.app` to `https://anyu.tw`.
- Ran a synthetic production route/API smoke covering health, landing, fresh analyze, result route, unlock intent, deferred paid generation, paid status, and unlocked route.
- Confirmed production generated `paid_result_schema_v3` from provider source with 4 evidence items and required `label`, `summary`, `reason` fields.
- Confirmed sanitized evidence safety checks passed and evidence rendered on unlocked paid result only.
- Confirmed event/privacy aggregate checks did not show forbidden raw-content/key patterns.
- Created the required review bundle and execution report.

Learnings:
- Evidence Anchoring v3 is now active in production and passed one synthetic provider-path smoke.
- The linked Vercel project expects deploys from the repository root; running deploy from `apps/web` builds an invalid nested path.
- Local aggregate metrics remain blocked without a configured `DATABASE_URL`, which should be handled through a secure operator path.

Unresolved questions:
- One synthetic production sample is not enough to evaluate provider-output quality under varied traffic.
- Ads and broader traffic remain blocked pending additional low-key monitoring.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.
## 2026-05-28 - ANYU Codebase Stabilization + Tech Debt Audit v0

Completed changes:
- Saved the stabilization audit handoff under `ai-collaboration/handoffs/`.
- Inspected Module 01 routes/components, AI prompt/schema/paid-generation code, LINE/LIFF fulfillment, events/metrics/operator mode, styles/themes, legal/provider-review copy, and docs/artifacts.
- Found no P0 issues.
- Classified current debt into P1, P2, and deferred/do-not-touch categories.
- Completed one low-risk docs cleanup in `docs/operations/repo-maintenance.md` to reflect current active stabilization targets and do-not-touch boundaries.
- Created the required review bundle and execution report.

Learnings:
- The most important pre-traffic-expansion debts are operational rather than immediate runtime bugs: missing build marker, non-durable paid generation, non-sessionized metrics, secure metrics access, and owner-dependent provider contact details.
- Code maintainability debt is concentrated in Module 01 UI/route file size, global CSS accumulation, LIFF compatibility/diagnostic paths, and schema/prompt version naming complexity.
- No broad refactor should happen opportunistically while Module 01 is live and low-key production is active.

Unresolved questions:
- Owner should decide whether `docs/design/` should be committed, moved, or ignored.
- Durable paid generation and sessionized metrics require separate architecture approval.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.

## 2026-05-28 - Build Marker Ops Readiness v0

Completed changes:
- Saved the build marker ops readiness handoff under `ai-collaboration/handoffs/`.
- Added safe runtime build metadata to `GET /api/health` while preserving the existing health response compatibility field.
- Added an allowlisted build marker helper that sanitizes Vercel env metadata and falls back to `unknown` when metadata is missing or invalid.
- Added tests for marker shape, Vercel env mapping, missing env fallback, and forbidden secret-like key exclusion.
- Updated production deployment and Module 01 metrics docs to use `/api/health` as deployment freshness context.
- Created the required review bundle and execution report.

Learnings:
- The app can now expose a small runtime freshness marker without enumerating env vars or exposing secrets.
- `gitCommit` and `gitBranch` are the primary reliable hosted freshness fields; `buildTime` remains `unknown` unless `ANYU_BUILD_TIME` is configured.

Unresolved questions:
- Whether to inject `ANYU_BUILD_TIME` during Vercel builds should be decided in a future ops-hardening task if timestamp freshness becomes important.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.

## 2026-05-28 - Secure Metrics Operator Path v0

Completed changes:
- Saved the secure metrics operator path handoff under `ai-collaboration/handoffs/`.
- Enhanced `module01:metrics` with explicit `--target local|staging|production`, production confirmation, `--base-url` health marker integration, and `--dry-run`.
- Kept metrics aggregate-only and operator-test aware; operator traffic remains excluded by default.
- Added target and safe health marker metadata to markdown and JSON reports.
- Extended the report privacy guard to JSON output and added forbidden operational key checks.
- Updated Module 01 metrics and production deployment runbooks with safe staging/production command shapes.
- Created the required review bundle and execution report.

Learnings:
- The safest v0 path is CLI hardening, not a new metrics endpoint.
- Production target safety can be improved substantially without changing event semantics or product runtime behavior.
- Production `/api/health` may still return unknown marker fields until the build-marker commit is deployed.

Unresolved questions:
- Secure DB credential distribution remains outside this task and should stay operator-controlled.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.

## 2026-05-28 - Paid Generation Job Foundation Plan v0

Completed changes:
- Saved the paid generation job foundation handoff under `ai-collaboration/handoffs/`.
- Inspected the current paid generation lifecycle, `analysis_paid_results`, paid-result request/status routes, LIFF bind, LINE short-code webhook, unlocked polling, and metrics/events.
- Created a planning report recommending a future separate `generation_jobs` table scoped narrowly to `paid_analysis` v1.
- Defined job shape, state machine, trigger sources, processor/cron architecture, idempotency/locking, retry/backoff/fallback, pending status API contract, observability, retention/privacy, external queue upgrade points, and implementation phases.
- Created the required execution report.

Learnings:
- Current paid generation durability debt is concentrated in best-effort LINE short-code generation, synchronous LIFF bind generation, and `analysis_paid_results` carrying transient job lifecycle state.
- A narrow DB-backed job foundation gives future payment and web-only unlock a clean enqueue/polling path without overbuilding a general AI queue platform.

Unresolved questions:
- Future entitlement/payment table shape should wait for NewebPay implementation approval.
- Fallback-after-payment policy needs product/support approval before real charge flows.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.

## 2026-05-28 - Paid Generation Job Foundation Phase 1 Schema + Repository Seams v0

Completed changes:
- Saved the Phase 1 schema/repo handoff under `ai-collaboration/handoffs/`.
- Added additive `generation_jobs` migration and Drizzle schema definition.
- Added TypeScript constants and repository helpers for future `paid_analysis` job lifecycle.
- Added a stable dedupe key builder using module slug, analysis result ID, prompt version, and schema version.
- Added synthetic repository tests for create/reuse, transitions, due-job listing, allowed values, and privacy-safe serialized fixtures.
- Created the required review bundle and execution report.

Learnings:
- Phase 1 can introduce the durable job seam without changing current paid generation, LIFF, LINE, or payment behavior.
- `attempt_count` is clearest when incremented at processor claim/processing start.

Unresolved questions:
- Staging and production migrations are not applied by this task.
- Job retention duration and future entitlement refs remain deferred decisions.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.

## 2026-05-28 - Paid Generation Job Foundation Phase 1 Staging Migration Verification v0

Completed changes:
- Saved the staging migration verification handoff under `ai-collaboration/handoffs/`.
- Confirmed `https://staging.anyu.tw/api/health` is serving preview commit `ccf2d906a97c` from branch `staging`.
- Applied only `apps/web/drizzle/0006_generation_jobs.sql` to the Neon `preview` branch database.
- Verified `generation_jobs` columns, defaults, unique dedupe index, processor indexes, and existing prerequisite tables.
- Ran a synthetic repository smoke with fixed fake UUIDs and cleaned up the synthetic row.
- Ran staging route/API regressions for landing, input validation, fresh analyze, result, unlock intent, paid request/status, unlocked route, LIFF bridge, invalid LIFF bind, invalid webhook signature, and empty-events webhook verification.
- Verified `generation_jobs` row count remained `0` after normal runtime checks.
- Created the required review bundle and execution report.

Learnings:
- Phase 1 migration is live on staging and remains behavior-neutral.
- Normal Module 01 staging flows do not write to `generation_jobs`, as intended.

Unresolved questions:
- Production migration remains pending and should wait for separate approval or imminent Phase 2 work.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.

## 2026-05-28 - Paid Generation Job Foundation Phase 2 Enqueue / Status Plan v0

Completed changes:
- Saved the Phase 2 enqueue/status plan handoff under `ai-collaboration/handoffs/`.
- Inspected the current paid-result request route, status route, pending poller, LIFF bind trigger, short-code webhook trigger, and `generation_jobs` repository seam.
- Created a Phase 2 plan recommending Option B: feature-flagged enqueue/direct-generation compatibility.
- Defined request route integration, status route mapping, pending UI contract, LINE/LIFF/short-code treatment, idempotency, production migration gate, rollback flag, metrics/events, and future implementation tests.
- Created the required execution report.

Learnings:
- Phase 2 should mirror job lifecycle around the existing direct generation path, not switch to enqueue-only before a processor exists.
- Centralizing job mirroring in `requestDeferredPaidGeneration` is the least duplicative path because paid-result request, LIFF bind, and short-code webhook already call that service.

Unresolved questions:
- Phase 2 implementation should decide exact fail-open/fail-closed behavior for job mirroring failures.
- Production `0006_generation_jobs.sql` remains pending and should be applied only before production job flag enablement.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.

## 2026-05-29 - Payment / Entitlement Schema Implementation v0

Completed changes:
- Saved the payment/entitlement schema implementation handoff under `ai-collaboration/handoffs/`.
- Added additive migration `apps/web/drizzle/0007_payment_entitlements.sql`.
- Added Drizzle schema definitions and relations for `payment_intents` and `entitlements`.
- Added payment intent repository seams and entitlement repository seams.
- Added `pa_` paid access token generation/hash helper using a dedicated `PAID_ACCESS_TOKEN_HASH_SECRET`.
- Added MerchantOrderNo generation/validation helper.
- Added unit tests for constants, MerchantOrderNo, paid access token hashing, payment transitions, and entitlement token storage/rotation.
- Confirmed no payment runtime, checkout, NewebPay route, LINE behavior, unlock route behavior, or production behavior was changed.

Learnings:
- The additive schema can be introduced without touching existing runtime routes.
- Raw paid access tokens are only returned by create/rotate helpers and are not stored by repository helpers.
- `generation_jobs.entitlement_ref_id` remains available for future linkage, but it still has no FK in the existing generation jobs table.

Unresolved questions:
- `0007_payment_entitlements.sql` still needs staging migration verification.
- Final NewebPay MerchantOrderNo constraints must be confirmed during provider integration.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.

## 2026-05-29 - Payment / Entitlement Schema Migration Plan v0

Completed changes:
- Saved the payment/entitlement schema migration plan handoff under `ai-collaboration/handoffs/`.
- Inspected current migration numbering, `0006_generation_jobs.sql`, DB schema conventions, fulfillment token hashing, and retention cleanup entry point.
- Created an exact future `0007_payment_entitlements.sql` plan for `payment_intents` and `entitlements`.
- Recommended `amount_minor + currency`, text statuses with app constants, `pa_` paid-access tokens, and a dedicated `PAID_ACCESS_TOKEN_HASH_SECRET`.
- Defined future token resolver, repository helpers, indexes, constraints, retention interaction, refund/re-delivery handling, tests, and rollout phases.
- Confirmed no migration files, app code, payment integration, LINE behavior, or production behavior changed.

Learnings:
- Existing migrations use plain SQL and text status columns, so the first payment migration should stay consistent and enforce status values in app constants/tests.
- `generation_jobs.entitlement_ref_id` can link payment-created jobs without changing the existing job table.
- Paid access should remain retention-limited until account/history infrastructure exists.

Unresolved questions:
- Final NewebPay MerchantOrderNo constraints must be confirmed during provider implementation.
- Owner should approve whether support audit needs `paid_access_token_last_rotated_at` in the first migration.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.

## 2026-05-29 - Payment / Entitlement Schema Plan v0

Completed changes:
- Saved the payment/entitlement schema plan handoff under `ai-collaboration/handoffs/`.
- Inspected current DB schema for `analysis_requests`, `analysis_results`, `analysis_paid_results`, `unlock_intents`, and `generation_jobs`.
- Created a planning report recommending future `payment_intents` for payment/order truth and future `entitlements` for product access truth.
- Recommended a neutral hashed `paid_access_token` on `entitlements` for v0 web-paid access.
- Recommended keeping the existing `/m/{moduleSlug}/unlock/{token}` route externally while adding a future dual resolver for entitlement tokens and legacy unlock-intent tokens.
- Confirmed no migration or app code was changed.

Learnings:
- `generation_jobs.entitlement_ref_id` already anticipates a future entitlement link.
- `unlock_intents` currently carries LINE/short-code delivery state and should not be overloaded as payment truth.
- Refund/re-delivery requires payment and entitlement lifecycle state that does not exist yet.

Unresolved questions:
- Owner must approve whether NT$49 results are retention-limited or longer-lived.
- Owner must approve the v0 token strategy before schema migration work.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.

## 2026-05-29 - Payment Launch Flow + Queue Trigger Architecture v0

Completed changes:
- Saved the payment launch flow + queue trigger handoff under `ai-collaboration/handoffs/`.
- Inspected current unlock, paid-result, `generation_jobs`, processor, cron wrapper, LIFF bind, webhook, and paid-result status assets.
- Created a planning architecture connecting future NewebPay payment success, payment intent/order state, entitlement, `generation_jobs`, queue trigger, web polling, optional LINE delivery, and short-code fallback.
- Recommended future `payment_intents` as payment/order truth and future `entitlements` as product access truth.
- Recommended keeping `unlock_intents` as LINE/LIFF and short-code fulfillment/link infrastructure rather than payment truth.
- Recommended QStash-like signed webhook queue as the payment-launch trigger candidate after a staging POC.

Learnings:
- The current foundation already has a useful `payment_success_future` generation job trigger source.
- The unlocked route and paid-result status route can remain the v0 user-facing polling surface if payment entitlement becomes the authorization source.
- Short-code should stay as fallback/recovery once web payment exists.

Unresolved questions:
- NewebPay approval timing remains unknown.
- Owner must approve whether v0 reuses the current unlock token pattern or introduces a neutral paid-access token model.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.

## 2026-05-29 - Queue / Worker Strategy Evaluation v0

Completed changes:
- Saved the queue/worker strategy handoff under `ai-collaboration/handoffs/`.
- Verified current vendor/platform facts from official sources for Vercel Cron, Upstash QStash, Inngest, Trigger.dev, Google Cloud Tasks, Railway, Fly, and Render.
- Created a research evaluation comparing request kick/manual recovery, Vercel Pro Cron, QStash/webhook queue, Inngest, Trigger.dev, dedicated workers, and Cloud Tasks/Cloud Run.
- Recommended keeping the current `generation_jobs` + processor/manual recovery setup before real payment.
- Recommended QStash-like webhook queue as the payment-launch candidate if a staging proof validates signed delivery, retries, and safe payloads.
- Recommended revisiting Inngest/Trigger.dev later only if follow-up sessions or multi-step workflows become real.
- Created the required execution report.

Learnings:
- Vercel Hobby daily cron is useful only for recovery/readiness, not interactive paid generation.
- The existing `generation_jobs` table and processor endpoint remain useful regardless of trigger provider.
- Queue payloads must stay reference-only; processor should fetch sensitive context server-side from DB.

Unresolved questions:
- NewebPay approval timing remains the main trigger for queue implementation.
- Owner must choose between accepting a new vendor such as QStash or paying for Vercel Pro Cron if payment launch requires near-realtime generation.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.

## 2026-05-29 - Paid Generation Job Foundation Phase 3D Cron Schedule Gate v0

Completed changes:
- Saved the Phase 3D cron schedule gate handoff under `ai-collaboration/handoffs/`.
- Added `/api/cron/paid-generation` to `apps/web/vercel.json`; the requested 5-minute cadence was rejected by Vercel Hobby limits, so the committed cadence is daily `30 17 * * *`.
- Preserved the existing retention cleanup cron schedule.
- Added a config test to lock the paid-generation cron path and cadence.
- Updated the production deployment runbook with the configured schedule and processor-disabled safety posture.
- Confirmed production `CRON_SECRET` is configured and production `ENABLE_PAID_GENERATION_PROCESSOR` is absent.
- Confirmed production `generation_jobs` aggregate counts are zero for total, due paid-analysis, processing, and failed-final jobs.
- Verified staging wrapper safety: missing auth returns `401`; valid dry-run returns aggregate zero-work output.
- Deployed the Hobby-safe schedule config to staging and confirmed the final build marker reports commit `bc67507b82a4`.
- Created the required review bundle and execution report.

Learnings:
- Mode A is the safest schedule gate posture: commit the schedule while production processor remains disabled until explicit approval.
- The schedule config alone does not change production until an approved production deployment applies it.
- Sub-daily paid-generation cron requires Vercel plan/support approval.

Unresolved questions:
- Production scheduled-run verification remains pending a separate approved production deploy.
- Phase 3A temporary Vercel project cleanup remains an owner/operator console task.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.

## 2026-05-29 - Paid Generation Job Foundation Phase 3C Cron Wrapper v0

Completed changes:
- Saved the Phase 3C cron wrapper handoff under `ai-collaboration/handoffs/`.
- Added `GET /api/cron/paid-generation` as a Vercel-Cron-friendly wrapper.
- Added `CRON_SECRET`-only bearer auth for the cron wrapper.
- Kept `INTERNAL_JOB_SECRET` reserved for the manual/operator processor endpoint; the cron wrapper does not accept it.
- Delegated wrapper execution to the existing paid-generation processor with `paid_analysis`, `limit=1`, safe cron lock label, and optional `dryRun=1`.
- Preserved `ENABLE_PAID_GENERATION_PROCESSOR` as the execution gate.
- Added route/auth tests for missing/invalid auth, no query-string secret, disabled flag, safe delegation, aggregate-only response, and dry-run behavior.
- Updated the production deployment runbook with cron wrapper usage and safety rules.
- Deployed the committed wrapper to staging and verified missing auth returns `401` and valid `CRON_SECRET` dry-run returns aggregate zero-work output.
- Created the required review bundle and execution report.

Learnings:
- A dedicated cron auth helper keeps Vercel Cron authorization distinct from manual internal processor authorization.
- The cron wrapper can remain safe without a schedule because it requires both `CRON_SECRET` bearer auth and the processor feature flag.

Unresolved questions:
- Future cron schedule enablement still requires explicit approval.
- Phase 3A temporary Vercel project cleanup remains an operator console task.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.

## 2026-05-29 - Paid Generation Job Foundation Phase 3B Cron Trigger Plan v0

Completed changes:
- Saved the Phase 3B cron trigger plan handoff under `ai-collaboration/handoffs/`.
- Reviewed the current Phase 3A processor state and existing retention-cleanup cron auth pattern.
- Verified the repo currently uses `apps/web/vercel.json` for `/api/cron/retention-cleanup` and bearer-secret auth in the cron route.
- Checked current Vercel Cron documentation and confirmed `CRON_SECRET` is sent as an `Authorization: Bearer` header for cron invocations.
- Created a research plan recommending manual/operator trigger for now, then a future dedicated `GET /api/cron/paid-generation` wrapper with `CRON_SECRET`, `ENABLE_PAID_GENERATION_PROCESSOR`, `paid_analysis`, `limit=1`, and aggregate-only response.
- Documented cadence, max jobs, staging verification, production rollout, rollback, metrics, cost guardrails, and temporary Vercel deployment cleanup recommendation.
- Created the required execution report.

Learnings:
- The existing `POST /api/internal/jobs/process` is appropriate for manual/operator calls, but a future Vercel Cron integration should probably use a dedicated `GET` cron wrapper route to match the current repo pattern and Vercel examples.
- A 5-minute production cadence with `limit=1` is safer than 1-minute cron until real queued jobs require faster delivery.

Unresolved questions:
- Owner approval is required before adding cron config or enabling any production processor behavior.
- The unintended temporary Vercel project from Phase 3A should be removed or confirmed harmless in the Vercel console.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.

## 2026-05-29 - Paid Generation Job Foundation Phase 3A Processor Endpoint v0

Completed changes:
- Saved the Phase 3A processor endpoint handoff under `ai-collaboration/handoffs/`.
- Added secret-gated `POST /api/internal/jobs/process` for aggregate-only `paid_analysis` job processing.
- Added `ENABLE_PAID_GENERATION_PROCESSOR`, disabled by default.
- Added internal job bearer auth using `INTERNAL_JOB_SECRET` with `CRON_SECRET` fallback.
- Added atomic due-job claiming with `FOR UPDATE SKIP LOCKED`.
- Added stale processing-lock recovery into retry-scheduled or failed-final states.
- Added a paid-analysis processor service that reuses paid-generation provider/fallback payload generation, persists completed paid results, and marks jobs completed/retry/final by safe category.
- Added tests for feature flags, internal auth, claim/stale recovery helpers, processor service flows, endpoint security, and privacy-safe response shape.
- Deployed the current candidate to staging, enabled the processor only on staging, processed one synthetic queued job to completed provider output, and verified the unlocked page rendered completed paid content.
- Confirmed production processor flag/secret names were absent.
- Created the required review bundle and execution report.

Learnings:
- Phase 3A can process queued paid-analysis jobs without changing current request-route behavior.
- `analysis_paid_results` remains the delivery truth; completed jobs are only useful when the paid-result row is present.
- Processor responses should remain aggregate-only to avoid leaking job refs, dedupe keys, tokens, or paid-result details.

Unresolved questions:
- Production processor activation remains pending explicit approval.
- Vercel Cron scheduling and cadence remain Phase 3B scope.
- Direct paid-generation request orchestration should be consolidated further with the shared generation helper in a later cleanup.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.

## 2026-05-28 - Paid Generation Job Foundation Phase 2 Enqueue / Status Integration v0

Completed changes:
- Saved the Phase 2 enqueue/status integration handoff under `ai-collaboration/handoffs/`.
- Added private `ENABLE_PAID_GENERATION_JOBS` feature flag support, disabled by default.
- Wired `requestDeferredPaidGeneration` to optionally create/reuse `paid_analysis` jobs and mirror processing/completed/failed-final lifecycle while preserving direct provider/fallback generation.
- Updated paid-result status polling to optionally read `generation_jobs` as a secondary signal without exposing job internals.
- Passed safe trigger sources for web unlock, LIFF bind, and short-code paths without changing user-facing LINE/LIFF behavior.
- Added tests for flag behavior, service mirroring, fail-open behavior, fallback completion, status mapping, and privacy-safe responses.
- Updated the production deployment runbook with the `0006_generation_jobs.sql` and `ENABLE_PAID_GENERATION_JOBS=false` production gate.

Learnings:
- Phase 2 can be implemented as a fail-open mirror, keeping `analysis_paid_results` as the delivery source until a future processor exists.
- Status polling should treat completed paid result rows as authoritative; completed jobs without paid result rows remain pending because the job table is not the delivery truth yet.

Unresolved questions:
- Live staging flag-on verification remains pending after deployment.
- Production `0006_generation_jobs.sql` remains pending and the production flag must stay disabled until migration verification.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.

## 2026-05-28 - Paid Generation Job Foundation Phase 2 Staging Flag Verification v0

Completed changes:
- Saved the staging flag verification handoff under `ai-collaboration/handoffs/`.
- Confirmed staging served commit `21c1907f61f6` from branch `staging`.
- Ran flag-off staging smoke and confirmed `generation_jobs` stayed at `0`.
- Enabled `ENABLE_PAID_GENERATION_JOBS=true` for Vercel Preview/Staging branch `staging` only.
- Redeployed staging and repointed `staging.anyu.tw` to the fresh preview deployment.
- Ran flag-on synthetic paid-generation smoke and confirmed one `paid_analysis` job reached `completed`.
- Confirmed repeat paid request reused the existing paid result/job path and did not create a duplicate job.
- Confirmed status route returned external `completed` without job internals.
- Confirmed production env listing did not include `ENABLE_PAID_GENERATION_JOBS`.
- Created the required review bundle and execution report.

Learnings:
- Phase 2 mirror behavior works on staging with delivery truth still in `analysis_paid_results`.
- Flag-off behavior is safe for deployments where production migration is pending.

Unresolved questions:
- Production `0006_generation_jobs.sql` and production flag enablement remain pending separate approval.
- Owner should choose between a production migration gate next or a Phase 3 processor/cron plan.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.

## 2026-05-29 - Paid Generation Job Foundation Phase 2 Production Migration Gate v0

Completed changes:
- Saved the production migration gate handoff under `ai-collaboration/handoffs/`.
- Confirmed production `ENABLE_PAID_GENERATION_JOBS` was absent before migration.
- Confirmed production `generation_jobs` table was absent before migration.
- Applied only `apps/web/drizzle/0006_generation_jobs.sql` to the Neon production branch.
- Verified production `generation_jobs` columns, defaults, primary key, unique dedupe index, and required query indexes.
- Ran flag-disabled production route/API smoke for health, landing, analyze, result, unlock intent, paid generation, status, unlocked route, LIFF bridge, invalid LIFF bind, invalid webhook signature, and empty-events webhook.
- Confirmed production `generation_jobs` row count remained `0` after normal runtime smoke.
- Confirmed production `ENABLE_PAID_GENERATION_JOBS` remained absent after migration/smoke.
- Created the required review bundle and execution report.

Learnings:
- Production schema is now ready for paid generation job mirroring, but runtime behavior remains unchanged while the flag is absent.
- Additive production migration did not affect current direct paid generation behavior.

Unresolved questions:
- Owner approval is still required before any production flag-on smoke.
- Phase 3 processor/cron design remains pending.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.

## 2026-05-29 - Paid Generation Job Foundation Phase 3 Processor / Cron Plan v0

Completed changes:
- Saved the Phase 3 processor/cron plan handoff under `ai-collaboration/handoffs/`.
- Inspected the current `generation_jobs` repository helpers, paid generation service, status route, pending poller, provider error categories, and existing cron authorization pattern.
- Created a planning report recommending Phase 3A: a narrow `paid_analysis` processor in isolation before any request-route enqueue-only switch.
- Defined processor endpoint security, aggregate-only response contract, atomic claim/lock design, stale lock recovery, paid analysis processing flow, retry/backoff/fallback policy, status route contract, cron/operator trigger strategy, metrics, feature flags, production safety, and deferred scope.
- Created the required execution report.

Learnings:
- Existing `listDueGenerationJobs` is useful for inspection but should not be reused as a concurrent processor claim primitive.
- Processor implementation should extract shared paid-generation execution logic from `requestDeferredPaidGeneration` to avoid drift.

Unresolved questions:
- Owner must approve fallback/support policy before real-payment paid job processing.
- Implementation should decide between dedicated `INTERNAL_JOB_SECRET` and shared `CRON_SECRET`.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.

## 2026-05-29 - Payment / Entitlement Schema Staging Migration Verification v0

Completed changes:
- Saved the staging migration verification handoff under `ai-collaboration/handoffs/`.
- Confirmed staging served commit `87ac2f4c3120` from branch `staging`.
- Applied only `apps/web/drizzle/0007_payment_entitlements.sql` to the staging database.
- Verified `payment_intents` table existence, expected columns, key defaults, indexes, unique constraint, and foreign keys.
- Verified `entitlements` table existence, expected columns, key defaults, indexes, partial unique token-hash constraint, and foreign keys.
- Ran synthetic staging-safe payment/entitlement SQL smoke and cleaned up all synthetic rows.
- Verified token safety with aggregate checks only: raw token shape was not stored, old token hash no longer resolved after rotation, and new token hash resolved during the controlled smoke.
- Ran staging route/API regression checks for health, landing, LIFF bridge, webhook guards, analyze, result, unlock intent, paid generation request, paid status, and unlocked route.
- Confirmed normal runtime routes did not write to `payment_intents` or `entitlements`; both final row counts were `0`.
- Created the required review bundle and execution report.

Learnings:
- The additive payment entitlement schema is staging-ready and does not affect current runtime routes while payment remains disabled.
- Existing route guards remained intact after the staging migration.

Unresolved questions:
- Production `0007_payment_entitlements.sql` remains pending by design.
- Owner should decide whether to run a production migration gate now for schema readiness or defer until payment runtime integration is closer.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.

## 2026-05-29 - Payment / Entitlement Schema Production Migration Gate v0

Completed changes:
- Saved the production migration gate handoff under `ai-collaboration/handoffs/`.
- Confirmed production health returned HTTP 200 before migration.
- Confirmed production did not have `payment_intents` or `entitlements` before migration.
- Confirmed required referenced tables existed before migration.
- Applied only `apps/web/drizzle/0007_payment_entitlements.sql` to the production database after explicit operator confirmation.
- Verified `payment_intents` table existence, expected columns, key defaults, indexes, unique constraint, and foreign keys.
- Verified `entitlements` table existence, expected columns, key defaults, indexes, partial unique token-hash constraint, and foreign keys.
- Ran safe production route/API regression checks for health, landing, LIFF bridge, webhook guards, analyze, result, unlock intent, paid generation request, paid status, and unlocked route.
- Confirmed normal production routes did not write to `payment_intents` or `entitlements`; both final row counts were `0`.
- Created the required review bundle and execution report.

Learnings:
- Production schema is now ready for future payment entitlement work while runtime payment behavior remains disabled.
- Production health currently exposes service health but not a git commit marker, which is a useful ops visibility gap to close later.

Unresolved questions:
- NewebPay/payment runtime integration remains pending and should not be implemented until provider path is approved.
- Paid access token resolver behavior remains unimplemented by design.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.

## 2026-05-29 - NewebPay Runtime Integration Plan v0

Completed changes:
- Saved the NewebPay runtime integration handoff under `ai-collaboration/handoffs/`.
- Inspected current Module 01 unlock/paid preview behavior, payment intent helpers, entitlement helpers, paid access token helper, generation job repository, processor endpoint, cron wrapper, and feature flags.
- Created a planning report for future NewebPay checkout, return, notify, payment intent transitions, entitlement creation, paid access token issuance, generation job creation, queue trigger strategy, web polling, LINE optional delivery, failure handling, flags, staging strategy, and tests.
- Confirmed no app code, DB schema, payment behavior, LINE behavior, prompt/schema behavior, or production behavior was changed.

Learnings:
- The most important next implementation seam is the `pa_` paid access token resolver; checkout should not be added before web paid access can resolve independently of LINE.
- Notify should be the payment truth; return should be treated as UX/pending unless independently verified.
- Queue trigger should initially be trigger-only and let the processor claim due jobs rather than placing sensitive refs in payloads.

Unresolved questions:
- Exact NewebPay payload/hash fields should be confirmed after provider approval.
- Refund/re-delivery SOP should be finalized before production payment launch.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.

## 2026-05-29 - Paid Access Token Resolver Plan v0

Completed changes:
- Saved the paid access token resolver plan handoff under `ai-collaboration/handoffs/`.
- Created a planning document defining the `pa_` token model, resolver contract, access states, security/privacy requirements, idempotency/recovery behavior, web polling contract, DB constraint recommendations, and NewebPay integration boundaries.
- Recommended implementing a minimal `pa_` resolver before NewebPay checkout/provider runtime.
- Recommended an operator-only fake paid success flow after resolver implementation and before provider runtime.
- Confirmed no code, schema, migration, payment runtime, checkout, NewebPay endpoint, LINE behavior, prompt/result behavior, legal copy, feature flag, or production behavior was changed.

Learnings:
- `pa_` should remain opaque random and hash-at-rest; signed/derived tokens add unnecessary exposure risk for v0.
- The unlocked route should become a dual resolver: `pa_` entitlement token first, legacy unlock-intent token second.
- DB-level uniqueness for `entitlements.payment_intent_id` should be considered before payment launch, but not as part of this planning task.

Unresolved questions:
- Exact NewebPay provider payload/hash fields remain pending provider approval.
- Missing generation-job recovery can start read-only in resolver v0 or become an idempotent helper during operator fake-paid implementation.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.

## 2026-05-29 - Paid Access Token Resolver Implementation v0

Completed changes:
- Implemented a minimal read-path `pa_` paid access token resolver.
- Added `hasPaidAccessTokenPrefix` and routed `pa_` tokens before legacy unlock-intent lookup.
- Added normalized resolver states: `ready`, `pending`, `processing`, `failed`, `revoked`, `refunded`, `not_found`, `expired`, `missing_generation_job`, and `recovery_required`.
- Updated the unlocked route to render valid `pa_` paid access links through the same completed/pending surfaces used by legacy unlock links.
- Updated the paid-result status route to support `pa_` tokens with privacy-safe external statuses.
- Added targeted resolver/status/static-order tests.
- Confirmed no checkout, NewebPay notify/return, payment provider verification, fake paid success, queue trigger, LINE delivery, migration, production flag, prompt/result, legal copy, or production behavior change was made.

Learnings:
- The safest unlock route integration is prefix-first: any `pa_` token stays in paid-access handling and never falls back to legacy unlock lookup.
- A read-only resolver can represent missing generation jobs safely, but the next QA phase needs operator fake paid success to exercise the complete post-payment path.

Unresolved questions:
- Missing generation-job recovery should remain read-only or become an idempotent helper during operator fake-paid implementation.
- `entitlements.payment_intent_id` uniqueness and paid access lookup rate limiting remain deferred.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.

## 2026-05-29 - Operator-only Fake Paid Success v0

Completed changes:
- Added `POST /api/operator/fake-paid-success` for staging QA.
- Gated the route behind both `ENABLE_OPERATOR_FAKE_PAID_SUCCESS=true` and valid `x-operator-test-secret` / `OPERATOR_TEST_SECRET`.
- Implemented deterministic fake payment intent creation/reuse with `provider = operator_fake`.
- Marked fake payment intents paid with safe operator metadata.
- Created operator-test entitlements when missing and returned raw `pa_` token only on first entitlement creation.
- Created/reused paid generation jobs with `triggerSource = operator` and `entitlementRefId`.
- Left processor execution manual/signed; no queue trigger or provider generation was launched by the route.
- Added service and route tests for gating, idempotency, token handling, and missing-job recovery.
- Confirmed no NewebPay checkout/notify/return, real payment runtime, public checkout UI, queue trigger integration, LINE delivery, refund tooling, prompt/result change, legal copy change, or production flag change was made.

Learnings:
- The operator fake path can safely exercise the internal paid access chain while keeping provider/runtime payment disabled.
- Raw `pa_` token handling must remain first-response-only because existing storage is hash-only.

Unresolved questions:
- Decide after staging QA whether to keep this endpoint as long-term operator tooling or remove it after provider smoke.
- `entitlements.payment_intent_id` uniqueness and paid access lookup rate limiting remain deferred.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.

## 2026-05-29 - Staging Fake Paid Delivery QA v0

Completed changes:
- Created a QA handoff and execution report for the staging fake paid delivery chain smoke.
- Confirmed staging is deployed at `6ecacea`, the operator fake paid success implementation commit.
- Confirmed staging normal Module 01 analyze, result page load, legacy unlock intent creation, and legacy unlock page load pass.
- Confirmed invalid synthetic `pa_` paid access returns a safe invalid/expired response and does not fall back to legacy unlock behavior.
- Confirmed staging processor and paid-generation cron endpoints reject missing authorization.
- Confirmed the fake-paid QA chain could not run because staging returns the feature-disabled `404` response for `/api/operator/fake-paid-success`.
- Confirmed no raw `pa_` token, tokenized URL, operator secret, provider credential, raw input, provider output, `paid_result_json`, LINE ID, or private access value was recorded.

Learnings:
- The deployed code is fresh, but staging needs `ENABLE_OPERATOR_FAKE_PAID_SUCCESS=true` before the operator fake-paid endpoint reaches the secret check.
- The valid `pa_` delivery chain cannot be verified without both the staging gate and approved operator secret.

Unresolved questions:
- Whether to enable `ENABLE_OPERATOR_FAKE_PAID_SUCCESS=true` on staging for the next QA rerun.
- Whether the next rerun should also provide the internal processor secret so the same pass can process the created paid generation job.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.

## 2026-05-29 - Staging Fake Paid Delivery QA Rerun with Authorized Operator Gate v0

Completed changes:
- Created a rerun handoff and execution report for authorized staging fake paid delivery QA.
- Confirmed staging is deployed at `93cf4d9` on the `staging` branch.
- Confirmed `/api/operator/fake-paid-success` still returns the feature-disabled `404` response on staging for missing and invalid operator secret requests.
- Confirmed local `OPERATOR_TEST_SECRET`, `INTERNAL_JOB_SECRET`, and `CRON_SECRET` were not available in this session.
- Confirmed Vercel CLI access was not authenticated in this sandbox, so staging env values were not changed.
- Reran non-secret staging checks: normal Module 01 analyze/result, legacy unlock, invalid synthetic `pa_` status, invalid synthetic `pa_` unlock page, processor missing-auth, and cron missing-auth checks.
- Confirmed no raw `pa_` token, tokenized URL, operator secret, provider credential, raw user input, provider output, `paid_result_json`, LINE ID, or private value was recorded.

Learnings:
- The authorized fake-paid chain remains blocked by staging env configuration, not by the deployed code path.
- Missing/invalid fake-paid requests should return `401` only after `ENABLE_OPERATOR_FAKE_PAID_SUCCESS=true` is active; current `404` means the flag is still disabled.

Unresolved questions:
- Who will enable `ENABLE_OPERATOR_FAKE_PAID_SUCCESS=true` for staging/preview only.
- How the approved operator and processor secrets should be made available to the QA shell without exposing them in chat or committed docs.
- Final commit hash and staging push status are recorded in the final completion summary.

## 2026-05-29 - Staging Operator Fake-Paid Env Setup Runbook + Preflight v0

Completed changes:
- Created a staging-only fake-paid environment setup runbook and preflight checklist.
- Documented required Preview/Staging env vars: `ENABLE_OPERATOR_FAKE_PAID_SUCCESS`, `OPERATOR_TEST_SECRET`, optional `INTERNAL_JOB_SECRET`, and optional `CRON_SECRET`.
- Documented that production fake-paid and payment runtime must remain disabled.
- Added safe missing/invalid/valid-secret preflight criteria without including real secrets.
- Added redaction rules for raw `pa_` tokens, tokenized URLs, secrets, provider credentials, raw input, provider output, and private values.
- Added the exact next QA trigger: rerun Staging Fake Paid Delivery QA with authorized operator gate after manual env setup and staging redeploy.

Learnings:
- The current `404` vs `401` route behavior is sufficient to identify whether the fake-paid flag is disabled or the operator secret check is active.
- A future aggregate-only preflight endpoint could reduce repeated blocked QA attempts, but it is not required before the next manual env setup.

Unresolved questions:
- Who will perform the authenticated Vercel staging env setup.
- Whether the next authorized QA run should include the manual processor path with `INTERNAL_JOB_SECRET`.
- Final commit hash and staging push status are recorded in the final completion summary.

## 2026-05-29 - Authorized Staging Fake Paid Delivery QA v0

Completed changes:
- Created an authorized staging fake paid delivery QA handoff and execution report.
- Confirmed local repo and `origin/staging` are at `859b801`.
- Confirmed local `OPERATOR_TEST_SECRET`, `INTERNAL_JOB_SECRET`, and `CRON_SECRET` were not available in this shell.
- Confirmed staging health returns HTTP 200 but no build marker fields.
- Confirmed `/api/operator/fake-paid-success` on staging returns a generic Next.js HTML 404 rather than the implemented JSON route response.
- Reran safe staging checks: normal Module 01 analyze/result and legacy unlock pass.
- Confirmed invalid synthetic `pa_` access remains safe, but staging returned the legacy invalid-unlock category rather than the expected paid-access category.
- Confirmed no raw `pa_` token, tokenized URL, operator secret, processor secret, provider credential, raw input, provider output, `paid_result_json`, LINE ID, or private value was recorded.

Learnings:
- Authorized fake-paid QA is now blocked by staging deployment/route freshness, not just by the feature flag.
- The current staging runtime appears to be missing at least `/api/operator/fake-paid-success` and may be missing paid-access resolver status behavior.
- Health marker absence makes staging freshness harder to verify operationally.

Unresolved questions:
- Which Vercel deployment/alias is currently serving `staging.anyu.tw`.
- Whether the staging deployment is using the expected `apps/web` project root and latest `origin/staging` build.
- How approved operator and processor secrets should be made available to the QA shell without exposing them.
- Final commit hash and staging push status are recorded in the final completion summary.

## 2026-05-29 - Staging Deployment Freshness + Build Marker Recovery v0

Completed changes:
- Investigated the `/api/health` build marker implementation and staging route-bundle mismatch.
- Confirmed current source already returns safe marker fields with `unknown` fallbacks when env is missing.
- Confirmed current local build output includes `/api/operator/fake-paid-success` and paid-result status routes.
- Added a static safe `routeBundleVersion: payment-foundation-2026-05-29` marker to `/api/health` so future staging checks can confirm the expected payment-foundation route bundle is deployed.
- Updated health route tests for the route bundle marker.
- Documented expected route-controlled fake-paid responses vs generic Next 404 route-missing behavior.
- Documented owner/operator Vercel checks required because CLI access was not authenticated in this session.
- Confirmed no payment runtime, NewebPay, checkout, queue, LINE delivery, prompt/result, legal copy, production flag, secret, or private value change was made.

Learnings:
- If `/api/health` lacks `app` and marker fields entirely, staging is serving an older or mismatched route bundle; missing Vercel git env alone would still produce marker fields with `unknown` values.
- Current local `next build` includes `/api/operator/fake-paid-success`, so staging generic 404 is a deployment/alias freshness issue rather than missing source code.

Unresolved questions:
- Which Vercel deployment/alias is currently serving `staging.anyu.tw`.
- Whether the Vercel project assigned to `staging.anyu.tw` is building from the expected `apps/web` root and `origin/staging` branch.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.

## 2026-05-29 - Staging Route Bundle Freshness Preflight v0

Completed changes:
- Ran a lightweight staging route-bundle freshness preflight after deployment of `0877011`.
- Confirmed `/api/health` exposes `routeBundleVersion: payment-foundation-2026-05-29` and safe marker fields for commit `0877011925ba` on branch `staging`.
- Confirmed `/api/operator/fake-paid-success` exists on staging and returns route-controlled JSON `401 unauthorized` for missing and invalid operator secrets, not generic HTML 404.
- Confirmed invalid synthetic `pa_` status returns `invalid_paid_access`, showing paid-access resolver status behavior is present.
- Confirmed normal analyze/result and legacy unlock still work.
- Confirmed production fake-paid route is not publicly usable from a missing-secret request.
- Recorded only sanitized statuses/booleans; no secrets, raw `pa_` token, tokenized URL, raw input, provider output, or private value was recorded.

Learnings:
- Staging route freshness is now verified for the payment-foundation route bundle.
- The environment is ready for the next authorized fake-paid QA pass once `OPERATOR_TEST_SECRET` and optional `INTERNAL_JOB_SECRET` are available securely to the QA shell.

Unresolved questions:
- Whether the next authorized QA run should include processor completion through `INTERNAL_JOB_SECRET` or stop at fake-paid/idempotency/status pre-processor states.
- Final commit hash and staging push status are recorded in the final completion summary.

## 2026-05-29 - Authorized Staging Fake Paid Delivery QA v1

Completed changes:
- Created an authorized staging fake paid delivery QA v1 handoff and execution report.
- Confirmed staging health marker is present at commit `34a838c4d282`, branch `staging`, with `routeBundleVersion: payment-foundation-2026-05-29`.
- Confirmed `/api/operator/fake-paid-success` returns route-controlled JSON `401 unauthorized` for missing and invalid operator secrets.
- Confirmed normal Module 01 analyze/result and legacy unlock still pass.
- Confirmed invalid synthetic `pa_` status returns `invalid_paid_access` and invalid `pa_` unlock page returns a safe page.
- Confirmed production fake-paid route is not publicly usable from a missing-secret request.
- Confirmed authorized fake-paid success, idempotency, valid `pa_` status polling, processor completion, and completed `pa_` unlock rendering could not run because the QA shell did not have `OPERATOR_TEST_SECRET` or `INTERNAL_JOB_SECRET`.
- Confirmed no raw `pa_` token, tokenized URL, operator secret, processor secret, provider credential, raw input, provider output, `paid_result_json`, LINE ID, or private value was recorded.

Learnings:
- Staging route freshness is fixed; the remaining blocker is secure local secret availability.
- The route now correctly distinguishes missing/invalid secret with JSON `401`, so the authorized chain should be able to run once `OPERATOR_TEST_SECRET` is injected into the shell.

Unresolved questions:
- How the approved operator and processor secrets should be provided to the QA shell without exposing them in chat, command output, or committed docs.
- Final commit hash and staging push status are recorded in the final completion summary.

## 2026-05-29 - Secret-Safe Authorized Fake-Paid QA Runner v0

Completed changes:
- Added `apps/web/scripts/authorized-fake-paid-qa.mjs`, a local-only staging QA runner for the authorized fake-paid delivery chain.
- Added `corepack pnpm qa:fake-paid` to `apps/web/package.json`.
- Documented how the owner/operator should inject `OPERATOR_TEST_SECRET` and `INTERNAL_JOB_SECRET` through local environment variables without printing them.
- Ensured the runner emits sanitized newline-delimited JSON and never prints raw secrets, raw `pa_` tokens, tokenized URLs, raw input, provider output, `paid_result_json`, LINE IDs, or private values.
- The runner keeps the raw `pa_` token in memory only for status polling and unlock-page checks.
- The runner reports id/status presence booleans and redacted route shapes instead of raw ids or bearer links.
- No payment runtime, production flag, NewebPay, checkout, queue, LINE delivery, prompt/result, legal copy, or public behavior change was made.

Learnings:
- A local runner is the safest path for authorized QA because it avoids placing secrets in chat or committed docs while still producing paste-safe output.
- The runner can distinguish full pass, partial pass without processor secret, and blocked preflight/secret states.

Unresolved questions:
- Whether the first real runner execution will reveal any fake-paid/processor behavior issue that needs a small implementation fix.
- Final validation results, commit hash, and staging push status are recorded in the final completion summary.

## 2026-05-29 - Debug Authorized Fake-Paid 500 on Staging v0

Completed changes:
- Root-caused the authorized fake-paid 500 to missing paid access token hash configuration during first-time `operator_test` entitlement creation.
- Added a pre-write guard that returns safe `503 paid_access_token_config_missing` when no entitlement exists and `PAID_ACCESS_TOKEN_HASH_SECRET` is unavailable.
- Added safe fake-paid error categories for payment intent creation/transition, entitlement/token creation, and generation job creation failures.
- Updated the secret-safe fake-paid QA runner to stop with a sanitized blocked summary on categorized fake-paid failure instead of throwing a secondary `paid_access_token_missing` error.
- Added targeted service and route tests for missing token config, token creation failure, and safe route error categories.
- Confirmed no payment runtime, production flag, NewebPay, checkout, queue trigger, LINE delivery, prompt/result, legal copy, secret, raw `pa_` token, or tokenized URL change was made.

Learnings:
- The staging route bundle and operator gate are healthy; the authorized business path needs `PAID_ACCESS_TOKEN_HASH_SECRET` in addition to `OPERATOR_TEST_SECRET` and processor secret for full QA.
- Failing before token-hash config is present prevents new partial fake-paid rows and gives the operator a concrete safe blocker category.
- The local no-secret QA runner remains safe to execute and reports route/gate preflight without exposing secrets.

Unresolved questions:
- Staging must be configured with `PAID_ACCESS_TOKEN_HASH_SECRET`, redeployed with this fix, and rerun with operator/processor secrets before full fake-paid QA can be claimed passed.
- Final commit hash and staging push status are recorded in the final completion summary.

## 2026-05-29 - Rerun Authorized Staging Fake Paid Delivery QA after PAID_ACCESS_TOKEN_HASH_SECRET v0

Completed changes:
- Created a handoff and QA result report for the attempted authorized staging fake-paid rerun after `PAID_ACCESS_TOKEN_HASH_SECRET` was reportedly configured.
- Ran the secret-safe QA runner from `apps/web` and recorded only sanitized output.
- Confirmed the authorized fake-paid business path was not reached.
- Confirmed this Codex shell did not have `OPERATOR_TEST_SECRET`, `INTERNAL_JOB_SECRET`, or `PAID_ACCESS_TOKEN_HASH_SECRET` available.
- Observed staging route-bundle freshness failure: `/api/health` marker fields were missing, fake-paid route returned generic HTML 404, and invalid synthetic `pa_` behavior returned legacy `invalid_unlock`.
- Recorded no secrets, raw `pa_` tokens, tokenized URLs, raw input, provider output, LINE IDs, or private values.

Learnings:
- The current blocker is preflight/deployment freshness plus missing secrets in the Codex shell, not a verified fake-paid business-path failure.
- Staging must again prove it is serving the payment-foundation route bundle before authorized QA is meaningful.

Unresolved questions:
- Which deployment or alias is currently serving `staging.anyu.tw`.
- Whether the owner/operator shell, outside Codex, has the required secrets available for the next rerun.
- Final commit hash and staging push status are recorded in the final completion summary.

## 2026-05-29 - Vercel Staging Deployment Alias Stability Audit v0

Completed changes:
- Audited local/source state and confirmed local `staging` matches `origin/staging` at `ab55a7c`.
- Confirmed source contains `ROUTE_BUNDLE_VERSION = payment-foundation-2026-05-29` and the fake-paid route file.
- Ran `cd apps/web && corepack pnpm build`; build passed and included `/api/health`, `/api/operator/fake-paid-success`, and paid-result status routes.
- Ran non-secret live staging checks and confirmed `staging.anyu.tw` currently serves the expected route bundle at commit `ab55a7c`.
- Confirmed fake-paid missing/invalid secret responses are route-controlled JSON `401`, and invalid synthetic `pa_` returns `invalid_paid_access`.
- Confirmed Vercel CLI is unavailable in this workspace, so project/domain/alias internals require owner/operator Vercel UI inspection.
- Recorded no secrets, raw `pa_` tokens, tokenized URLs, raw input, provider credentials, LINE IDs, or private values.

Learnings:
- The previous staging regression was not reproducible during this audit; live staging had recovered to the expected payment-foundation route bundle.
- The earlier symptoms remain consistent with an old/mismatched deployment or alias target, but exact root cause cannot be proven without Vercel deployment/alias access.
- A non-secret staging freshness gate should be run immediately before any secret-dependent fake-paid QA.

Unresolved questions:
- Whether `staging.anyu.tw` was temporarily aliased to an older deployment, built from a wrong branch/root, or redeployed from an older commit after env changes.
- Final commit hash and staging push status are recorded in the final completion summary.

## 2026-05-29 - Debug Staging Processor Manual Completion 401 in Fake-Paid QA v0

Completed changes:
- Inspected the processor endpoint, internal job auth helper, route tests, and secret-safe QA runner.
- Confirmed the runner and endpoint agree on the auth contract: `POST /api/internal/jobs/process` with `Authorization: Bearer <INTERNAL_JOB_SECRET>`.
- Determined the owner-reported HTTP `401 unauthorized` most likely means local `INTERNAL_JOB_SECRET` does not match the active Vercel Preview/Staging secret, or staging was not redeployed after a secret change.
- Added safe runner diagnostics for processor endpoint path, auth-header presence, and auth mode label without exposing secret values or derived values.
- Confirmed no NewebPay, payment runtime, production flag, queue trigger, LINE delivery, prompt/result, legal copy, raw `pa_` token, tokenized URL, or private-data behavior changed.

Learnings:
- A processor `401` is distinct from `503 config_error` and `403 processor_disabled`; it indicates the route was reached but bearer auth did not match the configured secret.
- The fake-paid creation, entitlement, idempotency, and paid-access polling path passed in the owner run; only processor auth remains blocked.

Unresolved questions:
- Whether Vercel Preview/Staging `INTERNAL_JOB_SECRET` matches the owner/operator local shell value.
- Whether staging was redeployed after the latest `INTERNAL_JOB_SECRET` update.
- Final commit hash and staging push status are recorded in the final completion summary.

## 2026-05-30 - Deep Debug Processor Auth 401 with Secret-Safe Diagnostics v0

Completed changes:
- Inspected the processor route, internal job auth helper, feature flags, runner, and route/auth tests.
- Confirmed the processor auth contract is `POST /api/internal/jobs/process` with `Authorization: Bearer <INTERNAL_JOB_SECRET>`.
- Confirmed the route reads `INTERNAL_JOB_SECRET` first and falls back to `CRON_SECRET`; `ENABLE_PAID_GENERATION_PROCESSOR` is checked only after auth succeeds.
- Added secret-safe auth diagnostics for unauthorized non-production processor requests when `x-processor-auth-diagnostic: 1` is present.
- Updated the fake-paid QA runner to request and record the safe processor auth diagnostic on 401.
- Added tests proving diagnostics expose only booleans/categories and are suppressed in production mode.
- Confirmed no payment runtime, NewebPay, queue trigger, LINE delivery, production flag, prompt/result, public legal copy, raw `pa_` token, tokenized URL, or secret behavior changed.

Learnings:
- A persistent processor `401` after this commit should now identify whether the header is missing/stripped, malformed, using fallback `CRON_SECRET`, missing runtime secret config, or simply mismatched.
- If auth succeeds but the processor flag is off, the expected next blocker is `403 processor_disabled`, not `401`.

Unresolved questions:
- What sanitized `authDiagnostic` will show in the owner/operator environment if processor 401 persists after staging deploy.
- Final commit hash and staging push status are recorded in the final completion summary.

## 2026-05-30 - Directly Align Vercel Preview INTERNAL_JOB_SECRET and Rerun Fake-Paid QA v0

Completed changes:
- Ran preflight checks before any Vercel env mutation.
- Confirmed local `staging` matched `origin/staging` at `6c3d45e` and the worktree was clean before documentation was created.
- Confirmed the Codex shell did not have `vercel` CLI available.
- Confirmed `OPERATOR_TEST_SECRET`, `INTERNAL_JOB_SECRET`, and `PAID_ACCESS_TOKEN_HASH_SECRET` were not visible to this Codex process.
- Stopped before generating/updating any Vercel env var, redeploying staging, or running authorized fake-paid QA.
- Recorded no secrets, raw `pa_` tokens, tokenized URLs, raw input, provider credentials, or private values.

Learnings:
- Direct Vercel env alignment cannot be done from this shell until Vercel CLI is installed/authenticated and required secrets are available to the process.
- The blocker is operational/tooling access, not application code.

Unresolved questions:
- Whether the owner/operator wants to install/authenticate Vercel CLI for Codex or perform the env alignment manually from their own shell.
- Final commit hash and staging push status are recorded in the final completion summary.

## 2026-05-30 - Align Preview INTERNAL_JOB_SECRET via corepack pnpm dlx vercel and Rerun Fake-Paid QA v0

Completed changes:
- Ran safe repo/branch preflight and confirmed local `staging` matched `origin/staging` at `b813358`.
- Confirmed `corepack pnpm dlx vercel --version` works and reports Vercel CLI `54.5.1`.
- Confirmed Vercel CLI auth is invalid in this shell: `vercel whoami` and `vercel env ls preview` fail with invalid token.
- Confirmed `OPERATOR_TEST_SECRET`, `INTERNAL_JOB_SECRET`, and `PAID_ACCESS_TOKEN_HASH_SECRET` are not visible to this Codex process.
- Stopped before generating a new internal job secret, mutating Vercel env, redeploying Preview/Staging, or running authorized fake-paid QA.
- Recorded no secrets, raw `pa_` tokens, tokenized URLs, raw input, provider credentials, or private values.

Learnings:
- `pnpm dlx vercel` solves CLI availability but not authentication; the active Vercel token in this environment is invalid.
- Direct env alignment requires Vercel CLI auth and `OPERATOR_TEST_SECRET` in the same shell before proceeding.

Unresolved questions:
- Whether the owner/operator can authenticate Vercel CLI for this Codex shell or prefers to run the env alignment manually.
- Final commit hash and staging push status are recorded in the final completion summary.

## 2026-05-30 - Force Align Vercel Preview Staging QA Secrets and Rerun Fake-Paid QA v0

Completed changes:
- Verified Vercel CLI auth through `VERCEL_TOKEN` for account `studioanyu-1488` and project `anyu-next`.
- Identified branch-scoped Preview(staging) env precedence as the practical cause of the persistent processor `secret_mismatch`.
- Generated fresh staging-only QA secrets inside one shell process and force-overrode `OPERATOR_TEST_SECRET`, `INTERNAL_JOB_SECRET`, and `PAID_ACCESS_TOKEN_HASH_SECRET` for Preview(staging).
- Exported the same generated operator/internal secrets in the same shell and pushed a handoff commit to trigger fresh staging Preview deployment.
- Confirmed `staging.anyu.tw` health marker reached commit `4c234930ccd2` with `routeBundleVersion: payment-foundation-2026-05-29`.
- Reran `corepack pnpm run qa:fake-paid`; full fake-paid QA passed, including processor completion, paid status ready, and completed `pa_` unlock page rendering.
- Recorded no secret values, raw `pa_` tokens, tokenized URLs, raw input, provider output, LINE IDs, or private values.

Learnings:
- Updating general Preview env is insufficient when staging uses branch-scoped Preview(staging) env vars; branch-scoped values must be aligned for `staging.anyu.tw`.
- The processor 401 was caused by secret mismatch, not route/header format, processor flag, or app code.
- Direct `vercel` CLI with `--token` worked; `corepack pnpm dlx vercel` was blocked by sandbox cache permissions.

Unresolved questions:
- Whether stale duplicate general Preview QA secrets should be removed later to reduce operator confusion.
- Whether to remove the temporary processor auth diagnostic mode after payment QA stabilizes.
- Final commit hash and staging push status are recorded in the final completion summary.

## 2026-05-30 - NewebPay Checkout Creation Phase 1

Completed changes:
- Implemented gated NewebPay checkout creation Phase 1 for Module 01.
- Added `ENABLE_NEWEBPAY_CHECKOUT` and `ENABLE_PAYMENT_RUNTIME` feature flags; checkout is off by default and requires operator secret while payment runtime is off.
- Added NewebPay config and checkout contract helpers under `apps/web/src/lib/payments/newebpay/`.
- Added a checkout service that creates/reuses `newebpay` `payment_intents` and moves them only to `checkout_started`.
- Added `POST /api/modules/[moduleSlug]/checkout/newebpay` for operator/staging-gated checkout contract creation.
- Added `GET /m/[moduleSlug]/payment/return` pending UX that never marks payment paid or creates delivery artifacts.
- Added targeted checkout route/service/ReturnURL tests and confirmed fake-paid tests still pass.
- Confirmed no NotifyURL verification, paid transition, entitlement creation, `pa_` token creation, generation job, queue trigger, LINE delivery, production runtime, prompt/result, or legal copy change was made.

Learnings:
- Existing payment intent foundation was sufficient for Phase 1; no schema changes were needed.
- Provider-specific NewebPay logic can remain isolated from route/page code.
- ReturnURL can safely remain UX-only until NotifyURL verification is implemented.

Unresolved questions:
- Exact NewebPay provider env values still need to be configured securely for staging before route-level checkout smoke.
- Whether Phase 2 should mark payment paid only, or also remain short of entitlement/job creation until a later phase.
- Final commit hash and staging push status are recorded in the final completion summary.

## 2026-05-30 - NewebPay NotifyURL Verification Phase 2

Completed changes:
- Implemented `POST /api/payments/newebpay/notify` for NewebPay server callbacks.
- Added provider verification helpers for `MerchantID`, `TradeInfo`, `TradeSha`, `Version`, AES-256-CBC decrypt, and safe callback normalization.
- Added a NotifyURL service that matches verified callbacks to existing `newebpay` payment intents by merchant order number.
- Added idempotent transition from `created` / `checkout_started` to `paid` only for verified successful callbacks.
- Treated already-paid duplicate notifications as safe `duplicate_notify` without additional mutation.
- Kept ReturnURL read-only; it may display `paid` status but does not mark paid or create delivery artifacts.
- Added targeted notify service, notify route, and ReturnURL tests.
- Confirmed no entitlement, `pa_` token, generation job, queue trigger, LINE delivery, prompt/result, public legal copy, or production runtime behavior was changed.

Learnings:
- Existing `payment_intents` provider metadata columns are enough for Phase 2; no schema change was required.
- Checkout and notify signature logic should share the same `TradeSha` helper.
- NewebPay callback assumptions should be verified against final merchant/provider configuration before production runtime is broadened.

Unresolved questions:
- Exact NewebPay production callback field variants may need adjustment after provider review or sandbox callback testing.
- Whether `1|OK` / `0|ERROR` is sufficient for every configured NewebPay product path.
- Final commit hash and staging push status are recorded in the final completion summary.

## 2026-05-30 - NewebPay Paid Delivery Integration Phase 3

Completed changes:
- Added a shared paid delivery artifact service for payment-intent-backed delivery.
- Refactored operator fake-paid success to use the shared delivery service.
- Wired verified successful NewebPay NotifyURL results to create/reuse entitlement, hash-at-rest `pa_` token, and paid generation job.
- Kept NotifyURL from exposing raw `pa_` tokens or unlock paths to provider/public responses.
- Kept duplicate paid NotifyURL idempotent without duplicate entitlement or generation job creation.
- Kept ReturnURL read-only and non-mutating.
- Added targeted tests for shared delivery, NotifyURL delivery creation, duplicate idempotency, invalid callback no-op, and fake-paid compatibility.
- Confirmed no queue trigger, LINE delivery, production flag, prompt/result, public legal copy, or broad runtime enablement change was made.

Learnings:
- The fake-paid and provider-paid flows can share the same delivery artifact service without duplicating entitlement/job logic.
- `payment_success_future` is sufficient as the existing provider-payment job trigger source for Phase 3, avoiding a schema/migration change.
- Raw `pa_` token delivery remains the central product/architecture gap for real NewebPay users because NotifyURL must not expose it.

Unresolved questions:
- Which safe Phase 3B/4 mechanism should deliver the real paid access route to users after NewebPay payment.
- Whether a real NewebPay sandbox callback reveals additional payload variants.
- Final commit hash and staging push status are recorded in the final completion summary.

## 2026-05-30 - NewebPay Paid Access Handoff Phase 3B

Completed changes:
- Added signed, non-persisted `pcs_` checkout session token creation and validation.
- Updated NewebPay checkout creation to include `checkoutToken` in ReturnURL and fail safely before payment writes if signing config is missing.
- Added session-bound payment access handoff resolver.
- Added `POST /api/modules/[moduleSlug]/payment/status` returning sanitized payment handoff states.
- Updated ReturnURL to use the checkout session handoff while remaining non-mutating.
- Added `/m/[moduleSlug]/payment/access` to render completed paid result only after valid session-bound ready state.
- Kept raw `pa_` tokens hash-at-rest and did not expose them through NotifyURL, ReturnURL, status, or payment access page.
- Added tests for token signing, invalid/expired sessions, unpaid no-access behavior, processing/ready states, status route, access page, and checkout session config.

Learnings:
- A signed non-persisted checkout session token can bridge ReturnURL access without schema changes and without reconstructing raw `pa_`.
- Payment truth remains NotifyURL + paid payment intent; the checkout session token is only a browser handoff credential.
- Exporting `UnlockCompleted` avoided duplicating paid result rendering for the session-bound access page.

Unresolved questions:
- Whether the session-bound access page should be permanent or later replaced by a short-lived exchange-to-`pa_` redirect.
- Whether NewebPay preserves custom ReturnURL query parameters exactly across all sandbox/production modes.
- Final commit hash and staging push status are recorded in the final completion summary.

## 2026-05-30 - NewebPay Merchant Review Remediation Plan v0

Completed changes:
- Created a planning-only remediation report for NewebPay merchant review supplementary materials.
- Audited current public pages, Module 01 public page, legal routes, paid preview copy, and prior provider-review notes.
- Identified root homepage internal-foundation copy as a likely reason for “website has no product content.”
- Mapped NewebPay review comments to required website changes, copy, screenshots, owner-provided documents, Codex implementation actions, and risks.
- Drafted provider-review-safe product/service content direction and refund/re-delivery policy direction.
- Created owner supporting-documents checklist and NewebPay customer service email outline.
- Recommended implementation order: public storefront/product update, refund visibility, screenshot/attachment prep, supplement email draft.

Learnings:
- Module 01 and legal pages already contain much of the needed product/refund/privacy copy, but it is not presented as an obvious public storefront from the root page.
- NewebPay’s supplement request requires both website changes and owner-only external proof documents.
- Billing/domain/API/hosting proof should not be committed to the repo.

Unresolved questions:
- Owner must confirm final refund request window, support channel scope, invoice/receipt wording, and any public applicant/contact details.
- Owner must gather external proof documents and decide what can be sent to NewebPay.
- Final commit hash and staging push status are recorded in the final completion summary.

## 2026-05-30 - NewebPay Merchant Review Public Content Implementation v0

Completed changes:
- Replaced root homepage internal foundation copy with a provider-review-ready Module 01 storefront.
- Added product/service introduction, screenshot-like product preview, NT$49 price, one-time/non-subscription charging model, web delivery copy, support contact, and service limitation copy.
- Added a dedicated `/refund` policy page and surfaced refund policy through legal navigation/footer.
- Updated legal index/footer discoverability for service, refund, privacy, terms, and disclaimer pages.
- Added tests for homepage provider-review content and refund/legal copy.

Learnings:
- Existing legal and paid-preview copy already covered many review requirements, but it was not visible enough from the public root page.
- A mock product preview is safer than committing screenshots because it avoids private user input, tokens, provider data, or personal account details.
- The public review copy can satisfy price/charging/refund visibility without enabling payment runtime.

Unresolved questions:
- Owner should confirm a concrete refund handling time window before final submission if NewebPay expects one.
- Owner should confirm whether support remains email-only or should include LINE OA.
- Owner must still prepare external proof documents outside the repo.

## 2026-05-30 - NewebPay Supplement Email Draft and Attachment Checklist v0

Completed changes:
- Created a documentation-only NewebPay supplement package draft for owner review.
- Summarized the completed public website updates: storefront homepage, synthetic product preview, NT$49 price, one-time/non-subscription model, web delivery, refund page, and legal/footer links.
- Created an external attachment checklist with placeholders for homepage screenshot, refund screenshot, domain proof, Vercel hosting proof, AI/API proof, self-developed system statement, order/payment flow explanation, and optional merchant identity documents.
- Drafted a self-developed system statement for cases where no external system vendor invoice exists.
- Drafted a Traditional Chinese NewebPay supplement email that uses the客服信箱 `hello@anyu.tw` and states that payment integration is still under review.

Learnings:
- Current public site/legal copy already uses `hello@anyu.tw` as the support email, so no website copy change was needed for the客服信箱 request.
- The supplement package should list private attachments by filename only; actual proof documents must stay outside the repo and be sent directly to NewebPay.

Unresolved questions:
- Owner must confirm whether screenshots should use production or staging URLs.
- Owner must confirm whether to state a concrete refund handling time window.
- Owner must gather and redact external proof documents before sending.

## 2026-05-30 - ANYU Current State Snapshot for ChatGPT Review v0

Completed changes:
- Created a documentation-only current-state evidence pack for ChatGPT review.
- Captured git/remote state, including remote `origin/staging` at `b40a5d2` and stale local tracking ref behavior.
- Verified staging is serving the latest storefront/refund content and health marker, while production still serves older homepage content and `/refund` returns 404.
- Summarized public merchant-review surfaces, refund policy content, payment routes, flags/env names, implementation boundaries, QA evidence, and supplement package readiness.

Learnings:
- Staging is current at `b40a5d2`; production has not been refreshed with the merchant-review storefront/refund page.
- Payment implementation now has checkout, NotifyURL verification, delivery artifact creation, and session-bound handoff, but broad runtime remains gated and queue trigger/LINE/refund tooling are not implemented.
- The supplement package is ready as documentation, but external proof documents remain owner-only and outside repo.

Unresolved questions:
- Whether to refresh production before NewebPay screenshots.
- Whether to use production or staging URLs for the supplement package.
- Whether refund handling time should be stated explicitly before submission.

## 2026-05-30 - Refresh Production Public Merchant Review Content v0

Completed changes:
- Deployed latest public merchant-review storefront/refund content to production using direct Vercel production deployment on project `anyu-next`.
- Verified `https://anyu.tw/` now shows the Module 01 storefront, product preview, NT$49 price, one-time/non-subscription charging model, web delivery, refund/support summary, and `hello@anyu.tw`.
- Verified `https://anyu.tw/refund` now returns 200 and shows refund/reissue policy content.
- Verified `https://anyu.tw/legal` returns 200 and shows refund/privacy/terms/disclaimer links.
- Verified checkout and operator fake-paid routes remain disabled for public production traffic with route-controlled JSON `404 not_found`.

Learnings:
- Production was successfully refreshed without changing production env values or enabling payment runtime.
- Production health now reports `environment: production`, `gitCommit: 3de74ca20c74`, and route bundle marker `payment-foundation-2026-05-29`.
- Vercel domain inspection still lists `anyu.tw` under both `anyu-next` and older `anyu`, but current alias resolution serves the fresh `anyu-next` deployment.

Unresolved questions:
- Owner still needs to capture production screenshots and prepare external proof documents for NewebPay.
- Local `git fetch` remains blocked by `.git/FETCH_HEAD` permission, leaving the local remote-tracking ref stale.
- Owner should eventually clean older Vercel project/domain association if safe.

## 2026-05-30 - Queue Trigger Integration / Paid Delivery Orchestration Phase 4 Plan v0

Completed changes:
- Created a planning-only Phase 4 architecture report for paid generation queue triggering.
- Documented current `generation_jobs`, internal processor, cron fallback, fake-paid QA, NewebPay NotifyURL, and `pcs_` handoff behavior.
- Compared QStash-like webhook queue, direct server trigger, manual-only fallback, Vercel Cron, external worker, and Vercel Workflow options.
- Recommended a trigger-only queue layer with DB-backed processor source of truth, manual recovery preserved, and duplicate-safe delivery.
- Defined trigger payload rules, integration points, failure behavior, gates/env names, observability, tests, staging QA, and Phase 4A-4D implementation breakdown.

Learnings:
- Current processor already has DB-based due job claiming, retries, stale lock recovery, and safe manual invocation, so Phase 4 should not duplicate job state inside the queue.
- Vercel Hobby Cron is useful only as a safety net because it is daily-only for this project context.
- A targeted `jobId` trigger payload is preferable for auditability but requires a small targeted processor enhancement; a limit-based trigger is simpler but less precise.

Unresolved questions:
- Whether Phase 4A should add targeted `jobId` processing immediately or start with the existing limit-based processor route.
- Whether to retain or remove temporary processor auth diagnostics after queue QA stabilizes.
- Which queue provider/account should be used for staging once implementation begins.

## 2026-05-30 - ANYU Engineering Sync-Up / Quality Scan v0

Completed changes:
- Performed a documentation-only engineering sync-up across git state, live health/content checks, payment route boundaries, env names, security/privacy posture, temporary code, test coverage, merchant-review content, Phase 4 readiness, and operational risks.
- Confirmed local/staging HEAD is `a8a8bb5` and live staging serves that route bundle.
- Confirmed production public merchant-review content is live, while production health still reports a direct deployment from `staging` at `3de74ca`.
- Confirmed payment phase boundaries are mostly consistent: checkout remains pending-only, NotifyURL is payment truth, delivery artifacts are created after verified paid, and ReturnURL/status/access remain non-mutating.
- Ranked cleanup recommendations before queue provider wiring.

Learnings:
- `git fetch origin --prune` still fails locally on `.git/FETCH_HEAD` permissions, despite local and remote staging refs matching.
- `origin/main` is 71 commits behind `origin/staging`, making production source-of-truth cleanup a real ops priority.
- Temporary processor auth diagnostics are production-suppressed and secret-safe but should be removed or deliberately retained before launch.
- Entitlements still have a DB index, not a unique constraint, on `payment_intent_id`.

Unresolved questions:
- Whether to repair diagnostics/deployment/env-matrix items before Phase 4A or run them in parallel.
- Whether owner wants `main` reconciled with `staging` as the production source of truth.
- Whether NewebPay sandbox credentials are available for an E2E smoke before queue provider wiring.

## 2026-05-30 - Remove or Gate Processor Auth Diagnostics for Launch Readiness v0

Completed changes:
- Removed temporary detailed auth diagnostics from the internal paid generation processor route.
- Removed `diagnoseInternalJobAuthorization`, auth diagnostic types, and secret-source diagnostic helper from `internal-job-auth`.
- Stopped the secret-safe fake-paid QA runner from sending `x-processor-auth-diagnostic` or recording `authDiagnostic`.
- Updated processor/auth tests so missing or invalid auth always returns the same safe `401 unauthorized` response without diagnostics.

Learnings:
- The runner does not depend on diagnostics to classify normal pass/fail; without secrets it still completes non-secret preflights and exits safely blocked.
- The processor route still has clear safe categories for config error, disabled processor, invalid JSON, unsupported job type, and aggregate success.
- Removing diagnostics before queue-provider wiring reduces launch surface without changing payment or processor behavior for authorized requests.

Unresolved questions:
- Whether to clean production deployment source-of-truth or env/flag matrix before Phase 4A.
- Whether future queue webhook auth should use a dedicated diagnostic-free readiness endpoint for operator checks.

## 2026-05-30 - Payment Runtime Env / Feature Flag Matrix v0

Completed changes:
- Created a documentation-only payment runtime env and feature flag matrix.
- Inventoried payment, NewebPay, paid access, checkout session, operator QA, processor, cron, planned queue, LINE-adjacent, build marker, DB, AI, and abuse-guard env names from source.
- Mapped key payment routes to flags/auth/config, expected production behavior, expected staging QA behavior, and fail-closed modes.
- Documented local, Preview general, Preview(staging), and Production expectations without reading or printing env values.
- Ranked risks and recommendations before Phase 4 queue wiring and production payment launch.

Learnings:
- No queue env vars are implemented yet; `ENABLE_PAID_JOB_QUEUE_TRIGGER`, `PAID_JOB_QUEUE_PROVIDER`, and QStash names remain planned placeholders only.
- `ENABLE_NEWEBPAY_CHECKOUT` gates checkout creation, but NotifyURL route exists independently and fails closed through provider config/signature/payment-intent checks.
- Fallback behavior exists for `INTERNAL_JOB_SECRET` to `CRON_SECRET`, `RETENTION_CLEANUP_SECRET` to `CRON_SECRET`, and `PAYMENT_CHECKOUT_SESSION_SECRET` to `PAID_ACCESS_TOKEN_HASH_SECRET`.
- `origin/main` is now 73 commits behind `origin/staging`; production source-of-truth cleanup remains important.

Unresolved questions:
- Whether to build a secret-safe env preflight script before Phase 4B.
- Whether to separate `PAYMENT_CHECKOUT_SESSION_SECRET` from `PAID_ACCESS_TOKEN_HASH_SECRET` before sandbox E2E or only before production launch.
- Whether to rename `payment_success_future` before queue reporting expands.

## 2026-05-30 - Queue Trigger Integration Phase 4A: No-op/Test Adapter v0

Completed changes:
- Added `ENABLE_PAID_JOB_QUEUE_TRIGGER` and `PAID_JOB_QUEUE_PROVIDER` support in source, disabled by default.
- Added a paid job queue trigger abstraction with `none`, `noop`, and `test` modes only.
- Wired safe queue trigger result creation after verified NewebPay NotifyURL delivery artifacts and operator fake-paid delivery artifacts.
- Added targeted tests for trigger defaults, provider selection, payload safety, NotifyURL integration, and operator fake-paid integration.

Learnings:
- Phase 4A can hook after shared delivery artifact creation without changing ReturnURL/status/access/unlock or processor behavior.
- A trigger-only payload with DB references is sufficient for no-op/test adapter verification.
- Unknown providers can fail closed as `none`, keeping Preview/Production safe if env is incomplete or mistyped.

Unresolved questions:
- Which real queue provider should Phase 4B use.
- Whether provider-level enqueue idempotency should be tracked in DB or delegated to the queue provider.
- Whether `payment_success_future` should be renamed or supplemented before queue observability becomes user-facing.

## 2026-05-30 - Production Deployment Source-of-Truth Cleanup v0

Completed changes:
- Audited local git state, remote refs, stale lock files, and main/staging divergence.
- Confirmed `git fetch origin --prune` now succeeds and no `.git/*.lock` files are present.
- Confirmed local `staging` and `origin/staging` match at `ca8275b`, while `origin/main` is 75 commits behind.
- Audited Vercel project/domain state with read-only CLI commands.
- Confirmed `anyu.tw` currently resolves to the `anyu-next` production deployment and public merchant-review pages are live.
- Confirmed checkout and operator fake-paid production routes fail closed with route-controlled JSON 404 responses.

Learnings:
- Production health reports `gitBranch: staging` and `gitCommit: 3de74ca20c74`, confirming production was deployed directly from a staging commit.
- Vercel still lists both `anyu-next` and old `anyu` projects; direct inspection resolves `anyu.tw` to `anyu-next`, but owner should verify domain ownership in the UI.
- `main` is a strict ancestor of `staging`, so a future reconciliation can be fast-forwarded if owner approves.

Unresolved questions:
- Whether owner wants a fast-forward `main` sync or PR-based review from `staging` to `main`.
- Whether the old Vercel `anyu` project should be archived or have stale domain/alias settings removed.
- Whether to complete source-of-truth reconciliation before Queue Provider Selection / Phase 4B Plan v0.

## 2026-05-30 - Production Source-of-Truth Reconciliation v0

Completed changes:
- Confirmed `origin/main` is a strict ancestor of `origin/staging`.
- Confirmed pre-reconciliation divergence was `0 76`, with no `main` commits ahead of `staging`.
- Documented a fast-forward-only reconciliation method that keeps the task report in both `staging` and `main`.
- Re-established the intended workflow: `staging` for integration, `main` for production release/source-of-truth.
- Fast-forwarded `origin/main` to match `origin/staging`; Vercel then auto-deployed Production from `main`.
- Confirmed production health reports `gitBranch: main`, and production homepage/refund/legal plus disabled checkout/fake-paid safety checks passed.

Learnings:
- A direct `git push origin HEAD:main` from the final staging task commit is a safe fast-forward promotion when ancestry is verified first.
- No manual production deploy command was needed; Vercel auto-deployed after the `main` push.
- The old Vercel `anyu` project/domain ambiguity remains an owner UI cleanup item, separate from git branch reconciliation.

Unresolved questions:
- Whether future docs-only `main` pushes should be allowed to auto-deploy, or whether production deployment should require an explicit promotion gate.
- Whether owner wants the old Vercel `anyu` project archived after confirming no active domain ownership.

## 2026-05-30 - Queue Provider Selection / Phase 4B Plan v0

Completed changes:
- Reviewed the Phase 4A queue trigger abstraction, flags, payload, integration points, and tests.
- Compared Vercel Queues, Upstash QStash, direct internal trigger, manual fallback, Vercel Cron, Vercel Workflow, and external worker options.
- Recommended Vercel Queues as the primary Phase 4B provider if available in the ANYU Vercel account, with Upstash QStash as fallback.
- Planned adapter categories, env names, queue consumer/auth strategy, idempotency, failure behavior, tests, staging QA, and implementation phases.

Learnings:
- Vercel Queues is a better first fit than public webhook delivery if account access is available because its consumer functions are not publicly accessible.
- QStash remains a strong fallback, but it requires public endpoint signature verification and more external-provider operations.
- The current trigger-only payload with DB references already fits either provider without exposing raw input, tokens, provider payloads, or decrypted data.

Unresolved questions:
- Whether Vercel Queues is available for the `studioanyu-1488` / `anyu-next` project.
- Whether owner prefers Vercel-native beta infrastructure or mature external QStash for Phase 4B.
- Whether provider-level dedupe is enough initially or whether a queue audit table should be added later.

## 2026-05-30 - Vercel Queues Availability / Account Fit Preflight v0

Completed changes:
- Verified local source state and Vercel CLI account/project context without printing token or env values.
- Confirmed CLI account `studioanyu-1488`, linked project `anyu-next`, root directory `apps/web`, and Node.js `24.x`.
- Confirmed Vercel CLI `54.5.1` has no dedicated `vercel queues` command.
- Reviewed official Vercel Queues docs, quickstart, API, SDK, pricing/limits, observability, and TTL changelog.
- Confirmed `@vercel/queue` is available via package metadata lookup.
- Recommended proceeding with Vercel Queues adapter implementation behind flags, with dashboard/staging smoke as the remaining availability proof.

Learnings:
- Vercel Queues uses `@vercel/queue`, `send`, `handleCallback`, and `vercel.json` `queue/v2beta` triggers rather than a dedicated CLI command.
- Consumer functions configured through queue triggers have no public URL and are invoked only by Vercel queue infrastructure.
- Deployed Vercel environments authenticate queue SDK use automatically; local real queue use requires project linking and `vercel env pull`.
- Queue pricing is operation-based and docs currently list the first 1,000,000 regional Queue API operations included on Hobby.

Unresolved questions:
- Whether the `anyu-next` dashboard exposes Queues setup/observability for the owner account before code lands.
- Whether to keep `main` in sync with staging for this planning-only commit before implementation.
- Whether the TTL discrepancy between base docs and April changelog needs confirmation during implementation.

## 2026-05-30 - Queue Trigger Integration Phase 4B.1: Vercel Queues Adapter v0

Completed changes:
- Added `@vercel/queue` and `PAID_JOB_QUEUE_PROVIDER=vercel_queue` support behind the existing disabled-by-default paid job queue trigger abstraction.
- Added Vercel Queues `queue/v2beta` config for topic `paid-generation-jobs`.
- Added internal queue consumer route `/api/internal/queues/paid-generation`.
- Added consumer service that validates DB-reference-only payloads and delegates to `processPaidAnalysisJobs({ limit: 1, lockedBy: "paid_generation_queue" })`.
- Added tests for Vercel queue config missing, enqueue success/failure, payload safety, consumer validation, disabled behavior, processor-disabled behavior, and DB config failure.

Learnings:
- `@vercel/queue` top-level default client emits a local build warning when region is not detected, so the consumer route uses `new QueueClient({ region: process.env.VERCEL_REGION || "iad1" })`.
- The current generic processor can safely process a due paid job from DB as source of truth, but it does not yet target the exact queued `generationJobId`.
- Vercel Queues idempotency keys allow Phase 4B.1 to use `paid-job:<generationJobId>` without adding a queue audit table yet.

Unresolved questions:
- Whether the owner dashboard confirms Vercel Queues setup/observability for `anyu-next`.
- Whether staging queue smoke will prove queue-triggered processor completion without manual invocation.
- Whether Phase 4B.2 should add targeted generation-job processing or defer it until queue smoke exposes a concrete need.

## 2026-05-30 - Targeted Paid Generation Processor Path for Queue Consumer v0

Completed changes:
- Added `claimDuePaidAnalysisJobById(...)` to atomically claim only the requested due paid-analysis job.
- Added `processPaidAnalysisJobById(...)` to process a specific queue target without using generic due-job selection.
- Updated the Vercel Queues consumer service to call the targeted processor with the queue payload `generationJobId`.
- Added queue consumer categories for targeted outcomes: `already_completed`, `already_processing`, `not_found`, `invalid_job`, `failed`, and `retryable_error`.
- Added tests for exact job targeting, completed idempotency, missing/invalid/processing target jobs, and manual processor compatibility.

Learnings:
- The Phase 4B.1 consumer could have processed a different due paid job when multiple jobs were queued; this is now fixed before live queue smoke.
- The existing paid generation implementation was reusable after adding a targeted DB claim helper.
- Manual recovery stays separate and unchanged through `processPaidAnalysisJobs(...)`.

Unresolved questions:
- Whether live Vercel Queues staging smoke will need more queue-handler observability around terminal categories.
- Whether queue enqueue attempts should be persisted after the provider smoke proves reliable.

## 2026-05-30 - Vercel Queues Staging Smoke / Phase 4B.2 v0

Completed changes:
- Added queue-mode support to the secret-safe fake-paid QA runner so it skips manual processor invocation and waits for queue completion.
- Added sanitized `queueTrigger` metadata to the operator fake-paid route response.
- Added branch-scoped Preview(`staging`) queue env names for `ENABLE_PAID_JOB_QUEUE_TRIGGER`, `PAID_JOB_QUEUE_PROVIDER`, and `PAID_JOB_QUEUE_TOPIC`.
- Regenerated Preview(`staging`) `OPERATOR_TEST_SECRET` for the same shell that ran the smoke, without printing or committing the value.
- Redeployed Preview/staging and verified `staging.anyu.tw` served commit `fbf9508`.
- Ran queue-mode fake-paid QA successfully: queue trigger enqueued via `vercel_queue`, paid status reached completed without manual processor invocation, and completed paid unlock rendering passed.

Learnings:
- Vercel Queues processed the paid generation path end-to-end on staging with the targeted `generationJobId` processor path.
- `vercel env pull --environment=preview --git-branch staging` listed sensitive branch-scoped names but wrote empty values locally, so it is not sufficient for local secret injection.
- App-level smoke evidence is enough to prove queue-triggered completion, but dashboard observation was not captured.

Unresolved questions:
- Whether to add a dedicated `qa:fake-paid:queue` script for repeated queue smoke.
- Whether manual processor fallback should be rerun after every queue-provider change.
- Whether to add queue attempt/audit persistence before production payment launch.

## 2026-05-30 - Queue Launch Readiness / Phase 4C Checklist v0

Completed changes:
- Created a documentation-only queue launch readiness checklist after successful Phase 4B.2 staging queue smoke.
- Summarized what Phase 4A, 4B.1, targeted processor, and 4B.2 prove and what remains unproven.
- Defined final queue QA requirements before launch, including queue-mode fake-paid, manual fallback, disabled/config-missing behavior, duplicate/idempotency checks, production disabled checks, and provider E2E smoke.
- Documented Vercel Queues dashboard observation SOP and app-level evidence fallback.
- Documented manual recovery SOP using `INTERNAL_JOB_SECRET` without exposing secret values.
- Listed env/flag names only and reiterated branch-scoped Preview(`staging`) precedence.
- Ranked launch blockers and provided next-step decision tree.

Learnings:
- Queue path is staging-proven, but production launch readiness still depends on business/provider approval and operational SOPs.
- Manual fallback and dashboard observation are the main remaining queue-confidence gaps.
- Production payment launch should be treated as a separate decision, not a consequence of queue smoke passing.

Unresolved questions:
- Whether NewebPay sandbox/provider credentials will be available before merchant review approval.
- Whether owner wants Manual Fallback Retest + Queue Dashboard Observation before launch gate planning.
- Whether queue enqueue audit persistence is needed before production launch or can wait until usage proves need.

## 2026-05-30 - Manual Fallback Retest + Queue Dashboard Observation v0

Completed changes:
- Added a handoff and execution report for the Phase 4C manual fallback/dashboard observation retest.
- Verified staging freshness: `staging.anyu.tw` served Preview(`staging`) commit `0f9b7b8e0dc4` with `payment-foundation-2026-05-29`.
- Verified production disabled posture: production health stayed `main/1990fc034d74`, public merchant-review pages returned HTTP 200, and production fake-paid/checkout routes returned JSON `404 not_found`.
- Confirmed queue-mode and manual-mode QA runners remain secret-safe and block before authorized paths when required secrets are absent.

Learnings:
- This Codex shell has `VERCEL_TOKEN` but does not have `OPERATOR_TEST_SECRET` or `INTERNAL_JOB_SECRET`, so authorized queue/manual fallback QA cannot run here yet.
- Vercel CLI can verify project/deployment/env-name context, but queue dashboard metrics still require Vercel dashboard UI observation under Observability -> Queues.
- Preview(`staging`) queue env names remain branch-scoped and visible by name only.

Unresolved questions:
- Owner/operator still needs to run queue-mode and manual-mode `qa:fake-paid` with secrets exported.
- Owner/operator still needs to observe `paid-generation-jobs` in Vercel dashboard and record safe aggregate queue metrics.
- Local `.git/FETCH_HEAD` permission issue still blocks `git fetch origin --prune`.

## 2026-05-30 - Force Align Preview(staging) QA Secrets and Run Queue + Manual Fallback QA v0

Completed changes:
- Regenerated and aligned branch-scoped Preview(`staging`) `OPERATOR_TEST_SECRET` and `INTERNAL_JOB_SECRET` through Vercel CLI without printing values.
- Redeployed Preview(`staging`) with explicit Vercel team scope and verified staging health on commit `b9069bdaaea2`.
- Queue-mode fake-paid QA passed with `vercel_queue` enqueue and completed paid unlock rendering.
- Added QA-only `QA_FAKE_PAID_INPUT_SUFFIX` support to force a fresh source result for manual fallback testing.
- Temporarily disabled Preview(`staging`) queue trigger, redeployed, ran manual fallback QA on a fresh source, confirmed `processed=1` and `completed=1`, then restored queue trigger to `true` and redeployed.
- Verified Production remains disabled: production health stayed `main/1990fc034d74`, production fake-paid/checkout routes returned JSON `404 not_found`, and Production env listing did not include queue flags.

Learnings:
- Vercel redeploy should use explicit `--scope studioanyu-1488s-projects`; an unscoped redeploy hit a team mismatch.
- Manual fallback must use a fresh source result when queue/idempotency has already completed the standard cached QA source.
- Preview(`staging`) queue restoration was verified after the temporary manual fallback disable pass.

Unresolved questions:
- Vercel dashboard queue observation remains an owner UI action.
- NewebPay review/sandbox provider credential status remains pending.
- Local `.git/FETCH_HEAD` permission issue remains unresolved.

## 2026-05-30 - Record Vercel Queues Dashboard Observation v0

Completed changes:
- Added a sanitized follow-up report recording owner-provided Vercel Queues dashboard observation for `anyu-next` / `paid-generation-jobs` in Preview.
- Recorded aggregate metrics only: last 12 hours received 2, deleted 2, max message age 0ms, throughput spikes visible, no unexpected backlog, and no retry storm/failure loop.

Learnings:
- Phase 4C dashboard-observation gap is now closed at aggregate evidence level; app-level QA remains the source of exact functional verification.

Unresolved questions:
- NewebPay review/sandbox E2E and production payment launch gate remain the next business/runtime readiness items.

## 2026-05-30 - Production Payment Launch Gate Plan v0

Completed changes:
- Added a production payment launch gate plan for enabling NewebPay only after merchant review approval and required smoke tests.
- Documented current readiness across fake-paid delivery, NotifyURL verification, paid delivery artifacts, `pcs_` handoff, Vercel Queues, manual fallback, production fail-closed posture, and merchant-review content.
- Defined hard launch blockers, phased launch sequence L0-L5, env/flag matrix, staging/production smoke checklist, rollback/disable plan, stop-loss rules, monitoring targets, and customer support/refund SOP.

Learnings:
- Engineering readiness is strong at staging/fake-paid/queue/manual-fallback level, but production payment runtime must still wait for NewebPay approval and provider E2E.
- The launch plan should treat provider credentials, production env configuration, controlled smoke, and public availability as separate gates.

Unresolved questions:
- NewebPay review approval and sandbox/production credential readiness remain pending.
- Owner still needs to confirm final launch price, refund response window, support inbox readiness, and whether recent docs-only staging commits should be promoted to main before runtime launch.

## 2026-05-30 - Support / Refund SOP Finalization v0

Completed changes:
- Added an owner/operator support and refund SOP for ANYU Module 01 before production payment launch.
- Reviewed current `/refund` and `/legal` source copy in `apps/web/src/content/legal.ts` and documented policy alignment.
- Documented support inbox handling for `hello@anyu.tw`, case playbooks, internal operator checklist, manual recovery SOP, refund decision matrix, Traditional Chinese customer templates, and stop-loss support rules.

Learnings:
- Public refund/legal copy already covers duplicate payment, paid-but-no-result, inaccessible paid result links, subjective-preference limits after delivered digital content, and support email `hello@anyu.tw`.
- Public copy intentionally does not commit to a fixed handling-time window yet; owner should confirm before publishing a 3-7 business day or other response/refund window.

Unresolved questions:
- Owner needs to confirm refund/support handling window, daily support inbox monitoring, NewebPay merchant backend access, and whether support notes need a private tracker.
- NewebPay review approval and sandbox/production credential readiness remain pending.

## 2026-05-30 - NewebPay Sandbox E2E Smoke Plan v0

Completed changes:
- Added an ANYU-specific NewebPay sandbox end-to-end smoke plan for checkout -> NotifyURL -> paid delivery -> Vercel Queues -> session-bound paid access.
- Mapped sandbox credential/env names, ANYU routes, Preview(`staging`) setup, E2E sequence, expected states, safety checks, failure categories, observability checklist, and sanitized report shape.

Learnings:
- Current implementation routes and env names are sufficient to define a manual sandbox smoke without code changes: checkout route, NotifyURL, ReturnURL/status/access, Vercel queue consumer, and manual processor fallback are all mapped.
- Sandbox smoke must keep NotifyURL as payment truth, ReturnURL non-mutating, raw `pa_` unexposed, and `pcs_` as browser handoff.

Unresolved questions:
- NewebPay sandbox credential availability remains unknown.
- No dedicated sandbox E2E runner exists yet; the first smoke is expected to be manual/operator-driven unless a follow-up automates it.

## 2026-05-30 - NewebPay Sandbox Staging Env Setup + Checkout Preflight v0

Completed changes:
- Inspected current NewebPay checkout route/service/config/payload implementation and documented exact env/route contracts.
- Verified implementation uses `NEWEBPAY_CHECKOUT_URL`, `NEWEBPAY_ENVIRONMENT`, `NEXT_PUBLIC_APP_URL`, `NEWEBPAY_NOTIFY_URL`, and hard-coded MPG `Version=2.0`.
- Confirmed Production remains disabled: production health stayed `main/1990fc034d74`, and production fake-paid/checkout routes returned JSON `404 not_found`.
- Documented that env setup and checkout preflight were blocked because provider credentials were not available in the Codex shell.

Learnings:
- Owner-provided env naming notes differ from implementation: use `NEWEBPAY_CHECKOUT_URL` not `NEWEBPAY_GATEWAY_URL`, and `NEWEBPAY_ENVIRONMENT` not `NEWEBPAY_ENV`.
- Current checkout payload does not include `ClientBackURL` or payment method restriction fields; first sandbox smoke should manually choose credit-card one-time payment unless a follow-up adds provider method fields.

Unresolved questions:
- Owner must provide MerchantID / HashKey / HashIV securely to shell or configure them directly in branch-scoped Preview(`staging`).
- If NewebPay requires `ClientBackURL` or method restriction fields, a follow-up code task is needed before payment smoke.

## 2026-05-30 - NewebPay Sandbox Staging Checkout Preflight Run v1

Completed changes:
- Configured branch-scoped Preview(`staging`) NewebPay sandbox checkout env using local secure `apps/web/.env.local` credentials without printing values.
- Redeployed Preview(`staging`) and verified health at `environment=preview`, `gitBranch=staging`, route bundle `payment-foundation-2026-05-29`, commit `e8373433a596`.
- Ran a sanitized checkout preflight: fresh source analyze succeeded, NewebPay checkout returned HTTP 200, `paymentIntentStatus=checkout_started`, sandbox `ccore` gateway, `Version=2.0`, and `pcs_` ReturnURL handoff present.
- Verified no paid transition, entitlement, `pa_` token, `generation_job`, queue trigger, or production runtime change occurred.
- Confirmed Production remained disabled: production health stayed `main/1990fc034d74`, and production checkout/fake-paid routes returned JSON `404 not_found`.

Learnings:
- Sandbox credentials in `.env.local` are sufficient for configuring Preview(`staging`) through Vercel CLI when scoped explicitly to `studioanyu-1488s-projects`.
- The checkout preflight is ready for the next manual NewebPay sandbox payment smoke; first smoke should manually choose credit-card one-time payment.

Unresolved questions:
- If NewebPay requires `ClientBackURL` or explicit payment-method restriction fields, implementation follow-up is needed.
- Actual sandbox payment, NotifyURL delivery, queue completion, and session-bound access are not yet validated with NewebPay sandbox.

## 2026-05-30 - NewebPay Sandbox E2E Payment Smoke v0

Completed changes:
- Started the controlled NewebPay sandbox E2E payment smoke on Preview(`staging`) without changing Production.
- Verified staging health at `environment=preview`, `gitBranch=staging`, route bundle `payment-foundation-2026-05-29`, commit `462d11daa353`.
- Confirmed required Preview(`staging`) env names are present without values, including NewebPay sandbox checkout config, checkout session secret, paid access hash secret, queue trigger config, operator secret, and internal job secret.
- Created a fresh Module 01 source result and a NewebPay sandbox checkout contract with `paymentIntentStatus=checkout_started`, sandbox `ccore` gateway, MPG `Version=2.0`, and `pcs_` handoff present.
- Generated a temporary local checkout form outside the repo at `/private/tmp/anyu-newebpay-smoke/newebpay-sandbox-submit.html`.
- Confirmed Production remained disabled: production health stayed `main/1990fc034d74`, and production checkout/fake-paid routes returned JSON `404 not_found`.

Learnings:
- The staging checkout side is ready for provider-hosted sandbox payment submission.
- Codex could not complete provider payment UI from this environment because no usable GUI browser was available; generic `open` failed and explicit Chrome/Safari lookup failed.
- Payment status remains `waiting_for_payment` until the temporary form is opened and submitted in a real browser.

Unresolved questions:
- Actual NewebPay sandbox payment, ReturnURL, NotifyURL verification, paid transition, delivery artifacts, queue completion, and session-bound paid access remain unverified.
- If NewebPay requires `ClientBackURL` or explicit payment-method restriction fields, implementation follow-up is needed.

## 2026-05-30 - Manual Browser Sandbox Payment Completion Verification v0

Completed changes:
- Attempted sanitized verification against the existing NewebPay sandbox checkout state from `/private/tmp/anyu-newebpay-smoke/smoke-state.json`.
- Verified staging health at `environment=preview`, `gitBranch=staging`, route bundle `payment-foundation-2026-05-29`, commit `ccae82f7c182`.
- Polled the session-bound payment status endpoint for 24 attempts; status remained `waiting_for_payment`, retryable true, with no access path.
- Confirmed Production remained disabled and public pages live: production health stayed `main/1990fc034d74`; homepage, `/refund`, and `/legal` returned 200; production checkout/fake-paid routes returned JSON `404 not_found`.

Learnings:
- The existing checkout token remains valid enough for safe status polling, but payment was not submitted or not recognized by NotifyURL.
- Without owner confirmation and a provider-side payment completion event, the E2E chain cannot proceed beyond `waiting_for_payment`.

Unresolved questions:
- Owner/operator needs to complete a fresh sandbox credit-card one-time payment in a real browser and confirm completion before NotifyURL/delivery/queue/access verification can pass.
- If NewebPay requires `ClientBackURL` or explicit payment-method restriction fields, implementation follow-up may be needed.

## 2026-05-30 - Manual Browser Sandbox Payment Completion v1 Fresh Checkout

Completed changes:
- Created a fresh Preview(`staging`) NewebPay sandbox checkout for run `20260530-230023`.
- Verified staging health at `environment=preview`, `gitBranch=staging`, route bundle `payment-foundation-2026-05-29`, commit `4c43ab562363`.
- Fresh source analyze and checkout creation passed: HTTP 200, `paymentIntentStatus=checkout_started`, sandbox `ccore` gateway, MPG `Version=2.0`, expected NT$49 amount, and `pcs_` handoff present.
- Owner confirmed manual browser payment was submitted using sandbox credit-card one-time payment and returned to staging.
- Polling session-bound status for 72 attempts over about 6 minutes stayed `waiting_for_payment`; no access path appeared.
- Recent Vercel logs showed ReturnURL/status route activity but no visible `POST /api/payments/newebpay/notify` in the checked window.
- Confirmed Production remained disabled and public pages live: production health stayed `main/1990fc034d74`; homepage, `/refund`, and `/legal` returned 200; production checkout/fake-paid routes returned JSON `404 not_found`.

Learnings:
- Checkout/form/ReturnURL browser path works enough to return to staging, but server-to-server NotifyURL was not observed.
- The first failure is now more precise than prior attempts: `notify_not_received` after confirmed browser payment submission and staging return.

Unresolved questions:
- Owner should verify the NewebPay sandbox shop NotifyURL setting and sandbox transaction callback status.
- If backend NotifyURL is correct, a follow-up safe NotifyURL debug task is needed to determine whether NewebPay is not sending the callback or the route is rejecting before visible logs.

## 2026-05-30 - NewebPay Sandbox NotifyURL Debug v0

Completed changes:
- Inspected NewebPay checkout payload builder, checkout service, NotifyURL route/service/verifier, and related tests.
- Confirmed implementation includes `NotifyURL` inside encrypted `TradeInfo` and actual fresh checkout form shape contained the correct staging NotifyURL without printing encrypted or decrypted values.
- Verified staging NotifyURL route reachability with malformed non-secret requests: route exists, POST returns provider-compatible `0|ERROR` with safe categories, and no operator auth is required.
- Reviewed NewebPay MPG manual assumptions: NotifyURL/ReturnURL can be set per transaction or in merchant backend; API parameter should take priority when both exist.
- Checked recent Vercel logs: ReturnURL/status traffic and deliberate malformed test callbacks appeared, but no provider-originated NotifyURL request was visible for the payment smoke.

Learnings:
- The failure is unlikely to be caused by missing API `NotifyURL` or route 404/auth protection.
- The most likely root cause is sandbox/backend callback delivery: transaction not considered paid, backend notification not attempted, sandbox NotifyURL setting issue, or provider-side callback failure not reaching Vercel.

Unresolved questions:
- Owner needs to inspect NewebPay sandbox backend transaction status, callback attempt/status/response, and shop API URL / NotifyURL settings.
- If backend shows callback attempted but failed, add category-only route diagnostics; if no callback attempted, fix provider/backend settings before code changes.

## 2026-05-30 - Fix NewebPay Sandbox NotifyURL HTTP 400 Compatibility v0

Completed changes:
- Fixed `POST /api/payments/newebpay/notify` so parsed provider callback validation failures return HTTP 200 with body `0|ERROR` and safe `x-anyu-payment-category`, instead of propagating internal 400/404/409 statuses.
- Preserved verified success response as HTTP 200 with `1|OK`.
- Added route tests for `application/x-www-form-urlencoded` parsing, missing-field provider-compatible failure, invalid signature provider-compatible failure, and no `TradeInfo` / `TradeSha` exposure.
- Pushed and verified Preview(`staging`) at commit `65feb244674c`: malformed non-secret form POSTs returned HTTP 200 + `0|ERROR` with safe categories.

Learnings:
- The real sandbox callback failure was not a parser gap; the route already supported form POSTs. The issue was transport-level HTTP 400 for provider validation failures.
- NewebPay treats HTTP 400 as callback delivery failure, so ANYU needs HTTP 200 transport acknowledgement with category in body/header for normal provider callback failures.

Unresolved questions:
- Fresh sandbox payment smoke v2 is needed to confirm NewebPay accepts the callback and paid delivery proceeds.

## 2026-05-30 - Fresh NewebPay Sandbox E2E Payment Smoke v2

Completed changes:
- Created fresh sandbox checkout run `20260530-234243` after the NotifyURL HTTP 400 compatibility fix.
- Verified staging at `environment=preview`, `gitBranch=staging`, route bundle `payment-foundation-2026-05-29`, commit `8d63503a9eab`.
- Source analyze and checkout creation passed: HTTP 200, `checkout_started`, sandbox `ccore`, MPG `Version=2.0`, NT$49, and `pcs_` handoff present.
- Owner confirmed sandbox credit-card one-time payment was submitted and browser returned to staging.
- Vercel route logs showed `POST /api/payments/newebpay/notify` with HTTP 200 after payment, proving the prior HTTP 400 transport issue is fixed.
- Session-bound payment status remained `waiting_for_payment` for 72 polls over about 6 minutes; no access path appeared.
- Production remained disabled and public pages live: production health stayed `main/1990fc034d74`; homepage, `/refund`, and `/legal` returned 200; production checkout/fake-paid returned JSON `404 not_found`.

Learnings:
- NotifyURL now reaches staging and gets HTTP 200 transport response.
- Remaining blocker shifted from transport failure to verification/business failure inside NotifyURL processing; exact safe category is not currently observable in logs.

Unresolved questions:
- Need safe category-only NotifyURL diagnostics to identify whether the real provider callback fails due to signature, merchant, payment intent, amount, status, or another category.
- Paid transition, delivery artifacts, queue completion, and paid access rendering remain unverified for real sandbox provider flow.

## 2026-05-30 - Safe NotifyURL Category Diagnostics v0

Completed changes:
- Added category-only `console.info` diagnostics for `POST /api/payments/newebpay/notify` success and failure outcomes.
- Diagnostics include event name, category, provider environment category, HTTP transport status, provider response category, content-type category, payload-shape booleans, and safe mismatch booleans for merchant, amount, and payment intent lookup failures.
- Preserved provider response behavior: verified success returns HTTP 200 + `1|OK`; parsed provider callback failures return HTTP 200 + `0|ERROR`.
- Updated NotifyURL route tests to prove invalid signature, malformed payload, merchant mismatch, amount mismatch, and payment intent not found diagnostics do not include raw provider field values.
- Deployed diagnostics to Preview(`staging`) at commit `21a873d51ad0`; safe malformed form callbacks returned HTTP 200 + `0|ERROR` and logs showed category-only `malformed_payload` / `merchant_mismatch` diagnostics.

Learnings:
- The route can expose enough safe state to distinguish transport success from business verification failure without logging raw `TradeInfo`, `TradeSha`, decrypted provider payloads, tokens, or credentials.
- The next sandbox callback should identify whether the blocker is signature, merchant, amount, payment intent lookup, payment status, or another existing NotifyURL category.
- Staging log verification confirmed diagnostic records contain safe categories and payload-shape booleans only.

Unresolved questions:
- The real NewebPay sandbox callback failure category remains unknown until this diagnostic build is deployed to Preview(`staging`) and a fresh callback is observed.
- Paid transition, delivery artifacts, queue completion, and paid access rendering remain unverified for real sandbox provider flow.

## 2026-05-31 - Fresh NewebPay Sandbox E2E Payment Smoke v3

Completed changes:
- Ran a fresh Preview(`staging`) NewebPay sandbox checkout after safe NotifyURL category diagnostics were deployed.
- Created fresh checkout run `20260530161320`: source analyze HTTP 200, checkout HTTP 200, sandbox `ccore`, MPG `Version=2.0`, NT$49, and `pcs_` handoff present.
- Owner submitted sandbox credit-card one-time payment and browser returned to staging.
- Polled session-bound payment status for 72 attempts over about 6 minutes; final status remained `waiting_for_payment`, with no access path.
- Inspected safe Vercel logs and captured `newebpay_notify_failed.category=trade_info_decrypt_failed`.
- Confirmed Production remained disabled: production health stayed `production/main/1990fc034d74`; checkout and fake-paid returned JSON 404 `not_found`.

Learnings:
- NotifyURL transport and safe diagnostics work for real sandbox callbacks.
- The remaining blocker is now specifically decrypting NewebPay callback `TradeInfo`, before payment intent lookup, amount check, paid transition, delivery artifacts, queue trigger, or paid access handoff.
- The most likely next area is Preview(`staging`) NewebPay credential/config alignment: `NEWEBPAY_MERCHANT_ID`, `NEWEBPAY_HASH_KEY`, and `NEWEBPAY_HASH_IV` must match the exact sandbox shop that processed the payment.

Unresolved questions:
- Whether Preview(`staging`) currently uses a HashKey/HashIV pair from a different sandbox shop, old sandbox config, production config, or otherwise mismatched NewebPay backend setting.
- Paid transition, delivery artifacts, queue completion, and paid access rendering remain unverified for real sandbox provider flow.

## 2026-05-31 - ANYU Project Dashboard HTML v0

Completed changes:
- Created a static owner-facing project dashboard at `ai-collaboration/dashboard/anyu-project-dashboard.html`.
- Added `ai-collaboration/dashboard/README.md` with local-open instructions, safety warning, and update cadence.
- Dashboard summarizes current project snapshot, status cards, timeline, architecture flows, engineering status, deployment posture, NewebPay status, queue readiness, merchant review, support/refund readiness, blockers, tech debt, next task, and report references.
- Captured the latest actual sandbox state: v3 ran and exposed safe NotifyURL category `trade_info_decrypt_failed`.

Learnings:
- The owner now has a coarse but useful single-file dashboard for project state without reading every handoff/report.
- The dashboard should be treated as maintained documentation and updated after meaningful launch gate or blocker changes.

Unresolved questions:
- Dashboard can drift if future handoffs do not update it after major state changes.
- Main/staging documentation promotion policy should be followed if main is used as production source-of-truth.

## 2026-05-31 - NewebPay Sandbox TradeInfo Decrypt Config Alignment v0

Completed changes:
- Inspected NewebPay checkout and NotifyURL config loading.
- Confirmed both checkout creation and NotifyURL verification use the same `getNewebPayConfig(...)` helper and the same env names.
- Owner approved using `apps/web/.env.local` as secure local credential source because `NEWEBPAY_MERCHANT_ID`, `NEWEBPAY_HASH_KEY`, and `NEWEBPAY_HASH_IV` were not present in the shell.
- Force-aligned branch-scoped Preview(`staging`) NewebPay sandbox env names only: MerchantID, HashKey, HashIV, checkout URL, NotifyURL, environment, app URL, and checkout enable flag.
- Redeployed Preview(`staging`) and verified staging health at `environment=preview`, `gitBranch=staging`, commit `ebfc83b71c84`, route bundle `payment-foundation-2026-05-29`.
- Confirmed Production remained disabled and fail-closed: production health stayed `production/main/1990fc034d74`; production checkout and fake-paid returned JSON 404 `not_found`.

Learnings:
- `NEWEBPAY_ENVIRONMENT` is categorization only and does not affect crypto behavior.
- `NEWEBPAY_CHECKOUT_URL` controls gateway target only and does not affect NotifyURL decryption.
- There are no alternate/fallback NewebPay credential env names in source.

Unresolved questions:
- Fresh sandbox E2E v4 is required to prove whether the newly aligned Preview(`staging`) credentials resolve `trade_info_decrypt_failed`.
- If v4 still fails with `trade_info_decrypt_failed`, the likely remaining issue is NewebPay backend/shop credential mismatch outside code.

## 2026-05-31 - Fresh NewebPay Sandbox E2E Payment Smoke v4

Completed changes:
- Ran a fresh Preview(`staging`) NewebPay sandbox checkout after branch-scoped sandbox config alignment.
- Created fresh checkout run `20260530164832`: source analyze HTTP 200, checkout HTTP 200, sandbox `ccore`, MPG `Version=2.0`, NT$49, and `pcs_` handoff present.
- Owner submitted sandbox credit-card one-time payment and browser returned to staging.
- Polled session-bound payment status for 72 attempts over about 6 minutes; final status remained `waiting_for_payment`, with no access path.
- Inspected safe Vercel logs and captured `newebpay_notify_failed.category=trade_info_decrypt_failed` again.
- Confirmed Production remained disabled: production health stayed `production/main/1990fc034d74`; production checkout and fake-paid returned JSON 404 `not_found`; public pages returned 200.
- Updated the project dashboard to reflect that v4 ran and the decrypt failure persists.

Learnings:
- Preview(`staging`) env force-alignment from `.env.local` did not resolve real provider callback decryption.
- The callback still has the expected form shape and HTTP 200 transport, so the failure remains before payload parsing, payment intent lookup, amount matching, paid transition, delivery artifacts, queue trigger, or paid access handoff.
- The next useful evidence must come from NewebPay sandbox backend/shop credential verification, not payment flow code changes.

Unresolved questions:
- Whether the sandbox backend shop that processed the transaction has different HashKey/HashIV from `.env.local` / Preview(`staging)`.
- Whether copied credential values contain hidden whitespace, quotes, old sandbox values, production values, or a different shop's values.

## 2026-05-31 - NewebPay Sandbox Backend Credential Verification v0

Completed changes:
- Re-inspected NewebPay checkout and NotifyURL source config paths.
- Confirmed both checkout and NotifyURL use `getNewebPayConfig(...)` and the same NewebPay env names.
- Verified local `apps/web/.env.local` has the three sensitive NewebPay credential names present, without printing values.
- Verified Vercel Preview(`staging`) has the expected branch-scoped NewebPay env names, without printing values.
- Verified Production does not have NewebPay credential/config env names listed and remains out of scope for sandbox credentials.
- Created an owner-facing backend checklist for exact sandbox shop MerchantID / HashKey / HashIV / gateway / NotifyURL verification.
- Updated the project dashboard to point to owner-side backend credential verification as the current blocker.

Learnings:
- App source consistency is not the current blocker: both provider callback and checkout creation read the same helper and same env names.
- Preview(`staging`) branch-scoped env presence is correct at the metadata level, but value equality with NewebPay backend cannot be proven without owner-side manual verification.
- Production does not appear to have NewebPay credential/config env names configured, which is consistent with disabled production runtime.

Unresolved questions:
- Whether the successful sandbox transaction belongs to the exact same sandbox shop as the configured MerchantID / HashKey / HashIV.
- Whether copied backend credentials include hidden formatting issues or are stale/regenerated.
- If owner confirms credentials match exactly, a code-level TradeInfo decrypt compatibility investigation is the next step.

## 2026-05-31 - NewebPay TradeInfo Decrypt Compatibility Investigation v0

Completed changes:
- Compared ANYU NewebPay crypto helpers with a public NewebPay MPG sample.
- Found the likely root cause for sandbox `trade_info_decrypt_failed`: ANYU used Node default AES padding, while the public NewebPay sample uses AES-256-CBC with manual 32-byte padding and zero auto-padding.
- Updated checkout TradeInfo encryption and NotifyURL TradeInfo decryption to use the NewebPay-compatible 32-byte padding contract.
- Added a public sample vector regression test and changed NotifyURL service test fixtures to use the production encryption helper.
- Updated the project dashboard to show the blocker has moved from credential mismatch suspicion to a padding compatibility fix that needs fresh sandbox v5 verification.

Learnings:
- Route transport, form shape, and safe diagnostic logging were already working; the failure category was specific to decrypt compatibility.
- `TradeSha` format/order remains aligned: `HashKey=<HashKey>&<TradeInfo>&HashIV=<HashIV>`, SHA256 uppercase.
- No real provider payload or decrypted payload was needed to identify this code-side mismatch.

Unresolved questions:
- Fresh NewebPay Sandbox E2E Payment Smoke v5 is required to prove real sandbox provider callbacks now decrypt and transition the payment intent to paid.
- If v5 still fails, the safe diagnostic category should determine whether the next issue is signature, merchant, amount, payment-intent matching, or another provider status mismatch.

## 2026-05-31 - Fresh NewebPay Sandbox E2E Payment Smoke v5

Completed changes:
- Updated branch-scoped Preview(`staging`) `OPERATOR_TEST_SECRET` from local secure config because staging rejected the local operator header.
- Triggered a fresh Preview(`staging`) deployment by pushing the v5 handoff commit to `origin/staging`.
- Created fresh sandbox checkout run `20260530173208`: source analyze HTTP 200, checkout HTTP 200, sandbox `ccore`, MPG `Version=2.0`, NT$49, and `pcs_` handoff present.
- Owner submitted sandbox credit-card one-time payment and browser returned to staging.
- Session-bound payment status reached `paid_ready` on the first poll after owner confirmation.
- Session-bound paid access page rendered completed content; duplicate reload/status stayed stable.
- Confirmed Production remained disabled: production health stayed `production/main/1990fc034d74`; production checkout and fake-paid returned JSON 404 `not_found`; public pages returned 200.

Learnings:
- The TradeInfo 32-byte padding compatibility fix resolved the previous real sandbox `trade_info_decrypt_failed` blocker.
- Real NewebPay sandbox flow now proves checkout → NotifyURL/decrypt/verification → paid readiness → delivery/queue/access path at app level.
- Manual processor fallback was not used in v5; queue/provider path completed before first post-payment poll.

Unresolved questions:
- Production payment runtime is still disabled and should remain so until merchant approval/formal credentials and production launch gate approval.
- A dedicated secret-safe sandbox E2E helper remains useful to reduce manual form-generation friction.

## 2026-05-31 - ANYU Project Dashboard Update after Sandbox E2E Pass v0

Completed changes:
- Updated `ai-collaboration/dashboard/anyu-project-dashboard.html` after Fresh NewebPay Sandbox E2E Payment Smoke v5 passed.
- Marked NewebPay sandbox E2E as passed.
- Marked the TradeInfo 32-byte padding issue as resolved by v5 evidence.
- Marked the paid delivery pipeline as sandbox-validated.
- Updated the active blocker to NewebPay merchant approval / formal production credentials.
- Kept production payment runtime explicitly disabled in dashboard copy.
- Clarified next step: wait/maintain launch readiness if approval is pending; run Production Payment Config Dry-Run v0 if approval/formal credentials are available.

Learnings:
- Dashboard had a few stale transition rows from before v5; those were cleaned up to reduce owner confusion.
- Current owner-facing status is now: sandbox E2E passed, production payment disabled, launch blocked by external approval/formal credential readiness.

Unresolved questions:
- Whether NewebPay approval/formal production credentials are available yet.
- Whether main should be reconciled with staging docs again before production launch gate work.

## 2026-05-31 - Post-Sandbox E2E Sync-Up / Next Sprint Recommendation v0

Completed changes:
- Created a post-sandbox E2E sync-up report with current state confirmation, safe work categories, ranked candidate tasks, product opportunities, engineering cleanup opportunities, guardrails, and recommended next tasks.
- Inspected source surfaces for homepage, Module 01 landing/result/payment pages, paid preview CTA, refund/legal pages, and known tech debt references.
- Confirmed dashboard is already current after sandbox E2E pass and did not require another update.

Learnings:
- The public homepage is merchant-review aligned, but the in-product paid preview still uses internal-test / no-charge / LINE-or-Email copy.
- Since sandbox provider flow is now proven, the highest-value low-risk next sprint is launch UX alignment, not more provider engineering.
- The best next Codex tasks are: Module 01 Payment Launch UX Alignment Plan v0, Secret-Safe NewebPay Sandbox E2E Helper v0, and Production Payment Config Dry-Run Plan / Preflight Script v0.

Unresolved questions:
- Whether owner wants the result-page paid CTA to keep internal-test copy until approval or prepare launch-ready copy behind a state/flag.
- Whether NewebPay approval/formal production credentials are available yet.
- Whether owner wants the sandbox helper implemented now or kept as a runbook until another provider smoke is needed.

## 2026-05-31 - Post-Sandbox Next Sprint Scan with Multi-Module Direction v0

Completed changes:
- Created a post-sandbox next sprint report that incorporates the owner’s multi-module direction while keeping production payment disabled.
- Confirmed the best review-wait sprint is Module 01 launch UX lock-down, Module 02 concept/spec exploration, and secret-safe QA/tooling cleanup rather than full Module 02 implementation or new payment runtime work.
- Inspected current module routing/config and confirmed routing is slug-based, but landing/result/access rendering remains mostly Module 01-specific.
- Updated the project dashboard to show review-wait sprint planning, multi-module direction, and the recommended pending-approval task sequence.

Learnings:
- The homepage should not be converted into a broad portal before NewebPay review completes; Module 01 product/price/refund evidence must remain visible.
- A small “更多暗語測驗 / 即將推出” section is the lowest-risk bridge toward multi-module positioning, but only after a Module 02 concept is selected.
- Module 02 should start as spec/research; full paid implementation should wait until Module 01 launch UX and production launch gates are stable.

Unresolved questions:
- Which Module 02 direction owner prefers: low-risk/shareable `社群微訊號讀心卡` or deeper Personal Insight Graph seed `心動慣性圖譜`.
- Whether NewebPay approval/formal production credentials arrive before the next product sprint starts.
- Whether the Module 01 paid CTA should remain internal-test copy until approval or be prepared as launch-ready multi-state copy first.

## 2026-05-31 - Secret-safe NewebPay Sandbox E2E Helper / QA Runner Cleanup v0

Completed changes:
- Added `apps/web/scripts/newebpay-sandbox-e2e-helper.mjs` for repeatable staging NewebPay sandbox smoke preparation and verification.
- Added package script `qa:newebpay:sandbox` with `create-checkout`, `poll-status`, and `verify-after-payment` modes.
- The helper writes temporary payment forms and state only under `/private/tmp/anyu-newebpay-smoke/` and prints sanitized JSON only.
- Updated the project dashboard with the new sandbox helper command and safety expectations.

Learnings:
- The existing fake-paid QA runner already has a good sanitized output pattern, but sandbox E2E needs a separate helper because it must write a real provider form for manual browser submission.
- The helper can call staging routes and does not need local NewebPay provider credentials; it only needs `OPERATOR_TEST_SECRET` for operator-gated checkout creation.
- Missing-secret dry run blocks safely before checkout creation.

Unresolved questions:
- Whether future smoke runs need automated safe Vercel log category retrieval, or whether manual dashboard/log inspection remains sufficient.
- Whether a separate production controlled-smoke helper is worth building after merchant approval; it should remain a distinct launch-gate task.

## 2026-05-31 - Module 01 Launch UX Lock + Multi-State Paid CTA Plan v0

Completed changes:
- Created a Module 01 launch UX lock plan covering homepage/storefront, analyze flow, free result, paid preview CTA, checkout creation, ReturnURL, payment status, access page, legacy paid unlock, and legal/refund/support surfaces.
- Documented a paid CTA/access state map for runtime disabled, review pending, checkout enabled, waiting for NotifyURL, paid processing, paid ready, failed/retryable, invalid/expired sessions, idempotent access, and production fail-closed.
- Identified the main launch mismatch: storefront/refund copy is payment-review aligned, but the in-result paid CTA/contact flow still uses internal-test, no-charge, LINE/Email delivery language.
- Recommended follow-up implementation tasks for multi-state paid CTA, copy alignment, checkout CTA wiring, ReturnURL/access fallback polish, and refund response-window confirmation.

Learnings:
- Homepage price and checkout amount are aligned at NT$49.
- ReturnURL correctly avoids implying payment success before NotifyURL truth.
- The biggest user-facing launch risk is not provider flow; it is state/copy mismatch between production storefront and result-page paid CTA.

Unresolved questions:
- Whether owner wants review-pending copy to keep contact capture or show a disabled paid CTA with optional notification.
- Whether LINE delivery references should be removed, hidden, or retained only in legacy/internal-test states before production launch.
- What exact refund/support response window owner wants public copy to state before formal launch.

## 2026-05-31 - Module 01 Multi-State Paid CTA Implementation v0

Completed changes:
- Added a small paid CTA view model for Module 01 states including review pending, payment unavailable, checkout available, pending/processing, ready, failed, invalid/expired, and already unlocked.
- Updated the Module 01 result paid preview to show a disabled review-pending CTA and launch-facing checkout-available copy instead of internal-test/no-charge/LINE-or-Email delivery language.
- Removed the result-page contact capture from the main paid CTA flow while leaving legacy LINE/contact infrastructure in the repo.
- Updated ReturnURL, payment access fallback, paid pending failure copy, and refund copy to include support/refund framing and the owner-approved 3-7 business day response window.
- Added/updated tests for paid CTA copy, ReturnURL truth wording, access fallback support copy, legal/refund copy, and event metadata expectations.

Learnings:
- The safest current production state is a disabled paid CTA with clear NT$49 future one-time unlock copy and support/policy links.
- ReturnURL copy remains non-mutating and now explicitly avoids treating browser return as payment truth.
- Broader terms/privacy still include some internal-test/LINE-era references outside the result-page paid CTA surface; those should be handled separately if owner wants full public legal copy alignment.

Unresolved questions:
- When NewebPay approval arrives, result-page checkout form submission still needs a dedicated wiring task before public production checkout.
- Whether to run a separate public legal copy alignment task to remove remaining internal-test/LINE-era references from terms/privacy.

## 2026-05-31 - ANYU Core Engine & Module Grammar v0

Completed changes:
- Created a Core Engine / Module Grammar product architecture report defining ANYU as an AI-native personal insight system rather than isolated AI tests.
- Defined the two-layer architecture: visible module experiences and reusable internal core engine capabilities.
- Documented the core engine layers: Module Experience, Interaction Engine, Personal Insight Graph, Knowledge Skill, Result Artifact, and Growth / Social Loop.
- Created a reusable module grammar for future module concepts, including interaction type, knowledge skills, traits, artifacts, monetization, safety boundaries, analytics signals, complexity, and readiness.
- Mapped Module 01「曖昧溫度計」to the grammar and recommended `職場暗流雷達` as Module 02 concept/spec only.
- Updated the static project dashboard with the new Core Engine / Module Grammar status and next recommended concept task.

Learnings:
- Module 02 should validate a different interaction and artifact shape, not simply become another long relationship report.
- `職場暗流雷達` is the strongest grammar-validation candidate because it keeps ANYU’s signal-reading identity while moving beyond romance and introducing scenario-card interaction.
- Personal Insight Graph should remain a soft future direction until privacy, consent, retention, and user-facing memory rules are designed.

Unresolved questions:
- Whether owner prefers Module 02 to move outside romance immediately with `職場暗流雷達` or stay relationship-adjacent with a concept like `答案壓力計`.
- Whether future Personal Insight Graph should be exposed as a named user-facing feature or remain invisible personalization.
- Whether NT$49 should remain the default future paid price for Module 02 if it becomes monetized.

## 2026-05-31 - Public Legal Copy Launch Alignment v0

Completed changes:
- Audited launch-facing legal, refund, support, homepage, result CTA, and payment/access copy for internal-test, no-charge, contact-capture, and LINE-era language.
- Updated public legal content so Terms/Privacy/Refund/Disclaimer align with NT$49 one-time digital AI report unlock, web delivery after provider notification, and support/refund handling through hello@anyu.tw.
- Removed launch-facing Terms language that said current payment was internal-test/no-charge and removed LINE paid-delivery promises from public legal copy.
- Added provider notification / system record payment-truth wording to Terms and Refund copy.
- Updated legal index and dashboard status to reflect legal/support launch-readiness.
- Added legal content tests for no-charge/LINE paid-delivery regressions, NT$49 one-time model, provider notification truth, and 3-7 business day handling window.

Learnings:
- The remaining stale public launch copy was concentrated in `apps/web/src/content/legal.ts`, especially Terms and Privacy contact-channel wording.
- Legacy ContactCapture and LINE fulfillment code still contain internal-test / LINE-first copy, but they are no longer foregrounded by the main Module 01 paid CTA path.
- ReturnURL/payment truth language is now consistent across UX and legal/refund copy.

Unresolved questions:
- Whether invoice/receipt wording should change before production payment launch depending on owner business/tax posture.
- Whether legacy ContactCapture / LINE-first copy should be removed later or preserved for backward-compatible/internal paths.

## 2026-05-31 - Env Readiness / Local QA Bootstrap v0

Completed changes:
- Added `apps/web/scripts/qa-env-preflight.mjs`, a secret-safe presence-only preflight for local QA and staging smoke workflows.
- Added package script `qa:env:preflight` with modes for fake-paid QA, queue-mode fake-paid QA, NewebPay sandbox checkout, sandbox verification, manual fallback, Vercel env alignment preflight, and all-mode summary.
- Updated `apps/web/.env.example` with QA/payment/queue env names only and blank values.
- Documented a local QA env matrix covering required local shell env, optional env, Preview(staging) counterpart names, match expectations, production cautions, and safe blocked behavior.
- Updated the dashboard QA tooling section to include the new preflight command.

Learnings:
- Existing QA scripts use `process.env`; `.env.local` key presence alone does not make a QA command ready unless the shell exports the values or the runner loads them.
- The preflight can safely read `.env.local` key names without printing values, lengths, prefixes, suffixes, hashes, or checksums.
- Preview(staging) branch-scoped env remains the authoritative staging QA source and can diverge from local secure config without an explicit alignment workflow.

Unresolved questions:
- Whether a future task should add a Vercel Preview(staging) env name-only audit/diff command.
- Whether production controlled-smoke should get a separate launch-gate preflight profile after NewebPay approval.

## 2026-05-31 - Legacy ContactCapture / LINE-era Copy Cleanup v0

Completed changes:
- Audited ContactCapture, LINE helper copy, LINE bridge/webhook messages, active result paid CTA copy, and related tests/e2e strings for internal-test, no-charge, and LINE paid-delivery language.
- Reframed ContactCapture from LINE-first complete-analysis delivery to optional LINE/Email notification/support wording.
- Removed ContactCapture internal-test and no-charge copy.
- Reframed LINE fulfillment bridge/webhook copy as short-code confirmation for an existing complete analysis page, not launch paid delivery.
- Updated unit and e2e expectations for the new launch-safe wording.

Learnings:
- Active Module 01 result paid CTA already avoids ContactCapture; the remaining stale copy lived in legacy/fallback ContactCapture and LINE fulfillment surfaces.
- Social share copy that mentions LINE / Threads is separate from paid delivery and can remain.
- LINE infrastructure still exists, but visible copy no longer presents LINE as the paid report delivery promise.

Unresolved questions:
- Whether owner wants to remove/archive ContactCapture and LINE fulfillment routes later or keep them as legacy/fallback infrastructure.
- Whether LINE should be reconsidered as a future support/notification feature after production payments stabilize.

## 2026-05-31 - Legacy ContactCapture / LINE-era Copy Cleanup v0 Verification

Completed changes:
- Re-ran the ContactCapture / LINE-era copy audit after the cleanup task was repeated.
- Confirmed the prior cleanup at `7d1c51b` remains in place and no additional source copy edits were needed.
- Added a verification handoff and execution report.

Learnings:
- `ContactCapture` is not imported by the active Module 01 result paid CTA path.
- Remaining LINE references are notification/support, short-code confirmation, legal future-channel notes, social sharing, tests, or historical docs.
- Active launch-facing paid report copy remains web-based and does not promise LINE delivery.

Unresolved questions:
- Whether to keep legacy ContactCapture / LINE fulfillment infrastructure as fallback/internal surfaces or schedule a later deprecation/removal task.

## 2026-05-31 - Local Env Autoload for QA Scripts v0

Completed changes:
- Added a script-only local env loader at `apps/web/scripts/lib/load-local-env.mjs`.
- Updated `qa:env:preflight`, `qa:fake-paid`, and `qa:newebpay:sandbox` to load `apps/web/.env.local` when shell env is absent.
- Added tests for env parsing, exported-env precedence, and repo-root web app directory discovery.
- Updated `.env.example`, dashboard QA tooling notes, and the execution report.

Learnings:
- Exported shell env now has precedence over `.env.local`, preserving intentional one-off overrides.
- `.env.local` autoload works for local scripts without changing Next.js runtime or deployed staging behavior.
- Current local effective fake-paid preflight sees `OPERATOR_TEST_SECRET` but still lacks `INTERNAL_JOB_SECRET`, so manual fallback QA may still block unless that value is added locally.

Unresolved questions:
- Whether to add `.env.qa.local` as an additional optional local QA profile later.
- Whether to consolidate duplicated QA HTTP/redaction helpers in a future cleanup task.

## 2026-05-31 - Local Git Remote-Tracking Ref Permission Repair v0

Completed changes:
- Investigated the repeated local `origin/staging` remote-tracking ref and `FETCH_HEAD` update failures.
- Confirmed remote `staging` is correct via `git ls-remote`, while local `origin/staging` remains stale.
- Confirmed no stale `.lock` files were present.
- Identified `com.apple.provenance` xattrs and sandbox write denial on `.git/FETCH_HEAD` and `.git/refs/remotes/origin`.
- Documented a manual Terminal repair command because Codex cannot remove/write the affected `.git` paths from this sandbox.

Learnings:
- The repeated `[ahead N]` status is caused by stale local remote-tracking refs, not by failed pushes.
- The affected `.git` files are owned by the current user with normal modes, so the blocker is macOS provenance/sandbox permission behavior rather than ordinary chmod/chown drift.
- Repair requires running outside the Codex sandbox or with Terminal permissions that can remove the xattr.

Unresolved questions:
- Whether the owner’s normal Terminal can remove `com.apple.provenance` without `sudo` or Full Disk Access.

## 2026-05-31 - Payment Trigger Source Naming Cleanup Plan v0

Completed changes:
- Audited source, tests, schema, queue payloads, processor logic, and historical docs for `payment_success_future` and related trigger-source names.
- Confirmed `payment_success_future` remains active runtime metadata for NewebPay-created `generation_jobs.trigger_source`.
- Confirmed queue payloads already use `newebpay_notify` and processors do not select jobs by trigger source.
- Documented a compatibility-first rename plan.

Learnings:
- The DB column is plain text, but TypeScript allow-list validation makes direct removal of `payment_success_future` unsafe.
- Existing staging rows likely contain `payment_success_future` after sandbox E2E v5, so old values should remain accepted.
- The cleanest replacement for new NewebPay-created generation jobs is `newebpay_notify`.

Unresolved questions:
- Whether to implement the rename before production launch or leave it as non-blocking internal metadata debt.

## 2026-05-31 - Payment Trigger Source Naming Cleanup Implementation v0

Completed changes:
- Added `newebpay_notify` to persisted generation job trigger source constants.
- Kept `payment_success_future` accepted as a legacy value.
- Switched NewebPay NotifyURL delivery artifact creation to create new generation jobs with `generationJobTriggerSource: "newebpay_notify"`.
- Added tests for new NewebPay metadata, legacy acceptance, and legacy processor compatibility.
- Updated dashboard tech-debt copy.

Learnings:
- No DB migration was required because `generation_jobs.trigger_source` is plain text.
- Processor behavior remains safe because jobs are claimed by status/type/timing or exact ID, not by trigger-source name.
- Queue payload source already used `newebpay_notify`, so queue behavior did not need a shape change.

Unresolved questions:
- Whether future reporting should normalize legacy `payment_success_future` and current `newebpay_notify` into one provider-notify display bucket.

## 2026-05-31 - Entitlement / Payment Intent Uniqueness Migration Plan v0

Completed changes:
- Audited payment intent, entitlement, generation job, paid access token, and related schema/indexes.
- Audited NotifyURL, fake-paid, paid delivery artifact, entitlement helper, and generation job idempotency behavior.
- Documented data preflight SQL and a staging-first migration gate.
- Recommended a partial unique index on `entitlements(payment_intent_id)` where `payment_intent_id IS NOT NULL`.

Learnings:
- `payment_intents.merchant_order_no`, `entitlements.paid_access_token_hash`, and `generation_jobs.dedupe_key` already have DB uniqueness protection.
- `entitlements.payment_intent_id` is currently only non-unique indexed, so concurrent duplicate delivery creation still has a race window.
- The right invariant is one entitlement lifecycle per non-null payment intent, including refunded/revoked states.

Unresolved questions:
- Whether Drizzle migration execution allows `CREATE INDEX CONCURRENTLY`, or whether this should be applied through a manually approved Neon SQL step.
- Existing staging/production duplicate counts were not queried in this planning task.

## 2026-05-31 - Entitlement Payment Intent Unique Index Migration v0

Completed changes:
- Added `apps/web/drizzle/0008_entitlements_payment_intent_unique.sql` with a partial unique index on non-null `entitlements.payment_intent_id`.
- Updated Drizzle schema to model `entitlements_payment_intent_unique_idx`.
- Added runtime conflict handling so paid delivery artifact creation re-reads and reuses an existing entitlement after the unique conflict.
- Added tests for migration SQL shape, unique-conflict reuse, and unresolved conflict safety.
- Updated dashboard tech-debt copy.

Learnings:
- `drizzle-kit check` passes, but the installed CLI does not support `generate --dry-run`.
- Staging migration was not applied because this task did not have a verified staging-only DB target.
- Conflict handling now prevents a concurrent duplicate entitlement race from turning into an unhandled 500 once the unique index exists.

Unresolved questions:
- Whether to apply `CREATE INDEX CONCURRENTLY` through the migration runner or a manually approved Neon SQL step.
- Staging duplicate preflight and index application remain pending.

## 2026-05-31 - Entitlement Unique Index Staging Apply v0

Completed changes:
- Verified the staging DB target as Neon project `anyu-next`, non-default `preview` branch, database `neondb`.
- Ran aggregate-only staging preflight checks and found zero duplicate non-null `payment_intent_id` entitlement groups.
- Applied `entitlements_payment_intent_unique_idx` on staging with manual Neon SQL using `CREATE UNIQUE INDEX CONCURRENTLY`.
- Dropped the old non-unique `entitlements_payment_intent_idx` on staging.
- Verified the new index is unique and partial with predicate `payment_intent_id IS NOT NULL`.
- Confirmed production checkout and fake-paid routes still fail closed and production DB migration was not applied.
- Updated the dashboard to show staging uniqueness applied and production gated.

Learnings:
- Staging had 14 non-null payment-intent entitlements, all active, and no duplicates before the index was applied.
- Manual Neon SQL is the safer current path for concurrent index operations because migration runner transaction behavior is not verified.
- Local idempotency tests cover the conflict-handling behavior without creating additional staging payment/entitlement rows.

Unresolved questions:
- Whether production should use the same manual Neon SQL method or a verified non-transactional migration runner.
- Whether to run an approved live staging duplicate-delivery smoke later that intentionally creates test rows.

## 2026-05-31 - Module 01 Checkout CTA Wiring Plan v0

Completed changes:
- Inspected Module 01 result page, paid CTA view model, `PaidPreviewCard`, checkout route, checkout service, ReturnURL/status/access pages, tests, and sandbox helper.
- Confirmed result-page CTA copy can render `checkout_available`, but the current `PaidPreviewCard` button remains disabled because no checkout action is passed.
- Documented the existing NewebPay checkout route contract and provider form response shape.
- Recommended a dedicated checkout-start page/route for v0 instead of client-side fetch.
- Updated the dashboard next-task guidance and source links.

Learnings:
- The result page already has enough data to start checkout: `moduleSlug` and `resultId`.
- The checkout route currently remains operator-gated while `ENABLE_PAYMENT_RUNTIME=false`; browser UI wiring must not expose `OPERATOR_TEST_SECRET`.
- A dedicated server-rendered checkout-start page best matches NewebPay form submission and keeps production fail-closed behavior easier to test.

Unresolved questions:
- Which pre-launch staging UI gate should be approved for operator-only browser checkout before production runtime is enabled.
- Whether checkout-start should auto-submit to NewebPay immediately or show one explicit confirmation button first.

## 2026-05-31 - Module 01 Checkout CTA Wiring Implementation v0

Completed changes:
- Added server-rendered checkout-start page at `/m/[moduleSlug]/result/[resultId]/checkout`.
- Added checkout gate helpers so result-page checkout can start through production runtime gates or a narrow Preview(`staging`) server-side operator gate.
- Wired runtime result-page paid CTA to the checkout-start page when checkout is available.
- Kept review-pending/payment-unavailable CTA disabled.
- Rendered explicit NewebPay submit form with one user click instead of auto-submit.
- Added tests for gate behavior, CTA link rendering, checkout-start page rendering, and secret/provider safety boundaries.
- Confirmed production checkout and fake-paid routes remain JSON `not_found`.

Learnings:
- The result page already had enough state to create checkout safely: `moduleSlug` and `resultId`.
- Server-rendered checkout-start avoids exposing `OPERATOR_TEST_SECRET` to browser code.
- The checkout service still creates only `payment_intent` + `pcs_` session before NotifyURL; entitlement/job/queue remain post-payment only.

Unresolved questions:
- Full staging browser checkout smoke through the result-page CTA still needs to run.
- Production launch remains blocked by external NewebPay approval, production config dry-run, production DB unique-index gate, and controlled production smoke.

## 2026-05-31 - Payment UX Orchestration Plan v0

Completed changes:
- Audited current result page, checkout-start page, NewebPay checkout route, ReturnURL/status/access pages, paid unlock poller, LINE/LIFF fulfillment paths, operator fake-paid path, and sandbox helper.
- Documented current payment journey: result page → checkout-start → NewebPay → ReturnURL → status/access → completed paid result.
- Recommended web access remain canonical paid delivery, with LINE/LIFF limited to future notification/save-for-later/support unless a dedicated paid notification path is implemented.
- Recommended ReturnURL polling UX as a P1 launch polish item.
- Recommended checkout-start visual bridge polish to reduce ANYU-to-NewebPay style mismatch.
- Recommended script-driven staging checkout QA bypass instead of a visible fake-paid button on checkout-start.
- Recommended delaying unified ReturnURL abstraction until Module 02 payment design exists.

Learnings:
- ReturnURL is currently non-mutating and server-rendered but lacks client polling; the older `pa_` unlock route already has a polished pending poller pattern.
- LINE/LIFF current code is legacy unlock/fulfillment oriented and should not be positioned as paid report delivery.
- The fastest safe no-card QA path should verify result-page CTA and checkout-start HTML, then call operator fake-paid server-side and poll paid access.

Unresolved questions:
- Whether owner wants LINE notification before or after production payment launch.
- Whether ReturnURL should auto-redirect after paid readiness or only show a clear button.

## 2026-05-31 - ReturnURL Polling UX Polish v0

Completed changes:
- Added `PaymentReturnPoller` for the Module 01 NewebPay ReturnURL page.
- Updated `/m/[moduleSlug]/payment/return` to render the poller inside the existing Module 01 theme shell while keeping ReturnURL non-mutating.
- Added launch-safe state copy for waiting, processing, ready, failed/support, invalid/expired, and timeout states.
- Kept ready behavior as a visible `查看完整報告` button rather than auto-redirect.
- Added support/refund links and the 3-7 business day handling window to fallback states.
- Added targeted ReturnURL/poller tests and updated the dashboard to mark ReturnURL polling polish complete.

Learnings:
- ReturnURL can remain read-only while still feeling less technical by polling the existing payment status endpoint from the browser.
- The status endpoint is sufficient for a warm waiting/processing/ready flow without exposing raw `pcs_` or `pa_` values in rendered copy.
- A visible ready-state button is the safest v0 because it avoids unexpected redirects and keeps payment truth messaging clear.

Unresolved questions:
- Full Result-Page Checkout Staging Sandbox QA through the real CTA path is still pending.
- Checkout-start visual bridge polish remains a separate follow-up.
- The broader payment shell / module accent system should wait for Claude Design direction.

## 2026-05-31 - Result-Page Checkout Staging Sandbox QA v0

Completed changes:
- Ran staging QA through the real Module 01 result-page paid CTA path.
- Created a fresh normal staging result and verified the result page showed `解鎖完整報告｜NT$49` with a checkout-start link.
- Verified checkout-start rendered HTTP 200, NT$49, non-subscription copy, web delivery copy, explicit NewebPay button, and sandbox ccore provider form without exposing operator/provider secrets.
- Owner completed sandbox credit-card one-time payment and returned to staging.
- Verified staging backend state: payment intent paid, NotifyURL received, active entitlement, paid access hash present, `newebpay_notify` generation job completed, and paid result completed.
- Verified Vercel logs showed status polling and payment access HTTP 200 responses.
- Confirmed production checkout/fake-paid routes remain JSON 404/not_found and public legal/refund pages remain live.
- Updated the dashboard to mark result-page checkout staging QA passed.

Learnings:
- The real user-facing CTA path now reaches the same paid-ready/access outcome as the earlier helper/operator sandbox flow.
- ReturnURL polling produced repeated status requests and then payment access requests without needing manual processor fallback.
- Local `.env.local` `DATABASE_URL` did not target the same staging app schema, so Neon branch `preview` was used for sanitized backend verification.

Unresolved questions:
- Vercel request logs did not surface the provider NotifyURL or queue callback paths in the queried window, even though database state confirms NotifyURL receipt and completed generation.
- Entitlement `generation_job_id` remained unset even though the generation job completed; decide later whether this should be linked/backfilled.
- Checkout-start visual bridge polish remains pending.

## 2026-05-31 - Checkout-Start Visual Bridge Polish v0

Completed changes:
- Moved Claude Design Payment Shell + Module Accent references into `ai-collaboration/design/2026-05-31-payment-shell-module-accent/` with a reference-only README.
- Polished the Module 01 checkout-start page with ANYU wordmark/back link, Module 01 identity, `付款 / 生成 / 完成` stepper, order summary, NewebPay trust bridge, and support/refund footer.
- Kept checkout creation, provider form submission, ReturnURL polling, NotifyURL handling, and production fail-closed behavior unchanged.
- Updated tests to verify NT$49, one-time/non-subscription copy, provider notification truth, no internal-test/no-charge/LINE paid delivery wording, and no operator/provider secret exposure.
- Updated the dashboard to mark checkout-start visual bridge polish complete.

Learnings:
- The existing Module 01 theme boundary is enough to bring Riso/editorial continuity into checkout-start without introducing a full Payment Shell abstraction.
- Direction C can be adopted safely as product logic and structure while deferring shared shell/accent framework work.
- Checkout-start remains a server-side bridge: operator gate and provider secrets stay out of browser code while the provider form remains explicit for the user.

Unresolved questions:
- Whether to run a staging visual smoke after deployment to inspect the checkout bridge in a real browser.
- Whether the next review-wait task should be Module 02 concept spec or staging-only no-card QA bypass.
- Shared Payment Shell + Module Accent abstraction remains deferred until Module 02/payment UX requirements are clearer.

## 2026-05-31 - Checkout-Start Visual Bridge Staging Smoke v0

Completed changes:
- Ran a staging checkout-start visual/UX smoke by sanitized HTTP/HTML inspection.
- Confirmed staging health is preview/staging with route bundle `payment-foundation-2026-05-29` and commit marker `7c5628926962`.
- Created a fresh Module 01 staging result and confirmed the result-page paid CTA is visible, launch-aligned, and links to checkout-start.
- Confirmed checkout-start renders ANYU wordmark/back link, Module 01 identity, payment stepper, NT$49, one-time/non-subscription copy, NewebPay trust copy, provider-notification truth copy, web delivery copy, support/refund footer, and sandbox ccore POST form.
- Confirmed no internal-test/no-charge/LINE paid-delivery copy and no operator/provider secret names in checkout-start HTML.
- Confirmed production checkout/fake-paid routes remain JSON 404/not_found and production public home/refund/legal pages are live.

Learnings:
- Staging health exposes a shortened git commit marker, so commit freshness should be checked by prefix rather than full SHA equality.
- The polished checkout-start page passes launch-copy and safe-form checks without requiring another sandbox card payment.
- Browser automation was unavailable in this session; visual verification was limited to rendered HTML/static CSS evidence.

Unresolved questions:
- Whether owner wants a screenshot-level browser smoke later.
- Whether the next task should focus on Module 02 concept spec or a staging-only no-card checkout QA bypass.

## 2026-05-31 - Module 01 Payment Bridge Gap Closure Plan v0

Completed changes:
- Audited the current Module 01 payment bridge surfaces: result page, paid CTA view model, checkout-start, ReturnURL poller, payment access page, NewebPay NotifyURL, sandbox helper, fake-paid QA runner, LINE/LIFF paths, and Claude Design Direction C references.
- Reconciled the owner’s five payment UX concerns into complete / partial / planned / deferred status.
- Recommended `Result-Page Checkout No-Card QA Bypass v0` as the highest-value next implementation task.
- Recommended small ReturnURL visual continuity polish as the next UX improvement if launch polish remains the priority.
- Recommended keeping LINE as future notification/save-for-later/support only, not paid delivery.
- Recommended deferring unified multi-module ReturnURL abstraction until Module 02 payment design exists.

Learnings:
- The remaining payment bridge gaps are orchestration and QA gaps, not provider correctness gaps.
- NotifyURL is already provider-level unified; ReturnURL can remain module-specific until a second paid module proves what should vary.
- A script-driven no-card QA path can cover result-page CTA, checkout-start, fake-paid downstream delivery, and access render without exposing operator secrets to browser code.

Unresolved questions:
- Whether owner wants to prioritize no-card QA before Module 02 concept work.
- Whether ReturnURL visual continuity should be polished before or after the no-card QA script.
- Full Payment Shell + Module Accent implementation remains intentionally deferred.

## 2026-05-31 - Result-Page Checkout No-Card QA Bypass v0

Completed changes:
- Added `qa:result-checkout:no-card` for script-driven staging/operator no-card QA.
- Added helper functions for safe target validation, result/checkout HTML summarization, route redaction, and token-like output blocking.
- Added `result_checkout_no_card` support to `qa:env:preflight`.
- Added safe blank no-card QA env names to `apps/web/.env.example`.
- Added tests for production target rejection, result-page CTA parsing, checkout-start summary checks, route redaction, and unsafe token-like output blocking.
- Ran the no-card QA path against Preview(staging); it passed through fresh result creation, result-page CTA, checkout-start, operator fake-paid success, Vercel Queue completion, paid access render, and production fail-closed checks.

Learnings:
- The no-card QA path is useful for repeated UI/downstream confidence but does not replace sandbox card E2E because operator fake-paid creates an `operator_fake` payment intent rather than mutating the NewebPay checkout intent.
- The first staging run exposed a raw result ID in a sanitized path shape; route redaction was tightened before the final successful run.
- `QA_NO_CARD_DISABLE_LOCAL_ENV=1` gives a reliable CI-like missing-secret dry run even when `.env.local` exists.

Unresolved questions:
- Whether to run ReturnURL Visual Continuity Polish v0 next.
- Whether to move into Module 02 Concept Spec now that no-card payment QA exists.
## 2026-05-31 LINE Channel Accumulation Strategy v0

### Completed Changes

- saved the LINE Channel Accumulation Strategy v0 handoff and report
- inventoried existing LINE/LIFF/ContactCapture/short-code/webhook/fulfillment infrastructure
- repositioned LINE as a consent-based owned channel for save-for-later, completion notification, support, new-module notification, early access, discount, and future insight loops
- updated the static dashboard to record LINE as planned owned-channel infrastructure, not paid report delivery

### Learnings

- Existing LINE primitives are substantial: public add URL, ContactCapture, LIFF bridge, LIFF bind API, short-code fallback, webhook signature verification, dedupe/rate-limit tables, and safe funnel metrics already exist.
- The current LINE infrastructure still carries legacy unlock/fulfillment assumptions and should not be expanded until a channel consent/data model is approved.
- Module 02 concept/spec should likely precede new LINE CTAs so the channel has a concrete retention or early-access purpose.

### Unresolved Questions

- Should LINE become notification-only, staffed support, or campaign channel first?
- Should future LINE segmentation use only behavior segments initially, or include coarse trait summary categories after a separate privacy/product decision?
- Should legacy `unlock_intents` LINE fields be retained, wrapped, or migrated after a dedicated LINE Channel Data Model Plan?
## 2026-05-31 Paid Result Recovery Channel Plan v0

### Completed Changes

- saved the Paid Result Recovery Channel Plan v0 handoff and report
- inspected current checkout-start, ReturnURL, payment status, payment access, checkout session, paid access token, legacy LINE/ContactCapture, support/refund, and no-card QA paths
- documented the current recovery gap when a paid user loses the browser/session handoff
- recommended a soft-gated checkout-start recovery flow with LINE, Email, or skip-with-warning
- updated the dashboard with the paid result recovery roadmap

### Learnings

- Current paid access is strong while the `pcs_` checkout session remains available, but self-service recovery is not implemented after token loss or device switch.
- Recovery contact should be transactional and separate from future marketing/new-module consent.
- A dedicated recovery/contact model is better aligned than reusing legacy ContactCapture or storing recovery state only on payment intents.

### Unresolved Questions

- Should recovery implementation happen before production payment approval, or after approval during config dry-run?
- Should Email be stored reversibly for support and sending, or hashed-only until an Email notification implementation is approved?
- Should LINE be recovery-only first, or should Module 02 early-access opt-in be included as a separate optional checkbox?
## 2026-05-31 Paid Result Recovery Channel Schema / UX Implementation Plan v0

### Completed Changes

- saved the Paid Result Recovery Channel Schema / UX Implementation Plan v0 handoff and report
- specified a dedicated `payment_recovery_contacts`-style model linked to result/payment/entitlement lifecycle
- recommended encrypted normalized Email plus keyed hash, hashed LINE identity, and no storage or sending of raw `pcs_` / `pa_` tokens
- defined checkout-start soft gate states, copy, consent separation, metrics/events, implementation phases, test plan, risks, and next task
- updated the dashboard to mark the recovery schema/UX plan ready

### Learnings

- Recovery identity should be built as a narrow contact/consent layer, not as full membership and not as provider payment fields.
- Existing LIFF verification patterns are reusable, but recovery binding should use short-lived recovery state rather than legacy unlock intent state.
- The safest first implementation task is schema/service helpers before public checkout-start UI.

### Unresolved Questions

- Owner must approve reversible encrypted Email storage versus hash-only storage.
- Encryption key and rotation policy still need a dedicated implementation decision.
- It remains open whether first UX should start Email-only or Email plus LINE.

## 2026-05-31 Paid Result Recovery Identity Schema v0

### Completed Changes

- added `payment_recovery_contacts` schema and migration file
- added recovery contact crypto helpers using explicit hash/encryption env names
- added server-side recovery contact helpers for Email, LINE, lookup, entitlement binding, status changes, and marketing opt-in
- added recovery contact tests covering encryption, hashing, idempotency, consent separation, bearer token rejection, and migration/schema seams
- updated dashboard and `.env.example` for the new recovery identity foundation

### Learnings

- Recovery identity can be implemented without membership, checkout UI, LINE push, or Email sending.
- Email recovery needs reversible encryption plus keyed hash if future support-assisted sending is expected.
- LINE recovery can start as hashed identity only; raw LINE user ID should not enter analytics or reports.

### Unresolved Questions

- Staging DB apply is still pending.
- Encryption key rotation policy is not yet defined.
- Checkout-start recovery UX still needs a follow-up task after staging apply.

## 2026-05-31 Paid Result Recovery Identity Staging Apply v0

### Completed Changes

- saved the Paid Result Recovery Identity Staging Apply v0 handoff and report
- verified the staging DB target as Neon project `anyu-next`, branch `preview`, database `neondb`
- applied `apps/web/drizzle/0009_payment_recovery_contacts.sql` to the staging preview branch only
- verified `payment_recovery_contacts` table, columns, foreign keys, indexes, unique partial indexes, and empty starting row count
- confirmed production routes remain fail-closed and production DB does not have the recovery table
- updated the dashboard to mark recovery identity staging schema applied and production gated

### Learnings

- The recovery table can be applied cleanly to staging without inserting any customer-like test rows.
- The current migration has service-level allow-list enforcement for `contact_type`, `source`, and `status`, but no DB CHECK constraints.
- Neon MCP branch-specific SQL remains safer than local `DATABASE_URL` for staging DB operations because local DB targets have previously drifted.

### Unresolved Questions

- Production DB apply remains gated.
- Checkout-start recovery soft gate UX is not implemented yet.
- A future decision is needed on whether to add DB CHECK constraints for recovery contact enum-like fields.

## 2026-06-01 Checkout-Start Recovery Soft Gate UX v0

### Completed Changes

- saved the Checkout-Start Recovery Soft Gate UX v0 handoff and report
- added checkout-start recovery soft gate UI before NewebPay provider handoff
- added Email recovery capture endpoint at `/api/modules/[moduleSlug]/result/[resultId]/recovery/email`
- linked Email recovery contacts to module, result, and checkout-created payment intent
- kept marketing opt-in separate from transactional recovery consent
- deferred LINE recovery binding and framed LINE as future recovery/completion/support assistance, not paid report delivery
- updated no-card QA helper checks to require recovery soft gate signals on checkout-start

### Learnings

- Checkout-start already creates/reuses the payment intent before rendering the provider form, so recovery contacts can be linked to payment intent without changing provider behavior.
- A no-name required checkbox can enforce skip acknowledgement in the browser without adding extra fields to the NewebPay provider POST.
- Live staging Email-save QA needs the deployed commit plus recovery hash/encryption secrets in Preview(staging).

### Unresolved Questions

- Preview(staging) recovery secret presence still needs verification before live Email-save QA.
- LINE recovery binding needs a recovery-specific LIFF state design instead of reusing legacy unlock state directly.
- It remains open whether checkout-start marketing opt-in should stay here or move later to completed paid result.

## 2026-06-01 Checkout-Start Recovery Soft Gate Staging QA v0

### Completed Changes

- saved the Checkout-Start Recovery Soft Gate Staging QA v0 handoff and report
- confirmed staging is serving commit `61626dd5f692` on Preview(`staging`)
- verified checkout-start recovery soft gate, Email-first UI, deferred LINE option, separate marketing opt-in, and skip acknowledgement render on staging
- verified Email save fails safely when Preview(`staging`) recovery secrets are missing and does not create a recovery contact row
- ran `qa:result-checkout:no-card`; result-page CTA, checkout-start recovery gate signals, operator fake-paid, queue, paid access render, and production fail-closed checks passed
- confirmed production DB does not have `payment_recovery_contacts`

### Learnings

- Preview(`staging`) has `OPERATOR_TEST_SECRET` but lacks both recovery contact hash/encryption secrets.
- The soft gate itself is deployed and visible; the remaining blocker is env readiness for Email row creation.
- No-card QA can continue validating the skip/checkout path even while Email save is blocked by missing recovery secrets.

### Unresolved Questions

- Should recovery secrets be branch-scoped Preview(`staging`) only, or also configured for general Preview?
- Should checkout-start marketing opt-in remain before payment or move later to paid-ready/completed result?
- Email-save DB assertion needs rerun after recovery env alignment.

## 2026-06-01 Recovery Contact Preview(staging) Env Alignment v0

### Completed Changes

- saved the Recovery Contact Preview(staging) Env Alignment v0 handoff and report
- generated strong random recovery contact hash/encryption secrets without printing or committing values
- configured `PAYMENT_RECOVERY_CONTACT_HASH_SECRET` and `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY` as branch-scoped Preview(`staging`) env only
- created a fresh Preview deployment and pointed `staging.anyu.tw` to it
- reran Email recovery save QA successfully with a fake reserved-domain contact and verified encrypted/hash fields, transactional consent, marketing opt-in, result context, and payment intent context by sanitized aggregate checks
- removed the fake staging QA recovery row after verification
- reran `qa:result-checkout:no-card`; checkout-start recovery signals, fake-paid, queue, paid access, and production fail-closed checks passed

### Learnings

- Recovery encryption key should be a 32-byte value encoded as base64url/base64/hex; base64url aligns with current tests.
- Branch-scoped Preview(`staging`) recovery env is sufficient for `staging.anyu.tw` after redeploy/alias refresh.
- Email-save recovery contact creation now works on staging without exposing raw contact values, encrypted values, or hashes.

### Unresolved Questions

- Production recovery env and DB migration remain gated.
- Recovery link sending and LINE recovery binding are still future work.
- Key rotation policy remains undefined and should be planned before any production recovery launch.
- Local commit/push is blocked because the sandbox denied writes inside `.git` when Git attempted to create `index.lock`; task files are present in the workspace but not committed.

## 2026-06-01 Paid Ready / Completed Result Save CTA Plan v0

### Completed Changes

- saved the Paid Ready / Completed Result Save CTA Plan v0 handoff and report
- inspected checkout-start recovery, recovery contact helpers, ReturnURL polling, payment access handoff, paid access resolver, and completed paid result rendering
- planned non-blocking paid-ready reminder plus completed-result save section for users who skipped recovery before payment
- recommended a server-only post-payment recovery status summary helper before adding UI
- updated dashboard recovery roadmap and next recommended task

### Learnings

- Post-payment pages do not currently fetch recovery status; checkout-start is the only surface that reads recovery contacts today.
- Recovery helper sources already include `paid_ready` and `completed_result`, so post-payment save can reuse the existing schema without a new migration.
- Paid access resolution has entitlement context server-side, but `UnlockCompleted` currently receives display-only data, so a sanitized status summary should be passed rather than raw recovery rows or tokens.

### Unresolved Questions

- Confirm whether paid transition already calls `bindRecoveryContactsToEntitlement` after entitlement creation/reuse.
- Decide whether the first implementation should split helper methods and UI into separate tasks or combine them.
- Recovery link sending, LINE recovery binding, production recovery DB/env apply, and key rotation policy remain future work.

## 2026-06-01 Post-Payment Recovery Helper Methods v0

### Completed Changes

- saved the Post-Payment Recovery Helper Methods v0 handoff and report
- added server-only recovery status summary helpers for paid-ready/completed-result surfaces
- added post-payment Email recovery contact helper with encrypted/hash storage and separate marketing consent
- added non-fatal paid-delivery binding from recovery contacts to entitlement after payment delivery artifacts are available
- added tests for unsaved/saved/failed/bound summary states, masked Email display, post-payment idempotency, and paid-delivery binding behavior

### Learnings

- Checkout-start recovery contacts were linked to payment intent, but paid delivery did not previously bind them to entitlement.
- The existing schema already supports `paid_ready` and `completed_result` source values, so no migration was needed.
- A sanitized summary contract lets future UI avoid raw recovery rows, encrypted values, hashes, and token context.

### Unresolved Questions

- Paid Ready / Completed Result Save CTA Implementation v0 is still needed to expose the post-payment save UX.
- Recovery link sending, LINE recovery binding, production recovery DB/env apply, and key rotation policy remain future work.

## 2026-06-01 Paid Ready / Completed Result Save CTA Implementation v0

### Completed Changes

- saved the Paid Ready / Completed Result Save CTA Implementation v0 handoff and report
- added paid-ready recovery reminder to ReturnURL polling while keeping `查看完整報告` as primary CTA
- added completed paid result recovery save section with Email save, separate marketing opt-in, and deferred LINE option
- wired sanitized recovery summary into payment status, ReturnURL initial state, payment access, and paid access token result rendering
- added server-side post-payment Email save actions without hidden raw `pa_` or `pcs_` fields
- updated tests for saved/unsaved paid-ready and completed-result recovery states

### Learnings

- Server actions need narrowed scalar values captured before action definition to satisfy Next.js type checking.
- The completed result can show recovery UI without changing payment provider behavior or paid-result generation.
- No-card QA passed on the currently deployed staging commit, but a post-deploy smoke is still required for the new save section.

### Unresolved Questions

- Recovery link sending remains unimplemented.
- LINE recovery binding remains deferred until recovery-specific LIFF state exists.
- Production recovery DB/env apply remains gated.
- A staging smoke should verify the new post-payment save UI after this commit deploys.

## 2026-06-01 Paid Result Save CTA Staging Smoke v0

### Completed Changes

- saved the Paid Result Save CTA Staging Smoke v0 handoff and report
- confirmed staging is serving commit `46da41a088c4` on Preview(`staging`)
- verified required recovery env names exist as encrypted Preview(`staging`) branch-scoped variables
- ran `qa:result-checkout:no-card`; result CTA, checkout-start, fake-paid, queue, paid status, paid access, and production fail-closed checks passed
- verified completed-result unsaved recovery save section renders on staging with Email input, separate marketing opt-in, and deferred LINE option

### Learnings

- The new completed-result save section is deployed and visible for unsaved paid results.
- Direct Node POST to the Next server-action form returned HTTP 500 and should not be treated as browser-equivalent proof.
- Local headless Chromium cannot launch in this sandbox due macOS Mach port restrictions, so live Email-save form submission remains unverified.

### Unresolved Questions

- Browser/manual Email-save submission on completed result still needs verification.
- Staging DB row creation/update for completed-result Email save remains unverified.
- Recovery link sending, LINE recovery binding, production recovery DB/env apply, and key rotation policy remain future work.

## 2026-06-01 Paid Result Save CTA Browser Email Save Smoke v0

### Completed Changes

- saved the Paid Result Save CTA Browser Email Save Smoke v0 handoff and report
- confirmed staging is serving Preview(`staging`) commit `058a45c51aeb`, newer than required commit `46da41a`, with `payment-foundation-2026-05-29`
- generated a fresh no-card completed paid result and used owner-assisted real browser submission for the completed-result Email recovery save form
- verified the browser UI showed saved/success after submitting a reserved-domain fake Email
- verified persisted saved state by reloading the completed-result page and observing saved confirmation plus masked contact display without printing tokenized URLs, raw Email, encrypted values, or hashes
- reran `qa:result-checkout:no-card`; checkout-start recovery signals, fake-paid, queue, paid access, and production fail-closed checks passed

### Learnings

- Completed-result Email save works in a real browser on Preview(`staging`) and persists through the staging server path.
- Direct Node POST to a Next server-action form is not browser-equivalent and can fail even when real browser submission succeeds.
- Local browser/clipboard handoff is restricted in this sandbox, so tokenized URL handling should stay outside repo and use owner-assisted browser QA when needed.

### Unresolved Questions

- Recovery link sending remains unimplemented.
- LINE recovery binding remains deferred until recovery-specific LIFF state exists.
- Production recovery DB/env apply remains gated.
- A repeatable non-tokenized staging verification path may be useful if this browser form smoke becomes frequent.

## 2026-06-01 Module 01 Current State / Launch-Gate Snapshot v0

### Completed Changes

- saved the Module 01 Current State / Launch-Gate Snapshot v0 handoff and report
- summarized current Module 01 status across staging-proven, production-disabled, production-gated, growth/ads-gated, and deferred areas
- defined a three-gate launch model: Payment Capability Gate, Soft Public Availability Gate, and Growth / Ads Launch Gate
- created a staging proof matrix covering analyze/result, result-page CTA, checkout-start, NewebPay sandbox payment, NotifyURL, paid transition, delivery artifacts, queue, ReturnURL polling, paid access, no-card QA, recovery soft gate, completed-result Email save, and production fail-closed checks
- updated the dashboard to make the launch gate model explicit and to mark the current phase as Module 01 launch-gate snapshot complete

### Learnings

- Module 01 is stable enough for Module 02 concept/spec work because validated payment/recovery paths now have sandbox and no-card smoke protection.
- NewebPay approval should be treated as a payment capability gate only; it should not automatically trigger growth/ads launch.
- Production DB migration gates remain deliberate blockers for payment capability, not blockers for Module 02 planning.

### Unresolved Questions

- NewebPay formal approval and production credential readiness remain external.
- Production entitlement uniqueness and recovery contacts migrations remain gated.
- Recovery link/support-assisted recovery workflow is still unimplemented.
- Module 02 concept/spec remains the recommended next product task unless payment approval arrives first.

## 2026-06-01 LINE Recovery Binding Reframe v0

### Completed Changes

- saved the LINE Recovery Binding Reframe v0 handoff and report
- inventoried ContactCapture, LIFF bridge, LIFF bind API, webhook, short-code fallback, LineFulfillBridge, current LINE copy, and recovery contact LINE helper support
- classified reusable primitives versus legacy unlock/fulfillment-specific pieces
- defined new LINE semantics as paid result recovery identity, not paid report delivery
- designed recovery-specific LIFF state principles that avoid raw `pa_`, `pcs_`, unlock tokens, tokenized URLs, raw report content, source text, and raw LINE user IDs
- updated dashboard LINE roadmap wording and next recommendation

### Learnings

- Existing LINE ID token verification can be reused, but the current LIFF fulfillment flow should not be reused directly because it carries unlock-intent/token/link-delivery semantics.
- `payment_recovery_contacts` already supports hash-only LINE recovery contacts, which is the right target model.
- Existing legacy `unlock_intents.line_user_id` raw storage is privacy debt and should not be expanded.

### Unresolved Questions

- Whether recovery bind state needs a dedicated DB table or a short-lived signed server state still needs implementation approval.
- LINE recovery bind UI and staging QA remain unimplemented.
- Legacy LINE fulfillment retirement or containment should be planned after recovery binding is stable.

## 2026-06-01 LINE Recovery Bind State Helpers v0

### Completed Changes

- saved the LINE Recovery Bind State Helpers v0 handoff and report
- added server-only LINE recovery bind state helpers using short-lived signed `rlb_` tokens
- added token/state validation that rejects raw `pa_`/`pcs_` bearer values, unlock/fulfillment markers, provider payload markers, external return paths, and `/unlock/` return paths
- added a server-side bind helper that maps verified LINE identity into `payment_recovery_contacts` through the existing hash-only LINE recovery contact service
- added targeted tests covering state round-trip, expiry, tamper failure, unsafe return paths, hash-only LINE binding, sanitized failure categories, marketing opt-in separation, and Email helper regression
- updated the dashboard LINE roadmap to mark bind-state helpers implemented and route/callback as the next step

### Learnings

- A signed short-lived state token is enough for the first route-ready primitive and avoids introducing a new DB table before LIFF route requirements are proven.
- Existing `PAYMENT_RECOVERY_CONTACT_HASH_SECRET` can protect both the state signature and LINE contact hash purpose without exposing raw LINE IDs.
- The helper-layer boundary can keep legacy short-code/unlock-token semantics out of recovery binding.

### Unresolved Questions

- Future LIFF route may need DB-backed single-use state if replay diagnostics or stricter invalidation become necessary.
- Desktop LINE binding UX still needs a QR/open-on-phone design.
- Legacy LINE fulfillment retirement or containment remains deferred until recovery-specific binding is stable.

## 2026-06-01 LINE Recovery Bind Route / LIFF Callback v0

### Completed Changes

- saved the LINE Recovery Bind Route / LIFF Callback v0 handoff and report
- added `POST /api/line/recovery/bind-liff` as a recovery-specific LIFF bind route
- reused `verifyLineIdToken` for server-side LINE identity verification and `rlb_` recovery state helpers for safe state resolution
- bound verified LINE identity into `payment_recovery_contacts` using hash-only LINE recovery contact storage
- kept legacy LINE fulfillment/unlock route unchanged and out of the recovery flow
- added route tests for successful bind, raw LINE ID exclusion, missing/unverifiable LINE identity fallback, expired/tampered/token-like state failure, and marketing opt-in separation
- reran staging no-card checkout QA; result CTA, checkout-start, operator fake-paid, queue, paid access, and production fail-closed checks passed

### Learnings

- Recovery-specific LINE binding can be isolated behind a new JSON route without reusing legacy short-code/unlock-token semantics.
- The route can safely return a trusted internal recovery surface path only after `rlb_` state validates.
- Full LIFF browser smoke remains a separate owner-assisted QA step because route tests cannot prove LINE in-app browser behavior.

### Unresolved Questions

- A minimal recovery-specific LIFF page/UI entry is still needed to call the route from a real LINE context.
- Owner-assisted staging LIFF bind smoke remains unrun.
- DB-backed single-use bind state remains optional future work if replay diagnostics become necessary.

## 2026-06-01 Paid Result Delivery Artifact Plan v0

### Completed Changes

- saved the Paid Result Delivery Artifact Plan v0 handoff and report
- audited the current ReturnURL ready state, payment access page, paid access resolver, completed paid result rendering, recovery save section, paid result records, recovery helpers, and legal/support copy
- defined Module 01's paid artifact as a web-first delivered report object rather than Email/LINE delivery, PDF export, or membership
- recommended a minimal delivery artifact header/status card on the completed paid result page
- recommended a display-only user-facing report reference code instead of exposing raw IDs, payment tokens, or provider order details
- updated the dashboard next recommendation to prioritize Paid Result Delivery Artifact Implementation v0 when strengthening the Module 01 funnel

### Learnings

- Current paid content is complete and recovery-aware, but the top of the completed result still reads like a result page rather than a delivered report artifact.
- A delivery header can improve perceived value and support recovery without changing payment provider behavior or adding membership.
- A report reference code should be non-authorizing and display-only in v0; support lookup can be planned later if needed.

### Unresolved Questions

- Final report code format still needs implementation choice.
- Public retention/access language may need later alignment if report availability windows become explicit.
- Share-safe artifact and PDF/export remain deferred.

## 2026-06-01 LINE Recovery LIFF Page / UI Entry v0

### Completed Changes

- saved the LINE Recovery LIFF Page / UI Entry v0 handoff and report
- added `/line/recovery/bind` as the recovery-specific LIFF page route
- added `LineRecoveryBindBridge` to initialize LIFF, obtain ID token, call `/api/line/recovery/bind-liff`, and return to the safe route-provided recovery surface
- added `parseLineRecoveryBindContext` to parse direct query and `liff.state` recovery state without accepting raw paid access, checkout session, unlock, short-code, or provider payload markers
- added tests for recovery copy, non-LINE fallback, safe `liff.state` parsing, bind route call shape, raw token exclusion, and legacy fulfillment isolation
- ran targeted LIFF/LINE/recovery tests, full lint, full tests, and build

### Learnings

- The LIFF page can reuse only the mechanical SDK loading/login pattern from the legacy bridge while keeping recovery semantics separate.
- A visible checkout/result LINE CTA still needs to generate signed `rlb_` state and link to this page before owner-assisted staging smoke is meaningful.
- Non-LINE fallback should keep Email as the reliable recovery path and never block checkout/report access.

### Unresolved Questions

- Owner-assisted LINE in-app staging smoke remains pending.
- UI CTA wiring for LINE recovery is still unimplemented.
- Desktop QR/open-on-phone behavior remains future work.

## 2026-06-01 Paid Result Recovery Link Delivery Plan v0

### Completed Changes

- saved the Paid Result Recovery Link Delivery Plan v0 handoff and report
- clarified that Email/LINE "save" should eventually deliver a safe web return link after the paid result is ready, not the full report body
- recommended a 90-day v0 recovery link validity window, with careful copy distinguishing link validity from permanent membership storage
- recommended a DB-backed `paid_result_recovery_links` token model with hash-only token storage, revocation, expiry, send status, and channel metadata
- recommended `/r/[recoveryToken]` as the short channel-neutral resolver route that exchanges into safe web access without exposing raw `pa_` or `pcs_` tokens
- planned Email and LINE send behavior for pre-payment and post-payment saves without selecting providers or sending messages
- updated the dashboard to prioritize Recovery Link Token Schema / Resolver v0 before Email sending, LINE push, or paid delivery artifact UI

### Learnings

- The existing recovery contact model stores identity, but it does not yet fulfill the user-facing promise of receiving a return link.
- Raw paid access and checkout session tokens are not appropriate for Email/LINE delivery because they are bearer/session primitives rather than auditable recovery-link artifacts.
- Link delivery is now the foundation for both recovery save UX and future support tooling; delivery artifact polish should build on top of that access primitive.

### Unresolved Questions

- Owner should approve the exact public retention copy before legal/support pages mention a 90-day recovery window.
- Email provider and sender identity remain undecided.
- LINE visible CTA wiring and owner-assisted LIFF smoke remain pending.
- Implementation should decide whether the resolver directly renders paid access or exchanges into a short-lived server-side handoff.

## 2026-06-01 Recovery Link Token Schema / Resolver v0

### Completed Changes

- saved the Recovery Link Token Schema / Resolver v0 handoff and report
- added `paid_result_recovery_links` schema and migration file `apps/web/drizzle/0010_paid_result_recovery_links.sql`
- added `PAYMENT_RECOVERY_LINK_TOKEN_SECRET` as the explicit recovery link token secret placeholder
- added `prl_` recovery token helpers with hash-only storage, purpose-separated HMAC, 90-day default expiry, and fail-closed missing-secret behavior
- added server helpers to create, resolve, mark-used, and revoke paid result recovery links
- refactored paid access resolution so entitlement-backed recovery links can reuse existing paid result rendering without exposing raw `pa_` or `pcs_`
- added `/r/[recoveryToken]` resolver page with safe invalid/expired/revoked/processing behavior
- added targeted recovery link and resolver page tests; full lint, tests, build, and drizzle-kit check passed locally

### Learnings

- A dedicated `prl_` token layer is the right boundary between saved recovery identities and paid web access.
- The resolver can render from entitlement context without generating or sending raw paid access tokens.
- Multi-use until expiry is acceptable for v0 if paired with high-entropy token generation, hash-only storage, 90-day expiry, revocation, and generic failure copy.

### Unresolved Questions

- Staging DB migration apply and Preview(staging) recovery link secret alignment remain separate follow-up work.
- Public/legal retention copy still needs owner approval before mentioning the 90-day window.
- Email/LINE sender integration and support resend tooling remain deferred.

## 2026-06-01 Recovery Link Token Staging Apply / Smoke v0

### Completed Changes

- saved the Recovery Link Token Staging Apply / Smoke v0 handoff and report
- verified Neon project `anyu-next` branch `preview` as the staging DB target
- applied `apps/web/drizzle/0010_paid_result_recovery_links.sql` to staging preview branch only
- verified `paid_result_recovery_links` table, expected columns, indexes, unique `token_hash` index, and zero row count
- configured branch-scoped Preview(`staging`) `PAYMENT_RECOVERY_LINK_TOKEN_SECRET` as a sensitive env var and redeployed staging
- reran no-card checkout QA successfully against staging commit `a3d64a1`
- verified invalid `/r/[recoveryToken]` safety copy and production fail-closed behavior
- confirmed production DB does not have `paid_result_recovery_links`

### Learnings

- Staging migration and env alignment are complete, but valid link smoke needs an operator-safe creation path.
- Vercel pulled sensitive env values are not usable locally for computing matching recovery link hashes.
- Without exposing staging DB credentials/hashes or adding a temporary route, the current repo cannot create a valid recovery link row for smoke through a safe public/operator interface.

### Unresolved Questions

- Add a `Recovery Link Operator Smoke Helper v0` script or operator-only endpoint to complete valid `/r/[recoveryToken]` staging smoke.
- Decide whether that helper should create temporary `operator_test` rows and clean them automatically.
- Production recovery link DB/env remain gated.

## 2026-06-01 Recovery Link Operator Smoke Helper v0

### Completed Changes

- saved the Recovery Link Operator Smoke Helper v0 handoff and report
- added `qa:recovery-link:smoke` as a local operator QA command
- added a recovery-link smoke helper that rejects production targets, creates a fresh no-card paid result, creates a temporary `operator_test` recovery link, verifies `/r/[recoveryToken]` internally, checks invalid-link safety, and deletes the operator test row when it can run
- added helper-level redaction for `prl_` recovery tokens and `/r/[token]` paths
- updated `qa:env:preflight` with a `recovery_link_smoke` mode
- added targeted tests for redaction, production rejection, token hashing, 90-day expiry, package script registration, and preflight registration
- updated the dashboard to show that valid-link smoke now has an operator helper but still needs secure local Preview(staging) env alignment

### Learnings

- A public endpoint is not needed for valid recovery-link smoke; a local operator script is enough and safer.
- The script can create only temporary `operator_test` rows and avoid printing raw tokens, token hashes, paid access tokens, checkout session tokens, and DB row IDs.
- Current local operator environment does not include `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`, so live valid-link smoke blocks safely before DB writes.

### Unresolved Questions

- Valid `/r/[recoveryToken]` staging smoke still needs a secure operator session with matching Preview(staging) `DATABASE_URL`, `OPERATOR_TEST_SECRET`, and `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`.
- If more DB-backed QA scripts are added, common no-card flow primitives should be extracted to avoid duplication.
- Production recovery link DB/env remain gated.

## 2026-06-02 Recovery Link Operator Smoke Secure Run v0

### Completed Changes

- saved the Recovery Link Operator Smoke Secure Run v0 handoff and report
- ran local `qa:env:preflight recovery-link-smoke`; local `DATABASE_URL` and `OPERATOR_TEST_SECRET` are present, but local `PAYMENT_RECOVERY_LINK_TOKEN_SECRET` is missing
- verified via Vercel env metadata that Preview(staging) already has `DATABASE_URL`, `OPERATOR_TEST_SECRET`, and branch-scoped `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`
- did not rotate or regenerate the existing Preview(staging) recovery link token secret
- attempted secure temp-file Vercel env pull and process-only smoke execution without printing values
- confirmed the local smoke remains blocked because sensitive Preview(staging) env values are not usable by the local process through Vercel CLI pull

### Learnings

- Vercel CLI can confirm encrypted Preview(staging) env name presence without values.
- Vercel env pull is not a usable secure injection path for sensitive values in this setup; it does not make the existing recovery link token secret available to `qa:recovery-link:smoke`.
- Because the existing token secret protects staging recovery link hashes, rotating it would be unsafe unless explicitly approved.

### Unresolved Questions

- Owner/operator needs to provide the existing Preview(staging) `PAYMENT_RECOVERY_LINK_TOKEN_SECRET` to a secure local shell session, or approve a Preview(staging)-runtime operator smoke path that can use runtime env without exposing the secret.
- Valid `/r/[recoveryToken]` staging smoke remains pending.
- Production recovery link DB/env/runtime remain gated.

## 2026-06-02 Recovery Link Preview Runtime Operator Smoke Path v0

### Completed Changes

- saved the Recovery Link Preview Runtime Operator Smoke Path v0 handoff and report
- added `POST /api/operator/recovery-link-smoke` as a Preview(staging)-only operator endpoint
- added `ENABLE_OPERATOR_RECOVERY_LINK_SMOKE`, disabled by default and constrained to `VERCEL_ENV=preview` plus `VERCEL_GIT_COMMIT_REF=staging`
- updated `qa:recovery-link:smoke` to use the Preview runtime endpoint by default, so local execution no longer needs `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`
- added branch-scoped Preview(staging) `ENABLE_OPERATOR_RECOVERY_LINK_SMOKE=true`
- ran `qa:recovery-link:smoke` successfully against Preview(staging)
- verified valid recovery link creation/resolution, invalid-link safety, cleanup by revocation, paid result render marker, and production fail-closed behavior

### Learnings

- Keeping recovery link token creation inside Preview runtime avoids local secret export while still producing meaningful end-to-end smoke evidence.
- The endpoint can safely verify the recovery link by resolving it server-side and checking paid access readiness without returning raw `prl_`, `pa_`, `pcs_`, token hashes, or DB IDs.
- Production safety should accept plain 404 for this operator-only endpoint because disabled routes may not return JSON.

### Unresolved Questions

- The Preview-only operator endpoint must remain gated and should not be enabled in Production.
- QA scripts now duplicate result creation and checkout-start verification; extract shared helpers if this pattern grows.
- Next recovery step should likely be Email Recovery Link Sending v0, unless LINE Recovery CTA Wiring is prioritized first.

## 2026-06-02 Email Recovery Link Sending v0

### Completed Changes

- saved the Email Recovery Link Sending v0 handoff and report
- added a server-only Email recovery link sender foundation
- added default `noop`/test Email adapter behavior that does not claim real Email delivery
- added a safe recovery Email template with Module 01 name, `/r/[recoveryToken]` link, 90-day retention copy, and support contact
- added Email-channel recovery link orchestration that creates link rows, keeps raw `prl_` tokens in process only, and marks sent/failed only according to adapter result
- wired completed-result Email save actions to attempt recovery link sending non-fatally after contact save
- updated completed-result recovery copy away from stale “v0 不會寄送 Email” wording
- documented `EMAIL_PROVIDER` and `EMAIL_FROM` env names

### Learnings

- Post-payment Email save can safely create recovery links without blocking paid report access.
- The noop adapter is useful for staging/local validation but should not mark links as sent or claim user-visible Email delivery.
- Automatic send after paid delivery readiness for checkout-start recovery contacts should be a separate non-fatal hook, not bundled into this first provider foundation.

### Unresolved Questions

- Choose and configure the real Email provider adapter before claiming real Email delivery.
- Define resend/rate-limit behavior and cleanup for noop-created or failed recovery link rows.
- Add a paid-delivery completion hook so Email contacts captured before payment receive recovery links when the paid report becomes ready.

## 2026-06-02 Email Recovery Link Provider Adapter Plan / Implementation v0

### Completed Changes

- saved the Email Recovery Link Provider Adapter v0 handoff and report
- recommended Resend as the v0 real Email provider because it has a small REST API surface, simple HTML/text payloads, explicit sender/domain verification behavior, and idempotency-key support
- added `EMAIL_PROVIDER=resend` support behind server-side `fetch`
- kept `EMAIL_PROVIDER=noop` and `EMAIL_PROVIDER=test` as safe non-sending defaults
- added name-only `RESEND_API_KEY` documentation in `.env.example`
- added mocked provider tests for successful send, missing config, provider failure, sent/failed status updates, safe payload shape, and token/report-content exclusion
- did not configure provider credentials and did not send real Email

### Learnings

- The current recovery link helper can support real Email sending without adding a dependency or changing schema.
- Resend idempotency keys can use the recovery link row id without exposing raw `prl_` tokens.
- Real Email delivery still needs sender/domain verification and an owner-approved Preview(staging) credential setup before live smoke.

### Unresolved Questions

- Owner must choose/verify sender identity and provide Resend credentials through branch-scoped Preview(staging) before real Email smoke.
- Provider message id is not persisted; add audit storage later if support/debugging requires it.
- Resend/rate-limit/bounce handling remains deferred.

## 2026-06-02 Email Recovery Link Real Provider Smoke v0

### Completed Changes

- saved the Email Recovery Link Real Provider Smoke v0 handoff and execution report
- verified secure local env has `RESEND_API_KEY`, `EMAIL_RECOVERY_TEST_RECIPIENT`, and `OPERATOR_TEST_SECRET` present without printing values
- configured branch-scoped Preview(staging) only: `EMAIL_PROVIDER=resend`, `EMAIL_FROM`, `RESEND_API_KEY`, and `ENABLE_OPERATOR_EMAIL_RECOVERY_SMOKE=true`
- added a narrow Preview(staging)-only `POST /api/operator/email-recovery-smoke` endpoint gated by operator secret and feature flag
- deployed a Preview(staging) runtime with the Resend env and smoke endpoint
- sent one controlled recovery Email through Resend to the owner-approved test recipient
- owner verified inbox receipt, subject, sender, 90-day copy, support contact, no report body/raw input/`pa_`/`pcs_`, and `/r/` link paid-result access
- reran `qa:recovery-link:smoke` and `qa:result-checkout:no-card`; both passed with production fail-closed checks

### Learnings

- Programmatic direct POST to Next server action still returns non-browser-equivalent 500 behavior, so a narrow Preview-runtime operator endpoint is safer for this real-provider smoke.
- Resend provider path returned `sendStatus=sent` and delivered the Email without exposing raw `prl_`, token hash, raw Email, `pa_`, `pcs_`, provider payload, or report content.
- Direct local DB verification was blocked because local `DATABASE_URL` did not point at the Preview(staging) schema with `payment_recovery_contacts`; use a sanctioned Preview DB assertion path if row-level proof is needed later.

### Unresolved Questions

- Add `qa:email-recovery-link:smoke` if real-provider smoke needs to be repeated.
- Decide whether to keep, remove, or consolidate the temporary operator Email smoke endpoint after launch-readiness proof is sufficient.
- Add paid-delivery completion hook so checkout-start Email contacts receive recovery links automatically after paid readiness.

## 2026-06-02 Paid Delivery Recovery Link Send Hook v0

### Completed Changes

- saved the Paid Delivery Recovery Link Send Hook v0 handoff and report
- added eligible Email recovery contact lookup for completed paid results
- added `sendRecoveryLinksForCompletedPaidResult(...)` to create/send Email-channel recovery links for eligible contacts
- wired the hook into direct paid generation and queued paid generation completion paths after paid result/job completion
- kept Email sending non-fatal so paid result completion is not rolled back or blocked by recovery send failure
- updated checkout-start Email recovery copy away from stale “v0 不會寄送 Email” wording
- added tests for eligibility, noop/provider behavior, duplicate prevention, provider failure, non-fatal generation completion, and checkout-start copy
- reran full lint/test/build and staging-safe QA regressions

### Learnings

- The correct hook point is after the paid result is persisted and the generation job is marked completed, not at payment verification or ReturnURL.
- Checkout-start recovery contacts become eligible after paid delivery binds them to the entitlement.
- The existing no-card QA path cannot prove checkout-start auto-send because checkout-start creates a NewebPay payment intent while operator fake-paid creates a separate operator payment intent.

### Unresolved Questions

- Add a dedicated operator smoke path if live auto-send proof is needed without a real provider card payment.
- Decide whether provider message IDs, resend limits, and bounce handling should be persisted before broader launch.
- LINE recovery link sending remains deferred.

## 2026-06-02 Email Recovery Auto-Send Staging Operator Smoke v0

### Completed Changes

- saved the Email Recovery Auto-Send Staging Operator Smoke v0 handoff and report
- extended the existing Preview(staging)-only Email recovery smoke endpoint with an auto-send-after-paid-ready mode
- allowed the operator fake-paid service to create a checkout-start-style Email recovery contact in the same operator payment/entitlement context for smoke only
- deployed a Preview(staging) build at commit marker `7f65d47e296a`
- ran a controlled real Email auto-send smoke using the owner-approved test recipient from secure local env without printing the recipient
- verified the auto-send hook exercised, paid generation completed, recovery link status was `sent`, and no raw tokens/contact values/report content were returned
- owner verified Email receipt, subject, sender, 90-day copy, support contact, no report body/raw input/`pa_`/`pcs_`, and `/r/` paid-result access
- reran recovery-link and no-card checkout QA with production fail-closed checks

### Learnings

- A same-payment-context operator smoke is required to prove checkout-start auto-send without a real card payment.
- The existing Email recovery smoke feature flag/gate can safely host this mode as long as it remains Preview(staging)-only and operator-secret gated.
- The paid-delivery hook now has live Preview(staging) evidence, not only unit coverage.

### Unresolved Questions

- Add a dedicated `qa:email-recovery:auto-send` wrapper if this smoke needs to be repeated often.
- Provider message-id audit, bounce handling, and resend limits remain deferred.
- LINE recovery link sending remains deferred.

## 2026-06-02 Paid Result Delivery Artifact Implementation v0

### Completed Changes

- saved the Paid Result Delivery Artifact Implementation v0 handoff and report
- added a sanitized paid-result delivery summary helper for completed Module 01 paid results
- added a completed-result delivery artifact/status card to the shared `UnlockCompleted` renderer used by paid access, payment access, and `/r/` recovery-link access
- added display-only report reference codes in `AT-YYYYMMDD-XXXXXX` format
- integrated masked recovery saved/unsaved state and current-flow Email sent confirmation without exposing raw contact values or tokens
- added Riso/editorial card styling and targeted tests for reference format, masked state, sent-state copy, and token/internal-id exclusion

### Learnings

- The shared completed-result renderer is the right insertion point because it covers paid access tokens, session-bound access, and recovery-link access together.
- Report reference codes can improve supportability without using provider order numbers or authorizing tokens.
- Persistent “Email link already sent” status should not be claimed until a summary helper explicitly reads sent recovery-link rows.

### Unresolved Questions

- Decide whether to add persistent recovery link sent-state lookup before production payment capability.
- Confirm public retention language before making broader “report saved for 90 days” or permanence claims.
- LINE recovery CTA wiring and LINE message sending remain deferred.

## 2026-06-03 Paid Result Delivery Artifact Staging Visual Smoke v0

### Completed Changes

- saved the Paid Result Delivery Artifact Staging Visual Smoke v0 handoff and report
- confirmed Preview(staging) serves commit `2e59676fd949`, environment `preview`, branch `staging`, and route bundle `payment-foundation-2026-05-29`
- reran `qa:result-checkout:no-card`; result checkout, checkout-start, operator fake-paid, queue completion, paid access render, and production fail-closed checks passed
- reran `qa:recovery-link:smoke`; runtime recovery-link resolver, invalid-link safety, cleanup by revocation, and production fail-closed checks passed
- ran a fresh completed-result artifact smoke with sanitized visible-text inspection after local browser launch was blocked by macOS sandbox permissions
- verified artifact title, generated stamp/time, `AT-YYYYMMDD-XXXXXX` report reference shape, recovery state, support Email, report content signal, and visible copy/token safety

### Learnings

- The artifact is live on Preview(staging) and visible in completed paid result output.
- Full raw HTML can contain tokenized route mechanics because the unlock path itself is token-based; visible-text checks are the correct safety boundary for copy/artifact leakage.
- In this environment, Chromium cannot launch due macOS `MachPortRendezvousServer` permission denial, so exact mobile spacing still needs human/browser spot-check if required.

### Unresolved Questions

- Decide whether a human mobile screenshot check is needed before moving on.
- Decide whether to add a reusable sanitized artifact visual-smoke helper.
- LINE recovery CTA wiring remains deferred.

## 2026-06-03 LINE Recovery CTA Wiring v0

### Completed Changes

- saved the LINE Recovery CTA Wiring v0 handoff and report
- added a server-side LINE recovery bind href helper around the existing `rlb_` state helper
- wired checkout-start LINE recovery CTA as a secondary save method while keeping Email primary
- wired completed-result LINE recovery CTA for unsaved state and Email-saved backup state
- passed payment/entitlement context into shared completed-result rendering so LINE bind can create paid-context recovery contacts
- updated tests and no-card QA summarizer for the wired LINE CTA
- ran lint, targeted tests, full tests, build, no-card QA, and recovery-link smoke

### Learnings

- Existing `rlb_` safety correctly rejects tokenized `/unlock/`, `pa_`, `pcs_`, and `prl_` return paths.
- Checkout-start can safely return to its non-tokenized checkout route after LINE bind.
- Completed-result LINE bind can safely write the recovery contact with entitlement context, but direct return to the same paid page needs a future non-tokenized paid access handoff.

### Unresolved Questions

- Run owner-assisted LINE Recovery Bind Staging Smoke v0 after Preview(staging) deploys this commit.
- Decide whether to add a safe non-tokenized return handoff for completed-result LIFF success.
- LINE recovery link sending remains deferred until LINE bind smoke passes.

## 2026-06-03 LINE Recovery Bind Staging Smoke v0

### Completed Changes

- saved the LINE Recovery Bind Staging Smoke v0 handoff and report
- confirmed Preview(staging) served commit `0ebe9e98c0a1`, environment `preview`, branch `staging`, and route bundle `payment-foundation-2026-05-29`
- ran `qa:result-checkout:no-card`; result CTA, checkout-start, LINE recovery CTA signal, fake-paid, queue completion, paid access render, and production fail-closed checks passed
- ran `qa:recovery-link:smoke`; Preview runtime recovery-link resolver, invalid-link safety, cleanup by revocation, and production fail-closed checks passed
- verified checkout-start LINE CTA copy/href state safety with sanitized output
- owner-assisted LINE mobile smoke failed with visible copy `缺少 LINE 保存狀態`
- added a narrow LIFF recovery state preservation fix so the bridge falls back to server-rendered `initialSearch` when browser search is missing and also parses hash-based LIFF state

### Learnings

- The visible LINE CTA and `rlb_` state generation are live on Preview(staging), but LINE/LIFF navigation can strip or alter the browser query before the client bridge reads it.
- Server-rendered search state must be preserved during hydration when browser-side state is missing.
- The Neon `preview` branch can provide sanitized recovery-contact verification; before owner retry, LINE contact count was zero.

### Unresolved Questions

- Rerun owner-assisted LINE Recovery Bind Staging Smoke after the state-preservation fix is deployed.
- Add a reusable sanitized LINE recovery bind DB-check helper if this smoke becomes repeated.
- LINE recovery link sending remains deferred until hash-only LINE contact binding is staging-proven.

## 2026-06-03 LINE Recovery Bind Staging Smoke v0 Retry

### Completed Changes

- saved the LINE Recovery Bind Staging Smoke v0 Retry handoff and report
- confirmed Preview(staging) served commit `472eef33e1a2`, environment `preview`, branch `staging`, and route bundle `payment-foundation-2026-05-29`
- reran `qa:result-checkout:no-card`; result CTA, checkout-start, fake-paid, queue completion, paid access render, and production fail-closed checks passed
- reran `qa:recovery-link:smoke`; Preview runtime recovery-link resolver, invalid-link safety, cleanup by revocation, and production fail-closed checks passed
- verified checkout-start LINE CTA copy/href state safety with sanitized output
- owner-assisted LINE mobile retry no longer showed `缺少 LINE 保存狀態`, confirming the first fix worked
- retry then failed at LINE login with `400 Bad Request`, classified as `liff_context_failed`
- added a narrow LIFF-entry URL fix so recovery LINE CTAs use `NEXT_PUBLIC_LINE_LIFF_URL` when configured and fall back to `/line/recovery/bind` only when LIFF URL config is absent

### Learnings

- Direct app-route LIFF login can fail with LINE `400 Bad Request`; recovery CTA should enter through `https://liff.line.me/{LIFF_ID}` like the proven legacy LIFF pattern.
- The state-preservation fix solved the missing-state layer but exposed a separate LIFF entry/redirect configuration issue.
- Tests now cover both internal fallback mode and configured LIFF-entry mode.

### Unresolved Questions

- Rerun owner-assisted LINE Recovery Bind Staging Smoke after the LIFF-entry URL fix deploys.
- If another mobile-only failure occurs, add a recovery-specific LIFF diagnostic snapshot.
- LINE recovery link sending remains deferred until hash-only LINE contact binding is staging-proven.

## 2026-06-03 LINE Recovery Bind Staging Smoke v0 Retry 2

### Completed Changes

- saved the LINE Recovery Bind Staging Smoke v0 Retry 2 handoff and report
- confirmed Preview(staging) served commit `0f0801d9b5c5`, environment `preview`, branch `staging`, and route bundle `payment-foundation-2026-05-29`
- reran `qa:result-checkout:no-card`; result CTA, checkout-start, fake-paid, queue completion, paid access render, and production fail-closed checks passed
- reran `qa:recovery-link:smoke`; Preview runtime recovery-link resolver, invalid-link safety, cleanup by revocation, and production fail-closed checks passed
- verified checkout-start LINE CTA uses `liff.line.me` with `rlb_[REDACTED]` state and no visible forbidden token substrings
- owner-assisted LINE mobile Retry 2 no longer showed `缺少 LINE 保存狀態` or LINE login `400 Bad Request`
- retry stopped at legacy fulfillment copy: `正在確認完整分析頁`, `LINE 短碼連結缺少有效測驗資料`
- added a narrow compatibility handoff so global and module-scoped `/line/fulfill` detect recovery `rlb_` state and render `LineRecoveryBindBridge`
- hardened recovery `liff.state` parsing for one percent-encoded layer

### Learnings

- The active LINE LIFF endpoint still resolves to legacy `/line/fulfill`, so recovery must be recognized there until a dedicated recovery LIFF endpoint is configured.
- The LIFF-entry URL fix worked; the new issue was legacy page routing, not state loss or login.
- Recovery and legacy fulfillment can safely share the LIFF endpoint if recovery state is detected before short-code fulfillment logic runs.

### Unresolved Questions

- Rerun owner-assisted LINE Recovery Bind Staging Smoke after the legacy-entry recovery handoff fix deploys.
- Decide later whether to configure a dedicated LINE recovery LIFF endpoint or keep shared endpoint compatibility routing.
- LINE recovery link sending remains deferred until hash-only LINE contact binding is staging-proven.

## 2026-06-03 LINE Recovery Bind Staging Smoke v0 Retry 3

### Completed Changes

- saved the LINE Recovery Bind Staging Smoke v0 Retry 3 handoff and report
- confirmed Preview(staging) served commit `2de568380081`, environment `preview`, branch `staging`, and route bundle `payment-foundation-2026-05-29`
- reran `qa:result-checkout:no-card`; result CTA, checkout-start, fake-paid, queue completion, paid access render, and production fail-closed checks passed
- reran `qa:recovery-link:smoke`; Preview runtime recovery-link resolver, invalid-link safety, cleanup by revocation, and production fail-closed checks passed
- verified checkout-start LINE CTA uses `liff.line.me` with `rlb_[REDACTED]` state and no visible forbidden token substrings
- verified `/line/fulfill` recovery compatibility renders the recovery bridge and not legacy short-code error copy
- owner-assisted LINE mobile Retry 3 passed with safe redirect back to result flow
- verified sanitized staging DB row: one hash-only LINE recovery contact with transactional consent, checkout-start source, verified/bound status, and no missing hash fields

### Learnings

- The full visible LINE recovery bind path is now staging-proven through the shared LIFF endpoint.
- Recovery and legacy fulfillment can coexist safely when recovery `rlb_` state is routed before short-code fulfillment logic.
- LINE recovery is now bound as a recovery identity only; no LINE message sending or report-body delivery occurred.

### Unresolved Questions

- Implement LINE Recovery Link Sending v0 so saved LINE users can receive a safe `/r/` return link after paid result readiness.
- Decide later whether shared `/line/fulfill` compatibility is sufficient or whether to configure a dedicated recovery LIFF endpoint.
- Add a reusable sanitized LINE bind DB-check helper if repeated smoke is expected.

## 2026-06-03 LINE Recovery Link Sending v0

### Completed Changes

- saved the LINE Recovery Link Sending v0 handoff and execution report
- added a server-only LINE recovery link sender foundation with noop default and a gated LINE Messaging API adapter path
- added a safe LINE recovery message template containing only short recovery copy, module name, `/r/` web return link, 90-day retention copy, and support contact
- added eligible LINE recovery contact lookup for completed paid results
- extended the completed-paid-result recovery send hook to process eligible LINE contacts non-fatally after Email contacts
- added tests for template safety, noop behavior, provider config failure, mocked provider success/failure, duplicate prevention, and hash-only recipient-unavailable behavior
- updated `.env.example` with LINE recovery sender env names only, no values

### Learnings

- Real LINE push cannot be completed from the current `payment_recovery_contacts` row alone because LINE recovery identity is intentionally hash-only.
- The correct implementation boundary is to support LINE sending mechanics while refusing to create/send a recovery link unless a future secure recipient resolver supplies a sendable LINE recipient.
- The existing Email auto-send path remains unchanged; LINE failures/unavailable states remain non-fatal to paid delivery.

### Unresolved Questions

- Decide the secure recipient storage model for LINE Messaging API delivery: encrypted field, separate `line_recipient_secrets` table, or another privacy-reviewed mechanism.
- Run real LINE recovery link smoke only after a sendable recipient can be resolved without storing raw LINE userId in `payment_recovery_contacts`.
- Consider extracting shared recovery-link URL building if more delivery channels are added.

## 2026-06-03 LINE Recovery Recipient Secret Design v0

### Completed Changes

- saved the LINE Recovery Recipient Secret Design v0 handoff and report
- documented why LINE Messaging API push requires a sendable recipient ID and why hash-only LINE recovery identity cannot be used for push
- evaluated five storage options: encrypted field on `payment_recovery_contacts`, separate LINE recipient table, generic recovery contact secrets table, legacy raw LINE storage reuse, and delaying until membership
- recommended a separate `payment_recovery_contact_secrets` table linked to hash-only `payment_recovery_contacts`
- recommended a separate `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY` instead of reusing Email recovery contact encryption
- defined bind-flow, send-flow, revocation, staging gates, and future membership migration implications

### Learnings

- The best boundary is to keep recovery contact metadata hash-only and isolate sendable delivery secrets in a server-only encrypted table.
- Generic secret storage is preferable to a LINE-only table because it supports future channel/member migration without making the current recovery contact table secret-bearing.
- Real LINE push should remain blocked until encrypted recipient secret storage and a safe resolver exist.

### Unresolved Questions

- Confirm exact key format during implementation, likely matching existing 32-byte base64url recovery crypto conventions.
- Decide whether v0 should include key versioning or defer it until production scale.
- Plan LINE block/unfollow handling before broad production LINE message sending.

## 2026-06-03 LINE Recovery Recipient Secret Schema v0

### Completed Changes

- saved the LINE Recovery Recipient Secret Schema v0 handoff and report
- added `apps/web/drizzle/0011_payment_recovery_contact_secrets.sql`
- added Drizzle schema for `payment_recovery_contact_secrets`
- added separate LINE recipient crypto helper using `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`
- added server-only DB helpers to create/update, resolve, mark used, revoke, and mark failed encrypted LINE recipient secrets
- added tests for encryption, deterministic recipient hashing, fail-closed key behavior, sanitized returns, raw token rejection, revocation/failure handling, and migration seam
- updated `.env.example` with the new env name only

### Learnings

- The recipient encryption key format now follows the existing 32-byte base64url/base64/hex convention.
- `key_version` is cheap to include now and avoids forcing a future schema change for first rotation planning.
- Bind route integration should wait until the staging DB migration is applied; otherwise the current staging-proven LINE bind path could fail on a missing table.

### Unresolved Questions

- Apply the new table and `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY` to Preview(staging) next.
- Integrate `/api/line/recovery/bind-liff` to write encrypted recipient secrets after staging apply.
- Multi-key rotation and LINE block/unfollow handling remain deferred.

## 2026-06-03 LINE Recovery Recipient Secret Staging Apply v0

### Completed Changes

- saved the LINE Recovery Recipient Secret Staging Apply v0 handoff and report
- verified Neon target as project `anyu-next`, non-default `preview` branch, database `neondb`
- confirmed `payment_recovery_contact_secrets` was absent before apply
- applied `apps/web/drizzle/0011_payment_recovery_contact_secrets.sql` to Preview(staging) only
- verified table, columns, indexes, FK, check constraints, and zero row count
- verified Production DB does not have `payment_recovery_contact_secrets`
- configured branch-scoped Preview(staging) `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY` without printing values
- redeployed Preview(staging) and pointed `staging.anyu.tw` to commit `35fdec93998a`
- reran `qa:recovery-link:smoke` and `qa:result-checkout:no-card`; both passed

### Learnings

- The migration applies cleanly with the established manual Neon preview-branch SQL method.
- Runtime env is now ready for bind integration to store encrypted LINE recipient secrets.
- No staging recipient rows were inserted because bind route integration is the correct first writer.

### Unresolved Questions

- Integrate `/api/line/recovery/bind-liff` to call `createOrUpdateLineRecoveryRecipientSecret`.
- Run owner-assisted LINE bind smoke again after integration and verify sanitized secret row creation.
- Real LINE push remains gated until recipient secret creation is proven.

## 2026-06-03 LINE Recovery Bind Recipient Secret Integration v0

### Completed Changes

- saved the LINE Recovery Bind Recipient Secret Integration v0 handoff and report
- updated `bindVerifiedLineUserToRecoveryContact` so successful LINE bind now creates/updates both hash-only `payment_recovery_contacts` and encrypted `payment_recovery_contact_secrets`
- added safe `recipient_secret_write_failed` handling when recipient secret storage fails
- updated LINE bind route/helper tests to assert sanitized response, contact write, recipient secret write, missing key failure, and no raw LINE/idToken/token leakage
- ran targeted LINE recipient/bind tests, lint, full tests, build, `qa:recovery-link:smoke`, and `qa:result-checkout:no-card`

### Learnings

- The correct success boundary for LINE save is now both contact identity and recipient secret stored.
- Recipient secret write failure should not be hidden as success because later LINE push would still be impossible.
- Staging owner-assisted LINE smoke must be repeated after this commit deploys because CLI cannot complete the LINE mobile account action.

### Unresolved Questions

- Deploy integration commit to Preview(staging) and rerun owner-assisted LINE bind smoke.
- Verify sanitized DB state: hash-only contact plus active recipient secret row, without printing encrypted recipient/hash/raw LINE ID.
- Real LINE message smoke remains gated until recipient secret creation is proven.
