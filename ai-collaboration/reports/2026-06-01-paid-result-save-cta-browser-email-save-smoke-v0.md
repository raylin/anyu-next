# Paid Result Save CTA Browser Email Save Smoke v0

Date: 2026-06-01
Branch: `staging`
Scope: staging browser/manual QA and documentation only

## Summary

Paid Result Save CTA Browser Email Save Smoke v0 passed with owner-assisted real browser submission.

The completed paid result Email recovery save form was opened from a fresh no-card staging paid result, submitted in a real browser with a reserved-domain fake Email, and the UI showed saved/success. A subsequent server reload of the same completed-result access page showed the saved confirmation and masked contact display, verifying persistence through the staging server path without printing the tokenized URL, raw Email, encrypted value, or hash.

No production runtime, production env, production DB, payment provider behavior, Email sending, LINE push, membership, or app code changed.

## Method

### Staging freshness

- Staging health endpoint returned `environment=preview`.
- Staging branch returned `gitBranch=staging`.
- Staging commit returned `058a45c51aeb`, which is newer than required commit `46da41a`.
- `routeBundleVersion` returned `payment-foundation-2026-05-29`.

### Browser/manual QA setup

- Generated a fresh Module 01 staging result through the normal analyze API using a QA-only synthetic scenario.
- Completed it through the existing operator no-card path.
- Waited until paid status reached `completed`.
- Wrote the completed-result URL to `/private/tmp/anyu-paid-result-save-smoke-url.txt` with owner-only local permissions.
- Did not print the tokenized URL.
- Owner opened the URL in a real browser and submitted the Email recovery save form with a reserved-domain fake Email.

Local browser automation and macOS `open`/clipboard handoff were unavailable in this sandbox, so owner-assisted browser submission was the safest browser-equivalent method.

## Results

### Email Save UI

Result: passed

- Completed paid result showed the unsaved Email recovery save section.
- Marketing opt-in was separate from recovery.
- LINE remained deferred as recovery/support only, not paid report delivery.
- Owner reported `saved/success shown` after submitting the Email save form in a real browser.
- No raw `pa_`, `pcs_`, hidden form fields, cookies, or tokenized URLs were pasted into chat or reports.

### Staging DB Mutation

Result: passed by persisted server-rendered state

- Reloading the original completed-result access page after browser submission returned saved state.
- Saved confirmation was present.
- Masked contact display was present.
- No raw Email was printed.
- No encrypted contact value or contact hash was printed.
- No forbidden paid delivery copy was found.

This verifies that the save was persisted through the staging server path. A direct SQL row dump was intentionally not used because it would add unnecessary exposure risk for contact/hash/encrypted fields.

Fake row cleanup status: retained in staging as an operator QA row tied to a synthetic paid result and reserved-domain fake contact. It was not removed because no safe row handle was needed for this smoke, and deleting by contact/hash would require unnecessary exposure or extra operator-only cleanup tooling. The stored contact value remains encrypted/hashed by the application path.

### No-Card QA Regression

Command:

```bash
cd apps/web && corepack pnpm run qa:result-checkout:no-card
```

Result: passed

- Result page checkout CTA passed.
- Checkout-start page passed and still shows recovery soft gate signals.
- Operator fake-paid path completed.
- Vercel Queue path completed through paid result generation.
- Paid status reached `completed`.
- Paid access render passed.
- Production fail-closed checks passed.

### Production Safety

Result: passed

- Production health returned `environment=production`.
- Production checkout route returned JSON `404/not_found`.
- Production fake-paid route returned JSON `404/not_found`.
- Production payment runtime remains disabled.
- Production recovery DB/env remains gated.

## Failure Classification

No product failure was found.

Observed tooling limitations:

- Direct Node POST to the Next server-action form returned HTTP 500 and remains non-browser-equivalent.
- Local headless Chromium and GUI browser handoff were blocked by this environment.
- Clipboard handoff via `pbcopy` was blocked.

These limitations did not block the final browser/manual verification.

## Files / Data Safety

- No app code changed.
- No production configuration changed.
- No provider payloads, raw tokens, tokenized URLs, raw Email, encrypted values, hashes, cookies, or private customer data were committed or printed.
- The private temp URL file was deleted after owner-assisted browser verification.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: automated browser submission for Next server-action forms is still brittle in the local sandbox; browser/manual QA remains necessary for this specific surface.
- Opportunistic cleanup completed: none.
- Deferred cleanup candidates: add a safer non-tokenized operator-only staging verification endpoint or Playwright-friendly test fixture if repeated browser form QA becomes frequent.

## Suggested Next Steps

1. Keep production payment runtime disabled until NewebPay approval and production launch gate completion.
2. If recovery work continues, plan fresh short-lived recovery links for support-assisted / Email / LINE recovery without sending raw `pa_` or `pcs_`.
3. If product exploration is the priority, proceed to Module 02 Concept Spec: 職場暗流雷達 v0.
