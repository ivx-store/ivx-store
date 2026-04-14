import { motion } from "motion/react";
import { Shield, Zap, HeadphonesIcon, BadgeCheck, Truck, CreditCard } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "ضمان 100%",
    description: "جميع منتجاتنا مضمونة بالكامل مع ضمان استبدال فوري.",
  },
  {
    icon: Zap,
    title: "تسليم فوري",
    description: "استلم طلبك في ثوانٍ معدودة بعد إتمام عملية الشراء.",
  },
  {
    icon: HeadphonesIcon,
    title: "دعم على مدار الساعة",
    description: "فريق الدعم متواجد يومياً للإجابة على جميع استفساراتك.",
  },
  {
    icon: BadgeCheck,
    title: "منتجات أصلية",
    description: "نتعامل فقط مع مصادر رسمية لضمان أفضل جودة لعملائنا.",
  },
  {
    icon: Truck,
    title: "أسعار الجملة",
    description: "أسعار تنافسية ومنافسة لأصحاب المتاجر والكميات الكبيرة.",
  },
  {
    icon: CreditCard,
    title: "طرق دفع متعددة",
    description: "ندعم ماستر كارد، زين كاش، آسيا حوالة والمزيد.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-20 md:py-28 relative z-10 overflow-hidden" dir="rtl">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:24px_24px]" />
      </div>

      <div className="container mx-auto px-5 md:px-8 relative z-10">
        <div className="text-center mb-14 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white mb-6"
          >
            <BadgeCheck className="w-4 h-4" />
            <span className="text-sm font-bold">لماذا نحن؟</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-arabic font-black text-white mb-5 tracking-tight"
          >
            لماذا تختار{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-white">ivx</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg text-gray-400 font-arabic max-w-2xl mx-auto font-medium leading-relaxed"
          >
            نحن نسعى لنكون الخيار الأول لكل كيمر في العراق والمنطقة.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="group relative p-5 md:p-8 rounded-2xl md:rounded-3xl bg-gray-900/40 border border-white/5 hover:border-white/20 hover:bg-gray-900/70 transition-all duration-500 text-center"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative z-10">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:bg-white group-hover:border-white transition-all duration-500">
                    <Icon className="w-5 h-5 md:w-7 md:h-7 text-white group-hover:text-black transition-colors duration-500" />
                  </div>
                  <h3 className="text-sm md:text-xl font-arabic font-black text-white mb-2 md:mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-400 font-arabic font-medium leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
