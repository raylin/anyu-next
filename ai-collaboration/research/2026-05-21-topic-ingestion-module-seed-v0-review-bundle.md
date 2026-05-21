# Topic Ingestion Module Seed v0 Review Bundle

Date: 2026-05-21

## Scope

Extended `tools/topic-ingestion/` so the extracted local pipeline can now produce deterministic module idea seeds from question seeds and optional topic context.

## What Landed

- Added a new `ModuleSeed` contract to the topic-ingestion schema layer.
- Added deterministic `question_seeds_to_module_seeds()` transformation logic.
- Added a new CLI command:
  - `modules`
- Extended the existing `pipeline` command so `--modules-output` is optional and preserves old behavior when omitted.
- Added a synthetic module-seed example file and broadened tests and README coverage.

## Module Seed Contract

The public JSONL output now supports camelCase keys:

- `moduleId`
- `topicId`
- `questionIds`
- `title`
- `format`
- `audience`
- `emotionalHook`
- `userPromise`
- `inputNeeded`
- `outputSections`
- `monetizationFit`
- `tone`
- `confidence`
- `createdAt`

## Heuristic v0 Behavior

- provider-free
- deterministic
- question-seed driven
- optional topic enrichment when `--topics` is supplied

Current defaults:

- `format`: `mini-test`
- `inputNeeded`:
  - `對話片段`
  - `最近互動變化`
  - `見面或邀約情境`
- `outputSections`:
  - `溫度分數`
  - `三個小訊號`
  - `下一句怎麼回`
- relationship-heavy topics map to:
  - `monetizationFit: paid follow-up reply strategy`

## Pipeline Shape

The local loop is now:

```text
source-agnostic jsonl
→ topic candidates
→ question seeds
→ module idea seeds
```

This stays tooling-only and ideation-oriented. It does not create final module specs or product copy.

## Validation Added

- module-seed generation from question seeds plus topic candidates
- module-seed generation without topic candidates using defaults
- CLI `modules` command output shape
- CLI `pipeline` with `--modules-output`
- CLI `pipeline` without `--modules-output` preserving older behavior
- bounded confidence assertions through transformer tests

## Explicit Non-Goals Preserved

- no provider / LLM enrichment
- no sourcing / Dcard fetching / browser automation
- no app runtime or production behavior changes
- no attempt to turn these seeds into final UX or legal copy

## Recommended Follow-Up

- only add provider-assisted enrichment later if human-approved and clearly useful
- otherwise keep this tool heuristic-first and use it as ideation scaffolding for topic review, not as a hidden product generator
