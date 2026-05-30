# NewebPay Sandbox E2E Smoke Plan v0

Date: 2026-05-30

## Summary

This plan defines an ANYU-specific NewebPay sandbox end-to-end smoke for Module 01 once sandbox credentials are available. It covers checkout creation, NewebPay sandbox payment, NotifyURL verification, paid delivery artifacts, Vercel Queues processing, payment status, and session-bound paid access.

This is a planning/checklist task only. No runtime behavior, env values, production flags, deployments, payments, checkout/notify code, LINE delivery, prompt/result behavior, or public copy were changed.

## 1. Sandbox Credential Checklist

Required Preview(`staging`) sandbox env/config names only:

| Purpose | Env / Config Name | Notes |
|---|---|---|
| NewebPay sandbox merchant id | `NEWEBPAY_MERCHANT_ID` | Sandbox value only; do not commit. |
| NewebPay sandbox hash key | `NEWEBPAY_HASH_KEY` | Must satisfy implementation length check. |
| NewebPay sandbox hash IV | `NEWEBPAY_HASH_IV` | Must satisfy implementation length check. |
| Sandbox gateway URL | `NEWEBPAY_CHECKOUT_URL` | Sandbox MPG gateway. |
| Server callback URL | `NEWEBPAY_NOTIFY_URL` | Should point to staging NotifyURL. |
| Environment label | `NEWEBPAY_ENVIRONMENT` | Expected value: sandbox/staging label. |
| Checkout session signing | `PAYMENT_CHECKOUT_SESSION_SECRET` | Required for `pcs_` handoff. |
| Paid access token hash | `PAID_ACCESS_TOKEN_HASH_SECRET` | Required for delivery artifacts. |
| Payment runtime gate | `ENABLE_PAYMENT_RUNTIME` | Enable only in Preview(`staging`) for sandbox smoke. |
| Checkout gate | `ENABLE_NEWEBPAY_CHECKOUT` | Enable only in Preview(`staging`) for sandbox smoke. |
| Queue trigger gate | `ENABLE_PAID_JOB_QUEUE_TRIGGER` | Enable only in Preview(`staging`) for queue smoke. |
| Queue provider | `PAID_JOB_QUEUE_PROVIDER` | `vercel_queue` for queue smoke. |
| Queue topic | `PAID_JOB_QUEUE_TOPIC` | Existing topic: `paid-generation-jobs`. |
| Manual fallback auth | `INTERNAL_JOB_SECRET` | Needed only for manual fallback recovery. |
| Operator QA auth | `OPERATOR_TEST_SECRET` | Needed only for operator/fake-paid regression comparison. |

Provider trade settings to confirm from current integration:

- MPG version: implementation uses `NEWEBPAY_MPG_VERSION = "2.0"`.
- Item/product naming should align with Module 01 paid unlock.
- Amount should match approved launch/test amount, currently expected NT$49 unless owner changes price.
- ReturnURL is generated in the checkout contract from the signed checkout session handoff.
- NotifyURL is configured through `NEWEBPAY_NOTIFY_URL`.

Do not store or paste actual sandbox credentials in repo, reports, screenshots, or chat logs.

## 2. ANYU Route Mapping

| Flow Step | ANYU Route / Component | Mutating? | Notes |
|---|---|---:|---|
| Create source result | `POST /api/modules/ambiguous-temperature/analyze` | yes | Produces fresh source result for checkout. |
| Start checkout | `POST /api/modules/[moduleSlug]/checkout/newebpay` | yes | Creates/reuses pending NewebPay `payment_intent` and checkout form contract. |
| NewebPay gateway | external sandbox gateway from `NEWEBPAY_CHECKOUT_URL` | external | Browser submits provider payload/form. |
| Payment truth callback | `POST /api/payments/newebpay/notify` | yes | NotifyURL is the only payment truth; verifies TradeInfo/TradeSha and marks paid. |
| Browser return | `/m/[moduleSlug]/payment/return` | read-only | ReturnURL remains non-mutating; shows waiting/processing/ready state. |
| Payment status | `POST /api/modules/[moduleSlug]/payment/status` | read-only | Uses session-bound `pcs_` token to report safe state/access path. |
| Session-bound access | `/m/[moduleSlug]/payment/access?checkoutToken=...` | read-only | Uses `pcs_` handoff; no raw `pa_` exposure. |
| Paid result status | `POST /api/modules/[moduleSlug]/paid-result/status` | read-only | Used by paid access flow and QA. |
| Paid unlock | `/m/[moduleSlug]/unlock/[unlockToken]` | read-only | Existing paid access resolver; raw token not recorded in reports. |
| Queue consumer | `/api/internal/queues/paid-generation` | queue callback | Vercel Queues invokes targeted `generationJobId` processor path. |
| Manual fallback | `POST /api/internal/jobs/process` | yes | Requires `INTERNAL_JOB_SECRET`; fallback only. |

Assertions:

- NotifyURL is payment truth.
- ReturnURL must never mark paid or create artifacts.
- Raw `pa_` token remains unexposed in provider callbacks and reports.
- `pcs_` checkout session handles browser-side access handoff.
- Queue payload is DB-reference-only and should not contain raw user input, provider payload, `pa_`, `pcs_`, or tokenized URLs.

## 3. Environment Setup Plan

Use branch-scoped Preview(`staging`) env, not general Preview.

Setup sequence:

1. Confirm `staging.anyu.tw/api/health` reports `environment=preview`, `gitBranch=staging`, and expected route bundle.
2. Configure NewebPay sandbox credentials only under Preview(`staging`).
3. Set Preview(`staging`) payment gates for sandbox smoke only.
4. Confirm Production env and runtime remain disabled.
5. Confirm queue trigger remains Preview(`staging`) only.
6. Export `INTERNAL_JOB_SECRET` locally only if manual fallback is tested.

Preview(`staging`) expected gates for sandbox E2E:

- `ENABLE_PAYMENT_RUNTIME=true`
- `ENABLE_NEWEBPAY_CHECKOUT=true`
- `ENABLE_PAID_JOB_QUEUE_TRIGGER=true`
- `PAID_JOB_QUEUE_PROVIDER=vercel_queue`
- `PAID_JOB_QUEUE_TOPIC=paid-generation-jobs`

Production expectations during sandbox smoke:

- `ENABLE_PAYMENT_RUNTIME` absent/false.
- `ENABLE_NEWEBPAY_CHECKOUT` absent/false.
- Queue trigger flags absent/false unless a separate production launch decision exists.
- Production checkout and fake-paid routes remain fail-closed.

## 4. Sandbox E2E Smoke Flow

Exact smoke steps:

1. Create a fresh Module 01 source result on staging.
2. Start checkout through `POST /api/modules/ambiguous-temperature/checkout/newebpay` using the fresh result/session reference.
3. Confirm checkout response includes a safe provider form/contract and a `pcs_` session-backed ReturnURL path.
4. Submit the form to NewebPay sandbox gateway.
5. Pay with NewebPay sandbox test method/card from official sandbox docs or merchant backend only.
6. Observe browser ReturnURL page.
7. Confirm ReturnURL shows waiting/pending or processing state before NotifyURL completion if callback has not arrived yet.
8. Confirm NotifyURL is received by `POST /api/payments/newebpay/notify`.
9. Confirm NotifyURL verifies signature/decrypts TradeInfo and marks matching `payment_intent` paid.
10. Confirm entitlement and paid access token hash are created/reused.
11. Confirm `generation_job` is created/reused.
12. Confirm Vercel Queues enqueue result for `paid-generation-jobs`.
13. Confirm queue consumer processes the exact `generationJobId`.
14. Confirm payment status becomes ready/completed.
15. Confirm session-bound access page renders completed paid result.
16. Reload ReturnURL/access page and confirm duplicate/reload behavior is safe.
17. If safe, send duplicate NotifyURL fixture and confirm idempotent duplicate handling.
18. If safe, send invalid/malformed NotifyURL fixture and confirm no paid mutation.

Do not record raw provider payloads, decrypted TradeInfo, card data, raw user input, raw tokens, or tokenized URLs in the report.

## 5. Expected States

| Stage | Expected State |
|---|---|
| Before payment | Source result exists; no paid NewebPay intent for this idempotency/session unless checkout already started. |
| After checkout creation | `payment_intent` exists in pending/checkout-started state; provider `newebpay`; amount matches expected price; no entitlement/job created yet. |
| After ReturnURL before NotifyURL | ReturnURL is read-only; status shows waiting for payment confirmation or processing; no paid mutation occurs from ReturnURL. |
| After verified NotifyURL | Matching `payment_intent` transitions to paid; NotifyURL received timestamp recorded where supported. |
| After delivery artifact creation | Entitlement active; paid access token hash stored; raw `pa_` not exposed to provider; generation job queued/created. |
| During queue processing | Status is pending/processing; Vercel Queues receives message; consumer processes exact `generationJobId`. |
| After paid result ready | Generation job completed; paid status ready/completed; session-bound access page renders completed paid result. |
| Duplicate NotifyURL | Safe duplicate response/category; no duplicate entitlement or generation job. |
| Failed/invalid NotifyURL | Safe rejection category; no paid transition; no entitlement/job artifacts. |

## 6. Safety Checks

Pre-smoke:

- Production payment runtime remains disabled.
- Production checkout/fake-paid routes remain JSON fail-closed.
- No Production env values are changed.
- Sandbox credentials are configured only in Preview(`staging`).
- Staging health marker is current.

During smoke:

- Use only NewebPay sandbox payment method/card from official sandbox materials.
- Do not use a real card/payment.
- Do not paste provider credentials into terminal output or repo docs.
- Do not save raw provider payloads, decrypted payloads, raw user input, `pa_`, `pcs_`, or tokenized URLs.
- Redact screenshots if owner keeps any outside repo.

Post-smoke:

- Confirm Production remains disabled.
- Confirm Preview(`staging`) queue flags are restored to intended QA state.
- Record sanitized pass/fail by step only.

## 7. Failure Classification

Classify the first failing step with one category:

| Category | Meaning |
|---|---|
| `sandbox_credential_missing` | Required sandbox env/config absent. |
| `gateway_payload_rejected` | NewebPay sandbox rejects checkout payload/form. |
| `payment_page_failure` | Sandbox gateway/payment page cannot complete. |
| `return_url_missing_pcs` | Browser return lacks valid checkout session handoff. |
| `notify_url_not_received` | Provider callback not observed. |
| `signature_invalid` | TradeSha/signature verification fails. |
| `trade_info_decrypt_failed` | TradeInfo cannot be decrypted/parsed. |
| `payment_intent_not_found` | Verified callback cannot match existing intent. |
| `amount_mismatch` | Provider amount differs from expected intent amount. |
| `merchant_mismatch` | Merchant id/order data mismatch. |
| `payment_not_success` | Provider status is cancelled/failed/not success. |
| `paid_transition_failed` | Verified payment could not mark intent paid. |
| `delivery_artifact_creation_failed` | Entitlement/token/job creation failed. |
| `queue_not_enqueued` | Paid job queue trigger did not enqueue. |
| `queue_processor_failed` | Queue consumer/processor failed. |
| `status_not_ready_timeout` | Paid status did not become ready in expected window. |
| `access_rendering_failed` | Session-bound access or paid result rendering failed. |
| `unknown` | First failure cannot yet be classified safely. |

## 8. Observability Checklist

Inspect only safe metadata:

- Vercel logs for checkout, NotifyURL, status, queue consumer, and processor route status/errors.
- Vercel Queues dashboard for `paid-generation-jobs`: receive/delete counts, backlog, retries, max message age.
- `payment_intents`: status, provider, amount, merchant order reference, paid/notify timestamps.
- `entitlements`: active/reused/refunded/revoked state.
- `generation_jobs`: queued/processing/completed/failed/retryable state and target `generationJobId`.
- NewebPay sandbox backend: payment status and callback status.
- ReturnURL/status/access pages: waiting/processing/ready behavior.

Do not inspect or store in repo:

- MerchantID/HashKey/HashIV values.
- Provider payload bodies.
- Decrypted TradeInfo contents.
- Full card/test-card details unless public official docs and not committed.
- Raw `pa_` or `pcs_` tokens.
- Tokenized URLs.
- Raw user input/private relationship content.

## 9. Suggested Sanitized Smoke Report Shape

Recommended report fields after execution:

- staging health marker: pass/fail.
- sandbox env names present: yes/no by name only.
- checkout creation: pass/fail, `paymentIntentPresent=true/false`.
- provider gateway loaded: pass/fail.
- sandbox payment completed: pass/fail.
- ReturnURL pending/processing observed: pass/fail.
- NotifyURL verified: pass/fail.
- payment intent paid: pass/fail.
- delivery artifacts present: entitlement/job/token-hash booleans only.
- queue enqueued: pass/fail.
- queue consumer completed exact job: pass/fail.
- paid status ready: pass/fail.
- session-bound access rendered completed result: pass/fail.
- duplicate notify idempotency: pass/fail/not-run.
- invalid notify rejection: pass/fail/not-run.
- production disabled recheck: pass/fail.
- first failure category, if any.

## 10. Recommended Next Step

When sandbox credentials are available:

1. Configure Preview(`staging`) sandbox env values without printing them.
2. Redeploy Preview(`staging`).
3. Run this sandbox E2E smoke.
4. Record only sanitized results.

If sandbox credentials are not available before approval:

- Wait for NewebPay approval/credentials, then run **Production Payment Config Dry-Run v0** before any controlled production payment smoke.

## Tech Debt Review

New technical debt introduced:

- None; documentation-only plan.

Existing technical debt observed:

- No dedicated sandbox E2E runner exists yet; this plan assumes manual/operator flow unless a follow-up automates it.
- Local `.git/FETCH_HEAD` permission issue remains previously observed.

Opportunistic cleanup completed:

- Mapped exact ANYU routes/env names to the future sandbox smoke.

Deferred cleanup candidates:

- Add a secret-safe sandbox smoke runner after manual sandbox flow proves stable.
- Add a production config dry-run script that checks env-name presence and fail-closed behavior without values.
