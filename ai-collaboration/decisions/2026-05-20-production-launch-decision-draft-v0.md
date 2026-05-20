# Production Launch Decision Draft v0

Superseded by final decision:

- `ai-collaboration/decisions/2026-05-20-production-launch-decision-final-v0.md`

Date: 2026-05-20

## 1. Decision Summary

This is a draft production launch decision record for Module 01.

It is not final approval.

Current recommendation is `No-Go` until the completed technical smoke is followed by final human launch approval, final candidate-commit selection, and retention-operations acceptance.

Latest verification update:

- `anyu.tw` serves the `anyu-next` production deployment
- `www.anyu.tw` redirects to `https://anyu.tw/`
- public production env names are complete on `anyu-next`
- the approved Neon `anyu-next` `production` branch has now been migrated
- the required runtime tables are now present on the production branch
- a tightly scoped synthetic production smoke has passed for analyze, result load, unlock, Email fallback, legal routes, and redirect
- live runtime DB access is now proven by successful production smoke even though the safe `vercel env run` probe path remains inconsistent

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

- production app project `anyu-next`:
  - present by name:
    - `DATABASE_URL`
    - `ANTHROPIC_API_KEY`
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
- public production env name coverage on `anyu-next` is now complete for the launch candidate
- `ANTHROPIC_API_KEY` appears present in the safe probe path
- safe `vercel env run` probing still does not expose a usable `DATABASE_URL` to Drizzle even though live production DB behavior is now proven by smoke

## 7. Database / Migration Status

Current status:

- Neon project `anyu-next` has a ready `production` branch in `aws-ap-southeast-1`
- legacy Neon project `AnYu` also exists, but its `production` branch is archived
- approved production migration has now been run on the `anyu-next` `production` branch
- do not reuse preview/dev branch for production
- required runtime tables now exist on the production branch
- live production analyze/result/unlock/contact flow proves deployed runtime DB access is functioning
- safe probe inconsistency around `DATABASE_URL` remains an operational debugging note, not a current smoke blocker

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

1. Final production candidate commit is selected from `origin/staging`.
2. Human browser/phone smoke acceptance is completed.
3. Manual retention cleanup SOP is explicitly accepted by the human operator, or replaced with a stronger operational alternative.
4. Final launch decision is explicitly approved by a human operator.

Current normalization status:

- `anyu.tw` now serves `anyu-next`
- `www.anyu.tw` now redirects to `https://anyu.tw/`
- public production env names are complete on `anyu-next`
- required production runtime tables now exist
- synthetic production smoke has passed
- launch remains `No-Go` only because final human launch approval gates are still pending

Provider secret readiness:

- `ANTHROPIC_API_KEY` is present by env-name and appears present in a safe production env-run probe
- actual provider-call success is now proven by the completed production smoke pass

Production smoke gate status:

- smoke was eligible and was run
- migration gate passed
- required-table gate passed
- synthetic production smoke passed
