# Two-tier + Dual Theme Production Activation Decision v0 Execution Report

## Summary

Created the production activation decision record for Module 01 after the two-tier, LINE/LIFF, dual-theme, input-quality, pending paid UX, and staging QA work. The decision is GO for low-key production activation under explicit gates, and NO-GO for ads or broader traffic.

No production deployment, production migration, production smoke, code change, env change, or LINE Console change was performed.

## Files Created

- `ai-collaboration/handoffs/2026-05-25-two-tier-dual-theme-production-activation-decision-v0-handoff.md`
- `ai-collaboration/research/2026-05-25-two-tier-dual-theme-production-activation-decision-v0.md`
- `ai-collaboration/reports/2026-05-25-two-tier-dual-theme-production-activation-decision-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Decision

- Low-key production activation: GO.
- Ads / broader traffic: NO-GO.
- Payment/email/rich menu/broadcast: out of scope and still not approved.
- Production activation must be a separate explicitly approved production ops task.

## Evidence Reviewed

Reviewed latest readiness evidence including:

- Pre-production staging QA with no P0/P1 issues.
- Real staging LIFF and real staging/test OA short-code smoke pass records.
- Input-quality and pending-paid UX execution report.
- Analyze submit transition flicker fix report.
- Dual-theme fidelity, share-card/theme-switch, global LIFF bridge, and LIFF URL path-duplication reports.
- Paid-generation reliability follow-up report.
- Production Phase 1 migration and smoke report.
- `analysis_paid_results` retention cleanup report.
- Phase 3 LINE bind trigger/delivery report.

## Risk Assessment

Accepted only for low-key beta:

- Webhook-triggered paid generation uses Next `after`, not a durable queue.
- Short-code path may send a pending link before after-response paid generation completes.
- Provider paid generation can still fall back after output-validation instability.
- Local Playwright remains blocked in this harness.
- Runtime does not expose exact deployed commit/version marker.
- Authorized retention dry-run still needs a better operator secret-access path.

Blocking for broader traffic:

- No durable queue/background processor.
- Provider/fallback monitoring is not mature enough for ads traffic.
- Production real LINE flow stability still needs post-activation observation.

## Production Gate

Production activation should be limited to low-key beta and must pass the production smoke checklist in the decision record:

- health and landing routes,
- Theme A/B behavior,
- input threshold,
- analyze completion and transition,
- result page,
- unlock intent,
- LIFF URL shape,
- real mobile production LIFF bind,
- production short-code bot reply,
- paid generation and unlocked paid content,
- theme carryover,
- Chinese likelihood labels,
- privacy/sensitive-data checks.

## Rollback / Monitoring Plan

Rollback plan was documented in the decision record:

- revert to last known stable production deployment,
- disable or reroute LINE fulfillment if needed,
- keep free result available if paid generation breaks,
- force Theme A if Theme B breaks,
- temporarily use LIFF-only or short-code-only fallback depending on which channel fails.

Post-activation monitoring was documented:

- analyze counts and latency,
- paid-generation counts and failure categories,
- provider vs fallback source,
- pending paid stuck counts,
- LIFF bind and short-code success/failure,
- unlocked result views,
- theme distribution,
- retention overdue counts,
- privacy/sensitive-data reports.

## Validation Results

- `python3 -m compileall oradar`: passed.
- `python3 -m compileall tools/topic-ingestion`: passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`: passed, 25 tests.
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed, 28 files and 168 tests.
- `cd apps/web && corepack pnpm build`: passed.
- Playwright was not required because this was a docs-only task and no code changed.

## Known Technical Debt

- Next `after` is not durable queueing.
- Provider paid generation may still need fallback after output-validation issues.
- Local Playwright remains blocked by Chromium/MachPort permissions.
- Runtime lacks exact deployed commit marker.
- Retention dry-run route needs a documented operator path with direct secret access.

## Tech Debt Review

### New Technical Debt Introduced

- None. This was documentation/decision-only.

### Existing Technical Debt Observed

- Durable paid generation delivery remains the main blocker for ads/broader traffic.
- Provider/fallback metrics should be monitored before traffic expansion.
- Exact runtime build/version observability remains weak.

### Opportunistic Cleanup Completed

- Consolidated production smoke, rollback, monitoring, accepted risk, and no-go criteria into one decision record.

### Deferred Cleanup Candidates

- Add durable background delivery or polling processor.
- Add safe build/version marker.
- Add an operator-safe retention dry-run procedure.
- Add broader retention coverage for remaining sensitive tables after policy approval.

### Recommended Follow-up

- Run a separate `Module 01 Low-key Production Activation + Smoke v0` production ops task if the human approves activation.

## Deviations From Handoff

- None. No production deployment, migrations, env changes, code changes, ads, payment, or email work were performed.

## Git Commit

- Pending.

## Staging Push

- Pending.

## Remaining Uncertainties

- Whether the human accepts prior real staging LIFF and short-code smoke records as sufficient for the production activation decision.
- Whether an operator wants one more manual staging real-device confirmation immediately before production activation.

## Recommended Next Step

Ask for explicit human approval to run a separate low-key production activation and smoke task, or pause if the operator wants one more real staging LIFF/short-code check first.
