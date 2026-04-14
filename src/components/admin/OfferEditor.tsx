import React, { useState, useEffect } from "react";
import { ArrowRight, Save, Loader2, Flame, Image, Clock, Sparkles, Send } from "lucide-react";
import {
  OfferData,
  FormField,
  Currency,
  addOffer,
  updateOffer,
  getOffer,
  formatPriceWithCommas,
  stripCommas,
  OFFER_BADGE_PRESETS,
} from "../../lib/firebase";
import { FormFieldEditor } from "./FormFieldEditor";

interface OfferEditorProps {
  offerId?: string | null;
  onBack: () => void;
  onSaved: () => void;
}

const defaultOffer: OfferData = {
  title: "",
  description: "",
  originalPrice: "",
  discountedPrice: "",
  currency: "IQD",
  discount: 0,
  badge: "عرض محدود",
  badgeColor: "#ef4444",
  gradientFrom: "rgba(239,68,68,0.2)",
  gradientTo: "transparent",
  category: "",
  imageUrl: "",
  countdownEnabled: false,
  countdownDays: 0,
  countdownHours: 23,
  countdownMinutes: 59,
  active: true,
  orderFormFields: [],
};

export function OfferEditor({ offerId, onBack, onSaved }: OfferEditorProps) {
  const [data, setData] = useState<OfferData>(defaultOffer);
  const [activeTab, setActiveTab] = useState<"details" | "form">("details");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!offerId);
  const [toast, setToast] = useState("");
  const [origPriceDisplay, setOrigPriceDisplay] = useState("");
  const [discPriceDisplay, setDiscPriceDisplay] = useState("");

  useEffect(() => {
    if (offerId) {
      setLoading(true);
      getOffer(offerId).then((o) => {
        if (o) {
          setData(o);
          setOrigPriceDisplay(formatPriceWithCommas(o.originalPrice || ""));
          setDiscPriceDisplay(formatPriceWithCommas(o.discountedPrice || ""));
        }
        setLoading(false);
      });
    }
  }, [offerId]);

  const handleChange = (key: keyof OfferData, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleOrigPriceChange = (rawValue: string) => {
    const clean = stripCommas(rawValue).replace(/[^\d.]/g, "");
    setOrigPriceDisplay(formatPriceWithCommas(clean));
    handleChange("originalPrice", clean);
    // Auto-calculate discount
    if (data.discountedPrice && clean) {
      const orig = parseFloat(clean);
      const disc = parseFloat(data.discountedPrice);
      if (orig > 0 && disc > 0) {
        handleChange("discount", Math.round(((orig - disc) / orig) * 100));
      }
    }
  };

  const handleDiscPriceChange = (rawValue: string) => {
    const clean = stripCommas(rawValue).replace(/[^\d.]/g, "");
    setDiscPriceDisplay(formatPriceWithCommas(clean));
    handleChange("discountedPrice", clean);
    // Auto-calculate discount
    if (data.originalPrice && clean) {
      const orig = parseFloat(data.originalPrice);
      const disc = parseFloat(clean);
      if (orig > 0 && disc > 0) {
        handleChange("discount", Math.round(((orig - disc) / orig) * 100));
      }
    }
  };

  const handleFieldsChange = (fields: FormField[]) => {
    setData((prev) => ({ ...prev, orderFormFields: fields }));
  };

  const handleSave = async () => {
    if (!data.title.trim()) {
      setToast("⚠️ يرجى إدخال عنوان العرض");
      setTimeout(() => setToast(""), 3000);
      return;
    }
    setSaving(true);
    try {
      if (offerId) {
        await updateOffer(offerId, data);
      } else {
        await addOffer(data);
      }
      setToast("✅ تم الحفظ بنجاح!");
      setTimeout(() => {
        setToast("");
        onSaved();
      }, 1500);
    } catch (err) {
      console.error(err);
      setToast("❌ حدث خطأ أثناء الحفظ");
      setTimeout(() => setToast(""), 3000);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#555" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Top Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button className="admin-btn-secondary" onClick={onBack}>
            <ArrowRight size={18} />
            رجوع
          </button>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 900 }}>{offerId ? "تعديل العرض" : "إنشاء عرض جديد"}</h2>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={18} />}
          {saving ? "جاري الحفظ..." : "حفظ"}
        </button>
      </div>

      {/* Editor */}
      <div className="admin-editor">
        <div className="admin-editor-form">
          {/* Inner Tabs */}
          <div className="admin-inner-tabs">
            <button className={`admin-inner-tab ${activeTab === "details" ? "active" : ""}`} onClick={() => setActiveTab("details")}>
              <Flame size={16} />
              بيانات العرض
            </button>
            <button className={`admin-inner-tab ${activeTab === "form" ? "active" : ""}`} onClick={() => setActiveTab("form")}>
              نموذج الطلب
            </button>
          </div>

          {activeTab === "details" ? (
            <div style={{ padding: "1.5rem" }}>
              <div className="admin-form-group">
                <label className="admin-form-label">عنوان العرض</label>
                <input
                  className="admin-form-input"
                  value={data.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="مثال: خصم على اشتراك PS Plus سنوي"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">وصف العرض</label>
                <textarea
                  className="admin-form-input admin-form-textarea"
                  value={data.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="وصف تفصيلي عن العرض..."
                />
              </div>

              {/* Image URL */}
              <div className="admin-form-group">
                <label className="admin-form-label">رابط صورة العرض</label>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <input
                      className="admin-form-input"
                      value={data.imageUrl || ""}
                      onChange={(e) => handleChange("imageUrl", e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      dir="ltr"
                    />
                  </div>
                  {data.imageUrl && (
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: "0.65rem",
                        overflow: "hidden",
                        border: "1px solid rgba(255,255,255,0.1)",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={data.imageUrl}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">القسم</label>
                <input
                  className="admin-form-input"
                  value={data.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  placeholder="مثال: اشتراكات، حسابات، شحن"
                />
              </div>

              {/* Pricing */}
              <div className="admin-form-group">
                <label className="admin-form-label">الأسعار والعملة</label>
                <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <div style={{ flex: 1 }}>
                    <label className="admin-form-label" style={{ fontSize: "0.75rem" }}>السعر الأصلي</label>
                    <input
                      className="admin-form-input"
                      value={origPriceDisplay}
                      onChange={(e) => handleOrigPriceChange(e.target.value)}
                      placeholder="65,000"
                      dir="ltr"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="admin-form-label" style={{ fontSize: "0.75rem" }}>السعر بعد الخصم</label>
                    <input
                      className="admin-form-input"
                      value={discPriceDisplay}
                      onChange={(e) => handleDiscPriceChange(e.target.value)}
                      placeholder="45,000"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <div className="admin-currency-toggle">
                    <button
                      onClick={() => handleChange("currency", "IQD" as Currency)}
                      className={`admin-currency-btn ${data.currency === "IQD" ? "active" : ""}`}
                    >
                      د.ع دينار
                    </button>
                    <button
                      onClick={() => handleChange("currency", "USD" as Currency)}
                      className={`admin-currency-btn ${data.currency === "USD" ? "active" : ""}`}
                    >
                      $ دولار
                    </button>
                  </div>
                  <div
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "0.5rem",
                      background: "rgba(239,68,68,0.1)",
                      color: "#f87171",
                      fontWeight: 800,
                      fontSize: "0.9rem",
                    }}
                  >
                    خصم {data.discount}%
                  </div>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="admin-form-group">
                <label className="admin-form-label">عداد العد التنازلي</label>
                <div className="admin-toggle" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>
                  <button
                    className={`admin-toggle-track ${data.countdownEnabled ? "active" : ""}`}
                    onClick={() => handleChange("countdownEnabled", !data.countdownEnabled)}
                  >
                    <div className="admin-toggle-thumb" />
                  </button>
                  <span style={{ fontSize: "0.85rem", color: data.countdownEnabled ? "#22c55e" : "#555", fontWeight: 600 }}>
                    {data.countdownEnabled ? "العداد مفعّل" : "العداد معطّل"}
                  </span>
                </div>
                {data.countdownEnabled && (
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <div style={{ flex: 1 }}>
                      <label className="admin-form-label" style={{ fontSize: "0.7rem" }}>
                        <Clock size={12} style={{ display: "inline", marginLeft: "0.25rem" }} />
                        أيام
                      </label>
                      <input
                        type="number"
                        className="admin-form-input"
                        value={data.countdownDays ?? 0}
                        onChange={(e) => handleChange("countdownDays", Math.max(0, parseInt(e.target.value) || 0))}
                        min={0}
                        max={365}
                        dir="ltr"
                        style={{ textAlign: "center" }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="admin-form-label" style={{ fontSize: "0.7rem" }}>ساعات</label>
                      <input
                        type="number"
                        className="admin-form-input"
                        value={data.countdownHours ?? 0}
                        onChange={(e) => handleChange("countdownHours", Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                        min={0}
                        max={23}
                        dir="ltr"
                        style={{ textAlign: "center" }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="admin-form-label" style={{ fontSize: "0.7rem" }}>دقائق</label>
                      <input
                        type="number"
                        className="admin-form-input"
                        value={data.countdownMinutes ?? 0}
                        onChange={(e) => handleChange("countdownMinutes", Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                        min={0}
                        max={59}
                        dir="ltr"
                        style={{ textAlign: "center" }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Badge Selection */}
              <div className="admin-form-group">
                <label className="admin-form-label">شارة العرض (Badge)</label>
                <div className="admin-color-presets" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                  {OFFER_BADGE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      className={`admin-color-preset ${data.badge === preset.label ? "active" : ""}`}
                      onClick={() => {
                        handleChange("badge", preset.label);
                        handleChange("badgeColor", preset.color);
                      }}
                    >
                      <div className="admin-color-swatch" style={{ background: `${preset.color}25`, width: 28, height: 28 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: preset.color }} />
                      </div>
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="admin-form-group">
                <label className="admin-form-label">حالة العرض</label>
                <div className="admin-toggle" style={{ marginTop: "0.5rem" }}>
                  <button
                    className={`admin-toggle-track ${data.active ? "active" : ""}`}
                    onClick={() => handleChange("active", !data.active)}
                  >
                    <div className="admin-toggle-thumb" />
                  </button>
                  <span style={{ fontSize: "0.85rem", color: data.active ? "#22c55e" : "#555", fontWeight: 600 }}>
                    {data.active ? "فعّال — يظهر في الموقع" : "معطّل — مخفي عن الزوار"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <FormFieldEditor fields={data.orderFormFields} onChange={handleFieldsChange} />
          )}
        </div>

        {/* Preview */}
        <div className="admin-editor-preview">
          <div className="admin-preview-panel">
            <div className="admin-preview-header">
              <div className="admin-preview-dot" />
              {activeTab === "form" ? "معاينة نموذج الطلب — تفاعلية" : "معاينة بطاقة العرض"}
            </div>
            <div className="admin-preview-body">
              {activeTab === "form" ? (
                /* Form Preview */
                <div className="preview-form">
                  <div className="preview-form-title">
                    <div className="preview-form-title-icon">
                      <Sparkles size={16} color="#000" />
                    </div>
                    <h4>طلب عرض</h4>
                  </div>

                  {/* Selected item */}
                  <div className="preview-form-field">
                    <label>العرض المطلوب</label>
                    <div
                      style={{
                        padding: "0.65rem 0.85rem",
                        borderRadius: "0.75rem",
                        background: "rgba(0,0,0,0.5)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <div
                        style={{
                          width: "0.4rem",
                          height: "0.4rem",
                          borderRadius: "50%",
                          background: "#fff",
                          animation: "previewPulse 2s ease-in-out infinite",
                        }}
                      />
                      {data.title || "عنوان العرض"}
                    </div>
                  </div>

                  {/* Dynamic Fields */}
                  {data.orderFormFields.map((field) => (
                    <div className="preview-form-field" key={field.id}>
                      <label>
                        {field.label || "اسم الحقل"} {field.required && <span style={{ color: "#f87171" }}>*</span>}
                      </label>
                      {field.type === "text" && (
                        <input type="text" placeholder={field.placeholder || "أدخل النص..."} readOnly />
                      )}
                      {field.type === "email" && (
                        <input type="email" placeholder={field.placeholder || "example@email.com"} readOnly dir="ltr" style={{ textAlign: "right" }} />
                      )}
                      {field.type === "number" && (
                        <input type="number" placeholder={field.placeholder || "0"} readOnly />
                      )}
                      {field.type === "textarea" && (
                        <textarea placeholder={field.placeholder || "أدخل النص..."} rows={3} readOnly style={{ resize: "none" }} />
                      )}
                      {field.type === "select" && (
                        <select disabled>
                          <option value="">{field.placeholder || "اختر..."}</option>
                          {(field.options || []).map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}

                  {/* Submit button */}
                  <div className="preview-form-submit">
                    <Send size={16} />
                    <span>تأكيد الطلب</span>
                  </div>
                </div>
              ) : (
                /* Offer Card Preview */
                <div
                  style={{
                    width: "100%",
                    maxWidth: 350,
                    background: "#0d0d0d",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "1.5rem",
                    overflow: "hidden",
                  }}
                >
                  {/* Image Area */}
                  <div style={{ position: "relative", height: data.imageUrl ? 160 : 100, overflow: "hidden" }}>
                    {data.imageUrl ? (
                      <>
                        <img
                          src={data.imageUrl}
                          alt=""
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          referrerPolicy="no-referrer"
                        />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0d0d0d, rgba(13,13,13,0.3), transparent)" }} />
                      </>
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${data.badgeColor}15, #0d0d0d)` }} />
                    )}

                    {/* Badge */}
                    <div style={{
                      position: "absolute", top: 12, right: 12,
                      display: "inline-flex", alignItems: "center", gap: "0.3rem",
                      padding: "0.25rem 0.7rem", borderRadius: "9999px",
                      background: data.badgeColor, color: "#fff",
                      fontSize: "0.65rem", fontWeight: 800,
                    }}>
                      {data.badge}
                    </div>

                    {/* Discount */}
                    <div style={{
                      position: "absolute", top: 12, left: 12,
                      padding: "0.2rem 0.6rem", borderRadius: "0.65rem",
                      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff", fontSize: "1rem", fontWeight: 900,
                    }}>
                      {data.discount}%
                      <span style={{ fontSize: "0.55rem", color: "#888", fontWeight: 700, marginRight: "0.15rem" }}>خصم</span>
                    </div>

                    {/* Category */}
                    {data.category && (
                      <div style={{
                        position: "absolute", bottom: 10, right: 12,
                        fontSize: "0.6rem", fontWeight: 700, color: "#ccc",
                        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
                        padding: "0.2rem 0.5rem", borderRadius: "9999px",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}>
                        {data.category}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ padding: "1.25rem" }}>
                    {/* Title */}
                    <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#fff", marginBottom: "0.75rem", lineHeight: 1.4 }}>
                      {data.title || "عنوان العرض"}
                    </div>

                    {/* Description */}
                    {data.description && (
                      <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: "0.85rem", lineHeight: 1.6 }}>
                        {data.description}
                      </div>
                    )}

                    {/* Pricing */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "1rem" }}>
                      <span style={{ fontSize: "1.5rem", fontWeight: 900, color: "#fff" }}>
                        {data.discountedPrice || "0"}
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "#666", fontWeight: 700 }}>
                        {data.currency === "USD" ? "$" : "د.ع"}
                      </span>
                      {data.originalPrice && (
                        <span style={{ fontSize: "0.8rem", color: "#555", textDecoration: "line-through" }}>
                          {data.originalPrice}
                        </span>
                      )}
                    </div>

                    {/* Countdown Preview */}
                    {data.countdownEnabled && (
                      <div style={{
                        padding: "0.65rem 0.85rem",
                        borderRadius: "0.75rem",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.05)",
                        marginBottom: "1rem",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.5rem" }}>
                          <Clock size={12} color="#666" />
                          <span style={{ fontSize: "0.6rem", color: "#666", fontWeight: 700 }}>ينتهي العرض خلال</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }} dir="ltr">
                          {(data.countdownDays ?? 0) > 0 && (
                            <>
                              <span style={{ background: "rgba(255,255,255,0.08)", padding: "0.25rem 0.45rem", borderRadius: "0.35rem", fontSize: "0.75rem", fontWeight: 800, color: "#fff", border: "1px solid rgba(255,255,255,0.05)" }}>
                                {data.countdownDays}
                              </span>
                              <span style={{ color: "#444", fontSize: "0.5rem", fontWeight: 700 }}>يوم</span>
                              <span style={{ color: "#444", fontSize: "0.6rem" }}>:</span>
                            </>
                          )}
                          <span style={{ background: "rgba(255,255,255,0.08)", padding: "0.25rem 0.45rem", borderRadius: "0.35rem", fontSize: "0.75rem", fontWeight: 800, color: "#fff", border: "1px solid rgba(255,255,255,0.05)" }}>
                            {String(data.countdownHours ?? 0).padStart(2, "0")}
                          </span>
                          <span style={{ color: "#444", fontSize: "0.6rem" }}>:</span>
                          <span style={{ background: "rgba(255,255,255,0.08)", padding: "0.25rem 0.45rem", borderRadius: "0.35rem", fontSize: "0.75rem", fontWeight: 800, color: "#fff", border: "1px solid rgba(255,255,255,0.05)" }}>
                            {String(data.countdownMinutes ?? 0).padStart(2, "0")}
                          </span>
                          <span style={{ color: "#444", fontSize: "0.6rem" }}>:</span>
                          <span style={{ background: "rgba(255,255,255,0.08)", padding: "0.25rem 0.45rem", borderRadius: "0.35rem", fontSize: "0.75rem", fontWeight: 800, color: "#fff", border: "1px solid rgba(255,255,255,0.05)" }}>
                            00
                          </span>
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <div
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "0.75rem",
                        background: "#fff",
                        color: "#000",
                        fontWeight: 800,
                        fontSize: "0.85rem",
                        textAlign: "center",
                        boxShadow: "0 4px 15px rgba(255,255,255,0.05)",
                      }}
                    >
                      اطلب العرض
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && <div className="admin-toast">{toast}</div>}
    </div>
  );
}
