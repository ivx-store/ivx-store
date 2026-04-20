import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";
import { X, ShoppingBag, Trash2, Plus, Minus, Loader2, User, CheckCircle2, ShoppingCart, Sparkles, AlertCircle } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { getCartItems, removeFromCart, updateCartItemQty, checkoutCart, CartItem, formatPriceWithCommas, getCurrencySymbol } from "../lib/firebase";
import { useDevicePerformance } from "../lib/useDevicePerformance";
import { useBodyLock } from "../lib/useBodyLock";
import { useCurrency } from "../lib/CurrencyContext";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartModal({ isOpen, onClose }: CartModalProps) {
  const { user } = useAuth();
  const { isLowEnd } = useDevicePerformance();
  const { formatConvertedPrice } = useCurrency();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadCart = async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await getCartItems(user.uid);
      setItems(data);
    } catch (err) {
      console.error("Error loading cart:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      setCheckoutSuccess(false);
      setCheckoutError(false);
      loadCart();
    }
  }, [isOpen, user]);

  useBodyLock(isOpen);

  const handleRemove = async (itemId: string) => {
    if (!user) return;
    setRemovingId(itemId);
    try {
      await removeFromCart(user.uid, itemId);
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch (err) {
      console.error("Error removing item:", err);
    }
    setRemovingId(null);
  };

  const handleUpdateQty = async (itemId: string, newQty: number) => {
    if (!user || newQty < 1) return;
    try {
      await updateCartItemQty(user.uid, itemId, newQty);
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQty } : i));
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  const handleCheckout = async () => {
    if (!user) return;
    setCheckingOut(true);
    setCheckoutError(false);
    try {
      await checkoutCart(
        user.uid,
        user.displayName || "",
        user.email || ""
      );
      setCheckingOut(false);
      setCheckoutSuccess(true);
      setItems([]);
      setTimeout(() => {
        setCheckoutSuccess(false);
        onClose();
      }, 2500);
    } catch (err) {
      console.error("Checkout error:", err);
      setCheckingOut(false);
      setCheckoutError(true);
      setTimeout(() => setCheckoutError(false), 4000);
    }
  };

  const totalPrice = items.reduce((sum, item) => sum + (item.servicePrice * item.quantity), 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const currency = items[0]?.serviceCurrency || "USD";

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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 flex items-center justify-center">
                  <ShoppingCart size={20} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-arabic">سلة التسوق</h3>
                  <p className="text-xs text-gray-500 font-arabic">
                    {totalItems > 0 ? `${totalItems} عنصر` : "فارغة"}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <X size={18} />
              </button>
            </div>

            {/* Cart Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white/[0.03] rounded-xl p-4 border border-white/5 animate-pulse">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 bg-white/5 rounded-lg shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-white/5 rounded w-3/4" />
                          <div className="h-3 bg-white/5 rounded w-1/2" />
                          <div className="h-3 bg-white/5 rounded w-1/3" />
                        </div>
                      </div>
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
                    يجب عليك تسجيل الدخول بحسابك أولاً لتتمكن من إضافة منتجات للسلة.
                  </p>
                </div>
              ) : checkoutSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(52,211,153,0.2)]">
                    <CheckCircle2 size={40} />
                  </div>
                  <h4 className="text-2xl font-black text-white mb-3 font-arabic">تم إرسال طلبك بنجاح!</h4>
                  <p className="text-base text-gray-400 font-arabic font-medium">سنتواصل معك في أقرب وقت ممكن لتأكيد التفاصيل.</p>
                </motion.div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4 border border-white/5">
                    <ShoppingBag size={32} className="text-gray-600" />
                  </div>
                  <p className="text-gray-500 font-arabic text-sm font-bold mb-1">السلة فارغة</p>
                  <p className="text-gray-600 font-arabic text-xs">تصفح خدماتنا وأضف ما تريد إلى السلة 🛒</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100, scale: 0.9 }}
                        transition={{ duration: 0.25 }}
                        className="bg-white/[0.03] rounded-xl p-3 border border-white/5 hover:border-white/10 transition-all group"
                      >
                        <div className="flex gap-3">
                          {/* Image */}
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-black flex items-center justify-center shrink-0 border border-white/5">
                            {item.serviceImage ? (
                              <img src={item.serviceImage} alt={item.serviceTitle} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <ShoppingBag className="text-gray-700" size={20} />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white font-arabic truncate mb-1">{item.serviceTitle}</h4>
                            <div className="flex items-center gap-2 flex-wrap">
                              {item.serviceType && (
                                <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded-md">{item.serviceType}</span>
                              )}
                            </div>
                            <div className="mt-1.5 flex items-center justify-between">
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => item.id && handleUpdateQty(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all disabled:opacity-30"
                                >
                                  <Minus size={10} />
                                </button>
                                <span className="text-xs font-bold text-white min-w-[1.5rem] text-center">{item.quantity}</span>
                                <button
                                  onClick={() => item.id && handleUpdateQty(item.id, item.quantity + 1)}
                                  className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
                                >
                                  <Plus size={10} />
                                </button>
                              </div>
                              {/* Price */}
                              <span className="text-sm font-black text-emerald-400" dir="ltr">
                                {formatConvertedPrice(item.servicePrice * item.quantity, item.serviceCurrency)}
                              </span>
                            </div>
                          </div>

                          {/* Remove */}
                          <button
                            onClick={() => item.id && handleRemove(item.id)}
                            disabled={removingId === item.id}
                            className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all shrink-0 self-start"
                          >
                            {removingId === item.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Checkout Footer */}
            {user && items.length > 0 && !checkoutSuccess && (
              <div className="px-6 py-4 border-t border-white/5 shrink-0 space-y-3">
                {/* Error */}
                {checkoutError && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-arabic font-bold"
                  >
                    <AlertCircle size={14} className="shrink-0" />
                    حدث خطأ أثناء الشراء، يرجى المحاولة مرة أخرى
                  </motion.div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between bg-white/[0.03] rounded-xl p-3 border border-white/5">
                  <span className="text-sm font-bold text-gray-400 font-arabic">الإجمالي</span>
                  <span className="text-lg font-black text-white" dir="ltr">
                    {formatConvertedPrice(totalPrice, currency)}
                  </span>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="w-full py-3.5 bg-gradient-to-l from-amber-500 to-orange-500 text-black rounded-xl font-black text-sm font-arabic flex items-center justify-center gap-2 hover:from-amber-400 hover:to-orange-400 transition-all shadow-[0_0_30px_rgba(245,158,11,0.15)] disabled:opacity-70 active:scale-[0.98]"
                >
                  {checkingOut ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>اشتر الآن</span>
                      <span className="bg-black/10 rounded-lg px-2 py-0.5 text-xs">
                        {formatConvertedPrice(totalPrice, currency)}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
