# Production Vercel Project Relink / Canonical Deploy v0

Date: 2026-06-04

## Completed Work

- Verified current Production was fail-closed before changes.
- Neutralized the local `apps/web` Vercel link that pointed to non-canonical project `web`.
- Reran production preflight; project-link mismatch cleared.
- Deployed Production from the repository root using canonical Vercel project `anyu-next`.
- Verified the root deploy respected `apps/web` as the project root directory.
- Verified Vercel automatically aliased `https://anyu.tw` and `https://www.anyu.tw` to the canonical `anyu-next` deployment.
- Verified Production health, public pages, and fail-closed routes after alias.
- Reran production preflight; it returned `pass_ready_for_controlled_smoke`.

## apps/web Link Decision

Decision: neutralize the local `apps/web/.vercel/project.json` file by moving it aside outside the active `.vercel` path.

Reason:

- `apps/web/.vercel/project.json` pointed to project `web`.
- `web` lacked required Production payment/provider env.
- Production deploys from `apps/web` were therefore unsafe.
- Keeping the file active risked repeating the same deploy/env mismatch.

Final local state:

- root `.vercel/project.json`: active, canonical project `anyu-next`
- `apps/web/.vercel/project.json`: absent
- disabled backup: local-only, not tracked by git

## Canonical Deployment Method

Canonical CLI method:

```bash
vercel deploy --prod --yes --scope studioanyu-1488s-projects
```

Run from repository root, not from `apps/web`.

Canonical project:

- project name: `anyu-next`
- root directory: `apps/web`
- Vercel scope: `studioanyu-1488s-projects`

Do not run Production payment deploys from `apps/web` unless that directory is explicitly relinked to the canonical `anyu-next` project.

## Canonical Production Deployment Result

- Deployment id: `dpl_AbXKWQcZicH58iJe7PSaGDz5tqcZ`
- Deployment project: `anyu-next`
- Deployment target: Production
- Deployment ready: yes
- Alias result:
  - `https://anyu.tw` points to canonical `anyu-next`
  - `https://www.anyu.tw` points to canonical `anyu-next`

## Production Health Result

`https://anyu.tw/api/health` returned:

- environment: `production`
- branch: `staging`
- commit: `28663af45e67`
- route bundle: `payment-foundation-2026-05-29`

Git metadata is now available again because the alias points to the canonical `anyu-next` deployment.

## Production Preflight Result

Command:

```bash
cd apps/web && corepack pnpm run qa:production:payment-preflight -- --source vercel-production --mode dry-run
```

Result:

- readiness: `pass_ready_for_controlled_smoke`
- project linking: aligned
- env source: canonical `anyu-next`
- public pages: live
- checkout route: fail-closed
- fake-paid route: fail-closed
- redaction: no values, lengths, prefixes, suffixes, hashes, checksums, provider payloads, or tokens printed

## Fail-Closed Result

After aliasing to canonical `anyu-next`:

- `/` returned 200
- `/refund` returned 200
- `/legal` returned 200
- checkout API returned 404 `not_found`
- fake-paid/operator route returned 404
- no provider form was generated
- no payment was run
- no Email was sent
- no LINE message was sent

## Production Safety

- Production runtime was not enabled.
- Production checkout was not enabled.
- Production env values were not modified.
- No secrets, provider credentials, or tokenized URLs were printed.
- No DB mutation was performed.
- No NewebPay dashboard setting was changed.

## Remaining Caveats

- The disabled `apps/web` Vercel link is local-only and should not be restored unless it is relinked to canonical `anyu-next`.
- Future Production deploys should use the repo-root command above or Git-integrated deployment for `anyu-next`.
- If someone runs `vercel deploy --prod` from `apps/web` after relinking incorrectly, preflight should catch the mismatch before runtime enablement.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed:
  - local Vercel link metadata is operationally important but not tracked in git
  - production deploy process still relies on operator discipline to run commands from repo root
- Opportunistic cleanup completed:
  - neutralized the unsafe `apps/web` Vercel link locally
  - restored `anyu.tw` to canonical `anyu-next`
- Deferred cleanup candidates:
  - add a root-level production deploy wrapper script that refuses to run from `apps/web`
  - document the canonical command in the operations runbook

## Suggested Next Steps

1. Controlled Production Payment Smoke v1 Retry with LINE Bind Checkpoint.
2. Use the canonical repo-root deployment/preflight path.
3. Keep runtime disabled until the smoke window begins.
