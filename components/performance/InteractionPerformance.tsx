"use client";

/**
 * 只保留“离屏正文延迟绘制”。
 * 不再全局覆盖 backdrop-filter，也不在滚动时切换 html class。
 */
export default function InteractionPerformance() {
  return (
    <style jsx global>{`
      #article-content > p,
      #article-content > pre,
      #article-content > blockquote,
      #article-content > ul,
      #article-content > ol,
      #article-content > table,
      #article-content > figure,
      #article-content > img {
        content-visibility: auto;
        contain-intrinsic-size: auto 96px;
      }

      .performance-paint-container {
        contain: paint;
      }
    `}</style>
  );
}
