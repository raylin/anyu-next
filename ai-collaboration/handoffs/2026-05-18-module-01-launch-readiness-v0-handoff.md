# Handoff: Module 01 Launch Readiness v0

Date: 2026-05-18

Project: anyu-next / 暗語 ANYU

## Objective

Prepare Module 01 — 曖昧溫度計 — for first low-key public launch readiness review by tightening passive analytics, unlock/contact fallback behavior, runtime error UX, environment guidance, and launch checklists without adding major new product scope.

## Scope

- add minimal passive client-side events using existing `/api/events`
- add graceful unlock-intent failure fallback that still reveals contact capture
- keep runtime and contact errors friendly and non-technical
- update `apps/web/README.md` with launch-readiness setup notes
- create launch-readiness checklist, review bundle, execution report, and summary log update

## Non-Goals

- no auth
- no real payment
- no portal work
- no share PNG / OG generation
- no email or LINE automation
- no advanced PII detection
- no scheduled deletion job

## Expected Deliverables

- passive event plumbing for `page_view`, `input_started`, `analysis_started`, `analysis_failed`, and `share_card_clicked`
- unlock-intent fallback path in the result UI
- launch checklist markdown
- launch-readiness review bundle
- launch-readiness execution report
