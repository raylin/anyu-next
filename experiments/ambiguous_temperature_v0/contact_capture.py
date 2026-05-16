"""Contact capture helpers for the 曖昧溫度計 prototype."""

from __future__ import annotations


class ContactSubmissionError(ValueError):
    """Raised when a contact submission is invalid for v0."""


def normalize_contact_type(value: str) -> str:
    candidate = value.strip().lower()
    if candidate not in {"line", "email"}:
        raise ContactSubmissionError("Contact type must be `line` or `email`.")
    return candidate


def normalize_contact_value(value: str) -> str:
    candidate = value.strip()
    if not candidate:
        raise ContactSubmissionError("Contact value is required.")
    return candidate


def build_contact_record(
    *,
    timestamp: str,
    session_id: str,
    contact_type: str,
    contact_value: str,
    situation_type: str,
    state_label: str,
    temperature_score: int,
) -> dict[str, object]:
    return {
        "timestamp": timestamp,
        "session_id": session_id.strip(),
        "contact_type": normalize_contact_type(contact_type),
        "contact_value": normalize_contact_value(contact_value),
        "situation_type": situation_type.strip(),
        "state_label": state_label.strip(),
        "temperature_score": int(temperature_score),
    }
