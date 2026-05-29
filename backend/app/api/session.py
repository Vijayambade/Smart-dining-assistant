from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Session as SessionModel, SessionStatus
from app.schemas import SessionOut
from datetime import datetime, timedelta
import uuid

router = APIRouter()

@router.get("/{table_id}")
def get_or_create_session(table_id: str, db: Session = Depends(get_db)):
    # Look for existing active session
    session = db.query(SessionModel).filter(
        SessionModel.table_id == table_id,
        SessionModel.status == SessionStatus.active
    ).first()

    if not session:
        session = SessionModel(
            id=str(uuid.uuid4()),
            table_id=table_id,
            status=SessionStatus.active,
            preferences={},
            conversation_summary="",
            created_at=datetime.utcnow(),
            expires_at=datetime.utcnow() + timedelta(hours=4)
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    return {
        "id": session.id,
        "table_id": session.table_id,
        "status": session.status,
        "preferences": session.preferences or {}
    }

@router.patch("/{session_id}/preferences")
def update_preferences(session_id: str, preferences: dict, db: Session = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        return {"error": "Session not found"}
    existing = session.preferences or {}
    existing.update(preferences)
    session.preferences = existing
    db.commit()
    return {"preferences": session.preferences}