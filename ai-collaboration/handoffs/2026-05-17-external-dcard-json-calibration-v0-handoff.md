# Handoff: External Dcard JSON Calibration v0

Date: 2026-05-17

Project: Opportunity Radar

## Objective

Create a rule-based workflow to ingest externally collected Dcard-like JSON data, transform it into privacy-minimized calibration notes, generate a summary JSON, and produce a ChatGPT review bundle.

## Input

Confirmed input source:

- `./ai-collaboration/output-0517.jsonl`

The file is accessible in the repo and appears to contain Dcard-like JSON records with fields such as:

- `id`
- `title`
- `excerpt`
- `content`
- `forum_name`
- `created_at`
- `updated_at`
- `like_count`
- `comment_count`
- `topics`
- `comments`

## Scope

This task should:

1. add `scripts/external_dcard_json_calibration.py`
2. create `ai-collaboration/research/dcard_calibration/external_json/`
3. generate calibration notes, summary JSON, and review bundle
4. update the Dcard calibration README and summary log
5. create an execution report
6. commit the completed work

## Hard Boundaries

- no crawling
- no browser automation
- no Cloudflare bypass
- no prototype changes
- no formal stack decisions

## Privacy Constraints

- do not store usernames, school names, department names, or identifiers
- do not store full raw posts
- do not store full raw comment threads
- store only short summaries and structured signals

## Repo-State Note

Before this task, there are already local uncommitted changes in:

- `ai-collaboration/research/dcard_calibration/dcard_topic_calibration_notes.jsonl`
- `ai-collaboration/research/dcard_calibration/dcard_urls.txt`

These appear unrelated to the external JSON calibration output.

## Decision Needed

Human guidance is needed on whether to:

1. keep those two files isolated from this task's commit, or
2. include them in this task's commit
