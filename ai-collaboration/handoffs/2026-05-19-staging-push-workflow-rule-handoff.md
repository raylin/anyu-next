# Handoff: Add Staging Push Rule to Workflow

Date: 2026-05-19

Project: anyu-next / 暗語 ANYU

## Objective

Update the collaboration workflow so every completed handoff should commit changes and push to the `staging` branch unless blocked by validation failure, unrelated changes, missing access, or safety risks.

## Scope

- update workflow documentation only
- add staging push rule and safety conditions
- update final response format requirements
- run standard validation
- commit and attempt push to `origin/staging` if safe

## Constraints

- no product/runtime changes
- no secret handling changes
- no force push
