"use client";

import { useEffect, useRef } from 'react';

export default function FPSCounter() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let rafId = 0;
    let last = performance.now();
    let frames = 0;
    let sampleStart = last;
    let smoothed = 0;

    const tick = (now: number) => {
      frames++;

      const elapsed = now - sampleStart;

      if (elapsed >= 700) {
        const fps = (frames * 1000) / elapsed;
        smoothed = smoothed === 0 ? fps : smoothed * 0.65 + fps * 0.35;

        if (ref.current) {
          ref.current.textContent = `${Math.round(smoothed)} FPS`;
        }

        sampleStart = now;
        frames = 0;
      }

      last = now;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <span
      ref={ref}
      className="fixed right-5 top-3 md:top-[72px] z-[10000] pointer-events-none select-none font-mono text-[10px] md:text-[11px] tracking-[0.08em] text-slate-500/35 dark:text-white/30"
      style={{ textShadow: '0 1px 2px rgba(0,0,0,.12)' }}
      aria-hidden="true"
    >
      -- FPS
    </span>
  );
}
