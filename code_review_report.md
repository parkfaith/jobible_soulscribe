# 코드 리뷰 리포트: joBiBle SoulScribe

## 개요

**joBiBle SoulScribe**는 영어 명언 필사, 단어 스크램블, 빈칸 채우기 테스트를 통해 영어를 학습하도록 설계된 Next.js(프론트엔드) 및 FastAPI(백엔드) 웹 애플리케이션입니다. 이 애플리케이션은 Next.js의 App Router, 인증을 위한 NextAuth, 엣지 기반 데이터베이스 관리를 위한 Turso(libsql), AI 기반 피드백을 위한 OpenAI 등의 견고하고 현대적인 스택을 사용합니다.

코드베이스 구조는 프론트엔드(`app`), 공통 유틸리티/API(`lib`), 백엔드(`backend`)로 논리적으로 잘 분리되어 있습니다.

---

## 1. 프론트엔드 리뷰 (Next.js)

### 강점 (Strengths)

- **최신 Next.js 활용**: App Router(`app/page.tsx`, `app/layout.tsx`)를 올바르게 활용하고 있으며, 클라이언트 측 상호작용이 필요한 곳에 `'use client'`를 적절히 사용하고 있습니다.
- **컴포넌트화**: components 폴더가 잘 구조화되어 있습니다. `QuoteCard`, `TranscriptionEngine`, `AIFeedback`과 같은 복잡한 로직이 적절히 모듈화되어 있습니다.
- **상태 관리**: 네비게이션 이동이나 예기치 않은 앱 새로고침 시에도 상태를 유지하기 위해 React 로컬 상태와 더불어 `sessionStorage`를 활용한 점이 훌륭합니다.
- **디자인 시스템**: 깔끔하고 통일감 있는 "골드/다크" 미학을 위해 CSS 변수(`globals.css`)를 순수하게 사용한 점이 좋습니다.

### 개선 사항 (Areas for Improvement)

- **`page.tsx` 내 Hydration 불일치(Mismatch) 위험**:
  - `useEffect` 내에서 초기 모드(`transcription` 또는 `scramble`)를 설정하기 위해 `window.innerWidth`를 사용하고 있습니다. `useEffect`는 클라이언트에서만 실행되는 반면, 초기 상태는 `'transcription'`으로 하드코딩되어 있습니다. 모바일 기기에서 페이지가 Hydration될 때 처음에는 `'transcription'`으로 렌더링되다가 JS가 로드된 후 갑자기 `'scramble'`로 전환되는 깜빡임 현상이 발생할 수 있습니다.
  - **권장 사항**: 초기 렌더링 스켈레톤이나 로딩 상태를 창 크기에만 의존하지 않도록 하거나, 가능하다면 React 상태 렌더링 대신 CSS 미디어 쿼리를 사용하여 초기 UI를 처리하세요. React 상태를 사용해야 한다면 렌더링 깜빡임을 방지하기 위해 `isMounted` 플래그를 함께 사용하는 것이 좋습니다.

- **`useEffect` 모범 사례**:
  - `page.tsx`에서 `session?.user?.id`가 변경될 때 `registerUser`가 호출됩니다. 이는 좋지만, 발생하는 에러를 `().catch(() => {/* ... */})`로 조용히 무시하고 있어 추후에 백엔드 회원 가입 실패 문제를 디버깅하기 어려울 수 있습니다.
  - 개발 시 문제를 파악할 수 있도록 최소한 `console.error` 패치 정도는 추가해 두는 것을 권장합니다.

- **SessionStorage 도우미 함수 분리**:
  - 현재 `loadSession`과 `saveSession` 함수가 `page.tsx` 내부 공간을 차지하고 있습니다. 이를 `useSessionState`와 같은 커스텀 훅으로 분리하면 메인 페이지 컴포넌트 코드가 훨씬 깔끔해질 것입니다.

---

## 2. 백엔드 리뷰 (FastAPI)

### 강점 (Strengths)

- **깔끔한 아키텍처**: `main.py`, `database.py`, `routers/` 폴더 등으로 FastAPI 애플리케이션의 구조가 잘 정돈되어 있습니다.
- **Turso Edge/Local 대체 (Fallback)**: `database.py`에서 `libsql`을 사용할 수 없거나 환경 설정이 누락된 경우 표준 `sqlite3`로 지능적으로 대체 동작(fallback)하게 설계하여 로컬 개발 환경 구성이 매우 매끄럽습니다.
- **Lifespan 활용**: FastAPI Lifespan 이벤트(`init_db()`) 처리에 최신 표준 권장 방식인 `@asynccontextmanager`를 `main.py`에서 활용하고 있습니다 (기존 `@app.on_event("startup")` 대체).

### 개선 사항 (Areas for Improvement)

- **`sentences.py` 내의 타임존 처리 (Timezone Handling)**:
  - `_get_day_of_year()` 함수가 `datetime.date.today().timetuple().tm_yday`를 사용하고 있습니다. 이는 시스템/서버의 로컬 타임존에 의존합니다. Render에 배포될 경우(일반적으로 UTC 기본값), "오늘의 문장"은 한국 표준시(KST) 자정이 아닌 UTC 자정을 기준으로 변경됩니다.
  - **권장 사항**: 사용자가 주로 한국에 있다면 타임존을 인식하는 계산 방식을 적용하세요: `datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9)))` 등을 사용하여 KST 기준의 현재 날짜를 가져오도록 수정하는 것이 좋습니다.

- **Lifespan 중 동기적인 파일 I/O 및 DB 처리**:
  - `database.py`에서 `init_db`가 `schema.sql`을 동기적으로 열고 실행합니다. 서버 시작 시에는 큰 무리가 없지만, 외부 원격 DB 연결이 느릴 경우에는 블로킹이 발생할 수 있습니다. 하지만 가벼운 DB 초기화 과정이므로 현재 수준에서는 크게 문제되지 않습니다.

- **엔드포인트의 데이터베이스 연결 관리 (Connection Management)**:
  - 각 엔드포인트 내에서 `conn = get_db()`를 객체화하고 `finally`로 닫고 있습니다. 이는 안전하지만, FastAPI는 이러한 작업에 **Dependencies**(`Depends(get_db_session)`)를 사용하는 것을 강력히 권장합니다 (`db_context()` 또는 제너레이터 `yield conn` 활용). 이를 통해 리소스 관리와 비즈니스 로직을 완벽히 분리할 수 있습니다.

---

## 3. 전반적인 아키텍처 및 보안 권장 사항

- **CORS 설정**: `allowed_origins`를 환경 변수에서 읽어오도록 구성한 점은 보안 관점에서 매우 훌륭합니다.
- **환경 변수 문서화**: `DEV_NOTES.md`에 `.env.example` 생성 예정 작업이 있는 것을 보았습니다. 새로운 기여자나 오랜만에 코드를 다시 볼 당신을 위해 필요한 환경 설정을 명확히 문서화하는 것을 적극 권장합니다.
- **API 응답 검증**: `DEV_NOTES.md`에 기록된 것처럼 프론트엔드에서 런타임에 API 응답 검사(예: Zod 사용)를 추가하면 예상치 못한 스키마 변경 시 발생하는 에러를 안전하게 방어할 수 있습니다.

## 결론

이 애플리케이션은 탄탄한 구조적 기반과 명확한 관심사 분리(Separation of Concerns), 그리고 프로그레시브 웹 앱(PWA) 지원 및 점진적 블러링(Progressive Fading) 알고리즘과 같은 세심한 디테일을 갖추어 매우 훌륭하게 구축되었습니다. 백엔드의 사소한 타임존 차이와 프론트엔드의 SSR Hydration 이슈를 보완한다면 실 서비스(Production) 환경에서 완벽하게 안정적인 작동을 보장할 수 있을 것입니다.
