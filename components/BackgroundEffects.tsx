"use client";

import { useTheme } from './ThemeProvider';
import StableEffectsCanvas from './effects/StableEffectsCanvas';

/**
 * 稳帧版：
 * - 页面滚动不被装饰动画抢帧预算。
 * - 粒子和草维持 30FPS（慢速装饰足够顺滑）。
 * - 粒子全屏 Canvas、草地底部小 Canvas 分开，避免每帧为了草重绘整屏。
 */
export default function BackgroundEffects() {
  const { isDark } = useTheme();
  return <StableEffectsCanvas isDark={isDark} />;
}
