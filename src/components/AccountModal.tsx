import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";
import { X, LogOut, User, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { logoutAdmin } from "../lib/firebase";
import { useDevicePerformance } from "../lib/useDevicePerformance";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export function AccountModal({ isOpen, onClose }: AccountModalProps) {
  const { user } = useAuth();
  const { isLowEnd } = useDevicePerformance();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleLogout = async () => {
    await logoutAdmin();
    onClose();
  };

  if (!mounted || !user) return null;

  const userInitial = user.displayName?.[0] || user.email?.[0]?.toUpperCase() || "U";
  const userPhoto = user.photoURL;
  const isGoogle = user.providerData?.[0]?.providerId === "google.com";

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center pointer-events-auto" dir="rtl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`absolute inset-0 bg-black/80 ${isLowEnd ? '' : 'backdrop-blur-md'}`}
          />
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[400px] bg-[#0d0d0d] border border-white/10 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Decorative background */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

            {/* Header */}
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between shrink-0 relative z-10">
              <h3 className="text-lg font-black text-white font-arabic">حسابي</h3>
              <button 
                onClick={onClose} 
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Display */}
            <div className="p-6 relative z-10 space-y-6">
              {/* User Identity */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#0d0d0d] shadow-[0_0_0_2px_rgba(255,255,255,0.1)] bg-white/5 flex items-center justify-center">
                    {userPhoto ? (
                      <img src={userPhoto} alt="User avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-white">{userInitial}</span>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 rounded-full bg-[#0d0d0d] flex items-center justify-center shadow-sm">
                    <div className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                  </div>
                </div>
                {user.displayName && (
                  <h2 className="text-xl font-bold text-white mb-1" dir="ltr">{user.displayName}</h2>
                )}
                <p className="text-gray-400 text-sm font-medium" dir="ltr">{user.email}</p>
              </div>

              {/* Account Details Tags */}
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400">
                      <ShieldCheck size={16} />
                    </div>
                    <span className="text-sm font-bold text-white font-arabic">حالة الحساب</span>
                  </div>
                  <span className="text-xs font-bold text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 font-arabic">نشط</span>
                </div>

                <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400">
                      {isGoogle ? <GoogleIcon /> : <Mail size={16} />}
                    </div>
                    <span className="text-sm font-bold text-white font-arabic">طريقة التسجيل</span>
                  </div>
                  <span className="text-xs font-bold text-gray-400 font-arabic bg-black px-3 py-1.5 rounded-full border border-white/10">
                    {isGoogle ? "Google" : "البريد الإلكتروني"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 mt-2 relative z-10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all font-bold text-sm font-arabic group"
              >
                <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
                تسجيل الخروج
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
