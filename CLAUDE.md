# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SoulScribe는 매일 명언을 필사하는 웹 앱입니다. 모바일/태블릿 우선 디자인으로, 두 가지 학습 모드를 제공합니다:
- **Transcription Mode**: 원문을 보고 직접 타이핑 (데스크탑)
- **Word Scramble Mode**: 단어를 재배열하여 문장 완성 (모바일/태블릿)

## Commands

```bash
npm run dev      # 개발 서버 실행 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 실행
```

## Architecture

### Tech Stack
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4

### Directory Structure

```
app/
├── page.tsx              # 메인 페이지 (상태 관리, 레이아웃)
├── layout.tsx            # HTML 레이아웃, 폰트 로딩
├── globals.css           # CSS 변수, 애니메이션, 전역 스타일
└── components/
    ├── QuoteCard.tsx           # 명언 표시 카드
    ├── TranscriptionEngine.tsx # 필사 모드 (실시간 글자 비교)
    ├── ScrambleMode.tsx        # 단어 스크램블 모드
    └── CompleteOverlay.tsx     # 완료 화면 + 통계

lib/
├── quotes.ts             # 명언 데이터 및 일별 명언 선택 로직
└── streak.ts             # localStorage 기반 연속 학습일 관리
```

### Key Patterns

- **Client Components**: 모든 인터랙티브 컴포넌트는 `'use client'` 사용
- **State Management**: React useState/useEffect로 로컬 상태 관리
- **Persistence**: localStorage를 통한 스트릭 데이터 저장
- **Responsive Mode**: 화면 크기에 따라 자동으로 모드 전환 (768px 기준)

### Design System (CSS Variables)

```css
--bg: #1a1916        /* 배경 (다크 브라운) */
--gold: #c9a84c      /* 골드 (주요 강조색) */
--gold-dim: #8a6f32  /* 골드 (보조) */
--ink: #e8dfc8       /* 텍스트 */
--correct: #5a8a5a   /* 정답 */
--wrong: #8b3a3a     /* 오답 */
```

### Fonts
- Cormorant Garamond: 명언, 제목
- Crimson Pro: 본문
- IM Fell English: 로고, 날짜

## Project Rules (필수 준수)

1. **언어**: 모든 응답과 코드 주석은 **한국어**로 작성. 기술 용어는 영어 병기 가능 (예: 변수(Variable))
2. **CHANGELOG.md**: 코드 수정 후 반드시 업데이트 — 날짜, 카테고리, 상세 내용, 수정 파일 목록 포함