# LINE Funnel Contact UI Implementation v0 Execution Report

## Summary

Implemented the v0 LINE-first contact funnel UI for Module 01. The contact surface now prioritizes a same-tab LINE add CTA for notification intent, keeps Email as a secondary fallback, and aligns copy with the current “notification, not immediate delivery” product decision.

## Files Created

- `ai-collaboration/handoffs/2026-05-20-line-funnel-contact-ui-implementation-v0-handoff.md`
- `ai-collaboration/research/2026-05-20-line-funnel-contact-ui-implementation-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-20-line-funnel-contact-ui-implementation-v0-execution-report.md`

## Files Updated

- `apps/web/src/components/anyu/ContactCapture.tsx`
- `apps/web/src/components/anyu/PaidPreviewCard.tsx`
- `apps/web/src/components/modules/ai-temperature/AiTemperatureResult.tsx`
- `apps/web/src/lib/modules/ai-temperature-ui.ts`
- `apps/web/src/lib/events/types.ts`
- `apps/web/src/lib/events/client.ts`
- `apps/web/src/app/api/contact/route.ts`
- `apps/web/src/content/legal.ts`
- `docs/legal/ui-notices-v0.md`
- `apps/web/.env.example`
- `apps/web/README.md`
- `apps/web/src/styles/globals.css`
- `apps/web/src/tests/ai-temperature-ui.test.ts`
- `apps/web/src/tests/event-metadata.test.ts`
- `ai-collaboration/summaries/summary_log.md`

## LINE CTA Changes

- contact panel now defaults to a LINE-first state
- primary CTA is `加入 LINE，收到開放通知`
- CTA uses same-tab navigation via `NEXT_PUBLIC_LINE_ADD_URL`
- missing URL gracefully downgrades to Email fallback

## Email Fallback Changes

- Email is now explicitly secondary
- fallback is opened intentionally rather than being equal by default
- fallback copy promises notification on opening, not immediate full delivery
- submit still uses the existing `/api/contact` endpoint

## Event Tracking Changes

- added `line_add_clicked`
- added `email_fallback_opened`
- kept `contact_submitted` for persisted Email submissions
- line click uses beacon-style background tracking when possible

## Config Changes

- added `NEXT_PUBLIC_LINE_ADD_URL=https://lin.ee/S6dnbJO` to `apps/web/.env.example`
- documented `NEXT_PUBLIC_LINE_ADD_URL` in `apps/web/README.md`

## Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed
- render tests verified LINE-first panel copy and missing-URL fallback
- attempted local dev HTTP smoke on the demo result route could not complete because the local dev server was not reachable from this shell session

## Known Technical Debt

- The preview/staging env still needs explicit confirmation that `NEXT_PUBLIC_LINE_ADD_URL` is configured, otherwise the runtime will fall back to Email-only behavior.

## Tech Debt Review

### New Technical Debt Introduced

- None.

### Existing Technical Debt Observed

- The app still has no true LINE confirmation signal, so `line_add_clicked` remains a proxy for add intent rather than confirmed friend-add completion.

### Opportunistic Cleanup Completed

- Fixed the paid-preview CTA label so it matches the paid headline instead of the previous generic `解鎖一次`.
- Synced app-local legal short-copy and reviewed docs to prevent wording drift.

### Deferred Cleanup Candidates

- A future pass may want a richer staging/browser/device verification path for same-tab LINE handoff and fallback timing.
- A later analytics pass may choose to add a more explicit Email submit subtype if current event metadata becomes too coarse.

### Recommended Follow-up

- Run a staging env-sync and protected-browser QA pass focused on the live LINE CTA and Email fallback.

## Deviations From Handoff

- Used env-driven configuration only in app code rather than hardcoding the public LINE URL as a runtime fallback, while still documenting the public URL in `.env.example`.

## Git Commit

- Pending at report-write time; final commit hash is reported in the final Codex Completion Summary.

## Staging Push

- Pending at report-write time; final staging push status is reported in the final Codex Completion Summary.

## Remaining Uncertainties

- Whether `NEXT_PUBLIC_LINE_ADD_URL` is already present in preview/staging env is not confirmed by this local pass.
- Real-device feel of same-tab LINE handoff still needs a staging/browser confirmation pass.

## Recommended Next Step

- `LINE Funnel Staging QA + Env Sync v0`
