# Module 01 Low-key Production Monitoring v0 Review Bundle

Date: 2026-05-27

## 1. Summary

Production is now refreshed to candidate `4c2487a` and deployment `dpl_Ffzzri9CYMk6PMEmw4c8BGRXQqJh`. Route/API smoke passed in the previous refresh record. Production short-code smoke is now recorded as passed after correcting a production/staging LINE secret/token mismatch.

The latest production metrics rerun confirms the new completed paid-content view tracker is active in production: `unlocked_result_view` is now 1. Final production LIFF operator smoke is now recorded as passed.

Low-key production remains active for monitoring only. Ads, broad traffic, payment, email delivery, rich menu, broadcast, portal/account system, and Module 02 remain blocked.

## 2. Production Deployment / Alias Status

- Production alias: `https://anyu.tw`
- Deployment ID: `dpl_Ffzzri9CYMk6PMEmw4c8BGRXQqJh`
- Deployment URL: `https://anyu-next-gzhj7fghe-studioanyu-1488s-projects.vercel.app`
- Deployment status: Ready
- Candidate commit: `4c2487a`

## 3. Production Operator Smoke Status

Production short-code:

- Status: pass
- Bot replied: yes
- Link opened: yes
- Paid content completed/rendered: yes
- Root cause category for earlier no-reply: `line_secret_env_mismatch`

Production LIFF:

- Status: pass
- Paid content completed/rendered: yes
- Theme carried through: yes
- 404: no
- Homepage drop: no
- Processing stuck/error: no

## 4. LINE Secret / Token Ops Note

Silent production OA no-reply can happen when production LINE channel secret or access token values are accidentally mixed with staging/test values.

Recommended check order for future no-reply incidents:

- Confirm production LINE Developers webhook URL is `https://anyu.tw/api/line/webhook`.
- Confirm webhook is enabled and verification passes.
- Confirm production OA is linked to the same production Messaging API channel.
- Confirm production Vercel LINE channel secret and access token values match the production Messaging API channel.
- Do not paste or record secret/token values.

## 5. Metrics Report Status

Aggregate production metrics were collected from the confirmed Neon `anyu-next` production branch using aggregate-only queries.

Report:

- `ai-collaboration/reports/metrics/2026-05-27-module-01-funnel-production-low-key-v0.md`

Operator events were excluded by default.

## 6. Funnel Health Summary

Latest last-24-hour aggregate counts:

- Included events: 75, increased from 61
- Excluded operator events: 0
- landing_view: 3
- analyze_clicked: 1
- analyze_completed: 5
- result_view: 4
- unlock_clicked: 9
- liff_bind_success: 4
- short_code_success: 1
- paid_generation_requested: 5
- paid_generation_completed: 5
- unlocked_result_view: 1

Health interpretation:

- Paid generation completed 5/5 in this small aggregate window.
- Completed paid-content view tracker is working in production.
- Recorded fulfillment failures: 0.
- Report remains WARN because traffic is still smoke-heavy / non-sessionized and downstream counts exceed upstream counts.
- Do not draw conversion conclusions yet.

## 7. Theme / Provider Split

Theme split:

- `classic:ab_assigned`: 3 landing, 1 analyze click, 1 result view
- `riso:manual_override`: 3 result views, 8 unlock clicks
- `classic:manual_override`: 1 unlock click
- `unknown:unknown`: 5 analyze completions, 4 paid generation completions
- Theme switch clicked: 1

Provider split:

- Provider/fallback source counts were not expanded in this sanitized rerun note.

## 8. Event / Privacy Verification

The monitoring artifacts record only safe aggregate counts, pass/fail statuses, deployment IDs, route names, and safe categories.

No raw input, redacted input text, full result JSON, paid result JSON, provider output, LINE user ID, LINE display name, ID token, LINE message text, fulfillment code, short code, unlock token, tokenized URL, email, database URL, provider key, LINE secret/token, retention secret, cache secret, or operator secret was recorded.

## 9. Issues Found

- Production mobile LIFF operator smoke passed.
- Traffic is too low for conversion conclusions.
- Funnel counts remain smoke-heavy / non-sessionized, with downstream counts exceeding upstream counts.

## 10. Monitoring Recommendation

Continue low-key production monitoring. Treat current metrics as health checks only until organic traffic volume increases.

## 11. Ads / Broader Traffic Status

- Low-key production: active / monitor
- Ads: blocked
- Broader traffic: blocked
- Payment: blocked

## 12. Recommended Next Step

Keep ads and broader traffic blocked, then run another aggregate metrics check after the next production monitoring window.
