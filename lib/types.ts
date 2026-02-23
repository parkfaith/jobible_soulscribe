// 앱 전역 공유 타입

export type Mode = 'transcription' | 'scramble' | 'cloze';

export interface CompleteStats {
  mode: Mode;
  accuracy?: number;
  time?: number;
  charCount?: number;
  userInput?: string;
}
