# Two-tier Phase 3 LINE Bind Trigger + Delivery v0 Review Bundle

Date: 2026-05-25

## 1. Summary

Phase 3 wires deferred paid generation into LINE fulfillment paths.

LIFF bind now requests paid generation and returns the paid generation status. Short-code webhook now replies quickly with an honest processing link and schedules paid generation after the webhook response instead of blocking LINE on a provider call.

Production was not deployed.

## 2. Trigger Design Decision

Decision:

- LIFF/web path may synchronously request paid generation because the browser flow can wait or redirect to the unlocked page.
- LINE webhook must not synchronously wait on provider generation because provider paid generation can take 30-60s and LINE webhooks should respond quickly.

Implementation:

- LIFF bind awaits `requestDeferredPaidGeneration`.
- Webhook binds the LINE user, replies with a pending link, then schedules paid generation after response using Next `after`.

## 3. LIFF Bind Flow

LIFF bind flow:

```text
verified LINE ID token
-> unlock intent token validation
-> bind unlock intent to LINE
-> request deferred paid generation
-> return unlocked URL and safe paidStatus
-> client redirects to unlocked page
```

Repeated LIFF bind reuses existing completed/processing paid result through the paid-generation service idempotency.

## 4. Short-code Webhook Flow

Short-code flow:

```text
signed LINE text event
-> validate short code
-> bind unlock intent to LINE
-> reply quickly with pending unlocked link
-> schedule paid generation after response
```

The LINE reply does not include raw analysis content. It sends only a link and honest waiting copy.

## 5. Paid Generation Status / Delivery

LIFF response includes safe `paidStatus`.

Webhook reply copy tells the user the complete analysis is being prepared and that the page will show the result when completed. If the paid result is still processing, the unlocked route already shows processing state.

## 6. Unlocked Route Behavior

No unlocked route change was required. Existing states remain:

- completed
- processing
- failed
- missing/not requested
- legacy embedded paid content

## 7. Idempotency / Duplicate Handling

Existing paid-generation service idempotency handles duplicate LIFF binds and repeated requests. Existing LINE webhook event dedupe still prevents duplicate webhook replies for duplicate LINE events.

## 8. Provider / Fallback Behavior

Provider remains primary. Final staging provider-path verification completed with model `claude-haiku-4-5-20251001`; fallback was not used.

Fallback remains available as fail-safe.

## 9. Event / Privacy Metadata

Events include only operational metadata such as:

```text
resultId
unlockIntentId
channel
status
paidStatus
dedupeStatus
rateLimited
```

No raw input, LINE user IDs, message text, fulfillment codes, unlock tokens, tokenized URLs, paid JSON, provider output, emails, or secrets are recorded.

## 10. Tests Added

Updated LINE route tests for:

- LIFF bind requests paid generation after verified identity binding.
- Valid short-code webhook replies with pending link copy.
- Short-code webhook does not expose LINE IDs, codes, or tokens in event metadata.
- Existing duplicate, signature, invalid-code, and rate-limit behavior remains valid.

## 11. Staging Smoke

Automated staging smoke verified the deferred paid-generation provider path after Phase 3 deploy:

- fresh analyze: HTTP 200
- unlock intent: HTTP 200
- paid request: HTTP 200 completed
- repeat paid request: reused completed row
- unlocked route: paid content marker present
- DB verification: provider model `claude-haiku-4-5-20251001`, paid row completed, retention set
- event metadata: `source: provider`

Real LIFF bind and test-OA short-code smoke require LINE client/test OA interaction and were not performed from shell.

## 12. Known Limitations

- Webhook post-response generation relies on Next `after`; no durable queue exists.
- If the after-response task fails, the user still has a link to the unlocked route, which can show processing/failed state, but there is no automatic LINE push retry yet.
- Real manual LINE test-OA smoke remains pending.

## 13. Recommended Next Step

Run a manual staging test OA smoke for both LIFF bind and short-code message, then decide whether a durable background job or polling endpoint is needed before production activation.
