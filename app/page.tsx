'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FALLBACK_QUOTE, Quote } from '@/lib/quotes';
import { getStreak, markComplete, isCompletedToday } from '@/lib/streak';
import { getTodayRepeatCount, incrementRepeatCount } from '@/lib/fading';
import { fetchTodaySentence, postStudyLog, registerUser } from '@/lib/api';
import QuoteCard from './components/QuoteCard';
import TranscriptionEngine from './components/TranscriptionEngine';
import ScrambleMode from './components/ScrambleMode';
import ClozeMode from './components/ClozeMode';
import CompleteOverlay from './components/CompleteOverlay';
import { AuthButton } from './components/AuthButton';
import { AIFeedback } from './components/AIFeedback';
import InstallPrompt from './components/InstallPrompt';
import VisitorCounter from './components/VisitorCounter';
import type { Mode, CompleteStats } from '@/lib/types';

// sessionStorage 키
const SS_KEY = 'soulscribe-session';

interface SessionState {
  isComplete: boolean;
  completeStats: CompleteStats | null;
  mode: Mode;
  // 모드별 완료 상태 저장
  modeCompleted?: Partial<Record<Mode, CompleteStats>>;
}

function saveSession(state: SessionState) {
  try { sessionStorage.setItem(SS_KEY, JSON.stringify(state)); } catch { }
}

function loadSession(): SessionState | null {
  try {
    const raw = sessionStorage.getItem(SS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export default function Home() {
  const { data: session } = useSession();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [dateStr, setDateStr] = useState('');
  const [streak, setStreak] = useState(0);
  const [mode, setMode] = useState<Mode>('transcription');
  const [userChoseMode, setUserChoseMode] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [completeStats, setCompleteStats] = useState<CompleteStats | null>(null);
  const [modeCompleted, setModeCompleted] = useState<Partial<Record<Mode, CompleteStats>>>({});
  const [resetKey, setResetKey] = useState(0);
  const [completedToday, setCompletedToday] = useState(false);
  const [repeatCount, setRepeatCount] = useState(0);

  useEffect(() => {
    // 클라이언트 초기화 — 백엔드 API에서 오늘의 명언 가져오기
    async function loadQuote() {
      try {
        const sentence = await fetchTodaySentence();
        setQuote({
          id: sentence.id,
          text: sentence.text,
          source: sentence.source ?? '',
          context: sentence.context ?? '',
          translation: sentence.translation ?? '',
          category: sentence.category,
          difficulty: sentence.difficulty,
        });
      } catch {
        console.warn('API 호출 실패, 폴백 명언 사용');
        setQuote(FALLBACK_QUOTE);
      }
    }
    loadQuote();

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

    // sessionStorage에서 완료 상태 복원 (앱 전환 후 복귀 대응)
    const saved = loadSession();
    if (saved) {
      setMode(saved.mode);
      setUserChoseMode(true);
      if (saved.modeCompleted) {
        setModeCompleted(saved.modeCompleted);
      }
      if (saved.isComplete) {
        setIsComplete(true);
        setCompleteStats(saved.completeStats);
      }
      return; // 복원 시 resize 기반 모드 자동 전환 불필요
    }

    // 기본 모드: transcription (화면 크기 무관)
    setMode('transcription');

    // resize 시 사용자가 수동 선택하지 않은 경우에만 모드 자동 전환
    const handleResize = () => {
      setUserChoseMode(prev => {
        if (prev) return prev;
        const mobile = window.innerWidth < 768;
        setMode(mobile ? 'scramble' : 'transcription');
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
      }).catch(() => {/* 실패해도 무시 */ });
    }
  }, [session?.user?.id]);

  // 날짜 변경 감지 → 자동 리로드 (새 콘텐츠 로드)
  useEffect(() => {
    const getToday = () => new Date().toDateString();
    const loadDate = getToday();

    const reloadIfDateChanged = () => {
      if (getToday() !== loadDate) {
        sessionStorage.removeItem(SS_KEY);
        window.location.reload();
      }
    };

    // 1) 자정 타이머 — 앱을 보고 있는 중 자정이 지나는 경우
    const now = new Date();
    const midnight = new Date(now);
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime() + 1000; // 1초 여유
    const midnightTimer = setTimeout(reloadIfDateChanged, msUntilMidnight);

    // 2) 탭/앱 전환 복귀 시 날짜 확인 (백그라운드 → 포그라운드)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        reloadIfDateChanged();
      }
    };

    // 3) bfcache 복원 시 날짜 확인 (모바일 Safari 등)
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        reloadIfDateChanged();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      clearTimeout(midnightTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  // 모드 완료 시 공통 처리
  const markModeComplete = (stats: CompleteStats) => {
    setIsComplete(true);
    setCompleteStats(stats);
    setModeCompleted(prev => {
      const updated = { ...prev, [stats.mode]: stats };
      saveSession({ isComplete: true, completeStats: stats, mode: stats.mode, modeCompleted: updated });
      return updated;
    });
    const newStreak = markComplete();
    setStreak(newStreak);
  };

  const handleTranscriptionComplete = (accuracy: number, time: number, userInput?: string) => {
    const stats: CompleteStats = {
      mode: 'transcription',
      accuracy,
      time,
      charCount: quote?.text.length,
      userInput,
    };
    markModeComplete(stats);

    postStudyLog({
      user_id: session?.user?.id ?? null,
      sentence_id: quote?.id ?? null,
      mode: 'transcription',
      accuracy,
      time_seconds: time,
    }).catch(() => { });
  };

  const handleScrambleComplete = (accuracy: number, userInput: string) => {
    markModeComplete({ mode: 'scramble', accuracy, userInput });

    postStudyLog({
      user_id: session?.user?.id ?? null,
      sentence_id: quote?.id ?? null,
      mode: 'scramble',
      accuracy,
    }).catch(() => { });
  };

  const handleClozeComplete = (accuracy: number, userInput: string) => {
    markModeComplete({ mode: 'cloze', accuracy, userInput });

    postStudyLog({
      user_id: session?.user?.id ?? null,
      sentence_id: quote?.id ?? null,
      mode: 'cloze',
      accuracy,
    }).catch(() => { });
  };

  const handleReset = () => {
    setIsComplete(false);
    setCompleteStats(null);
    // 현재 모드의 완료 기록도 제거 (다시 연습)
    setModeCompleted(prev => {
      const updated = { ...prev };
      delete updated[mode];
      saveSession({ isComplete: false, completeStats: null, mode, modeCompleted: updated });
      return updated;
    });
    setResetKey((k) => k + 1);
    const newCount = incrementRepeatCount();
    setRepeatCount(newCount);
  };

  const switchMode = (newMode: Mode) => {
    if (newMode === mode) return;
    // 전환할 모드가 이미 완료된 경우 완료 상태 복원
    const savedStats = modeCompleted[newMode];
    if (savedStats) {
      setIsComplete(true);
      setCompleteStats(savedStats);
    } else {
      setIsComplete(false);
      setCompleteStats(null);
      setResetKey((k) => k + 1);
    }
    setMode(newMode);
    setUserChoseMode(true);
    saveSession({
      isComplete: !!savedStats,
      completeStats: savedStats ?? null,
      mode: newMode,
      modeCompleted,
    });
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

      {/* PWA 설치 안내 */}
      <div className="flex justify-center" style={{ padding: '0.8rem 1.5rem 0' }}>
        <InstallPrompt />
      </div>

      {/* 메인 콘텐츠 */}
      <main
        className="w-full flex flex-col items-center grow"
        style={{ padding: '3rem 1.5rem 4rem', gap: 0 }}
      >
        {/* 명언 카드 — Scramble/Cloze 모드에서는 원문 블러 처리 */}
        <QuoteCard
          quote={quote}
          hideText={mode !== 'transcription' && !isComplete}
          fadeLevel={mode === 'transcription' && !isComplete ? Math.min(3, repeatCount) as 0 | 1 | 2 | 3 : 0}
        />

        {/* 모드 탭 — 3가지 모드 (아이콘 위, 텍스트 아래) */}
        <div
          className="max-w-170 md:max-w-215 w-full flex mt-8 rounded-sm overflow-hidden opacity-0 animate-[fadeIn_0.6s_ease_1s_forwards]"
          style={{ border: '1px solid rgba(201,168,76,0.15)' }}
        >
          {/* 필사 모드 탭 */}
          <button
            onClick={() => switchMode('transcription')}
            className={`flex-1 cursor-pointer uppercase transition-all ${mode === 'transcription' ? '' : 'hover:bg-[rgba(255,255,255,0.03)]'
              }`}
            style={{
              padding: '0.6rem 0.5rem',
              background: mode === 'transcription' ? 'rgba(201,168,76,0.1)' : 'transparent',
              border: 'none',
              borderRight: '1px solid rgba(201,168,76,0.12)',
              color: mode === 'transcription' ? 'var(--gold)' : 'var(--ink-dim)',
              fontFamily: "'Crimson Pro', serif",
              fontSize: '0.72rem',
              letterSpacing: '0.1em',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>✍</span>
            <span>Transcription</span>
          </button>
          {/* 단어 스크램블 탭 */}
          <button
            onClick={() => switchMode('scramble')}
            className={`flex-1 cursor-pointer uppercase transition-all ${mode === 'scramble' ? '' : 'hover:bg-[rgba(255,255,255,0.03)]'
              }`}
            style={{
              padding: '0.6rem 0.5rem',
              background: mode === 'scramble' ? 'rgba(201,168,76,0.1)' : 'transparent',
              border: 'none',
              borderRight: '1px solid rgba(201,168,76,0.12)',
              color: mode === 'scramble' ? 'var(--gold)' : 'var(--ink-dim)',
              fontFamily: "'Crimson Pro', serif",
              fontSize: '0.72rem',
              letterSpacing: '0.1em',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>◈</span>
            <span>Scramble</span>
          </button>
          {/* 빈칸 채우기 탭 */}
          <button
            onClick={() => switchMode('cloze')}
            className={`flex-1 cursor-pointer uppercase transition-all ${mode === 'cloze' ? '' : 'hover:bg-[rgba(255,255,255,0.03)]'
              }`}
            style={{
              padding: '0.6rem 0.5rem',
              background: mode === 'cloze' ? 'rgba(201,168,76,0.1)' : 'transparent',
              border: 'none',
              color: mode === 'cloze' ? 'var(--gold)' : 'var(--ink-dim)',
              fontFamily: "'Crimson Pro', serif",
              fontSize: '0.72rem',
              letterSpacing: '0.1em',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>⋯</span>
            <span>Cloze</span>
          </button>
        </div>

        {/* 오늘 이미 완료한 경우 안내 배너 + 선생님 피드백 */}
        {completedToday && !isComplete && (
          <div className="max-w-170 md:max-w-215 w-full mt-6">
            <div
              className="flex items-center gap-3 rounded-sm"
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
            <AIFeedback
              key={`${quote.id}-${mode}-${resetKey}`}
              sentenceId={quote.id ?? 1}
              quoteText={quote.text}
              mode={mode}
            />
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
              sentenceId={quote.id ?? 1}
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
      <footer className="w-full flex justify-center mt-auto">
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
          <div className="flex flex-col gap-1">
            <span>&copy; 2026 joBiBle SoulScribe</span>
            <VisitorCounter />
          </div>
          <span>Made by JunHyoung Park</span>
        </div>
      </footer>
    </div>
  );
}
