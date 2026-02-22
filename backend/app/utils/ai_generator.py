"""AI Question Generator using Google Gemini API.
Falls back gracefully to empty list if GEMINI_API_KEY is not configured.
"""
import os, json, re
from typing import List, Dict

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()


def _clean_json(text: str) -> str:
    """Strip markdown code fences if present."""
    text = re.sub(r"```json\s*", "", text)
    text = re.sub(r"```\s*", "", text)
    return text.strip()


async def generate_mcqs(syllabus_point: str, count: int) -> List[Dict]:
    """
    Generate `count` MCQs for the given `syllabus_point` using Gemini.
    Returns a list of dicts: {question, options:[{id,text}], correct_option_id, explanation}
    Returns [] if API key is not set or call fails.
    """
    if not GEMINI_API_KEY:
        return []

    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = f"""You are an expert teacher for Diploma Business Studies (Unit 5: Supply Chain & HR Management).
Generate exactly {count} multiple-choice questions for the following syllabus point:
"{syllabus_point}"

Rules:
- Each question must have exactly 4 options labeled a, b, c, d
- Exactly one correct answer
- Include a short explanation (1-2 sentences)
- Questions must be exam-style, clear and unambiguous

Return ONLY a valid JSON array in this exact format, no other text:
[
  {{
    "question": "...",
    "options": [
      {{"id": "a", "text": "..."}},
      {{"id": "b", "text": "..."}},
      {{"id": "c", "text": "..."}},
      {{"id": "d", "text": "..."}}
    ],
    "correct_option_id": "a",
    "explanation": "..."
  }}
]"""

        response = model.generate_content(prompt)
        cleaned = _clean_json(response.text)
        data = json.loads(cleaned)
        return data[:count]  # Safety: cap at requested count

    except Exception as e:
        print(f"[AI Generator] Error generating questions: {e}")
        return []


def generate_mcqs_sync(syllabus_point: str, count: int) -> List[Dict]:
    """Synchronous wrapper for environments that don't support async."""
    import asyncio
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                future = pool.submit(asyncio.run, generate_mcqs(syllabus_point, count))
                return future.result(timeout=30)
        else:
            return loop.run_until_complete(generate_mcqs(syllabus_point, count))
    except Exception as e:
        print(f"[AI Generator] Sync wrapper error: {e}")
        return []
