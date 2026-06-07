# Pre-Payment Email Save + Mock Paid Access-Link Automation v0

## Metadata

- task name: Pre-Payment Email Save + Mock Paid Access-Link Automation v0
- date: 2026-06-07
- report path: `ai-collaboration/reports/2026-06-07-pre-payment-email-save-mock-paid-access-link-automation-v0.md`
- commit: not committed at report creation
- branch / push status: not pushed at report creation
- model / effort: GPT-5 Codex, high
- taskStartedAt: 2026-06-07T10:31:45Z
- taskCompletedAt: 2026-06-07T10:44:23Z
- totalWallClockDuration: 12m38s
- humanWaitDuration: 0m
- netCodexWorkDuration: 12m38s

## Context

- why this task exists: Staging Pre-Payment Save + Access-Link E2E Rebaseline v0 failed before no-card/fake-paid transition. Email save failed with `email_save_contact_write_failed`; LINE bind did not complete and only showed the client-side `liff_login_redirect_started` milestone.
- upstream blocker / mainline context: Owner directed the next diagnosis away from production and manual LINE, toward the simplest automatable path: Email save, mock/no-card paid state, access-link readiness, and `/r` resolution.
- out-of-scope items: no production runtime, production payment, real Email, real LINE, Vercel env changes, direct DB debugging, theme UI, or Module 02 work.

## Scope

- what changed: fixed the shared contact/encryption key handling that can surface as Email contact write failure, added deterministic no-card QA automation for Email save before mock paid, added explicit mock-flow coverage for the Email-save-to-access-link path, and updated process rules.
- what did not change: no provider send behavior was enabled, no LINE manual flow was exercised, no production data/runtime was touched, and no staging E2E was run before deployment of this fix.

## Implementation Summary

- files / areas changed: shared recovery contact crypto, LINE recipient-secret crypto, operator fake-paid route, no-card QA helper/script, Module 01 mock-flow scenario map, targeted tests, QA/production process docs, dashboard, and summary log.
- key design decisions: keep exact 32-byte decoded keys compatible, but allow configured high-entropy encoded contact/recipient secrets to derive the AES key through SHA-256 instead of failing closed solely because the decoded value is not the raw AES key size.
- local / opportunistic cleanup decisions: extended the existing no-card QA path instead of creating a new ad hoc script; added route/service tests rather than relying on staging/manual checks.

## Shared Access-Link Architecture Map

| Area | Current behavior |
| --- | --- |
| Email save route | `POST /api/modules/[moduleSlug]/result/[resultId]/recovery/email` validates result/payment context, calls `createOrUpdateEmailRecoveryContact`, records safe diagnostics, then redirects back to checkout with saved/error state. |
| LINE bind route | verified bind writes LINE contact and recipient secret; contact-only state must remain non-deliverable and must not unlock checkout. |
| Shared contact helper | `createOrUpdateEmailRecoveryContact` and LINE contact helpers write `payment_recovery_contacts` rows with hash-only lookup plus encrypted contact/recipient side data. |
| Contact crypto | Email contact encryption/hash lives in `recovery-contact-crypto`; LINE recipient secret encryption/hash lives in `line-recovery-recipient-crypto`. |
| Checkout saved-state reader | checkout-start uses saved Email or deliverable LINE state to unlock payment; failed/contact-only LINE state remains locked. |
| Mock/no-card paid path | operator fake-paid creates paid truth and delivery artifacts without provider payment; it can now receive the saved Email contact path for access-link automation. |
| `/r` resolver | paid result access-link resolver remains the safe web delivery target; no raw payment/session/provider tokens are printed by QA output. |

## Root Cause

- Email save failure category `email_save_contact_write_failed` maps to `RecoveryContactConfigError` in the Email save route.
- The shared Email contact encryption helper required configured contact encryption keys to decode directly to the raw AES key size.
- The configured staging/production secret shape is high-entropy encoded material but not accepted by that exact raw-key decode contract, causing contact writes to fail before payment.
- The LINE recipient-secret helper had the same exact-key assumption, so the shared crypto contract was also a plausible contributor to contact-only / missing-secret outcomes.

No secret values, lengths, prefixes, suffixes, hashes, or checksums were recorded in this report.

## Fix Summary

- `recovery-contact-crypto.ts` now accepts exact raw AES key material unchanged, and otherwise derives a stable AES key from high-entropy decoded key material.
- `line-recovery-recipient-crypto.ts` received the same behavior for recipient-secret encryption.
- Missing or insufficient key material still fails closed with existing safe config error categories.
- Operator fake-paid route now accepts an optional `recoveryEmail` input and returns only `recoveryContactIdPresent`, never the Email value.
- `qa:result-checkout:no-card` now verifies checkout-start Email recovery form presence, submits the safe test Email save, confirms checkout unlock after save, then runs fake-paid/access-link checks.
- `qa:module01:mock-flow` now includes `email_save_to_mock_paid_access_link` as an explicit named scenario.

## Mock Paid Automation Coverage

The new/updated automated path covers:

- fresh Module 01 fixture-derived result creation in the existing no-card QA runner
- checkout-start mandatory save gate
- Email recovery form extraction with sanitized route shape
- Email save before payment
- checkout unlock after saved Email
- operator fake-paid transition with recovery contact input
- paid access-link readiness and `/r` resolver coverage through existing paid result recovery-link tests
- sanitized output assertions and no real provider/channel sends

## Admin/Ops Diagnostics Result

- No new Admin API or CLI command was added.
- Existing Admin/Ops lookup remains the intended deployed diagnostic surface.
- This task strengthened local/mock automation before deployed Admin/Ops verification.
- Diagnostic tooling lifecycle decision: keep the new mock-flow scenario and no-card QA assertions as permanent regression coverage; no temporary diagnostic endpoint was introduced.

## Validation

- commands run:
- `cd apps/web && corepack pnpm lint`: pass
- `cd apps/web && corepack pnpm exec vitest run src/tests/payment-recovery-contacts.test.ts src/tests/payment-recovery-contact-secrets.test.ts src/tests/payment-recovery-email-route.test.ts src/tests/operator-fake-paid-success.test.ts src/tests/operator-fake-paid-success-route.test.ts src/tests/paid-result-recovery-links.test.ts src/tests/result-checkout-no-card-qa.test.ts src/tests/module01-mock-flow-qa.test.ts`: pass, 8 files / 76 tests
- final focused rerun after adding helper-level contact write test: pass, 7 files / 73 tests
- `cd apps/web && corepack pnpm test`: pass, 97 files / 672 tests
- `corepack pnpm --filter @anyu/admin-cli test`: pass, 3 files / 29 tests
- `corepack pnpm --filter @anyu/admin-cli typecheck`: pass
- `cd apps/web && corepack pnpm build`: pass
- `cd apps/web && corepack pnpm run qa:module01:mock-flow`: pass, including `email_save_to_mock_paid_access_link`
- `cd apps/web && corepack pnpm run qa:module01:ui`: initial sandbox run failed before assertions because Chromium could not launch under macOS sandbox permissions; escalated rerun passed, 5 tests
- `cd apps/web && corepack pnpm run qa:module01:local`: pass, `gateStatus=pass`, `commandExitCode=0`, `requiredChecksStatus=pass`
- gateStatus: pass
- commandExitCode: 0 for final required gates
- requiredChecksStatus: pass
- optionalChecksStatus: not_applicable
- targetDeployCommit: not_applicable
- deployedCommitAtGateStart: not_applicable
- deployedCommitAtGateEnd: not_applicable
- freshnessStatus: not_applicable
- gates skipped and why: staging was skipped because this fix is not deployed yet; production preflight/runtime were skipped because production behavior was not changed or enabled in this task.

## Safety

- production runtime enabled: no
- payment run: no
- Email sent: no
- LINE sent: no
- Vercel env changed: no
- DB mutated: no
- secrets/private data exposed: no

## Result

- result: pass
- first failure category: not_applicable
- blocker status: local/shared Email save blocker fixed in code and covered by automation; deployed staging proof remains pending.

## Tech Debt / Cleanup Notes

- new technical debt introduced: none
- existing technical debt observed: the no-card QA path still requires a deployed/local server and approved operator env to prove the full route-backed flow outside unit tests.
- opportunistic cleanup completed: reused and extended the existing no-card QA and mock-flow surfaces instead of adding another one-off command.
- deferred cleanup candidates: focused staging E2E rebaseline should run after deployment to prove Email save + mock paid + `/r` on Preview(staging), then LINE should be revisited only after Email path is stable.

## Decisions Made

- Treat Email + LINE dual save failure as a shared contact/access-link issue first, not two independent channel bugs.
- Use Email save as the minimal automated reproduction because it avoids LIFF, mobile browser behavior, real LINE login, and real channel delivery.
- Keep configured exact raw AES key compatibility while supporting high-entropy encoded key material through deterministic derivation.
- Do not run staging in this task because the target fix is local-only until pushed/deployed.

## Uncertainties / Blockers

- Staging still needs a fresh deployed rebaseline of Email save + mock paid + `/r` against the pushed commit.
- LINE manual/provider-specific diagnosis remains intentionally blocked until Email/shared access-link path is stable in staging automation.

## Recommended Next Step

Staging Pre-Payment Save + Access-Link E2E Rebaseline v1, focused first on Email save + mock paid + `/r`, then LINE only if Email path is stable.

## Paste-Back Context

Pre-Payment Email Save + Mock Paid Access-Link Automation v0 fixed the shared contact encryption-key handling that caused safe Email contact write failures, applied the same hardening to LINE recipient-secret encryption, and added local/mock automation for Email save before mock paid access-link readiness. Local targeted tests, full tests, build, mock-flow, UI, and local gate passed. No production runtime, payment, real Email, real LINE, Vercel env change, or DB mutation occurred. Next task should deploy and run the focused staging rebaseline before any production retry.
