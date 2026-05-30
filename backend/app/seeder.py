from sqlalchemy.orm import Session
from app.models import MenuItem
import uuid
import random

MENU = [
  {"name":"Paneer Tikka","category":"Veg Starters","price":220,"description":"Smoky grilled cottage cheese with mint chutney","tags":["veg","spicy","bestseller"],"allergens":["dairy"]},
  {"name":"Chilli Chicken Bites","category":"Non-Veg Starters","price":220,"description":"Crispy Indo-Chinese bites, bold and fiery","tags":["non-veg","spicy","popular"],"allergens":[]},
  {"name":"Prawn Pepper Fry","category":"Non-Veg Starters","price":280,"description":"South-style prawns tossed in cracked pepper","tags":["non-veg","spicy","chef_special"],"allergens":["shellfish"]},
  {"name":"Tandoori Fish Tikka","category":"Non-Veg Starters","price":260,"description":"Light marinade, smoky oven finish","tags":["non-veg","light","chef_special"],"allergens":["fish"]},
  {"name":"Veg Spring Rolls","category":"Veg Starters","price":160,"description":"Crispy rolls with a crunchy veggie filling","tags":["veg","light","quick_serve"],"allergens":["gluten"]},
  {"name":"Butter Chicken","category":"Mains (Non-Veg)","price":340,"description":"Creamy tomato gravy, the crowd favourite","tags":["non-veg","bestseller","filling"],"allergens":["dairy"]},
  {"name":"Paneer Butter Masala","category":"Mains (Veg)","price":280,"description":"Rich, velvety paneer in a buttery sauce","tags":["veg","filling","bestseller"],"allergens":["dairy"]},
  {"name":"Dal Tadka","category":"Mains (Veg)","price":180,"description":"Comforting yellow lentils with a mustard tempering","tags":["veg","light","quick_serve"],"allergens":[]},
  {"name":"Chicken Biryani","category":"Mains (Non-Veg)","price":360,"description":"Slow-cooked fragrant rice with tender chicken","tags":["non-veg","filling","bestseller"],"allergens":["gluten"]},
  {"name":"Garlic Naan","category":"Breads & Rice","price":60,"description":"Fluffy naan brushed with garlic butter","tags":["veg","bestseller"],"allergens":["gluten","dairy"]},
  {"name":"Steamed Rice","category":"Breads & Rice","price":80,"description":"Plain basmati rice, perfectly cooked","tags":["veg","light"],"allergens":[]},
  {"name":"Gulab Jamun","category":"Desserts","price":120,"description":"Soft milk dumplings soaked in rose syrup","tags":["veg","sweet","bestseller"],"allergens":["dairy","gluten"]},
  {"name":"Mango Kulfi","category":"Desserts","price":140,"description":"Creamy frozen mango dessert on a stick","tags":["veg","sweet","chef_special"],"allergens":["dairy"]},
  {"name":"Masala Chai","category":"Beverages (Hot)","price":60,"description":"Spiced Indian tea brewed with ginger","tags":["veg","hot","popular"],"allergens":["dairy"]},
  {"name":"Cold Coffee","category":"Beverages (Cold)","price":120,"description":"Chilled blended coffee with ice cream","tags":["veg","cold","popular"],"allergens":["dairy"]},
  {"name":"Fresh Lime Soda","category":"Beverages (Cold)","price":80,"description":"Refreshing lime with soda, sweet or salted","tags":["veg","cold","light"],"allergens":[]},
  {"name":"Mint Chutney","category":"Veg Starters","price":40,"description":"Fresh house-made mint and coriander dip","tags":["veg","light"],"allergens":[]},
  {"name":"Masala Papad","category":"Veg Starters","price":60,"description":"Crispy lentil wafers with onion and tomato","tags":["veg","light","quick_serve"],"allergens":["gluten"]},
  {"name":"Combo Meal A","category":"Combos & Deals","price":499,"description":"Butter Chicken + Naan + Rice + Cold Drink","tags":["non-veg","filling","bestseller"],"allergens":["dairy","gluten"]},
  {"name":"Veg Feast Combo","category":"Combos & Deals","price":399,"description":"Paneer Tikka + Dal + Naan + Masala Chai","tags":["veg","filling","bestseller"],"allergens":["dairy","gluten"]},
]

def auto_seed_db(db: Session):
    try:
        count = db.query(MenuItem).count()
        if count == 0:
            print("Database menu_items is empty. Auto-seeding default items...")
            for item in MENU:
                db.add(MenuItem(
                    id=str(uuid.uuid4()),
                    name=item["name"],
                    category=item["category"],
                    price=item["price"],
                    description=item["description"],
                    image_url="",
                    tags=item["tags"],
                    allergens=item["allergens"],
                    available=True,
                    popular_score=round(random.uniform(0.4, 0.95), 2)
                ))
            db.commit()
            print(f"Auto-seeded {len(MENU)} menu items successfully!")
        else:
            print(f"Database already has {count} menu items. Skipping auto-seed.")
    except Exception as e:
        print(f"Failed to auto-seed database: {e}")
        db.rollback()
