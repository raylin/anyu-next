# Handoff: Module 01 Dual Theme v2 Riso A/B Implementation v0

Date: 2026-05-25

Project: anyu-next / 暗語 ANYU

## Objective

Implement Claude Design’s ANYU v2.0 “Riso Editorial” visual direction as an alternate Theme B for Module 01「曖昧溫度計」, while preserving the current Theme A as the default/control for A/B testing.

This task should port the provided high-fidelity v2 design as closely as practical into the existing Module 01 funnel, using it as a visual/theme layer only.

This is a visual/theme experiment implementation task.

Do not change product logic.

Do not change analyze behavior.

Do not change prompt/schema/cache/DB.

Do not change paid generation.

Do not change LINE fulfillment.

Do not change payment/email/ads behavior.

Do not deploy production unless explicitly approved after staging visual QA.

## Background

The user received feedback that the current style may be too quiet / too elegant / too “氣質” for broader conversion. Since ANYU can have multiple entry points and future modules, Module 01 does not need to force every module into the exact same visual mood.

The goal is to test a more vivid, higher-contrast visual direction for Module 01 that better matches:

```text
溫度計
情緒溫度
訊號強弱
熱度升降
更快的廣告 / 分享理解
```

Claude Design delivered a v2.0 visual system called:

```text
ANYU v2.0 · Riso Editorial
```

The user wants Codex to follow the high-fidelity design as closely as possible, while preserving current production logic and Theme A.

## Source Design Files

The user will place the following Claude Design files in the repo locally for Codex to inspect.

Expected location:

```text
ai-collaboration/inbox/claude-design-v2/
```

or:

```text
docs/design/anyu-v2/
```

Codex should locate the files if the exact path differs.

Required files:

```text
anyu-tokens-v2.css
DESIGN_SYSTEM_v2.md
MIGRATION_v1.1_to_v2.md
handoff-v2.html
screens-v2.jsx
ui-v2-atoms.jsx
ui-v2-components.jsx
```

Treat these files as the visual source of truth.

Priority note:

```text
Prefer visual fidelity to the provided high-fidelity v2 files over minimal implementation effort. Codex may port the provided JSX/CSS structure when it is safer than approximating with current components, as long as product behavior and data contracts remain unchanged.
```

## Design Direction Summary

### Theme A

Current ANYU visual direction:

```text
gentle
soft
premium
emotionally subtle
warm
quiet
slightly female-leaning
```

Theme A must remain available and functional.

### Theme B

Claude Design v2 / Riso Editorial direction:

```text
lively
higher contrast
more vivid
editorial / zine-like
riso print feeling
thermometer / signal / emotional heat metaphor
more memorable in screenshots / share cards / ads
still tasteful
still ANYU
not cheap
not childish
not neon
not SaaS dashboard
not generic Dcard love test
```

Theme B should feel like:

```text
ANYU’s second skin: more like an emotional thermometer poster than a quiet insight card.
```

## Critical v2 Visual Primitives

Codex must follow the v2 design system closely.

Key primitives from v2:

```text
sharp 2–4px radius
1.5–2px thick ink borders
solid offset shadows, no blur
riso paper background
ultramarine purple accent
riso magenta accent2
vermilion rose
Fraunces italic 700 for Latin/numbers
Space Mono 700 for labels
halftone grain overlay
off-canvas bleed blocks
numbered signal rows
ghost number overlay
temperature stripe bars
moon stamp / halftone moon
no gradient except allowed stripe/halftone patterns
no filter blur / backdrop blur
no soft blurred box-shadow
```

Important constraints from v2:

```text
- Do not use border-radius > 4px except true pill if unavoidable.
- Do not use blur shadows.
- Do not use filter: blur or backdrop-filter.
- Do not use generic gradients.
- Do not use accent2 excessively.
- Do not make chips pill-shaped.
- Do not make chip default state always shadowed.
- Do not use v2 on legal/global pages in this task.
```

## Important Product Constraints

Do not change:

```text
free-only analyze behavior
deferred paid generation service
LINE fulfillment / LIFF / webhook behavior
paid result schema
prompt/schema/cache/DB
payment/email/ads
Module 02
legal copy
retention cleanup
production env
```

This task is visual/theming only.

If a tiny UI-only adjustment is needed for visual fit, it is allowed, but it must not change data contracts or backend behavior.

## Scope

Implement Theme B for Module 01 only.

Surfaces in scope:

```text
landing / input
context chips
analysis CTA
loading state
free result page
temperature card
signal rows
insight card
paid preview / paywall area
contact / LINE fulfillment surface
unlocked route visual shell if it shares Module 01 result UI
share preview / share card if current app supports it
```

Out of scope:

```text
global homepage
legal pages
admin/dev tools
other modules
Module 02
payment pages
email templates
LINE rich menu
broadcast/portal/account system
```

## Theme Architecture

Implement Theme B as a selectable/assignable variant.

Recommended names:

```text
classic
riso
```

or:

```text
theme_a
theme_b
```

Preferred user-facing labels:

```text
柔和
鮮明
```

Internal storage:

```text
module01_theme_variant = classic | riso
module01_theme_source = ab_assigned | manual_override
```

Use localStorage or cookie.

Requirements:

```text
- Theme A is preserved.
- Theme B is opt-in / assignable.
- Theme B is local to Module 01.
- Manual override wins over A/B assignment.
- Theme selection persists across landing, result, unlock, and related Module 01 pages.
- No login required.
```

Recommended technical approach:

```text
Use a wrapper / data attribute such as:
data-module-theme="classic|riso"
or className="anyu-v2"
```

The v2 migration guide supports local activation with `.anyu-v2`, so use that when safe.

Do not build a full global theming framework unless absolutely necessary.

## A/B Assignment

Add lightweight assignment.

Expected behavior:

```text
On first Module 01 visit, assign 50/50:
- classic
- riso

Persist assignment.

If user manually toggles theme, set themeSource = manual_override.
```

Assignment must be stable across:

```text
landing
loading
result
unlock
line/contact fulfillment surfaces
```

Avoid hydration mismatch.

If server/client assignment complexity is high, choose a simple client-first implementation and document any brief pre-hydration visual limitation.

## Manual Theme Toggle

Add a small manual toggle.

Requirements:

```text
- subtle, not a primary CTA
- likely top/right near brand controls
- toggles classic/riso
- persists choice
- records safe event if event system supports it
```

Suggested labels:

```text
柔和 / 鮮明
```

or:

```text
Classic / Riso
```

Preferred:

```text
柔和 / 鮮明
```

Potential icon:

```text
small thermometer / palette / contrast icon
```

Only use icon if low-risk and visually aligned.

Do not make the toggle overly prominent.

## Analytics / Event Metadata

If event system supports safe metadata, add:

```text
themeVariant
themeSource
```

to key Module 01 events.

Events to consider:

```text
landing_view
theme_switch_clicked
analyze_clicked
analyze_success
analyze_failed
result_view
unlock_clicked
line_add_clicked
liff_opened
liff_bind_success
paid_generation_requested
paid_generation_completed
unlocked_result_view
```

Do not add raw input or sensitive data.

Forbidden metadata:

```text
raw input
context values if not needed
full result JSON
paid_result_json
LINE user ID
LINE display name
email
fulfillment code
unlock token
tokenized URL
provider raw output
secrets
```

Allowed:

```text
themeVariant
themeSource
moduleSlug
safe event status
safe timing/count metadata
```

## Implementation Approach

Codex should:

1. Copy/import v2 tokens into app styles without overwriting Theme A globally.
2. Use the supplied `anyu-tokens-v2.css` as source of truth.
3. Port relevant v2 atoms/components from `ui-v2-atoms.jsx` and `ui-v2-components.jsx`.
4. Use `screens-v2.jsx` and `handoff-v2.html` as high-fidelity references.
5. Integrate Theme B into existing Module 01 data flow.
6. Keep API/data behavior unchanged.
7. Add A/B assignment and manual toggle.
8. Add tests.
9. Run staging visual/route smoke if feasible.

Codex should not simply “approximate” with a few colors if high-fidelity porting is feasible.

## Minimum v2 Component Coverage

Implement or adapt v2 visuals for at least:

```text
Anyu page wrapper / background / grain
Nav/brand treatment
Input card
Chips
Primary CTA
Loading scene
Temperature card
Signal rows
Insight card
Pull quote if applicable
Paid preview cards
Contact / LINE sheet
Share card if applicable
```

If some are too large for v0, document clearly as deferred. But the first implementation should still look recognizably close to v2.

## Font Strategy

Claude v2 uses:

```text
Noto Serif TC
Noto Sans TC
Fraunces
Space Mono
```

If fonts are already loaded or can be safely added, implement according to v2.

If adding Google Fonts changes app strategy, document the decision.

Do not include or commit font files.

Never share font files.

## A/B Experiment Metrics

Primary metrics:

```text
landing → analyze click rate
analyze click → analyze success
result → unlock click
unlock → LINE / LIFF start
LINE / LIFF → bind success
unlock → paid generation completed
unlocked page view
```

Secondary metrics:

```text
manual theme switch rate
time to analyze click if available
fallback/provider source if safe
```

Important caveats:

```text
low traffic means noisy data
manual override users should be separated from assigned users
Theme B may improve CTR but reduce trust
qualitative manual review still matters
```

## Tests

Add/update tests for:

```text
Theme A still renders
Theme B renders for Module 01
Theme assignment persists
manual toggle switches and persists
manual override wins over A/B assignment
Module 01 analyze flow still works under both variants
context chips submit the same payload under both variants
result page works under both variants
unlock/LINE surface works under both variants
themeVariant/themeSource metadata is safe if emitted
no backend behavior changed
no prompt/schema/cache behavior changed
```

Playwright:

```text
local smoke should cover at least:
- default landing flow
- manual theme toggle
- analyze flow still works
- result/unlock surfaces do not crash
```

If Playwright browser launch is blocked by local harness permissions, document exactly and still run build/unit tests.

## Visual QA

Staging/manual QA should verify:

```text
Theme A remains unchanged enough to serve as control
Theme B visibly matches v2 high-fidelity reference
mobile first layout is not broken
no overflow
CTA remains clear
chips remain tappable
loading scene is not too distracting
result page remains readable
paid preview is not misleading
LINE/contact sheet remains functional
```

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-25-module-01-dual-theme-v2-riso-implementation-v0-review-bundle.md
```

Required sections:

```markdown
# Module 01 Dual Theme v2 Riso Implementation v0 Review Bundle

Date: 2026-05-25

## 1. Summary

## 2. Design Source Files Used

## 3. Theme Architecture

## 4. Theme A Preservation

## 5. Theme B Surfaces Implemented

## 6. v2 Fidelity Notes

## 7. A/B Assignment

## 8. Manual Toggle

## 9. Event Metadata

## 10. Tests Added

## 11. Staging / Visual Review Notes

## 12. Known Limitations

## 13. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-25-module-01-dual-theme-v2-riso-implementation-v0-execution-report.md
```

Report structure:

```markdown
# Module 01 Dual Theme v2 Riso Implementation v0 Execution Report

## Summary

## Files Created

## Files Updated

## Design Files Used

## Theme Architecture

## Theme A Preservation

## Theme B Implementation

## A/B Assignment

## Manual Toggle

## Event Metadata

## Tests Added

## Validation Results

## Staging / Visual Notes

## Known Technical Debt

## Tech Debt Review

### New Technical Debt Introduced

### Existing Technical Debt Observed

### Opportunistic Cleanup Completed

### Deferred Cleanup Candidates

### Recommended Follow-up

## Deviations From Handoff

## Git Commit

## Staging Push

## Remaining Uncertainties

## Recommended Next Step
```

## Summary Log

Append to:

```text
ai-collaboration/summaries/summary_log.md
```

Include:

```text
date
task completed
theme architecture summary
Theme B status
A/B assignment status
validation result
commit hash
staging push status
```

## Validation

Run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
cd apps/web && corepack pnpm test:e2e:local
```

Run Playwright because user-facing UI and theme toggling change.

## Constraints

Do not implement:

```text
payment provider integration
ads launch
real payment
email delivery
rich menu
broadcast
portal/account system
model switch
SSE/websocket/token streaming
Module 02
new backend generation behavior
```

Do not modify:

```text
free analyze behavior
paid generation behavior
LINE fulfillment behavior
LIFF bridge behavior
webhook behavior
prompt/schema/cache/DB
legal semantics
production behavior
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
ANTHROPIC_API_KEY
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
LINE_LOGIN_CHANNEL_SECRET
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
real contact values
raw private user content
font files
screenshots / test artifacts / videos / traces unless explicitly intended and safe
raw sourced JSONL
private batch generated outputs
codes/tokens/tokenized URLs/LINE user IDs
full raw provider output
paid_result_json dumps
```

## Production Gate

Default:

```text
staging only
```

Do not deploy production unless explicitly approved after visual QA.

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "feat: add module riso theme experiment"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
design files used
Theme B implementation summary
Theme A preservation status
A/B assignment behavior
manual toggle behavior
tests added
validation results
staging/visual notes
review bundle path
commit hash
staging push status
Tech Debt / Cleanup Notes
exact next step
```

Then stop.
