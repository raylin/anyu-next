"""Build human-readable trend review packs from deterministic module seeds."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone

from .schema import ModuleSeed, QuestionSeed, TopicCandidate


HEURISTIC_DISCLAIMER = "Scores are heuristic ranking scaffolding, not a truth metric."


@dataclass(frozen=True)
class RankedModuleSeed:
    rank: int
    module: ModuleSeed
    ranking_score: float
    recommended_action: str
    rationale: str


def build_trend_review_pack(
    modules: list[ModuleSeed],
    topics: list[TopicCandidate] | None = None,
    questions: list[QuestionSeed] | None = None,
    generated_at: str | None = None,
) -> str:
    generated_at = generated_at or datetime.now(timezone.utc).isoformat()
    topics_by_id = {topic.topic_id: topic for topic in (topics or [])}
    questions_by_id = {question.question_id: question for question in (questions or [])}
    ranked = rank_module_seeds(modules, topics_by_id, questions_by_id)

    summary_lines = [
        f"- candidates reviewed: {len(ranked)}",
        f"- build candidates: {sum(1 for item in ranked if item.recommended_action == 'build')}",
        f"- watch candidates: {sum(1 for item in ranked if item.recommended_action == 'watch')}",
        f"- defer candidates: {sum(1 for item in ranked if item.recommended_action == 'defer')}",
        f"- top confidence range: {ranked[0].module.confidence:.2f} max" if ranked else "- no module seeds provided",
        f"- source mix note: {_source_mix_note(ranked)}",
        f"- note: {HEURISTIC_DISCLAIMER}",
    ]

    lines: list[str] = [
        "# Topic Ingestion Trend Review Pack",
        "",
        f"Generated At: {generated_at}",
        "",
        "## 1. Summary",
        "",
        *summary_lines,
        "",
        "## 2. Top Module Seed Candidates",
        "",
    ]
    if ranked:
        for item in ranked[:3]:
            module = item.module
            lines.extend(
                [
                    f"### #{item.rank} {module.title}",
                    "",
                    f"- moduleId: `{module.module_id}`",
                    f"- topicId: `{module.topic_id}`",
                    f"- questionIds: {', '.join(f'`{question_id}`' for question_id in module.question_ids)}",
                    f"- format: `{module.format}`",
                    f"- audience: {module.audience}",
                    f"- emotionalHook: {module.emotional_hook}",
                    f"- userPromise: {module.user_promise}",
                    f"- monetizationFit: {module.monetization_fit}",
                    f"- sourceMix: {_source_mix_text(module.source_mix)}",
                    f"- riskFlags: {', '.join(module.risk_flags) if module.risk_flags else 'none'}",
                    f"- tone: {module.tone}",
                    f"- confidence: {module.confidence:.2f}",
                    f"- recommendedAction: `{item.recommended_action}`",
                    f"- rationale: {item.rationale}",
                    "",
                ]
            )
    else:
        lines.extend(["No module seeds available.", ""])

    lines.extend(
        [
            "## 3. Best Mini-Test Opportunities",
            "",
            *_mini_test_lines(ranked),
            "",
            "## 4. Relationship / Ambiguity Themes",
            "",
            *_theme_lines(ranked, topics_by_id),
            "",
            "## 5. Monetization Fit Notes",
            "",
            *_monetization_lines(ranked),
            "",
            "## 6. Risk / Sensitivity Notes",
            "",
            *_risk_lines(ranked, topics_by_id),
            "",
            "## 7. Recommended Human Review Questions",
            "",
            *_review_question_lines(ranked),
            "",
            "## 8. Candidate Table",
            "",
            "| Rank | Module ID | Title | Action | Confidence | Monetization Fit |",
            "| --- | --- | --- | --- | --- | --- |",
            *[
                f"| {item.rank} | `{item.module.module_id}` | {item.module.title} | `{item.recommended_action}` | {item.module.confidence:.2f} | {item.module.monetization_fit} |"
                for item in ranked
            ],
            "",
            "## 9. Deferred / Low-Fit Candidates",
            "",
            *_deferred_lines(ranked),
            "",
        ]
    )

    return "\n".join(lines)


def rank_module_seeds(
    modules: list[ModuleSeed],
    topics_by_id: dict[str, TopicCandidate] | None = None,
    questions_by_id: dict[str, QuestionSeed] | None = None,
) -> list[RankedModuleSeed]:
    topics_by_id = topics_by_id or {}
    questions_by_id = questions_by_id or {}
    scored: list[tuple[float, ModuleSeed, str]] = []
    for module in modules:
        topic = topics_by_id.get(module.topic_id)
        question_seeds = [questions_by_id[question_id] for question_id in module.question_ids if question_id in questions_by_id]
        score = _ranking_score(module, topic, question_seeds)
        rationale = _rationale(module, topic, question_seeds, score)
        scored.append((score, module, rationale))

    scored.sort(key=lambda item: (-item[0], -item[1].confidence, item[1].module_id))
    ranked: list[RankedModuleSeed] = []
    for index, (score, module, rationale) in enumerate(scored, start=1):
        ranked.append(
            RankedModuleSeed(
                rank=index,
                module=module,
                ranking_score=score,
                recommended_action=_recommended_action(module, score),
                rationale=rationale,
            )
        )
    return ranked


def _ranking_score(module: ModuleSeed, topic: TopicCandidate | None, questions: list[QuestionSeed]) -> float:
    topic_score = topic.score if topic else 0.42
    evidence_bonus = min((topic.evidence_count if topic else 1) * 0.03, 0.12)
    hook_bonus = 0.05 if module.emotional_hook.strip() else 0.0
    format_bonus = 0.05 if module.format == "mini-test" else 0.0
    monetization_bonus = 0.05 if "paid follow-up" in module.monetization_fit else 0.02
    relevance_bonus = 0.05 if any(question.module_fit == "ambiguous-temperature" for question in questions) else 0.0
    source_bonus = (topic.source_weight if topic else 0.5) * 0.08
    risk_penalty = min(len(module.risk_flags) * 0.04, 0.16)
    score = module.confidence * 0.6 + topic_score * 0.2 + evidence_bonus + hook_bonus + format_bonus + monetization_bonus + relevance_bonus + source_bonus - risk_penalty
    return round(min(0.99, max(0.2, score)), 2)


def _recommended_action(module: ModuleSeed, ranking_score: float) -> str:
    if "high_toxicity" in module.risk_flags or "adult_service_reference" in module.risk_flags:
        return "defer" if ranking_score < 0.7 else "watch"
    if "gender_polarized" in module.risk_flags or "body_shaming" in module.risk_flags:
        return "watch" if ranking_score >= 0.55 else "defer"
    if ranking_score >= 0.62 and module.format == "mini-test" and bool(module.emotional_hook.strip()):
        return "build"
    if ranking_score >= 0.48:
        return "watch"
    return "defer"


def _rationale(module: ModuleSeed, topic: TopicCandidate | None, questions: list[QuestionSeed], score: float) -> str:
    rationale_parts: list[str] = [f"heuristic score {score:.2f}"]
    if topic:
        rationale_parts.append(f"topic score {topic.score:.2f}")
        rationale_parts.append(f"evidence {topic.evidence_count}")
    if questions:
        rationale_parts.append("mini-test fit present")
        rationale_parts.extend(question.why_it_works for question in questions[:1])
    if topic:
        rationale_parts.append(f"source weight {topic.source_weight:.2f}")
    if module.risk_flags:
        rationale_parts.append(f"risk flags {', '.join(module.risk_flags)}")
    if module.emotional_hook.strip():
        rationale_parts.append("clear emotional hook")
    return "; ".join(rationale_parts)


def _mini_test_lines(ranked: list[RankedModuleSeed]) -> list[str]:
    opportunities = [item for item in ranked if item.module.format == "mini-test"][:5]
    if not opportunities:
        return ["No mini-test candidates detected."]
    return [
        f"- `{item.module.module_id}`: {item.module.title} ({item.recommended_action}, confidence {item.module.confidence:.2f})"
        for item in opportunities
    ]


def _theme_lines(ranked: list[RankedModuleSeed], topics_by_id: dict[str, TopicCandidate]) -> list[str]:
    seen: set[str] = set()
    lines: list[str] = []
    for item in ranked:
        topic = topics_by_id.get(item.module.topic_id)
        theme = topic.title if topic else item.module.topic_id
        if theme in seen:
            continue
        seen.add(theme)
        signals = " / ".join(topic.signals[:3]) if topic else "No topic signals provided"
        lines.append(f"- {theme}: {signals}")
    return lines or ["No clear theme summary available."]


def _monetization_lines(ranked: list[RankedModuleSeed]) -> list[str]:
    counts: dict[str, int] = {}
    for item in ranked:
        counts[item.module.monetization_fit] = counts.get(item.module.monetization_fit, 0) + 1
    if not counts:
        return ["No monetization notes available."]
    return [f"- {label}: {count} candidate(s)" for label, count in sorted(counts.items(), key=lambda item: (-item[1], item[0]))]


def _risk_lines(ranked: list[RankedModuleSeed], topics_by_id: dict[str, TopicCandidate]) -> list[str]:
    lines = [
        f"- {HEURISTIC_DISCLAIMER}",
        "- relationship uncertainty themes can invite over-interpretation, so final product claims still need human review.",
    ]
    if any((topics_by_id.get(item.module.topic_id) and topics_by_id[item.module.topic_id].title == "關係邊界") for item in ranked):
        lines.append("- boundary-related themes may require extra sensitivity review before being turned into lighter-weight tests.")
    if any("paid follow-up" in item.module.monetization_fit for item in ranked):
        lines.append("- monetization fit here only means packaging potential, not proof of willingness to pay.")
    flagged = [item for item in ranked if item.module.risk_flags]
    if flagged:
        lines.append("- flagged candidates:")
        lines.extend(
            [
                f"  - `{item.module.module_id}`: {', '.join(item.module.risk_flags)}"
                for item in flagged[:5]
            ]
        )
    return lines


def _review_question_lines(ranked: list[RankedModuleSeed]) -> list[str]:
    if not ranked:
        return ["- Which upstream inputs are missing before ranking can be trusted?"]
    top = ranked[0].module
    return [
        f"- Is `{top.module_id}` strong enough to prototype now, or should it stay in review?",
        "- Which candidate has the clearest emotional hook without overstating certainty?",
        "- Are the default inputNeeded and outputSections still right for the current topic mix?",
        "- Which watch candidate would become build-ready with just a little more evidence?",
    ]


def _deferred_lines(ranked: list[RankedModuleSeed]) -> list[str]:
    deferred = [item for item in ranked if item.recommended_action == "defer"]
    if not deferred:
        return ["No deferred candidates in this review run."]
    return [
        f"- `{item.module.module_id}`: {item.module.title} ({item.rationale})"
        for item in deferred
    ]


def _source_mix_note(ranked: list[RankedModuleSeed]) -> str:
    counts: dict[str, int] = {}
    for item in ranked:
        for source, count in item.module.source_mix.items():
            counts[source] = counts.get(source, 0) + count
    if not counts:
        return "no source metadata available"
    return ", ".join(f"{source}={count}" for source, count in sorted(counts.items(), key=lambda entry: (-entry[1], entry[0])))


def _source_mix_text(source_mix: dict[str, int]) -> str:
    if not source_mix:
        return "unknown"
    return ", ".join(f"{source}:{count}" for source, count in sorted(source_mix.items(), key=lambda entry: (-entry[1], entry[0])))
