# Vercel Staging Deployment Alias Stability Audit v0

## Summary
The audit found that local `staging` and `origin/staging` are aligned at `ab55a7c`, and the local `apps/web` production build includes the expected payment-foundation routes.

At the time of this audit, `staging.anyu.tw` had recovered and was serving the expected route bundle:

- `/api/health` includes `routeBundleVersion: payment-foundation-2026-05-29`.
- `/api/health` reports commit `ab55a7c1f4c5`, branch `staging`, environment `preview`.
- `/api/operator/fake-paid-success` returns route-controlled JSON `401 unauthorized` for missing and invalid operator secret.
- Invalid synthetic `pa_` status returns `invalid_paid_access`.

This means the immediate live regression observed in the previous QA attempt was not reproduced during this audit. The likely issue is a deployment/alias freshness gap that can regress depending on which Vercel deployment `staging.anyu.tw` is currently attached to or when redeploy/alias changes happen.

No authorized fake-paid QA was run. No secrets, raw `pa_` tokens, tokenized URLs, raw input, provider credentials, LINE IDs, or private values were recorded.

## Local / Source State
Commands run:

```bash
git fetch origin --prune
git rev-parse HEAD
git rev-parse origin/staging
git log --oneline -8 origin/staging
git status --short --branch
test -f apps/web/src/lib/runtime/build-marker.ts && echo build-marker-present
grep -R "payment-foundation-2026-05-29" -n apps/web/src || true
test -f apps/web/src/app/api/operator/fake-paid-success/route.ts && echo fake-paid-route-present
```

Findings:

- Local HEAD: `ab55a7c1f4c5bf878c72050c73fd513886fb1c20`
- `origin/staging`: `ab55a7c1f4c5bf878c72050c73fd513886fb1c20`
- Branch: `staging`
- Local branch matches `origin/staging`.
- `apps/web/src/lib/runtime/build-marker.ts`: present.
- `ROUTE_BUNDLE_VERSION`: `payment-foundation-2026-05-29`.
- `apps/web/src/app/api/operator/fake-paid-success/route.ts`: present.

Recent `origin/staging` commits:

```text
ab55a7c test: record blocked fake paid qa rerun
35bc65e fix: categorize fake paid token config
61d7297 test: add secret safe fake paid qa runner
93d739f test: record fake paid qa secret blocker
34a838c test: verify staging route bundle freshness
0877011 chore: add staging build marker preflight
a28a3eb test: record authorized fake paid staging qa
859b801 docs: add fake paid staging env runbook
```

## Local Build Route Verification
Command run:

```bash
cd apps/web && corepack pnpm build
```

Result: passed.

Relevant route output included:

```text
ƒ /api/health
ƒ /api/modules/[moduleSlug]/paid-result/status
ƒ /api/operator/fake-paid-success
```

This confirms the current source and local build contain the expected route bundle.

## Live Staging Checks
All checks were non-secret requests against `https://staging.anyu.tw`.

### `/api/health`
Result:

```json
{
  "app": "anyu-web",
  "environment": "preview",
  "gitCommit": "ab55a7c1f4c5",
  "gitBranch": "staging",
  "routeBundleVersion": "payment-foundation-2026-05-29"
}
```

HTTP status: `200`.

Relevant response headers included:

```text
server: Vercel
x-matched-path: /api/health
x-vercel-cache: MISS
```

### Fake-paid route without secret
Request: `POST /api/operator/fake-paid-success` with a harmless synthetic body and no operator secret.

Result:

```json
{
  "ok": false,
  "error": "unauthorized",
  "message": "Missing or invalid x-operator-test-secret."
}
```

HTTP status: `401`.

Relevant response headers included:

```text
server: Vercel
x-matched-path: /api/operator/fake-paid-success
x-vercel-cache: MISS
```

### Fake-paid route with invalid secret
Request: `POST /api/operator/fake-paid-success` with an obviously invalid non-secret header.

Result:

```json
{
  "ok": false,
  "error": "unauthorized",
  "message": "Missing or invalid x-operator-test-secret."
}
```

HTTP status: `401`.

### Invalid synthetic `pa_` status
Request: `POST /api/modules/ambiguous-temperature/paid-result/status` with synthetic invalid `pa_` token value.

Result:

```json
{
  "ok": true,
  "status": "expired",
  "retryable": false,
  "errorCategory": "invalid_paid_access"
}
```

HTTP status: `200`.

## DNS / Vercel Surface Check
DNS lookup for `staging.anyu.tw` resolves to Vercel-managed DNS:

```text
6f1d647033aecbff.vercel-dns-017.com.
216.198.79.65
64.29.17.65
```

This confirms the domain points to Vercel infrastructure, but DNS alone does not identify which Vercel deployment or alias target is currently active.

## Vercel CLI / Project Linkage
Local `.vercel/project.json` exists and links the repository to:

- Project name: `anyu-next`
- Project ID: `prj_2iqtdQsS9si0Fs9aU9dqchiArYuZ`
- Org/team ID: `team_dSGaEoCzzLNaVKqPFiPUj1CN`

Vercel CLI was not available in this workspace:

```text
Command "vercel" not found
```

Because CLI inspection was unavailable, this audit could not directly verify:

- which Vercel project currently owns `staging.anyu.tw`,
- which deployment the domain alias points to,
- whether the alias was manually assigned to an older deployment,
- whether a redeploy after env updates used an older commit,
- whether root directory/build settings differ between projects.

## Diagnosis
Current live staging is healthy and serving the expected route bundle at commit `ab55a7c`.

The prior regression is best classified as:

```text
unknown due to missing Vercel deployment/alias inspection access; likely deployment alias or redeploy freshness mismatch
```

The previous symptoms strongly indicate that `staging.anyu.tw` was temporarily serving an older or mismatched bundle:

- missing `/api/health` marker fields,
- generic HTML 404 for `/api/operator/fake-paid-success`,
- legacy `invalid_unlock` for invalid synthetic `pa_`.

Those symptoms are not consistent with the current local source or current live staging response.

## Owner / Operator Vercel UI Checks
Use Vercel UI to verify and stabilize the staging deployment path:

1. Open the Vercel project that owns `staging.anyu.tw`.
2. Confirm the project is `anyu-next` and not an older duplicate project.
3. In Domains, confirm `staging.anyu.tw` is assigned to the expected project.
4. Confirm the active deployment for `staging.anyu.tw` is built from branch `staging`.
5. Confirm the active deployment commit is `ab55a7c` or newer.
6. Confirm the project root directory is `apps/web` if the Vercel project expects the web app root.
7. Confirm build command/output settings match the current working deployment.
8. Confirm the redeploy after env changes used the latest `origin/staging` commit, not an older deployment.
9. Confirm `staging.anyu.tw` was not manually aliased to an older deployment.
10. After any redeploy or alias change, run the route-bundle preflight before authorized QA.

## Required Staging Freshness Gate Before Secret QA
Before owner/operator runs the secret-dependent QA runner, these non-secret checks must pass:

- `GET https://staging.anyu.tw/api/health` includes `routeBundleVersion: payment-foundation-2026-05-29`.
- Health marker `gitCommit` matches the expected `origin/staging` deployment commit.
- `POST https://staging.anyu.tw/api/operator/fake-paid-success` without secret returns route-controlled JSON `401 unauthorized`, not generic HTML 404.
- Invalid synthetic `pa_` status returns `invalid_paid_access`, not legacy `invalid_unlock`.

Only after that should the owner/operator locally run:

```bash
cd apps/web
corepack pnpm run qa:fake-paid
```

with `OPERATOR_TEST_SECRET` and `INTERNAL_JOB_SECRET` exported securely.

## Validation
- `cd apps/web && corepack pnpm build`: passed.
- Non-secret live staging route checks: passed during this audit.
- Authorized fake-paid QA: not run by design.

## Tech Debt Review
### New Technical Debt Introduced
None.

### Existing Technical Debt Observed
- Staging deployment alias/freshness is operationally fragile enough to regress after prior successful preflight.
- Vercel deployment/alias state cannot be audited from this workspace without Vercel CLI access.
- Secret-dependent QA currently combines route-bundle freshness checks with authorized business-path checks; failures can be confused unless the preflight is run first.

### Opportunistic Cleanup Completed
None; this was documentation and audit only.

### Deferred Cleanup Candidates
- Add a dedicated non-secret `qa:staging-preflight` script for route-bundle freshness only.
- Add an operator runbook section requiring route-bundle preflight after every staging env or alias change.
- Add a Vercel deployment checklist with screenshots or exact UI labels once the owner confirms the current project settings.

## Recommended Next Step
Keep `staging.anyu.tw` attached to the latest `origin/staging` deployment (`ab55a7c` or newer), then have the owner/operator run the secret-safe authorized fake-paid QA runner locally with secrets exported and paste only sanitized output for recording.
