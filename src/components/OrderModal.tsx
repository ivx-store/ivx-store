import { motion, AnimatePresence } from "motion/react";
import { X, Send, User, Phone, FileText, CheckCircle2, Sparkles, Minus, Plus, AlertCircle, LogIn, ChevronDown, Check, DollarSign } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { FormField, Currency, addOrder, ensureSystemFields, formatPriceWithCommas, getCurrencySymbol } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";
import { UserAuthModal } from "./UserAuthModal";
import { useDevicePerformance } from "../lib/useDevicePerformance";
import { useBodyLock } from "../lib/useBodyLock";
import { useCurrency } from "../lib/CurrencyContext";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: string;
  formFields?: FormField[];
  itemType?: "service" | "package" | "offer";
  basePrice?: number;
  baseCurrency?: Currency;
}

// Custom Dropdown Component
function CustomDropdown({
  field,
  value,
  onChange,
  baseCurrency,
}: {
  field: FormField;
  value: string;
  onChange: (val: string) => void;
  baseCurrency: Currency;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const options = field.options || [];
  const hasPricing = field.pricingEnabled && field.pricingMode === "options_map";
  const currency = field.priceCurrency || baseCurrency;
  const { formatConvertedPrice } = useCurrency();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = value || field.placeholder || "اختر...";
  const selectedPrice = hasPricing && value && field.optionPrices?.[value] !== undefined
    ? field.optionPrices[value]
    : null;

  return (
    <div className="order-custom-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className={`order-dropdown-trigger ${isOpen ? "open" : ""} ${value ? "has-value" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="order-dropdown-trigger-content">
          <span className={`order-dropdown-trigger-text ${!value ? "placeholder" : ""}`}>
            {selectedLabel}
          </span>
          {selectedPrice !== null && (
            <span className="order-dropdown-trigger-price">
              {formatConvertedPrice(selectedPrice, currency)}
            </span>
          )}
        </div>
        <ChevronDown size={16} className={`order-dropdown-arrow ${isOpen ? "rotated" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="order-dropdown-menu"
          >
            {options.map((opt, i) => {
              const optPrice = hasPricing && field.optionPrices?.[opt] !== undefined
                ? field.optionPrices[opt]
                : null;
              const isSelected = value === opt;

              return (
                <button
                  key={i}
                  type="button"
                  className={`order-dropdown-option ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                >
                  <div className="order-dropdown-option-content">
                    <span className="order-dropdown-option-label">{opt}</span>
                    {optPrice !== null && (
                      <span className="order-dropdown-option-price">
                        {formatConvertedPrice(optPrice, currency)}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <Check size={14} className="order-dropdown-option-check" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Price Breakdown Bar
function PriceBreakdown({
  breakdown,
  total,
  currency,
}: {
  breakdown: { label: string; value: number; currency: Currency }[];
  total: number;
  currency: Currency;
}) {
  if (breakdown.length === 0 && total === 0) return null;
  const { formatConvertedPrice } = useCurrency();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="order-price-breakdown"
    >
      <div className="order-price-breakdown-header">
        <DollarSign size={14} />
        <span>ملخص التسعير</span>
      </div>
      <div className="order-price-breakdown-body">
        {breakdown.map((item, i) => (
          <div key={i} className="order-price-breakdown-row">
            <span className="order-price-breakdown-label">{item.label}</span>
            <span className="order-price-breakdown-value">
              {formatConvertedPrice(item.value, item.currency)}
            </span>
          </div>
        ))}
        {breakdown.length > 0 && (
          <>
            <div className="order-price-breakdown-divider" />
            <div className="order-price-breakdown-row total">
              <span className="order-price-breakdown-label">الإجمالي</span>
              <span className="order-price-breakdown-value">
                {formatConvertedPrice(total, currency)}
              </span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

export function OrderModal({ isOpen, onClose, selectedItem, formFields, itemType = "service", basePrice, baseCurrency = "USD" }: OrderModalProps) {
  const { isLowEnd } = useDevicePerformance();
  const { user } = useAuth();
  const { formatConvertedPrice, rates } = useCurrency();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});
  const [validationError, setValidationError] = useState("");

  const fieldsToRender = React.useMemo(() => ensureSystemFields(formFields || []).filter(f => !f.deleted), [formFields]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useBodyLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      // Reset form
      const initialValues: Record<string, any> = {};
      fieldsToRender.forEach(field => {
        if (field.pricingEnabled && field.pricingMode === "per_unit" &&
            (field.type === "counter" || field.type === "number" || field.type === "slider")) {
          initialValues[field.id] = Math.max(1, field.min ?? 0);
        }
      });
      setCustomFieldValues(initialValues);
      setIsSuccess(false);
      setIsError(false);
      setValidationError("");
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  const getFieldValue = (fieldId: string, defaultVal: any = "") => {
    return customFieldValues[fieldId] ?? defaultVal;
  };

  const setFieldValue = (fieldId: string, val: any) => {
    setCustomFieldValues((prev) => ({ ...prev, [fieldId]: val }));
  };

  const hasCustomFields = fieldsToRender.length > 0;

  // Dynamic pricing calculation
  const { breakdown, total, hasPricing } = useMemo(() => {
    const items: { label: string; value: number; currency: Currency }[] = [];
    let runningTotal = 0;
    let anyPricing = false;

    // Helper: convert amount from one currency to baseCurrency using rates
    const toBaseCurrency = (amount: number, fromCurrency: Currency): number => {
      if (fromCurrency === baseCurrency) return amount;
      const fromRate = rates[fromCurrency] || 1;
      const toRate = rates[baseCurrency] || 1;
      return (amount / fromRate) * toRate;
    };

    // Base price (always in baseCurrency)
    if (basePrice && basePrice > 0) {
      items.push({ label: selectedItem || "السعر الأساسي", value: basePrice, currency: baseCurrency });
      runningTotal += basePrice;
      anyPricing = true;
    }

    // Iterate through fields with pricing
    for (const field of fieldsToRender) {
      if (!field.pricingEnabled) continue;

      const val = customFieldValues[field.id];
      const fieldCurrency = field.priceCurrency || baseCurrency;

      if (field.pricingMode === "options_map" && field.type === "select") {
        if (val && field.optionPrices?.[val] !== undefined) {
          const price = field.optionPrices[val];
          if (price > 0) {
            items.push({ label: `${field.label}: ${val}`, value: price, currency: fieldCurrency });
            runningTotal += toBaseCurrency(price, fieldCurrency);
            anyPricing = true;
          }
        }
      } else if (field.pricingMode === "per_unit") {
        const qty = Number(val) || 0;
        const unitPrice = field.pricePerUnit || 0;
        if (qty > 0 && unitPrice > 0) {
          const itemTotal = qty * unitPrice;
          items.push({ label: `${field.label}: ${qty} × ${formatPriceWithCommas(String(unitPrice))}`, value: itemTotal, currency: fieldCurrency });
          runningTotal += toBaseCurrency(itemTotal, fieldCurrency);
          anyPricing = true;
        }
      } else if (field.pricingMode === "fixed") {
        const fixedP = field.fixedPrice || 0;
        if (fixedP > 0 && val) {
          items.push({ label: field.label, value: fixedP, currency: fieldCurrency });
          runningTotal += toBaseCurrency(fixedP, fieldCurrency);
          anyPricing = true;
        }
      }
    }

    return { breakdown: items, total: runningTotal, hasPricing: anyPricing };
  }, [customFieldValues, fieldsToRender, basePrice, selectedItem, baseCurrency, rates]);

  const validateForm = (): boolean => {
    for (const field of fieldsToRender) {
      if (field.required) {
        const value = customFieldValues[field.id];
        if (value === undefined || value === "" || value === null) {
          setValidationError(`يرجى تعبئة حقل "${field.label}"`);
          return false;
        }
      }
    }
    setValidationError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setIsError(false);
    try {
      await addOrder({
        itemTitle: selectedItem,
        itemType,
        customerName: customFieldValues["customerName"] || "",
        customerPhone: customFieldValues["customerPhone"] || "",
        customerNotes: customFieldValues["customerNotes"] || "",
        customFields: customFieldValues,
        status: "pending",
        ...(hasPricing ? {
          totalPrice: total,
          priceCurrency: baseCurrency,
          pricingBreakdown: breakdown.map(b => ({ label: b.label, value: b.value })),
        } : {}),
      });
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2500);
    } catch (err) {
      console.error("Order error:", err);
      setIsSubmitting(false);
      setIsError(true);
      setTimeout(() => setIsError(false), 5000);
    }
  };

  if (!mounted) return null;

  const modal = createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6" dir="rtl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`absolute inset-0 bg-black/80 ${isLowEnd ? '' : 'backdrop-blur-md'}`}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full max-w-lg bg-gray-900/90 ${isLowEnd ? '' : 'backdrop-blur-2xl'} rounded-[2rem] shadow-2xl border border-gray-800 overflow-hidden text-right max-h-[90vh] overflow-y-auto`}
          >
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gray-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Auth Gate - Show login prompt if not authenticated */}
            {!user ? (
              <div className="relative z-10 p-8 md:p-10 flex flex-col items-center text-center">
                <button onClick={onClose} className="absolute top-4 left-4 w-8 h-8 rounded-full bg-gray-800/50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all z-20">
                  <X size={18} />
                </button>
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
                  <LogIn size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-black text-white mb-2 font-arabic">سجّل دخولك أولاً</h3>
                <p className="text-sm text-gray-400 font-arabic mb-6 leading-relaxed max-w-xs">يرجى تسجيل الدخول أو إنشاء حساب لإتمام طلبك</p>
                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3.5 mb-6 w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                      <Sparkles size={18} className="text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-arabic">المنتج المطلوب</p>
                      <p className="text-sm font-bold text-white font-arabic">{selectedItem}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full py-3.5 bg-white text-black rounded-xl font-black text-sm font-arabic flex items-center justify-center gap-2 hover:bg-gray-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.08)]"
                >
                  <LogIn size={16} />
                  تسجيل الدخول
                </button>
                <p className="text-[11px] text-gray-600 font-arabic mt-4">يمكنك تسجيل الدخول بالبريد أو بحساب Google</p>
              </div>
            ) : (
              /* Authenticated content starts here */
              <>
                {/* Header */}
                <div className="px-6 md:px-8 py-5 md:py-6 flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg shrink-0">
                      <Sparkles className="text-black w-5 h-5" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-white font-arabic">طلب خدمة</h3>
                  </div>
                  <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors backdrop-blur-sm shrink-0">
                    <X size={24} />
                  </button>
                </div>

                {/* Body */}
                <div className="px-6 md:px-8 pb-6 md:pb-8 relative z-10">
                  {isSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-12 text-center"
                    >
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-white text-black rounded-full flex items-center justify-center mb-6 shadow-xl shadow-white/10">
                        <CheckCircle2 size={40} className="md:w-12 md:h-12" />
                      </div>
                      <h4 className="text-2xl md:text-3xl font-black text-white mb-3 font-arabic">تم إرسال طلبك بنجاح!</h4>
                      <p className="text-base md:text-lg text-gray-400 font-arabic font-medium">سنتواصل معك في أقرب وقت ممكن لتأكيد التفاصيل.</p>
                    </motion.div>
                  ) : isError ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-12 text-center"
                    >
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-6">
                        <AlertCircle size={40} className="md:w-12 md:h-12" />
                      </div>
                      <h4 className="text-2xl md:text-3xl font-black text-white mb-3 font-arabic">حدث خطأ!</h4>
                      <p className="text-base md:text-lg text-gray-400 font-arabic font-medium">يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة.</p>
                      <button
                        onClick={() => setIsError(false)}
                        className="mt-6 px-6 py-3 bg-white text-black rounded-xl font-bold font-arabic text-sm"
                      >
                        حاول مرة أخرى
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                      {/* Validation Error */}
                      {validationError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-arabic font-bold"
                        >
                          <AlertCircle size={16} className="shrink-0" />
                          {validationError}
                        </motion.div>
                      )}

                      {/* Selected item */}
                      <div>
                        <label className="block text-sm font-bold text-gray-300 mb-1.5 md:mb-2 font-arabic">الخدمة / الباقة المطلوبة</label>
                        <div className="w-full px-4 md:px-5 py-3 md:py-4 bg-black/50 border border-gray-800 rounded-xl md:rounded-2xl text-white font-black text-base md:text-lg font-arabic shadow-sm backdrop-blur-sm flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
                          {selectedItem}
                        </div>
                      </div>

                      {/* Dynamic Form Fields */}
                      {hasCustomFields && fieldsToRender.map((field) => (
                        <div key={field.id}>
                          <label className="block text-sm font-bold text-gray-300 mb-1.5 md:mb-2 font-arabic">
                            {field.label} {field.required && <span className="text-red-400">*</span>}
                          </label>

                          {field.type === "text" && (
                            <div className="relative group">
                              {field.id === "customerName" && (
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-white transition-colors">
                                  <User size={18} className="md:w-5 md:h-5" />
                                </div>
                              )}
                              <input
                                type="text"
                                required={field.required}
                                placeholder={field.placeholder || ""}
                                value={getFieldValue(field.id)}
                                onChange={(e) => { setFieldValue(field.id, e.target.value); setValidationError(""); }}
                                className={`w-full py-3 md:py-4 bg-black/50 border border-gray-800 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-white/20 focus:border-white outline-none transition-all font-arabic shadow-sm backdrop-blur-sm text-white font-medium text-sm md:text-base placeholder-gray-600 ${field.id === "customerName" ? "pr-11 md:pr-12 pl-4" : "px-4"}`}
                              />
                            </div>
                          )}

                          {field.type === "email" && (
                            <input
                              type="email"
                              required={field.required}
                              placeholder={field.placeholder || "example@email.com"}
                              value={getFieldValue(field.id)}
                              onChange={(e) => { setFieldValue(field.id, e.target.value); setValidationError(""); }}
                              dir="ltr"
                              className="w-full px-4 py-3 md:py-4 bg-black/50 border border-gray-800 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-white/20 focus:border-white outline-none transition-all shadow-sm backdrop-blur-sm text-white font-medium text-sm md:text-base placeholder-gray-600 text-right"
                            />
                          )}

                          {field.type === "tel" && (
                            <div className="relative group">
                              {field.id === "customerPhone" && (
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-white transition-colors">
                                  <Phone size={18} className="md:w-5 md:h-5" />
                                </div>
                              )}
                              <input
                                type="tel"
                                required={field.required}
                                placeholder={field.placeholder || "07X XXXX XXXX"}
                                value={getFieldValue(field.id)}
                                onChange={(e) => { setFieldValue(field.id, e.target.value); setValidationError(""); }}
                                dir="ltr"
                                className={`w-full py-3 md:py-4 bg-black/50 border border-gray-800 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-white/20 focus:border-white outline-none transition-all font-arabic text-right shadow-sm backdrop-blur-sm text-white font-medium text-sm md:text-base placeholder-gray-600 ${field.id === "customerPhone" ? "pr-11 md:pr-12 pl-4" : "px-4"}`}
                              />
                            </div>
                          )}

                          {field.type === "number" && (
                            <div>
                              <input
                                type="number"
                                required={field.required}
                                placeholder={field.placeholder || "0"}
                                value={getFieldValue(field.id)}
                                onChange={(e) => { setFieldValue(field.id, e.target.value); setValidationError(""); }}
                                min={field.min}
                                max={field.max}
                                step={field.step ?? 1}
                                className="w-full px-4 py-3 md:py-4 bg-black/50 border border-gray-800 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-white/20 focus:border-white outline-none transition-all shadow-sm backdrop-blur-sm text-white font-medium text-sm md:text-base placeholder-gray-600"
                              />
                              {field.pricingEnabled && field.pricingMode === "per_unit" && field.pricePerUnit && (
                                <div className="mt-1.5 text-xs text-gray-500 font-arabic font-medium flex items-center gap-1.5">
                                  <DollarSign size={11} />
                                  سعر الوحدة: {formatConvertedPrice(field.pricePerUnit, field.priceCurrency || baseCurrency)}
                                </div>
                              )}
                            </div>
                          )}

                          {field.type === "counter" && (() => {
                            const min = field.min ?? 0;
                            const max = field.max ?? 999;
                            const step = field.step ?? 1;
                            const defaultVal = (field.pricingEnabled && field.pricingMode === "per_unit") ? Math.max(1, min) : min;
                            const val = Number(getFieldValue(field.id, defaultVal));
                            const hasUnitPrice = field.pricingEnabled && field.pricingMode === "per_unit" && field.pricePerUnit;
                            const unitPrice = field.pricePerUnit || 0;
                            const lineTotal = val * unitPrice;

                            return (
                              <div>
                                <div className="flex items-center gap-4">
                                  <button
                                    type="button"
                                    onClick={() => setFieldValue(field.id, Math.max(min, val - step))}
                                    className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                                  >
                                    <Minus size={16} />
                                  </button>
                                  <span className="text-xl font-black text-white min-w-[3rem] text-center">{val}</span>
                                  <button
                                    type="button"
                                    onClick={() => setFieldValue(field.id, Math.min(max, val + step))}
                                    className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                                  >
                                    <Plus size={16} />
                                  </button>
                                  {hasUnitPrice && lineTotal > 0 && (
                                    <div className="mr-auto bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5">
                                      <span className="text-sm font-bold text-emerald-400 font-arabic">
                                        {formatConvertedPrice(lineTotal, field.priceCurrency || baseCurrency)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {hasUnitPrice && (
                                  <div className="mt-1.5 text-xs text-gray-500 font-arabic font-medium flex items-center gap-1.5">
                                    <DollarSign size={11} />
                                    سعر الوحدة: {formatConvertedPrice(unitPrice, field.priceCurrency || baseCurrency)}
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {field.type === "slider" && (() => {
                            const min = field.min ?? 0;
                            const max = field.max ?? 100;
                            const step = field.step ?? 1;
                            const val = Number(getFieldValue(field.id, Math.round((min + max) / 2)));
                            const hasUnitPrice = field.pricingEnabled && field.pricingMode === "per_unit" && field.pricePerUnit;
                            const lineTotal = val * (field.pricePerUnit || 0);

                            return (
                              <div>
                                <input
                                  type="range"
                                  min={min}
                                  max={max}
                                  step={step}
                                  value={val}
                                  onChange={(e) => setFieldValue(field.id, Number(e.target.value))}
                                  className="w-full accent-white"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                  <span>{min}</span>
                                  <span className="text-white font-bold text-sm">{val}</span>
                                  <span>{max}</span>
                                </div>
                                {hasUnitPrice && lineTotal > 0 && (
                                  <div className="mt-2 text-center">
                                    <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1 font-arabic">
                                      = {formatConvertedPrice(lineTotal, field.priceCurrency || baseCurrency)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {field.type === "textarea" && (
                            <div className="relative group">
                              {field.id === "customerNotes" && (
                                <div className="absolute top-3.5 md:top-4 right-0 pr-4 pointer-events-none text-gray-500 group-focus-within:text-white transition-colors">
                                  <FileText size={18} className="md:w-5 md:h-5" />
                                </div>
                              )}
                              <textarea
                                required={field.required}
                                placeholder={field.placeholder || ""}
                                rows={3}
                                value={getFieldValue(field.id)}
                                onChange={(e) => { setFieldValue(field.id, e.target.value); setValidationError(""); }}
                                className={`w-full py-3 md:py-4 bg-black/50 border border-gray-800 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-white/20 focus:border-white outline-none transition-all font-arabic resize-none shadow-sm backdrop-blur-sm text-white font-medium text-sm md:text-base placeholder-gray-600 ${field.id === "customerNotes" ? "pr-11 md:pr-12 pl-4" : "px-4"}`}
                              />
                            </div>
                          )}

                          {field.type === "select" && (
                            <CustomDropdown
                              field={field}
                              value={getFieldValue(field.id, "")}
                              onChange={(val) => { setFieldValue(field.id, val); setValidationError(""); }}
                              baseCurrency={baseCurrency}
                            />
                          )}
                        </div>
                      ))}

                      {/* Dynamic Price Breakdown */}
                      {hasPricing && (
                        <PriceBreakdown
                          breakdown={breakdown}
                          total={total}
                          currency={baseCurrency}
                        />
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 md:py-4 mt-2 bg-white text-black rounded-xl md:rounded-2xl font-black text-lg md:text-xl font-arabic shadow-[0_8px_20px_rgba(255,255,255,0.1)] hover:shadow-[0_15px_30px_rgba(255,255,255,0.2)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:translate-y-0"
                      >
                        {isSubmitting ? (
                          <div className="w-6 h-6 md:w-7 md:h-7 border-3 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send size={20} className="md:w-[22px] md:h-[22px]" />
                            <span>تأكيد الطلب</span>
                            {hasPricing && total > 0 && (
                              <span className="bg-black/10 rounded-lg px-2 py-0.5 text-sm font-bold">
                                {formatConvertedPrice(total, baseCurrency)}
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
                {/* End of auth gate */}
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );

  return (
    <>
      {modal}
      <UserAuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
