import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Clock, Flame, ArrowLeft, Percent, Sparkles } from "lucide-react";
import { OrderModal } from "./OrderModal";
import { OfferData, getActiveOffers } from "../lib/firebase";

function CountdownTimer({ days, hours, minutes }: { days: number; hours: number; minutes: number }) {
  const [time, setTime] = useState({ d: days, h: hours, m: minutes, s: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        let { d, h, m, s } = prev;
        if (s > 0) { s--; }
        else if (m > 0) { m--; s = 59; }
        else if (h > 0) { h--; m = 59; s = 59; }
        else if (d > 0) { d--; h = 23; m = 59; s = 59; }
        return { d, h, m, s };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const blocks = [
    ...(time.d > 0 ? [{ value: time.d, label: "يوم" }] : []),
    { value: time.h, label: "ساعة" },
    { value: time.m, label: "دقيقة" },
    { value: time.s, label: "ثانية" },
  ];

  return (
    <div className="flex items-center gap-2" dir="rtl">
      {blocks.map((block, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <span className="bg-white/10 backdrop-blur-sm px-2.5 py-1.5 rounded-lg text-sm font-mono font-black text-white min-w-[36px] text-center border border-white/5">
              {String(block.value).padStart(2, "0")}
            </span>
            <span className="text-[9px] text-gray-500 font-bold mt-1">{block.label}</span>
          </div>
          {i < blocks.length - 1 && <span className="text-gray-600 text-sm font-bold mb-4">:</span>}
        </div>
      ))}
    </div>
  );
}

export function OffersSection() {
  const [offers, setOffers] = useState<OfferData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<OfferData | null>(null);

  useEffect(() => {
    getActiveOffers().then((data) => {
      console.log("Active offers loaded:", data.length);
      setOffers(data);
      setLoading(false);
    }).catch((err) => {
      console.error("Error loading active offers:", err);
      setLoading(false);
    });
  }, []);

  const handleOrder = (offer: OfferData) => {
    setSelectedOffer(offer);
    setIsModalOpen(true);
  };

  // Don't render if no active offers
  if (!loading && offers.length === 0) return null;

  return (
    <section className="py-20 md:py-28 relative z-10 bg-black overflow-hidden" id="offers">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(239,68,68,0.05)_0%,transparent_50%)]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(245,158,11,0.05)_0%,transparent_50%)]" />
      </div>

      <div className="container mx-auto px-5 md:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-14 md:mb-20" dir="rtl">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-6"
          >
            <Flame className="w-4 h-4" />
            <span className="text-sm font-bold font-arabic">عروض حصرية لا تفوتك</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-arabic font-black text-white mb-5 tracking-tight"
          >
            العروض و<span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400">التخفيضات</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg text-gray-400 font-arabic max-w-2xl mx-auto font-medium leading-relaxed"
          >
            استغل العروض المحدودة واحصل على أفضل المنتجات الرقمية بأسعار لا تُقاوم!
          </motion.p>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto" dir="rtl">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-3xl bg-gray-900/40 border border-white/5 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-800/30" />
                <div className="p-6 space-y-4">
                  <div className="h-5 bg-gray-800/40 rounded-lg w-1/3" />
                  <div className="h-6 bg-gray-800/40 rounded-lg w-3/4" />
                  <div className="h-8 bg-gray-800/40 rounded-lg w-1/2" />
                  <div className="h-12 bg-gray-800/40 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto" dir="rtl">
            {offers.map((offer, idx) => {
              const currencyLabel = offer.currency === "USD" ? "$" : "د.ع";
              const showCountdown = offer.countdownEnabled && ((offer.countdownDays ?? 0) > 0 || (offer.countdownHours ?? 0) > 0 || (offer.countdownMinutes ?? 0) > 0);

              return (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.12 }}
                  className="group relative rounded-3xl bg-[#0d0d0d] border border-white/[0.06] overflow-hidden hover:border-white/[0.12] transition-all duration-500"
                >
                  {/* ── Image Area ── */}
                  <div className="relative h-44 md:h-52 overflow-hidden">
                    {offer.imageUrl ? (
                      <>
                        <img
                          src={offer.imageUrl}
                          alt={offer.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          decoding="async"
                        />
                        {/* Dark overlay for readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/40 to-transparent" />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${offer.badgeColor}15, #0d0d0d)` }}>
                        <Sparkles className="w-10 h-10 text-white/10" />
                      </div>
                    )}

                    {/* Badge — top right */}
                    <div className="absolute top-4 right-4 z-10">
                      <div
                        className="text-white text-[10px] md:text-xs font-black px-3.5 py-1.5 rounded-full shadow-xl flex items-center gap-1.5 backdrop-blur-sm"
                        style={{ background: offer.badgeColor }}
                      >
                        <Percent className="w-3 h-3" />
                        {offer.badge}
                      </div>
                    </div>

                    {/* Discount — top left */}
                    <div className="absolute top-4 left-4 z-10">
                      <div className="bg-black/60 backdrop-blur-md text-white text-lg md:text-xl font-black px-3 py-1 rounded-xl border border-white/10">
                        {offer.discount}%<span className="text-[10px] font-bold text-gray-400 mr-0.5">خصم</span>
                      </div>
                    </div>

                    {/* Category pill — bottom of image */}
                    {offer.category && (
                      <div className="absolute bottom-4 right-4 z-10">
                        <span className="text-[10px] md:text-xs font-bold text-gray-300 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                          {offer.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ── Content ── */}
                  <div className="p-5 md:p-7">
                    {/* Title */}
                    <h3 className="text-lg md:text-xl font-arabic font-black text-white mb-3 leading-snug group-hover:text-gray-100 transition-colors line-clamp-2">
                      {offer.title}
                    </h3>

                    {/* Description (if present) */}
                    {offer.description && (
                      <p className="text-xs md:text-sm text-gray-500 font-arabic mb-4 leading-relaxed line-clamp-2">
                        {offer.description}
                      </p>
                    )}

                    {/* Pricing */}
                    <div className="flex items-end gap-3 mb-5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl md:text-3xl font-black text-white leading-none">
                          {offer.discountedPrice}
                        </span>
                        <span className="text-xs md:text-sm text-gray-500 font-bold">{currencyLabel}</span>
                      </div>
                      {offer.originalPrice && (
                        <div className="flex items-baseline gap-1 pb-0.5">
                          <span className="text-sm text-gray-600 line-through font-medium">
                            {offer.originalPrice}
                          </span>
                          <span className="text-[10px] text-gray-700">{currencyLabel}</span>
                        </div>
                      )}
                    </div>

                    {/* Countdown Timer */}
                    {showCountdown && (
                      <div className="mb-5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <Clock className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-[11px] text-gray-500 font-bold font-arabic">ينتهي العرض خلال</span>
                        </div>
                        <CountdownTimer
                          days={offer.countdownDays ?? 0}
                          hours={offer.countdownHours ?? 0}
                          minutes={offer.countdownMinutes ?? 0}
                        />
                      </div>
                    )}

                    {/* CTA */}
                    <button
                      onClick={() => handleOrder(offer)}
                      className="w-full py-3.5 bg-white text-black font-arabic font-black rounded-xl hover:bg-gray-100 active:scale-[0.98] transition-all duration-300 text-sm md:text-base flex items-center justify-center gap-2.5 group/btn shadow-[0_4px_20px_rgba(255,255,255,0.06)]"
                    >
                      <span>اطلب العرض</span>
                      <ArrowLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform duration-300" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <OrderModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedOffer(null); }}
        selectedItem={selectedOffer?.title || ""}
        formFields={selectedOffer?.orderFormFields}
        itemType="offer"
      />
    </section>
  );
}
