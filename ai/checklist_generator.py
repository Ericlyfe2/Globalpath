"""Generate personalized visa document checklists.

Combines static baseline data with Claude refinement when API key available.
"""

import json
import os

from anthropic import AsyncAnthropic

BASELINE_CHECKLISTS: dict[str, list[dict]] = {
    "Canada-study_permit": [
        {"item": "Letter of Acceptance from a Designated Learning Institution (DLI)", "category": "Acceptance"},
        {"item": "Proof of funds: CAD 10,000+ for living expenses (per year)", "category": "Financial"},
        {"item": "Tuition payment receipt or proof of first-year tuition", "category": "Financial"},
        {"item": "Valid passport (6+ months validity beyond intended stay)", "category": "Identity"},
        {"item": "Two recent passport photos (35mm × 45mm)", "category": "Identity"},
        {"item": "Statement of Purpose / Letter of Intent", "category": "Personal"},
        {"item": "Academic transcripts and certificates", "category": "Academic"},
        {"item": "English/French proficiency test (IELTS, TOEFL, or equivalent)", "category": "Academic"},
        {"item": "Medical exam from IRCC-approved panel physician", "category": "Health"},
        {"item": "Biometrics enrollment at VAC (CAD 85 fee)", "category": "Application"},
        {"item": "Application fee: CAD 150", "category": "Fees"},
    ],
    "UK-student_visa": [
        {"item": "CAS (Confirmation of Acceptance for Studies) from licensed sponsor", "category": "Acceptance"},
        {"item": "Proof of funds: course fees + £1,334/month for London (£1,023 outside)", "category": "Financial"},
        {"item": "Valid passport", "category": "Identity"},
        {"item": "Tuberculosis test (for applicants from certain countries)", "category": "Health"},
        {"item": "ATAS certificate (for sensitive subjects)", "category": "Academic"},
        {"item": "English language test (IELTS UKVI / TOEFL / PTE)", "category": "Academic"},
        {"item": "Application fee: £490 (outside UK)", "category": "Fees"},
        {"item": "Immigration Health Surcharge: £776/year", "category": "Fees"},
        {"item": "Biometrics at VFS Global", "category": "Application"},
    ],
    "Germany-student_visa": [
        {"item": "University acceptance letter (Zulassungsbescheid)", "category": "Acceptance"},
        {"item": "Blocked account: €11,208/year (Sperrkonto)", "category": "Financial"},
        {"item": "Health insurance proof (statutory or equivalent)", "category": "Health"},
        {"item": "Valid passport (12+ months validity)", "category": "Identity"},
        {"item": "Two biometric photos", "category": "Identity"},
        {"item": "German or English proficiency proof (TestDaF, DSH, IELTS)", "category": "Academic"},
        {"item": "Apostilled academic certificates", "category": "Academic"},
        {"item": "Visa application form (signed)", "category": "Application"},
        {"item": "Application fee: €75", "category": "Fees"},
        {"item": "Appointment at German embassy/consulate", "category": "Application"},
    ],
    "USA-f1_visa": [
        {"item": "Form I-20 from SEVP-approved school", "category": "Acceptance"},
        {"item": "SEVIS I-901 fee receipt: $350", "category": "Fees"},
        {"item": "DS-160 confirmation page (online visa application)", "category": "Application"},
        {"item": "Visa application fee: $185", "category": "Fees"},
        {"item": "Valid passport", "category": "Identity"},
        {"item": "Recent passport photo (5cm × 5cm, white background)", "category": "Identity"},
        {"item": "Financial documents: bank statements, sponsor letter, scholarship proof", "category": "Financial"},
        {"item": "Academic transcripts and standardized test scores (SAT/GRE/GMAT/TOEFL)", "category": "Academic"},
        {"item": "Embassy interview appointment confirmation", "category": "Application"},
    ],
}


async def generate_checklist(
    origin_country: str, destination_country: str, visa_type: str
) -> list[dict]:
    key = f"{destination_country}-{visa_type.lower().replace(' ', '_')}"
    baseline = BASELINE_CHECKLISTS.get(key, [])

    if baseline and not os.getenv("ANTHROPIC_API_KEY"):
        return baseline

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return baseline or _generic_checklist(destination_country, visa_type)

    client = AsyncAnthropic(api_key=api_key)
    prompt = (
        f"Generate a complete document checklist for a citizen of {origin_country} "
        f"applying for a {visa_type} in {destination_country}. "
        f"Respond ONLY with valid JSON in this exact shape: "
        f'[{{"item": "...", "category": "..."}}]. '
        f"Categories: Acceptance, Financial, Identity, Health, Academic, Personal, Application, Fees. "
        f"Be specific with dollar amounts and document names where known."
    )

    if baseline:
        prompt += f"\n\nStarting from this baseline, refine and add any {origin_country}-specific items:\n{json.dumps(baseline, indent=2)}"

    resp = await client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    )

    text = "".join(b.text for b in resp.content if b.type == "text")
    try:
        start = text.index("[")
        end = text.rindex("]") + 1
        items = json.loads(text[start:end])
        return items
    except (ValueError, json.JSONDecodeError):
        return baseline or _generic_checklist(destination_country, visa_type)


def _generic_checklist(destination: str, visa_type: str) -> list[dict]:
    return [
        {"item": f"Acceptance letter from {destination} institution", "category": "Acceptance"},
        {"item": "Proof of financial support", "category": "Financial"},
        {"item": "Valid passport", "category": "Identity"},
        {"item": "Recent passport photos", "category": "Identity"},
        {"item": "Academic transcripts", "category": "Academic"},
        {"item": "Language proficiency proof", "category": "Academic"},
        {"item": f"{visa_type} application form", "category": "Application"},
        {"item": "Visa application fee", "category": "Fees"},
    ]
