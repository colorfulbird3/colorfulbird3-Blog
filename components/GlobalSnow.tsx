"use client";

import { useEffect, useRef, useState } from 'react';

type Snow = {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  phase: number;
  opacity: number;
};

const SNOW_COUNT = 24;
const FPS = 30;

function SnowCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true,
    });

    if (!ctx) return;

    let width = 1;
    let height = 1;
    let rafId = 0;
    let lastDraw = 0;
    let lastTime = performance.now();

    const particles: Snow[] = Array.from({ length: SNOW_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 10 + Math.random() * 14,
      speed: 28 + Math.random() * 42,
      drift: 12 + Math.random() * 30,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.35 + Math.random() * 0.45,
    }));

    const resize = () => {
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);

      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    const frame = (now: number) => {
      rafId = requestAnimationFrame(frame);

      if (document.hidden) {
        lastTime = now;
        return;
      }

      const minInterval = 1000 / FPS;
      if (now - lastDraw < minInterval) return;

      const dt = Math.min((now - lastTime) / 1000, 0.05);
      const t = now / 1000;

      lastTime = now;
      lastDraw = now;

      ctx.clearRect(0, 0, width, height);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (const p of particles) {
        p.y += (p.speed * dt) / Math.max(1, height);

        if (p.y > 1.08) {
          p.y = -0.05;
          p.x = Math.random();
        }

        const x =
          p.x * width +
          Math.sin(t * 0.55 + p.phase) * p.drift;

        ctx.globalAlpha = p.opacity;
        ctx.font = `${p.size}px system-ui, "Segoe UI Symbol", sans-serif`;
        ctx.fillStyle = '#fff';
        ctx.fillText('❄', x, p.y * height);
      }

      ctx.globalAlpha = 1;
    };

    window.addEventListener('resize', resize, { passive: true });
    resize();
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 pointer-events-none"
      style={{
        contain: 'strict',
        transform: 'translateZ(0)',
      }}
      aria-hidden="true"
    />
  );
}

export default function GlobalSnow() {
  const [isWinter, setIsWinter] = useState(false);

  useEffect(() => {
    const sync = () => {
      setIsWinter(
        document.body.classList.contains('winter-mode') ||
          localStorage.getItem('winter-mode') === 'true'
      );
    };

    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  if (!isWinter) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[190] overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-900/10" />
      <SnowCanvas />
    </div>
  );
}
