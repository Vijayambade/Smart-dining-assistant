from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ChatMessage
from app.agents.orchestrator import handle_message
import json

router = APIRouter()

@router.post("/chat")
def ai_chat(body: ChatMessage, db: Session = Depends(get_db)):
    """Standard (non-streaming) AI chat endpoint."""
    result = handle_message(
        user_message=body.message,
        session_id=body.session_id,
        table_id=body.table_id,
        db=db
    )
    return result

@router.get("/stream")
def ai_stream(message: str, session_id: str, table_id: str, db: Session = Depends(get_db)):
    """SSE streaming endpoint — sends response token by token."""
    def event_stream():
        result = handle_message(
            user_message=message,
            session_id=session_id,
            table_id=table_id,
            db=db
        )
        # Send the full result as a single SSE event
        yield f"data: {json.dumps(result)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")