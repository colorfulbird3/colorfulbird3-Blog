"use client";

import { ReactNode } from 'react';

/**
 * 用浏览器原生 compositor 动画替代整页 Framer Motion。
 * 视觉仍然是“轻微上移 + 淡入”，但减少路由进入时的 JS 动画开销。
 */
export default function PageTransition({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="page-transition-120">
      {children}

      <style jsx>{`
        .page-transition-120 {
          animation: pageEnter120 220ms
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes pageEnter120 {
          from {
            opacity: 0;
            transform: translate3d(0, 8px, 0);
          }

          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>
    </div>
  );
}
