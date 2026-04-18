import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";
import { X, ShoppingCart, Heart } from "lucide-react";
import { ServiceData } from "../lib/firebase";
import { useCurrency } from "../lib/CurrencyContext";
import { useDevicePerformance } from "../lib/useDevicePerformance";
import { useBodyLock } from "../lib/useBodyLock";

interface ServiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceData | null;
  onOrder: () => void;
  isFavorite: boolean;
  toggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export function ServiceDetailsModal({
  isOpen,
  onClose,
  service,
  onOrder,
  isFavorite,
  toggleFavorite
}: ServiceDetailsModalProps) {
  const { isLowEnd } = useDevicePerformance();
  const [mounted, setMounted] = useState(false);
  const { formatConvertedPrice } = useCurrency();

  useEffect(() => {
    setMounted(true);
  }, []);

  useBodyLock(isOpen);

  if (!mounted || !service) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center pointer-events-auto" dir="rtl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`absolute inset-0 bg-black/80 ${isLowEnd ? '' : 'backdrop-blur-md'}`}
          />
          
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[500px] bg-[#0a0a0a] border border-white/10 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header / Image Area */}
            <div className="relative h-48 md:h-64 shrink-0 bg-black overflow-hidden flex items-center justify-center">
              {service.imageUrl ? (
                <>
                   <img src={service.imageUrl} alt={service.title} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />
                </>
              ) : (
                <div className="text-6xl opacity-50">🎮</div>
              )}

              {/* Close Button & Favorite */}
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                <button
                  onClick={onClose}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white hover:scale-110 transition-all border border-white/10 ${isLowEnd ? 'bg-black/90 hover:bg-black' : 'bg-black/50 backdrop-blur-md hover:bg-black/80'}`}
                >
                  <X size={20} />
                </button>
                <button
                  onClick={(e) => toggleFavorite(service.id!, e)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border border-white/10 ${isFavorite ? 'bg-red-500/90 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : (isLowEnd ? 'bg-black/90 text-white/60 hover:text-red-400 hover:bg-black' : 'bg-black/50 backdrop-blur-md text-white/60 hover:text-red-400 hover:bg-black/70')}`}
                >
                  <Heart size={18} className={`${isFavorite ? 'fill-current animate-[heartPulse_0.3s_ease]' : ''}`} />
                </button>
              </div>

              {/* Tag overlaps the bottom left of the image */}
              <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
                {service.type && (
                  <span className="bg-white text-black text-xs font-black px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
                    {service.type}
                  </span>
                )}
                {service.platform && (
                  <span className="bg-blue-500/90 backdrop-blur-sm text-white text-xs font-black px-3 py-1.5 rounded-full border border-blue-400/30 shadow-lg">
                    {service.platform}
                  </span>
                )}
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 md:p-8 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-black text-white mb-2 font-arabic line-clamp-2 md:line-clamp-none">{service.title}</h2>
                {service.price && (
                  <div className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-xl mb-4">
                    <span className="text-lg md:text-xl font-black text-green-400" dir="ltr">
                      {formatConvertedPrice(parseFloat(service.price) || 0, service.currency)}
                    </span>
                  </div>
                )}
                
                <h3 className="text-sm font-bold text-gray-400 mb-2 font-arabic">الوصف والتفاصيل:</h3>
                <div className="text-gray-300 leading-relaxed font-arabic text-sm md:text-base whitespace-pre-wrap bg-white/[0.02] p-4 rounded-2xl border border-white/5 shadow-inner">
                  {service.description || "لا يوجد وصف إضافي لهذه الخدمة."}
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-5 border-t border-white/10 bg-[#0d0d0d] shrink-0">
              <button
                onClick={onOrder}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-white text-black hover:bg-gray-200 transition-all font-bold text-base md:text-lg font-arabic shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                <ShoppingCart size={20} />
                <span>اطلب الآن</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
