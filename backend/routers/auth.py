"""Authentication router — register, login, me, google exchange. JWT in Authorization Bearer header."""
import os
import re
import uuid
import bcrypt
import jwt
import logging
import httpx
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel, EmailStr, Field
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)

JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret")
JWT_ALGO = "HS256"
JWT_TTL_DAYS = 30
DEFAULT_ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@careerverse.io").lower()
DEFAULT_ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "Admin@1234")
DEFAULT_ADMIN_NAME = os.environ.get("ADMIN_NAME", "CareerVerse Admin")
EMERGENT_AUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"

router = APIRouter()


class RegisterIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=200)


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=200)


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str = "user"
    createdAt: str
    lastLoginAt: str | None = None


class AuthOut(BaseModel):
    token: str
    user: UserOut


def _strip(doc):
    if not doc:
        return doc
    doc.pop("_id", None)
    return doc


def _user_out(u: dict) -> UserOut:
    return UserOut(
        id=u["id"], name=u["name"], email=u["email"],
        role=u.get("role") or "user",
        createdAt=u["createdAt"],
        lastLoginAt=u.get("lastLoginAt"),
    )


def _make_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_TTL_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def _decode_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        return payload["sub"]
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid or expired token")


async def ensure_admin_seeded(db: AsyncIOMotorDatabase) -> None:
    """Idempotent: create the configured admin account on first boot, or
    upgrade the existing matching email to role=admin."""
    existing = await db.users.find_one({"email": DEFAULT_ADMIN_EMAIL})
    if existing:
        if existing.get("role") != "admin":
            await db.users.update_one(
                {"id": existing["id"]}, {"$set": {"role": "admin"}}
            )
            logger.info("Promoted %s to admin", DEFAULT_ADMIN_EMAIL)
        return
    now = datetime.now(timezone.utc).isoformat()
    pw_hash = bcrypt.hashpw(
        DEFAULT_ADMIN_PASSWORD.encode(), bcrypt.gensalt(rounds=12)
    ).decode()
    user = {
        "id": str(uuid.uuid4()),
        "name": DEFAULT_ADMIN_NAME,
        "email": DEFAULT_ADMIN_EMAIL,
        "password_hash": pw_hash,
        "role": "admin",
        "createdAt": now,
        "lastLoginAt": None,
        "bannedAt": None,
        "deletedAt": None,
    }
    await db.users.insert_one(user)
    logger.info("Seeded admin user %s", DEFAULT_ADMIN_EMAIL)


def build_auth_router(db: AsyncIOMotorDatabase) -> APIRouter:
    async def current_user(authorization: str = Header(default="")) -> dict:
        if not authorization.startswith("Bearer "):
            raise HTTPException(401, "Missing bearer token")
        uid = _decode_token(authorization[7:])
        user = await db.users.find_one({"id": uid})
        if not user:
            raise HTTPException(401, "User not found")
        if user.get("deletedAt"):
            raise HTTPException(401, "Account no longer exists")
        if user.get("bannedAt"):
            raise HTTPException(403, "Account has been suspended")
        return _strip(user)

    @router.post("/auth/register", response_model=AuthOut)
    async def register(body: RegisterIn):
        email = body.email.lower().strip()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
            raise HTTPException(400, "Invalid email")
        existing = await db.users.find_one({"email": email})
        if existing:
            raise HTTPException(409, "Email already registered")
        pw_hash = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt(rounds=12)).decode()
        now = datetime.now(timezone.utc).isoformat()
        user = {
            "id": str(uuid.uuid4()),
            "name": body.name.strip(),
            "email": email,
            "password_hash": pw_hash,
            "role": "user",
            "createdAt": now,
            "lastLoginAt": now,
            "bannedAt": None,
            "deletedAt": None,
        }
        await db.users.insert_one(user)
        return AuthOut(token=_make_token(user["id"]), user=_user_out(user))

    @router.post("/auth/login", response_model=AuthOut)
    async def login(body: LoginIn):
        email = body.email.lower().strip()
        user = await db.users.find_one({"email": email})
        if not user or not bcrypt.checkpw(body.password.encode(), user["password_hash"].encode()):
            raise HTTPException(401, "Invalid email or password")
        if user.get("deletedAt"):
            raise HTTPException(401, "Invalid email or password")
        if user.get("bannedAt"):
            raise HTTPException(403, "Your account has been suspended")
        now = datetime.now(timezone.utc).isoformat()
        await db.users.update_one({"id": user["id"]}, {"$set": {"lastLoginAt": now}})
        user["lastLoginAt"] = now
        if "role" not in user or not user["role"]:
            user["role"] = "user"
        return AuthOut(token=_make_token(user["id"]), user=_user_out(user))

    @router.get("/auth/me", response_model=UserOut)
    async def me(user: dict = Depends(current_user)):
        return _user_out(user)

    return router
