# Force Align Vercel Preview Staging QA Secrets and Rerun Fake-Paid QA v0

## Summary
Force alignment succeeded for the staging fake-paid QA path.

Vercel Preview(staging) secrets were regenerated and aligned from the same shell that ran the QA runner. A fresh staging deployment was triggered by pushing the handoff commit, `staging.anyu.tw` served the expected route bundle, and `corepack pnpm run qa:fake-paid` completed successfully.

Final QA result:

```text
full fake-paid QA passed
```

No secret values, raw `pa_` tokens, tokenized URLs, raw input, provider output, LINE IDs, or private values were printed or recorded.

## Repo / Branch Preflight
- Working directory: `/Users/raylin/Projects/anyu-next`
- Git root: `/Users/raylin/Projects/anyu-next`
- Branch: `staging`
- Preflight HEAD before handoff commit: `a4fecbd36c650fca41c69850748da67724b1fdbf`
- `origin/staging` before handoff commit: `a4fecbd36c650fca41c69850748da67724b1fdbf`
- Handoff commit pushed for Preview redeploy: `4c234930ccd21702481446f38ff0a8953dd61db7`

The only dirty file before env mutation was the mandatory handoff for this task. It was committed first so the worktree was clean before Vercel env mutation.

## Vercel CLI / Project Confidence
- `VERCEL_TOKEN`: present, value not printed.
- Direct Vercel CLI: `54.5.1`.
- Authenticated Vercel account: `studioanyu-1488`.
- Linked project from `.vercel/project.json`: `anyu-next`.
- Vercel env list scope: `studioanyu-1488s-projects/anyu-next`.

`corepack pnpm dlx vercel` was initially attempted but was blocked by sandbox write permission to the pnpm dlx cache. Direct `vercel` CLI with `--token "$VERCEL_TOKEN"` was used instead.

## Secret Alignment
Fresh staging-only secrets were generated inside a shell process and never printed.

Branch-scoped Preview(staging) env vars were force-overridden with fresh values:

- `OPERATOR_TEST_SECRET`: aligned for Preview(staging).
- `INTERNAL_JOB_SECRET`: aligned for Preview(staging).
- `PAID_ACCESS_TOKEN_HASH_SECRET`: aligned for Preview(staging).

The same generated `OPERATOR_TEST_SECRET` and `INTERNAL_JOB_SECRET` values were exported in that same shell process for the QA runner. Values were not written to repo files or reports.

Notes:

- General Preview add was blocked by Vercel CLI non-interactive branch disambiguation.
- The fix used explicit `preview staging`, which is the target for `staging.anyu.tw` deployments.
- `vercel env ls preview` showed encrypted values only; no secret values were exposed.

## Preview / Staging Redeploy
A fresh Preview deployment was triggered by pushing the handoff commit to `origin/staging`.

Push result:

```text
HEAD -> staging
```

During the push, local Git initially could not update the local `origin/staging` ref due a transient lock permission issue, but the remote push succeeded. A later `git fetch origin --prune` reconciled local `origin/staging` to `4c234930ccd21702481446f38ff0a8953dd61db7`.

## Staging Freshness Verification
After redeploy, `https://staging.anyu.tw/api/health` matched the expected commit:

```json
{
  "environment": "preview",
  "gitCommit": "4c234930ccd2",
  "gitBranch": "staging",
  "routeBundleVersion": "payment-foundation-2026-05-29"
}
```

Non-secret route preflight:

```json
{"step":"preflight_fake_paid_missing_secret","status":401,"jsonControlled":true,"error":"unauthorized","genericHtml404":false}
{"step":"preflight_fake_paid_invalid_secret","status":401,"jsonControlled":true,"error":"unauthorized","genericHtml404":false}
{"step":"preflight_invalid_pa","status":200,"paidStatus":"expired","errorCategory":"invalid_paid_access"}
```

## Fake-Paid QA Result
Command run from `apps/web` in the same shell that generated/exported the secrets:

```bash
corepack pnpm run qa:fake-paid
```

Sanitized result summary:

- `secret_preflight`: pass.
- `staging_health_marker`: pass, commit `4c234930ccd2`, branch `staging`, environment `preview`.
- `fake_paid_gate_missing_secret`: pass, JSON `401 unauthorized`.
- `fake_paid_gate_invalid_secret`: pass, JSON `401 unauthorized`.
- `invalid_pa_status`: pass, `invalid_paid_access`.
- `source_analyze`: pass.
- `source_result_page`: pass.
- `legacy_unlock_intent`: pass.
- `legacy_unlock_page`: pass.
- `fake_paid_authorized_first`: pass.
- `fake_paid_idempotency`: pass.
- `paid_status_before_processor`: pass, `pending`.
- `paid_access_unlock_page`: pass, pending page HTTP 200.
- `processor_manual_completion`: pass.
- `paid_status_after_processor_attempt_1`: pass, `completed`.
- `paid_access_unlock_completed_page`: pass, completed content signal true.
- `final_summary`: pass, `fullQaPassed: true`.

## Processor Result
Processor manual completion succeeded:

```json
{
  "step": "processor_manual_completion",
  "outcome": "pass",
  "httpStatus": 200,
  "processorEndpointPath": "/api/internal/jobs/process",
  "processorAuthHeaderUsed": true,
  "processorAuthMode": "authorization_bearer_internal_job_secret",
  "authDiagnostic": null,
  "processed": 1,
  "completed": 1,
  "retryScheduled": 0,
  "error": null
}
```

This confirms the previous `secret_mismatch` blocker was resolved by aligning the branch-scoped Preview(staging) secret and running QA with the exact same generated local secret.

## Validation
No app code changed in this task. Full app lint/test/build was not required.

Validation performed:

- Vercel CLI auth/project visibility: passed.
- Preview(staging) env alignment: completed.
- Fresh staging route-bundle verification: passed.
- Non-secret staging route preflight: passed.
- Secret-safe fake-paid QA runner: passed fully.

## Security / Privacy
- No `VERCEL_TOKEN` value was printed or recorded.
- No `OPERATOR_TEST_SECRET`, `INTERNAL_JOB_SECRET`, or `PAID_ACCESS_TOKEN_HASH_SECRET` value was printed or recorded.
- No raw `pa_` token or tokenized URL was printed or recorded.
- No raw user input, provider output, `paid_result_json`, provider credential, LINE ID, or private value was recorded.
- Production env was not updated.
- Production was not deployed.

## Tech Debt Review
### New Technical Debt Introduced
None.

### Existing Technical Debt Observed
- Vercel has both general Preview and branch-scoped Preview(staging) env values for some QA secrets. Branch-scoped values take precedence for staging and can cause mismatch if only general Preview is updated.
- `corepack pnpm dlx vercel` cannot write to the default pnpm dlx cache in this sandbox; direct `vercel` CLI was required.

### Opportunistic Cleanup Completed
- Resolved the staging fake-paid QA processor secret mismatch by force-aligning Preview(staging) values.

### Deferred Cleanup Candidates
- Document branch-scoped Preview(staging) precedence in the fake-paid QA runbook.
- Consider removing stale duplicate general Preview QA secrets after confirming they are no longer needed.
- Keep or later remove the temporary processor auth diagnostic mode after the payment foundation QA work stabilizes.

## Recommended Next Step
Proceed to NewebPay Checkout Creation Phase 1, limited to checkout creation + pending `payment_intent` creation + ReturnURL pending UX only, without NotifyURL paid transition yet.
