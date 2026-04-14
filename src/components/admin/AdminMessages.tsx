import { useState, useEffect } from "react";
import { MessageCircle, Loader2, Mail, MailOpen, Phone, User, Clock, Trash2, CheckCheck } from "lucide-react";
import { MessageData, getMessages, markMessageRead, deleteMessage } from "../../lib/firebase";

interface AdminMessagesProps {
  onCountChange?: (count: number) => void;
}

export function AdminMessages({ onCountChange }: AdminMessagesProps) {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

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
    setDeletingId(id);
    try {
      await deleteMessage(id);
      setToast("🗑️ تم حذف الرسالة");
      setTimeout(() => setToast(""), 3000);
      setConfirmDelete(null);
      fetchMessages();
    } catch (err) {
      console.error(err);
      setToast("❌ حدث خطأ أثناء الحذف");
      setTimeout(() => setToast(""), 3000);
    }
    setDeletingId(null);
  };

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
              <div className="admin-skeleton" style={{ height: "50px", width: "100%", marginBottom: "0.5rem" }} />
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
              className="admin-order-card"
              style={{
                borderRightColor: msg.read ? "#555" : "#3b82f6",
                opacity: msg.read ? 0.75 : 1,
              }}
            >
              {/* Header */}
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

              {/* Sender Info */}
              <div className="admin-order-customer" style={{ marginBottom: "0.5rem" }}>
                <div className="admin-order-customer-item">
                  <User size={14} />
                  <span style={{ fontWeight: 800, color: "#fff" }}>{msg.name || "—"}</span>
                </div>
                {msg.phone && (
                  <div className="admin-order-customer-item">
                    <Phone size={14} />
                    <span dir="ltr">{msg.phone}</span>
                  </div>
                )}
                {msg.email && (
                  <div className="admin-order-customer-item">
                    <Mail size={14} />
                    <span dir="ltr">{msg.email}</span>
                  </div>
                )}
              </div>

              {/* Message Body */}
              <div
                style={{
                  padding: "0.85rem 1rem",
                  borderRadius: "0.75rem",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  fontSize: "0.85rem",
                  color: "#ccc",
                  lineHeight: 1.8,
                  marginBottom: "0.75rem",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {msg.message}
              </div>

              {/* Actions */}
              <div className="admin-order-actions">
                <button
                  className="admin-btn-secondary"
                  style={{ fontSize: "0.75rem", padding: "0.4rem 0.85rem" }}
                  onClick={() => handleToggleRead(msg)}
                >
                  {msg.read ? <Mail size={14} /> : <CheckCheck size={14} />}
                  {msg.read ? "غير مقروءة" : "مقروءة"}
                </button>
                {confirmDelete === msg.id ? (
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      className="admin-btn-secondary"
                      style={{ fontSize: "0.75rem", padding: "0.4rem 0.85rem", color: "#ef4444", borderColor: "rgba(239,68,68,0.2)" }}
                      onClick={() => handleDelete(msg.id!)}
                      disabled={deletingId === msg.id}
                    >
                      {deletingId === msg.id ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={14} />}
                      تأكيد الحذف
                    </button>
                    <button
                      className="admin-btn-secondary"
                      style={{ fontSize: "0.75rem", padding: "0.4rem 0.85rem" }}
                      onClick={() => setConfirmDelete(null)}
                    >
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <button
                    className="admin-btn-secondary"
                    style={{ fontSize: "0.75rem", padding: "0.4rem 0.85rem", color: "#ef4444", borderColor: "rgba(239,68,68,0.15)" }}
                    onClick={() => setConfirmDelete(msg.id!)}
                  >
                    <Trash2 size={14} />
                    حذف
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Delete Modal */}
      {/* Toast */}
      {toast && <div className="admin-toast">{toast}</div>}
    </div>
  );
}
