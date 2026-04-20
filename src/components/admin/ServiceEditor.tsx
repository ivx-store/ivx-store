import React, { useState, useEffect, useMemo } from "react";
import { ArrowRight, Save, FileText, Settings, Loader2, Plus, X } from "lucide-react";
import {
  ServiceData,
  ServiceCategory,
  FormField,
  Currency,
  addService,
  updateService,
  getService,
  getServiceTypes,
  saveServiceTypes,
  getCategories,
  formatPriceWithCommas,
  stripCommas,
  ensureSystemFields,
} from "../../lib/firebase";
import { FormFieldEditor } from "./FormFieldEditor";
import { LivePreview } from "./LivePreview";

interface ServiceEditorProps {
  serviceId?: string | null;
  onBack: () => void;
  onSaved: () => void;
}

const defaultService: ServiceData = {
  imageUrl: "",
  title: "",
  description: "",
  price: "",
  currency: "USD",
  type: "",
  categoryId: "",
  orderFormFields: [],
};

export function ServiceEditor({ serviceId, onBack, onSaved }: ServiceEditorProps) {
  const [data, setData] = useState<ServiceData>({ ...defaultService, orderFormFields: ensureSystemFields([]) });
  const [activeTab, setActiveTab] = useState<"details" | "form">("details");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!serviceId);
  const [toast, setToast] = useState("");

  // Service types management
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [showNewType, setShowNewType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");

  // Categories
  const [allCategories, setAllCategories] = useState<ServiceCategory[]>([]);

  // Price display with commas
  const [priceDisplay, setPriceDisplay] = useState("");

  useEffect(() => {
    // Load service types and categories
    getServiceTypes().then((types) => setServiceTypes(types));
    getCategories().then((cats) => setAllCategories(cats));

    if (serviceId) {
      setLoading(true);
      getService(serviceId).then((s) => {
        if (s) {
          s.orderFormFields = ensureSystemFields(s.orderFormFields);
          setData(s);
          setPriceDisplay(formatPriceWithCommas(s.price || ""));
        }
        setLoading(false);
      });
    }
  }, [serviceId]);

  // Filter categories based on selected service type
  const filteredCategories = data.type
    ? allCategories.filter(c => c.serviceType === data.type)
    : [];

  // Detect if any form field has dynamic pricing enabled
  const hasDynamicPricing = useMemo(() => {
    return (data.orderFormFields || []).some(f => f.pricingEnabled && !f.deleted);
  }, [data.orderFormFields]);

  // Auto-calculate price from dynamic pricing fields (price for qty=1)
  const dynamicBasePrice = useMemo(() => {
    if (!hasDynamicPricing) return null;
    let price = 0;
    let currency: Currency = data.currency;

    for (const field of data.orderFormFields || []) {
      if (!field.pricingEnabled || field.deleted) continue;
      const fieldCurrency = field.priceCurrency || data.currency;

      if (field.pricingMode === "per_unit" && field.pricePerUnit) {
        price += field.pricePerUnit;
        currency = fieldCurrency;
      } else if (field.pricingMode === "options_map" && field.optionPrices) {
        const prices = (Object.values(field.optionPrices) as number[]).filter(p => p > 0);
        if (prices.length > 0) {
          price += Math.min(...prices);
          currency = fieldCurrency;
        }
      } else if (field.pricingMode === "fixed" && field.fixedPrice) {
        price += field.fixedPrice;
        currency = fieldCurrency;
      }
    }

    return price > 0 ? { price, currency } : null;
  }, [data.orderFormFields, data.currency, hasDynamicPricing]);

  const handleChange = (key: keyof ServiceData, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handlePriceChange = (rawValue: string) => {
    // Remove commas for storage, add commas for display
    const clean = stripCommas(rawValue).replace(/[^\d.]/g, "");
    setPriceDisplay(formatPriceWithCommas(clean));
    handleChange("price", clean);
  };

  const handleFieldsChange = (fields: FormField[]) => {
    setData((prev) => ({ ...prev, orderFormFields: fields }));
  };

  const handleAddNewType = async () => {
    if (!newTypeName.trim()) return;
    const updatedTypes = [...serviceTypes, newTypeName.trim()];
    setServiceTypes(updatedTypes);
    handleChange("type", newTypeName.trim());
    setNewTypeName("");
    setShowNewType(false);
    // Save to Firestore
    try {
      await saveServiceTypes(updatedTypes);
    } catch (e) {
      console.error("Error saving types", e);
    }
  };

  const handleSave = async () => {
    if (!data.title.trim()) {
      setToast("⚠️ يرجى إدخال عنوان الخدمة");
      setTimeout(() => setToast(""), 3000);
      return;
    }
    setSaving(true);
    try {
      const saveData = { ...data };
      // Auto-set price from dynamic pricing when active
      if (hasDynamicPricing && dynamicBasePrice) {
        saveData.price = String(dynamicBasePrice.price);
        saveData.currency = dynamicBasePrice.currency;
      }
      if (serviceId) {
        await updateService(serviceId, saveData);
      } else {
        await addService(saveData);
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
          <h2 style={{ fontSize: "1.25rem", fontWeight: 900 }}>{serviceId ? "تعديل الخدمة" : "إنشاء خدمة جديدة"}</h2>
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
              بيانات الخدمة
            </button>
            <button className={`admin-inner-tab ${activeTab === "form" ? "active" : ""}`} onClick={() => setActiveTab("form")}>
              <FileText size={16} />
              نموذج الطلب
            </button>
          </div>

          {activeTab === "details" ? (
            <div style={{ padding: "1.5rem" }}>
              <div className="admin-form-group">
                <label className="admin-form-label">رابط الصورة</label>
                <input
                  className="admin-form-input"
                  value={data.imageUrl}
                  onChange={(e) => handleChange("imageUrl", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  dir="ltr"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">عنوان الخدمة</label>
                <input
                  className="admin-form-input"
                  value={data.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="مثال: اشتراكات بلس وجيم باس"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">الوصف</label>
                <textarea
                  className="admin-form-input admin-form-textarea"
                  value={data.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="وصف تفصيلي عن الخدمة..."
                />
              </div>

              {/* Price + Currency */}
              <div className="admin-form-group">
                <label className="admin-form-label">السعر والعملة</label>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "stretch" }}>
                  <div style={{ flex: 1, position: "relative" }}>
                    <input
                      className="admin-form-input"
                      value={hasDynamicPricing && dynamicBasePrice ? formatPriceWithCommas(String(dynamicBasePrice.price)) : priceDisplay}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      placeholder="مثال: 25,000"
                      dir="ltr"
                      disabled={hasDynamicPricing}
                      style={{ paddingLeft: "3rem", ...(hasDynamicPricing ? { opacity: 0.5, cursor: "not-allowed" } : {}) }}
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
                      {(hasDynamicPricing && dynamicBasePrice ? dynamicBasePrice.currency : data.currency) === "USD" ? "$" : "د.ع"}
                    </span>
                  </div>
                  <div className="admin-currency-toggle">
                    <button
                      onClick={() => handleChange("currency", "USD" as Currency)}
                      className={`admin-currency-btn ${(hasDynamicPricing && dynamicBasePrice ? dynamicBasePrice.currency : data.currency) === "USD" ? "active" : ""}`}
                      disabled={hasDynamicPricing}
                      style={hasDynamicPricing ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                    >
                      $ دولار
                    </button>
                    <button
                      onClick={() => handleChange("currency", "IQD" as Currency)}
                      className={`admin-currency-btn ${(hasDynamicPricing && dynamicBasePrice ? dynamicBasePrice.currency : data.currency) === "IQD" ? "active" : ""}`}
                      disabled={hasDynamicPricing}
                      style={hasDynamicPricing ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                    >
                      د.ع دينار
                    </button>
                  </div>
                </div>
                {hasDynamicPricing && (
                  <div style={{
                    marginTop: "0.5rem",
                    padding: "0.6rem 0.75rem",
                    borderRadius: "0.6rem",
                    background: "rgba(59, 130, 246, 0.08)",
                    border: "1px solid rgba(59, 130, 246, 0.15)",
                    fontSize: "0.75rem",
                    color: "#60a5fa",
                    fontWeight: 600,
                  }}>
                    💡 السعر يُحسب تلقائياً من التسعير الديناميكي في نموذج الطلب
                  </div>
                )}
              </div>

              {/* Type Dropdown */}
              <div className="admin-form-group">
                <label className="admin-form-label">نوع الخدمة</label>
                {!showNewType ? (
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <select
                      className="admin-form-input admin-form-select"
                      value={data.type}
                      onChange={(e) => {
                        if (e.target.value === "__new__") {
                          setShowNewType(true);
                        } else {
                          handleChange("type", e.target.value);
                          // Reset categoryId when type changes
                          handleChange("categoryId", "");
                        }
                      }}
                      style={{ flex: 1 }}
                    >
                      <option value="">— اختر النوع —</option>
                      {serviceTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                      <option value="__new__">➕ إضافة نوع جديد...</option>
                    </select>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input
                      className="admin-form-input"
                      value={newTypeName}
                      onChange={(e) => setNewTypeName(e.target.value)}
                      placeholder="اكتب اسم النوع الجديد..."
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddNewType();
                        if (e.key === "Escape") setShowNewType(false);
                      }}
                      style={{ flex: 1 }}
                    />
                    <button
                      className="admin-btn admin-btn-primary"
                      onClick={handleAddNewType}
                      style={{ padding: "0.65rem 1rem", whiteSpace: "nowrap" }}
                    >
                      <Plus size={16} />
                      إضافة
                    </button>
                    <button
                      className="admin-btn-icon"
                      onClick={() => {
                        setShowNewType(false);
                        setNewTypeName("");
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Category Dropdown */}
              <div className="admin-form-group">
                <label className="admin-form-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  📁 القسم
                </label>
                {data.type ? (
                  filteredCategories.length > 0 ? (
                    <select
                      className="admin-form-input admin-form-select"
                      value={data.categoryId || ""}
                      onChange={(e) => handleChange("categoryId", e.target.value)}
                    >
                      <option value="">— بدون قسم —</option>
                      {filteredCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div style={{
                      padding: "0.75rem", borderRadius: "0.75rem",
                      background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)",
                      fontSize: "0.8rem", color: "#f59e0b", fontWeight: 600,
                    }}>
                      لا توجد أقسام لنوع "{data.type}" — يمكنك إنشاء أقسام من تبويب "الأقسام" في لوحة التحكم
                    </div>
                  )
                ) : (
                  <div style={{
                    padding: "0.75rem", borderRadius: "0.75rem",
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                    fontSize: "0.8rem", color: "#666", fontWeight: 600,
                  }}>
                    اختر نوع الخدمة أولاً لتظهر الأقسام المتاحة
                  </div>
                )}
              </div>
            </div>
          ) : (
            <FormFieldEditor fields={data.orderFormFields} onChange={handleFieldsChange} baseCurrency={data.currency} />
          )}
        </div>

        {/* Right: Preview */}
        <div className="admin-editor-preview">
          <LivePreview mode="service" data={data} showForm={activeTab === "form"} />
        </div>
      </div>

      {/* Toast */}
      {toast && <div className="admin-toast">{toast}</div>}
    </div>
  );
}
