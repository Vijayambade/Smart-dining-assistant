from app.agents.llm_client import chat
from sqlalchemy.orm import Session
from app.models import MenuItem
import json

def get_recommendations(
    user_message: str,
    parsed_intent: dict,
    preferences: dict,
    cart_item_ids: list,
    db: Session,
    language: str = "english"
) -> dict:
    all_items = db.query(MenuItem).filter(MenuItem.available == True).all()

    # Exclude allergens
    exclude_allergens = preferences.get("allergens_exclude", [])
    if exclude_allergens:
        all_items = [i for i in all_items if not any(
            a in (i.allergens or []) for a in exclude_allergens
        )]

    # Exclude cart items
    all_items = [i for i in all_items if i.id not in cart_item_ids]

    # Sort by popularity, take top 15
    all_items.sort(key=lambda x: x.popular_score or 0, reverse=True)
    menu_summary = [
        {
            "id": i.id,
            "name": i.name,
            "category": i.category,
            "price": i.price,
            "description": i.description,
            "tags": i.tags or []
        }
        for i in all_items[:15]
    ]

    prefs_text = json.dumps(preferences) if preferences else "none specified"
    menu_text = json.dumps(menu_summary, indent=2)

    prompt = f"""You are Zara, a warm and witty dining assistant at a restaurant.
Suggest menu items based on the user's message and preferences.

User preferences: {prefs_text}
User message: "{user_message}"
Language detected: {language}

Available menu items:
{menu_text}

Rules:
- Suggest AT MOST 3 items from the list above
- Each must have: itemId, name, price, reason (one short sentence)
- Never invent items not in the list
- Opening message: 1-2 sentences max, warm and witty
- Respond in the SAME language mix the user used

Return ONLY valid JSON, no markdown, no explanation:
{{"message": "...", "suggestions": [{{"itemId": "...", "name": "...", "price": 0, "reason": "..."}}]}}
"""
    text = chat([{"role": "user", "content": prompt}], temperature=0.7, max_tokens=400)
    text = text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    try:
        return json.loads(text)
    except Exception:
        return {"message": text, "suggestions": []}