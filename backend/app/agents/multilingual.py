from app.agents.llm_client import chat
import json

def normalise_input(user_message: str) -> dict:
    prompt = f"""You are a multilingual intent parser for a restaurant ordering app.
Parse the user message and return ONLY valid JSON — no markdown, no explanation.

Output format:
{{
  "intent": "GREET|RECOMMEND|ADD_ITEM|UPSELL_CHECK|CHECKOUT|FALLBACK",
  "preferences": {{
    "spicy": true,
    "light": false,
    "veg": null,
    "sweet": null,
    "allergens_exclude": []
  }},
  "item_name": null,
  "language": "english|hinglish|telugu-english|mixed",
  "raw_text": "{user_message}"
}}

User message: "{user_message}"
"""
    text = chat([{"role": "user", "content": prompt}], temperature=0.1, max_tokens=200)
    # Strip markdown code fences if model adds them
    text = text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    try:
        return json.loads(text)
    except Exception:
        return {
            "intent": "FALLBACK",
            "preferences": {},
            "item_name": None,
            "language": "english",
            "raw_text": user_message
        }