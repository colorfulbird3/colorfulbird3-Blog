"use client";

import { useMemo } from 'react';

interface Petal {
  id: number;
  left: string;
  size: number;
  duration: number;
  delay: number;
  drift: number;
}

const PETAL_COUNT = 16;

export default function Sakura() {
  const petals = useMemo<Petal[]>(
    () =>
      Array.from({ length: PETAL_COUNT }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: 8 + Math.random() * 12,
        duration: 7 + Math.random() * 8,
        delay: Math.random() * -15,
        drift: 9 + Math.random() * 10,
      })),
    []
  );

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none z-10 overflow-hidden"
      style={{ contain: 'strict' }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes sakuraFall60 {
          0% {
            transform: translate3d(0, -12vh, 0) rotate(0deg);
            opacity: 0;
          }
          10% { opacity: 1; }
          82% { opacity: .95; }
          100% {
            transform: translate3d(var(--sakura-drift), 112vh, 0) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>

      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 bg-pink-300/70 shadow-[0_0_4px_rgba(255,182,193,0.45)]"
          style={{
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size * 1.2}px`,
            borderRadius: '100% 0 100% 0',
            animation: `sakuraFall60 ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
            willChange: 'transform, opacity',
            transform: 'translateZ(0)',
            ['--sakura-drift' as any]: `${p.drift}vw`,
          }}
        />
      ))}
    </div>
  );
}
