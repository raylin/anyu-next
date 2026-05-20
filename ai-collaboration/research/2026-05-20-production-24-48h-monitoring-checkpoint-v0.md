# Production 24–48h Monitoring Checkpoint v0

Date: 2026-05-20

## 1. Summary

Production remains healthy in the first low-key monitoring window.

The public routes are live, redirects and legal pages are healthy, event and funnel activity are low but coherent, no provider/runtime failures were observed, privacy checks stayed clean, and no retention-expired production rows were found in the monitored window.

No production fix was needed.

## 2. Monitoring Window

Monitoring window used for this checkpoint:

- start: `2026-05-20 00:00:00 +08`
- end: `2026-05-21 00:32:05 +08`

Context:

- this is the first low-key launch window after the final production decision
- traffic volume is still very small, so conclusions are directional rather than statistically strong

## 3. Production Route Health

Route health result: `healthy`

Verified:

- `https://anyu.tw` returned `200`
- `https://anyu.tw/m/ambiguous-temperature` returned `200`
- `https://anyu.tw/m/ambiguous-temperature/result/demo` returned `200`
- `https://anyu.tw/privacy` returned `200`
- `https://anyu.tw/terms` returned `200`
- `https://anyu.tw/disclaimer` returned `200`
- `https://www.anyu.tw` returned `308` to `https://anyu.tw/`

LINE / contact surface verification:

- production result surface still renders `加入 LINE`
- Email fallback copy remains present in current app code and production result surface behavior

## 4. Funnel Metrics

Aggregate event counts in the monitoring window:

- `page_view`: `2`
- `input_started`: `1`
- `analysis_started`: `1`
- `analysis_completed`: `2`
- `analysis_failed`: `0`
- `paid_unlock_clicked`: `2`
- `line_add_clicked`: `1`
- `email_fallback_opened`: `0`
- `contact_submitted`: `1`
- `error_seen`: `0`
- `share_card_clicked`: `0`

Additional aggregate counts:

- `analysis_results` created: `2`
- `analysis_requests` created: `2`

Interpretation:

- very low traffic as expected for a low-key launch
- no visible broken funnel stage in the limited observed activity

## 5. Analyze Latency / Error Metrics

Latency sample count: `2`

Aggregate latency:

- median total analyze latency: `30,458 ms`
- p95 total analyze latency: `33,209 ms`
- median provider latency: `27,454 ms`
- p95 provider latency: `30,198 ms`
- median schema-validation latency: `0 ms`
- median analysis-request write latency: `458 ms`
- median analysis-result write latency: `684 ms`

Error summary:

- `analysis_failed`: `0`
- provider / runtime failure count in monitored events: `0`
- schema-validation failure count visible in monitored events: `0`

Interpretation:

- latency remains provider-dominant
- no error pattern is visible in the monitored window

## 6. LINE / Email Funnel Metrics

Observed funnel activity:

- `paid_unlock_clicked`: `2`
- `line_add_clicked`: `1`
- `email_fallback_opened`: `0`
- `contact_submitted`: `1`

Contact submission breakdown:

- Email contact submissions: `1`
- LINE contact submissions: `0`

Interpretation:

- the LINE-first path is being surfaced and at least one click was recorded
- the only persisted contact submission in this window was Email
- no evidence of a broken contact path was found

## 7. Cost / Abuse Guard Review

Observed usage:

- daily analysis count in window: `2`
- peak hourly completed analyses: `2`
- max analysis requests per anonymous session: `1`
- sessions above daily limit `3`: `0`
- hard-limit-sized requests `>= 4000 chars`: `0`
- soft-long requests `2000–3999 chars`: `0`

What is directly visible:

- no sign of unexpected traffic spikes
- no sign of session-cap pressure
- no evidence of malformed oversized requests in stored production requests

What is not directly visible from current data shape:

- distributed IP-level throttling behavior
- repeated requests from the same IP hash
- exact provider billable token totals

Operational cost view:

- rough provider-call count remains extremely low in this window
- do not start ads or broader traffic yet

## 8. Event / Privacy Verification

Privacy verification result: `passed`

Checked production event metadata for unsafe leakage of:

- raw user input
- email value
- LINE ID
- full normalized result JSON
- provider raw output
- `DATABASE_URL`
- `ANTHROPIC_API_KEY`

Results:

- raw input leaked: `no`
- email leaked: `no`
- LINE ID leaked: `no`
- full result JSON leaked: `no`
- provider raw output leaked: `no`
- `DATABASE_URL` leaked: `no`
- `ANTHROPIC_API_KEY` leaked: `no`

Allowed metadata remains present:

- aggregate timing metadata
- event names
- result / unlock linkage
- contact-method level funnel state

## 9. Retention Cleanup Review

Retention status:

- `analysis_requests` rows with `retention_expires_at` in monitored window: `2`
- `analysis_results` rows with `retention_expires_at` in monitored window: `2`
- missing `retention_expires_at` in `analysis_requests`: `0`
- missing `retention_expires_at` in `analysis_results`: `0`
- expired `analysis_requests` rows by window end: `0`
- expired `analysis_results` rows by window end: `0`

Notes:

- `unlock_intents` and `contact_submissions` do not currently carry `retention_expires_at`
- no overdue retained rows were found in this checkpoint window
- no evidence in this task that manual cleanup had already been run

Operational recommendation:

- manual cleanup is not urgently required from the observed row ages yet
- still perform manual retention review again within the accepted `24–48h` operating window

## 10. Issues Found

No critical production issue found.

Minor operational observations:

- current traffic is too low for strong statistical confidence
- safe Vercel `env run` DB probing remains less trustworthy than live runtime behavior for production diagnostics
- current event shape does not make IP-level guard review visible in aggregate without introducing more ops tooling

## 11. Fixes Applied

None.

No critical app or operational fix was required in this checkpoint.

## 12. Current Launch Status

Current launch status: `GO remains acceptable for low-key production launch`

Boundary:

- keep launch low-key
- no ads
- no broader public push
- no real payment
- no model switch

## 13. Recommendations

- keep the current low-key launch posture
- do not start ads or broader traffic yet
- monitor another short window before any traffic increase
- run manual retention review again within `24–48h`
- if traffic increases materially, implement `Scheduled Retention Cleanup v0` before broader launch scope

## 14. Recommended Next Step

`Production Retention Cleanup Review v0`
