"""
학습 기록(Study Log) 관련 API 엔드포인트.
필사/스크램블/클로즈 완료 기록 저장 및 조회를 담당합니다.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from database import get_db

router = APIRouter(prefix="/study-logs", tags=["study-logs"])


# ── 요청/응답 스키마 ─────────────────────────────────────────────

class StudyLogCreate(BaseModel):
    user_id: Optional[str] = None       # 비로그인 사용자는 None
    sentence_id: Optional[int] = None   # 문장 ID (DB에 없으면 None)
    mode: str                           # transcription | scramble | cloze
    accuracy: Optional[float] = None    # 필사 모드만 해당 (0.0 ~ 100.0)
    time_seconds: Optional[int] = None  # 필사 모드만 해당


class StudyLogResponse(BaseModel):
    id: int
    message: str


# ── 엔드포인트 ───────────────────────────────────────────────────

@router.post("", response_model=StudyLogResponse, summary="학습 기록 저장")
def create_study_log(payload: StudyLogCreate, conn = Depends(get_db)):
    """
    학습 완료 시 기록을 저장합니다.
    비로그인 사용자는 user_id를 None으로 보낼 수 있습니다.
    """
    cursor = conn.execute(
        """
        INSERT INTO study_logs (user_id, sentence_id, mode, accuracy, time_seconds)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            payload.user_id,
            payload.sentence_id,
            payload.mode,
            payload.accuracy,
            payload.time_seconds,
        ),
    )
    conn.commit()
    log_id = cursor.lastrowid
    return StudyLogResponse(id=log_id, message="학습 기록이 저장되었습니다.")


@router.get("/user/{user_id}", summary="사용자 학습 기록 조회")
def get_user_logs(user_id: str, limit: int = 20, conn = Depends(get_db)):
    """특정 사용자의 최근 학습 기록을 반환합니다."""
    rows = conn.execute(
        """
        SELECT id, sentence_id, mode, accuracy, time_seconds, completed_at
        FROM study_logs
        WHERE user_id = ?
        ORDER BY completed_at DESC
        LIMIT ?
        """,
        (user_id, limit),
    ).fetchall()

    return [
        {
            "id": r[0],
            "sentence_id": r[1],
            "mode": r[2],
            "accuracy": r[3],
            "time_seconds": r[4],
            "completed_at": r[5],
        }
        for r in rows
    ]
