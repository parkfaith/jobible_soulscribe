'use client';

import { useState, useRef, useEffect } from 'react';

interface TranscriptionEngineProps {
  originalText: string;
  onComplete: (accuracy: number, time: number, userInput?: string) => void;
  isComplete: boolean;
  fadeLevel?: 0 | 1 | 2 | 3;
}

export default function TranscriptionEngine({
  originalText,
  onComplete,
  isComplete,
  fadeLevel = 0,
}: TranscriptionEngineProps) {
  const [userInput, setUserInput] = useState('');
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [hintOpen, setHintOpen] = useState(false);

  useEffect(() => {
    if (isComplete) {
      setUserInput('');
      startTimeRef.current = null;
      setAccuracy(null);
    }
  }, [isComplete]);

  const handleInput = (value: string) => {
    if (isComplete) return;

    if (!startTimeRef.current && value.length > 0) {
      startTimeRef.current = Date.now();
    }

    setUserInput(value);

    // Calculate accuracy — 원문 전체 길이 대비 정확도
    let correct = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === originalText[i]) correct++;
    }
    const acc = value.length > 0 ? Math.round((correct / originalText.length) * 100) : null;
    setAccuracy(acc);

    // 완전 일치 시 자동 완료
    if (value === originalText && startTimeRef.current) {
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      onComplete(acc || 100, elapsed, value);
    }
  };

  // 제출 버튼 핸들러 — 오타가 있어도 현재 정확도로 완료 처리
  const handleSubmit = () => {
    if (!userInput || isComplete) return;
    const elapsed = startTimeRef.current
      ? Math.round((Date.now() - startTimeRef.current) / 1000)
      : 0;
    onComplete(accuracy ?? 0, elapsed, userInput);
  };

  const progress = Math.min(100, Math.round((userInput.length / originalText.length) * 100));

  return (
    <div className="flex flex-col gap-3">
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
          ✦&nbsp;&nbsp;원문을 그대로 필사하세요&nbsp;&nbsp;✦
        </span>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.25))' }} />
      </div>

      {/* Character display — fadeLevel > 0이면 접었다 펼 수 있는 힌트 */}
      {fadeLevel > 0 ? (
        <div>
          <button
            onClick={() => setHintOpen((prev) => !prev)}
            className="w-full flex items-center gap-2 cursor-pointer rounded-sm transition-all"
            style={{
              background: hintOpen ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.15)',
              border: '1px solid rgba(201,168,76,0.1)',
              padding: '0.7rem 1.2rem',
              color: 'var(--gold-dim)',
              fontFamily: "'Crimson Pro', serif",
              fontSize: '0.78rem',
              letterSpacing: '0.1em',
            }}
          >
            <span style={{
              transform: hintOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              display: 'inline-block',
            }}>
              ▸
            </span>
            <span>{hintOpen ? 'Hide Hint' : 'Show Hint'}</span>
          </button>
          <div
            style={{
              maxHeight: hintOpen ? '300px' : '0',
              overflow: 'hidden',
              transition: 'max-height 0.3s ease',
            }}
          >
            <div
              className="rounded-sm"
              style={{
                background: 'rgba(0,0,0,0.3)',
                borderLeft: '1px solid rgba(201,168,76,0.1)',
                borderRight: '1px solid rgba(201,168,76,0.1)',
                borderBottom: '1px solid rgba(201,168,76,0.1)',
                padding: '1.2rem 1.5rem',
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '1.15rem',
                fontStyle: 'italic',
                lineHeight: 1.8,
                minHeight: '4rem',
                letterSpacing: '0.02em',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                overflow: 'hidden',
              }}
            >
              {originalText.split('').map((char, i) => {
                let className = 'char pending';
                if (i < userInput.length) {
                  className = userInput[i] === char ? 'char correct' : 'char wrong';
                } else if (i === userInput.length) {
                  className = 'char current';
                }
                return (
                  <span key={i} className={className}>
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div
          className="rounded-sm"
          style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(201,168,76,0.1)',
            padding: '1.2rem 1.5rem',
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.15rem',
            fontStyle: 'italic',
            lineHeight: 1.8,
            minHeight: '4rem',
            letterSpacing: '0.02em',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            overflow: 'hidden',
          }}
        >
          {originalText.split('').map((char, i) => {
            let className = 'char pending';
            if (i < userInput.length) {
              className = userInput[i] === char ? 'char correct' : 'char wrong';
            } else if (i === userInput.length) {
              className = 'char current';
            }
            return (
              <span key={i} className={className}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            );
          })}
        </div>
      )}

      {/* Progress bar */}
      <div className="progress-line">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Accuracy */}
      <div
        className="flex justify-between items-center"
        style={{
          fontSize: '0.78rem',
          color: 'var(--ink-dim)',
          letterSpacing: '0.06em',
        }}
      >
        <span>Accuracy</span>
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1rem',
            color: 'var(--gold)',
          }}
        >
          {accuracy !== null ? `${accuracy}%` : '—'}
        </span>
      </div>

      {/* Input textarea */}
      <textarea
        value={userInput}
        onChange={(e) => handleInput(e.target.value)}
        rows={3}
        placeholder="Here, begin your transcription..."
        disabled={isComplete}
        className="w-full outline-none resize-none rounded-sm transition-colors"
        style={{
          background: 'rgba(0,0,0,0.35)',
          border: '1px solid rgba(201,168,76,0.15)',
          padding: '1rem 1.5rem',
          color: 'var(--parchment)',
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.1rem',
          fontStyle: 'italic',
          lineHeight: 1.7,
          caretColor: 'var(--gold)',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          overflowX: 'hidden',
        }}
      />

      {/* 삭제 툴바 + 제출 버튼 — 입력 시작 후 표시 */}
      {userInput.length > 0 && !isComplete && (
        <>
          {/* 삭제 버튼 행 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleInput(userInput.slice(0, -1))}
              className="cursor-pointer rounded-sm transition-all hover:bg-[rgba(201,168,76,0.1)]"
              style={{
                background: 'rgba(201,168,76,0.05)',
                border: '1px solid rgba(201,168,76,0.25)',
                color: 'var(--gold)',
                padding: '0.4rem 1rem',
                fontFamily: "'Crimson Pro', serif",
                fontSize: '0.78rem',
                letterSpacing: '0.08em',
              }}
              title="한 글자 삭제"
            >
              &#x2190; 한 글자
            </button>
            <button
              onClick={() => handleInput('')}
              className="cursor-pointer rounded-sm transition-all hover:bg-[rgba(139,58,58,0.15)]"
              style={{
                background: 'rgba(139,58,58,0.05)',
                border: '1px solid rgba(139,58,58,0.3)',
                color: '#c06060',
                padding: '0.4rem 1rem',
                fontFamily: "'Crimson Pro', serif",
                fontSize: '0.78rem',
                letterSpacing: '0.08em',
              }}
              title="전체 지우기"
            >
              &#x27F2; 전체 지우기
            </button>
          </div>
          {/* 제출 버튼 */}
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
            필사 완료 ↵
          </button>
        </>
      )}
    </div>
  );
}
