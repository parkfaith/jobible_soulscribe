const STORAGE_KEY = 'soulscribe_fading';

interface FadingData {
  date: string;
  repeatCount: number;
}

export function getTodayRepeatCount(): number {
  if (typeof window === 'undefined') return 0;

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return 0;

    const parsed: FadingData = JSON.parse(data);
    const today = new Date().toDateString();

    // 날짜가 다르면 리셋
    if (parsed.date !== today) return 0;

    return parsed.repeatCount;
  } catch {
    return 0;
  }
}

export function incrementRepeatCount(): number {
  if (typeof window === 'undefined') return 0;

  const today = new Date().toDateString();

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsed: FadingData = data
      ? JSON.parse(data)
      : { date: '', repeatCount: 0 };

    // 날짜가 다르면 1부터 시작
    const newCount = parsed.date === today ? parsed.repeatCount + 1 : 1;

    const newData: FadingData = { date: today, repeatCount: newCount };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));

    return newCount;
  } catch {
    return 1;
  }
}
