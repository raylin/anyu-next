# Handoff: ANYU LINE OA Setup Record v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Record the completed manual LINE Official Account setup for 暗語 ANYU so future production launch and funnel implementation work can reference a stable source of truth.

This is a documentation task only.

Do not implement LINE Messaging API.

Do not change app behavior.

Do not change contact capture.

Do not change production env.

Do not deploy production.

## Scope

Do:

1. Create a LINE OA setup record.
2. Update relevant strategy/runbook docs to reference the record if useful.
3. Record pending or deferred items clearly.
4. Create execution report.
5. Append summary log.
6. Commit and push to `origin/staging`.

Do not:

- implement LINE API
- implement LIFF
- implement webhook
- implement rich menu
- change contact capture UI
- change env values
- change production deployment config
- change legal semantics

## Known Setup Values

- `LINE OA 名稱：暗語 ANYU`
- `顯示名稱：暗語 ANYU｜關係微訊號`
- `狀態訊息：把說不清的互動，翻譯成一點方向。`
- `LINE OA add-friend URL：https://lin.ee/S6dnbJO`
- `QR code URL：https://qr-official.line.me/gs/M_403ttnun_GW.png?oat_content=qr`
- `手機開啟方式：same tab`
- `桌機開啟方式：same tab / QR fallback`
- `Welcome message：版本 A, adjusted to not overpromise immediate complete-analysis delivery`
- `Rich menu：v0 先不用`
- `完整分析交付：v0 暫不交付；未來若做則自動化`
- `短碼：v0 不做`
- `Email fallback：保留但低調`
- `Profile image：use exported ANYU mark asset`
- `Background image：none for v0, or optional ANYU cream/gold later`

## Deliverables

- `ai-collaboration/research/2026-05-20-anyu-line-oa-setup-record-v0.md`
- `ai-collaboration/reports/2026-05-20-anyu-line-oa-setup-record-v0-execution-report.md`
- summary log update

## Validation

Run:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

## Final Output

End with the required Codex Completion Summary and include commit hash, staging push status, and tech-debt notes.
