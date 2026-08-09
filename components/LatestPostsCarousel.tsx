"use client";

import {
  useEffect,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';

const FADE_MS = 800;
const AUTO_MS = 5000;

export default function LatestPostsCarousel({
  posts,
}: {
  posts: any[];
}) {
  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [previousIndex, setPreviousIndex] =
    useState<number | null>(null);

  const fadeTimerRef =
    useRef<number | null>(null);

  const safePosts =
    posts && posts.length > 0
      ? posts
      : [];

  const switchTo = (nextIndex: number) => {
    if (
      nextIndex === currentIndex ||
      nextIndex < 0 ||
      nextIndex >= safePosts.length
    ) {
      return;
    }

    setPreviousIndex(currentIndex);
    setCurrentIndex(nextIndex);

    if (fadeTimerRef.current !== null) {
      window.clearTimeout(
        fadeTimerRef.current
      );
    }

    fadeTimerRef.current =
      window.setTimeout(() => {
        setPreviousIndex(null);
        fadeTimerRef.current = null;
      }, FADE_MS + 80);
  };

  useEffect(() => {
    if (safePosts.length <= 1) return;

    const timer = window.setInterval(() => {
      setCurrentIndex((current) => {
        const next =
          (current + 1) %
          safePosts.length;

        setPreviousIndex(current);

        if (
          fadeTimerRef.current !== null
        ) {
          window.clearTimeout(
            fadeTimerRef.current
          );
        }

        fadeTimerRef.current =
          window.setTimeout(() => {
            setPreviousIndex(null);
            fadeTimerRef.current = null;
          }, FADE_MS + 80);

        return next;
      });
    }, AUTO_MS);

    return () => {
      window.clearInterval(timer);

      if (
        fadeTimerRef.current !== null
      ) {
        window.clearTimeout(
          fadeTimerRef.current
        );
      }
    };
  }, [safePosts.length]);

  if (safePosts.length === 0) {
    return null;
  }

  const currentPost =
    safePosts[currentIndex];

  const previousPost =
    previousIndex !== null
      ? safePosts[previousIndex]
      : null;

  const renderBackground = (
    post: any,
    key: string,
    current: boolean
  ) => (
    <div
      key={key}
      className={`absolute inset-0 z-0 ${
        current
          ? 'carousel-fade-in'
          : ''
      }`}
    >
      <img
        src={post.cover}
        className="w-full h-full object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105"
        alt={post.title}
        decoding="async"
        fetchPriority={
          current ? 'high' : 'low'
        }
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
    </div>
  );

  return (
    <div className="interactive-surface md:col-span-4 rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl overflow-hidden relative group min-h-[420px] h-full flex flex-col performance-paint-container">
      <Link
        href={
          currentPost.slug === 'none'
            ? '#'
            : `/posts/${currentPost.slug}`
        }
        className="absolute inset-0 z-20"
        aria-label={`阅读 ${currentPost.title}`}
      />

      {previousPost &&
        previousIndex !== currentIndex &&
        renderBackground(
          previousPost,
          `previous-${previousPost.slug}`,
          false
        )}

      {renderBackground(
        currentPost,
        `current-${currentPost.slug}`,
        previousPost !== null
      )}

      <div className="relative z-10 flex flex-col justify-end p-6 w-full mt-auto h-full pointer-events-none">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-indigo-500/80 backdrop-blur-lg rounded-full text-[10px] text-white font-black uppercase tracking-widest shadow-lg">
            Latest Insight
          </span>

          {currentPost.formattedDate && (
            <span className="px-2 py-1 bg-black/40 backdrop-blur-md border border-white/20 rounded-full text-[10px] text-white/90 font-mono tracking-wider">
              <i className="ri-time-line mr-1" />
              {currentPost.formattedDate}
            </span>
          )}
        </div>

        <h2 className="text-2xl font-bold text-white mb-2 group-hover:-translate-y-1 transition-transform drop-shadow-md">
          {currentPost.title}
        </h2>

        <p className="text-sm text-gray-300 line-clamp-3 drop-shadow-sm mb-6">
          {currentPost.description}
        </p>
      </div>

      {safePosts.length > 1 && (
        <div className="absolute bottom-4 right-6 z-30 flex gap-2">
          {safePosts.map((_, index) => (
            <button
              key={index}
              onClick={(event) => {
                event.stopPropagation();
                switchTo(index);
              }}
              className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${
                index === currentIndex
                  ? 'w-6 bg-indigo-400'
                  : 'w-2 bg-white/40 hover:bg-white/80'
              }`}
              aria-label={`切换到第 ${index + 1} 篇文章`}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .carousel-fade-in {
          animation: carouselFade120
            ${FADE_MS}ms ease both;
        }

        @keyframes carouselFade120 {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
