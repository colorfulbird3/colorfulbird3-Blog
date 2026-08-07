"use client";

import { useEffect, useMemo, useState } from 'react';

interface SnowParticle {
  char: string;
  size: number;
  left: number;
  duration: number;
  delay: number;
  opacity: number;
  drift: number;
}

const SNOW_COUNT = 18;

export default function GlobalSnow() {
  const [isWinter, setIsWinter] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkWinter = () => {
      const active =
        document.body.classList.contains('winter-mode') ||
        localStorage.getItem('winter-mode') === 'true';

      setIsWinter(active);

      if (active) {
        document.body.classList.add('winter-mode');
      }
    };

    checkWinter();

    const observer = new MutationObserver(() => {
      setIsWinter(document.body.classList.contains('winter-mode'));
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const snowParticles = useMemo<SnowParticle[]>(() => {
    const types = ['❄', '❅', '❆'];

    return Array.from({ length: SNOW_COUNT }).map(() => ({
      char: types[Math.floor(Math.random() * types.length)],
      size: Math.random() * 14 + 10,
      left: Math.random() * 100,
      duration: Math.random() * 7 + 5,
      delay: Math.random() * -8,
      opacity: Math.random() * 0.45 + 0.35,
      drift: (Math.random() - 0.5) * 12,
    }));
  }, []);

  if (!mounted || !isWinter) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[190] overflow-hidden"
      style={{ contain: 'strict' }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-900/10 mix-blend-overlay transition-opacity duration-1000" />

      {snowParticles.map((p, i) => (
        <div
          key={i}
          className="absolute text-white select-none pointer-events-none"
          style={{
            fontSize: p.size,
            left: `${p.left}vw`,
            top: '-24px',
            opacity: p.opacity,
            animation: `snowDrop60 ${p.duration}s linear ${p.delay}s infinite`,
            willChange: 'transform, opacity',
            transform: 'translate3d(0,0,0)',
            ['--snow-drift' as any]: `${p.drift}vw`,
            textShadow: '0 0 2px rgba(255,255,255,.45)',
          }}
        >
          {p.char}
        </div>
      ))}

      <style>{`
        @keyframes snowDrop60 {
          0% { transform: translate3d(0, -20px, 0) rotate(0deg); }
          100% { transform: translate3d(var(--snow-drift), 108vh, 0) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
