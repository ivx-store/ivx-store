import { motion } from "motion/react";
import React, { ReactNode, useRef, useState, useEffect } from "react";
import { Gamepad2, ShoppingCart, Users, Trophy, Play, Music, Tv, Coins } from "lucide-react";

/** Hook: toggles a CSS class when the card is off-screen to pause CSS animations */
function useIsVisible(ref: React.RefObject<HTMLElement | null>) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: '200px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
  return isVisible;
}

/* ======= PURE CSS CARD ANIMATIONS ======= */

function Card1Animation() {
  return (
    <div className="svc-anim relative w-full h-full flex items-center justify-center" style={{ perspective: '600px' }}>
      {/* Central energy nexus glow */}
      <div className="absolute w-32 h-32 bg-indigo-500/25 rounded-full blur-[35px] svc1-nexus" />
      
      {/* PS Plus styled card — orbits to front then back */}
      <div className="absolute svc1-card-a transform-gpu">
        <div className="w-32 h-20 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-900 border border-blue-400/50 shadow-[0_0_30px_rgba(96,165,250,0.5)] overflow-hidden flex flex-col justify-between p-2.5 relative">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center">
              <Gamepad2 size={11} className="text-blue-200" />
            </div>
            <span className="text-[8px] font-bold text-blue-200 tracking-wider uppercase">PS Plus</span>
          </div>
          <div className="flex gap-1 mt-auto">
            <div className="h-1 w-full rounded-full bg-blue-400/40 svc1-bar" />
            <div className="h-1 w-3/4 rounded-full bg-blue-400/25" />
          </div>
          {/* Holographic sweep */}
          <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
            <div className="absolute top-0 bottom-0 w-14 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 svc1-holo-a" />
          </div>
        </div>
      </div>
      
      {/* Game Pass styled card — orbits opposite */}
      <div className="absolute svc1-card-b transform-gpu">
        <div className="w-32 h-20 rounded-xl bg-gradient-to-br from-green-600 via-emerald-700 to-green-900 border border-green-400/50 shadow-[0_0_30px_rgba(74,222,128,0.5)] overflow-hidden flex flex-col justify-between p-2.5 relative">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center">
              <Tv size={11} className="text-green-200" />
            </div>
            <span className="text-[8px] font-bold text-green-200 tracking-wider uppercase">Game Pass</span>
          </div>
          <div className="flex gap-1 mt-auto">
            <div className="h-1 w-full rounded-full bg-green-400/40 svc1-bar" />
            <div className="h-1 w-2/3 rounded-full bg-green-400/25" />
          </div>
          {/* Holographic sweep */}
          <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
            <div className="absolute top-0 bottom-0 w-14 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 svc1-holo-b" />
          </div>
        </div>
      </div>
      
      {/* Activation checkmark — flashes when cards swap */}
      <div className="absolute z-40 svc1-check transform-gpu">
        <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.9)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
      </div>

      {/* Activation ring bursts */}
      <div className="absolute w-20 h-20 border-2 border-white/40 rounded-full svc1-ring-1 transform-gpu" />
      <div className="absolute w-20 h-20 border border-indigo-400/30 rounded-full svc1-ring-2 transform-gpu" />
    </div>
  );
}

function Card2Animation() {
  return (
    <div className="svc-anim relative w-full h-full flex items-center justify-center" style={{ perspective: '600px' }}>
      {/* Ambient glow */}
      <div className="absolute w-40 h-40 bg-rose-600/20 rounded-full blur-[40px] svc2-glow" />
      
      {/* Game Card A — Blue/Purple (front start) */}
      <div className="absolute svc2-card-a transform-gpu">
        <div className="w-[72px] h-[96px] rounded-lg bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-900 border border-indigo-400/40 shadow-[0_0_25px_rgba(129,140,248,0.4)] overflow-hidden flex flex-col items-center justify-between p-2 relative">
          <div className="w-full flex justify-end">
            <div className="svc2-badge-a w-6 h-3 bg-rose-500 rounded-sm flex items-center justify-center">
              <span className="text-[5px] font-black text-white tracking-wider">NEW</span>
            </div>
          </div>
          <Gamepad2 size={22} className="text-indigo-200/80" />
          <div className="w-full space-y-1">
            <div className="h-0.5 w-full rounded-full bg-white/15" />
            <div className="h-0.5 w-3/4 rounded-full bg-white/10" />
          </div>
          {/* Download progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-r-full svc2-progress-a" />
          </div>
        </div>
      </div>
      
      {/* Game Card B — Green (right/back start) */}
      <div className="absolute svc2-card-b transform-gpu">
        <div className="w-[72px] h-[96px] rounded-lg bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 border border-emerald-400/40 shadow-[0_0_25px_rgba(52,211,153,0.3)] overflow-hidden flex flex-col items-center justify-between p-2 relative">
          <div className="w-full flex justify-end">
            <div className="svc2-badge-b w-6 h-3 bg-rose-500 rounded-sm flex items-center justify-center">
              <span className="text-[5px] font-black text-white tracking-wider">NEW</span>
            </div>
          </div>
          <Trophy size={22} className="text-emerald-200/80" />
          <div className="w-full space-y-1">
            <div className="h-0.5 w-full rounded-full bg-white/15" />
            <div className="h-0.5 w-2/3 rounded-full bg-white/10" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-r-full svc2-progress-b" />
          </div>
        </div>
      </div>
      
      {/* Game Card C — Red/Orange (left/back start) */}
      <div className="absolute svc2-card-c transform-gpu">
        <div className="w-[72px] h-[96px] rounded-lg bg-gradient-to-br from-rose-600 via-red-700 to-rose-900 border border-rose-400/40 shadow-[0_0_25px_rgba(244,63,94,0.3)] overflow-hidden flex flex-col items-center justify-between p-2 relative">
          <div className="w-full flex justify-end">
            <div className="svc2-badge-c w-6 h-3 bg-amber-500 rounded-sm flex items-center justify-center">
              <span className="text-[5px] font-black text-white tracking-wider">HOT</span>
            </div>
          </div>
          <Play size={22} className="text-rose-200/80" />
          <div className="w-full space-y-1">
            <div className="h-0.5 w-full rounded-full bg-white/15" />
            <div className="h-0.5 w-4/5 rounded-full bg-white/10" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div className="h-full bg-gradient-to-r from-rose-400 to-orange-400 rounded-r-full svc2-progress-c" />
          </div>
        </div>
      </div>

      {/* Achievement stars burst */}
      <div className="absolute z-40 svc2-star-1 transform-gpu">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      </div>
      <div className="absolute z-40 svc2-star-2 transform-gpu">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="#fbbf24" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      </div>
      <div className="absolute z-40 svc2-star-3 transform-gpu">
        <svg width="8" height="8" viewBox="0 0 24 24" fill="#fbbf24" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      </div>
    </div>
  );
}

function Card3Animation() {
  return (
    <div className="svc-anim relative w-full h-full flex items-center justify-center" style={{ perspective: '600px' }}>
      {/* Ambient glow */}
      <div className="absolute w-40 h-40 bg-emerald-500/20 rounded-full blur-[40px] svc3-glow" />
      
      {/* Main gift card — slides in and gets activated */}
      <div className="absolute z-20 svc3-card transform-gpu">
        <div className="w-36 h-[88px] rounded-xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 border border-emerald-400/40 shadow-[0_0_35px_rgba(52,211,153,0.4)] overflow-hidden flex flex-col justify-between p-3 relative">
          {/* Card chip */}
          <div className="flex items-center justify-between">
            <div className="w-7 h-5 rounded bg-gradient-to-br from-amber-300 to-amber-500 border border-amber-200/50 shadow-sm" />
            <span className="text-[9px] font-bold text-emerald-200/80 tracking-widest uppercase">GIFT CARD</span>
          </div>
          {/* Card balance display */}
          <div className="flex items-end justify-between mt-auto">
            <div className="flex items-baseline gap-0.5">
              <span className="text-[10px] text-emerald-300/60 font-bold">$</span>
              <span className="text-lg font-black text-white svc3-amount">50</span>
            </div>
            <div className="flex gap-0.5">
              <div className="w-4 h-4 rounded-full bg-white/15" />
              <div className="w-4 h-4 rounded-full bg-white/10 -ml-2" />
            </div>
          </div>
          {/* NFC scan line */}
          <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
            <div className="absolute top-0 bottom-0 w-16 bg-gradient-to-r from-transparent via-white/30 to-transparent svc3-scan" />
          </div>
          {/* Activation flash overlay */}
          <div className="absolute inset-0 rounded-xl bg-white/0 svc3-flash pointer-events-none" />
        </div>
      </div>

      {/* Flying coins — burst out after activation */}
      <div className="absolute z-30 svc3-coin-1 transform-gpu">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-300/60 shadow-[0_0_12px_rgba(245,158,11,0.5)] flex items-center justify-center">
          <span className="text-[8px] font-black text-white">$</span>
        </div>
      </div>
      <div className="absolute z-30 svc3-coin-2 transform-gpu">
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-300/60 shadow-[0_0_10px_rgba(245,158,11,0.4)] flex items-center justify-center">
          <span className="text-[7px] font-black text-white">$</span>
        </div>
      </div>
      <div className="absolute z-30 svc3-coin-3 transform-gpu">
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border border-emerald-300/60 shadow-[0_0_10px_rgba(52,211,153,0.4)] flex items-center justify-center">
          <span className="text-[7px] font-black text-white">$</span>
        </div>
      </div>
      <div className="absolute z-30 svc3-coin-4 transform-gpu">
        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-300/50 shadow-[0_0_8px_rgba(245,158,11,0.3)]" />
      </div>
      <div className="absolute z-30 svc3-coin-5 transform-gpu">
        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border border-emerald-300/50 shadow-[0_0_8px_rgba(52,211,153,0.3)]" />
      </div>

      {/* Success checkmark — appears after charge */}
      <div className="absolute z-40 svc3-check transform-gpu">
        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.8)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
      </div>

      {/* Activation ring bursts */}
      <div className="absolute w-24 h-16 border-2 border-emerald-400/50 rounded-xl svc3-ring-1 transform-gpu" />
      <div className="absolute w-24 h-16 border border-white/30 rounded-xl svc3-ring-2 transform-gpu" />
    </div>
  );
}

function Card4Animation() {
  return (
    <div className="svc-anim relative w-full h-full flex items-center justify-center">
      {/* Ambient glow */}
      <div className="absolute w-48 h-48 bg-amber-500/30 rounded-full blur-[40px] svc4-glow" />
      
      {/* Main cart */}
      <div className="relative z-20 w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-700 border-2 border-amber-300/50 rounded-2xl shadow-[0_0_40px_rgba(245,158,11,0.6)] flex items-center justify-center svc4-cart transform-gpu">
        <ShoppingCart size={40} className="text-white drop-shadow-[0_0_10px_#fff]" />
      </div>

      {/* Floating items that pop out */}
      <div className="absolute z-30 w-10 h-10 bg-black/90 border border-amber-400/60 rounded-lg shadow-lg flex items-center justify-center svc4-item-1 transform-gpu">
        <Coins size={16} className="text-amber-400" />
      </div>
      <div className="absolute z-30 w-10 h-10 bg-black/90 border border-amber-400/60 rounded-lg shadow-lg flex items-center justify-center svc4-item-2 transform-gpu">
        <Gamepad2 size={16} className="text-amber-400" />
      </div>
      <div className="absolute z-30 w-10 h-10 bg-black/90 border border-amber-400/60 rounded-lg shadow-lg flex items-center justify-center svc4-item-3 transform-gpu">
        <Music size={16} className="text-amber-400" />
      </div>
      <div className="absolute z-30 w-10 h-10 bg-black/90 border border-amber-400/60 rounded-lg shadow-lg flex items-center justify-center svc4-item-4 transform-gpu">
        <ShoppingCart size={16} className="text-amber-400" />
      </div>

      {/* Success ring burst */}
      <div className="absolute z-10 w-24 h-24 border-2 border-amber-400/50 rounded-2xl svc4-burst transform-gpu" />
    </div>
  );
}

/* ======= ANIMATED CARD WRAPPER ======= */

function AnimatedCard({ title, description, delay, children }: { title: string, description: string, delay: number, children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "200px" }}
      transition={{ duration: 0.8, delay, type: "spring", stiffness: 100, damping: 20 }}
      whileHover={{ y: -15, scale: 1.02 }}
      className="relative p-8 rounded-[2.5rem] bg-black/70 border border-white/10 shadow-[0_8px_30px_rgba(255,255,255,0.04)] hover:shadow-[0_40px_80px_rgba(255,255,255,0.12)] transition-shadow duration-500 group overflow-hidden flex flex-col items-center text-center h-full transform-gpu"
    >
      {/* Animated Gradient Background on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-gray-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      {/* Glowing orb behind the icon */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-tr from-white/10 to-gray-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="w-full h-56 mb-8 relative flex items-center justify-center bg-gradient-to-b from-gray-900/50 to-black/50 rounded-3xl border border-gray-800/80 overflow-hidden group-hover:border-white/20 transition-colors duration-500 shadow-inner shrink-0">
        {children}
      </div>

      <h3 className="text-2xl font-arabic font-black text-white mb-4 relative z-10 group-hover:text-gray-300 transition-colors duration-300">
        {title}
      </h3>
      <p className="text-gray-400 font-arabic text-base leading-[1.9] font-medium relative z-10 flex-grow">
        {description}
      </p>
    </motion.div>
  );
}

/* ======= MAIN SERVICES SECTION ======= */

export function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useIsVisible(sectionRef);

  return (
    <section 
      ref={sectionRef} 
      className={`py-24 relative z-10 bg-black content-auto ${isVisible ? '' : 'svc-paused'}`} 
      id="services"
    >
      <div className="container mx-auto px-8">
        <div className="text-center mb-20" dir="rtl">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "200px" }}
            className="text-4xl md:text-5xl font-arabic font-black text-white mb-6 tracking-tight"
          >
            ماذا نقدم لك في ivx
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "200px" }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400 font-arabic max-w-2xl mx-auto font-medium leading-relaxed"
          >
            نقدم لك أفضل الخدمات والمنتجات الرقمية بأسعار تنافسية وجودة عالية لضمان تجربة لعب لا مثيل لها.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" dir="rtl">
          <AnimatedCard 
            title="اشتراكات بلس وجيم باس" 
            description="نوفر لك أفضل الاشتراكات بأسعار خيالية لتستمتع بألعابك المفضلة بدون توقف."
            delay={0}
          >
            <Card1Animation />
          </AnimatedCard>

          <AnimatedCard 
            title="ألعاب رقمية وحسابات" 
            description="تشكيلة واسعة من الألعاب الحديثة والحسابات الجاهزة لجميع المنصات."
            delay={0.1}
          >
            <Card2Animation />
          </AnimatedCard>

          <AnimatedCard 
            title="خدمات شحن الأرصدة" 
            description="شحن سريع وآمن لجميع الألعاب والتطبيقات بأسعار تنافسية."
            delay={0.2}
          >
            <Card3Animation />
          </AnimatedCard>

          <AnimatedCard 
            title="بيع بالجملة والمفرد" 
            description="نوفر أسعار خاصة لأصحاب المتاجر والكميات الكبيرة لتلبية جميع الاحتياجات."
            delay={0.3}
          >
            <Card4Animation />
          </AnimatedCard>
        </div>
      </div>
    </section>
  );
}
