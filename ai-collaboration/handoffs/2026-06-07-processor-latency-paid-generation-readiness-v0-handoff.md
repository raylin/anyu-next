# Processor Latency + Paid Generation Readiness v0 Handoff

## Shared Policy

Follow `AGENTS.md` and `ai-collaboration/process/*.md`.

## Task

Assess paid-generation processor latency/readiness after the accepted Gate 1 functional smoke pass.

## Scope

- Define paid-generation latency metrics.
- Inspect current processor architecture.
- Add or verify sanitized Admin/Ops visibility.
- Add bounded benchmark automation, preferring mock/local and avoiding production.
- Propose initial SLOs and readiness classification.
- Update report, summary log, dashboard, and relevant process docs.

## Safety Rules

- Do not enable production runtime.
- Do not run production payment.
- Do not send real Email or LINE.
- Do not modify Vercel env.
- Do not mutate production data manually.
- Do not use production as the benchmark environment.
- Do not expose secrets, provider payloads, tokenized URLs, raw user inputs, or private recipient data.

## Expected Validation

- `cd apps/web && corepack pnpm lint`
- targeted processor/benchmark/Admin tests
- `cd apps/web && corepack pnpm test`
- Admin CLI tests/typecheck if CLI output changes
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm run qa:paid-generation:benchmark -- --mode mock --jobs 1 --json`
- bounded mock parallel benchmark if implemented

## Recommended Outcome

Produce a readiness recommendation separating functional smoke pass from soft-public readiness. If automatic drain behavior is not proven, classify readiness conservatively and recommend the specific processor drain/observability follow-up.
