"use client";

import { useEffect, useRef } from 'react';
import { animationScheduler } from './effects/AnimationScheduler';

interface Ripple {
  x: number;
  y: number;
  r: number;
  maxR: number;
  opacity: number;
  velocity: number;
}

const MAX_RIPPLES = 8;
const MAX_DPR = 1.2;

export default function ClickEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true,
    });

    if (!ctx) return;

    let width = 1;
    let height = 1;
    let resizeRaf: number | null = null;
    let unsubscribeFrame: (() => void) | null = null;

    const ripples: Ripple[] = [];

    const resize = () => {
      if (resizeRaf !== null) {
        cancelAnimationFrame(resizeRaf);
      }

      resizeRaf = requestAnimationFrame(() => {
        width = Math.max(1, window.innerWidth);
        height = Math.max(1, window.innerHeight);

        const dpr = Math.min(
          window.devicePixelRatio || 1,
          MAX_DPR
        );

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        resizeRaf = null;
      });
    };

    const stopFrameSubscription = () => {
      if (unsubscribeFrame) {
        unsubscribeFrame();
        unsubscribeFrame = null;
      }
    };

    const draw = (
      _timeMs: number,
      deltaSeconds: number
    ) => {
      if (document.hidden) return;

      ctx.clearRect(0, 0, width, height);

      const frameScale = deltaSeconds * 60;

      for (
        let index = ripples.length - 1;
        index >= 0;
        index--
      ) {
        const ripple = ripples[index];

        ripple.r +=
          ripple.velocity * frameScale;

        ripple.velocity *= Math.pow(
          0.96,
          frameScale
        );

        ripple.opacity -=
          0.015 * frameScale;

        ctx.beginPath();
        ctx.arc(
          ripple.x,
          ripple.y,
          ripple.r,
          0,
          Math.PI * 2
        );

        ctx.strokeStyle = `rgba(129, 140, 248, ${Math.max(
          0,
          ripple.opacity
        )})`;

        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(
          ripple.x,
          ripple.y,
          ripple.r * 0.5,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = `rgba(129, 140, 248, ${Math.max(
          0,
          ripple.opacity * 0.3
        )})`;

        ctx.fill();

        if (
          ripple.opacity <= 0 ||
          ripple.r >= ripple.maxR
        ) {
          ripples.splice(index, 1);
        }
      }

      if (ripples.length === 0) {
        ctx.clearRect(0, 0, width, height);
        stopFrameSubscription();
      }
    };

    const ensureFrameSubscription = () => {
      if (!unsubscribeFrame) {
        // 点击反馈属于关键交互，滚动时也保持原生刷新率。
        unsubscribeFrame =
          animationScheduler.subscribe(draw, {
            priority: 'critical',
            maxFps: Number.POSITIVE_INFINITY,
          });
      }
    };

    const handleClick = (event: MouseEvent) => {
      if (ripples.length >= MAX_RIPPLES) {
        ripples.shift();
      }

      ripples.push({
        x: event.clientX,
        y: event.clientY,
        r: 0,
        maxR: 60,
        opacity: 0.6,
        velocity: 2.5,
      });

      ensureFrameSubscription();
    };

    window.addEventListener('resize', resize, {
      passive: true,
    });

    window.addEventListener('click', handleClick, {
      passive: true,
    });

    resize();

    return () => {
      stopFrameSubscription();

      window.removeEventListener(
        'resize',
        resize
      );

      window.removeEventListener(
        'click',
        handleClick
      );

      if (resizeRaf !== null) {
        cancelAnimationFrame(resizeRaf);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{
        contain: 'strict',
        transform: 'translateZ(0)',
      }}
      aria-hidden="true"
    />
  );
}
