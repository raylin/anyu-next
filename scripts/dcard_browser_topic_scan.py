#!/usr/bin/env python3
"""Minimal Playwright-based Dcard topic scan."""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_BOARD_URL = "https://www.dcard.tw/f/relationship"
DEFAULT_OUTPUT = (
    REPO_ROOT
    / "ai-collaboration"
    / "research"
    / "dcard_calibration"
    / "dcard_browser_topic_scan_notes.jsonl"
)

BLOCK_TERMS = ("驗證", "captcha", "登入", "註冊", "sign in", "log in")
THEME_RULES = (
    ("回訊變慢但看限動", ("看限動", "限動", "回訊變慢", "回很慢")),
    ("已讀不回", ("已讀不回", "讀不回", "不回訊息")),
    ("忽冷忽熱", ("忽冷忽熱", "忽熱忽冷", "一下熱一下冷")),
    ("說忙但社群活躍", ("說忙", "一直發文", "社群", "發文")),
    ("只回限動不回訊息", ("只回限動", "回限動不回訊息")),
    ("朋友以上戀人未滿", ("朋友以上", "戀人未滿", "曖昧對象")),
    ("前任突然聯絡", ("前任", "突然聯絡")),
    ("備胎焦慮", ("備胎",)),
    ("半夜才找你", ("半夜", "凌晨")),
    ("只回表情符號", ("表情符號", "貼圖")),
    ("約會後冷掉", ("約會後", "見面後", "冷掉")),
    ("突然不看限動", ("不看限動",)),
    ("隱藏限動", ("隱藏限動",)),
)
ACTION_TERMS = {
    "high": ("怎麼回", "要不要回", "追問", "放棄", "繼續", "要不要"),
    "medium": ("不知道", "猶豫", "想問", "想試探", "卡住"),
}
SOCIAL_SIGNAL_TERMS = ("限動", "發文", "按讚", "社群", "已讀", "回覆", "訊息")
EMPATHY_TERMS = ("辛苦了", "抱抱", "加油", "你值得", "我懂", "拍拍")
ACTION_PATTERN_TERMS = (
    ("先冷處理", ("先不要回", "先冷處理", "先放著")),
    ("直接問清楚", ("直接問", "問清楚", "攤開講")),
    ("退一步觀察", ("先退", "退一步", "觀察一下")),
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Minimal Playwright-based Dcard topic scan.")
    parser.add_argument("--board-url", default=DEFAULT_BOARD_URL)
    parser.add_argument("--max-posts", type=int, default=10)
    parser.add_argument("--max-comments", type=int, default=3)
    parser.add_argument("--headful", action="store_true")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    return parser.parse_args()


def ensure_playwright() -> tuple[Any, str] | tuple[None, None]:
    try:
        from playwright.sync_api import sync_playwright  # type: ignore
    except ImportError:
        return None, None
    return sync_playwright, "available"


def main() -> int:
    args = parse_args()
    sync_playwright, availability = ensure_playwright()
    args.output.parent.mkdir(parents=True, exist_ok=True)

    if not sync_playwright:
        args.output.write_text("", encoding="utf-8")
        print("Playwright is not installed.")
        print("Manual setup required:")
        print("  python3 -m pip install playwright")
        print("  python3 -m playwright install chromium")
        print(f"Created empty output file at {args.output}.")
        return 1

    rows: list[dict[str, Any]] = []
    discovered_urls: list[str] = []
    blocked = 0
    failed = 0

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=not args.headful)
        page = browser.new_page()
        try:
            page.goto(args.board_url, wait_until="domcontentloaded", timeout=30000)
        except Exception as exc:
            browser.close()
            args.output.write_text("", encoding="utf-8")
            print(f"Failed to open board page: {exc}")
            print(f"Created empty output file at {args.output}.")
            return 1

        if page_looks_blocked(page):
            browser.close()
            args.output.write_text("", encoding="utf-8")
            print("Board page appears blocked by login wall, captcha, or access wall.")
            print(f"Created empty output file at {args.output}.")
            return 1

        discovered_urls = discover_article_urls(page, max_posts=args.max_posts)

        for url in discovered_urls:
            row = scan_article(browser=browser, url=url, max_comments=args.max_comments)
            rows.append(row)
            if row["fetch_status"] == "blocked":
                blocked += 1
            elif row["fetch_status"] != "browser_success":
                failed += 1

        browser.close()

    with args.output.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")

    print(f"URLs discovered: {len(discovered_urls)}")
    print(f"Articles processed: {len(rows)}")
    print(f"Success: {sum(1 for row in rows if row['fetch_status'] == 'browser_success')}")
    print(f"Blocked: {blocked}")
    print(f"Failed: {failed}")
    print(f"Output: {args.output}")
    return 0


def page_looks_blocked(page: Any) -> bool:
    title = (page.title() or "").lower()
    body_text = " ".join(page.locator("body").all_inner_texts()).lower()
    combined = f"{title} {body_text}"
    return any(term in combined for term in BLOCK_TERMS)


def discover_article_urls(page: Any, *, max_posts: int) -> list[str]:
    seen: list[str] = []
    hrefs = page.locator("a").evaluate_all(
        """elements => elements
        .map(element => element.href || "")
        .filter(Boolean)
        """
    )
    for href in hrefs:
        if "/f/" not in href or "/p/" not in href:
            continue
        if href not in seen:
            seen.append(href)
        if len(seen) >= max_posts:
            break
    return seen


def scan_article(*, browser: Any, url: str, max_comments: int) -> dict[str, Any]:
    page = browser.new_page()
    try:
        page.goto(url, wait_until="domcontentloaded", timeout=30000)
        if page_looks_blocked(page):
            return blank_row(url=url, fetch_status="blocked", notes="Encountered browser-visible access wall, login wall, or captcha.")

        title = clean_text(first_text(page, ["h1", "title"]))
        snippet = clean_text(first_text(page, ["article", "main", "body"]))[:280]
        comments = collect_comment_texts(page, max_comments=max_comments)
        comment_signal_summary = summarize_comments(comments)
        comment_empathy_phrases = collect_empathy_phrases(comments)
        comment_action_patterns = collect_action_patterns(comments)
        comment_disagreement = infer_comment_disagreement(comments)
        combined_text = " ".join(part for part in [title, snippet] if part)
        theme = infer_theme(combined_text)
        action_pressure = infer_action_pressure(combined_text)
        social_signal = infer_social_signal(combined_text)

        return {
            "source": "dcard_browser_public",
            "url_or_ref": url,
            "title": title,
            "board": "relationship",
            "post_snippet": snippet,
            "comment_count_visible": len(comments),
            "comment_signal_summary": comment_signal_summary,
            "comment_empathy_phrases": comment_empathy_phrases,
            "comment_action_patterns": comment_action_patterns,
            "comment_disagreement": comment_disagreement,
            "theme": theme,
            "user_question": "",
            "emotional_trigger": "",
            "action_pressure": action_pressure,
            "social_signal": social_signal,
            "product_mapping": infer_product_mapping(theme=theme, action_pressure=action_pressure, social_signal=social_signal),
            "landing_hook_candidate": infer_landing_hook(theme=theme, text=combined_text),
            "should_adjust_mvp": False,
            "fetch_status": "browser_success",
            "notes": "Stored title, short visible snippet, and lightweight comment patterns only.",
        }
    except Exception as exc:
        return blank_row(url=url, fetch_status="browser_failed", notes=f"Browser fetch failed: {exc}")
    finally:
        page.close()


def blank_row(*, url: str, fetch_status: str, notes: str) -> dict[str, Any]:
    return {
        "source": "dcard_browser_public",
        "url_or_ref": url,
        "title": "",
        "board": "relationship",
        "post_snippet": "",
        "comment_count_visible": 0,
        "comment_signal_summary": "",
        "comment_empathy_phrases": [],
        "comment_action_patterns": [],
        "comment_disagreement": "",
        "theme": "uncertain",
        "user_question": "",
        "emotional_trigger": "",
        "action_pressure": "unknown",
        "social_signal": "",
        "product_mapping": "",
        "landing_hook_candidate": "",
        "should_adjust_mvp": False,
        "fetch_status": fetch_status,
        "notes": notes,
    }


def first_text(page: Any, selectors: list[str]) -> str:
    for selector in selectors:
        try:
            locator = page.locator(selector).first
            if locator.count():
                text = locator.inner_text(timeout=1000)
                if text:
                    return text
        except Exception:
            continue
    return ""


def collect_comment_texts(page: Any, *, max_comments: int) -> list[str]:
    selectors = [
        "[data-key='comment']",
        "[class*='comment']",
        "article ~ div div",
    ]
    comments: list[str] = []
    for selector in selectors:
        try:
            locator = page.locator(selector)
            count = min(locator.count(), max_comments)
            for index in range(count):
                text = clean_text(locator.nth(index).inner_text(timeout=1000))
                if text and len(text) > 3:
                    comments.append(text[:180])
                if len(comments) >= max_comments:
                    return comments
        except Exception:
            continue
    return comments


def summarize_comments(comments: list[str]) -> str:
    if not comments:
        return ""
    signals: list[str] = []
    empathy = collect_empathy_phrases(comments)
    patterns = collect_action_patterns(comments)
    if empathy:
        signals.append("可見留言有安慰或共感語氣")
    if patterns:
        signals.append(f"可見留言建議偏向：{'、'.join(patterns)}")
    if not signals:
        signals.append("可見留言存在，但沒有明顯集中訊號")
    return "；".join(signals)


def collect_empathy_phrases(comments: list[str]) -> list[str]:
    found: list[str] = []
    for comment in comments:
        for term in EMPATHY_TERMS:
            if term in comment and term not in found:
                found.append(term)
    return found[:5]


def collect_action_patterns(comments: list[str]) -> list[str]:
    found: list[str] = []
    for label, keywords in ACTION_PATTERN_TERMS:
        if any(keyword in comment for comment in comments for keyword in keywords):
            found.append(label)
    return found[:5]


def infer_comment_disagreement(comments: list[str]) -> str:
    text = " ".join(comments)
    if any(term in text for term in ("不用問", "直接問", "別理他", "還是要聊")):
        return "可見留言可能存在不同處理路線"
    return ""


def infer_theme(text: str) -> str:
    for theme, keywords in THEME_RULES:
        if any(keyword in text for keyword in keywords):
            return theme
    return "uncertain"


def infer_action_pressure(text: str) -> str:
    for label, keywords in ACTION_TERMS.items():
        if any(keyword in text for keyword in keywords):
            return label
    return "unknown"


def infer_social_signal(text: str) -> str:
    found = [term for term in SOCIAL_SIGNAL_TERMS if term in text]
    return "、".join(found[:3])


def infer_product_mapping(*, theme: str, action_pressure: str, social_signal: str) -> str:
    if theme == "已讀不回":
        return "已讀不回分析 / 下一句怎麼回"
    if theme == "忽冷忽熱":
        return "曖昧溫度計 / 互動節奏分析"
    if theme == "回訊變慢但看限動" or social_signal:
        return "社群微訊號分析"
    if action_pressure in {"high", "medium"}:
        return "下一句怎麼回 / 追訊息時機建議"
    if theme == "備胎焦慮":
        return "紅旗風險 / 備胎焦慮辨識"
    return ""


def infer_landing_hook(*, theme: str, text: str) -> str:
    if theme == "已讀不回":
        return "他已讀不回，卻還在發限動？"
    if theme == "忽冷忽熱":
        return "他昨天很熱，今天突然冷掉，代表什麼？"
    if theme == "回訊變慢但看限動":
        return "他都在看你限動，卻不回你，到底還有沒有戲？"
    if "說忙" in text or "發文" in text:
        return "他說很忙，但一直有時間發文？"
    return ""


def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text or "")
    return text.strip()


if __name__ == "__main__":
    raise SystemExit(main())
