# Email Recovery Link Real Provider Smoke v0

Date: 2026-06-02

## Result

Blocked before Preview(staging) env changes or real Email send.

## Sender Readiness

Secure local `apps/web/.env.local` presence check:

| Env name | Presence |
| --- | --- |
| `EMAIL_PROVIDER` | present |
| `EMAIL_FROM` | present |
| `RESEND_API_KEY` | present |

Values, lengths, prefixes, suffixes, hashes, and checksums were not printed.

## Missing Required Input

No owner-approved smoke recipient was discoverable in secure local env.

Checked recipient env names:

- `QA_EMAIL_RECOVERY_SMOKE_TO`
- `EMAIL_RECOVERY_SMOKE_TO`
- `QA_RECOVERY_EMAIL_TO`
- `RECOVERY_EMAIL_SMOKE_TO`

All were missing.

Because the task requires an owner-approved test recipient and forbids raw Email in reports/logs, Codex stopped before:

- setting Preview(staging) Resend env
- redeploying staging
- triggering a real Email send
- creating a real-send smoke row

## Preview(staging) Env Alignment

Not performed.

Reason: recipient readiness could not be confirmed. Applying sender/API key env without being able to run the controlled smoke would leave staging behavior changed without completing the verification loop.

## Real Email Send Result

Not sent.

No Resend API call was made.

## Inbox Verification Result

Not run.

## `/r/` Link Resolution Result

Not run for real Email because no Email was sent.

Existing recovery-link resolver remains staging-proven by prior Preview runtime smoke.

## Regression QA

Not rerun for this blocked task because no runtime/env/code behavior was changed.

## Production Safety

- Production env was not modified.
- Production payment runtime was not enabled.
- Production DB migration was not applied.
- No production Email was sent.
- No LINE messages were sent.

## Security / Privacy

- No provider key values were printed.
- No raw Email address was printed.
- No raw `prl_`, token hash, `pa_`, `pcs_`, tokenized URL, provider payload, raw input, or report content was printed.
- No provider secrets or private customer data were committed.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: no dedicated real-provider smoke script exists yet.
- Opportunistic cleanup completed: none.
- Deferred cleanup candidates:
  - add a `qa:email-recovery-link:smoke` command that reads a recipient from a local-only env var and redacts it in output
  - add Preview(staging)-only Resend env alignment once a recipient is explicitly available

## Required Next Input

Set one local-only owner-approved test recipient variable without committing it, for example:

```bash
QA_EMAIL_RECOVERY_SMOKE_TO=<owner-approved test recipient>
```

Then rerun Email Recovery Link Real Provider Smoke v0.

## Suggested Next Step

Email Recovery Link Real Provider Smoke v0 retry with `QA_EMAIL_RECOVERY_SMOKE_TO` present in the operator shell or `apps/web/.env.local`.
