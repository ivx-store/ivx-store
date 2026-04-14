import { useState } from "react";
import { Zap, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { loginAdmin } from "../../lib/firebase";

interface AdminLoginProps {
  onSuccess: () => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getErrorMessage = (code: string): string => {
    switch (code) {
      case "auth/user-not-found":
        return "البريد الإلكتروني غير مسجل";
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "كلمة المرور غير صحيحة";
      case "auth/invalid-email":
        return "البريد الإلكتروني غير صالح";
      case "auth/too-many-requests":
        return "تم تجاوز عدد المحاولات، حاول لاحقاً";
      case "auth/network-request-failed":
        return "خطأ في الاتصال بالإنترنت";
      default:
        return "حدث خطأ أثناء تسجيل الدخول";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("يرجى إدخال البريد وكلمة المرور");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await loginAdmin(email, password);
      onSuccess();
    } catch (err: any) {
      setError(getErrorMessage(err?.code || ""));
    }
    setLoading(false);
  };

  return (
    <div className="admin-login-root">
      {/* Background Effects */}
      <div className="admin-login-bg">
        <div className="admin-login-orb admin-login-orb-1" />
        <div className="admin-login-orb admin-login-orb-2" />
        <div className="admin-login-orb admin-login-orb-3" />
      </div>

      <div className="admin-login-card">
        {/* Logo */}
        <div className="admin-login-logo">
          <div className="admin-login-logo-icon">
            <Zap size={28} />
          </div>
          <h1>IVX Store</h1>
          <p>لوحة التحكم — تسجيل الدخول</p>
        </div>

        {/* Error */}
        {error && (
          <div className="admin-login-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="admin-login-form" dir="rtl">
          <div className="admin-login-field">
            <label>البريد الإلكتروني</label>
            <div className="admin-login-input-wrapper">
              <Mail size={18} className="admin-login-input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                dir="ltr"
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          <div className="admin-login-field">
            <label>كلمة المرور</label>
            <div className="admin-login-input-wrapper">
              <Lock size={18} className="admin-login-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="admin-login-eye"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="admin-login-submit"
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={20} className="admin-login-spinner" />
            ) : (
              <>
                <Zap size={18} />
                <span>تسجيل الدخول</span>
              </>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <span>IVX Store © {new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  );
}
