import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Zap, ExternalLink, LogOut } from "lucide-react";
import { onAuthChange, logoutAdmin, type User } from "../lib/firebase";
import { AdminLogin } from "../components/admin/AdminLogin";
import "../admin.css";

// ADMIN UID — only this user can access admin sub-pages
const ADMIN_UID = "1kxnlTP7AlZvFwc82E546aNFX8j2";

interface AdminSubPageProps {
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  children: React.ReactNode;
}

export function AdminSubPage({ title, icon, iconColor, children }: AdminSubPageProps) {
  const [authState, setAuthState] = useState<"loading" | "login" | "authenticated" | "unauthorized">("loading");
  const [user, setUser] = useState<User | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthChange((u) => {
      setUser(u);
      if (!u) {
        setAuthState("login");
      } else if (u.uid === ADMIN_UID) {
        setAuthState("authenticated");
      } else {
        setAuthState("unauthorized");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutAdmin();
    } catch (err) {
      console.error("Logout error:", err);
    }
    setLoggingOut(false);
  };

  if (authState === "loading") {
    return (
      <div className="admin-login-root">
        <div className="admin-login-bg">
          <div className="admin-login-orb admin-login-orb-1" />
          <div className="admin-login-orb admin-login-orb-2" />
        </div>
        <Loader2 size={40} style={{ animation: "spin 1s linear infinite", color: "#555" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (authState === "login") {
    return <AdminLogin onSuccess={() => {}} />;
  }

  // Unauthorized — not the admin
  if (authState === "unauthorized") {
    return (
      <div className="admin-login-root">
        <div className="admin-login-bg">
          <div className="admin-login-orb admin-login-orb-1" />
          <div className="admin-login-orb admin-login-orb-2" />
        </div>
        <div className="admin-login-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚫</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#ef4444", marginBottom: "0.75rem" }}>غير مصرح</h2>
          <p style={{ color: "#888", fontSize: "0.95rem", marginBottom: "1.5rem", lineHeight: 1.8 }}>
            ليس لديك صلاحية للوصول إلى لوحة التحكم.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <button
              onClick={handleLogout}
              className="admin-login-submit"
              style={{ maxWidth: "180px", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", boxShadow: "none" }}
            >
              <LogOut size={18} />
              تسجيل الخروج
            </button>
            <a href="/" className="admin-login-submit" style={{ maxWidth: "180px", textDecoration: "none" }}>
              العودة للموقع
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-root">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-title">
          <button
            onClick={() => navigate("/admin")}
            className="admin-subpage-back"
          >
            <ArrowRight size={18} />
          </button>
          <div className="admin-subpage-icon" style={{ background: `${iconColor}15`, color: iconColor }}>
            {icon}
          </div>
          <h1>{title}</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {user?.email && (
            <span style={{ fontSize: "0.8rem", color: "#666", fontWeight: 600 }}>{user.email}</span>
          )}
          <Link to="/" className="admin-back-btn">
            <ExternalLink size={16} />
            عرض الموقع
          </Link>
          <button
            className="admin-back-btn"
            onClick={handleLogout}
            disabled={loggingOut}
            style={{ color: "#ef4444", borderColor: "rgba(239,68,68,0.2)" }}
          >
            {loggingOut ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <LogOut size={16} />}
            خروج
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="admin-content" style={{ animation: "adminFadeIn 0.4s ease" }}>
        {children}
      </div>
    </div>
  );
}
