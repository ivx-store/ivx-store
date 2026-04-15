import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { Currency } from "./firebase";

// ============ Supported Display Currencies ============

export type DisplayCurrency =
  | "USD"   // US Dollar
  | "IQD"   // Iraqi Dinar
  | "SAR"   // Saudi Riyal
  | "AED"   // UAE Dirham
  | "KWD"   // Kuwaiti Dinar
  | "BHD"   // Bahraini Dinar
  | "OMR"   // Omani Rial
  | "QAR"   // Qatari Riyal
  | "EGP"   // Egyptian Pound
  | "JOD"   // Jordanian Dinar
  | "TRY"   // Turkish Lira
  | "EUR"   // Euro
  | "GBP";  // British Pound

export interface CurrencyInfo {
  code: DisplayCurrency;
  nameAr: string;
  nameEn: string;
  symbol: string;
  flag: string;
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: "USD", nameAr: "دولار أمريكي", nameEn: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "IQD", nameAr: "دينار عراقي", nameEn: "Iraqi Dinar", symbol: "د.ع", flag: "🇮🇶" },
  { code: "SAR", nameAr: "ريال سعودي", nameEn: "Saudi Riyal", symbol: "ر.س", flag: "🇸🇦" },
  { code: "AED", nameAr: "درهم إماراتي", nameEn: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪" },
  { code: "KWD", nameAr: "دينار كويتي", nameEn: "Kuwaiti Dinar", symbol: "د.ك", flag: "🇰🇼" },
  { code: "BHD", nameAr: "دينار بحريني", nameEn: "Bahraini Dinar", symbol: "د.ب", flag: "🇧🇭" },
  { code: "OMR", nameAr: "ريال عماني", nameEn: "Omani Rial", symbol: "ر.ع", flag: "🇴🇲" },
  { code: "QAR", nameAr: "ريال قطري", nameEn: "Qatari Riyal", symbol: "ر.ق", flag: "🇶🇦" },
  { code: "EGP", nameAr: "جنيه مصري", nameEn: "Egyptian Pound", symbol: "ج.م", flag: "🇪🇬" },
  { code: "JOD", nameAr: "دينار أردني", nameEn: "Jordanian Dinar", symbol: "د.أ", flag: "🇯🇴" },
  { code: "TRY", nameAr: "ليرة تركية", nameEn: "Turkish Lira", symbol: "₺", flag: "🇹🇷" },
  { code: "EUR", nameAr: "يورو", nameEn: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", nameAr: "جنيه إسترليني", nameEn: "British Pound", symbol: "£", flag: "🇬🇧" },
];

// ============ Fallback Exchange Rates (USD-based) ============
// These are approximate rates used when the API is unreachable
const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  IQD: 1310,
  SAR: 3.75,
  AED: 3.67,
  KWD: 0.307,
  BHD: 0.376,
  OMR: 0.385,
  QAR: 3.64,
  EGP: 49.5,
  JOD: 0.709,
  TRY: 38.5,
  EUR: 0.92,
  GBP: 0.79,
};

// ============ Context ============

interface CurrencyContextType {
  /** The user's selected display currency */
  displayCurrency: DisplayCurrency;
  /** Set the display currency */
  setDisplayCurrency: (currency: DisplayCurrency) => void;
  /** Exchange rates (base = USD) */
  rates: Record<string, number>;
  /** Whether rates are loading */
  ratesLoading: boolean;
  /** Last update timestamp */
  lastUpdated: Date | null;
  /** Convert a price from a source currency (USD or IQD) to the selected display currency */
  convertPrice: (amount: number, sourceCurrency: Currency) => number;
  /** Format a converted price with the appropriate symbol */
  formatConvertedPrice: (amount: number, sourceCurrency: Currency) => string;
  /** Get currency info for the current display currency */
  currentCurrencyInfo: CurrencyInfo;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
}

// ============ API Fetching ============

const CACHE_KEY = "ivx_exchange_rates";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour cache

interface CachedRates {
  rates: Record<string, number>;
  timestamp: number;
}

function getCachedRates(): CachedRates | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: CachedRates = JSON.parse(raw);
    // Check if cache is still valid
    if (Date.now() - parsed.timestamp < CACHE_DURATION) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

function setCachedRates(rates: Record<string, number>) {
  try {
    const data: CachedRates = { rates, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

async function fetchExchangeRates(): Promise<Record<string, number>> {
  // Try cached rates first
  const cached = getCachedRates();
  if (cached) return cached.rates;

  // Try multiple free APIs with fallback
  const apis = [
    // Open Exchange Rates (free tier, no key needed for latest)
    `https://open.er-api.com/v6/latest/USD`,
    // Backup
    `https://api.exchangerate-api.com/v4/latest/USD`,
  ];

  for (const url of apis) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const data = await res.json();
      const rates = data.rates;
      if (rates && typeof rates === "object") {
        // Ensure all our currencies are in the rates
        const finalRates: Record<string, number> = { USD: 1 };
        for (const curr of SUPPORTED_CURRENCIES) {
          if (rates[curr.code] !== undefined) {
            finalRates[curr.code] = rates[curr.code];
          } else if (FALLBACK_RATES[curr.code] !== undefined) {
            finalRates[curr.code] = FALLBACK_RATES[curr.code];
          }
        }
        setCachedRates(finalRates);
        return finalRates;
      }
    } catch {
      // continue to next API
    }
  }

  // If all APIs fail, use fallback rates
  return FALLBACK_RATES;
}

// ============ Provider ============

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [displayCurrency, setDisplayCurrencyState] = useState<DisplayCurrency>(() => {
    try {
      const saved = localStorage.getItem("ivx_display_currency");
      if (saved && SUPPORTED_CURRENCIES.some(c => c.code === saved)) {
        return saved as DisplayCurrency;
      }
    } catch {}
    return "IQD"; // default to Iraqi Dinar
  });

  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const setDisplayCurrency = useCallback((currency: DisplayCurrency) => {
    setDisplayCurrencyState(currency);
    try {
      localStorage.setItem("ivx_display_currency", currency);
    } catch {}
  }, []);

  // Fetch rates on mount
  useEffect(() => {
    fetchExchangeRates().then((fetchedRates) => {
      setRates(fetchedRates);
      setRatesLoading(false);
      setLastUpdated(new Date());
    });

    // Refresh rates every hour
    const interval = setInterval(() => {
      // Clear cache to force refresh
      try { localStorage.removeItem(CACHE_KEY); } catch {}
      fetchExchangeRates().then((fetchedRates) => {
        setRates(fetchedRates);
        setLastUpdated(new Date());
      });
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, []);

  const convertPrice = useCallback((amount: number, sourceCurrency: Currency): number => {
    if (!amount || isNaN(amount)) return 0;

    // Source currency rate (from USD)
    const sourceRate = rates[sourceCurrency] || 1;
    // Target currency rate (from USD)
    const targetRate = rates[displayCurrency] || 1;

    // Convert: source → USD → target
    const usdAmount = amount / sourceRate;
    const converted = usdAmount * targetRate;

    // Smart rounding based on currency
    if (displayCurrency === "IQD" || displayCurrency === "EGP") {
      return Math.round(converted); // No decimals for large-unit currencies
    }
    if (displayCurrency === "KWD" || displayCurrency === "BHD" || displayCurrency === "OMR") {
      return Math.round(converted * 1000) / 1000; // 3 decimal places
    }
    return Math.round(converted * 100) / 100; // 2 decimals for most
  }, [rates, displayCurrency]);

  const currentCurrencyInfo = useMemo(() => {
    return SUPPORTED_CURRENCIES.find(c => c.code === displayCurrency) || SUPPORTED_CURRENCIES[0];
  }, [displayCurrency]);

  const formatConvertedPrice = useCallback((amount: number, sourceCurrency: Currency): string => {
    const converted = convertPrice(amount, sourceCurrency);
    if (converted === 0) return "";

    // Format with commas
    const parts = converted.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const formatted = parts.join(".");

    const info = SUPPORTED_CURRENCIES.find(c => c.code === displayCurrency);
    if (!info) return formatted;

    // Position symbol correctly based on currency
    if (["USD", "EUR", "GBP"].includes(displayCurrency)) {
      return `${info.symbol}${formatted}`;
    }
    return `${formatted} ${info.symbol}`;
  }, [convertPrice, displayCurrency]);

  const value = useMemo<CurrencyContextType>(() => ({
    displayCurrency,
    setDisplayCurrency,
    rates,
    ratesLoading,
    lastUpdated,
    convertPrice,
    formatConvertedPrice,
    currentCurrencyInfo,
  }), [displayCurrency, setDisplayCurrency, rates, ratesLoading, lastUpdated, convertPrice, formatConvertedPrice, currentCurrencyInfo]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}
