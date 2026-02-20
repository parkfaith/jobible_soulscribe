'use client';

import { useState, useEffect, useMemo } from 'react';

interface ScrambleModeProps {
  originalText: string;
  onComplete: () => void;
  isComplete: boolean;
}

interface SelectedWord {
  idx: number;
  word: string;
}

export default function ScrambleMode({
  originalText,
  onComplete,
  isComplete,
}: ScrambleModeProps) {
  const originalWords = useMemo(() => originalText.split(' '), [originalText]);

  const [scrambledWords, setScrambledWords] = useState<string[]>([]);
  const [selected, setSelected] = useState<SelectedWord[]>([]);

  // Shuffle words on mount or reset
  useEffect(() => {
    const shuffled = [...originalWords].sort(() => Math.random() - 0.5);
    setScrambledWords(shuffled);
    setSelected([]);
  }, [originalWords, isComplete]);

  const handleSelectWord = (idx: number) => {
    if (isComplete) return;
    if (selected.some((s) => s.idx === idx)) return;

    const newSelected = [...selected, { idx, word: scrambledWords[idx] }];
    setSelected(newSelected);

    // 모든 단어 배치 + 완전 일치 시 자동 완료
    if (newSelected.length === scrambledWords.length) {
      const sentence = newSelected.map((s) => s.word).join(' ');
      if (sentence === originalText) {
        onComplete();
      }
    }
  };

  // 제출 버튼 핸들러 — 순서가 틀려도 완료 처리
  const handleSubmit = () => {
    if (isComplete) return;
    onComplete();
  };

  const handleRemoveWord = (selIdx: number) => {
    if (isComplete) return;
    const newSelected = [...selected];
    newSelected.splice(selIdx, 1);
    setSelected(newSelected);
  };

  const progress = Math.round((selected.length / scrambledWords.length) * 100);

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
          ✦&nbsp;&nbsp;단어를 탭하여 문장을 완성하세요&nbsp;&nbsp;✦
        </span>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.25))' }} />
      </div>

      {/* Answer area */}
      <div
        className="flex flex-wrap gap-2 items-center rounded-sm"
        style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(201,168,76,0.1)',
          padding: '1.2rem 1.5rem',
          minHeight: '3.5rem',
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.1rem',
          fontStyle: 'italic',
          color: 'var(--parchment)',
          lineHeight: 1.8,
        }}
      >
        {selected.length === 0 ? (
          <span
            className="italic"
            style={{
              color: 'var(--ink-dim)',
              fontSize: '0.85rem',
              letterSpacing: '0.08em',
            }}
          >
            단어를 선택하면 여기에 나타납니다...
          </span>
        ) : (
          selected.map((s, i) => (
            <span
              key={`${s.idx}-${i}`}
              className="answer-word"
              onClick={() => handleRemoveWord(i)}
              title="클릭하여 제거"
            >
              {s.word}
            </span>
          ))
        )}
      </div>

      {/* Word pool */}
      <div className="flex flex-wrap gap-2">
        {scrambledWords.map((word, idx) => {
          const isSelected = selected.some((s) => s.idx === idx);
          return (
            <span
              key={idx}
              className={`word-chip ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSelectWord(idx)}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="progress-line">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* 제출 버튼 — 단어 하나 이상 배치 후 표시 */}
      {selected.length > 0 && !isComplete && (
        <button
          onClick={handleSubmit}
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
          배열 완료 ↵
        </button>
      )}
    </div>
  );
}
