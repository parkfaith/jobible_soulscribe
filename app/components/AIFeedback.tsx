'use client';

import { useState } from 'react';
import { fetchFeedback, FeedbackResponse } from '@/lib/api';

interface AIFeedbackProps {
  sentenceId: number;
  quoteText: string;
}

type FeedbackTab = 'grammar' | 'nuance' | 'challenge';

const TAB_CONFIG: { key: FeedbackTab; label: string; icon: string }[] = [
  { key: 'grammar', label: '문법 분석', icon: '⚙' },
  { key: 'nuance', label: '뉘앙스', icon: '✦' },
  { key: 'challenge', label: '연습 문장', icon: '✍' },
];

export function AIFeedback({ sentenceId, quoteText }: AIFeedbackProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [activeTab, setActiveTab] = useState<FeedbackTab>('grammar');

  const handleFetch = async () => {
    setState('loading');
    try {
      const data = await fetchFeedback({ sentence_id: sentenceId, text: quoteText });
      setFeedback(data);
      setState('done');
    } catch {
      setState('error');
    }
  };

  // ── 초기 상태: 버튼 ──────────────────────────────────────────────
  if (state === 'idle') {
    return (
      <div style={{ marginTop: '1.2rem', textAlign: 'center' }}>
        <button
          onClick={handleFetch}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: '2px',
            padding: '0.55rem 1.4rem',
            cursor: 'pointer',
            fontFamily: "'Crimson Pro', serif",
            fontSize: '0.88rem',
            letterSpacing: '0.1em',
            color: 'var(--gold-dim)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--gold)';
            e.currentTarget.style.borderColor = 'rgba(201,168,76,0.55)';
            e.currentTarget.style.background = 'rgba(201,168,76,0.05)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--gold-dim)';
            e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)';
            e.currentTarget.style.background = 'none';
          }}
        >
          ✦&nbsp; 선생님 피드백 보기
        </button>
      </div>
    );
  }

  // ── 로딩 상태: 스켈레톤 ──────────────────────────────────────────
  if (state === 'loading') {
    return (
      <div
        style={{
          marginTop: '1.2rem',
          padding: '1.5rem',
          background: 'rgba(201,168,76,0.03)',
          border: '1px solid rgba(201,168,76,0.12)',
          borderRadius: '2px',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '0.9rem',
            color: 'var(--gold-dim)',
            letterSpacing: '0.08em',
            marginBottom: '1rem',
          }}
        >
          선생님이 분석 중입니다...
        </div>
        {/* 스켈레톤 라인 */}
        {[100, 85, 70].map((w, i) => (
          <div
            key={i}
            style={{
              height: '0.75rem',
              width: `${w}%`,
              background: 'rgba(201,168,76,0.08)',
              borderRadius: '2px',
              marginBottom: '0.5rem',
              animation: 'pulse 1.5s ease infinite',
            }}
          />
        ))}
      </div>
    );
  }

  // ── 오류 상태 ────────────────────────────────────────────────────
  if (state === 'error') {
    return (
      <div
        style={{
          marginTop: '1.2rem',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--ink-dim)',
        }}
      >
        피드백을 가져오지 못했습니다.{' '}
        <button
          onClick={handleFetch}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--gold-dim)',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontSize: '0.85rem',
          }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  // ── 완료 상태: 3탭 피드백 ────────────────────────────────────────
  const tabContent: Record<FeedbackTab, string> = {
    grammar: feedback?.grammar_analysis ?? '',
    nuance: feedback?.nuance_insights ?? '',
    challenge: feedback?.practice_challenge ?? '',
  };

  return (
    <div
      style={{
        marginTop: '1.2rem',
        background: 'rgba(201,168,76,0.03)',
        border: '1px solid rgba(201,168,76,0.15)',
        borderRadius: '2px',
        overflow: 'hidden',
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          padding: '0.7rem 1.2rem',
          borderBottom: '1px solid rgba(201,168,76,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span style={{ color: 'var(--gold)', fontSize: '0.8rem' }}>✦</span>
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '0.9rem',
            color: 'var(--gold-dim)',
            letterSpacing: '0.08em',
          }}
        >
          선생님 피드백
        </span>
        {feedback?.cached && (
          <span
            style={{
              marginLeft: 'auto',
              fontSize: '0.68rem',
              color: 'rgba(154,144,128,0.5)',
              letterSpacing: '0.06em',
            }}
          >
            캐시됨
          </span>
        )}
      </div>

      {/* 탭 */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid rgba(201,168,76,0.1)',
        }}
      >
        {TAB_CONFIG.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              flex: 1,
              padding: '0.55rem 0.5rem',
              background: activeTab === key ? 'rgba(201,168,76,0.08)' : 'none',
              border: 'none',
              borderBottom: activeTab === key ? '2px solid rgba(201,168,76,0.5)' : '2px solid transparent',
              cursor: 'pointer',
              fontFamily: "'Crimson Pro', serif",
              fontSize: '0.8rem',
              letterSpacing: '0.06em',
              color: activeTab === key ? 'var(--gold)' : 'var(--ink-dim)',
              transition: 'all 0.15s ease',
            }}
          >
            {icon}&nbsp;{label}
          </button>
        ))}
      </div>

      {/* 탭 내용 */}
      <div
        style={{
          padding: '1.1rem 1.2rem',
          fontSize: '0.88rem',
          color: 'var(--ink-dim)',
          lineHeight: 1.85,
          whiteSpace: 'pre-line',
          minHeight: '5rem',
        }}
      >
        {tabContent[activeTab]}
      </div>
    </div>
  );
}
