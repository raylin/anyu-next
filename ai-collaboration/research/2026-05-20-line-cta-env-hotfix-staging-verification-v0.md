# LINE CTA Env Hotfix + Staging Verification v0

## 1. Summary

The staging LINE CTA issue is fixed. `NEXT_PUBLIC_LINE_ADD_URL` was already configured in Vercel Preview, but the live `staging.anyu.tw` deployment was older than that env change. A fresh preview deployment was created and `staging.anyu.tw` was repointed to it. The new staging client bundle now contains the baked LINE URL and the LINE-first contact-panel strings.

## 2. User-Reported Issue

User-reported behavior:

- clicking the LINE CTA did not navigate to LINE
- the UI fell back to Email instead

That behavior matches the app’s intended fallback path when `NEXT_PUBLIC_LINE_ADD_URL` is missing in the client bundle.

## 3. Root Cause

Root cause:

- app code was already correct and used `NEXT_PUBLIC_LINE_ADD_URL`
- Vercel Preview env already contained `NEXT_PUBLIC_LINE_ADD_URL`
- but the staging deployment serving `staging.anyu.tw` had been built before that env existed

Because `NEXT_PUBLIC_*` values are baked at build time, the deployed bundle still behaved as if the LINE URL were missing.

## 4. Env Status

Confirmed in Vercel env list:

- `NEXT_PUBLIC_LINE_ADD_URL` exists
- scope: `Preview, Production`
- value is encrypted in CLI output, but expected configured value for this task is `https://lin.ee/S6dnbJO`

No production-specific change was made in this task.

## 5. Deployment / Redeploy Result

Redeploy result:

- created fresh preview deployment:
  - `https://anyu-next-l9oa57u31-studioanyu-1488s-projects.vercel.app`
- verified staging alias now points to that deployment:
  - `https://staging.anyu.tw`

This redeploy occurred after the `NEXT_PUBLIC_LINE_ADD_URL` env already existed, so the new frontend bundle includes the public LINE URL.

## 6. Staging Verification

Verified through authenticated protected-preview inspection:

- `https://staging.anyu.tw/m/ambiguous-temperature/result/demo` returns `200`
- paid preview still renders correctly
- deployed client bundle now contains:
  - `https://lin.ee/S6dnbJO`
  - `加入 LINE，收到完整分析開放通知`
  - `加入 LINE，收到開放通知`
  - `改用 Email 接收通知`
  - `line_add_clicked`
  - `email_fallback_opened`
- deployed client bundle uses:
  - `window.location.href = lineAddUrl`

Interpretation:

- same-tab LINE navigation path is now live in staging
- the previous “missing LINE URL → Email fallback” branch is no longer the default live path

## 7. Email Fallback Verification

Email fallback is still present in the deployed client bundle:

- `改用 Email 接收通知` remains available as the secondary path
- the Email fallback body is still present
- fallback is now explicit and secondary, rather than being shown by default because of a missing URL

Because this session did not have a full interactive browser click tool on protected staging, Email fallback verification was done by authenticated HTML/JS bundle inspection rather than literal click interaction.

## 8. Fixes Applied

Applied fixes:

- no app-code hotfix was required
- confirmed env exists
- created a fresh preview deployment after env existed
- repointed `staging.anyu.tw` to the fresh deployment

## 9. Remaining Limitations

- this pass verified the live HTML and client bundle, not a literal protected-browser click interaction
- a human browser or real-device pass is still useful to confirm the exact same-tab handoff feel into LINE

## 10. Recommended Next Step

`LINE Funnel Protected Staging Browser Pass v0`
