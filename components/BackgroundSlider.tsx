"use client";

import { useEffect, useState } from 'react';
import { siteConfig } from '../siteConfig';

const SWITCH_INTERVAL = 10000;
const FADE_DURATION = 2000;

export default function BackgroundSlider() {
  const images = siteConfig.bgImages || [];
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
  }, [index, images]);

  useEffect(() => {
    if (previousIndex === null) return;

    const timer = window.setTimeout(() => {
      setPreviousIndex(null);
    }, FADE_DURATION + 120);

    return () => window.clearTimeout(timer);
  }, [previousIndex]);

  if (images.length === 0) return null;

  const renderLayer = (
    img: string,
    key: string,
    className: string,
    animation?: string
  ) => (
    <div
      key={key}
      className={`absolute inset-0 transform-gpu ${className}`}
      style={{
        backgroundImage: `url(${img})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        animation,
        willChange: animation ? 'opacity' : undefined,
      }}
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
        renderLayer(
          images[previousIndex],
          `previous-${previousIndex}`,
          'z-0 opacity-100'
        )}

      {renderLayer(
        images[index],
        `current-${index}`,
        'z-[1]',
        previousIndex !== null
          ? `bgFadeIn60 ${FADE_DURATION}ms ease-in-out both`
          : undefined
      )}

      <style>{`
        @keyframes bgFadeIn60 {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
