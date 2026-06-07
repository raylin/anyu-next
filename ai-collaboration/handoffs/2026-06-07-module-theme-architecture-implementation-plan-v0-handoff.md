# Module Theme Architecture Implementation Plan v0 Handoff

## Shared Policy

Follow `AGENTS.md` and `ai-collaboration/process/*.md`.

## Task

Create a planning-only implementation report for the preserved theme architecture track. Do not implement runtime UI.

## Scope Guard

- No production runtime open.
- No payment.
- No Email/LINE sends.
- No Vercel env changes.
- No DB mutation.
- No Module 02 implementation.
- No replacement of current product copy with archived design copy.
- Preserve existing payment/access-link behavior.

## Accepted Direction

- Hybrid Theme Park Model.
- Core Shell is neutral editorial.
- Module 01 is Riso-only.
- All ANYU-owned Module 01 flow pages stay in Riso.
- Shared flow templates accept module theme tokens.
- Provider-hosted NewebPay page is outside ANYU control.
- Module 02 Radar is architectural proof only.

## Validation Plan

- docs presence check
- dashboard HTML sanity
- secret/private scan
- `git diff --check`

## Recommended Output

- report: `ai-collaboration/reports/2026-06-07-module-theme-architecture-implementation-plan-v0.md`
- update dashboard and summary log
