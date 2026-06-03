# Access Link Technical Naming Alignment Plan v0

Date: 2026-06-04  
Scope: Planning only  
Result: Plan completed

## Executive Summary

- User-facing copy already frames the feature as 保存查看連結 / 專屬查看連結 / 回 ANYU 查看完整報告.
- Active implementation still uses `recovery` naming across schema, helpers, routes, scripts, tests, and docs.
- The owner goal is technically sound: align naming before broader production payment launch to reduce future agent/operator confusion.
- Important current-state correction: Production DB migration gates were applied in Production DB on 2026-06-04. Both Preview(staging) and Production now have recovery-named schema, though production payment/runtime remains disabled.
- Recommended target language:
  - Product/engineering concept: paid result access link
  - Link table: `paid_result_access_links`
  - Contact table: `payment_access_link_contacts`
  - Recipient secret table: `payment_access_link_contact_secrets`
- Recommended strategy: phased compatibility-first rename, not broad replacement.
- Recommended token prefix strategy: introduce `pal_` for new paid result access links with dual-prefix `prl_` compatibility; keep `rlb_` temporarily as a legacy LINE bind-state prefix until route/schema rename is complete.
- Recommended DB strategy: add explicit rename migrations for existing staging and production schema, with compatibility views or old-name helper aliases during transition.
- Recommended next task: Access Link Code Alias + Script Rename v0 before DB rename.

## 1. Inventory Of Current Recovery-Named Assets

### DB / Schema

Active Drizzle schema uses recovery names:

- `paymentRecoveryContacts` → table `payment_recovery_contacts`
- `paidResultRecoveryLinks` → table `paid_result_recovery_links`
- `paymentRecoveryContactSecrets` → table `payment_recovery_contact_secrets`
- columns:
  - `recovery_contact_id`
- relation names:
  - `paymentRecoveryContacts`
  - `paidResultRecoveryLinks`
  - `paymentRecoveryContactSecrets`
  - `recoveryContact`
- purpose values:
  - `paid_result_recovery`
  - `recovery_link_delivery`

Classification: DB/schema. Active runtime dependency.

### Migration Files

Recovery-named migrations:

- `apps/web/drizzle/0009_payment_recovery_contacts.sql`
- `apps/web/drizzle/0010_paid_result_recovery_links.sql`
- `apps/web/drizzle/0011_payment_recovery_contact_secrets.sql`
- `apps/web/drizzle/0012_paid_result_recovery_link_send_audit.sql`

Classification: migration history. Active because staging and production have applied these schemas.

### Server Helpers

Recovery-named DB/helper modules:

- `apps/web/src/lib/db/payment-recovery-contacts.ts`
- `apps/web/src/lib/db/paid-result-recovery-links.ts`
- `apps/web/src/lib/db/payment-recovery-contact-secrets.ts`
- `apps/web/src/lib/payments/recovery-link-token.ts`
- `apps/web/src/lib/payments/recovery-contact-crypto.ts`
- `apps/web/src/lib/payments/line-recovery-recipient-crypto.ts`
- `apps/web/src/lib/payments/operator-recovery-link-smoke.ts`
- `apps/web/src/lib/line/recovery-bind-state.ts`
- `apps/web/src/lib/line/recovery-bind-link.ts`
- `apps/web/src/lib/line/recovery-liff-context.ts`
- `apps/web/src/lib/notifications/email-recovery-link.ts`
- `apps/web/src/lib/notifications/line-recovery-link.ts`

Representative active exports:

- `createPaidResultRecoveryLink`
- `resolvePaidResultRecoveryLink`
- `revokePaidResultRecoveryLink`
- `markPaidResultRecoveryLinkSent`
- `getRecentPaidResultRecoveryLinkForContact`
- `createSupportPaidResultRecoveryLink`
- `createOrUpdateEmailRecoveryContact`
- `createOrUpdateLineRecoveryContact`
- `bindRecoveryContactsToEntitlement`
- `getPaymentRecoveryStatusSummary`
- `sendRecoveryLinksForCompletedPaidResult`
- `createAndSendEmailRecoveryLink`
- `createAndSendLineRecoveryLink`
- `createLineRecoveryBindStateToken`
- `bindVerifiedLineUserToRecoveryContact`

Classification: server helper. Active runtime dependency.

### API Routes / Pages

Recovery-named active paths:

- `/api/line/recovery/bind-liff`
- `/line/recovery/bind`
- `/api/modules/[moduleSlug]/result/[resultId]/recovery/email`
- `/api/operator/recovery-link-smoke`
- `/api/operator/email-recovery-smoke`
- `/api/operator/line-recovery-smoke`
- `/r/[recoveryToken]`

Related compatibility route:

- `/line/fulfill` detects recovery state and routes to recovery binding UI before legacy fulfillment behavior.

Classification: API route/page. Active runtime dependency.

### Scripts / QA Commands

Recovery-named active scripts:

- `qa:recovery-link:smoke`
- `qa:line-recovery:smoke`
- `scripts/recovery-link-smoke-qa.mjs`
- `scripts/line-recovery-smoke-qa.mjs`
- `scripts/lib/recovery-link-smoke-qa.mjs`

Support ops still uses safe internal lookup key:

- `recoveryLinkId`

Classification: script/QA command. Active operator dependency.

### Token Prefixes / Env Names

Current prefixes:

- `prl_`: paid result recovery link token
- `rlb_`: LINE recovery bind state token
- `/r/`: public short route for access-link resolver

Current env names:

- `PAYMENT_RECOVERY_CONTACT_HASH_SECRET`
- `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY`
- `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`
- `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`
- `ENABLE_OPERATOR_RECOVERY_LINK_SMOKE`
- `ENABLE_OPERATOR_EMAIL_RECOVERY_SMOKE`
- `ENABLE_OPERATOR_LINE_RECOVERY_SMOKE`

Classification: security/token/env contract. Active runtime/operator dependency.

### Tests

Recovery-named active test files include:

- `payment-recovery-contacts.test.ts`
- `paid-result-recovery-links.test.ts`
- `payment-recovery-contact-secrets.test.ts`
- `email-recovery-link.test.ts`
- `line-recovery-link.test.ts`
- `line-recovery-bind-state.test.ts`
- `line-recovery-bind-route.test.ts`
- `line-recovery-liff-page.test.tsx`
- `paid-result-recovery-save-section.test.tsx`
- `paid-result-recovery-link-page.test.tsx`
- `recovery-link-smoke-qa.test.ts`
- operator recovery smoke tests

Classification: test expectation. Active validation dependency.

### User-Facing Copy

User-facing copy has mostly shifted to access-link terms:

- 保存查看連結
- 專屬查看連結
- 回 ANYU 查看完整報告
- 查看連結已失效

Some internal component prop/type names still use recovery, but visible copy is mostly aligned.

Classification: user-facing copy mostly aligned; internal names still legacy.

### Active Docs / Dashboard

Current active docs/dashboard still mention:

- recovery/access-link loop
- recovery-named tables and historical tasks
- next tasks around production access-link/provider gates

Classification: active docs/dashboard. Should add a naming transition note, not rewrite all historical reports.

### Historical Reports / Handoffs

Historical reports and handoffs contain extensive recovery terminology. They should remain as historical record.

Classification: docs/report historical only. Do not mass rewrite.

## 2. Proposed Target Terminology

### Preferred Engineering Concepts

- paid result access link
- report access link
- access link contact
- access link recipient secret
- access link delivery
- access link resolver
- access link bind state
- access link smoke

Avoid as primary future technical naming:

- recovery link
- recovery contact
- recovery recipient
- recovery bind

Allowed in limited contexts:

- support recovery / failure recovery for actual support fallback, stale jobs, or retry mechanics.

### Recommended DB / Schema Names

Use `paid_result` for the authorizing link artifact, and `payment` for payment-context contacts:

- `paid_result_access_links`
- `payment_access_link_contacts`
- `payment_access_link_contact_secrets`

Rationale:

- `paid_result_access_links` is precise: the row authorizes access to a paid result.
- `payment_access_link_contacts` is broader: the contact can be captured before entitlement exists and then bound later.
- `payment_access_link_contact_secrets` mirrors the contact table and keeps encrypted sendable recipient secrets isolated.

Recommended renamed columns:

- `recovery_contact_id` → `access_link_contact_id`

Recommended renamed purpose values:

- `paid_result_recovery` → `paid_result_access_link`
- `recovery_link_delivery` → `access_link_delivery`

### Recommended Helper Names

Preferred exports:

- `createPaidResultAccessLink`
- `resolvePaidResultAccessLink`
- `revokePaidResultAccessLink`
- `markPaidResultAccessLinkSent`
- `markPaidResultAccessLinkFailed`
- `markPaidResultAccessLinkUsed`
- `getActivePaidResultAccessLinkForContact`
- `getRecentPaidResultAccessLinkForContact`
- `createSupportPaidResultAccessLink`
- `createOrUpdateEmailAccessLinkContact`
- `createOrUpdateLineAccessLinkContact`
- `bindAccessLinkContactsToEntitlement`
- `getPaymentAccessLinkStatusSummary`
- `sendAccessLinksForCompletedPaidResult`
- `createAndSendEmailAccessLink`
- `createAndSendLineAccessLink`
- `createLineAccessLinkBindStateToken`
- `bindVerifiedLineUserToAccessLinkContact`

### Recommended File Names

- `payment-access-link-contacts.ts`
- `paid-result-access-links.ts`
- `payment-access-link-contact-secrets.ts`
- `access-link-token.ts`
- `access-link-contact-crypto.ts`
- `line-access-link-recipient-crypto.ts`
- `email-access-link.ts`
- `line-access-link.ts`
- `access-link-bind-state.ts`
- `access-link-bind-link.ts`
- `access-link-liff-context.ts`

### Recommended Script Names

- `qa:access-link:smoke`
- `qa:line-access-link:smoke`
- keep `ops:paid-result:lookup`

Keep old aliases temporarily:

- `qa:recovery-link:smoke`
- `qa:line-recovery:smoke`

## 3. What Should Not Change

Keep stable:

- `/r/[token]` route.
- Public short route `/r/`.
- Resolver behavior.
- 90-day validity.
- Multi-use until expiry/revocation.
- Hash-only token storage.
- Email/LINE send link only, not report body.
- Production fail-closed behavior.
- Existing user-facing copy already aligned.
- Historical reports/handoffs.
- `ops:paid-result:lookup` command name.

Reasoning:

- `/r/` is short, user-safe, and already product-neutral.
- The route does not expose `recovery` publicly.
- Changing `/r/` would create unnecessary user-facing and smoke-test churn.

## 4. Token Prefix Decision

### `prl_`

Options:

- Keep `prl_`: lowest churn, but future agents will keep seeing recovery semantics.
- Rename to `pal_`: clearer paid access link concept.
- Rename to `ral_`: report access link, but less specific than paid result access link.

Recommendation:

- Introduce `pal_` for newly generated paid result access links.
- Keep resolver support for existing `prl_` tokens until all staging/operator rows expire or are revoked.
- Keep the same `/r/[token]` route.
- Hash both token types with purpose-separated HMAC:
  - old: `paid_result_recovery_link:v1`
  - new: `paid_result_access_link:v1`

Rationale:

- Production has no runtime usage yet, but schema exists. A dual-prefix resolver is safer than assuming no tokens will exist.
- Staging has smoke/operator rows; dual-prefix support avoids breaking evidence/debugging.
- `pal_` is clearer than `prl_` and maps to paid access link.

### `rlb_`

Options:

- Keep `rlb_` indefinitely.
- Rename to `alb_` or `lalb_`.
- Add dual-prefix support and generate new prefix later.

Recommendation:

- Keep `rlb_` temporarily during the first code/schema rename phase.
- In the second phase, add dual-prefix support and generate `alb_` or `lalb_` for new LINE access-link bind states.
- Prefer `alb_` only if no collision with other internal tokens; otherwise use `lalb_` for LINE access-link bind.

Rationale:

- LIFF bind state has already been fragile in mobile smoke.
- Changing the prefix and route semantics at the same time would increase failure risk.
- `rlb_` is short-lived and not persisted in DB, so it is less harmful than persistent table/helper names.

## 5. DB Migration Strategy

The original task context said production DB had not applied access-link-related migrations. That is now stale. Production DB migration gates were applied in the immediately prior task, so the strategy must handle both staging and production already having recovery-named tables.

### Option A: Create New Access-Link Tables, Copy, Drop Old

Pros:

- Clean final schema names.
- Allows controlled copy and validation.
- Can keep old tables temporarily during compatibility.

Cons:

- More migration code.
- Requires sequence/FK/index recreation.
- Higher risk of divergence if dual writes are needed.

Fit:

- Good if data volume is tiny and production runtime is still disabled.
- More work than needed because table rename is sufficient.

### Option B: ALTER TABLE / COLUMN / INDEX / CONSTRAINT RENAME

Pros:

- Preserves data, FKs, row IDs, timestamps, and provider audit fields.
- Low data movement risk.
- Best fit now that both staging and production have the same recovery-named schema.
- Keeps migration history explicit and auditable.

Cons:

- Requires careful Drizzle schema alignment.
- Existing migration files remain recovery-named historical artifacts.
- Constraint/index rename details can be tedious.

Fit:

- Recommended.

### Option C: Keep DB Names, Add Code-Level Aliases Only

Pros:

- Lowest immediate risk.
- No DB migration.

Cons:

- Does not satisfy owner’s technical/schema alignment goal.
- Future agents will continue seeing recovery-named tables.
- Creates a split-brain model: access-link code over recovery schema.

Fit:

- Useful only as a short compatibility step, not final state.

### Recommended DB Strategy

Use Option B with a compatibility-first sequence:

1. Add code-level access-link aliases and script aliases while keeping old DB schema.
2. Add a new migration `0013_access_link_technical_rename.sql` that renames:
   - tables
   - foreign key columns
   - indexes
   - constraints
   - purpose values
3. Update Drizzle schema and helper imports to target access-link names.
4. Keep deprecated helper exports for one or two tasks.
5. Apply to Preview(staging), run full access-link smoke.
6. Apply to Production while runtime is still disabled.

Recommended table/column renames:

- `payment_recovery_contacts` → `payment_access_link_contacts`
- `paid_result_recovery_links` → `paid_result_access_links`
- `payment_recovery_contact_secrets` → `payment_access_link_contact_secrets`
- `recovery_contact_id` → `access_link_contact_id`

Recommended purpose value updates:

- `paid_result_recovery` → `paid_result_access_link`
- `recovery_link_delivery` → `access_link_delivery`

Recommended constraint/index renames:

- rename all `payment_recovery_contacts_*` to `payment_access_link_contacts_*`
- rename all `paid_result_recovery_links_*` to `paid_result_access_links_*`
- rename all `payment_recovery_contact_secrets_*` to `payment_access_link_contact_secrets_*`

## 6. Migration File Policy

Do not rewrite already-committed historical migrations `0009`–`0012`.

Recommended policy:

- Keep `0009`–`0012` as historical migration record.
- Add `0013_access_link_technical_rename.sql`.
- Update tests to assert the rename migration exists and Drizzle schema names are access-link aligned.
- Dashboard/report should state recovery-named migrations are legacy historical artifacts.

Why not rewrite old migrations:

- They are already applied to Preview(staging) and Production.
- Rewriting applied migrations creates audit confusion.
- A forward rename migration is safer and easier for future agents to reason about.

## 7. Compatibility Aliases

### Code

Add new access-link exports as primary names.

Keep old exports temporarily as deprecated aliases:

- `createPaidResultRecoveryLink` → `createPaidResultAccessLink`
- `resolvePaidResultRecoveryLink` → `resolvePaidResultAccessLink`
- `PaymentRecoveryContact` → `PaymentAccessLinkContact`
- `sendRecoveryLinksForCompletedPaidResult` → `sendAccessLinksForCompletedPaidResult`

Deprecation policy:

- Keep aliases for at least one full staging smoke cycle.
- Remove aliases only after dashboard, support docs, QA scripts, and production smoke tasks use access-link names.

### Scripts

Add new package scripts:

- `qa:access-link:smoke`
- `qa:line-access-link:smoke`

Keep aliases:

- `qa:recovery-link:smoke`
- `qa:line-recovery:smoke`

Alias output should use access-link wording but not break existing automation.

### Routes

Do not remove existing routes immediately:

- keep `/api/line/recovery/bind-liff`
- keep `/line/recovery/bind`
- keep `/api/modules/[moduleSlug]/result/[resultId]/recovery/email`
- keep operator recovery smoke endpoints during compatibility

Recommended future route aliases:

- `/api/line/access-link/bind-liff`
- `/line/access-link/bind`
- `/api/modules/[moduleSlug]/result/[resultId]/access-link/email`
- `/api/operator/access-link-smoke`
- `/api/operator/email-access-link-smoke`
- `/api/operator/line-access-link-smoke`

Do route aliases after code/schema aliases, not before.

## 8. Testing And Smoke Requirements

After implementation, run:

- `cd apps/web && corepack pnpm lint`
- targeted access-link/recovery compatibility tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm exec drizzle-kit check`
- `cd apps/web && corepack pnpm run qa:access-link:smoke`
- `cd apps/web && corepack pnpm run qa:recovery-link:smoke`
- `cd apps/web && corepack pnpm run qa:line-access-link:smoke` if introduced
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`
- support ops lookup smoke
- production fail-closed checks

Additional staging validation after DB rename:

- Verify old recovery-named tables absent or intentionally view-backed.
- Verify new access-link-named tables exist.
- Verify existing staging operator/test rows migrated.
- Verify `/r/[token]` works for old `prl_` if any active rows exist.
- Verify new `pal_` generated token works if token prefix changes are implemented.
- Verify Email and LINE provider smoke paths remain gated and do not send unless explicitly invoked.

## 9. Risks

- Migration churn: renaming tables, columns, indexes, constraints, and purpose values can break Drizzle schema if partially applied.
- Staging DB rename/copy risk: staging has operator smoke rows; they are test rows but useful evidence.
- Production schema now exists: production rename must be handled as a real migration, even though runtime is disabled and rows are empty.
- `/r/` resolver risk: accidental token-prefix break could invalidate active staging links.
- LIFF risk: LINE bind was fragile; do not combine route alias, prefix rename, and schema rename in one untested step.
- Stale docs/scripts: partial rename may increase confusion if old and new terms coexist without an explicit transition note.
- Migration history confusion: rewriting historical migrations would be misleading now that they are applied.
- Token prefix compatibility: switching `prl_` to `pal_` without dual-prefix support would break existing smoke rows.

## 10. Recommended Implementation Sequence

Recommended phased path:

### Task A: Access Link Code Alias + Script Rename v0

Scope:

- Add access-link-named helper exports and file-level comments.
- Add new package script aliases:
  - `qa:access-link:smoke`
  - `qa:line-access-link:smoke`
- Keep old recovery exports/scripts working.
- Update active docs/dashboard to say recovery names are legacy aliases.
- No DB migration.

Why first:

- Reduces future code churn.
- Lets tests and scripts start using new names before schema migration.
- Lowers risk of a DB rename by shrinking semantic change first.

### Task B: Access Link Token Prefix Compatibility v0

Scope:

- Add `pal_` generation for paid result access links.
- Keep `prl_` validation/resolution compatibility.
- Do not change `/r/`.
- Keep `rlb_` unchanged for LINE bind state.

Why second:

- Token behavior is security-sensitive and deserves isolated tests.

### Task C: Access Link DB Rename Migration v0

Scope:

- Add `0013_access_link_technical_rename.sql`.
- Rename tables, column, indexes, constraints, and purpose values.
- Update Drizzle schema to access-link names.
- Keep deprecated code aliases.
- Run full local validation.
- Do not apply production in the implementation task unless explicitly approved.

Why third:

- By this point code/tests already understand access-link terminology.

### Task D: Access Link Staging Apply / End-to-End Regression v0

Scope:

- Apply DB rename migration to Preview(staging).
- Run full no-card, access-link, LINE bind/message, Email/link, and support lookup smoke as needed.
- Verify compatibility aliases.

### Task E: Access Link Production Rename Apply v0

Scope:

- Apply rename migration to Production while runtime remains disabled.
- Verify fail-closed behavior.
- Proceed only after staging rename passes.

## One Large Task Or Phased?

Recommend phased implementation.

Reasoning:

- The repo has many active recovery-named runtime paths.
- Production schema is already applied, so DB rename is no longer a zero-cost migration-file edit.
- LINE LIFF behavior has a history of environment-specific failures; keep route/bind changes isolated.
- Phased compatibility lets old smoke commands continue passing while new access-link names become primary.

If the owner wants a bolder path, combine Tasks A and B only. Do not combine code aliases, token prefix switch, DB rename, route aliasing, and staging DB apply into one task.

## Documentation Plan

Active docs/dashboard should use this transition rule:

- “Access link” is the preferred current term.
- Existing `recovery` names are legacy internal aliases until technical rename tasks complete.
- Historical reports remain unchanged.
- Production runtime remains disabled until separate launch gate approval.

## Validation For This Planning Task

Documentation-only validation:

- docs presence check
- dashboard HTML sanity if dashboard changed
- current-diff secret/private scan
- `git diff --check`

No runtime behavior was changed in this task.

## Recommended Next Task

Access Link Code Alias + Script Rename v0.

Acceptance criteria for that next task:

- New access-link helper exports exist.
- New QA script names exist.
- Old recovery helper exports and script names still pass as aliases.
- No DB/schema migration yet.
- Full lint/test/build and no-card/access-link smoke pass.
