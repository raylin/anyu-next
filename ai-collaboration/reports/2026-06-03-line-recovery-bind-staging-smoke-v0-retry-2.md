# LINE Recovery Bind Staging Smoke v0 Retry 2

Date: 2026-06-03

## Summary

Preview(staging) served the LIFF-entry URL fix at commit `0f0801d9b5c5`, and automated regressions passed. The checkout-start LINE CTA now uses the configured LIFF entry host `liff.line.me` with redacted `rlb_` state and no visible forbidden token substrings.

Owner-assisted LINE mobile Retry 2 progressed past the previous `400 Bad Request` login failure, but landed on legacy fulfillment UI:

- `正在確認完整分析頁`
- `LINE 短碼連結缺少有效測驗資料`

This was classified as `liff_page_missing` / legacy entry routing. The configured LIFF app endpoint still resolves to the legacy `/line/fulfill` page, so recovery state arriving through LIFF was being handled by `LineFulfillBridge` instead of `LineRecoveryBindBridge`.

A third narrow fix was added:

- `/line/fulfill` now detects recovery `rlb_` context from direct query or `liff.state` and renders `LineRecoveryBindBridge`.
- `/m/[moduleSlug]/line/fulfill` does the same for module-scoped legacy LIFF entry.
- Legacy unlock/short-code fulfillment remains unchanged when recovery state is absent.
- The recovery parser now tolerates one percent-encoded `liff.state` layer.

No LINE messages were sent. No production env, DB, payment runtime, provider behavior, schema, or route semantics changed beyond routing recovery state away from legacy fulfillment UI.

## Staging Freshness

`https://staging.anyu.tw/api/health` returned:

| Field | Result |
| --- | --- |
| environment | `preview` |
| branch | `staging` |
| git commit | `0f0801d9b5c5` |
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

## CTA Entry Verification

Fresh checkout-start surface was inspected with sanitized output.

Result: pass.

Verified:

- Email remains primary/default recovery option.
- LINE CTA is visible as save/recovery method.
- Copy says `用 LINE 保存這份報告`.
- Copy says `之後可以透過 LINE 協助找回`.
- No `LINE 領取完整分析`, `完整報告會傳到 LINE`, or `LINE 交付報告`.
- LINE href host is `liff.line.me`.
- LINE path shape is `/[LIFF_ID]`.
- LINE state shape is `rlb_[REDACTED]`.
- Return path shape is `/m/ambiguous-temperature/result/[REDACTED]/checkout`.
- LINE href did not visibly contain `pa_`, `pcs_`, `prl_`, `/unlock/`, `unlockToken`, `short-code`, `TradeInfo`, or `TradeSha`.

## Owner-Assisted LIFF Retry 2

Method:

- Owner opened the checkout-start LINE recovery CTA in a LINE mobile context / test account.
- Owner did not paste tokenized URLs, LIFF state, idToken, cookies, LINE ID, or screenshots with private values.

Observed retry result:

- No `缺少 LINE 保存狀態`.
- No LINE login `400 Bad Request`.
- Stopped at legacy fulfillment copy: `正在確認完整分析頁`, `LINE 短碼連結缺少有效測驗資料`.

Failure classification:

- `liff_page_missing`

Impact:

- Checkout/report access was not blocked.
- Email fallback remains available.
- This is not a paid delivery failure.
- No LINE message was sent.

## Minimal Fix Applied

Files changed:

- `apps/web/src/app/line/fulfill/page.tsx`
- `apps/web/src/app/m/[moduleSlug]/line/fulfill/page.tsx`
- `apps/web/src/lib/line/recovery-liff-context.ts`
- `apps/web/src/tests/line-recovery-liff-page.test.tsx`

Behavior:

- Legacy LIFF entry pages detect recovery bind state and render the recovery bridge.
- Non-recovery LIFF fulfillment still renders the legacy fulfillment bridge.
- Recovery `liff.state` parsing now tolerates one percent-encoded layer.
- Tests assert recovery `liff.state` on legacy entry pages shows recovery copy and does not show legacy short-code error copy.

Why this fix is narrow:

- It does not modify the bind API.
- It does not modify schema or DB.
- It does not send LINE messages.
- It does not alter payment/provider behavior.
- It only prevents recovery LIFF state from being handled by legacy fulfillment UI.

## DB Verification

Sanitized baseline query against Neon project `anyu-next`, branch `preview`, database `neondb` before Retry 2:

| Check | Result |
| --- | --- |
| `contact_type=line` count | `0` |
| transactional consent count | `0` |
| line hash present count | `0` |
| contact hash present count | `0` |

Post-bind DB verification result:

- Not completed because owner-assisted Retry 2 stopped at legacy fulfillment UI before bind route submission.
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

Code validation after the third minimal fix:

- `cd apps/web && corepack pnpm exec vitest run src/tests/line-recovery-liff-page.test.tsx src/tests/line-recovery-bind-state.test.ts src/tests/line-recovery-bind-route.test.ts src/tests/newebpay-checkout-start-page.test.tsx src/tests/paid-result-recovery-save-section.test.tsx src/tests/line-fulfillment.test.ts`: passed, 61 tests
- `cd apps/web && corepack pnpm lint`: passed
- `cd apps/web && corepack pnpm test`: passed, 75 files / 499 tests
- `cd apps/web && corepack pnpm build`: passed
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`: passed against currently deployed Preview(staging) commit `0f0801d9b5c5`
- `cd apps/web && corepack pnpm run qa:recovery-link:smoke`: passed against currently deployed Preview(staging) commit `0f0801d9b5c5`

Documentation/safety validation:

- docs presence check: pending final commit check
- secret/private scan: pending final commit check
- `git diff --check`: pending final commit check

## Tech Debt Review

New technical debt introduced:

- None beyond needing another owner-assisted retry after the legacy-entry handoff fix deploys.

Existing technical debt observed:

- The active LINE LIFF endpoint is still legacy `/line/fulfill`; recovery currently needs compatibility routing until a dedicated LINE recovery LIFF endpoint is configured in LINE console.
- Completed-result LINE bind still returns to a safe module page instead of a tokenized paid page until a non-tokenized paid access handoff exists.

Opportunistic cleanup completed:

- Recovery `liff.state` now works through legacy global and module-scoped LIFF entry pages.
- Tests now cover legacy-entry recovery routing and encoded `liff.state` handling.

Deferred cleanup candidates:

- Configure a dedicated LINE recovery LIFF endpoint later, or keep compatibility routing as the accepted shared endpoint pattern.
- Add recovery-specific LIFF diagnostics if another mobile-only failure occurs.
- Add a reusable sanitized LINE bind DB-check helper.

## Recommended Next Step

Redeploy/push the legacy-entry recovery handoff fix, then rerun `LINE Recovery Bind Staging Smoke v0 Retry 3`. If it passes, continue to `LINE Recovery Link Sending v0`.
