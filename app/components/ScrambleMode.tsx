'use client';

import { useState, useEffect, useMemo } from 'react';
import { chunkSentence } from '@/lib/chunkSentence';

interface ScrambleModeProps {
  originalText: string;
  onComplete: (accuracy: number) => void;
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
  const originalWords = useMemo(() => chunkSentence(originalText), [originalText]);

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

    // 모든 단어 배치 + 완전 일치 시 자동 완료 (정확도 100%)
    if (newSelected.length === scrambledWords.length) {
      const sentence = newSelected.map((s) => s.word).join(' ');
      if (sentence === originalText) {
        onComplete(100);
      }
    }
  };

  // 제출 버튼 핸들러 — 단어 순서 비교 후 정확도 계산
  const handleSubmit = () => {
    if (isComplete) return;
    const userWords = selected.map((s) => s.word);
    const correctCount = userWords.filter((w, i) => w === originalWords[i]).length;
    const accuracy = Math.round((correctCount / originalWords.length) * 100);
    onComplete(accuracy);
  };

  const handleRemoveWord = (selIdx: number) => {
    if (isComplete) return;
    const newSelected = [...selected];
    newSelected.splice(selIdx, 1);
    setSelected(newSelected);
  };

  const handleClearAll = () => {
    if (isComplete) return;
    setSelected([]);
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
            >
              {s.word}
            </span>
          ))
        )}
      </div>

      {/* 되돌리기 안내 + 전체 초기화 */}
      {selected.length > 0 && !isComplete && (
        <div
          className="flex items-center justify-between"
          style={{ fontSize: '0.75rem', color: 'var(--ink-dim)', letterSpacing: '0.04em' }}
        >
          <span style={{ fontFamily: "'Crimson Pro', serif" }}>
            위의 단어를 탭하면 제거됩니다
          </span>
          <button
            onClick={handleClearAll}
            className="cursor-pointer"
            style={{
              background: 'transparent',
              border: '1px solid rgba(139,58,58,0.3)',
              borderRadius: '2px',
              padding: '0.2rem 0.5rem',
              fontFamily: "'Crimson Pro', serif",
              fontSize: '0.72rem',
              color: 'var(--wrong)',
              letterSpacing: '0.06em',
            }}
          >
            전체 초기화
          </button>
        </div>
      )}

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
