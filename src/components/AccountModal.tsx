import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";
import { X, LogOut, Mail, ShieldCheck, ShoppingBag, Package, Clock, CheckCircle2, XCircle, RefreshCw, ChevronLeft } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { logoutAdmin, getUserOrders, OrderData, formatTimestamp, formatPriceWithCommas, getCurrencySymbol } from "../lib/firebase";
import { useDevicePerformance } from "../lib/useDevicePerformance";
import { GoogleIcon } from "./GoogleIcon";
import { useBodyLock } from "../lib/useBodyLock";
import { STATUS_CONFIG, ITEM_TYPE_LABELS } from "../lib/constants";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccountModal({ isOpen, onClose }: AccountModalProps) {
  const { user } = useAuth();
  const { isLowEnd } = useDevicePerformance();
  const [mounted, setMounted] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setShowOrders(false);
      setSelectedOrder(null);
    }
  }, [isOpen]);

  useBodyLock(isOpen);

  const handleLogout = async () => {
    await logoutAdmin();
    onClose();
  };

  const handleOpenOrders = async () => {
    if (!user) return;
    setShowOrders(true);
    setOrdersLoading(true);
    try {
      const data = await getUserOrders(user.uid);
      setOrders(data);
    } catch (err) {
      console.error("Error loading orders:", err);
    }
    setOrdersLoading(false);
  };

  if (!mounted || !user) return null;

  const userInitial = user.displayName?.[0] || user.email?.[0]?.toUpperCase() || "U";
  const userPhoto = user.photoURL;
  const isGoogle = user.providerData?.[0]?.providerId === "google.com";

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
            className="relative w-full max-w-[400px] bg-[#0d0d0d] border border-white/10 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Decorative background */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

            <AnimatePresence mode="wait">
              {selectedOrder ? (
                /* === Order Detail View === */
                <motion.div
                  key="order-detail"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col"
                >
                  {/* Detail Header */}
                  <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between shrink-0 relative z-10">
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors font-arabic"
                    >
                      <ChevronLeft size={16} />
                      رجوع
                    </button>
                    <button
                      onClick={onClose}
                      className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Order Detail Content */}
                  <div className="p-6 relative z-10 overflow-y-auto flex-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
                    {(() => {
                      const status = STATUS_CONFIG[selectedOrder.status];
                      return (
                        <div className="space-y-4">
                          {/* Status Badge */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: status.bg, color: status.color }}>
                              {status.icon}
                              {status.label}
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-1 rounded-md">
                              {ITEM_TYPE_LABELS[selectedOrder.itemType] || selectedOrder.itemType}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-lg font-black text-white font-arabic flex items-center gap-2">
                            <Package size={18} className="text-gray-500 shrink-0" />
                            {selectedOrder.itemTitle}
                          </h3>

                          {/* Date */}
                          <div className="text-xs text-gray-500 font-arabic flex items-center gap-1.5">
                            <Clock size={12} />
                            {formatTimestamp(selectedOrder.createdAt)}
                          </div>

                          {/* Cart Items (if this is a cart order) */}
                          {selectedOrder.customFields?.cartItems && Array.isArray(selectedOrder.customFields.cartItems) && (
                            <div className="space-y-2">
                              <p className="text-xs font-bold text-gray-400 font-arabic">عناصر السلة:</p>
                              {selectedOrder.customFields.cartItems.map((ci: any, i: number) => (
                                <div key={i} className="flex items-center justify-between bg-white/[0.03] rounded-lg p-3 border border-white/5">
                                  <div>
                                    <p className="text-sm font-bold text-white font-arabic">{ci.title}</p>
                                    {ci.platform && <span className="text-[10px] text-blue-400 font-bold">{ci.platform}</span>}
                                    {ci.quantity > 1 && <span className="text-[10px] text-gray-500 mr-2">× {ci.quantity}</span>}
                                  </div>
                                  <span className="text-xs font-black text-emerald-400" dir="ltr">
                                    {formatPriceWithCommas(String(ci.price * ci.quantity))} {getCurrencySymbol(ci.currency)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Pricing */}
                          {selectedOrder.totalPrice !== undefined && selectedOrder.totalPrice > 0 && (
                            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5 space-y-2">
                              {selectedOrder.pricingBreakdown && selectedOrder.pricingBreakdown.map((item, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                  <span className="text-gray-400 font-arabic">{item.label}</span>
                                  <span className="text-white font-bold" dir="ltr">
                                    {formatPriceWithCommas(String(item.value))} {getCurrencySymbol(selectedOrder.priceCurrency || "USD")}
                                  </span>
                                </div>
                              ))}
                              {(selectedOrder.pricingBreakdown?.length || 0) > 0 && (
                                <div className="h-px bg-white/5 my-2" />
                              )}
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-white font-black font-arabic">الإجمالي</span>
                                <span className="text-lg font-black text-emerald-400" dir="ltr">
                                  {formatPriceWithCommas(String(selectedOrder.totalPrice))} {getCurrencySymbol(selectedOrder.priceCurrency || "USD")}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {selectedOrder.customerNotes && (
                            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                              <p className="text-xs font-bold text-gray-400 font-arabic mb-2">ملاحظات</p>
                              <p className="text-sm text-gray-300 font-arabic leading-relaxed">{selectedOrder.customerNotes}</p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </motion.div>
              ) : showOrders ? (
                /* === Orders List View === */
                <motion.div
                  key="orders-list"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col flex-1 overflow-hidden"
                >
                  {/* Orders Header */}
                  <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between shrink-0 relative z-10">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowOrders(false)}
                        className="flex items-center gap-1 text-sm font-bold text-gray-400 hover:text-white transition-colors font-arabic"
                      >
                        <ChevronLeft size={16} />
                        رجوع
                      </button>
                    </div>
                    <h3 className="text-lg font-black text-white font-arabic">طلباتي</h3>
                  </div>

                  {/* Orders List */}
                  <div className="flex-1 overflow-y-auto px-6 py-4" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
                    {ordersLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="bg-white/[0.03] rounded-xl p-4 border border-white/5 animate-pulse">
                            <div className="h-4 bg-white/5 rounded w-3/4 mb-3" />
                            <div className="h-3 bg-white/5 rounded w-1/2 mb-2" />
                            <div className="h-3 bg-white/5 rounded w-1/3" />
                          </div>
                        ))}
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                          <ShoppingBag size={28} className="text-gray-600" />
                        </div>
                        <p className="text-gray-500 font-arabic text-sm font-bold">لا توجد طلبات بعد</p>
                        <p className="text-gray-600 font-arabic text-xs mt-1">ستظهر طلباتك هنا بعد إجراء أول طلب</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.map((order) => {
                          const status = STATUS_CONFIG[order.status];
                          return (
                            <button
                              key={order.id}
                              onClick={() => setSelectedOrder(order)}
                              className="w-full text-right bg-white/[0.03] rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all"
                              style={{ borderRightColor: status.color, borderRightWidth: "3px" }}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <Package size={14} className="text-gray-500 shrink-0" />
                                  <span className="text-sm font-bold text-white font-arabic truncate">{order.itemTitle}</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold shrink-0 mr-2" style={{ background: status.bg, color: status.color }}>
                                  {status.icon}
                                  {status.label}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500 font-arabic">
                                <span className="px-2 py-0.5 rounded bg-white/5 text-gray-400 font-bold">{ITEM_TYPE_LABELS[order.itemType] || order.itemType}</span>
                                <span>{formatTimestamp(order.createdAt)}</span>
                                {order.totalPrice !== undefined && order.totalPrice > 0 && (
                                  <span className="text-[10px] font-black text-green-400 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20 whitespace-nowrap shrink-0 mr-auto" dir="ltr">
                                    {formatPriceWithCommas(String(order.totalPrice))} {getCurrencySymbol(order.priceCurrency || "USD")}
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                /* === Profile View (Default) === */
                <motion.div
                  key="profile"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Header */}
                  <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between shrink-0 relative z-10">
                    <h3 className="text-lg font-black text-white font-arabic">حسابي</h3>
                    <button
                      onClick={onClose}
                      className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Content Display */}
                  <div className="p-6 relative z-10 space-y-6">
                    {/* User Identity */}
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="relative mb-4">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#0d0d0d] shadow-[0_0_0_2px_rgba(255,255,255,0.1)] bg-white/5 flex items-center justify-center">
                          {userPhoto ? (
                            <img src={userPhoto} alt="User avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl font-black text-white">{userInitial}</span>
                          )}
                        </div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 rounded-full bg-[#0d0d0d] flex items-center justify-center shadow-sm">
                          <div className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                        </div>
                      </div>
                      {user.displayName && (
                        <h2 className="text-xl font-bold text-white mb-1" dir="ltr">{user.displayName}</h2>
                      )}
                      <p className="text-gray-400 text-sm font-medium" dir="ltr">{user.email}</p>
                    </div>

                    {/* Quick Actions */}
                    <button
                      onClick={handleOpenOrders}
                      className="w-full flex items-center justify-between bg-white/[0.03] border border-white/5 p-4 rounded-xl hover:bg-white/[0.06] hover:border-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 border border-amber-500/15 flex items-center justify-center text-amber-400 group-hover:text-amber-300 transition-colors">
                          <ShoppingBag size={18} />
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-white font-arabic block">طلباتي</span>
                          <span className="text-[11px] text-gray-500 font-arabic">عرض جميع الطلبات والمشتريات</span>
                        </div>
                      </div>
                      <ChevronLeft size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                    </button>

                    {/* Account Details Tags */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 p-4 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400">
                            <ShieldCheck size={16} />
                          </div>
                          <span className="text-sm font-bold text-white font-arabic">حالة الحساب</span>
                        </div>
                        <span className="text-xs font-bold text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 font-arabic">نشط</span>
                      </div>

                      <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 p-4 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400">
                            {isGoogle ? <GoogleIcon /> : <Mail size={16} />}
                          </div>
                          <span className="text-sm font-bold text-white font-arabic">طريقة التسجيل</span>
                        </div>
                        <span className="text-xs font-bold text-gray-400 font-arabic bg-black px-3 py-1.5 rounded-full border border-white/10">
                          {isGoogle ? "Google" : "البريد الإلكتروني"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 pt-0 mt-2 relative z-10">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all font-bold text-sm font-arabic group"
                    >
                      <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
                      تسجيل الخروج
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
