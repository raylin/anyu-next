# Production Vercel Project / Env Source-of-Truth Reconciliation v0 Handoff

Date: 2026-06-04

## Task

Identify and document the canonical Production Vercel project, environment, alias target, env source, and deploy path so future controlled production payment smokes use the correct project and env.

## Context

- Controlled Production Payment Smoke v1 Retry with LINE Bind Checkpoint was aborted before Email save, LINE bind, or payment.
- Dry-run production preflight returned `pass_ready_for_controlled_smoke`.
- Temporarily enabling runtime flags and deploying through the local CLI made checkout API reachable, but it failed with missing NewebPay checkout/notify config.
- Temporary runtime flags were removed and Production was redeployed fail-closed.
- Public pages are live, checkout/fake-paid return 404, and no payment/message was sent.
- Current blocker: Vercel project/env/deploy target mismatch.

## Constraints

- Do not enable Production runtime or checkout.
- Do not run payments.
- Do not send Email or LINE messages.
- Do not modify Production env values or rotate secrets.
- Do not expose env values, provider credentials, tokens, raw customer data, or private payloads.
- Do not alias production to an unverified deployment.

## Planned Work

1. Inspect local Vercel linking state from `.vercel/project.json` files.
2. Inspect Vercel project/deployment/alias metadata with names/IDs only.
3. Compare env metadata source, local deploy target, live `anyu.tw` alias target, and production health output.
4. Run presence-only env checks for candidate projects.
5. Verify Production remains fail-closed.
6. Recommend canonical deploy/env path and remediation steps.
7. Update report, summary log, and dashboard.
8. Run docs/redaction checks, commit, and push to `origin/staging`.

## Uncertainties

- Some Vercel metadata may show project IDs or deployment IDs. Treat them as operational metadata, not secrets, but avoid printing env values or credentials.
- GitHub integration details may not be discoverable from the available CLI without browser/console access.

## Current State

- Root `.vercel/project.json` points to Vercel project `anyu-next` with root directory `apps/web`.
- `apps/web/.vercel/project.json` points to separate Vercel project `web`.
- Root project `anyu-next` has the required Production env names.
- App-directory project `web` has no required Production env names after temporary flags were removed.
- `https://anyu.tw` currently points to a `web` deployment.
- This explains why preflight passed while local app-directory deploy lacked NewebPay provider config.
- `qa:production:payment-preflight` was updated to detect this mismatch and now returns `blocked_project_link_mismatch`.
- No Production env values were modified.
- Production runtime/checkout were not enabled.
- No payment or message was sent.
