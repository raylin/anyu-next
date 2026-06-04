# Controlled Production Payment Smoke v1 Retry with LINE Bind Checkpoint

Date: 2026-06-04

## Completed Work

- Saved the handoff before operational work.
- Ran Production payment runtime preflight in dry-run mode.
- Confirmed readiness before enabling: `pass_ready_for_controlled_smoke`.
- Confirmed Production public pages were live.
- Temporarily added the requested Production flags to the currently linked Vercel project:
  - `ENABLE_PAYMENT_RUNTIME=true`
  - `ENABLE_NEWEBPAY_CHECKOUT=true`
- Redeployed Production and aliased `https://anyu.tw` to the runtime-enabled deployment.
- Created a fresh synthetic Production Module 01 free result with non-private test text.
- Checked checkout-start and checkout API before owner payment.
- Aborted before Email save, LINE bind, and payment because payment provider runtime config was missing in the linked deployment project.
- Removed the two temporary runtime flags from the linked Vercel project.
- Redeployed Production fail-closed and re-aliased `https://anyu.tw`.
- Verified final Production safety:
  - public pages live
  - checkout API returns `not_found`
  - fake-paid route returns 404
  - linked Vercel project has no remaining temporary runtime env vars
- Ran read-only sanitized Production DB aggregate check.

## Preflight Result

- Command: `qa:production:payment-preflight -- --source vercel-production --mode dry-run`
- Result: `pass_ready_for_controlled_smoke`
- Redaction: no values, lengths, prefixes, suffixes, hashes, checksums, provider payloads, or tokens printed.

## Runtime Enablement Window

- Start: after dry-run preflight passed.
- Enabled flags:
  - `ENABLE_PAYMENT_RUNTIME`
  - `ENABLE_NEWEBPAY_CHECKOUT`
- Fake-paid/operator routes were not enabled.
- Queue/processor flags were not enabled in this retry window.
- End: flags removed and fail-closed redeploy completed after the config blocker was found.

## Failure Classification

- First failure: `provider_form_failed`
- More specific category: `production_vercel_project_env_mismatch`

The checkout API became reachable after enabling the two flags, but returned a provider config error with missing NewebPay checkout/notify config. This showed that the locally linked Vercel project used for CLI deploy did not have the full Production payment/provider env set even though the dry-run metadata preflight reported required names.

Because provider config was missing, the smoke was aborted before:

- owner Email save
- owner LINE bind
- card payment
- Email send
- LINE message send

## LINE Bind Checkpoint Result

- LINE bind checkpoint was not reached.
- No `這個 LINE 查看連結已失效` result was observed in this retry.
- No LINE contact was created.
- No LINE recipient secret was created.

## Payment Result

- No production payment was run.
- Payment method was not used.
- No card data was entered.
- ReturnURL / NotifyURL / paid result render were not exercised in this retry.

## Sanitized DB Verification

Read-only aggregate Production DB check after abort:

- LINE contact rows: 0
- LINE recipient secret rows: 0
- Email contact rows: 2
- payment intent rows: 2
- access-link rows: 1

No raw Email, raw LINE user ID, encrypted recipient, hash, token, provider payload, or raw result content was printed.

## Production Safety Result

- Final Production runtime status: disabled.
- Final checkout behavior: fail-closed.
- Public pages remained live.
- No production Email was sent.
- No production LINE message was sent.
- No production DB mutation was performed manually.
- No NewebPay dashboard setting was changed.
- No ads or broad traffic were enabled.

## Architecture Decisions

- Aborted before payment rather than trying to patch provider env during an active smoke window.
- Removed temporary runtime flags immediately after detecting the env/project mismatch.
- Did not proceed to LINE bind because the provider checkout runtime was not safe/readied.

## Blockers

- Production deploy/env source-of-truth mismatch must be resolved before another payment smoke.
- The local Vercel CLI link points to project `web`, which did not contain the full Production payment/provider env set.
- Health metadata still reports git commit as `unknown` for local CLI deploys, reducing deployment provenance clarity.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed:
  - Vercel project/env source of truth is ambiguous between the deploy target and the preflight metadata source.
  - Local CLI deploys include `.env` warnings and lack git commit metadata in `/api/health`.
- Opportunistic cleanup completed: none.
- Deferred cleanup candidates:
  - normalize Vercel project linking and document the canonical production deploy command
  - make production preflight verify the same project/deployment target that `vercel deploy` will use
  - add a safe runtime config-shape check to catch provider config mismatch before runtime enablement

## Suggested Next Steps

1. Run a Production Vercel Project / Env Source-of-Truth Reconciliation task.
2. Correct the deploy target or env target so deploy, preflight, and `anyu.tw` all reference the same Production project.
3. Re-run `qa:production:payment-preflight` with project-target verification.
4. Retry Controlled Production Payment Smoke v1 only after the source-of-truth mismatch is resolved.
