# Staging Deployment Freshness + Build Marker Recovery v0 Handoff

## Task
Restore or document reliable staging deployment freshness observability so fake-paid/payment QA can verify that `staging.anyu.tw` is serving the expected `origin/staging` `apps/web` route bundle.

## Scope
- Deployment observability and staging freshness verification only.
- Minimal code changes allowed only if build marker support is incomplete.
- No payment runtime, NewebPay, checkout, notify, return, queue, LINE delivery, prompt/result, legal copy, or production flag changes.

## Investigation Plan
1. Inspect `/api/health` and build marker implementation.
2. Verify local route bundle contains `/api/operator/fake-paid-success`.
3. Verify local paid-access status route behavior for invalid `pa_`.
4. Compare expected route-controlled responses with current staging behavior.
5. Document owner/operator Vercel checks if alias/deployment verification is unavailable from this session.
6. Create a concrete preflight checklist for future authorized fake-paid QA.

## Deliverables
- Execution report under `ai-collaboration/reports/`.
- Summary log update.
- Commit and push to `origin/staging`.
