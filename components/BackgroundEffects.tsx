"use client";

import { useTheme } from './ThemeProvider';
import BackgroundParticleCanvas from './effects/BackgroundParticleCanvas';

/**
 * 全链路 120FPS 版：
 * - 原视觉密度不缩水：50 萤火虫 / 40 樱花 / 150 草叶。
 * - 一个 Canvas + 一个统一 RAF。
 * - 草叶、花瓣都使用预旋转纹理 atlas，避免每帧大量 save/rotate/restore。
 * - 滑动/导航期间 Canvas 自适应 60FPS，页面本身争取保持 120FPS。
 * - 停止操作后自动恢复显示器原生刷新率。
 */
export default function BackgroundEffects() {
  const { isDark } = useTheme();

  return (
    <BackgroundParticleCanvas isDark={isDark} />
  );
}
