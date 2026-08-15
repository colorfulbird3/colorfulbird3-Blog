"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../siteConfig';

export default function SplashScreen() {
  // The server must render the splash on the first paint. Starting with
  // `false` makes the home page flash before this effect can run.
  const [show, setShow] = useState(true);

  function exitSplash() {
    setShow(false);
    try {
      sessionStorage.setItem('hasSeenSplash', 'true');
    } catch {
      // 存储不可用时不影响启动动画关闭。
    }
  }

  useEffect(() => {
    let hasSeenSplash = false;
    try {
      hasSeenSplash = sessionStorage.getItem('hasSeenSplash') === 'true';
    } catch {
      // 隐私模式或禁用存储时仍允许页面正常进入。
    }

    if (hasSeenSplash) {
      const timer = window.setTimeout(() => setShow(false), 0);
      return () => window.clearTimeout(timer);
    }

    // 停留时长略长于进度条动画（3.8s），让进度条完整走完再淡出
    const timer = setTimeout(() => {
      exitSplash();
    }, 4200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash-screen-container"
          exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="initial-splash fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-white dark:bg-slate-950"
        >
          <div className="relative z-10 flex flex-col items-center">
            {/* 头像光环 */}
            <div className="relative w-24 h-24 mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-60 blur-[3px]"
              />
              <div className="relative w-full h-full rounded-full p-1.5 bg-white dark:bg-slate-900 shadow-xl">
                <img src={siteConfig.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              </div>
            </div>

            <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-[0.2em] uppercase">
              {siteConfig.authorName}
            </h1>
            <p className="text-[10px] font-black text-slate-400 tracking-[0.5em] mb-12">INITIALIZING SYSTEM</p>

            <div className="w-56 h-[3px] bg-slate-200 dark:bg-slate-800 relative overflow-hidden rounded-full">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: ["0%", "22%", "48%", "72%", "90%", "100%"] }}
                transition={{
                  duration: 3.8,
                  times: [0, 0.18, 0.4, 0.62, 0.82, 1],
                  ease: "easeInOut",
                }}
                className="absolute top-0 left-0 h-full rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
