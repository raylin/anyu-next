# Staging Admin Token Injection + Email Rebaseline Resume v0 Handoff

## Task

Staging Admin Token Injection + Email Rebaseline Resume v0.

## Context

The prior staging Email rebaseline stopped before result creation because `pnpm ops config get --env staging ...` returned `admin_token_missing`. This is a QA workflow blocker, not a product failure. The staging QA runner may load Preview `ADMIN_API_TOKEN` from the approved local staging mirror and inject it into subprocess env before invoking `pnpm ops`; the CLI itself must not read app env files.

## Scope

- Add a safe staging QA Admin token resolver.
- Use it in staging QA/Admin helper paths.
- Resume focused staging evidence for Email save -> mock paid -> access-link readiness.
- No production runtime, payment, Email, LINE, Vercel env changes, direct DB, or manual LINE.

## Safety Rules

- Do not print `ADMIN_API_TOKEN`, token length, prefixes, suffixes, hashes, or checksums.
- Do not load `.env.production` for staging QA.
- Do not teach `pnpm ops` to read app env mirrors.
- Do not use direct DB as fallback for missing Admin token.
- Stop with `staging_admin_token_unavailable_owner_action_required` if the token is unavailable from process env or `.env.staging`.

## Validation Plan

- Targeted tests for Admin token resolver and staging QA helpers.
- Staging deploy freshness check before staging E2E.
- Focused staging Email save / no-card / access-link path.
- Admin/Ops evidence via tracked helper with injected staging token.
- Docs presence, dashboard sanity, secret/private scan, `git diff --check`.

## Expected Report

`ai-collaboration/reports/2026-06-07-staging-admin-token-injection-email-rebaseline-resume-v0.md`
