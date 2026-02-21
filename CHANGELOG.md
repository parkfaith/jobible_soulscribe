# CHANGELOG

joBiBle SoulScribe 변경 이력

형식: `[날짜] - [카테고리] - 상세 내용`

---

## [2026-02-21] - 공유 이미지 카드 레이아웃 개선

### 수정 (Fixed)
- `ShareableCard.tsx` — html-to-image가 margin/padding/gap을 무시하는 문제 해결
  - 모든 요소를 단일 텍스트 플로우(`<span>` + `<br/>`)로 통합
  - 저자 · 출처를 한 줄로 표시 (`— ALBERT EINSTEIN · Physicist & Philosopher`)
  - 한글 번역을 저자/출처 아래로 이동, 16px 이탤릭으로 축소
  - 출처(context) 두 줄 깨짐 → `whiteSpace: 'nowrap'`으로 한 줄 유지

### 수정 파일 목록
- `app/components/ShareableCard.tsx`

---

## [2026-02-21] - 코드 점검 및 정리

### 삭제 (Removed)
- `backend/seed.py` — 초기 30개 명언 시드 일회성 스크립트 삭제 (`pipeline/seed_enriched.py`로 대체)

### 수정 (Fixed)
- `app/page.tsx` — `postStudyLog()` 호출 시 `sentence_id` 누락 수정 (transcription/scramble/cloze 3곳)

### 수정 파일 목록
- `backend/seed.py` *(삭제)*
- `app/page.tsx`

---

## [2026-02-21] - 명언 수집 파이프라인 + 프론트엔드 API 전환

### 추가 (Added)
- `backend/pipeline/collect.py` — Quotable API에서 명언 수집 (GitHub 폴백 지원)
- `backend/pipeline/enrich.py` — GPT-4o-mini 배치로 한글 번역/카테고리/context 생성
- `backend/pipeline/seed_enriched.py` — enriched 데이터를 Turso DB에 시드 (중복 체크)
- `backend/pipeline/run_pipeline.py` — collect → enrich → seed 순차 실행 오케스트레이터

### 수정 (Changed)
- `lib/quotes.ts` — 하드코딩된 30개 명언 배열 제거, `Quote` 타입에 `id?: number` 추가, `FALLBACK_QUOTE` 1개만 유지
- `app/page.tsx` — `getTodayQuote()` → `fetchTodaySentence()` API 호출로 전환, API 실패 시 FALLBACK_QUOTE 사용
- `lib/api.ts` — `request()` 함수에 AbortController 기반 10초 timeout 추가 (Render cold start 대비)
- `.gitignore` — `backend/data/*.json`, `.claude/` 제외 추가

### 데이터
- Turso DB 총 530개 명언 (기존 30개 + Quotable API 500개)
- 약 1년 5개월(530일) 주기로 순환, 연중 일수 기반 선택

### 수정 파일 목록
- `backend/pipeline/__init__.py` *(신규)*
- `backend/pipeline/collect.py` *(신규)*
- `backend/pipeline/enrich.py` *(신규)*
- `backend/pipeline/seed_enriched.py` *(신규)*
- `backend/pipeline/run_pipeline.py` *(신규)*
- `lib/quotes.ts`, `app/page.tsx`, `lib/api.ts`, `.gitignore`

---

## [2026-02-21] - UI/UX 개선 및 버그 수정 일괄 반영

### UI/UX 개선
- **원문 보기/가리기 버튼 통일**: "가리기" 버튼이 글 위에 흐리게 겹쳐 보이던 문제 해결. 보기/가리기 모두 동일한 카드 스타일 버튼으로 중앙 표시
- **모드 탭 레이아웃 변경**: 가로 한 줄(아이콘+텍스트) → 세로 배치(아이콘 위, 텍스트 아래)로 변경
- **Cloze 아이콘 변경**: 유니코드 사각형(iOS 미지원 + 빈칸 혼동) → `⋯`(말줄임표)
- **Scramble 단어 되돌리기 UX**: 답란 단어에 점선 밑줄 + "위의 단어를 탭하면 제거됩니다" 안내 + "전체 초기화" 버튼 추가

### 버그 수정
- **선생님 피드백 자동 요청**: `handleFetch` 호이스팅 버그로 autoFetch가 동작하지 않던 문제 수정
- **완료 후 모드 전환 불가**: `switchMode`의 `if (!isComplete)` 가드가 탭 클릭을 차단 → 완료 상태에서 모드 전환 시 자동 리셋
- **iPad 모드 초기화**: 재수행 시 Scramble로 초기화 → sessionStorage에 모드 저장하여 보존
- **앱 전환 후 상태 유실**: 이미지 공유 후 복귀 시 완료 상태 + AI 피드백 소실 → sessionStorage 보존/복원
- **iOS 자동 줌**: viewport `maximum-scale=1, user-scalable=false` 설정

### 이미지 공유 개선
- 저자/제목 겹침 문제 해결 (padding 확대 + flow 레이아웃 통일)
- 캡쳐 이미지에 한글 번역 추가

### 신규 기능
- **PWA 설치 안내 배너**: Android `beforeinstallprompt` / iOS Safari 안내 + 닫기 시 재표시 방지
- **Service Worker 등록**: 최소 SW (`public/sw.js`) — Chrome/Android 설치 프롬프트 요건 충족

### 수정 파일 목록
- `app/page.tsx`, `app/components/QuoteCard.tsx`, `app/components/AIFeedback.tsx`
- `app/components/CompleteOverlay.tsx`, `app/components/ScrambleMode.tsx`
- `app/components/ShareableCard.tsx`, `app/components/InstallPrompt.tsx` *(신규)*
- `app/layout.tsx`, `app/globals.css`
- `public/sw.js` *(신규)*

---

## [2026-02-19] - UX 개선: Scramble/Cloze 모드에서 원문 블러 처리

### 추가 (Added)
- `app/components/QuoteCard.tsx`
  - `hideText?: boolean` prop 추가
  - `hideText=true` 시 영어 원문에 `blur(7px)` 필터 적용
  - **"👁 원문 보기"** 버튼 클릭 시 블러 해제, 다시 클릭 시 "가리기"로 재블러
  - 모드 전환 시 (`hideText` 변경) 자동으로 가린 상태로 초기화
- `app/page.tsx`
  - QuoteCard에 `hideText={mode !== 'transcription' && !isComplete}` 전달
  - Scramble/Cloze 모드 전환 즉시 원문 자동 가리기, 필사 모드는 항상 공개

### 수정 파일 목록
- `app/components/QuoteCard.tsx`
- `app/page.tsx`

---

## [2026-02-19] - UX 개선: 각 학습 모드에 제출 버튼 추가

### 수정 (Changed)
- `app/components/TranscriptionEngine.tsx`
  - 입력 시작 후 **"필사 완료 ↵"** 버튼 표시
  - 오타가 있어도 현재 정확도로 제출 가능 (기존: 완전 일치만 자동 완료)
  - 완전 일치 시 자동 완료는 그대로 유지
- `app/components/ScrambleMode.tsx`
  - 단어 하나 이상 배치 후 **"배열 완료 ↵"** 버튼 표시
  - 순서가 틀려도 제출 가능 (기존: 정답 일치 시만 자동 완료)
- `app/components/ClozeMode.tsx`
  - 빈칸 하나 이상 입력 후 **"빈칸 완료 ↵"** 버튼 표시
  - 모든 빈칸 정답 시 자동 완료는 그대로 유지

### 수정 파일 목록
- `app/components/TranscriptionEngine.tsx`
- `app/components/ScrambleMode.tsx`
- `app/components/ClozeMode.tsx`

---

## [2026-02-19] - 4단계: AI 피드백 시스템 (OpenAI GPT)

### 추가 (Added)
- `backend/routers/feedback.py` — AI 피드백 API
  - `POST /feedback`: GPT-4o-mini로 문법 분석 / 뉘앙스 / 연습 문장 생성
  - `ai_feedbacks` 테이블 캐시 (동일 문장 중복 호출 방지)
  - `OPENAI_API_KEY` 미설정 시 목업 피드백 자동 반환
- `app/components/AIFeedback.tsx` — 3탭 AI 피드백 UI 컴포넌트
  - 초기: "선생님 피드백 보기" 버튼
  - 로딩: 스켈레톤 애니메이션
  - 완료: 문법 분석 / 뉘앙스 / 연습 문장 탭 UI
  - 캐시 여부 표시

### 수정 (Changed)
- `lib/quotes.ts` — `getTodayQuoteIndex()` 함수 추가 (AI 피드백 캐시 키)
- `lib/api.ts` — `fetchFeedback()` 함수 + `FeedbackPayload/Response` 타입 추가
- `app/components/CompleteOverlay.tsx` — `quoteText`, `sentenceId` props 추가 + AIFeedback 렌더링
- `app/page.tsx` — CompleteOverlay에 `quoteText`, `sentenceId` 전달
- `backend/main.py` — feedback 라우터 등록
- `backend/config.py` — `openai_api_key` 설정 필드 추가
- `backend/requirements.txt` — `openai>=1.58.0` 추가
- `backend/.env` — `OPENAI_API_KEY` 템플릿 추가

### 수정 파일 목록
- `backend/routers/feedback.py` *(신규)*
- `app/components/AIFeedback.tsx` *(신규)*
- `lib/quotes.ts`, `lib/api.ts`
- `app/components/CompleteOverlay.tsx`, `app/page.tsx`
- `backend/main.py`, `backend/config.py`, `backend/requirements.txt`, `backend/.env`

---

## [2026-02-19] - 3단계: 사용자 인증 및 프론트-백 연동

### 추가 (Added)
- `app/auth.ts` — NextAuth.js v5 설정 (Google OAuth Provider, JWT 세션)
- `app/api/auth/[...nextauth]/route.ts` — NextAuth GET/POST 핸들러
- `app/components/Providers.tsx` — SessionProvider 래퍼
- `app/components/AuthButton.tsx` — Google 로그인/로그아웃 버튼 (프로필 이미지 포함)
- `backend/routers/users.py` — `POST /users/register`, `GET /users/{user_id}`

### 수정 (Changed)
- `app/layout.tsx` — `<Providers>`로 children 래핑
- `app/page.tsx` — useSession 연동, 헤더에 AuthButton, 첫 로그인 시 registerUser 자동 호출, 학습 완료 시 postStudyLog 실제 호출
- `lib/api.ts` — `registerUser()` 함수 추가
- `backend/main.py` — users 라우터 등록
- `.env.local` — NextAuth 환경변수 추가 (NEXTAUTH_SECRET, NEXTAUTH_URL, GOOGLE_CLIENT_ID/SECRET)

### 수정 파일 목록
- `app/auth.ts` *(신규)*
- `app/api/auth/[...nextauth]/route.ts` *(신규)*
- `app/components/Providers.tsx` *(신규)*
- `app/components/AuthButton.tsx` *(신규)*
- `app/layout.tsx`, `app/page.tsx`, `lib/api.ts`
- `backend/routers/users.py` *(신규)*, `backend/main.py`
- `.env.local`

---

## [2026-02-19] - 기능 추가: 원문 발음 듣기 (TTS)

### 추가 (Added)
- `app/components/QuoteCard.tsx` — Web Speech API를 이용한 원문 발음 듣기 버튼 추가
  - 카드 우상단에 🔊 버튼 배치 (재생 중 ⏹ 로 전환)
  - `speechSynthesis.speak()` 사용, 언어 `en-US`, 속도 0.85배 (또렷하게)
  - 기기에 영어 로컬 음성이 있으면 우선 선택
  - 재생 중 버튼 클릭 시 즉시 정지

### 수정 파일 목록
- `app/components/QuoteCard.tsx`

---

## [2026-02-19] - UI 개선: iPad 레이아웃 및 필사 영역 수정

### 수정 (Fixed)
- `app/components/QuoteCard.tsx` — 태블릿(md: 768px+)에서 콘텐츠 폭 680px → 860px로 확장 (`max-w-170 md:max-w-215`)
- `app/page.tsx` — 모드 탭, 학습 영역 동일하게 태블릿 max-width 860px 적용
- `app/components/TranscriptionEngine.tsx` — 문자 표시 영역 텍스트 오버플로우 수정 (`wordBreak: break-word`, `overflowWrap: break-word`)
- `app/components/TranscriptionEngine.tsx` — textarea 가로 스크롤 방지 (`overflowX: hidden`)

### 수정 (Changed)
- `app/components/TranscriptionEngine.tsx` — "원문을 그대로 필사하세요" 레이블을 우아한 디자인으로 개선: Cormorant 이탤릭 + 골드 구분선 + ✦ 장식 기호 + 위쪽 여백 추가

### 수정 파일 목록
- `app/components/QuoteCard.tsx`
- `app/page.tsx`
- `app/components/TranscriptionEngine.tsx`

---

## [2026-02-19] - 2단계 버그픽스: 로컬 테스트 환경 수정

### 수정 (Fixed)
- `backend/database.py` — `init_db()` SQL 파싱 버그 수정: `--` 주석 필터 조건이 모든 SQL 블록을 제거하던 문제 (주석으로 시작하는 블록 전부 필터링됨 → 단순 빈 문장 제외로 변경)
- `backend/database.py` — `libsql-experimental` 미설치 시 Python 내장 `sqlite3` 자동 전환하는 어댑터 구현 (Python 3.14 호환)
- `backend/requirements.txt` — 버전 고정 (`==`) → 최소 버전 (`>=`)으로 변경 (Python 3.14 호환 패키지 허용)
- `backend/requirements-prod.txt` — 신규 생성: `libsql-experimental` Render 배포 전용 분리
- `backend/render.yaml` — 빌드 명령어를 `requirements-prod.txt` 사용으로 변경

### 로컬 테스트 결과
| 엔드포인트 | 상태 |
|-----------|------|
| `GET /health` | ✅ 200 `{"status":"alive"}` |
| `GET /` | ✅ 200 API 정보 반환 |
| `GET /sentences/today` | ✅ 200 목업 명언 반환 |
| `POST /study-logs` | ✅ 201 기록 저장 성공 |
| `GET /docs` | ✅ 200 Swagger UI 접근 가능 |

### 수정 파일 목록
- `backend/database.py`
- `backend/requirements.txt`
- `backend/requirements-prod.txt` (신규)
- `backend/render.yaml`

---

## [2026-02-19] - 2단계: 백엔드 인프라 구축 (FastAPI + Turso DB)

### 추가 (Added)
- `backend/main.py` — FastAPI 메인 앱; CORS 미들웨어, 헬스체크(/health), 라우터 등록
- `backend/config.py` — pydantic-settings 기반 환경변수 관리 클래스
- `backend/database.py` — Turso(libsql) 연결 관리; 로컬 개발 시 파일 기반 SQLite 자동 전환
- `backend/schema.sql` — 5개 테이블 DDL: users, daily_sentences, study_logs, ai_feedbacks, review_schedules
- `backend/routers/sentences.py` — GET /sentences/today, GET /sentences/{id} 엔드포인트
- `backend/routers/logs.py` — POST /study-logs, GET /study-logs/user/{id} 엔드포인트
- `backend/requirements.txt` — Python 의존성 (fastapi, uvicorn, libsql-experimental 등)
- `backend/render.yaml` — Render 배포 설정 (singapore 리전, free plan)
- `backend/.env` — 백엔드 환경변수 템플릿 (실제 값 미포함)
- `lib/api.ts` — Next.js용 FastAPI 통신 클라이언트 (fetchTodaySentence, postStudyLog, checkHealth)
- `.env.local` — 프론트엔드 환경변수 템플릿 (NEXT_PUBLIC_API_URL)

### 수정 (Changed)
- `.gitignore` — Python 빌드 파일, 가상환경, 로컬 DB 파일 무시 규칙 추가

### 수정 파일 목록
- `backend/main.py` (신규)
- `backend/config.py` (신규)
- `backend/database.py` (신규)
- `backend/schema.sql` (신규)
- `backend/routers/__init__.py` (신규)
- `backend/routers/sentences.py` (신규)
- `backend/routers/logs.py` (신규)
- `backend/requirements.txt` (신규)
- `backend/render.yaml` (신규)
- `backend/.env` (신규, gitignore 적용)
- `lib/api.ts` (신규)
- `.env.local` (신규, gitignore 적용)
- `.gitignore`

---

## [2026-02-19] - 1단계: 프론트엔드 정비 및 콘텐츠 확충

### 수정 (Changed)
- `package.json` — 프로젝트명 `temp_next_app` → `jobible-soulscribe`
- `app/layout.tsx` — 메타데이터 제목 "joBiBle SoulScribe"로 변경, 한국어 설명 업데이트
- `lib/quotes.ts` — 명언 7개 → 30개 이상으로 확충; `category`, `difficulty` 필드 추가
- `app/page.tsx` — "joBiBle SoulScribe" 헤더 브랜딩 반영; Cloze 모드 탭 추가

### 추가 (Added)
- `README.md` — 프로젝트 소개 전면 재작성 (기술 스택, 실행 방법, 디자인 시스템)
- `CHANGELOG.md` — 변경 이력 최초 생성
- `app/components/ClozeMode.tsx` — Partial Cloze(빈칸 채우기) 모드 신규 컴포넌트

### 수정 파일 목록
- `package.json`
- `app/layout.tsx`
- `app/page.tsx`
- `lib/quotes.ts`
- `app/components/ClozeMode.tsx` (신규)
- `README.md`
- `CHANGELOG.md` (신규)
