# Module 01 Low-key Production Activation + Smoke v0 Review Bundle

Date: 2026-05-25

Executed: 2026-05-27

## 1. Summary

Activated the latest approved Module 01 build for low-key production beta and ran a narrow sanitized production smoke. Production route/API smoke passed for health, landing, input threshold, analyze, result page, unlock intent, LIFF URL shape, global LIFF bridge, deferred paid generation, paid status, unlocked paid content, theme carryover, and downstream hidden theme switch.

Activation result: production build activated; automated production smoke passed; real mobile production LIFF and real production OA short-code operator smokes remain pending.

Ads and broader traffic remain blocked.

## 2. Production Candidate

- Candidate commit: `7c891c9`.
- Candidate requirement: `7c891c9` or newer.
- Deployment ID: `dpl_9bsMSd6rQba3Fgbd1croUFid9AJD`.
- Production deployment URL: `https://anyu-next-nhlzk5t2j-studioanyu-1488s-projects.vercel.app`.
- Production alias: `https://anyu.tw`.
- Deployment status: Ready.
- Alias status: `https://anyu.tw` aliased to the new production deployment.

Runtime exact commit marker:

- Not exposed by the app runtime.
- Candidate freshness was verified by deploying from local commit `7c891c9`, Vercel deployment metadata, route behavior, and deployed client assets.

## 3. Production Env / Console Checks

Vercel production env presence check passed without printing values:

- `DATABASE_URL`: configured.
- `ANTHROPIC_API_KEY`: configured.
- `ANALYSIS_CACHE_HASH_SECRET`: configured.
- `LINE_CHANNEL_SECRET`: configured.
- `LINE_CHANNEL_ACCESS_TOKEN`: configured.
- `NEXT_PUBLIC_LINE_LIFF_ID`: configured.
- `NEXT_PUBLIC_LINE_LIFF_URL`: configured.
- `NEXT_PUBLIC_LINE_ADD_URL`: configured.
- `CRON_SECRET`: configured.

Public production LINE values verified by route/API shape:

- LIFF URL origin: `https://liff.line.me`.
- LIFF ID matched expected production ID.
- LIFF URL path shape: `/:liffId`.
- No path after LIFF ID.
- LINE add URL origin: `https://lin.ee`.

LINE Console checks:

- `/line/fulfill` production route returned HTTP 200.
- `/api/line/webhook` empty-events verification POST returned HTTP 200.
- Actual LINE Console UI settings were not directly inspected from Codex and remain operator-confirmed/manual.

## 4. Production DB / Migration Checks

Production Neon project/branch checked with metadata-only SQL:

- `analysis_requests`: present.
- `analysis_results`: present.
- `analysis_paid_results`: present.
- `unlock_intents`: present.
- `line_webhook_events`: present.
- `line_webhook_rate_limits`: present.
- `analysis_requests.user_context_json`: present.
- `unlock_intents` fulfillment fields: present.

No rows, raw content, tokens, provider output, or secrets were selected.

## 5. Route / Visual Smoke

Passed at route/API level:

- `https://anyu.tw/api/health`: HTTP 200.
- `https://anyu.tw/m/ambiguous-temperature`: HTTP 200.
- Landing title present.
- 80-character input threshold marker present.
- Compact theme switch accessibility labels present.
- Visible debug/experiment wording not found in landing HTML.
- Demo result route returned HTTP 200 with free result, share, and paid-preview surfaces.

## 6. Free Analyze Smoke

Passed.

- Short input below threshold returned HTTP 400 with `input_too_short`.
- Synthetic longer input analyze returned HTTP 200.
- Analyze status: completed.
- Cache hit: false.
- Analyze duration: about 21.6 seconds.
- Redirect route shape: `/m/ambiguous-temperature/result/:resultId`.
- Runtime result route returned HTTP 200.
- Free result, share surface, and paid preview rendered.

The handoff-provided synthetic input was under the new 80 visible-character minimum, so the valid analyze smoke used an extended synthetic-only version of the same scenario.

## 7. Unlock Intent / LIFF URL Smoke

Passed.

Theme A/classic and Theme B/riso unlock intents both returned HTTP 200 with safe success status.

LIFF URL shape:

- Origin: `https://liff.line.me`.
- Path shape: `/:liffId`.
- Expected production LIFF ID matched.
- No `/line/fulfill` path after LIFF ID.
- No `/m/` path after LIFF ID.
- Context key names included module, intent, token, code, debug, and theme hints.

No actual LIFF URL, unlock token, fulfillment code, short code, or tokenized URL was recorded.

## 8. Production LIFF Operator Smoke

Not run from Codex.

Reason:

- Real production LIFF bind requires an operator-owned LINE account and mobile LINE client.

Status:

- Route/API prerequisites passed.
- Production LIFF operator smoke remains pending.

Required operator result to complete:

- No 404.
- No homepage drop.
- Bind succeeds.
- Unlocked route reached.
- Pending paid UX or completed paid content shown honestly.
- Theme carries through.
- Theme switch hidden downstream.

## 9. Production Short-code Operator Smoke

Not run from Codex.

Reason:

- Real production OA short-code smoke requires an operator-owned LINE account and sending a generated code to the production OA.

Status:

- Route/API prerequisites passed.
- Production short-code operator smoke remains pending.

Required operator result to complete:

- Production OA replies.
- Returned link opens.
- Unlocked route reached.
- Paid content renders or pending UX is honest.
- Theme carries through if started from known theme.

## 10. Paid Content Quality Smoke

Passed with caveat.

- Deferred paid generation request returned HTTP 200 completed.
- Paid generation duration for fresh classic unlock: about 42.8 seconds.
- Repeat/riso paid request reused completed result in about 2.1 seconds.
- Paid status endpoint returned completed.
- Unlocked paid routes returned HTTP 200.
- `high` / `medium` / `low` likelihood labels were not detected as visible likelihood labels.
- Latest production event aggregate showed one recent `paid_generation_completed` event with `source = provider`.

Caveat:

- A route-level page-payload scan flagged possible English-mix tokens in non-secret page text. Because this check cannot distinguish all bundled/non-visible payload text, it is a P2 manual visual review item, not a production-blocking finding.

## 11. Theme Carryover Smoke

Passed at route/API level.

- Classic unlock intent carried classic theme.
- Riso unlock intent carried riso theme.
- Global LIFF bridge rendered the expected theme shell for both variants.
- Unlocked route rendered the expected theme shell for both variants.
- Downstream theme switch was hidden on unlocked surfaces.

## 12. Event / Privacy Verification

Passed.

- Smoke output recorded only route shapes, status names, booleans, public origins/shape checks, and timing aggregates.
- No raw input, redacted input, full result JSON, paid result JSON, provider output, LINE user ID, LINE display name, ID token, LINE message text, fulfillment code, short code, unlock token, tokenized URL, email, database URL, provider key, or LINE secret was recorded.
- Production route scans did not surface forbidden secret markers.

## 13. Issues Found

- P0: none found.
- P1: none found in route/API smoke.
- P2: production real mobile LIFF operator smoke remains pending.
- P2: production real OA short-code operator smoke remains pending.
- P2: exact runtime commit marker is still not exposed.
- P2: page-payload scan for English mixing is inconclusive and should be manually visual-reviewed on the paid result page.

## 14. Activation Result

Production activation status:

- Activated for low-key beta route/API exposure.
- Not cleared for ads or broader traffic.
- Not fully complete until operator-owned LINE LIFF and production OA short-code smokes are recorded.

## 15. Rollback / Follow-up

Rollback options remain:

- Revert production deployment to previous stable deployment.
- Temporarily disable full-analysis CTA if fulfillment breaks.
- Use LIFF-only if short-code breaks.
- Use short-code-only if LIFF breaks.
- Force Theme A if Theme B breaks.

No rollback was triggered during route/API smoke.

## 16. Recommended Next Step

Run operator-owned production LIFF and production OA short-code smokes, then record sanitized pass/fail facts. If both pass, start `Module 01 Low-key Production Monitoring v0`.
