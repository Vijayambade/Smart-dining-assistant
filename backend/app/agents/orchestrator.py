from sqlalchemy.orm import Session as DBSession
from app.agents.multilingual import normalise_input
from app.agents.recommendation import get_recommendations
from app.agents.upsell import get_upsell_suggestion
from app.agents import memory
from app.models import CartItem

def handle_message(
    user_message: str,
    session_id: str,
    table_id: str,
    db: DBSession
) -> dict:
    """
    Main orchestrator: routes user message to the right agent(s).
    Returns a unified response dict.
    """

    # Step 1 — Multilingual normalisation
    parsed = normalise_input(user_message)
    intent = parsed.get("intent", "FALLBACK")
    preferences = parsed.get("preferences", {})
    language = parsed.get("language", "english")

    # Step 2 — Update session memory with new preferences
    memory.update_preferences(session_id, preferences)
    memory.add_to_history(session_id, "user", user_message)

    # Step 3 — Get current session preferences (accumulated)
    full_prefs = memory.get_preferences(session_id)

    # Step 4 — Get cart item IDs (to avoid re-suggesting)
    cart_items = db.query(CartItem).filter(CartItem.session_id == session_id).all()
    cart_item_ids = [ci.menu_item_id for ci in cart_items]

    response = {}

    # Step 5 — Route to agent
    if intent == "GREET":
        response = {
            "message": "Hey! I'm Zara 👋 What are you in the mood for today? I can suggest something spicy, light, filling — just tell me!",
            "suggestions": [],
            "intent": "GREET"
        }

    elif intent in ("RECOMMEND", "FALLBACK", "ADD_ITEM"):
        response = get_recommendations(
            user_message=user_message,
            parsed_intent=parsed,
            preferences=full_prefs,
            cart_item_ids=cart_item_ids,
            db=db,
            language=language
        )
        response["intent"] = intent

    elif intent == "CHECKOUT":
        response = {
            "message": "Ready to place your order? Hit the checkout button and I'll walk you through it! 🧾",
            "suggestions": [],
            "intent": "CHECKOUT"
        }

    else:
        response = get_recommendations(
            user_message=user_message,
            parsed_intent=parsed,
            preferences=full_prefs,
            cart_item_ids=cart_item_ids,
            db=db,
            language=language
        )
        response["intent"] = "FALLBACK"

    # Step 6 — Async upsell check (non-blocking, appended to response)
    upsell = get_upsell_suggestion(session_id, db)
    if upsell:
        response["upsell"] = upsell

    # Step 7 — Save assistant response to history
    memory.add_to_history(session_id, "assistant", response.get("message", ""))

    return response