"use client";

import { useEffect, useRef } from 'react';
import { animationScheduler } from './AnimationScheduler';

interface Firefly {
  baseX: number;
  baseY: number;
  size: number;
  phaseA: number;
  phaseB: number;
  breathePhase: number;
  breatheSpeed: number;
  moveSpeedA: number;
  moveSpeedB: number;
  ampX: number;
  ampY: number;
}

interface Petal {
  x: number;
  y: number;
  size: number;
  duration: number;
  rotation: number;
  rotationSpeed: number;
  swayPhase: number;
  swaySpeed: number;
  drift: number;
}

interface GrassBlade {
  x: number;
  height: number;
  widthScale: number;
  phase: number;
  speed: number;
  opacity: number;
  leftCurve: boolean;
}

type ThemeGrassAtlas = {
  left: HTMLCanvasElement[];
  right: HTMLCanvasElement[];
};

const FIREFLY_COUNT = 50;
const PETAL_COUNT = 40;
const GRASS_COUNT = 150;

const PETAL_ROTATION_STEPS = 24;
const GRASS_ANGLE_STEPS = 16;
const MAX_DPR = 1.0;

function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function makeFireflySprite() {
  const canvas = createCanvas(64, 64);
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(
    32,
    32,
    1,
    32,
    32,
    31
  );

  gradient.addColorStop(0, 'rgba(245,255,245,1)');
  gradient.addColorStop(0.12, 'rgba(200,255,210,.98)');
  gradient.addColorStop(0.34, 'rgba(120,255,160,.78)');
  gradient.addColorStop(0.66, 'rgba(55,255,110,.22)');
  gradient.addColorStop(1, 'rgba(55,255,110,0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  return canvas;
}

function makePetalBase() {
  const canvas = createCanvas(72, 72);
  const ctx = canvas.getContext('2d')!;

  ctx.translate(36, 36);
  ctx.shadowBlur = 4;
  ctx.shadowColor = 'rgba(255,182,193,.5)';
  ctx.fillStyle = 'rgba(249,168,212,.82)';

  ctx.beginPath();
  ctx.moveTo(0, -28);
  ctx.bezierCurveTo(17, -28, 25, -12, 15, 3);
  ctx.bezierCurveTo(8, 14, -3, 23, -17, 29);
  ctx.bezierCurveTo(-22, 11, -20, -9, -10, -21);
  ctx.bezierCurveTo(-7, -25, -3, -27, 0, -28);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,.24)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.quadraticCurveTo(-2, 2, -13, 22);
  ctx.stroke();

  return canvas;
}

function buildRotatedAtlas(
  source: HTMLCanvasElement,
  steps: number,
  size: number
) {
  return Array.from({ length: steps }, (_, index) => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d')!;
    const angle = (index / steps) * Math.PI * 2;

    ctx.translate(size / 2, size / 2);
    ctx.rotate(angle);
    ctx.drawImage(
      source,
      -source.width / 2,
      -source.height / 2
    );

    return canvas;
  });
}

function makeGrassSprite(
  color: string,
  leftCurve: boolean,
  angleDeg: number
) {
  const width = 56;
  const height = 132;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d')!;

  ctx.translate(width / 2, height - 2);
  ctx.rotate((angleDeg * Math.PI) / 180);

  const gradient = ctx.createLinearGradient(0, 0, 0, -118);
  gradient.addColorStop(0, color);
  gradient.addColorStop(
    0.68,
    color.replace(/[\d.]+\)$/u, '0.28)')
  );
  gradient.addColorStop(
    1,
    color.replace(/[\d.]+\)$/u, '0)')
  );

  ctx.strokeStyle = gradient;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(0, 0);

  if (leftCurve) {
    ctx.bezierCurveTo(-1, -30, -8, -78, -4, -118);
  } else {
    ctx.bezierCurveTo(1, -30, 8, -78, 4, -118);
  }

  ctx.stroke();

  return canvas;
}

function buildGrassAtlas(
  color: string
): ThemeGrassAtlas {
  const angles = Array.from(
    { length: GRASS_ANGLE_STEPS },
    (_, index) =>
      -5 + (index / (GRASS_ANGLE_STEPS - 1)) * 20
  );

  return {
    left: angles.map((angle) =>
      makeGrassSprite(color, true, angle)
    ),
    right: angles.map((angle) =>
      makeGrassSprite(color, false, angle)
    ),
  };
}

function resetPetal(
  petal: Petal,
  width: number,
  height: number,
  randomY = false
) {
  petal.x = Math.random() * width;
  petal.y = randomY
    ? Math.random() * height
    : -40 - Math.random() * height * 0.15;

  petal.size = 8 + Math.random() * 12;
  petal.duration = 6 + Math.random() * 8;
  petal.rotation = Math.random() * Math.PI * 2;
  petal.rotationSpeed =
    (Math.PI * 2) / petal.duration;

  petal.swayPhase = Math.random() * Math.PI * 2;
  petal.swaySpeed = 0.45 + Math.random() * 0.45;
  petal.drift = width * (0.1 + Math.random() * 0.08);
}

export default function BackgroundParticleCanvas({
  isDark,
}: {
  isDark: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const darkRef = useRef(isDark);

  useEffect(() => {
    darkRef.current = isDark;
  }, [isDark]);

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
    let themeBlend = darkRef.current ? 1 : 0;

    const fireflySprite = makeFireflySprite();

    const petalAtlas = buildRotatedAtlas(
      makePetalBase(),
      PETAL_ROTATION_STEPS,
      84
    );

    const dayGrass = buildGrassAtlas(
      'rgba(16,185,129,.82)'
    );

    const nightGrass = buildGrassAtlas(
      'rgba(255,255,255,.82)'
    );

    const fireflies: Firefly[] = Array.from({
      length: FIREFLY_COUNT,
    }).map(() => ({
      baseX: Math.random(),
      baseY: Math.random(),
      size: 3 + Math.random() * 4,
      phaseA: Math.random() * Math.PI * 2,
      phaseB: Math.random() * Math.PI * 2,
      breathePhase: Math.random() * Math.PI * 2,
      breatheSpeed:
        (Math.PI * 2) / (3 + Math.random() * 5),
      moveSpeedA:
        (Math.PI * 2) / (15 + Math.random() * 20),
      moveSpeedB:
        (Math.PI * 2) / (17 + Math.random() * 21),
      ampX: 0.04 + Math.random() * 0.11,
      ampY: 0.05 + Math.random() * 0.15,
    }));

    const petals: Petal[] = Array.from({
      length: PETAL_COUNT,
    }).map(() => ({
      x: 0,
      y: 0,
      size: 10,
      duration: 10,
      rotation: 0,
      rotationSpeed: 0.5,
      swayPhase: 0,
      swaySpeed: 0.6,
      drift: 80,
    }));

    const grasses: GrassBlade[] = Array.from({
      length: GRASS_COUNT,
    }).map((_, index) => ({
      x:
        index / GRASS_COUNT +
        (Math.random() - 0.5) * 0.005,
      height: 30 + Math.random() * 50,
      widthScale: 0.82 + Math.random() * 0.36,
      phase: Math.random() * Math.PI * 2,
      speed:
        (Math.PI * 2) / (3 + Math.random() * 4),
      opacity: 0.2 + Math.random() * 0.4,
      leftCurve: Math.random() > 0.5,
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

        canvas.width = Math.max(
          1,
          Math.floor(width * dpr)
        );

        canvas.height = Math.max(
          1,
          Math.floor(height * dpr)
        );

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        for (const petal of petals) {
          if (petal.x === 0 && petal.y === 0) {
            resetPetal(petal, width, height, true);
          }
        }

        resizeRaf = null;
      });
    };

    const renderSakura = (
      timeSeconds: number,
      deltaSeconds: number,
      alpha: number
    ) => {
      if (alpha <= 0.003) return;

      ctx.globalCompositeOperation = 'source-over';

      for (const petal of petals) {
        const speed =
          (height * 1.2) / petal.duration;

        petal.y += speed * deltaSeconds;
        petal.rotation +=
          petal.rotationSpeed * deltaSeconds;

        const progress = Math.max(
          0,
          Math.min(
            1.2,
            petal.y / Math.max(1, height)
          )
        );

        const sway =
          Math.sin(
            timeSeconds * petal.swaySpeed +
              petal.swayPhase
          ) * 18;

        const x =
          petal.x + petal.drift * progress + sway;

        if (
          petal.y > height + 80 ||
          x > width + 120
        ) {
          resetPetal(
            petal,
            width,
            height,
            false
          );
          continue;
        }

        const normalizedRotation =
          ((petal.rotation % (Math.PI * 2)) +
            Math.PI * 2) %
          (Math.PI * 2);

        const rotationIndex = Math.floor(
          (normalizedRotation / (Math.PI * 2)) *
            PETAL_ROTATION_STEPS
        ) % PETAL_ROTATION_STEPS;

        const sprite = petalAtlas[rotationIndex];
        const drawW = petal.size * 1.45;
        const drawH = petal.size * 1.45;

        ctx.globalAlpha = alpha * 0.92;

        ctx.drawImage(
          sprite,
          x - drawW / 2,
          petal.y - drawH / 2,
          drawW,
          drawH
        );
      }
    };

    const renderFireflies = (
      timeSeconds: number,
      alpha: number
    ) => {
      if (alpha <= 0.003) return;

      ctx.globalCompositeOperation = 'lighter';

      for (const fly of fireflies) {
        const x =
          fly.baseX * width +
          Math.sin(
            timeSeconds * fly.moveSpeedA +
              fly.phaseA
          ) *
            width *
            fly.ampX;

        const y =
          fly.baseY * height +
          Math.cos(
            timeSeconds * fly.moveSpeedB +
              fly.phaseB
          ) *
            height *
            fly.ampY;

        const breathe =
          0.5 +
          0.5 *
            Math.sin(
              timeSeconds * fly.breatheSpeed +
                fly.breathePhase
            );

        const opacity =
          (0.08 + breathe * 0.92) * alpha;

        const size =
          24 +
          fly.size *
            3.6 *
            (0.82 + breathe * 0.24);

        ctx.globalAlpha = opacity;

        ctx.drawImage(
          fireflySprite,
          x - size / 2,
          y - size / 2,
          size,
          size
        );
      }

      ctx.globalCompositeOperation = 'source-over';
    };

    const drawGrassTheme = (
      timeSeconds: number,
      alpha: number,
      atlas: ThemeGrassAtlas
    ) => {
      if (alpha <= 0.003) return;

      for (const blade of grasses) {
        const sway =
          0.5 +
          0.5 *
            Math.sin(
              timeSeconds * blade.speed +
                blade.phase
            );

        const angleIndex = Math.min(
          GRASS_ANGLE_STEPS - 1,
          Math.max(
            0,
            Math.round(
              sway * (GRASS_ANGLE_STEPS - 1)
            )
          )
        );

        const sprite = blade.leftCurve
          ? atlas.left[angleIndex]
          : atlas.right[angleIndex];

        const drawH = blade.height;
        const drawW =
          drawH *
          (sprite.width / sprite.height) *
          blade.widthScale;

        const x = blade.x * width;

        ctx.globalAlpha =
          blade.opacity * alpha;

        ctx.drawImage(
          sprite,
          x - drawW / 2,
          height - drawH,
          drawW,
          drawH
        );
      }
    };

    const renderGrass = (
      timeSeconds: number,
      blend: number
    ) => {
      if (blend < 0.997) {
        drawGrassTheme(
          timeSeconds,
          1 - blend,
          dayGrass
        );
      }

      if (blend > 0.003) {
        drawGrassTheme(
          timeSeconds,
          blend,
          nightGrass
        );
      }
    };

    const unsubscribe = animationScheduler.subscribe(
      (timeMs, deltaSeconds) => {
        if (
          document.hidden ||
          width <= 1 ||
          height <= 1
        ) {
          return;
        }

        const timeSeconds = timeMs / 1000;
        const targetBlend = darkRef.current ? 1 : 0;

        const blendFactor =
          1 - Math.exp(-deltaSeconds * 5.5);

        themeBlend +=
          (targetBlend - themeBlend) * blendFactor;

        ctx.clearRect(0, 0, width, height);

        renderSakura(
          timeSeconds,
          deltaSeconds,
          1 - themeBlend
        );

        renderFireflies(
          timeSeconds,
          themeBlend
        );

        renderGrass(
          timeSeconds,
          themeBlend
        );

        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      },
      {
        priority: 'decorative',
        // 装饰特效固定 60FPS。页面合成仍可跑 120/144/165Hz，
        // 但不再让全屏 Canvas 每秒重绘 120+ 次。
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
      className="fixed inset-0 w-full h-full pointer-events-none z-10"
      style={{
        contain: 'strict',
        transform: 'translateZ(0)',
      }}
      aria-hidden="true"
    />
  );
}
