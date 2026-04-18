import React, { useState, useEffect } from "react";
import { ArrowRight, Save, FileText, Settings, Loader2, Plus, Trash2, Palette } from "lucide-react";
import {
  PackageData,
  FormField,
  Currency,
  addPackage,
  updatePackage,
  getPackage,
  formatPriceWithCommas,
  stripCommas,
  PACKAGE_COLOR_PRESETS,
  ensureSystemFields,
} from "../../lib/firebase";
import { FormFieldEditor } from "./FormFieldEditor";
import { LivePreview } from "./LivePreview";

interface PackageEditorProps {
  packageId?: string | null;
  onBack: () => void;
  onSaved: () => void;
}

const defaultPackage: PackageData = {
  title: "",
  subtitle: "",
  description: "",
  price: "",
  currency: "USD",
  features: [""],
  popular: false,
  bgColor: "",
  accentColor: "",
  orderFormFields: [],
};

export function PackageEditor({ packageId, onBack, onSaved }: PackageEditorProps) {
  const [data, setData] = useState<PackageData>({ ...defaultPackage, orderFormFields: ensureSystemFields([]) });
  const [activeTab, setActiveTab] = useState<"details" | "form" | "style">("details");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!packageId);
  const [toast, setToast] = useState("");
  const [priceDisplay, setPriceDisplay] = useState("");

  useEffect(() => {
    if (packageId) {
      setLoading(true);
      getPackage(packageId).then((p) => {
        if (p) {
          p.orderFormFields = ensureSystemFields(p.orderFormFields);
          setData(p);
          setPriceDisplay(formatPriceWithCommas(p.price || ""));
        }
        setLoading(false);
      });
    }
  }, [packageId]);

  const handleChange = (key: keyof PackageData, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handlePriceChange = (rawValue: string) => {
    const clean = stripCommas(rawValue).replace(/[^\d.]/g, "");
    setPriceDisplay(formatPriceWithCommas(clean));
    handleChange("price", clean);
  };

  const handleFieldsChange = (fields: FormField[]) => {
    setData((prev) => ({ ...prev, orderFormFields: fields }));
  };

  // Features management
  const addFeature = () => {
    setData((prev) => ({ ...prev, features: [...prev.features, ""] }));
  };

  const removeFeature = (index: number) => {
    setData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setData((prev) => {
      const features = [...prev.features];
      features[index] = value;
      return { ...prev, features };
    });
  };

  const handleSave = async () => {
    if (!data.title.trim()) {
      setToast("⚠️ يرجى إدخال عنوان الباقة");
      setTimeout(() => setToast(""), 3000);
      return;
    }
    setSaving(true);
    try {
      const saveData = {
        ...data,
        features: data.features.filter((f) => f.trim()),
      };
      if (packageId) {
        await updatePackage(packageId, saveData);
      } else {
        await addPackage(saveData);
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
          <h2 style={{ fontSize: "1.25rem", fontWeight: 900 }}>{packageId ? "تعديل الباقة" : "إنشاء باقة جديدة"}</h2>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={18} />}
          {saving ? "جاري الحفظ..." : "حفظ"}
        </button>
      </div>

      {/* Editor Grid */}
      <div className="admin-editor">
        {/* Left: Form */}
        <div className="admin-editor-form">
          {/* Inner Tabs */}
          <div className="admin-inner-tabs">
            <button className={`admin-inner-tab ${activeTab === "details" ? "active" : ""}`} onClick={() => setActiveTab("details")}>
              <Settings size={16} />
              بيانات الباقة
            </button>
            <button className={`admin-inner-tab ${activeTab === "style" ? "active" : ""}`} onClick={() => setActiveTab("style")}>
              <Palette size={16} />
              التصميم
            </button>
            <button className={`admin-inner-tab ${activeTab === "form" ? "active" : ""}`} onClick={() => setActiveTab("form")}>
              <FileText size={16} />
              نموذج الطلب
            </button>
          </div>

          {activeTab === "details" ? (
            <div style={{ padding: "1.5rem" }}>
              <div className="admin-form-group">
                <label className="admin-form-label">عنوان الباقة</label>
                <input
                  className="admin-form-input"
                  value={data.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="مثال: باقة الأسطورة"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">العنوان الفرعي (إنجليزي)</label>
                <input
                  className="admin-form-input"
                  value={data.subtitle}
                  onChange={(e) => handleChange("subtitle", e.target.value)}
                  placeholder="ULTIMATE GAMES ACCOUNT"
                  dir="ltr"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">الوصف</label>
                <textarea
                  className="admin-form-input admin-form-textarea"
                  value={data.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="وصف تفصيلي عن الباقة..."
                />
              </div>

              {/* Price + Currency */}
              <div className="admin-form-group">
                <label className="admin-form-label">السعر والعملة</label>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "stretch" }}>
                  <div style={{ flex: 1, position: "relative" }}>
                    <input
                      className="admin-form-input"
                      value={priceDisplay}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      placeholder="مثال: 25,000"
                      dir="ltr"
                      style={{ paddingLeft: "3rem" }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        left: "1rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#666",
                        fontWeight: 800,
                        fontSize: "0.9rem",
                        pointerEvents: "none",
                      }}
                    >
                      {data.currency === "USD" ? "$" : "د.ع"}
                    </span>
                  </div>
                  <div className="admin-currency-toggle">
                    <button
                      onClick={() => handleChange("currency", "USD" as Currency)}
                      className={`admin-currency-btn ${data.currency === "USD" ? "active" : ""}`}
                    >
                      $ دولار
                    </button>
                    <button
                      onClick={() => handleChange("currency", "IQD" as Currency)}
                      className={`admin-currency-btn ${data.currency === "IQD" ? "active" : ""}`}
                    >
                      د.ع دينار
                    </button>
                  </div>
                </div>
              </div>

              {/* Popular toggle */}
              <div className="admin-form-group">
                <label className="admin-form-label">باقة مميزة (الأكثر طلباً)</label>
                <div className="admin-toggle" style={{ marginTop: "0.5rem" }}>
                  <button
                    className={`admin-toggle-track ${data.popular ? "active" : ""}`}
                    onClick={() => handleChange("popular", !data.popular)}
                  >
                    <div className="admin-toggle-thumb" />
                  </button>
                  <span style={{ fontSize: "0.85rem", color: data.popular ? "#fff" : "#555", fontWeight: 600 }}>
                    {data.popular ? "نعم" : "لا"}
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="admin-form-group">
                <label className="admin-form-label">الميزات</label>
                <div className="admin-features-list">
                  {data.features.map((feature, index) => (
                    <div className="admin-feature-item" key={index}>
                      <input
                        className="admin-form-input"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder={`ميزة ${index + 1}`}
                        style={{ flex: 1 }}
                      />
                      {data.features.length > 1 && (
                        <button className="admin-btn-icon danger" onClick={() => removeFeature(index)} style={{ flexShrink: 0 }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addFeature}
                  style={{
                    marginTop: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.5rem",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px dashed rgba(255,255,255,0.1)",
                    color: "#666",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    transition: "all 0.3s ease",
                    fontFamily: "inherit",
                  }}
                >
                  <Plus size={14} />
                  إضافة ميزة
                </button>
              </div>
            </div>
          ) : activeTab === "style" ? (
            <div style={{ padding: "1.5rem" }}>
              {/* Color Presets */}
              <div className="admin-form-group">
                <label className="admin-form-label">لون الباقة (اختر من القوالب الجاهزة)</label>
                <div className="admin-color-presets">
                  {/* No color = default black */}
                  <button
                    className={`admin-color-preset ${!data.bgColor ? "active" : ""}`}
                    onClick={() => {
                      handleChange("bgColor", "");
                      handleChange("accentColor", "");
                    }}
                    title="افتراضي"
                  >
                    <div className="admin-color-swatch" style={{ background: "#000", border: "1px solid #333" }} />
                    <span>افتراضي</span>
                  </button>
                  {PACKAGE_COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      className={`admin-color-preset ${data.bgColor === preset.bg ? "active" : ""}`}
                      onClick={() => {
                        handleChange("bgColor", preset.bg);
                        handleChange("accentColor", preset.accent);
                      }}
                      title={preset.name}
                    >
                      <div className="admin-color-swatch" style={{ background: preset.bg, boxShadow: `0 0 12px ${preset.accent}40` }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: preset.accent }} />
                      </div>
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Color */}
              <div className="admin-form-group">
                <label className="admin-form-label">أو اختر لون مخصص</label>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
                    <label className="admin-form-label" style={{ marginBottom: 0 }}>لون الخلفية</label>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <input
                        type="color"
                        value={data.bgColor || "#000000"}
                        onChange={(e) => handleChange("bgColor", e.target.value)}
                        className="admin-color-input"
                      />
                      <input
                        className="admin-form-input"
                        value={data.bgColor || ""}
                        onChange={(e) => handleChange("bgColor", e.target.value)}
                        placeholder="#000000"
                        dir="ltr"
                        style={{ fontSize: "0.8rem", padding: "0.5rem 0.75rem" }}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
                    <label className="admin-form-label" style={{ marginBottom: 0 }}>لون التمييز</label>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <input
                        type="color"
                        value={data.accentColor || "#ffffff"}
                        onChange={(e) => handleChange("accentColor", e.target.value)}
                        className="admin-color-input"
                      />
                      <input
                        className="admin-form-input"
                        value={data.accentColor || ""}
                        onChange={(e) => handleChange("accentColor", e.target.value)}
                        placeholder="#ffffff"
                        dir="ltr"
                        style={{ fontSize: "0.8rem", padding: "0.5rem 0.75rem" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview of selected color */}
              {data.bgColor && (
                <div className="admin-form-group">
                  <label className="admin-form-label">معاينة اللون</label>
                  <div
                    style={{
                      width: "100%",
                      height: 80,
                      borderRadius: "1rem",
                      background: data.bgColor,
                      border: `2px solid ${data.accentColor || "#fff"}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "1rem",
                      boxShadow: `0 0 30px ${data.accentColor || "#fff"}15`,
                    }}
                  >
                    <span style={{ color: data.accentColor || "#fff", fontWeight: 900, fontSize: "1.1rem" }}>
                      {data.title || "عنوان الباقة"}
                    </span>
                    <div
                      style={{
                        padding: "0.35rem 1rem",
                        borderRadius: "0.5rem",
                        background: data.accentColor || "#fff",
                        color: data.bgColor,
                        fontWeight: 800,
                        fontSize: "0.8rem",
                      }}
                    >
                      أطلب الباقة
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <FormFieldEditor fields={data.orderFormFields} onChange={handleFieldsChange} baseCurrency={data.currency} />
          )}
        </div>

        {/* Right: Preview */}
        <div className="admin-editor-preview">
          <LivePreview mode="package" data={data} showForm={activeTab === "form"} />
        </div>
      </div>

      {/* Toast */}
      {toast && <div className="admin-toast">{toast}</div>}
    </div>
  );
}
