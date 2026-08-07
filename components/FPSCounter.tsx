"use client";

import { useEffect, useRef } from 'react';

const UPDATE_MS = 350;
const SAMPLE_MS = 650;

export default function FPSCounter() {
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let rafId = 0;
    let lastFrame = 0;
    let sampleStart = 0;
    let frameCount = 0;
    let lastUpdate = 0;
    let smoothedFps = 0;

    const reset = (now: number) => {
      lastFrame = now;
      sampleStart = now;
      lastUpdate = now;
      frameCount = 0;
    };

    const tick = (now: number) => {
      if (lastFrame === 0) {
        reset(now);
        rafId = requestAnimationFrame(tick);
        return;
      }

      const delta = now - lastFrame;
      lastFrame = now;

      if (delta > 0 && delta < 250) {
        const instantFps = 1000 / delta;
        const alpha = 0.08;

        smoothedFps =
          smoothedFps === 0
            ? instantFps
            : smoothedFps +
              (instantFps - smoothedFps) * alpha;

        frameCount += 1;
      }

      const elapsed = now - sampleStart;

      if (elapsed >= SAMPLE_MS && frameCount > 0) {
        const windowFps =
          (frameCount * 1000) / elapsed;

        smoothedFps =
          smoothedFps === 0
            ? windowFps
            : smoothedFps * 0.6 + windowFps * 0.4;

        sampleStart = now;
        frameCount = 0;
      }

      if (now - lastUpdate >= UPDATE_MS) {
        lastUpdate = now;

        if (textRef.current) {
          textRef.current.textContent =
            `${Math.max(0, Math.round(smoothedFps))} FPS`;
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
        lastFrame = 0;
        return;
      }

      reset(performance.now());
      rafId = requestAnimationFrame(tick);
    };

    document.addEventListener(
      'visibilitychange',
      onVisibility
    );

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener(
        'visibilitychange',
        onVisibility
      );
    };
  }, []);

  return (
    <span
      ref={textRef}
      className="
        fixed
        top-3
        md:top-[72px]
        right-4
        z-[10000]
        pointer-events-none
        select-none
        font-mono
        text-[10px]
        md:text-[11px]
        tracking-[0.08em]
        text-slate-500/45
        dark:text-white/35
      "
      style={{
        textShadow:
          '0 1px 2px rgba(0,0,0,0.18)',
      }}
      aria-hidden="true"
    >
      -- FPS
    </span>
  );
}
