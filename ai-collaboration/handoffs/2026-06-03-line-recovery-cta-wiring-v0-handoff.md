# LINE Recovery CTA Wiring v0 Handoff

Date: 2026-06-03

## Task

Wire visible LINE recovery save CTAs into Module 01 checkout-start and completed-result recovery surfaces, pointing to the recovery-specific LIFF bind flow.

## Scope

- UI wiring and recovery bind state integration only.
- No LINE push/message sending.
- No Email sending.
- No production runtime/env/DB changes.
- No payment provider behavior changes.

## Planned Work

1. Inspect checkout-start recovery soft gate, completed-result save section, paid-ready reminder, LINE recovery LIFF page/API, and `rlb_` bind state helpers.
2. Generate safe LINE recovery bind URLs/states for:
   - checkout-start source
   - completed-result source
3. Render visible secondary LINE recovery CTAs with recovery semantics:
   - `用 LINE 保存這份報告`
   - `之後可以透過 LINE 協助找回`
   - failure/cancel does not block checkout/report access
4. Preserve Email as desktop/default primary path.
5. Add/update tests for CTA copy, state safety, no paid-report-body delivery promise, and existing Email recovery behavior.
6. Run full validation and staging-safe QA commands.
7. Create execution report, update summary log and dashboard, commit, and push.

## Safety Constraints

- Do not expose raw `pa_`, `pcs_`, `prl_`, unlock token, short code, tokenized access URL, provider payload, report content, raw Email, or raw LINE userId.
- Do not reuse legacy unlock/fulfillment semantics.
- Do not send LINE messages.
- Do not enable production payment runtime or modify production env/DB.

## Expected Outputs

- Code/tests for LINE recovery CTA wiring.
- Execution report under `ai-collaboration/reports/`.
- Summary log and dashboard update.
- Commit and push status.
