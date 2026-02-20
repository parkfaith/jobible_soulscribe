# joBiBle SoulScribe

영혼을 울리는 명언과 문학을 필사하며 지적·정서적으로 성장하는 **리추얼 영어 학습 플랫폼**.

> *joBiBle*은 아내의 닉네임에서 따온 이름입니다.

## 주요 기능

- **필사 모드 (Transcription Mode)**: 원문을 보고 직접 타이핑 — 데스크탑/태블릿
- **단어 스크램블 모드 (Word Scramble Mode)**: 흩어진 단어를 탭하여 문장 완성 — 모바일
- **빈칸 채우기 모드 (Partial Cloze Mode)**: 핵심 키워드 빈칸 채우기 — 모바일
- **스트릭 시스템**: 매일 학습으로 연속 학습일 기록
- **AI 피드백** (예정): 문법 분석, 뉘앙스 해설, 패턴 챌린지

## 개발 환경 실행

```bash
npm install
npm run dev      # 개발 서버 (localhost:3000)
```

## 빌드 및 배포

```bash
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버
npm run lint     # ESLint 검사
```

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 4 |
| 언어 | TypeScript 5 |
| 배포 | Vercel |
| 백엔드 (예정) | FastAPI (Render) |
| DB (예정) | Turso (SQLite at the Edge) |
| AI (예정) | OpenAI GPT-4o |

## 디자인 시스템

```css
--bg: #1a1916        /* 배경 (다크 브라운) */
--gold: #c9a84c      /* 골드 (주요 강조색) */
--ink: #e8dfc8       /* 텍스트 */
--correct: #5a8a5a   /* 정답 */
--wrong: #8b3a3a     /* 오답 */
```

## CHANGELOG

변경 이력은 [CHANGELOG.md](./CHANGELOG.md)를 참고하세요.
