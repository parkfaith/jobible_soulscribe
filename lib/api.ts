/**
 * joBiBle SoulScribe — FastAPI 백엔드 통신 클라이언트.
 * 환경변수 NEXT_PUBLIC_API_URL을 기반으로 동작하며,
 * 설정되지 않은 경우 로컬 개발 서버(localhost:8000)를 사용합니다.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';

// ── 공통 fetch 래퍼 ────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  timeoutMs: number = 10000,
): Promise<T> {
  if (!BASE_URL) {
    throw new Error('API not configured');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
      signal: controller.signal,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API 오류 ${res.status}: ${errorText}`);
    }

    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timeout);
  }
}

// ── 타입 정의 ─────────────────────────────────────────────────────

export interface SentenceResponse {
  id: number;
  text: string;
  source: string | null;
  context: string | null;
  translation: string | null;
  category: 'quote' | 'poem' | 'speech' | 'literature';
  difficulty: 'short' | 'medium' | 'long';
}

export interface StudyLogPayload {
  user_id?: string | null;
  sentence_id?: number | null;
  mode: 'transcription' | 'scramble' | 'cloze';
  accuracy?: number | null;
  time_seconds?: number | null;
}

export interface StudyLogResponse {
  id: number;
  message: string;
}

// ── API 함수 ──────────────────────────────────────────────────────

/** 오늘의 문장을 백엔드에서 가져옵니다. */
export async function fetchTodaySentence(): Promise<SentenceResponse> {
  return request<SentenceResponse>('/sentences/today');
}

/** 학습 완료 기록을 백엔드에 저장합니다. */
export async function postStudyLog(
  payload: StudyLogPayload
): Promise<StudyLogResponse> {
  return request<StudyLogResponse>('/study-logs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** 서버 상태를 확인합니다. */
export async function checkHealth(): Promise<{ status: string }> {
  return request<{ status: string }>('/health');
}

// ── AI 피드백 관련 ────────────────────────────────────────────────

export interface FeedbackPayload {
  sentence_id: number;
  text: string;
}

export interface FeedbackResponse {
  sentence_id: number;
  grammar_analysis: string;
  nuance_insights: string;
  practice_challenge: string;
  cached: boolean;
}

/** 오늘의 명언에 대한 AI 피드백을 가져옵니다 (캐시 우선). */
export async function fetchFeedback(
  payload: FeedbackPayload
): Promise<FeedbackResponse> {
  return request<FeedbackResponse>('/feedback', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ── 사용자 관련 ────────────────────────────────────────────────────

export interface RegisterUserPayload {
  google_id: string;
  email: string;
  name?: string;
}

/** 첫 로그인 시 사용자를 백엔드 DB에 등록합니다 (이미 존재하면 무시). */
export async function registerUser(
  payload: RegisterUserPayload
): Promise<{ success: boolean }> {
  return request<{ success: boolean }>('/users/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
