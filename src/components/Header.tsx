import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";
import { useLocation, Link } from "react-router-dom";
import { IvxLogo } from "./IvxLogo";
import { ShoppingCart, User, LogOut } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { logoutAdmin } from "../lib/firebase";
import { UserAuthModal } from "./UserAuthModal";

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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  
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

  // Close user menu on outside click
  useEffect(() => {
    if (!showUserMenu) return;
    const handler = () => setShowUserMenu(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showUserMenu]);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logoutAdmin();
  };

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
        className="fixed top-3 md:top-6 left-0 right-0 z-50 flex justify-center px-3 md:px-4 pointer-events-none transform-gpu will-change-transform"
      >
        {/* The Dynamic Glass Pill */}
        <div 
          className={`pointer-events-auto flex items-center justify-between md:justify-center w-[95%] md:w-auto gap-2 md:gap-6 p-1.5 md:p-2 rounded-full transition-colors duration-500 ${
            isTop 
              ? "bg-black/90 md:bg-black/50 md:backdrop-blur-xl border border-white/10 shadow-sm" 
              : "bg-black/95 md:bg-black/80 md:backdrop-blur-xl border border-white/20 shadow-lg md:shadow-[0_8px_32px_rgba(255,255,255,0.05)]"
          }`}
        >
          {/* Logo Area */}
          <Link to="/">
            <div 
              className="flex items-center gap-2 cursor-pointer h-10 md:h-12 pr-2 md:pr-3"
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

          {/* Right Section: Auth + CTA */}
          <div className="flex items-center gap-2">
            {/* User Auth Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowUserMenu(!showUserMenu); }}
                  className="w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden border-2 border-white/20 hover:border-white/50 transition-all duration-300 flex items-center justify-center bg-white/10 shrink-0"
                >
                  {userPhoto ? (
                    <img src={userPhoto} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-sm font-black text-white">{userInitial}</span>
                  )}
                </button>
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full mt-2 left-0 md:left-auto md:right-0 w-56 rounded-2xl bg-[#111] border border-white/10 shadow-2xl overflow-hidden z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-4 border-b border-white/5">
                        <p className="text-sm font-bold text-white truncate" dir="ltr">
                          {user.displayName || user.email}
                        </p>
                        {user.displayName && (
                          <p className="text-xs text-gray-500 truncate mt-0.5" dir="ltr">{user.email}</p>
                        )}
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors font-arabic"
                      >
                        <LogOut size={16} />
                        تسجيل الخروج
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="h-10 md:h-11 px-4 md:px-5 rounded-full bg-white/10 border border-white/10 text-white text-xs md:text-sm font-bold font-arabic flex items-center gap-2 hover:bg-white/15 hover:border-white/25 transition-all duration-300 shrink-0"
              >
                <User size={16} />
                <span className="hidden sm:inline">تسجيل الدخول</span>
                <span className="sm:hidden">دخول</span>
              </button>
            )}

            {/* CTA Button */}
            <Link to="/contact">
              <motion.button
                onMouseEnter={() => setIsCtaHovered(true)}
                onMouseLeave={() => setIsCtaHovered(false)}
                className="flex items-center justify-center h-10 md:h-12 bg-white shadow-[0_8px_20px_rgba(255,255,255,0.1)] rounded-full relative overflow-hidden group text-black shrink-0 w-[120px] md:w-auto"
                animate={{
                  width: isMobile ? 120 : (isCtaHovered ? 160 : 44),
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div className="flex items-center justify-center gap-2 px-0 w-full h-full absolute inset-0">
                  <div className="flex items-center justify-center shrink-0">
                    <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <AnimatePresence>
                    {(isCtaHovered || isMobile) && (
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
    </>
  );
}
