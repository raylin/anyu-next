# Handoff: Module 01 Preview Deployment + Manual QA v0

Date: 2026-05-18

Project: anyu-next / 暗語 ANYU

## Objective

Prepare and run the first preview deployment QA for Module 01 using the `apps/web` production foundation, including env readiness, migration readiness, preview deployment path, and manual QA logging.

## Scope

- verify whether required env vars are present locally
- verify migration command readiness
- run standard validation
- run live migration / local QA / preview deployment only if credentials and tools are available
- otherwise produce exact manual next steps and mark the task as blocked pending user setup

## Current Workspace Status

- `DATABASE_URL` not present
- `ANTHROPIC_API_KEY` not present
- `ANTHROPIC_MODEL` not present
- `ORADAR_PROVIDER` not present
- `NEXT_PUBLIC_APP_URL` not present
- `vercel` CLI not present

## Expected Deliverables

- preview deployment QA report
- execution report
- summary log update
- exact manual steps for preview env, migration, and Vercel preview deployment if live execution is blocked
