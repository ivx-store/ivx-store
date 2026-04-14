import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronLeft, CheckCircle2, ArrowLeft } from "lucide-react";
import { OrderModal } from "./OrderModal";
import { useDevicePerformance } from "../lib/useDevicePerformance";
import { PackageData, getPackages, formatDisplayPrice } from "../lib/firebase";

export function Packages() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageData | null>(null);
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const { isMobile, isLowEnd } = useDevicePerformance();

  useEffect(() => {
    getPackages().then((data) => {
      setPackages(data);
      if (data.length > 0) {
        // Set initial index to the popular one or the first
        const popularIdx = data.findIndex((p) => p.popular);
        setCurrentIndex(popularIdx >= 0 ? popularIdx : 0);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const next = () => setCurrentIndex((prev) => (prev + 1) % packages.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + packages.length) % packages.length);

  const handleOrderClick = (pkg: PackageData) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <section className="py-32 relative z-10 overflow-hidden bg-[#050505]" id="packages">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24" dir="rtl">
            <div className="h-8 w-48 bg-gray-800/50 rounded mx-auto mb-6 animate-pulse" />
            <div className="h-4 w-80 bg-gray-800/30 rounded mx-auto animate-pulse" />
          </div>
          <div className="flex items-center justify-center h-[500px]">
            <div className="w-[85%] md:w-[420px] bg-gray-900/40 border border-white/10 rounded-[2rem] p-8 animate-pulse">
              <div className="h-6 bg-gray-800/50 rounded w-1/2 mx-auto mb-4" />
              <div className="h-4 bg-gray-800/30 rounded w-1/3 mx-auto mb-4" />
              <div className="h-3 bg-gray-800/30 rounded w-3/4 mx-auto mb-6" />
              <div className="h-8 bg-gray-800/50 rounded w-1/3 mx-auto mb-8" />
              <div className="space-y-3 mb-8">
                {[1, 2, 3, 4].map((i) => <div key={i} className="h-4 bg-gray-800/30 rounded w-2/3" />)}
              </div>
              <div className="h-12 bg-gray-800/50 rounded-full" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (packages.length === 0) {
    return null; // Don't show section if no packages
  }

  return (
    <section className="py-32 relative z-10 overflow-hidden bg-[#050505] content-auto" id="packages">
      <div className="container mx-auto px-4">
        <div className="text-center mb-24" dir="rtl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-arabic font-black text-white mb-6 tracking-tight"
          >
            باقات <span className="text-gray-400">المتجر</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400 font-arabic max-w-2xl mx-auto font-medium leading-relaxed"
          >
            اختر الباقة التي تناسب احتياجاتك، واستمتع بأفضل الألعاب والاشتراكات.
          </motion.p>
        </div>

        <div className="relative w-full max-w-6xl mx-auto h-[650px] md:h-[650px] flex items-center justify-center" style={isLowEnd ? undefined : { perspective: 2000 }} dir="ltr">

          {/* Navigation Buttons - Desktop */}
          <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-4 z-50">
            <button onClick={(e) => { e.stopPropagation(); prev(); }} className="w-12 h-12 rounded-full bg-[#111] border border-[#333] flex items-center justify-center text-white hover:border-white hover:bg-white hover:text-black transition-all">
              <ChevronLeft size={24} />
            </button>
          </div>
          <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-4 z-50">
            <button onClick={(e) => { e.stopPropagation(); next(); }} className="w-12 h-12 rounded-full bg-[#111] border border-[#333] flex items-center justify-center text-white hover:border-white hover:bg-white hover:text-black transition-all">
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Navigation Buttons - Mobile */}
          <div className="md:hidden absolute bottom-[-20px] left-1/2 -translate-x-1/2 z-[60] flex items-center gap-6">
            <button onClick={(e) => { e.stopPropagation(); prev(); }} className="w-12 h-12 rounded-full bg-[#111] border border-[#333] flex items-center justify-center text-white hover:border-white hover:bg-white hover:text-black active:scale-95 transition-all shadow-lg">
              <ChevronLeft size={24} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); next(); }} className="w-12 h-12 rounded-full bg-[#111] border border-[#333] flex items-center justify-center text-white hover:border-white hover:bg-white hover:text-black active:scale-95 transition-all shadow-lg">
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="relative w-full h-full flex items-center justify-center">
            <AnimatePresence mode="popLayout">
              {packages.map((pkg, index) => {
                const diff = (index - currentIndex + packages.length) % packages.length;
                const bgColor = pkg.bgColor || "#000";
                const accentColor = pkg.accentColor || "#ffffff";
                const displayPrice = formatDisplayPrice(pkg.price, pkg.currency);

                let x = 0;
                let scale = 1;
                let zIndex = 0;
                let opacity = 1;
                let blur = 0;
                let rotateY = 0;
                let z = 0;

                if (diff === 0) {
                  x = 0; scale = 1; zIndex = 40; opacity = 1; blur = 0; rotateY = 0; z = 100;
                } else if (diff === 1) {
                  x = isMobile ? 80 : 320;
                  scale = isMobile ? 0.9 : 0.85; zIndex = 30; opacity = 0.5; blur = 3;
                  rotateY = isLowEnd ? 0 : -25; z = 0;
                } else if (diff === packages.length - 1) {
                  x = isMobile ? -80 : -320;
                  scale = isMobile ? 0.9 : 0.85; zIndex = 30; opacity = 0.5; blur = 3;
                  rotateY = isLowEnd ? 0 : 25; z = 0;
                } else {
                  x = 0; scale = 0.5; zIndex = 10; opacity = 0; blur = 10; rotateY = 0; z = -100;
                }

                const isCenter = diff === 0;

                return (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity,
                      x,
                      z: isLowEnd ? 0 : z,
                      scale,
                      filter: isLowEnd ? 'none' : `blur(${blur}px)`,
                      rotateY: isLowEnd ? 0 : rotateY,
                      zIndex
                    }}
                    transition={{ duration: 0.5, type: "spring", bounce: 0.15 }}
                    onClick={() => {
                      if (!isCenter) setCurrentIndex(index);
                    }}
                    className={`absolute w-[85%] md:w-[420px] rounded-[2rem] p-6 md:p-10 border transform-gpu ${isCenter ? 'shadow-[0_0_50px_rgba(255,255,255,0.08)] cursor-default' : 'cursor-pointer hover:border-white/20 transition-colors duration-300'}`}
                    style={{
                      backfaceVisibility: "hidden",
                      background: bgColor,
                      borderColor: isCenter ? `${accentColor}30` : 'rgba(255,255,255,0.05)',
                      boxShadow: isCenter ? `0 0 50px ${accentColor}10` : undefined,
                    }}
                    dir="rtl"
                  >
                    {pkg.popular && (
                      <div
                        className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 md:px-6 py-1 md:py-1.5 rounded-md text-xs md:text-sm font-bold tracking-wide font-arabic transition-colors duration-500"
                        style={{
                          background: isCenter ? accentColor : '#333',
                          color: isCenter ? (bgColor === "#000000" ? "#000" : bgColor) : '#888',
                        }}
                      >
                        الأكثر طلباً
                      </div>
                    )}

                    <div className="text-center mb-6 md:mb-8 mt-4">
                      <h3
                        className="text-2xl md:text-3xl font-black mb-2 font-arabic transition-colors duration-500"
                        style={{ color: isCenter ? (accentColor === "#ffffff" ? "#fff" : accentColor) : '#888' }}
                      >
                        {pkg.title}
                      </h3>
                      <p className={`text-sm md:text-xl font-bold tracking-widest uppercase mb-3 md:mb-4 transition-colors duration-500 ${isCenter ? 'text-gray-300' : 'text-gray-600'}`}>
                        {pkg.subtitle}
                      </p>
                      <p className={`text-xs md:text-sm font-arabic transition-colors duration-500 ${isCenter ? 'text-gray-400' : 'text-gray-600'} line-clamp-3 md:line-clamp-none`}>
                        {pkg.description}
                      </p>
                      {displayPrice && (
                        <div className="mt-4 md:mt-6 flex items-baseline justify-center gap-1">
                          <span className={`text-3xl md:text-4xl font-black transition-colors duration-500 ${isCenter ? 'text-white' : 'text-gray-500'}`}>{displayPrice}</span>
                        </div>
                      )}
                    </div>

                    <div className="w-full h-px mb-6 md:mb-8" style={{ background: `linear-gradient(to right, transparent, ${accentColor}15, transparent)` }} />

                    <div className="space-y-3 md:space-y-4 mb-8 md:mb-10">
                      {pkg.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 md:gap-4">
                          <div
                            className="w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500"
                            style={{ background: isCenter ? accentColor : '#333' }}
                          >
                            <CheckCircle2
                              className="w-3 h-3 md:w-4 md:h-4"
                              style={{ color: isCenter ? (bgColor === "#000000" ? "#000" : bgColor) : '#666' }}
                            />
                          </div>
                          <span className={`text-sm md:text-base font-medium font-arabic transition-colors duration-500 ${isCenter ? 'text-gray-300' : 'text-gray-600'}`}>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isCenter) handleOrderClick(pkg);
                      }}
                      disabled={!isCenter}
                      className="w-full py-3 md:py-4 rounded-full font-bold text-base md:text-lg font-arabic transition-all duration-500"
                      style={{
                        background: isCenter ? 'transparent' : 'transparent',
                        color: isCenter ? accentColor : '#555',
                        border: `1px solid ${isCenter ? `${accentColor}50` : 'rgba(255,255,255,0.1)'}`,
                        boxShadow: isCenter ? `0 0 20px ${accentColor}15` : undefined,
                        pointerEvents: isCenter ? 'auto' : 'none',
                      }}
                    >
                      أطلب الباقة
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* View All Packages Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-8 md:mt-12"
        >
          <Link
            to="/packages"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-arabic font-bold text-base md:text-lg hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 group"
            dir="rtl"
          >
            <span>عرض جميع الباقات</span>
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
      <OrderModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedPackage(null); }}
        selectedItem={selectedPackage?.title || ""}
        formFields={selectedPackage?.orderFormFields}
        itemType="package"
      />
    </section>
  );
}
