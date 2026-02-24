'use client';

import { useState, useEffect } from 'react';
import { incrementVisitorCount, VisitorCountResponse } from '@/lib/api';

export default function VisitorCounter() {
  const [counts, setCounts] = useState<VisitorCountResponse | null>(null);

  useEffect(() => {
    // 마운트 시 한 번만 API 호출
    incrementVisitorCount()
      .then(setCounts)
      .catch(() => {
        // 백엔드 연결 실패 등 오류 시 조용히 무시 (사용자 경험 방해 방지)
      });
  }, []);

  if (!counts) return null;

  return (
    <div 
      className="flex gap-2 transition-all duration-300 ease-in-out hover:text-[rgba(201,168,76,0.8)] hover:font-bold"
      style={{
        fontSize: '0.65rem',
        color: 'rgba(154,144,128,0.3)', // 평소에는 거의 보이지 않게
        letterSpacing: '0.05em',
        cursor: 'default'
      }}
    >
      <span>Today: {counts.today}</span>
      <span className="opacity-50">|</span>
      <span>Total: {counts.total}</span>
    </div>
  );
}
