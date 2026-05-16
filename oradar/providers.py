"""Provider calls for Signal Extraction v1."""

from __future__ import annotations

import json
import urllib.error
import urllib.request

from .config import ALLOWED_PROVIDERS, Config


class ProviderError(RuntimeError):
    """Raised when a provider request cannot complete."""


def call_provider(config: Config, prompt: str, model_override: str | None = None) -> str:
    if config.provider not in ALLOWED_PROVIDERS:
        allowed = ", ".join(sorted(ALLOWED_PROVIDERS))
        raise ProviderError(f"Unsupported provider `{config.provider}`. Allowed: {allowed}")

    if config.provider == "anthropic":
        if not config.anthropic_api_key:
            raise ProviderError("ANTHROPIC_API_KEY is not set. Add it to the environment or local .env file.")
        return call_anthropic_messages_api(
            api_key=config.anthropic_api_key,
            model=model_override or config.anthropic_model,
            prompt=prompt,
        )

    if not config.openai_api_key:
        raise ProviderError("OPENAI_API_KEY is not set. Add it to the environment or local .env file.")
    return call_openai_responses_api(
        api_key=config.openai_api_key,
        model=model_override or config.openai_model,
        prompt=prompt,
    )


def call_openai_responses_api(api_key: str, model: str, prompt: str) -> str:
    payload = {
        "model": model,
        "input": [
            {
                "role": "system",
                "content": (
                    "Return only one valid JSON object matching the provided schema. "
                    "Do not include markdown fences or commentary."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": 0,
    }
    request = urllib.request.Request(
        "https://api.openai.com/v1/responses",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    data = _read_json_response(request, "OpenAI")
    output_text = data.get("output_text")
    if isinstance(output_text, str) and output_text.strip():
        return output_text

    text_parts: list[str] = []
    for item in data.get("output", []):
        for content in item.get("content", []):
            if content.get("type") in {"output_text", "text"} and isinstance(content.get("text"), str):
                text_parts.append(content["text"])

    if not text_parts:
        raise ProviderError("OpenAI API response did not include output text.")
    return "\n".join(text_parts)


def call_anthropic_messages_api(api_key: str, model: str, prompt: str) -> str:
    payload = {
        "model": model,
        "max_tokens": 2048,
        "messages": [
            {
                "role": "user",
                "content": (
                    "Return only one valid JSON object matching the provided schema. "
                    "Do not include markdown fences or commentary.\n\n"
                    f"{prompt}"
                ),
            }
        ],
    }
    request = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    data = _read_json_response(request, "Anthropic")
    text_parts: list[str] = []
    for content in data.get("content", []):
        if content.get("type") == "text" and isinstance(content.get("text"), str):
            text_parts.append(content["text"])

    if not text_parts:
        raise ProviderError("Anthropic API response did not include text content.")
    return "\n".join(text_parts)


def _read_json_response(request: urllib.request.Request, provider_name: str) -> dict:
    try:
        with urllib.request.urlopen(request, timeout=90) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise ProviderError(f"{provider_name} API request failed with HTTP {exc.code}: {detail}") from exc
    except urllib.error.URLError as exc:
        raise ProviderError(f"{provider_name} API request failed: {exc.reason}") from exc

