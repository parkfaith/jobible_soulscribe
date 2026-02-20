'use client';

import { SessionProvider } from 'next-auth/react';

// 클라이언트 컴포넌트 래퍼 — layout.tsx(서버)에서 SessionProvider 사용 가능하게 함
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
