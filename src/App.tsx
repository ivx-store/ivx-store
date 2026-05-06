/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Home } from "./pages/Home";
import { ServicesPage } from "./pages/ServicesPage";
import { PackagesPage } from "./pages/PackagesPage";
import { ClientsPage } from "./pages/ClientsPage";
import { ContactPage } from "./pages/ContactPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminSubPage } from "./pages/AdminSubPage";
import { AdminServices } from "./components/admin/AdminServices";
import { AdminPackages } from "./components/admin/AdminPackages";
import { AdminOffers } from "./components/admin/AdminOffers";
import { AdminOrders } from "./components/admin/AdminOrders";
import { AdminMessages } from "./components/admin/AdminMessages";
import { AdminSettings } from "./components/admin/AdminSettings";
import { AdminUsers } from "./components/admin/AdminUsers";
import { AdminCategories } from "./components/admin/AdminCategories";
import { AdminContent } from "./components/admin/AdminContent";
import { LoadingScreen } from "./components/LoadingScreen";
import { CustomCursor } from "./components/CustomCursor";
import { ScrollToTop } from "./components/ScrollToTop";
import { SeoHead } from "./components/SeoHead";
import { LayoutGrid, Package, Flame, ClipboardList, MessageCircle, Settings, Users, AlertCircle, FolderOpen, FileText } from "lucide-react";
import { NotFoundPage } from "./pages/NotFoundPage";
import { CategoryServicesPage } from "./pages/CategoryServicesPage";
import { onAuthChange, updateUserPresence, updateGuestPresence, checkUserBanned, logoutAdmin, type User } from "./lib/firebase";
import { CurrencyProvider } from "./lib/CurrencyContext";
import { useEffect } from "react";
import { SettingsProvider } from "./lib/SettingsContext";

function AnimatedRoutes() {
  const location = useLocation();

  // Admin routes get their own simple rendering without animations
  if (location.pathname.startsWith("/admin")) {
    return (
      <Routes location={location}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/orders" element={
          <AdminSubPage title="الطلبات" icon={<ClipboardList size={22} />} iconColor="#f59e0b">
            <AdminOrders />
          </AdminSubPage>
        } />
        <Route path="/admin/messages" element={
          <AdminSubPage title="الرسائل" icon={<MessageCircle size={22} />} iconColor="#22c55e">
            <AdminMessages />
          </AdminSubPage>
        } />
        <Route path="/admin/services" element={
          <AdminSubPage title="الخدمات" icon={<LayoutGrid size={22} />} iconColor="#3b82f6">
            <AdminServices />
          </AdminSubPage>
        } />
        <Route path="/admin/packages" element={
          <AdminSubPage title="الباقات" icon={<Package size={22} />} iconColor="#a855f7">
            <AdminPackages />
          </AdminSubPage>
        } />
        <Route path="/admin/offers" element={
          <AdminSubPage title="العروض" icon={<Flame size={22} />} iconColor="#ef4444">
            <AdminOffers />
          </AdminSubPage>
        } />
        <Route path="/admin/users" element={
          <AdminSubPage title="المستخدمين" icon={<Users size={22} />} iconColor="#06b6d4">
            <AdminUsers />
          </AdminSubPage>
        } />
        <Route path="/admin/settings" element={
          <AdminSubPage title="الإعدادات" icon={<Settings size={22} />} iconColor="#888">
            <AdminSettings />
          </AdminSubPage>
        } />
        <Route path="/admin/categories" element={
          <AdminSubPage title="الأقسام" icon={<FolderOpen size={22} />} iconColor="#f59e0b">
            <AdminCategories />
          </AdminSubPage>
        } />
        <Route path="/admin/content" element={
          <AdminSubPage title="المحتوى" icon={<FileText size={22} />} iconColor="#14b8a6">
            <AdminContent />
          </AdminSubPage>
        } />
      </Routes>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/category/:categoryId" element={<CategoryServicesPage />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function PresenceTracker() {
  const [banned, setBanned] = useState(false);
  
  useEffect(() => {
    let unmounted = false;
    let guestId = localStorage.getItem("guestId");
    if (!guestId) {
      guestId = "guest_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("guestId", guestId);
    }
    
    let interval: any;
    
    const unsubscribe = onAuthChange((user) => {
      const checkAndPing = async () => {
        if (user) {
          if (user.uid !== "1kxnlTP7AlZvFwc82E546aNFX8j2") { // Skip check for admin
            const isBanned = await checkUserBanned(user.uid);
            if (isBanned && !unmounted) {
              setBanned(true);
            }
          }
          await updateUserPresence(user.uid, user.email);
        } else {
          await updateGuestPresence(guestId!);
        }
      };

      checkAndPing();
      if (interval) clearInterval(interval);
      interval = setInterval(checkAndPing, 30000); // 30s heartbeat
    });

    return () => {
      unmounted = true;
      if (interval) clearInterval(interval);
      unsubscribe();
    };
  }, []);

  if (banned) {
    return (
      <div className="fixed inset-0 z-[99999] bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-red-500" />
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <AlertCircle size={40} />
          </div>
          <h1 className="text-2xl font-black text-white mb-3 font-arabic">تم حظر حسابك</h1>
          <p className="text-gray-400 font-arabic text-sm leading-relaxed">
            عذراً، لقد تم حظر حسابك من قبل الإدارة ولا يمكنك استخدام الموقع أو إجراء أي طلبات.
          </p>
          <button 
            onClick={() => {
              logoutAdmin();
              setBanned(false);
            }} 
            className="mt-8 w-full py-3 bg-red-500 text-white rounded-xl font-bold font-arabic hover:bg-red-600 transition-colors"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    );
  }

  return null;
}

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  // Skip loading screen for admin
  const isAdmin = location.pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <>
        {/* Reset the cursor hide rule from index.css for the entire admin section */}
        <style dangerouslySetInnerHTML={{__html: `
          @media (pointer: fine) {
            *, body, input, textarea {
              cursor: auto !important;
            }
            a, button, select, [role="button"], .hover-trigger {
              cursor: pointer !important;
            }
          }
        `}} />
        <AnimatedRoutes />
      </>
    );
  }

  return (
    <>
      <CurrencyProvider>
        <PresenceTracker />
        <CustomCursor />
        <ScrollToTop />
        <AnimatePresence mode="wait">
          {isLoading ? (
            <LoadingScreen key="loading" onComplete={() => setIsLoading(false)} />
          ) : (
            <motion.div
              key="main-app"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <AnimatedRoutes />
            </motion.div>
          )}
        </AnimatePresence>
      </CurrencyProvider>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <SettingsProvider>
        <SeoHead />
        <AppContent />
      </SettingsProvider>
    </Router>
  );
}
