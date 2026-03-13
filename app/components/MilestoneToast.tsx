'use client';

import { useEffect, useState, useRef } from 'react';

const MILESTONES: Record<number, string> = {
  7: '일주일 연속 학습 달성!',
  14: '2주 연속 학습 달성!',
  30: '한 달 연속 학습 달성!',
  50: '50일 연속 학습 달성!',
  100: '100일 연속 학습 달성!',
  365: '1년 연속 학습 달성!',
};

/** 마일스톤 달성 기준 일수 (page.tsx에서도 참조) */
export const MILESTONE_DAYS = Object.keys(MILESTONES).map(Number);

interface MilestoneToastProps {
  streak: number | null;
  onDismiss: () => void;
}

export default function MilestoneToast({ streak, onDismiss }: MilestoneToastProps) {
  const [visible, setVisible] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  /** 모든 타이머를 정리하는 헬퍼 */
  const clearAllTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  /** fadeOut 후 onDismiss 호출 (타이머 추적) */
  const dismiss = () => {
    setVisible(false);
    const t = setTimeout(onDismiss, 400);
    timers.current.push(t);
  };

  useEffect(() => {
    if (streak === null || !MILESTONES[streak]) {
      setVisible(false);
      return;
    }

    // 동일 마일스톤 중복 표시 방지
    const shownKey = `soulscribe_milestone_${streak}`;
    if (localStorage.getItem(shownKey)) {
      onDismiss();
      return;
    }

    setVisible(true);
    localStorage.setItem(shownKey, '1');

    // 4초 후 자동 닫기
    const timer = setTimeout(dismiss, 4000);
    timers.current.push(timer);

    return clearAllTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streak]);

  if (!streak || !MILESTONES[streak]) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        animation: visible
          ? 'slideDown 0.4s ease forwards'
          : 'fadeOutUp 0.4s ease forwards',
        pointerEvents: 'auto',
      }}
    >
      <div
        className="flex items-center gap-3"
        style={{
          padding: '0.8rem 1.5rem',
          background: 'linear-gradient(135deg, #1a1814 0%, #151310 100%)',
          border: '1px solid rgba(201,168,76,0.3)',
          borderRadius: '4px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4), 0 0 15px rgba(201,168,76,0.1)',
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>🔥</span>
        <div className="flex flex-col">
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1rem',
              color: 'var(--gold)',
              letterSpacing: '0.05em',
            }}
          >
            ✦ {streak} Day Streak ✦
          </span>
          <span
            style={{
              fontFamily: "'Crimson Pro', serif",
              fontSize: '0.78rem',
              color: 'var(--ink-dim)',
              letterSpacing: '0.04em',
            }}
          >
            {MILESTONES[streak]}
          </span>
        </div>
        <button
          onClick={dismiss}
          className="cursor-pointer"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--ink-dim)',
            fontSize: '0.9rem',
            padding: '0.2rem',
            marginLeft: '0.5rem',
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
