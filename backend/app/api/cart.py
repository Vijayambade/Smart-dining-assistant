from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models import CartItem, MenuItem, Session as SessionModel
from app.schemas import AddCartItem
import uuid

router = APIRouter()

@router.get("/{session_id}")
def get_cart(session_id: str, db: Session = Depends(get_db)):
    items = db.query(CartItem)\
        .options(joinedload(CartItem.menu_item))\
        .filter(CartItem.session_id == session_id).all()
    return {
        "items": [format_cart_item(i) for i in items],
        "total": calculate_total(items),
        "tax": round(calculate_total(items) * 0.05, 2)
    }

@router.post("/{session_id}")
def add_to_cart(session_id: str, body: AddCartItem, db: Session = Depends(get_db)):
    # Check if item already in cart
    existing = db.query(CartItem).filter(
        CartItem.session_id == session_id,
        CartItem.menu_item_id == body.item_id
    ).first()

    if existing:
        existing.quantity += body.quantity
        db.commit()
        db.refresh(existing)
        return {"message": "Quantity updated", "item_id": existing.id}

    item = db.query(MenuItem).filter(MenuItem.id == body.item_id).first()
    if not item:
        return {"error": "Menu item not found"}

    cart_item = CartItem(
        id=str(uuid.uuid4()),
        session_id=session_id,
        menu_item_id=body.item_id,
        quantity=body.quantity,
        special_instructions=body.special_instructions,
        added_by=body.added_by
    )
    db.add(cart_item)
    db.commit()
    return {"message": "Added to cart", "item_id": cart_item.id}

@router.patch("/{session_id}/{cart_item_id}")
def update_cart_item(
    session_id: str,
    cart_item_id: str,
    quantity: int,
    db: Session = Depends(get_db)
):
    item = db.query(CartItem).filter(
        CartItem.id == cart_item_id,
        CartItem.session_id == session_id
    ).first()
    if not item:
        return {"error": "Cart item not found"}
    if quantity <= 0:
        db.delete(item)
    else:
        item.quantity = quantity
    db.commit()
    return {"message": "Cart updated"}

@router.delete("/{session_id}/{cart_item_id}")
def remove_from_cart(session_id: str, cart_item_id: str, db: Session = Depends(get_db)):
    item = db.query(CartItem).filter(
        CartItem.id == cart_item_id,
        CartItem.session_id == session_id
    ).first()
    if not item:
        return {"error": "Not found"}
    db.delete(item)
    db.commit()
    return {"message": "Removed from cart"}

def format_cart_item(i: CartItem) -> dict:
    mi = i.menu_item
    return {
        "id": i.id,
        "menu_item_id": i.menu_item_id,
        "quantity": i.quantity,
        "special_instructions": i.special_instructions,
        "added_by": i.added_by,
        "name": mi.name if mi else "",
        "price": mi.price if mi else 0,
        "subtotal": round((mi.price if mi else 0) * i.quantity, 2)
    }

def calculate_total(items) -> float:
    return round(sum((i.menu_item.price if i.menu_item else 0) * i.quantity for i in items), 2)