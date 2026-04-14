import { useState, useEffect } from "react";
import { ClipboardList, Loader2, Clock, CheckCircle2, XCircle, RefreshCw, User, Phone, FileText, Package, ChevronDown, Trash2 } from "lucide-react";
import { OrderData, getOrders, updateOrderStatus, deleteOrder } from "../../lib/firebase";

interface AdminOrdersProps {
  onCountChange?: (count: number) => void;
}

const STATUS_CONFIG: Record<OrderData["status"], { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending: { label: "قيد الانتظار", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: <Clock size={14} /> },
  processing: { label: "قيد المعالجة", color: "#3b82f6", bg: "rgba(59,130,246,0.1)", icon: <RefreshCw size={14} /> },
  completed: { label: "مكتمل", color: "#22c55e", bg: "rgba(34,197,94,0.1)", icon: <CheckCircle2 size={14} /> },
  cancelled: { label: "ملغي", color: "#ef4444", bg: "rgba(239,68,68,0.1)", icon: <XCircle size={14} /> },
};

const ITEM_TYPE_LABELS: Record<string, string> = {
  service: "خدمة",
  package: "باقة",
  offer: "عرض",
};

export function AdminOrders({ onCountChange }: AdminOrdersProps) {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | OrderData["status"]>("all");
  const [toast, setToast] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
      onCountChange?.(data.filter(o => o.status === "pending").length);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderData["status"]) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setToast(`✅ تم تحديث حالة الطلب إلى "${STATUS_CONFIG[newStatus].label}"`);
      setTimeout(() => setToast(""), 3000);
      fetchOrders();
    } catch (err) {
      console.error(err);
      setToast("❌ حدث خطأ أثناء التحديث");
      setTimeout(() => setToast(""), 3000);
    }
    setUpdatingId(null);
  };

  const filteredOrders = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "—";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("ar-IQ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div>
      {/* Filter Tabs */}
      <div className="admin-order-filters">
        {(["all", "pending", "processing", "completed", "cancelled"] as const).map((f) => {
          const count = f === "all" ? orders.length : orders.filter(o => o.status === f).length;
          const isActive = filter === f;
          return (
            <button
              key={f}
              className={`admin-order-filter ${isActive ? "active" : ""}`}
              onClick={() => setFilter(f)}
              style={isActive && f !== "all" ? { borderColor: STATUS_CONFIG[f as OrderData["status"]].color + "50" } : undefined}
            >
              {f !== "all" && STATUS_CONFIG[f as OrderData["status"]].icon}
              <span>{f === "all" ? "الكل" : STATUS_CONFIG[f as OrderData["status"]].label}</span>
              <span className="admin-order-filter-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="admin-orders-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="admin-order-card">
              <div className="admin-skeleton" style={{ height: "20px", width: "40%", marginBottom: "0.75rem" }} />
              <div className="admin-skeleton" style={{ height: "16px", width: "60%", marginBottom: "0.5rem" }} />
              <div className="admin-skeleton" style={{ height: "14px", width: "30%", marginBottom: "1rem" }} />
              <div className="admin-skeleton" style={{ height: "36px", width: "100%" }} />
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="admin-empty" style={{ marginTop: "2rem" }}>
          <div className="admin-empty-icon">
            <ClipboardList size={32} />
          </div>
          <h3>{filter === "all" ? "لا توجد طلبات بعد" : `لا توجد طلبات "${STATUS_CONFIG[filter as OrderData["status"]]?.label || ""}"`}</h3>
          <p>ستظهر الطلبات هنا عندما يقوم العملاء بطلب خدماتك.</p>
        </div>
      ) : (
        <div className="admin-orders-list">
          {filteredOrders.map((order) => {
            const status = STATUS_CONFIG[order.status];
            const isUpdating = updatingId === order.id;
            return (
              <div key={order.id} className="admin-order-card" style={{ borderRightColor: status.color }}>
                {/* Header */}
                <div className="admin-order-header">
                  <div className="admin-order-header-right">
                    <div className="admin-order-item-badge" style={{ background: status.bg, color: status.color }}>
                      {status.icon}
                      {status.label}
                    </div>
                    <span className="admin-order-type-badge">
                      {ITEM_TYPE_LABELS[order.itemType] || order.itemType}
                    </span>
                  </div>
                  <span className="admin-order-date">{formatDate(order.createdAt)}</span>
                </div>

                {/* Title */}
                <div className="admin-order-title">
                  <Package size={16} />
                  {order.itemTitle}
                </div>

                {/* Customer Info */}
                <div className="admin-order-customer">
                  <div className="admin-order-customer-item">
                    <User size={14} />
                    <span>{order.customerName || "—"}</span>
                  </div>
                  <div className="admin-order-customer-item">
                    <Phone size={14} />
                    <span dir="ltr">{order.customerPhone || "—"}</span>
                  </div>
                </div>

                {/* Notes */}
                {order.customerNotes && (
                  <div className="admin-order-notes">
                    <FileText size={13} />
                    <span>{order.customerNotes}</span>
                  </div>
                )}

                {/* Custom Fields */}
                {order.customFields && Object.keys(order.customFields).length > 0 && (
                  <div className="admin-order-custom-fields">
                    {Object.entries(order.customFields).map(([key, value]) => (
                      <div key={key} className="admin-order-custom-field">
                        <span className="admin-order-custom-key">{key}:</span>
                        <span className="admin-order-custom-value">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="admin-order-actions">
                  <div className="admin-order-status-select">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id!, e.target.value as OrderData["status"])}
                      disabled={isUpdating}
                      style={{ borderColor: status.color + "40" }}
                    >
                      <option value="pending">قيد الانتظار</option>
                      <option value="processing">قيد المعالجة</option>
                      <option value="completed">مكتمل</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                    <ChevronDown size={14} className="admin-order-select-arrow" />
                    {isUpdating && <Loader2 size={14} className="admin-order-updating" />}
                  </div>
                  {confirmDeleteId === order.id ? (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        className="admin-btn-secondary"
                        style={{ fontSize: "0.75rem", padding: "0.4rem 0.85rem", color: "#ef4444", borderColor: "rgba(239,68,68,0.2)" }}
                        onClick={async () => {
                          setDeletingId(order.id!);
                          try {
                            await deleteOrder(order.id!);
                            setToast("🗑️ تم حذف الطلب");
                            setTimeout(() => setToast(""), 3000);
                            setConfirmDeleteId(null);
                            fetchOrders();
                          } catch (err) {
                            console.error(err);
                            setToast("❌ حدث خطأ أثناء الحذف");
                            setTimeout(() => setToast(""), 3000);
                          }
                          setDeletingId(null);
                        }}
                        disabled={deletingId === order.id}
                      >
                        {deletingId === order.id ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={14} />}
                        تأكيد
                      </button>
                      <button
                        className="admin-btn-secondary"
                        style={{ fontSize: "0.75rem", padding: "0.4rem 0.85rem" }}
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <button
                      className="admin-btn-secondary"
                      style={{ fontSize: "0.75rem", padding: "0.4rem 0.85rem", color: "#ef4444", borderColor: "rgba(239,68,68,0.15)" }}
                      onClick={() => setConfirmDeleteId(order.id!)}
                    >
                      <Trash2 size={14} />
                      حذف
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Toast */}
      {toast && <div className="admin-toast">{toast}</div>}
    </div>
  );
}
