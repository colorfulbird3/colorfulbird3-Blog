"use client";

import { useMemo } from 'react';
import { siteConfig } from '../siteConfig';

interface DanmakuItem {
  id: number;
  text: string;
  top: number;
  duration: number;
  delay: number;
}

const DANMAKU_COUNT = 8;

export default function DanmakuBackground() {
  const danmakus = useMemo<DanmakuItem[]>(() => {
    const list = siteConfig.danmakuList || [];
    if (list.length === 0) return [];

    return Array.from({ length: DANMAKU_COUNT }).map((_, i) => ({
      id: i,
      text: list[Math.floor(Math.random() * list.length)],
      top: Math.random() * 80 + 10,
      duration: Math.random() * 16 + 28,
      delay: -(Math.random() * 28),
    }));
  }, []);

  if (danmakus.length === 0) return null;

  return (
    <div
      className="fixed top-28 h-[30vh] left-0 right-0 overflow-hidden pointer-events-none z-0"
      style={{ contain: 'layout paint' }}
      aria-hidden="true"
    >
      {danmakus.map((item) => (
        <div
          key={item.id}
          className="absolute left-0 whitespace-nowrap text-white/30 dark:text-white/10 font-bold text-lg tracking-wider select-none"
          style={{
            top: `${item.top}%`,
            animation: `floatLeft60 ${item.duration}s linear ${item.delay}s infinite`,
            willChange: 'transform',
            transform: 'translate3d(110vw,0,0)',
          }}
        >
          {item.text}
        </div>
      ))}

      <style>{`
        @keyframes floatLeft60 {
          0% { transform: translate3d(110vw, 0, 0); }
          100% { transform: translate3d(-120%, 0, 0); }
        }
      `}</style>
    </div>
  );
}
