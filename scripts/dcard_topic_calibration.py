#!/usr/bin/env python3
"""Semi-automated Dcard topic calibration helper."""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from html import unescape
from pathlib import Path
from typing import Iterable
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


REPO_ROOT = Path(__file__).resolve().parents[1]
URLS_PATH = REPO_ROOT / "ai-collaboration" / "research" / "dcard_calibration" / "dcard_urls.txt"
OUTPUT_PATH = (
    REPO_ROOT
    / "ai-collaboration"
    / "research"
    / "dcard_calibration"
    / "dcard_topic_calibration_notes.jsonl"
)

EXAMPLE_FORMAT = "# Paste one public Dcard relationship-topic URL per line."
THEME_PATTERNS = (
    ("回訊變慢但看限動", ("看限動", "限動", "回訊變慢", "已讀", "回很慢")),
    ("已讀不回", ("已讀不回", "讀不回", "已讀", "不回訊息")),
    ("忽冷忽熱", ("忽冷忽熱", "一下熱一下冷", "忽熱忽冷", "時冷時熱")),
    ("只回限動不回訊息", ("只回限動", "回限動不回訊息")),
    ("說忙但社群活躍", ("說忙", "社群活躍", "一直發文", "還在上線")),
    ("朋友以上戀人未滿", ("朋友以上", "戀人未滿", "曖昧", "不像朋友")),
    ("前任突然聯絡", ("前任", "突然聯絡", "前男友", "前女友")),
    ("備胎焦慮", ("備胎", "只是選項", "只是消遣")),
    ("半夜才找你", ("半夜", "凌晨", "晚上才找")),
    ("只回表情符號", ("表情符號", "貼圖", "愛心")),
    ("約會後冷掉", ("約會後", "見面後", "冷掉")),
    ("突然不看限動", ("不看限動", "突然不看")),
    ("隱藏限動", ("隱藏限動", "不給他看限動")),
)
ACTION_PRESSURE_KEYWORDS = {
    "high": ("怎麼回", "要不要", "該不該", "要不要追", "要不要問", "現在"),
    "medium": ("不知道", "猶豫", "想試探", "想確認", "卡住"),
}
SOCIAL_SIGNAL_KEYWORDS = ("限動", "已讀", "按讚", "發文", "上線", "社群", "訊息", "回覆")


@dataclass
class FetchResult:
    title: str
    snippet: str
    posted_date: str
    fetch_status: str
    notes: str


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Semi-automated Dcard topic calibration helper.")
    parser.add_argument("--urls", type=Path, default=URLS_PATH)
    parser.add_argument("--output", type=Path, default=OUTPUT_PATH)
    parser.add_argument("--timeout", type=int, default=15)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    urls = load_urls(args.urls)
    args.output.parent.mkdir(parents=True, exist_ok=True)

    if not urls:
        args.output.write_text("", encoding="utf-8")
        print(f"No public Dcard URLs found in {args.urls}.")
        print("Add one URL per line and rerun the script.")
        print(f"Created empty output file at {args.output}.")
        return 0

    rows = []
    for url in urls:
        fetch_result = fetch_public_page(url=url, timeout=args.timeout)
        row = build_note(url=url, fetch_result=fetch_result)
        rows.append(row)

    with args.output.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")

    success_count = sum(1 for row in rows if row["fetch_status"] == "success")
    failed_count = sum(1 for row in rows if row["fetch_status"] == "failed")
    manual_count = sum(1 for row in rows if row["fetch_status"] == "manual_needed")

    print(f"Processed URLs: {len(rows)}")
    print(f"Success: {success_count}")
    print(f"Failed: {failed_count}")
    print(f"Manual needed: {manual_count}")
    print(f"Output: {args.output}")
    return 0


def load_urls(path: Path) -> list[str]:
    if not path.exists():
        raise FileNotFoundError(f"URL input file not found: {path}")

    urls: list[str] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        urls.append(stripped)
    return urls


def fetch_public_page(*, url: str, timeout: int) -> FetchResult:
    request = Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; OpportunityRadarCalibration/0.1)",
            "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
        },
    )

    try:
        with urlopen(request, timeout=timeout) as response:
            charset = response.headers.get_content_charset() or "utf-8"
            html = response.read().decode(charset, errors="replace")
    except HTTPError as exc:
        return FetchResult(
            title="",
            snippet="",
            posted_date="",
            fetch_status="failed",
            notes=f"HTTP error while fetching public page: {exc.code}",
        )
    except URLError as exc:
        return FetchResult(
            title="",
            snippet="",
            posted_date="",
            fetch_status="failed",
            notes=f"URL error while fetching public page: {exc.reason}",
        )
    except Exception as exc:  # pragma: no cover - defensive catch for manual tool use
        return FetchResult(
            title="",
            snippet="",
            posted_date="",
            fetch_status="failed",
            notes=f"Unexpected fetch error: {exc}",
        )

    title = extract_title(html)
    snippet = extract_snippet(html)
    posted_date = extract_posted_date(html)
    fetch_status = "success" if title or snippet else "manual_needed"
    notes = (
        "Fetched public page metadata and a short cleaned snippet only."
        if fetch_status == "success"
        else "Page fetched, but useful public metadata was limited. Manual note entry recommended."
    )
    return FetchResult(
        title=title,
        snippet=snippet,
        posted_date=posted_date,
        fetch_status=fetch_status,
        notes=notes,
    )


def extract_title(html: str) -> str:
    patterns = (
        r'<meta[^>]+property=["\']og:title["\'][^>]+content=["\']([^"\']+)["\']',
        r"<title>(.*?)</title>",
    )
    for pattern in patterns:
        match = re.search(pattern, html, flags=re.IGNORECASE | re.DOTALL)
        if match:
            return clean_text(match.group(1))
    return ""


def extract_snippet(html: str) -> str:
    patterns = (
        r'<meta[^>]+property=["\']og:description["\'][^>]+content=["\']([^"\']+)["\']',
        r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)["\']',
    )
    for pattern in patterns:
        match = re.search(pattern, html, flags=re.IGNORECASE | re.DOTALL)
        if match:
            return trim_snippet(clean_text(match.group(1)))
    body_match = re.search(r"<body[^>]*>(.*?)</body>", html, flags=re.IGNORECASE | re.DOTALL)
    if not body_match:
        return ""
    body_text = clean_text(re.sub(r"<[^>]+>", " ", body_match.group(1)))
    return trim_snippet(body_text)


def extract_posted_date(html: str) -> str:
    patterns = (
        r'"datePublished"\s*:\s*"([^"]+)"',
        r'<meta[^>]+property=["\']article:published_time["\'][^>]+content=["\']([^"\']+)["\']',
    )
    for pattern in patterns:
        match = re.search(pattern, html, flags=re.IGNORECASE)
        if match:
            return clean_text(match.group(1))
    return ""


def build_note(*, url: str, fetch_result: FetchResult) -> dict[str, object]:
    combined_text = " ".join(part for part in (fetch_result.title, fetch_result.snippet) if part)
    theme = infer_theme(combined_text)
    action_pressure = infer_action_pressure(combined_text)
    social_signal = infer_social_signal(combined_text)
    product_mapping = infer_product_mapping(theme=theme, action_pressure=action_pressure, social_signal=social_signal)
    landing_hook = infer_landing_hook(theme=theme, social_signal=social_signal)

    return {
        "source": "dcard_manual",
        "url_or_ref": url,
        "title": fetch_result.title,
        "board": "relationship",
        "posted_date": fetch_result.posted_date,
        "theme": theme,
        "user_question": "",
        "emotional_trigger": "",
        "action_pressure": action_pressure,
        "social_signal": social_signal,
        "product_mapping": product_mapping,
        "landing_hook_candidate": landing_hook,
        "should_adjust_mvp": False,
        "notes": build_notes(fetch_result=fetch_result, theme=theme),
        "fetch_status": fetch_result.fetch_status,
    }


def infer_theme(text: str) -> str:
    normalized = text.replace("　", " ")
    for theme, keywords in THEME_PATTERNS:
        if any(keyword in normalized for keyword in keywords):
            return theme
    return ""


def infer_action_pressure(text: str) -> str:
    normalized = text.replace("　", " ")
    for label, keywords in ACTION_PRESSURE_KEYWORDS.items():
        if any(keyword in normalized for keyword in keywords):
            return label
    return ""


def infer_social_signal(text: str) -> str:
    found = [keyword for keyword in SOCIAL_SIGNAL_KEYWORDS if keyword in text]
    return "、".join(found[:3])


def infer_product_mapping(*, theme: str, action_pressure: str, social_signal: str) -> str:
    if theme in {"已讀不回", "忽冷忽熱", "回訊變慢但看限動"}:
        return "直接對應目前曖昧溫度計三大入口"
    if theme:
        return "可作為次級情境或未來第四情境候選"
    if action_pressure or social_signal:
        return "需要人工判讀是否映射到下一句怎麼回"
    return ""


def infer_landing_hook(*, theme: str, social_signal: str) -> str:
    if theme == "已讀不回":
        return "他是真的忙，還是其實在冷掉？"
    if theme == "忽冷忽熱":
        return "昨天很熱，今天變冷，這到底算什麼？"
    if theme == "回訊變慢但看限動":
        return "他都在看你限動，卻不回你，到底還有沒有戲？"
    if social_signal:
        return "社群有反應，訊息沒反應，這種微訊號代表什麼？"
    return ""


def build_notes(*, fetch_result: FetchResult, theme: str) -> str:
    segments: list[str] = [fetch_result.notes]
    if theme:
        segments.append(f"Auto-classified theme candidate: {theme}.")
    else:
        segments.append("Theme could not be classified confidently from public metadata alone.")
    segments.append("Stored summary fields only; full post text was not persisted.")
    return " ".join(segments)


def clean_text(text: str) -> str:
    text = unescape(text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def trim_snippet(text: str, limit: int = 240) -> str:
    text = clean_text(text)
    if len(text) <= limit:
        return text
    return text[: limit - 1].rstrip() + "…"


if __name__ == "__main__":
    raise SystemExit(main())
