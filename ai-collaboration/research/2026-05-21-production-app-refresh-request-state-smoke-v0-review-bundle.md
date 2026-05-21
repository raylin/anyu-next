# Production App Refresh + Request-State Smoke v0 Review Bundle

Date: 2026-05-21

## 1. Summary

Production app refresh and request-state smoke are complete.

`https://anyu.tw` was refreshed from stale production code to a deployment that serves the Analyze Request State + Polling UX route. The narrow production smoke passed for route freshness, fresh analyze, request state completion, poll endpoint completed response, cache hit, result page, unlock intent, LINE-first panel, Email fallback, and event metadata privacy.

No source code was changed and the production DB migration was not rerun.

## 2. Production App Refresh

Production was deployed through the linked Vercel project:

- project: `anyu-next`
- target: production
- production alias: `https://anyu.tw`
- deployment status: ready

The refresh replaced the prior stale production deployment that returned the generic app 404 for the request-state poll route.

## 3. Deployed Commit / Deployment

Candidate commit:

- `9433a01`

This is newer than the required request-state implementation commit:

- `1d9700d`

Production deployment:

- deployment ID: `dpl_BMJ4b7TrYnJa6Ze68r34kso2WHFc`
- deployment URL: `https://anyu-next-n859mhgak-studioanyu-1488s-projects.vercel.app`
- inspector URL: `https://vercel.com/studioanyu-1488s-projects/anyu-next/BMJ4b7TrYnJa6Ze68r34kso2WHFc`

Vercel build output included the new route:

- `/api/modules/[moduleSlug]/analyze/requests/[requestId]`

## 4. Poll Route Freshness Check

Passed.

Before analyze, a nonexistent request ID returned a JSON application response:

- status: 404
- error: `request_not_found`
- matched path: `/api/modules/[moduleSlug]/analyze/requests/[requestId]`

This confirmed the production app was no longer serving the generic app-level 404 page for the poll route.

## 5. Fresh Analyze Verification

Passed.

Production synthetic analyze returned:

- status: `completed`
- cache hit: `false`
- request ID returned: yes
- result ID returned: yes
- result route returned: yes

Production DB request-state check:

- request state: `completed`
- result ID present: yes
- started timestamp present: yes
- completed timestamp present: yes
- failed timestamp present: no
- error code present: no

## 6. Poll Endpoint Verification

Passed.

Poll endpoint returned:

- status: `completed`
- same result ID as fresh analyze
- same result route as fresh analyze
- `retryable: false`

The poll response did not expose raw input, redacted input text, full result JSON, provider raw output, contact values, or secrets.

## 7. Cache Hit Verification

Passed.

Exact same synthetic input was submitted again and returned:

- status: `completed`
- cache hit: `true`
- same result ID as fresh analyze

Safe DB inspection confirmed the cached repeat did not create a duplicate request row for the fresh request ID.

## 8. Result / Funnel Verification

Passed.

Production result/funnel checks:

- result page returned HTTP 200
- unlock intent API succeeded
- LINE-first contact panel appeared after paid CTA click
- LINE CTA target remained `https://lin.ee/S6dnbJO`
- Email fallback opened and submitted with synthetic-only email
- legal footer link remained visible

## 9. Event / Privacy Verification

Passed.

Production event metadata aggregate checks for the synthetic session:

- event count: 5
- raw synthetic input fragments in event metadata: no
- synthetic contact value in event metadata: no
- provider raw output marker in event metadata: no
- secret name markers in event metadata: no

## 10. Documentation Updates

No documentation update was needed. The production refresh and smoke results are recorded in this review bundle, execution report, and summary log.

## 11. Known Limitations

- Request-state v0 remains synchronous on cache misses.
- The poll endpoint supports completed/failed/expired recovery and future async readiness, not true background processing.
- Production freshness was verified by route behavior and deployment inspection, not by an app-exposed commit endpoint.

## 12. Recommended Next Step

Continue normal post-refresh monitoring for production analyze success/failure rate, cache-hit behavior, and contact funnel health during the next low-key launch window.
