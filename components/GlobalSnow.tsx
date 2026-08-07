"use client";

import { useEffect, useRef, useState } from 'react';
import { animationScheduler } from './effects/AnimationScheduler';

interface SnowParticle {
  x: number;
  y: number;
  size: number;
  duration: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  drift: number;
  spriteIndex: number;
}

const SNOW_COUNT = 40;
const ROTATION_STEPS = 20;
const MAX_DPR = 1.0;

function createCanvas(size: number) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

function makeSnowBase(char: string) {
  const canvas = createCanvas(72);
  const ctx = canvas.getContext('2d')!;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font =
    '48px system-ui, "Segoe UI Symbol", sans-serif';

  // 光晕只在纹理生成时做一次。
  ctx.shadowBlur = 5;
  ctx.shadowColor = 'rgba(255,255,255,.78)';
  ctx.fillStyle = '#fff';
  ctx.fillText(char, 36, 36);

  return canvas;
}

function buildRotationAtlas(source: HTMLCanvasElement) {
  return Array.from(
    { length: ROTATION_STEPS },
    (_, index) => {
      const canvas = createCanvas(84);
      const ctx = canvas.getContext('2d')!;
      const angle =
        (index / ROTATION_STEPS) * Math.PI * 2;

      ctx.translate(42, 42);
      ctx.rotate(angle);
      ctx.drawImage(
        source,
        -source.width / 2,
        -source.height / 2
      );

      return canvas;
    }
  );
}

function resetSnow(
  particle: SnowParticle,
  width: number,
  height: number,
  randomY = false
) {
  particle.x = Math.random() * width;
  particle.y = randomY
    ? Math.random() * height
    : -30 - Math.random() * 80;

  particle.size = 10 + Math.random() * 15;
  particle.duration = 4 + Math.random() * 6;
  particle.rotation = Math.random() * Math.PI * 2;
  particle.rotationSpeed =
    (0.5 + Math.random()) * (Math.PI / 2);

  particle.opacity = 0.3 + Math.random() * 0.5;
  particle.drift = (Math.random() - 0.5) * 45;
  particle.spriteIndex = Math.floor(Math.random() * 3);
}

function SnowCanvas() {
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

    const chars = ['❄', '❅', '❆'];

    const atlases = chars.map((char) =>
      buildRotationAtlas(makeSnowBase(char))
    );

    const particles: SnowParticle[] = Array.from({
      length: SNOW_COUNT,
    }).map(() => ({
      x: 0,
      y: 0,
      size: 16,
      duration: 7,
      rotation: 0,
      rotationSpeed: 0.5,
      opacity: 0.7,
      drift: 0,
      spriteIndex: 0,
    }));

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

        for (const particle of particles) {
          if (
            particle.x === 0 &&
            particle.y === 0
          ) {
            resetSnow(
              particle,
              width,
              height,
              true
            );
          }
        }

        resizeRaf = null;
      });
    };

    const unsubscribe = animationScheduler.subscribe(
      (_timeMs, deltaSeconds) => {
        if (
          document.hidden ||
          width <= 1 ||
          height <= 1
        ) {
          return;
        }

        ctx.clearRect(0, 0, width, height);

        for (const particle of particles) {
          const speed =
            (height + 80) / particle.duration;

          particle.y += speed * deltaSeconds;
          particle.rotation +=
            particle.rotationSpeed * deltaSeconds;

          const progress = Math.max(
            0,
            particle.y / Math.max(1, height)
          );

          const x =
            particle.x +
            particle.drift * progress;

          if (particle.y > height + 45) {
            resetSnow(
              particle,
              width,
              height,
              false
            );
            continue;
          }

          const normalizedRotation =
            ((particle.rotation %
              (Math.PI * 2)) +
              Math.PI * 2) %
            (Math.PI * 2);

          const rotationIndex =
            Math.floor(
              (normalizedRotation /
                (Math.PI * 2)) *
                ROTATION_STEPS
            ) % ROTATION_STEPS;

          const sprite =
            atlases[particle.spriteIndex][
              rotationIndex
            ];

          ctx.globalAlpha = particle.opacity;

          ctx.drawImage(
            sprite,
            x - particle.size / 2,
            particle.y - particle.size / 2,
            particle.size,
            particle.size
          );
        }

        ctx.globalAlpha = 1;
      },
      {
        priority: 'decorative',
        maxFps: 60,
        interactionMaxFps: 60,
      }
    );

    window.addEventListener('resize', resize, {
      passive: true,
    });

    resize();

    return () => {
      unsubscribe();

      window.removeEventListener(
        'resize',
        resize
      );

      if (resizeRaf !== null) {
        cancelAnimationFrame(resizeRaf);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkWinter = () => {
      const active =
        document.body.classList.contains(
          'winter-mode'
        ) ||
        localStorage.getItem('winter-mode') ===
          'true';

      setIsWinter(active);

      if (active) {
        document.body.classList.add(
          'winter-mode'
        );
      }
    };

    checkWinter();

    const observer = new MutationObserver(() => {
      setIsWinter(
        document.body.classList.contains(
          'winter-mode'
        )
      );
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  if (!mounted || !isWinter) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[190] overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-900/10 mix-blend-overlay transition-opacity duration-1000" />
      <SnowCanvas />
    </div>
  );
}
