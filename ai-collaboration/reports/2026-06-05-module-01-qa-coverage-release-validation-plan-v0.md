# Module 01 QA Coverage & Release Validation Plan v0

## Date

2026-06-05

## Status

Completed as planning only. No QA suite implementation, production runtime change, payment, Email, or LINE send was performed.

## Purpose

Module 01 validation has grown through many handoffs, smokes, and manual checks. The next release step should not be another one-off smoke. The target is a reusable validation suite that answers:

- what is covered
- what is still manual
- what mutates staging data
- what sends real channels
- what production readiness means
- whether a production smoke is allowed to start

## Existing QA Command Inventory

| Command / helper | Target | Mutates data | Sends real Email/LINE | Owner interaction | Validates | Does not validate | Release-suite role |
|---|---:|---:|---:|---:|---|---|---|
| `corepack pnpm lint` | local | no | no | no | static code quality | runtime/provider behavior | include in local layer |
| `corepack pnpm test` | local | no | no | no | unit/route/helper behavior, auth, redaction, payment/LINE/access-link logic | deployed env, real providers | include in local layer |
| `corepack pnpm build` | local | no | no | no | Next build, App Router typing, server/client boundaries | deployed env, real providers | include in local layer |
| targeted test files | local | no | no | no | focused regression by area | deployed env | include in local fast subset |
| `qa:env:preflight` | local/operator | no | no | no | required env names by mode, safe missing-category output | actual user journey | include as preflight helper |
| `qa:result-checkout:no-card` | Preview(staging) plus production disabled check | yes, staging synthetic result/payment artifacts | no | no | deployed analyze/result/checkout-start, mandatory save UI markers, operator fake-paid, queue, paid status, paid access render, production fail-closed | real NewebPay card payment, real Email/LINE receipt | include in staging release validation |
| `qa:access-link:smoke` | Preview(staging) plus production disabled check | yes, staging operator test access-link row; cleans up/revokes | no | no | `/r/` resolver, invalid-link safety, checkout-start markers, production fail-closed | real Email/LINE receipt | include in staging release validation |
| `qa:line-access-link:smoke` | Preview(staging) plus production disabled check | yes, staging operator flow | yes, may send real staging LINE | yes, owner/test LINE account required | LINE encrypted-recipient send path, provider accepted/sent state, sanitized output | broad mobile LIFF UX; owner click unless explicitly checked | include only in owner-approved channel validation |
| `qa:production:payment-preflight -- --source vercel-production --mode dry-run` | Production metadata + public endpoints | no | no | no | production env-name presence, project-link alignment, public pages, checkout/fake-paid fail-closed, route reachability | real payment; real messages; DB schema unless explicitly requested | include in production-preflight layer |
| `qa:fake-paid` | Preview(staging) | yes | no | no | authorized operator fake-paid and processor path | user checkout-start UX, real provider | keep as building block; not primary release command |
| `qa:newebpay:sandbox` | Preview(staging) sandbox | yes | no, unless downstream hooks configured separately | may require browser/provider step | sandbox NewebPay checkout creation/verification/poll | production provider behavior | optional sandbox validation, not always in default suite |
| `ops:paid-result:lookup` | direct DB legacy | read-only | no | no | legacy DB support summary | target Admin API boundary; deployed auth; CLI model | mark deprecated; not default release path |
| `authorized-fake-paid-qa.mjs` | Preview(staging) | yes | no | no | operator fake-paid route and paid access | checkout-start and access-link save gate | building block |
| `result-checkout-no-card-qa.mjs` | Preview(staging) | yes | no | no | end-to-end no-card flow | real provider and real channels | core staging command |
| `recovery-link-smoke-qa.mjs` | Preview(staging) | yes | no | no | access-link resolver/operator smoke | real channels | core staging command |
| `line-recovery-smoke-qa.mjs` | Preview(staging) | yes | yes, if provider ready | yes | real LINE access-link send path | desktop/mobile LIFF bind UX | optional channel command |
| `production-payment-runtime-preflight.mjs` | Production | no | no | no | production env/deploy/fail-closed readiness | real payment | production gate command |
| `support-paid-result-lookup.mjs` | direct DB legacy | read-only | no | no | legacy support lookup | target Admin API boundary | deprecated after Admin API/CLI smoke |

## Existing Test Coverage Inventory

Important existing tests already cover:

- Admin API auth, missing result, sanitized ready result, provider-message/merchant-order presence booleans
- checkout route disabled/runtime gating and provider config errors
- checkout service pending-intent creation, idempotency, missing config safety, no paid-artifact creation
- checkout-start page desktop Email-only gate, mobile LINE-first order, saved state, safe errors
- NotifyURL route and service verification, idempotency, malformed payload safety, no raw token exposure
- provider-level ReturnURL waiting/expired/failed/support states and non-mutating behavior
- payment access handoff, status route, paid-access page, invalid/unpaid/processing/ready states
- paid generation service/processor/cron route and processor auth
- Email access-link template, provider adapter, duplicate prevention, auto-send hooks, non-fatal failures
- LINE bind state, LIFF page, route hardening, recipient secret, access-link sender, duplicate prevention
- `/r/` access-link resolver, invalid/expired support state, token leakage checks
- production payment runtime preflight project/env/fail-closed behavior
- legacy direct DB support lookup redaction

## Validation Layers

### A. Unit / Route Tests

Fast, local, CI-friendly.

Includes:

- `lint`
- targeted test subset
- full `test`
- Admin API auth/redaction
- checkout-start copy/gate tests
- ReturnURL/NotifyURL tests
- payment/entitlement/generation tests
- Email/LINE access-link helper tests

Does not include deployed env or real third-party behavior.

### B. Integration Tests

Local or test runtime, still no real payment/messages.

Includes:

- route plus mocked DB/provider tests
- operator fake-paid helper tests
- no-op Email/LINE sender paths
- processor auth/queue behavior

Does not replace Preview(staging), because third-party LIFF/payment/provider flows are no longer treated as pure local integration.

### C. Staging Release Validation

Hits Preview(staging). May mutate staging test data. Default path must not send real Email/LINE.

Required default:

- `qa:result-checkout:no-card`
- `qa:access-link:smoke`
- Admin API staging smoke once Preview(staging) `ADMIN_API_TOKEN` is set
- production fail-closed checks embedded or run separately

Optional owner-approved channel checks:

- real staging Email receipt/click
- real staging LINE receipt/click
- `qa:line-access-link:smoke` only when owner expects a message

### D. Manual Acceptance Checkpoints

Manual truth is explicit and cannot be silently replaced by provider accepted status.

Examples:

- `ownerEmailReceived`
- `ownerEmailLinkOpenedPaidResult`
- `ownerLineReceived`
- `ownerLineLinkOpenedPaidResult`
- `ownerCardPaymentCompleted`
- `ownerBrowserPaidResultRendered`

### E. Production Preflight / Controlled Smoke

Production stays frozen by default. Production controlled smoke requires:

- staging release suite pass or owner-accepted partial
- production preflight pass
- explicit owner approval
- known runtime enable/disable window
- known final runtime decision

## Module 01 Journey Coverage Matrix

| Journey / requirement | Current coverage | Missing / weakness | Automation target | Staging release required | Production smoke required |
|---|---|---|---|---:|---:|
| Free analyze/result path | unit tests; no-card QA `source_analyze` | none material | automated staging | yes | yes |
| Checkout-start availability | checkout-start tests; no-card QA | mobile visual device spot-check remains partly manual | automated + manual visual | yes | yes |
| Desktop Email-only mandatory save | checkout-start tests; owner staging verification | browser/device matrix not centralized | automated DOM plus manual acceptance field | yes | no, except smoke path |
| Mobile LINE-first visual order | checkout-start tests; owner staging verification | real mobile browser matrix not centralized | automated HTML/UA checks plus manual field | yes | yes if LINE included |
| Mobile Email fallback | checkout-start tests; owner staging verification | full fallback paid flow not always run | automated default; manual optional | yes | optional |
| Payment handoff/provider payload | checkout service tests; no-card QA confirms provider fields not exposed; sandbox helper | real provider form only manual/sandbox | staging sandbox optional; production manual | yes for safe non-real path | yes |
| Unified NewebPay ReturnURL | ReturnURL tests; no-card/production preflight route reachability | provider browser return only manual in production | automated tests + production smoke | yes | yes |
| NotifyURL payment truth | NotifyURL tests; sandbox/prod partial evidence | real production NotifyURL only controlled smoke | tests + production manual smoke | yes by tests | yes |
| Paid generation processor | processor tests; no-card QA queue processing | production processor only preflight/smoke | automated no-card + preflight | yes | yes |
| Paid result render | paid access tests; no-card QA paid render | owner browser final view manual | automated + manual | yes | yes |
| Delivery artifact | tests; owner staging checks | central status not in one report | automated + manual field | yes | yes |
| Email access-link creation/send | tests; owner staging real Email verified | default staging command should avoid real send | optional channel suite + manual field | yes, owner-verified | yes if full loop desired |
| LINE bind/recipient secret/send | tests; real staging LINE verified; LINE smoke helper | desktop LIFF non-support boundary should be explicit | optional channel suite + manual field | yes, owner-verified | yes if full loop desired |
| `/r/` resolver | tests; access-link smoke; owner Email/LINE click | none material | automated + manual click fields | yes | yes |
| Expired/invalid `/r/` | tests; access-link smoke invalid-link safety | none material | automated | yes | yes |
| Expired/failed ReturnURL | ReturnURL tests; production expiry fix | no real provider expiry default | automated; manual only when encountered | yes | yes |
| Admin API paid result lookup | route/helper tests implemented | deployed staging token smoke missing | staging release check | yes | read-only production smoke later |
| Production fail-closed | no-card/access-link QA; production preflight | should be central release gate | automated | yes | yes |
| Vercel canonical project/source guard | production preflight | should be surfaced in release report | automated | yes | yes |

## Target Command Suite

Do not overbuild. Recommended v0 suite:

| Proposed command | Purpose | Sends real messages | Touches production | Notes |
|---|---|---:|---:|---|
| `pnpm qa:module01:local` | lint + targeted Module 01/Admin/payment/access-link tests + build | no | no | can run before every handoff |
| `pnpm qa:module01:staging` | Preview(staging) non-real-message release checks: no-card + access-link smoke + Admin API smoke if token/result provided | no | read-only fail-closed checks only | default staging release gate |
| `pnpm qa:module01:staging:channels` | owner-approved real staging Email/LINE receipt/link-click validation | yes | no | never run repeatedly without owner approval |
| `pnpm qa:module01:production-preflight` | production env/deploy/source/fail-closed readiness | no | read-only only | wrapper around existing production preflight |
| `pnpm qa:module01:release` | orchestrates local + staging + production-preflight and writes coverage report | no by default | read-only fail-closed only | should emit pass/partial/blocked |

Implementation can start by wrapping existing commands, not rewriting them.

## Coverage Report Schema

The suite should emit both Markdown and JSON.

Suggested JSON shape:

```json
{
  "module": "module01",
  "environment": "staging",
  "commit": "git-or-deployment-sha",
  "deployment": {
    "baseUrl": "https://staging.anyu.tw",
    "environment": "preview",
    "branch": "staging",
    "routeBundleVersion": "payment-foundation-2026-05-29"
  },
  "generatedAt": "2026-06-05T00:00:00.000Z",
  "status": "pass",
  "checks": [
    {
      "id": "admin_api_lookup",
      "status": "pass",
      "manualRequired": false,
      "ownerVerified": false,
      "sendsRealEmail": false,
      "sendsRealLine": false,
      "mutatesData": false,
      "productionTouched": false,
      "blockers": [],
      "warnings": []
    }
  ],
  "manualAcceptance": {
    "ownerEmailReceived": "pending",
    "ownerEmailLinkOpenedPaidResult": "pending",
    "ownerLineReceived": "pending",
    "ownerLineLinkOpenedPaidResult": "pending",
    "ownerCardPaymentCompleted": "pending"
  },
  "blockers": [],
  "warnings": [],
  "nextRequiredAction": "owner_accept_staging_baseline"
}
```

Allowed overall statuses:

- `pass`
- `partial`
- `blocked`
- `skipped`

Useful high-level check statuses:

- `staging_user_journey_pass`
- `admin_api_smoke_missing`
- `production_frozen_pass`
- `line_real_message_manual_required`
- `support_lookup_legacy_abandoned`

## Admin API Smoke Integration

Admin API staging smoke belongs inside `qa:module01:staging`, not as a standalone project-driving handoff.

Required checks:

- Preview(staging) `ADMIN_API_TOKEN` exists.
- no token returns `401`.
- wrong token returns `401`.
- valid token + known staging `resultId` returns sanitized summary.
- response schema is stable.
- response includes useful diagnosis/action categories.
- response does not include raw Email, LINE ID, encrypted recipient, hashes, raw access-link token, tokenized URL, source text, paid result content, provider payload, merchant order, or provider message ID.

Inputs should be explicit:

- `ADMIN_API_TOKEN` from shell/process env
- known `resultId`
- `--env staging`

This smoke should not read web env mirror files or DB URLs.

## Manual Acceptance Model

Manual acceptance must be first-class suite data, not ad hoc chat memory.

Required fields:

- `ownerEmailReceived: true | false | pending`
- `ownerEmailLinkOpenedPaidResult: true | false | pending`
- `ownerLineReceived: true | false | pending`
- `ownerLineLinkOpenedPaidResult: true | false | pending`
- `ownerCardPaymentCompleted: true | false | pending`
- `ownerBrowserPaidResultRendered: true | false | pending`

Rules:

- Provider accepted/sent status cannot substitute for owner receipt/click.
- Manual fields can make a suite `partial` even if automation passes.
- Tokenized links, screenshots with tokens, raw Email, raw LINE ID, and raw user input must not be pasted into reports.

## Deprecation / Cleanup Recommendations

- Keep existing one-off smoke scripts as internal building blocks for now.
- Wrap them under `qa:module01:*` release commands before removing aliases.
- Keep old `qa:access-link:smoke` and `qa:line-access-link:smoke` until the new suite is stable.
- Mark `ops:paid-result:lookup` direct DB helper as legacy and exclude it from the target release path.
- Replace direct DB support lookup with Admin API + pure client CLI.
- Do not clean recovery-named internals inside the release-suite task unless required for suite correctness.

## Production Gating Policy

New rule:

Production controlled smoke cannot start from a one-off Codex recommended next step.

It requires all of:

1. `qa:module01:local` pass.
2. `qa:module01:staging` pass, or owner explicitly accepts a documented partial.
3. Admin API staging smoke pass or owner explicitly defers support lookup.
4. Real staging Email/LINE manual channel checks accepted when the release includes channel delivery.
5. `qa:module01:production-preflight` pass.
6. Owner explicitly approves production runtime enablement.
7. Runtime enablement window and final runtime decision are documented before payment.

## Recommended Implementation Tasks

1. **Module 01 Release Validation Suite v0**
   - add wrapper command(s)
   - define JSON/Markdown coverage output
   - orchestrate safe local + staging + production-preflight checks

2. **Staging Admin Lookup API Smoke Integrated Into Suite**
   - set Preview(staging) `ADMIN_API_TOKEN` in an approved env task
   - validate no-token/wrong-token/valid-token behavior
   - validate sanitized result summary

3. **Module 01 Staging Release Validation Run v0**
   - run suite against current Preview(staging)
   - record manual Email/LINE acceptance fields
   - produce pass/partial/blocked release report

4. **Controlled Production Payment Smoke Retry**
   - only after owner accepts staging release validation
   - use explicit runtime window and final runtime decision

## Known Gaps

- Admin API deployed staging smoke is not yet run because Preview(staging) `ADMIN_API_TOKEN` is not yet configured.
- No centralized coverage report currently exists.
- Existing one-off scripts are useful but not orchestrated.
- Manual Email/LINE acceptance is recorded in reports/chat, not machine-readable suite output.
- Direct DB support lookup still exists as legacy tooling.
- Production smoke history has proven components in pieces but not a clean one-shot production journey.

## Architecture Decisions

- QA should be layered and suite-driven rather than handoff-driven trial and error.
- Staging is the primary third-party integration validation environment.
- Real Email/LINE sends belong in owner-approved channel validation, not the default automated staging suite.
- Admin API smoke is part of staging release validation, not a separate project direction.
- Production smoke is gated by suite status plus owner approval, not by Codex next-step momentum.

## Blockers

- None for this planning task.

## Suggested Next Step

Implement **Module 01 Release Validation Suite v0** as a thin orchestrator around existing commands, with Admin API staging smoke as a suite check once Preview(staging) `ADMIN_API_TOKEN` is configured.
