# Module 01 Haiku Repair Trial v0 Execution Report

## Summary

Evaluated four Haiku reliability strategies for Module 01 without changing the current runtime default. The trial found that direct Haiku remains unsafe, repair-on-invalid is counterproductive, and retry-on-invalid is the most plausible guarded path for a future staging model-switch trial.

## Files Created

- `ai-collaboration/handoffs/2026-05-20-module-01-haiku-repair-trial-v0-handoff.md`
- `ai-collaboration/research/2026-05-20-module-01-haiku-repair-trial-v0.md`
- `ai-collaboration/reports/2026-05-20-module-01-haiku-repair-trial-v0-execution-report.md`

## Files Updated

- `apps/web/scripts/evaluate-model-latency.mjs`
- `ai-collaboration/summaries/summary_log.md`

## Strategies Tested

- `direct`
- `retry-on-invalid`
- `repair-on-invalid`
- `sonnet-fallback`

## Results Summary

- `direct`: `4/5` final success, still not safe enough
- `retry-on-invalid`: `5/5` final success in this run, median `18,526 ms`, estimated `$14.495 / 1,000`
- `repair-on-invalid`: `3/5` final success, worse reliability and weaker cost/latency tradeoff
- `sonnet-fallback`: `5/5` final success in this run, but fallback path did not actually trigger

## Recommendation

Do not switch Module 01 directly to raw Haiku.

Do not use repair-on-invalid.

If a staging Haiku trial is pursued, use a narrow retry guard first. Sonnet fallback is still only directionally supported because it was not exercised in this sample.

## Validation Results

- `node scripts/evaluate-model-latency.mjs --model claude-haiku-4-5-20251001 --strategy direct` succeeded
- `node scripts/evaluate-model-latency.mjs --model claude-haiku-4-5-20251001 --strategy retry-on-invalid` succeeded
- `node scripts/evaluate-model-latency.mjs --model claude-haiku-4-5-20251001 --strategy repair-on-invalid` succeeded
- `node scripts/evaluate-model-latency.mjs --model claude-haiku-4-5-20251001 --strategy sonnet-fallback --fallback-model claude-sonnet-4-20250514` succeeded
- `python3 -m compileall oradar`
- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`

## Known Technical Debt

- The evaluator still uses a small five-case synthetic set.
- The retry-on-invalid and sonnet-fallback recovery paths were not actually triggered in this specific run.
- Real browser-perceived latency is still separate from direct provider timing.

## Deviations From Handoff

- None

## Git Commit

- Pending at report creation time

## Staging Push

- Pending at report creation time

## Remaining Uncertainties

- Whether retry-on-invalid remains `5/5` across a larger sample is still unknown.
- Whether Sonnet fallback is worth the extra implementation complexity is still unproven because fallback did not fire in this run.

## Recommended Next Step

`Module 01 Haiku Staging Trial v0`
