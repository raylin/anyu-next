# Production Launch Decision Draft v0

Date: 2026-05-20

## 1. Decision Summary

This is a draft production launch decision record for Module 01.

It is not final approval.

Current recommendation is `No-Go` until production env readiness, production DB readiness, migration confirmation, and a final human phone/browser smoke pass are all confirmed.

## 2. Approved Production Commit

Pending: choose exact production commit from `origin/staging` before launch.

Current staging review baseline:

- staging branch: `origin/staging`
- staging domain: `https://staging.anyu.tw`
- production target domain: `https://anyu.tw`

## 3. Staging QA Status

Completed staging checks:

- Module 01 staging runtime verified
- ANYU Design System v1.1 adopted and verified live on staging
- analyze, result, unlock, and contact funnel verified
- input validation and abuse guard verified
- legal routes verified
- LINE-first contact UI verified
- LINE CTA mobile handoff manually verified
- legal footer and trust notices verified

Remaining recommendation:

- final human phone/browser pass before production is still recommended

## 4. Product Scope

Production v0 scope:

- Module 01: 曖昧溫度計
- Free analysis
- Fake-door paid unlock
- LINE-first opening notification
- Email fallback
- No real payment
- No auth
- No portal
- No LINE API automation
- No LIFF
- No scheduled deletion job yet

## 5. Model Strategy

Production launch candidate:

```text
MODEL_STRATEGY=sonnet_default
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

Notes:

- Guarded Haiku support exists, but it is not the launch default.
- Do not switch production to Haiku without a separate production decision.

## 6. Environment Variables

Required production env vars and current status:

- `DATABASE_URL=<Neon production pooled connection string>` — pending
- `ANTHROPIC_API_KEY` — pending
- `ANTHROPIC_MODEL=claude-sonnet-4-20250514` — pending
- `ORADAR_PROVIDER=anthropic` — pending
- `MODEL_STRATEGY=sonnet_default` — pending
- `NEXT_PUBLIC_APP_URL=https://anyu.tw` — pending
- `NEXT_PUBLIC_LINE_ADD_URL=https://lin.ee/S6dnbJO` — pending
- `ANALYSIS_SESSION_DAILY_LIMIT=3` — pending
- `ANALYSIS_IP_HOURLY_LIMIT=10` — pending
- `ANALYSIS_GLOBAL_DAILY_LIMIT=200` — pending

Operational note:

- `NEXT_PUBLIC_*` changes require rebuild and domain/alias freshness verification before launch.

## 7. Database / Migration Status

Current status:

- Neon production branch not yet verified or migrated
- production DB migration must be run only after explicit approval
- do not reuse preview/dev branch for production
- production table verification is still pending

## 8. Legal / Trust Status

Current status:

- `/privacy`, `/terms`, `/disclaimer`, and `/legal` are implemented and verified on staging
- `hello@anyu.tw` is the public contact, deletion, and support email
- retention wording remains a `24 小時目標`, not a fixed public guarantee

## 9. LINE Funnel Status

Current status:

- LINE-first contact UI implemented
- LINE add URL: `https://lin.ee/S6dnbJO`
- mobile handoff manually verified
- desktop QR-style behavior acceptable for v0
- LINE API, LIFF, and webhook automation are not implemented

Pending OA setup:

- Profile image: pending
- Background image: pending / optional
- Category: pending

## 10. Abuse Guard / Cost Cap Status

Implemented status:

- minimum length `30`
- hard max `4000`
- prompt injection guard
- unrelated content guard
- session cap
- global daily cap
- process-local IP hourly cap
- Claude API hard limit remains the final backstop

Known limitation:

- IP cap is best-practical in serverless and is not a shared distributed limiter yet

## 11. Retention Cleanup Status

Current status:

- scheduled deletion job is not implemented
- manual cleanup SOP is required for low-key launch
- broader public launch should require scheduled cleanup or a stronger operational alternative

## 12. Known Risks Accepted

If launch is eventually approved, the following risks would need explicit human acceptance:

- analyze latency around `25–30s` with Sonnet
- `line_add_clicked` is a proxy for add intent, not confirmed friend-add completion
- no real payment yet
- no LIFF or automatic LINE mapping
- manual retention cleanup burden
- IP limiter is not shared across all serverless instances
- docs/legal and app-local legal content require manual sync

## 13. Rollback Plan

Rollback plan for production:

- use Vercel rollback to the previous healthy deployment
- disable ads or pause promotion traffic
- lower `ANALYSIS_GLOBAL_DAILY_LIMIT` if cost/rate pressure spikes
- switch or confirm `MODEL_STRATEGY=sonnet_default`
- temporarily hide paid / LINE CTA if needed while keeping the free analyzer available only if safe

Reference:

- `docs/operations/production-deployment-runbook.md`

## 14. Monitoring Plan

Monitor at launch:

- `analysis_started`
- `analysis_completed`
- `analysis_failed`
- `paid_unlock_clicked`
- `line_add_clicked`
- `email_fallback_opened`
- `contact_submitted`
- `error_seen`
- daily analysis count
- provider error rate
- schema validation failures
- median latency
- API spend
- ad spend

## 15. Human Approval

Human approval: pending

Approved by:

Approved date:

Approval notes:

- this draft is not approval
- production deployment must not proceed until this section is explicitly completed by a human operator

## 16. Go / No-Go

Current recommendation: `No-Go`

Production should not proceed until all of the following are confirmed:

1. Production env vars are configured in Vercel production.
2. Neon production branch is created and migration plan is confirmed.
3. Final production candidate commit is selected from `origin/staging`.
4. Human browser/phone smoke on staging is accepted.
5. Manual retention cleanup SOP is accepted by the human operator.
6. `www.anyu.tw` redirect policy is decided.
