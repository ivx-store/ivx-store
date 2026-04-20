import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Image, Loader2, FolderOpen, Save, ArrowRight, X, GripVertical } from "lucide-react";
import {
  ServiceCategory,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getServiceTypes,
  getServices,
} from "../../lib/firebase";

interface AdminCategoriesProps {
  onCountChange?: (count: number) => void;
}

const defaultCategory: Omit<ServiceCategory, "id" | "createdAt" | "updatedAt"> = {
  name: "",
  description: "",
  imageUrl: "",
  serviceType: "",
  order: 0,
};

export function AdminCategories({ onCountChange }: AdminCategoriesProps) {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [serviceCounts, setServiceCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "editor">("list");
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultCategory);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<ServiceCategory | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cats, types, services] = await Promise.all([
        getCategories(),
        getServiceTypes(),
        getServices(),
      ]);
      setCategories(cats);
      setServiceTypes(types);
      onCountChange?.(cats.length);

      // Count services per category
      const counts: Record<string, number> = {};
      services.forEach((s) => {
        if (s.categoryId) {
          counts[s.categoryId] = (counts[s.categoryId] || 0) + 1;
        }
      });
      setServiceCounts(counts);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleEdit = (cat: ServiceCategory) => {
    setEditId(cat.id || null);
    setFormData({
      name: cat.name,
      description: cat.description,
      imageUrl: cat.imageUrl,
      serviceType: cat.serviceType,
      order: cat.order,
    });
    setView("editor");
  };

  const handleCreate = () => {
    setEditId(null);
    setFormData({ ...defaultCategory, order: categories.length });
    setView("editor");
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showToast("⚠️ يرجى إدخال اسم القسم");
      return;
    }
    if (!formData.serviceType) {
      showToast("⚠️ يرجى اختيار نوع الخدمة");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await updateCategory(editId, formData);
      } else {
        await addCategory(formData);
      }
      showToast("✅ تم الحفظ بنجاح!");
      setTimeout(() => {
        setView("list");
        setEditId(null);
        fetchData();
      }, 1000);
    } catch (err) {
      console.error(err);
      showToast("❌ حدث خطأ أثناء الحفظ");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteModal?.id) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteModal.id);
      setDeleteModal(null);
      showToast("✅ تم حذف القسم بنجاح");
      fetchData();
    } catch (err) {
      console.error(err);
      showToast("❌ حدث خطأ أثناء الحذف");
    }
    setDeleting(false);
  };

  // ─── Editor View ───
  if (view === "editor") {
    return (
      <div>
        {/* Top Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button className="admin-btn-secondary" onClick={() => { setView("list"); setEditId(null); }}>
              <ArrowRight size={18} />
              رجوع
            </button>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 900 }}>{editId ? "تعديل القسم" : "إنشاء قسم جديد"}</h2>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={18} />}
            {saving ? "جاري الحفظ..." : "حفظ"}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem" }}>
          {/* Form */}
          <div className="admin-editor-form" style={{ borderRadius: "1.5rem", overflow: "hidden" }}>
            <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FolderOpen size={18} color="#f59e0b" />
              <span style={{ fontWeight: 800, fontSize: "1rem" }}>بيانات القسم</span>
            </div>
            <div style={{ padding: "1.5rem" }}>
              <div className="admin-form-group">
                <label className="admin-form-label">اسم القسم</label>
                <input
                  className="admin-form-input"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="مثال: GTA للبيسي"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">الوصف</label>
                <textarea
                  className="admin-form-input admin-form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="وصف مختصر يظهر للعملاء..."
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">رابط الصورة</label>
                <input
                  className="admin-form-input"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData((p) => ({ ...p, imageUrl: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  dir="ltr"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">نوع الخدمة (التبويب)</label>
                <select
                  className="admin-form-input admin-form-select"
                  value={formData.serviceType}
                  onChange={(e) => setFormData((p) => ({ ...p, serviceType: e.target.value }))}
                >
                  <option value="">— اختر نوع الخدمة —</option>
                  {serviceTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">الترتيب</label>
                <input
                  className="admin-form-input"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))}
                  min={0}
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="admin-editor-form" style={{ borderRadius: "1.5rem", overflow: "hidden", alignSelf: "start" }}>
            <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", animation: "pulse 2s infinite" }} />
              <span style={{ fontWeight: 800, fontSize: "0.85rem", color: "#888" }}>معاينة البطاقة</span>
            </div>
            <div style={{ padding: "1.25rem" }}>
              <div style={{
                borderRadius: "1rem",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.02)",
              }}>
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt=""
                    style={{ width: "100%", height: "140px", objectFit: "cover", display: "block" }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div style={{ width: "100%", height: "140px", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Image size={32} color="#333" />
                  </div>
                )}
                <div style={{ padding: "1rem" }}>
                  {formData.serviceType && (
                    <span style={{
                      fontSize: "0.65rem", fontWeight: 800, color: "#f59e0b",
                      background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)",
                      padding: "0.15rem 0.5rem", borderRadius: "0.3rem", marginBottom: "0.5rem", display: "inline-block",
                    }}>
                      {formData.serviceType}
                    </span>
                  )}
                  <div style={{ fontWeight: 900, fontSize: "1rem", color: "#fff", marginBottom: "0.3rem" }}>
                    {formData.name || "اسم القسم"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#666", lineHeight: 1.6 }}>
                    {formData.description || "وصف القسم يظهر هنا..."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {toast && <div className="admin-toast">{toast}</div>}
      </div>
    );
  }

  // ─── List View ───
  return (
    <div>
      {/* Add Button */}
      <button className="admin-add-hero" onClick={handleCreate}>
        <div className="admin-add-hero-icon">
          <Plus size={24} />
        </div>
        إضافة قسم جديد
      </button>

      {/* Categories Grid */}
      {loading ? (
        <div className="admin-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="admin-card">
              <div className="admin-skeleton" style={{ height: "180px", marginBottom: "1rem" }} />
              <div className="admin-skeleton" style={{ height: "20px", width: "60%", marginBottom: "0.5rem" }} />
              <div className="admin-skeleton" style={{ height: "16px", width: "40%", marginBottom: "1rem" }} />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="admin-empty" style={{ marginTop: "2rem" }}>
          <div className="admin-empty-icon">
            <FolderOpen size={32} />
          </div>
          <h3>لا توجد أقسام بعد</h3>
          <p>اضغط على زر "إضافة قسم جديد" لإنشاء أول قسم.</p>
        </div>
      ) : (
        <div className="admin-grid">
          {categories.map((cat) => (
            <div key={cat.id} className="admin-card">
              {cat.serviceType && <div className="admin-card-badge" style={{
                background: "rgba(245,158,11,0.12)",
                color: "#fbbf24",
                borderColor: "rgba(245,158,11,0.2)",
              }}>{cat.serviceType}</div>}
              {cat.imageUrl ? (
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="admin-card-image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="admin-card-image-placeholder">
                  <Image size={32} />
                </div>
              )}
              <div className="admin-card-title">{cat.name}</div>
              <div className="admin-card-meta">{cat.description?.substring(0, 60)}{cat.description?.length > 60 ? "..." : ""}</div>
              <div style={{
                display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem",
              }}>
                <span style={{
                  fontSize: "0.75rem", fontWeight: 700, color: "#888",
                  background: "rgba(255,255,255,0.05)", padding: "0.2rem 0.6rem",
                  borderRadius: "0.4rem", border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  {serviceCounts[cat.id!] || 0} خدمة
                </span>
                <span style={{
                  fontSize: "0.7rem", fontWeight: 600, color: "#555",
                }}>
                  ترتيب: {cat.order}
                </span>
              </div>
              <div className="admin-card-actions">
                <button
                  className="admin-btn admin-btn-secondary"
                  onClick={() => handleEdit(cat)}
                >
                  <Pencil size={14} />
                  تعديل
                </button>
                <button className="admin-btn admin-btn-danger" onClick={() => setDeleteModal(cat)}>
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
            <div style={{
              width: "3.5rem", height: "3.5rem", borderRadius: "1rem",
              background: "rgba(239, 68, 68, 0.1)", display: "flex",
              alignItems: "center", justifyContent: "center", margin: "0 auto 1rem",
            }}>
              <Trash2 size={24} color="#f87171" />
            </div>
            <h3>حذف القسم</h3>
            <p>
              هل أنت متأكد من حذف "{deleteModal.name}"؟
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
