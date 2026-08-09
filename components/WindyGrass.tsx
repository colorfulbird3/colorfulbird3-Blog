"use client";

import { useMemo } from 'react';
import { useTheme } from './ThemeProvider';

interface WildBlade {
  id: number;
  height: number;
  width: number;
  delay: number;
  duration: number;
  opacity: number;
  left: string;
  isLeftCurve: boolean;
}

const BLADE_COUNT = 24;

export default function WindyGrass() {
  const { isDark } = useTheme();

  const blades = useMemo<WildBlade[]>(
    () =>
      Array.from({ length: BLADE_COUNT }).map((_, i) => ({
        id: i,
        height: 30 + Math.random() * 50,
        width: 1 + Math.random() * 2,
        delay: Math.random() * -10,
        duration: 3.2 + Math.random() * 4.2,
        opacity: 0.22 + Math.random() * 0.38,
        left: `${(i / BLADE_COUNT) * 100 + (Math.random() - 0.5) * 1.2}%`,
        isLeftCurve: Math.random() > 0.5,
      })),
    []
  );

  return (
    <div
      className="fixed bottom-0 left-0 w-full h-32 pointer-events-none z-10 overflow-hidden transition-colors duration-1000"
      style={{ contain: 'layout paint' }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes swayWildGrass60 {
          0% { transform: translateZ(0) rotate(-5deg); }
          100% { transform: translateZ(0) rotate(15deg); }
        }
      `}</style>

      {blades.map((blade) => (
        <div
          key={blade.id}
          className="absolute bottom-0 origin-bottom flex items-end"
          style={{
            left: blade.left,
            height: `${blade.height}px`,
            width: `${blade.width * 4}px`,
            opacity: blade.opacity,
            animation: `swayWildGrass60 ${blade.duration}s ease-in-out infinite alternate`,
            animationDelay: `${blade.delay}s`,
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
        >
          <div
            className={`w-full h-full transition-colors duration-1000 ${
              isDark
                ? 'bg-gradient-to-t from-white/80 to-transparent'
                : 'bg-gradient-to-t from-emerald-500/80 to-transparent'
            }`}
            style={{
              width: `${blade.width}px`,
              borderRadius: blade.isLeftCurve
                ? '100% 0 0 100%'
                : '0 100% 100% 0',
              transform: blade.isLeftCurve
                ? 'translate3d(50%,0,0)'
                : 'translate3d(-50%,0,0)',
            }}
          />
        </div>
      ))}
    </div>
  );
}
