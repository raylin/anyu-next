# Paid Result Save CTA Staging Smoke v0

Date: 2026-06-01

## Scope

Staging smoke for the paid-ready and completed-result recovery save CTA. This task did not modify runtime code, env values, production settings, database schema, payment provider behavior, Email sending, LINE push, membership, or Module 02 work.

## Staging Freshness

Result: PASS.

- `staging.anyu.tw` served environment `preview`.
- Branch was `staging`.
- Deployed commit was `46da41a088c4`, matching the target implementation commit.
- `routeBundleVersion` was `payment-foundation-2026-05-29`.

## Recovery Config Preflight

Result: PASS by env-name presence only.

Vercel Preview(`staging`) showed encrypted branch-scoped entries for:

- `PAYMENT_RECOVERY_CONTACT_HASH_SECRET`
- `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY`
- `OPERATOR_TEST_SECRET`

No values, lengths, prefixes, suffixes, hashes, checksums, or derived values were printed.

## No-Card Paid Flow Smoke

Result: PASS.

Command:

```bash
cd apps/web && corepack pnpm run qa:result-checkout:no-card
```

Sanitized result:

- target preflight: pass
- staging health: pass at commit `46da41a088c4`
- source analyze: pass
- result-page checkout CTA: pass
- checkout-start page: pass
- checkout-start recovery gate signals: pass
- operator fake-paid success: pass
- queue trigger: `vercel_queue` enqueued
- paid status: reached completed
- paid access render: pass
- production disabled check: pass

Limitation:

- The no-card helper uses the operator fake-paid path and does not submit a NewebPay provider payment.

## Paid-Ready Recovery Reminder

Result: PARTIAL.

The smoke confirmed the deployed code can reach paid completion and paid access through the no-card path. The task did not produce a stable browser-observed ReturnURL `paid_ready` surface because the no-card flow validates paid-result status and paid access directly rather than using a live provider ReturnURL handoff.

Validated by tests from implementation:

- saved state keeps `查看完整報告` primary
- unsaved state shows non-blocking reminder
- failed recovery state does not block access

Recommended follow-up:

- Include ReturnURL `paid_ready` reminder in the next real sandbox or browser-based staging smoke.

## Completed-Result Save Section

Result: PASS for unsaved render.

A temporary local-only staging smoke kept raw access tokens in memory and printed only sanitized booleans. It verified:

- completed paid result rendered
- unsaved section appeared
- `保存這份完整分析` appeared
- Email input appeared
- separate marketing opt-in appeared
- deferred LINE option appeared
- no internal-test / no-charge / Email delivery / LINE delivery copy was found
- fake test Email was not echoed before submission

Note:

- A naive HTML search matched the existing paid-access token because the smoke used the legacy paid access token route. This is existing route-context exposure, not a newly added hidden form field. The implementation added no hidden `pa_` or `pcs_` form fields.

## Email Save QA

Result: BLOCKED / NOT VERIFIED LIVE.

Attempted methods:

1. Direct server-action form POST from Node:
   - completed-result save section rendered
   - form action was present
   - direct POST returned HTTP 500
   - saved-state fallback check was not accepted as proof because it did not prove DB mutation

2. Browser-level Playwright form submission:
   - the flow reached completed paid result
   - Chromium launch failed under the local sandbox due macOS Mach port permission restrictions
   - no Email was sent
   - no raw Email, encrypted value, hash, or token was printed

Conclusion:

- Completed-result save section renders correctly on staging.
- Live Email-save DB mutation from the completed-result server action remains unverified in this task.
- This appears to be a QA-tooling limitation rather than evidence of a runtime UI failure, but it should not be marked as passed until browser/form submission is verified.

## Skip / Unsaved Behavior

Result: PASS.

- Unsaved completed result still rendered and remained accessible.
- Save CTA is non-blocking.
- No-card paid access render passed before any recovery save.

## Production Safety

Result: PASS.

From no-card QA:

- production health route returned production environment
- production checkout route returned JSON `404 / not_found`
- production fake-paid route returned JSON `404 / not_found`

No production env, DB, runtime flag, or migration was modified.

## Validation

Docs-only after smoke:

- docs presence check: pending at commit stage
- secret/private scan: pending at commit stage
- `git diff --check`: pending at commit stage

No runtime code changed in this task, so app lint/test/build were not rerun.

## First Failure / Remaining Gap

First unresolved QA gap:

- `email_save_submit_unverified`

Details:

- Direct server-action POST is not a reliable browser-equivalent submission path.
- Browser-level form submission could not run because the local sandbox blocked Chromium launch.

## Recommended Next Task

Run **Paid Result Save CTA Browser Email Save Smoke v0** in an environment where Chromium/browser automation can launch, or manually verify in a browser:

1. open a completed paid result on staging
2. enter a fake reserved-domain Email
3. submit save
4. confirm saved state after refresh
5. verify staging DB row by sanitized aggregate checks only
6. remove the fake QA row if safe

Do not change production env, send Email, send LINE push, or run real payments.
