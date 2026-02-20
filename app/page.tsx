'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getTodayQuote, getTodayQuoteIndex, Quote } from '@/lib/quotes';
import { getStreak, markComplete, isCompletedToday } from '@/lib/streak';
import { getTodayRepeatCount, incrementRepeatCount } from '@/lib/fading';
import { postStudyLog, registerUser } from '@/lib/api';
import QuoteCard from './components/QuoteCard';
import TranscriptionEngine from './components/TranscriptionEngine';
import ScrambleMode from './components/ScrambleMode';
import ClozeMode from './components/ClozeMode';
import CompleteOverlay from './components/CompleteOverlay';
import { AuthButton } from './components/AuthButton';

type Mode = 'transcription' | 'scramble' | 'cloze';

interface CompleteStats {
  mode: Mode;
  accuracy?: number;
  time?: number;
  charCount?: number;
}

export default function Home() {
  const { data: session } = useSession();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [dateStr, setDateStr] = useState('');
  const [streak, setStreak] = useState(0);
  const [mode, setMode] = useState<Mode>('transcription');
  const [isComplete, setIsComplete] = useState(false);
  const [completeStats, setCompleteStats] = useState<CompleteStats | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [completedToday, setCompletedToday] = useState(false);
  const [repeatCount, setRepeatCount] = useState(0);

  useEffect(() => {
    // 클라이언트 초기화
    const todayQuote = getTodayQuote();
    setQuote(todayQuote);
    setCompletedToday(isCompletedToday());
    setRepeatCount(getTodayRepeatCount());

    const now = new Date();
    const formatted = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    setDateStr(formatted);

    setStreak(getStreak());

    // 화면 크기에 따른 기본 모드 설정 (768px 기준)
    const isMobile = window.innerWidth < 768;
    setMode(isMobile ? 'scramble' : 'transcription');

    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setMode(prev => {
        // 데스크탑으로 전환 시 필사 모드로, 모바일로 전환 시 스크램블 모드로
        if (!isMobile && prev !== 'transcription') return 'transcription';
        if (isMobile && prev === 'transcription') return 'scramble';
        return prev;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 첫 로그인 시 백엔드 users 테이블에 자동 등록
  useEffect(() => {
    if (session?.user?.id) {
      registerUser({
        google_id: session.user.id,
        email: session.user.email ?? '',
        name: session.user.name ?? undefined,
      }).catch(() => {/* 실패해도 무시 */});
    }
  }, [session?.user?.id]);

  const handleTranscriptionComplete = (accuracy: number, time: number) => {
    setIsComplete(true);
    setCompleteStats({
      mode: 'transcription',
      accuracy,
      time,
      charCount: quote?.text.length,
    });
    const newStreak = markComplete();
    setStreak(newStreak);

    // 학습 기록 서버 저장 (실패해도 UX 차단 없음)
    postStudyLog({
      user_id: session?.user?.id ?? null,
      mode: 'transcription',
      accuracy,
      time_seconds: time,
    }).catch(() => {});
  };

  const handleScrambleComplete = () => {
    setIsComplete(true);
    setCompleteStats({ mode: 'scramble' });
    const newStreak = markComplete();
    setStreak(newStreak);

    postStudyLog({
      user_id: session?.user?.id ?? null,
      mode: 'scramble',
    }).catch(() => {});
  };

  const handleClozeComplete = () => {
    setIsComplete(true);
    setCompleteStats({ mode: 'cloze' });
    const newStreak = markComplete();
    setStreak(newStreak);

    postStudyLog({
      user_id: session?.user?.id ?? null,
      mode: 'cloze',
    }).catch(() => {});
  };

  const handleReset = () => {
    setIsComplete(false);
    setCompleteStats(null);
    setResetKey((k) => k + 1);
    const newCount = incrementRepeatCount();
    setRepeatCount(newCount);
  };

  const switchMode = (newMode: Mode) => {
    if (!isComplete) {
      setMode(newMode);
    }
  };

  if (!quote) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div style={{ color: 'var(--gold)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      {/* 헤더 */}
      <header
        className="flex items-center justify-between"
        style={{
          padding: '2rem 2.5rem 1.5rem',
          borderBottom: '1px solid rgba(201,168,76,0.12)',
        }}
      >
        <div className="flex flex-col leading-none">
          <span
            className="uppercase"
            style={{
              fontFamily: "'IM Fell English', serif",
              fontSize: '0.7rem',
              letterSpacing: '0.25em',
              color: 'var(--gold-dim)',
            }}
          >
            joBiBle
          </span>
          <span
            className="font-light"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.6rem',
              color: 'var(--gold)',
              letterSpacing: '0.05em',
            }}
          >
            SoulScribe
          </span>
        </div>
        <div className="flex flex-col items-end gap-2">
          <AuthButton />
          <div
            className="text-right"
            style={{
              fontSize: '0.78rem',
              color: 'var(--ink-dim)',
              letterSpacing: '0.08em',
            }}
          >
            <div
              className="italic"
              style={{
                fontFamily: "'IM Fell English', serif",
                fontSize: '0.85rem',
                color: 'var(--gold-dim)',
              }}
            >
              {dateStr}
            </div>
            <div>Daily Transcription</div>
          </div>
        </div>
      </header>

      {/* 스트릭 바 */}
      <div
        className="flex items-center gap-2"
        style={{
          padding: '0.6rem 2.5rem',
          fontSize: '0.78rem',
          color: 'var(--ink-dim)',
          letterSpacing: '0.06em',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        <span
          style={{
            fontSize: '1rem',
            filter: 'drop-shadow(0 0 4px rgba(255,140,0,0.6))',
          }}
        >
          🔥
        </span>
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.1rem',
            color: 'var(--gold)',
            fontWeight: 400,
          }}
        >
          {streak}
        </span>
        <span>day streak</span>
        <span className="ml-auto italic">
          &ldquo;A sentence a day keeps the silence away.&rdquo;
        </span>
      </div>

      {/* 메인 콘텐츠 */}
      <main
        className="flex-1 flex flex-col items-center"
        style={{ padding: '3rem 1.5rem 4rem', gap: 0 }}
      >
        {/* 명언 카드 — Scramble/Cloze 모드에서는 원문 블러 처리 */}
        <QuoteCard
          quote={quote}
          hideText={mode !== 'transcription' && !isComplete}
          fadeLevel={isComplete ? 0 : Math.min(3, repeatCount) as 0 | 1 | 2 | 3}
        />

        {/* 모드 탭 — 3가지 모드 */}
        <div
          className="max-w-170 md:max-w-215 w-full flex mt-8 rounded-sm overflow-hidden opacity-0 animate-[fadeIn_0.6s_ease_1s_forwards]"
          style={{ border: '1px solid rgba(201,168,76,0.15)' }}
        >
          {/* 필사 모드 탭 */}
          <button
            onClick={() => switchMode('transcription')}
            className={`flex-1 cursor-pointer uppercase transition-all ${
              mode === 'transcription' ? '' : 'hover:bg-[rgba(255,255,255,0.03)]'
            }`}
            style={{
              padding: '0.75rem',
              background: mode === 'transcription' ? 'rgba(201,168,76,0.1)' : 'transparent',
              border: 'none',
              borderRight: '1px solid rgba(201,168,76,0.12)',
              color: mode === 'transcription' ? 'var(--gold)' : 'var(--ink-dim)',
              fontFamily: "'Crimson Pro', serif",
              fontSize: '0.82rem',
              letterSpacing: '0.12em',
            }}
          >
            ✍ Transcription
          </button>
          {/* 단어 스크램블 탭 */}
          <button
            onClick={() => switchMode('scramble')}
            className={`flex-1 cursor-pointer uppercase transition-all ${
              mode === 'scramble' ? '' : 'hover:bg-[rgba(255,255,255,0.03)]'
            }`}
            style={{
              padding: '0.75rem',
              background: mode === 'scramble' ? 'rgba(201,168,76,0.1)' : 'transparent',
              border: 'none',
              borderRight: '1px solid rgba(201,168,76,0.12)',
              color: mode === 'scramble' ? 'var(--gold)' : 'var(--ink-dim)',
              fontFamily: "'Crimson Pro', serif",
              fontSize: '0.82rem',
              letterSpacing: '0.12em',
            }}
          >
            ◈ Scramble
          </button>
          {/* 빈칸 채우기 탭 */}
          <button
            onClick={() => switchMode('cloze')}
            className={`flex-1 cursor-pointer uppercase transition-all ${
              mode === 'cloze' ? '' : 'hover:bg-[rgba(255,255,255,0.03)]'
            }`}
            style={{
              padding: '0.75rem',
              background: mode === 'cloze' ? 'rgba(201,168,76,0.1)' : 'transparent',
              border: 'none',
              color: mode === 'cloze' ? 'var(--gold)' : 'var(--ink-dim)',
              fontFamily: "'Crimson Pro', serif",
              fontSize: '0.82rem',
              letterSpacing: '0.12em',
            }}
          >
            ☐ Cloze
          </button>
        </div>

        {/* 오늘 이미 완료한 경우 안내 배너 */}
        {completedToday && !isComplete && (
          <div
            className="max-w-170 md:max-w-215 w-full mt-6 flex items-center gap-3 rounded-sm"
            style={{
              padding: '0.7rem 1.2rem',
              background: 'rgba(90,138,90,0.08)',
              border: '1px solid rgba(90,138,90,0.2)',
              fontSize: '0.85rem',
              color: 'var(--correct)',
              letterSpacing: '0.04em',
            }}
          >
            <span style={{ fontSize: '1rem' }}>✓</span>
            <span style={{ fontFamily: "'Crimson Pro', serif" }}>
              오늘의 학습을 이미 완료했습니다. 다시 연습할 수 있습니다.
            </span>
          </div>
        )}

        {/* 학습 영역 */}
        <div
          className="max-w-170 md:max-w-215 w-full mt-6 opacity-0 animate-[fadeIn_0.6s_ease_1.1s_forwards]"
        >
          {isComplete ? (
            <CompleteOverlay
              visible={isComplete}
              stats={completeStats}
              onReset={handleReset}
              quoteText={quote.text}
              sentenceId={getTodayQuoteIndex()}
            />
          ) : mode === 'transcription' ? (
            <TranscriptionEngine
              key={`transcription-${resetKey}`}
              originalText={quote.text}
              onComplete={handleTranscriptionComplete}
              isComplete={isComplete}
              fadeLevel={Math.min(3, repeatCount) as 0 | 1 | 2 | 3}
            />
          ) : mode === 'scramble' ? (
            <ScrambleMode
              key={`scramble-${resetKey}`}
              originalText={quote.text}
              onComplete={handleScrambleComplete}
              isComplete={isComplete}
            />
          ) : (
            <ClozeMode
              key={`cloze-${resetKey}`}
              originalText={quote.text}
              onComplete={handleClozeComplete}
              isComplete={isComplete}
            />
          )}
        </div>
      </main>

      {/* 푸터 */}
      <footer className="w-full flex justify-center">
        <div
          className="max-w-170 md:max-w-215 w-full flex justify-between items-center"
          style={{
            padding: '1.5rem 1.5rem',
            borderTop: '1px solid rgba(255,255,255,0.04)',
            fontSize: '0.72rem',
            color: 'rgba(154,144,128,0.5)',
            letterSpacing: '0.08em',
          }}
        >
          <span>&copy; 2026 joBiBle SoulScribe</span>
          <span>Made by JunHyoung Park</span>
        </div>
      </footer>
    </div>
  );
}
