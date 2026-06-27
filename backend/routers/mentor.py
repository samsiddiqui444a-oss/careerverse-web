"""AI Career Mentor — Claude Sonnet 4.6 via Emergent Universal LLM Key.

Endpoints (all auth-gated):
- POST   /mentor/sessions                 → create a new chat session
- GET    /mentor/sessions                 → list current user's sessions
- GET    /mentor/sessions/{sid}/messages  → fetch full message history
- DELETE /mentor/sessions/{sid}           → delete session + its messages
- POST   /mentor/sessions/{sid}/stream    → SSE: stream assistant reply for a new user message
"""
import os
import uuid
import json
import logging
from datetime import datetime, timezone
from typing import Optional

import jwt
from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorDatabase

from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

logger = logging.getLogger(__name__)

JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret")
JWT_ALGO = "HS256"
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

SYSTEM_PROMPT = (
    "You are 'Disha', the AI Career Mentor for CareerVerse — a friendly, "
    "knowledgeable career guide for Indian students from Class 8 through "
    "undergraduate college.\n\n"
    "Your mission: help the student make confident, well-informed decisions "
    "about streams, careers, exams, colleges, scholarships, and skills. "
    "Be encouraging, specific, and India-aware.\n\n"
    "Style:\n"
    "- Warm and supportive, never condescending.\n"
    "- Concise by default (3–6 short paragraphs or bullet points). Expand "
    "  only when the student asks for depth.\n"
    "- Use plain English; explain jargon (PCM, PCB, JEE, NEET, CUET, NMAT, "
    "  CAT, etc.) on first mention.\n"
    "- Surface concrete next steps the student can take this week.\n"
    "- When relevant, mention typical Indian salary bands (₹/year), "
    "  top entrance exams, and respected colleges/institutes.\n"
    "- If a question is outside career/education guidance, gently redirect.\n"
    "- Never invent statistics. Say 'I don't have that exact data' when unsure.\n"
    "- Always end with one clarifying question OR a suggested next action."
)


class CreateSessionIn(BaseModel):
    title: Optional[str] = None


class SessionOut(BaseModel):
    id: str
    title: str
    createdAt: str
    updatedAt: str
    messageCount: int = 0


class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    createdAt: str


class StreamIn(BaseModel):
    message: str = Field(min_length=1, max_length=4000)


def _strip(doc):
    if not doc:
        return doc
    doc.pop("_id", None)
    return doc


def _decode_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        return payload["sub"]
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid or expired token")


def build_mentor_router(db: AsyncIOMotorDatabase) -> APIRouter:
    router = APIRouter()

    async def current_user(authorization: str = Header(default="")) -> dict:
        if not authorization.startswith("Bearer "):
            raise HTTPException(401, "Missing bearer token")
        uid = _decode_token(authorization[7:])
        user = await db.users.find_one({"id": uid})
        if not user:
            raise HTTPException(401, "User not found")
        return _strip(user)

    async def _now() -> str:
        return datetime.now(timezone.utc).isoformat()

    async def _session_for(sid: str, user: dict) -> dict:
        s = await db.mentor_sessions.find_one({"id": sid, "user_id": user["id"]})
        if not s:
            raise HTTPException(404, "Session not found")
        return _strip(s)

    @router.post("/mentor/sessions", response_model=SessionOut)
    async def create_session(body: CreateSessionIn, user: dict = Depends(current_user)):
        now = await _now()
        session = {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "title": (body.title or "New conversation").strip()[:80] or "New conversation",
            "createdAt": now,
            "updatedAt": now,
        }
        await db.mentor_sessions.insert_one(session)
        return SessionOut(
            id=session["id"], title=session["title"],
            createdAt=now, updatedAt=now, messageCount=0,
        )

    @router.get("/mentor/sessions")
    async def list_sessions(user: dict = Depends(current_user)):
        rows = await db.mentor_sessions.find(
            {"user_id": user["id"]}
        ).sort("updatedAt", -1).to_list(100)
        out = []
        for r in rows:
            r = _strip(r)
            count = await db.mentor_messages.count_documents({"session_id": r["id"]})
            out.append(SessionOut(
                id=r["id"], title=r["title"],
                createdAt=r["createdAt"], updatedAt=r["updatedAt"],
                messageCount=count,
            ).model_dump())
        return out

    @router.get("/mentor/sessions/{sid}/messages")
    async def get_messages(sid: str, user: dict = Depends(current_user)):
        await _session_for(sid, user)
        rows = await db.mentor_messages.find(
            {"session_id": sid}
        ).sort("createdAt", 1).to_list(1000)
        return [
            MessageOut(
                id=_strip(r)["id"], role=r["role"],
                content=r["content"], createdAt=r["createdAt"],
            ).model_dump()
            for r in rows
        ]

    @router.delete("/mentor/sessions/{sid}")
    async def delete_session(sid: str, user: dict = Depends(current_user)):
        await _session_for(sid, user)
        await db.mentor_messages.delete_many({"session_id": sid})
        await db.mentor_sessions.delete_one({"id": sid, "user_id": user["id"]})
        return {"deleted": True, "id": sid}

    @router.post("/mentor/sessions/{sid}/stream")
    async def stream_reply(sid: str, body: StreamIn, user: dict = Depends(current_user)):
        if not EMERGENT_LLM_KEY:
            raise HTTPException(500, "EMERGENT_LLM_KEY not configured")
        session = await _session_for(sid, user)

        # Load prior history → initial_messages for LlmChat
        prior = await db.mentor_messages.find(
            {"session_id": sid}
        ).sort("createdAt", 1).to_list(1000)
        initial = [{"role": "system", "content": SYSTEM_PROMPT}]
        for m in prior:
            initial.append({"role": m["role"], "content": m["content"]})

        # Persist user message immediately
        now = await _now()
        user_msg = {
            "id": str(uuid.uuid4()),
            "session_id": sid,
            "user_id": user["id"],
            "role": "user",
            "content": body.message,
            "createdAt": now,
        }
        await db.mentor_messages.insert_one(user_msg)

        # Auto-title from first user message if still default
        if session["title"] == "New conversation":
            new_title = body.message.strip().split("\n")[0][:60]
            if new_title:
                await db.mentor_sessions.update_one(
                    {"id": sid}, {"$set": {"title": new_title, "updatedAt": now}}
                )
        else:
            await db.mentor_sessions.update_one(
                {"id": sid}, {"$set": {"updatedAt": now}}
            )

        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=sid,
            system_message=SYSTEM_PROMPT,
            initial_messages=initial,
        ).with_model("anthropic", "claude-sonnet-4-6")

        assistant_buf = {"text": ""}
        user_msg_id = user_msg["id"]

        async def event_gen():
            # First event: echo the persisted user message id (frontend can confirm)
            yield f"event: user_message\ndata: {json.dumps({'id': user_msg_id})}\n\n"
            try:
                async for ev in chat.stream_message(UserMessage(text=body.message)):
                    if isinstance(ev, TextDelta):
                        assistant_buf["text"] += ev.content
                        yield f"event: delta\ndata: {json.dumps({'content': ev.content})}\n\n"
                    elif isinstance(ev, StreamDone):
                        break
            except Exception as exc:
                logger.exception("mentor stream error")
                err_str = str(exc)
                if "Budget has been exceeded" in err_str or "Max budget" in err_str:
                    friendly = (
                        "Your Emergent LLM Key balance is exhausted. "
                        "Top it up at Profile → Universal Key → Add Balance, then try again."
                    )
                else:
                    friendly = err_str
                yield f"event: error\ndata: {json.dumps({'message': friendly})}\n\n"
                return

            # Persist assistant reply
            final_text = assistant_buf["text"] or "(no response)"
            done_at = datetime.now(timezone.utc).isoformat()
            assistant_msg = {
                "id": str(uuid.uuid4()),
                "session_id": sid,
                "user_id": user["id"],
                "role": "assistant",
                "content": final_text,
                "createdAt": done_at,
            }
            await db.mentor_messages.insert_one(assistant_msg)
            await db.mentor_sessions.update_one(
                {"id": sid}, {"$set": {"updatedAt": done_at}}
            )
            yield (
                "event: done\ndata: "
                + json.dumps({"id": assistant_msg["id"], "createdAt": done_at})
                + "\n\n"
            )

        return StreamingResponse(
            event_gen(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
                "Connection": "keep-alive",
            },
        )

    return router
