'use client';

import { useState, useEffect, useMemo } from 'react';

interface ClozeModeProps {
  originalText: string;
  onComplete: (accuracy: number) => void;
  isComplete: boolean;
}

// 빈칸으로 처리할 핵심 단어 선택 비율 (30%)
const CLOZE_RATIO = 0.3;

// 단어별 빈칸 여부를 담는 인터페이스
interface ClozeWord {
  word: string;
  isCloze: boolean;   // 빈칸 여부
  userInput: string;  // 사용자 입력값
  isCorrect: boolean; // 정답 여부
}

// 빈칸으로 처리할 단어 선택 (짧은 단어 제외, 균등 분포)
function selectClozeIndices(words: string[]): Set<number> {
  const eligible = words
    .map((w, i) => ({ w: w.replace(/[.,!?;:'"()]/g, ''), i }))
    .filter(({ w }) => w.length >= 4); // 4글자 이상만 빈칸 대상

  const count = Math.max(1, Math.round(eligible.length * CLOZE_RATIO));
  const shuffled = [...eligible].sort(() => Math.random() - 0.5);
  return new Set(shuffled.slice(0, count).map(({ i }) => i));
}

export default function ClozeMode({
  originalText,
  onComplete,
  isComplete,
}: ClozeModeProps) {
  const words = useMemo(() => originalText.split(' '), [originalText]);

  const [clozeWords, setClozeWords] = useState<ClozeWord[]>([]);
  const [focusIdx, setFocusIdx] = useState<number>(-1);

  // 컴포넌트 마운트 또는 리셋 시 빈칸 재생성
  useEffect(() => {
    const clozeIndices = selectClozeIndices(words);
    setClozeWords(
      words.map((word, i) => ({
        word,
        isCloze: clozeIndices.has(i),
        userInput: '',
        isCorrect: false,
      }))
    );
    setFocusIdx(-1);
  }, [words, isComplete]);

  // 사용자 입력 처리
  const handleInput = (idx: number, value: string) => {
    if (isComplete) return;

    const updated = clozeWords.map((cw, i) => {
      if (i !== idx) return cw;
      // 구두점을 제거한 원본과 비교
      const cleanOriginal = cw.word.replace(/[.,!?;:'"()]/g, '').toLowerCase();
      const cleanInput = value.trim().toLowerCase();
      return {
        ...cw,
        userInput: value,
        isCorrect: cleanInput === cleanOriginal,
      };
    });
    setClozeWords(updated);

    // 모든 빈칸을 맞췄으면 자동 완료 (정확도 100%)
    const allCorrect = updated
      .filter(cw => cw.isCloze)
      .every(cw => cw.isCorrect);
    if (allCorrect) {
      onComplete(100);
    }
  };

  // 완료된 빈칸 수로 진행률 계산
  const clozeItems = clozeWords.filter(cw => cw.isCloze);
  const correctCount = clozeItems.filter(cw => cw.isCorrect).length;
  const progress = clozeItems.length > 0
    ? Math.round((correctCount / clozeItems.length) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* 장식 구분선 + 레이블 */}
      <div
        className="flex items-center gap-3"
        style={{ marginTop: '0.6rem', marginBottom: '0.2rem' }}
      >
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.25))' }} />
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '0.95rem',
            fontStyle: 'italic',
            letterSpacing: '0.1em',
            color: 'var(--gold-dim)',
            whiteSpace: 'nowrap',
          }}
        >
          ✦&nbsp;&nbsp;빈칸에 알맞은 단어를 입력하세요&nbsp;&nbsp;✦
        </span>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.25))' }} />
      </div>

      {/* 문장 + 빈칸 표시 영역 */}
      <div
        className="flex flex-wrap items-center gap-x-2 gap-y-3 rounded-sm"
        style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(201,168,76,0.1)',
          padding: '1.2rem 1.5rem',
          minHeight: '3.5rem',
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.15rem',
          fontStyle: 'italic',
          color: 'var(--parchment)',
          lineHeight: 2,
        }}
      >
        {clozeWords.map((cw, i) => {
          if (!cw.isCloze) {
            // 일반 단어: 그대로 표시
            return (
              <span key={i} style={{ color: 'var(--ink)' }}>
                {cw.word}
              </span>
            );
          }
          // 빈칸 단어: 입력 필드로 표시
          const cleanWord = cw.word.replace(/[.,!?;:'"()]/g, '');
          const inputWidth = Math.max(4, cleanWord.length + 1);
          return (
            <span key={i} className="inline-flex items-center">
              <input
                type="text"
                value={cw.userInput}
                onChange={e => handleInput(i, e.target.value)}
                onFocus={() => setFocusIdx(i)}
                onBlur={() => setFocusIdx(-1)}
                disabled={isComplete}
                style={{
                  width: `${inputWidth}ch`,
                  background: 'transparent',
                  borderBottom: `2px solid ${
                    cw.userInput === ''
                      ? focusIdx === i
                        ? 'var(--gold)'
                        : 'var(--gold-dim)'
                      : cw.isCorrect
                      ? 'var(--correct)'
                      : 'var(--wrong)'
                  }`,
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  outline: 'none',
                  color: cw.isCorrect ? 'var(--correct)' : 'var(--ink)',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '1.15rem',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  padding: '0 0.1rem',
                  transition: 'border-color 0.2s',
                }}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
              {/* 원래 단어의 구두점이 있으면 입력창 밖에 표시 */}
              {cw.word !== cleanWord && (
                <span style={{ color: 'var(--ink-dim)' }}>
                  {cw.word.slice(cleanWord.length)}
                </span>
              )}
            </span>
          );
        })}
      </div>

      {/* 힌트: 남은 빈칸 수 표시 */}
      <div
        style={{
          fontSize: '0.8rem',
          color: 'var(--ink-dim)',
          textAlign: 'right',
          letterSpacing: '0.05em',
        }}
      >
        {correctCount} / {clozeItems.length} 완성
      </div>

      {/* 진행률 표시줄 */}
      <div className="progress-line">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* 제출 버튼 — 하나 이상 입력 후 표시 */}
      {clozeWords.some(cw => cw.isCloze && cw.userInput.length > 0) && !isComplete && (
        <button
          onClick={() => {
            const clozeItems = clozeWords.filter(cw => cw.isCloze);
            const correctCount = clozeItems.filter(cw => cw.isCorrect).length;
            const accuracy = clozeItems.length > 0
              ? Math.round((correctCount / clozeItems.length) * 100)
              : 0;
            onComplete(accuracy);
          }}
          className="uppercase w-full cursor-pointer rounded-sm transition-all hover:bg-[rgba(201,168,76,0.1)]"
          style={{
            background: 'transparent',
            border: '1px solid rgba(201,168,76,0.25)',
            color: 'var(--gold-dim)',
            padding: '0.6rem',
            fontFamily: "'Crimson Pro', serif",
            fontSize: '0.82rem',
            letterSpacing: '0.14em',
          }}
        >
          빈칸 완료 ↵
        </button>
      )}
    </div>
  );
}
