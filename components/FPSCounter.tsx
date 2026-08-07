"use client";

import { useEffect, useRef } from 'react';

export default function FPSCounter() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let rafId = 0;
    let frames = 0;
    let sampleStart = performance.now();
    let smoothed = 0;

    const tick = (now: number) => {
      frames += 1;

      const elapsed = now - sampleStart;

      if (elapsed >= 800) {
        const measured = (frames * 1000) / elapsed;
        smoothed =
          smoothed === 0
            ? measured
            : smoothed * 0.72 + measured * 0.28;

        if (ref.current) {
          ref.current.textContent = `${Math.round(smoothed)} FPS`;
        }

        frames = 0;
        sampleStart = now;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <span
      ref={ref}
      className="fixed right-5 top-3 md:top-[72px] z-[10000] pointer-events-none select-none font-mono text-[10px] md:text-[11px] tracking-[0.08em] text-slate-500/35 dark:text-white/30"
      style={{ textShadow: '0 1px 2px rgba(0,0,0,.10)' }}
      aria-hidden="true"
    >
      -- FPS
    </span>
  );
}
