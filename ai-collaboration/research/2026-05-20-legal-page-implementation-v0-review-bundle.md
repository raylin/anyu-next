# Legal Page Implementation v0 Review Bundle

## 1. Summary

Implemented public legal/trust pages for ANYU v0 at `/privacy`, `/terms`, `/disclaimer`, plus a small `/legal` index. Added quiet footer links to the Module 01 landing and result flows, applied the approved `hello@anyu.tw` contact email, and aligned short in-product notices with the legal draft set.

## 2. Routes Implemented

- `/privacy`
- `/terms`
- `/disclaimer`
- `/legal`

## 3. Source Legal Docs Used

- `docs/legal/privacy-policy-v0.md`
- `docs/legal/terms-of-service-v0.md`
- `docs/legal/disclaimer-v0.md`
- `docs/legal/ui-notices-v0.md`
- `docs/legal/line-funnel-disclosure-v0.md`
- `docs/legal/persona-insight-consent-v0.md`

## 4. Contact Email

- public contact / privacy / deletion email is now `hello@anyu.tw`
- placeholder contact text in the reviewed privacy and terms drafts was replaced with the final v0 email

## 5. Footer Links

- added quiet footer links to Module 01 landing and result views
- link labels are `隱私權政策｜使用條款｜免責聲明`
- destinations are `/privacy`, `/terms`, `/disclaimer`

## 6. UI Notices Applied

- landing privacy helper now uses the reviewed “不要貼姓名、電話、地址...” short notice
- landing submit area now includes the reviewed CTA consent note
- result page now includes the reviewed short disclaimer
- contact capture now includes the reviewed notice about how LINE / Email will be used

## 7. Content Sync Notes

- the app renders deploy-safe app-local legal content from `apps/web/src/content/legal.ts`
- canonical review/edit source still starts in `docs/legal/`
- future legal copy edits must sync both `docs/legal/` and `apps/web/src/content/legal.ts`

## 8. Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

## 9. Remaining Legal / Trust Follow-ups

- true human legal review is still needed before broad public launch
- the retention wording still intentionally uses a goal, not a hard deletion promise
- if the future LINE funnel becomes fully implemented, the disclosure docs and app copy should be tightened again

## 10. Recommended Next Step

`Legal Route + Footer Browser QA v0`
