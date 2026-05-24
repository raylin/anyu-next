# Landing / Share Title Hierarchy Polish v0 Review Bundle

Execution date: 2026-05-25

## Scope Reviewed

- Module 01 landing hero title and subtitle hierarchy.
- Module 01 result/share preview title hierarchy.
- Module route metadata and Open Graph title/description.
- Tests that asserted the previous title/subtitle contract.

## User-Facing Copy Contract

Primary title:

```text
曖昧溫度計
```

Subtitle:

```text
他是真的忙，還是其實在冷掉？
```

Support copy preserved:

```text
貼上對話或描述情境，AI 幫你讀出關係溫度，與下一句怎麼回。
```

## Surface Notes

- Landing hero now uses the module name as the only `h1`.
- Emotional question now appears immediately below as body subtitle copy.
- Support copy remains below the subtitle as quieter helper text.
- Share preview now leads with the module name and emotional subtitle before persona/result quote details.
- Metadata title now uses `曖昧溫度計｜暗語 ANYU`.
- Metadata description now uses the emotional question plus a concise product description.

## Compatibility Review

- Context chips were not changed.
- Analyze behavior was not changed.
- LINE fulfillment was not changed.
- Paid result prompt, schema, semantic validation, cache behavior, and product result mapping were not changed.
- Production deployment and production environment were not touched.

## Test Coverage Updated

- Module config test now asserts the new title/subtitle/description hierarchy.
- Metadata helper test covers route title and description copy.
- Result rendering test asserts the share preview contains the module-first hierarchy.
- Local Playwright smoke now checks the landing heading, subtitle, and support copy.

## Visual Review Notes

- Hero hierarchy should scan more quickly because the title is shorter and product-like.
- Subtitle remains the emotional hook without forcing a line-break split.
- Share preview is more module-oriented and still preserves persona and quote context.
- No new fonts, tokens, marks, or layout systems were introduced.

## Safety Notes

- No secrets, tokens, LINE identifiers, private input, raw source text, or production values were added.
- No schema, prompt, cache, payment, email, or production logic was changed.
