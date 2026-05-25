# Two-tier Free Analyze + Deferred Paid Generation v0 Implementation Plan

Date: 2026-05-25

## 1. Summary

Module 01 can move to a two-tier model safely, but it should not be implemented as a single large cutover. The current app stores and renders one coupled `ProductResult` that requires both `free_result` and `paid_result`, and LINE fulfillment assumes the unlocked content is already present.

Recommended implementation path:

```text
Phase 1: add separate paid-result storage and service seams without changing user behavior
Phase 2: introduce free-only result schema/prompt and free-first analyze behind a feature flag
Phase 3: trigger paid generation after LINE bind / short-code match with pending UX
Phase 4: add first-LINE-friend free unlock eligibility per LINE user per module
Phase 5: insert payment success as the paid-generation trigger
```

Primary data-model recommendation:

```text
Use a separate analysis_paid_results table.
```

This is more work than nullable fields, but it better fits deferred generation, retry history, future payment records, and retention separation.

## 2. Current Code / Schema Findings

Current DB schema findings:

- `analysis_requests` stores redacted input in `raw_input_redacted`, cache key fields, model strategy, status, privacy flags, and retention expiry.
- `analysis_results` has one row per request and stores a full `ProductResult` in `normalized_result_json`.
- `analysis_results.request_id` is unique, so one request currently maps to one result.
- `analysis_results` stores provider metadata and `provider_raw_json`.
- `unlock_intents` references `analysis_results.id` and stores fulfillment code/token hashes, fulfillment status, LINE user ID, LINE bound timestamp, delivery attempts, and expiry timestamps.
- LINE hardening tables exist: `line_webhook_events` and `line_webhook_rate_limits`.
- No separate paid-result lifecycle table exists.

Current route/runtime findings:

- `/api/modules/[moduleSlug]/analyze` validates input, redacts it, checks cache, creates `analysis_requests`, calls `generateModuleResult`, stores full `ProductResult`, and returns the result ID.
- `generateModuleResult` builds one prompt and validates the full `ProductResult` against `product_result_schema_v2`.
- Cache key currently combines normalized redacted text, situation, user context, prompt version, schema version, model strategy, provider, and primary model.
- Result page maps the stored full result into `AiTemperatureResultViewModel`.
- The free result page currently depends on `paid_result.softInsight` or `paid_result.avoidDoing[0]` as fallback reassurance.
- Unlock page directly renders `record.result.normalizedResultJson.paid_result`.
- Unlock intent creation only creates fulfillment code/token state; it does not trigger generation because paid result already exists.
- LIFF bind and LINE webhook both bind/deliver immediately because the unlocked result link can already render paid content.

Current prompt/schema findings:

- `aiTemperatureModule` points to `product_result_prompt_v0.4` and `product_result_schema_v2`.
- `ProductResult` type requires `paid_result`.
- Semantic validation for schema v2 validates paid-result depth during initial analyze.

Implication:

```text
Free-first cannot simply omit paid_result from current ProductResult without breaking validation, result mapping, unlock rendering, and fulfillment assumptions.
```

## 3. Recommended Data Model

Recommend a separate paid-result table.

Proposed table:

```text
analysis_paid_results
- id uuid primary key
- analysis_result_id uuid not null references analysis_results(id)
- module_id text not null
- theme_slug text not null
- status text not null default 'requested'
- requested_by_unlock_intent_id uuid references unlock_intents(id)
- requested_reason text not null
- cache_key_version text
- cache_key_hash text
- prompt_version text not null
- schema_version text not null
- provider text
- provider_model text
- paid_result_json jsonb
- provider_raw_json jsonb
- started_at timestamptz
- completed_at timestamptz
- failed_at timestamptz
- error_code text
- error_category text
- retry_count integer not null default 0
- retention_expires_at timestamptz
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()
```

Recommended indexes:

```text
unique completed/current row:
  analysis_paid_results_analysis_result_current_idx
  on analysis_result_id where status in ('requested','processing','completed')

lookup by unlock:
  analysis_paid_results_unlock_intent_idx on requested_by_unlock_intent_id

cache lookup:
  analysis_paid_results_cache_idx on module_id, theme_slug, cache_key_version, cache_key_hash, status, retention_expires_at

worker/polling lookup:
  analysis_paid_results_status_idx on status, created_at
```

Why Option B over nullable fields:

- Separates free-result lifecycle from paid-result lifecycle.
- Supports retries and future paid variants.
- Keeps payment records and unlock intents from overloading `analysis_results`.
- Makes retention cleanup more explicit.
- Avoids repeatedly updating the original result row with long-running paid state.

Tradeoff:

- More joins and route changes.
- Requires new runtime helpers and tests.

## 4. Free Result Schema Plan

Introduce a free-only result contract rather than making `paid_result` optional in the current full schema.

Recommended types:

```text
FreeProductResult
- free_result
- insight_layer
- paid_preview
- share_card
- personal_pattern_candidate
- metadata

PaidProductResult
- paid_result
- metadata
```

Recommended schema assets:

```text
product_free_result_schema_v1.json
product_paid_result_schema_v1.json
product_free_result_prompt_v1.md
product_paid_result_prompt_v1.md
```

Compatibility requirement:

- Add a display adapter that maps legacy full `ProductResult` into `FreeProductResult`.
- Update `mapProductResultToViewModel` so free-page reassurance no longer depends on `paid_result`.
- Use `free_result.uncertainty_note` or a new free-safe `next_step_teaser` field as the free-page reassurance source.

Do not remove current full schema immediately. Keep current `ProductResult` support for existing rows and rollback.

## 5. Paid Result Schema / Storage Plan

Paid result should stay structurally equivalent to current paidResult v2:

- 3 possible states.
- 3 signal deep dives.
- 3 reply strategies.
- 6-9 copyable messages.
- 48-hour plan.
- Avoid list.
- Soft insight.
- Summary card.

Paid generation input should include:

- `analysis_requests.raw_input_redacted`
- `analysis_requests.situation_type`
- user context snapshot
- free result summary/signals
- module metadata
- paid prompt/schema versions

Current gap:

```text
analysis_requests does not store userContext as structured JSON.
```

Recommendation:

- Add `user_context_json jsonb` to `analysis_requests` or store a generation input snapshot on `analysis_paid_results`.
- Prefer storing `user_context_json` on `analysis_requests` because context belongs to the original analyze input and participates in cache identity.

Privacy note:

- Use the existing redacted input, not raw input.
- If `raw_input_redacted` or result retention has expired, paid generation should fail safely with `retention_expired`.

## 6. Cache Split Plan

Current cache:

```text
analysis_requests.cache_key_version/cache_key_hash
```

It currently represents full free+paid generation.

Recommended split:

Free cache:

```text
free cache key =
moduleSlug + normalized redacted input + situation + userContext +
freePromptVersion + freeSchemaVersion + modelStrategy + provider + primaryModel
```

Paid cache:

```text
paid cache key =
moduleSlug + normalized redacted input + situation + userContext +
freeResultVersion/signature + paidPromptVersion + paidSchemaVersion +
provider + model
```

Implementation options:

- Keep `analysis_requests.cache_key_hash` as the free cache key after cutover.
- Store paid cache fields on `analysis_paid_results`.

Paid cache reuse policy:

- Reuse paid result for identical privacy-safe cache key only while both source result and paid result are retention-valid.
- Do not share unlock intent, fulfillment status, LINE identity, or payment state across users.
- If reused, create/associate fulfillment for the current unlock intent, but point to the reused paid result record or clone paid JSON depending display needs.

Recommended v0 simplification:

```text
Generate at most one paid result per analysis_result_id.
Do not cross-user paid cache reuse in Phase 1.
Add paid cache key fields now for future dedupe.
```

## 7. Analyze Route Changes

Phase 2 target behavior:

```text
POST /api/modules/[moduleSlug]/analyze
→ validate/redact input
→ build free cache key
→ return cached free result if valid
→ create analysis_request
→ generate free-only result
→ store analysis_result.normalized_result_json as free-compatible result
→ return result ID quickly
```

Route options:

- Keep existing route path to avoid frontend churn.
- Internally switch runtime from `generateModuleResult` to `generateFreeModuleResult`.
- Add feature flag such as `TWO_TIER_ANALYZE_ENABLED` for staging rollout.

Compatibility:

- Existing full-result rows must still render.
- New free-only rows need result page support without `paid_result`.
- Existing unlock CTA can still create unlock intent from result ID.

## 8. Paid Generation Trigger Plan

Phase 1/3 beta trigger:

```text
LINE bind / short-code match starts paid generation automatically if paid result is not completed.
```

Why automatic:

- User already exchanged LINE friend/bind value.
- Less friction than a second claim action.
- Aligns with current beta "use LINE to receive complete analysis" promise.

Trigger locations:

- LIFF bind route after successful LINE ID token verification.
- LINE webhook after valid short-code match.
- Future payment success webhook.

Do not trigger paid generation on unlock-intent creation in Phase 1 beta unless an experiment intentionally measures click-only intent.

## 9. LINE Fulfillment Changes

Current behavior:

```text
bind LINE → deliver unlocked URL immediately
```

Two-tier behavior:

```text
bind LINE
→ if paid result completed: deliver unlocked URL
→ if paid result missing: create/request paid generation, reply pending
→ when paid generation completes: deliver unlocked URL
→ if paid generation fails: reply safe fallback / expose web retry
```

Suggested pending reply:

```text
收到，我正在整理你的完整分析。大約需要 30–60 秒，完成後會把連結傳給你。
```

Unlock page behavior:

- If paid result completed: render paid content.
- If pending: render waiting state and poll status.
- If failed: render safe retry/fallback copy.
- If expired: ask user to return to result page and create a new unlock intent.

## 10. First LINE Friend Free Unlock Policy

Recommended policy:

```text
Per verified LINE user per module once.
```

Rationale:

- More generous than global once.
- Supports future module expansion.
- Prevents unlimited free complete analyses for the same module.
- Keeps the rule explainable.

Minimum future storage:

```text
line_user_entitlements
- id
- line_user_id_hash
- module_id
- first_free_used_at
- source_unlock_intent_id
- created_at
```

Important:

- Store hash of LINE user ID for entitlement lookups if possible.
- Avoid putting LINE IDs in analytics metadata.

Phase 1 can defer this table if all beta LINE binds are free. Add it before real paywall experiments.

## 11. Async / Worker Recommendation

Do not generate paid result synchronously inside LINE webhook response. Paid generation can take 60+ seconds and LINE webhooks should reply quickly.

Recommended v0 approach:

```text
LIFF/web path:
  create paid generation request
  show web waiting page
  poll status
  deliver link when ready

Short-code webhook path:
  bind LINE
  create paid generation request
  reply pending immediately
  background processor generates paid result
  push LINE message when ready
```

Smallest reliable worker option:

- Start with Vercel Cron or an authenticated internal route that processes `analysis_paid_results.status = 'requested'`.
- Keep it idempotent and batch-limited.
- Later replace with a proper queue only if volume/latency requires it.

Avoid in v0:

- Blocking webhook for provider generation.
- SSE/websocket/token streaming.
- External queue vendor before need is proven.

## 12. Failure / Retry Plan

Free generation failure:

- Keep current analyze error path.
- Record sanitized error category.

Paid generation failure:

- Mark `analysis_paid_results.status = 'failed'`.
- Store sanitized `error_code` and `error_category`.
- Allow one automatic retry for provider timeout/validation failure.
- Do not retry expired/invalid/retention-expired cases.

Duplicate unlock request:

- Reuse existing pending/completed paid generation for the same result.

Duplicate LINE webhook:

- Continue using `line_webhook_events.dedupe_key`.

Expired unlock token:

- Do not generate paid result.
- Ask user to return to result page.

Retention expiry before paid generation:

- Mark paid generation failed with `retention_expired`.
- Show safe unavailable copy.

LINE delivery failure:

- Keep paid result available on web unlock route.
- Mark delivery failed and allow retry.

## 13. Events / Analytics Plan

Add sanitized events:

- `free_analysis_started`
- `free_analysis_completed`
- `free_analysis_failed`
- `paid_generation_requested`
- `paid_generation_started`
- `paid_generation_completed`
- `paid_generation_failed`
- `first_line_free_unlock_used`
- `paid_delivery_pending`
- `paid_delivery_completed`
- `paid_delivery_failed`

Allowed metadata:

- result ID
- unlock intent ID
- module/theme
- status
- latency buckets
- retry count
- source type
- cache hit boolean

Forbidden metadata:

- raw input
- full result JSON
- provider raw output
- LINE user ID
- fulfillment code
- unlock token
- tokenized URL
- email
- secrets

## 14. Retention / Cleanup Implications

Future cleanup must include:

- `analysis_paid_results` retention expiry and provider raw output deletion.
- `line_webhook_events` expiry.
- `line_webhook_rate_limits` rolling cleanup.
- expired `unlock_intents`.
- future `payment_records` retention rules.

Paid generation should check retention before using `raw_input_redacted`.

Recommended policy:

- Keep paid result expiry aligned with source analysis result expiry in Phase 1.
- If payment is introduced, define paid content access duration separately before launch.

## 15. Implementation Phases

Phase 1: Schema + service seams, no behavior switch.

- Add `analysis_paid_results`.
- Add `analysis_requests.user_context_json`.
- Add paid-generation runtime helpers.
- Add status helpers.
- Keep current analyze behavior.

Phase 2: Free-first analyze behind staging feature flag.

- Add free prompt/schema.
- Add `generateFreeModuleResult`.
- Update result page adapter not to depend on `paid_result`.
- Keep unlock CTA.
- Validate staging latency improvement.

Phase 3: Deferred paid generation on LINE bind.

- Update LIFF bind and webhook to request paid generation.
- Add pending status route and unlock waiting page.
- Add idempotent processor route or cron worker.
- Push/send LINE link after completion.

Phase 4: First LINE friend free unlock.

- Add entitlement table or equivalent hash-based tracking.
- Enforce per LINE user per module once.
- Add events and tests.

Phase 5: Paywall.

- Add payment provider after separate evaluation.
- Payment success triggers paid generation.
- LINE becomes optional notification/delivery.

Recommended split:

```text
Do not combine Phases 1-3 into one commit.
```

Reason:

- Schema, prompt split, and webhook pending behavior each carry separate rollback risks.

## 16. Migration Plan

Migration 1:

```text
ALTER TABLE analysis_requests ADD COLUMN user_context_json jsonb;
CREATE TABLE analysis_paid_results (...);
CREATE indexes for analysis_result, unlock_intent, cache, status.
```

Zero-downtime notes:

- Add nullable columns first.
- New table is additive.
- Do not rewrite existing `analysis_results`.
- Backfill is not required for current production behavior.

Migration 2, later if first-free is approved:

```text
CREATE TABLE line_user_entitlements (...);
CREATE UNIQUE INDEX line_user_entitlements_user_module_idx
  ON line_user_entitlements(line_user_id_hash, module_id);
```

Migration 3, future payment:

```text
CREATE TABLE payment_records (...);
```

Schema approval required before any migration implementation.

## 17. Testing Plan

Unit tests:

- Free result schema validates without `paid_result`.
- Paid result schema validates independently.
- Free result display adapter handles legacy full result and new free-only result.
- Free cache key excludes paid prompt/schema.
- Paid cache/status helper is idempotent.
- Paid generation request dedupes existing pending/completed row.
- LINE bind returns pending if paid result missing.
- Webhook short code replies pending without blocking provider call.
- Unlock page renders pending/completed/failed states.
- Entitlement policy enforces once per LINE user per module.

Integration/route tests:

- Analyze route returns free-only result under feature flag.
- Existing full-result rows still render.
- Unlock intent creation still returns code/token safely.
- Paid status route does not expose raw data or tokens.
- Events do not include forbidden metadata.

Staging smoke:

- Free analyze latency.
- Free result page render.
- LINE LIFF bind pending flow.
- LINE short-code pending flow.
- Paid generation completion and unlocked route render.
- Duplicate LINE event idempotency.
- Expired token behavior.

## 18. Rollout / Staging / Production Plan

Recommended rollout:

1. Land additive schema/service seams on staging.
2. Verify no current behavior regression.
3. Enable free-first analyze only on staging.
4. Compare fresh analyze latency against current 60-70s baseline.
5. Enable deferred paid generation on staging test OA.
6. Run real staging LINE short-code smoke.
7. Add first-free entitlement only after LINE pending flow is stable.
8. Create production launch decision record.
9. Deploy additive migrations to production.
10. Enable feature flag in production gradually.

Rollback:

- Keep current full generation path available behind feature flag.
- If deferred paid fails, disable free-first and return to full generation.
- Additive schema can remain unused.

## 19. Risk Assessment

High risks:

- Paid generation after LINE bind needs background processing; blocking webhook is unsafe.
- Free-only schema can break result page if adapters are incomplete.
- Unlock page must not show empty paid sections while paid result is pending.

Medium risks:

- Cache split can accidentally reuse stale paid output if prompt/schema dimensions are incomplete.
- First-free entitlement needs privacy-safe LINE identity handling.
- User trust may drop if paid result waits too long after LINE bind.

Low risks:

- Additive table/column migrations.
- Staging-only feature flag rollout.

## 20. Open Questions

- Is first-free unlock per LINE user per module approved, or should it start as all-beta-free until payment experiments?
- Is Vercel Cron/internal polling acceptable for the first paid-generation processor, or should a queue be required before launch?
- Should paid result reuse the free result summary as authoritative context, or regenerate from redacted input plus context only?
- What is the maximum acceptable wait after LINE bind before users lose trust?
- Should paid generation be claim-triggered inside LIFF rather than automatic after bind for clearer consent?

## 21. Recommended Next Step

Create a Phase 1 technical handoff:

```text
Two-tier Phase 1 Schema + Service Seams v0
```

Scope should be additive only:

- add `analysis_paid_results`
- add `analysis_requests.user_context_json`
- add runtime helper scaffolding and tests
- do not switch production behavior
- do not change prompt/schema yet
