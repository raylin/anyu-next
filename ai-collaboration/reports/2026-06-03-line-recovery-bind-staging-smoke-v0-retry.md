# LINE Recovery Bind Staging Smoke v0 Retry

Date: 2026-06-03

## Summary

Preview(staging) served the LIFF missing-state fix at commit `472eef33e1a2`, and automated regressions passed. Checkout-start LINE CTA copy and href/state safety passed again.

Owner-assisted LINE mobile retry progressed past the previous `缺少 LINE 保存狀態` failure, confirming the state-preservation fix worked. The next visible failure was a LINE login transition error:

- `400 Bad Request`

This was classified as `liff_context_failed`. The likely cause was that the visible CTA still opened the app route `/line/recovery/bind?...` directly, then called `liff.login({ redirectUri: window.location.href })` from a normal web URL. For LIFF, the safer path is to enter through the configured `https://liff.line.me/{LIFF_ID}` URL so LINE handles the registered LIFF endpoint and returns state through LIFF context.

A second narrow fix was added:

- `createLineRecoveryBindHref` now builds a recovery-specific LIFF entry URL from `NEXT_PUBLIC_LINE_LIFF_URL` when configured.
- It preserves the existing internal `/line/recovery/bind` fallback when LIFF URL config is absent.
- It keeps the same `rlb_` state and forbidden token checks.

No LINE messages were sent. No production env, DB, payment runtime, provider behavior, schema, or route semantics were changed.

## Staging Freshness

`https://staging.anyu.tw/api/health` returned:

| Field | Result |
| --- | --- |
| environment | `preview` |
| branch | `staging` |
| git commit | `472eef33e1a2` |
| routeBundleVersion | `payment-foundation-2026-05-29` |

Freshness result: pass.

Production health remained:

| Field | Result |
| --- | --- |
| environment | `production` |
| branch | `main` |
| git commit | `1990fc034d74` |

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

Verified on the deployed pre-second-fix build:

- Email remains primary/default recovery option.
- LINE CTA is visible as save/recovery method.
- Copy says `用 LINE 保存這份報告`.
- Copy says `之後可以透過 LINE 協助找回`.
- No `LINE 領取完整分析`, `完整報告會傳到 LINE`, or `LINE 交付報告`.
- LINE href state shape is `rlb_[REDACTED]`.
- Return path shape is `/m/ambiguous-temperature/result/[REDACTED]/checkout`.
- LINE href did not visibly contain `pa_`, `pcs_`, `prl_`, `/unlock/`, `unlockToken`, `short-code`, `TradeInfo`, or `TradeSha`.

The second fix changes the CTA target shape when `NEXT_PUBLIC_LINE_LIFF_URL` is configured:

- from app-route-first `/line/recovery/bind?...`
- to LIFF-entry-first `https://liff.line.me/{LIFF_ID}?state=rlb_[REDACTED]&returnPath=...`

The raw `rlb_` value remains redacted from reports.

## Owner-Assisted LIFF Retry

Method:

- Owner opened the checkout-start LINE recovery CTA in a LINE mobile context / test account.
- Owner did not paste tokenized URLs, LIFF state, idToken, cookies, LINE ID, or screenshots with private values.

Observed retry result:

- Previous `缺少 LINE 保存狀態` was gone.
- Page transitioned to LINE login.
- LINE then showed `400 Bad Request`.

Failure classification:

- `liff_context_failed`

Impact:

- Checkout/report access was not blocked.
- Email fallback remains available.
- This is not a paid delivery failure.
- No LINE message was sent.

## Minimal Fix Applied

Files changed:

- `apps/web/src/lib/line/recovery-bind-link.ts`
- `apps/web/src/tests/line-recovery-bind-state.test.ts`
- `apps/web/src/tests/newebpay-checkout-start-page.test.tsx`
- `apps/web/src/tests/paid-result-recovery-save-section.test.tsx`

Behavior:

- Recovery LINE CTA uses `NEXT_PUBLIC_LINE_LIFF_URL` when available.
- For `liff.line.me` URLs, the helper keeps only the LIFF ID path and carries recovery state as query params.
- Internal `/line/recovery/bind` remains the fallback when LIFF URL config is absent.
- Tests cover LIFF URL generation and token exclusion.

Why this fix is narrow:

- It does not modify the LIFF bind API.
- It does not modify schema or DB.
- It does not send LINE messages.
- It does not alter payment/provider behavior.
- It only changes the entry URL for the existing recovery-specific LIFF flow.

## DB Verification

Sanitized baseline query against Neon project `anyu-next`, branch `preview`, database `neondb` before retry:

| Check | Result |
| --- | --- |
| `contact_type=line` count | `0` |
| transactional consent count | `0` |
| line hash present count | `0` |
| contact hash present count | `0` |

Post-bind DB verification result:

- Not completed because the owner-assisted retry failed at LINE login before bind route submission.
- No raw LINE ID or hash was printed.

Expected next verification after redeploy/retry:

- `payment_recovery_contacts` row created or updated
- `contact_type=line`
- `transactional_consent_at` recorded
- source `checkout_start`
- line/contact hash fields present but not printed
- raw LINE user ID absent from `payment_recovery_contacts`

## Production Safety

Production safety result: pass.

Confirmed:

- Production health remains `environment=production`, branch `main`.
- Production checkout/fake-paid/operator routes stayed fail-closed through automated QA.
- Production env/DB were not modified.
- Production payment runtime remains disabled/fail-closed.
- No LINE messages or Email were sent by this task.

## Validation

Code validation after the second minimal fix:

- `cd apps/web && corepack pnpm exec vitest run src/tests/line-recovery-bind-state.test.ts src/tests/line-recovery-liff-page.test.tsx src/tests/line-recovery-bind-route.test.ts src/tests/newebpay-checkout-start-page.test.tsx src/tests/paid-result-recovery-save-section.test.tsx`: passed, 28 tests
- `cd apps/web && corepack pnpm lint`: passed
- `cd apps/web && corepack pnpm test`: passed, 75 files / 497 tests
- `cd apps/web && corepack pnpm build`: passed
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`: passed against currently deployed Preview(staging) commit `472eef33e1a2`
- `cd apps/web && corepack pnpm run qa:recovery-link:smoke`: passed against currently deployed Preview(staging) commit `472eef33e1a2`

Documentation/safety validation:

- docs presence check: pending final commit check
- secret/private scan: pending final commit check
- `git diff --check`: pending final commit check

## Tech Debt Review

New technical debt introduced:

- None beyond needing another owner-assisted retry after the LIFF-entry URL fix deploys.

Existing technical debt observed:

- Completed-result LINE bind still returns to a safe module page instead of a tokenized paid page until a non-tokenized paid access handoff exists.
- A reusable sanitized LINE bind DB-check helper would reduce manual Neon read-only queries.

Opportunistic cleanup completed:

- Recovery LINE CTA now uses the configured LIFF entry URL, matching the existing legacy LIFF URL operational pattern without reusing legacy fulfillment semantics.
- Tests now cover both internal fallback mode and LIFF entry mode.

Deferred cleanup candidates:

- Add a recovery-specific LIFF diagnostic snapshot if further mobile-only failures occur.
- Add a safe non-tokenized completed-result return handoff for LIFF success.

## Recommended Next Step

Redeploy/push the LIFF-entry URL fix, then rerun `LINE Recovery Bind Staging Smoke v0 Retry`. If it passes, continue to `LINE Recovery Link Sending v0`.
