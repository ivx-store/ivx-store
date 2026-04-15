import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";
import { loginAdmin, registerUser, loginWithGoogle } from "../lib/firebase";
import { useDevicePerformance } from "../lib/useDevicePerformance";

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export function UserAuthModal({ isOpen, onClose, onSuccess }: UserAuthModalProps) {
  const { isLowEnd } = useDevicePerformance();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setShowPassword(false);
  };

  const switchMode = (newMode: "login" | "register") => {
    resetForm();
    setMode(newMode);
  };

  const getErrorMessage = (code: string): string => {
    switch (code) {
      case "auth/user-not-found":
        return "البريد الإلكتروني غير مسجل";
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "البريد أو كلمة المرور غير صحيحة";
      case "auth/invalid-email":
        return "البريد الإلكتروني غير صالح";
      case "auth/too-many-requests":
        return "تم تجاوز عدد المحاولات، حاول لاحقاً";
      case "auth/network-request-failed":
        return "خطأ في الاتصال بالإنترنت";
      case "auth/email-already-in-use":
        return "هذا البريد مسجل مسبقاً، جرب تسجيل الدخول";
      case "auth/weak-password":
        return "كلمة المرور ضعيفة — يجب أن تكون 6 أحرف على الأقل";
      case "auth/popup-closed-by-user":
        return "";
      default:
        return "حدث خطأ، يرجى المحاولة مرة أخرى";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("يرجى إدخال البريد وكلمة المرور");
      return;
    }

    if (mode === "register") {
      if (password.length < 6) {
        setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
        return;
      }
      if (password !== confirmPassword) {
        setError("كلمتا المرور غير متطابقتين");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await loginAdmin(email, password);
      } else {
        await registerUser(email, password);
      }
      resetForm();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(getErrorMessage(err?.code || ""));
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      await loginWithGoogle();
      resetForm();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const msg = getErrorMessage(err?.code || "");
      if (msg) setError(msg);
    }
    setGoogleLoading(false);
  };

  const isAnyLoading = loading || googleLoading;

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
          onClick={(e) => { if (e.target === e.currentTarget && !isAnyLoading) onClose(); }}
        >
          {/* Backdrop */}
          <div className={`absolute inset-0 bg-black/80 ${isLowEnd ? '' : 'backdrop-blur-md'}`} />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[420px] rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #111 0%, #0a0a0a 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 80px rgba(255,255,255,0.02)",
            }}
            dir="rtl"
          >
            {/* Close */}
            <button
              onClick={onClose}
              disabled={isAnyLoading}
              className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={18} />
            </button>

            {/* Top decorative gradient */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

            {/* Content */}
            <div className="relative p-7 md:p-9">
              {/* Logo */}
              <div className="text-center mb-7">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                  <Zap size={24} className="text-black" />
                </div>
                <h2 className="text-xl font-black text-white font-arabic mb-1.5">
                  {mode === "login" ? "مرحباً بعودتك!" : "إنشاء حساب جديد"}
                </h2>
                <p className="text-sm text-gray-500 font-arabic font-medium">
                  {mode === "login" ? "سجل دخولك للمتابعة" : "أنشئ حسابك في ثوانٍ"}
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/15 text-red-400 text-sm font-bold font-arabic mb-5">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isAnyLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-white/[0.06] border border-white/10 text-white font-bold text-sm font-arabic hover:bg-white/[0.1] hover:border-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {googleLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <GoogleIcon />
                    <span>{mode === "login" ? "تسجيل الدخول بـ Google" : "التسجيل بـ Google"}</span>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 my-5">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-xs text-gray-600 font-bold">أو</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 font-arabic">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      dir="ltr"
                      autoComplete="email"
                      disabled={isAnyLoading}
                      className="w-full py-3 px-3.5 pr-10 rounded-xl bg-black/60 border border-white/[0.08] text-white text-sm font-medium outline-none focus:border-white/25 focus:bg-black/80 transition-all placeholder-gray-700 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 font-arabic">كلمة المرور</label>
                  <div className="relative">
                    <Lock size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      dir="ltr"
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      disabled={isAnyLoading}
                      className="w-full py-3 px-10 rounded-xl bg-black/60 border border-white/[0.08] text-white text-sm font-medium outline-none focus:border-white/25 focus:bg-black/80 transition-all placeholder-gray-700 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {mode === "register" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1.5 font-arabic">تأكيد كلمة المرور</label>
                    <div className="relative">
                      <Lock size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        dir="ltr"
                        autoComplete="new-password"
                        disabled={isAnyLoading}
                        className="w-full py-3 px-3.5 pr-10 rounded-xl bg-black/60 border border-white/[0.08] text-white text-sm font-medium outline-none focus:border-white/25 focus:bg-black/80 transition-all placeholder-gray-700 disabled:opacity-50"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAnyLoading}
                  className="w-full py-3.5 rounded-xl bg-white text-black font-black text-sm font-arabic flex items-center justify-center gap-2 hover:bg-gray-100 transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : mode === "login" ? (
                    <>
                      <LogIn size={16} />
                      <span>تسجيل الدخول</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      <span>إنشاء الحساب</span>
                    </>
                  )}
                </button>
              </form>

              {/* Switch Mode */}
              <div className="text-center mt-6">
                <span className="text-xs text-gray-600 font-arabic font-medium">
                  {mode === "login" ? "ليس لديك حساب؟ " : "لديك حساب بالفعل؟ "}
                </span>
                <button
                  onClick={() => switchMode(mode === "login" ? "register" : "login")}
                  disabled={isAnyLoading}
                  className="text-xs text-white font-bold font-arabic hover:underline disabled:opacity-50"
                >
                  {mode === "login" ? "إنشاء حساب" : "تسجيل الدخول"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
}
