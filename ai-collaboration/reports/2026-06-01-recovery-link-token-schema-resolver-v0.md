# Recovery Link Token Schema / Resolver v0

Date: 2026-06-01
Task: Recovery Link Token Schema / Resolver v0
Commit: pending at report creation; final commit recorded in Codex completion summary

## Completed Work

- Added `paid_result_recovery_links` schema to Drizzle.
- Added migration file `apps/web/drizzle/0010_paid_result_recovery_links.sql`.
- Added explicit local env name placeholder `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`.
- Added server-only recovery link token helper:
  - generates `prl_` tokens
  - hashes tokens with HMAC and purpose separation
  - defaults expiry to 90 days
  - fails closed when secret is missing
- Added DB/service helper:
  - creates recovery link rows with hash-only token storage
  - resolves raw recovery token server-side by hash
  - rejects invalid, expired, revoked, failed, and inactive-entitlement links
  - marks valid links as `used`
  - supports revocation helper
- Refactored paid access resolution so entitlement-based access can be reused without requiring raw `pa_`.
- Added `/r/[recoveryToken]` resolver page.
- Added tests for token generation, hash-only storage, expiry, revocation, invalid token handling, route rendering, no raw token exposure, migration presence, and paid access reuse.

## Schema / Migration Added

New table: `paid_result_recovery_links`

Fields:

- `id`
- `module_slug`
- `analysis_result_id`
- `payment_intent_id`
- `entitlement_id`
- `recovery_contact_id`
- `token_hash`
- `purpose`
- `channel`
- `status`
- `expires_at`
- `used_at`
- `revoked_at`
- `sent_at`
- `created_at`
- `updated_at`

Indexes:

- unique `paid_result_recovery_links_token_hash_idx`
- `paid_result_recovery_links_entitlement_idx`
- `paid_result_recovery_links_contact_idx`
- `paid_result_recovery_links_result_module_idx`
- `paid_result_recovery_links_active_lookup_idx`

Migration status:

- Migration file added only.
- No staging DB migration was applied in this task.
- No production DB migration was applied in this task.

## Token Strategy

Token prefix: `prl_`

Storage:

- Raw token is returned only from `createPaidResultRecoveryLink`.
- Raw token is not stored in DB.
- DB stores only `token_hash`.
- Hash purpose string is separated from contact hash and paid access hash usage.

Secret:

- New explicit env name: `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`
- Missing secret fails closed before DB insert.
- No secret value, length, prefix, suffix, hash, or checksum was printed or committed.

Default validity:

- 90 days via `PAID_RESULT_RECOVERY_LINK_TTL_DAYS`.

## Resolver Behavior

Route added:

- `/r/[recoveryToken]`

Behavior:

- Accepts raw `prl_` token from route path.
- Hashes and looks up token server-side.
- Rejects invalid, missing, expired, revoked, failed, or inactive-entitlement tokens.
- Uses generic support/error copy to avoid useful enumeration.
- Resolves valid links to existing entitlement/result context.
- Reuses existing paid access rendering through `UnlockCompleted`.
- Shows a safe processing page if the paid result is not yet ready.
- Does not send Email or LINE.
- Does not mutate payment state.

## Expiry / Revocation Behavior

- Expired links fail safely with support copy.
- Revoked links fail safely with support copy.
- Failed links fail safely with support copy.
- Valid links are multi-use until expiry/revocation in v0, but `used_at` and `status=used` are recorded on successful resolution.

Risk note:

- Multi-use bearer links remain a known v0 tradeoff.
- Mitigations are high-entropy tokens, hash-only storage, 90-day expiry, revocation, generic failure copy, and no content in Email/LINE messages.
- Single-use or session-exchange hardening can be added later if needed.

## Access Handoff Choice

Chosen approach: resolver renders the existing paid result view server-side from entitlement/result context.

Reason:

- Avoids sending raw `pa_` or raw `pcs_` through Email/LINE.
- Avoids creating another public token handoff layer before Email/LINE sending exists.
- Reuses existing paid result rendering and recovery status display.
- Keeps web access canonical.

Deferred:

- Future implementation can exchange recovery links into a short-lived server-side session if stronger browser/session scoping becomes necessary.

## Safety Boundaries

- No Email sent.
- No LINE message sent.
- No production runtime flag changed.
- No Vercel env modified.
- No staging or production DB migration applied.
- No raw `pa_`, `pcs_`, recovery token, provider payload, report content, Email, or LINE identifier committed.

## Tests / Validation

Passed:

- `cd apps/web && corepack pnpm exec vitest run src/tests/paid-result-recovery-links.test.ts src/tests/paid-result-recovery-link-page.test.tsx src/tests/paid-access-resolver.test.ts`
- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm exec drizzle-kit check`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`

Additional checks passed:

- docs presence check
- dashboard HTML sanity
- `git diff --check`
- secret/private scan on new/changed task files; only blank env-name placeholders in `.env.example` were detected

## Architecture Decisions

- Introduced a dedicated recovery-link secret instead of reusing paid access or recovery contact secrets.
- Used a dedicated `prl_` recovery token prefix to keep recovery links distinguishable from `pa_`, `pcs_`, and `rlb_`.
- Kept links multi-use until expiry/revocation in v0 while recording `used_at`.
- Rendered paid result through existing server-side paid access rendering rather than redirecting to raw `pa_` or raw `pcs_`.

## Tech Debt Review

New technical debt introduced:

- `paid_result_recovery_links` is not DB-applied on staging yet.
- v0 links are multi-use bearer links until expiry/revocation.
- Email/LINE send status fields exist, but no sender integration exists yet.

Existing technical debt observed:

- Public retention/access copy still does not mention the planned 90-day recovery link window.
- LINE visible CTA wiring and owner-assisted LIFF smoke remain pending.
- Email provider/sender identity remains undecided.

Opportunistic cleanup completed:

- Paid access resolver now exposes entitlement-based resolution, reducing need to route every paid access render through raw `pa_`.

Deferred cleanup candidates:

- Add resolver audit/rate-limit events when send/resend support is implemented.
- Decide whether successful link use should exchange into a short-lived session rather than directly rendering.
- Add support tooling for revoke/resend after Email/LINE sending exists.

## Blockers / Uncertainties

- Staging DB migration apply remains a separate operational task.
- Production DB migration and env remain gated.
- Owner should approve final 90-day public copy before legal/support copy changes.
- Email provider and sender identity remain undecided.

## Recommended Next Step

Recovery Link Token Staging Apply / Smoke v0.

Suggested scope:

- Verify staging DB target.
- Apply `apps/web/drizzle/0010_paid_result_recovery_links.sql` to staging only.
- Configure `PAYMENT_RECOVERY_LINK_TOKEN_SECRET` for Preview(staging) only if not already present.
- Run a sanitized helper/route smoke with fake/operator data only.
- Do not send Email or LINE.
