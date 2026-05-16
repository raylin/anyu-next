# Product Runtime Prompt v0.1 Cleanup Handoff

## Date

2026-05-16

## Task

Calibrate `prompts/product_result_prompt_v0.md` after the first generated `曖昧溫度計` product outputs, update collaboration workflow docs to require a git commit after every completed handoff, rerun product samples if live Anthropic generation is available, refresh the product result review bundle, and commit the completed changes.

## Context

The Product Runtime Track is working, but ChatGPT review found five cleanup needs:

- Temperature scores are too narrowly clustered and need clearer calibration around observable interaction warmth.
- Share-card copy must be safer to post publicly and less emotionally exposing.
- `personal_pattern_candidate.should_store` should default to false and only become true for clearly reusable, non-diagnostic patterns.
- Paid result tone should feel more like a smart friend than a consultant report.
- Paid preview should emphasize immediate action value instead of more analysis.

The schema direction is good and must not be changed in this task.

## Relevant Files

- `prompts/product_result_prompt_v0.md`
- `AGENTS.md`
- `WORKING_AGREEMENT.md`
- `README.md`
- `ai-collaboration/templates/handoff_template.md`
- `ai-collaboration/templates/execution_report_template.md`
- `ai-collaboration/research/2026-05-16-product-result-v0-review-bundle.md`
- `outputs/product_samples/raw/product_sample_001.txt`
- `outputs/product_samples/raw/product_sample_002.txt`
- `outputs/product_samples/raw/product_sample_003.txt`
- `outputs/product_samples/generated/product_sample_001.result.json`
- `outputs/product_samples/generated/product_sample_002.result.json`
- `outputs/product_samples/generated/product_sample_003.result.json`
- `scripts/generate_product_sample.py`
- `schemas/product_result_schema_v0.json`

## Constraints

- Local-first.
- Markdown-first.
- Do not modify `schemas/product_result_schema_v0.json`.
- Do not modify `schemas/signal_schema_v1.json`.
- Do not modify `prompts/extraction_prompt_v1.md`.
- Do not modify `oradar/`, the research extraction pipeline, provider behavior, or main CLI behavior.
- Do not implement the web app or fake-door prototype.
- Do not introduce scraping, UI, dashboards, auth, databases, cloud infrastructure, or persistent services.
- Stop and document the need if a schema change appears necessary.
- If unrelated uncommitted changes appear before commit, do not silently include them.

## Planned Work

1. Save this handoff.
2. Update the product result prompt with v0.1 calibration rules.
3. Update appropriate workflow docs and templates with the completed-handoff git commit rule.
4. Rerun the three product samples if Anthropic generation is available.
5. Validate Python compilation, prompt/schema JSON validity, generated schema conformance, share-card privacy/safety, personal pattern conservatism, and temperature differentiation.
6. Update the product result review bundle.
7. Create the required execution report.
8. Append `ai-collaboration/summaries/summary_log.md`.
9. Commit all task changes with `prompt: calibrate product runtime output v0.1`.
10. End with the required paste-back completion summary including the commit hash.

## Uncertainties

- Whether `ANTHROPIC_API_KEY` is available in the local environment.
- Whether live generation will produce sufficiently differentiated scores after prompt calibration.
- Whether generated outputs will make any `should_store=true` case justifiable under the stricter policy.
