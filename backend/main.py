"""
joBiBle SoulScribe — FastAPI 백엔드 메인 애플리케이션.

실행 방법:
    uvicorn main:app --reload          # 로컬 개발
    uvicorn main:app --host 0.0.0.0    # Render 배포
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from database import init_db
from routers import sentences, logs, users, feedback, visitors, calendar

# ── 로깅 설정 ─────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("soulscribe")


# ── 앱 시작/종료 이벤트 ───────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """서버 시작 시 DB 초기화를 실행합니다."""
    logger.info("joBiBle SoulScribe API 서버 시작")
    try:
        init_db()
        logger.info("DB 초기화 완료")
    except Exception as e:
        logger.warning(f"DB 초기화 실패 (로컬 SQLite 모드로 계속 진행): {e}")
    yield
    logger.info("joBiBle SoulScribe API 서버 종료")


# ── FastAPI 앱 인스턴스 ────────────────────────────────────────────
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="리추얼 영어 학습 플랫폼 joBiBle SoulScribe의 백엔드 API",
    lifespan=lifespan,
)


# ── CORS 설정 ─────────────────────────────────────────────────────
# allowed_origins는 쉼표로 구분된 문자열 (예: "http://localhost:3000,https://soulscribe.vercel.app")
origins = [o.strip() for o in settings.allowed_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# ── 헬스체크 ─────────────────────────────────────────────────────
# UptimeRobot이 5분마다 호출하는 가벼운 핑 엔드포인트.
# DB나 AI를 거치지 않아 로그를 최소화합니다.
@app.api_route("/health", methods=["GET", "HEAD"], include_in_schema=False)
async def health_check(request: Request):
    # Keep-alive 모니터링 로그 오염 방지
    ua = request.headers.get("user-agent", "")
    if not any(bot in ua for bot in ("UptimeRobot", "cron-job.org", "curl")):
        logger.info("Health check 요청")
    return Response(content='{"status":"alive"}', media_type="application/json")


# ── 루트 ─────────────────────────────────────────────────────────
@app.get("/", include_in_schema=False)
async def root():
    return JSONResponse({
        "name": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
    })


# ── 라우터 등록 ───────────────────────────────────────────────────
app.include_router(sentences.router)
app.include_router(logs.router)
app.include_router(users.router)
app.include_router(feedback.router)
app.include_router(visitors.router)
app.include_router(calendar.router)
