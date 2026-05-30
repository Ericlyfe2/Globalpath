"""Google Translate wrapper with Claude fallback."""

import os
from typing import Optional

import httpx


async def translate_text(
    text: str, target_lang: str, source_lang: Optional[str] = None
) -> dict:
    api_key = os.getenv("GOOGLE_TRANSLATE_API_KEY")

    if api_key:
        return await _google_translate(text, target_lang, source_lang, api_key)

    return await _claude_translate(text, target_lang, source_lang)


async def _google_translate(
    text: str, target: str, source: Optional[str], api_key: str
) -> dict:
    params = {"q": text, "target": target, "key": api_key, "format": "text"}
    if source:
        params["source"] = source

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://translation.googleapis.com/language/translate/v2",
            params=params,
            timeout=10.0,
        )
        data = resp.json()
        if "data" not in data:
            return {"error": data.get("error", {}).get("message", "Translation failed")}
        translation = data["data"]["translations"][0]
        return {
            "translated": translation["translatedText"],
            "source_lang": translation.get("detectedSourceLanguage", source),
            "target_lang": target,
            "provider": "google",
        }


async def _claude_translate(
    text: str, target: str, source: Optional[str]
) -> dict:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return {
            "translated": text,
            "source_lang": source or "unknown",
            "target_lang": target,
            "provider": "passthrough",
            "warning": "No translation provider configured.",
        }

    from anthropic import AsyncAnthropic

    client = AsyncAnthropic(api_key=api_key)
    prompt = (
        f"Translate the following text to {target}. "
        f"Output only the translation, nothing else.\n\n{text}"
    )
    resp = await client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    translated = "".join(b.text for b in resp.content if b.type == "text").strip()
    return {
        "translated": translated,
        "source_lang": source or "auto",
        "target_lang": target,
        "provider": "claude",
    }
