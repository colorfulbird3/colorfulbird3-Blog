"use client";

/**
 * 稳定版：
 * 不再在 scroll/wheel/touchmove 时给 <html> 反复增删 class。
 * 那种方案会导致整页样式重新匹配，遇到大量 backdrop-filter 时反而可能出现大掉帧。
 *
 * 这里改成固定的低成本玻璃参数：
 * 毛玻璃仍然存在，但把 xl / 3xl 等大半径统一约束到 6px。
 * 视觉仍是玻璃质感，GPU 成本更稳定。
 */
export default function InteractionPerformance() {
  return (
    <style jsx global>{`
      [class*='backdrop-blur'] {
        -webkit-backdrop-filter: blur(6px) saturate(112%) !important;
        backdrop-filter: blur(6px) saturate(112%) !important;
      }

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
        contain: paint style;
      }
    `}</style>
  );
}
