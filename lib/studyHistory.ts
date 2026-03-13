/**
 * 비로그인 사용자를 위한 localStorage 기반 학습 히스토리 관리.
 * 캘린더에서 학습한 날짜와 문장을 표시하기 위해 사용됩니다.
 */

const STORAGE_KEY = 'soulscribe_history';

export interface LocalStudyRecord {
  date: string;           // "2026-03-13"
  mode: string;           // "transcription" | "scramble" | "cloze"
  accuracy?: number;
  sentenceText: string;
  sentenceSource: string;
}

// localStorage 저장 형태: 월별 키 → 해당 월의 날짜별 기록
// { "2026-03": { "2026-03-01": [...], "2026-03-13": [...] } }
type MonthHistory = Record<string, LocalStudyRecord[]>;
type StudyHistory = Record<string, MonthHistory>;

function loadHistory(): StudyHistory {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveHistory(history: StudyHistory) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // localStorage 용량 초과 시 오래된 데이터 정리 후 재시도
    cleanOldData(history);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch { /* 무시 */ }
  }
}

/** 3개월 이전 데이터 자동 정리 */
function cleanOldData(history: StudyHistory) {
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const cutoff = `${threeMonthsAgo.getFullYear()}-${String(threeMonthsAgo.getMonth() + 1).padStart(2, '0')}`;

  for (const monthKey of Object.keys(history)) {
    if (monthKey < cutoff) {
      delete history[monthKey];
    }
  }
}

/** 학습 완료 시 로컬 히스토리에 저장 */
export function saveLocalStudy(record: LocalStudyRecord): void {
  const history = loadHistory();
  const monthKey = record.date.slice(0, 7); // "2026-03"

  if (!history[monthKey]) {
    history[monthKey] = {};
  }
  if (!history[monthKey][record.date]) {
    history[monthKey][record.date] = [];
  }

  history[monthKey][record.date].push(record);

  saveHistory(history);
}

/** 월별 학습 히스토리 조회 */
export function getLocalMonthHistory(year: number, month: number): MonthHistory {
  const history = loadHistory();
  const monthKey = `${year}-${String(month).padStart(2, '0')}`;
  return history[monthKey] || {};
}
