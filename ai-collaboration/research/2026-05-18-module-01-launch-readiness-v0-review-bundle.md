# Module 01 Launch Readiness v0 Review Bundle

## 1. Summary

This handoff tightened Module 01 for first launch review without expanding product scope.

The main changes were:

- minimal passive client-side analytics
- graceful unlock-intent fallback
- friendlier non-technical runtime errors
- launch-readiness environment and deployment checklist documentation

## 2. Passive Events Added

Client-side best-effort events now include:

- `page_view`
- `input_started`
- `analysis_started`
- `analysis_failed`
- `share_card_clicked`

These events are sent through the existing `/api/events` path and use only safe metadata:

- module and theme identifiers
- experiment / prompt / schema version
- visual variant
- situation type when relevant
- score bucket when relevant
- anonymous session ID

No raw input, contact values, or full result JSON are sent.

## 3. Unlock Intent Fallback

Updated behavior:

- if `/api/unlock-intent` succeeds, contact capture opens with `unlockIntentId`
- if it fails, contact capture still opens
- the UI now shows a subtle note:
  - `內測記錄暫時無法建立，但你仍可留下聯絡方式。`
- local runtime state tracks unlock-intent failure without showing technical details

## 4. Runtime Error UX

Friendly user-facing messages now map to:

- `目前分析服務尚未設定完成，請稍後再試。`
- `分析暫時失敗，請晚點再試一次。`
- `文字太短，請多貼一點互動脈絡。`
- `文字太長，請先保留最近幾段關鍵對話。`

Contact submit fallback copy now uses:

- `目前內測表單暫時無法送出，請稍後再試。`

## 5. Environment Setup

`apps/web/README.md` now explicitly documents:

- required env vars
- local build/test behavior without env
- live analyze requirements
- demo route behavior without env
- launch-readiness checks for Vercel, Neon, and Drizzle

## 6. DB / Neon Setup

Launch checklist now covers:

- Neon project creation in `ap-southeast-1`
- `DATABASE_URL` setup in Vercel
- Drizzle migration generation and execution
- verifying `analysis_results`, `events`, and `contact_submissions` inserts

## 7. Privacy / Data Retention

The launch checklist now explicitly calls out:

- raw text must not be stored in events
- contact values must not be stored in events
- request text should remain redacted or retention-limited
- `retention_expires_at` must be present
- privacy copy must avoid absolute guarantees
- manual deletion path must be defined

Scheduled deletion remains a pre-launch decision, not an implemented feature.

## 8. Manual QA Checklist

The checklist now includes:

- landing validation
- analyze submit flow
- runtime result page
- share preview
- paid preview
- unlock fallback
- contact submission
- event verification
- demo route
- mobile QA
- friendly error-state verification

## 9. Remaining Launch Blockers

- no live provider/db analyze test has been run in this workspace
- no migration has been executed against a live target DB here
- retention cleanup is still manual / unresolved
- no contact delivery automation exists after submission

What is already verified without env:

- build does not require live secrets
- demo route path remains in the built app
- analyze/events config-error behavior is covered by automated tests

## 10. Recommended Launch Path

1. configure Neon + provider env in preview
2. run Drizzle migration in the target environment
3. complete the manual QA checklist against preview
4. verify event and contact rows in DB
5. decide whether manual retention cleanup is acceptable for the first release
6. deploy low-key launch only after those checks pass

## 11. Issues For ChatGPT Review

- Is manual retention cleanup acceptable for the first low-key launch, or should that block deployment?
- Should passive `page_view` tracking remain best-effort through the DB-backed API, or should early launch skip it when DB is unavailable?
- Should the app keep revealing contact capture after unlock-intent failure in production, or should that fallback be gated behind a launch flag later?
