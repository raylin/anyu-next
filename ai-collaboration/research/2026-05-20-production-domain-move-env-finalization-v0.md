# Production Domain Move Approval + Env Finalization v0

Date: 2026-05-20

## 1. Summary

This handoff partially completed the approved production normalization.

Completed:

- `anyu-next` public production env policy was finalized for the known non-secret vars
- a fresh healthy `anyu-next` production deployment was created
- `https://anyu.tw` now serves that healthy `anyu-next` production deployment
- `https://www.anyu.tw` is also now aliased to the same `anyu-next` production deployment

Not fully completed:

- `www.anyu.tw` is not redirecting to apex yet
- `DATABASE_URL` target could not be positively confirmed from the pulled production env file
- production launch remains `No-Go`

## 2. Human Approval

Approved by handoff:

- production project for this launch: `anyu-next`
- canonical production domain: `https://anyu.tw`
- `www` policy: `https://www.anyu.tw` -> `https://anyu.tw`

## 3. Starting State

At task start:

- `staging.anyu.tw` served `anyu-next`
- `anyu.tw` served the older Vercel project `anyu`
- `anyu-next` production env was missing several required non-secret vars
- `anyu-next` had only failed production deployments
- `www.anyu.tw` did not have a clean redirect/cert posture

## 4. Vercel Project Status

Verified `anyu-next`:

- Root Directory: `apps/web`
- Framework: `Next.js`
- Build Command: `corepack pnpm build`
- Install Command: `corepack pnpm install --frozen-lockfile`

Verified old `anyu`:

- Root Directory: `.`
- older/different project shape
- no longer the intended production host for Module 01

Important finding:

- after the fresh production deploy on `anyu-next`, `https://anyu.tw` and `https://www.anyu.tw` both resolve to deployment:
  - `https://anyu-next-m3accq1wv-studioanyu-1488s-projects.vercel.app`

## 5. Production Env Status

Public/non-secret production env actions completed on `anyu-next`:

- `ANTHROPIC_MODEL=claude-sonnet-4-20250514`
- `ORADAR_PROVIDER=anthropic`
- `MODEL_STRATEGY=sonnet_default`
- `NEXT_PUBLIC_APP_URL=https://anyu.tw`
- `NEXT_PUBLIC_LINE_ADD_URL=https://lin.ee/S6dnbJO` already present
- `ANALYSIS_SESSION_DAILY_LIMIT=3`
- `ANALYSIS_IP_HOURLY_LIMIT=10`
- `ANALYSIS_GLOBAL_DAILY_LIMIT=200`

By-name production env status after finalization:

- present:
  - `DATABASE_URL`
  - `ANTHROPIC_API_KEY`
  - `ANTHROPIC_MODEL`
  - `ORADAR_PROVIDER`
  - `MODEL_STRATEGY`
  - `NEXT_PUBLIC_APP_URL`
  - `NEXT_PUBLIC_LINE_ADD_URL`
  - `ANALYSIS_SESSION_DAILY_LIMIT`
  - `ANALYSIS_IP_HOURLY_LIMIT`
  - `ANALYSIS_GLOBAL_DAILY_LIMIT`
- missing:
  - none from the required launch-candidate list

## 6. Neon DATABASE_URL Status

Verified:

- `DATABASE_URL` exists by name in `anyu-next` production env
- Neon project `anyu-next` has a ready `production` branch in `aws-ap-southeast-1`

Not safely confirmed:

- whether the active production `DATABASE_URL` points to the exact Neon `anyu-next` `production` branch
- whether it is the intended pooled/serverless connection string

Reason:

- `vercel env pull` returned a blank value for `DATABASE_URL`, so positive confirmation was not possible without exposing or mishandling secrets

Status:

- `present by name`
- `target confirmation pending manual verification`

## 7. Domain Assignment Status

Current verified state after actions taken:

- `anyu.tw` resolves to `anyu-next` production deployment
- `www.anyu.tw` also resolves to the same `anyu-next` production deployment
- Vercel inspect for both hostnames now returns the same ready deployment:
  - `dpl_35ysdRpMyaAGgSqkYfbVtWZzz88t`

Observed caveat:

- Vercel domain inspection still shows mixed/stale ownership output for `anyu.tw`
- this likely reflects transitional/domain-record state and should be re-checked later

## 8. www Redirect Status

Current status:

- `www.anyu.tw` responds with `HTTP 200`
- it is serving the same deployment as `anyu.tw`
- it is **not** redirecting to apex yet

Therefore:

- certificate/serving problem is improved
- canonical redirect policy is still incomplete

## 9. Actions Taken

1. Re-verified project/domain ownership state.
2. Finalized approved public production env values on `anyu-next`.
3. Re-pulled production env and verified required names were present.
4. Triggered a fresh production deployment on `anyu-next`.
5. Verified the fresh deployment reached `READY`.
6. Verified `anyu.tw` now serves the fresh `anyu-next` production deployment.
7. Verified `www.anyu.tw` now serves the same deployment.

## 10. Manual Actions Still Needed

1. Manually confirm the real `DATABASE_URL` target is the Neon `anyu-next` `production` branch.
2. Configure or verify `www.anyu.tw -> https://anyu.tw` redirect behavior.
3. Re-check Vercel domain ownership output after propagation/cleanup.
4. Approve production DB migration plan separately.
5. Run final human browser/phone smoke before any launch approval.

## 11. Production Go / No-Go Status

Current status remains `No-Go`.

Why still `No-Go`:

- production DB target is not positively confirmed
- production migration has not been approved/run
- `www` canonical redirect policy is not complete
- final human smoke/launch approval is still pending

## 12. Updates To Launch Decision

The launch decision should now reflect:

- project/domain normalization is materially underway
- apex production domain now serves `anyu-next`
- public production env names are now complete
- `www` redirect and DB target confirmation are still blockers
- launch remains `No-Go`

## 13. Remaining Risks

1. `DATABASE_URL` may still require manual correction/confirmation
2. `www.anyu.tw` may create duplicate-indexing/canonical ambiguity until redirected
3. the old `anyu` project may still retain stale domain metadata that should be reviewed later
4. a production deployment now exists and is publicly reachable, but this is still not launch approval

## 14. Recommended Next Step

`Production Redirect + DB Target Confirmation v0`
