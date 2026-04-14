import { motion } from "motion/react";

const platforms = [
  { name: "PlayStation", logo: "🎮", color: "from-blue-500/20 to-blue-700/10" },
  { name: "Xbox", logo: "🟢", color: "from-green-500/20 to-green-700/10" },
  { name: "Steam", logo: "🎯", color: "from-gray-400/20 to-gray-600/10" },
  { name: "Netflix", logo: "🎬", color: "from-red-500/20 to-red-700/10" },
  { name: "PUBG", logo: "🔫", color: "from-amber-500/20 to-amber-700/10" },
  { name: "Fortnite", logo: "⚡", color: "from-purple-500/20 to-purple-700/10" },
  { name: "ChatGPT", logo: "🤖", color: "from-emerald-500/20 to-emerald-700/10" },
  { name: "Spotify", logo: "🎵", color: "from-green-400/20 to-green-600/10" },
];

export function PartnersSection() {
  // Duplicate for seamless marquee
  const allPlatforms = [...platforms, ...platforms];

  return (
    <section className="py-16 md:py-24 relative z-10 border-t border-b border-white/5 overflow-hidden" dir="rtl">
      <div className="container mx-auto px-5 md:px-8 relative z-10">
        <div className="text-center mb-10 md:mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl font-arabic font-black text-white mb-4 tracking-tight"
          >
            المنصات التي <span className="text-gray-400">نعمل معها</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-sm md:text-base text-gray-400 font-arabic font-medium"
          >
            ندعم جميع المنصات والخدمات الرئيسية لنلبي كل احتياجاتك.
          </motion.p>
        </div>
      </div>

      {/* Marquee */}
      <div className="relative w-full overflow-hidden py-6" dir="ltr">
        <div className="absolute top-0 left-0 w-24 md:w-40 h-full bg-gradient-to-r from-black to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-24 md:w-40 h-full bg-gradient-to-l from-black to-transparent z-20 pointer-events-none" />

        <div className="flex gap-5 md:gap-8 w-max partners-marquee will-change-transform transform-gpu">
          {allPlatforms.map((platform, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 px-6 py-4 md:px-8 md:py-5 rounded-2xl bg-gradient-to-br ${platform.color} border border-white/5 hover:border-white/20 transition-all duration-300 shrink-0 group`}
            >
              <span className="text-2xl md:text-3xl">{platform.logo}</span>
              <span className="text-sm md:text-base font-bold text-white/80 group-hover:text-white transition-colors whitespace-nowrap">
                {platform.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
