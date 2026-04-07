from pydantic import BaseModel
from typing import Optional


class TranscribeResponse(BaseModel):
    text: str
    language: str


class ChatMessage(BaseModel):
    role: str   # "user" | "assistant"
    content: str


class QueryRequest(BaseModel):
    query: str
    chat_history: Optional[list[ChatMessage]] = []
    synthesize: bool = True   # whether to also return TTS audio


class QueryResponse(BaseModel):
    answer: str
    sources: list[dict]
    query: str
    audio_url: Optional[str] = None   # presigned-style path for TTS wav


class HealthResponse(BaseModel):
    status: str
    version: str = "1.0.0"
