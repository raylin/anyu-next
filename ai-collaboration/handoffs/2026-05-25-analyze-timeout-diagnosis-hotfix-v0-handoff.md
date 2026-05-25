# Handoff: Analyze Timeout Diagnosis + Hotfix v0

Date: 2026-05-25

## Problem

After the latest production deployment, both staging and production analyze CTA time out repeatedly. LINE webhook verification fix is deployed and works, but analyze is broken. Likely related to recent paidResult v2 / output budget / semantic validation changes rather than LINE webhook.

## Goal

Diagnose and apply the smallest safe hotfix so analyze works again on staging and production.

## Scope

- Focus only on `/api/modules/[moduleSlug]/analyze` and related provider/prompt/schema/semantic validation/cache timeout behavior.
- Do not touch LINE webhook/LIFF unless logs prove it is involved.
- Do not touch payment/email/ads/legal text.
- Do not start production OA smoke.
- Do not implement queue/worker/streaming.

## Synthetic Input

Use synthetic relationship input only. Do not use real private input.

Context:
- relationshipStage: 曖昧中
- userGoal: 我該怎麼回
- primaryPain: 回覆變慢
- replyTone: 有界線但不冷

## Validation

Run full local validation, deploy/refresh staging, verify analyze, then deploy/refresh production and verify analyze.

## Commit

`fix: restore analyze completion`
