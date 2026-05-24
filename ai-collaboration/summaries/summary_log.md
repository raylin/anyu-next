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
