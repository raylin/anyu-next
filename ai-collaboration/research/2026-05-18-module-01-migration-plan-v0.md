# Module 01 Migration Plan v0

Date: 2026-05-18

## 1. Executive Summary

Module 01 should be migrated into `apps/web` as the first production-ready standalone theme page.

The legacy prototype should remain a reference, not be copied wholesale.

The migration should preserve product learning while rebuilding the implementation in the selected Next.js foundation.

## 2. Migration Goal

Create a production-ready MVP implementation of `曖昧溫度計` in `apps/web`.

The target implementation should support:

- real landing page
- real analyze request
- real result page
- fake-door paid unlock
- contact capture
- event tracking
- privacy-aware data storage
- ANYU design system
- module config architecture

## 3. Source Inventory

Legacy module prototype files inspected:

- `experiments/ambiguous_temperature_v0/app.py`
  - thin Python HTTP server
  - serves one HTML template plus static assets
  - exposes `/api/events`, `/api/analyze`, `/api/contact`, `/health`
  - logs events/submissions locally
- `experiments/ambiguous_temperature_v0/product_runtime.py`
  - experiment constants
  - situation normalization
  - input-length bucket helper
  - temperature band helper
  - submission-record shaping
  - wrapper around shared product runtime
- `experiments/ambiguous_temperature_v0/event_log.py`
  - local JSONL event/submission/contact logging
  - allowed event names
  - experiment-local output paths
- `experiments/ambiguous_temperature_v0/contact_capture.py`
  - shallow v0 contact validation
  - `line | email` normalization
- `experiments/ambiguous_temperature_v0/templates/index.html`
  - complete v0 page structure
  - landing, result, share-card preview, paid preview, contact capture in one document
- `experiments/ambiguous_temperature_v0/static/app.js`
  - browser-side state machine
  - local session ID
  - form submit flow
  - event firing
  - paid unlock and contact flow
- `experiments/ambiguous_temperature_v0/static/styles.css`
  - module-specific UI styling built on tokens
  - reveals the intended information hierarchy and interaction surfaces
- `experiments/ambiguous_temperature_v0/static/tokens.css`
  - token source already promoted into canonical docs and app copy
- `experiments/ambiguous_temperature_v0/README.md`
  - documents the prototype’s purpose, limits, privacy caveats, and design intent

Shared product runtime files inspected:

- `oradar/product_runtime.py`
  - prompt assembly
  - provider dispatch
  - JSON parsing
  - in-house schema validation
  - share-card privacy check
- `oradar/providers.py`
  - Anthropic and OpenAI provider calls
  - Anthropic-first path already viable
- `prompts/product_result_prompt_v0.md`
  - canonical output behavior for free result, insight layer, paid preview, paid result, share card, and metadata
- `schemas/product_result_schema_v0.json`
  - current product result contract
  - includes `free_result`, `insight_layer`, `paid_preview`, `paid_result`, `share_card`, `personal_pattern_candidate`, and `metadata`

## 4. Target App Inventory

Current target app files reviewed:

- `apps/web/src/app/`
  - generic module page route exists
  - generic result page route exists
  - placeholder API routes exist
- `apps/web/src/components/`
  - shared ANYU primitives exist: `Button`, `Card`, `SituationChips`, `Wordmark`
  - module-specific landing skeleton exists: `AiTemperatureLanding`
- `apps/web/src/content/modules/`
  - `ai-temperature.ts` contains module config fields already aligned with prompt/schema/experiment IDs
- `apps/web/src/lib/`
  - module registry exists
  - event types are placeholders
  - DB schema is a starter placeholder
  - minimal PII redaction helper exists
- `apps/web/src/styles/`
  - global token import and ANYU shell styles exist
- `apps/web/src/tests/`
  - registry and health route tests exist

Current state:

- The app skeleton already supports generic `[moduleSlug]` routing via module registry.
- The current analyze route is intentionally `501 not_implemented`.
- Current DB/event/privacy files are scaffolds, not final production models.

## 5. What To Reuse

Reusable assets and ideas:

- ANYU design system tokens
- visual hierarchy from the prototype
- copy direction and product tone
- module config fields already present in `apps/web/src/content/modules/ai-temperature.ts`
- product prompt content
- product result schema
- provider abstraction concepts
- fake-door flow concept
- event names and funnel concepts
- contact capture concept
- synthetic eval learnings
- situation taxonomy:
  - `已讀不回`
  - `忽冷忽熱`
  - `回訊變慢但看限動`
  - `不確定 / 跳過`
- helper concepts from prototype runtime:
  - situation normalization
  - input length bucket
  - temperature band
  - share-card privacy constraint

## 6. What To Rewrite

These should be rebuilt in Next.js / TypeScript rather than copied:

- landing page UI
- result page UI
- state management
- API routes
- event logging
- contact capture
- DB persistence
- runtime provider calls
- schema validation
- privacy handling
- share card preview

Rationale:

- The prototype is a single-page HTML/JS surface driven by Python endpoints and local JSONL logging.
- The production path should use App Router pages, typed server routes, and DB-backed persistence.
- The prototype’s file boundaries are conceptually useful, but its server architecture is not the target architecture.

## 7. What To Defer

Explicitly defer:

- real payment
- required auth
- portal homepage
- multi-module recommendation
- share-card PNG generation
- OG image generation
- full Personal Insight Graph
- Dcard automation
- advanced PII detection
- email/LINE automation
- bottom-sheet contact capture if not needed for v0

## 8. What Must Not Be Migrated

- Do not copy Python server architecture into `apps/web`.
- Do not keep local JSONL logging as production event storage.
- Do not store raw input in analytics.
- Do not require login.
- Do not build crawler infrastructure.
- Do not copy legacy CSS blindly if tokens/components already exist.

## 9. Module 01 User Flow

Final v0 target flow:

1. User visits `/m/ambiguous-temperature`
2. User sees hero, input card, situation chips, privacy helper
3. User enters text
4. User clicks `分析我的曖昧溫度`
5. App calls `/api/modules/ambiguous-temperature/analyze`
6. Backend redacts/sanitizes where feasible
7. Backend calls provider
8. Backend validates result
9. Backend stores analysis result
10. User is routed to `/m/ambiguous-temperature/result/[resultId]`
11. Result page shows free result + share preview + paid preview
12. User clicks `解鎖下一句怎麼回 — NT$49`
13. Event logged
14. Contact capture shown
15. User submits contact
16. Contact submission stored
17. Confirmation shown

## 10. Target Routes

Recommended routes:

- `/m/ambiguous-temperature`
- `/m/ambiguous-temperature/result/[resultId]`
- `/api/modules/ambiguous-temperature/analyze`
- `/api/events`
- `/api/unlock-intent`
- `/api/contact`
- `/api/health`

Route recommendation:

- Keep the generic `[moduleSlug]` page and analyze routes already present in `apps/web`.
- Resolve behavior via the module registry so Module 01 does not block future modules.
- Allow concrete route examples and tests to focus on `ambiguous-temperature`, while the code stays generic.

## 11. Target Components

Proposed target components:

- `ModulePageShell`
- `AiTemperatureLanding`
- `InputCard`
- `SituationChips`
- `PrivacyHelper`
- `AnalyzeButton`
- `TemperatureCard`
- `OneSentenceReadCard`
- `ObservedSignalsCard`
- `InsightCard`
- `ShareCardPreview`
- `PaidPreviewCard`
- `ContactCapture`
- `ResultPageShell`

Placement:

- shared components under `apps/web/src/components/anyu/`
- module-specific components under `apps/web/src/components/modules/ai-temperature/`

Component split recommendation:

- shared layout primitives:
  - `ModulePageShell`
  - `ResultPageShell`
  - `PrivacyHelper`
  - `AnalyzeButton`
- module-specific renderers:
  - `InputCard`
  - `TemperatureCard`
  - `OneSentenceReadCard`
  - `ObservedSignalsCard`
  - `InsightCard`
  - `ShareCardPreview`
  - `PaidPreviewCard`
  - `ContactCapture`

## 12. Target Runtime / API Design

Recommended analyze route:

`POST /api/modules/[moduleSlug]/analyze`

Input:

```json
{
  "text": "",
  "situation": "",
  "anonymousSessionId": ""
}
```

Output:

```json
{
  "ok": true,
  "resultId": "",
  "redirectTo": "/m/ambiguous-temperature/result/..."
}
```

Server responsibilities:

- validate input
- load module config
- assemble prompt
- call provider
- parse JSON
- validate schema
- store result
- emit event
- return `resultId`

Provider recommendation:

- Anthropic first if configured
- OpenAI fallback optional later

Implementation note:

- Do not require provider calls in tests.
- Reuse the architecture concepts from `oradar/product_runtime.py`, but consider moving the web-facing runtime wrapper into `apps/web/src/lib/ai/` rather than coupling route handlers directly to raw provider code.
- Prefer client navigation from JSON response rather than server-issued redirect so the app can manage loading and error states explicitly.

## 13. Target Database Model

Recommended minimal production tables:

- `sessions`
- `events`
- `analysis_requests`
- `analysis_results`
- `unlock_intents`
- `contact_submissions`

Important fields:

- `module_id`
- `theme_slug`
- `experiment_id`
- `visual_variant`
- `prompt_version`
- `schema_version`
- `anonymous_session_id`
- `situation_type`
- `score_bucket`
- `raw_input_redacted`
- `input_char_count`
- `retention_expires_at`
- `deleted_at`
- `created_at`

Storage guidance:

- raw input should not be stored in the event table
- event table should hold funnel metadata only
- analysis input should be separated from result/event/contact records
- contact submissions should be separated from raw analysis text
- `analysis_results` should likely store normalized user-facing result JSON plus selected metadata

Important note:

- This is a planning recommendation only.
- Actual schema changes require a separate implementation handoff and must not be silently changed.

## 14. Target Event Model

Recommended events:

- `page_view`
- `input_started`
- `input_submitted`
- `analysis_completed`
- `paid_unlock_clicked`
- `contact_submitted`
- `share_card_clicked`
- `error_seen`

Recommended payload fields:

- `module_id`
- `theme_slug`
- `experiment_id`
- `visual_variant`
- `prompt_version`
- `schema_version`
- `situation_type`
- `score_bucket`
- `anonymous_session_id`
- `timestamp`

Event rule:

- no raw user text in event payloads

## 15. Privacy / Data Retention Plan

Minimum v0 production requirement:

- frontend privacy helper
- no raw text in analytics
- raw/redacted input stored separately from events
- `retention_expires_at` present
- contact submissions separated from raw analysis text
- PII warning copy
- no absolute privacy claims

Recommended production stance:

- retain the privacy helper and warning language concept from the prototype
- downgrade any hard deletion promises until a real deletion/retention mechanism exists
- treat retention cleanup as either:
  - a pre-launch blocker, or
  - a required follow-up before broader public release

## 16. Share Card Plan

v0:

- in-app 4:5 preview
- screenshot friendly
- persona + quote + temperature + ANYU footer
- no raw conversation text

v1.1:

- `@vercel/og` / Satori PNG generation
- IG Story format
- OG format

## 17. Paid Unlock / Contact Capture Plan

v0:

- fake-door unlock
- no real charge
- inline or sheet contact capture
- store contact submission
- confirmation state

Copy direction:

- `ONE-TIME · NO SUB`
- `解鎖下一句怎麼回 — NT$49`
- `目前內測中，這次不會真的收費。`

Recommendation:

- start with inline contact capture first because it is simpler, easier to QA, and already validated conceptually by the prototype
- treat bottom-sheet treatment as optional later UX iteration

## 18. Testing Plan

Minimum tests:

- module registry resolves `ambiguous-temperature`
- analyze input validation
- event payload builder excludes raw text
- score bucket helper
- contact validation
- schema validation helper
- forbidden copy lint smoke test

No provider live calls in tests.

Suggested test organization:

- pure unit tests for helpers under `apps/web/src/lib/`
- route tests for validation-only paths
- component smoke tests only where useful for module rendering contracts

## 19. Implementation Milestones

### Milestone A: Module 01 UI Port v0

- landing page
- input card
- chips
- result placeholder
- paid preview
- contact capture UI
- no provider call yet

### Milestone B: Runtime + DB Integration v0

- analyze route
- provider call
- schema validation
- store result
- result page loads DB result
- events

### Milestone C: Fake-door Launch Readiness v0

- privacy copy
- contact capture persistence
- event report
- deployment env
- manual QA

### Milestone D: Post-launch Enhancements

- share PNG
- real payment
- optional auth
- portal
- Personal Insight Graph

## 20. Risks And Anti-Patterns

- copying legacy prototype architecture
- overbuilding portal before launch
- requiring auth
- storing raw text in events
- making real payment a blocker
- building provider runtime without schema validation
- hardcoding only this module in a way that blocks future modules
- letting design drift from tokens

## 21. Open Questions

- Should result records store full provider JSON or normalized result only?
- Should `raw_input_redacted` be stored in v0 or only transiently used?
- Should contact capture be inline first or bottom sheet?
- Should analyze route redirect immediately or return JSON for client navigation?
- Should first launch require DB-backed result page or allow ephemeral result?

## 22. Recommended Next Step

`Module 01 UI Port v0`

This should implement the UI shell in `apps/web` using module config and design system, without provider/DB runtime yet.
