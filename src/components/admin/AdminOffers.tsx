import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, Flame, Percent, ToggleLeft, ToggleRight } from "lucide-react";
import { OfferData, getOffers, deleteOffer, updateOffer } from "../../lib/firebase";
import { OfferEditor } from "./OfferEditor";

interface AdminOffersProps {
  onCountChange?: (count: number) => void;
}

export function AdminOffers({ onCountChange }: AdminOffersProps) {
  const [offers, setOffers] = useState<OfferData[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "editor">("list");
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<OfferData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState("");

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const data = await getOffers();
      setOffers(data);
      onCountChange?.(data.length);
    } catch (err) {
      console.error("Error fetching offers:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleDelete = async () => {
    if (!deleteModal?.id) return;
    setDeleting(true);
    try {
      await deleteOffer(deleteModal.id);
      setDeleteModal(null);
      setToast("✅ تم حذف العرض بنجاح");
      setTimeout(() => setToast(""), 3000);
      fetchOffers();
    } catch (err) {
      console.error(err);
      setToast("❌ حدث خطأ أثناء الحذف");
      setTimeout(() => setToast(""), 3000);
    }
    setDeleting(false);
  };

  const toggleActive = async (offer: OfferData) => {
    try {
      await updateOffer(offer.id!, { active: !offer.active });
      setToast(offer.active ? "⏸️ تم تعطيل العرض" : "✅ تم تفعيل العرض");
      setTimeout(() => setToast(""), 3000);
      fetchOffers();
    } catch (err) {
      console.error(err);
    }
  };

  if (view === "editor") {
    return (
      <OfferEditor
        offerId={editId}
        onBack={() => {
          setView("list");
          setEditId(null);
        }}
        onSaved={() => {
          setView("list");
          setEditId(null);
          fetchOffers();
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
        إضافة عرض جديد
      </button>

      {/* Offers Grid */}
      {loading ? (
        <div className="admin-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="admin-card">
              <div className="admin-skeleton" style={{ height: "24px", width: "50%", marginBottom: "0.5rem" }} />
              <div className="admin-skeleton" style={{ height: "16px", width: "35%", marginBottom: "0.75rem" }} />
              <div className="admin-skeleton" style={{ height: "40px", width: "60%", marginBottom: "1rem" }} />
              <div className="admin-skeleton" style={{ height: "36px" }} />
            </div>
          ))}
        </div>
      ) : offers.length === 0 ? (
        <div className="admin-empty" style={{ marginTop: "2rem" }}>
          <div className="admin-empty-icon">
            <Flame size={32} />
          </div>
          <h3>لا توجد عروض بعد</h3>
          <p>اضغط على زر "إضافة عرض جديد" لإنشاء أول عرض.</p>
        </div>
      ) : (
        <div className="admin-grid">
          {offers.map((offer) => (
            <div key={offer.id} className="admin-card" style={{ borderColor: offer.active ? `${offer.badgeColor}30` : undefined }}>
              {/* Status + Badge */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <div
                  className="admin-card-badge"
                  style={{
                    position: "relative",
                    top: 0,
                    left: 0,
                    background: `${offer.badgeColor}25`,
                    color: offer.badgeColor,
                  }}
                >
                  {offer.badge}
                </div>
                <button
                  onClick={() => toggleActive(offer)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: offer.active ? "#22c55e" : "#666",
                    background: "none",
                    border: "none",
                    fontFamily: "inherit",
                  }}
                >
                  {offer.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  {offer.active ? "فعّال" : "معطّل"}
                </button>
              </div>

              <div className="admin-card-title">{offer.title}</div>
              
              {/* Pricing */}
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "1.25rem", fontWeight: 900, color: "#fff" }}>
                  {offer.discountedPrice} {offer.currency === "USD" ? "$" : "د.ع"}
                </span>
                <span style={{ fontSize: "0.85rem", color: "#666", textDecoration: "line-through" }}>
                  {offer.originalPrice}
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    padding: "0.15rem 0.5rem",
                    borderRadius: "0.3rem",
                    background: "rgba(239,68,68,0.15)",
                    color: "#f87171",
                  }}
                >
                  -{offer.discount}%
                </span>
              </div>

              <div className="admin-card-meta">{offer.category}</div>

              <div className="admin-card-actions">
                <button
                  className="admin-btn admin-btn-secondary"
                  onClick={() => {
                    setEditId(offer.id!);
                    setView("editor");
                  }}
                >
                  <Pencil size={14} />
                  تعديل
                </button>
                <button className="admin-btn admin-btn-danger" onClick={() => setDeleteModal(offer)}>
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
            <h3>حذف العرض</h3>
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
