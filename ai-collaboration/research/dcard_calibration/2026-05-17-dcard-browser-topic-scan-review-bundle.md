# Dcard Browser Topic Scan v0 Review Bundle

## 1. Overview

This bundle documents the minimal Playwright-based Dcard browser topic scan workflow for public relationship-board topic calibration.

Goal:

- test whether a normal browser session can expose enough lightweight public topic signals to calibrate the current `曖昧溫度計` direction

## 2. Method

Planned method:

1. open `https://www.dcard.tw/f/relationship`
2. collect a small number of visible article URLs
3. visit each article URL
4. store only:
   - URL
   - title
   - short visible snippet
   - lightweight visible comment patterns up to a small limit

Guardrails:

- no login
- no proxying
- no anti-bot bypass
- no large-scale crawling
- no raw post archiving

## 3. Run Configuration

Intended default command:

```bash
python3 scripts/dcard_browser_topic_scan.py --max-posts 5 --max-comments 3
```

Default script settings:

- board URL: `https://www.dcard.tw/f/relationship`
- max posts: `10`
- max comments: `3`
- headless: `true`

## 4. URLs Discovered

- `0`

Reason:

- Playwright is not installed in the current environment, so the browser scan could not start.

## 5. Articles Processed

- `0`

## 6. Fetch / Browser Results

Observed failure mode:

- setup blocker before browser launch
- Playwright Python package not installed

Manual setup required:

```bash
python3 -m pip install playwright
python3 -m playwright install chromium
```

No browser-visible access wall, captcha, or login wall was observed yet because the script did not reach runtime browsing.

## 7. Theme Distribution

Pending once Playwright is installed and a small scan can run.

## 8. Action Pressure Patterns

Pending once Playwright is installed and a small scan can run.

## 9. Social Signal Patterns

Pending once Playwright is installed and a small scan can run.

## 10. Comment Signal Summary

Pending once Playwright is installed and a small scan can run.

## 11. Product Mapping Summary

Pending once Playwright is installed and a small scan can run.

## 12. Landing Hook Candidates

Pending once Playwright is installed and a small scan can run.

## 13. Potential MVP Adjustments

No recommendation yet.

The workflow is ready to test whether:

- the current three primary situation types remain the right v0 focus
- `社群微訊號` should become a broader category
- a fourth situation type should be added

## 14. Data Quality / Limitations

- browser scan not executed yet
- no real article data collected
- note extraction heuristics are intentionally simple
- browser-visible blocking behavior is still unknown in this environment

## 15. Issues For ChatGPT Review

1. Is the current script shape the right minimal pre-install baseline, or should browser setup be separated from scan logic even more clearly?
2. Once Playwright is installed, should the first scan stay at `5` posts or go lower for an even safer smoke test?
3. Should `comment_signal_summary` stay rule-based in v0, or is a slightly richer manual review step better than adding more heuristics?
