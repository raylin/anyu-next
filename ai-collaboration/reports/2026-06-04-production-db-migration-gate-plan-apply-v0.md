# Production DB Migration Gate Plan / Apply v0

Date: 2026-06-04  
Scope: Production DB migration gate only  
Result: Passed

## Completed Work

- Verified the Neon Production DB target before running SQL.
- Ran read-only preflight checks for existing tables, entitlement duplicate risk, row counts, and audit-column presence.
- Applied the required production DB migration gates only:
  - `0008_entitlements_payment_intent_unique.sql`
  - `0009_payment_recovery_contacts.sql`
  - `0010_paid_result_recovery_links.sql`
  - `0011_payment_recovery_contact_secrets.sql`
  - `0012_paid_result_recovery_link_send_audit.sql`
- Verified post-apply schema state and aggregate row readability.
- Confirmed production payment/runtime routes remain fail-closed.
- Confirmed public production pages remain live.
- Inventoried Production env names presence-only.

No production checkout/runtime flag was enabled. No payment was run. No Email or LINE message was sent.

## Production DB Target Verification

- Production DB target confirmed: true
- Connection source category: Neon MCP project/branch execution against the verified production branch
- Production project category: `anyu-next`
- Production branch category: primary/default production branch
- Staging DB not targeted: true

Sensitive values were not printed. No connection strings, credentials, token values, provider payloads, or private customer data were recorded.

## Preflight Checks

Read-only production preflight results:

- `payment_intents` table existed.
- `entitlements` table existed.
- `payment_recovery_contacts` table did not exist.
- `paid_result_recovery_links` table did not exist.
- `payment_recovery_contact_secrets` table did not exist.
- Provider send audit columns did not exist because `paid_result_recovery_links` was not present yet.
- Production aggregate row counts:
  - payment intents: 0
  - entitlements: 0
- Duplicate non-null entitlement `payment_intent_id` groups: 0
- Existing old entitlement payment-intent index was present.
- New partial unique entitlement payment-intent index was not present.

Duplicate risk was clean, so the unique index migration was safe to apply.

## Migrations Applied

Applied to Production DB only:

1. `0008_entitlements_payment_intent_unique.sql`
   - Created partial unique index for non-null entitlement `payment_intent_id`.
   - Dropped the older non-unique entitlement payment-intent index.
   - Applied `CREATE INDEX CONCURRENTLY` / `DROP INDEX CONCURRENTLY` outside a transaction.
2. `0009_payment_recovery_contacts.sql`
   - Created `payment_recovery_contacts`.
   - Created expected lookup/dedupe indexes.
3. `0010_paid_result_recovery_links.sql`
   - Created `paid_result_recovery_links`.
   - Created expected lookup/token/status indexes.
4. `0011_payment_recovery_contact_secrets.sql`
   - Created `payment_recovery_contact_secrets`.
   - Created expected constraints and lookup indexes.
5. `0012_paid_result_recovery_link_send_audit.sql`
   - Added inline provider send audit columns to `paid_result_recovery_links`.

No unrelated migrations were applied.

## Post-Apply Verification

Post-apply schema verification passed:

- `payment_recovery_contacts` exists.
- `paid_result_recovery_links` exists.
- `payment_recovery_contact_secrets` exists.
- Partial unique `entitlements_payment_intent_unique_idx` exists.
- Old non-unique `entitlements_payment_intent_idx` is absent.
- Expected recovery contact indexes exist.
- Expected access-link indexes exist.
- Expected recipient secret indexes exist.
- Expected recipient secret check constraints exist:
  - channel
  - purpose
  - status
- Provider audit columns exist:
  - `provider_message_id`
  - `last_send_attempt_at`
  - `send_attempt_count`
  - `last_failure_category`
  - `last_provider_status`
- Duplicate entitlement preflight remained clean.
- Production rows remained readable.

Post-apply aggregate row counts remained empty for the payment/recovery tables checked:

- payment intents: 0
- entitlements: 0
- payment recovery contacts: 0
- paid result recovery links: 0
- payment recovery contact secrets: 0

## Production Runtime Safety

Production runtime remained disabled/fail-closed after DB apply:

- Production health returned `environment=production`.
- Production branch reported as `main`.
- Route bundle version remained `payment-foundation-2026-05-29`.
- Public pages returned 200:
  - `/`
  - `/refund`
  - `/legal`
- Production checkout route returned fail-closed 404.
- Production fake-paid/operator route returned fail-closed 404.
- Production recovery-link operator smoke route returned fail-closed 404.
- Production LINE recovery operator smoke route returned fail-closed 404.

No production payment was initiated. No provider form, TradeInfo, or TradeSha was generated.

## Production Env Gate Inventory

Presence-only Vercel Production env inventory:

Present:

- `ENABLE_PAYMENT_RUNTIME`
- `ENABLE_NEWEBPAY_CHECKOUT`
- `NEWEBPAY_NOTIFY_URL`
- `NEWEBPAY_CHECKOUT_URL`
- `NEWEBPAY_ENVIRONMENT`
- `NEWEBPAY_HASH_IV`
- `NEWEBPAY_HASH_KEY`
- `NEWEBPAY_MERCHANT_ID`
- `NEXT_PUBLIC_APP_URL`
- existing LINE channel / LIFF env names
- existing model/database/runtime support env names

Still gated or not configured for future controlled production smoke:

- `PAYMENT_RECOVERY_CONTACT_HASH_SECRET`
- `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY`
- `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`
- `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`
- `EMAIL_PROVIDER`
- `EMAIL_FROM`
- `RESEND_API_KEY`
- LINE recovery message provider env, if using a distinct production flag/name from legacy LINE channel env
- any production-only operator smoke gate required for controlled payment/access-link validation

No values were printed or copied.

## Architecture Decisions

- Applied the production DB gate before enabling production payment runtime.
- Kept `CREATE INDEX CONCURRENTLY` statements outside transactions.
- Applied only missing required migrations, not unrelated schema changes.
- Treated production provider credentials and recovery/access-link runtime secrets as separate gates.
- Kept NewebPay approval as Payment Capability Gate only, not Growth / Ads Launch.

## Blockers

None for the production DB migration gate.

## Remaining Blockers Before Controlled Production Payment Smoke

- Production access-link/recovery secret env gate:
  - contact hash/encryption secret
  - recovery link token secret
  - LINE recipient encryption secret
- Production Email provider gate, if production Email access-link delivery is part of the smoke.
- Production LINE provider gate, if production LINE access-link delivery is part of the smoke.
- Confirm provider dashboard settings:
  - credit-card one-time payment enabled
  - Apple Pay / Google Pay / Samsung Pay non-blocking and separate
  - ATM / WebATM / convenience store / installment / rewards disabled for first smoke
- Controlled Production Payment Smoke v0 approval with credit-card one-time payment only.
- Runtime flags must remain disabled until the explicit smoke task.

## Uncertainties

- Whether production Email/LINE provider env should be aligned before or during the controlled production payment smoke.
- Whether owner wants the controlled smoke to include Email-only access-link delivery first, or both Email and LINE.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: production env gate inventory is still manual/presence-only; a dedicated launch preflight helper could reduce operator error.
- Opportunistic cleanup completed: dashboard status updated to remove stale production DB blocker wording.
- Deferred cleanup candidates:
  - Production Access-Link / Provider Env Gate helper.
  - Controlled production payment smoke checklist automation.
  - Provider dashboard settings evidence checklist.

## Suggested Next Steps

1. Production Access-Link / Provider Env Gate v0.
2. Controlled Production Payment Smoke v0 with credit-card one-time payment only.
3. Module 02 Concept Spec: 職場暗流雷達 v0 after payment capability is operationally gated.
