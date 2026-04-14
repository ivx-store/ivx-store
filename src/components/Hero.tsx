import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Sparkles, Gamepad2 } from "lucide-react";
import { AnimatedIvxLogo } from "./AnimatedIvxLogo";
import { useDevicePerformance } from "../lib/useDevicePerformance";

export function Hero() {
  const words = ["اشتراكات", "ألعاب", "حسابات", "خدمات", "عروض"];
  const [index, setIndex] = useState(0);
  const { isLowEnd } = useDevicePerformance();
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[100svh] flex items-center pt-28 md:pt-24 pb-16 md:pb-0 overflow-hidden bg-[#020408] text-white">
      {/* Background Grid — simplified on mobile */}
      {isLowEnd ? (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-40" />
      ) : (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_40%,transparent_100%)] opacity-80" />
      )}
      
      {/* Animated Glow behind the logo — simplified on mobile */}
      {!isLowEnd && (
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[30rem] h-[30rem] bg-white/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      )}

      <div className="container mx-auto px-5 md:px-8 relative z-10 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        {/* Right: Text Content (RTL) */}
        <div className="flex flex-col items-start text-right space-y-8 order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 shadow-sm rounded-full text-white font-bold text-sm"
          >
            <Gamepad2 className="w-4 h-4 text-white" />
            متجر الألعاب الأول في العراق
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-[3.5rem] font-arabic font-black leading-[1.6] text-white tracking-tight"
          >
            حــلـم كـل كيـمـر <br className="md:hidden" />
            <span className="whitespace-nowrap">
              نـوفر لـك{" "}
              <span className="inline-grid grid-cols-1 grid-rows-1 align-baseline">
                <AnimatePresence>
                  <motion.span
                    key={index}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -30, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="col-start-1 row-start-1 text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-white transform-gpu will-change-transform"
                  >
                    {words[index]}
                  </motion.span>
                </AnimatePresence>
                {/* Invisible placeholder to keep width stable based on longest word */}
                <span className="col-start-1 row-start-1 opacity-0 pointer-events-none">اشتراكات</span>
              </span>
            </span>
            <br />
            بـأسعـار خيـاليـة.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-xl text-gray-400 font-arabic leading-[1.9] font-medium text-right w-full"
          >
            متجر ivx هو وجهتك الأولى لكل ما يخص الألعاب. نتعامل بالجملة والمفرد لنقدم لك أفضل الاشتراكات، الألعاب، والحسابات بأقوى الأسعار.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-start gap-4 pt-6 w-full"
          >
            <motion.button 
              onClick={() => navigate('/packages')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto relative overflow-hidden group px-8 py-3 md:py-4 bg-white text-black font-bold rounded-2xl transition-all font-arabic text-base md:text-lg shadow-[0_10px_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3"
            >
              <span className="relative z-10">تصفح العروض</span>
              <ArrowLeft className="w-5 h-5 relative z-10 group-hover:-translate-x-1 transition-transform" />
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-black/10 to-transparent z-0" />
            </motion.button>

            <motion.button 
              onClick={() => navigate('/contact')}
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-8 py-3 md:py-4 bg-white/5 backdrop-blur-md border border-white/20 shadow-sm text-white font-bold rounded-2xl transition-all font-arabic text-base md:text-lg flex items-center justify-center gap-3 group hover:shadow-md"
            >
              <span>تواصل معنا</span>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <MessageCircle className="w-4 h-4 text-black mr-0.5" />
              </div>
            </motion.button>
          </motion.div>
        </div>

        {/* Left: Logo */}
        <div className="relative w-full flex items-center justify-center order-1 lg:order-2">
          <AnimatedIvxLogo className="w-64 h-64 md:w-96 md:h-96" speedMultiplier={0.75} />
        </div>
      </div>
    </section>
  );
}
