"""
문장(Sentence) 관련 API 엔드포인트.
오늘의 문장 조회, 문장 목록 조회 등을 담당합니다.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import get_db
import datetime

router = APIRouter(prefix="/sentences", tags=["sentences"])


# ── 응답 스키마 ───────────────────────────────────────────────────

class SentenceResponse(BaseModel):
    id: int
    text: str
    source: Optional[str] = None
    context: Optional[str] = None
    translation: Optional[str] = None
    category: str = "quote"
    difficulty: str = "short"


# ── 유틸: 연중 일수 기반으로 오늘의 문장 ID 계산 ─────────────────

def _get_day_of_year() -> int:
    """오늘이 연중 몇 번째 날인지 반환합니다."""
    now = datetime.date.today()
    return now.timetuple().tm_yday


# ── 엔드포인트 ───────────────────────────────────────────────────

@router.get("/today", response_model=SentenceResponse, summary="오늘의 문장 조회")
def get_today_sentence():
    """
    연중 일수(day of year) % 총 문장 수 방식으로 오늘의 문장을 반환합니다.
    DB에 문장이 없을 경우 기본 목업 데이터를 반환합니다.
    """
    conn = get_db()
    try:
        rows = conn.execute("SELECT COUNT(*) FROM daily_sentences").fetchone()
        total = rows[0] if rows else 0

        if total == 0:
            # DB가 비어 있으면 기본 목업 응답
            return SentenceResponse(
                id=0,
                text="In the middle of every difficulty lies opportunity.",
                source="Albert Einstein",
                context="Physicist & Philosopher",
                translation="모든 어려움의 한가운데에 기회가 있다.",
                category="quote",
                difficulty="short",
            )

        # 연중 일수 기반으로 오늘의 문장 인덱스 결정
        day_idx = (_get_day_of_year() % total) + 1
        row = conn.execute(
            "SELECT id, text, source, context, translation, category, difficulty "
            "FROM daily_sentences WHERE id = ?",
            (day_idx,),
        ).fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="오늘의 문장을 찾을 수 없습니다.")

        return SentenceResponse(
            id=row[0],
            text=row[1],
            source=row[2],
            context=row[3],
            translation=row[4],
            category=row[5] or "quote",
            difficulty=row[6] or "short",
        )
    finally:
        conn.close()


@router.get("/{sentence_id}", response_model=SentenceResponse, summary="특정 문장 조회")
def get_sentence(sentence_id: int):
    """문장 ID로 특정 문장을 조회합니다."""
    conn = get_db()
    try:
        row = conn.execute(
            "SELECT id, text, source, context, translation, category, difficulty "
            "FROM daily_sentences WHERE id = ?",
            (sentence_id,),
        ).fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="문장을 찾을 수 없습니다.")

        return SentenceResponse(
            id=row[0], text=row[1], source=row[2],
            context=row[3], translation=row[4],
            category=row[5] or "quote", difficulty=row[6] or "short",
        )
    finally:
        conn.close()
