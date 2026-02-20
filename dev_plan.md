# joBiBle SoulScribe 개발 계획서

> **앱 정식 명칭**: joBiBle SoulScribe
> *joBiBle = 아내의 닉네임 (성경과 무관)*

---

## 프로젝트 규칙 (필수 준수)

- 모든 응답 및 코드 주석: **한국어** (기술 용어는 영어 병기 가능. 예: 변수(Variable))
- 코드 수정 시: **`CHANGELOG.md`** 반드시 업데이트 — 날짜, 카테고리, 상세 내용, 수정 파일 목록 포함
- 앱 공식 명칭은 항상 **joBiBle SoulScribe** 로 표기

---

## 배경 및 목적

PDF 기획서(PRD v1.0)를 기반으로, 현재 구축된 Next.js MVP 프론트엔드를 출발점으로 삼아
완전한 **'리추얼 영어 학습 플랫폼'** 으로 발전시키는 단계별 개발 계획.

**최종 목표**: AI 피드백 + 스페이스드 리피티션 + 사용자 인증을 갖춘 풀스택 학습 플랫폼

---

## 진행 현황

| 단계 | 상태 | 완료일 |
|------|------|--------|
| **1단계**: 프론트엔드 정비 및 콘텐츠 확충 | ✅ 완료 | 2026-02-19 |
| **2단계**: 백엔드 인프라 구축 (FastAPI + Turso DB) | ✅ 완료 | 2026-02-19 |
| **3단계**: 사용자 인증 및 프론트-백 연동 | ✅ 완료 | 2026-02-19 |
| **4단계**: AI 피드백 시스템 (OpenAI GPT) | ✅ 완료 | 2026-02-19 |
| **5단계**: 암기 루프 및 마스터리 시스템 | ⬜ 대기 | — |

---

## 기술 스택

| 영역 | 기술 | 플랫폼 |
|------|------|--------|
| 프론트엔드 | Next.js 16 + React 19 + Tailwind CSS 4 | Vercel |
| 백엔드 | FastAPI (Python) | Render (Free Tier → Paid) |
| 데이터베이스 | Turso (SQLite at the Edge) | Turso Cloud |
| 인증 | NextAuth.js v5 (Google OAuth) | — |
| AI 피드백 | OpenAI GPT-4o-mini / GPT-4o | OpenAI API |
| 운영 | UptimeRobot 5분 핑 → Vercel Cron (2단계 이후) | — |

---

## 단계별 상세 계획

---

### ✅ 1단계: 프론트엔드 정비 및 콘텐츠 확충

**목표**: 현재 MVP를 정식 서비스로 배포 가능한 수준으로 완성

#### 완료된 작업
1. **프로젝트 정비**
   - `package.json` 프로젝트명: `"name": "jobible-soulscribe"`
   - `app/layout.tsx` 메타데이터 제목: "joBiBle SoulScribe"
   - `CHANGELOG.md` 최초 생성
   - `README.md` 프로젝트 소개로 전면 재작성

2. **콘텐츠 확충** (`lib/quotes.ts`)
   - 명언 7개 → 30개로 확장 (Public Domain 기반)
   - Quote 인터페이스에 `category` 필드 추가 (quote / poem / speech / literature)
   - `difficulty` 필드 추가 (short / medium / long — 로드맵 준비)
   - `getQuotesByCategory()`, `getQuotesByDifficulty()` 유틸 함수 추가

3. **Partial Cloze 모드** (`app/components/ClozeMode.tsx`) — 신규
   - 핵심 단어(4글자 이상, 30%) 빈칸 처리
   - 정답 비교 시 구두점 무시, 대소문자 무시
   - 실시간 정답 표시 (녹색/적색 언더라인)

4. **UI 개선**
   - 헤더: "joBiBle" + "SoulScribe" 브랜딩 반영
   - 모드 탭: Transcription / Scramble / **Cloze** 3탭으로 확장
   - `CompleteOverlay.tsx`: Cloze 완료 메시지 추가
   - 푸터: "joBiBle SoulScribe — v0.1"

#### 수정 파일 목록
- `package.json`
- `app/layout.tsx`
- `app/page.tsx`
- `lib/quotes.ts`
- `app/components/ClozeMode.tsx` *(신규)*
- `app/components/CompleteOverlay.tsx`
- `README.md`
- `CHANGELOG.md` *(신규)*

---

### ✅ 2단계: 백엔드 인프라 구축 (FastAPI + Turso DB)

**목표**: Vercel(프론트) ↔ Render(FastAPI 백엔드) ↔ Turso(SQLite DB) 연결

#### 작업 항목
1. **FastAPI 프로젝트 셋업** (`/backend/` 폴더)
   - `main.py`: FastAPI 앱 + CORS 설정 (Vercel 도메인 허용)
   - `database.py`: Turso(libsql) 전용 Database 세션 클래스
   - `requirements.txt`: `fastapi`, `uvicorn`, `libsql-experimental` 등

2. **DB 스키마** (`/backend/schema.sql`)
   ```sql
   CREATE TABLE users (
     id TEXT PRIMARY KEY,
     email TEXT UNIQUE NOT NULL,
     name TEXT,
     streak INTEGER DEFAULT 0,
     created_at TEXT DEFAULT (datetime('now'))
   );

   CREATE TABLE daily_sentences (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     text TEXT NOT NULL,
     source TEXT,
     context TEXT,
     translation TEXT,
     category TEXT,
     difficulty TEXT
   );

   CREATE TABLE study_logs (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     user_id TEXT,
     sentence_id INTEGER,
     mode TEXT,
     accuracy REAL,
     time_seconds INTEGER,
     completed_at TEXT DEFAULT (datetime('now'))
   );

   CREATE TABLE ai_feedbacks (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     sentence_id INTEGER UNIQUE,
     grammar_analysis TEXT,
     nuance_insights TEXT,
     practice_challenge TEXT,
     created_at TEXT DEFAULT (datetime('now'))
   );
   ```

3. **핵심 API 엔드포인트**
   - `GET /health` — UptimeRobot 핑 (DB 접속 없음, 로그 무시)
   - `GET /sentences/today` — 오늘의 문장 반환
   - `POST /study-logs` — 학습 기록 저장 (소요시간, 정확도, 모드)

4. **Next.js API 클라이언트** (`lib/api.ts`)
   - 환경변수 `NEXT_PUBLIC_API_URL` 기반 클라이언트
   - 기본 fetch 래퍼 (에러 처리 포함)

#### 신규 파일
- `/backend/main.py`
- `/backend/database.py`
- `/backend/routers/sentences.py`
- `/backend/routers/logs.py`
- `/backend/schema.sql`
- `/backend/requirements.txt`
- `lib/api.ts`
- `.env.local` (환경변수 템플릿)

#### 검증
```bash
# 로컬 백엔드 실행
cd backend && uvicorn main:app --reload

# 엔드포인트 확인
curl http://localhost:8000/health       # → {"status": "alive"}
curl http://localhost:8000/sentences/today  # → 명언 JSON
```

---

### ⬜ 3단계: 사용자 인증 및 프론트-백 연동

**목표**: 회원가입/로그인으로 학습 기록을 서버에 영속 저장

#### 작업 항목
1. **인증 시스템** (NextAuth.js v5)
   - Google OAuth 소셜 로그인
   - JWT 세션 기반 사용자 식별
   - `app/api/auth/[...nextauth]/route.ts`

2. **사용자 프로필 연동**
   - 첫 로그인 시 FastAPI `users` 테이블 자동 등록
   - 비로그인 사용자도 기능 사용 가능 (localStorage 폴백 유지)

3. **학습 기록 서버 저장**
   - 완료 시 `POST /study-logs` 호출 (소요시간, 정확도, 모드)
   - 스트릭 데이터 DB 동기화

4. **Vercel 배포 설정**
   - `vercel.json` 환경변수 설정
   - 프로덕션 도메인 CORS 정책 반영

#### 신규/수정 파일
- `app/api/auth/[...nextauth]/route.ts` *(신규)*
- `/backend/routers/users.py` *(신규)*
- `app/page.tsx`, `lib/streak.ts`

#### 검증
로그인 → 학습 완료 → Turso DB `study_logs` 테이블에 레코드 생성 확인

---

### ⬜ 4단계: AI 피드백 시스템 (OpenAI GPT)

**목표**: 필사 완료 후 문법 분석 + 뉘앙스 해설 + 패턴 챌린지 제공

#### 작업 항목
1. **OpenAI API 연동** (`/backend/routers/feedback.py`)
   - 모델: `gpt-4o-mini` (비용 효율) 또는 `gpt-4o` (품질 우선)
   - System Instruction으로 Grammar Analysis / Nuance Insights / Practice Challenge를 JSON 반환
   - `POST /feedback` — 원문 + 사용자 입력 분석

2. **피드백 캐싱** (`ai_feedbacks` 테이블)
   - 동일 문장 ID 중복 API 호출 방지
   - 캐시 히트 시 즉시 반환

3. **프론트엔드 피드백 UI** (`app/components/AIFeedback.tsx`)
   - 완료 후 "선생님 피드백 보기" 버튼
   - Grammar / Nuance / Challenge 3탭 구조
   - 로딩 스피너 + 스켈레톤 UI

#### 신규/수정 파일
- `/backend/routers/feedback.py` *(신규)*
- `app/components/AIFeedback.tsx` *(신규)*
- `app/components/CompleteOverlay.tsx`

#### 검증
필사 완료 → AI 피드백 카드 3종 표시, 동일 문장 재요청 시 캐시 응답 확인

---

### ⬜ 5단계: 암기 루프 및 마스터리 시스템

**목표**: 스페이스드 리피티션으로 장기 기억 강화 + Master's Library 구현

#### 작업 항목
1. **난이도 평가 버튼** (완료 후 UI)
   - "어려움 / 보통 / 쉬움" 3단계 선택
   - SM-2 알고리즘 기반 다음 복습 날짜 계산
   - `POST /review` — 복습 일정 Turso DB 저장

2. **복습 큐 시스템** (`GET /sentences/review`)
   - 오늘 복습할 문장 목록 반환
   - 오늘의 새 문장 + 복습 문장 함께 표시

3. **Master's Library 페이지** (`app/library/page.tsx`)
   - 복습 3회 이상 완료 문장 → 골드 카드로 시각화
   - 카드 갤러리 레이아웃 (그리드)
   - 카드별 학습 통계 (완료일, 최고 정확도)

4. **Progressive Fading** (선택)
   - 복습 횟수가 높을수록 힌트 줄어드는 필사 모드 변형

#### 신규/수정 파일
- `/backend/routers/review.py` *(신규)*
- `app/library/page.tsx` *(신규)*
- `app/components/CompleteOverlay.tsx`
- `lib/quotes.ts`, `app/page.tsx`

#### 검증
학습 완료 → 난이도 선택 → 복습일 DB 저장 확인, `/library` 페이지 골드 카드 렌더링 확인

---

## 운영 전략 (인프라)

| 단계 | 전략 |
|------|------|
| 1~2단계 (개발/베타) | UptimeRobot 5분 주기로 Render `/health` 핑 → Cold Start 방지 |
| 3~4단계 (사용자 유입) | Vercel Cron Jobs로 전환 (외부 서비스 의존 제거) |
| 5단계 이후 (정식 런칭) | Render Individual Plan($7/mo) 업그레이드 권장 |

> Gemini AI 피드백은 응답 시간이 소요되므로, Cold Start + AI 딜레이 중첩 시 사용자 이탈 위험이 높음.
> 정식 런칭 전 유료 플랜 전환을 강력 권장.
