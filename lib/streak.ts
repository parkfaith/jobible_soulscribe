const STORAGE_KEY = 'soulscribe_streak';

interface StreakData {
  count: number;
  lastDate: string;
}

export function getStreak(): number {
  if (typeof window === 'undefined') return 0;

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return 0;

    const parsed: StreakData = JSON.parse(data);
    return parsed.count;
  } catch {
    return 0;
  }
}

export function markComplete(): number {
  if (typeof window === 'undefined') return 0;

  const today = new Date().toDateString();

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsed: StreakData = data
      ? JSON.parse(data)
      : { count: 0, lastDate: '' };

    // 이미 오늘 완료했으면 현재 스트릭 반환
    if (parsed.lastDate === today) {
      return parsed.count;
    }

    // 어제 완료했으면 스트릭 증가, 아니면 1로 리셋
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const newCount = parsed.lastDate === yesterday ? parsed.count + 1 : 1;

    const newData: StreakData = { count: newCount, lastDate: today };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));

    return newCount;
  } catch {
    return 1;
  }
}

export function isCompletedToday(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return false;

    const parsed: StreakData = JSON.parse(data);
    const today = new Date().toDateString();
    return parsed.lastDate === today;
  } catch {
    return false;
  }
}
