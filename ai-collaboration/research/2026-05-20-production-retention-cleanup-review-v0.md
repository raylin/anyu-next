# Production Retention Cleanup Review v0

Date: 2026-05-20

## 1. Summary

Production retention coverage for the current low-key launch window looks acceptable.

`analysis_requests` and `analysis_results` both have retention timestamps on all current production rows, no overdue rows were found, and no manual cleanup action was required in this review. Event/privacy spot checks also remained clean.

## 2. Review Window

Review timestamp context:

- review run on `2026-05-21 00:xx CST`
- data present is still limited to the first low-key launch window

Scope of this review:

- current production table-level retention state
- overdue-row eligibility
- current event/privacy boundary safety

## 3. Tables Reviewed

Reviewed tables:

- `analysis_requests`
- `analysis_results`
- `events`
- `contact_submissions`
- `unlock_intents`
- `sessions`

Primary retention-focus tables:

- `analysis_requests`
- `analysis_results`

## 4. Retention Timestamp Status

Retention timestamp coverage:

- `analysis_requests`
  - total rows: `2`
  - rows with `retention_expires_at`: `2`
  - rows missing `retention_expires_at`: `0`
  - oldest `created_at`: `2026-05-20T16:14:26.101Z`
  - oldest `retention_expires_at`: `2026-05-21T16:14:25.762Z`
  - newest `retention_expires_at`: `2026-05-21T16:23:56.031Z`
- `analysis_results`
  - total rows: `2`
  - rows with `retention_expires_at`: `2`
  - rows missing `retention_expires_at`: `0`
  - oldest `created_at`: `2026-05-20T16:14:51.627Z`
  - oldest `retention_expires_at`: `2026-05-21T16:14:25.762Z`
  - newest `retention_expires_at`: `2026-05-21T16:23:56.031Z`

Related table notes:

- `unlock_intents` currently has `2` rows and does not carry `retention_expires_at`
- `contact_submissions` currently has `1` row and does not carry `retention_expires_at`
- `events` currently has `12` rows
- `sessions` currently has `2` rows

## 5. Overdue Row Counts

Overdue rows where `retention_expires_at < now()`:

- `analysis_requests`: `0`
- `analysis_results`: `0`

Cleanup eligibility summary:

- rows eligible for immediate manual cleanup in the primary retention tables: `0`

## 6. Cleanup Action Taken

Cleanup action taken: `none`

Reason:

- no overdue `analysis_requests` rows
- no overdue `analysis_results` rows
- no unsafe event/privacy finding that required emergency cleanup

## 7. Event / Privacy Verification

Privacy/event verification result: `passed`

Safe event scan results:

- raw input leak count: `0`
- email leak count: `0`
- LINE ID leak count: `0`
- full normalized result JSON leak count: `0`
- provider raw output leak count: `0`
- `DATABASE_URL` leak count: `0`
- `ANTHROPIC_API_KEY` leak count: `0`
- timing-metadata event count: `2`
- total event rows scanned: `12`

Allowed metadata remains visible:

- event names
- timing aggregates
- linkage identifiers
- safe funnel state

## 8. Runbook / Decision Updates

Runbook review result:

- no update required

Final launch decision review result:

- no update required

Reason:

- both already state the accepted `24–48h` manual cleanup policy and the requirement for stronger cleanup before broader traffic

## 9. Issues Found

No critical retention issue found.

Operational limitations observed:

- current retention field coverage is strongest on `analysis_requests` and `analysis_results`
- `unlock_intents` and `contact_submissions` do not currently carry `retention_expires_at`
- manual review is still required until stronger cleanup automation exists

## 10. Remaining Limitations

- this review is based on very low production volume
- no actual cleanup execution was exercised because no overdue rows existed
- event retention policy and contact/unlock retention policy are still more operational than system-enforced in the current schema

## 11. Current Launch Status

Current launch status: `GO remains acceptable for low-key production launch`

Retention-specific interpretation:

- no immediate retention-driven blocker is present
- manual review cadence should continue

## 12. Recommended Next Step

`Production Low-Key Monitoring Follow-up v1`
