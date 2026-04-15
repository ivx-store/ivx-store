import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";
import { X, Heart, Package, LayoutGrid, ArrowLeft } from "lucide-react";
import { getServices, getPackages, ServiceData, PackageData, formatDisplayPrice } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import { useDevicePerformance } from "../lib/useDevicePerformance";

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FavItem = {
  id: string;
  title: string;
  type: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  isPackage: boolean;
};

export function FavoritesModal({ isOpen, onClose }: FavoritesModalProps) {
  const { isLowEnd } = useDevicePerformance();
  const [items, setItems] = useState<FavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      
      const favServicesIds = JSON.parse(localStorage.getItem("ivx_fav_services") || "[]") as string[];
      const favPackagesIds = JSON.parse(localStorage.getItem("ivx_fav_packages") || "[]") as string[];

      Promise.all([getServices(), getPackages()])
        .then(([allServices, allPackages]) => {
          const favItems: FavItem[] = [];

          allServices.forEach(s => {
            if (s.id && favServicesIds.includes(s.id)) {
              favItems.push({
                id: s.id,
                title: s.title,
                type: s.type || "خدمة عامة",
                imageUrl: s.imageUrl,
                price: s.price,
                currency: s.currency,
                isPackage: false
              });
            }
          });

          allPackages.forEach(p => {
            if (p.id && favPackagesIds.includes(p.id)) {
              favItems.push({
                id: p.id,
                title: p.title,
                type: "باقة مخصصة",
                price: p.price,
                currency: p.currency,
                isPackage: true
              });
            }
          });

          setItems(favItems);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error loading favorites:", err);
          setLoading(false);
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleNavigateToItem = (isPackage: boolean) => {
    onClose();
    if (isPackage) {
      navigate('/packages');
    } else {
      navigate('/services', { state: { activeTab: 'favorites' } });
    }
  };

  if (!mounted) return null;

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
            className="relative w-full max-w-lg bg-[#0d0d0d] border border-white/10 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <Heart size={20} className="text-red-500 fill-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-arabic">المفضلة</h3>
                  <p className="text-xs text-gray-500 font-arabic">{items.length} منتجات في قائمتك</p>
                </div>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <X size={18} />
              </button>
            </div>

            {/* Content Display */}
            <div className="flex-1 overflow-y-auto px-6 py-4" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="flex gap-4 bg-white/[0.03] rounded-xl p-4 border border-white/5 animate-pulse">
                      <div className="w-16 h-16 bg-white/5 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-white/5 rounded w-3/4" />
                        <div className="h-3 bg-white/5 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                    <Heart size={28} className="text-gray-600" />
                  </div>
                  <p className="text-gray-500 font-arabic text-sm font-bold">المفضلة فارغة</p>
                  <p className="text-gray-600 font-arabic text-xs mt-1">تصفح الخدمات وأضف لها علامة الإعجاب ❤️</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id + (item.isPackage ? 'p' : 's')} className="flex gap-3 bg-white/[0.03] rounded-xl p-3 border border-white/5 hover:border-white/10 transition-all group cursor-pointer" onClick={() => handleNavigateToItem(item.isPackage)}>
                      {/* Image / Icon Thumbnail */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-black flex space-center items-center justify-center shrink-0 border border-white/5">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        ) : (
                          item.isPackage ? <Package className="text-gray-700" size={24} /> : <LayoutGrid className="text-gray-700" size={24} />
                        )}
                      </div>
                      
                      {/* Meta */}
                      <div className="flex-1 flex flex-col justify-center">
                        <h4 className="text-sm font-bold text-white font-arabic line-clamp-1 mb-1">{item.title}</h4>
                        <span className="text-[10px] font-bold text-gray-500 bg-white/5 self-start px-2 py-0.5 rounded-full mb-1">
                          {item.type}
                        </span>
                        {item.price && (
                          <span className="text-xs font-black text-gray-300">
                            {formatDisplayPrice(item.price, item.currency)}
                          </span>
                        )}
                      </div>

                      {/* Go Button */}
                      <div className="flex items-center justify-center w-8 opacity-50 group-hover:opacity-100 transition-opacity">
                        <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                          <ArrowLeft size={12} className="text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
