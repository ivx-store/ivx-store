import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff, Search, ArrowUp, ArrowDown, X, Save, HelpCircle, Upload } from "lucide-react";
import { FAQData, getFAQs, addFAQ, updateFAQ, deleteFAQ } from "../../lib/firebase";

const defaultFAQs: Omit<FAQData, "id" | "createdAt" | "updatedAt">[] = [
  { question: "كيف أستلم طلبي بعد الدفع؟", answer: "بعد إتمام عملية الدفع بنجاح، سيتم إرسال تفاصيل طلبك (سواء كان حساب، اشتراك، أو كود لعبة) مباشرة إلى بريدك الإلكتروني المسجل، أو عبر رسالة نصية/واتساب حسب وسيلة التواصل التي اخترتها.", order: 1, active: true },
  { question: "هل الحسابات والاشتراكات مضمونة؟", answer: "نعم، جميع منتجاتنا مضمونة 100%. نحن نتعامل مع مصادر موثوقة ونقدم ضماناً كاملاً على جميع الاشتراكات والحسابات طوال فترة الصلاحية المحددة.", order: 2, active: true },
  { question: "ما هي طرق الدفع المتاحة؟", answer: "نوفر طرق دفع متعددة وآمنة تناسب الجميع في العراق، بما في ذلك ماستر كارد، زين كاش، آسيا حوالة، والبطاقات البنكية المعتمدة.", order: 3, active: true },
  { question: "هل يمكنني استرجاع المبلغ إذا واجهت مشكلة؟", answer: "بشكل عام، لا يمكن استرداد المبلغ بعد استلام الطلب. ولكن في حال مواجهة أي مشكلة، يرجى التواصل معنا؛ وسنقوم بدراسة الحالة لمعرفة نوع المشكلة، وبناءً عليها نقرر الإجراء الأنسب، سواء كان ذلك باستبدال المنتج أو استرجاع المبلغ بما يضمن حقك.", order: 4, active: true },
  { question: "هل تبيعون بالجملة لأصحاب المتاجر؟", answer: "نعم، بكل تأكيد! نحن نوفر أسعاراً خاصة ومنافسة جداً لطلبات الجملة المخصصة لأصحاب المتاجر وسناتر الألعاب (Gaming Centers). يمكنك التواصل مع فريق الدعم للحصول على قائمة أسعار الجملة وعروضنا الحصرية.", order: 5, active: true },
  { question: "متى تكون خدمة العملاء متاحة؟", answer: "فريق خدمة العملاء لدينا متواجد لخدمتكم يومياً خلال ساعات العمل الرسمية: من الساعة 12:00 ظهراً (12 PM) وحتى الساعة 12:00 منتصف الليل (12 AM).", order: 6, active: true },
];

const emptyForm: Omit<FAQData, "id" | "createdAt" | "updatedAt"> = {
  question: "", answer: "", order: 0, active: true,
};

export function AdminFAQs() {
  const [items, setItems] = useState<FAQData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<FAQData | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<FAQData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState("");
  const [seeding, setSeeding] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchData = async () => {
    setLoading(true);
    try { setItems(await getFAQs()); } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, order: items.length + 1 });
    setShowForm(true);
  };

  const openEdit = (item: FAQData) => {
    setEditing(item);
    setForm({ question: item.question, answer: item.answer, order: item.order, active: item.active });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) { showToast("❌ يرجى تعبئة السؤال والجواب"); return; }
    setSaving(true);
    try {
      if (editing?.id) { await updateFAQ(editing.id, form); showToast("✅ تم تحديث السؤال"); }
      else { await addFAQ(form); showToast("✅ تم إضافة السؤال"); }
      setShowForm(false); setEditing(null); fetchData();
    } catch (e) { console.error(e); showToast("❌ حدث خطأ"); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteModal?.id) return;
    setDeleting(true);
    try { await deleteFAQ(deleteModal.id); setDeleteModal(null); showToast("✅ تم حذف السؤال"); fetchData(); }
    catch (e) { console.error(e); showToast("❌ حدث خطأ أثناء الحذف"); }
    setDeleting(false);
  };

  const toggleActive = async (item: FAQData) => {
    if (!item.id) return;
    try { await updateFAQ(item.id, { active: !item.active }); showToast(item.active ? "⏸️ تم إلغاء التفعيل" : "✅ تم التفعيل"); fetchData(); }
    catch (e) { console.error(e); }
  };

  const moveOrder = async (item: FAQData, direction: "up" | "down") => {
    if (!item.id) return;
    const idx = items.findIndex(i => i.id === item.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return;
    const other = items[swapIdx];
    if (!other.id) return;
    try {
      await updateFAQ(item.id, { order: other.order });
      await updateFAQ(other.id, { order: item.order });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const seedDefaults = async () => {
    setSeeding(true);
    try {
      for (const f of defaultFAQs) {
        await addFAQ(f);
      }
      showToast("✅ تم إضافة الأسئلة الافتراضية");
      fetchData();
    } catch (e) { console.error(e); showToast("❌ حدث خطأ"); }
    setSeeding(false);
  };

  const filtered = items.filter(i => !search || i.question.includes(search) || i.answer.includes(search));

  return (
    <div>
      {/* Search & Add */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
          <Search size={16} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "#555", pointerEvents: "none" }} />
          <input
            className="admin-form-input"
            placeholder="بحث في الأسئلة..."
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
          إضافة سؤال
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="admin-modal-overlay" onClick={() => !saving && setShowForm(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} dir="rtl" style={{ maxWidth: "560px", width: "95%", maxHeight: "90vh", overflowY: "auto" }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.75rem", background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
                  <HelpCircle size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900 }}>{editing ? "تعديل السؤال" : "إضافة سؤال جديد"}</h3>
              </div>
              <button onClick={() => setShowForm(false)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.5rem", color: "#888", cursor: "pointer", width: "2rem", height: "2rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={16} />
              </button>
            </div>

            {/* Form Body */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Question */}
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label className="admin-form-label">السؤال *</label>
                <input className="admin-form-input" value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} placeholder="مثال: كيف أستلم طلبي بعد الدفع؟" />
              </div>

              {/* Answer */}
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label className="admin-form-label">الجواب *</label>
                <textarea className="admin-form-input admin-form-textarea" value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} placeholder="اكتب الجواب التفصيلي هنا..." rows={6} />
              </div>

              {/* Order & Active Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-form-label">الترتيب</label>
                  <input className="admin-form-input" type="number" min={1} value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} />
                </div>
                {/* Active Toggle */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label className="admin-form-label">الحالة</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0.75rem", borderRadius: "0.75rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", height: "100%", boxSizing: "border-box" }}>
                    <button onClick={() => setForm({ ...form, active: !form.active })} style={{
                      width: "44px", height: "24px", borderRadius: "12px", border: "none", cursor: "pointer", position: "relative", transition: "background 0.3s",
                      background: form.active ? "#22c55e" : "#333", flexShrink: 0,
                    }}>
                      <div style={{
                        width: "18px", height: "18px", borderRadius: "50%", background: "#fff", position: "absolute", top: "3px", transition: "all 0.3s",
                        right: form.active ? "3px" : "auto", left: form.active ? "auto" : "3px",
                      }} />
                    </button>
                    <span style={{ fontSize: "0.8rem", color: form.active ? "#22c55e" : "#888", fontWeight: 700 }}>
                      {form.active ? "مفعّل" : "معطّل"}
                    </span>
                  </div>
                </div>
              </div>
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
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="admin-card">
              <div className="admin-skeleton" style={{ height: "18px", width: "55%", marginBottom: "0.6rem" }} />
              <div className="admin-skeleton" style={{ height: "14px", width: "85%", marginBottom: "0.4rem" }} />
              <div className="admin-skeleton" style={{ height: "14px", width: "70%" }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty" style={{ marginTop: "2rem" }}>
          <div className="admin-empty-icon"><HelpCircle size={32} /></div>
          <h3>{search ? "لا توجد نتائج" : "لا توجد أسئلة شائعة بعد"}</h3>
          <p>{search ? "جرب كلمات بحث مختلفة" : "اضغط على \"إضافة سؤال\" أو \"إضافة البيانات الافتراضية\""}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filtered.map((item, idx) => (
            <div key={item.id} className="admin-card" style={{ opacity: item.active ? 1 : 0.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                    <div style={{ width: "1.75rem", height: "1.75rem", borderRadius: "0.5rem", background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <HelpCircle size={14} color="#f59e0b" />
                    </div>
                    <span className="admin-card-title" style={{ marginBottom: 0, fontSize: "0.95rem" }}>{item.question}</span>
                    {!item.active && (
                      <span style={{ fontSize: "0.65rem", background: "rgba(239,68,68,0.15)", color: "#f87171", padding: "2px 8px", borderRadius: "6px", fontWeight: 700, flexShrink: 0 }}>معطّل</span>
                    )}
                  </div>
                  <p className="admin-card-meta" style={{ fontSize: "0.8rem", lineHeight: 1.8, margin: 0 }}>
                    {item.answer.length > 150 ? item.answer.substring(0, 150) + "..." : item.answer}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0, flexWrap: "wrap" }}>
                  <button className="admin-btn admin-btn-secondary" onClick={() => openEdit(item)} title="تعديل" style={{ padding: "0.5rem 0.75rem" }}>
                    <Pencil size={14} />
                  </button>
                  <button className="admin-btn admin-btn-secondary" onClick={() => toggleActive(item)} title={item.active ? "إلغاء التفعيل" : "تفعيل"} style={{ padding: "0.5rem 0.75rem" }}>
                    {item.active ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button className="admin-btn admin-btn-secondary" onClick={() => moveOrder(item, "up")} disabled={idx === 0} style={{ padding: "0.5rem 0.75rem", opacity: idx === 0 ? 0.3 : 1 }}>
                    <ArrowUp size={14} />
                  </button>
                  <button className="admin-btn admin-btn-secondary" onClick={() => moveOrder(item, "down")} disabled={idx === filtered.length - 1} style={{ padding: "0.5rem 0.75rem", opacity: idx === filtered.length - 1 ? 0.3 : 1 }}>
                    <ArrowDown size={14} />
                  </button>
                  <button className="admin-btn admin-btn-danger" onClick={() => setDeleteModal(item)} style={{ padding: "0.5rem 0.75rem" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
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
            <h3>حذف السؤال</h3>
            <p>هل أنت متأكد من حذف هذا السؤال؟<br />لا يمكن التراجع عن هذا الإجراء.</p>
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
