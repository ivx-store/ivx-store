import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, Package, ExternalLink, Zap, Flame, Settings, TrendingUp, ClipboardList, LogOut, Loader2, MessageCircle } from "lucide-react";
import { AdminServices } from "../components/admin/AdminServices";
import { AdminPackages } from "../components/admin/AdminPackages";
import { AdminOffers } from "../components/admin/AdminOffers";
import { AdminOrders } from "../components/admin/AdminOrders";
import { AdminMessages } from "../components/admin/AdminMessages";
import { AdminSettings } from "../components/admin/AdminSettings";
import { AdminLogin } from "../components/admin/AdminLogin";
import { onAuthChange, logoutAdmin, type User } from "../lib/firebase";
import "../admin.css";

type TabType = "orders" | "messages" | "services" | "packages" | "offers" | "settings";

export function AdminDashboard() {
  const [authState, setAuthState] = useState<"loading" | "login" | "authenticated">("loading");
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("orders");
  const [serviceCnt, setServiceCnt] = useState(0);
  const [packageCnt, setPackageCnt] = useState(0);
  const [offerCnt, setOfferCnt] = useState(0);
  const [orderCnt, setOrderCnt] = useState(0);
  const [messageCnt, setMessageCnt] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange((u) => {
      setUser(u);
      setAuthState(u ? "authenticated" : "login");
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

  // Loading state
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

  // Login screen
  if (authState === "login") {
    return <AdminLogin onSuccess={() => {}} />;
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode; count: number }[] = [
    { id: "orders", label: "الطلبات", icon: <ClipboardList size={20} />, count: orderCnt },
    { id: "messages", label: "الرسائل", icon: <MessageCircle size={20} />, count: messageCnt },
    { id: "services", label: "الخدمات", icon: <LayoutGrid size={20} />, count: serviceCnt },
    { id: "packages", label: "الباقات", icon: <Package size={20} />, count: packageCnt },
    { id: "offers", label: "العروض", icon: <Flame size={20} />, count: offerCnt },
    { id: "settings", label: "الإعدادات", icon: <Settings size={20} />, count: 0 },
  ];

  return (
    <div className="admin-root">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-title">
          <div className="admin-header-logo">
            <Zap size={18} />
          </div>
          <h1>لوحة تحكم IVX</h1>
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

      {/* Stats Bar */}
      <div className="admin-stats-bar">
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
            <ClipboardList size={20} />
          </div>
          <div>
            <div className="admin-stat-value">{orderCnt}</div>
            <div className="admin-stat-label">طلب جديد</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
            <LayoutGrid size={20} />
          </div>
          <div>
            <div className="admin-stat-value">{serviceCnt}</div>
            <div className="admin-stat-label">خدمة</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "rgba(168,85,247,0.1)", color: "#a855f7" }}>
            <Package size={20} />
          </div>
          <div>
            <div className="admin-stat-value">{packageCnt}</div>
            <div className="admin-stat-label">باقة</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
            <Flame size={20} />
          </div>
          <div>
            <div className="admin-stat-value">{offerCnt}</div>
            <div className="admin-stat-label">عرض</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
            <MessageCircle size={20} />
          </div>
          <div>
            <div className="admin-stat-value">{messageCnt}</div>
            <div className="admin-stat-label">رسالة جديدة</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "rgba(168,85,247,0.1)", color: "#a855f7" }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="admin-stat-value">{serviceCnt + packageCnt + offerCnt}</div>
            <div className="admin-stat-label">إجمالي</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`admin-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <div className="admin-tab-icon">
              {tab.icon}
            </div>
            {tab.label}
            {tab.id !== "settings" && (
              <span className="admin-tab-count">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="admin-content" key={activeTab}>
        {activeTab === "orders" && <AdminOrders onCountChange={setOrderCnt} />}
        {activeTab === "messages" && <AdminMessages onCountChange={setMessageCnt} />}
        {activeTab === "services" && <AdminServices onCountChange={setServiceCnt} />}
        {activeTab === "packages" && <AdminPackages onCountChange={setPackageCnt} />}
        {activeTab === "offers" && <AdminOffers onCountChange={setOfferCnt} />}
        {activeTab === "settings" && <AdminSettings />}
      </div>
    </div>
  );
}
