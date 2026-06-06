# Admin API Pre-Payment LINE Bind Diagnostics v0

Date: 2026-06-07

## Model / Effort

- Model used: GPT-5 Codex
- Reasoning effort used: high
- taskStartedAt: `2026-06-06T16:29:11Z`
- taskCompletedAt: `2026-06-06T16:42:18Z`
- totalWallClockDuration: about 13 minutes
- humanWaitDuration: about 0 minutes
- netCodexWorkDuration: about 13 minutes

## Scope

Added safe pre-payment LINE bind diagnostics through persisted sanitized events, a read-only Admin API endpoint, and an Admin CLI command.

No production runtime, production checkout, payment, Email, LINE message, Vercel env change, secret rotation, production data mutation, DB migration, theme UI, or Module 02 work occurred.

## Existing Diagnostic Surface Inventory

Before this task:

- `recovery-bind-diagnostics` provided safe local categories for LIFF SDK/init/login/idToken/bind API outcomes.
- `LineRecoveryBindBridge` could render a hidden safe category in the UI.
- `/api/line/recovery/bind-liff` returned safe server errors but did not persist bind-attempt events.
- Admin paid-result lookup showed paid/result/access-link state after a result/payment context existed.
- `pnpm ops lookup-result` could not inspect failed pre-payment LINE bind attempts.

Unqueryable gap:

- A mobile LINE login redirect failure could occur before payment, and ops had no Admin API/CLI path to inspect the attempt by `resultId`.

## Diagnostic Persistence Design

Implemented diagnostics using the existing `events` table instead of adding a new diagnostics table.

Rationale:

- The existing `events` table is already additive and suitable for sanitized operational events.
- The signed `rlb_` bind state is verified server-side before attribution, then only `resultId` / `moduleSlug` / category / stage / status / safe booleans are stored.
- No new schema or migration was required.

Persisted event:

- `eventName=line_bind_diagnostic`
- Metadata includes only:
  - `resultId`
  - `moduleSlug`
  - `source`
  - `category`
  - `stage`
  - `status`
  - optional booleans such as `hasLiffState`, `hasIdToken`, `bindApiReached`, `recipientSecretRequired`, `recipientSecretCreated`

Never stored:

- raw LINE user ID
- idToken
- raw LIFF state token
- `rlb_`, `pa_`, `pcs_`, or `pal_` tokens
- encrypted recipient
- hashes
- tokenized URLs
- provider payloads

## Routes Added

Added:

- `POST /api/line/recovery/bind-diagnostics`
- `GET /api/admin/line-bind-diagnostics?resultId=<resultId>`

Client diagnostic endpoint behavior:

- accepts only safe category enum values
- requires a signed bind state token
- verifies state server-side before deriving `resultId`
- stores sanitized category/boolean metadata only
- rejects missing/invalid/expired state without persisting unattributable events

Admin endpoint behavior:

- uses existing `x-admin-api-token` / `ADMIN_API_TOKEN` auth
- authenticates before lookup
- validates `resultId`
- returns sanitized summary only
- returns safe `no_events_found` when no diagnostics exist

## Server Bind Route Diagnostics

Updated `/api/line/recovery/bind-liff` to record server-side diagnostics for:

- `bind_api_line_identity_missing`
- `bind_api_recipient_secret_failed`
- `bind_api_failed`
- `bind_success`

State missing/invalid/expired cases are not persisted unless a valid signed state can be verified and safely attributed.

The recipient-secret invariant remains intact:

- contact-only state is not deliverable
- checkout unlock still requires active recipient secret
- no LINE send occurs without active recipient secret

## Client-Side Reporting

Updated `LineRecoveryBindBridge` to best-effort report client-side categories when a state token exists:

- `liff_sdk_load_failed`
- `liff_init_failed`
- `liff_login_redirect_started`
- `id_token_missing_after_login`

Client reporting is non-blocking and never logs or displays private values.

## Admin CLI Command Added

Added:

- `pnpm ops lookup-line-bind --env staging --result-id <resultId>`
- `pnpm ops lookup-line-bind --env production --result-id <resultId>`
- `--json` support

Rules:

- `--env` is required.
- `--result-id` is required.
- `ADMIN_API_TOKEN` must come from the current shell/process env.
- no `--base-url`
- no token flag
- no DB/Vercel/Neon access
- no apps/web env mirror loading

Pretty output shows env, result ID, latest category/stage/status, event count, and recommended action only.

## Safety / Redaction Guarantees

Added tests for:

- unsafe category rejection
- unsafe Admin API/CLI response rejection
- no raw LINE identity
- no idToken
- no signed state token
- no access-link/payment tokens
- no tokenized URLs
- no provider payloads

## Mock-Flow Integration

Updated `qa:module01:mock-flow` with diagnostics coverage:

- client diagnostic recording
- server bind success event recording
- server recipient-secret failure event recording
- Admin API sanitized diagnostics summary
- ops CLI LINE bind lookup path

## Schema / Migration Action

No schema migration was added.

Reason:

- Existing `events` table supports the v0 diagnostic storage need.
- Avoiding a migration avoids touching Preview(staging) or Production schema during this diagnostic foundation task.

## Validation

Run:

| Command | Result |
|---|---|
| `corepack pnpm --filter @anyu/admin-cli test` | pass, 2 files / 23 tests |
| `cd apps/web && corepack pnpm exec vitest run src/tests/line-bind-diagnostic-events.test.ts src/tests/line-recovery-bind-diagnostics-route.test.ts src/tests/admin-line-bind-diagnostics-route.test.ts src/tests/line-recovery-bind-route.test.ts` | pass, 4 files / 16 tests |
| `cd apps/web && corepack pnpm lint` | pass |
| `cd apps/web && corepack pnpm test` | pass, 92 files / 631 tests |
| `corepack pnpm --filter @anyu/admin-cli typecheck` | pass |
| `cd apps/web && corepack pnpm build` | pass |
| `cd apps/web && corepack pnpm run qa:module01:mock-flow` | pass, 15 files / 125 tests |
| `cd apps/web && corepack pnpm run qa:module01:ui` | pass after sandbox-escalated rerun |
| `cd apps/web && corepack pnpm run qa:module01:local` | pass |
| docs presence check | pass |
| dashboard HTML sanity (`</html>` present) | pass |
| `git diff --check` | pass |
| filename-only secret/private scan | pass; matched expected policy/test/code token labels and regexes only, no values printed |

Skipped:

- `qa:module01:staging`: skipped because no migration was applied and no deployed endpoint verification was required in this task.
- `qa:module01:production-preflight`: skipped because production schema/env/preflight behavior did not change.
- `qa:module01:staging:channels`: not run; real Email/LINE checks remain owner-approved only.

## Staging / Production Touch

- Staging runtime: not touched.
- Production runtime: not touched.
- Production payment: not run.
- Email: not sent.
- LINE: not sent.
- Vercel env: not changed.
- DB data: not manually mutated.

## Remaining Diagnostic Gaps

- Client-side categories that happen with no signed state remain unattributable by design.
- Admin API can now show persisted bind attempts, but it does not create or mutate test fixtures.
- The production LINE login redirect failure still needs a targeted fix using these diagnostics, then local/mock/UI/staging validation before another production smoke.

## Theme Route Preservation

Theme Architecture remains archived and preserved. This task does not implement theme UI and does not change the Module 01 Riso-only future implementation track.

## Final Status

Admin API Pre-Payment LINE Bind Diagnostics v0 is complete.

Recommended next task: **LINE production bind fix with targeted/mock/UI/staging validation, using the new diagnostics.**
