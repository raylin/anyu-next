# One-Time Ops Credentials Migration Helper v0

- taskStartedAt: 2026-06-07T14:15:42Z
- scope: add a one-time owner-approved helper to copy only `ADMIN_API_TOKEN` from app env mirrors into `~/.anyu/credentials.json`, then verify ops auth and production Admin/Ops preflight.
- safety:
  - no production runtime open
  - no payment
  - no Email/LINE
  - no Vercel env changes
  - no DB mutation
  - no token values or token-derived metadata printed
- helper path: `tools/admin-cli/scripts/migrate-admin-token-from-env-mirrors.mjs`
