# Secret-safe NewebPay Sandbox E2E Helper / QA Runner Cleanup v0 Handoff

Date: 2026-05-31

## Task

Create or clean up secret-safe sandbox E2E helper tooling so future NewebPay sandbox / controlled payment smoke runs are repeatable and less likely to leak secrets or stale payment forms.

## Scope

- QA tooling cleanup only.
- Inspect existing fake-paid QA runner and payment checkout/status patterns.
- Add a dedicated sandbox helper if appropriate.
- Document command usage, supported modes, required env names, redaction guarantees, limitations, and validation.

## Constraints

- Do not enable payment runtime.
- Do not change production flags.
- Do not modify Vercel env values.
- Do not deploy.
- Do not run actual sandbox or real payments in this task.
- Do not change NewebPay checkout/notify/payment behavior except safe QA helper support.
- Do not add LINE delivery.
- Do not change Module 01 prompt/result behavior.
- Do not change public product/legal copy.
- Do not commit generated temporary forms or secrets.
- Do not print or commit MerchantID, HashKey, HashIV, TradeInfo, TradeSha, raw `pa_`, raw `pcs_`, tokenized URLs, raw user input, card data, private billing, or proof documents.

## Planned Validation

- `cd apps/web && corepack pnpm lint`
- targeted helper dry run without secrets
- `cd apps/web && corepack pnpm test` if tests change
- `cd apps/web && corepack pnpm build` if app code changes
- docs presence check
- secret/private scan on changed files
- `git diff --check`

## Expected Deliverables

- Sandbox E2E helper command/script if feasible.
- Execution report under `ai-collaboration/reports/`.
- Summary log update.
- Git commit and push to `origin/staging` if validation passes.
