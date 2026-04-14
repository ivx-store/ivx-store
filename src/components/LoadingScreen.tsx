import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { AnimatedIvxLogo } from "./AnimatedIvxLogo";

export function LoadingScreen({ onComplete }: { onComplete: () => void; key?: string }) {
  const [isReady, setIsReady] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    // Preload tasks: wait for all fonts/assets to load
    const preloadTasks = [
      document.fonts.ready, // Wait for all custom fonts to be fully loaded and parsed
      new Promise(resolve => {
        if (document.readyState === "complete") {
          resolve(true);
        } else {
          window.addEventListener("load", () => resolve(true), { once: true });
        }
      })
    ];

    Promise.all(preloadTasks).then(() => {
      setIsReady(true);
    });
  }, []);

  useEffect(() => {
    if (isReady && animationComplete) {
      onComplete();
    }
  }, [isReady, animationComplete, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-[#020408] flex flex-col items-center justify-center transform-gpu"
      dir="rtl"
    >
      <div className="mb-16">
        <AnimatedIvxLogo 
          className="w-64 h-64 md:w-80 md:h-80" 
          fastMode={true}
          onComplete={() => setAnimationComplete(true)} 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="flex flex-col items-center gap-4 mt-8"
      >
        <div className="text-sm font-bold text-gray-400 font-arabic tracking-wider animate-pulse">
          جاري تجهيز المتجر...
        </div>
      </motion.div>
    </motion.div>
  );
}
