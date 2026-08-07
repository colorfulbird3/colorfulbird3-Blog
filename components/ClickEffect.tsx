"use client";

import { useEffect, useRef } from 'react';

class Ripple {
  x: number;
  y: number;
  r = 0;
  maxR = 60;
  opacity = 0.6;
  velocity = 2.5;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update() {
    this.r += this.velocity;
    this.velocity *= 0.96;
    this.opacity -= 0.015;
  }
}

export default function ClickEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const ripples: Ripple[] = [];
    let rafId: number | null = null;
    let resizeRaf: number | null = null;

    const resize = () => {
      if (resizeRaf !== null) cancelAnimationFrame(resizeRaf);

      resizeRaf = requestAnimationFrame(() => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.25);

        canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
        canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        resizeRaf = null;
      });
    };

    const drawRipple = (ripple: Ripple) => {
      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, ripple.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(129, 140, 248, ${Math.max(0, ripple.opacity)})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, ripple.r * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(129, 140, 248, ${Math.max(0, ripple.opacity * 0.26)})`;
      ctx.fill();
    };

    const animate = () => {
      rafId = null;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (ripples.length === 0) return;

      ctx.shadowBlur = 7;
      ctx.shadowColor = 'rgba(129, 140, 248, 0.35)';

      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];
        ripple.update();
        drawRipple(ripple);

        if (ripple.opacity <= 0 || ripple.r >= ripple.maxR) {
          ripples.splice(i, 1);
        }
      }

      if (ripples.length > 0 && !document.hidden) {
        rafId = requestAnimationFrame(animate);
      } else if (ripples.length === 0) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    };

    const ensureAnimating = () => {
      if (rafId === null && ripples.length > 0 && !document.hidden) {
        rafId = requestAnimationFrame(animate);
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (ripples.length >= 8) ripples.shift();
      ripples.push(new Ripple(e.clientX, e.clientY));
      ensureAnimating();
    };

    const handleVisibility = () => {
      if (document.hidden) {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      } else {
        ensureAnimating();
      }
    };

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);

    resize();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('click', handleClick);
      document.removeEventListener('visibilitychange', handleVisibility);

      if (rafId !== null) cancelAnimationFrame(rafId);
      if (resizeRaf !== null) cancelAnimationFrame(resizeRaf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      aria-hidden="true"
    />
  );
}
