import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, ShoppingCart, Users, Trophy, MousePointerClick, Sparkles, ArrowLeft } from 'lucide-react';
import { useDevicePerformance } from '../lib/useDevicePerformance';

const initialCards = [
  {
    id: 'who-we-are',
    title: "من نحن؟",
    subtitle: "متجر ivx للألعاب",
    text: "متجرنا هو حلم كل كيمر، نوفر لك كل ما تحتاجه من اشتراكات، ألعاب، وحسابات بأفضل الأسعار وأعلى جودة.",
    icon: Gamepad2,
    gradient: "from-gray-800 to-black",
    shadow: "shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
  },
  {
    id: 'services',
    title: "خدماتنا",
    subtitle: "اشتراكات وألعاب",
    text: "نوفر اشتراكات بلس، جيم باس، وألعاب بأسعار خيالية تناسب الجميع، بالإضافة إلى خدمات شحن الأرصدة.",
    icon: ShoppingCart,
    gradient: "from-gray-700 to-gray-900",
    shadow: "shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
  },
  {
    id: 'deals',
    title: "تعاملنا",
    subtitle: "جملة ومفرد",
    text: "نتعامل بالجملة والمفرد لنلبي احتياجات الأفراد والمتاجر بأفضل الأسعار التنافسية في السوق العراقي.",
    icon: Users,
    gradient: "from-gray-600 to-gray-800",
    shadow: "shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
  },
  {
    id: 'goals',
    title: "هدفنا",
    subtitle: "رضا اللاعبين",
    text: "نسعى دائماً لتوفير أفضل الخدمات والدعم الفني لضمان تجربة لعب لا تُنسى لجميع عملائنا.",
    icon: Trophy,
    gradient: "from-gray-900 to-black",
    shadow: "shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
  }
];

export function AboutUs() {
  const { isLowEnd } = useDevicePerformance();
  const navigate = useNavigate();
  // Add a uniqueId to each card so AnimatePresence can track entering/exiting cards properly
  const [cards, setCards] = useState(initialCards.map(c => ({ ...c, uniqueId: c.id + '-init' })));

  const handleNext = () => {
    setCards((prev) => {
      const newCards = [...prev];
      const topCard = newCards.shift(); // Remove the top card
      if (topCard) {
        // Add it to the back with a new unique ID to trigger enter animation
        newCards.push({ ...topCard, uniqueId: topCard.id + '-' + Date.now() });
      }
      return newCards;
    });
  };

  const activeCard = cards[0];
  const activeOriginalIndex = initialCards.findIndex(c => c.id === activeCard.id);

  return (
    <section className="py-16 md:py-32 relative bg-black overflow-hidden content-auto" dir="rtl">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:24px_24px]"></div>
        {!isLowEnd && (
          <>
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-[120px]"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gray-500/5 blur-[120px]"></div>
          </>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-5 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-8 items-center">

          {/* Right Side: Interactive Cards Stack (First in RTL) */}
          <div className="order-1 flex justify-center items-center min-h-[380px] md:min-h-[550px] relative">
            <div className="relative w-[85%] max-w-[260px] md:max-w-[380px] aspect-[3/4]">
              
              {/* Tooltip */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
                className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center gap-2 text-black bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full shadow-xl border border-gray-100 whitespace-nowrap z-50 pointer-events-none"
              >
                <MousePointerClick className="w-5 h-5 text-black" />
                <span className="text-sm font-bold">انقر على البطاقة للتالي</span>
              </motion.div>

              <AnimatePresence>
                {cards.map((card, index) => {
                  const isTop = index === 0;
                  const Icon = card.icon;

                  return (
                    <motion.div
                      key={card.uniqueId}
                      layout
                      initial={{ scale: 0.6, opacity: 0, y: 100 }}
                      animate={{
                        scale: 1 - index * 0.06,
                        y: index * 24,
                        rotate: index % 2 === 0 ? index * 2 : -index * 2,
                        opacity: 1 - index * 0.15,
                        zIndex: cards.length - index,
                      }}
                      exit={{ 
                        x: 300, 
                        y: -100, 
                        opacity: 0, 
                        rotate: 30, 
                        scale: 0.8, 
                        transition: { duration: 0.4, ease: "easeOut" } 
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      onClick={isTop ? handleNext : undefined}
                      whileHover={isTop ? { scale: 1.02, y: -5 } : {}}
                      whileTap={isTop ? { scale: 0.95 } : {}}
                      className={`absolute inset-0 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 text-white ${isTop ? 'cursor-pointer' : ''} flex flex-col justify-between bg-gradient-to-br ${card.gradient} ${isTop ? card.shadow : ''} border border-white/20 md:backdrop-blur-md overflow-hidden transform-gpu will-change-transform`}
                    >
                      <div className="flex justify-between items-start relative z-10">
                        <div className="w-12 h-12 md:w-20 md:h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                          <Icon className="w-6 h-6 md:w-10 md:h-10 text-white" />
                        </div>
                        <span className="text-5xl md:text-7xl font-black text-white/20 select-none">
                          0{initialCards.findIndex(c => c.id === card.id) + 1}
                        </span>
                      </div>

                      <div className="relative z-10 mt-auto pb-16 md:pb-0">
                        <h3 className="text-2xl md:text-4xl font-bold mb-2 md:mb-2 text-white">{card.title}</h3>
                        <p className="text-white/90 font-medium text-base md:text-lg mb-3 md:mb-0">{card.subtitle}</p>
                        <p className="text-white/80 text-sm leading-relaxed md:hidden">{card.text}</p>
                      </div>

                      {/* Decorative elements inside card */}
                      {!isLowEnd && (
                        <>
                          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                          <div className="absolute -top-24 -left-24 w-48 h-48 bg-black/50 rounded-full blur-2xl pointer-events-none"></div>
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Left Side: Dynamic Text Content (Second in RTL) */}
          <div className="order-2 flex flex-col justify-center">
            <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white w-fit">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-bold">اكتشف عالمنا</span>
            </div>

            <div className="flex items-center gap-4 mb-10">
              <div className="flex gap-2">
                {initialCards.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      idx === activeOriginalIndex ? 'w-12 bg-white' : 'w-3 bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-400 font-mono font-bold text-lg">
                {String(activeOriginalIndex + 1).padStart(2, '0')}
                <span className="text-gray-500 mx-1">/</span>
                {String(initialCards.length).padStart(2, '0')}
              </span>
            </div>

            <div className="relative min-h-[220px] md:min-h-[250px] hidden md:block">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCard.id}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
                    exit: { opacity: 0, transition: { duration: 0.2 } }
                  }}
                  className="absolute inset-0"
                >
                  <motion.h2
                    variants={{
                      hidden: { opacity: 0, y: 20, filter: isLowEnd ? 'none' : 'blur(8px)' },
                      visible: { opacity: 1, y: 0, filter: isLowEnd ? 'none' : 'blur(0px)' },
                      exit: { opacity: 0, y: -20, filter: isLowEnd ? 'none' : 'blur(8px)' }
                    }}
                    className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 md:mb-6 leading-tight"
                  >
                    {activeCard.title}
                  </motion.h2>
                  
                  <motion.h3
                    variants={{
                      hidden: { opacity: 0, y: 20, filter: isLowEnd ? 'none' : 'blur(8px)' },
                      visible: { opacity: 1, y: 0, filter: isLowEnd ? 'none' : 'blur(0px)' },
                      exit: { opacity: 0, y: -20, filter: isLowEnd ? 'none' : 'blur(8px)' }
                    }}
                    className="text-xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-200 mb-4 md:mb-6"
                  >
                    {activeCard.subtitle}
                  </motion.h3>
                  
                  <motion.p
                    variants={{
                      hidden: { opacity: 0, y: 20, filter: isLowEnd ? 'none' : 'blur(8px)' },
                      visible: { opacity: 1, y: 0, filter: isLowEnd ? 'none' : 'blur(0px)' },
                      exit: { opacity: 0, y: -20, filter: isLowEnd ? 'none' : 'blur(8px)' }
                    }}
                    className="text-base md:text-xl text-gray-400 leading-relaxed font-medium max-w-xl"
                  >
                    {activeCard.text}
                  </motion.p>
                </motion.div>
              </AnimatePresence>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 md:mt-12"
            >
              <button 
                onClick={() => navigate('/contact')}
                className="px-6 py-3 md:px-8 md:py-4 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition-colors duration-300 flex items-center gap-3 group text-sm md:text-base"
              >
                <span>تواصل معنا الآن</span>
                <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center group-hover:-translate-x-1 transition-transform">
                  <ArrowLeft className="w-4 h-4" />
                </div>
              </button>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
}
