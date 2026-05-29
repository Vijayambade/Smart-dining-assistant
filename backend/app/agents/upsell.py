from app.agents.llm_client import chat
from sqlalchemy.orm import Session
from app.models import MenuItem, CartItem
import json

def get_upsell_suggestion(session_id: str, db: Session) -> dict | None:
    cart_items = db.query(CartItem).filter(CartItem.session_id == session_id).all()
    if not cart_items:
        return None

    cart_names = []
    cart_total = 0
    has_beverage = False
    has_dessert = False

    for ci in cart_items:
        mi = db.query(MenuItem).filter(MenuItem.id == ci.menu_item_id).first()
        if mi:
            cart_names.append(mi.name)
            cart_total += mi.price * ci.quantity
            if "Beverages" in (mi.category or ""):
                has_beverage = True
            if mi.category == "Desserts":
                has_dessert = True

    trigger = None
    if not has_beverage and len(cart_items) >= 1:
        trigger = "no_beverage"
    elif cart_total >= 400 and not has_dessert:
        trigger = "high_value"
    elif len(cart_items) == 1:
        trigger = "first_item"

    if not trigger:
        return None

    if trigger == "no_beverage":
        upsell_item = db.query(MenuItem).filter(
            MenuItem.category.in_(["Beverages (Cold)", "Beverages (Hot)"]),
            MenuItem.available == True
        ).order_by(MenuItem.popular_score.desc()).first()
    else:
        upsell_item = db.query(MenuItem).filter(
            MenuItem.available == True,
            MenuItem.popular_score > 0.7,
            ~MenuItem.id.in_([ci.menu_item_id for ci in cart_items])
        ).order_by(MenuItem.popular_score.desc()).first()

    if not upsell_item:
        return None

    prompt = f"""You are Zara, a friendly restaurant assistant.
Customer has: {', '.join(cart_names)} (total ₹{cart_total:.0f})
Suggest adding: {upsell_item.name} (₹{upsell_item.price})

Write ONE short friendly upsell message (max 2 sentences). Not pushy.
Return ONLY valid JSON, no markdown:
{{"message": "...", "upsell_item": {{"itemId": "{upsell_item.id}", "name": "{upsell_item.name}", "price": {upsell_item.price}}}}}
"""
    text = chat([{"role": "user", "content": prompt}], temperature=0.7, max_tokens=150)
    text = text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    try:
        return json.loads(text)
    except Exception:
        return {"message": text, "upsell_item": None}