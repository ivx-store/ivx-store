import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PageHero } from "../components/PageHero";
import { PageLayout } from "../components/PageLayout";
import { OrderModal } from "../components/OrderModal";
import { Filter, Loader2 } from "lucide-react";
import { ServiceData, getServices, formatDisplayPrice } from "../lib/firebase";

export function ServicesPage() {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);

  useEffect(() => {
    getServices().then((data) => {
      setServices(data);
      setLoading(false);
    }).catch((err) => {
      console.error("Error loading services:", err);
      setLoading(false);
    });
  }, []);

  // Build categories dynamically from service types
  const categories = [
    { id: "all", name: "الكل" },
    ...Array.from(new Set(services.map((s) => s.type).filter(Boolean))).map((type) => ({
      id: type,
      name: type,
    })),
  ];

  const filteredServices = activeCategory === "all"
    ? services
    : services.filter((s) => s.type === activeCategory);

  const handleOrder = (service: ServiceData) => {
    setSelectedService(service);
    setIsModalOpen(true);
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
          {/* Filter Tabs */}
          {categories.length > 1 && (
            <div className="mb-10 md:mb-14">
              <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  const count = cat.id === "all" ? services.length : services.filter((s) => s.type === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 md:px-6 md:py-3 rounded-full font-arabic font-bold text-xs md:text-sm transition-all duration-300 border ${
                        isActive
                          ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                          : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20"
                      }`}
                    >
                      {cat.id === "all" && <Filter className="w-4 h-4" />}
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
                layout
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredServices.map((service) => (
                    <motion.div
                      key={service.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gray-900/40 border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden hover:border-white/30 transition-all duration-500 group flex flex-col"
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
                              {formatDisplayPrice(service.price, service.currency)}
                            </span>
                          </div>
                        )}

                        <button
                          onClick={() => handleOrder(service)}
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
              {filteredServices.length === 0 && (
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
      />
    </PageLayout>
  );
}
