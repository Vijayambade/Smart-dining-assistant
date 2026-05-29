# Simple in-memory session store (Redis-ready interface)
# Keys: session_id → { preferences, conversation_history }

_store: dict = {}

def get_session_memory(session_id: str) -> dict:
    if session_id not in _store:
        _store[session_id] = {
            "preferences": {},
            "history": []   # list of {"role": "user"|"assistant", "content": "..."}
        }
    return _store[session_id]

def update_preferences(session_id: str, new_prefs: dict):
    mem = get_session_memory(session_id)
    for k, v in new_prefs.items():
        if v is not None:
            mem["preferences"][k] = v

def add_to_history(session_id: str, role: str, content: str):
    mem = get_session_memory(session_id)
    mem["history"].append({"role": role, "content": content})
    # Keep last 10 exchanges only
    if len(mem["history"]) > 20:
        mem["history"] = mem["history"][-20:]

def get_history(session_id: str) -> list:
    return get_session_memory(session_id)["history"]

def get_preferences(session_id: str) -> dict:
    return get_session_memory(session_id)["preferences"]