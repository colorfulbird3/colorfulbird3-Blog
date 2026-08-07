"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';

type TocItem = {
  level: number;
  text: string;
  id: string;
};

type HeadingPosition = {
  id: string;
  top: number;
};

const cleanMarkdownHeading = (
  rawText: string
) => {
  if (!rawText) return '';

  return rawText
    .replace(
      /\[([^\]]+)\]\([^)]+\)/g,
      '$1'
    )
    .replace(
      /!\[([^\]]*)\]\([^)]+\)/g,
      '$1'
    )
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/[*_~`#]/g, '')
    .trim();
};

const getSafeId = (rawText: string) => {
  const cleanText =
    cleanMarkdownHeading(rawText);

  return (
    'toc-' +
    cleanText
      .replace(
        /[^\u4e00-\u9fa5a-zA-Z0-9]/g,
        ''
      )
      .toLowerCase()
  );
};

const getDisplayText = (rawText: string) =>
  cleanMarkdownHeading(rawText);

function findActiveHeading(
  positions: HeadingPosition[],
  scrollPosition: number
) {
  let left = 0;
  let right = positions.length - 1;
  let result = '';

  while (left <= right) {
    const mid = (left + right) >> 1;

    if (
      positions[mid].top <=
      scrollPosition
    ) {
      result = positions[mid].id;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return result;
}

export default function ClientTOC({
  toc,
}: {
  toc: TocItem[];
}) {
  const [activeId, setActiveId] =
    useState('');

  const activeIdRef = useRef('');
  const positionsRef =
    useRef<HeadingPosition[]>([]);
  const scrollRafRef =
    useRef<number | null>(null);
  const measureRafRef =
    useRef<number | null>(null);

  useEffect(() => {
    const contentDiv =
      document.getElementById(
        'article-content'
      );

    if (!contentDiv) return;

    const headings = Array.from(
      contentDiv.querySelectorAll<HTMLElement>(
        'h1, h2, h3'
      )
    );

    headings.forEach((heading) => {
      heading.id = getSafeId(
        heading.textContent || ''
      );
    });

    const measureHeadings = () => {
      measureRafRef.current = null;

      positionsRef.current =
        headings.map((heading) => ({
          id: heading.id,
          top:
            heading.getBoundingClientRect()
              .top +
            window.scrollY,
        }));
    };

    const scheduleMeasure = () => {
      if (
        measureRafRef.current !== null
      ) {
        return;
      }

      measureRafRef.current =
        requestAnimationFrame(
          measureHeadings
        );
    };

    const updateActive = () => {
      scrollRafRef.current = null;

      const nextId = findActiveHeading(
        positionsRef.current,
        window.scrollY + 150
      );

      if (
        nextId &&
        nextId !== activeIdRef.current
      ) {
        activeIdRef.current = nextId;
        setActiveId(nextId);
      }
    };

    const handleScroll = () => {
      if (
        scrollRafRef.current !== null
      ) {
        return;
      }

      scrollRafRef.current =
        requestAnimationFrame(
          updateActive
        );
    };

    scheduleMeasure();

    const resizeObserver =
      new ResizeObserver(() => {
        scheduleMeasure();
      });

    resizeObserver.observe(contentDiv);

    window.addEventListener(
      'resize',
      scheduleMeasure,
      { passive: true }
    );

    window.addEventListener(
      'scroll',
      handleScroll,
      { passive: true }
    );

    const initialTimer =
      window.setTimeout(() => {
        measureHeadings();
        updateActive();
      }, 100);

    return () => {
      window.clearTimeout(initialTimer);

      resizeObserver.disconnect();

      window.removeEventListener(
        'resize',
        scheduleMeasure
      );

      window.removeEventListener(
        'scroll',
        handleScroll
      );

      if (
        scrollRafRef.current !== null
      ) {
        cancelAnimationFrame(
          scrollRafRef.current
        );
      }

      if (
        measureRafRef.current !== null
      ) {
        cancelAnimationFrame(
          measureRafRef.current
        );
      }
    };
  }, [toc]);

  const scrollToHeading = (
    event: ReactMouseEvent,
    id: string
  ) => {
    event.preventDefault();

    const target =
      document.getElementById(id);

    if (!target) return;

    const targetY =
      target.getBoundingClientRect().top +
      window.scrollY -
      100;

    window.scrollTo({
      top: targetY,
      behavior: 'smooth',
    });

    activeIdRef.current = id;
    setActiveId(id);
  };

  if (!toc || toc.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-3xl p-6 border border-white/40 dark:border-white/10 shadow-xl sticky top-28 transition-colors duration-700 max-h-[75vh] overflow-y-auto custom-scrollbar performance-paint-container">
      <h3 className="font-black text-slate-900 dark:text-white mb-4 border-l-4 border-indigo-500 pl-2 text-sm uppercase tracking-widest">
        Table of Contents
      </h3>

      <nav className="flex flex-col gap-2 relative">
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-slate-200 dark:bg-slate-700/50 rounded-full" />

        {toc.map((item, index) => {
          const displayText =
            getDisplayText(item.text);

          const safeId = getSafeId(
            item.text
          );

          const isActive =
            activeId === safeId;

          return (
            <button
              key={index}
              onClick={(event) =>
                scrollToHeading(
                  event,
                  safeId
                )
              }
              className={`text-left text-sm transition-transform duration-200 line-clamp-2 cursor-pointer relative pl-4
                ${
                  item.level === 1
                    ? 'font-bold mt-2'
                    : ''
                }
                ${
                  item.level === 2
                    ? 'ml-2'
                    : ''
                }
                ${
                  item.level === 3
                    ? 'ml-4 text-xs'
                    : ''
                }
                ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105 origin-left'
                    : 'text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400'
                }
              `}
            >
              {isActive && (
                <span className="absolute left-[-5px] top-[50%] -translate-y-[50%] w-[6px] h-[6px] rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
              )}

              {displayText}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
