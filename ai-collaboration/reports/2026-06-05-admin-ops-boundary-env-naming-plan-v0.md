# Admin Ops Boundary + Env Naming Plan v0

## Status

Plan completed. No implementation was performed.

This task did not add Admin API routes, did not add a CLI, did not rename env files, did not modify local or Vercel env, did not touch databases, did not enable production runtime, and did not send Email/LINE messages.

## 1. Environment Model

### Local dev

Target file: `apps/web/.env.local`

Purpose:

- local development only
- points to the Neon `dev/local` branch unless explicitly changed later
- not used for staging support lookup
- not used by the future ops CLI

Notes:

- This file can remain useful for local web app development.
- It should not be treated as a mirror of Vercel Preview(staging).
- It is not a reliable integration environment for third-party LIFF/payment/provider flows.

### Server staging mirror

Planned target file: `apps/web/.env.staging`

Purpose:

- local mirror of Vercel Preview(staging) server env
- used only by server/runtime scripts that intentionally need a staging server-env mirror
- not read by the ops CLI

Notes:

- This rename is a plan only; no files were renamed in this task.
- Secrets must remain untracked.
- Future loaders should require explicit file selection instead of implicitly treating `.env.local` as staging.

### Server production mirror

Planned target file: `apps/web/.env.production`

Purpose:

- local mirror of Vercel Production server env
- used only by explicit production server-env verification flows
- not read by the ops CLI

Notes:

- This rename is a plan only; no files were renamed in this task.
- Production env changes remain gated and manual.
- Production runtime must stay disabled unless a separate production smoke task explicitly enables it.

### Host staging

Source: Vercel Preview for branch `staging`

Purpose:

- main integration validation environment
- payment sandbox/provider integration
- LIFF and provider callback validation
- staging Admin API target

Decision:

- Pure local integration for payment/LIFF/provider flows is abandoned.
- Staging is the primary integration environment.

### Host production

Source: Vercel Production

Purpose:

- production runtime
- controlled production smoke only after owner signal
- future soft public availability only after explicit gate decision
- production Admin API target

Decision:

- Production remains frozen/fail-closed until an explicit production gate/smoke task.
- Production is not touched by staging support lookup work.

## 2. Admin Boundary Principle

Admin API is the single operational boundary.

The local CLI is an Admin API client.

Future Admin UI is also an Admin API client.

Neither the CLI nor future Admin UI should directly access:

- database URLs
- Neon branches or Neon API
- Vercel env
- payment provider secrets
- Email provider secrets
- LINE provider secrets
- web app DB helpers
- web runtime-only helpers

Rationale:

- Ops behavior should match deployed runtime behavior.
- Support tooling should not need local DB branch knowledge.
- Staging and production support lookup should use the same external boundary that a future Admin UI will use.
- Wrong-token and wrong-environment failures should be explicit HTTP failures, not silent DB target drift.

## 3. Admin API v0 Scope

Admin API v0 should be read-only paid result lookup.

Preferred route:

```text
GET /api/admin/paid-results/:resultId
```

Auth decision:

```text
x-admin-api-token: <ADMIN_API_TOKEN>
```

Why choose `x-admin-api-token` for v0:

- simple for local CLI usage
- avoids ambiguity with user/session auth
- easy to gate in route tests
- wrong token naturally returns `401`

`Authorization: Bearer` remains a reasonable future option if Admin API expands into a broader auth model, but v0 should choose one header and keep it boring.

Environment:

- Vercel Preview(staging) has `ADMIN_API_TOKEN`
- Vercel Production has `ADMIN_API_TOKEN`
- staging and production token values are separate
- both use the same env name
- values must never be printed or exposed

Response scope:

Admin API v0 returns a sanitized paid result support summary only.

Safe fields should include:

- `resultId`
- `moduleSlug`
- payment status
- entitlement status
- generation status
- paid result completed status
- Email access-link saved/sent/active summary
- LINE access-link saved/recipient-secret/sent/active summary
- provider audit summary
- diagnosis categories
- recommended support action

Response must not include:

- raw Email
- raw LINE userId
- encrypted recipient
- hashes
- raw `pal_` token
- tokenized URL
- source text / raw user input
- provider payload
- `TradeInfo`
- `TradeSha`
- card or payment sensitive data

## 4. CLI Package Boundary

Recommended monorepo location:

```text
tools/admin-cli
```

Recommended implementation stack:

- TypeScript / Node
- `tsx`
- `commander` or `cac`
- `zod` for response validation
- native `fetch`

CLI boundaries:

- not part of Vercel deploy
- not imported by `apps/web`
- does not import `apps/web/src/lib/db/*`
- does not import web runtime helpers
- does not read `apps/web` env files
- does not read DB URLs
- does not read Vercel env
- communicates only with Admin API

This separation is intentional. The CLI should be replaceable by a future Admin UI without changing support semantics.

## 5. CLI v0 Usage

Exact v0 commands:

```bash
pnpm ops lookup-result --env staging --id <resultId>
pnpm ops lookup-result --env production --id <resultId>
```

Required:

- `--env staging|production`
- `--id <resultId>`
- `ADMIN_API_TOKEN` in current shell/process env

Optional:

- `--json`

Hardcoded base URLs:

| Env | Base URL |
| --- | --- |
| `staging` | `https://staging.anyu.tw` |
| `production` | `https://anyu.tw` |

Not supported in v0:

- `--base-url`
- endpoint env
- `--token`
- token-env override
- DB URL
- Vercel env
- Email lookup
- merchant-order lookup
- payment-intent lookup
- access-link lookup
- resend
- mutation commands

Reasoning:

- `--env` must be explicit so the operator chooses staging or production consciously.
- Base URLs should be hardcoded in v0 to remove another source of drift.
- Token value stays outside CLI flags to avoid shell history leakage.

## 6. CLI Output And Errors

### Pretty output

Pretty output should summarize:

- environment
- result status
- payment status
- entitlement status
- paid result status
- Email access-link state
- LINE access-link state
- provider audit state
- diagnosis
- recommended support action

Example shape:

```text
Environment: staging
Result: completed
Payment: paid
Entitlement: active
Generation: completed
Email: saved, access link sent, active
LINE: saved, recipient secret active, access link sent, active
Diagnosis: paid_result_ready
Recommended action: ask user to open the latest Email or LINE access link
```

### JSON output

`--json` should print the validated sanitized response plus a small client envelope:

```json
{
  "ok": true,
  "env": "staging",
  "lookup": {
    "resultId": "redacted-example",
    "diagnosis": ["paid_result_ready"],
    "recommendedAction": "ask_user_to_open_latest_access_link"
  }
}
```

Implementation note: the example above is schematic. Real output must not include raw tokens, tokenized URLs, raw Email, raw LINE IDs, hashes, encrypted values, source text, or provider payloads.

### Error categories

CLI error categories:

- `env_required`
- `admin_token_missing`
- `admin_auth_failed`
- `result_id_missing`
- `result_not_found`
- `api_unreachable`
- `unsafe_response_shape`
- `server_lookup_failed`

Error behavior:

- no stack traces by default
- no private values
- wrong token returns `admin_auth_failed` after API `401`
- production lookup requires `--env production`; no default to production

## 7. Direct DB Support Lookup Decision

Direct DB support lookup is abandoned by design as the primary ops path.

Decision:

- Do not continue trying to make `SUPPORT_OPS_DATABASE_URL` the main support path.
- Existing direct DB helper can remain temporarily as legacy/internal diagnostic tooling until Admin API + CLI replaces it.
- If retained, mark it deprecated and not part of target architecture.
- Do not build new support workflows around direct Neon/DB access.

Rationale:

- Direct DB lookup caused repeated branch/source confusion.
- It couples support tooling to schema internals and local env files.
- It cannot become the future Admin UI boundary.
- Admin API keeps authorization, sanitization, and deployed-runtime behavior in one place.

## 8. Env File Rename Plan

Planned rename:

```text
apps/web/.env.local      -> apps/web/.env.staging
apps/web/.env            -> apps/web/.env.production
```

Clarifications:

- These files are server/Vercel env mirrors only.
- The CLI must not load them.
- Future env loaders/preflights should use explicit file names.
- `.gitignore`, `.env.example`, docs, and script help text should be updated in the implementation task.
- Secrets must not be committed.

Important migration caution:

- Current `.env.local` appears to target `dev/local`, not Host Preview(staging). The implementation task should decide whether the renamed `.env.staging` should mirror Host Preview(staging), or whether local/dev should move to another explicit filename such as `.env.dev.local`.
- Do not silently repoint any local DB URL during the rename task.

## 9. Implementation Breakdown

### A. Env File Rename / Server Mirror Alignment v0

Scope:

- rename local server mirror files
- update script loaders/docs
- update `.gitignore` / examples
- preserve secret safety
- ensure CLI is not involved

Key validation:

- env loaders choose explicit files
- existing QA scripts still work with intended server mirror
- no tracked env values

### B. Admin Paid Result Lookup API v0

Scope:

- implement `GET /api/admin/paid-results/:resultId`
- read-only only
- sanitized response
- `ADMIN_API_TOKEN` gate
- route tests

Key validation:

- `401` on missing/wrong token
- `404` or safe not-found on unknown result
- no private fields in response
- response includes Email/LINE access-link summary and diagnosis/action

### C. Admin CLI Lookup Client v0

Scope:

- create `tools/admin-cli`
- add root `pnpm ops lookup-result`
- require `--env staging|production`
- require `ADMIN_API_TOKEN`
- hardcode staging/production base URLs
- validate response shape and redaction

Key validation:

- no env file loading
- no DB/Vercel/Neon access
- wrong token maps to `admin_auth_failed`
- `--json` output is safe

### D. Staging Admin Lookup Smoke v0

Scope:

- set Preview(staging) `ADMIN_API_TOKEN`
- call staging Admin API through CLI
- verify sanitized result against known staging artifact
- no Email/LINE sending

Key validation:

- staging API returns useful support summary
- CLI output is useful and redacted
- Module 01 staging baseline can upgrade to PASS if lookup succeeds

### E. Production Read-only Admin Lookup Smoke v0

Scope:

- set Production `ADMIN_API_TOKEN`
- call production Admin API read-only
- no production runtime enablement
- no payment
- no provider messages

Key validation:

- production public pages remain live
- checkout/operator routes remain fail-closed
- Admin API lookup returns only sanitized data

## 10. Risks / Open Decisions

### `x-admin-api-token` vs `Authorization: Bearer`

Recommendation: use `x-admin-api-token` for v0.

Open decision: if a broader admin auth layer is planned soon, use `Authorization: Bearer` from day one instead. Otherwise, avoid extra auth abstraction.

### Old direct DB support helper

Recommendation: deprecate temporarily, then remove after Admin API + CLI is verified.

Risk if removed immediately: losing a known diagnostic path before replacement is proven.

Risk if retained too long: future agents may continue using DB support lookup despite the new boundary.

### Admin API response schema

Recommendation: define a shared zod contract for the sanitized response, ideally under an admin API contract file that both route tests and CLI tests can validate against.

Constraint: do not let CLI import web runtime/db helpers. If sharing contract code creates coupling, duplicate a small schema in the CLI for v0 and reconcile later.

### Root package script

Recommendation: add root `pnpm ops` when CLI exists, not before.

Reasoning: adding a dead script before CLI implementation creates false affordance.

## 11. Documentation Updates

This report documents the plan and updates the dashboard/summary to shift the next recommended path from direct DB support lookup to Admin API boundary implementation.

## Tech Debt Review

New technical debt introduced: none.

Existing technical debt observed:

- direct DB support helper remains legacy until Admin API replaces it.
- recovery-named env vars remain retained compatibility.
- local env file names currently imply staging/production less clearly than the owner wants.
- local `dev/local` branch may need a separate explicit env name if local dev continues.

Opportunistic cleanup completed:

- dashboard wording now reflects Admin API boundary direction instead of direct DB source repair.

Deferred cleanup candidates:

- env mirror file rename and loader cleanup.
- direct DB support helper deprecation/removal.
- Admin API response schema contract.
- root `pnpm ops` script after CLI exists.

## Suggested Next Steps

1. Env File Rename / Server Mirror Alignment v0.
2. Admin Paid Result Lookup API v0.
3. Admin CLI Lookup Client v0.
4. Staging Admin Lookup Smoke v0.
5. Production Read-only Admin Lookup Smoke v0.
