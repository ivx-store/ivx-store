import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { IvxLogo } from "./IvxLogo";
import { ShoppingCart, User, LogOut, ShoppingBag, Heart } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { logoutAdmin } from "../lib/firebase";
import { UserAuthModal } from "./UserAuthModal";
import { AccountModal } from "./AccountModal";
import { CartModal } from "./CartModal";
import { FavoritesModal } from "./FavoritesModal";
import { CurrencySwitcher } from "./CurrencySwitcher";
import { CurrencyModal } from "./CurrencyModal";
import { useCurrency } from "../lib/CurrencyContext";

const links = [
  { name: "الرئيسية", path: "/" },
  { name: "خدماتنا", path: "/services" },
  { name: "باقاتنا", path: "/packages" },
  { name: "عملائنا", path: "/clients" },
  { name: "تواصل معنا", path: "/contact" }
];

export function Header() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isCtaHovered, setIsCtaHovered] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentCurrencyInfo } = useCurrency();
  
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [isTop, setIsTop] = useState(true);

  // Responsive: use media query listener instead of window.innerWidth on every render
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    
    if (latest < 50) {
      setIsTop(true);
      setHidden(false);
    } else {
      setIsTop(false);
      if (latest > previous && latest > 150) {
        setHidden(true);
      } else {
        setHidden(false);
      }
    }
  });



  const userInitial = user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || "U";
  const userPhoto = user?.photoURL;

  return (
    <>
      <motion.header 
        dir="rtl"
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: "-150%", opacity: 0 }
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-3 md:top-6 left-0 right-0 z-50 flex justify-center items-center px-3 md:px-4 pointer-events-none transform-gpu will-change-transform"
      >
        {/* Auth Button - Outside pill on the LEFT */}
        <div className="pointer-events-auto hidden md:flex items-center gap-2 ml-3 shrink-0">
          {user ? (
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowAccountModal(true); }}
                className="w-11 h-11 rounded-full overflow-hidden border-2 border-white/20 hover:border-white/50 transition-all duration-300 flex items-center justify-center bg-black/60 backdrop-blur-xl shrink-0 shadow-lg"
              >
                {userPhoto ? (
                  <img src={userPhoto} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-sm font-black text-white">{userInitial}</span>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="h-11 px-5 rounded-full bg-black/60 backdrop-blur-xl border border-white/15 text-white text-sm font-bold font-arabic flex items-center gap-2 hover:bg-black/80 hover:border-white/30 transition-all duration-300 shrink-0 shadow-lg"
            >
              <User size={16} />
              تسجيل الدخول
            </button>
          )}

          {/* Cart Button - Desktop */}
          <button
            onClick={() => setShowCart(true)}
            className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-xl border border-white/15 flex items-center justify-center text-white hover:bg-black/80 hover:border-white/30 transition-all duration-300 shadow-lg"
          >
            <ShoppingBag size={18} />
          </button>
        </div>

        {/* The Dynamic Glass Pill */}
        <div 
          className={`pointer-events-auto flex items-center justify-between md:justify-center w-[95%] md:w-auto gap-2 md:gap-6 p-1.5 md:p-2 rounded-full transition-colors duration-500 ${
            isTop 
              ? "bg-black/90 md:bg-black/50 md:backdrop-blur-xl border border-white/10 shadow-sm" 
              : "bg-black/95 md:bg-black/80 md:backdrop-blur-xl border border-white/20 shadow-lg md:shadow-[0_8px_32px_rgba(255,255,255,0.05)]"
          }`}
        >
          {/* Logo & Mobile CTA Area */}
          <div className="flex items-center gap-2">
            <Link to="/">
              <div 
                className="flex items-center gap-2 cursor-pointer h-10 md:h-12 pr-1 md:pr-3"
                onMouseEnter={() => setIsLogoHovered(true)}
                onMouseLeave={() => setIsLogoHovered(false)}
              >
                <div className="flex items-center justify-center">
                  <IvxLogo className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                <AnimatePresence mode="wait">
                  {isLogoHovered && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden whitespace-nowrap flex items-center hidden sm:flex"
                    >
                      <span className="text-lg md:text-xl font-black tracking-widest text-white pl-2 pr-1 pt-1" dir="ltr">ivx</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Link>

            {/* Mobile CTA (اطلب الآن) Next to Logo */}
            <Link to="/services" className="md:hidden flex-1 mr-1.5 ml-1">
              <span className="flex items-center justify-center gap-1.5 h-10 w-full px-4 rounded-full bg-white text-black text-xs font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform">
                <ShoppingCart size={14} />
                <span className="whitespace-nowrap">اطلب الآن</span>
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link, index) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`relative px-5 py-2 text-sm font-bold tracking-wider transition-colors z-10 ${
                    isActive ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {hoveredIndex === index && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white/10 rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Currency Switcher - Desktop (inside pill, left of CTA) */}
          <div className="hidden md:block">
            <CurrencySwitcher />
          </div>

          {/* Right Section: Mobile Auth + Cart + Heart + Desktop CTA */}
          <div className="flex items-center gap-1.5 md:gap-2">
            
            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-1">
              {/* Mobile Currency Switcher */}
              <button
                onClick={() => setShowCurrencyModal(true)}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                style={{ backdropFilter: "blur(10px)" }}
              >
                <span className="text-xl filter drop-shadow-sm leading-none m-0 p-0" style={{ transform: "translateY(1px)" }}>
                  {currentCurrencyInfo.flag}
                </span>
              </button>

              {/* Mobile Heart */}
              <button
                onClick={() => setShowFavorites(true)}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                style={{ backdropFilter: "blur(10px)" }}
              >
                <Heart size={16} />
              </button>

              {/* Mobile Cart */}
              <button
                onClick={() => setShowCart(true)}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                style={{ backdropFilter: "blur(10px)" }}
              >
                <ShoppingBag size={16} />
              </button>
              
              {/* Mobile Auth */}
              {user ? (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowAccountModal(true); }}
                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 hover:border-white/50 transition-all duration-300 flex items-center justify-center bg-white/10 shrink-0"
                >
                  {userPhoto ? (
                    <img src={userPhoto} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-xs font-black text-white">{userInitial}</span>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-10 h-10 rounded-full bg-white/10 border border-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                  style={{ backdropFilter: "blur(10px)" }}
                >
                  <User size={16} />
                </button>
              )}
            </div>

            {/* CTA Button (Desktop Only) */}
            <Link to="/services" className="hidden md:block">
              <motion.button
                onMouseEnter={() => setIsCtaHovered(true)}
                onMouseLeave={() => setIsCtaHovered(false)}
                className="flex items-center justify-center h-10 md:h-12 bg-white shadow-[0_8px_20px_rgba(255,255,255,0.1)] rounded-full relative overflow-hidden group text-black shrink-0 w-auto"
                animate={{ width: isCtaHovered ? 160 : 48 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div className="flex items-center justify-center gap-2 px-0 w-full h-full absolute inset-0">
                  <div className="flex items-center justify-center shrink-0">
                    <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <AnimatePresence>
                    {isCtaHovered && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10, position: "absolute" }}
                        transition={{ duration: 0.2, delay: 0.05 }}
                        className="text-xs md:text-sm font-bold tracking-wider whitespace-nowrap pt-0.5"
                      >
                        اطلب الآن
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.header>

      <UserAuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <AccountModal isOpen={showAccountModal} onClose={() => setShowAccountModal(false)} />
      <CartModal isOpen={showCart} onClose={() => setShowCart(false)} />
      <FavoritesModal isOpen={showFavorites} onClose={() => setShowFavorites(false)} />
      <CurrencyModal isOpen={showCurrencyModal} onClose={() => setShowCurrencyModal(false)} />
    </>
  );
}
