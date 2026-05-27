# Two-tier + Dual Theme Production Activation Decision v0

Date: 2026-05-25

Executed: 2026-05-27

## 1. Summary

Module 01 is ready for a low-key, low-volume production activation decision under strict rollout gates. Staging QA found no P0/P1 issues, real staging LIFF and short-code flows were previously recorded as passed, production schema for the two-tier paid-result seam is already applied, and retention cleanup now covers `analysis_paid_results`.

This is not approval for ads, broad announcement, payment launch, email delivery, rich menu, or broad traffic.

## 2. Decision

- Low-key production activation: GO.
- Ads / broader traffic: NO-GO.
- Production deployment: not performed in this task.
- Production migrations: not performed in this task.

The GO applies only to a controlled beta-style activation with operator-led production smoke before leaving the feature exposed to real users.

## 3. Evidence Reviewed

- `ai-collaboration/reports/2026-05-25-module-01-pre-production-staging-qa-v0-execution-report.md`
- `ai-collaboration/reports/2026-05-25-two-tier-phase-3-staging-manual-smoke-v0-execution-report.md`
- `ai-collaboration/reports/2026-05-25-module-01-input-quality-pending-paid-ux-polish-v0-execution-report.md`
- `ai-collaboration/reports/2026-05-25-analyze-submit-transition-flicker-fix-v0-execution-report.md`
- `ai-collaboration/reports/2026-05-25-module-01-dual-theme-fidelity-theme-carryover-v0-execution-report.md`
- `ai-collaboration/reports/2026-05-25-module-01-share-card-theme-switch-fix-v0-execution-report.md`
- `ai-collaboration/reports/2026-05-25-global-liff-fulfillment-bridge-v0-execution-report.md`
- `ai-collaboration/reports/2026-05-25-liff-url-path-duplication-404-fix-v0-execution-report.md`
- `ai-collaboration/reports/2026-05-25-paid-generation-provider-reliability-follow-up-v0-execution-report.md`
- `ai-collaboration/reports/2026-05-25-two-tier-phase-1-production-migration-smoke-v0-execution-report.md`
- `ai-collaboration/reports/2026-05-25-analysis-paid-results-retention-cleanup-v0-execution-report.md`
- `ai-collaboration/reports/2026-05-25-two-tier-phase-3-line-bind-trigger-delivery-v0-execution-report.md`

Key evidence:

- Pre-production staging QA found no P0/P1 issues.
- Real mobile staging LIFF flow was recorded as passed.
- Real staging/test OA short-code flow was recorded as passed.
- Staging route/API checks passed for analyze, result, unlock intent, pending paid UI, LIFF bridge, paid status, unlocked paid route, theme carryover, and privacy-safe reporting.
- Production Phase 1 migration and synthetic smoke previously passed.
- Retention cleanup includes aggregate `analysisPaidResults` coverage and in-place paid-result scrubbing.

## 4. Production Activation Scope

Allowed scope:

- Low-key beta / low-volume production traffic only.
- No ads.
- No broad announcement.
- No payment provider.
- No real payment collection.
- No email delivery launch.
- No rich menu or broadcast.
- No portal/account system.

Activation must be run as a separate production task with explicit human approval.

## 5. GO Rationale

- Staging has no unresolved P0/P1 findings.
- Real staging LIFF and short-code paths have passed manual smoke.
- Free analyze now avoids paid-generation blocking through the two-tier architecture.
- Pending paid-result UX gives honest waiting state and polls safely.
- Global LIFF bridge and LIFF URL path duplication fix resolved previous mobile 404 failures.
- Theme A/B and theme carryover are implemented through fulfillment and unlocked routes.
- Input quality threshold and richer placeholder improve paid-output quality.
- Analyze submit transition no longer flickers to idle before result navigation.
- `analysis_paid_results` retention cleanup coverage exists.
- Privacy posture remains acceptable: reports and route checks record only sanitized status, route shapes, and aggregate metadata.

## 6. Accepted Risks

Accepted only for low-key beta:

1. Webhook-triggered paid generation uses Next `after`, not a durable queue.
2. Short-code users may receive a pending link before after-response paid generation completes.
3. If after-response generation fails, the unlocked page should show an honest pending/failed state, but automatic retry/push is not durable.
4. Provider paid generation can still fall back after output-validation issues; fallback is acceptable as a fail-safe but should not dominate.
5. Local Playwright browser e2e remains blocked in the current harness.
6. Runtime does not expose an exact deployed commit/version marker.
7. Theme A/B event data may be noisy at low traffic.
8. Authorized retention-cleanup route dry-run still needs an operator path with direct cleanup-secret access.

## 7. No-go Conditions

Production activation must stop or be rolled back if any of these occur:

- Any unresolved P0 staging issue appears.
- Production LIFF endpoint cannot be set to `https://anyu.tw/line/fulfill`.
- Production webhook URL cannot be set to `https://anyu.tw/api/line/webhook`.
- Production free analyze fails or repeatedly times out.
- Production paid generation repeatedly fails or only fallback works repeatedly.
- Production LIFF bind fails.
- Production short-code bot reply fails.
- Production unlocked route fails or shows broken paid content.
- Theme carryover breaks paid/unlocked flow.
- Pending paid polling gets stuck without honest user-facing state.
- Sensitive values appear in reports, events, logs, or user-visible pages.
- Retention cleanup route is unavailable or unsafe.
- Production LINE Console or public env values cannot be verified safely.

## 8. Production Smoke Checklist

Pre-deploy:

- Confirm exact approved commit to deploy.
- Confirm production DB has required migrations `0001` through `0005`.
- Confirm production LINE public env values are configured.
- Confirm production server LINE secrets are configured without printing them.
- Confirm LINE Console LIFF endpoint is `https://anyu.tw/line/fulfill`.
- Confirm LINE Console webhook URL is `https://anyu.tw/api/line/webhook`.

Deploy:

- Deploy or promote the approved commit.
- Alias to `https://anyu.tw`.
- Verify `/api/health` returns HTTP 200.
- Verify landing route returns HTTP 200.

Smoke:

1. Landing loads.
2. Theme A/B switch works before fulfillment.
3. Input under 80 visible characters disables CTA.
4. Rich synthetic input enables CTA.
5. Analyze completes.
6. Analyze transition remains loading/navigating until result page.
7. Result page loads.
8. Share and paid-preview surfaces render.
9. Unlock intent succeeds.
10. LIFF URL shape is `https://liff.line.me/{LIFF_ID}?<context>`.
11. Mobile production LIFF bind succeeds with operator-owned LINE account.
12. Paid generation completes or pending page transitions honestly.
13. Unlocked route renders paid content.
14. Theme carries through LIFF bridge and unlocked route.
15. Short-code sent to production OA gets a bot reply.
16. Short-code returned link opens.
17. Short-code route reaches unlocked paid content.
18. `high` / `medium` / `low` are not visible in paid likelihood labels.
19. Synthetic paid result has no obvious unnecessary English mixing.
20. No raw input, provider output, paid-result JSON, tokenized URLs, LINE IDs, email, DB URL, provider keys, or secrets are recorded.

## 9. Rollback Plan

1. Revert production deployment to the last known stable deployment.
2. If LINE fulfillment breaks, temporarily disable the LINE full-analysis CTA or route users to safe fallback copy.
3. If paid generation breaks, keep free result available and show a temporary complete-analysis unavailable/pending message.
4. If Theme B breaks, force Theme A/default classic and disable manual switch/A-B assignment until fixed.
5. If LIFF bridge breaks, route users to short-code fallback only.
6. If short-code breaks, use LIFF-only route temporarily.
7. If privacy leakage is suspected, remove affected route from production exposure and investigate before re-enabling.

No destructive DB rollback is expected because recent migrations are additive.

## 10. Post-activation Monitoring

Monitor for at least 24 hours or the first low-traffic beta window:

- Analyze started/completed/failed counts.
- Analyze latency.
- Analyze error categories.
- Paid generation requested/completed/failed counts.
- Provider vs fallback source.
- Fallback reason distribution.
- Pending paid stuck counts.
- LIFF bind success/failure.
- Short-code webhook success/failure.
- Unlocked result views.
- Theme variant/source distribution.
- Theme carryover failure reports.
- Retention overdue counts.
- Any privacy/sensitive-data report.

Use aggregate/sanitized reporting only.

## 11. Ads / Broader Traffic Blockers

Ads and broader traffic remain blocked until:

- Durable background delivery, polling worker, or processor plan exists for paid generation.
- Provider/fallback metrics are monitored and fallback is not dominant.
- Production post-activation monitoring passes.
- Production LIFF and short-code flows are stable over real usage.
- A safe version/commit health marker is considered or implemented.
- Theme A/B visual QA remains stable.
- A/B event reporting is usable enough for learning.
- Authorized privacy/retention dry-run operator path is documented.
- Retention policy for remaining sensitive tables is reviewed.

## 12. Remaining Technical Debt

- Next `after` is not durable background delivery.
- Provider output-validation instability can still trigger fallback.
- Local Playwright is blocked by macOS Chromium/MachPort permissions.
- Runtime lacks exact deployed commit marker.
- Authorized retention dry-run requires direct secret access that is not convenient from current local tooling.
- Real production LIFF and short-code smoke are still pending because this task did not deploy production.

## 13. Recommendation

Proceed with low-key production activation in a separate task only after explicit human approval.

Do not start ads, payment, email delivery, or broad launch yet.

## 14. Next Task

Run `Module 01 Low-key Production Activation + Smoke v0` as a separate production ops task with the smoke checklist above.
