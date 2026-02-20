# joBiBle SoulScribe — 개발 문서

> 최종 업데이트: 2026-02-20

---

## 1. 프로젝트 개요

매일 영어 명언을 필사하며 영어 감각을 키우는 리추얼 학습 웹앱.
모바일/태블릿 우선 디자인, 3가지 학습 모드, AI 피드백, 명언 카드 공유 기능을 제공한다.

---

## 2. 인프라

| 구성 요소 | 서비스 | URL / 정보 |
|-----------|--------|-----------|
| 프론트엔드 | Vercel | jobible.net |
| 백엔드 | Render Free Tier | jobible-soulscribe.onrender.com |
| DB | Turso (SQLite at Edge) | 30개 명언 시드 완료 |
| 인증 | Google OAuth (NextAuth v5) | Google Cloud 프로젝트 500600414483 |
| AI 피드백 | OpenAI GPT-4o-mini | Render 환경변수에 API 키 설정 |
| Keep-alive | UptimeRobot | 5분 간격 /health 핑 (Render cold start 방지) |

---

## 3. 기술 스택

**프론트엔드**
- Next.js 16.1.6 (App Router, Turbopack)
- React 19 + TypeScript
- Tailwind CSS 4 + CSS 변수 디자인 시스템
- NextAuth v5 (Google Provider)
- html-to-image (명언 카드 이미지 생성)

**백엔드**
- FastAPI (Python 3.13)
- Turso (libsql) — 프로덕션 / SQLite — 로컬 개발
- OpenAI API (GPT-4o-mini) — AI 피드백

---

## 4. 환경변수

### Vercel (프론트엔드)
| 변수명 | 설명 | 비고 |
|--------|------|------|
| `AUTH_GOOGLE_ID` | Google OAuth Client ID | NextAuth v5 자동 감지 |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret | NextAuth v5 자동 감지 |
| `AUTH_SECRET` | NextAuth JWT 서명 키 | 프로덕션 필수 |
| `NEXT_PUBLIC_API_URL` | 백엔드 API URL | 빌드 타임 번들 — 변경 후 재배포 필수 |

### Render (백엔드)
| 변수명 | 설명 |
|--------|------|
| `TURSO_DATABASE_URL` | Turso DB URL (libsql://...) |
| `TURSO_AUTH_TOKEN` | Turso 인증 토큰 |
| `OPENAI_API_KEY` | OpenAI API 키 (AI 피드백용) |
| `ALLOWED_ORIGINS` | CORS 허용 도메인 (쉼표 구분) |
| `DEBUG` | 디버그 모드 (true/false) |

---

## 5. 파일 구조

```
app/
├── page.tsx                  # 메인 페이지 — 상태 관리, 모드 전환, 완료 처리
├── layout.tsx                # HTML 레이아웃, 폰트, PWA 메타데이터
├── globals.css               # CSS 변수, 애니메이션, 반응형
├── auth.ts                   # NextAuth v5 설정 (Google Provider)
└── components/
    ├── QuoteCard.tsx          # 명언 카드 — 발음 듣기, 이미지 공유, Progressive Fading
    ├── ShareableCard.tsx      # 공유용 이미지 카드 (1080px 고정, forwardRef)
    ├── TranscriptionEngine.tsx # 필사 모드 — 실시간 글자 비교, 힌트
    ├── ScrambleMode.tsx       # 단어 스크램블 모드
    ├── ClozeMode.tsx          # 빈칸 채우기 모드
    ├── CompleteOverlay.tsx     # 학습 완료 화면 + AI 피드백
    ├── AIFeedback.tsx         # AI 피드백 3탭 UI (문법/뉘앙스/연습)
    ├── AuthButton.tsx         # Google 로그인/로그아웃 버튼
    └── Providers.tsx          # NextAuth SessionProvider 래퍼

lib/
├── quotes.ts                 # 명언 데이터 30개 + 일별 선택 로직
├── streak.ts                 # localStorage 기반 연속 학습일 관리
├── fading.ts                 # Progressive Fading 반복 카운트 (localStorage)
├── api.ts                    # FastAPI 백엔드 통신 클라이언트
└── share.ts                  # html-to-image 이미지 생성 + Web Share API

public/
├── manifest.json             # PWA 매니페스트
├── icon-192.png              # PWA 아이콘 (192x192)
├── icon-512.png              # PWA 아이콘 (512x512)
└── apple-touch-icon.png      # iOS 홈화면 아이콘 (180x180)

backend/
├── main.py                   # FastAPI 앱 — CORS, health check, 라우터 등록
├── config.py                 # 환경변수 설정 (pydantic-settings)
├── database.py               # Turso/SQLite 연결 관리
├── schema.sql                # DB 스키마 (daily_sentences, study_logs, users, ai_feedbacks)
├── seed.py                   # 초기 명언 데이터 시드 스크립트
└── routers/
    ├── sentences.py           # GET /sentences/today — 오늘의 명언
    ├── logs.py                # POST /study-logs — 학습 기록 저장
    ├── users.py               # POST /users/register — 사용자 등록
    └── feedback.py            # POST /feedback — AI 피드백 (GPT-4o-mini + 캐싱)
```

---

## 6. 구현 완료 기능

### 6.1 학습 모드 (3가지)
- **Transcription**: 원문을 보고 직접 타이핑, 실시간 글자 비교 (데스크탑 기본)
- **Scramble**: 단어를 드래그하여 올바른 순서로 배열 (모바일 기본)
- **Cloze**: 핵심 단어 빈칸 채우기
- 화면 크기 768px 기준으로 자동 전환

### 6.2 Progressive Fading
- "다시 연습하기" 클릭 시 반복 횟수(repeatCount) 증가
- 단계별 blur: 0(선명) → 1(2px) → 2(5px) → 3(8px + opacity 0.3)
- Transcription 모드에서만 적용, Scramble/Cloze는 기존 hideText 유지
- localStorage에 날짜별 저장, 다음 날 자동 리셋

### 6.3 명언 카드 이미지 공유
- QuoteCard 우측 상단 ↗ 버튼 클릭
- ShareableCard (1080px 너비, 콘텐츠 기반 높이) → html-to-image로 PNG 생성
- 모바일: Web Share API (네이티브 공유 시트) / 데스크탑: PNG 다운로드
- 디자인: 외곽 프레임, 4개 코너 오너먼트, 대형 따옴표, 골드 구분선, 브랜딩
- Google Fonts CORS 이슈 → fontEmbedCSS 옵션으로 해결

### 6.4 AI 피드백
- 학습 완료 후 "선생님 피드백 보기" 버튼 클릭
- 백엔드 POST /feedback → GPT-4o-mini 호출
- 3개 탭: 문법 분석 / 뉘앙스 해설 / 연습 문장
- ai_feedbacks 테이블에 캐싱 (동일 문장 재요청 시 즉시 반환)
- OPENAI_API_KEY 미설정 시 목업 피드백 반환

### 6.5 PWA
- manifest.json — standalone 모드, 테마색 골드(#c9a84c)
- apple-touch-icon — iOS 홈화면 추가 지원
- 아이콘: jobible_soulscribe.png → 192/512/180px 리사이즈

### 6.6 기타
- Google OAuth 로그인 + 백엔드 자동 등록
- localStorage 기반 스트릭 (연속 학습일)
- 원문 발음 듣기 (Web Speech API)
- UptimeRobot keep-alive (HEAD /health 지원)

---

## 7. 코드 리뷰 결과 (2026-02-20)

### 수정 완료
| 심각도 | 파일 | 내용 |
|--------|------|------|
| CRITICAL | QuoteCard.tsx | Speech Synthesis 언마운트 시 cancel() cleanup 추가 |
| CRITICAL | QuoteCard.tsx | handleShare의 isSharing deps 제거 (불필요한 재생성) |
| CRITICAL | page.tsx | session?.user?.id 가드 추가 (undefined 전송 방지) |
| WARNING | AuthButton.tsx | e.target → e.currentTarget (hover 버그 수정) |
| WARNING | quotes.ts | 중복 dayOfYear 로직 → getDayOfYear() 헬퍼 추출 |
| WARNING | quotes.ts | 미사용 getQuotesByCategory/Difficulty 함수 삭제 |
| CLEANUP | public/ | Next.js 기본 보일러플레이트 SVG 5개 삭제 |
| CLEANUP | globals.css | 미사용 .streak-bar, .quote-card CSS 삭제 |

### 향후 개선 권장사항
| 우선순위 | 내용 |
|----------|------|
| 중 | ScrambleMode/ClozeMode의 편향 셔플 → Fisher-Yates 알고리즘 적용 |
| 중 | Google Fonts `<link>` → `next/font` 마이그레이션 (성능 + FOUT 방지) |
| 중 | `.env.example` 파일 생성 (배포 시 필수 환경변수 문서화) |
| 중 | next.config.ts에 보안 헤더 + images.remotePatterns 추가 |
| 낮 | TranscriptionEngine의 handleInput 메모이제이션 |
| 낮 | API 응답 런타임 검증 (타입 캐스팅만으로는 불충분) |
| 낮 | AuthButton 인라인 hover → CSS 전환 |
| 낮 | 루트의 soulscribe.html, PDF 3개 git에서 제거 |

---

## 8. 개발 명령어

```bash
# 프론트엔드
npm run dev          # 개발 서버 (localhost:3000)
npm run build        # 프로덕션 빌드
npm run lint         # ESLint

# 백엔드
cd backend
uvicorn main:app --reload          # 로컬 개발 (localhost:8000)
python seed.py                     # 명언 데이터 시드

# Windows 서버 재시작
taskkill //F //IM "node.exe"       # Node 프로세스 강제 종료
```

---

## 9. 향후 로드맵

- [ ] **STT 모드** — 음성 입력으로 명언 받아쓰기
- [ ] **Spaced Repetition** — 틀린 문장 반복 학습 (백엔드 연동)
- [ ] **Master's Library** — 완료한 명언 아카이브 (백엔드 연동)
- [ ] **next/font 마이그레이션** — 자체 호스팅 폰트로 전환
