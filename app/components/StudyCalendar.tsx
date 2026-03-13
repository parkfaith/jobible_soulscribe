'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useStudyHistory, type CalendarDayEntry } from '@/lib/useStudyHistory';

interface StudyCalendarProps {
  refreshTrigger?: number;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** 모드 표시 이름 */
function modeName(mode: string): string {
  switch (mode) {
    case 'transcription': return '필사';
    case 'scramble': return '스크램블';
    case 'cloze': return '빈칸';
    default: return mode;
  }
}

export default function StudyCalendar({ refreshTrigger }: StudyCalendarProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1); // 1-based
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data, isLoading, refresh } = useStudyHistory(viewYear, viewMonth, userId);

  // refreshTrigger가 변경되면 현재 월 데이터 강제 새로고침
  const prevTrigger = useRef(refreshTrigger);
  useEffect(() => {
    if (refreshTrigger !== prevTrigger.current) {
      prevTrigger.current = refreshTrigger;
      refresh();
    }
  }, [refreshTrigger, refresh]);

  /** 달력 그리드 생성 */
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    // 나머지 빈 셀
    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
  }, [viewYear, viewMonth]);

  /** 오늘인지 확인 */
  const isToday = (day: number) =>
    viewYear === now.getFullYear() &&
    viewMonth === now.getMonth() + 1 &&
    day === now.getDate();

  /** 날짜 키 생성 (YYYY-MM-DD) */
  const dateKey = (day: number) =>
    `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  /** 특정 날짜의 학습 기록 */
  const getEntries = (day: number): CalendarDayEntry[] =>
    data?.days[dateKey(day)] ?? [];

  /** 이전 월 이동 */
  const prevMonth = () => {
    if (viewMonth === 1) {
      setViewYear(viewYear - 1);
      setViewMonth(12);
    } else {
      setViewMonth(viewMonth - 1);
    }
    setSelectedDate(null);
  };

  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth() + 1;

  /** 다음 월 이동 (미래 월 불가) */
  const nextMonth = () => {
    if (isCurrentMonth) return;
    if (viewMonth === 12) {
      setViewYear(viewYear + 1);
      setViewMonth(1);
    } else {
      setViewMonth(viewMonth + 1);
    }
    setSelectedDate(null);
  };
  const monthLabel = new Date(viewYear, viewMonth - 1).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  const selectedEntries: CalendarDayEntry[] = selectedDate
    ? (data?.days[selectedDate] ?? [])
    : [];

  /** 문장별 그루핑 (같은 문장의 모드/정확도를 모아서 표시) */
  const groupedEntries = useMemo(() => {
    const groups: { text: string; source: string; modes: { mode: string; accuracy?: number | null }[] }[] = [];
    for (const entry of selectedEntries) {
      const key = entry.sentenceText ?? '';
      const existing = groups.find(g => g.text === key);
      if (existing) {
        existing.modes.push({ mode: entry.mode, accuracy: entry.accuracy });
      } else {
        groups.push({
          text: key,
          source: entry.sentenceSource ?? '',
          modes: [{ mode: entry.mode, accuracy: entry.accuracy }],
        });
      }
    }
    return groups;
  }, [selectedEntries]);

  return (
    <div
      style={{
        border: '1px solid rgba(201,168,76,0.15)',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      {/* 섹션 제목 */}
      <div
        style={{
          padding: '1rem 1.2rem 0.6rem',
          background: 'rgba(201,168,76,0.04)',
          borderBottom: '1px solid rgba(201,168,76,0.1)',
        }}
      >
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.1rem',
            color: 'var(--gold)',
            letterSpacing: '0.08em',
            textAlign: 'center',
          }}
        >
          ✦ Study Calendar ✦
        </div>
      </div>

      {/* 월 네비게이션 */}
      <div
        className="flex items-center justify-between"
        style={{ padding: '0.8rem 1.2rem' }}
      >
        <button
          onClick={prevMonth}
          className="cursor-pointer transition-all hover:brightness-125 active:scale-95"
          style={{
            background: 'rgba(201,168,76,0.1)',
            border: '1px solid rgba(201,168,76,0.25)',
            borderRadius: '4px',
            color: 'var(--gold)',
            fontSize: '1.1rem',
            padding: '0.35rem 0.7rem',
            lineHeight: 1,
          }}
        >
          ‹
        </button>
        <span
          style={{
            fontFamily: "'IM Fell English', serif",
            fontSize: '0.95rem',
            color: 'var(--ink)',
            letterSpacing: '0.04em',
          }}
        >
          {monthLabel}
        </span>
        <button
          onClick={nextMonth}
          className="cursor-pointer transition-all hover:brightness-125 active:scale-95"
          style={{
            background: isCurrentMonth ? 'transparent' : 'rgba(201,168,76,0.1)',
            border: isCurrentMonth ? '1px solid rgba(154,144,128,0.15)' : '1px solid rgba(201,168,76,0.25)',
            borderRadius: '4px',
            color: isCurrentMonth ? 'var(--ink-dim)' : 'var(--gold)',
            fontSize: '1.1rem',
            padding: '0.35rem 0.7rem',
            lineHeight: 1,
            opacity: isCurrentMonth ? 0.4 : 1,
          }}
          disabled={isCurrentMonth}
        >
          ›
        </button>
      </div>

      {/* 요일 헤더 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          padding: '0 0.8rem',
          gap: '2px',
        }}
      >
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            style={{
              textAlign: 'center',
              fontSize: '0.68rem',
              color: 'var(--ink-dim)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '0.3rem 0',
              fontFamily: "'Crimson Pro', serif",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          padding: '0.2rem 0.8rem 0.8rem',
          gap: '2px',
        }}
      >
        {calendarGrid.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} style={{ padding: '0.5rem' }} />;
          }

          const entries = getEntries(day);
          const hasStudy = entries.length > 0;
          const today = isToday(day);
          const key = dateKey(day);
          const isSelected = selectedDate === key;

          return (
            <button
              key={key}
              onClick={() => hasStudy ? setSelectedDate(isSelected ? null : key) : undefined}
              className="cursor-pointer"
              style={{
                background: isSelected
                  ? 'rgba(201,168,76,0.12)'
                  : 'transparent',
                border: today
                  ? '1px solid rgba(201,168,76,0.4)'
                  : '1px solid transparent',
                borderRadius: '4px',
                padding: '0.4rem 0.2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                transition: 'all 0.15s',
              }}
            >
              <span
                style={{
                  fontSize: '0.8rem',
                  color: today ? 'var(--gold)' : 'var(--ink)',
                  fontFamily: "'Crimson Pro', serif",
                }}
              >
                {day}
              </span>
              {hasStudy && (
                <span
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: 'var(--gold)',
                    display: 'block',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* 로딩 표시 */}
      {isLoading && (
        <div
          style={{
            textAlign: 'center',
            padding: '0.5rem',
            fontSize: '0.75rem',
            color: 'var(--ink-dim)',
          }}
        >
          Loading...
        </div>
      )}

      {/* 선택된 날짜의 학습 내역 — 문장별로 그루핑 */}
      {selectedDate && groupedEntries.length > 0 && (
        <div
          style={{
            padding: '0.8rem 1.2rem',
            borderTop: '1px solid rgba(201,168,76,0.1)',
            background: 'rgba(201,168,76,0.03)',
          }}
        >
          <div
            style={{
              fontSize: '0.78rem',
              color: 'var(--gold-dim)',
              marginBottom: '0.6rem',
              fontFamily: "'IM Fell English', serif",
            }}
          >
            {selectedDate}
          </div>
          {groupedEntries.map((group, gIdx) => (
            <div
              key={gIdx}
              style={{
                padding: '0.5rem 0',
                borderBottom:
                  gIdx < groupedEntries.length - 1
                    ? '1px solid rgba(255,255,255,0.04)'
                    : 'none',
              }}
            >
              {/* 문장 */}
              {group.text && (
                <div
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--ink)',
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: 'italic',
                    lineHeight: 1.5,
                    marginBottom: '0.4rem',
                  }}
                >
                  &ldquo;{group.text}&rdquo;
                </div>
              )}
              {group.source && (
                <div
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--ink-dim)',
                    marginBottom: '0.5rem',
                  }}
                >
                  — {group.source}
                </div>
              )}
              {/* 모드 뱃지들 */}
              <div className="flex flex-wrap items-center gap-2">
                {group.modes.map((m, mIdx) => (
                  <span
                    key={mIdx}
                    className="flex items-center gap-1"
                    style={{
                      fontSize: '0.68rem',
                      color: 'var(--gold)',
                      background: 'rgba(201,168,76,0.08)',
                      border: '1px solid rgba(201,168,76,0.2)',
                      borderRadius: '2px',
                      padding: '0.15rem 0.5rem',
                      fontFamily: "'Crimson Pro', serif",
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {modeName(m.mode)}
                    {m.accuracy != null && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          marginLeft: '0.2rem',
                          color:
                            m.accuracy >= 80
                              ? 'var(--correct)'
                              : m.accuracy >= 50
                                ? 'var(--gold-dim)'
                                : 'var(--wrong)',
                        }}
                      >
                        {Math.round(m.accuracy)}%
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 월간 요약 */}
      {data && (
        <div
          style={{
            padding: '0.8rem 1.2rem',
            borderTop: '1px solid rgba(201,168,76,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div style={{ flex: 1 }}>
            <div className="progress-line" style={{ marginBottom: '0.3rem' }}>
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(100, Math.round((data.summary.total_days / new Date(viewYear, viewMonth, 0).getDate()) * 100))}%`,
                }}
              />
            </div>
            <div
              style={{
                fontSize: '0.7rem',
                color: 'var(--ink-dim)',
                fontFamily: "'Crimson Pro', serif",
              }}
            >
              {data.summary.total_days}일 학습 · {data.summary.total_sessions}회 완료
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
