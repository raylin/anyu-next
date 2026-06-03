# Support Ops Helper v0

Date: 2026-06-03

## Completed Work

- Added local operator command `ops:paid-result:lookup`.
- Added `apps/web/scripts/support-paid-result-lookup.mjs` as a read-only support diagnostic helper.
- Added focused tests for lookup parsing, production blocking, access-link active semantics, diagnosis categories, contact masking, and redaction.
- Added missing-env dry-run behavior that fails safely without printing local secrets or DB connection values.

## Command

```bash
cd apps/web
corepack pnpm run ops:paid-result:lookup -- --result-id <analysis_result_id>
```

Supported lookup keys:

- `--result-id`
- `--payment-intent-id`
- `--merchant-order-no`
- `--email` using normalized Email hash lookup
- `--recovery-link-id`
- `--report-reference` is accepted syntactically but returns `report_reference_not_mapped` because report reference codes are display-only and not stored as a reverse lookup key in v0.

## Output Shape

The helper returns sanitized JSON with:

- payment status, provider environment, payment timestamps, and refund markers
- entitlement status and lifecycle timestamps
- generation job status, attempt counts, and safe error categories
- paid result status and completion/failure timestamps
- Email saved status, count, source/status, transactional consent timestamp, and masked Email only when the lookup input itself was Email
- LINE saved status, count, source/status, transactional consent timestamp, and active recipient-secret presence
- access-link aggregate status by channel, including active-link existence, sent/used/expired/revoked/failed summary, send attempt count, safe provider status, and failure category
- provider message ID presence only as a boolean
- diagnosis categories and recommended support actions

The helper does not return raw identifiers that authorize access. It does not create or send links.

## Diagnosis Categories

Implemented categories:

- `paid_result_ready`
- `paid_processing`
- `paid_failed`
- `payment_waiting`
- `payment_not_found`
- `entitlement_missing`
- `access_link_sent`
- `access_link_failed`
- `access_link_missing`
- `email_saved_no_send`
- `line_saved_no_send`
- `no_saved_contact`
- `duplicate_payment_possible`
- `refund_review_needed`
- `unknown`

Recommended actions are non-mutating in v0, including asking for order reference, checking spam, unblocking LINE official account, retrying processor if safe, future gated support resend, or refund/escalation review.

## Redaction Guarantees

The script selects only safe DB columns and refuses unsafe output patterns.

It does not select or print:

- raw `pa_`, `pcs_`, or `prl_` tokens
- token hashes
- raw Email except the operator-provided Email is immediately masked for output
- raw LINE userId
- contact hashes
- encrypted recovery contact values
- encrypted LINE recipient values
- recipient hashes
- provider payloads
- raw user/source text
- tokenized `/r/` URLs

Provider message IDs are summarized as presence-only booleans in this helper.

## Environment / Production Safety

- Local `.env.local` autoload remains enabled by default for operator use.
- `staging` is the default target.
- `production` target is rejected unless the operator passes `--allow-production-readonly`.
- Even with production read-only enabled, this helper performs no writes, sends no Email/LINE messages, creates no links, and changes no env.
- Missing `DATABASE_URL` returns a sanitized failure category without printing values.

## Validation

- `corepack pnpm exec vitest run src/tests/support-paid-result-lookup.test.ts`: passed
- `corepack pnpm lint`: passed after removing an unused test import
- missing-env dry run: passed safely with `database_url_missing` and no values printed
- `corepack pnpm test`: passed, 79 files / 541 tests
- `corepack pnpm build`: passed
- `corepack pnpm run qa:recovery-link:smoke`: passed against Preview(staging), no Email/LINE sent, production fail-closed passed
- `corepack pnpm run qa:result-checkout:no-card`: passed against Preview(staging), paid access rendered, production fail-closed passed

## Architecture Decisions

- Implemented as a local CLI script, not a public route or admin UI.
- Kept support resend as a recommendation only; v0 diagnostics do not perform mutation.
- Report reference reverse lookup is intentionally unsupported because the code is display-only and non-authorizing.
- Email lookup uses existing normalized `payment_recovery_contact:v1:email` hash semantics and requires `PAYMENT_RECOVERY_CONTACT_HASH_SECRET`.
- Access-link active semantics treat sent and used links as active until expiry or revocation.

## Blockers / Uncertainties

- Report reference lookup requires a stored mapping or deterministic DB-side reverse-search strategy before it can be a practical support key.
- Provider message IDs are presence-only in v0; a future support flow may need redacted provider ID display if operationally useful.
- Public resend/self-service remains deferred until rate limiting and non-enumerating responses exist.

## Tech Debt Review

- New technical debt introduced: support script uses direct SQL column mapping instead of shared Drizzle services to remain CLI/simple; acceptable for v0 but should be kept small.
- Existing technical debt observed: report reference code is display-only and cannot be reverse-looked up for support.
- Opportunistic cleanup completed: fixed a UUID validation typo caught by tests during script implementation.
- Deferred cleanup candidates: promote common active access-link summary logic into a shared read-only service if support tooling expands.

## Suggested Next Steps

1. Support Ops Helper Staging Lookup Smoke v0 using known staging test artifacts.
2. Support Resend Operator Action v0 after verification/rate-limit rules are approved.
3. Module 02 Concept Spec: 職場暗流雷達 v0 if Module 01 support diagnostics are sufficient for now.
