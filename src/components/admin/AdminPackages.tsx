import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, Star, Package } from "lucide-react";
import { PackageData, getPackages, deletePackage } from "../../lib/firebase";
import { PackageEditor } from "./PackageEditor";

interface AdminPackagesProps {
  onCountChange?: (count: number) => void;
}

export function AdminPackages({ onCountChange }: AdminPackagesProps) {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "editor">("list");
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<PackageData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState("");

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const data = await getPackages();
      setPackages(data);
      onCountChange?.(data.length);
    } catch (err) {
      console.error("Error fetching packages:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleDelete = async () => {
    if (!deleteModal?.id) return;
    setDeleting(true);
    try {
      await deletePackage(deleteModal.id);
      setDeleteModal(null);
      setToast("✅ تم حذف الباقة بنجاح");
      setTimeout(() => setToast(""), 3000);
      fetchPackages();
    } catch (err) {
      console.error(err);
      setToast("❌ حدث خطأ أثناء الحذف");
      setTimeout(() => setToast(""), 3000);
    }
    setDeleting(false);
  };

  if (view === "editor") {
    return (
      <PackageEditor
        packageId={editId}
        onBack={() => {
          setView("list");
          setEditId(null);
        }}
        onSaved={() => {
          setView("list");
          setEditId(null);
          fetchPackages();
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
        إضافة باقة جديدة
      </button>

      {/* Packages Grid */}
      {loading ? (
        <div className="admin-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="admin-card">
              <div className="admin-skeleton" style={{ height: "24px", width: "50%", marginBottom: "0.5rem" }} />
              <div className="admin-skeleton" style={{ height: "16px", width: "35%", marginBottom: "0.75rem" }} />
              <div className="admin-skeleton" style={{ height: "14px", width: "80%", marginBottom: "0.5rem" }} />
              <div className="admin-skeleton" style={{ height: "14px", width: "60%", marginBottom: "1rem" }} />
              <div className="admin-skeleton" style={{ height: "32px", width: "40%", marginBottom: "1rem" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1rem" }}>
                <div className="admin-skeleton" style={{ height: "12px", width: "70%" }} />
                <div className="admin-skeleton" style={{ height: "12px", width: "55%" }} />
                <div className="admin-skeleton" style={{ height: "12px", width: "65%" }} />
              </div>
              <div className="admin-skeleton" style={{ height: "36px" }} />
            </div>
          ))}
        </div>
      ) : packages.length === 0 ? (
        <div className="admin-empty" style={{ marginTop: "2rem" }}>
          <div className="admin-empty-icon">
            <Package size={32} />
          </div>
          <h3>لا توجد باقات بعد</h3>
          <p>اضغط على زر "إضافة باقة جديدة" لإنشاء أول باقة.</p>
        </div>
      ) : (
        <div className="admin-grid">
          {packages.map((pkg) => (
            <div key={pkg.id} className="admin-card">
              {pkg.popular && (
                <div className="admin-card-badge" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Star size={10} />
                  الأكثر طلباً
                </div>
              )}

              <div style={{ paddingTop: pkg.popular ? "0.5rem" : 0 }}>
                <div className="admin-card-title">{pkg.title}</div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
                  {pkg.subtitle}
                </div>
                <div className="admin-card-meta">{pkg.description?.substring(0, 80)}...</div>
                <div className="admin-card-price">{pkg.price}</div>

                {/* Features preview */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", marginBottom: "1rem" }}>
                  {pkg.features.slice(0, 3).map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", color: "#666" }}>
                      <div
                        style={{
                          width: "0.35rem",
                          height: "0.35rem",
                          borderRadius: "50%",
                          background: "#444",
                          flexShrink: 0,
                        }}
                      />
                      {f}
                    </div>
                  ))}
                  {pkg.features.length > 3 && (
                    <span style={{ fontSize: "0.7rem", color: "#444" }}>+{pkg.features.length - 3} ميزة أخرى</span>
                  )}
                </div>

                <div className="admin-card-actions">
                  <button
                    className="admin-btn admin-btn-secondary"
                    onClick={() => {
                      setEditId(pkg.id!);
                      setView("editor");
                    }}
                  >
                    <Pencil size={14} />
                    تعديل
                  </button>
                  <button className="admin-btn admin-btn-danger" onClick={() => setDeleteModal(pkg)}>
                    <Trash2 size={14} />
                    حذف
                  </button>
                </div>
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
            <h3>حذف الباقة</h3>
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
