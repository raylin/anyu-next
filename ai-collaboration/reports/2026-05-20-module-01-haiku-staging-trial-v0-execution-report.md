# Module 01 Haiku Staging Trial v0 Execution Report

## Summary

Implemented an env-driven guarded Haiku strategy for Module 01, validated it locally, deployed it to staging preview, and confirmed one live Haiku analyze sample through the real staging route plus Neon preview-branch verification. The full 5-sample staging trial did not complete because repeated automated protected-preview POST requests were intercepted by Vercel’s browser security checkpoint. Staging was reverted to `sonnet_default` after the partial trial.

## Files Created

- `ai-collaboration/handoffs/2026-05-20-module-01-haiku-staging-trial-v0-handoff.md`
- `ai-collaboration/research/2026-05-20-module-01-haiku-staging-trial-v0.md`
- `ai-collaboration/reports/2026-05-20-module-01-haiku-staging-trial-v0-execution-report.md`

## Files Updated

- `apps/web/src/lib/ai/types.ts`
- `apps/web/src/lib/ai/provider.ts`
- `apps/web/src/lib/ai/runtime.ts`
- `apps/web/src/app/api/modules/[moduleSlug]/analyze/route.ts`
- `apps/web/src/tests/event-metadata.test.ts`
- `apps/web/src/tests/runtime-model-strategy.test.ts`
- `apps/web/README.md`
- `ai-collaboration/summaries/summary_log.md`

## Runtime Strategy Changes

- added `MODEL_STRATEGY` support
- added guarded Anthropic strategy `haiku_retry_sonnet_fallback`
- added per-analysis safe strategy metadata to `analysis_completed` events
- kept the existing default strategy unchanged as `sonnet_default`

## Staging Env / Deployment Status

- preview branch `staging` was temporarily configured for guarded Haiku
- preview deployment with guarded Haiku code was created and aliased to `staging.anyu.tw`
- one live Haiku analyze sample completed successfully
- preview branch `staging` was reverted to `MODEL_STRATEGY=sonnet_default`
- `staging.anyu.tw` was re-aliased to the reverted baseline deployment at the end

## Trial Results Summary

- intended synthetic sample count: `5`
- confirmed live staging samples completed: `1`
- confirmed final success rate from completed live samples: `1/1`
- confirmed retry count total: `0`
- confirmed fallback count total: `0`
- confirmed live total latency: `21,606 ms`
- confirmed live provider latency: `18,178 ms`

## Recommendation

Do not recommend the guarded Haiku strategy for production consideration yet.

The implementation itself is viable, but the staging trial evidence is incomplete because protected-preview automation blocked the required multi-sample run. Keep staging and production on Sonnet default until an authenticated browser-based Haiku trial completes.

## Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed
- one live staging analyze sample completed successfully with guarded Haiku
- Neon preview-branch verification confirmed safe metadata and persistence for that sample

## Known Technical Debt

- staging protected-preview automation is brittle for repeated POST requests from this shell environment
- retry/fallback live-path behavior remains unexercised
- full staging route visual verification still benefits from an interactive browser session

## Deviations From Handoff

- full 5-sample staging trial did not complete because repeated protected-preview POSTs were intercepted by Vercel’s browser security checkpoint
- unlock/contact verification was not rerun under Haiku because the broader multi-sample POST path was already blocked at the preview protection layer

## Git Commit

- Pending at report creation time

## Staging Push

- Pending at report creation time

## Remaining Uncertainties

- whether retry-on-invalid will actually be exercised under live staging traffic
- whether the fallback path is needed at all once a larger authenticated trial is run
- whether Vercel protected-preview automation should be bypassed with a dedicated secret for future QA tasks

## Recommended Next Step

`Module 01 Haiku Authenticated Browser Trial v0`
