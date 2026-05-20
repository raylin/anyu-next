# Production Launch Decision Draft v0

Date: 2026-05-20

## 1. Decision Summary

This is a draft production launch decision record for Module 01.

It is not final approval.

Current recommendation is `No-Go` until production env readiness, production DB readiness, migration confirmation, and a final human phone/browser smoke pass are all confirmed.

Latest verification update:

- the prepared app project is `anyu-next`
- the live production domain `https://anyu.tw` is currently served by a different Vercel project, `anyu`
- production launch must not proceed until project/domain/env ownership is normalized
- recommended normalization target is `anyu-next` owning `anyu.tw` and `www.anyu.tw`

Latest normalization progress:

- `anyu-next` public production env names are now complete for the approved launch candidate
- a fresh `anyu-next` production deployment is healthy
- `https://anyu.tw` now serves `anyu-next`
- `https://www.anyu.tw` also serves `anyu-next`
- `www -> apex` redirect is still pending
- `DATABASE_URL` target is still not positively confirmed

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
- `staging.anyu.tw` verified through multiple runtime and UI checks
- analyze, result, unlock, and contact funnel verified
- input validation and abuse guard verified
- legal routes verified
- legal footer links verified
- UI short notices applied and verified
- LINE-first contact UI verified
- LINE CTA mobile handoff manually verified
- desktop QR fallback accepted for v0
- LINE OA setup completed and recorded
- profile image asset generated and recorded

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

- linked app project `anyu-next` production env:
  - present by name:
    - `DATABASE_URL`
    - `ANTHROPIC_API_KEY`
    - `ANTHROPIC_MODEL=claude-sonnet-4-20250514`
    - `ORADAR_PROVIDER=anthropic`
    - `NEXT_PUBLIC_LINE_ADD_URL=https://lin.ee/S6dnbJO`
  - missing by name:
    - `MODEL_STRATEGY=sonnet_default`
    - `NEXT_PUBLIC_APP_URL=https://anyu.tw`
    - `ANALYSIS_SESSION_DAILY_LIMIT=3`
    - `ANALYSIS_IP_HOURLY_LIMIT=10`
    - `ANALYSIS_GLOBAL_DAILY_LIMIT=200`
- actual production-facing Vercel project `anyu`:
  - present by name:
    - `DATABASE_URL`
    - `ANTHROPIC_API_KEY`
  - missing by name for current launch candidate:
    - `ANTHROPIC_MODEL=claude-sonnet-4-20250514`
    - `ORADAR_PROVIDER=anthropic`
    - `MODEL_STRATEGY=sonnet_default`
    - `NEXT_PUBLIC_APP_URL=https://anyu.tw`
    - `NEXT_PUBLIC_LINE_ADD_URL=https://lin.ee/S6dnbJO`
    - `ANALYSIS_SESSION_DAILY_LIMIT=3`
    - `ANALYSIS_IP_HOURLY_LIMIT=10`
    - `ANALYSIS_GLOBAL_DAILY_LIMIT=200`

Operational note:

- `NEXT_PUBLIC_*` changes require rebuild and domain/alias freshness verification before launch.
- current production env ownership is not normalized; env readiness cannot be treated as complete until `anyu.tw` points at the intended app project and its final env set is confirmed
- public production env name coverage on `anyu-next` is now complete for the launch candidate

## 7. Database / Migration Status

Current status:

- Neon project `anyu-next` has a ready `production` branch in `aws-ap-southeast-1`
- legacy Neon project `AnYu` also exists, but its `production` branch is archived
- production DB migration must be run only after explicit approval
- do not reuse preview/dev branch for production
- production table verification is still pending
- active production `DATABASE_URL` linkage was not safely confirmed, so production DB readiness is still blocked

## 8. Legal / Trust Status

Current status:

- `/privacy`, `/terms`, `/disclaimer`, and `/legal` are implemented and verified on staging
- `hello@anyu.tw` is the public contact, deletion, and support email
- legal footer links verified
- UI short notices applied
- retention wording remains a `24 小時目標`, not a fixed public guarantee

## 9. LINE Funnel Status

Current status:

- LINE-first contact UI implemented
- `NEXT_PUBLIC_LINE_ADD_URL=https://lin.ee/S6dnbJO` verified in the staging bundle
- LINE add URL: `https://lin.ee/S6dnbJO`
- mobile same-tab add-friend handoff manually verified
- desktop QR-style behavior acceptable for v0
- LINE OA setup completed and recorded
- profile image asset generated and recorded at `docs/design-system/brand/exports/line-profile-1024.png`
- Email fallback remains secondary

Deferred:

- LINE API
- LIFF
- webhook
- rich menu
- automatic result delivery
- short-code matching
- CRM segmentation
- broadcast campaigns

Reference:

- `ai-collaboration/research/2026-05-20-anyu-line-oa-setup-record-v0.md`

## 10. Brand / Asset Status

Current status:

- ANYU Brand Mark v1.1 adopted
- brand mark exports generated
- LINE profile image asset available at `docs/design-system/brand/exports/line-profile-1024.png`
- app icons and `manifest.webmanifest` added

## 11. Abuse Guard / Cost Cap Status

Implemented status:

- minimum length `30`
- hard max `4000`
- prompt injection guard
- unrelated content guard
- input length guards implemented and staging verified
- relationship-content guard implemented and staging verified
- prompt-injection and misuse guard implemented and staging verified
- session cap
- global daily cap
- process-local IP hourly cap
- Claude API hard limit remains the final backstop

Known limitation:

- IP cap is best-practical in serverless and is not a shared distributed limiter yet

## 12. Retention Cleanup Status

Current status:

- scheduled deletion job is not implemented
- manual cleanup SOP is required for low-key launch
- broader public launch should require scheduled cleanup or a stronger operational alternative

## 13. Known Risks Accepted

If launch is eventually approved, the following risks would need explicit human acceptance:

- analyze latency around `25–30s` with Sonnet
- `line_add_clicked` is a proxy for add intent, not confirmed friend-add completion
- no real payment yet
- no LIFF or automatic LINE mapping
- manual retention cleanup burden
- IP limiter is not shared across all serverless instances
- docs/legal and app-local legal content require manual sync

## 14. Rollback Plan

Rollback plan for production:

- use Vercel rollback to the previous healthy deployment
- disable ads or pause promotion traffic
- lower `ANALYSIS_GLOBAL_DAILY_LIMIT` if cost/rate pressure spikes
- switch or confirm `MODEL_STRATEGY=sonnet_default`
- temporarily hide paid / LINE CTA if needed while keeping the free analyzer available only if safe

Reference:

- `docs/operations/production-deployment-runbook.md`

## 15. Monitoring Plan

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

## 16. Human Approval

Human approval: pending

Approved by:

Approved date:

Approval notes:

- this draft is not approval
- production deployment must not proceed until this section is explicitly completed by a human operator

## 17. Go / No-Go

Current recommendation: `No-Go`

Production should not proceed until all of the following are confirmed:

1. Active `DATABASE_URL` is confirmed to target the `anyu-next` Neon `production` branch.
2. Final production candidate commit is selected from `origin/staging`.
3. Human browser/phone smoke on staging is accepted.
4. Manual retention cleanup SOP is accepted by the human operator.
5. `www.anyu.tw` redirect policy is decided and implemented.
6. Production domain / DNS readiness is verified after the final project/domain mapping is in place.

Current normalization recommendation:

- choose `Option A`
- make `anyu-next` the production Vercel project
- move `anyu.tw` and `www.anyu.tw` to `anyu-next` only after explicit human approval

Current normalization status:

- `anyu.tw` now serves `anyu-next`
- `www.anyu.tw` now serves `anyu-next`
- public production env names are complete on `anyu-next`
- launch remains `No-Go` until DB target confirmation, `www` redirect completion, and final launch approvals
