// 영어 문법 요소별 단어 집합 (ScrambleMode, ClozeMode 공용)

export const PREPOSITIONS = new Set([
  'in', 'on', 'at', 'to', 'for', 'with', 'by', 'of', 'from', 'about',
  'as', 'into', 'like', 'through', 'after', 'over', 'between', 'out',
  'against', 'during', 'without', 'before', 'under', 'around', 'among',
]);

export const ARTICLES = new Set(['a', 'an', 'the']);

export const CONJUNCTIONS = new Set([
  'and', 'but', 'or', 'so', 'because', 'although',
  'if', 'when', 'while', 'unless', 'since', 'that',
]);

export const PRONOUNS = new Set([
  'i', 'you', 'he', 'she', 'it', 'we', 'they',
  'this', 'that', 'these', 'those',
  'my', 'your', 'his', 'her', 'our', 'their',
]);

export const BE_VERBS = new Set([
  'is', 'are', 'was', 'were', 'am', 'be', 'been', 'being',
]);

export const AUXILIARIES = new Set([
  'do', 'does', 'did', 'have', 'has', 'had',
  'will', 'would', 'shall', 'should',
  'can', 'could', 'may', 'might', 'must',
]);

export const ADVERBS = new Set([
  'not', 'never', 'always', 'often', 'sometimes',
]);

// 한국인 학습자가 취약한 문법 요소 통합 (ClozeMode 빈칸 우선 출제용)
export const TARGET_VOCAB = new Set([
  ...PREPOSITIONS, ...ARTICLES, ...BE_VERBS, ...AUXILIARIES, ...ADVERBS,
]);

// 구두점 제거 유틸
export function cleanPunctuation(word: string): string {
  return word.replace(/[.,!?;:'"()]/g, '');
}

// chunk 분리 시 "시작점" 역할을 하는 단어인지 판별
export function isStructuralWord(cleanWord: string): boolean {
  return PREPOSITIONS.has(cleanWord)
    || ARTICLES.has(cleanWord)
    || CONJUNCTIONS.has(cleanWord)
    || PRONOUNS.has(cleanWord);
}
