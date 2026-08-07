"use client";

import { useEffect, useRef } from 'react';

type Firefly = {
  x: number;
  y: number;
  size: number;
  phase: number;
  speedX: number;
  speedY: number;
  pulse: number;
};

type Petal = {
  x: number;
  y: number;
  size: number;
  fallSpeed: number;
  sway: number;
  phase: number;
  rotate: number;
  rotateSpeed: number;
};

type GrassBlade = {
  x: number;
  height: number;
  width: number;
  phase: number;
  speed: number;
  opacity: number;
};

const PARTICLE_FPS = 30;
const GRASS_FPS = 30;
const MAX_DPR = 1;

const FIREFLY_COUNT = 36;
const PETAL_COUNT = 30;
const GRASS_COUNT = 100;

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function makeFireflySprite() {
  const canvas = makeCanvas(48, 48);
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(24, 24, 1, 24, 24, 23);

  g.addColorStop(0, 'rgba(245,255,245,1)');
  g.addColorStop(0.16, 'rgba(190,255,205,.96)');
  g.addColorStop(0.45, 'rgba(80,255,130,.48)');
  g.addColorStop(1, 'rgba(80,255,130,0)');

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 48, 48);
  return canvas;
}

function makePetalSprite() {
  const canvas = makeCanvas(42, 46);
  const ctx = canvas.getContext('2d')!;

  ctx.translate(21, 23);
  ctx.fillStyle = 'rgba(249,168,212,.84)';
  ctx.beginPath();
  ctx.moveTo(0, -17);
  ctx.bezierCurveTo(12, -16, 17, -5, 10, 4);
  ctx.bezierCurveTo(4, 12, -4, 17, -11, 19);
  ctx.bezierCurveTo(-14, 8, -13, -5, -6, -13);
  ctx.bezierCurveTo(-4, -15, -2, -16, 0, -17);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.quadraticCurveTo(-1, 3, -8, 14);
  ctx.stroke();

  return canvas;
}

function resetPetal(p: Petal, width: number, height: number, randomY = false) {
  p.x = Math.random() * width;
  p.y = randomY ? Math.random() * height : -30 - Math.random() * 80;
  p.size = 9 + Math.random() * 10;
  p.fallSpeed = 22 + Math.random() * 28;
  p.sway = 18 + Math.random() * 34;
  p.phase = Math.random() * Math.PI * 2;
  p.rotate = Math.random() * Math.PI * 2;
  p.rotateSpeed = (Math.random() - 0.5) * 0.8;
}

function useVisibilityRef() {
  const visibleRef = useRef(true);

  useEffect(() => {
    const update = () => {
      visibleRef.current = !document.hidden;
    };

    document.addEventListener('visibilitychange', update);
    update();

    return () => {
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  return visibleRef;
}

export default function StableEffectsCanvas({ isDark }: { isDark: boolean }) {
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const grassCanvasRef = useRef<HTMLCanvasElement>(null);
  const darkRef = useRef(isDark);
  const visibleRef = useVisibilityRef();

  useEffect(() => {
    darkRef.current = isDark;
  }, [isDark]);

  useEffect(() => {
    const canvas = particleCanvasRef.current;
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

    const fireflySprite = makeFireflySprite();
    const petalSprite = makePetalSprite();

    const fireflies: Firefly[] = Array.from({ length: FIREFLY_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 3 + Math.random() * 4,
      phase: Math.random() * Math.PI * 2,
      speedX: 0.08 + Math.random() * 0.10,
      speedY: 0.07 + Math.random() * 0.12,
      pulse: 0.6 + Math.random() * 0.8,
    }));

    const petals: Petal[] = Array.from({ length: PETAL_COUNT }, () => ({
      x: 0,
      y: 0,
      size: 12,
      fallSpeed: 30,
      sway: 25,
      phase: 0,
      rotate: 0,
      rotateSpeed: 0,
    }));

    const resize = () => {
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      for (const p of petals) {
        if (p.x === 0 && p.y === 0) {
          resetPetal(p, width, height, true);
        }
      }
    };

    const drawFireflies = (time: number) => {
      ctx.globalCompositeOperation = 'lighter';

      for (const f of fireflies) {
        const x =
          f.x * width +
          Math.sin(time * f.speedX + f.phase) * width * 0.06;

        const y =
          f.y * height +
          Math.cos(time * f.speedY + f.phase * 0.7) * height * 0.08;

        const pulse = 0.5 + 0.5 * Math.sin(time * f.pulse + f.phase);
        const size = 18 + f.size * 3.2 * (0.88 + pulse * 0.18);

        ctx.globalAlpha = 0.18 + pulse * 0.72;
        ctx.drawImage(
          fireflySprite,
          x - size / 2,
          y - size / 2,
          size,
          size
        );
      }

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    };

    const drawPetals = (time: number, dt: number) => {
      for (const p of petals) {
        p.y += p.fallSpeed * dt;
        p.rotate += p.rotateSpeed * dt;

        const x = p.x + Math.sin(time * 0.55 + p.phase) * p.sway;

        if (p.y > height + 40 || x < -80 || x > width + 80) {
          resetPetal(p, width, height, false);
          continue;
        }

        ctx.save();
        ctx.translate(x, p.y);
        ctx.rotate(p.rotate);
        ctx.globalAlpha = 0.88;
        ctx.drawImage(
          petalSprite,
          -p.size / 2,
          -p.size / 2,
          p.size,
          p.size * 1.08
        );
        ctx.restore();
      }

      ctx.globalAlpha = 1;
    };

    const frame = (now: number) => {
      rafId = requestAnimationFrame(frame);

      if (!visibleRef.current) {
        lastTime = now;
        return;
      }

      const minInterval = 1000 / PARTICLE_FPS;
      if (now - lastDraw < minInterval) return;

      const dt = Math.min((now - lastTime) / 1000, 0.05);
      const t = now / 1000;

      lastTime = now;
      lastDraw = now;

      ctx.clearRect(0, 0, width, height);

      if (darkRef.current) {
        drawFireflies(t);
      } else {
        drawPetals(t, dt);
      }
    };

    window.addEventListener('resize', resize, { passive: true });
    resize();
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [visibleRef]);

  useEffect(() => {
    const canvas = grassCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true,
    });

    if (!ctx) return;

    const LOGICAL_HEIGHT = 118;

    let width = 1;
    let rafId = 0;
    let lastDraw = 0;

    const blades: GrassBlade[] = Array.from({ length: GRASS_COUNT }, (_, index) => ({
      x: index / Math.max(1, GRASS_COUNT - 1),
      height: 28 + Math.random() * 62,
      width: 1 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.55 + Math.random() * 0.55,
      opacity: 0.24 + Math.random() * 0.42,
    }));

    const resize = () => {
      width = Math.max(1, window.innerWidth);
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(LOGICAL_HEIGHT * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${LOGICAL_HEIGHT}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const frame = (now: number) => {
      rafId = requestAnimationFrame(frame);

      if (!visibleRef.current) return;

      const minInterval = 1000 / GRASS_FPS;
      if (now - lastDraw < minInterval) return;
      lastDraw = now;

      const t = now / 1000;
      ctx.clearRect(0, 0, width, LOGICAL_HEIGHT);

      for (const blade of blades) {
        const x = blade.x * width;
        const sway = Math.sin(t * blade.speed + blade.phase);
        const topX = x + sway * (5 + blade.height * 0.07);
        const controlX = x + sway * 4;

        const alpha = blade.opacity;
        const color = darkRef.current
          ? `rgba(255,255,255,${alpha})`
          : `rgba(16,185,129,${alpha})`;

        ctx.beginPath();
        ctx.moveTo(x, LOGICAL_HEIGHT + 2);
        ctx.quadraticCurveTo(
          controlX,
          LOGICAL_HEIGHT - blade.height * 0.55,
          topX,
          LOGICAL_HEIGHT - blade.height
        );
        ctx.strokeStyle = color;
        ctx.lineWidth = blade.width;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    };

    window.addEventListener('resize', resize, { passive: true });
    resize();
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [visibleRef]);

  return (
    <>
      <canvas
        ref={particleCanvasRef}
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          contain: 'strict',
          transform: 'translateZ(0)',
        }}
        aria-hidden="true"
      />
      <canvas
        ref={grassCanvasRef}
        className="fixed left-0 right-0 bottom-0 pointer-events-none z-10"
        style={{
          contain: 'strict',
          transform: 'translateZ(0)',
        }}
        aria-hidden="true"
      />
    </>
  );
}
