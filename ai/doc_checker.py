"""Document validity checker.

Flags common rejection triggers: expiry, name mismatch, formatting, missing fields.
"""

import os
import re
from datetime import datetime

from anthropic import AsyncAnthropic


async def check_document(document_type: str, document_text: str) -> dict:
    issues = _heuristic_check(document_type, document_text)

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return {
            "valid": len(issues) == 0,
            "issues": issues,
            "ai_used": False,
        }

    client = AsyncAnthropic(api_key=api_key)
    resp = await client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=512,
        system=(
            "You are a document validation assistant for visa applications. "
            "Analyze the provided document text and identify issues that commonly cause rejection. "
            "Output bullet points only, no preamble."
        ),
        messages=[
            {
                "role": "user",
                "content": (
                    f"Document type: {document_type}\n\n"
                    f"Document content:\n{document_text[:4000]}\n\n"
                    f"List issues that could cause this document to be rejected."
                ),
            }
        ],
    )
    ai_text = "".join(b.text for b in resp.content if b.type == "text")
    ai_issues = [line.strip("- •*").strip() for line in ai_text.splitlines() if line.strip()]
    return {
        "valid": not issues and not ai_issues,
        "issues": issues + ai_issues,
        "ai_used": True,
    }


def _heuristic_check(doc_type: str, text: str) -> list[str]:
    issues: list[str] = []
    lower = text.lower()

    expiry = re.search(r"expir(?:y|ation|es)?\s*(?:date)?[:\s]+(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2})", lower)
    if expiry:
        date_str = expiry.group(1)
        if _is_expired(date_str):
            issues.append(f"Document expiry date ({date_str}) is in the past.")

    if doc_type.lower() == "passport":
        if not re.search(r"machine.readable", lower):
            pass
        valid_until = re.search(r"date of expir(?:y|ation)[:\s]+(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})", lower)
        if valid_until and _months_until(valid_until.group(1)) < 6:
            issues.append("Passport expires in less than 6 months — most countries require 6+ months validity.")

    if doc_type.lower() in ("bank_statement", "bank statement"):
        if not re.search(r"\$|usd|cad|gbp|eur|ngn|ghs|inr", lower):
            issues.append("No currency markers found — bank statement may be incomplete.")
        if not re.search(r"balance", lower):
            issues.append("No 'balance' field detected — confirm document includes account balance.")

    return issues


def _is_expired(date_str: str) -> bool:
    for fmt in ("%d/%m/%Y", "%m/%d/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d.%m.%Y"):
        try:
            return datetime.strptime(date_str, fmt) < datetime.now()
        except ValueError:
            continue
    return False


def _months_until(date_str: str) -> int:
    for fmt in ("%d/%m/%Y", "%m/%d/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d.%m.%Y"):
        try:
            d = datetime.strptime(date_str, fmt)
            delta = (d.year - datetime.now().year) * 12 + (d.month - datetime.now().month)
            return delta
        except ValueError:
            continue
    return 999
