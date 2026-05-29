import os
from dotenv import load_dotenv
load_dotenv()

PROVIDER = os.getenv("LLM_PROVIDER", "groq")

if PROVIDER == "groq":
    from groq import Groq
    _client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    MODEL = os.getenv("LLM_MODEL", "llama-3.1-8b-instant")
else:
    from openai import OpenAI
    _client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")

def chat(messages: list, temperature: float = 0.7, max_tokens: int = 400) -> str:
    """Unified chat call — works for both Groq and OpenAI."""
    response = _client.chat.completions.create(
        model=MODEL,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens
    )
    return response.choices[0].message.content.strip()