'use client';

import { useState, useCallback, useEffect } from 'react';
import { Quote } from '@/lib/quotes';

interface QuoteCardProps {
  quote: Quote;
  hideText?: boolean; // Scramble/Cloze 모드에서 원문 블러 처리
}

export default function QuoteCard({ quote, hideText = false }: QuoteCardProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  // 모드 변경 시 원문 가리기 상태 초기화
  useEffect(() => {
    if (hideText) setIsRevealed(false);
  }, [hideText]);

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
            filter: hideText && !isRevealed ? 'blur(7px)' : 'none',
            userSelect: hideText && !isRevealed ? 'none' : 'auto',
            transition: 'filter 0.3s ease',
          }}
        >
          &ldquo;{quote.text}&rdquo;
        </p>

        {/* 블러 오버레이 — 원문 보기/가리기 토글 */}
        {hideText && (
          <button
            onClick={() => setIsRevealed(prev => !prev)}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isRevealed ? 'transparent' : 'rgba(21,19,16,0.15)',
              border: 'none',
              cursor: 'pointer',
              color: isRevealed ? 'rgba(138,111,50,0.5)' : 'var(--gold-dim)',
              fontFamily: "'Crimson Pro', serif",
              fontSize: '0.8rem',
              letterSpacing: '0.12em',
              gap: '0.4rem',
              transition: 'all 0.3s ease',
            }}
          >
            {isRevealed ? (
              <span style={{ marginTop: 'auto', paddingBottom: '0.2rem' }}>
                ◉&nbsp;가리기
              </span>
            ) : (
              <span
                style={{
                  background: 'rgba(21,19,16,0.7)',
                  border: '1px solid rgba(201,168,76,0.25)',
                  borderRadius: '2px',
                  padding: '0.35rem 1rem',
                  backdropFilter: 'blur(2px)',
                }}
              >
                👁&nbsp;&nbsp;원문 보기
              </span>
            )}
          </button>
        )}
      </div>

      {/* 발음 듣기 버튼 */}
      <button
        onClick={handleSpeak}
        title={isSpeaking ? '정지' : '원문 발음 듣기'}
        style={{
          position: 'absolute',
          top: '1.4rem',
          right: '1.6rem',
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
    </div>
  );
}
