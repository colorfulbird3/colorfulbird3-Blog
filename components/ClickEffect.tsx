"use client";

import { useEffect, useRef } from 'react';

type Ripple = {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  velocity: number;
};

export default function ClickEffect() {
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
    let rafId: number | null = null;
    let lastTime = 0;

    const ripples: Ripple[] = [];

    const resize = () => {
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);

      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    const stop = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      lastTime = 0;
    };

    const draw = (now: number) => {
      rafId = requestAnimationFrame(draw);

      const dt = lastTime === 0 ? 1 / 60 : Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];

        r.radius += r.velocity * dt * 60;
        r.opacity -= dt * 0.85;

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(129,140,248,${Math.max(0, r.opacity)})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        if (r.opacity <= 0 || r.radius >= 64) {
          ripples.splice(i, 1);
        }
      }

      if (ripples.length === 0) {
        ctx.clearRect(0, 0, width, height);
        stop();
      }
    };

    const click = (event: MouseEvent) => {
      if (ripples.length >= 5) ripples.shift();

      ripples.push({
        x: event.clientX,
        y: event.clientY,
        radius: 0,
        opacity: 0.58,
        velocity: 2.5,
      });

      if (rafId === null) {
        rafId = requestAnimationFrame(draw);
      }
    };

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('click', click, { passive: true });

    resize();

    return () => {
      stop();
      window.removeEventListener('resize', resize);
      window.removeEventListener('click', click);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ contain: 'strict' }}
      aria-hidden="true"
    />
  );
}
