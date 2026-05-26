# Global LIFF Fulfillment Bridge v0

## Task

Introduce a module-agnostic global LIFF fulfillment bridge route so the LINE Console LIFF endpoint can remain stable across modules.

## Problem

Manual staging LIFF smoke still fails. The LINE Console endpoint is set to:

```text
https://staging.anyu.tw/m/ambiguous-temperature/line/fulfill
```

Opening LIFF on a real mobile LINE client briefly loads and then shows a 404. The current module-specific endpoint is also not scalable for future modules.

## Goal

Add canonical bridge endpoints:

- Staging: `https://staging.anyu.tw/line/fulfill`
- Production: `https://anyu.tw/line/fulfill`

The global bridge should parse module/intent/unlock context and bind/redirect to the correct module unlock route.

## Scope

- Add `/line/fulfill` as the canonical LIFF bridge route.
- Keep `/m/[moduleSlug]/line/fulfill` as compatibility route if safe.
- Update LIFF URL generation to use global route context with:
  - `moduleSlug`
  - `unlockIntentId`
  - `unlockToken`
  - short-code fallback code where already used
- Parse both direct query params and `liff.state`.
- Missing context must show safe fallback/short-code instructions, not homepage redirect.
- Successful bind should redirect to `/m/{moduleSlug}/unlock/{unlockToken}`.
- Do not change paid generation provider logic.
- Do not change short-code webhook logic unless needed for shared context helpers.
- Do not deploy production.
- Do not log or commit unlock tokens, tokenized URLs, LINE user IDs, short codes, raw input, provider output, paid result JSON, or secrets.

## Tests

- LIFF URL generation uses global bridge route context.
- `/line/fulfill` handles direct query params.
- `/line/fulfill` handles `liff.state`.
- Missing/unsupported module slugs are handled safely.
- Successful bind redirects to `/m/{moduleSlug}/unlock/{unlockToken}`.
- Old module route compatibility still works or redirects safely.
- No homepage redirect on missing context.
- No token/code/LINE ID in event metadata.

## Docs

Update:

- `ai-collaboration/research/line/line-oa-staging-setup.md`
- `ai-collaboration/research/line/line-oa-production-setup.md`
- `ai-collaboration/research/line/line-fulfillment-env-matrix.md`
- `ai-collaboration/summaries/summary_log.md`

Create:

- `ai-collaboration/research/2026-05-25-global-liff-fulfillment-bridge-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-25-global-liff-fulfillment-bridge-v0-execution-report.md`
