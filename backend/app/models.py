from sqlalchemy import Column, String, Float, Boolean, Integer, Text, JSON, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import uuid
import enum

def gen_uuid():
    return str(uuid.uuid4())

class MenuItem(Base):
    __tablename__ = "menu_items"

    id            = Column(String, primary_key=True, default=gen_uuid)
    name          = Column(String(120), nullable=False)
    category      = Column(String(50))
    price         = Column(Float)
    description   = Column(Text)
    image_url     = Column(Text)
    tags          = Column(JSON, default=[])
    allergens     = Column(JSON, default=[])
    available     = Column(Boolean, default=True)
    popular_score = Column(Float, default=0.0)

class SessionStatus(str, enum.Enum):
    active  = "active"
    ordered = "ordered"
    closed  = "closed"

class Session(Base):
    __tablename__ = "sessions"

    id                   = Column(String, primary_key=True, default=gen_uuid)
    table_id             = Column(String(20), nullable=False)
    status               = Column(Enum(SessionStatus), default=SessionStatus.active)
    preferences          = Column(JSON, default={})
    conversation_summary = Column(Text, default="")
    created_at           = Column(DateTime, default=datetime.utcnow)
    expires_at           = Column(DateTime)

    cart_items = relationship("CartItem", back_populates="session")
    orders     = relationship("Order", back_populates="session")

class CartItem(Base):
    __tablename__ = "cart_items"

    id                   = Column(String, primary_key=True, default=gen_uuid)
    session_id           = Column(String, ForeignKey("sessions.id"))
    menu_item_id         = Column(String, ForeignKey("menu_items.id"))
    quantity             = Column(Integer, default=1)
    special_instructions = Column(Text, default="")
    added_by             = Column(String(50), default="guest")
    created_at           = Column(DateTime, default=datetime.utcnow)

    session   = relationship("Session", back_populates="cart_items")
    menu_item = relationship("MenuItem")

class OrderStatus(str, enum.Enum):
    pending   = "pending"
    confirmed = "confirmed"
    preparing = "preparing"
    ready     = "ready"
    delivered = "delivered"

class Order(Base):
    __tablename__ = "orders"

    id              = Column(String, primary_key=True, default=gen_uuid)
    session_id      = Column(String, ForeignKey("sessions.id"))
    customer_name   = Column(String(100))
    customer_phone  = Column(String(15))
    status          = Column(Enum(OrderStatus), default=OrderStatus.pending)
    total_amount    = Column(Float, default=0.0)
    tax_amount      = Column(Float, default=0.0)
    created_at      = Column(DateTime, default=datetime.utcnow)

    session = relationship("Session", back_populates="orders")