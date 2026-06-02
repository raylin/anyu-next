# LINE Recovery Bind Staging Smoke v0

Date: 2026-06-03

## Summary

Preview(staging) was fresh on commit `0ebe9e98c0a1`, and automated payment/recovery regressions passed. Checkout-start LINE CTA surface verification passed: Email remained primary, LINE appeared as a secondary save/recovery method, copy did not promise LINE report-body delivery, and the LINE href used an `rlb_` state without visible `pa_`, `pcs_`, `prl_`, unlock route, short code, or provider payload values.

Owner-assisted LINE mobile smoke did not complete. The visible failure was:

- `缺少 LINE 保存狀態`

This was classified as `state_missing`. Investigation found the LIFF client bridge could lose the server-rendered query state when the browser-side LINE/LIFF navigation had an empty or altered `window.location.search`. A minimal fix was added so the client preserves server-provided `initialSearch` when browser state is missing and also parses hash-based LIFF state safely.

No LINE message was sent. No production env, DB, or payment runtime changes were made.

## Staging Freshness

`https://staging.anyu.tw/api/health` returned:

| Field | Result |
| --- | --- |
| environment | `preview` |
| branch | `staging` |
| git commit | `0ebe9e98c0a1` |
| routeBundleVersion | `payment-foundation-2026-05-29` |

Freshness result: pass.

## Automated Regression

### `qa:result-checkout:no-card`

Result: pass.

Covered:

- staging target/secret/health preflight
- fresh Module 01 result creation
- result-page paid CTA
- checkout-start rendering
- Email primary recovery option
- LINE recovery CTA signal
- provider field names present without printing values
- operator fake-paid path
- queue completion
- paid access render
- production checkout/fake-paid fail-closed checks

### `qa:recovery-link:smoke`

Result: pass.

Covered:

- Preview runtime operator recovery-link smoke
- valid `/r/[REDACTED]` resolver render
- invalid-link safety
- cleanup by revocation
- production recovery-link smoke endpoint fail-closed
- no raw `prl_`, token hash, `pa_`, `pcs_`, Email, or LINE values printed

## CTA Surface Verification

Fresh checkout-start surface was inspected with sanitized output.

Result: pass.

Verified:

- Email remains primary/default recovery option.
- LINE CTA is visible as secondary/alternate save method.
- Copy says `用 LINE 保存這份報告`.
- Copy says `之後可以透過 LINE 協助找回`.
- No `LINE 領取完整分析`, `完整報告會傳到 LINE`, or `LINE 交付報告`.
- LINE href path is `/line/recovery/bind`.
- LINE state shape is `rlb_[REDACTED]`.
- Return path shape is `/m/ambiguous-temperature/result/[REDACTED]/checkout`.
- LINE href did not visibly contain `pa_`, `pcs_`, `prl_`, `/unlock/`, `unlockToken`, `short-code`, `TradeInfo`, or `TradeSha`.

Note: the checkout-start page correctly includes provider field names in the payment form. Provider field values were not printed.

## Owner-Assisted LIFF Smoke

Method:

- Owner opened the visible LINE recovery CTA in a LINE mobile context / test account.
- Owner did not paste tokenized URLs, LIFF state, idToken, cookies, LINE ID, or screenshots with private values.

Observed result:

- fail
- visible copy: `缺少 LINE 保存狀態`

Failure classification:

- `state_missing`

Impact:

- Checkout/report access was not blocked.
- Email fallback remains available.
- This is not a paid delivery failure.
- No LINE message was sent.

## Minimal Fix Applied

Files changed:

- `apps/web/src/components/line/LineRecoveryBindBridge.tsx`
- `apps/web/src/lib/line/recovery-liff-context.ts`
- `apps/web/src/tests/line-recovery-liff-page.test.tsx`

Behavior:

- The LIFF bridge now parses browser search plus hash state.
- If browser-side state is missing, it falls back to the server-rendered `initialSearch`.
- State safety checks still reject token-like and legacy fulfillment values.

Why this fix is narrow:

- It does not change the bind route.
- It does not change DB schema.
- It does not send LINE messages.
- It does not alter payment/provider behavior.
- It only makes the recovery LIFF page more tolerant of LINE/LIFF navigation state handling.

## DB Verification

Sanitized baseline query against Neon project `anyu-next`, branch `preview`, database `neondb`:

| Check | Result |
| --- | --- |
| `contact_type=line` count before owner smoke | `0` |
| transactional consent count | `0` |
| line hash present count | `0` |
| contact hash present count | `0` |

Post-bind DB verification result:

- Not completed because the owner-assisted LIFF bind failed before route submission.
- No raw LINE ID or hash was printed.
- The local `DATABASE_URL` is not the staging recovery DB target and was not used for final DB proof.

Expected next verification after redeploy/retry:

- `payment_recovery_contacts` row created or updated
- `contact_type=line`
- `transactional_consent_at` recorded
- source `checkout_start` or `completed_result`
- line/contact hash fields present but not printed
- raw LINE user ID absent from `payment_recovery_contacts`

## Production Safety

Production safety result: pass.

Confirmed:

- Production health remains `environment=production`, branch `main`.
- Production checkout route returns JSON `404/not_found`.
- Production fake-paid route returns JSON `404/not_found`.
- Production recovery-link smoke endpoint returns `404`.
- Production env/DB were not modified.
- Production payment runtime remains disabled/fail-closed.
- No LINE messages or Email were sent by this task.

## Validation

Code validation after the minimal fix:

- `cd apps/web && corepack pnpm exec vitest run src/tests/line-recovery-liff-page.test.tsx src/tests/line-recovery-bind-state.test.ts src/tests/line-recovery-bind-route.test.ts src/tests/newebpay-checkout-start-page.test.tsx src/tests/paid-result-recovery-save-section.test.tsx`: passed, 27 tests
- `cd apps/web && corepack pnpm lint`: passed
- `cd apps/web && corepack pnpm test`: passed, 75 files / 496 tests
- `cd apps/web && corepack pnpm build`: passed
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`: passed against currently deployed Preview(staging) commit `0ebe9e98c0a1`
- `cd apps/web && corepack pnpm run qa:recovery-link:smoke`: passed against currently deployed Preview(staging) commit `0ebe9e98c0a1`

Documentation/safety validation:

- docs presence check: pending final commit check
- secret/private scan: pending final commit check
- `git diff --check`: pending final commit check

## Tech Debt Review

New technical debt introduced:

- None beyond the existing need to retry owner-assisted LIFF smoke after redeploy.

Existing technical debt observed:

- Completed-result LINE bind still returns to a safe module page instead of a tokenized paid page until a non-tokenized paid access handoff exists.
- Local `.env.local` `DATABASE_URL` does not point to the staging recovery DB target, so sanitized DB verification should use Neon preview branch tooling or a future operator DB-check helper.

Opportunistic cleanup completed:

- Hardened LIFF recovery context parsing for hash/full-URL state forms.
- Preserved server-side state during client hydration when LINE/LIFF strips browser query state.

Deferred cleanup candidates:

- Add a reusable sanitized LINE recovery bind DB verification helper.
- Add a safe non-tokenized completed-result return handoff for LIFF success.

## Recommended Next Step

Redeploy/push the LIFF state-preservation fix, then rerun `LINE Recovery Bind Staging Smoke v0` owner-assisted mobile flow. If it passes, continue to `LINE Recovery Link Sending v0`.
