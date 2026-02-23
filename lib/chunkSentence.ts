// 의미 단위(Chunk) 분리 — ScrambleMode에서 사용
// 전치사구, 관사+명사 등을 한 덩어리로 묶어 자연스러운 재배열 학습 제공

import {
  PREPOSITIONS, ARTICLES, CONJUNCTIONS,
  isStructuralWord,
} from './wordSets';

// 닫는 구두점만 매칭 (여는 따옴표·괄호 제외)
const CLOSING_PUNCT = /[.,!?;:'")\u201D\u2019]/;

export function chunkSentence(text: string): string[] {
  const words = text.split(' ').filter(w => w.length > 0);
  if (words.length === 0) return [];

  const chunks: string[] = [];
  let currentChunk: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    // 여는 따옴표·괄호는 제거하되 닫는 것은 유지하여 구두점 감지에 활용
    const cleanWord = word.replace(/[.,!?;:'"()]/g, '').toLowerCase();

    // 빈 덩어리 시작
    if (currentChunk.length === 0) {
      currentChunk.push(word);
      continue;
    }

    const prevWord = currentChunk[currentChunk.length - 1];
    const cleanPrev = prevWord.replace(/[.,!?;:'"()]/g, '').toLowerCase();

    // 이전 단어가 전치사/관사/접속사면 무조건 묶음
    if (PREPOSITIONS.has(cleanPrev) || ARTICLES.has(cleanPrev) || CONJUNCTIONS.has(cleanPrev)) {
      currentChunk.push(word);
      // 닫는 구두점으로 끝나거나 3단어 이상이면 덩어리 닫음
      if (CLOSING_PUNCT.test(word.slice(-1)) || currentChunk.length >= 3) {
        chunks.push(currentChunk.join(' '));
        currentChunk = [];
      }
      continue;
    }

    // 이미 2단어 이상 모였으면
    if (currentChunk.length >= 2) {
      if (isStructuralWord(cleanWord)) {
        chunks.push(currentChunk.join(' '));
        currentChunk = [word];
      } else {
        currentChunk.push(word);
        chunks.push(currentChunk.join(' '));
        currentChunk = [];
      }
      continue;
    }

    // 현재 1단어: 새로운 시작점이면 앞 덩어리를 닫고 새 덩어리 시작
    if (isStructuralWord(cleanWord)) {
      chunks.push(currentChunk.join(' '));
      currentChunk = [word];
      continue;
    }

    // 일반적인 결합
    currentChunk.push(word);

    if (CLOSING_PUNCT.test(word.slice(-1))) {
      chunks.push(currentChunk.join(' '));
      currentChunk = [];
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }

  return chunks;
}
