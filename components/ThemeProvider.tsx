"use client";
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ isDark: true, toggleTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // 默认设为 true，这样在读取到配置前，如果是夜间模式就不会闪烁
  const [isDark, setIsDark] = useState(true);
  // 首屏不再等待主题读取完成，避免存储异常时隐藏整页内容。

  useEffect(() => {
    // 标记组件已挂载，避免 hydration 报错
    // 从 localStorage 读取真实状态
    let savedTheme: string | null = null;
    try {
      savedTheme = localStorage.getItem('blog-theme');
    } catch {
      // 存储不可用时使用默认深色主题。
    }
    // 如果没有记录，默认给深色模式（流萤飞舞）
    const isDarkMode = savedTheme !== 'light';
    setIsDark(isDarkMode);

    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  // 极其重要：监听 isDark 状态，只要它变了，立刻强制更新 html 标签，防止路由切换丢失
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    try {
      localStorage.setItem('blog-theme', newDark ? 'dark' : 'light');
    } catch {
      // 主题仍然在当前页面生效。
    }
  };

  // 在客户端挂载完成前，为了防止闪屏，先隐藏内容
  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
