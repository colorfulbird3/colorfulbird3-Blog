"use client";

import { useEffect, useState } from 'react';
import { siteConfig } from '../siteConfig';

interface DanmakuItem {
  id: number;
  text: string;
  top: number;
  duration: number;
  delay: number;
}

const DANMAKU_COUNT = 4;

export default function DanmakuBackground() {
  // 随机内容放到挂载后再生成：避免服务端/客户端各随机一次导致水合失败
  const [danmakus, setDanmakus] = useState<DanmakuItem[]>([]);

  useEffect(() => {
    const list = siteConfig.danmakuList || [];
    if (list.length === 0) return;

    setDanmakus(
      Array.from({ length: DANMAKU_COUNT }).map((_, i) => ({
        id: i,
        text: list[Math.floor(Math.random() * list.length)],
        top: Math.random() * 80 + 10,
        duration: Math.random() * 16 + 28,
        delay: -(Math.random() * 28),
      }))
    );
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
