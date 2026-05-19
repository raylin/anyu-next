# Handoff: Module 01 Preview Deployment + Remote QA Retry v0

Date: 2026-05-19

Project: anyu-next / 暗語 ANYU

## Objective

Run the first Vercel preview deployment and remote QA retry for Module 01 after local live QA passed, verifying whether the app can deploy from `apps/web` with Neon/provider env configured in a preview environment.

## Scope

- verify deployment prerequisites
- attempt Vercel preview deployment if tooling/access is available
- if deployment succeeds, verify remote preview routes and core flow
- if deployment is blocked, document exact next manual steps without fabricating success

## Constraints

- no production-domain promotion
- no auth, payment, or portal work
- no secrets printed or committed
