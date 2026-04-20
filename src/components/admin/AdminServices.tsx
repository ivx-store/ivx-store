import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Image, Loader2, LayoutGrid } from "lucide-react";
import { ServiceData, getServices, deleteService } from "../../lib/firebase";
import { ServiceEditor } from "./ServiceEditor";

interface AdminServicesProps {
  onCountChange?: (count: number) => void;
}

export function AdminServices({ onCountChange }: AdminServicesProps) {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "editor">("list");
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<ServiceData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState("");

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await getServices();
      setServices(data);
      onCountChange?.(data.length);
    } catch (err) {
      console.error("Error fetching services:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async () => {
    if (!deleteModal?.id) return;
    setDeleting(true);
    try {
      await deleteService(deleteModal.id);
      setDeleteModal(null);
      setToast("✅ تم حذف الخدمة بنجاح");
      setTimeout(() => setToast(""), 3000);
      fetchServices();
    } catch (err) {
      console.error(err);
      setToast("❌ حدث خطأ أثناء الحذف");
      setTimeout(() => setToast(""), 3000);
    }
    setDeleting(false);
  };

  if (view === "editor") {
    return (
      <ServiceEditor
        serviceId={editId}
        onBack={() => {
          setView("list");
          setEditId(null);
        }}
        onSaved={() => {
          setView("list");
          setEditId(null);
          fetchServices();
        }}
      />
    );
  }

  return (
    <div>
      {/* Add Button */}
      <button
        className="admin-add-hero"
        onClick={() => {
          setEditId(null);
          setView("editor");
        }}
      >
        <div className="admin-add-hero-icon">
          <Plus size={24} />
        </div>
        إضافة خدمة جديدة
      </button>

      {/* Services Grid */}
      {loading ? (
        <div className="admin-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="admin-card">
              <div className="admin-skeleton" style={{ height: "180px", marginBottom: "1rem" }} />
              <div className="admin-skeleton" style={{ height: "20px", width: "60%", marginBottom: "0.5rem" }} />
              <div className="admin-skeleton" style={{ height: "16px", width: "40%", marginBottom: "1rem" }} />
              <div className="admin-skeleton" style={{ height: "32px", width: "30%" }} />
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="admin-empty" style={{ marginTop: "2rem" }}>
          <div className="admin-empty-icon">
            <LayoutGrid size={32} />
          </div>
          <h3>لا توجد خدمات بعد</h3>
          <p>اضغط على زر "إضافة خدمة جديدة" لإنشاء أول خدمة.</p>
        </div>
      ) : (
        <div className="admin-grid">
          {services.map((service) => (
            <div key={service.id} className="admin-card">
              {service.type && <div className="admin-card-badge">{service.type}</div>}
              {service.categoryId && (
                <div className="admin-card-badge" style={{
                  background: "rgba(245,158,11,0.12)",
                  color: "#fbbf24",
                  borderColor: "rgba(245,158,11,0.2)",
                  position: service.type ? "absolute" : undefined,
                  top: service.type ? "3.2rem" : undefined,
                  right: service.type ? "0.75rem" : undefined,
                  fontSize: "0.65rem",
                }}>
                  📁 قسم
                </div>
              )}
              {service.imageUrl ? (
                <img
                  src={service.imageUrl}
                  alt={service.title}
                  className="admin-card-image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              {!service.imageUrl && (
                <div className="admin-card-image-placeholder">
                  <Image size={32} />
                </div>
              )}
              <div className="admin-card-title">{service.title}</div>
              <div className="admin-card-meta">{service.description?.substring(0, 60)}...</div>
              {service.price && <div className="admin-card-price">{service.price}</div>}
              <div className="admin-card-actions">
                <button
                  className="admin-btn admin-btn-secondary"
                  onClick={() => {
                    setEditId(service.id!);
                    setView("editor");
                  }}
                >
                  <Pencil size={14} />
                  تعديل
                </button>
                <button className="admin-btn admin-btn-danger" onClick={() => setDeleteModal(service)}>
                  <Trash2 size={14} />
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="admin-modal-overlay" onClick={() => !deleting && setDeleteModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} dir="rtl">
            <div
              style={{
                width: "3.5rem",
                height: "3.5rem",
                borderRadius: "1rem",
                background: "rgba(239, 68, 68, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
              }}
            >
              <Trash2 size={24} color="#f87171" />
            </div>
            <h3>حذف الخدمة</h3>
            <p>
              هل أنت متأكد من حذف "{deleteModal.title}"؟
              <br />
              لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="admin-modal-actions">
              <button className="admin-btn admin-btn-secondary" onClick={() => setDeleteModal(null)} disabled={deleting}>
                إلغاء
              </button>
              <button className="admin-btn admin-btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={16} />}
                {deleting ? "جاري الحذف..." : "حذف نهائي"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="admin-toast">{toast}</div>}
    </div>
  );
}
