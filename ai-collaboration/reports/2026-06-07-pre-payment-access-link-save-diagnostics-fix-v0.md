# Pre-Payment Access-Link Save Diagnostics + Fix v0

## Metadata

- task name: Pre-Payment Access-Link Save Diagnostics + Fix v0
- date: 2026-06-07
- report path: `ai-collaboration/reports/2026-06-07-pre-payment-access-link-save-diagnostics-fix-v0.md`
- commit: not committed at report creation
- branch / push status: not pushed at report creation
- model / effort: GPT-5 Codex, high
- taskStartedAt: 2026-06-07T08:10:05Z
- taskCompletedAt: 2026-06-07T08:24:24Z
- totalWallClockDuration: 14m19s
- humanWaitDuration: 0m
- netCodexWorkDuration: 14m19s

## Context

- why this task exists: the controlled production payment smoke with scoped runtime config stopped before payment because both pre-payment save methods failed. Email showed a temporary save failure. LINE returned from login but saved only a contact-like state without a recipient secret.
- upstream blocker / mainline context: production payment smoke must not be retried until pre-payment save is reliable and observable. Scoped runtime config open/close worked and production was restored fail-closed.
- out-of-scope items: production payment, production Email/LINE sends, Vercel env changes, DB mutation, theme UI, Module 02, and another production smoke.

## Scope

- what changed: added sanitized pre-payment access-link save diagnostics for Email, expanded server-side LINE bind milestone diagnostics, hardened Admin paid-result summary semantics for failed/contact-only LINE rows, and updated Admin CLI parsing/output/tests.
- what did not change: no payment behavior after NewebPay, no provider Email/LINE send behavior, no runtime config behavior, no DB schema, no production data, no Vercel env, and no theme route.

## Expected Save Chain

### Email

1. Checkout-start submits an Email save request for a result/module context.
2. The server validates module, runtime checkout gate, and DB readiness.
3. The server creates or updates an Email `payment_access_link_contacts` row with transactional consent.
4. Email save is considered complete when the contact write succeeds and the contact is deliverable enough for pre-payment recovery.
5. No Email provider send is required before payment in this flow.
6. Admin/Ops must show sanitized save attempt state without exposing the Email address.

Email save success unlocks payment as one completed save method. Missing context, invalid form input, or contact write failure must not unlock payment.

### LINE

1. Mobile LINE bind returns from LINE login.
2. The client recovers the signed bind state.
3. The bind API validates state and verifies the LINE identity token.
4. The server creates/updates the LINE contact.
5. The server creates an active recipient secret.
6. LINE save is complete only when the contact is valid and an active recipient secret exists.
7. Admin/Ops must show sanitized bind/save state.

LINE contact-only state is partial, not saved/deliverable, and must never unlock payment.

## Latest Production Failure Diagnosis

- resultId: `800c88fa-04de-4172-b34a-3bc78cd4d0fa`
- resultSourceCategory: `production_runtime`
- Admin/Ops commands used:
  - `pnpm ops lookup-result --env production --id <resultId>`
  - `pnpm ops lookup-result --env production --id <resultId> --json`
  - `pnpm ops lookup-line-bind --env production --result-id <resultId>`
  - `pnpm ops lookup-line-bind --env production --result-id <resultId> --json`
- Admin CLI result summary:
  - payment remained `checkout_started`
  - entitlement missing
  - generation missing
  - paid result missing
  - Email contact not saved/sent
  - LINE contact saved, not deliverable
  - LINE recipient secret missing
  - no LINE send
- LINE diagnostics result: only pre-existing client-side `liff_login_redirect_started` events were visible. The post-login bind API milestones were not persisted before this task.
- Email diagnostics result: no pre-payment Email save attempt category was available through Admin/Ops. The old failure cannot be root-caused from persisted Admin/Ops state.
- direct DB used: no. Admin/Ops answered the persisted result and LINE diagnostic state. Direct DB could not recover the missing historical Email failure category because it had not been persisted.

## Implementation Summary

- files / areas changed:
  - Email save route: records safe save diagnostics and redirects with safe `recoveryError` categories.
  - Access-link save diagnostics: new event-backed helper using existing events infrastructure; no schema migration.
  - LINE bind route: records server-side bind milestones after state validation and identity verification.
  - LINE diagnostic categories/events: expanded safe categories for post-login API progression and recipient-secret creation/failure.
  - LINE bind helper result: returns sanitized contact compensation metadata for diagnostics, without raw LINE identity.
  - Admin paid-result lookup: includes latest save category/status/count and latest contact status; failed LINE contacts no longer count as saved.
  - Admin CLI: validates and displays sanitized save diagnostic fields.
  - Tests: added Email save diagnostics, LINE server milestones, Admin/Ops summary, CLI schema, and sanitized failure coverage.
- key design decisions:
  - Used the existing `events` table rather than adding a migration because v0 needs safe observability, not a new diagnostics domain model.
  - Kept diagnostics best-effort so diagnostic write failure cannot block user-facing save/bind behavior.
  - Integrated Email save diagnostics into existing `lookup-result` instead of adding a new standalone Email diagnostic CLI command.
  - Changed Admin summary semantics so failed contacts are visible via `latestContactStatus` but do not count as saved/deliverable.
- local / opportunistic cleanup decisions:
  - Replaced Promise `.catch()` diagnostic chaining with explicit `try/catch` helpers in Email and LINE routes to avoid diagnostic mock/runtime shape from affecting behavior.

## Email Save Root Cause And Fix

- root cause category from latest production: `email_save_failed`.
- exact historical root cause: not recoverable from current persisted state because the previous route collapsed Email save failures into generic temporary failure and did not persist a safe attempt category.
- code-level defect fixed: Email pre-payment save was not observable through Admin/Ops and did not expose whether failure was context validation, contact write, or unexpected server error.
- fix:
  - added `access_link_save_diagnostic` events for Email save attempts
  - records `email_save_started`, `email_save_context_invalid`, `email_save_contact_write_failed`, `email_save_unexpected_error`, and `email_save_success`
  - exposes latest Email save category/status/count through Admin paid-result lookup and CLI
  - keeps raw Email out of event metadata and CLI output

## LINE Save Root Cause And Fix

- root cause category from latest production: `line_bind_failed`.
- persisted evidence: Admin/Ops showed LINE contact saved, recipient secret missing, and `line_bind_incomplete` / `line_recipient_secret_missing`. Existing line-bind diagnostics only showed login redirect start.
- code-level defects fixed:
  - server-side post-login bind milestones were not persisted
  - Admin summary treated failed/contact-only LINE rows too broadly as saved
- fix:
  - added server-side bind milestones: API reached, state valid, ID token verified, contact saved, recipient secret write started, recipient secret created, recipient secret failed, contact marked failed after secret failure, and bind success
  - retained recipient-secret invariant: contact-only state is not deliverable
  - Admin summary now excludes failed LINE contacts from `contactSaved` while preserving `latestContactStatus`
  - `lookup-line-bind` can show the post-login failure point for future attempts

## Admin/Ops Diagnostics Lifecycle Decision

- access-link save diagnostics: keep as permanent ops/admin surface through existing Admin paid-result lookup. Rationale: Email save is a pre-payment gate and must remain support-observable.
- expanded LINE bind milestones: keep as permanent ops/admin surface through existing line-bind diagnostics lookup. Rationale: production LINE login/bind behavior depends on external LIFF/Login integration and needs safe milestone visibility.
- standalone diagnostic-only tools: none added.
- future cleanup: if diagnostics become too noisy after Gate 1, reduce event volume by retaining only terminal categories plus selected milestones; do not remove terminal save categories.

## Validation

- commands run:
  - `cd apps/web && corepack pnpm exec vitest run src/tests/payment-recovery-email-route.test.ts src/tests/line-recovery-bind-route.test.ts src/tests/admin-paid-result-lookup.test.ts src/tests/line-bind-diagnostic-events.test.ts`: pass, 4 files / 22 tests
  - `corepack pnpm --filter @anyu/admin-cli test`: pass, 3 files / 29 tests
  - `corepack pnpm --filter @anyu/admin-cli typecheck`: pass
  - `cd apps/web && corepack pnpm lint`: pass
  - `cd apps/web && corepack pnpm test`: pass, 97 files / 662 tests
  - `cd apps/web && corepack pnpm build`: pass
  - `cd apps/web && corepack pnpm run qa:module01:mock-flow`: pass
  - `cd apps/web && corepack pnpm run qa:module01:ui`: pass, 5 tests
  - `cd apps/web && corepack pnpm run qa:module01:local`: pass, gateStatus `pass`, commandExitCode `0`
- gateStatus: pass
- commandExitCode: 0 for executed gates
- requiredChecksStatus: pass
- optionalChecksStatus: not_applicable
- targetDeployCommit: not_applicable
- deployedCommitAtGateStart: not_applicable
- deployedCommitAtGateEnd: not_applicable
- freshnessStatus: not_applicable
- gates skipped and why:
  - `qa:module01:staging`: skipped. This change is covered by local route/Admin/CLI/mock/UI tests; no real channel send is allowed, and no deployed staging dependency was required to classify the fix.
  - `qa:module01:production-preflight`: skipped. Runtime config, production preflight, env, and production gate behavior were not changed.
  - `qa:module01:staging:channels`: skipped by policy; no real staging Email/LINE send approval.

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
- first failure category: `email_save_failed` was the production smoke failure being addressed; this task did not encounter a new hard failure after fixes.
- blocker status: pre-payment save observability blocker resolved locally. Exact historical Email root cause remains unrecoverable because no prior diagnostic category was persisted.

## Tech Debt / Cleanup Notes

- new technical debt introduced: none.
- existing technical debt observed: the events table is now used for more operational diagnostics; if event volume grows, add retention/aggregation policy.
- opportunistic cleanup completed: diagnostic writes in Email and LINE routes now use explicit best-effort `try/catch`.
- deferred cleanup candidates: consider exposing terminal Email save categories in a dedicated Admin/Ops section if paid-result lookup grows too broad after Gate 1.

## Decisions Made

- Did not use direct DB because Admin/Ops was sufficient to prove the persisted state and direct DB would not reconstruct a missing historical Email save category.
- Did not add a DB migration because existing events infrastructure supports sanitized diagnostics for this v0.
- Did not run staging because local/mock/UI/Admin/CLI coverage directly exercises the changed save and summary behavior without real channels.
- Did not claim the old production Email write failure was fully root-caused; the missing diagnostic was the root observability defect.

## Uncertainties / Blockers

- The next production attempt is the first time the new Email save categories can classify the production-only save failure if it recurs.
- No remaining local blocker was found for the save-gate path.

## Recommended Next Step

Controlled Production Payment Smoke Retry with Scoped Runtime Config v1 only after owner review of this fix. If Email or LINE save fails again, use `pnpm ops lookup-result` and `pnpm ops lookup-line-bind` to classify the exact category before any payment attempt.

## Paste-Back Context

Pre-payment save diagnostics are now integrated into Admin/Ops. Email save attempts record sanitized categories through existing events and `lookup-result`; LINE bind records server-side post-login milestones through existing line-bind diagnostics. Failed/contact-only LINE rows no longer count as saved/deliverable in Admin summary. Local targeted tests, full tests, build, mock-flow, UI, and local gate passed. No production runtime, payment, Email, LINE, Vercel env change, DB mutation, or secret exposure occurred.
