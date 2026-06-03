# Module 01 Recovery End-to-End Launch Gate Snapshot v0

Date: 2026-06-03

## Executive Summary

- Module 01 paid result access-link delivery is now staging-proven for both Email and LINE.
- Email access-link delivery is staging-proven: save before/after payment, `/r/` link generation, real Resend Email, paid-readiness auto-send, owner verified link opens paid result.
- LINE access-link delivery is staging-proven: visible CTA, LIFF bind, hash-only recovery contact, encrypted recipient secret, real LINE Messaging API smoke, owner verified link opens paid result.
- Web remains the canonical paid report viewing surface.
- Email and LINE deliver access links back to ANYU; they do not deliver the report body.
- Raw `pa_` and `pcs_` tokens are not sent through Email or LINE.
- `/r/[recoveryToken]` resolver is staging-proven and uses hash-only token storage.
- Completed paid result has a delivery artifact/status card with display-only report reference.
- Production payment runtime remains disabled/fail-closed; production recovery DB/env remain gated.
- NewebPay approval is a Payment Capability Gate only, not the Growth/Ads Launch Gate.

## End-to-End Flow Map

| Step | Current status | Evidence | Caveat |
| --- | --- | --- | --- |
| A. Free result | Implemented and repeatedly covered by no-card/sandbox QA | `2026-06-01-module-01-current-state-launch-gate-snapshot-v0.md` | None material for recovery snapshot |
| B. Checkout-start | Implemented with Email primary, LINE secondary, skip warning | `2026-06-01-checkout-start-recovery-soft-gate-staging-qa-v0.md` | User-facing copy should shift from recovery framing to 保存查看連結 framing later |
| C. Save access link via Email | Staging-proven before payment and after payment | `2026-06-02-email-recovery-auto-send-staging-operator-smoke-v0.md` | Duplicate/resend and bounce handling deferred |
| C. Save access link via LINE | Staging-proven through visible CTA and LIFF bind | `2026-06-03-line-recovery-bind-recipient-secret-staging-smoke-v0.md` | Shared `/line/fulfill` compatibility remains; dedicated recovery LIFF endpoint can be revisited |
| D. NewebPay payment | Sandbox E2E staging-proven | `2026-05-31-fresh-newebpay-sandbox-e2e-payment-smoke-v5.md` | Formal production merchant approval remains external |
| E. NotifyURL payment truth | Sandbox decrypt/verify staging-proven | `2026-05-31-fresh-newebpay-sandbox-e2e-payment-smoke-v5.md` | Production credentials/runtime still gated |
| F. Paid generation / queue | Queue completion and paid access covered by no-card and sandbox flows | `2026-06-03-line-recovery-link-real-message-smoke-v0.md` | Queue audit persistence remains deferred |
| G. Report ready | Paid result completion and access render staging-proven | `2026-06-03-line-recovery-link-real-message-smoke-v0.md` | Operator no-card path is not a provider payment replacement |
| H. Email sends `/r/` access link | Staging-proven with real Resend Email | `2026-06-02-email-recovery-auto-send-staging-operator-smoke-v0.md` | Provider message-id audit, bounces, rate limits deferred |
| H. LINE sends `/r/` access link | Staging-proven with real LINE message | `2026-06-03-line-recovery-link-real-message-smoke-v0.md` | Duplicate/resend and block/unfollow policy deferred |
| I. `/r/` resolver opens paid result | Staging-proven through runtime smoke, Email, and LINE owner verification | `2026-06-01-recovery-link-token-staging-apply-smoke-v0.md`; `2026-06-03-line-recovery-link-real-message-smoke-v0.md` | Multi-use until expiry/revocation by current v0 design |
| J. Completed result delivery artifact | Implemented and staging-smoked | `2026-06-03-paid-result-delivery-artifact-staging-visual-smoke-v0.md` | Exact mobile spacing remains human spot-check caveat because local Chromium is sandbox-blocked |

## Email Flow Status

Implemented/staging-proven:

- Email save before payment from checkout-start.
- Email save after payment from completed result.
- Resend adapter behind `EMAIL_PROVIDER=resend`.
- Real Resend Email smoke passed.
- Paid delivery auto-send hook sends eligible checkout-start Email access links after paid readiness.
- Owner verified Email received and `/r/` link opens paid result.
- Email template contains safe web return link, module name, 90-day copy, and support contact.
- Email does not contain report body, raw input, raw `pa_`, raw `pcs_`, or provider payload.

Remaining deferred items:

- Duplicate/resend policy.
- Provider message-id audit.
- Bounce/rate-limit handling.
- Production Email env gate.

## LINE Flow Status

Implemented/staging-proven:

- Checkout-start and completed-result LINE CTA wiring.
- Recovery-specific LIFF bind state and route.
- Owner-assisted LIFF bind smoke passed.
- `payment_recovery_contacts` stores LINE identity as hash-only.
- `payment_recovery_contact_secrets` stores encrypted sendable recipient separately.
- LINE Messaging API sender foundation exists with noop/default and gated real provider.
- Real LINE message smoke passed on Preview(staging).
- Owner verified LINE message received and `/r/` link opens paid result.
- LINE message contains access link only, not report body.
- Raw LINE userId is not exposed in responses/reports.

Remaining deferred items:

- Duplicate/resend policy.
- LINE block/unfollow handling.
- Dedicated recovery LIFF endpoint vs shared `/line/fulfill` compatibility.
- Production LINE env gate.

## Access Link / Token Model

Current model:

- Route: `/r/[recoveryToken]`.
- Table: `paid_result_recovery_links`.
- Raw token is generated/sent once and stored only as `token_hash`.
- Purpose: `paid_result_recovery`.
- Channels: `email`, `line`, `support`, `operator_test`.
- v0 validity: 90 days.
- Supports expiry and revocation.
- Current behavior allows multi-use until expiry/revocation.
- Resolver validates token hash, expiry, revocation, and linked entitlement server-side.
- Resolver opens the existing web paid result view.
- Email/LINE never send raw `pa_` or `pcs_` tokens.

Boundary:

- `/r/` token is authorizing bearer access to the paid result view.
- Report reference code is display-only and non-authorizing.
- Email/LINE messages contain a link back to ANYU, not report content.

Terminology note:

- Internal code still uses recovery naming.
- Future copy/engineering alignment should move toward access-link language:
  - User-facing: 保存查看連結 / 專屬查看連結 / 回 ANYU 查看完整報告
  - Engineering: report access link / paid result access link
- Do not broad-rename schema/helpers until a scoped follow-up.

## Recovery Identity Model

Tables and roles:

- `payment_recovery_contacts`: purchase/report-level recovery/access-link identity.
- Email contact: encrypted contact value plus hash.
- LINE contact: hash-only identity.
- `payment_recovery_contact_secrets`: encrypted LINE recipient secret for Messaging API send.
- `paid_result_recovery_links`: hash-only access-link token records.

Consent:

- Transactional consent records access-link delivery permission.
- Marketing opt-in remains separate.
- Marketing opt-in is not required for transactional access-link delivery.

Future path:

- These identities can seed lightweight member/report history later.
- Membership is not implemented and is not required for the current staging-proven access-link loop.

## Delivery Artifact Status

Implemented:

- Completed paid result includes artifact/status card.
- Module label and complete report framing are visible.
- Report reference format: `AT-YYYYMMDD-XXXXXX`.
- Reference code is display-only and non-authorizing.
- Recovery/access-link saved state can show masked Email only.
- Support reference includes `hello@anyu.tw`.
- No Email/LINE report-body delivery promise was added.

Caveat:

- Visual smoke passed through staging QA and sanitized visible-text inspection.
- Exact mobile screenshot/spacing remains a human spot-check caveat because local Chromium is sandbox-blocked.

## QA Command Matrix

| Command / endpoint | What it validates | When to run | Sends real Email/LINE? | Replaces provider smoke? |
| --- | --- | --- | --- | --- |
| `qa:result-checkout:no-card` | Result CTA, checkout-start, operator fake-paid, queue completion, paid access render, production fail-closed checks | After payment/recovery/access UI or route changes | No | No; it bypasses real provider payment |
| `qa:recovery-link:smoke` | Preview runtime `/r/` link creation, resolver render, invalid-link safety, cleanup, production fail-closed checks | After recovery link/token/resolver changes | No | No; validates link resolver not Email/LINE delivery |
| `qa:line-recovery:smoke` | Preview runtime LINE access-link send path using encrypted recipient secret and production fail-closed check | Only with owner-approved staging LINE recipient and provider env | Yes, one controlled LINE message | Yes for staging LINE message smoke, not production |
| `POST /api/operator/email-recovery-smoke` | Direct/post-payment Email access-link send with sanitized response | Controlled staging Email smoke | Yes if provider configured | Yes for staging Email send smoke |
| `PUT /api/operator/email-recovery-smoke` | Paid-readiness auto-send hook for Email in same payment context | Controlled staging Email auto-send smoke | Yes if provider configured | Yes for staging Email auto-send proof |
| `POST /api/operator/line-recovery-smoke` | Paid-readiness auto-send hook for LINE in same payment context | Controlled staging LINE message smoke | Yes if provider configured | Yes for staging LINE auto-send proof |
| `qa:newebpay:sandbox` | Real NewebPay sandbox checkout/NotifyURL/ReturnURL/payment transition | Before payment capability gate decisions | No Email/LINE by itself | Yes for sandbox payment provider behavior, not production |

## Production Gate Map

### Gate 1: Payment Capability

Required before enabling production payment capability:

- NewebPay formal approval.
- Production credentials.
- Production config dry-run with runtime still disabled.
- Production DB migrations:
  - entitlement payment-intent unique index
  - `payment_recovery_contacts`
  - `paid_result_recovery_links`
  - `payment_recovery_contact_secrets`
- Production env:
  - payment provider/runtime secrets
  - recovery/access-link token secret
  - Email provider env
  - LINE provider env
- Controlled production payment smoke.
- Rollback/runbook readiness.

### Gate 2: Soft Public Availability

Required before low/no-traffic paid use:

- Payment capability gate completed.
- Support/recovery ready.
- Monitoring and fail-closed checks ready.
- No ads yet.
- Duplicate/resend policy at least decided for owner operations.

### Gate 3: Growth / Ads Launch

Required before paid traffic:

- Ads/conversion tracking.
- Support capacity.
- Duplicate/resend policy.
- Stop-loss thresholds.
- LINE re-engage plan.
- Budget controls.

Explicit rule:

- NewebPay approval does not equal Growth/Ads Launch.

## Remaining Risks / Deferred Work

- Duplicate/resend policy for Email and LINE access links.
- Email bounce/rate-limit handling.
- LINE block/unfollow handling.
- Production migration/env gate.
- Support ops helper.
- Recovery/access-link naming alignment.
- Membership/report history later.
- Module 02 deferred until this Module 01 access-link loop is recorded; this snapshot satisfies that documentation need.
- Queue audit persistence remains a potential ops improvement.

## Recommended Next Tasks

Recommended sequence:

1. `Recovery/Access Link User-Facing Copy + Engineering Naming Alignment v0`
2. `Duplicate / Resend Policy Plan v0`
3. `Module 02 Concept Spec: 職場暗流雷達 v0`

Reasoning:

- Naming alignment should happen before more user-facing polish, because the owner explicitly prefers shifting away from “recovery” language.
- Duplicate/resend policy should be decided before production recovery messaging because Email/LINE are now real delivery channels for access links.
- Module 02 concept can start after this snapshot because Module 01 now has a staging-proven access-link reference loop.

Alternative if owner wants to cut to product exploration:

1. `Module 02 Concept Spec: 職場暗流雷達 v0`
2. `Recovery/Access Link User-Facing Copy + Engineering Naming Alignment v0`
3. `Support Ops Helper v0`

Tradeoff:

- Product exploration can start now, but production readiness quality improves if naming and resend policy are resolved first.

## Tech Debt Review

- New technical debt introduced: none; documentation-only snapshot.
- Existing technical debt observed: internal recovery naming now lags preferred access-link terminology.
- Opportunistic cleanup completed: dashboard status updated to reflect Email/LINE access-link delivery staging proof.
- Deferred cleanup candidates: rename/refactor copy and helper naming in a scoped follow-up, not as an opportunistic broad rename.

## Recommended Next Task

`Recovery/Access Link User-Facing Copy + Engineering Naming Alignment v0`
