from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import MenuItem
from typing import Optional, List

router = APIRouter()

@router.get("/")
def get_menu(db: Session = Depends(get_db)):
    items = db.query(MenuItem).filter(MenuItem.available == True).all()
    return [format_item(i) for i in items]

@router.get("/search")
def search_menu(
    q: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    tags: Optional[str] = Query(None),
    exclude_allergens: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(MenuItem).filter(MenuItem.available == True)

    if category:
        query = query.filter(MenuItem.category == category)

    items = query.all()

    # Text search
    if q:
        q_lower = q.lower()
        items = [i for i in items if
                 q_lower in i.name.lower() or
                 q_lower in (i.description or "").lower() or
                 q_lower in " ".join(i.tags or []).lower()]

    # Tag filter
    if tags:
        tag_list = [t.strip() for t in tags.split(",")]
        items = [i for i in items if any(t in (i.tags or []) for t in tag_list)]

    # Allergen exclusion
    if exclude_allergens:
        allergen_list = [a.strip() for a in exclude_allergens.split(",")]
        items = [i for i in items if not any(a in (i.allergens or []) for a in allergen_list)]

    return [format_item(i) for i in items]

@router.get("/popular")
def get_popular(time: Optional[str] = Query(None), db: Session = Depends(get_db)):
    items = db.query(MenuItem)\
        .filter(MenuItem.available == True)\
        .order_by(MenuItem.popular_score.desc())\
        .limit(5).all()
    return [format_item(i) for i in items]

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    items = db.query(MenuItem.category).distinct().all()
    return [i[0] for i in items if i[0]]

@router.get("/{item_id}")
def get_item(item_id: str, db: Session = Depends(get_db)):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        return {"error": "Item not found"}
    return format_item(item)

def format_item(i: MenuItem) -> dict:
    return {
        "id": i.id,
        "name": i.name,
        "category": i.category,
        "price": i.price,
        "description": i.description,
        "image_url": i.image_url or "",
        "tags": i.tags or [],
        "allergens": i.allergens or [],
        "available": i.available,
        "popular_score": i.popular_score or 0.0
    }