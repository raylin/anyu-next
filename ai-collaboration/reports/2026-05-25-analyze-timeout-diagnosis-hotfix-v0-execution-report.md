# Analyze Timeout Diagnosis + Hotfix v0 Execution Report

Date: 2026-05-25

## Completed Work

- Saved the task handoff under `ai-collaboration/handoffs/`.
- Diagnosed the analyze CTA failure path for `/api/modules/[moduleSlug]/analyze`.
- Reproduced the staging symptom with a sanitized synthetic analyze request:
  - Pre-hotfix staging server response completed in about 72s.
  - The browser CTA timeout was 65s, so users could see timeout even when the server later completed.
- Applied the smallest recovery hotfix:
  - Added explicit analyze route `maxDuration = 90`.
  - Increased client analyze request timeout from 65s to 95s.
  - Tightened paid-result prompt length target from 1,800-2,800 characters to 1,200-1,800 characters.
  - Constrained copyable messages to exactly 6 while preserving v2 shape.
  - Relaxed brittle broad semantic-validation forbidden substrings that were causing false failures.
  - Kept clearly unsafe/shaming/manipulative phrases blocked.
- Added tests for route duration, client timeout, prompt concision, output budget guard, and semantic forbidden phrase behavior.
- Deployed the final hotfix to staging and production.
- Verified staging and production analyze completion with sanitized synthetic requests.
- Verified repeat cache hit behavior.

## Root Cause

The incident had two contributing causes:

- The synchronous analyze route often needs more than 65s after paidResult v2 depth and validation changes, while the client aborted at 65s.
- A broad semantic-validation forbidden-phrase list rejected otherwise structurally valid paidResult v2 output, producing `provider_error` after a long provider call.

No evidence pointed to LINE webhook, LIFF, payment, email, ads, DB/cache write, or response serialization.

## Architecture Decisions

- Kept analyze synchronous for this hotfix; no queue, worker, or streaming was introduced.
- Preserved `product_result_schema_v2`.
- Preserved paidResult v2 structure:
  - 3 possible states
  - 3 signal dives
  - 3 reply strategies
  - 6 copyable messages
  - 48-hour plan
  - summary card
- Kept Anthropic output budget at 4,096 tokens because reducing it to 3,072 caused truncation/validation risk in the v2 shape.
- Relaxed only semantic-validation terms that were too broad for production reliability.

## Validation

- `python3 -m compileall oradar`: passed
- `python3 -m compileall tools/topic-ingestion`: passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`: passed, 25 tests
- `cd apps/web && corepack pnpm lint`: passed
- `cd apps/web && corepack pnpm test`: passed, 24 files / 111 tests
- `cd apps/web && corepack pnpm build`: passed
- `cd apps/web && corepack pnpm test:e2e:local`: passed, 9 tests

## Deployment + Smoke Results

- Staging final deployment:
  - Deployment ID: `dpl_GvCdKqGR6yWMGVto76pmoxdYvMTU`
  - URL: `https://anyu-next-a8m0juha2-studioanyu-1488s-projects.vercel.app`
  - Alias: `https://staging.anyu.tw`
- Staging analyze:
  - Fresh request: HTTP 200, completed, cache miss, about 63s
  - Repeat request: HTTP 200, completed, cache hit, about 2s
- Production deployment:
  - Deployment ID: `dpl_jEGWqv6yACPoM1r4RD1FD6uBvmoV`
  - URL: `https://anyu-next-ktpfdx3mp-studioanyu-1488s-projects.vercel.app`
  - Alias: `https://anyu.tw`
- Production analyze:
  - Fresh request: HTTP 200, completed, cache miss, about 68s
  - Repeat request: HTTP 200, completed, cache hit, about 3s

## Safety / Privacy

- Did not touch LINE webhook, LIFF, payment, email, ads, or legal text.
- Did not print or commit secrets.
- Did not include raw synthetic request text or provider raw output in this report.
- Vercel logs check returned no logs for the production deployment window.
- Code inspection of analyze event writes showed event metadata stores counts, flags, timing, IDs, and cache status, not raw input or raw provider output.

## Blockers

- None.

## Uncertainties

- Analyze remains close to the synchronous request ceiling; production fresh smoke was about 68s.
- Output quality should receive a human review because the prompt target is now intentionally more concise.

## Tech Debt Review

- New technical debt introduced: the route remains synchronous and depends on a long browser wait.
- Existing technical debt observed: semantic validation still mixes safety checks and style-preference checks in one hard-fail gate.
- Opportunistic cleanup completed: narrowed the false-positive semantic forbidden list.
- Deferred cleanup candidates: split paid-result semantic validation into severity levels, add sanitized server-side error categorization, and move analyze to a request-state polling flow for slow generations.

## Suggested Next Steps

- Monitor staging and production analyze latency for 24 hours.
- Add an explicit sanitized validation-error reason to internal request state/events so future incidents can distinguish JSON truncation, schema failure, and semantic false positives without exposing raw output.
- Plan a proper async analyze request-state flow if paidResult v2 quality requires consistently long generation times.
