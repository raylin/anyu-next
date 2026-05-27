# Module 01 Production Refresh to Latest Staging + Smoke v1 Review Bundle

Date: 2026-05-27

## 1. Summary

Production was refreshed to the latest approved staging commit and route/API smoke passed. Production short-code OA smoke initially failed with no bot reply, then passed after the operator corrected a production/staging LINE secret/token mismatch.

This bundle records only sanitized pass/fail facts.

## 2. Production Candidate

- Candidate commit: `092ba20`
- Deployment ID: `dpl_4mukHzrtG27bix8UNcrfoLoTynuE`
- Production alias: `https://anyu.tw`
- Deployment status: Ready

## 3. Env / DB / Console Checks

- Required production LINE env names were present and production-scoped.
- Production webhook route was available at `/api/line/webhook`.
- Empty-events webhook verification ping returned HTTP 200.
- Invalid-signature webhook request returned HTTP 401.
- Production DB runtime tables were present.
- Current code/schema uses `unlock_intents.line_user_id` and `unlock_intents.fulfilled_at`; the handoff's `line_user_id_hash` / `delivered_at` field names were stale.

## 4. Route / Visual Smoke

- Production landing route returned HTTP 200.
- Input threshold guard returned expected `input_too_short` for short synthetic input.
- Theme A server-rendered as default.
- Browser-level Theme B check was blocked by the known local Chromium/MachPort issue, not by production.

## 5. Free Analyze Smoke

- Synthetic production analyze returned HTTP 200.
- Result route returned HTTP 200.
- No raw input was recorded in this bundle.

## 6. Unlock / LIFF URL Smoke

- Unlock intent returned HTTP 200.
- LIFF URL shape was valid: `https://liff.line.me/{LIFF_ID}?<context>`.
- No `/line/fulfill` or `/m/` path was appended after the LIFF ID.
- Theme hints were present in the generated LIFF context.

## 7. Deferred Paid Generation Smoke

- Deferred paid generation returned HTTP 200.
- Paid generation completed.
- Paid status endpoint returned completed after generation.
- Unlocked paid route returned HTTP 200.

## 8. Unlocked Pending Flicker Fix Verification

- Before paid generation, unlocked route returned HTTP 200.
- Pending copy rendered.
- The route-level check did not show the `取得完整連結` claim CTA.

## 9. Content Trust Polish Verification

- Share label marker for `你現在的卡點` was present.
- Paid teaser marker was present.
- Some privacy-copy marker checks were inconclusive via route text scan and should be visually reviewed if needed.

## 10. Production LIFF Operator Smoke

- Status: pending / not recorded in this pass.
- No LINE user ID, ID token, tokenized URL, or screenshot was recorded.

## 11. Production Short-code Operator Smoke

- Initial result: failed, no bot reply.
- Diagnosis: no persisted production short-code webhook event evidence at the time of failure.
- Final result after operator correction: pass.
- Root operational cause: production/staging LINE secret/token mismatch.
- Bot replied: yes.
- Returned link opened: yes.
- Paid content completed/rendered: yes.
- Sensitive values recorded: none.

## 12. Event / Privacy Verification

- Recorded only status, route shapes, deployment IDs, and safe pass/fail categories.
- Did not record actual short code, tokenized URL, unlock token, fulfillment token, LINE user ID, ID token, raw LINE message text, raw input, provider output, paid result JSON, or secrets.

## 13. Activation Result

PARTIAL.

Route/API smoke passed and production short-code OA smoke passed. Production mobile LIFF operator smoke remains unrecorded in this v1 bundle.

## 14. Issues / Rollback

No rollback recommended after the short-code issue was corrected operationally.

Operational note:

- A silent production OA no-reply can be caused by a production/staging LINE channel secret or access token mismatch. Verify production Messaging API channel credentials before assuming app webhook logic failed.

## 15. Recommended Next Step

Run and record the production mobile LIFF operator smoke if it has not already been completed, then begin low-key production monitoring with sanitized aggregate metrics.
