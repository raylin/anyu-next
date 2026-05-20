# LINE Funnel Contact UI Implementation v0 Review Bundle

## 1. Summary

Module 01 now uses a LINE-first contact-notification surface after paid unlock. The primary action is a same-tab LINE add CTA for open-notification intent, while Email remains available as a low-key fallback for users who do not want LINE.

## 2. LINE OA Inputs Used

- OA name: `暗語 ANYU`
- display name: `暗語 ANYU｜關係微訊號`
- status message: `把說不清的互動，翻譯成一點方向。`
- add-friend URL: `https://lin.ee/S6dnbJO`
- mobile open behavior: same tab
- desktop open behavior: same tab
- welcome message: `A`
- rich menu: not used in v0
- complete-analysis delivery: not delivered in v0
- short code: not used in v0
- Email fallback: retained, visually secondary

## 3. Pending LINE OA Settings

- profile image still pending
- cover/background still pending
- OA category still pending in LINE backend
- rich menu intentionally deferred for v0

## 4. UI Changes

- paid preview helper copy now says the user can join LINE for open notifications or use Email
- paid preview CTA now matches the paid headline instead of the generic `解鎖一次`
- contact panel now opens in a LINE-first state rather than a generic LINE/Email selector
- Email fallback is hidden until the user explicitly opens it

## 5. Primary LINE CTA

- panel title: `加入 LINE，收到完整分析開放通知`
- primary CTA: `加入 LINE，收到開放通知`
- behavior: same-tab navigation through `NEXT_PUBLIC_LINE_ADD_URL`
- if URL is missing, the panel falls back to Email with a friendly message

## 6. Email Fallback

- secondary trigger: `改用 Email 接收通知`
- fallback body clarifies this is notification-only, not daily email
- fallback submit still uses the existing `/api/contact` path
- success messaging no longer promises immediate complete-analysis delivery

## 7. Event Tracking

- added `line_add_clicked`
- added `email_fallback_opened`
- kept `contact_submitted` for Email submit persistence
- events do not store Email values, LINE IDs, raw input, or result payloads
- LINE click uses background-friendly beacon tracking when possible before same-tab navigation

## 8. Legal / Privacy Alignment

- copy now says `完整分析開放通知`, not immediate complete-analysis delivery
- trust note still points users to `hello@anyu.tw` for deletion
- app-local legal short notices were aligned with the new notification wording
- `docs/legal/ui-notices-v0.md` was also synced so the reviewed source docs do not drift

## 9. Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed
- render tests verified the LINE-first panel copy and missing-URL fallback
- attempted local dev HTTP smoke was blocked by shell reachability limits in this session, so live click-open verification remains a staging/browser follow-up

## 10. Remaining Follow-ups

- add the real `NEXT_PUBLIC_LINE_ADD_URL` to preview/staging env if not already present
- perform a protected staging/browser pass to verify same-tab handoff feel on real devices
- decide later whether the product should add an Email-only event subtype or stay with current event taxonomy

## 11. Recommended Next Step

`LINE Funnel Staging QA + Env Sync v0`
