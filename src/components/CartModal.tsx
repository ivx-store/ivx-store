import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";
import { X, ShoppingBag, Clock, CheckCircle2, XCircle, RefreshCw, Package, Loader2, User } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { getUserOrders, OrderData, formatTimestamp, formatPriceWithCommas, getCurrencySymbol } from "../lib/firebase";
import { useDevicePerformance } from "../lib/useDevicePerformance";
import { useBodyLock } from "../lib/useBodyLock";
import { STATUS_CONFIG, ITEM_TYPE_LABELS } from "../lib/constants";



interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartModal({ isOpen, onClose }: CartModalProps) {
  const { user } = useAuth();
  const { isLowEnd } = useDevicePerformance();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | OrderData["status"]>("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setLoading(true);
        getUserOrders(user.uid).then((data) => {
          setOrders(data);
          setLoading(false);
        }).catch(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }
  }, [isOpen, user]);

  useBodyLock(isOpen);

  const formatDate = formatTimestamp;

  const filteredOrders = filter === "all" ? orders : orders.filter(o => o.status === filter);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center" dir="rtl">
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
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <ShoppingBag size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-arabic">طلباتي</h3>
                  <p className="text-xs text-gray-500 font-arabic">{orders.length} طلب</p>
                </div>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <X size={18} />
              </button>
            </div>



            {/* Orders List */}
            <div className="flex-1 overflow-y-auto px-6 py-4" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white/[0.03] rounded-xl p-4 border border-white/5 animate-pulse">
                      <div className="h-4 bg-white/5 rounded w-3/4 mb-3" />
                      <div className="h-3 bg-white/5 rounded w-1/2 mb-2" />
                      <div className="h-3 bg-white/5 rounded w-1/3" />
                    </div>
                  ))}
                </div>
              ) : !user ? (
                <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                    <User size={28} className="text-gray-500" />
                  </div>
                  <h4 className="text-white font-arabic text-base sm:text-lg font-bold mb-2">عذراً، يجب تسجيل الدخول</h4>
                  <p className="text-gray-500 font-arabic text-xs sm:text-sm px-4 leading-relaxed max-w-sm">
                    يجب عليك تسجيل الدخول بحسابك أولاً لتتمكن من إضافة خدمات أو متابعة طلباتك السابقة.
                  </p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                    <ShoppingBag size={28} className="text-gray-600" />
                  </div>
                  <p className="text-gray-500 font-arabic text-sm font-bold">
                    {filter === "all" ? "لا توجد طلبات بعد" : `لا توجد طلبات "${STATUS_CONFIG[filter as OrderData["status"]]?.label || ""}"`}
                  </p>
                  <p className="text-gray-600 font-arabic text-xs mt-1">ستظهر طلباتك هنا بعد إجراء أول طلب</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => {
                    const status = STATUS_CONFIG[order.status];
                    return (
                      <div key={order.id} className="bg-white/[0.03] rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all" style={{ borderRightColor: status.color, borderRightWidth: "3px" }}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Package size={14} className="text-gray-500 shrink-0" />
                            <span className="text-sm font-bold text-white font-arabic truncate">{order.itemTitle}</span>
                            {order.totalPrice !== undefined && order.totalPrice > 0 && (
                              <span className="text-[10px] font-black text-green-400 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20 whitespace-nowrap shrink-0" dir="ltr">
                                {formatPriceWithCommas(String(order.totalPrice))} {getCurrencySymbol(order.priceCurrency || "USD")}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold shrink-0 ml-2" style={{ background: status.bg, color: status.color }}>
                            {status.icon}
                            {status.label}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 font-arabic">
                          <span className="px-2 py-0.5 rounded bg-white/5 text-gray-400 font-bold">{ITEM_TYPE_LABELS[order.itemType] || order.itemType}</span>
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </div>
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
