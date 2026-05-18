# Handoff: Implement ANYU Design System v1.0 Into Prototype

Date: 2026-05-18

Project: Opportunity Radar / 暗語 ANYU

## Objective

Apply the ANYU Design System v1.0 visual direction to the existing `曖昧溫度計` local prototype while preserving current runtime behavior, API contracts, event names, and fake-door flow.

## Scope

- store the design system markdown in-repo
- store and use `tokens.css` in the prototype
- refresh landing, result, share preview, paid CTA, and contact capture visuals
- keep the current analyze, fake paid unlock, contact capture, and event logging behavior intact
- document the implementation in README, a review bundle, an execution report, and the summary log

## Constraints

- no prompt or schema changes
- no product runtime behavior changes
- no API response shape changes
- no event name changes
- no fake-door funnel logic changes
- no portal, payment, or share-card image generation work

## Required Outputs

- `ai-collaboration/research/design/2026-05-18-anyu-design-system-v1.md`
- `experiments/ambiguous_temperature_v0/static/tokens.css`
- `ai-collaboration/research/design/2026-05-18-anyu-design-system-implementation-review-bundle.md`
- `ai-collaboration/reports/2026-05-18-anyu-design-system-implementation-execution-report.md`
- `ai-collaboration/summaries/summary_log.md`
