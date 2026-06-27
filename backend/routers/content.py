"""Content router — read-only endpoints for classes, streams, careers, scholarships.

Seeds Mongo from `data/seed_data.py` on first request if collections are empty.
"""
from fastapi import APIRouter, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional
import logging

from data.seed_data import CATEGORIES, STREAMS, CLASSES, CAREERS, SCHOLARSHIPS

logger = logging.getLogger(__name__)

router = APIRouter()


def _strip_id(doc: dict) -> dict:
    doc.pop("_id", None)
    return doc


async def ensure_seeded(db: AsyncIOMotorDatabase) -> None:
    """Idempotent seed. Runs once when each collection is empty."""
    pairs = [
        ("classes", CLASSES),
        ("streams", STREAMS),
        ("career_categories", CATEGORIES),
        ("careers", CAREERS),
        ("scholarships", SCHOLARSHIPS),
    ]
    for name, rows in pairs:
        if await db[name].count_documents({}) == 0 and rows:
            await db[name].insert_many([dict(r) for r in rows])
            logger.info("Seeded %s with %d rows", name, len(rows))


def build_router(db: AsyncIOMotorDatabase) -> APIRouter:
    @router.get("/classes")
    async def list_classes():
        await ensure_seeded(db)
        rows = await db.classes.find({}).to_list(100)
        return [_strip_id(r) for r in rows]

    @router.get("/classes/{class_id}")
    async def get_class(class_id: str):
        await ensure_seeded(db)
        row = await db.classes.find_one({"id": class_id})
        if not row:
            raise HTTPException(404, "Class not found")
        streams = await db.streams.find(
            {"applicable_classes": class_id}
        ).to_list(50)
        return {"class": _strip_id(row), "streams": [_strip_id(s) for s in streams]}

    @router.get("/streams")
    async def list_streams():
        await ensure_seeded(db)
        rows = await db.streams.find({}).to_list(100)
        return [_strip_id(r) for r in rows]

    @router.get("/streams/{slug}")
    async def get_stream(slug: str):
        await ensure_seeded(db)
        stream = await db.streams.find_one({"slug": slug})
        if not stream:
            raise HTTPException(404, "Stream not found")
        careers = await db.careers.find({"stream_ids": slug}).to_list(200)
        return {"stream": _strip_id(stream), "careers": [_strip_id(c) for c in careers]}

    @router.get("/careers")
    async def list_careers(
        q: Optional[str] = Query(None, description="Search title / summary"),
        category: Optional[str] = None,
        stream: Optional[str] = None,
        class_level: Optional[str] = None,
    ):
        await ensure_seeded(db)
        query: dict = {}
        if q:
            query["$or"] = [
                {"title": {"$regex": q, "$options": "i"}},
                {"summary": {"$regex": q, "$options": "i"}},
            ]
        if category:
            query["category_id"] = category
        if stream:
            query["stream_ids"] = stream
        if class_level:
            query["applicable_classes"] = class_level
        rows = await db.careers.find(query).to_list(500)
        return [_strip_id(r) for r in rows]

    @router.get("/categories")
    async def list_categories():
        await ensure_seeded(db)
        rows = await db.career_categories.find({}).to_list(100)
        return [_strip_id(r) for r in rows]

    @router.get("/careers/{slug}")
    async def get_career(slug: str):
        await ensure_seeded(db)
        career = await db.careers.find_one({"slug": slug})
        if not career:
            raise HTTPException(404, "Career not found")
        cat = await db.career_categories.find_one({"id": career.get("category_id")})
        streams = await db.streams.find(
            {"slug": {"$in": career.get("stream_ids", [])}}
        ).to_list(20)
        return {
            "career": _strip_id(career),
            "category": _strip_id(cat) if cat else None,
            "streams": [_strip_id(s) for s in streams],
        }

    @router.get("/scholarships")
    async def list_scholarships(tag: Optional[str] = None):
        await ensure_seeded(db)
        query: dict = {}
        if tag:
            query["tags"] = tag
        rows = await db.scholarships.find(query).to_list(200)
        return [_strip_id(r) for r in rows]

    return router
