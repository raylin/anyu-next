# Fresh LINE Access-Link Smoke After Clean Reset v0

Date: 2026-06-04

## Completed Work

- Saved the required handoff before smoke execution.
- Confirmed Preview(staging) freshness after clean reset:
  - environment: `preview`
  - branch: `staging`
  - route bundle: `payment-foundation-2026-05-29`
  - final smoke commit: `fd3924a`
- Ran baseline clean-schema regressions:
  - `cd apps/web && corepack pnpm run qa:access-link:smoke`
  - `cd apps/web && corepack pnpm run qa:result-checkout:no-card`
- Completed owner-assisted LINE mobile bind from the checkout-start LINE save route.
- Verified sanitized clean-schema DB state:
  - one LINE access-link contact exists
  - transactional consent is present
  - contact status is verified/bound
  - one active v1 LINE recipient secret exists
  - recipient secret purpose is `access_link_delivery`
  - private hash/encrypted fields are present but were not printed
- Ran controlled Preview(staging) LINE access-link message smoke.
- Owner confirmed the received LINE message and that its `/r/` link opens the paid result.
- Re-ran non-message regressions after the real LINE message smoke.

## Implementation Fixes

Two narrow smoke-tooling fixes were required:

- The Preview-only operator LINE smoke endpoint now treats an existing/sent LINE access-link row as success even when the targeted generation processor reports `already_completed`.
- If a targeted job is already completed and no sent link is found for the new entitlement, the endpoint explicitly re-runs the existing completed-result access-link send hook before re-checking state.
- The local `qa:line-access-link:smoke` sanitizer now detects actual private JSON fields and `pal_` tokens, without false-failing on safe boolean audit field names like `rawLineUserIdReturned`.

No public route, production runtime, provider behavior, schema, Email behavior, or LINE message template was changed.

## Fresh LINE Bind Result

Passed by owner-assisted mobile smoke.

Observed safe outcome:

- LINE route completed successfully.
- No legacy fulfillment copy was reported.
- No report-body delivery wording was reported.
- Email fallback/access remained unaffected.

## Clean-Schema DB Verification

Passed on Preview(staging), aggregate/sanitized only:

- `payment_access_link_contacts`
  - LINE contact count: 1
  - transactional consent present: yes
  - status verified/bound: yes
  - hash field present: yes, value not printed
- `payment_access_link_contact_secrets`
  - LINE secret count: 1
  - purpose: `access_link_delivery`
  - status: active
  - key_version: `v1`
  - encrypted recipient and recipient hash present, values not printed
- `paid_result_access_links`
  - LINE sent rows after smoke: 2
  - no raw token or token hash printed

## Real LINE Access-Link Message Result

Passed.

Sanitized smoke result:

- real LINE message path reached `lineMessageSent=true`
- recovery/access-link row created: yes
- access-link status: `sent`
- recipient secret resolved server-side: yes
- raw LINE userId returned: false
- encrypted recipient returned: false
- recipient hash returned: false
- raw `pal_` token returned/printed: false
- token hash returned/printed: false
- raw `pa_` / `pcs_` returned/printed: false
- report content returned: false

Owner verification:

- LINE message received: yes
- `/r/` link opens paid result: yes

## Regression QA

Passed after the smoke:

- `cd apps/web && corepack pnpm run qa:access-link:smoke`
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`

Validation after code fixes:

- `cd apps/web && corepack pnpm exec vitest run src/tests/operator-line-recovery-smoke-route.test.ts src/tests/line-recovery-link.test.ts src/tests/paid-result-recovery-links.test.ts`
- `cd apps/web && corepack pnpm exec vitest run src/tests/recovery-link-smoke-qa.test.ts src/tests/operator-line-recovery-smoke-route.test.ts`
- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`

## Production Safety

- Production runtime remains disabled/fail-closed.
- Production checkout/fake-paid/operator smoke routes remained disabled in QA checks.
- Production env was untouched.
- Production DB remains on clean access-link schema.
- No production payment was run.
- No production LINE or Email message was sent.

## Redaction Guarantees

No report, command output, or DB verification printed:

- raw LINE userId
- encrypted recipient
- recipient hash
- raw `pal_`
- token hash
- raw `pa_`
- raw `pcs_`
- provider payload
- raw result content

## Tech Debt Review

- New technical debt introduced: none beyond smoke-tooling fixes.
- Existing technical debt observed: endpoint/script names still use recovery terminology internally.
- Opportunistic cleanup completed: fixed LINE smoke endpoint handling for already-completed jobs and tightened smoke redaction for `pal_`.
- Deferred cleanup candidates: rename recovery-named endpoint/script files after production access-link gate; env-name alignment remains deferred.

## Suggested Next Step

Production Access-Link / Provider Env Gate v0.

