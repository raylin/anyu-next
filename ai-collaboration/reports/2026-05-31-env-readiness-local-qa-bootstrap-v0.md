# Env Readiness / Local QA Bootstrap v0

Date: 2026-05-31

## Summary

Added a secret-safe local QA env preflight for ANYU payment/queue/sandbox smoke workflows.

New command:

```bash
cd apps/web
corepack pnpm run qa:env:preflight -- <mode>
```

Supported modes:

- `fake_paid`
- `fake_paid_queue`
- `sandbox_checkout`
- `sandbox_verify`
- `manual_fallback`
- `vercel_env_alignment`
- `all`

The script checks presence only. It does not print env values, lengths, prefixes, suffixes, hashes, checksums, provider payloads, tokens, or URLs with tokens. It does not mutate Vercel env and does not deploy.

## 1. Current QA Scripts Reviewed

Reviewed:

- `apps/web/scripts/authorized-fake-paid-qa.mjs`
- `apps/web/scripts/newebpay-sandbox-e2e-helper.mjs`
- `apps/web/package.json`
- payment/queue/env references in source and recent reports
- `.env.local` handling pattern by key presence only

Existing commands:

| Command | Purpose |
|---|---|
| `corepack pnpm run qa:fake-paid` | Authorized staging fake-paid QA, default manual processor mode. |
| `QA_FAKE_PAID_PROCESSOR_MODE=queue corepack pnpm run qa:fake-paid` | Authorized staging fake-paid QA through queue-mode processor. |
| `corepack pnpm run qa:newebpay:sandbox -- create-checkout` | Creates fresh staging sandbox checkout and local temporary provider form. |
| `corepack pnpm run qa:newebpay:sandbox -- poll-status` | Polls payment status from prior sandbox state file. |
| `corepack pnpm run qa:newebpay:sandbox -- verify-after-payment` | Verifies post-browser-payment status/access path from prior sandbox state file. |

## 2. Added Preflight Tool

Added:

- `apps/web/scripts/qa-env-preflight.mjs`
- package script `qa:env:preflight`

Behavior:

- reads shell env presence;
- reads `.env.local` key names only when present;
- never prints `.env.local` values;
- classifies readiness by QA mode;
- prints sanitized JSON;
- exits `2` when required shell env or required local-file keys are missing for the selected mode;
- exits `0` when the selected mode has required local readiness.

Example blocked output shape:

```json
{
  "ok": false,
  "redaction": {
    "valuesPrinted": false,
    "lengthsPrinted": false,
    "prefixesPrinted": false,
    "suffixesPrinted": false,
    "hashesPrinted": false
  },
  "modes": [
    {
      "mode": "fake_paid",
      "shell": {
        "requiredMissing": [
          "OPERATOR_TEST_SECRET",
          "INTERNAL_JOB_SECRET"
        ]
      }
    }
  ]
}
```

## 3. Local QA Env Matrix

### Fake-Paid QA

Command:

```bash
corepack pnpm run qa:env:preflight -- fake_paid
corepack pnpm run qa:fake-paid
```

| Type | Env names |
|---|---|
| Required local shell | `OPERATOR_TEST_SECRET`, `INTERNAL_JOB_SECRET` |
| Optional local shell | `QA_FAKE_PAID_INPUT_SUFFIX`, `QA_FAKE_PAID_PROCESSOR_MODE` |
| Expected Preview(staging) | `ENABLE_OPERATOR_FAKE_PAID_SUCCESS`, `OPERATOR_TEST_SECRET`, `INTERNAL_JOB_SECRET`, `ENABLE_PAID_GENERATION_PROCESSOR`, `PAID_ACCESS_TOKEN_HASH_SECRET`, `PAYMENT_CHECKOUT_SESSION_SECRET` |
| Must match Preview(staging) | `OPERATOR_TEST_SECRET`, `INTERNAL_JOB_SECRET` |
| Should not exist in Production | `ENABLE_OPERATOR_FAKE_PAID_SUCCESS`, `OPERATOR_TEST_SECRET` |
| Safe blocked behavior | Blocks before authorized fake-paid or stops before manual processor fallback. |

### Fake-Paid Queue Mode

Command:

```bash
corepack pnpm run qa:env:preflight -- fake_paid_queue
QA_FAKE_PAID_PROCESSOR_MODE=queue corepack pnpm run qa:fake-paid
```

| Type | Env names |
|---|---|
| Required local shell | `OPERATOR_TEST_SECRET` |
| Optional local shell | `QA_FAKE_PAID_INPUT_SUFFIX`, `QA_FAKE_PAID_PROCESSOR_MODE` |
| Expected Preview(staging) | `ENABLE_OPERATOR_FAKE_PAID_SUCCESS`, `OPERATOR_TEST_SECRET`, `ENABLE_PAID_JOB_QUEUE_TRIGGER`, `PAID_JOB_QUEUE_PROVIDER`, `PAID_JOB_QUEUE_TOPIC`, `ENABLE_PAID_GENERATION_PROCESSOR`, `PAID_ACCESS_TOKEN_HASH_SECRET`, `PAYMENT_CHECKOUT_SESSION_SECRET` |
| Must match Preview(staging) | `OPERATOR_TEST_SECRET` |
| Should not exist in Production | `ENABLE_OPERATOR_FAKE_PAID_SUCCESS`, `OPERATOR_TEST_SECRET`, `ENABLE_PAID_JOB_QUEUE_TRIGGER` unless launch-approved |
| Safe blocked behavior | Blocks before authorized fake-paid or completes without queue enqueue evidence. |

### NewebPay Sandbox Checkout

Command:

```bash
corepack pnpm run qa:env:preflight -- sandbox_checkout
corepack pnpm run qa:newebpay:sandbox -- create-checkout
```

| Type | Env names |
|---|---|
| Required local shell | `OPERATOR_TEST_SECRET` |
| Optional local shell | `QA_NEWEBPAY_BASE_URL`, `QA_NEWEBPAY_INPUT_SUFFIX`, `QA_NEWEBPAY_STATE_FILE` |
| Expected Preview(staging) | `OPERATOR_TEST_SECRET`, `ENABLE_NEWEBPAY_CHECKOUT`, `NEWEBPAY_MERCHANT_ID`, `NEWEBPAY_HASH_KEY`, `NEWEBPAY_HASH_IV`, `NEWEBPAY_CHECKOUT_URL`, `NEWEBPAY_NOTIFY_URL`, `NEWEBPAY_ENVIRONMENT`, `NEXT_PUBLIC_APP_URL`, `PAYMENT_CHECKOUT_SESSION_SECRET`, `PAID_ACCESS_TOKEN_HASH_SECRET`, `ENABLE_PAID_JOB_QUEUE_TRIGGER`, `PAID_JOB_QUEUE_PROVIDER`, `PAID_JOB_QUEUE_TOPIC` |
| Must match Preview(staging) | `OPERATOR_TEST_SECRET` |
| Should not exist in Production | `OPERATOR_TEST_SECRET`; sandbox NewebPay credentials must not be in Production |
| Safe blocked behavior | Blocks before checkout creation and does not write a provider form. |

### NewebPay Sandbox Verify / Poll

Commands:

```bash
corepack pnpm run qa:env:preflight -- sandbox_verify
corepack pnpm run qa:newebpay:sandbox -- poll-status
corepack pnpm run qa:newebpay:sandbox -- verify-after-payment
```

| Type | Env names |
|---|---|
| Required local shell | none |
| Optional local shell | `QA_NEWEBPAY_BASE_URL`, `QA_NEWEBPAY_STATE_FILE` |
| Expected Preview(staging) | `NEWEBPAY_MERCHANT_ID`, `NEWEBPAY_HASH_KEY`, `NEWEBPAY_HASH_IV`, `NEWEBPAY_CHECKOUT_URL`, `NEWEBPAY_NOTIFY_URL`, `NEWEBPAY_ENVIRONMENT`, `NEXT_PUBLIC_APP_URL`, `ENABLE_PAID_JOB_QUEUE_TRIGGER`, `PAID_JOB_QUEUE_PROVIDER`, `PAID_JOB_QUEUE_TOPIC` |
| Must match Preview(staging) | none locally; relies on previous checkout state file and deployed staging config |
| Should not exist in Production | sandbox credentials must not be in Production |
| Safe blocked behavior | Requires prior `/private/tmp` state file; does not print secrets or tokens. |

### Manual Processor Fallback

Command:

```bash
corepack pnpm run qa:env:preflight -- manual_fallback
```

| Type | Env names |
|---|---|
| Required local shell | `INTERNAL_JOB_SECRET` |
| Optional local shell | none |
| Expected Preview(staging) | `INTERNAL_JOB_SECRET`, `ENABLE_PAID_GENERATION_PROCESSOR` |
| Must match Preview(staging) | `INTERNAL_JOB_SECRET` |
| Should not exist in Production | allowed only if production manual processor SOP explicitly requires it; not a public flag |
| Safe blocked behavior | Fake-paid QA stops after delivery artifact/idempotency checks with partial result. |

### Vercel Env Alignment Preflight

Command:

```bash
corepack pnpm run qa:env:preflight -- vercel_env_alignment
```

| Type | Env names |
|---|---|
| Required local shell | `VERCEL_TOKEN` |
| Required `.env.local` key names | `OPERATOR_TEST_SECRET`, `INTERNAL_JOB_SECRET`, `NEWEBPAY_MERCHANT_ID`, `NEWEBPAY_HASH_KEY`, `NEWEBPAY_HASH_IV` |
| Expected Preview(staging) | `OPERATOR_TEST_SECRET`, `INTERNAL_JOB_SECRET`, `NEWEBPAY_MERCHANT_ID`, `NEWEBPAY_HASH_KEY`, `NEWEBPAY_HASH_IV`, `NEWEBPAY_CHECKOUT_URL`, `NEWEBPAY_NOTIFY_URL`, `NEWEBPAY_ENVIRONMENT`, `NEXT_PUBLIC_APP_URL` |
| Must match Preview(staging) | `OPERATOR_TEST_SECRET`, `INTERNAL_JOB_SECRET`, `NEWEBPAY_MERCHANT_ID`, `NEWEBPAY_HASH_KEY`, `NEWEBPAY_HASH_IV` |
| Should not exist in Production | `OPERATOR_TEST_SECRET`; sandbox NewebPay credentials |
| Safe blocked behavior | Blocks alignment workflow; use secure local source or owner UI, not chat. |

## 4. Local Env File Guidance

- `apps/web/.env.local` may contain local QA secrets if it remains gitignored.
- Never commit `.env.local`.
- Never paste secrets into chat.
- Never store provider payloads, raw `TradeInfo`, raw `TradeSha`, raw `pa_` tokens, raw `pcs_` tokens, tokenized URLs, card data, or raw user input in repo files.
- Use `/private/tmp/anyu-newebpay-smoke/` for temporary sandbox forms and state.
- The new preflight reads `.env.local` key names only; it does not load or print values.
- `apps/web/.env.example` now lists QA/payment/queue env names with blank values only.

Important operational note: the current Node QA scripts use `process.env`. A key existing in `.env.local` does not automatically make it available to those scripts unless the shell exports it or the command runner loads it. Use preflight to detect whether the current shell is ready.

## 5. Vercel Preview(staging) Caution

- Vercel branch-scoped Preview(`staging`) env overrides general Preview env.
- Preview(`staging`) is authoritative for staging QA.
- Do not update Production while running sandbox or operator QA.
- Staging should use sandbox NewebPay values only.
- Production should use real provider values only after NewebPay approval and production config dry-run.
- Do not place sandbox credentials in Production.
- Do not enable production queue/payment flags as part of QA bootstrap.
- This task added preflight only. It did not change Vercel env values.

## 6. Validation Results

Dry runs:

- `env -u OPERATOR_TEST_SECRET -u INTERNAL_JOB_SECRET -u VERCEL_TOKEN corepack pnpm run qa:env:preflight -- fake_paid`
  - Expected blocked result.
  - Exit code `2`.
  - Printed names only.
- `env -u OPERATOR_TEST_SECRET -u INTERNAL_JOB_SECRET -u VERCEL_TOKEN corepack pnpm run qa:env:preflight -- sandbox_verify`
  - Expected pass because no local shell secrets are required for status verification mode.
  - Exit code `0`.
  - Printed names only.

Full validation is recorded in the final completion summary.

## Architecture Decisions

- Added a local preflight tool that checks presence only and does not mutate Vercel env.
- Kept Vercel env alignment as an operator workflow, not an automated mutation script.
- Treated `.env.local` as a secure local source for key presence only; existing QA scripts still require shell env for secrets.

## Blockers

- None for this tooling task.

## Uncertainties

- Whether future env alignment should be automated. Current recommendation is no until owner approves a dedicated mutation workflow.
- Whether production controlled-smoke should get a separate preflight profile after NewebPay approval.

## Suggested Next Steps

- Use `corepack pnpm run qa:env:preflight -- fake_paid_queue` before the next staging queue QA.
- Use `corepack pnpm run qa:env:preflight -- sandbox_checkout` before any new NewebPay sandbox payment smoke.
- Consider `Production Payment Config Dry-Run Preflight v0` after NewebPay approval/formal credentials.

## Known Technical Debt

- QA secrets are still manually exported into the shell for runtime scripts.
- There is no Vercel CLI env diff tool; this task intentionally avoids env mutation.

## Tech Debt Review

### New Technical Debt Introduced

- None.

### Existing Technical Debt Observed

- QA scripts depend on shell env and do not load `.env.local` automatically.
- Preview(`staging`) env values can diverge from local secure config without an explicit diff/alignment workflow.

### Opportunistic Cleanup Completed

- Added QA/payment/queue env names to `.env.example` with blank values only.

### Deferred Cleanup Candidates

- Dedicated Vercel Preview(`staging`) env name-only audit/diff command.
- Production launch-gate preflight profile after merchant approval.

### Recommended Follow-up

- `Production Payment Config Dry-Run Preflight v0` after NewebPay approval.

## Git Commit

- Commit hash: pending
- Commit message: `tooling: add qa env preflight`

## Staging Push

- Push status: pending
- Push command: `git push origin HEAD:staging`
