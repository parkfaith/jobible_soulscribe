/**
 * 명언 카드 이미지 생성 및 공유 유틸리티.
 * html-to-image로 DOM → PNG 변환 후 Web Share API 또는 다운로드.
 */

import { toPng } from 'html-to-image';

const FONT_URL =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Crimson+Pro:ital,wght@0,300;0,400;1,300&family=IM+Fell+English:ital@0;1&display=swap';

let fontCSSCache: string | null = null;

async function getFontCSS(): Promise<string> {
  if (fontCSSCache) return fontCSSCache;
  const res = await fetch(FONT_URL);
  fontCSSCache = await res.text();
  return fontCSSCache;
}

export async function generateQuoteImage(element: HTMLElement): Promise<Blob> {
  const fontEmbedCSS = await getFontCSS();

  const dataUrl = await toPng(element, {
    quality: 1.0,
    pixelRatio: 1,
    cacheBust: true,
    width: 1080,
    height: element.offsetHeight,
    fontEmbedCSS,
  });

  const response = await fetch(dataUrl);
  return response.blob();
}

export async function shareQuoteImage(blob: Blob, quoteSource: string): Promise<void> {
  const filename = `soulscribe-${quoteSource.replace(/\s+/g, '-').toLowerCase()}.png`;
  const file = new File([blob], filename, { type: 'image/png' });

  // Web Share API (모바일 우선)
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: 'SoulScribe - Daily Quote',
      text: `Today's quote from ${quoteSource}`,
      files: [file],
    });
    return;
  }

  // 폴백: PNG 다운로드
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
