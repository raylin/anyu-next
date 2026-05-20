# Module 01 Faster Model Discovery + Cost Evaluation v0 Execution Report

## Summary

Discovered the account-visible Anthropic model IDs, evaluated the current Sonnet baseline plus available Sonnet 4.6 and Haiku 4.5 candidates, and compared latency, schema stability, quality, and estimated cost per 1,000 analyses.

## Files Created

- `ai-collaboration/handoffs/2026-05-20-module-01-faster-model-discovery-cost-evaluation-v0-handoff.md`
- `ai-collaboration/research/2026-05-20-module-01-faster-model-discovery-cost-evaluation-v0.md`
- `ai-collaboration/reports/2026-05-20-module-01-faster-model-discovery-cost-evaluation-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`
- `apps/web/scripts/evaluate-model-latency.mjs`

## Models Discovered

The current Anthropic account exposed these relevant IDs:

- `claude-sonnet-4-20250514`
- `claude-sonnet-4-6`
- `claude-haiku-4-5-20251001`

It also exposed several Opus-family IDs, but they were not part of the faster-model decision scope.

## Models Evaluated

- `claude-sonnet-4-20250514`
- `claude-sonnet-4-6`
- `claude-haiku-4-5-20251001`

## Latency Summary

- baseline `claude-sonnet-4-20250514`: median `27,096 ms`
- `claude-sonnet-4-6`: median `36,151 ms`
- `claude-haiku-4-5-20251001`: median `20,174 ms` on successful cases, but `1/5` JSON-integrity failure

## Cost Summary

- baseline `claude-sonnet-4-20250514`: about `$37.37 / 1,000`
- `claude-sonnet-4-6`: about `$43.226 / 1,000`
- `claude-haiku-4-5-20251001`: about `$14.867 / 1,000`

## Recommendation

- keep the current default model for now
- do not switch to Sonnet 4.6
- only consider a guarded staging Haiku trial if we are willing to mitigate JSON-integrity risk first

## Validation Results

- `node scripts/evaluate-model-latency.mjs --discover-only` succeeded against the real Anthropic Models API
- `node scripts/evaluate-model-latency.mjs --model claude-sonnet-4-20250514` succeeded
- `node scripts/evaluate-model-latency.mjs --model claude-sonnet-4-6` succeeded
- `node scripts/evaluate-model-latency.mjs --model claude-haiku-4-5-20251001` succeeded
- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

## Known Technical Debt

- The evaluator still assumes Anthropic-only direct API evaluation.
- Quality review is still heuristic and should not be treated as a substitute for human product review.
- Prompt caching impact is discussed but not measured in a live cached path.

## Deviations From Handoff

- The Models API discovery failed inside the sandbox, so the real discovery/evaluation commands were rerun outside the sandbox against the configured local env.
- The account-visible model list exposed the dated Haiku 4.5 ID, so evaluation used that explicit ID instead of the alias shown in docs.

## Git Commit

- Pending at report-write time; final commit hash is reported in the final Codex Completion Summary.

## Staging Push

- Pending at report-write time; final push status is reported in the final Codex Completion Summary.

## Remaining Uncertainties

- Whether Haiku’s `1/5` JSON failure rate improves with stricter output constraints or a retry wrapper is still unknown.
- Whether the cost/latency win is worth the reliability tradeoff depends on human tolerance for occasional failed analyses.

## Recommended Next Step

`Module 01 Haiku Staging Trial Decision v0`
