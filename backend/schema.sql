-- joBiBle SoulScribe 데이터베이스 스키마
-- Turso(libsql) 기반 SQLite 호환 DDL

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,           -- OAuth provider sub (예: google|xxxxx)
    email       TEXT UNIQUE NOT NULL,
    name        TEXT,
    streak      INTEGER DEFAULT 0,          -- 연속 학습 일수
    last_date   TEXT,                       -- 마지막 완료 날짜 (YYYY-MM-DD)
    created_at  TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- 일일 문장 테이블 (콘텐츠 원본)
CREATE TABLE IF NOT EXISTS daily_sentences (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    text        TEXT NOT NULL,              -- 영문 원문
    source      TEXT,                       -- 저자/출처
    context     TEXT,                       -- 문맥 정보
    translation TEXT,                       -- 한글 번역
    category    TEXT DEFAULT 'quote',       -- quote | poem | speech | literature
    difficulty  TEXT DEFAULT 'short'        -- short | medium | long
);

-- 학습 기록 테이블
CREATE TABLE IF NOT EXISTS study_logs (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      TEXT,                      -- NULL 허용 (비로그인 사용자)
    sentence_id  INTEGER,
    mode         TEXT NOT NULL,             -- transcription | scramble | cloze
    accuracy     REAL,                      -- 정확도 (0.0 ~ 100.0), 필사 모드만 해당
    time_seconds INTEGER,                   -- 소요 시간 (초), 필사 모드만 해당
    completed_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (sentence_id) REFERENCES daily_sentences(id)
);

-- AI 피드백 캐시 테이블 (4단계에서 활용)
CREATE TABLE IF NOT EXISTS ai_feedbacks (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    sentence_id         INTEGER UNIQUE NOT NULL,
    grammar_analysis    TEXT,
    nuance_insights     TEXT,
    practice_challenge  TEXT,
    created_at          TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (sentence_id) REFERENCES daily_sentences(id)
);

-- 복습 스케줄 테이블 (5단계에서 활용)
CREATE TABLE IF NOT EXISTS review_schedules (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         TEXT NOT NULL,
    sentence_id     INTEGER NOT NULL,
    review_count    INTEGER DEFAULT 0,      -- 총 복습 횟수
    next_review_at  TEXT,                   -- 다음 복습 예정일 (YYYY-MM-DD)
    ease_factor     REAL DEFAULT 2.5,       -- SM-2 알고리즘 난이도 계수
    interval_days   INTEGER DEFAULT 1,      -- 현재 복습 간격 (일)
    updated_at      TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    UNIQUE (user_id, sentence_id),
    FOREIGN KEY (sentence_id) REFERENCES daily_sentences(id)
);

-- 방문자 테이블
CREATE TABLE IF NOT EXISTS visitors (
    date TEXT PRIMARY KEY,
    count INTEGER DEFAULT 0
);
