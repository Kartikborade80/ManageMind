"""AI Question Generator using Google Gemini API.
Falls back gracefully to empty list if GEMINI_API_KEY is not configured.
"""
import os, json, re
from typing import List, Dict

from dotenv import load_dotenv
load_dotenv()

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
        print("[AI Generator] Missing GEMINI_API_KEY")
        return []

    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        
        # Try models in order of preference/availability
        models_to_try = [
            "gemini-2.0-flash", 
            "gemini-1.5-flash",
            "gemini-2.5-flash"  # Experimental but worked in local test
        ]
        
        model = None
        last_error = ""
        for model_name in models_to_try:
            try:
                model = genai.GenerativeModel(model_name)
                # Test the model with a tiny prompt to ensure it exists and has quota
                model.generate_content("test", generation_config={"max_output_tokens": 1})
                print(f"[AI Generator] Using model: {model_name}")
                break
            except Exception as e:
                last_error = str(e)
                print(f"[AI Generator] Model {model_name} failed: {last_error[:100]}...")
                model = None
        
        if not model:
            print(f"[AI Generator] All models failed. Last error: {last_error}")
            return []

        prompt = f"""You are an expert teacher.
Generate exactly {count} multiple-choice questions for the following syllabus point or topic:
"{syllabus_point}"

Rules:
- Each question must have exactly 4 options labeled a, b, c, d
- Exactly one correct answer
- Include a short explanation (1-2 sentences)
- Questions must be exam-style, clear and unambiguous
- If the topic is technical, prioritize accurate terminology

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
