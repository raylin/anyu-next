# Paid Result Prompt Schema Upgrade v0 Review Bundle

Date: 2026-05-24

## Scope

- Implemented optional context chips for Module 01 landing/input.
- Upgraded the generated `paid_result` contract from the thin v0 shape to a richer paid-value shape.
- Kept prompt metadata structured; context values are validated allowlist chips, not free-form appended prompt text.
- Preserved display compatibility for old stored paid results through a legacy display adapter.

## Context Inputs

Allowed context dimensions:

- `relationshipStage`
- `userGoal`
- `primaryPain`
- `replyTone`

Server behavior:

- unknown context keys or values return `validation_error`
- empty / skip values are compacted away
- analytics events store only `userContextProvided` and `userContextFieldCount`
- no raw user text or context payload is written into event metadata

## Paid Result v1 Shape

New generated paid result sections:

- `fullSummary`
- `possibleStates` with exactly 3 items
- `signalDeepDive` with exactly 3 items
- `replyStrategies` with exactly 3 strategies and 2-3 copyable messages each
- `next48HourPlan`
- `avoidDoing`
- `softInsight`
- `summaryCard`

## Versioning

- prompt version: `product_result_prompt_v0.3`
- schema version: `product_result_schema_v1`
- cache key version: `v2`

## Backward Compatibility

- runtime generation validates against the new v1 paid-result schema
- existing stored old-format paid results are adapted for display on result/unlock routes
- no database schema migration was introduced

## Product / Architecture Notes

- Context chips are implemented as behavioral priors only.
- The cache key includes normalized context dimensions, so two otherwise identical analyses with different context choices do not collide.
- No LINE behavior, payment behavior, provider/model routing, production deployment, or production env was changed.

## Review Focus

- Whether the context chip labels are the right first set for paid-result value.
- Whether the paid result v1 sections are sufficient for an NT$49 unlocked result.
- Whether the unlock page ordering should be adjusted after real generated output is reviewed.
