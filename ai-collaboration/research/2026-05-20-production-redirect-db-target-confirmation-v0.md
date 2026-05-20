# Production Redirect + DB Target Confirmation v0

Date: 2026-05-20

## 1. Summary

This pass resolved the `www` canonical redirect blocker and clarified the production secret-readiness picture.

Completed:

- `https://anyu.tw` continues serving the healthy `anyu-next` production deployment
- `https://www.anyu.tw` now returns a permanent `308` redirect to `https://anyu.tw/`
- production `ANTHROPIC_API_KEY` appears usable enough for a later smoke test because it is present in a safe env-run probe

Not completed:

- production `DATABASE_URL` target could not be confirmed
- the same safe env-run probe suggests `DATABASE_URL` is effectively blank/unavailable in the current production env context

Result:

- production remains `No-Go`

## 2. Starting State

At task start:

- `anyu.tw` already served the healthy `anyu-next` production deployment
- `www.anyu.tw` served the same deployment but did not redirect to apex
- public production env names were already finalized on `anyu-next`
- `DATABASE_URL` target confirmation remained unresolved

## 3. Apex Domain Status

Verified after the new production deployment:

- `https://anyu.tw` returns `HTTP 200`
- it serves deployment:
  - `https://anyu-next-2ff1x0nzv-studioanyu-1488s-projects.vercel.app`
- Vercel inspect for `anyu.tw` resolves to ready deployment:
  - `dpl_35278BvyMBcLyj2GxwMcS5eGu34q`

## 4. www Redirect Status

Verified after redirect deploy:

- `https://www.anyu.tw` returns `HTTP 308`
- redirect target:
  - `https://anyu.tw/`

This satisfies the intended canonical policy in practice.

## 5. Redirect Action Taken Or Manual Steps

Action taken:

- implemented a narrow host-based app redirect in `apps/web/next.config.ts`
- rule applies only when host is `www.anyu.tw`
- destination is `https://anyu.tw/:path*`
- permanent redirect enabled
- path is preserved
- query string remains handled by the normal redirect path

Then:

- deployed a fresh `anyu-next` production deployment
- verified the live redirect with `curl -I https://www.anyu.tw`

Manual steps not required for redirect at this point unless the team later prefers a Vercel/domain-layer redirect instead of the current app-level redirect.

## 6. Production DATABASE_URL Target Status

Safe confirmation result:

- not confirmed

Method used:

- `vercel env run -e production` with a non-printing probe that checked only booleans/branch markers

Observed result:

- `ANTHROPIC_API_KEY` appeared present
- `DATABASE_URL` appeared absent/blank in that safe probe
- therefore:
  - no host/branch/region metadata could be extracted
  - Neon target could not be confirmed

Status:

- `DATABASE_URL` target: pending manual confirmation
- likely needs manual Vercel secret check/update before production smoke

## 7. ANTHROPIC_API_KEY Readiness

Status:

- `ANTHROPIC_API_KEY`: present by env-name and present in safe production env-run probe

Interpretation:

- key presence is likely sufficient for a later production smoke test
- actual provider call remains pending a future production smoke pass

## 8. Production Launch Decision Updates

Decision draft should now reflect:

- `www` redirect is complete
- `anyu.tw` apex and `www` canonical policy are working
- production DB target is still not confirmed
- provider key presence is promising but still not a substitute for later smoke
- current launch status remains `No-Go`

## 9. Remaining Blockers

1. manually confirm or repair production `DATABASE_URL`
2. verify production DB target is Neon `anyu-next` `production`
3. separately approve/run production migration if still needed
4. run final production-safe human smoke after DB readiness is real

## 10. Current Go / No-Go Status

Current status: `No-Go`

Reason:

- canonical redirect is fixed
- domain normalization is fixed
- but production DB secret/target readiness is still not proven

## 11. Recommended Next Step

`Production DATABASE_URL Repair + Smoke Gate v0`
