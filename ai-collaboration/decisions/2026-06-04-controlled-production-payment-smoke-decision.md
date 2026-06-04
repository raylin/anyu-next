# Production Launch Decision Record

Date: 2026-06-04

Project: ANYU / anyu-next

## 1. Launch Candidate

- commit: `48028426da61509e1e2fbcbffddf458f6e920b86`
- branch: `staging` source promoted/deployed for controlled smoke
- staging URL: `https://staging.anyu.tw`
- intended production domain: `https://anyu.tw`

## 2. Approval Status

- human approval: confirmed in chat
- approved by: owner/operator
- approval time: 2026-06-04 during Controlled Production Payment Smoke v0
- approved scope: one controlled production credit-card one-time payment smoke only; no ads, no broad traffic, no Growth / Ads Launch

## 3. Environment Readiness

- production env configured: payment, access-link crypto, Email provider, and LINE provider env names present
- `NEXT_PUBLIC_*` values verified: presence-only; values not printed
- production alias/domain readiness: `https://anyu.tw` health checked before runtime enablement

## 4. Database Readiness

- production Neon branch confirmed: `anyu-next` default/primary `production` branch
- migration reviewed: clean access-link schema already applied
- migration run: no migration in this decision
- table verification complete: `payment_access_link_contacts`, `paid_result_access_links`, and `payment_access_link_contact_secrets` present; old recovery tables absent; row counts zero before smoke

## 5. QA Summary

- staging QA status: unified ReturnURL commit deployed to Preview(staging)
- production smoke plan ready: credit-card one-time payment only, owner card, sanitized verification
- browser / mobile QA complete: to be completed during the smoke

## 6. Legal / Trust Readiness

- privacy route verified: public legal/trust pages preflight includes `/legal`; `/privacy` remains public route in app
- terms route verified: `/terms` exists in app; smoke preflight focuses `/`, `/refund`, `/legal`
- disclaimer route verified: `/disclaimer` exists in app
- LINE copy aligned with reality: LINE sends access link only, not report body

## 7. LINE / Contact Readiness

- LINE CTA verified: staging-proven
- Email fallback verified: staging-proven
- OA settings minimum complete: production LINE env names present; provider dashboard/OA behavior to be verified by smoke only if LINE save is used

## 8. Abuse Guard / Cost Controls

- session cap: existing production analysis limits remain in place
- IP cap: existing production analysis limits remain in place
- global cap: existing production analysis limits remain in place
- approved model strategy: existing production model strategy unchanged

## 9. Known Risks Accepted

- risk 1: first real production payment may expose provider dashboard or card-method issues not observable in staging.
- risk 2: production deploy may move `anyu.tw` from old main commit to the smoke candidate; rollback plan required.
- risk 3: Email/LINE provider acceptance does not guarantee inbox/LINE delivery; owner must verify receipt manually.

## 10. Rollback Plan

- last known-good deployment or commit: pre-smoke production health reported commit `1990fc034d745e7aaafdd34bb8221b494220d909`
- rollback owner: operator
- rollback method: disable `ENABLE_PAYMENT_RUNTIME` and `ENABLE_NEWEBPAY_CHECKOUT`, redeploy Production, and if needed redeploy/re-alias last known-good Vercel deployment

## 11. Decision

- deploy now / hold: deploy for controlled smoke only
- reason: production payment capability gate is ready, dashboard checklist is owner-confirmed, and unified ReturnURL is needed before first payment
- required follow-up: disable runtime again after smoke by default unless owner explicitly chooses soft public availability
