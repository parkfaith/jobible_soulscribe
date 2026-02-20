'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwa-install-dismissed';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // 이미 설치된 상태 (standalone) 또는 이전에 닫은 경우 표시 안 함
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    // iOS Safari 감지
    const ua = navigator.userAgent;
    const isiOS = /iPhone|iPad|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|Chrome/.test(ua);

    if (isiOS && isSafari) {
      // navigator.standalone이 false면 아직 미설치
      if ((navigator as unknown as { standalone?: boolean }).standalone === false) {
        setIsIOS(true);
        setShow(true);
      }
      return;
    }

    // Chrome/Android — beforeinstallprompt 이벤트 대기
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, '1');
  };

  if (!show) return null;

  return (
    <div
      className="max-w-170 md:max-w-215 w-full"
      style={{
        animation: 'fadeIn 0.6s ease',
      }}
    >
      <div
        className="flex items-center gap-3 rounded-sm"
        style={{
          padding: '0.7rem 1rem',
          background: 'rgba(201,168,76,0.06)',
          border: '1px solid rgba(201,168,76,0.2)',
        }}
      >
        {/* 아이콘 */}
        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>📲</span>

        {/* 안내 텍스트 */}
        <span
          style={{
            flex: 1,
            fontFamily: "'Crimson Pro', serif",
            fontSize: '0.82rem',
            color: 'var(--ink-dim)',
            letterSpacing: '0.04em',
            lineHeight: 1.5,
          }}
        >
          {isIOS ? (
            <>
              하단의 <span style={{ color: 'var(--gold)' }}>공유(⎙)</span> 버튼을 눌러{' '}
              <span style={{ color: 'var(--gold)' }}>홈 화면에 추가</span>하면 앱처럼 사용할 수 있습니다.
            </>
          ) : (
            '홈 화면에 추가하면 앱처럼 사용할 수 있습니다.'
          )}
        </span>

        {/* 설치 버튼 (Android/Chrome only) */}
        {!isIOS && deferredPrompt && (
          <button
            onClick={handleInstall}
            className="cursor-pointer"
            style={{
              flexShrink: 0,
              background: 'transparent',
              border: '1px solid rgba(201,168,76,0.35)',
              borderRadius: '2px',
              padding: '0.35rem 0.7rem',
              fontFamily: "'Crimson Pro', serif",
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              color: 'var(--gold)',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
          >
            설치하기
          </button>
        )}

        {/* 닫기 버튼 */}
        <button
          onClick={handleDismiss}
          className="cursor-pointer"
          style={{
            flexShrink: 0,
            background: 'transparent',
            border: 'none',
            color: 'var(--ink-dim)',
            fontSize: '1rem',
            padding: '0 0.2rem',
            lineHeight: 1,
            opacity: 0.5,
          }}
          aria-label="닫기"
        >
          ×
        </button>
      </div>
    </div>
  );
}
