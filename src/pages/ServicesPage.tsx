import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "react-router-dom";
import { PageHero } from "../components/PageHero";
import { PageLayout } from "../components/PageLayout";
import { OrderModal } from "../components/OrderModal";
import { ServiceDetailsModal } from "../components/ServiceDetailsModal";
import { Filter, Loader2, Search, Heart, ShoppingCart, Check, ChevronDown, Monitor } from "lucide-react";
import { ServiceData, getServices, getServiceTypes, getPlatformTypes, addToCart } from "../lib/firebase";
import { useCurrency } from "../lib/CurrencyContext";
import { useAuth } from "../lib/AuthContext";

export function ServicesPage() {
  const location = useLocation();
  const { formatConvertedPrice } = useCurrency();
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceData[]>([]);
  const [adminCats, setAdminCats] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>(location.state?.activeTab || "all");
  const [activePlatform, setActivePlatform] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);
  const [cartLoading, setCartLoading] = useState<string | null>(null);
  const [cartToast, setCartToast] = useState<string>("");

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
    Promise.all([getServices(), getServiceTypes(), getPlatformTypes()]).then(([data, types, plats]) => {
      setServices(data);
      setAdminCats(types);
      setPlatforms(plats);
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

  let filteredServices = activeCategory === "all"
    ? services
    : activeCategory === "favorites"
      ? services.filter((s) => favorites.includes(s.id!))
      : services.filter((s) => s.type === activeCategory);

  // Platform filter
  if (activePlatform !== "all") {
    filteredServices = filteredServices.filter(s => s.platform === activePlatform);
  }

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

  const showToast = (msg: string) => {
    setCartToast(msg);
    setTimeout(() => setCartToast(""), 3000);
  };

  const handleAddToCart = async (service: ServiceData, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      showToast("⚠️ يرجى تسجيل الدخول أولاً لإضافة المنتج للسلة");
      return;
    }
    if (!service.id) return;
    if (cartLoading) return; // prevent double-click
    setCartLoading(service.id);
    try {
      await addToCart(user.uid, {
        serviceId: service.id,
        serviceTitle: service.title,
        serviceImage: service.imageUrl || "",
        servicePrice: parseFloat(service.price) || 0,
        serviceCurrency: service.currency,
        serviceType: service.type || "",
        platform: service.platform || "",
        quantity: 1,
      });
      setAddedToCart(service.id);
      showToast("✅ تمت الإضافة إلى السلة");
      setTimeout(() => setAddedToCart(null), 2000);
    } catch (err) {
      console.error("Error adding to cart:", err);
      showToast("❌ حدث خطأ أثناء الإضافة للسلة");
    }
    setCartLoading(null);
  };

  // Close platform dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.platform-dropdown-wrapper')) {
        setShowPlatformDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
          {/* Search Bar + Platform Filter */}
          <div className="mb-6 md:mb-10 max-w-2xl mx-auto flex gap-3 items-stretch">
            <div className="relative group flex-1">
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

            {/* Platform Dropdown */}
            {platforms.length > 0 && (
              <div className="relative platform-dropdown-wrapper">
                <button
                  onClick={() => setShowPlatformDropdown(!showPlatformDropdown)}
                  className={`h-full px-4 bg-white/5 border rounded-2xl flex items-center gap-2 text-sm font-bold font-arabic transition-all ${activePlatform !== "all"
                      ? "border-blue-500/30 text-blue-400 bg-blue-500/5"
                      : "border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                    }`}
                >
                  <Monitor size={16} />
                  <span className="hidden sm:inline">{activePlatform === "all" ? "المنصة" : activePlatform}</span>
                  <ChevronDown size={14} className={`transition-transform ${showPlatformDropdown ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {showPlatformDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full mt-2 left-0 right-0 min-w-[160px] bg-[#111] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                      <button
                        onClick={() => { setActivePlatform("all"); setShowPlatformDropdown(false); }}
                        className={`w-full px-4 py-3 text-right text-sm font-bold font-arabic flex items-center justify-between transition-all ${activePlatform === "all" ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                          }`}
                      >
                        <span>جميع المنصات</span>
                        {activePlatform === "all" && <Check size={14} className="text-blue-400" />}
                      </button>
                      {platforms.map(plat => (
                        <button
                          key={plat}
                          onClick={() => { setActivePlatform(plat); setShowPlatformDropdown(false); }}
                          className={`w-full px-4 py-3 text-right text-sm font-bold font-arabic flex items-center justify-between transition-all border-t border-white/5 ${activePlatform === plat ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                          <span>{plat}</span>
                          {activePlatform === plat && <Check size={14} className="text-blue-400" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
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
                        {/* Platform Badge */}
                        {service.platform && (
                          <div className="absolute top-2 left-2 md:top-3 md:left-3 z-20">
                            <span className="bg-blue-500/80 backdrop-blur-sm text-white text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-md border border-blue-400/30">
                              {service.platform}
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

                        {/* Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => handleOrder(service, e)}
                            className="flex-1 py-2 md:py-3 bg-white text-black font-arabic font-bold rounded-lg md:rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all duration-300 text-xs md:text-sm"
                          >
                            اطلب الآن
                          </button>
                          <button
                            onClick={(e) => handleAddToCart(service, e)}
                            disabled={cartLoading === service.id}
                            className={`w-10 md:w-12 py-2 md:py-3 rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-300 ${addedToCart === service.id
                                ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                                : cartLoading === service.id
                                  ? "bg-white/5 border border-white/10 text-gray-500"
                                  : "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
                              }`}
                            title="أضف للسلة"
                          >
                            {cartLoading === service.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : addedToCart === service.id ? (
                              <Check size={16} />
                            ) : (
                              <ShoppingCart size={14} className="md:w-4 md:h-4" />
                            )}
                          </button>
                        </div>
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

      {/* Cart Toast */}
      <AnimatePresence>
        {cartToast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 bg-[#111] border border-white/10 rounded-2xl shadow-2xl text-white text-sm font-arabic font-bold backdrop-blur-xl"
            dir="rtl"
          >
            {cartToast}
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
