"""Schemas and typed records for topic ingestion."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class GenericRecord:
    id: str
    source: str
    title: str
    content: str
    url: str | None
    published_at: str | None
    likes: int
    comments: int
    shares: int
    tags: list[str]


@dataclass(frozen=True)
class TopicCandidate:
    topic_id: str
    source_ids: list[str]
    title: str
    summary: str
    signals: list[str]
    audience: str
    evidence_count: int
    score: float
    created_at: str


@dataclass(frozen=True)
class QuestionSeed:
    question_id: str
    topic_id: str
    question: str
    module_fit: str
    why_it_works: str
    tone: str
    created_at: str
