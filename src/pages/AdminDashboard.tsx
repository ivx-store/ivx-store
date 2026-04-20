import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LayoutGrid, Package, ExternalLink, Zap, Flame, Settings, TrendingUp, ClipboardList, LogOut, Loader2, MessageCircle, ArrowLeft, Users, FolderOpen } from "lucide-react";
import { AdminLogin } from "../components/admin/AdminLogin";
import { onAuthChange, logoutAdmin, getServices, getPackages, getOffers, getOrders, getMessages, getAllUsers, getCategories, ADMIN_UID, formatTimestamp, type User, type OrderData } from "../lib/firebase";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "../admin.css";



interface DashboardButton {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  path: string;
  count: number;
  loading: boolean;
  description: string;
}

export function AdminDashboard() {
  const [authState, setAuthState] = useState<"loading" | "login" | "authenticated" | "unauthorized">("loading");
  const [user, setUser] = useState<User | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  // Counts
  const [serviceCnt, setServiceCnt] = useState(0);
  const [packageCnt, setPackageCnt] = useState(0);
  const [offerCnt, setOfferCnt] = useState(0);
  const [orderCnt, setOrderCnt] = useState(0);
  const [messageCnt, setMessageCnt] = useState(0);
  const [userCnt, setUserCnt] = useState(0);
  const [categoryCnt, setCategoryCnt] = useState(0);
  const [countsLoading, setCountsLoading] = useState(true);
  const [ordersData, setOrdersData] = useState<OrderData[]>([]);

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

  // Load all counts immediately on mount
  useEffect(() => {
    if (authState !== "authenticated") return;

    const loadAllCounts = async () => {
      setCountsLoading(true);
      try {
        const [services, packages, offers, orders, messages, usersData, categoriesData] = await Promise.all([
          getServices(),
          getPackages(),
          getOffers(),
          getOrders(),
          getMessages(),
          getAllUsers(),
          getCategories(),
        ]);
        setServiceCnt(services.length);
        setPackageCnt(packages.length);
        setOfferCnt(offers.length);
        setOrderCnt(orders.filter(o => o.status === "pending").length);
        setMessageCnt(messages.filter(m => !m.read).length);
        setUserCnt(usersData.length);
        setCategoryCnt(categoriesData.length);
        setOrdersData(orders);
      } catch (err) {
        console.error("Error loading counts:", err);
      }
      setCountsLoading(false);
    };

    loadAllCounts();
  }, [authState]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutAdmin();
    } catch (err) {
      console.error("Logout error:", err);
    }
    setLoggingOut(false);
  };

  // Prepare chart data (Last 7 days)
  const chartData = React.useMemo(() => {
    const days = 7;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      data.push({
        name: d.toLocaleDateString("ar-IQ", { weekday: "short" }),
        dateStr: d.toISOString().split('T')[0],
        orders: 0
      });
    }

    ordersData.forEach(order => {
      if (!order.createdAt) return;
      let date;
      // Handle Firebase Timestamp
      if (typeof (order.createdAt as any).toDate === "function") {
        date = (order.createdAt as any).toDate();
      } else if ((order.createdAt as any).seconds) {
        date = new Date((order.createdAt as any).seconds * 1000);
      } else {
        date = new Date(order.createdAt as any);
      }

      if (isNaN(date.getTime())) return;

      const dateStr = date.toISOString().split('T')[0];
      const pt = data.find(p => p.dateStr === dateStr);
      if (pt) pt.orders += 1;
    });

    return data;
  }, [ordersData]);

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

  // Unauthorized — not the admin
  if (authState === "unauthorized") {
    return (
      <div className="admin-login-root">
        <div className="admin-login-bg">
          <div className="admin-login-orb admin-login-orb-1" />
          <div className="admin-login-orb admin-login-orb-2" />
          <div className="admin-login-orb admin-login-orb-3" />
        </div>
        <div className="admin-login-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚫</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#ef4444", marginBottom: "0.75rem" }}>غير مصرح</h2>
          <p style={{ color: "#888", fontSize: "0.95rem", marginBottom: "1.5rem", lineHeight: 1.8 }}>
            ليس لديك صلاحية للوصول إلى لوحة التحكم.<br />
            هذه الصفحة مخصصة للأدمن فقط.
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
            <a
              href="/"
              className="admin-login-submit"
              style={{ maxWidth: "180px", textDecoration: "none" }}
            >
              العودة للموقع
            </a>
          </div>
        </div>
      </div>
    );
  }

  const buttons: DashboardButton[] = [
    { id: "orders", label: "الطلبات", icon: <ClipboardList size={28} />, color: "#f59e0b", gradient: "linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.05) 100%)", path: "/admin/orders", count: orderCnt, loading: countsLoading, description: "إدارة طلبات العملاء" },
    { id: "messages", label: "الرسائل", icon: <MessageCircle size={28} />, color: "#22c55e", gradient: "linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 100%)", path: "/admin/messages", count: messageCnt, loading: countsLoading, description: "رسائل التواصل" },
    { id: "services", label: "الخدمات", icon: <LayoutGrid size={28} />, color: "#3b82f6", gradient: "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.05) 100%)", path: "/admin/services", count: serviceCnt, loading: countsLoading, description: "إدارة الخدمات والمنتجات" },
    { id: "packages", label: "الباقات", icon: <Package size={28} />, color: "#a855f7", gradient: "linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(168,85,247,0.05) 100%)", path: "/admin/packages", count: packageCnt, loading: countsLoading, description: "إدارة الباقات المتوفرة" },
    { id: "offers", label: "العروض", icon: <Flame size={28} />, color: "#ef4444", gradient: "linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)", path: "/admin/offers", count: offerCnt, loading: countsLoading, description: "العروض والتخفيضات" },
    { id: "users", label: "المستخدمين", icon: <Users size={28} />, color: "#06b6d4", gradient: "linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(6,182,212,0.05) 100%)", path: "/admin/users", count: userCnt, loading: countsLoading, description: "إدارة المستخدمين والزوار" },
    { id: "categories", label: "الأقسام", icon: <FolderOpen size={28} />, color: "#f59e0b", gradient: "linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.05) 100%)", path: "/admin/categories", count: categoryCnt, loading: countsLoading, description: "إدارة أقسام الخدمات" },
    { id: "settings", label: "الإعدادات", icon: <Settings size={28} />, color: "#888", gradient: "linear-gradient(135deg, rgba(136,136,136,0.15) 0%, rgba(136,136,136,0.05) 100%)", path: "/admin/settings", count: -1, loading: false, description: "إعدادات الموقع العامة" },
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
        <div className="admin-header-actions">
          {user?.email && (
            <span className="admin-header-email">{user.email}</span>
          )}
          <Link to="/" className="admin-back-btn">
            <ExternalLink size={16} />
            <span className="admin-back-btn-text">عرض الموقع</span>
          </Link>
          <button
            className="admin-back-btn"
            onClick={handleLogout}
            disabled={loggingOut}
            style={{ color: "#ef4444", borderColor: "rgba(239,68,68,0.2)" }}
          >
            {loggingOut ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <LogOut size={16} />}
            <span className="admin-back-btn-text">خروج</span>
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
            <div className="admin-stat-value">{countsLoading ? <span className="admin-count-skeleton" /> : orderCnt}</div>
            <div className="admin-stat-label">طلب جديد</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
            <LayoutGrid size={20} />
          </div>
          <div>
            <div className="admin-stat-value">{countsLoading ? <span className="admin-count-skeleton" /> : serviceCnt}</div>
            <div className="admin-stat-label">خدمة</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "rgba(168,85,247,0.1)", color: "#a855f7" }}>
            <Package size={20} />
          </div>
          <div>
            <div className="admin-stat-value">{countsLoading ? <span className="admin-count-skeleton" /> : packageCnt}</div>
            <div className="admin-stat-label">باقة</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
            <Flame size={20} />
          </div>
          <div>
            <div className="admin-stat-value">{countsLoading ? <span className="admin-count-skeleton" /> : offerCnt}</div>
            <div className="admin-stat-label">عرض</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
            <MessageCircle size={20} />
          </div>
          <div>
            <div className="admin-stat-value">{countsLoading ? <span className="admin-count-skeleton" /> : messageCnt}</div>
            <div className="admin-stat-label">رسالة جديدة</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "rgba(168,85,247,0.1)", color: "#a855f7" }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="admin-stat-value">{countsLoading ? <span className="admin-count-skeleton" /> : serviceCnt + packageCnt + offerCnt}</div>
            <div className="admin-stat-label">إجمالي</div>
          </div>
        </div>
      </div>

      {/* Dashboard Buttons Grid */}
      <div className="admin-content">
        <div className="admin-dashboard-grid">
          {buttons.map((btn) => (
            <button
              key={btn.id}
              className="admin-dashboard-btn"
              onClick={() => navigate(btn.path)}
              style={{ "--btn-color": btn.color, "--btn-gradient": btn.gradient } as React.CSSProperties}
            >
              <div className="admin-dashboard-btn-header">
                <div className="admin-dashboard-btn-icon" style={{ background: `${btn.color}18`, color: btn.color }}>
                  {btn.icon}
                </div>
                {btn.count >= 0 && (
                  <div className="admin-dashboard-btn-count" style={{ background: `${btn.color}20`, color: btn.color }}>
                    {btn.loading ? (
                      <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                    ) : (
                      btn.count
                    )}
                  </div>
                )}
              </div>
              <div className="admin-dashboard-btn-label">{btn.label}</div>
              <div className="admin-dashboard-btn-desc">{btn.description}</div>
              <div className="admin-dashboard-btn-arrow">
                <ArrowLeft size={16} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="admin-chart-section" style={{ marginTop: "2rem", padding: "0 1.5rem" }}>
        <h3 style={{ color: "#fff", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.1rem" }}>
          <TrendingUp size={20} color="#f59e0b" />
          طلبات المتجر (آخر 7 أيام)
        </h3>
        <div style={{ width: '100%', height: 280, background: 'rgba(255,255,255,0.02)', borderRadius: '20px', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontFamily: 'Tajawal, sans-serif' }} dy={10} />
              <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} allowDecimals={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dx={-10} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', fontSize: '14px', fontFamily: 'Tajawal, sans-serif' }}
                itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
                cursor={{ stroke: '#f59e0b', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Area type="monotone" dataKey="orders" name="الطلبات" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" animationDuration={1500} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
