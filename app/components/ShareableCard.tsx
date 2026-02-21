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
          padding: '100px 100px 110px',
          fontFamily: "'Cormorant Garamond', serif",
          boxSizing: 'border-box',
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
            marginBottom: '36px',
          }}
        >
          ✦&nbsp;&nbsp;{quote.category}&nbsp;&nbsp;✦
        </div>

        {/* 장식용 큰따옴표 */}
        <div
          style={{
            fontSize: '100px',
            lineHeight: 0.6,
            color: 'rgba(201,168,76,0.15)',
            fontWeight: 300,
            marginBottom: '16px',
          }}
        >
          {'\u201c'}
        </div>

        {/* 명언 영문 */}
        <p
          style={{
            fontSize: '40px',
            fontWeight: 300,
            fontStyle: 'italic',
            color: '#f5eed8',
            lineHeight: 1.6,
            textAlign: 'center',
            letterSpacing: '0.01em',
            maxWidth: '840px',
            margin: 0,
          }}
        >
          {quote.text}
        </p>

        {/* 한글 번역 */}
        <p
          style={{
            fontSize: '22px',
            fontWeight: 400,
            color: 'rgba(154,144,128,0.7)',
            lineHeight: 1.7,
            textAlign: 'center',
            maxWidth: '800px',
            margin: '24px 0 0 0',
            wordBreak: 'keep-all',
            overflowWrap: 'break-word',
          }}
        >
          {quote.translation}
        </p>

        {/* 골드 그라데이션 구분선 */}
        <div
          style={{
            width: '80px',
            height: '1px',
            margin: '36px 0',
            background: 'linear-gradient(to right, transparent, #8a6f32, transparent)',
          }}
        />

        {/* 저자 + 출처 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <p
            style={{
              fontFamily: "'Crimson Pro', serif",
              fontSize: '18px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#9a9080',
              margin: 0,
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            — {quote.source}
          </p>
          <p
            style={{
              fontFamily: "'Crimson Pro', serif",
              fontSize: '15px',
              fontStyle: 'italic',
              color: '#8a6f32',
              margin: 0,
              textAlign: 'center',
              maxWidth: '800px',
              wordBreak: 'keep-all',
            }}
          >
            {quote.context}
          </p>
        </div>

        {/* 브랜딩 */}
        <div
          style={{
            marginTop: '44px',
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
