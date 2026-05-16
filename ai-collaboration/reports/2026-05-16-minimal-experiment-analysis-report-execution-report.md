# Minimal Experiment Analysis Report Execution Report

## Summary

Added a minimal local analysis CLI for the `曖昧溫度計` fake-door prototype.

The new script reads local JSONL experiment logs, tolerates missing or invalid files, and writes a markdown summary report without exposing raw input text or contact values.

## Files Created

- `ai-collaboration/handoffs/2026-05-16-minimal-experiment-analysis-report-handoff.md`
- `experiments/ambiguous_temperature_v0/analyze_results.py`
- `ai-collaboration/reports/2026-05-16-minimal-experiment-analysis-report-execution-report.md`

## Files Updated

- `.gitignore`
- `experiments/ambiguous_temperature_v0/README.md`
- `ai-collaboration/summaries/summary_log.md`

## Implementation Approach

Chose a single standard-library Python script with no new dependencies.

Approach details:

- reused canonical output paths from `experiments/ambiguous_temperature_v0/event_log.py`
- reused experiment constants from the existing prototype modules
- loaded JSONL files line by line
- skipped invalid JSON lines while counting them
- handled missing files and empty files without crashing
- generated a markdown report at `outputs/experiments/ambiguous_temperature_v0/experiment_report.md`
- kept the report output git-ignored

## Metrics Covered

The report covers:

- overview totals
- funnel event counts
- funnel rates
- situation type breakdown
- state label breakdown
- temperature score summary and buckets
- input quality summary
- contact capture summary
- static interpretation notes

## Privacy Handling

- the analysis script never prints `input_text`
- the analysis script never prints `contact_value`
- the generated report shows counts, rates, labels, and score summaries only
- `outputs/experiments/**/experiment_report.md` is git-ignored
- existing JSONL logs remain git-ignored

## Validation Results

Validation commands run:

```bash
python3 -m compileall oradar
python3 -m py_compile experiments/ambiguous_temperature_v0/*.py
python3 -m py_compile scripts/generate_product_sample.py
python3 experiments/ambiguous_temperature_v0/analyze_results.py
```

Results:

- all compile checks passed
- the analysis script executed successfully
- the report was generated at `outputs/experiments/ambiguous_temperature_v0/experiment_report.md`
- generated report content was checked to confirm raw text and contact values are not present
- `experiment_report.md` remained untracked because it is git-ignored

## Known Technical Debt

None.

## Deviations From Handoff

- No logging behavior was changed.
- The script used current local logs for validation instead of adding a committed fixture.
- As with prior tasks, the final commit hash is reported in the final CLI completion summary because a commit cannot contain its own final hash without changing that hash.

## Git Commit

Planned commit message:

```text
feat: add minimal experiment analysis report
```

The final CLI completion summary will include the actual commit hash after commit creation.

## Remaining Uncertainties

- Current local logs came from smoke testing, so the generated metrics should be interpreted only as a functional validation of the report path.
- The current event schema does not guarantee that every contact submission is preceded by a paid unlock click if API endpoints are called directly.

## Recommended Next Step

Have ChatGPT review whether the current report metrics and markdown shape are sufficient for early fake-door analysis before adding any richer local reporting.
