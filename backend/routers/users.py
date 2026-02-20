"""
사용자 관련 API 엔드포인트.
Google OAuth 로그인 후 사용자 정보를 DB에 등록/조회합니다.
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import get_db

logger = logging.getLogger("soulscribe")

router = APIRouter(prefix="/users", tags=["users"])


class UserRegisterPayload(BaseModel):
    google_id: str      # Google 계정 고유 ID (NextAuth providerAccountId)
    email: str
    name: Optional[str] = None


@router.post("/register")
async def register_user(payload: UserRegisterPayload):
    """
    첫 로그인 시 사용자 등록. 이미 존재하면 무시 (idempotent).
    """
    db = get_db()
    try:
        # INSERT OR IGNORE — 이미 존재하는 경우 조용히 무시
        db.execute(
            "INSERT OR IGNORE INTO users (id, email, name) VALUES (?, ?, ?)",
            [payload.google_id, payload.email, payload.name],
        )
        logger.info(f"사용자 등록 처리: {payload.email}")
        return {"success": True}
    except Exception as e:
        logger.error(f"사용자 등록 실패: {e}")
        raise HTTPException(status_code=500, detail="사용자 등록 중 오류가 발생했습니다.")


@router.get("/{user_id}")
async def get_user(user_id: str):
    """
    사용자 프로필 조회.
    """
    db = get_db()
    row = db.execute(
        "SELECT id, email, name, streak, created_at FROM users WHERE id = ?",
        [user_id],
    ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    return {
        "id": row[0],
        "email": row[1],
        "name": row[2],
        "streak": row[3],
        "created_at": row[4],
    }
