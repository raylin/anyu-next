# Recovery Contact Preview(staging) Env Alignment v0

## Date

2026-06-01

## Completed Work

- Confirmed recovery crypto helper requirements.
- Generated strong random recovery secrets without printing or writing values to tracked files.
- Configured branch-scoped Preview(`staging`) env names only:
  - `PAYMENT_RECOVERY_CONTACT_HASH_SECRET`
  - `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY`
- Verified those env names are present only for Preview(`staging`) and absent from Production.
- Created a fresh Preview deployment and pointed `staging.anyu.tw` to it.
- Confirmed staging health on the redeployed alias.
- Ran Email recovery save QA with a fake reserved-domain contact.
- Verified sanitized staging DB recovery row shape.
- Removed the fake QA recovery row after verification.
- Reran no-card result checkout QA successfully.
- Confirmed production remains fail-closed and production DB remains without recovery table.

## Crypto Helper Requirement Summary

| Env name | Requirement |
| --- | --- |
| `PAYMENT_RECOVERY_CONTACT_HASH_SECRET` | Required non-empty secret used for HMAC-SHA256 lookup/dedupe hashes. |
| `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY` | Required AES-256-GCM key; helper accepts base64url, base64, or 64-character hex if it decodes to exactly 32 bytes. |

Fail-closed behavior:

- missing hash secret throws `payment_recovery_contact_hash_secret_missing`
- missing encryption key throws `payment_recovery_contact_encryption_key_missing`
- invalid encryption key throws `payment_recovery_contact_encryption_key_invalid`

No secret values, lengths, prefixes, suffixes, hashes, or checksums were printed or committed.

## Secret Generation

- Generated new strong random values in-process.
- Used base64url encoding for the encryption key because this is accepted by the helper and covered by tests.
- Did not write generated values to the repository.
- Did not print generated values.
- These staging secrets should now be treated as stable; rotating them would make existing staging encrypted recovery contacts unreadable and hashes unmatchable.

## Preview(staging) Env Alignment

| Env name | Preview(`staging`) branch-scoped | General Preview | Production |
| --- | --- | --- | --- |
| `PAYMENT_RECOVERY_CONTACT_HASH_SECRET` | present | absent | absent |
| `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY` | present | absent | absent |

Method:

- Used Vercel API with the linked `anyu-next` project.
- Created branch-scoped Preview(`staging`) sensitive env vars.
- Did not set general Preview.
- Did not set Production.

## Staging Redeploy

| Check | Result |
| --- | --- |
| Fresh Preview deployment created | true |
| Staging alias updated | true |
| Staging health environment | `preview` |
| Staging branch | `staging` |
| Staging commit | `546c30b10e3e` |
| Route bundle version | `payment-foundation-2026-05-29` |

Note:

- The fresh Preview deployment was created with Vercel CLI from the linked project because the direct redeploy endpoint was unavailable for this project/token shape.
- `staging.anyu.tw` was then pointed to the fresh Preview deployment.

## Email-Save QA Result

| Check | Result |
| --- | --- |
| Fresh Module 01 result created | pass |
| Checkout-start recovery gate visible | pass |
| Email recovery option visible | pass |
| LINE option deferred | pass |
| Marketing opt-in separate | pass |
| Skip warning visible | pass |
| Email save HTTP behavior | 303 redirect back to checkout |
| Email save state | `email_saved` |
| Raw contact value echoed | false |
| Recovery row created | true |
| `contact_type=email` | true |
| `source=checkout_start` | true |
| transactional consent recorded | true |
| marketing opt-in recorded when selected | true |
| encrypted value present | true |
| contact hash present | true |
| email hash present | true |
| result context linked | true |
| payment intent context linked | true |
| fake QA row cleaned after verification | true |
| final recovery contact row count | 0 |

No raw Email, encrypted value, hash value, raw `pa_`, raw `pcs_`, provider payload, or secret was printed or recorded.

## No-Card QA Result

Command:

```bash
cd apps/web && corepack pnpm run qa:result-checkout:no-card
```

Result: pass.

Sanitized outcomes:

- staging health: pass
- result page CTA: pass
- checkout-start page: pass
- recovery soft gate signals: pass
- Email primary signal: pass
- LINE deferred signal: pass
- skip warning signal: pass
- operator fake-paid: pass
- queue trigger: enqueued via `vercel_queue`
- paid status: completed
- paid access render: pass
- production disabled check: pass

No provider payment was submitted.

## Production Safety

| Check | Result |
| --- | --- |
| Production env modified | false |
| Production recovery env names present | false |
| Production health environment | `production` |
| Production branch | `main` |
| Production route bundle | `payment-foundation-2026-05-29` |
| Production checkout route | JSON `not_found` |
| Production fake-paid route | JSON `not_found` |
| Production recovery DB table exists | false |
| Production payment runtime changed | false |
| Production DB migration applied | false |

## Architecture Decisions

- Kept recovery secrets branch-scoped to Preview(`staging`) only.
- Did not configure general Preview because branch-scoped staging values are the authoritative staging runtime source.
- Did not leave the fake QA recovery contact row in staging after verification.

## Blockers

- None for staging Email-save verification.

## Uncertainties

- Production recovery secrets remain intentionally unconfigured until a separate production gate.
- Future recovery link sending still needs a separate implementation and key rotation policy.

## Suggested Next Steps

1. Run `Paid Ready / Completed Result Save CTA Plan v0` or `LINE Recovery Binding Reframe v0`.
2. Keep production recovery env and DB migration gated until production launch approval.
3. If recovery Email sending becomes a priority, plan `Recovery Link Sending Design v0` before implementation.

## Tech Debt Review

### New Technical Debt Introduced

- None.

### Existing Technical Debt Observed

- Production recovery DB/env remain gated by design.
- Recovery link sending and LINE recovery binding are not implemented.

### Opportunistic Cleanup Completed

- Removed the fake staging QA recovery contact row after verifying creation and schema shape.

### Deferred Cleanup Candidates

- Production recovery env/migration gate.
- Recovery link token table/service.
- LINE recovery-specific LIFF state.

### Recommended Follow-up

- `Paid Ready / Completed Result Save CTA Plan v0`.

## Git Commit

- Commit hash: blocked locally
- Commit message: `docs: align recovery staging env`

Commit was blocked because the sandbox denied writes inside `.git` when Git attempted to create `index.lock`. Workspace file writes still work, and no `.git/*.lock` file was present.

## Staging Push

- Push status: blocked locally
- Push command: `git push origin HEAD:staging`

Push was blocked because no local commit could be created.
