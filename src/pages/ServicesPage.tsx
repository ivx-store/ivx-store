import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "react-router-dom";
import { PageHero } from "../components/PageHero";
import { PageLayout } from "../components/PageLayout";
import { OrderModal } from "../components/OrderModal";
import { ServiceDetailsModal } from "../components/ServiceDetailsModal";
import { Filter, Loader2, Search } from "lucide-react";
import { ServiceData, getServices, getServiceTypes } from "../lib/firebase";
import { useCurrency } from "../lib/CurrencyContext";
import { Heart } from "lucide-react";

export function ServicesPage() {
  const location = useLocation();
  const { formatConvertedPrice } = useCurrency();
  const [services, setServices] = useState<ServiceData[]>([]);
  const [adminCats, setAdminCats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>(location.state?.activeTab || "all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveCategory(location.state.activeTab);
    }
  }, [location.state?.activeTab]);

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
    Promise.all([getServices(), getServiceTypes()]).then(([data, types]) => {
      setServices(data);
      setAdminCats(types);
      setLoading(false);
    }).catch((err) => {
      console.error("Error loading services:", err);
      setLoading(false);
    });
  }, []);

  // Build categories dynamically from admin settings
  const categories = [
    { id: "all", name: "الكل" },
    { id: "favorites", name: "المفضلة" },
    ...adminCats.map((type) => ({
      id: type,
      name: type,
    })),
  ];

  const filteredServices = activeCategory === "all"
    ? services
    : activeCategory === "favorites"
      ? services.filter((s) => favorites.includes(s.id!))
      : services.filter((s) => s.type === activeCategory);

  const searchedServices = filteredServices.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOrder = (service: ServiceData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleDetails = (service: ServiceData) => {
    setSelectedService(service);
    setDetailsModalOpen(true);
  };

  return (
    <PageLayout>
      <PageHero
        badge="🎮 جميع الخدمات"
        title="خدماتنا"
        highlight="ومنتجاتنا"
        description="تصفح جميع خدماتنا ومنتجاتنا الرقمية واختر ما يناسبك. نحن هنا لنقدم لك الأفضل بأفضل الأسعار."
      />

      <section className="pb-24 md:pb-32 relative z-10" dir="rtl">
        <div className="container mx-auto px-5 md:px-8">
          {/* Search Bar */}
          <div className="mb-6 md:mb-10 max-w-xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-white transition-colors" />
              </div>
              <input
                type="text"
                placeholder="ابحث عن خدمة، لعبة، أو اشتراك..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 md:py-4 pl-4 pr-12 text-white font-arabic placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all font-medium text-sm md:text-base outline-none"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          {categories.length > 1 && (
            <div className="mb-8 md:mb-14 relative w-full">
              {/* Fade masks for elegant mobile scrolling */}
              <div className="absolute top-0 -right-5 bottom-0 w-12 bg-gradient-to-l from-black via-black/80 to-transparent z-10 md:hidden pointer-events-none" />
              <div className="absolute top-0 -left-5 bottom-0 w-12 bg-gradient-to-r from-black via-black/80 to-transparent z-10 md:hidden pointer-events-none" />

              <div className="flex overflow-x-auto md:flex-wrap justify-start md:justify-center gap-2 md:gap-3 snap-x scroll-smooth pb-4 -mx-5 px-5 md:mx-0 md:px-0 md:pb-0 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {categories.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  let count = 0;
                  if (cat.id === "all") count = services.length;
                  else if (cat.id === "favorites") count = services.filter((s) => favorites.includes(s.id!)).length;
                  else count = services.filter((s) => s.type === cat.id).length;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex-shrink-0 snap-start flex items-center gap-2 px-4 py-2.5 md:px-6 md:py-3 rounded-full font-arabic font-bold text-xs md:text-sm transition-all duration-300 border ${isActive
                          ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                          : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20"
                        }`}
                    >
                      {cat.id === "all" && <Filter className="w-4 h-4" />}
                      {cat.id === "favorites" && <Heart className={`w-4 h-4 ${isActive ? 'fill-current' : ''}`} />}
                      <span>{cat.name}</span>
                      {isActive && (
                        <span className="bg-black/20 text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-gray-900/40 border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden animate-pulse">
                  <div className="h-32 md:h-48 bg-gray-800/50" />
                  <div className="p-4 md:p-6 space-y-3">
                    <div className="h-4 bg-gray-800/50 rounded w-3/4" />
                    <div className="h-3 bg-gray-800/30 rounded w-full" />
                    <div className="h-3 bg-gray-800/30 rounded w-1/2" />
                    <div className="h-5 bg-gray-800/50 rounded w-1/3 mt-2" />
                    <div className="h-10 bg-gray-800/50 rounded-xl mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Services Grid */}
              <motion.div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
              >
                <AnimatePresence mode="sync">
                  {searchedServices.map((service) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      onClick={() => handleDetails(service)}
                      className="bg-gray-900/40 border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden hover:border-white/30 transition-all duration-500 group flex flex-col cursor-pointer"
                    >
                      {/* Image */}
                      <div className="h-32 md:h-48 overflow-hidden relative">
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                        {/* Tag */}
                        {service.type && (
                          <div className="absolute top-2 right-2 md:top-3 md:right-3 z-20">
                            <span className="bg-black/70 backdrop-blur-sm text-white text-[9px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1 rounded-full border border-white/10">
                              {service.type}
                            </span>
                          </div>
                        )}
                        {/* Heart / Favorite */}
                        <button
                          onClick={(e) => toggleFavorite(service.id!, e)}
                          className={`absolute top-2 left-2 md:top-3 md:left-3 z-20 w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-all duration-300 ${favorites.includes(service.id!) ? 'bg-red-500/90 text-white scale-110 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-black/50 backdrop-blur-sm text-white/60 hover:text-red-400 hover:bg-black/70 border border-white/10'}`}
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

                      {/* Content */}
                      <div className="p-4 md:p-6 flex flex-col flex-grow">
                        <h3 className="text-sm md:text-lg font-arabic font-bold text-white mb-1.5 md:mb-2 group-hover:text-gray-200 transition-colors line-clamp-2">
                          {service.title}
                        </h3>
                        <p className="text-gray-400 font-arabic text-[10px] md:text-sm leading-relaxed mb-3 md:mb-5 flex-grow line-clamp-2 md:line-clamp-3">
                          {service.description}
                        </p>

                        {/* Price */}
                        {service.price && (
                          <div className="mb-3 md:mb-4">
                            <span className="text-sm md:text-lg font-black text-white">
                              {formatConvertedPrice(parseFloat(service.price) || 0, service.currency)}
                            </span>
                          </div>
                        )}

                        <button
                          onClick={(e) => handleOrder(service, e)}
                          className="w-full py-2 md:py-3 bg-white text-black font-arabic font-bold rounded-lg md:rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all duration-300 text-xs md:text-sm"
                        >
                          اطلب الآن
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Empty State */}
              {searchedServices.length === 0 && (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-gray-400 font-arabic text-lg font-medium">لا توجد خدمات في هذا القسم حالياً</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

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
          // Close details first, then open order — keep selectedService intact
          setDetailsModalOpen(false);
          setIsModalOpen(true);
        }}
      />
    </PageLayout>
  );
}
