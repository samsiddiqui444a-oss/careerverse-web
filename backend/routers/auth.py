"""Authentication router — register, login, me. JWT in Authorization Bearer header."""
import os
import re
import uuid
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel, EmailStr, Field
from motor.motor_asyncio import AsyncIOMotorDatabase

JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret")
JWT_ALGO = "HS256"
JWT_TTL_DAYS = 30

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
    createdAt: str


class AuthOut(BaseModel):
    token: str
    user: UserOut


def _strip(doc):
    if not doc:
        return doc
    doc.pop("_id", None)
    return doc


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


def build_auth_router(db: AsyncIOMotorDatabase) -> APIRouter:
    async def current_user(authorization: str = Header(default="")) -> dict:
        if not authorization.startswith("Bearer "):
            raise HTTPException(401, "Missing bearer token")
        uid = _decode_token(authorization[7:])
        user = await db.users.find_one({"id": uid})
        if not user:
            raise HTTPException(401, "User not found")
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
            "createdAt": now,
        }
        await db.users.insert_one(user)
        return AuthOut(token=_make_token(user["id"]),
                       user=UserOut(id=user["id"], name=user["name"], email=user["email"], createdAt=now))

    @router.post("/auth/login", response_model=AuthOut)
    async def login(body: LoginIn):
        email = body.email.lower().strip()
        user = await db.users.find_one({"email": email})
        if not user or not bcrypt.checkpw(body.password.encode(), user["password_hash"].encode()):
            raise HTTPException(401, "Invalid email or password")
        return AuthOut(token=_make_token(user["id"]),
                       user=UserOut(id=user["id"], name=user["name"], email=user["email"], createdAt=user["createdAt"]))

    @router.get("/auth/me", response_model=UserOut)
    async def me(user: dict = Depends(current_user)):
        return UserOut(id=user["id"], name=user["name"], email=user["email"], createdAt=user["createdAt"])

    return router
