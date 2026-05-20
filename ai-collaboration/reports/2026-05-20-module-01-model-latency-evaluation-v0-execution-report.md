# Module 01 Model Latency Evaluation v0 Execution Report

## Summary

Measured the current Module 01 baseline model using a new local evaluator harness and compared it against two Haiku-class candidate names.

Findings:

- baseline `claude-sonnet-4-20250514` is schema-stable but slow
- direct provider median latency is about `27.96s`
- tested Haiku candidate names were not available on the current Anthropic account
- recommendation is to keep the current model for now and only run a separate staging model-switch trial after a valid faster model name is confirmed

## Files Created

- `ai-collaboration/handoffs/2026-05-20-module-01-model-latency-evaluation-v0-handoff.md`
- `ai-collaboration/research/2026-05-20-module-01-model-latency-evaluation-v0.md`
- `ai-collaboration/reports/2026-05-20-module-01-model-latency-evaluation-v0-execution-report.md`
- `apps/web/scripts/evaluate-model-latency.mjs`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Models Evaluated

- baseline: `claude-sonnet-4-20250514`
- candidate probe 1: `claude-3-5-haiku-latest`
- candidate probe 2: `claude-3-5-haiku-20241022`

## Measurement Method

- direct Anthropic provider evaluation using the same app prompt/schema assets and AJV validation
- authenticated staging route spot checks using synthetic input only
- no env/model defaults were changed

## Results Summary

- baseline success rate: `5/5`
- baseline median latency: `27,957 ms`
- baseline schema validation: `5/5`
- candidate availability: both tested Haiku names returned `not_found_error`
- quality summary: baseline broadly passes, but with some tone-risk cases that feel slightly blunter than ideal

## Recommendation

- keep current staging/production default model unchanged
- do not attempt a permanent switch in this task
- if speed remains a launch concern, first confirm a valid faster Anthropic model name and then run a staging-only switch trial

## Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed
- `node scripts/evaluate-model-latency.mjs --model claude-3-5-haiku-latest` executed successfully as a post-fix evaluator smoke run and returned the expected `not_found_error` availability result

## Known Technical Debt

- the evaluator is intentionally narrow and Anthropic-only
- protected staging CLI timing was noisy in non-interactive mode, so the direct provider path is the more trustworthy benchmark
- no accessible faster candidate model was available to quality-compare in this task

## Deviations From Handoff

- could not produce a clean 5-sample staging end-to-end latency table because scripted `vercel curl` timing/body capture was inconsistent in this environment
- compensated by using direct provider measurements plus successful staging route checks

## Git Commit

- pending at report-write time; final commit hash is recorded in the final Codex completion summary

## Staging Push

- pending at report-write time; final staging push status is recorded in the final Codex completion summary

## Remaining Uncertainties

- exact user-facing staging latency distribution still benefits from browser-level instrumentation or explicit route tracing
- a faster Anthropic candidate may exist under a different account-specific model name not known in this task

## Recommended Next Step

`Module 01 Staging Model Switch Trial v0`
