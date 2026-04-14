import { Link, useLocation } from "react-router-dom";
import { Home, Layers, Package, Users, MessageCircle } from "lucide-react";
import { motion } from "motion/react";

const navItems = [
  { name: "الرئيسية", path: "/", icon: Home },
  { name: "خدماتنا", path: "/services", icon: Layers },
  { name: "باقاتنا", path: "/packages", icon: Package },
  { name: "عملائنا", path: "/clients", icon: Users },
  { name: "تواصل", path: "/contact", icon: MessageCircle }
];

export function MobileNav() {
  const location = useLocation();
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60]" dir="rtl">
      <div className="bg-black/95 border-t border-gray-800 shadow-lg px-4 py-3 flex justify-between items-center rounded-t-3xl pb-[calc(0.75rem+env(safe-area-inset-bottom))] transform-gpu">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link key={item.name} to={item.path} className="relative flex flex-col items-center gap-1.5 p-2 w-16">
              {isActive && (
                <motion.div 
                  layoutId="mobile-nav-indicator" 
                  className="absolute inset-0 bg-white/10 rounded-2xl -z-10" 
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`w-6 h-6 transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-500'}`} />
              <span className={`text-[10px] font-bold transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
