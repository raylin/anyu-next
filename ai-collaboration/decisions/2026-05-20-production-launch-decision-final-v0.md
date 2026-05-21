# Production Launch Decision Final v0

Date: 2026-05-20

## 1. Decision Summary

Decision: `GO` for low-key production launch of Module 01.

This is not an ads launch, not a paid launch, and not a broad public campaign.

The decision is based on:

- completed technical production migration and smoke
- completed human production browser / phone smoke acceptance
- accepted low-key manual retention operations for the first launch window

## 2. Approved Production Scope

Approved v0 production scope:

- Module 01: 曖昧溫度計
- Free analysis
- Fake-door `NT$49` paid intent
- LINE-first opening notification
- Email fallback
- Legal pages
- Abuse guards
- No real payment
- No auth
- No portal
- No LINE API automation
- No LIFF
- No ads yet

## 3. Approved Production Commit

Technical production smoke passed after commit `d8aa8ab`.

Approved production app state:

- current `anyu-next` production deployment already serving the smoke-passed app state on `https://anyu.tw`

Decision record note:

- this file records the final launch decision
- it does not imply a new production deployment was made in this task

## 4. Technical Smoke Status

Status: `Passed`

Recorded technical production status:

- Production DB migration complete
- Required runtime tables present
- Production smoke passed for analyze, result load, unlock, Email fallback, legal routes, and redirect
- Event / privacy verification passed

## 5. Human Browser / Phone Smoke Status

Status: `Passed`

Human confirmation recorded from chat:

```text
測起來跟 staging 一樣, 沒什麼問題
```

Interpretation used for this decision:

- user manually tested production
- production behaved like staging
- no obvious issue was found

## 6. Model Strategy

Approved production default:

```text
MODEL_STRATEGY=sonnet_default
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

Explicit non-default note:

- guarded Haiku support exists but is not approved as the production default

## 7. Database / Migration Status

Current production DB status:

- Production migration complete
- Required runtime tables present
- Production DB is being used successfully for production smoke

No secrets are recorded in this decision file.

## 8. Legal / Trust Status

Current verified status:

- `/privacy`, `/terms`, `/disclaimer`, and `/legal` are implemented and verified
- `hello@anyu.tw` is the public contact / deletion / support email

## 9. LINE Funnel Status

Current approved status:

- LINE-first notification flow implemented
- LINE add URL: `https://lin.ee/S6dnbJO`
- Mobile LINE handoff manually verified
- Desktop QR fallback accepted
- No immediate complete-analysis delivery is promised
- LINE API / LIFF / webhook remain deferred

## 10. Abuse Guard / Cost Cap Status

Current approved safeguards:

- `30`-char minimum
- `4000`-char hard max
- relationship-content guard
- prompt-injection / misuse guard
- session / global caps
- process-local IP hourly cap
- Claude API hard limit remains the final backstop

## 11. Retention Cleanup SOP

Accepted operating policy for the first low-key launch:

- manual retention cleanup every `24–48h` is accepted
- before paid ads or broader public traffic, scheduled cleanup should be implemented or explicitly re-approved
- scheduled cleanup is now implemented for:
  - `analysis_requests`
  - `analysis_results`
- non-target tables still requiring separate policy before automation:
  - `events`
  - `unlock_intents`
  - `contact_submissions`
  - `sessions`

Privacy wording note:

- public privacy wording remains a `24-hour goal`, not a hard automated promise

## 12. Known Risks Accepted

Accepted launch risks:

- analyze latency around `25–30s` with Sonnet
- no real payment yet
- LINE add click is a proxy, not confirmed friend-add completion
- no LIFF / automatic LINE mapping
- manual retention cleanup for low-key launch
- process-local IP limiter is not a distributed limiter
- docs/legal and app legal content require manual sync
- `www` redirect is implemented at the app layer and can move to platform config later
- safe Vercel `env run` probe inconsistency for `DATABASE_URL` remains known, but production migration / smoke passed

## 13. Launch Constraints

Launch constraints for this approval:

- No ads yet
- No paid campaign yet
- No mass LINE broadcast
- No real payment
- No model switch
- No broad public announcement without another decision
- Monitor first `24–48h`

## 14. Rollback Plan

Rollback plan:

- Vercel rollback to previous deployment
- disable / hide paid / LINE CTA if needed
- lower `ANALYSIS_GLOBAL_DAILY_LIMIT`
- disable ads if any accidentally started
- keep `MODEL_STRATEGY=sonnet_default`

## 15. Monitoring Plan

Monitor:

- `analysis_started`
- `analysis_completed`
- `analysis_failed`
- `paid_unlock_clicked`
- `line_add_clicked`
- `email_fallback_opened`
- `contact_submitted`
- `error_seen`
- provider error rate
- schema validation failures
- median latency
- daily analysis count
- API spend
- LINE CTA clicks

## 16. Human Approval

Human approval: approved by user in chat

Approval wording:

```text
ok
```

Supporting human smoke acceptance:

```text
測起來跟 staging 一樣, 沒什麼問題
```

Approval date: `2026-05-20`

## 17. Final Go / No-Go

Final decision: `GO` for low-key production launch.

Boundary of this decision:

- approved for low-key production availability only
- not approved for ads, paid campaign scale-up, real payment launch, or broader public traffic without another decision
