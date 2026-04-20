import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Heart } from "lucide-react";
import { OrderModal } from "./OrderModal";
import { ServiceDetailsModal } from "./ServiceDetailsModal";
import { ServiceData, getServices } from "../lib/firebase";
import { useCurrency } from "../lib/CurrencyContext";

export function OurServices() {
  const { formatConvertedPrice } = useCurrency();
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("ivx_fav_services") || "[]"); } catch { return []; }
  });

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem("ivx_fav_services", JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    getServices()
      .then((data) => {
        // Show last 4 added services (sorted by createdAt desc)
        const sorted = [...data].sort((a, b) => {
          const ta = a.createdAt?.toDate?.()?.getTime?.() || 0;
          const tb = b.createdAt?.toDate?.()?.getTime?.() || 0;
          return tb - ta;
        });
        setServices(sorted.slice(0, 4));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading services:", err);
        setLoading(false);
      });
  }, []);

  const handleOrder = (service: ServiceData) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleDetails = (service: ServiceData) => {
    setSelectedService(service);
    setDetailsModalOpen(true);
  };

  if (!loading && services.length === 0) return null;

  return (
    <section className="py-24 relative z-10 bg-black/50 border-t border-white/5" id="our-services">
      <div className="container mx-auto px-8">
        <div className="text-center mb-16" dir="rtl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "200px" }}
            className="text-4xl md:text-5xl font-arabic font-black text-white mb-6 tracking-tight"
          >
            خدماتنا
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "200px" }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400 font-arabic max-w-2xl mx-auto font-medium leading-relaxed"
          >
            تصفح قائمة خدماتنا واطلب ما تحتاجه بضغطة زر. نحن هنا لنقدم لك الأفضل.
          </motion.p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8" dir="rtl">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-900/40 border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden animate-pulse">
                <div className="h-32 md:h-56 bg-gray-800/50" />
                <div className="p-4 md:p-8 space-y-3">
                  <div className="h-5 bg-gray-800/50 rounded w-3/4" />
                  <div className="h-3 bg-gray-800/30 rounded w-full" />
                  <div className="h-3 bg-gray-800/30 rounded w-1/2" />
                  <div className="h-10 bg-gray-800/50 rounded-xl mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8" dir="rtl">
            {services.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "100px" }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                onClick={() => handleDetails(service)}
                className="bg-gray-900/40 border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden hover:border-white/30 transition-all duration-500 group flex flex-col cursor-pointer"
              >
                <div className="h-32 md:h-56 overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                  {service.type && (
                    <div className="absolute top-2 right-2 md:top-3 md:right-3 z-20">
                      <span className="bg-black/70 backdrop-blur-sm text-white text-[9px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1 rounded-full border border-white/10">
                        {service.type}
                      </span>
                    </div>
                  )}
                  {/* Heart / Favorite — BOTTOM LEFT */}
                  <button
                    onClick={(e) => toggleFavorite(service.id!, e)}
                    className={`absolute bottom-2 left-2 md:bottom-3 md:left-3 z-20 w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-all duration-300 ${favorites.includes(service.id!) ? 'bg-red-500/90 text-white scale-110 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-black/50 backdrop-blur-sm text-white/60 hover:text-red-400 hover:bg-black/70 border border-white/10'}`}
                  >
                    <Heart size={14} className={`md:w-4 md:h-4 transition-transform duration-300 ${favorites.includes(service.id!) ? 'fill-current animate-[heartPulse_0.3s_ease]' : ''}`} />
                  </button>
                  {service.imageUrl ? (
                    <img
                      src={service.imageUrl}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800/50 to-gray-900/50 flex items-center justify-center">
                      <span className="text-4xl">🎮</span>
                    </div>
                  )}
                </div>
                <div className="p-4 md:p-8 flex flex-col flex-grow">
                  <h3 className="text-sm md:text-2xl font-arabic font-bold text-white mb-2 md:mb-3 group-hover:text-gray-200 transition-colors line-clamp-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-400 font-arabic text-xs md:text-sm leading-relaxed mb-4 md:mb-8 flex-grow line-clamp-3">
                    {service.description}
                  </p>
                  {service.price && (
                    <div className="mb-3 md:mb-4">
                      <span className="text-sm md:text-lg font-black text-white">
                        {formatConvertedPrice(parseFloat(service.price) || 0, service.currency)}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleOrder(service); }}
                    className="w-full py-2 md:py-3.5 bg-white text-black font-arabic font-bold rounded-lg md:rounded-xl hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-xs md:text-base"
                  >
                    اطلب الآن
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* View All Services Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12 md:mt-16"
        >
          <Link
            to="/services"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-arabic font-bold text-base md:text-lg hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 group"
          >
            <span>عرض كل الخدمات</span>
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>

      <OrderModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedService(null); }}
        selectedItem={selectedService?.title || ""}
        formFields={selectedService?.orderFormFields}
        itemType="service"
        basePrice={selectedService?.price ? parseFloat(selectedService.price) : undefined}
        baseCurrency={selectedService?.currency}
      />

      <ServiceDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => { setDetailsModalOpen(false); setSelectedService(null); }}
        service={selectedService}
        isFavorite={selectedService ? favorites.includes(selectedService.id!) : false}
        toggleFavorite={toggleFavorite}
        onOrder={() => {
          setDetailsModalOpen(false);
          setIsModalOpen(true);
        }}
      />
    </section>
  );
}
