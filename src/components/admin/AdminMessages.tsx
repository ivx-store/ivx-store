import { useState, useEffect } from "react";
import { MessageCircle, Loader2, Mail, MailOpen, Phone, User, Clock, Trash2, CheckCheck, X } from "lucide-react";
import { MessageData, getMessages, markMessageRead, deleteMessage } from "../../lib/firebase";

interface AdminMessagesProps {
  onCountChange?: (count: number) => void;
}

function MessageDetailModal({ msg, onClose, onToggleRead, onDelete }: {
  msg: MessageData;
  onClose: () => void;
  onToggleRead: (msg: MessageData) => void;
  onDelete: (id: string) => void;
}) {
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
            <div className="admin-detail-modal-status" style={{
              background: msg.read ? "rgba(85,85,85,0.1)" : "rgba(59,130,246,0.1)",
              color: msg.read ? "#888" : "#3b82f6",
            }}>
              {msg.read ? <MailOpen size={14} /> : <Mail size={14} />}
              {msg.read ? "مقروءة" : "جديدة"}
            </div>
          </div>
          <button onClick={onClose} className="admin-detail-modal-close">
            <X size={18} />
          </button>
        </div>

        {/* Sender Info Grid */}
        <div className="admin-detail-modal-grid">
          <div className="admin-detail-modal-info">
            <div className="admin-detail-modal-info-label"><User size={13} /> الاسم</div>
            <div className="admin-detail-modal-info-value">{msg.name || "—"}</div>
          </div>
          {msg.phone && (
            <div className="admin-detail-modal-info">
              <div className="admin-detail-modal-info-label"><Phone size={13} /> رقم الهاتف</div>
              <div className="admin-detail-modal-info-value" dir="ltr" style={{ textAlign: "left" }}>{msg.phone}</div>
            </div>
          )}
          {msg.email && (
            <div className="admin-detail-modal-info">
              <div className="admin-detail-modal-info-label"><Mail size={13} /> البريد الإلكتروني</div>
              <div className="admin-detail-modal-info-value" dir="ltr" style={{ textAlign: "left" }}>{msg.email}</div>
            </div>
          )}
          <div className="admin-detail-modal-info">
            <div className="admin-detail-modal-info-label"><Clock size={13} /> تاريخ الإرسال</div>
            <div className="admin-detail-modal-info-value">{formatDate(msg.createdAt)}</div>
          </div>
        </div>

        {/* Message Body */}
        <div className="admin-detail-modal-section">
          <div className="admin-detail-modal-info-label" style={{ marginBottom: "0.5rem" }}><MessageCircle size={13} /> نص الرسالة</div>
          <div className="admin-detail-modal-message">{msg.message}</div>
        </div>

        {/* Actions */}
        <div className="admin-detail-modal-actions">
          <button
            className="admin-btn-secondary"
            style={{ fontSize: "0.8rem", padding: "0.5rem 1rem" }}
            onClick={() => { onToggleRead(msg); onClose(); }}
          >
            {msg.read ? <Mail size={14} /> : <CheckCheck size={14} />}
            {msg.read ? "غير مقروءة" : "مقروءة"}
          </button>
          {confirmDelete ? (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className="admin-btn-secondary"
                style={{ fontSize: "0.8rem", padding: "0.5rem 1rem", color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }}
                onClick={async () => {
                  setDeleting(true);
                  await onDelete(msg.id!);
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

export function AdminMessages({ onCountChange }: AdminMessagesProps) {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [selectedMsg, setSelectedMsg] = useState<MessageData | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await getMessages();
      setMessages(data);
      onCountChange?.(data.filter(m => !m.read).length);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleToggleRead = async (msg: MessageData) => {
    try {
      await markMessageRead(msg.id!, !msg.read);
      setToast(msg.read ? "📩 تم تعيين الرسالة كغير مقروءة" : "✅ تم تعيين الرسالة كمقروءة");
      setTimeout(() => setToast(""), 3000);
      fetchMessages();
    } catch (err) {
      console.error(err);
      setToast("❌ حدث خطأ");
      setTimeout(() => setToast(""), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMessage(id);
      setToast("🗑️ تم حذف الرسالة");
      setTimeout(() => setToast(""), 3000);
      fetchMessages();
    } catch (err) {
      console.error(err);
      setToast("❌ حدث خطأ أثناء الحذف");
      setTimeout(() => setToast(""), 3000);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "—";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("ar-IQ", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    }).format(date);
  };

  const filteredMessages = filter === "all"
    ? messages
    : filter === "unread"
    ? messages.filter(m => !m.read)
    : messages.filter(m => m.read);

  const unreadCount = messages.filter(m => !m.read).length;
  const readCount = messages.filter(m => m.read).length;

  return (
    <div>
      {/* Filter Tabs */}
      <div className="admin-order-filters">
        {([
          { id: "all" as const, label: "الكل", count: messages.length },
          { id: "unread" as const, label: "غير مقروءة", count: unreadCount },
          { id: "read" as const, label: "مقروءة", count: readCount },
        ]).map(f => (
          <button
            key={f.id}
            className={`admin-order-filter ${filter === f.id ? "active" : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {f.id === "unread" && <Mail size={14} />}
            {f.id === "read" && <MailOpen size={14} />}
            {f.id === "all" && <MessageCircle size={14} />}
            <span>{f.label}</span>
            <span className="admin-order-filter-count">{f.count}</span>
          </button>
        ))}
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
      ) : filteredMessages.length === 0 ? (
        <div className="admin-empty" style={{ marginTop: "2rem" }}>
          <div className="admin-empty-icon">
            <MessageCircle size={32} />
          </div>
          <h3>{filter === "all" ? "لا توجد رسائل بعد" : filter === "unread" ? "لا توجد رسائل غير مقروءة" : "لا توجد رسائل مقروءة"}</h3>
          <p>ستظهر الرسائل هنا عندما يتواصل معك العملاء من صفحة التواصل.</p>
        </div>
      ) : (
        <div className="admin-orders-list">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className="admin-order-card admin-order-card-clickable"
              style={{
                borderRightColor: msg.read ? "#555" : "#3b82f6",
                opacity: msg.read ? 0.75 : 1,
              }}
              onClick={() => setSelectedMsg(msg)}
            >
              {/* Compact Summary */}
              <div className="admin-order-header">
                <div className="admin-order-header-right">
                  <div
                    className="admin-order-item-badge"
                    style={{
                      background: msg.read ? "rgba(85,85,85,0.1)" : "rgba(59,130,246,0.1)",
                      color: msg.read ? "#888" : "#3b82f6",
                    }}
                  >
                    {msg.read ? <MailOpen size={14} /> : <Mail size={14} />}
                    {msg.read ? "مقروءة" : "جديدة"}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Clock size={12} color="#555" />
                  <span className="admin-order-date">{formatDate(msg.createdAt)}</span>
                </div>
              </div>

              {/* Sender Name */}
              <div className="admin-order-title" style={{ fontSize: "1rem" }}>
                <User size={16} />
                {msg.name || "—"}
              </div>

              {/* Message Preview */}
              <div style={{
                fontSize: "0.8rem",
                color: "#777",
                lineHeight: 1.6,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100%",
              }}>
                {msg.message}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedMsg && (
        <MessageDetailModal
          msg={selectedMsg}
          onClose={() => setSelectedMsg(null)}
          onToggleRead={handleToggleRead}
          onDelete={handleDelete}
        />
      )}

      {/* Toast */}
      {toast && <div className="admin-toast">{toast}</div>}
    </div>
  );
}
