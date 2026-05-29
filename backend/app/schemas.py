from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

class MenuItemOut(BaseModel):
    id: str
    name: str
    category: str
    price: float
    description: str
    image_url: Optional[str] = ""
    tags: List[str] = []
    allergens: List[str] = []
    available: bool
    popular_score: float

    class Config:
        from_attributes = True

class SessionOut(BaseModel):
    id: str
    table_id: str
    status: str
    preferences: dict

    class Config:
        from_attributes = True

class CartItemOut(BaseModel):
    id: str
    menu_item_id: str
    quantity: int
    special_instructions: str
    added_by: str
    menu_item: Optional[MenuItemOut] = None

    class Config:
        from_attributes = True

class AddCartItem(BaseModel):
    item_id: str
    quantity: int = 1
    added_by: str = "guest"
    special_instructions: str = ""

class ChatMessage(BaseModel):
    message: str
    table_id: str
    session_id: str

class OrderCreate(BaseModel):
    customer_name: str
    customer_phone: str