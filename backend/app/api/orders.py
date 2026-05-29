from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models import Order, OrderStatus, CartItem, Session as SessionModel, SessionStatus
from app.schemas import OrderCreate
import uuid, random, string

router = APIRouter()

# In-memory OTP store (demo only)
otp_store: dict = {}

@router.post("/otp/send")
def send_otp(phone: str):
    if __import__('os').getenv("OTP_MODE") == "mock":
        otp_store[phone] = "123456"
        return {"message": f"OTP sent to {phone} (mock: 123456)"}
    # Real SMS would go here (Twilio etc.)
    otp = ''.join(random.choices(string.digits, k=6))
    otp_store[phone] = otp
    return {"message": "OTP sent"}

@router.post("/otp/verify")
def verify_otp(phone: str, otp: str):
    stored = otp_store.get(phone)
    if stored and stored == otp:
        del otp_store[phone]
        return {"verified": True}
    return {"verified": False, "error": "Invalid OTP"}

@router.post("/{session_id}/place")
def place_order(session_id: str, body: OrderCreate, db: Session = Depends(get_db)):
    # Get cart items
    cart_items = db.query(CartItem)\
        .options(joinedload(CartItem.menu_item))\
        .filter(CartItem.session_id == session_id).all()

    if not cart_items:
        return {"error": "Cart is empty"}

    total = sum((i.menu_item.price if i.menu_item else 0) * i.quantity for i in cart_items)
    tax   = round(total * 0.05, 2)

    order = Order(
        id=str(uuid.uuid4()),
        session_id=session_id,
        customer_name=body.customer_name,
        customer_phone=body.customer_phone,
        status=OrderStatus.pending,
        total_amount=round(total, 2),
        tax_amount=tax
    )
    db.add(order)

    # Close the session
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if session:
        session.status = SessionStatus.ordered

    db.commit()
    return {
        "order_id": order.id,
        "status": "pending",
        "total": round(total + tax, 2),
        "estimated_wait": f"{random.randint(15, 30)} minutes",
        "items": [
            {"name": i.menu_item.name, "qty": i.quantity}
            for i in cart_items if i.menu_item
        ]
    }

@router.get("/{order_id}/status")
def get_order_status(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        return {"error": "Order not found"}
    return {
        "order_id": order.id,
        "status": order.status,
        "total": order.total_amount + order.tax_amount,
        "customer_name": order.customer_name
    }