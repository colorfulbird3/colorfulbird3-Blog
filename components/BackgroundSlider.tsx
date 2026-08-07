"use client";

import { useEffect, useMemo, useState } from 'react';
import { siteConfig } from '../siteConfig';

const SWITCH_INTERVAL = 15000;
const FADE_DURATION = 900;

export default function BackgroundSlider() {
  const images = useMemo(() => siteConfig.bgImages || [], []);
  const [index, setIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = window.setInterval(() => {
      setIndex((current) => {
        const next = (current + 1) % images.length;
        setPreviousIndex(current);
        return next;
      });
    }, SWITCH_INTERVAL);

    return () => window.clearInterval(timer);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;

    const next = (index + 1) % images.length;
    const image = new Image();
    image.decoding = 'async';
    image.src = images[next];

    if (image.decode) {
      image.decode().catch(() => {});
    }
  }, [index, images]);

  useEffect(() => {
    if (previousIndex === null) return;

    const timer = window.setTimeout(() => {
      setPreviousIndex(null);
    }, FADE_DURATION + 80);

    return () => window.clearTimeout(timer);
  }, [previousIndex]);

  if (images.length === 0) return null;

  const layer = (src: string, key: string, extra = '') => (
    <img
      key={key}
      src={src}
      alt=""
      decoding="async"
      draggable={false}
      className={`absolute inset-0 w-full h-full object-cover select-none ${extra}`}
      aria-hidden="true"
    />
  );

  return (
    <div
      className="absolute inset-0 z-[-10] overflow-hidden"
      style={{ contain: 'strict' }}
      aria-hidden="true"
    >
      {previousIndex !== null &&
        previousIndex !== index &&
        layer(
          images[previousIndex],
          `previous-${previousIndex}`,
          'z-0 opacity-100'
        )}

      {layer(
        images[index],
        `current-${index}`,
        previousIndex !== null
          ? 'z-[1] bg-fade-steady'
          : 'z-[1]'
      )}

      <style>{`
        .bg-fade-steady {
          animation: bgFadeSteady ${FADE_DURATION}ms ease-out both;
        }

        @keyframes bgFadeSteady {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
