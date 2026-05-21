"""Risk heuristics for sensitive or brand-unsafe relationship discourse."""

from __future__ import annotations

from .normalizers import clean_inline_text


RISK_KEYWORDS: dict[str, tuple[str, ...]] = {
    "gender_polarized": ("台女", "台男", "母豬", "仇女", "仇男", "男女都", "女生都", "男生都"),
    "body_shaming": ("醜", "普男", "肥宅", "肥", "顏值", "外貌殘酷", "矮", "禿"),
    "adult_service_reference": ("茶", "半套", "全套", "援交", "約砲", "外送茶"),
    "appearance_discrimination": ("看臉", "長相", "顏值", "外表條件", "外貌"),
    "high_toxicity": ("垃圾", "魯蛇", "沒救", "淘汰", "噁", "婊", "仇", "市場價值"),
    "sensitive_health_or_family": ("憂鬱", "精神病", "家暴", "原生家庭", "生病"),
    "money_status_anxiety": ("薪水", "收入", "存款", "房", "車", "工程師", "年薪", "條件"),
    "scam_or_fraud_reference": ("詐騙", "騙", "假帳號", "機器人", "AI 女友", "投資群"),
}


def infer_risk_flags(*texts: str) -> list[str]:
    haystack = " ".join(clean_inline_text(text).lower() for text in texts if text).lower()
    flags = [flag for flag, keywords in RISK_KEYWORDS.items() if any(keyword.lower() in haystack for keyword in keywords)]
    return sorted(set(flags))
