// 명언 카테고리(Category) 타입
export type QuoteCategory = 'quote' | 'poem' | 'speech' | 'literature';
// 난이도(Difficulty) 타입: 단문 → 중문 → 장문 로드맵
export type QuoteDifficulty = 'short' | 'medium' | 'long';

export interface Quote {
  id?: number;       // DB sentence_id (API에서 받은 값)
  text: string;
  source: string;
  context: string;
  translation: string;
  category: QuoteCategory;
  difficulty: QuoteDifficulty;
}

// API 실패 시 폴백용 기본 명언
export const FALLBACK_QUOTE: Quote = {
  id: 1,
  text: "In the middle of every difficulty lies opportunity.",
  source: "Albert Einstein",
  context: "Physicist & Philosopher",
  translation: "모든 어려움의 한가운데에 기회가 있다.",
  category: 'quote',
  difficulty: 'short',
};
