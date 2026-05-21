# Production Low-Key Monitoring Follow-up v1

Date: 2026-05-21

## 1. Summary

Production low-key monitoring remains healthy after the recent infrastructure upgrades:

- result cache / idempotent analyze
- scheduled retention cleanup route
- analyze request state / poll endpoint
- production app refresh to request-state code

No production feature, code, schema, env, UI, prompt, model, LINE, legal, auth, payment, portal, or launch-posture changes were made.

Overall status: `GO / monitor`.

## 2. Monitoring Window

Window used:

```text
2026-05-21 06:22:40 UTC to 2026-05-21 06:35:13 UTC
```

Reason:

- start time is the production app refresh deployment time for `dpl_BMJ4b7TrYnJa6Ze68r34kso2WHFc`
- end time is the monitoring run timestamp

## 3. Production Route Health

Checked routes:

- `https://anyu.tw`: 200
- `https://anyu.tw/m/ambiguous-temperature`: 200
- `https://anyu.tw/m/ambiguous-temperature/result/demo`: 200
- `https://anyu.tw/privacy`: 200
- `https://anyu.tw/terms`: 200
- `https://anyu.tw/disclaimer`: 200
- `https://anyu.tw/legal`: 200
- `https://www.anyu.tw`: 308 redirect to `https://anyu.tw/`

Production deployment:

- deployment ID: `dpl_BMJ4b7TrYnJa6Ze68r34kso2WHFc`
- deployment status: ready
- production alias: `https://anyu.tw`

## 4. Analyze / Request-State Metrics

Aggregate metrics in monitoring window:

- `analysis_requests`: 1
- `analysis_results`: 1
- completed requests: 1
- failed requests: 0
- expired requests: 0
- processing/stuck requests: 0
- request status distribution: `completed = 1`
- median request-state latency: 29,530 ms
- p95 request-state latency: 29,530 ms
- provider timing event count: 1
- provider latency median: 27,245 ms
- provider latency p95: 27,245 ms
- schema validation failure count: 0
- provider/request error count: 0
- fallback used count: 0
- retry count sum: 0

Note:

- total latency from event metadata includes both fresh and cache-hit completion events, so request-state latency is the clearer fresh-provider metric in this narrow window.

## 5. Cache Metrics

Aggregate cache metrics in monitoring window:

- `analysis_completed` events: 2
- cache hit true: 1
- cache hit false: 1
- cache hit ratio: 50%
- analysis failed events: 0

Interpretation:

- the production smoke created one fresh provider result and one same-input cache hit
- same-input retry returned the same result ID during the smoke
- no duplicate request row was observed for the cached repeat during safe inspection
- no cache-disabled or missing-secret indicator was observed from behavior

## 6. Retention Cleanup Status

Route status:

- `/api/cron/retention-cleanup?dryRun=1` exists
- unauthorized dry-run request returned 401 JSON, as expected

Direct aggregate DB status:

- overdue `analysis_requests`: 0
- active unexpired `analysis_requests`: 5
- overdue `analysis_results`: 0
- active unexpired `analysis_results`: 5

Authorized dry-run:

- not completed from this shell
- Vercel production env pull did not provide a usable cleanup secret locally
- temporary env files created for the attempt were removed

Interpretation:

- current retention state is acceptable based on direct DB overdue counts
- no manual destructive cleanup is recommended

## 7. Funnel Metrics

Aggregate event counts in monitoring window:

- `paid_unlock_clicked`: 5
- `email_fallback_opened`: 2
- `contact_submitted`: 2
- `share_card_clicked`: 0
- `line_add_clicked`: 0

Other funnel aggregates:

- unlock intents in window: 5
- contact submissions in window: 2

Production browser-level smoke from the refreshed deployment confirmed:

- LINE-first panel appears
- LINE CTA target remains `https://lin.ee/S6dnbJO`
- Email fallback submits with synthetic-only email
- legal footer remains visible

Interpretation:

- funnel path is operational
- `line_add_clicked` is 0 in this window because the monitoring smoke verified the LINE target without navigating away to LINE

## 8. Event / Privacy Verification

Aggregate metadata scan in monitoring window:

- event count scanned: 17
- raw synthetic input fragments in event metadata: no
- known synthetic contact values in event metadata: no
- any email-like marker in event metadata: no
- provider raw marker in event metadata: no
- secret name markers in event metadata: no

Result:

- privacy metadata boundary remains acceptable

## 9. Abuse / Cost Guard Review

Aggregate indicators:

- analyze requests today UTC: 3
- analyze requests in last hour: 1
- requests in monitoring window: 1
- analysis failed events in window: 0
- request error code count in window: 0
- request error category count in window: 0
- provider fresh-call count implied by cache behavior: 1
- estimated provider calls avoided by cache in window: 1

Interpretation:

- no abuse/cost spike observed
- no indication that session/IP/global caps are under pressure in this narrow window

## 10. Issues Found

No launch-blocking issue found.

Minor operational limitation:

- authorized retention dry-run could not be executed from this shell because the local Vercel env export did not provide a usable cleanup secret

## 11. Fixes Applied

None.

No code, schema, env, deployment, UI, prompt, model, LINE, legal, auth, payment, or launch-posture changes were made.

## 12. Current Launch Status

Current status:

```text
GO / monitor
```

Reason:

- production routes are healthy
- request-state and cache behavior are healthy
- no failed/stuck/expired requests observed in the monitoring window
- retention overdue counts are zero
- funnel path remains operational
- event metadata privacy checks passed

## 13. Recommendations

- Continue low-key production monitoring without changing launch posture.
- Recheck retention after the next scheduled cron window, or run an authorized dry-run from an operator shell that has the cleanup secret available.
- Consider adding a narrow app version/commit health marker in a future ops-hardening task if production freshness checks continue to require Vercel CLI inspection.
- Keep provider latency under observation; current latency is acceptable for the known synchronous v0 but still the main perceived-wait risk.

## 14. Recommended Next Step

Run the next routine production monitoring checkpoint after the next cron cycle or after meaningful organic traffic arrives, whichever comes first.
