# Two-tier Phase 3 Staging Manual Smoke v0 Review Bundle

Date: 2026-05-25

## 1. Summary

This task verified staging deployment freshness and reran the shell-safe synthetic staging flow after Phase 3 LINE bind trigger delivery. Follow-up operator verification confirmed the real mobile staging LIFF flow and real staging/test OA short-code flow now pass.

Both manual staging fulfillment paths are now recorded as passed with sanitized status only.

Production was not touched.

## 2. Staging Deployment Freshness

Staging alias `https://staging.anyu.tw` resolved to a ready Vercel preview deployment created after the Phase 3 staging push.

Sanitized deployment status:

- environment: staging / preview
- status: ready
- alias: `staging.anyu.tw`
- freshness: `ee3564c` or newer deployment available on staging

## 3. LIFF Bind Manual Smoke

Status: passed by real mobile staging LIFF smoke after LIFF URL path duplication fix.

Sanitized result:

- LIFF bind smoke: passed
- generic 404 after opening LIFF: not observed after fix
- homepage fallback/drop: not observed after fix
- post-bind route: reached correct unlocked route
- paid content completed/rendered: yes
- processing/failure state seen: no
- production touched: no

## 4. Short-code Test OA Manual Smoke

Status: passed by real staging/test OA short-code smoke.

Sanitized result:

- short-code smoke: passed
- fulfillment short code pasted into staging/test OA: yes
- bot reply received: yes
- returned link opened: yes
- post-link route: reached correct unlocked route
- paid content completed/rendered: yes
- processing/failure state seen: no
- production touched: no

## 5. Paid Generation Completion

Shell-safe staging synthetic flow passed:

- fresh analyze: HTTP 200
- unlock intent: HTTP 200
- deferred paid request: HTTP 200 completed
- duplicate paid request: reused completed paid row
- unlocked route: completed paid-content marker present

This verifies the paid-generation service and unlocked route remain healthy on staging, but it is not a substitute for real LIFF/test-OA manual smoke.

## 6. Provider / Fallback Source

Safe DB/event verification for the shell-safe staging synthetic flow:

- paid row status: completed
- provider source: provider
- model category: provider model
- fallback used: no
- retention set: yes

No paid result JSON was selected or recorded.

## 7. Event / Privacy Check

Reports and docs record only sanitized statuses and aggregate route outcomes.

Not recorded:

- raw input
- fulfillment code
- unlock token
- tokenized URL
- LINE user ID
- LINE display name
- LINE message text
- paid result JSON
- provider output
- email
- secrets

## 8. Next-after Risk Decision

Decision for production gate: both real staging LIFF and short-code smoke now pass, so Next `after` is acceptable for low-volume beta from this staging evidence. Production activation still requires a separate manual decision.

Current recommendation:

- Keep Next `after` as staging / low-volume beta MVP only.
- Do not treat this smoke record as production deployment approval.
- Create a separate production activation decision record before production rollout.

If production or higher-volume usage shows stuck processing, add durable background delivery or polling.

## 9. Known Limitations

- Webhook post-response generation still uses Next `after`, not a durable queue.

## 10. Recommended Next Step

Proceed to a separate production activation decision record if production rollout is desired.
