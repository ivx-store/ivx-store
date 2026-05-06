import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, Star, Eye, EyeOff, Search, ArrowUp, ArrowDown, X, Save, MessageSquareQuote, Upload } from "lucide-react";
import { TestimonialData, getTestimonials, addTestimonial, updateTestimonial, deleteTestimonial } from "../../lib/firebase";

const defaultTestimonials: Omit<TestimonialData, "id" | "createdAt" | "updatedAt">[] = [
  { name: "أحمد محمد", role: "لاعب محترف", content: "متجر ivx هو الأفضل بلا منازع! أسعار الاشتراكات ممتازة والتسليم فوري. أنصح كل جيمر بالتعامل معهم.", imageUrl: "https://randomuser.me/api/portraits/men/32.jpg", rating: 5, order: 1, active: true },
  { name: "سارة خالد", role: "صانعة محتوى", content: "أفضل متجر تعاملت معاه، حسابات مضمونة وخدمة عملاء سريعة ومتعاونة جداً. شكراً ivx!", imageUrl: "https://randomuser.me/api/portraits/women/44.jpg", rating: 5, order: 2, active: true },
  { name: "فهد العتيبي", role: "صاحب متجر ألعاب", content: "نتعامل مع ivx بالجملة منذ فترة، أسعارهم لا تقبل المنافسة والمصداقية عالية جداً. شركاء نجاح حقيقيين.", imageUrl: "https://randomuser.me/api/portraits/men/46.jpg", rating: 5, order: 3, active: true },
  { name: "نورة السعد", role: "لاعبة", content: "تجربة شراء رائعة، حصلت على اللعبة اللي أبيها بسعر خيالي وفي ثواني. متجر موثوق 100%.", imageUrl: "https://randomuser.me/api/portraits/women/68.jpg", rating: 5, order: 4, active: true },
  { name: "عبدالله الراجحي", role: "ستريمر", content: "دايماً أشحن رصيدي من عندهم، سرعة وأمان وأسعار تنافسية. أفضل متجر في العراق بدون شك.", imageUrl: "https://randomuser.me/api/portraits/men/75.jpg", rating: 5, order: 5, active: true },
];

const emptyForm: Omit<TestimonialData, "id" | "createdAt" | "updatedAt"> = {
  name: "", role: "", content: "", imageUrl: "", rating: 5, order: 0, active: true,
};

export function AdminTestimonials() {
  const [items, setItems] = useState<TestimonialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<TestimonialData | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<TestimonialData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState("");
  const [seeding, setSeeding] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchData = async () => {
    setLoading(true);
    try { setItems(await getTestimonials()); } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, order: items.length + 1 });
    setShowForm(true);
  };

  const openEdit = (item: TestimonialData) => {
    setEditing(item);
    setForm({ name: item.name, role: item.role, content: item.content, imageUrl: item.imageUrl, rating: item.rating, order: item.order, active: item.active });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.content.trim()) { showToast("❌ يرجى تعبئة الاسم والتعليق"); return; }
    setSaving(true);
    try {
      if (editing?.id) { await updateTestimonial(editing.id, form); showToast("✅ تم تحديث التعليق"); }
      else { await addTestimonial(form); showToast("✅ تم إضافة التعليق"); }
      setShowForm(false); setEditing(null); fetchData();
    } catch (e) { console.error(e); showToast("❌ حدث خطأ"); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteModal?.id) return;
    setDeleting(true);
    try { await deleteTestimonial(deleteModal.id); setDeleteModal(null); showToast("✅ تم حذف التعليق"); fetchData(); }
    catch (e) { console.error(e); showToast("❌ حدث خطأ أثناء الحذف"); }
    setDeleting(false);
  };

  const toggleActive = async (item: TestimonialData) => {
    if (!item.id) return;
    try { await updateTestimonial(item.id, { active: !item.active }); showToast(item.active ? "⏸️ تم إلغاء التفعيل" : "✅ تم التفعيل"); fetchData(); }
    catch (e) { console.error(e); }
  };

  const moveOrder = async (item: TestimonialData, direction: "up" | "down") => {
    if (!item.id) return;
    const idx = items.findIndex(i => i.id === item.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return;
    const other = items[swapIdx];
    if (!other.id) return;
    try {
      await updateTestimonial(item.id, { order: other.order });
      await updateTestimonial(other.id, { order: item.order });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const seedDefaults = async () => {
    setSeeding(true);
    try {
      for (const t of defaultTestimonials) {
        await addTestimonial(t);
      }
      showToast("✅ تم إضافة التعليقات الافتراضية");
      fetchData();
    } catch (e) { console.error(e); showToast("❌ حدث خطأ"); }
    setSeeding(false);
  };

  const filtered = items.filter(i => !search || i.name.includes(search) || i.content.includes(search) || i.role.includes(search));

  return (
    <div>
      {/* Search & Add */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
          <Search size={16} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "#555", pointerEvents: "none" }} />
          <input
            className="admin-form-input"
            placeholder="بحث في التعليقات..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingRight: "2.5rem" }}
          />
        </div>
        {items.length === 0 && !loading && (
          <button className="admin-btn admin-btn-secondary" onClick={seedDefaults} disabled={seeding} style={{ whiteSpace: "nowrap" }}>
            {seeding ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={16} />}
            {seeding ? "جاري الإضافة..." : "إضافة البيانات الافتراضية"}
          </button>
        )}
        <button className="admin-btn admin-btn-primary" onClick={openAdd} style={{ whiteSpace: "nowrap" }}>
          <Plus size={18} />
          إضافة تعليق
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="admin-modal-overlay" onClick={() => !saving && setShowForm(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} dir="rtl" style={{ maxWidth: "560px", width: "95%", maxHeight: "90vh", overflowY: "auto" }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.75rem", background: "rgba(20,184,166,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#14b8a6" }}>
                  <MessageSquareQuote size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900 }}>{editing ? "تعديل التعليق" : "إضافة تعليق جديد"}</h3>
              </div>
              <button onClick={() => setShowForm(false)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.5rem", color: "#888", cursor: "pointer", width: "2rem", height: "2rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={16} />
              </button>
            </div>

            {/* Form Body */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Name & Role Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-form-label">الاسم *</label>
                  <input className="admin-form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="أحمد محمد" />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-form-label">الدور</label>
                  <input className="admin-form-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="لاعب محترف" />
                </div>
              </div>

              {/* Content */}
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label className="admin-form-label">التعليق *</label>
                <textarea className="admin-form-input admin-form-textarea" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="اكتب نص التعليق هنا..." rows={4} />
              </div>

              {/* Image URL */}
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label className="admin-form-label">رابط الصورة</label>
                <input className="admin-form-input" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://example.com/photo.jpg" dir="ltr" />
              </div>

              {/* Rating & Order Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-form-label">التقييم</label>
                  <div style={{ display: "flex", gap: "6px", paddingTop: "0.5rem" }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setForm({ ...form, rating: n })} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", transition: "transform 0.2s" }}>
                        <Star size={26} fill={n <= form.rating ? "#f59e0b" : "transparent"} color={n <= form.rating ? "#f59e0b" : "#444"} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-form-label">الترتيب</label>
                  <input className="admin-form-input" type="number" min={1} value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} />
                </div>
              </div>

              {/* Active Toggle */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", borderRadius: "0.75rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#aaa" }}>حالة التفعيل</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "0.8rem", color: form.active ? "#22c55e" : "#888", fontWeight: 700 }}>
                    {form.active ? "مفعّل" : "معطّل"}
                  </span>
                  <button onClick={() => setForm({ ...form, active: !form.active })} style={{
                    width: "48px", height: "26px", borderRadius: "13px", border: "none", cursor: "pointer", position: "relative", transition: "background 0.3s",
                    background: form.active ? "#22c55e" : "#333",
                  }}>
                    <div style={{
                      width: "20px", height: "20px", borderRadius: "50%", background: "#fff", position: "absolute", top: "3px", transition: "all 0.3s",
                      right: form.active ? "3px" : "auto", left: form.active ? "auto" : "3px",
                    }} />
                  </button>
                </div>
              </div>

              {/* Preview Card */}
              {(form.name || form.imageUrl) && (
                <div style={{ padding: "1rem", borderRadius: "1rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#555", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>معاينة</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {form.imageUrl ? (
                      <img src={form.imageUrl} alt="" style={{ width: "52px", height: "52px", borderRadius: "50%", objectFit: "cover", border: "2px solid #222" }} onError={e => (e.currentTarget.style.display = "none")} />
                    ) : (
                      <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontWeight: 900, fontSize: "1.2rem", border: "2px solid #222" }}>
                        {form.name ? form.name.charAt(0) : "?"}
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, color: "#fff", fontSize: "0.95rem" }}>{form.name || "الاسم"}</div>
                      <div style={{ color: "#666", fontSize: "0.75rem", fontWeight: 600 }}>{form.role || "الدور"}</div>
                      <div style={{ display: "flex", gap: "2px", marginTop: "4px" }}>
                        {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < form.rating ? "#f59e0b" : "transparent"} color={i < form.rating ? "#f59e0b" : "#333"} />)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="admin-modal-actions" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowForm(false)} disabled={saving}>إلغاء</button>
              <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
                {saving ? "جاري الحفظ..." : "حفظ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="admin-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="admin-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <div className="admin-skeleton" style={{ height: "48px", width: "48px", borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="admin-skeleton" style={{ height: "16px", width: "60%", marginBottom: "0.4rem" }} />
                  <div className="admin-skeleton" style={{ height: "12px", width: "40%" }} />
                </div>
              </div>
              <div className="admin-skeleton" style={{ height: "14px", width: "100%", marginBottom: "0.4rem" }} />
              <div className="admin-skeleton" style={{ height: "14px", width: "80%", marginBottom: "1rem" }} />
              <div className="admin-skeleton" style={{ height: "36px", width: "100%" }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty" style={{ marginTop: "2rem" }}>
          <div className="admin-empty-icon"><MessageSquareQuote size={32} /></div>
          <h3>{search ? "لا توجد نتائج" : "لا توجد تعليقات بعد"}</h3>
          <p>{search ? "جرب كلمات بحث مختلفة" : "اضغط على \"إضافة تعليق\" لإنشاء أول تعليق أو \"إضافة البيانات الافتراضية\""}</p>
        </div>
      ) : (
        <div className="admin-grid">
          {filtered.map((item, idx) => (
            <div key={item.id} className="admin-card" style={{ opacity: item.active ? 1 : 0.5, position: "relative" }}>
              {!item.active && (
                <div className="admin-card-badge" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>معطّل</div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", border: "2px solid #222", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontWeight: 900, fontSize: "1.1rem", flexShrink: 0 }}>
                    {item.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="admin-card-title" style={{ marginBottom: "0.15rem", fontSize: "0.95rem" }}>{item.name}</div>
                  <div style={{ color: "#666", fontSize: "0.75rem", fontWeight: 600 }}>{item.role}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "2px", marginBottom: "0.5rem" }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < item.rating ? "#f59e0b" : "transparent"} color={i < item.rating ? "#f59e0b" : "#333"} />
                ))}
              </div>

              <div className="admin-card-meta" style={{ fontSize: "0.8rem", lineHeight: 1.7, marginBottom: "1rem", minHeight: "2.5rem" }}>
                "{item.content.length > 100 ? item.content.substring(0, 100) + "..." : item.content}"
              </div>

              <div className="admin-card-actions" style={{ flexWrap: "wrap" }}>
                <button className="admin-btn admin-btn-secondary" onClick={() => openEdit(item)} style={{ flex: 1 }}>
                  <Pencil size={13} /> تعديل
                </button>
                <button className="admin-btn admin-btn-secondary" onClick={() => toggleActive(item)} title={item.active ? "إلغاء التفعيل" : "تفعيل"} style={{ padding: "0.65rem" }}>
                  {item.active ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button className="admin-btn admin-btn-secondary" onClick={() => moveOrder(item, "up")} disabled={idx === 0} style={{ padding: "0.65rem", opacity: idx === 0 ? 0.3 : 1 }}>
                  <ArrowUp size={14} />
                </button>
                <button className="admin-btn admin-btn-secondary" onClick={() => moveOrder(item, "down")} disabled={idx === filtered.length - 1} style={{ padding: "0.65rem", opacity: idx === filtered.length - 1 ? 0.3 : 1 }}>
                  <ArrowDown size={14} />
                </button>
                <button className="admin-btn admin-btn-danger" onClick={() => setDeleteModal(item)} style={{ padding: "0.65rem" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="admin-modal-overlay" onClick={() => !deleting && setDeleteModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} dir="rtl">
            <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "1rem", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              <Trash2 size={24} color="#f87171" />
            </div>
            <h3>حذف التعليق</h3>
            <p>هل أنت متأكد من حذف تعليق "{deleteModal.name}"؟<br />لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="admin-modal-actions">
              <button className="admin-btn admin-btn-secondary" onClick={() => setDeleteModal(null)} disabled={deleting}>إلغاء</button>
              <button className="admin-btn admin-btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={16} />}
                {deleting ? "جاري الحذف..." : "حذف نهائي"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="admin-toast">{toast}</div>}
    </div>
  );
}
