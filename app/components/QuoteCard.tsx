'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Quote } from '@/lib/quotes';
import ShareableCard from './ShareableCard';
import { generateQuoteImage, shareQuoteImage } from '@/lib/share';

interface QuoteCardProps {
  quote: Quote;
  hideText?: boolean; // Scramble/Cloze 모드에서 원문 블러 처리
  fadeLevel?: 0 | 1 | 2 | 3; // Progressive Fading 단계
}

const FADE_STYLES: Record<number, { filter: string; opacity: number }> = {
  0: { filter: 'none', opacity: 1 },
  1: { filter: 'blur(2px)', opacity: 1 },
  2: { filter: 'blur(5px)', opacity: 1 },
  3: { filter: 'blur(8px)', opacity: 0.3 },
};

export default function QuoteCard({ quote, hideText = false, fadeLevel = 0 }: QuoteCardProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isFadeRevealed, setIsFadeRevealed] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const shareableCardRef = useRef<HTMLDivElement>(null);

  // 모드 변경 시 원문 가리기 상태 초기화
  useEffect(() => {
    if (hideText) setIsRevealed(false);
  }, [hideText]);

  // fadeLevel이 0이 되면 선명 보기 해제
  useEffect(() => {
    if (fadeLevel === 0) setIsFadeRevealed(false);
  }, [fadeLevel]);

  // 언마운트 시 Speech Synthesis 정리 (메모리 누수 방지)
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleShare = useCallback(async () => {
    if (!shareableCardRef.current || isSharing) return;
    setIsSharing(true);
    try {
      const blob = await generateQuoteImage(shareableCardRef.current);
      await shareQuoteImage(blob, quote.source);
    } catch (error) {
      console.error('Failed to share quote:', error);
    } finally {
      setIsSharing(false);
    }
  }, [quote.source, isSharing]);

  const handleSpeak = useCallback(() => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(quote.text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;  // 천천히 또렷하게
    utterance.pitch = 1;

    // 영어 원어민 목소리 우선 선택
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && v.localService);
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [quote.text, isSpeaking]);

  return (
    <div
      className="max-w-170 md:max-w-215 w-full relative rounded-sm opacity-0 animate-[slideUp_0.8s_ease_0.5s_forwards]"
      style={{
        background: 'linear-gradient(135deg, #1a1814 0%, #151310 100%)',
        border: '1px solid rgba(201,168,76,0.18)',
        padding: '3.5rem 3.5rem 3rem',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(201,168,76,0.08)',
      }}
    >
      {/* Quote mark */}
      <span
        className="absolute font-light"
        style={{
          top: '1.5rem',
          left: '2.5rem',
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '5rem',
          lineHeight: 1,
          color: 'rgba(201,168,76,0.12)',
        }}
      >
        &ldquo;
      </span>

      {/* Quote text — hideText 모드에서는 블러 처리 */}
      <div className="relative mb-6">
        <p
          className="font-light italic"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(1.25rem, 3vw, 1.6rem)',
            lineHeight: 1.75,
            color: 'var(--parchment)',
            letterSpacing: '0.01em',
            filter: hideText && !isRevealed
              ? 'blur(7px)'
              : isFadeRevealed ? 'none' : FADE_STYLES[fadeLevel].filter,
            opacity: hideText && !isRevealed ? 1 : isFadeRevealed ? 1 : FADE_STYLES[fadeLevel].opacity,
            userSelect: (hideText && !isRevealed) || (!isFadeRevealed && fadeLevel >= 2) ? 'none' : 'auto',
            transition: 'filter 0.3s ease, opacity 0.3s ease',
          }}
        >
          &ldquo;{quote.text}&rdquo;
        </p>

        {/* 블러 오버레이 — 원문 보기 (블러 상태일 때만 중앙 표시) */}
        {hideText && !isRevealed && (
          <button
            onClick={() => setIsRevealed(true)}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(21,19,16,0.15)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            <span
              style={{
                background: 'rgba(21,19,16,0.7)',
                border: '1px solid rgba(201,168,76,0.25)',
                borderRadius: '2px',
                padding: '0.35rem 1rem',
                backdropFilter: 'blur(2px)',
                fontFamily: "'Crimson Pro', serif",
                fontSize: '0.8rem',
                letterSpacing: '0.12em',
                color: 'var(--gold-dim)',
              }}
            >
              👁  원문 보기
            </span>
          </button>
        )}
      </div>

      {/* 우측 상단 버튼 그룹 */}
      <div
        style={{
          position: 'absolute',
          top: '1.4rem',
          right: '1.6rem',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
        }}
      >
        {/* 원문 선명 보기 토글 (Transcription 모드 fading 중일 때만) */}
        {fadeLevel > 0 && !hideText && (
          <button
            onClick={() => setIsFadeRevealed(prev => !prev)}
            title={isFadeRevealed ? '원문 가리기' : '원문 보기'}
            style={{
              background: isFadeRevealed ? 'rgba(201,168,76,0.1)' : 'none',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: '50%',
              width: '2rem',
              height: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isFadeRevealed ? 'var(--gold)' : 'var(--gold-dim)',
              fontSize: '0.85rem',
              transition: 'all 0.2s ease',
            }}
          >
            {isFadeRevealed ? '◉' : '👁'}
          </button>
        )}
        {/* 원문 가리기 버튼 (원문 공개 상태일 때만) */}
        {hideText && isRevealed && (
          <button
            onClick={() => setIsRevealed(false)}
            title="원문 가리기"
            style={{
              background: 'none',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: '50%',
              width: '2rem',
              height: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--gold-dim)',
              fontSize: '0.85rem',
              transition: 'all 0.2s ease',
            }}
          >
            ◉
          </button>
        )}
        {/* 공유 버튼 */}
        <button
          onClick={handleShare}
          disabled={isSharing}
          title="이미지로 공유"
          style={{
            background: 'none',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: '50%',
            width: '2rem',
            height: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isSharing ? 'wait' : 'pointer',
            color: isSharing ? 'var(--gold)' : 'var(--gold-dim)',
            fontSize: '0.85rem',
            transition: 'all 0.2s ease',
            opacity: isSharing ? 0.6 : 1,
          }}
        >
          {isSharing ? (
            <span style={{ fontSize: '0.7rem' }}>···</span>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          )}
        </button>
        {/* 발음 듣기 버튼 */}
        <button
          onClick={handleSpeak}
          title={isSpeaking ? '정지' : '원문 발음 듣기'}
          style={{
            background: 'none',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: '50%',
            width: '2rem',
            height: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: isSpeaking ? 'var(--gold)' : 'var(--gold-dim)',
            fontSize: '0.9rem',
            transition: 'all 0.2s ease',
            boxShadow: isSpeaking ? '0 0 8px rgba(201,168,76,0.3)' : 'none',
          }}
        >
          {isSpeaking ? '⏹' : '🔊'}
        </button>
      </div>

      {/* Divider */}
      <div
        className="w-12 h-px my-5"
        style={{
          background: 'linear-gradient(to right, transparent, var(--gold-dim), transparent)',
        }}
      />

      {/* Source */}
      <p
        className="uppercase"
        style={{
          fontSize: '0.82rem',
          letterSpacing: '0.12em',
          color: 'var(--ink-dim)',
        }}
      >
        — {quote.source} &nbsp;·&nbsp;{' '}
        <em
          className="not-italic"
          style={{
            fontStyle: 'italic',
            color: 'var(--gold-dim)',
            textTransform: 'none',
            letterSpacing: '0.04em',
          }}
        >
          {quote.context}
        </em>
      </p>

      {/* Category & Difficulty badges */}
      <div
        className="flex items-center gap-2"
        style={{ marginTop: '0.8rem' }}
      >
        <span
          style={{
            fontSize: '0.68rem',
            letterSpacing: '0.1em',
            color: 'var(--gold-dim)',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: '2px',
            padding: '0.15rem 0.5rem',
            fontFamily: "'Crimson Pro', serif",
            textTransform: 'uppercase',
          }}
        >
          {quote.category === 'quote' && '✦ Quote'}
          {quote.category === 'poem' && '✦ Poem'}
          {quote.category === 'speech' && '✦ Speech'}
          {quote.category === 'literature' && '✦ Literature'}
        </span>
        <span
          style={{
            fontSize: '0.68rem',
            letterSpacing: '0.1em',
            color: quote.difficulty === 'short' ? 'var(--correct)' : quote.difficulty === 'medium' ? 'var(--gold-dim)' : 'var(--wrong)',
            border: `1px solid ${quote.difficulty === 'short' ? 'rgba(90,138,90,0.25)' : quote.difficulty === 'medium' ? 'rgba(201,168,76,0.2)' : 'rgba(139,58,58,0.25)'}`,
            borderRadius: '2px',
            padding: '0.15rem 0.5rem',
            fontFamily: "'Crimson Pro', serif",
            textTransform: 'uppercase',
          }}
        >
          {quote.difficulty}
        </span>
      </div>

      {/* Translation */}
      <p
        className="italic"
        style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          fontSize: '0.9rem',
          color: 'var(--ink-dim)',
          lineHeight: 1.7,
        }}
      >
        {quote.translation}
      </p>

      {/* Progressive Fading 인디케이터 */}
      {fadeLevel > 0 && (
        <div
          className="flex items-center gap-2"
          style={{
            marginTop: '0.8rem',
            fontSize: '0.72rem',
            color: 'var(--gold-dim)',
            letterSpacing: '0.08em',
            fontFamily: "'Crimson Pro', serif",
          }}
        >
          <span>Memory Fading</span>
          <div className="flex gap-1">
            {[1, 2, 3].map((level) => (
              <div
                key={level}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: level <= fadeLevel
                    ? 'var(--gold-dim)'
                    : 'rgba(201,168,76,0.15)',
                  transition: 'background 0.3s ease',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* 숨겨진 공유용 카드 (html-to-image 캡처 대상) */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '-9999px',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <ShareableCard ref={shareableCardRef} quote={quote} />
      </div>
    </div>
  );
}
