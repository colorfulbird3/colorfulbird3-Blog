"use client";

/**
 * 不做全站 hover/touch 主动预取。
 * 交给 Next.js Link 自身的生产环境预取，避免鼠标扫过导航时产生解析尖峰。
 */
export default function RoutePrefetcher() {
  return null;
}
