"use client";

/**
 * 稳定版不再监听全站 pointerover/focus/touchstart 做主动预取。
 * Next.js <Link> 在生产环境本身会处理预取。
 * 避免鼠标扫过导航时同时触发代码下载/解析，造成短时主线程尖峰。
 */
export default function RoutePrefetcher() {
  return null;
}
