# Handoff: NewebPay Runtime Integration Plan v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Create a detailed implementation plan for NewebPay runtime integration after provider approval.

This plan should connect the already-prepared payment/entitlement schema with the future NewebPay checkout, return/notify verification, entitlement creation, paid access token issuance, paid_analysis job creation, queue trigger, and web polling flow.

This is a planning task only.

Do not implement NewebPay code.

Do not create checkout route.

Do not enable payment.

Do not add provider secrets.

Do not change production behavior.

## Strategic Context

The owner wants to continue pushing payment launch readiness while waiting for NewebPay approval.

Reasoning:

```text
- Waiting time is long.
- There is no real user/payment traffic yet.
- Iteration risk is low if runtime payment remains disabled.
- The goal is to keep context continuous and avoid re-picking this architecture after approval.
```

Current status:

```text
Module 01 production: active / monitor
Payment application: submitted, waiting for NewebPay review
Payment runtime: disabled
Checkout: not implemented
Ads: blocked
```

Foundation already completed:

```text
- generation_jobs schema/repo
- processor endpoint
- cron wrapper
- queue/worker strategy evaluation
- payment launch architecture
- payment_intents / entitlements schema plan
- payment_intents / entitlements schema implementation
- staging + production migration gates for payment_entitlements
```

## Background Decisions

Approved boundaries:

```text
payment_intents = payment / order truth
entitlements = access truth
paid_access_token = web paid result access proof
unlock_intents = LINE / short-code fulfillment infrastructure
generation_jobs = paid_analysis work lifecycle
analysis_paid_results = completed paid result storage
LINE = optional delivery / retention channel
short-code = fallback / recovery
```

Approved user flows:

```text
Desktop:
  Web checkout → payment success → web polling → completed paid result

Mobile:
  LINE-first remains available
  Web checkout can also work

LINE:
  optional delivery / retention / follow-up after payment

Short-code:
  fallback / recovery, not primary paid access
```

Queue strategy:

```text
Use QStash-like signed webhook queue as likely payment-launch trigger after staging POC.
Do not rely on Vercel Hobby Cron as main low-latency paid-generation trigger.
```

## Scope

Do:

1. Inspect current Module 01 unlock/paid preview flow.
2. Inspect current payment_intents / entitlements schema and helpers.
3. Inspect generation_jobs and processor/queue-related assets.
4. Define NewebPay runtime route/API architecture.
5. Define checkout creation flow.
6. Define return URL and notify URL handling.
7. Define server-side verification requirements.
8. Define payment_intent status transitions.
9. Define entitlement creation and paid_access_token issuance.
10. Define generation_jobs creation after payment success.
11. Define queue trigger handoff strategy.
12. Define web polling / unlocked route integration.
13. Define LINE optional delivery after payment.
14. Define failure / duplicate / expired / refund / re-delivery handling.
15. Define feature flags and rollout gates.
16. Define secrets / env requirements without committing values.
17. Define tests and staging smoke plan.
18. Create research report, execution report, summary log.
19. Commit and push to `origin/staging`.

Do not:

- implement checkout
- add NewebPay SDK/API code
- create payment return/notify routes
- add payment buttons
- enable real payment
- add provider secrets
- change runtime flow
- change LINE behavior
- change prompt/schema
- implement QStash
- start ads

## Key Questions To Answer

```text
1. What routes are needed for NewebPay?
2. What is the exact checkout creation flow?
3. How should MerchantOrderNo be generated and stored?
4. How should ReturnURL and NotifyURL differ?
5. Which NewebPay response should be trusted as payment truth?
6. How to verify server-side success before marking payment paid?
7. When exactly is entitlement created?
8. When exactly is paid_access_token generated?
9. When exactly is generation_jobs row created?
10. When exactly is queue message published?
11. What happens if payment succeeds but queue publish fails?
12. What happens if payment succeeds but paid generation fails?
13. How does desktop web polling work without LINE?
14. How does optional LINE delivery attach later?
15. What feature flags gate all payment runtime?
```

## Route Architecture

Plan future routes. Expected examples:

### Create checkout

```text
POST /api/modules/[moduleSlug]/payment/checkout
```

Responsibilities:

```text
- validate result/analysis context
- validate module supports payment
- create payment_intent with status created
- generate MerchantOrderNo
- build NewebPay checkout payload
- mark checkout_started
- return redirect form/url or server redirect strategy
```

### Payment return

```text
GET or POST /api/payments/newebpay/return
```

Responsibilities:

```text
- user-facing return from NewebPay
- do not trust client return alone if not verified
- show pending verification or redirect to status page
- if already verified paid, redirect to /m/{moduleSlug}/unlock/{paidAccessToken}
```

### Payment notify/server webhook

```text
POST /api/payments/newebpay/notify
```

Responsibilities:

```text
- verify NewebPay payload/checksum server-side
- find payment_intent by MerchantOrderNo
- idempotently mark paid/failed
- create entitlement + paid_access_token
- create generation_jobs paid_analysis job
- publish queue trigger
- do not expose secrets/raw provider payload
```

### Payment status

Optional:

```text
GET /api/payments/[paymentIntentId]/status
```

or avoid if unlocked route/pending route covers it.

Plan should recommend.

## Checkout Creation Flow

Expected:

```text
1. User sees free result / paid preview.
2. User clicks unlock full analysis.
3. Server creates payment_intent:
   provider = newebpay
   amount_minor = 49
   currency = TWD
   status = created
   module_slug = ambiguous-temperature
   analysis_request_id / analysis_result_id
4. Server builds MerchantOrderNo.
5. Server prepares NewebPay checkout parameters.
6. Server marks checkout_started.
7. User is redirected to NewebPay.
```

Important:

```text
Do not create entitlement before verified payment.
Do not create generation job before verified payment for real paid flow.
```

## Return vs Notify Trust Model

Plan must distinguish:

```text
ReturnURL:
  user browser redirect; useful for UX, not sole source of truth.

NotifyURL:
  server-to-server notification; should be primary payment truth after verification.
```

Expected recommendation:

```text
Only verified server-side payment confirmation marks payment_intent paid.
Return page should poll/check payment_intent status or show pending verification if notify has not arrived.
```

If NewebPay returns verifiable payload on return too, document whether it can be used as secondary verification.

## NewebPay Verification

Plan should require:

```text
- checksum/hash verification
- MerchantOrderNo lookup
- amount/currency check
- provider status success check
- idempotent processing
- reject mismatched amount/order/status
```

Secrets required later:

```text
NEWEBPAY_MERCHANT_ID
NEWEBPAY_HASH_KEY
NEWEBPAY_HASH_IV
NEWEBPAY_ENV
```

Do not commit or print them.

## Payment Intent State Transitions

Plan exact transitions:

```text
created → checkout_started
checkout_started → paid
checkout_started → failed
checkout_started → expired
paid → refund_pending
refund_pending → refunded
```

Idempotency:

```text
duplicate notify for same paid order should be safe
failed after paid should not downgrade paid
refund after paid should transition refund states only
```

## Entitlement Creation

On verified payment paid:

```text
1. create payment_single entitlement
2. entitlement_type = single_paid_analysis
3. source = payment_single
4. status = active
5. linked payment_intent_id
6. linked analysis_request_id / analysis_result_id
7. generate pa_ paid_access_token
8. store token hash only
9. raw token is returned to route/link creation only
```

If entitlement already exists for payment_intent:

```text
reuse entitlement and rotate/reuse access token according to policy
```

Expected recommendation:

```text
idempotent create-or-reuse entitlement for payment_intent.
```

## Paid Access Token / Unlock Route Integration

Plan how the existing route will be used:

```text
/m/{moduleSlug}/unlock/{token}
```

Future resolver:

```text
pa_ token → entitlement resolver
legacy token → unlock_intent resolver
```

Payment return should redirect to:

```text
/m/{moduleSlug}/unlock/{paidAccessToken}
```

No LINE required.

Important:

```text
raw pa_ token must not be stored in DB or logs.
```

## Generation Job Creation

After entitlement active:

```text
create/reuse generation_jobs paid_analysis
trigger_source = payment_success_future or payment_success
entitlement_ref_id = entitlement.id
input_ref_type = analysis_result
input_ref_id = analysis_result_id
```

Need decide exact trigger source constant.

Current allowed trigger source included:

```text
payment_success_future
```

Expected recommendation:

```text
Use payment_success_future until renamed deliberately; or plan rename to payment_success with migration/constant update.
```

Avoid event churn if not necessary.

## Queue Trigger Strategy

Expected payment launch path:

```text
create generation job
publish queue message with safe reference
queue calls processor near-realtime
pending route polls
```

Queue payload:

```json
{
  "jobType": "paid_analysis",
  "jobRef": "<safe reference>"
}
```

But avoid including sensitive refs if possible.

Plan should decide:

```text
QStash message contains job id?
Or QStash only triggers processor to claim due jobs?
```

Expected recommendation:

```text
Prefer queue message as trigger-only initially:
QStash calls a queue wrapper endpoint that tells processor to claim due paid_analysis jobs with limit=1.
This avoids putting job IDs in queue payload and uses existing claim logic.
```

If later job-specific processing needed, can add signed job ref.

## Queue Failure Handling

If payment paid but queue publish fails:

```text
payment_intent = paid
entitlement = active
generation_job = queued
return user to pending route
operator/manual processor or retryable queue publish path can recover
```

Do not mark payment failed.

Do not refund automatically.

Show:

```text
正在整理中 / 若等待過久請聯絡客服
```

Plan whether to add `queue_publish_failed` safe status or event.

## Web Polling / Pending UX

After return:

```text
paidAccessToken route opens
status route resolves entitlement
if paid result completed → render
if job queued/processing → pending
if job failed_final → support/retry/refund copy
```

External statuses remain simple:

```text
pending
processing
completed
failed
expired
```

No internal job IDs/attempts.

## LINE Optional Delivery

After completed paid result:

```text
secondary CTA:
  用 LINE 保存 / 之後追蹤這段情境
```

If user binds LINE:

```text
link entitlement or delivery record to LINE ref
do not require LINE for access
```

Do not implement now.

## Failure / Duplicate / Expired Handling

Plan cases:

### Duplicate payment

```text
same analysis_result_id already has active payment entitlement
new payment_intent should be flagged duplicate/refund_pending/refunded after verification
do not create second entitlement unless product intentionally allows multiple purchases
```

### Expired checkout

```text
payment_intent expires if not paid by expires_at
no entitlement
no generation job
```

### Paid but generation failed

```text
payment paid
entitlement active
job failed_final
user sees support/retry/refund path
support can retry job or refund
```

### Lost link

```text
support can rotate/reissue paid_access_token after verifying payment_intent/entitlement
no need for raw relationship input
```

## Feature Flags

Plan flags:

```text
ENABLE_NEWEBPAY_CHECKOUT
ENABLE_PAYMENT_ENTITLEMENTS
ENABLE_QUEUE_TRIGGER
```

Expected recommendation:

```text
One top-level payment runtime flag may be enough initially:
ENABLE_PAYMENT_RUNTIME=false by default

Queue trigger may have separate flag:
ENABLE_PAID_GENERATION_QUEUE_TRIGGER=false
```

Do not over-flag unless useful.

## Staging / Sandbox Strategy

Before real production payment:

```text
1. fake provider / operator-only paid success to test entitlement/access
2. NewebPay sandbox or test environment if available
3. queue staging POC
4. payment return/notify staging smoke
5. production disabled until smoke passes
```

## Tests To Plan

Future implementation tests:

```text
checkout route creates payment_intent and MerchantOrderNo
checkout route does not create entitlement
notify verifies signature before marking paid
notify rejects amount mismatch
notify is idempotent
paid notify creates entitlement + pa_ token hash
paid notify creates generation job
queue publish failure leaves job queued and entitlement active
return route does not trust unverified payment
paid access route resolves pa_ token
legacy unlock token still resolves
duplicate payment handling
expired checkout handling
no raw provider payload/card data stored
no raw pa_ token stored
```

## Security / Privacy

Do not store:

```text
full card numbers
CVV
raw provider payload
raw paid token
raw user input in payment tables
paid_result_json in payment/entitlement tables
queue payload with raw content
LINE user ID in queue payload
```

Do:

```text
server-side verification
amount/order check
hash paid token
signed queue callback
aggregate-only metrics
```

## Implementation Phases

Expected phases:

### Phase 0 — This plan

No code.

### Phase 1 — Fake payment runtime architecture

Operator-only fake payment success creates entitlement + paid token and resolves route.

### Phase 2 — QStash staging POC

Queue trigger with reference-only or trigger-only payload.

### Phase 3 — NewebPay checkout/notify/return

Provider integration behind feature flag.

### Phase 4 — Web polling access

Payment success redirects to paid access route.

### Phase 5 — LINE optional delivery

Secondary CTA and linking.

### Phase 6 — Production payment smoke

Small controlled payment / refund SOP.

## Required Research Report

Create:

```text
ai-collaboration/research/2026-05-27-newebpay-runtime-integration-plan-v0.md
```

Required sections:

```markdown
# NewebPay Runtime Integration Plan v0

Date: 2026-05-27

## 1. Summary

## 2. Current Foundation

## 3. Route Architecture

## 4. Checkout Creation Flow

## 5. Return vs Notify Trust Model

## 6. NewebPay Verification Requirements

## 7. Payment Intent State Transitions

## 8. Entitlement Creation

## 9. Paid Access Token / Unlock Route Integration

## 10. Generation Job Creation

## 11. Queue Trigger Strategy

## 12. Queue Failure Handling

## 13. Web Polling / Pending UX

## 14. LINE Optional Delivery

## 15. Failure / Duplicate / Expired Handling

## 16. Feature Flags

## 17. Staging / Sandbox Strategy

## 18. Tests For Future Implementation

## 19. Security / Privacy

## 20. Implementation Phases

## 21. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-27-newebpay-runtime-integration-plan-v0-execution-report.md
```

Report structure:

```markdown
# NewebPay Runtime Integration Plan v0 Execution Report

## Summary

## Files Created

## Files Updated

## Planning Decisions

## Runtime Architecture Recommendation

## Payment / Entitlement Recommendation

## Queue Trigger Recommendation

## Validation Results

## Tech Debt Review

### New Technical Debt Introduced

### Existing Technical Debt Observed

### Opportunistic Cleanup Completed

### Deferred Cleanup Candidates

### Recommended Follow-up

## Deviations From Handoff

## Git Commit

## Staging Push

## Remaining Uncertainties

## Recommended Next Step
```

## Summary Log

Append to:

```text
ai-collaboration/summaries/summary_log.md
```

Include:

```text
date
task completed
NewebPay runtime integration recommendation
validation result
commit hash
staging push status
```

## Validation

Docs/planning only. Run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint
cd apps/web && corepack pnpm test
cd apps/web && corepack pnpm build
```

No Playwright required unless code changes.

## Constraints

Do not implement:

```text
payment runtime
NewebPay API
checkout
payment return/notify routes
token resolver route
queue provider integration
request route enqueue-only
LINE enqueue-only
admin dashboard
membership
follow-up sessions
new module
ads
```

Do not modify:

```text
app code
production behavior
LINE behavior
LIFF behavior
payment behavior
prompt/schema semantics
DB schema
legal semantics
event names
existing unlock route behavior
```

Do not commit:

```text
.env
.env.local
merchant IDs
payment API keys
HashKey
HashIV
provider keys
DATABASE_URL
ANTHROPIC_API_KEY
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
OPERATOR_TEST_SECRET
CRON_SECRET
INTERNAL_JOB_SECRET
PAID_ACCESS_TOKEN_HASH_SECRET
QSTASH_TOKEN
QSTASH_CURRENT_SIGNING_KEY
QSTASH_NEXT_SIGNING_KEY
NEWEBPAY_MERCHANT_ID
NEWEBPAY_HASH_KEY
NEWEBPAY_HASH_IV
business registration documents
bank documents
identity documents
owner personal email
owner personal phone
private address
raw production exports
raw private user content
tokens/tokenized URLs/LINE IDs
paid_result_json dumps
raw provider output
raw provider payload
dedupe keys
job IDs
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "docs: plan newebpay runtime"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
route architecture recommendation
checkout/notify/return recommendation
payment/entitlement recommendation
queue trigger recommendation
web/LINE UX recommendation
security/privacy notes
implementation phases
validation results
report path
commit hash
staging push status
Tech Debt / Cleanup Notes
recommended next step
```

Then stop.
