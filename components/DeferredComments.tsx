"use client";

import dynamic from 'next/dynamic';
import {
  useEffect,
  useRef,
  useState,
} from 'react';

const Comments = dynamic(
  () => import('./Comments'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full min-h-20" />
    ),
  }
);

/**
 * Gitalk 和它的 CSS/JS 只有在用户接近评论区时才加载。
 * 这样“点开文章”的首屏不会马上初始化 Gitalk。
 */
export default function DeferredComments() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] =
    useState(false);

  useEffect(() => {
    const host = hostRef.current;

    if (!host || shouldLoad) return;

    const observer =
      new IntersectionObserver(
        (entries) => {
          if (
            entries.some(
              (entry) =>
                entry.isIntersecting
            )
          ) {
            setShouldLoad(true);
            observer.disconnect();
          }
        },
        {
          // 提前约 1000px 预热，用户滚到底部时通常已经加载完。
          rootMargin: '1000px 0px',
        }
      );

    observer.observe(host);

    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div
      ref={hostRef}
      className="min-h-[80px]"
    >
      {shouldLoad ? <Comments /> : null}
    </div>
  );
}
