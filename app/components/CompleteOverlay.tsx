'use client';

import { AIFeedback } from './AIFeedback';

interface CompleteStats {
  mode: 'transcription' | 'scramble' | 'cloze';
  accuracy?: number;
  time?: number;
  charCount?: number;
}

interface CompleteOverlayProps {
  visible: boolean;
  stats: CompleteStats | null;
  onReset: () => void;
  quoteText: string;    // AI 피드백용 원문
  sentenceId: number;   // AI 피드백 캐시 키
}

export default function CompleteOverlay({
  visible,
  stats,
  onReset,
  quoteText,
  sentenceId,
}: CompleteOverlayProps) {
  if (!visible || !stats) return null;

  const isTranscription = stats.mode === 'transcription';
  const isCloze = stats.mode === 'cloze';

  return (
    <div
      className="flex flex-col items-center gap-5 text-center rounded-sm animate-[pulse-gold_2s_ease_infinite]"
      style={{
        padding: '2.5rem',
        background: 'linear-gradient(135deg, #1a1814 0%, #151310 100%)',
        border: '1px solid rgba(201,168,76,0.25)',
      }}
    >
      {/* Icon */}
      <div style={{ fontSize: '2.5rem' }}>✨</div>

      {/* Title */}
      <div
        className="font-light"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.6rem',
          color: 'var(--gold)',
        }}
      >
        Well done, Soul.
      </div>

      {/* Message */}
      <p
        className="italic"
        style={{
          fontSize: '0.9rem',
          color: 'var(--ink-dim)',
          lineHeight: 1.7,
        }}
      >
        {isTranscription ? (
          <>
            정확도 {stats.accuracy}%로 {stats.time}초 만에 완성했습니다.
            <br />
            오늘의 문장이 당신의 손끝에 새겨졌습니다.
          </>
        ) : isCloze ? (
          <>
            모든 빈칸을 정확히 채웠습니다.
            <br />
            핵심 단어들이 당신의 기억 속에 새겨졌습니다.
          </>
        ) : (
          <>
            모든 단어를 올바른 순서로 배열했습니다.
            <br />
            문장의 흐름이 당신의 것이 되었습니다.
          </>
        )}
      </p>

      {/* Stats */}
      <div
        className="flex gap-8"
        style={{
          fontSize: '0.82rem',
          letterSpacing: '0.08em',
        }}
      >
        {isTranscription ? (
          <>
            <div className="text-center">
              <span
                className="block"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '1.5rem',
                  color: 'var(--gold)',
                }}
              >
                {stats.accuracy}%
              </span>
              <span
                className="uppercase"
                style={{
                  color: 'var(--ink-dim)',
                  fontSize: '0.72rem',
                }}
              >
                Accuracy
              </span>
            </div>
            <div className="text-center">
              <span
                className="block"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '1.5rem',
                  color: 'var(--gold)',
                }}
              >
                {stats.time}s
              </span>
              <span
                className="uppercase"
                style={{
                  color: 'var(--ink-dim)',
                  fontSize: '0.72rem',
                }}
              >
                Time
              </span>
            </div>
            <div className="text-center">
              <span
                className="block"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '1.5rem',
                  color: 'var(--gold)',
                }}
              >
                {stats.charCount}
              </span>
              <span
                className="uppercase"
                style={{
                  color: 'var(--ink-dim)',
                  fontSize: '0.72rem',
                }}
              >
                Characters
              </span>
            </div>
          </>
        ) : (
          <div className="text-center">
            <span
              className="block"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '1.5rem',
                color: 'var(--gold)',
              }}
            >
              ✓
            </span>
            <span
              className="uppercase"
              style={{
                color: 'var(--ink-dim)',
                fontSize: '0.72rem',
              }}
            >
              {isCloze ? 'Cloze' : 'Scramble'} Complete
            </span>
          </div>
        )}
      </div>

      {/* Reset button */}
      <button
        onClick={onReset}
        className="uppercase cursor-pointer rounded-sm transition-all hover:bg-[rgba(201,168,76,0.08)]"
        style={{
          background: 'transparent',
          border: '1px solid rgba(201,168,76,0.3)',
          color: 'var(--gold-dim)',
          padding: '0.6rem 2rem',
          fontFamily: "'Crimson Pro', serif",
          fontSize: '0.82rem',
          letterSpacing: '0.12em',
        }}
      >
        Try Again ↺
      </button>

      {/* AI 피드백 — 구분선 */}
      <div
        className="w-full"
        style={{ borderTop: '1px solid rgba(201,168,76,0.1)', paddingTop: '0.5rem' }}
      >
        <AIFeedback sentenceId={sentenceId} quoteText={quoteText} autoFetch />
      </div>
    </div>
  );
}
