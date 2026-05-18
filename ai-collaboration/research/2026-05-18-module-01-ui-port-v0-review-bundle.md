# Module 01 UI Port v0 Review Bundle

## 1. Summary

Module 01 now has a production-quality UI shell inside `apps/web` for both the landing page and a static demo result route. The flow is intentionally UI-only: local input/chip state, CTA enable/disable behavior, and a mock result presentation without provider calls, DB reads/writes, payment, or auth.

## 2. Routes Implemented

- `/m/ambiguous-temperature`
- `/m/ambiguous-temperature/result/demo`

## 3. Components Added / Updated

- Shared ANYU components:
  - `PrivacyHelper`
  - `InputCard`
  - `TemperatureCard`
  - `ShareCardPreview`
  - `PaidPreviewCard`
  - `ContactCapture`
  - updated `SituationChips`
- Module-specific components:
  - updated `AiTemperatureLanding`
  - added `AiTemperatureResult`
- Helper layer:
  - `apps/web/src/lib/modules/ai-temperature-ui.ts`

## 4. Landing Page Behavior

- renders the ANYU wordmark and module header
- uses module config title, subtitle, chips, price, and family labels
- lets the user type text and choose a situation chip
- CTA is disabled for short input and labeled `先貼一段對話`
- CTA becomes enabled and labeled `分析我的曖昧溫度` once input is long enough
- clicking the enabled CTA navigates to `/m/ambiguous-temperature/result/demo`

## 5. Result Page Demo Behavior

- uses static mock data only
- renders:
  - top bar / back link
  - temperature signature card
  - one-sentence read card
  - observed signals card
  - insight card
  - share card preview
  - paid preview
  - contact capture placeholder

## 6. Paid Preview Behavior

- shows:
  - `ONE-TIME · NO SUB`
  - `解鎖下一句怎麼回 — NT$49`
  - one readable preview card
  - two locked preview cards
- reveal is local UI state only
- clicking the unlock button reveals the contact capture placeholder
- no payment or API call occurs

## 7. Share Card Preview

- rendered as a 4:5 in-app preview
- includes:
  - `暗語 ANYU`
  - persona
  - quote
  - temperature
  - `anyu.app`
- excludes:
  - raw conversation text
  - names
  - handles
  - price

## 8. Design System Usage

- uses `apps/web/src/styles/tokens.css`
- stays inside the narrow premium mobile-first container
- uses ANYU token roles for background, surfaces, lines, accent, accent2, and rose
- avoids SaaS dashboard layout patterns

## 9. What Is Still Mocked

- analyze action
- result data
- event tracking
- contact submission
- provider runtime
- DB persistence
- payment
- auth

## 10. Issues For ChatGPT Review

- Should the result page keep the contact capture hidden until the fake-door button is clicked, or should it always remain visible below the paid preview?
- Should the next runtime step keep `/result/demo` only for review, or preserve a parallel demo route after real result IDs are introduced?
- Should the current helper threshold for enabling analysis stay simple, or should the next step add copy-aware validation and more explicit inline guidance?
