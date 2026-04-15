import { useState, useEffect } from "react";
import { ClipboardList, Loader2, Clock, CheckCircle2, XCircle, RefreshCw, User, Phone, FileText, Package, ChevronDown, Trash2, X, Mail, AtSign } from "lucide-react";
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

function OrderDetailModal({ order, onClose, onStatusChange, onDelete }: {
  order: OrderData;
  onClose: () => void;
  onStatusChange: (orderId: string, status: OrderData["status"]) => void;
  onDelete: (orderId: string) => void;
}) {
  const status = STATUS_CONFIG[order.status];
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "—";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("ar-IQ", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-detail-modal" onClick={(e) => e.stopPropagation()} style={{ textAlign: "right" }}>
        {/* Header */}
        <div className="admin-detail-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div className="admin-detail-modal-status" style={{ background: status.bg, color: status.color }}>
              {status.icon}
              {status.label}
            </div>
            <span className="admin-order-type-badge" style={{ fontSize: "0.75rem" }}>
              {ITEM_TYPE_LABELS[order.itemType] || order.itemType}
            </span>
          </div>
          <button onClick={onClose} className="admin-detail-modal-close">
            <X size={18} />
          </button>
        </div>

        {/* Title */}
        <div className="admin-detail-modal-title">
          <Package size={20} />
          <span>{order.itemTitle}</span>
        </div>

        {/* Info Grid */}
        <div className="admin-detail-modal-grid">
          <div className="admin-detail-modal-info">
            <div className="admin-detail-modal-info-label"><User size={13} /> اسم العميل</div>
            <div className="admin-detail-modal-info-value">{order.customerName || "—"}</div>
          </div>
          <div className="admin-detail-modal-info">
            <div className="admin-detail-modal-info-label"><Phone size={13} /> رقم الجوال</div>
            <div className="admin-detail-modal-info-value" dir="ltr" style={{ textAlign: "left" }}>{order.customerPhone || "—"}</div>
          </div>
          <div className="admin-detail-modal-info">
            <div className="admin-detail-modal-info-label"><Clock size={13} /> تاريخ الطلب</div>
            <div className="admin-detail-modal-info-value">{formatDate(order.createdAt)}</div>
          </div>
          <div className="admin-detail-modal-info">
            <div className="admin-detail-modal-info-label"><AtSign size={13} /> إيميل التسجيل</div>
            <div className="admin-detail-modal-info-value" dir="ltr" style={{ textAlign: "left" }}>{order.userRegisteredEmail || "—"}</div>
          </div>
        </div>

        {/* Email entered in form (from custom fields) */}
        {order.customFields && Object.entries(order.customFields).some(([k]) => k.toLowerCase().includes("email") || k.toLowerCase().includes("إيميل") || k.toLowerCase().includes("بريد")) && (
          <div className="admin-detail-modal-section">
            <div className="admin-detail-modal-info-label" style={{ marginBottom: "0.35rem" }}><Mail size={13} /> الإيميل المُدخل في النموذج</div>
            {Object.entries(order.customFields).filter(([k]) => k.toLowerCase().includes("email") || k.toLowerCase().includes("إيميل") || k.toLowerCase().includes("بريد")).map(([k, v]) => (
              <div key={k} className="admin-detail-modal-info-value" dir="ltr" style={{ textAlign: "left" }}>{String(v)}</div>
            ))}
          </div>
        )}

        {/* Notes */}
        {order.customerNotes && (
          <div className="admin-detail-modal-section">
            <div className="admin-detail-modal-info-label" style={{ marginBottom: "0.35rem" }}><FileText size={13} /> ملاحظات العميل</div>
            <div className="admin-detail-modal-notes">{order.customerNotes}</div>
          </div>
        )}

        {/* Custom Fields */}
        {order.customFields && Object.keys(order.customFields).length > 0 && (
          <div className="admin-detail-modal-section">
            <div className="admin-detail-modal-info-label" style={{ marginBottom: "0.5rem" }}>📋 الحقول المخصصة</div>
            <div className="admin-detail-modal-fields">
              {Object.entries(order.customFields).map(([key, value]) => (
                <div key={key} className="admin-detail-modal-field">
                  <span className="admin-detail-modal-field-key">{key}</span>
                  <span className="admin-detail-modal-field-value">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="admin-detail-modal-actions">
          <div className="admin-order-status-select" style={{ flex: 1 }}>
            <select
              value={order.status}
              onChange={(e) => onStatusChange(order.id!, e.target.value as OrderData["status"])}
              style={{ borderColor: status.color + "40", width: "100%" }}
            >
              <option value="pending">قيد الانتظار</option>
              <option value="processing">قيد المعالجة</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغي</option>
            </select>
            <ChevronDown size={14} className="admin-order-select-arrow" />
          </div>
          {confirmDelete ? (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className="admin-btn-secondary"
                style={{ fontSize: "0.8rem", padding: "0.5rem 1rem", color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }}
                onClick={async () => {
                  setDeleting(true);
                  await onDelete(order.id!);
                  setDeleting(false);
                  onClose();
                }}
                disabled={deleting}
              >
                {deleting ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={14} />}
                تأكيد
              </button>
              <button className="admin-btn-secondary" style={{ fontSize: "0.8rem", padding: "0.5rem 1rem" }} onClick={() => setConfirmDelete(false)}>
                إلغاء
              </button>
            </div>
          ) : (
            <button
              className="admin-btn-secondary"
              style={{ fontSize: "0.8rem", padding: "0.5rem 1rem", color: "#ef4444", borderColor: "rgba(239,68,68,0.2)" }}
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={14} />
              حذف
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminOrders({ onCountChange }: AdminOrdersProps) {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | OrderData["status"]>("all");
  const [toast, setToast] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

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
  };

  const handleDelete = async (orderId: string) => {
    try {
      await deleteOrder(orderId);
      setToast("🗑️ تم حذف الطلب");
      setTimeout(() => setToast(""), 3000);
      fetchOrders();
    } catch (err) {
      console.error(err);
      setToast("❌ حدث خطأ أثناء الحذف");
      setTimeout(() => setToast(""), 3000);
    }
  };

  const filteredOrders = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "—";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("ar-IQ", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
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
              <div className="admin-skeleton" style={{ height: "14px", width: "30%" }} />
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
            return (
              <div
                key={order.id}
                className="admin-order-card admin-order-card-clickable"
                style={{ borderRightColor: status.color }}
                onClick={() => setSelectedOrder(order)}
              >
                {/* Compact Summary */}
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
                <div className="admin-order-title">
                  <Package size={16} />
                  {order.itemTitle}
                </div>
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
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}

      {/* Toast */}
      {toast && <div className="admin-toast">{toast}</div>}
    </div>
  );
}
