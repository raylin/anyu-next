# ANYU Current State Snapshot for ChatGPT Review v0

Date: 2026-05-30
Branch: staging
Scope: investigation / documentation only

## 1. Git / Deployment State

### Local / Remote Git

- Working directory: `/Users/raylin/Projects/anyu-next`
- Local branch: `staging`
- Local HEAD: `b40a5d2da57f1a6c41319dc821373b6568efa98f`
- Remote `origin/staging` verified by `git ls-remote`: `b40a5d2da57f1a6c41319dc821373b6568efa98f`
- Local `origin/staging` tracking ref is stale: `d6051ec25a1afd886a7005aac4a62f05174a801a`
- Local status reports `ahead 2` only because the local remote-tracking ref did not update after successful pushes.
- `.git/refs/remotes/origin/staging.lock`: missing at inspection time.
- Worktree before this documentation task: clean except the stale remote-tracking ref condition.

### Latest Relevant Commits

| Area | Commit | Subject |
| --- | --- | --- |
| Supplement email draft/checklist | `b40a5d2` | `docs: draft newebpay supplement email` |
| Merchant-review public content | `d68bbb7` | `docs: publish newebpay review content` |
| Merchant-review remediation plan | `d6051ec` | `docs: plan newebpay review remediation` |
| Phase 3B paid access handoff | `bf78115` | `feat: add payment access handoff` |
| Phase 3 paid delivery integration | `c0f67b0` | `feat: create paid delivery artifacts` |
| Phase 2 NotifyURL verification | `3591e06` | `feat: verify newebpay notify payments` |
| Phase 1 checkout creation | `c83a05d` | `feat: add newebpay checkout foundation` |
| Staging fake-paid QA full pass | `4c23493` | `ops: start staging qa secret alignment` |

### Live Deployment Checks

Checked with safe, non-secret HTTP requests.

Production `https://anyu.tw`:

- `/api/health`: returns only `{"ok":true,"service":"anyu-next-web"}`; no build marker fields.
- Root homepage still contains old `C-stage production foundation` copy.
- `/refund`: HTTP 404.
- Conclusion: production is not serving the latest merchant-review storefront/refund content as of this snapshot.

Staging `https://staging.anyu.tw`:

- `/api/health` includes:
  - `app`: `anyu-web`
  - `environment`: `preview`
  - `gitCommit`: `b40a5d2da57f`
  - `gitBranch`: `staging`
  - `routeBundleVersion`: `payment-foundation-2026-05-29`
- Root homepage includes storefront content, including product name, refund/support copy, `一次性付款`, and `hello@anyu.tw`.
- `/refund`: HTTP 200 and contains refund policy content.
- Checkout route without secret returns route-controlled JSON `not_found`, confirming the route bundle is present but gated.
- Conclusion: staging is serving the latest current-state code/content.

## 2. Public Website Merchant-Review Surfaces

### Source State

Root homepage: `apps/web/src/app/page.tsx`

Current purpose:
- Provider-review-friendly storefront for Module 01.
- Replaces old internal foundation/status copy in current source.

Shown product/service name:
- `曖昧溫度計｜AI 關係互動分析報告`

Shown service content:
- digital AI-assisted relationship interaction analysis service.
- free initial analysis.
- paid complete report / deeper interpretation.
- evidence/signal summary from user-provided context.
- web-based result delivery.

Shown price:
- `單次完整報告解鎖：NT$ 49`

Shown charging model:
- `一次性付款，非訂閱制`
- no recurring subscription wording.

Shown delivery method:
- payment completion and confirmation leads to web full report delivery.
- if generation takes time, page shows processing/waiting state.

Product preview / image approach:
- synthetic screenshot-like product preview card.
- no private user input, real customer screenshots, provider data, tokenized URLs, or private account details.

Support email/channel shown:
- `hello@anyu.tw`

Footer/nav links:
- `/` service introduction.
- `/refund` refund policy.
- `/privacy` privacy policy.
- `/terms` terms.
- `/disclaimer` disclaimer.

### Public URLs To Check

- Production homepage: `https://anyu.tw/`
- Production refund policy: `https://anyu.tw/refund`
- Production legal page: `https://anyu.tw/legal`
- Production terms: `https://anyu.tw/terms`
- Production privacy: `https://anyu.tw/privacy`
- Production disclaimer: `https://anyu.tw/disclaimer`
- Staging homepage: `https://staging.anyu.tw/`
- Staging refund policy: `https://staging.anyu.tw/refund`

### Live Status

- Staging appears updated.
- Production appears not updated.
- Merchant review screenshots should use staging only if the owner explicitly wants to submit staging URLs/screenshots; otherwise production should be refreshed before screenshots are taken.

## 3. Refund Policy Current Content

Source: `apps/web/src/content/legal.ts` (`refundPageContent`)
Route: `/refund`

Refund/support eligible cases:
- duplicate payment.
- payment succeeds but full report is not generated.
- paid result link cannot be opened due to system issue.
- clear payment abnormality, system abnormality, or delivery abnormality.

Refund non-eligible / limited cases:
- complete digital AI report has been generated and made available.
- generally no refund solely because of subjective preference, interpretation feeling, or user judgment difference.

Support channel:
- `hello@anyu.tw`

Refund handling time window:
- no concrete fixed processing window yet.
- current wording says timing depends on payment/system checks and may be updated before formal launch.
- owner should confirm whether to state a specific window, e.g. `3-7 business days`, before sending to NewebPay.

Owner-review wording:
- confirm the final refund window.
- confirm whether email-only support is enough.
- confirm invoice/receipt wording if NewebPay asks.

## 4. Payment Engineering State

### Routes And Behavior

| Route | Mutating / Read-only | Gate / Auth | Current behavior | Creates payment_intent | Creates entitlement | Creates `pa_` | Creates generation_job | Processor trigger |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `POST /api/modules/[moduleSlug]/checkout/newebpay` | Mutating | `ENABLE_NEWEBPAY_CHECKOUT`; if `ENABLE_PAYMENT_RUNTIME` is off, requires `x-operator-test-secret` | Creates/reuses NewebPay checkout-started intent and checkout form contract | Yes, pending/checkout-started | No | No | No | No |
| `GET /m/[moduleSlug]/payment/return` | Read-only | signed `pcs_` checkout token if available | Waiting/processing/ready UX only; never payment truth | No | No | No | No | No |
| `POST /api/modules/[moduleSlug]/payment/status` | Read-only | signed `pcs_` checkout token | Returns sanitized payment handoff state | No | No | No | No | No |
| `GET /m/[moduleSlug]/payment/access` | Read-only render | signed `pcs_` checkout token | Renders completed paid result only if paid + completed result exist | No | No | No | No | No |
| `POST /api/payments/newebpay/notify` | Mutating after verified provider payload | valid NewebPay TradeInfo/TradeSha + provider config | Payment truth; verifies callback, marks paid, creates delivery artifacts | No new intent; updates matching intent | Yes after verified paid | Stores hash only; raw token not exposed | Yes, queued | No |
| `POST /api/operator/fake-paid-success` | Mutating | `ENABLE_OPERATOR_FAKE_PAID_SUCCESS` + `x-operator-test-secret` | Operator-only fake paid path for staging QA | Yes/reuse fake paid | Yes/reuse | Yes, returns raw token only first time in operator response | Yes/reuse | No |
| `POST /api/internal/jobs/process` | Mutating | `Authorization: Bearer <INTERNAL_JOB_SECRET>` or `CRON_SECRET`; `ENABLE_PAID_GENERATION_PROCESSOR` | Manual/internal paid-generation processor | No | No | No | Processes existing jobs | This is processor execution |
| `POST /api/modules/[moduleSlug]/paid-result/status` | Read-only | unlock token or `pa_` token in body | Polls paid result status; `pa_` tokens resolve before legacy unlock tokens | No | No | No | No | No |
| `GET /m/[moduleSlug]/unlock/[unlockToken]` | Read-only render | bearer link token | Resolves `pa_` paid access first; non-`pa_` falls back to legacy unlock intent | No | No | No | No | No |

### `pa_` Unlock Route Behavior

- `pa_` tokens are opaque random bearer tokens.
- Raw `pa_` tokens are not stored directly.
- Entitlement stores token hash using `PAID_ACCESS_TOKEN_HASH_SECRET`.
- Unlock route resolves `pa_` token first.
- Invalid `pa_` does not fallback to legacy unlock.
- Legacy non-`pa_` unlock tokens still use the prior unlock intent path.

### `pcs_` Checkout Session Token Behavior

- Prefix: `pcs_`.
- Signed, non-persisted checkout session token.
- Payload includes module slug, merchant order number, expiry, and nonce.
- 24-hour expiry.
- Primary signing env: `PAYMENT_CHECKOUT_SESSION_SECRET`.
- Fallback signing env: `PAID_ACCESS_TOKEN_HASH_SECRET`.
- Used for ReturnURL/status/access handoff only.
- It is not payment proof by itself; NotifyURL remains payment truth.

## 5. Feature Flags / Env Expectations

Names only; no values inspected or recorded.

Payment/runtime gates:
- `ENABLE_PAYMENT_RUNTIME`
- `ENABLE_NEWEBPAY_CHECKOUT`

Paid generation job gates:
- `ENABLE_PAID_GENERATION_JOBS`
- `ENABLE_PAID_GENERATION_PROCESSOR`

Operator fake-paid QA:
- `ENABLE_OPERATOR_FAKE_PAID_SUCCESS`
- `OPERATOR_TEST_SECRET`
- request header `x-operator-test-secret`

NewebPay provider config:
- `NEWEBPAY_MERCHANT_ID`
- `NEWEBPAY_HASH_KEY`
- `NEWEBPAY_HASH_IV`
- `NEWEBPAY_CHECKOUT_URL`
- `NEWEBPAY_NOTIFY_URL`
- `NEWEBPAY_ENVIRONMENT`
- `NEXT_PUBLIC_APP_URL`

Token/session signing:
- `PAID_ACCESS_TOKEN_HASH_SECRET`
- `PAYMENT_CHECKOUT_SESSION_SECRET`

Processor/internal job:
- `INTERNAL_JOB_SECRET`
- `CRON_SECRET`

Operational caveat:
- Branch-scoped Vercel `Preview(staging)` env vars override general Preview env vars.
- The previous fake-paid processor 401 was caused by this precedence; future staging env work must inspect/update Preview(staging) explicitly.

## 6. NewebPay Implementation Boundaries

Confirmed current boundaries:

- Checkout Phase 1 is implemented but gated; broad public runtime is not enabled.
- NotifyURL Phase 2 verifies provider callback and marks only matching pending-like `payment_intent` as paid.
- Phase 3 creates/reuses entitlement, stores `pa_` hash, and creates/reuses generation job after verified paid.
- Phase 3B adds session-bound paid access handoff with `pcs_` token and read-only ReturnURL/status/access surfaces.
- ReturnURL does not mark payment paid.
- NotifyURL does not expose raw `pa_` token or unlock path.
- Queue trigger integration is not implemented.
- LINE delivery for payment flow is not implemented.
- Refund/admin tooling is not implemented.
- Broad production payment runtime and ads/broader traffic remain blocked.

## 7. QA Evidence

Latest known QA evidence:

- Authorized fake-paid full pass: report `ai-collaboration/reports/2026-05-30-force-align-vercel-preview-staging-qa-secrets-rerun-fake-paid-qa-v0.md`.
- Fake-paid QA passed end-to-end after branch-scoped Preview(staging) secrets were aligned:
  - fake-paid creation passed.
  - payment_intent paid passed.
  - entitlement active passed.
  - first-response-only paid access token passed.
  - generation_job queued passed.
  - idempotency passed.
  - processor manual completion passed.
  - paid status completed passed.
  - completed paid access page rendering passed.
- Processor manual completion pass: same report, `processor_manual_completion` HTTP 200, processed 1, completed 1.
- Checkout/Notify/Delivery/Handoff unit validation:
  - Phase 1 report: 46 files / 303 tests passed, build passed.
  - Phase 2 report: 48 files / 315 tests passed, build passed.
  - Phase 3 report: 49 files / 319 tests passed, build passed.
  - Phase 3B report: 53 files / 333 tests passed, build passed.
- Public content validation:
  - Merchant public content implementation passed lint, tests, build, Python compile/unit checks.
- Real NewebPay sandbox E2E:
  - Not run as of this snapshot.
- Production payment runtime smoke:
  - Not run; payment runtime remains disabled/not broadly public.

## 8. Supplement Package Readiness

Supplement package docs:

- Email draft / attachment checklist / self-developed statement: `ai-collaboration/reports/2026-05-30-newebpay-supplement-email-draft-attachment-checklist-v0.md`
- Handoff: `ai-collaboration/handoffs/2026-05-30-newebpay-supplement-email-draft-attachment-checklist-v0-handoff.md`

Owner materials still needed outside repo:

- homepage screenshot showing product/service/price/charging model.
- refund policy screenshot.
- domain ownership or domain registration proof for `anyu.tw`.
- Vercel hosting/platform proof, such as invoice, project screenshot, or billing proof.
- AI/API billing, invoice, or usage proof, if applicable.
- self-developed system statement exported as PDF if useful.
- optional website order/payment flow explanation or screenshot.
- company/business registration or merchant identity docs only if requested/available.

These materials are intentionally external-only and should not be committed to the repo.

## 9. Open Questions For Owner / ChatGPT

- Has production been refreshed to include the public storefront and `/refund` page?
- Should NewebPay screenshots use production `https://anyu.tw` or staging `https://staging.anyu.tw`?
- Is `NT$49` the final merchant-review price?
- Should refund handling time be stated explicitly, such as `3-7 business days`?
- Is `hello@anyu.tw` fully ready to receive support/refund requests?
- Does NewebPay want attachments by reply email or a specific customer-service mailbox/thread?
- Are NewebPay sandbox/provider credentials available for a safe E2E smoke?
- Should `PAYMENT_CHECKOUT_SESSION_SECRET` be configured separately from `PAID_ACCESS_TOKEN_HASH_SECRET` before runtime launch?
- Should temporary processor auth diagnostic behavior be removed/tightened before launch?
- Should the session-bound access page remain long-term or later exchange to a canonical `pa_` route?

## 10. Recommended Next Steps

### Merchant Review Submission Steps

1. Refresh production with the latest `origin/staging` if NewebPay will review `https://anyu.tw`.
2. Verify production homepage and `/refund` show the new content after deploy.
3. Capture homepage, refund, and legal/footer screenshots from the chosen review URL.
4. Prepare external proof documents outside repo: domain, Vercel hosting, AI/API provider proof, self-developed statement, and any merchant identity docs.
5. Review and send the supplement email draft to NewebPay customer service with attachments.

### Engineering Continuation Steps

1. After merchant review submission, decide between:
   - NewebPay sandbox E2E smoke if provider credentials are available.
   - Queue Trigger Integration / Paid Delivery Orchestration Phase 4.
2. Keep `ENABLE_PAYMENT_RUNTIME` off until launch decision.
3. Keep checkout route operator/gated until public runtime approval.
4. Add/confirm production env readiness only through a separate launch gate.

### Cleanup / Operational Steps

1. Fix local stale `origin/staging` tracking ref permission issue before more local work if status noise becomes risky.
2. Document Preview(staging) env precedence in permanent runbooks if not already duplicated there.
3. Consider removing or tightening temporary processor auth diagnostics before public payment launch.

## Validation

- Documentation presence check: passed.
- Secret/private pattern scan: no secret values found. Matches were historical summary-log safety notes only.
- `git diff --check`: passed.

## Recommended Next Step

If ChatGPT agrees, refresh production with the latest public storefront/refund content, take screenshots, prepare external proof documents, and send the NewebPay supplement email package.
