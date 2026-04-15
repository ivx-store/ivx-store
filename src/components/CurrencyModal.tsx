import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";
import { X, Search, Check, RefreshCw } from "lucide-react";
import { useCurrency, SUPPORTED_CURRENCIES, type DisplayCurrency } from "../lib/CurrencyContext";
import { useDevicePerformance } from "../lib/useDevicePerformance";
import { useBodyLock } from "../lib/useBodyLock";

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CurrencyModal({ isOpen, onClose }: CurrencyModalProps) {
  const { isLowEnd } = useDevicePerformance();
  const { displayCurrency, setDisplayCurrency, ratesLoading, lastUpdated } = useCurrency();
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useBodyLock(isOpen);

  // Auto-focus search when opened inside setTimeout to allow render
  useEffect(() => {
    if (isOpen && !isLowEnd) {
      setTimeout(() => {
        searchRef.current?.focus();
      }, 100);
    }
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen, isLowEnd]);

  const filtered = SUPPORTED_CURRENCIES.filter(c =>
    c.nameAr.includes(search) ||
    c.nameEn.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (code: DisplayCurrency) => {
    setDisplayCurrency(code);
    onClose();
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
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-[#0d0d0d] border border-white/10 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
          >
            {/* Grabber indicator for mobile */}
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-4 mb-2 sm:hidden" />

            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-lg font-black text-white font-arabic">اختر العملة</h3>
                  {ratesLoading ? (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <RefreshCw size={10} className="animate-spin" />
                      <span>جاري تحديث الأسعار...</span>
                    </div>
                  ) : lastUpdated ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-500 mt-0.5 font-bold">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>تحديث مباشر</span>
                    </div>
                  ) : null}
                </div>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-white/5 shrink-0 bg-white/[0.02]">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث عن عملة..."
                  className="w-full bg-black border border-white/10 rounded-xl py-3 pr-11 pl-4 text-white font-arabic text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                />
              </div>
            </div>

            {/* Content Display */}
            <div className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-gray-500 font-arabic text-sm font-bold">لا توجد نتائج مطابقة لبحثك</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 pb-6">
                  {filtered.map((curr) => {
                    const isActive = curr.code === displayCurrency;
                    return (
                      <button
                        key={curr.code}
                        onClick={() => handleSelect(curr.code)}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 font-arabic text-right ${
                          isActive 
                            ? "bg-emerald-500/10 border-emerald-500/30" 
                            : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-3xl filter drop-shadow-sm leading-none">{curr.flag}</span>
                          <div className="flex flex-col">
                            <span className={`text-base font-bold ${isActive ? 'text-emerald-400' : 'text-white'}`}>
                              {curr.nameAr}
                            </span>
                            <span className="text-xs text-gray-500 font-bold" dir="ltr">
                              {curr.code} • {curr.symbol}
                            </span>
                          </div>
                        </div>
                        {isActive && (
                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Check size={14} className="text-emerald-400" />
                          </div>
                        )}
                      </button>
                    );
                  })}
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
