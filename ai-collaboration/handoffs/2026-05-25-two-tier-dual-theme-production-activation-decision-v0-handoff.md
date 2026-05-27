# Handoff: Two-tier + Dual Theme Production Activation Decision v0

Date: 2026-05-25

Project: anyu-next / 暗語 ANYU

## Objective

Create a production activation decision record for Module 01 after the recent two-tier fulfillment, LINE/LIFF, dual-theme A/B, input quality, pending paid UX, and staging QA work.

This task should decide whether Module 01 is ready for low-key production activation and define the exact production rollout gates, smoke plan, accepted risks, rollback conditions, and post-activation monitoring requirements.

This is a decision / planning task.

Do not deploy production.

Do not apply migrations.

Do not change code unless a tiny documentation-only correction is required.

Do not start ads.

Do not implement payment/email.

## Background

Module 01 has recently completed:

```text
- free-only analyze
- deferred paid generation service
- provider paid generation reliability fix
- LINE bind trigger + short-code delivery
- global LIFF bridge
- LIFF URL path duplication fix
- real mobile staging LIFF smoke pass
- real staging/test OA short-code smoke pass
- dual Theme A/B implementation
- Theme B visual fidelity fixes
- theme carryover through LIFF/short-code/unlocked route
- input quality threshold and richer placeholder
- pending paid-result polling UX
- likelihood labels localized to Chinese
- paid prompt guidance against unnecessary English mixing
- analyze submit transition flicker fix
- pre-production staging QA
```

Latest staging QA:

```text
Module 01 Pre-production Staging QA v0
Commit: 3b39342
Result: No P0/P1 issues found.
Recommendation: conditional GO for production activation decision, pending human acceptance of prior manual LIFF/OA smokes.
```

Important manual smoke records:

```text
- Real mobile staging LIFF path: passed.
- Real staging/test OA short-code path: passed.
```

Known caveat:

```text
LINE webhook post-response generation uses Next after, not durable queue.
This is acceptable only for low-volume beta if explicitly accepted.
It is not ads/broader-traffic ready.
```

## Scope

Do:

1. Review all latest reports relevant to production readiness.
2. Create a decision record with GO / NO-GO recommendation.
3. Define production rollout gates.
4. Define production smoke checklist.
5. Define accepted risks.
6. Define no-go conditions.
7. Define rollback plan.
8. Define post-activation monitoring checklist.
9. Define ads/broader-traffic blockers.
10. Update summary log.
11. Commit and push to `origin/staging`.

Do not:

- deploy production
- run production smoke
- apply DB migrations
- modify production LINE Console
- start ads
- implement durable queue
- implement payment/email
- change code behavior
- change prompt/schema/cache/DB
- change LINE fulfillment code
- commit secrets/raw runtime values

## Source Reports To Review

Read latest relevant reports:

```text
ai-collaboration/reports/2026-05-25-module-01-pre-production-staging-qa-v0-execution-report.md
ai-collaboration/reports/2026-05-25-two-tier-phase-3-staging-manual-smoke-v0-execution-report.md
ai-collaboration/reports/2026-05-25-record-short-code-staging-smoke-v0 or related recorded short-code report if present
ai-collaboration/reports/2026-05-25-module-01-input-quality-pending-paid-ux-polish-v0-execution-report.md
ai-collaboration/reports/2026-05-25-analyze-submit-transition-flicker-fix-v0-execution-report.md
ai-collaboration/reports/2026-05-25-module-01-dual-theme-fidelity-theme-carryover-v0-execution-report.md
ai-collaboration/reports/2026-05-25-module-01-share-card-theme-switch-fix-v0-execution-report.md
ai-collaboration/reports/2026-05-25-global-liff-fulfillment-bridge-v0-execution-report.md
ai-collaboration/reports/2026-05-25-liff-url-path-duplication-404-fix-v0-execution-report.md
ai-collaboration/reports/2026-05-25-paid-generation-provider-reliability-follow-up-v0-execution-report.md
ai-collaboration/reports/2026-05-25-two-tier-phase-1-production-migration-smoke-v0-execution-report.md
ai-collaboration/reports/2026-05-25-analysis-paid-results-retention-cleanup-v0-execution-report.md
```

If exact paths differ, locate corresponding latest reports.

## Decision Recommendation

Expected recommendation unless Codex finds a blocker:

```text
Low-key production activation: GO
Ads / broader traffic: NO-GO
```

Rationale:

```text
- Staging has no P0/P1 issues.
- Real LIFF and short-code staging flows passed.
- Free analyze latency improved through two-tier design.
- Pending paid UX now polls and auto-refreshes.
- Dual theme A/B is implemented and staged.
- Input quality threshold protects paid output quality.
- Retention cleanup covers analysis_paid_results.
```

But:

```text
- Next after is not durable.
- Local Playwright remains blocked in harness.
- Runtime lacks exact deployed commit marker.
- Ads/broader traffic should wait for durable background delivery and stronger monitoring.
```

## Production Activation Scope If GO

If decision is GO, production activation should be limited to:

```text
low-key beta / low-volume production traffic
no ads
no broad announcement
no payment
no email delivery
no rich menu/broadcast
```

Production activation should include:

```text
- deploy latest approved staging-tested code to production
- ensure production LIFF Console endpoint uses https://anyu.tw/line/fulfill
- verify production public LINE env / LIFF URL shape
- run synthetic production free analyze
- run production unlock intent
- run production LIFF flow with operator-owned LINE account
- run production short-code flow with operator-owned LINE account
- verify paid generation completes and unlocked paid content renders
- verify Theme A/B and theme carryover
- verify pending paid polling
- verify no sensitive data recorded
```

## Production No-go Conditions

Decision record must list no-go conditions:

```text
- Any P0 staging issue unresolved.
- Production LIFF endpoint cannot be updated to /line/fulfill.
- Production free analyze fails or times out.
- Production paid generation fails or only fallback works repeatedly.
- Production LIFF bind fails.
- Production short-code bot reply fails.
- Production unlocked route fails or shows broken paid content.
- Theme carryover breaks paid/unlocked flow.
- Event/log/report leaks sensitive values.
- Retention cleanup route is unavailable/unsafe.
```

## Accepted Risks For Low-key Beta

If GO, accepted risks should be explicit:

```text
1. Next after is not durable queue.
2. Some paid generation after short-code may theoretically fail after pending link is sent.
3. Local Playwright browser e2e is blocked; staging/manual route checks compensate.
4. Runtime does not expose exact commit/version marker.
5. Theme A/B data may be noisy at low traffic.
6. Fallback paid result exists as fail-safe but should not dominate.
```

## Ads / Broader Traffic Blockers

Ads / broader traffic must remain blocked until:

```text
- durable background delivery or polling/processor plan is implemented
- paid generation success/fallback metrics are monitored
- production post-activation monitoring passes
- production LIFF and short-code flows are stable over real usage
- safe version/commit health marker is considered or implemented
- visual QA for Theme A/B is stable
- A/B event reporting is usable
- privacy/retention dry-run operator path is documented
```

## Rollback Plan

Decision record must define rollback plan.

Suggested rollback actions:

```text
1. Revert production deployment to last known stable deployment.
2. If LINE fulfillment breaks, temporarily disable LINE full-analysis CTA or route to safe fallback.
3. If paid generation breaks, keep free result available and show temporary "完整分析整理中，稍後再試" message.
4. If Theme B breaks, force Theme A/default classic and disable manual switch/A-B assignment.
5. If LIFF bridge breaks, use short-code fallback only.
6. If short-code breaks, use LIFF-only route temporarily.
```

Also document:

```text
No destructive DB rollback expected because recent migrations are additive.
```

## Production Smoke Checklist

Prepare exact checklist for the next production activation task.

### Pre-deploy

```text
- confirm latest commit hash to deploy
- confirm production DB has required migrations 0001–0005
- confirm production LINE env configured
- confirm production LIFF endpoint in LINE Console is https://anyu.tw/line/fulfill
- confirm production webhook URL is https://anyu.tw/api/line/webhook
```

### Deploy

```text
- deploy/promote approved commit
- alias to https://anyu.tw
- verify route health
```

### Smoke

```text
1. Landing loads.
2. Theme A/B switch works.
3. Input under 80 chars disables CTA.
4. Rich synthetic input enables CTA.
5. Analyze completes and transitions cleanly.
6. Result page loads.
7. Unlock intent succeeds.
8. LIFF URL shape is https://liff.line.me/{LIFF_ID}?<context>.
9. Mobile production LIFF bind succeeds.
10. Paid generation completes.
11. Unlocked route renders paid content.
12. Theme carries through.
13. Short-code sent to production OA gets reply.
14. Link opens and paid content renders.
15. high/medium/low not visible.
16. No obvious mixed English in synthetic paid result.
17. No sensitive values in reports/events.
```

## Post-activation Monitoring

Define 24h or low-traffic window monitoring:

```text
- analyze started/completed/failed
- analyze latency
- paid generation requested/completed/failed
- provider vs fallback source
- pending paid stuck counts
- LIFF bind success/failure
- short-code webhook success/failure
- unlocked result views
- themeVariant/themeSource distribution
- error categories
- retention overdue counts
```

Do not require ads.

## Required Decision Record

Create:

```text
ai-collaboration/research/2026-05-25-two-tier-dual-theme-production-activation-decision-v0.md
```

Required sections:

```markdown
# Two-tier + Dual Theme Production Activation Decision v0

Date: 2026-05-25

## 1. Summary

## 2. Decision

## 3. Evidence Reviewed

## 4. Production Activation Scope

## 5. GO Rationale

## 6. Accepted Risks

## 7. No-go Conditions

## 8. Production Smoke Checklist

## 9. Rollback Plan

## 10. Post-activation Monitoring

## 11. Ads / Broader Traffic Blockers

## 12. Remaining Technical Debt

## 13. Recommendation

## 14. Next Task
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-25-two-tier-dual-theme-production-activation-decision-v0-execution-report.md
```

Report structure:

```markdown
# Two-tier + Dual Theme Production Activation Decision v0 Execution Report

## Summary

## Files Created

## Files Updated

## Decision

## Evidence Reviewed

## Risk Assessment

## Production Gate

## Rollback / Monitoring Plan

## Validation Results

## Known Technical Debt

## Tech Debt Review

### New Technical Debt Introduced

### Existing Technical Debt Observed

### Opportunistic Cleanup Completed

### Deferred Cleanup Candidates

### Recommended Follow-up

## Deviations From Handoff

## Git Commit

## Staging Push

## Remaining Uncertainties

## Recommended Next Step
```

## Summary Log

Append to:

```text
ai-collaboration/summaries/summary_log.md
```

Include:

```text
date
task completed
decision
production activation scope
ads/broader-traffic status
validation result
commit hash
staging push status
```

## Validation

Docs-only task. Run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint
cd apps/web && corepack pnpm test
cd apps/web && corepack pnpm build
```

No Playwright required unless code changes, which should not happen.

## Constraints

Do not implement:

```text
production deployment
production migration
payment provider integration
ads launch
real payment
email delivery
rich menu
broadcast
portal/account system
durable queue
model switch
SSE/websocket/token streaming
Module 02
```

Do not modify:

```text
app code
free analyze behavior
paid generation behavior
LINE webhook semantics
LIFF bind semantics
prompt/schema/cache/DB
legal semantics
production behavior
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
ANTHROPIC_API_KEY
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
LINE_LOGIN_CHANNEL_SECRET
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
real contact values
raw private user content
font files
screenshots / test artifacts / videos / traces unless explicitly intended and safe
raw sourced JSONL
private batch generated outputs
codes/tokens/tokenized URLs/LINE user IDs
full raw provider output
paid_result_json dumps
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "docs: decide module production activation"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
decision
production activation scope
accepted risks
no-go conditions
production smoke checklist summary
rollback plan
ads/broader-traffic blockers
validation results
decision record path
commit hash
staging push status
Tech Debt / Cleanup Notes
exact next step
```

Then stop.
