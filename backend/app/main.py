from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.api import menu, cart, session, orders, ai   # ← add ai

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Dining Assistant API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://localhost:3000"],
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(menu.router,    prefix="/api/menu",    tags=["Menu"])
app.include_router(cart.router,    prefix="/api/cart",    tags=["Cart"])
app.include_router(session.router, prefix="/api/session", tags=["Session"])
app.include_router(orders.router,  prefix="/api/orders",  tags=["Orders"])
app.include_router(ai.router,      prefix="/api/ai",      tags=["AI"])  # ← add this

@app.get("/")
def root():
    return {"message": "Smart Dining Assistant API is running!"}