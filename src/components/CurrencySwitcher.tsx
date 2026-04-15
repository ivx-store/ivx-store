import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, RefreshCw, Check, Search } from "lucide-react";
import { useCurrency, SUPPORTED_CURRENCIES, type DisplayCurrency, type CurrencyInfo } from "../lib/CurrencyContext";

export function CurrencySwitcher() {
  const { displayCurrency, setDisplayCurrency, ratesLoading, lastUpdated, currentCurrencyInfo } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-focus search when opened
  useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filtered = SUPPORTED_CURRENCIES.filter(c =>
    c.nameAr.includes(search) ||
    c.nameEn.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (code: DisplayCurrency) => {
    setDisplayCurrency(code);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className="currency-switcher" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="currency-switcher-trigger"
        title="تحويل العملة"
        id="currency-switcher-btn"
      >
        <span className="currency-switcher-flag">{currentCurrencyInfo.flag}</span>
        <span className="currency-switcher-code">{currentCurrencyInfo.code}</span>
        <ChevronDown size={14} className={`currency-switcher-arrow ${isOpen ? "rotated" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="currency-switcher-dropdown"
          >
            {/* Header */}
            <div className="currency-switcher-dropdown-header">
              <span className="currency-switcher-dropdown-title">اختر العملة</span>
              {ratesLoading ? (
                <RefreshCw size={12} className="currency-switcher-loading" />
              ) : lastUpdated ? (
                <span className="currency-switcher-updated">
                  تحديث مباشر
                  <span className="currency-switcher-live-dot" />
                </span>
              ) : null}
            </div>

            {/* Search */}
            <div className="currency-switcher-search">
              <Search size={14} className="currency-switcher-search-icon" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن عملة..."
                className="currency-switcher-search-input"
                dir="rtl"
              />
            </div>

            {/* Currency List */}
            <div className="currency-switcher-list">
              {filtered.map((curr) => {
                const isActive = curr.code === displayCurrency;
                return (
                  <button
                    key={curr.code}
                    onClick={() => handleSelect(curr.code)}
                    className={`currency-switcher-option ${isActive ? "active" : ""}`}
                  >
                    <span className="currency-switcher-option-flag">{curr.flag}</span>
                    <div className="currency-switcher-option-info">
                      <span className="currency-switcher-option-name">{curr.nameAr}</span>
                      <span className="currency-switcher-option-code">{curr.code} • {curr.symbol}</span>
                    </div>
                    {isActive && (
                      <div className="currency-switcher-option-check">
                        <Check size={12} />
                      </div>
                    )}
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="currency-switcher-empty">
                  <span>لا توجد نتائج</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
