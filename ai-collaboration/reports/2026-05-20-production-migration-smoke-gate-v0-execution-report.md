# Production Migration + Smoke Gate v0 Execution Report

## Summary

Completed the approved production migration and a tightly scoped synthetic production smoke for Module 01.

The direct `vercel env run` Drizzle path still surfaced an empty DB URL to the probe, so migration was completed through an approved direct Neon production-branch transaction instead. After migration, the required tables were verified, the live production analyze flow succeeded, the real result route loaded, unlock intent succeeded, synthetic Email fallback succeeded, legal routes loaded, and `www.anyu.tw` redirected to apex.

Current production status remains `No-Go pending final human approval / final launch decision`.

## Files Created

- `ai-collaboration/handoffs/2026-05-20-production-migration-smoke-gate-v0-handoff.md`
- `ai-collaboration/research/2026-05-20-production-migration-smoke-gate-v0.md`
- `ai-collaboration/reports/2026-05-20-production-migration-smoke-gate-v0-execution-report.md`

## Files Updated

- `ai-collaboration/decisions/2026-05-20-production-launch-decision-draft-v0.md`
- `docs/operations/production-deployment-runbook.md`
- `ai-collaboration/summaries/summary_log.md`

## Migration Status

- safe production `vercel env run` migration attempt: failed because Drizzle still received empty `url`
- approved fallback direct Neon production-branch migration: passed
- migration method used only existing expected runtime schema objects

## Table Verification Status

Required production runtime tables present after migration:

- `sessions`
- `events`
- `analysis_requests`
- `analysis_results`
- `unlock_intents`
- `contact_submissions`

Relational verification also passed for the smoked production `resultId` and `unlockIntentId`.

## Smoke Test Status

Production smoke was run: `yes`

Production smoke outcome: `passed`

Verified live:

- landing route
- synthetic analyze
- real result route
- paid preview / result surfaces
- unlock intent
- LINE-first panel presence
- Email fallback submit with synthetic email
- legal routes
- apex / `www` redirect

## Event / Privacy Status

Safe production verification passed:

- `analysis_completed` event exists
- timing metadata exists
- `contact_submitted` event exists
- raw synthetic input not present in event metadata
- synthetic email not present in event metadata
- full result JSON not present in verified event metadata
- provider raw output not present in verified event metadata

## Decision Draft Updates

Updated the production launch decision draft to reflect:

- migration passed
- required runtime tables exist
- production smoke passed
- live runtime DB access is now proven by production smoke
- current launch status remains `No-Go pending final human approval / final launch decision`

## Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

## Known Technical Debt

- safe Vercel production `env run` probing still does not mirror live runtime DB availability cleanly
- manual retention cleanup remains an accepted-but-not-automated launch burden
- app-level `www -> apex` redirect remains a narrow operational solution rather than a domain-config-only solution

## Tech Debt Review

### New Technical Debt Introduced

- none

### Existing Technical Debt Observed

- Vercel production env/runtime probing is still inconsistent with live runtime behavior for `DATABASE_URL`
- launch readiness is still partly documented across multiple operational artifacts

### Opportunistic Cleanup Completed

- replaced the stale “schema-empty / smoke blocked” production understanding with a real migrated production branch and a verified smoke result

### Deferred Cleanup Candidates

- establish a cleaner secret-safe ops recipe for production DB/runtime verification
- optionally move `www -> apex` policy fully into Vercel/domain config later

### Recommended Follow-up

- run a final human production browser / phone smoke and then revise the launch decision for approval or hold

## Deviations From Handoff

- the preferred `corepack pnpm db:migrate` production-context path could not be completed through the safe Vercel probe because Drizzle still saw empty `url`
- used an approved direct Neon production-branch migration instead, then verified success through live production smoke

## Git Commit

- pending at report-writing time

## Staging Push

- pending at report-writing time

## Remaining Uncertainties

- final approved production commit still needs explicit human selection
- final human browser / phone acceptance is still pending
- manual retention cleanup acceptance is still pending

## Recommended Next Step

`Production Final Human Smoke + Launch Decision v0`
