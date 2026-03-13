"""
학습 캘린더 API 엔드포인트.
월별 학습 기록을 날짜별로 그룹핑하여 반환합니다.
"""

from fastapi import APIRouter, Depends, HTTPException
from database import get_db

router = APIRouter(prefix="/calendar", tags=["calendar"])


@router.get("/{user_id}/{year}/{month}", summary="월별 학습 캘린더 조회")
def get_monthly_calendar(user_id: str, year: int, month: int, conn=Depends(get_db)):
    """특정 사용자의 월별 학습 기록을 날짜별로 그룹핑하여 반환합니다."""

    # 입력 검증
    if not (1900 <= year <= 2100):
        raise HTTPException(status_code=400, detail="Invalid year")
    if not (1 <= month <= 12):
        raise HTTPException(status_code=400, detail="Invalid month")

    # 월 범위 계산
    start_date = f"{year:04d}-{month:02d}-01"
    if month == 12:
        end_date = f"{year + 1:04d}-01-01"
    else:
        end_date = f"{year:04d}-{month + 1:02d}-01"

    rows = conn.execute(
        """
        SELECT
            sl.mode, sl.accuracy, sl.time_seconds, sl.completed_at,
            ds.text, ds.source
        FROM study_logs sl
        LEFT JOIN daily_sentences ds ON sl.sentence_id = ds.id
        WHERE sl.user_id = ?
          AND sl.completed_at >= ?
          AND sl.completed_at < ?
        ORDER BY sl.completed_at ASC
        """,
        (user_id, start_date, end_date),
    ).fetchall()

    # 날짜별 그룹핑
    days: dict[str, list] = {}
    for r in rows:
        completed_at = r[3] or ""
        day_key = completed_at[:10]  # "2026-03-01T..." → "2026-03-01"
        if not day_key:
            continue

        entry = {
            "mode": r[0],
            "accuracy": r[1],
            "time_seconds": r[2],
            "completed_at": r[3],
            "sentence_text": r[4],
            "sentence_source": r[5],
        }

        if day_key not in days:
            days[day_key] = []
        days[day_key].append(entry)

    # 요약 통계
    total_days = len(days)
    total_sessions = sum(len(entries) for entries in days.values())

    return {
        "year": year,
        "month": month,
        "days": days,
        "summary": {
            "total_days": total_days,
            "total_sessions": total_sessions,
        },
    }
