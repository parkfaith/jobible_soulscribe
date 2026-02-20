"""
데이터베이스 연결 관리 모듈.

- 로컬 개발: Python 내장 sqlite3 사용 (설치 불필요)
- Render 배포: libsql-experimental로 Turso 클라우드 연결

TURSO_DATABASE_URL 환경변수가 설정되어 있으면 Turso를 사용하고,
없으면 로컬 파일 기반 SQLite를 사용합니다.
"""

import sqlite3
from contextlib import contextmanager
from config import settings

# Turso 클라이언트 임포트 시도 (프로덕션 환경에서만 설치됨)
try:
    import libsql_experimental as libsql  # type: ignore
    _LIBSQL_AVAILABLE = True
except ImportError:
    _LIBSQL_AVAILABLE = False


def _use_turso() -> bool:
    """Turso 연결을 사용할지 여부를 반환합니다."""
    return bool(settings.turso_database_url and settings.turso_auth_token and _LIBSQL_AVAILABLE)


class _LocalConn:
    """
    Python 내장 sqlite3.Connection을 libsql 인터페이스처럼 감싸는 어댑터.
    execute(), commit(), close() 메서드를 동일하게 제공합니다.
    """

    def __init__(self, path: str):
        self._conn = sqlite3.connect(path, check_same_thread=False)
        self._conn.row_factory = sqlite3.Row

    def execute(self, sql: str, parameters=()) -> sqlite3.Cursor:
        return self._conn.execute(sql, parameters)

    def commit(self) -> None:
        self._conn.commit()

    def close(self) -> None:
        self._conn.close()


def get_db():
    """요청마다 DB 연결을 반환합니다 (FastAPI 의존성 주입용)."""
    if _use_turso():
        import libsql_experimental as libsql  # type: ignore
        conn = libsql.connect(
            database=settings.turso_database_url,
            auth_token=settings.turso_auth_token,
        )
    else:
        conn = _LocalConn("soulscribe_local.db")
    return conn


@contextmanager
def db_context():
    """컨텍스트 매니저 방식의 DB 연결 (수동 사용 시)."""
    conn = get_db()
    try:
        yield conn
        conn.commit()
    except Exception:
        raise
    finally:
        conn.close()


def init_db() -> None:
    """schema.sql을 읽어 초기 테이블을 생성합니다 (앱 시작 시 1회 실행)."""
    import os
    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
    with open(schema_path, "r", encoding="utf-8") as f:
        sql = f.read()

    conn = get_db()
    # 여러 SQL 문을 세미콜론으로 분리하여 순차 실행 (빈 문장만 제외, sqlite3가 주석 자체 처리)
    statements = [s.strip() for s in sql.split(";") if s.strip()]
    for stmt in statements:
        conn.execute(stmt)
    conn.commit()
    conn.close()
