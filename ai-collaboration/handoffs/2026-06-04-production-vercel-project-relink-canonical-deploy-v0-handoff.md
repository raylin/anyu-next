# Production Vercel Project Relink / Canonical Deploy v0 Handoff

Date: 2026-06-04

## Task

Make the canonical Production deploy path unambiguous so `anyu.tw` points to a verified fail-closed deployment from canonical Vercel project `anyu-next`, not the non-canonical `web` project.

## Context

- Root `.vercel/project.json` points to canonical project `anyu-next`.
- `apps/web/.vercel/project.json` points to separate project `web`.
- `anyu-next` has the required Production env names.
- `web` lacks required Production payment/provider env.
- Prior CLI deploys from `apps/web` deployed `web`.
- `anyu.tw` currently points to a `web` deployment.
- Updated production preflight currently blocks with `blocked_project_link_mismatch`.

## Constraints

- Do not enable Production runtime or checkout.
- Do not run payments.
- Do not send Email or LINE messages.
- Do not modify Production env values unless explicitly required and approved.
- Do not rotate secrets.
- Do not expose env values, provider credentials, tokenized URLs, or private data.
- Do not alias `anyu.tw` to an unverified deployment.

## Planned Work

1. Verify current Production public/fail-closed state.
2. Neutralize the local `apps/web` Vercel link to the wrong `web` project.
3. Deploy Production from repo root using canonical `anyu-next`.
4. Verify the deployment URL is healthy and fail-closed before aliasing.
5. Alias `anyu.tw` to the verified canonical deployment.
6. Run updated production preflight and public/fail-closed checks.
7. Document results, update summary/dashboard, run docs/code validation, commit, and push.

## Uncertainties

- If canonical `anyu-next` Production env values currently enable runtime unexpectedly, do not alias; stop and report the required env correction.
- Git metadata may remain `unknown` for CLI deploys; document if so.

## Current State

- Initial safety check passed: public pages live, checkout API 404 `not_found`, fake-paid 404.
- Local `apps/web/.vercel/project.json` was moved aside so `apps/web` no longer targets project `web`.
- Production preflight then returned `pass_ready_for_controlled_smoke`.
- Repo-root Production deploy targeted canonical project `anyu-next`.
- Canonical deployment id: `dpl_AbXKWQcZicH58iJe7PSaGDz5tqcZ`.
- `https://anyu.tw` and `https://www.anyu.tw` now point to canonical `anyu-next`.
- Production health now reports environment `production`, branch `staging`, commit `28663af45e67`, and route bundle `payment-foundation-2026-05-29`.
- Final fail-closed verification passed.
- No runtime flags, env values, payments, Email, or LINE messages were changed/sent.
