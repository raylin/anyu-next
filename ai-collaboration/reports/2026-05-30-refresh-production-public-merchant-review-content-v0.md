# Refresh Production Public Merchant Review Content v0

Date: 2026-05-30
Branch: staging
Production domain: `https://anyu.tw`

## Summary

Refreshed production with the latest public merchant-review content so NewebPay can review official production URLs. The production deployment now serves the Module 01 storefront, `/refund` policy page, and legal/footer links.

No production env values were changed. Payment runtime was not enabled. Checkout remained unavailable to public traffic. No real payment attempts were run.

## Git / Source Preflight

- Working directory: `/Users/raylin/Projects/anyu-next`
- Local branch: `staging`
- Local HEAD before deployment: `3de74ca20c742de874dc379f3457339b8719f2d2`
- Verified remote `origin/staging` by `git ls-remote`: `3de74ca20c742de874dc379f3457339b8719f2d2`
- Verified remote `origin/main` by `git ls-remote`: `4c2487a73587b9efee8f4b216cc47675219524c3`
- Local `origin/staging` tracking ref remained stale because `git fetch origin --prune` failed with `.git/FETCH_HEAD` permission error.
- `.git/refs/remotes/origin/staging.lock`: not present.

Source content confirmed before deployment:

- Root storefront content exists.
- `/refund` route exists.
- Legal/footer links include service introduction and refund policy.
- `NT$ 49` one-time / non-subscription price exists.
- Support email is `hello@anyu.tw`.

## Production Deployment Method

Used direct Vercel production deployment from the linked `anyu-next` project:

```text
vercel deploy --prod --yes
```

Authentication used the existing `VERCEL_TOKEN` in the shell. The token value was not printed or recorded.

Deployment result:

- Vercel project: `anyu-next`
- Deployment ID: `dpl_CdHkXpq3rq82TenPsCPFykQ1NVXj`
- Production deployment URL: `https://anyu-next-dwm3qv4vi-studioanyu-1488s-projects.vercel.app`
- Alias: `https://anyu.tw`
- Status: Ready
- Target: production

Vercel project/domain findings:

- `vercel inspect https://anyu.tw` resolves to project `anyu-next`.
- `anyu.tw` is still listed in Vercel domain inspection under both `anyu-next` and older `anyu`; current production alias resolution is `anyu-next`.
- `https://www.anyu.tw` returns `308` redirect to `https://anyu.tw/`.

## Production Env Safety Check

Before deployment, production env names for linked project `anyu-next` were listed without values. No payment runtime enable flags were present in the listing:

- `ENABLE_PAYMENT_RUNTIME`: not listed.
- `ENABLE_NEWEBPAY_CHECKOUT`: not listed.
- `ENABLE_OPERATOR_FAKE_PAID_SUCCESS`: not listed.
- `ENABLE_PAID_GENERATION_PROCESSOR`: not listed.
- `ENABLE_PAID_GENERATION_JOBS`: not listed.

No production env values were printed or modified.

Post-deploy public route safety:

- `POST https://anyu.tw/api/modules/ambiguous-temperature/checkout/newebpay` without secret returned JSON `404 not_found`.
- `POST https://anyu.tw/api/operator/fake-paid-success` without secret returned JSON `404 not_found`.

This confirms the payment checkout and operator fake-paid paths are present in the route bundle but remain disabled for public production traffic.

## Production URL Verification

### `https://anyu.tw/api/health`

Returned safe marker fields:

```json
{
  "ok": true,
  "service": "anyu-next-web",
  "app": "anyu-web",
  "environment": "production",
  "gitCommit": "3de74ca20c74",
  "gitBranch": "staging",
  "deploymentProvider": "vercel",
  "routeBundleVersion": "payment-foundation-2026-05-29"
}
```

### `https://anyu.tw/`

Verified visible content:

- `曖昧溫度計｜AI 關係互動分析報告`
- digital AI-assisted relationship interaction analysis service copy
- synthetic product preview card
- `NT$ 49`
- `一次性付款`
- `非訂閱制`
- `網頁交付`
- refund/support policy summary
- `hello@anyu.tw`
- no primary `C-stage production foundation` copy

### `https://anyu.tw/refund`

HTTP status: `200`

Verified visible content:

- `暗語 ANYU 退款與補發政策`
- `NT$49`
- `非訂閱制`
- duplicate-payment refund/reissue copy
- system/payment abnormality refund/reissue copy
- `hello@anyu.tw`

### `https://anyu.tw/legal`

HTTP status: `200`

Verified visible content:

- `法律與說明`
- `退款政策`
- `隱私權政策`
- `使用條款`
- `免責聲明`
- `hello@anyu.tw`

## Screenshot Checklist For Owner

Do not commit screenshots unless explicitly approved. Recommended owner captures:

- Homepage hero/product preview/price section.
- Homepage service details and delivery/refund section.
- `/refund` policy page.
- `/legal` or footer area showing refund/privacy/terms/disclaimer links.

Use production URLs now that `https://anyu.tw` has been refreshed.

## Remaining External Proof Documents Needed

Still owner-provided and external-only:

- domain ownership or domain registration proof for `anyu.tw`;
- Vercel hosting/platform proof;
- AI/API provider billing, invoice, or usage proof;
- self-developed system statement PDF if useful;
- optional website/order/payment-flow explanation;
- merchant identity or business registration documents if requested by NewebPay.

## Validation

Before deployment:

- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed, 54 files / 335 tests.
- `cd apps/web && corepack pnpm build`: passed and included `/refund`.

After deployment:

- production health marker verified;
- homepage content verified;
- `/refund` verified;
- `/legal` verified;
- checkout route disabled-safe verified;
- operator fake-paid route disabled-safe verified.

## Blockers / Risks

- Local `git fetch origin --prune` is blocked by `.git/FETCH_HEAD` permission, so local `origin/staging` remains stale even though `git ls-remote` confirms remote state.
- Vercel domain inspection still lists `anyu.tw` on both `anyu-next` and older `anyu`; current alias resolves to `anyu-next`, but owner should avoid future confusion by cleaning the older project association when safe.
- `origin/main` remains older than `origin/staging`; this production refresh used direct Vercel production deployment, not a `main` branch push.

## Recommended Next Step

Owner captures production screenshots and prepares external proof documents, then sends the NewebPay supplement email package.
