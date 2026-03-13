/**
 * 학습 캘린더 데이터 통합 훅.
 * userId가 있으면 → 백엔드 API, 없으면 → localStorage 기반.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchCalendar, type CalendarEntry } from '@/lib/api';
import { getLocalMonthHistory, type LocalStudyRecord } from '@/lib/studyHistory';

export interface CalendarDayEntry {
  mode: string;
  accuracy?: number | null;
  sentenceText: string | null;
  sentenceSource: string | null;
}

export interface MonthData {
  days: Record<string, CalendarDayEntry[]>;
  summary: {
    total_days: number;
    total_sessions: number;
  };
}

/** localStorage에서 월별 데이터를 로드하는 헬퍼 */
function loadFromLocal(year: number, month: number): MonthData {
  const localHistory = getLocalMonthHistory(year, month);
  const days: Record<string, CalendarDayEntry[]> = {};
  let totalSessions = 0;

  for (const [date, records] of Object.entries(localHistory)) {
    days[date] = records.map((r: LocalStudyRecord) => ({
      mode: r.mode,
      accuracy: r.accuracy,
      sentenceText: r.sentenceText,
      sentenceSource: r.sentenceSource,
    }));
    totalSessions += records.length;
  }

  return {
    days,
    summary: {
      total_days: Object.keys(days).length,
      total_sessions: totalSessions,
    },
  };
}

export function useStudyHistory(year: number, month: number, userId?: string | null) {
  const [data, setData] = useState<MonthData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 월별 캐시 (같은 세션에서 동일 월 재요청 방지)
  const cache = useRef<Map<string, MonthData>>(new Map());
  // 새 학습 완료 시 현재 월 캐시 무효화를 위한 리프레시 카운터
  const [refreshCount, setRefreshCount] = useState(0);

  const cacheKey = `${year}-${String(month).padStart(2, '0')}`;

  // 언마운트 추적 (비동기 완료 후 상태 업데이트 방지)
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    // 캐시 확인 (refresh 호출 시 캐시가 삭제되어 miss됨)
    const cached = cache.current.get(cacheKey);
    if (cached) {
      setData(cached);
      return;
    }

    setIsLoading(true);
    setError(null);

    let monthData: MonthData;

    if (userId) {
      // 로그인 사용자: API 시도, 실패 시 localStorage 폴백
      try {
        const res = await fetchCalendar(userId, year, month);
        monthData = {
          days: Object.fromEntries(
            Object.entries(res.days).map(([date, entries]) => [
              date,
              entries.map((e: CalendarEntry) => ({
                mode: e.mode,
                accuracy: e.accuracy,
                sentenceText: e.sentence_text,
                sentenceSource: e.sentence_source,
              })),
            ]),
          ),
          summary: res.summary,
        };
      } catch {
        // API 실패 → localStorage 폴백
        monthData = loadFromLocal(year, month);
      }
    } else {
      monthData = loadFromLocal(year, month);
    }

    // 언마운트 후 상태 업데이트 방지
    if (!mountedRef.current) return;

    cache.current.set(cacheKey, monthData);
    setData(monthData);
    setIsLoading(false);
    // refreshCount는 의존성에만 포함 — 캐시 무효화 후 load 재실행 트리거 용도
  }, [year, month, userId, cacheKey, refreshCount]);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => { mountedRef.current = false; };
  }, [load]);

  /** 현재 월의 데이터를 새로고침합니다 (학습 완료 후 호출). */
  const refresh = useCallback(() => {
    cache.current.delete(cacheKey);
    setRefreshCount((c) => c + 1);
  }, [cacheKey]);

  return { data, isLoading, error, refresh };
}
