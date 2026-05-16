# Handoff: Semi-Automated Dcard Topic Calibration v0

Date: 2026-05-16

Project: Opportunity Radar

## Objective

Create a lightweight, semi-automated Dcard topic calibration workflow to assess whether the current `曖昧溫度計` situation types still match real Dcard relationship-topic patterns.

## Scope

This task should:

1. add a URL input file for manually supplied public Dcard links
2. add a local script to read URLs, attempt normal HTTP fetches, and write summarized calibration JSONL notes
3. update the Dcard calibration README, template, and schema as needed
4. create a Dcard topic calibration review bundle
5. create an execution report and summary-log entry
6. commit the completed workflow changes

## Constraints

- Do not build a production scraper.
- Do not add login automation, anti-bot bypass, proxies, or large-scale crawling.
- Do not collect personal data.
- Prefer summarized notes over full raw post storage.
- Do not modify the product runtime prompt, schema, prototype flow, or provider behavior.

## Current Repo-State Blocker

Before implementing this task, the worktree already contains unrelated uncommitted changes:

- `outputs/product_eval/generated/eval_018.result.json`
- `outputs/product_eval/generated/eval_019.result.json`
- `outputs/product_eval/generated/eval_020.result.json`
- `outputs/product_eval/generated/eval_021.result.json`
- `outputs/product_eval/generated/eval_022.result.json`
- `outputs/product_eval/generated/eval_023.result.json`

These appear to be leftover generated-file modifications from the prior prompt calibration task.

Per handoff instructions, these should not be silently included in the Dcard calibration commit.

## Next Decision Needed

Human guidance is needed on one of these paths:

1. include those six generated-file changes in this task's commit
2. discard or otherwise clean them before continuing
3. stop and keep this task isolated until the repo is clean
