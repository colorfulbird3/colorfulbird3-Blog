"use client";

import { useEffect, useState } from 'react';

interface Firefly {
  id: number;
  top: string;
  left: string;
  size: number;
  breatheDuration: number;
  breatheDelay: number;
  floatDuration: number;
  floatDelay: number;
  floatPath: string;
}

const FIREFLY_COUNT = 10;

export default function Fireflies() {
  // 随机内容放到挂载后再生成：避免水合失败
  const [flies, setFlies] = useState<Firefly[]>([]);

  useEffect(() => {
    setFlies(
      Array.from({ length: FIREFLY_COUNT }).map((_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: 3 + Math.random() * 4,
        breatheDuration: 3.5 + Math.random() * 4.5,
        breatheDelay: Math.random() * -10,
        floatDuration: 18 + Math.random() * 18,
        floatDelay: Math.random() * -20,
        floatPath: `fireflyFloat${Math.floor(Math.random() * 4) + 1}`,
      }))
    );
  }, []);

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none z-10 overflow-hidden"
      style={{ contain: 'strict' }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes fireflyBreathe60 {
          0%, 100% {
            opacity: 0.08;
            transform: translateZ(0) scale(0.45);
          }
          50% {
            opacity: 1;
            transform: translateZ(0) scale(1.18);
          }
        }

        @keyframes fireflyFloat1 {
          0%, 100% { transform: translate3d(0, 0, 0); }
          33% { transform: translate3d(10vw, -15vh, 0); }
          66% { transform: translate3d(-5vw, -20vh, 0); }
        }

        @keyframes fireflyFloat2 {
          0%, 100% { transform: translate3d(0, 0, 0); }
          33% { transform: translate3d(-12vw, 10vh, 0); }
          66% { transform: translate3d(8vw, 15vh, 0); }
        }

        @keyframes fireflyFloat3 {
          0%, 100% { transform: translate3d(0, 0, 0); }
          33% { transform: translate3d(15vw, 15vh, 0); }
          66% { transform: translate3d(-10vw, 5vh, 0); }
        }

        @keyframes fireflyFloat4 {
          0%, 100% { transform: translate3d(0, 0, 0); }
          33% { transform: translate3d(-15vw, -10vh, 0); }
          66% { transform: translate3d(10vw, -15vh, 0); }
        }
      `}</style>

      {flies.map((fly) => (
        <div
          key={fly.id}
          className="absolute"
          style={{
            top: fly.top,
            left: fly.left,
            willChange: 'transform',
            // blend 收窄到每个光点本身：屏幕混合的视觉不变，
            // 但不再对整块全屏容器每帧做混合运算
            mixBlendMode: 'screen',
            animation: `${fly.floatPath} ${fly.floatDuration}s ease-in-out infinite`,
            animationDelay: `${fly.floatDelay}s`,
            transform: 'translateZ(0)',
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: `${fly.size}px`,
              height: `${fly.size}px`,
              background:
                'radial-gradient(circle, rgba(235,255,235,1) 0%, rgba(150,255,180,.92) 35%, rgba(70,255,130,.28) 70%, rgba(70,255,130,0) 100%)',
              boxShadow:
                '0 0 9px 2px rgba(100,255,150,.7), 0 0 16px 4px rgba(50,255,100,.22)',
              willChange: 'transform, opacity',
              animation: `fireflyBreathe60 ${fly.breatheDuration}s ease-in-out infinite`,
              animationDelay: `${fly.breatheDelay}s`,
              transform: 'translateZ(0)',
            }}
          />
        </div>
      ))}
    </div>
  );
}
