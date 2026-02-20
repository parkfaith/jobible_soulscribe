'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

// 헤더 우측 로그인/로그아웃 버튼 컴포넌트
export function AuthButton() {
  const { data: session, status } = useSession();

  // 세션 로딩 중 — 공간 유지
  if (status === 'loading') {
    return (
      <div
        style={{
          width: '6rem',
          height: '1.8rem',
          borderRadius: '2px',
          background: 'rgba(201,168,76,0.06)',
          border: '1px solid rgba(201,168,76,0.12)',
        }}
      />
    );
  }

  // 로그인 상태 — 이름 + 로그아웃 버튼
  if (session?.user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        {/* 프로필 이미지 또는 이니셜 */}
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name ?? ''}
            style={{
              width: '1.6rem',
              height: '1.6rem',
              borderRadius: '50%',
              border: '1px solid rgba(201,168,76,0.3)',
            }}
          />
        ) : (
          <div
            style={{
              width: '1.6rem',
              height: '1.6rem',
              borderRadius: '50%',
              background: 'rgba(201,168,76,0.15)',
              border: '1px solid rgba(201,168,76,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              color: 'var(--gold)',
            }}
          >
            {session.user.name?.charAt(0) ?? '?'}
          </div>
        )}

        <button
          onClick={() => signOut()}
          style={{
            background: 'none',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: '2px',
            padding: '0.25rem 0.6rem',
            cursor: 'pointer',
            fontFamily: "'Crimson Pro', serif",
            fontSize: '0.78rem',
            letterSpacing: '0.06em',
            color: 'var(--ink-dim)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--gold-dim)';
            e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--ink-dim)';
            e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)';
          }}
        >
          로그아웃
        </button>
      </div>
    );
  }

  // 비로그인 상태 — Google 로그인 버튼
  return (
    <button
      onClick={() => signIn('google')}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        background: 'none',
        border: '1px solid rgba(201,168,76,0.25)',
        borderRadius: '2px',
        padding: '0.3rem 0.75rem',
        cursor: 'pointer',
        fontFamily: "'Crimson Pro', serif",
        fontSize: '0.82rem',
        letterSpacing: '0.06em',
        color: 'var(--gold-dim)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget).style.color = 'var(--gold)';
        (e.currentTarget).style.borderColor = 'rgba(201,168,76,0.5)';
        (e.currentTarget).style.background = 'rgba(201,168,76,0.06)';
      }}
      onMouseLeave={e => {
        (e.currentTarget).style.color = 'var(--gold-dim)';
        (e.currentTarget).style.borderColor = 'rgba(201,168,76,0.25)';
        (e.currentTarget).style.background = 'none';
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" style={{ opacity: 0.7 }}>
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Google 로그인
    </button>
  );
}
