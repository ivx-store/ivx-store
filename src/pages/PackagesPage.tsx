import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { PageHero } from "../components/PageHero";
import { PageLayout } from "../components/PageLayout";
import { OrderModal } from "../components/OrderModal";
import { CheckCircle2, Sparkles, ArrowLeft } from "lucide-react";
import { PackageData, getPackages, formatDisplayPrice } from "../lib/firebase";

export function PackagesPage() {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageData | null>(null);

  useEffect(() => {
    getPackages().then((data) => {
      setPackages(data);
      setLoading(false);
    }).catch((err) => {
      console.error("Error loading packages:", err);
      setLoading(false);
    });
  }, []);

  const handleOrderClick = (pkg: PackageData) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  return (
    <PageLayout>
      <PageHero
        badge="💰 باقات مميزة"
        title="باقات"
        highlight="المتجر"
        description="اختر الباقة التي تناسب احتياجاتك واستمتع بأفضل الألعاب والاشتراكات بأسعار لا تُقاوم."
      />

      <section className="pb-24 md:pb-32 relative z-10" dir="rtl">
        <div className="container mx-auto px-5 md:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 max-w-5xl mx-auto">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-[2rem] bg-gray-900/40 border border-white/10 p-6 md:p-10 animate-pulse">
                  <div className="h-6 bg-gray-800/50 rounded w-1/2 mb-3" />
                  <div className="h-4 bg-gray-800/30 rounded w-1/3 mb-4" />
                  <div className="h-3 bg-gray-800/30 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-800/30 rounded w-3/4 mb-6" />
                  <div className="h-8 bg-gray-800/50 rounded w-1/3 mb-8" />
                  <div className="h-px bg-gray-800/50 mb-6" />
                  <div className="space-y-3 mb-8">
                    <div className="h-4 bg-gray-800/30 rounded w-2/3" />
                    <div className="h-4 bg-gray-800/30 rounded w-1/2" />
                    <div className="h-4 bg-gray-800/30 rounded w-3/5" />
                  </div>
                  <div className="h-12 bg-gray-800/50 rounded-xl" />
                </div>
              ))}
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-400 font-arabic text-lg font-medium">لا توجد باقات متاحة حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 max-w-5xl mx-auto">
              {packages.map((pkg, idx) => {
                const bgColor = pkg.bgColor || "#000";
                const accentColor = pkg.accentColor || "#ffffff";
                const displayPrice = formatDisplayPrice(pkg.price, pkg.currency);

                return (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="relative group rounded-[2rem] overflow-hidden hover:shadow-[0_20px_60px_rgba(255,255,255,0.06)] transition-all duration-500"
                    style={{
                      background: bgColor,
                      border: `1px solid ${accentColor}25`,
                      boxShadow: `0 0 30px ${accentColor}08`,
                    }}
                  >
                    {/* Popular Badge */}
                    {pkg.popular && (
                      <div className="absolute -top-0 left-1/2 -translate-x-1/2 z-20">
                        <div
                          className="text-xs font-black px-6 py-2 rounded-b-2xl flex items-center gap-2 shadow-lg"
                          style={{
                            background: accentColor,
                            color: bgColor === "#000000" ? "#000" : bgColor,
                            boxShadow: `0 4px 15px ${accentColor}30`,
                          }}
                        >
                          ⭐ الأكثر طلباً
                        </div>
                      </div>
                    )}

                    <div className="p-6 md:p-10">
                      {/* Header */}
                      <div className="mb-6">
                        <h3
                          className="text-xl md:text-2xl font-arabic font-black mb-1"
                          style={{ color: accentColor === "#ffffff" ? "#fff" : accentColor }}
                        >
                          {pkg.title}
                        </h3>
                        <p className="text-xs md:text-sm font-bold text-gray-500 tracking-widest uppercase">
                          {pkg.subtitle}
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-sm md:text-base text-gray-400 font-arabic font-medium leading-relaxed mb-6">
                        {pkg.description}
                      </p>

                      {/* Price */}
                      {displayPrice && (
                        <div className="flex items-baseline gap-2 mb-8">
                          <span className="text-3xl md:text-4xl font-black text-white">{displayPrice}</span>
                        </div>
                      )}

                      {/* Divider */}
                      <div
                        className="w-full h-px mb-6"
                        style={{ background: `linear-gradient(to right, transparent, ${accentColor}20, transparent)` }}
                      />

                      {/* Features */}
                      <div className="space-y-3 md:space-y-4 mb-8">
                        {pkg.features.map((feature, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                              style={{ background: `${accentColor}20` }}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: accentColor }} />
                            </div>
                            <span className="text-sm md:text-base text-gray-300 font-arabic font-medium">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* CTA Button */}
                      <button
                        onClick={() => handleOrderClick(pkg)}
                        className="w-full py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-lg font-arabic transition-all duration-300 flex items-center justify-center gap-2 group/btn hover:-translate-y-0.5"
                        style={{
                          background: accentColor,
                          color: bgColor === "#000000" ? "#000" : bgColor,
                          boxShadow: `0 10px 30px ${accentColor}25`,
                        }}
                      >
                        <span>اطلب الباقة</span>
                        <ArrowLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Bottom CTA */}
          {!loading && packages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-14 md:mt-20"
            >
              <p className="text-gray-400 font-arabic text-sm md:text-base mb-4 font-medium">
                تحتاج باقة مخصصة؟ تواصل معنا وسنصمم لك العرض المناسب!
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white font-arabic font-bold rounded-full hover:bg-white/10 transition-all duration-300 text-sm"
              >
                <Sparkles className="w-4 h-4" />
                تواصل معنا
              </a>
            </motion.div>
          )}
        </div>
      </section>

      <OrderModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedPackage(null); }}
        selectedItem={selectedPackage?.title || ""}
        formFields={selectedPackage?.orderFormFields}
        itemType="package"
      />
    </PageLayout>
  );
}
