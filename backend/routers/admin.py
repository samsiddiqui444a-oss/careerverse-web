"""Admin router — role-gated user management endpoints.

All routes require Authorization: Bearer <jwt> AND user.role == "admin".
Non-admin authenticated users receive 403.

Endpoints:
- GET    /admin/users               → paginated/searchable user list
- GET    /admin/users/{uid}         → detailed profile with activity
- PATCH  /admin/users/{uid}/ban     → toggle ban state
- DELETE /admin/users/{uid}         → soft delete
- GET    /admin/stats               → high-level platform stats
"""
import os
import logging
from datetime import datetime, timezone
from typing import Optional

import jwt
from fastapi import APIRouter, Depends, HTTPException, Header, Query
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)

JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret")
JWT_ALGO = "HS256"


class AdminUserRow(BaseModel):
    id: str
    name: str
    email: str
    role: str
    createdAt: str
    lastLoginAt: Optional[str] = None
    bannedAt: Optional[str] = None
    deletedAt: Optional[str] = None
    mentorSessionCount: int = 0


class AdminUserDetail(AdminUserRow):
    mentorMessageCount: int = 0
    recentSessions: list[dict] = []


class BanIn(BaseModel):
    banned: bool


def _strip(doc):
    if not doc:
        return doc
    doc.pop("_id", None)
    doc.pop("password_hash", None)
    return doc


def _decode_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        return payload["sub"]
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid or expired token")


def build_admin_router(db: AsyncIOMotorDatabase) -> APIRouter:
    router = APIRouter()

    async def require_admin(authorization: str = Header(default="")) -> dict:
        if not authorization.startswith("Bearer "):
            raise HTTPException(401, "Missing bearer token")
        uid = _decode_token(authorization[7:])
        user = await db.users.find_one({"id": uid})
        if not user:
            raise HTTPException(401, "User not found")
        if user.get("deletedAt"):
            raise HTTPException(401, "Account no longer exists")
        if (user.get("role") or "user") != "admin":
            raise HTTPException(403, "Admin access required")
        return _strip(user)

    async def _to_row(u: dict) -> dict:
        u = _strip(dict(u))
        count = await db.mentor_sessions.count_documents({"user_id": u["id"]})
        return AdminUserRow(
            id=u["id"], name=u["name"], email=u["email"],
            role=u.get("role") or "user",
            createdAt=u["createdAt"],
            lastLoginAt=u.get("lastLoginAt"),
            bannedAt=u.get("bannedAt"),
            deletedAt=u.get("deletedAt"),
            mentorSessionCount=count,
        ).model_dump()

    @router.get("/admin/users")
    async def list_users(
        admin: dict = Depends(require_admin),
        q: Optional[str] = Query(default=None, max_length=120),
        include_deleted: bool = Query(default=False),
        limit: int = Query(default=100, ge=1, le=500),
    ):
        query: dict = {}
        if not include_deleted:
            query["deletedAt"] = None
        if q:
            safe = q.strip()
            # case-insensitive contains match on name/email
            query["$or"] = [
                {"name": {"$regex": safe, "$options": "i"}},
                {"email": {"$regex": safe, "$options": "i"}},
            ]
        rows = await db.users.find(query).sort("createdAt", -1).to_list(limit)
        out = [await _to_row(r) for r in rows]
        return {"users": out, "total": len(out)}

    @router.get("/admin/users/{uid}")
    async def get_user(uid: str, admin: dict = Depends(require_admin)):
        u = await db.users.find_one({"id": uid})
        if not u:
            raise HTTPException(404, "User not found")
        base = await _to_row(u)
        sessions = await db.mentor_sessions.find(
            {"user_id": uid}
        ).sort("updatedAt", -1).to_list(10)
        sessions = [_strip(s) for s in sessions]
        for s in sessions:
            s["messageCount"] = await db.mentor_messages.count_documents(
                {"session_id": s["id"]}
            )
        msg_count = await db.mentor_messages.count_documents({"user_id": uid})
        return AdminUserDetail(
            **base,
            mentorMessageCount=msg_count,
            recentSessions=sessions,
        ).model_dump()

    @router.patch("/admin/users/{uid}/ban")
    async def toggle_ban(uid: str, body: BanIn, admin: dict = Depends(require_admin)):
        u = await db.users.find_one({"id": uid})
        if not u:
            raise HTTPException(404, "User not found")
        if u["id"] == admin["id"]:
            raise HTTPException(400, "Admins cannot ban themselves")
        if (u.get("role") or "user") == "admin":
            raise HTTPException(400, "Cannot ban another admin")
        now_iso = datetime.now(timezone.utc).isoformat() if body.banned else None
        await db.users.update_one({"id": uid}, {"$set": {"bannedAt": now_iso}})
        u["bannedAt"] = now_iso
        return await _to_row(u)

    @router.delete("/admin/users/{uid}")
    async def soft_delete(uid: str, admin: dict = Depends(require_admin)):
        u = await db.users.find_one({"id": uid})
        if not u:
            raise HTTPException(404, "User not found")
        if u["id"] == admin["id"]:
            raise HTTPException(400, "Admins cannot delete themselves")
        if (u.get("role") or "user") == "admin":
            raise HTTPException(400, "Cannot delete another admin")
        if u.get("deletedAt"):
            return await _to_row(u)
        now_iso = datetime.now(timezone.utc).isoformat()
        await db.users.update_one({"id": uid}, {"$set": {"deletedAt": now_iso}})
        u["deletedAt"] = now_iso
        return await _to_row(u)

    @router.get("/admin/stats")
    async def stats(admin: dict = Depends(require_admin)):
        total = await db.users.count_documents({"deletedAt": None})
        deleted = await db.users.count_documents({"deletedAt": {"$ne": None}})
        banned = await db.users.count_documents({
            "deletedAt": None, "bannedAt": {"$ne": None}
        })
        admins = await db.users.count_documents({
            "deletedAt": None, "role": "admin"
        })
        mentor_sessions = await db.mentor_sessions.count_documents({})
        mentor_messages = await db.mentor_messages.count_documents({})
        return {
            "totalUsers": total,
            "deletedUsers": deleted,
            "bannedUsers": banned,
            "adminCount": admins,
            "mentorSessions": mentor_sessions,
            "mentorMessages": mentor_messages,
        }

    return router
