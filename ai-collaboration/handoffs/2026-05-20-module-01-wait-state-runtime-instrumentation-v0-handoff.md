# Handoff: Module 01 Wait-State + Runtime Instrumentation v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Add lightweight wait-state and runtime instrumentation for Module 01 — 曖昧溫度計 — so we can understand where the ~28s analyze latency is coming from and make the waiting experience feel less broken.

The user has confirmed the v1.1 UI is broadly acceptable, but analyze wait time still feels slightly long.

This task should not change the model.

This task should not switch to Haiku.

This task should not change the product prompt/schema.

This task should add timing visibility and user-facing wait-state improvements only.

## Background

Module 01 Model Latency Evaluation v0 completed.

Key findings:

```text
Baseline model: claude-sonnet-4-20250514
Direct Sonnet median latency: about 27.96s across 5 synthetic cases
AJV/schema validation: 5/5 passed
Haiku candidates tested:
- claude-3-5-haiku-latest → not_found_error
- claude-3-5-haiku-20241022 → not_found_error
No faster Anthropic replacement is currently confirmed on this account.
No model/env default was changed.
```

Current recommendation:

```text
Keep current model for now.
Do not switch to an unverified faster model.
Add runtime timing instrumentation and improve wait-state UX.
```

## Scope

Do:

1. Add server-side timing instrumentation for analyze route.
2. Measure rough timing phases:
   - API received
   - input validation/redaction
   - DB request insert
   - provider start
   - provider end
   - JSON parse / schema validation
   - DB result insert
   - response returned
3. Return safe timing metadata only in development/staging if appropriate.
4. Log timing summary into events or analysis metadata without raw input.
5. Improve frontend loading/wait-state copy for 30s latency.
6. Add timeout/slow-state handling so users do not feel the app is stuck.
7. Keep runtime/model/provider/prompt/schema behavior unchanged.
8. Add tests for timing helpers / slow-state copy helpers where practical.
9. Commit and push to `origin/staging`.

Do not:

- change `ANTHROPIC_MODEL`
- change provider model routing
- change product prompt/schema content
- change DB schema unless absolutely necessary
- add auth/payment/portal/share PNG
- use real private user content
- commit secrets or raw provider output
- add heavyweight observability vendor/SDK

## Important Constraints

Instrumentation must never log:

```text
raw user input
contact value
provider API key
DATABASE_URL
full provider raw response
full normalized result JSON in events
```

Allowed telemetry:

```text
module_id
theme_slug
anonymous_session_id
situation_type
score_bucket
total_latency_ms
provider_latency_ms
validation_latency_ms
db_latency_ms approximate
timing phase durations
success/failure category
```

## Server Instrumentation

Update analyze route/runtime to collect timing.

Likely files:

```text
apps/web/src/app/api/modules/[moduleSlug]/analyze/route.ts
apps/web/src/lib/ai/runtime.ts
apps/web/src/lib/db/runtime.ts
apps/web/src/lib/events/types.ts
apps/web/src/tests/runtime-config-errors.test.ts
```

Create helper if useful:

```text
apps/web/src/lib/runtime/timing.ts
```

Suggested helper shape:

```ts
type TimingMark = {
  name: string;
  atMs: number;
};

type TimingSummary = {
  totalMs: number;
  phases: Record<string, number>;
};

createTimingTracker()
mark(name)
summarize()
```

Phase names should be stable and safe:

```text
request_received
input_validated
input_redacted
analysis_request_stored
provider_started
provider_completed
schema_validated
analysis_result_stored
response_ready
```

## Event / Metadata Storage

Preferred:

- Add a new safe event `analysis_timing_recorded`, or
- Include timing metadata in existing `analysis_completed` event if that is cleaner.

Do not store raw text.

Do not store full result.

Metadata example:

```json
{
  "totalLatencyMs": 28123,
  "providerLatencyMs": 25220,
  "schemaValidationLatencyMs": 14,
  "dbWriteLatencyMs": 312,
  "success": true
}
```

If the current event allowlist does not include `analysis_timing_recorded`, either:

1. add it to allowlist and tests, or
2. use existing `analysis_completed` metadata.

Choose the smaller safe implementation.

## API Response Timing Metadata

For staging/debug only, it is acceptable to return:

```json
{
  "ok": true,
  "resultId": "...",
  "redirectTo": "...",
  "debugTiming": {
    "totalMs": 28123,
    "providerMs": 25220
  }
}
```

But do not expose detailed internals to normal users if it complicates the API.

If adding API response timing risks product UX or type complexity, skip it and document that timing is persisted/logged server-side only.

## Frontend Wait-State UX

Current issue:

```text
Analyze wait feels slightly long even after v1.1 UI polish.
```

Improve the loading UX without promising exact seconds.

Target behavior:

```text
0–8s:
  normal calm analysis state

8–20s:
  reassurance that it is still working

20s+:
  explicitly acknowledge it is taking longer than usual,
  but keep user calm and do not imply failure
```

Suggested copy:

Initial:

```text
讀著你貼上的對話…
```

After 8s:

```text
訊號比較細，我們還在整理節奏與回應落差…
```

After 20s:

```text
這次讀得比較久，請再等一下；結果還在生成中。
```

Optional after 40s:

```text
這次真的有點慢。你可以繼續等，或稍後重新試一次。
```

Do not show provider/model details.

Do not show raw technical errors.

Do not add fake progress percentages.

## Frontend Implementation

Likely file:

```text
apps/web/src/components/modules/ai-temperature/AiTemperatureLanding.tsx
```

If current loading messages already rotate, adapt them to include slow-stage awareness.

Possible implementation:

```ts
const elapsedMs = Date.now() - startedAt
const waitStage = elapsedMs < 8000 ? "normal" : elapsedMs < 20000 ? "slow" : "very_slow"
```

Use message set based on waitStage.

Do not make layout jump.

Do not create a visually inconsistent box outside v1.1 rules.

## Timeout Behavior

Do not hard-fail at 20s.

If existing fetch has no timeout, consider adding a generous timeout such as 60s.

If adding timeout, use friendly copy:

```text
這次分析等太久了。請稍後再試一次。
```

Do not leak stack traces.

If timeout handling is already present, just improve copy.

## Testing

Add/update tests for:

```text
timing helper summarizes phases correctly
event metadata guard still rejects raw text fields
analysis_completed / analysis_timing metadata does not include raw text
wait-stage helper returns correct stage for elapsed times
loading copy helper includes slow/very_slow states
```

Avoid live provider tests.

Avoid requiring DATABASE_URL for tests.

## Documentation

Update:

```text
apps/web/README.md
```

Add a short note:

```text
Module 01 analyze timing instrumentation exists for staging diagnosis.
It records safe latency phase metadata and never stores raw user text in events.
```

Create report:

```text
ai-collaboration/research/2026-05-20-module-01-wait-state-runtime-instrumentation-v0.md
```

Required sections:

```markdown
# Module 01 Wait-State + Runtime Instrumentation v0

## 1. Summary

## 2. Why This Was Needed

## 3. Timing Phases Added

## 4. Event / Metadata Behavior

## 5. Frontend Wait-State Changes

## 6. Timeout / Slow-State Behavior

## 7. Privacy Safety

## 8. Validation Results

## 9. Remaining Latency Questions

## 10. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-module-01-wait-state-runtime-instrumentation-v0-execution-report.md
```

Report structure:

```markdown
# Module 01 Wait-State + Runtime Instrumentation v0 Execution Report

## Summary

## Files Created

## Files Updated

## Runtime Timing Changes

## Frontend Wait-State Changes

## Privacy Safety

## Validation Results

## Known Technical Debt

## Deviations From Handoff

## Git Commit

## Staging Push

## Remaining Uncertainties

## Recommended Next Step
```

## Summary Log

Append to:

```text
ai-collaboration/summaries/summary_log.md
```

Include:

- date
- task completed
- timing instrumentation summary
- wait-state UX summary
- validation result
- commit hash
- staging push status

## Validation

Always run:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

If possible, run staging/local synthetic analyze once and verify timing metadata is recorded safely.

Do not include raw DB rows in reports.

## Constraints

Do not implement:

```text
auth
real payment
portal
share PNG / OG generation
email sending
LINE integration
advanced PII
scheduled deletion job
major runtime rewrite
model switch
```

Do not modify:

```text
product prompt/schema content
DB schema unless absolutely necessary
provider architecture
legacy prototype behavior
Dcard scripts
design system v1.1
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
raw private user content
raw DB row dumps
full provider raw output
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "chore: add module 01 wait-state instrumentation"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if:

- validation failed
- unrelated uncommitted changes exist
- secrets are staged
- raw user content is staged
- report contains secrets or raw DB rows

If push is skipped or fails, report exact reason.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- timing phases added
- where timing metadata is stored
- frontend wait-state changes
- whether model/runtime/provider behavior changed
- privacy safety notes
- validation results
- whether staging/local synthetic analyze verified timing
- report path
- commit hash
- staging push status
- exact next step

Then stop.
