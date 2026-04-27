import React, { useState, useEffect } from "react";
import { ClipboardList, Loader2, Clock, CheckCircle2, XCircle, RefreshCw, User, Phone, FileText, Package, ChevronDown, Trash2, X, Mail, AtSign, Download, Copy, DollarSign, Layers, Tag } from "lucide-react";
import { OrderData, getOrders, updateOrderStatus, deleteOrder, formatTimestamp, formatPriceWithCommas, getCurrencySymbol } from "../../lib/firebase";
import { STATUS_CONFIG, ITEM_TYPE_LABELS } from "../../lib/constants";

interface AdminOrdersProps {
  onCountChange?: (count: number) => void;
}



function OrderDetailModal({ order, onClose, onStatusChange, onDelete }: {
  order: OrderData;
  onClose: () => void;
  onStatusChange: (orderId: string, status: OrderData["status"]) => void;
  onDelete: (orderId: string) => void;
}) {
  const status = STATUS_CONFIG[order.status];
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatDate = formatTimestamp;
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  console.log(order , "selected order")

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
            <div className="admin-detail-modal-info-value" dir="ltr" style={{ textAlign: "left", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
              {order.customerPhone || "—"}
              {order.customerPhone && (
                <button 
                  onClick={() => handleCopy(order.customerPhone)}
                  className="admin-icon-btn" 
                  title="نسخ"
                  style={{ background: "transparent", border: "none", color: copiedText === order.customerPhone ? "#22c55e" : "#9ca3af", cursor: "pointer", padding: "4px" }}
                >
                  {copiedText === order.customerPhone ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                </button>
              )}
            </div>
          </div>
          <div className="admin-detail-modal-info">
            <div className="admin-detail-modal-info-label"><Clock size={13} /> تاريخ الطلب</div>
            <div className="admin-detail-modal-info-value">{formatDate(order.createdAt)}</div>
          </div>
          <div className="admin-detail-modal-info">
            <div className="admin-detail-modal-info-label"><Layers size={13} /> الخدمة</div>
            <div className="admin-detail-modal-info-value">{order.service || "—"}</div>
          </div>
          <div className="admin-detail-modal-info">
            <div className="admin-detail-modal-info-label"><Tag size={13} /> القسم</div>
            <div className="admin-detail-modal-info-value">{order.section || "—"}</div>
          </div>
          <div className="admin-detail-modal-info">
            <div className="admin-detail-modal-info-label"><AtSign size={13} /> إيميل التسجيل</div>
            <div className="admin-detail-modal-info-value" dir="ltr" style={{ textAlign: "left", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
              {order.userRegisteredEmail || "—"}
              {order.userRegisteredEmail && (
                <button 
                  onClick={() => handleCopy(order.userRegisteredEmail!)}
                  className="admin-icon-btn" 
                  title="نسخ"
                  style={{ background: "transparent", border: "none", color: copiedText === order.userRegisteredEmail ? "#22c55e" : "#9ca3af", cursor: "pointer", padding: "4px" }}
                >
                  {copiedText === order.userRegisteredEmail ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Email entered in form (from custom fields) */}
        {order.customFields && Object.entries(order.customFields).some(([k]) => k.toLowerCase().includes("email") || k.toLowerCase().includes("إيميل") || k.toLowerCase().includes("بريد")) && (
          <div className="admin-detail-modal-section">
            <div className="admin-detail-modal-info-label" style={{ marginBottom: "0.35rem" }}><Mail size={13} /> الإيميل المُدخل في النموذج</div>
            {Object.entries(order.customFields).filter(([k]) => k.toLowerCase().includes("email") || k.toLowerCase().includes("إيميل") || k.toLowerCase().includes("بريد")).map(([k, v]) => (
              <div key={k} className="admin-detail-modal-info-value" dir="ltr" style={{ textAlign: "left", display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-end" }}>
                {String(v)}
                <button 
                  onClick={() => handleCopy(String(v))}
                  className="admin-icon-btn" 
                  title="نسخ"
                  style={{ background: "transparent", border: "none", color: copiedText === String(v) ? "#22c55e" : "#9ca3af", cursor: "pointer", padding: "4px" }}
                >
                  {copiedText === String(v) ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pricing Breakdown */}
        {order.totalPrice !== undefined && order.totalPrice > 0 && (
          <div className="admin-detail-modal-section">
            <div className="admin-detail-modal-info-label" style={{ marginBottom: "0.5rem" }}><DollarSign size={13} /> تفاصيل التسعير</div>
            <div className="admin-order-pricing-card">
              {order.pricingBreakdown && order.pricingBreakdown.length > 0 ? (
                <>
                  {order.pricingBreakdown.map((item, i) => (
                    <div key={i} className="admin-order-pricing-row">
                      <span className="admin-order-pricing-label">{item.label}</span>
                      <span className="admin-order-pricing-value">
                        {formatPriceWithCommas(String(item.value))} {getCurrencySymbol(order.priceCurrency || "USD")}
                      </span>
                    </div>
                  ))}
                  <div className="admin-order-pricing-divider" />
                  <div className="admin-order-pricing-row admin-order-pricing-total">
                    <span className="admin-order-pricing-label">الإجمالي</span>
                    <span className="admin-order-pricing-value">
                      {formatPriceWithCommas(String(order.totalPrice))} {getCurrencySymbol(order.priceCurrency || "USD")}
                    </span>
                  </div>
                </>
              ) : (
                <div className="admin-order-pricing-row admin-order-pricing-total">
                  <span className="admin-order-pricing-label">السعر الإجمالي</span>
                  <span className="admin-order-pricing-value">
                    {formatPriceWithCommas(String(order.totalPrice))} {getCurrencySymbol(order.priceCurrency || "USD")}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {order.customerNotes && (
          <div className="admin-detail-modal-section">
            <div className="admin-detail-modal-info-label" style={{ marginBottom: "0.35rem" }}><FileText size={13} /> ملاحظات العميل</div>
            <div className="admin-detail-modal-notes">{order.customerNotes}</div>
          </div>
        )}

        {/* Custom Fields (filter out system fields) */}
        {order.customFields && (() => {
          const systemKeys = ["customerName", "customerPhone", "customerNotes"];
          const customEntries = Object.entries(order.customFields).filter(
            ([k]) => !systemKeys.includes(k) && 
                     !k.toLowerCase().includes("email") && 
                     !k.toLowerCase().includes("إيميل") && 
                     !k.toLowerCase().includes("بريد")
          );
          if (customEntries.length === 0) return null;
          return (
            <div className="admin-detail-modal-section">
              <div className="admin-detail-modal-info-label" style={{ marginBottom: "0.5rem" }}>📋 الحقول المخصصة</div>
              <div className="admin-order-custom-grid">
                {customEntries.map(([key, value]) => (
                  <div key={key} className="admin-order-custom-item">
                    <span className="admin-order-custom-key">{key}</span>
                    <span className="admin-order-custom-val">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

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

  const formatDate = formatTimestamp;

  const handleExportCSV = () => {
    const headers = ["المعرف", "الطلب", "النوع", "اسم العميل", "رقم الجوال", "بريد الحساب", "الحالة", "التاريخ"];
    const rows = orders.map(o => [
      o.id || "",
      o.itemTitle,
      ITEM_TYPE_LABELS[o.itemType] || o.itemType,
      o.customerName,
      o.customerPhone,
      o.userRegisteredEmail || o.userEmail || "",
      STATUS_CONFIG[o.status].label,
      formatDate(o.createdAt)
    ]);
    
    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map(e => e.map(f => `"${String(f).replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Header Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.25rem", margin: 0 }}>تصفية الطلبات</h2>
        <button 
          onClick={handleExportCSV}
          disabled={orders.length === 0}
          className="admin-btn-secondary"
          style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <Download size={16} />
          تصدير CSV
        </button>
      </div>

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
                <div className="admin-order-title ">
                  <Package size={16} />
                  {order.itemTitle}
                  {order.totalPrice !== undefined && order.totalPrice > 0 && (
                    <span className="admin-order-price-badge">
                      {formatPriceWithCommas(String(order.totalPrice))} {getCurrencySymbol(order.priceCurrency || "USD")}
                    </span>
                  )}

                  
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
                  {order.service && (
                    <div className="admin-order-customer-item">
                      <Layers size={14} />
                      <span>{order.service}{order.section ? ` / ${order.section}` : ""}</span>
                    </div>
                  )}
                </div>
                   <span className="admin-order-type-badge ">
                     {order.id}
                </span>
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
