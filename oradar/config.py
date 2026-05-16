"""Configuration helpers for local CLI execution."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


DEFAULT_PROVIDER = "openai"
DEFAULT_OPENAI_MODEL = "gpt-4.1-mini"
DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-20250514"
ALLOWED_PROVIDERS = {"openai", "anthropic"}


@dataclass(frozen=True)
class Config:
    repo_root: Path
    provider: str
    openai_api_key: str | None
    openai_model: str
    anthropic_api_key: str | None
    anthropic_model: str
    prompt_path: Path
    schema_path: Path
    structured_output_dir: Path


def find_repo_root(start: Path | None = None) -> Path:
    current = (start or Path.cwd()).resolve()
    for path in (current, *current.parents):
        if (path / "schemas" / "signal_schema_v1.json").exists():
            return path
    return Path.cwd().resolve()


def load_dotenv(env_path: Path) -> None:
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def load_config() -> Config:
    repo_root = find_repo_root()
    load_dotenv(repo_root / ".env")
    provider = os.getenv("ORADAR_PROVIDER", DEFAULT_PROVIDER).strip().lower()

    return Config(
        repo_root=repo_root,
        provider=provider,
        openai_api_key=os.getenv("OPENAI_API_KEY") or None,
        openai_model=os.getenv("OPENAI_MODEL", DEFAULT_OPENAI_MODEL),
        anthropic_api_key=os.getenv("ANTHROPIC_API_KEY") or None,
        anthropic_model=os.getenv("ANTHROPIC_MODEL", DEFAULT_ANTHROPIC_MODEL),
        prompt_path=repo_root / "prompts" / "extraction_prompt_v1.md",
        schema_path=repo_root / "schemas" / "signal_schema_v1.json",
        structured_output_dir=repo_root / "outputs" / "structured",
    )
