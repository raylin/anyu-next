# Scoped Runtime Config Architecture Plan v0

## Metadata

- task name: Scoped Runtime Config Architecture Plan v0
- date: 2026-06-07
- report path: `ai-collaboration/reports/2026-06-07-scoped-runtime-config-architecture-plan-v0.md`
- commit: pending at report creation
- branch / push status: pending at report creation
- model / effort: GPT-5 Codex, high
- taskStartedAt: 2026-06-07T02:40:54Z
- taskCompletedAt: 2026-06-07T02:41:11Z
- totalWallClockDuration: about 1 minute
- humanWaitDuration: about 0 minutes
- netCodexWorkDuration: about 1 minute

## Context

- why this task exists: Vercel env toggling requires redeploys and made controlled production runtime windows slow and brittle. The latest smoke stopped before payment because the runtime-window helper could not cleanly classify an intentionally enabled runtime window.
- upstream blocker / mainline context: The owner approved replacing frequent Vercel env runtime toggles with a lightweight internal runtime config system behind Admin API + `pnpm ops`. Module/global scoping is also needed before Module 02 to prevent new-module work from affecting stable Module 01.
- out-of-scope items: implementation, migrations, runtime behavior changes, Admin API code changes, CLI code changes, Vercel env changes, production runtime, payment, Email, LINE, DB mutation, theme UI, and Module 02.

## Scope

- what changed: This report defines the v0 architecture for registry-first scoped runtime config, DB storage/audit, Admin API routes, CLI grammar/help, resolver semantics, tests, docs, and migration away from Vercel env runtime flags.
- what did not change: No source runtime, Admin API, CLI, schema, env, Vercel, DB, payment, Email, LINE, or UI behavior changed.

## Implementation Summary

- files / areas changed: planning handoff, this architecture report, summary log, and dashboard.
- key design decisions: recommend DB-backed runtime config values with exact compound identity `environment + scopeType + scopeKey + key`, no implicit global/module override, no TTL, no secrets, and fail-closed critical resolver semantics.
- local / opportunistic cleanup decisions: none.

## Runtime Config Design Principles

### Registry First

- All supported config keys must be defined in a codebase registry.
- Admin API and CLI reject unknown keys.
- No arbitrary unregistered keys.
- Registry is the source of truth for type, scopes, risk, criticality, and write constraints.

### Lightweight

- v0 value types: `boolean`, `string`, `number`.
- No arbitrary JSON values.
- No percentage rollout.
- No targeting rules.
- No remote feature-flag platform semantics.

### Scoped

- `scopeType = global | module`.
- `scopeKey` is required for `module`, and should be the module slug, for example `ai-temperature`.
- `scopeKey` is `null` or a sentinel empty value for `global`.
- Global writes require explicit confirmation.

### No Implicit Override

- Global and module values are separate compound keys.
- Resolver never falls back from module to global.
- Services must explicitly read both global and module values if they need both.
- Example: payment route reads module `payment.window.enabled`; delivery service may separately read global and module delivery keys.

### No TTL in v0

- `set` and `unset` are explicit.
- All writes require a reason.
- Audit events record every change.
- No automatic expiry, scheduled deletion, or hidden cleanup.

### Critical Resolver

- Unknown key throws internally.
- Inactive key throws internally.
- Scope not allowed throws internally.
- Type mismatch throws internally.
- Missing critical config throws internally and user-facing routes fail closed.
- No user-facing stack traces.

### No Secrets

Runtime config must not store provider credentials, API keys, tokens, DB URLs, crypto secrets, encrypted recipients, hashes, or tokenized URLs.

## Registry Schema

Recommended path:

`apps/web/src/lib/runtime-config/registry.ts`

Reason:

- Runtime routes and Admin API live in `apps/web`, so registry imports stay local.
- Tests can import registry without Admin CLI dependency.
- Admin CLI should fetch registry via Admin API, not import app source directly.

Recommended TypeScript shape:

```ts
export type RuntimeConfigValueType = "boolean" | "string" | "number";
export type RuntimeConfigScopeType = "global" | "module";
export type RuntimeConfigOwner = "product" | "ops" | "engineering";
export type RuntimeConfigRiskLevel = "low" | "medium" | "high";

export type RuntimeConfigRegistryEntry = {
  key: string;
  description: string;
  valueType: RuntimeConfigValueType;
  allowedScopes: RuntimeConfigScopeType[];
  moduleAllowlist?: string[];
  active: boolean;
  critical: boolean;
  owner: RuntimeConfigOwner;
  riskLevel: RuntimeConfigRiskLevel;
  allowedValues?: string[];
  min?: number;
  max?: number;
  requiresReason: boolean;
  globalWriteRequiresConfirm: boolean;
  notes: string;
  createdAt: string;
  deprecatedAt?: string;
  replacementKey?: string;
};
```

Registry validation rules:

- keys unique
- key format lowercase dotted path, for example `payment.window.enabled`
- no secret-looking names, for example `secret`, `token`, `key`, `password`, `database_url`, `hash`
- active entries require description and createdAt
- high-risk entries require `requiresReason=true`
- global high-risk writes require `globalWriteRequiresConfirm=true`
- moduleAllowlist values must match known module slugs when provided
- string entries with `allowedValues` must enforce enum values
- number entries with min/max must enforce bounds

## DB Schema

### `runtime_config_values`

Recommended columns:

- `id`
- `environment`
- `key`
- `scope_type`
- `scope_key`
- `value_type`
- `value_json`
- `active`
- `reason`
- `updated_by`
- `created_at`
- `updated_at`
- unique index on `(environment, key, scope_type, scope_key)`

Notes:

- `value_json` stores typed primitive JSON only: boolean, string, or number.
- No arbitrary object/array JSON in v0.
- Store `scope_key = ""` for global to keep the unique compound key simple, or use nullable `scope_key` with a partial/coalesced unique index if preferred by existing DB style.
- Recommendation: use empty string for global in v0 to avoid PostgreSQL nullable unique-index surprises.

### `runtime_config_events`

Recommended columns:

- `id`
- `environment`
- `key`
- `scope_type`
- `scope_key`
- `action`: `set | unset | deactivate | reactivate`
- `value_before_json`
- `value_after_json`
- `reason`
- `actor`
- `created_at`

### Unset Behavior

Recommendation: `unset` sets `active=false` on `runtime_config_values` and writes an event.

Reason:

- Preserves last value metadata for support.
- Avoids silent disappearance during audits.
- History remains in events either way.
- Resolver treats inactive as missing/inactive and fails closed for critical keys.

Alternative: physical delete value row and rely only on events. This is simpler but worse for current-state introspection.

## v0 Key List

| Key | Description | Type | Scope | Critical | Risk | Owner | Global write | First use | Replaces Vercel env |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `payment.window.enabled` | Opens a controlled payment checkout window for one module. | boolean | module only | yes | high | ops | not allowed | Module 01 production smoke | frequent use of `ENABLE_PAYMENT_RUNTIME` + `ENABLE_NEWEBPAY_CHECKOUT` |
| `payment.global.disabled` | Emergency global payment kill switch. | boolean | global only | yes | high | ops | allowed with confirm | emergency shutdown / upper bound | complements env upper bound |
| `delivery.line.enabled` | Allows LINE access-link send path for selected scope. | boolean | global, module | yes | high | ops | allowed with confirm | smoke/channel control | none initially |
| `delivery.email.enabled` | Allows Email access-link send path for selected scope. | boolean | global, module | yes | high | ops | allowed with confirm | smoke/channel control | none initially |

Optional / defer:

| Key | Recommendation |
| --- | --- |
| `module.public.enabled` | Defer until Module 02/public launch work; risk of overloading runtime config with routing/product publication decisions. |
| `ai.model.strategy` | Defer; model routing has provider-cost/quality implications and should be designed separately. |

Important v0 choice:

- `payment.window.enabled` should be module-scoped only.
- For Module 01 smoke, set `payment.window.enabled=true` with `--module ai-temperature`.
- This avoids a global payment toggle that could unintentionally affect Module 02.

## Resolver API

Recommended app service path:

`apps/web/src/lib/runtime-config/resolve.ts`

API:

```ts
requireBoolean(key, { environment, scopeType, scopeKey }): Promise<boolean>
requireString(key, { environment, scopeType, scopeKey }): Promise<string>
requireNumber(key, { environment, scopeType, scopeKey }): Promise<number>
getOptionalBoolean(key, { environment, scopeType, scopeKey }): Promise<boolean | null>
```

`getOptional*` should be allowed only for non-critical registry entries.

Error classes/categories:

- `ConfigKeyNotRegistered`
- `ConfigKeyInactive`
- `ConfigScopeNotAllowed`
- `ConfigValueMissing`
- `ConfigValueTypeMismatch`
- `ConfigValueInvalid`

Behavior:

- unknown key -> `ConfigKeyNotRegistered`
- inactive registry key -> `ConfigKeyInactive`
- scope not allowed -> `ConfigScopeNotAllowed`
- missing active DB row for critical key -> `ConfigValueMissing`
- value type mismatch -> `ConfigValueTypeMismatch`
- invalid enum/min/max -> `ConfigValueInvalid`

Runtime handling:

- Critical routes catch config errors, log safe category, and fail closed.
- No user-facing stack traces.
- No secret output.

No-override example:

```ts
const paymentOpen = await requireBoolean("payment.window.enabled", {
  environment: "production",
  scopeType: "module",
  scopeKey: "ai-temperature",
});

const globalLineAllowed = await requireBoolean("delivery.line.enabled", {
  environment: "production",
  scopeType: "global",
  scopeKey: "",
});

const moduleLineAllowed = await requireBoolean("delivery.line.enabled", {
  environment: "production",
  scopeType: "module",
  scopeKey: "ai-temperature",
});
```

The resolver does not merge these values.

## Admin API Architecture

Routes:

- `GET /api/admin/runtime-config/registry`
- `GET /api/admin/runtime-config/values`
- `GET /api/admin/runtime-config/get?key=...&scopeType=...&scopeKey=...`
- `POST /api/admin/runtime-config/set`
- `POST /api/admin/runtime-config/unset`
- `GET /api/admin/runtime-config/history`

Auth:

- `x-admin-api-token`
- `ADMIN_API_TOKEN`
- auth-first before lookup or validation details

Write requirements:

- reason required
- actor derived from admin token label if available, otherwise `admin-api`
- global write requires `confirmGlobalImpact=true`
- unknown key rejected
- scope not allowed rejected
- type validated
- string enum / number min-max validated

Response shape:

```json
{
  "ok": true,
  "key": "payment.window.enabled",
  "environment": "production",
  "scopeType": "module",
  "scopeKey": "ai-temperature",
  "value": true,
  "valueType": "boolean",
  "active": true,
  "source": "explicit",
  "updatedAtPresent": true,
  "reasonPresent": true,
  "riskLevel": "high",
  "recommendedActions": ["unset_after_smoke"]
}
```

Missing value response:

```json
{
  "ok": false,
  "source": "missing",
  "error": "config_value_missing",
  "recommendedActions": ["set_value_with_reason"]
}
```

Safety:

- Runtime config values are non-secret by policy, but responses should still be structured and sanitized.
- Do not return event row internals that are not needed.
- Do not expose auth token labels unless intentionally safe.

## CLI Grammar and Help Design

Command family:

```bash
pnpm ops config registry --env production
pnpm ops config list --env production
pnpm ops config get --env production payment.window.enabled --module ai-temperature
pnpm ops config set --env production payment.window.enabled true --module ai-temperature --reason "controlled production smoke"
pnpm ops config unset --env production payment.window.enabled --module ai-temperature --reason "smoke complete"
pnpm ops config history --env production payment.window.enabled --module ai-temperature
```

Scope flags:

- `--module <moduleSlug>`
- `--global`
- scope required for `get`, `set`, `unset`, and `history`
- `registry` and `list` can omit scope
- global write requires `--confirm-global-impact`

Error categories:

- `scope_required`
- `config_key_not_registered`
- `config_key_inactive`
- `config_scope_not_allowed`
- `config_value_type_mismatch`
- `config_value_invalid`
- `reason_required`
- `global_confirm_required`
- `admin_auth_failed`

CLI help sections:

- Usage
- Commands
- Scope
- Examples
- Safety notes
- Environment/auth notes

Expected help content:

```text
Usage:
  pnpm ops config <command> --env <staging|production> [key] [value] [scope]

Commands:
  registry        List registered config keys
  list            List active values
  get             Read one value
  set             Set one value, reason required
  unset           Deactivate one value, reason required
  history         Show audit history

Scope:
  --module <moduleSlug>   Module-scoped config
  --global                Global-scoped config

Examples:
  pnpm ops config set --env production payment.window.enabled true --module ai-temperature --reason "controlled production smoke"
  pnpm ops config unset --env production payment.window.enabled --module ai-temperature --reason "smoke complete"
  pnpm ops config list --env production
  pnpm ops config set --env production delivery.line.enabled false --global --confirm-global-impact --reason "LINE emergency disable"
  pnpm ops config history --env production payment.window.enabled --module ai-temperature

Safety:
  Runtime config is not for secrets. Unknown keys are rejected. Global writes require confirmation.

Environment/auth:
  ADMIN_API_TOKEN must come from the current shell/process env. The CLI does not read apps/web env mirrors.
```

## Runtime Route Migration Plan

Current flags:

- `ENABLE_PAYMENT_RUNTIME`
- `ENABLE_NEWEBPAY_CHECKOUT`

Recommended migration:

1. Add DB runtime config behind existing env upper bound.
2. Keep existing env flags as static emergency upper bound during implementation.
3. Payment/checkout route checks:
   - static env upper bound if retained
   - module-scoped `payment.window.enabled`
   - no implicit global fallback
4. Production smoke uses Admin API config `set/unset`, not Vercel env or redeploy.
5. Production preflight checks runtime config registry/table availability and required keys.
6. Runtime-window helper reports config state instead of planning Vercel env toggles.
7. Once proven, deprecate Vercel env runtime flags for frequent toggling.

Static upper-bound recommendation:

- Add `PAYMENT_RUNTIME_STATIC_ALLOWED=true|false` only if we want a clearer long-lived emergency bound.
- Safer short-term path: keep current Vercel env flags as upper bound during v0 implementation, but stop using them for frequent smoke windows once DB config is ready.
- Later rename/deprecate to avoid semantic confusion.

## Production Smoke Runbook Changes

Future opening:

```bash
pnpm ops config set --env production payment.window.enabled true --module ai-temperature --reason "controlled production smoke"
pnpm ops config get --env production payment.window.enabled --module ai-temperature
cd apps/web && corepack pnpm run qa:production:runtime-window -- --action status
```

Future closing:

```bash
pnpm ops config unset --env production payment.window.enabled --module ai-temperature --reason "smoke complete"
pnpm ops config get --env production payment.window.enabled --module ai-temperature
cd apps/web && corepack pnpm run qa:production:runtime-window -- --action status
```

No Vercel env update or redeploy for normal runtime windows.

## Test Strategy

### Registry Tests

- all registry keys unique
- active keys have descriptions
- allowedScopes valid
- high-risk keys require reason
- global write confirm required where appropriate
- no secret-looking key names allowed
- module allowlist validates against module registry

### Resolver Tests

- exact compound key read
- no global/module override
- unknown key throws
- wrong scope throws
- missing critical throws
- type mismatch throws
- enum/min/max validation
- unset/inactive behavior
- fail-closed route helper behavior

### Admin API Tests

- auth-first
- registry response sanitized
- get/list/history
- set/unset success
- reason required
- global confirm required
- invalid key/scope/type/value errors
- no secret output

### CLI Tests

- help output includes commands/examples/safety notes
- missing scope errors
- set/get/unset/history
- global confirm enforcement
- JSON output sanitized
- no app env mirror loading
- no DB/Vercel/Neon access
- response schema validation

### Integration / QA

- mock-flow uses `payment.window.enabled` after implementation
- production preflight checks runtime config availability
- runtime-window helper reports config state
- no production payment in tests

## Documentation Plan

Update:

- `ai-collaboration/process/admin-ops-boundary.md`
- `ai-collaboration/process/production-gate-policy.md`
- `ai-collaboration/process/env-mirror-policy.md`
- `tools/admin-cli` README or equivalent
- runtime config registry README, if useful
- production smoke runbook / handoff template examples

Docs must state:

- runtime config is not secrets
- module/global no-override rule
- critical keys fail closed
- all writes require reason
- global writes require confirmation
- CLI examples for opening/closing Module 01 payment window, listing config, global LINE emergency disable, and history lookup

## Risks and Decisions Needed

| Decision | Options | Recommendation |
| --- | --- | --- |
| unset behavior | delete row vs `active=false` | Use `active=false` and audit event. Better current-state introspection. |
| static upper-bound env | keep current flags, add new static flag, or remove env upper bound | Keep current env flags as upper bound during v0; stop using them for frequent toggling after config proves out. |
| first v0 key list | payment only vs payment + delivery | Include payment and delivery keys. Delivery gates are needed for smoke/channel safety. |
| moduleAllowlist strictness | optional strings vs module registry validation | Validate against module registry when provided. |
| production smoke wait | retry now vs wait for runtime config implementation | Wait for Scoped Runtime Config Implementation v0 before another smoke. |

## Validation

- commands run: docs presence check, dashboard HTML sanity, secret/private scan, `git diff --check`.
- gateStatus: not_applicable
- commandExitCode: not_applicable
- requiredChecksStatus: not_applicable
- optionalChecksStatus: not_applicable
- targetDeployCommit: not_applicable
- deployedCommitAtGateStart: not_applicable
- deployedCommitAtGateEnd: not_applicable
- freshnessStatus: not_applicable
- gates skipped and why: app tests/build/gates were skipped because this is documentation/planning only.

## Safety

- production runtime enabled: no
- payment run: no
- Email sent: no
- LINE sent: no
- Vercel env changed: no
- DB mutated: no
- secrets/private data exposed: no

## Result

- result: pass
- first failure category: not_applicable
- blocker status: architecture plan complete; implementation remains pending

## Tech Debt / Cleanup Notes

- new technical debt introduced: none
- existing technical debt observed: Vercel env runtime flags remain brittle for frequent windows until runtime config is implemented
- opportunistic cleanup completed: none
- deferred cleanup candidates: rename/deprecate legacy env runtime flags after DB config is proven

## Decisions Made

- Recommend registry path `apps/web/src/lib/runtime-config/registry.ts`.
- Recommend `active=false` on unset rather than deleting current row.
- Recommend module-only `payment.window.enabled` for v0.
- Recommend keeping existing Vercel env flags as temporary static upper bound.
- Recommend waiting for Scoped Runtime Config Implementation v0 before retrying production smoke.

## Uncertainties / Blockers

- Owner should confirm the v0 key list and static upper-bound recommendation before implementation.
- DB migration details must be finalized in the implementation task.

## Recommended Next Step

Scoped Runtime Config Implementation v0, if owner accepts this architecture plan.

## Paste-Back Context

Scoped Runtime Config v0 should be a registry-first, DB-backed, Admin API + `pnpm ops` managed system with exact compound identity `environment + scopeType + scopeKey + key`. It should use no implicit global/module override, no TTL, no secrets, reason-required writes, global write confirmation, and fail-closed critical resolver semantics. First v0 keys should include module-scoped `payment.window.enabled`, global `payment.global.disabled`, and delivery Email/LINE gates. Production smoke should wait for implementation so runtime windows no longer require Vercel env toggles/redeploys.
