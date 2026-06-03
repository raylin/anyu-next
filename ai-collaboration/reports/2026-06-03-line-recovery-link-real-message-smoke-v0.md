# LINE Recovery Link Real Message Smoke v0

Date: 2026-06-03

## Summary

Preview(staging) real LINE recovery link smoke passed.

The smoke verified:

- encrypted LINE recipient secret can be resolved server-side
- paid delivery completion creates a LINE-channel recovery link
- LINE Messaging API sends a link-only recovery message
- owner receives the LINE message
- owner opens `/r/` link and reaches the paid result
- staging DB records sent/used state without storing raw tokens

No production env, production DB, production payment runtime, payment provider behavior, membership, Email sending, or campaign LINE messaging changed.

## Implementation / Fixes Added

This task required a narrow implementation path before the smoke could run safely:

- `createAndSendLineRecoveryLink` now resolves encrypted LINE recipient secrets server-side when an explicit recipient is not provided.
- LINE sender now accepts `LINE_MESSAGING_CHANNEL_ACCESS_TOKEN`, while retaining existing `LINE_CHANNEL_ACCESS_TOKEN` compatibility.
- Successful LINE send marks the linked recipient secret `last_used_at` without exposing the recipient.
- Added Preview(staging)-only operator endpoint:
  - `POST /api/operator/line-recovery-smoke`
- Added local QA command:
  - `cd apps/web && corepack pnpm run qa:line-recovery:smoke`
- Added env preflight metadata for the LINE recovery smoke mode.
- Added tests for recipient-secret resolution, provider alias, operator route gating, sanitized output, and QA command registration.

The operator route is gated by:

- `VERCEL_ENV=preview`
- `VERCEL_GIT_COMMIT_REF=staging`
- `ENABLE_OPERATOR_LINE_RECOVERY_SMOKE`
- `OPERATOR_TEST_SECRET`

Production returns not found / disabled.

## LINE Env Readiness

Preview(staging) runtime readiness:

| Env name | Result |
| --- | --- |
| `ENABLE_OPERATOR_LINE_RECOVERY_SMOKE` | branch-scoped Preview(staging), added |
| `LINE_RECOVERY_MESSAGE_PROVIDER` | branch-scoped Preview(staging), added as `line` |
| `LINE_MESSAGING_CHANNEL_ACCESS_TOKEN` or compatible token | present at runtime, inferred by provider success |
| `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY` | present at runtime, inferred by recipient decrypt success |
| `PAYMENT_RECOVERY_LINK_TOKEN_SECRET` | present at runtime, inferred by recovery link creation |
| `OPERATOR_TEST_SECRET` | present locally/runtime for QA gate |

No env values, lengths, prefixes, suffixes, hashes, or checksums were printed.

Production env was not modified.

## Staging Deploy

A fresh Preview deployment was created from commit `eb832e599c02` and aliased to `https://staging.anyu.tw`.

Staging health after deploy:

| Field | Result |
| --- | --- |
| environment | `preview` |
| branch | `staging` |
| git commit | `eb832e599c02` |
| routeBundleVersion | `payment-foundation-2026-05-29` |

## Smoke Path Used

The smoke used the new Preview(staging)-only operator route:

1. Locate the latest eligible LINE recovery contact with an active encrypted recipient secret.
2. Create an operator fake-paid context for the same result.
3. Bind the LINE recovery contact to the new payment/entitlement context.
4. Process paid generation completion.
5. Let the existing paid-delivery recovery send hook create a LINE-channel `/r/` recovery link and send it.
6. Return sanitized JSON only.

No raw LINE userId, encrypted recipient, recipient hash, raw `prl_`, token hash, raw `pa_`, raw `pcs_`, provider payload, or report content was returned.

## Real LINE Message Result

Command:

```bash
cd apps/web && corepack pnpm run qa:line-recovery:smoke
```

Runtime result:

| Check | Result |
| --- | --- |
| staging health | pass |
| auto-send hook exercised | true |
| fake paid context created | true |
| LINE contact bound to payment context | true |
| recipient secret resolved server-side | true |
| paid generation processed | true |
| recovery link created | true |
| recovery link status at route response | `sent` |
| LINE message sent | true |
| production endpoint fail-closed | true |

The first local QA-script run returned a failed final summary because the script treated its own neutral boolean key name as unsafe. The runtime response itself was safe and the LINE message had already been sent successfully. The script redaction rule was tightened afterward; the LINE smoke was not rerun to avoid duplicate LINE messages.

## Owner LINE Verification

Owner verified:

- LINE message received: yes
- copy is link-only: yes
- no report body/raw input/`pa_`/`pcs_`: yes
- `/r/` link opens paid result: yes

Owner did not paste tokenized links, screenshots, LINE identifiers, or provider payloads.

## DB Sent-State Verification

Sanitized Preview(staging) DB verification:

| Check | Result |
| --- | --- |
| LINE recovery link rows | `1` |
| latest link channel | `line` |
| latest link status | `used` |
| `sent_at` present | true |
| token hash present | true, not printed |
| `used_at` present | true |
| not expired | true |
| result/payment/entitlement linked | true |
| linked contact type | `line` |
| linked contact source | `checkout_start` |
| transactional consent present | true |
| contact hash / LINE hash present | true, not printed |
| linked recipient secret active | true |
| recipient secret key version | `v1` |
| encrypted recipient present | true, not printed |
| recipient hash present | true, not printed |
| recipient secret `last_used_at` present | true |

The link status is `used` rather than `sent` because the owner opened the `/r/` link after receiving the LINE message. `sent_at` remains present, so this confirms both send and click-through.

## Regression QA

Command:

```bash
cd apps/web && corepack pnpm run qa:recovery-link:smoke
```

Result: pass against Preview(staging) commit `eb832e599c02`.

Command:

```bash
cd apps/web && corepack pnpm run qa:result-checkout:no-card
```

Result: pass against Preview(staging) commit `eb832e599c02`.

Production fail-closed checks passed in both QA paths.

## Validation

Code validation:

- `cd apps/web && corepack pnpm lint`: passed
- targeted LINE/recovery/operator tests: passed
- `cd apps/web && corepack pnpm test`: passed
- `cd apps/web && corepack pnpm build`: passed
- `cd apps/web && corepack pnpm run qa:recovery-link:smoke`: passed
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`: passed

Documentation/safety validation is recorded in the final task summary after commit checks.

## Production Safety

Production safety result: pass.

Confirmed:

- Production health remains `environment=production`, branch `main`.
- Production operator LINE smoke route returned not found / fail-closed.
- Production checkout/fake-paid routes stayed fail-closed through regression QA.
- Production env was not modified.
- Production DB was not modified.
- No production LINE messages were sent.

## Failure Classification

No product/runtime failure occurred.

Observed local tooling issue:

- category: `qa_redaction_false_positive`
- impact: local command returned nonzero after the real send because it flagged a safe boolean key name.
- fix: tightened the script redaction pattern to detect actual `recipientHash` fields.
- no second LINE send was triggered for this fix.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: the smoke route intentionally reuses the latest eligible staging LINE contact; a future multi-recipient operator chooser would need stricter controls before broader QA use.
- Opportunistic cleanup completed: LINE sender now resolves encrypted recipients directly, which removes the prior explicit-recipient gap.
- Deferred cleanup candidates: add a non-sending DB-only verification mode for `qa:line-recovery:smoke`.

## Recommended Next Task

`Module 01 Recovery End-to-End Launch Gate Snapshot v0`

Alternative if continuing implementation immediately:

`LINE Recovery Message Duplicate / Resend Policy v0`
