"""
방문자 수 추적 (Visitor Tracking) 관련 API 엔드포인트.
일일 방문자 및 총 누적 방문자 수를 관리합니다.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
from database import get_db

router = APIRouter(prefix="/visitors", tags=["visitors"])

class VisitorCountResponse(BaseModel):
    today: int
    total: int

@router.post("/increment", response_model=VisitorCountResponse, summary="방문자 수 증가 및 조회")
def increment_visitor_count(conn = Depends(get_db)):
    """
    KST 기준으로 오늘 날짜의 방문자 수를 1 증가시키고,
    오늘 방문자 수와 총 누적 방문자 수를 반환합니다.
    """
    # 한국 시간 기준 오늘 날짜 구하기 (KST = UTC+9)
    kst = timezone(timedelta(hours=9))
    today_str = datetime.now(kst).strftime('%Y-%m-%d')
    
    # 1. 오늘 날짜 레코드가 없으면 생성 (INSERT OR IGNORE와 유사한 효과)
    # SQLite의 UPSERT (ON CONFLICT) 활용
    conn.execute(
        """
        INSERT INTO visitors (date, count)
        VALUES (?, 1)
        ON CONFLICT(date) DO UPDATE SET count = count + 1
        """,
        (today_str,)
    )
    conn.commit()
    
    # 2. 오늘 방문자 수 조회
    today_row = conn.execute(
        "SELECT count FROM visitors WHERE date = ?", (today_str,)
    ).fetchone()
    today_count = today_row[0] if today_row else 0
    
    # 3. 총 누적 방문자 수 조회
    total_row = conn.execute(
        "SELECT SUM(count) FROM visitors"
    ).fetchone()
    total_count = total_row[0] if total_row and total_row[0] is not None else 0
    
    return VisitorCountResponse(today=today_count, total=total_count)
