# Unlocked Paid Link Pending State Flicker Fix v0 Review Bundle

Date: 2026-05-27

## 1. Summary

Fixed the unlocked full-analysis path so fulfilled LINE/short-code links do not briefly fall back to an idle claim state before entering paid-result polling. The change is scoped to unlocked-route state selection, the paid-status response for claimed links, and the LIFF bridge navigation transition.

No paid-generation provider logic, LINE webhook semantics, LIFF bind semantics, prompt/schema/cache/DB, payment, email, ads, or production deployment was changed.

## 2. Root Cause

- The LIFF bridge set a client `success` state before calling `window.location.assign(...)`, allowing a transient success/CTA render before navigation in normal non-debug mode.
- The paid-result status route returned generic `missing` when no paid row existed yet, even if the unlock intent had already been claimed via LINE/short-code fulfillment.
- The unlocked route did not have a named route-state resolver that distinguished `claimed_missing` from a true pre-claim/not-requested state.

## 3. State Selection Fix

- Added explicit unlocked paid route states:
  - `completed`
  - `processing`
  - `requested`
  - `claimed_missing`
  - `not_requested`
  - `failed`
  - `expired`
- Fulfillment statuses `bound` and `delivered` now classify missing paid rows as `claimed_missing`, which initializes the polling UI as pending.
- Failed/expired states still route to safe failure copy.

## 4. Pending Polling Behavior

- Processing/requested/claimed-missing unlocked links render `PaidResultPendingPoller` immediately.
- Polling still auto-refreshes when the paid result becomes completed.
- Completed paid result rows render paid content directly.

## 5. LIFF Bridge Navigation

- In normal non-debug mode, the bridge now calls `window.location.assign(redirectTarget)` and returns before setting a success CTA state.
- Debug mode still preserves the diagnostic/success surface for operator inspection.

## 6. Tests Added

- Added route-state tests for completed, processing, claimed-missing, and failed states.
- Added paid-status route test for delivered fulfillment with no paid row returning `pending`.
- Added bridge regression test to ensure non-debug navigation happens before success CTA state.

## 7. Privacy / Event Safety

- No event metadata shape was broadened.
- No tokenized URL, unlock token, LINE user ID, short code, raw input, provider output, `paid_result_json`, or secrets were added to tests or reports.

## 8. Validation Summary

- Python compile and topic-ingestion tests passed.
- App lint, unit tests, build, and Playwright local E2E passed.

## 9. Remaining Notes

- Production still needs a refresh from latest staging plus a repeat of the operator LIFF/short-code smoke after this fix is promoted.

## 10. Recommended Next Step

Deploy this commit to staging, run a staging route/operator smoke for unlocked pending links, then perform the approved production refresh/smoke if staging passes.
