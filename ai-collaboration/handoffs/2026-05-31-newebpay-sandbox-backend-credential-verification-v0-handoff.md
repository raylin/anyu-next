# NewebPay Sandbox Backend Credential Verification v0 Handoff

Date: 2026-05-31

## Task

Verify and document the NewebPay sandbox credential/config source after v4 still failed with `trade_info_decrypt_failed`.

## Scope

In scope:

- Inspect source config consistency for checkout and NotifyURL.
- Verify local secure env presence only.
- Verify Vercel Preview(`staging`) env name presence only.
- Prepare precise owner backend checklist.
- Document ranked credential mismatch hypotheses and next actions.

Out of scope:

- Production env/runtime changes.
- Credential value printing or comparison by length/prefix/suffix/hash/checksum.
- Decrypt algorithm changes.
- Real or sandbox payment execution.
- Provider payload, decrypted payload, token, card, or raw input recording.

## Safety Constraints

- Do not print or commit MerchantID, HashKey, HashIV, `TradeInfo`, `TradeSha`, raw provider payloads, decrypted payloads, raw `pa_`, raw `pcs_`, tokenized URLs, card data, raw user input, or private values.
- Do not print credential length, prefix, suffix, hash, checksum, or derived values.
- Do not update Preview(`staging`) env again unless explicitly approved.

## Validation Plan

- Docs presence check.
- Secret/private scan on new docs.
- `git diff --check`.
- If code changes unexpectedly: app lint/test/build.

## Execution Notes

- Source inspection confirmed checkout and NotifyURL both use `getNewebPayConfig(...)`.
- Local `.env.local` contains the three sensitive NewebPay credential names, but not local non-secret sandbox URL/environment names.
- Vercel Preview(`staging`) has all expected branch-scoped NewebPay env names.
- Production has no NewebPay credential/config env names and remains out of scope.
- Env was not re-applied in this task because the prior task already aligned it and this task did not include explicit write approval.
