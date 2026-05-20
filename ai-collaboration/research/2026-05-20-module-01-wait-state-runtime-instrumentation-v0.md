# Module 01 Wait-State + Runtime Instrumentation v0

## 1. Summary

Module 01 now records stable server-side analyze timing phases and stores a safe latency summary inside the existing `analysis_completed` event metadata. The landing wait state also moved from rotating generic copy to elapsed-time-aware reassurance, plus a generous client timeout path.

## 2. Why This Was Needed

- The current Sonnet baseline is usable, but local evaluation showed a median analyze latency of about 28 seconds.
- The previous wait state did not distinguish between a healthy short wait and a noticeably long generation.
- We needed enough timing visibility to separate provider latency from validation and DB write time without introducing a full observability stack.

## 3. Timing Phases Added

The analyze route now marks these phases:

- `request_received`
- `input_validated`
- `input_redacted`
- `analysis_request_stored`
- `provider_started`
- `provider_completed`
- `schema_validated`
- `analysis_result_stored`
- `response_ready`

These are implemented through `apps/web/src/lib/runtime/timing.ts`, which also derives safe summary metrics such as:

- `totalLatencyMs`
- `providerLatencyMs`
- `schemaValidationLatencyMs`
- `analysisRequestWriteLatencyMs`
- `analysisResultWriteLatencyMs`

## 4. Event / Metadata Behavior

This task intentionally kept the smaller implementation path:

- no new event name was added
- timing is attached to the existing `analysis_completed` event metadata

Stored metadata remains safe:

- `resultId`
- `privacyFlags`
- `timingMs`

No raw user text, contact values, full normalized result JSON, or provider raw output is stored in events.

## 5. Frontend Wait-State Changes

The landing page now uses elapsed-time stages instead of cycling generic loading messages:

- `0–8s`: `讀著你貼上的對話⋯`
- `8–20s`: `訊號比較細，我們還在整理節奏與回應落差⋯`
- `20–40s`: `這次讀得比較久，請再等一下；結果還在生成中。`
- `40s+`: `這次真的有點慢。你可以繼續等，或稍後重新試一次。`

The detail copy also changes with stage so the wait feels intentional rather than stuck.

## 6. Timeout / Slow-State Behavior

- The landing analyze request now uses a client-side timeout guard of `65_000ms`.
- Timeout failure maps to a friendly UI message rather than a technical error.
- The server/provider behavior itself was not changed in this task.

## 7. Privacy Safety

Privacy boundaries remained unchanged and explicit:

- redaction still happens before persistence
- events still reject metadata keys that look like raw text payloads
- contact values are not written into event metadata
- no prompt/schema/provider secret values are exposed in the new timing metadata

## 8. Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

An optional local synthetic analyze probe was attempted after validation, but a persistent local dev session was not available from this shell environment at that point, so live timing-row verification is still pending a separate manual/dev-server pass.

## 9. Remaining Latency Questions

- How much of the real end-user wait is provider time versus Vercel/HTTP overhead on staging still needs a live timing sample review.
- The current instrumentation is enough for rough attribution, but not yet for percentile tracking over time.
- If 30s latency remains normal, the next improvement should probably be staging runtime measurement and richer wait-state trust copy rather than a speculative model switch.

## 10. Recommended Next Step

`Module 01 Staging Timing Verification v0`
