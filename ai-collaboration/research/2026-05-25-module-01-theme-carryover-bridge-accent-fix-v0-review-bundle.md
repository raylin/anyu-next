# Module 01 Theme Carryover Bridge + Accent Direction Fix v0 Review Bundle

## 1. Summary

This pass fixes the Theme B quote-card accent direction and applies Module 01 theme carryover to the LINE/LIFF bridge surface. The change is visual/theme continuity only and does not alter analyze, paid generation, LINE bind semantics, prompts, schemas, cache, or DB behavior.

## 2. Accent Direction Fix

- The Theme B `.anyu-quote-card` accent was moved from the right edge back to the left edge.
- The quote-card now reserves left padding so the magenta strip does not overlap text.
- Theme A quote-card styling was not changed.

## 3. Bridge Theme Carryover Fix

- The LIFF bridge now reads the existing safe theme context from parsed fulfillment context.
- Explicit query / LIFF state theme hints win.
- If explicit hints are absent, the bridge can recover theme from the compact unlock-token suffix.
- The global `/line/fulfill` page and compatibility `/m/[moduleSlug]/line/fulfill` page now pass server search context to the client bridge so the correct theme can render before hydration.

## 4. Theme Resolution

- Query / LIFF context: supported through `themeVariant` and `themeSource`.
- Unlock-token suffix: supported through `.r` and `.c`.
- LocalStorage and A/B assignment remain handled by the existing module theme controller when no carried hint exists.
- No fresh A/B assignment is created when a carried theme hint exists.

## 5. LIFF URL / Context Verification

- Existing LIFF URL generation remains path-safe: `https://liff.line.me/{LIFF_ID}?<context>`.
- No `/line/fulfill` path is appended after the LIFF ID.
- Theme hints continue to be included in generated LIFF URLs and bind redirects.

## 6. Tests Added / Updated

- Added parsing coverage for recovering theme from unlock-token suffix.
- Added bridge render coverage for riso query hints and classic token suffix hints.
- Added server-render coverage for bridge theme hints before hydration.
- Updated CSS contract coverage for the Theme B quote-card left-edge accent.

## 7. Privacy / Event Safety

- No raw input, result JSON, paid result JSON, LINE user ID, ID token, short code, unlock token, tokenized URL, provider output, or secret was added to docs or event metadata.
- Existing safe theme metadata remains limited to `themeVariant`, `themeSource`, and existing carryover source metadata.

## 8. Known Limitations

- Human staging QA is still needed to visually confirm the LIFF transition page in a real LINE WebView.
- Local Playwright may remain blocked by the known Chromium/MachPort issue.

## 9. Recommended Next Step

Run a staging LIFF bridge visual smoke from both Theme A and Theme B result pages and confirm the transition page preserves the selected visual theme.

