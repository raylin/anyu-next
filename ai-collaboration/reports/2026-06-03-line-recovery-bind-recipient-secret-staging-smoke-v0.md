# LINE Recovery Bind Recipient Secret Staging Smoke v0

Date: 2026-06-03

## Summary

Preview(staging) served commit `debf5450cba8`, and the owner-assisted LINE mobile bind smoke passed after recipient-secret integration.

The bind now creates both required staging records:

- hash-only `payment_recovery_contacts` LINE row
- linked encrypted `payment_recovery_contact_secrets` row

No LINE message was sent. No Email was sent. No production env, production DB, production payment runtime, payment provider behavior, or schema changed.

## Staging Freshness

`https://staging.anyu.tw/api/health` returned:

| Field | Result |
| --- | --- |
| environment | `preview` |
| branch | `staging` |
| git commit | `debf5450cba8` |
| routeBundleVersion | `payment-foundation-2026-05-29` |

Freshness result: pass.

Production health remained:

| Field | Result |
| --- | --- |
| environment | `production` |
| branch | `main` |
| git commit | `1990fc034d74` |
| routeBundleVersion | `payment-foundation-2026-05-29` |

## Env And Schema Readiness

Env readiness:

| Env name | Result |
| --- | --- |
| `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY` | present in Preview(staging), inferred by successful recipient-secret write |
| `PAYMENT_RECOVERY_CONTACT_HASH_SECRET` | present in Preview(staging), inferred by successful LINE contact bind |
| `OPERATOR_TEST_SECRET` | present locally for QA helpers |

No env values, lengths, prefixes, suffixes, hashes, or checksums were printed.

Schema readiness:

| Check | Result |
| --- | --- |
| Neon project | `anyu-next` |
| Staging branch | `preview` |
| Staging branch ID | `br-fragrant-union-aoh4udf1` |
| Database | `neondb` |
| `payment_recovery_contacts` table exists | true |
| `payment_recovery_contact_secrets` table exists | true |
| Production DB targeted | false |

Pre-smoke sanitized baseline:

| Check | Result |
| --- | --- |
| `contact_type=line` rows | `1` |
| LINE recipient-secret rows | `0` |

## Automated Regression

Command:

```bash
cd apps/web && corepack pnpm run qa:recovery-link:smoke
```

Result: pass.

Covered:

- staging health at `debf5450cba8`
- runtime operator recovery-link smoke
- valid `/r/[REDACTED]` resolver render
- invalid-link safety
- cleanup by revocation
- production recovery-link smoke endpoint fail-closed
- no raw `prl_`, token hash, `pa_`, `pcs_`, Email, or LINE values printed
- no Email or LINE sent

Command:

```bash
cd apps/web && corepack pnpm run qa:result-checkout:no-card
```

Result: pass.

Covered:

- result CTA
- checkout-start rendering
- Email primary recovery option
- LINE recovery CTA signal
- operator fake-paid path
- queue completion
- paid status completed
- paid access render
- production checkout/fake-paid fail-closed checks
- no provider payment submitted

## Owner-Assisted LINE Mobile Bind Smoke

Method:

- Owner opened the checkout-start LINE recovery CTA in LINE mobile context / test account.
- Owner completed the recovery-specific LIFF bind flow.
- Owner reported success.
- Owner did not paste tokenized URLs, raw LIFF state, idToken, cookies, raw LINE ID, or screenshots containing private tokens.

Observed result: pass.

Confirmed:

- success / safe return state
- no `缺少 LINE 保存狀態`
- no LINE login `400 Bad Request`
- no legacy short-code fulfillment copy
- no report content shown inside LINE
- no LINE paid report-body delivery language

Fallback behavior:

- No fallback was needed.
- Email fallback remains available by design.

## Sanitized DB Verification

Sanitized query against Preview(staging) Neon verified aggregate and boolean fields only.

`payment_recovery_contacts` result:

| Check | Result |
| --- | --- |
| total `contact_type=line` rows | `2` |
| latest contact type | `line` |
| latest status | `verified` |
| latest source | `checkout_start` |
| transactional consent present | true |
| contact hash present | true |
| LINE hash present | true |
| result context linked | true |
| payment context linked | true |
| entitlement context linked | false |

`payment_recovery_contact_secrets` result:

| Check | Result |
| --- | --- |
| LINE recipient-secret rows | `1` |
| active LINE recipient-secret rows | `1` |
| linked to latest LINE contact | true |
| channel | `line` |
| purpose | `recovery_link_delivery` |
| status | `active` |
| key version | `v1` |
| encrypted recipient present | true |
| recipient hash present | true |
| created timestamp present | true |
| updated timestamp present | true |
| revoked timestamp present | false |

The latest checkout-start bind has no entitlement link yet because it occurs before payment completion. That is expected for this smoke.

No raw LINE user ID, encrypted recipient, recipient hash, contact hash, tokenized URL, provider payload, or report content was printed.

Column metadata also confirms `payment_recovery_contacts` has no raw LINE userId column.

## Production Safety

Production safety result: pass.

Confirmed:

- Production health remains `environment=production`, branch `main`.
- Production checkout/fake-paid/operator routes stayed fail-closed through automated QA.
- Production DB remains without `payment_recovery_contacts`.
- Production DB remains without `payment_recovery_contact_secrets`.
- Production env was not modified.
- Production payment runtime remains disabled/fail-closed.
- No LINE messages were sent.
- No Email was sent.

## Architecture Decisions

- Treated owner-assisted LINE success plus sanitized linked secret row creation as the required proof for recipient-secret integration.
- Used aggregate and boolean DB checks only; no private identifiers or encrypted values were inspected or reported.
- Kept LINE message sending out of scope; this smoke proves recipient storage, not delivery.

## Blockers

- None for recipient-secret staging smoke.

## Uncertainties

- Real LINE Messaging API push is still unproven and remains gated behind the next task.
- The checkout-start bind context does not include entitlement until payment completion; the later send hook must rely on paid-delivery contact binding before LINE real message smoke.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: no reusable sanitized LINE bind DB-check helper exists yet.
- Opportunistic cleanup completed: none; documentation-only smoke.
- Deferred cleanup candidates: add a reusable operator-safe DB verification helper for LINE contact + secret linkage.

## Recommended Next Task

`LINE Recovery Link Real Message Smoke v0`
