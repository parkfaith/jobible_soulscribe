"""
환경 변수 설정 관리 모듈.
.env 파일 또는 OS 환경 변수에서 값을 읽습니다.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Turso DB 연결 정보
    turso_database_url: Optional[str] = None   # libsql://your-db.turso.io
    turso_auth_token: Optional[str] = None

    # OpenAI API 키 (4단계: AI 피드백)
    openai_api_key: Optional[str] = None

    # CORS 허용 출처 (쉼표 구분 문자열)
    allowed_origins: str = "http://localhost:3000"

    # 앱 메타 정보
    app_name: str = "joBiBle SoulScribe API"
    app_version: str = "0.2.0"
    debug: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
