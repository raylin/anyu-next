# Staging LINE Bind Validation v0 Handoff

## Task

Staging LINE Bind Validation v0.

## Context

Staging Admin token injection and the focused Email save -> mock/no-card paid -> access-link rebaseline passed. LINE staging bind remains unverified and must be validated before any production smoke retry.

## Scope

- Verify Preview(staging) freshness.
- Verify staging scoped runtime config.
- Create a fresh staging Module 01 result from the tracked fixture.
- Verify checkout-start readiness before owner action.
- Ask owner for one staging mobile LINE bind only after readiness passes.
- Collect Admin/Ops LINE diagnostics and lookup-result evidence.

## Safety Rules

- No production runtime, production payment, production Email, or production LINE.
- No real staging Email or broad smoke.
- No manual retry loop.
- No direct DB unless Admin/Ops is insufficient and read-only debugging is explicitly justified.
- Do not expose raw LINE userId, idToken, LIFF state, encrypted recipient, hashes, tokens, or tokenized URLs.
- `pnpm ops` remains pure; staging QA helpers may inject the Preview Admin token from the approved staging mirror.

## Validation Plan

- `qa:deploy:freshness` against latest `origin/staging`.
- staging runtime config via tracked QA helper / Admin Ops.
- tracked smoke fixture.
- focused staging checkout preparation.
- owner mobile LINE bind.
- Admin/Ops diagnostics via safe CLI/helper.
- report, summary log, dashboard update, static safety checks.

## Expected Report

`ai-collaboration/reports/2026-06-07-staging-line-bind-validation-v0.md`
