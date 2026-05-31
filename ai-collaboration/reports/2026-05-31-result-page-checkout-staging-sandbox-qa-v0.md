# Result-Page Checkout Staging Sandbox QA v0

Date: 2026-05-31

## Result

Pass.

The real Module 01 result-page checkout path was verified on staging:

result page -> checkout-start page -> NewebPay sandbox credit-card one-time payment -> ReturnURL polling/status -> payment access -> completed paid result.

No production payment runtime, production env, production DB, provider logic, public copy, Module 02, LINE delivery, or prompt/result generation behavior was changed.

## Staging Readiness Preflight

| Check | Result |
| --- | --- |
| Staging health | Pass |
| Environment | `preview` |
| Branch | `staging` |
| Commit | `03b408e5b40a` |
| Route bundle | `payment-foundation-2026-05-29` |
| Sandbox checkout env readiness | Pass by `qa:env:preflight -- sandbox_checkout` |
| Sandbox verify env readiness | Pass by `qa:env:preflight -- sandbox_verify` |
| Checkout-start route deployed | Pass |
| ReturnURL polling deployed | Pass |
| Queue trigger staging readiness | Covered by existing Preview(staging) env readiness and backend completion evidence |

## Fresh Source Result

Created a fresh Module 01 result through the normal staging analyze route.

Sanitized result:

| Check | Result |
| --- | --- |
| Analyze HTTP status | `200` |
| Result ID present | Yes |
| Cache hit | No |
| Raw user input recorded | No |

The exact source text was not recorded in this report.

## Result-Page CTA

Sanitized result-page checks:

| Check | Result |
| --- | --- |
| Result page HTTP status | `200` |
| Paid CTA visible | Pass |
| CTA text | `解鎖完整報告｜NT$49` |
| CTA links to checkout-start | Pass |
| Review-pending disabled state absent on staging | Pass |
| Internal-test/no-charge wording absent | Pass |
| LINE paid-delivery promise absent | Pass |

## Checkout-Start Page

Sanitized checkout-start checks:

| Check | Result |
| --- | --- |
| Checkout-start HTTP status | `200` |
| Product name visible | Pass |
| NT$49 visible | Pass |
| One-time / non-subscription copy visible | Pass |
| Web delivery copy visible | Pass |
| Button `前往藍新安全付款頁` visible | Pass |
| Provider form present | Pass |
| Provider form targets sandbox ccore gateway | Pass |
| `OPERATOR_TEST_SECRET` absent from HTML | Pass |
| HashKey / HashIV absent from HTML | Pass |
| Raw secrets absent | Pass |
| TradeInfo / TradeSha recorded | No |

The provider form necessarily contains provider fields for browser submission, but the full payload was not printed or recorded.

## Manual Sandbox Payment

Owner/operator confirmation:

| Check | Result |
| --- | --- |
| Payment submitted | Yes |
| Method | Sandbox credit-card one-time payment |
| Browser result | Returned to staging |
| Real card used | No |
| Card data recorded | No |

## ReturnURL / Status / Access

Observed through staging request logs and backend state:

| Check | Result |
| --- | --- |
| ReturnURL/status polling activity | Pass, multiple `POST /api/modules/ambiguous-temperature/payment/status` HTTP 200 entries |
| Payment access page activity | Pass, multiple `GET /m/ambiguous-temperature/payment/access` HTTP 200 entries |
| Tokenized URL recorded | No |
| Raw `pcs_` token recorded | No |
| Raw `pa_` token recorded | No |
| Reload/access stability | Pass by repeated access HTTP 200 entries |

## Backend Chain

Verified against Neon project `anyu-next`, branch `preview`, database `neondb` using aggregate/sanitized fields only.

| Area | Result |
| --- | --- |
| Payment intent count for result | `1` |
| Payment intent provider | `newebpay` |
| Payment intent environment | `sandbox` |
| Payment amount | `49` minor units / TWD |
| Payment status | `paid` |
| NotifyURL received | Yes |
| Paid timestamp present | Yes |
| Entitlement count | `1` |
| Entitlement status | `active` |
| Paid access hash present | Yes |
| Generation job count | `1` |
| Generation job status | `completed` |
| Generation job trigger source | `newebpay_notify` |
| Generation job output ref present | Yes |
| Generation job error category | None |
| Paid result count | `1` |
| Paid result status | `completed` |
| Paid result JSON present | Yes |

Vercel request logs in the queried window did not show the provider NotifyURL or queue callback request paths, but the staging database confirms `notify_received`, paid transition, `newebpay_notify` generation job creation, completed generation, and paid access render. No manual processor was used during this QA.

## Production Safety

| Check | Result |
| --- | --- |
| Production health | `production` / `main` / `payment-foundation-2026-05-29` |
| Production checkout route | JSON `404` / `not_found` |
| Production fake-paid route | JSON `404` / `not_found` |
| Production `/refund` | HTTP `200` |
| Production `/legal` | HTTP `200` |
| Production payment runtime enabled | No evidence; routes remain fail-closed |

## Failure Classification

None. First failure: none.

## Validation / Safety

- Documentation-only after QA.
- No runtime code changed.
- No production env changed.
- No real payment used.
- No provider credentials, raw provider payloads, TradeInfo, TradeSha, raw `pcs_`/`pa_` tokens, tokenized URLs, card data, raw user input, or private values were recorded.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed:
  - Local `.env.local` `DATABASE_URL` did not point to the staging app schema used by Preview(staging), so direct local DB probing was not used for conclusions.
  - Vercel CLI continues to emit package-update cache `EPERM` noise even when logs are fetched successfully.
  - Entitlement row does not store the generation job link, while the generation job itself completed successfully. This appears pre-existing and did not block paid access.
- Opportunistic cleanup completed: none.
- Deferred cleanup candidates:
  - Add a dedicated sanitized result-page checkout QA helper that stores only result ID and a redacted state file for post-payment verification.
  - Investigate whether entitlement `generation_job_id` should be backfilled/linked when the job is created or reused.

## Recommended Next Step

Run `Checkout-Start Visual Bridge Polish v0` while merchant approval remains pending. If NewebPay approval/formal credentials arrive first, switch to `Production Payment Config Dry-Run v0` with production runtime still disabled.
