# Paid Result Delivery Artifact Implementation v0

Date: 2026-06-02 23:39 CST

## Completed Work

- Added a sanitized paid-result delivery summary helper for completed Module 01 paid results.
- Added a completed-result delivery artifact/status card to the shared paid result renderer used by:
  - paid access token unlock path
  - session-bound payment access page
  - `/r/[recoveryToken]` recovery link resolver
  - legacy completed unlock path
- Added display-only report reference codes in the format `AT-YYYYMMDD-XXXXXX`.
- Added Riso/editorial-aligned card styling without creating a broader payment shell abstraction.
- Added tests for helper behavior, report reference format, masked recovery state, sent-state copy, and token/internal-id exclusion.

## Helper Behavior

New helper: `getPaidResultDeliverySummary(...)`

The helper returns only sanitized display fields:

- module label: `曖昧溫度計`
- artifact title: `完整分析報告`
- status label: `已生成`
- display-only report reference code
- generated/completed date label
- recovery saved/unsaved/retry status
- masked recovery contact if available
- current-flow recovery link sent state
- support Email

The helper does not return raw `pa_`, `pcs_`, `prl_`, raw provider order data, payment intent IDs, entitlement IDs, raw Email, raw LINE IDs, source text, or report content beyond the already-rendered paid result page.

## Report Reference Format

Format: `AT-YYYYMMDD-XXXXXX`

- `AT` is the Module 01 display prefix.
- `YYYYMMDD` is derived from generated/completed time in Asia/Taipei.
- `XXXXXX` is a short deterministic hash derived from stable internal result context.
- The code is display-only and non-authorizing.
- It is safe for support reference, but it is not a recovery token, payment token, provider order number, or access credential.

## UI Placement

The artifact card appears near the top of completed paid result pages, after the opening full-analysis context card and before the recovery save section.

The card includes:

- `曖昧溫度計｜完整分析報告`
- `已生成` stamp
- report reference code
- generated time
- saved/unsaved recovery status
- masked Email if recovery is saved
- support note with `hello@anyu.tw`
- 90-day recovery-link retention note, phrased as link-limited rather than permanent report storage

This keeps the paid result feeling delivered and supportable without making it invoice-like or interrupting the report content.

## Recovery Integration

- Saved Email recovery shows only masked contact, for example `o***@e***.com`.
- Unsaved state shows `尚未保存找回方式` and remains paired with the existing non-blocking Email save section.
- Sent state is shown only when the current completed-result save flow confirms `recovery=email_sent`.
- Persistent sent-status lookup from historical auto-send rows is deferred to avoid over-claiming “已寄出” without a direct summary helper.
- LINE remains deferred and is not framed as paid report delivery.

## Constraints Preserved

- No payment provider behavior changed.
- No Email or LINE messages were sent by this task.
- No production runtime/env/DB changes were made.
- No membership, PDF/export, or dedicated report route was implemented.
- No raw `pa_`, `pcs_`, `prl_`, raw Email, raw LINE ID, provider payload, or private customer data was exposed.

## Validation

- `corepack pnpm exec vitest run src/tests/paid-result-delivery-artifact.test.ts src/tests/paid-result-recovery-save-section.test.tsx`: passed
- `corepack pnpm exec vitest run src/tests/payment-access-page.test.tsx src/tests/paid-result-recovery-link-page.test.tsx src/tests/paid-result-recovery-save-section.test.tsx src/tests/paid-result-delivery-artifact.test.ts`: passed
- `corepack pnpm lint`: passed
- `corepack pnpm test`: passed, 75 files / 494 tests
- `corepack pnpm build`: passed
- docs presence check: passed
- dashboard HTML parse sanity: passed
- `corepack pnpm run qa:result-checkout:no-card`: passed against Preview(staging) commit `f718955e4717`; no-card checkout, queue completion, paid access render, and production fail-closed checks passed
- `corepack pnpm run qa:recovery-link:smoke`: passed against Preview(staging) commit `f718955e4717`; runtime recovery-link smoke, invalid-link safety, cleanup by revocation, and production fail-closed checks passed

## Staging Smoke Note

The staging QA commands passed as regression checks on the currently deployed Preview(staging) commit `f718955e4717`, which predates this delivery artifact UI change. The new artifact card requires this task commit to deploy to staging before live visual smoke can confirm the rendered header/status card.

## Tech Debt Review

- New technical debt introduced: persistent recovery Email sent-state is not summarized yet; the artifact only shows sent state when the current flow confirms it.
- Existing technical debt observed: report retention/public policy copy still needs a broader launch-policy decision before stronger permanence language.
- Opportunistic cleanup completed: centralized report reference/date/recovery summary formatting in a pure helper instead of embedding it in the page component.
- Deferred cleanup candidates: add a `getPaidResultDeliverySummary` data-layer variant that can query recent sent recovery links by entitlement/contact once support audit needs are clearer.

## Suggested Next Steps

1. Run a staging smoke for the new delivery artifact on completed paid result and `/r/` recovery-link access.
2. Decide whether persistent sent-state lookup is needed before production payment capability.
3. Continue with LINE Recovery CTA Wiring v0 or Module 02 Concept Spec, depending on owner priority.
