'use client';

import { forwardRef } from 'react';
import { Quote } from '@/lib/quotes';

interface ShareableCardProps {
  quote: Quote;
}

const ShareableCard = forwardRef<HTMLDivElement, ShareableCardProps>(
  ({ quote }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: '1080px',
          background: 'linear-gradient(135deg, #1a1814 0%, #151310 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '80px 80px 90px',
          fontFamily: "'Cormorant Garamond', serif",
        }}
      >
        {/* 외곽 프레임 */}
        <div
          style={{
            position: 'absolute',
            inset: '24px',
            border: '1px solid rgba(201,168,76,0.18)',
            pointerEvents: 'none',
          }}
        />

        {/* 코너 오너먼트 — 좌상 */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: '40px',
            width: '50px',
            height: '50px',
            borderTop: '1px solid rgba(201,168,76,0.4)',
            borderLeft: '1px solid rgba(201,168,76,0.4)',
          }}
        />
        {/* 코너 오너먼트 — 우상 */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            right: '40px',
            width: '50px',
            height: '50px',
            borderTop: '1px solid rgba(201,168,76,0.4)',
            borderRight: '1px solid rgba(201,168,76,0.4)',
          }}
        />
        {/* 코너 오너먼트 — 좌하 */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '40px',
            width: '50px',
            height: '50px',
            borderBottom: '1px solid rgba(201,168,76,0.4)',
            borderLeft: '1px solid rgba(201,168,76,0.4)',
          }}
        />
        {/* 코너 오너먼트 — 우하 */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '40px',
            width: '50px',
            height: '50px',
            borderBottom: '1px solid rgba(201,168,76,0.4)',
            borderRight: '1px solid rgba(201,168,76,0.4)',
          }}
        />

        {/* 카테고리 라벨 */}
        <div
          style={{
            fontFamily: "'Crimson Pro', serif",
            fontSize: '16px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#8a6f32',
            marginBottom: '40px',
          }}
        >
          ✦&nbsp;&nbsp;{quote.category}&nbsp;&nbsp;✦
        </div>

        {/* 장식용 큰따옴표 */}
        <div
          style={{
            fontSize: '120px',
            lineHeight: 0.6,
            color: 'rgba(201,168,76,0.15)',
            fontWeight: 300,
            marginBottom: '20px',
          }}
        >
          {'\u201c'}
        </div>

        {/* 명언 텍스트 */}
        <p
          style={{
            fontSize: '42px',
            fontWeight: 300,
            fontStyle: 'italic',
            color: '#f5eed8',
            lineHeight: 1.6,
            textAlign: 'center',
            letterSpacing: '0.01em',
            maxWidth: '860px',
            margin: 0,
          }}
        >
          {quote.text}
        </p>

        {/* 골드 그라데이션 구분선 */}
        <div
          style={{
            width: '80px',
            height: '1px',
            margin: '40px 0',
            background: 'linear-gradient(to right, transparent, #8a6f32, transparent)',
          }}
        />

        {/* 저자 */}
        <p
          style={{
            fontFamily: "'Crimson Pro', serif",
            fontSize: '18px',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: '#9a9080',
            margin: 0,
          }}
        >
          — {quote.source}
        </p>

        {/* 출처 */}
        <p
          style={{
            fontFamily: "'Crimson Pro', serif",
            fontSize: '16px',
            fontStyle: 'italic',
            color: '#8a6f32',
            marginTop: '8px',
          }}
        >
          {quote.context}
        </p>

        {/* 브랜딩 */}
        <div
          style={{
            marginTop: '50px',
            fontFamily: "'IM Fell English', serif",
            fontSize: '14px',
            letterSpacing: '0.15em',
            color: 'rgba(201,168,76,0.25)',
            textTransform: 'uppercase',
          }}
        >
          joBiBle SoulScribe
        </div>
      </div>
    );
  }
);

ShareableCard.displayName = 'ShareableCard';
export default ShareableCard;
