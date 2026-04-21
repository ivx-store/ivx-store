import React from "react";
import { GripVertical, Trash2, Type, Mail, Hash, SlidersHorizontal, MinusCircle, PlusCircle, AlignLeft, ListOrdered, Phone, DollarSign, Tag, Layers } from "lucide-react";
import { FormField, Currency, generateFieldId, formatPriceWithCommas, stripCommas } from "../../lib/firebase";

interface FormFieldEditorProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
  baseCurrency?: Currency;
}

const FIELD_TYPES: { value: FormField["type"]; label: string; icon: React.ReactNode }[] = [
  { value: "text", label: "نص", icon: <Type size={14} /> },
  { value: "email", label: "بريد إلكتروني", icon: <Mail size={14} /> },
  { value: "tel", label: "رقم الجوال", icon: <Phone size={14} /> },
  { value: "number", label: "رقم", icon: <Hash size={14} /> },
  { value: "counter", label: "عداد (+/-)", icon: <PlusCircle size={14} /> },
  { value: "slider", label: "شريط تمرير", icon: <SlidersHorizontal size={14} /> },
  { value: "textarea", label: "نص طويل", icon: <AlignLeft size={14} /> },
  { value: "select", label: "قائمة منسدلة", icon: <ListOrdered size={14} /> },
];

const PRICING_MODES: { value: string; label: string; icon: React.ReactNode; desc: string; forTypes: string[] }[] = [
  { value: "options_map", label: "لكل خيار سعر", icon: <Layers size={14} />, desc: "كل خيار في القائمة بسعر مختلف", forTypes: ["select"] },
  { value: "per_unit", label: "سعر × الكمية", icon: <Tag size={14} />, desc: "السعر يتضاعف حسب الكمية المحددة", forTypes: ["number", "counter", "slider"] },
  { value: "fixed", label: "مبلغ ثابت", icon: <DollarSign size={14} />, desc: "مبلغ ثابت يُضاف عند اختيار هذا الحقل", forTypes: ["text", "email", "tel", "number", "counter", "slider", "textarea", "select"] },
];

function getFieldTypeLabel(type: string) {
  return FIELD_TYPES.find((t) => t.value === type)?.label || type;
}

function getAvailablePricingModes(fieldType: string) {
  return PRICING_MODES.filter(m => m.forTypes.includes(fieldType));
}

function getDefaultPricingMode(fieldType: string): string {
  if (fieldType === "select") return "options_map";
  if (["number", "counter", "slider"].includes(fieldType)) return "per_unit";
  return "fixed";
}

function canHavePricing(fieldType: string): boolean {
  return ["select", "number", "counter", "slider"].includes(fieldType);
}

export function FormFieldEditor({ fields, onChange, baseCurrency = "USD" }: FormFieldEditorProps) {
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  const addField = () => {
    onChange([
      ...fields,
      {
        id: generateFieldId(),
        type: "text",
        label: "",
        placeholder: "",
        required: false,
      },
    ]);
  };

  const removeField = (index: number) => {
    const field = fields[index];
    if (field.system) {
      const updated = [...fields];
      updated[index] = { ...updated[index], deleted: true };
      onChange(updated);
    } else {
      onChange(fields.filter((_, i) => i !== index));
    }
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  // Drag and Drop
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    const updated = [...fields];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);
    onChange(updated);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const getCurrencySymbol = (currency?: Currency) => {
    const c = currency || baseCurrency;
    return c === "USD" ? "$" : "د.ع";
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h4 style={{ fontSize: "1rem", fontWeight: 800, color: "#fff" }}>حقول النموذج</h4>
        <span style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600 }}>{fields.length} حقل</span>
      </div>

      <div className="admin-field-list">
        {fields.map((field, index) => {
          if (field.deleted) return null;
          const showPricing = canHavePricing(field.type);
          const availableModes = getAvailablePricingModes(field.type);

          return (
            <div
              key={field.id}
              className={`admin-field-item ${dragIndex === index ? "dragging" : ""} ${dragOverIndex === index ? "drag-over" : ""}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
            >
              <div className="admin-field-header">
                <div className="admin-field-drag">
                  <div className="admin-field-drag-handle">
                    <GripVertical size={16} />
                  </div>
                  <span className="admin-field-type-badge">{getFieldTypeLabel(field.type)}</span>
                  {field.pricingEnabled && (
                    <span className="admin-field-pricing-badge">
                      <DollarSign size={10} />
                      تسعير
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {/* Required Toggle */}
                  <button
                    onClick={() => updateField(index, { required: !field.required })}
                    title={field.required ? "مطلوب" : "اختياري"}
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      padding: "0.15rem 0.5rem",
                      borderRadius: "0.3rem",
                      background: field.required ? "rgba(239, 68, 68, 0.15)" : "rgba(255,255,255,0.05)",
                      color: field.required ? "#f87171" : "#555",
                      border: `1px solid ${field.required ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.08)"}`,
                      transition: "all 0.3s ease",
                    }}
                  >
                    {field.required ? "مطلوب" : "اختياري"}
                  </button>
                  {/* Delete */}
                  <button type="button" className="admin-btn-icon danger" onClick={() => removeField(index)} style={{ width: "1.75rem", height: "1.75rem" }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Field Config */}
              <div className="admin-field-row">
                <div>
                  <label className="admin-field-label">اسم الحقل</label>
                  <input
                    className="admin-field-input"
                    value={field.label}
                    onChange={(e) => updateField(index, { label: e.target.value })}
                    placeholder="مثال: الاسم الكامل"
                  />
                </div>
                <div>
                  <label className="admin-field-label">نوع الحقل</label>
                  <select
                    className="admin-field-input"
                    value={field.type}
                    onChange={(e) => {
                      const newType = e.target.value as FormField["type"];
                      const updates: Partial<FormField> = { type: newType };
                      // Reset pricing if new type doesn't support current mode
                      if (field.pricingEnabled && !canHavePricing(newType)) {
                        updates.pricingEnabled = false;
                      } else if (field.pricingEnabled) {
                        updates.pricingMode = getDefaultPricingMode(newType) as any;
                      }
                      updateField(index, updates);
                    }}
                    style={{ paddingLeft: "0.5rem" }}
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: "0.5rem" }}>
                <label className="admin-field-label">نص توضيحي (Placeholder)</label>
                <input
                  className="admin-field-input"
                  value={field.placeholder || ""}
                  onChange={(e) => updateField(index, { placeholder: e.target.value })}
                  placeholder="مثال: اكتب اسمك هنا..."
                />
              </div>

              {/* Number / Counter / Slider specific */}
              {(field.type === "number" || field.type === "counter" || field.type === "slider") && (
                <div className="admin-field-row-3">
                  <div>
                    <label className="admin-field-label">الحد الأدنى</label>
                    <input
                      type="number"
                      className="admin-field-input"
                      value={field.min ?? ""}
                      onChange={(e) => updateField(index, { min: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="admin-field-label">الحد الأقصى</label>
                    <input
                      type="number"
                      className="admin-field-input"
                      value={field.max ?? ""}
                      onChange={(e) => updateField(index, { max: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="admin-field-label">الخطوة</label>
                    <input
                      type="number"
                      className="admin-field-input"
                      value={field.step ?? ""}
                      onChange={(e) => updateField(index, { step: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="1"
                    />
                  </div>
                </div>
              )}

              {/* Select specific: options */}
              {field.type === "select" && (
                <div style={{ marginTop: "0.75rem" }}>
                  <label className="admin-field-label">خيارات القائمة (كل سطر خيار)</label>
                  <textarea
                    className="admin-field-input"
                    value={(field.options || []).join("\n")}
                    onChange={(e) => {
                      const rawLines = e.target.value.split("\n");
                      const cleanOptions = rawLines.map((s) => s.trimStart());
                      // Preserve existing option prices when editing options
                      const newOptionPrices: Record<string, number> = {};
                      if (field.optionPrices) {
                        cleanOptions.filter(Boolean).forEach(opt => {
                          if (field.optionPrices![opt] !== undefined) {
                            newOptionPrices[opt] = field.optionPrices![opt];
                          }
                        });
                      }
                      updateField(index, {
                        options: cleanOptions,
                        optionPrices: Object.keys(newOptionPrices).length > 0 ? newOptionPrices : field.optionPrices === undefined ? null: field.optionPrices,
                      });
                    }}
                    placeholder={"الخيار الأول\nالخيار الثاني\nالخيار الثالث"}
                    rows={3}
                    style={{ resize: "vertical", minHeight: "70px" }}
                  />
                </div>
              )}

              {/* ═══════════════════════════════════════ */}
              {/* Dynamic Pricing Section                */}
              {/* ═══════════════════════════════════════ */}
              {showPricing && (
                <div className="admin-pricing-section">
                  <div className="admin-pricing-header">
                    <div className="admin-pricing-header-info">
                      <DollarSign size={14} />
                      <span>التسعير الديناميكي</span>
                    </div>
                    <button
                      className={`admin-toggle-track small ${field.pricingEnabled ? "active" : ""}`}
                      onClick={() => {
                        const enabling = !field.pricingEnabled;
                        const updates: Partial<FormField> = {
                          pricingEnabled: enabling,
                        };
                        if (enabling && !field.pricingMode) {
                          updates.pricingMode = getDefaultPricingMode(field.type) as any;
                          updates.priceCurrency = baseCurrency;
                        }
                        updateField(index, updates);
                      }}
                    >
                      <div className="admin-toggle-thumb" />
                    </button>
                  </div>

                  {field.pricingEnabled && (
                    <div className="admin-pricing-body">
                      {/* Pricing Mode Selector */}
                      {availableModes.length > 1 && (
                        <div className="admin-pricing-modes">
                          {availableModes.map(mode => (
                            <button
                              key={mode.value}
                              className={`admin-pricing-mode-btn ${field.pricingMode === mode.value ? "active" : ""}`}
                              onClick={() => updateField(index, { pricingMode: mode.value as any })}
                            >
                              <span className="admin-pricing-mode-icon">{mode.icon}</span>
                              <span className="admin-pricing-mode-label">{mode.label}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Currency selector */}
                      <div className="admin-pricing-currency-row">
                        <span className="admin-pricing-currency-label">العملة:</span>
                        <div className="admin-currency-toggle small">
                          <button
                            onClick={() => updateField(index, { priceCurrency: "USD" as Currency })}
                            className={`admin-currency-btn ${(field.priceCurrency || baseCurrency) === "USD" ? "active" : ""}`}
                          >
                            $
                          </button>
                          <button
                            onClick={() => updateField(index, { priceCurrency: "IQD" as Currency })}
                            className={`admin-currency-btn ${(field.priceCurrency || baseCurrency) === "IQD" ? "active" : ""}`}
                          >
                            د.ع
                          </button>
                        </div>
                      </div>

                      {/* ── options_map: price per option ── */}
                      {field.pricingMode === "options_map" && field.type === "select" && (
                        <div className="admin-pricing-options-map">
                          <label className="admin-field-label" style={{ marginBottom: "0.5rem" }}>سعر كل خيار</label>
                          {(field.options || []).length === 0 ? (
                            <div className="admin-pricing-empty">أضف خيارات للقائمة أولاً</div>
                          ) : (
                            <div className="admin-pricing-options-list">
                              {(field.options || []).map((opt, optIdx) => (
                                <div key={optIdx} className="admin-pricing-option-row">
                                  <span className="admin-pricing-option-name">{opt}</span>
                                  <div className="admin-pricing-option-input-wrap">
                                    <input
                                      type="text"
                                      className="admin-pricing-option-input"
                                      value={field.optionPrices?.[opt] !== undefined ? formatPriceWithCommas(String(field.optionPrices[opt])) : ""}
                                      onChange={(e) => {
                                        const clean = stripCommas(e.target.value).replace(/[^\d.]/g, "");
                                        const prices = { ...(field.optionPrices || {}) };
                                        prices[opt] = clean ? parseFloat(clean) : 0;
                                        updateField(index, { optionPrices: prices });
                                      }}
                                      placeholder="0"
                                      dir="ltr"
                                    />
                                    <span className="admin-pricing-option-currency">
                                      {getCurrencySymbol(field.priceCurrency)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* ── per_unit: price per unit ── */}
                      {field.pricingMode === "per_unit" && (
                        <div className="admin-pricing-per-unit">
                          <label className="admin-field-label">سعر الوحدة الواحدة</label>
                          <div className="admin-pricing-unit-input-wrap">
                            <input
                              type="text"
                              className="admin-pricing-unit-input"
                              value={field.pricePerUnit !== undefined ? formatPriceWithCommas(String(field.pricePerUnit)) : ""}
                              onChange={(e) => {
                                const clean = stripCommas(e.target.value).replace(/[^\d.]/g, "");
                                updateField(index, { pricePerUnit: clean ? parseFloat(clean) : 0 });
                              }}
                              placeholder="0"
                              dir="ltr"
                            />
                            <span className="admin-pricing-unit-currency">
                              {getCurrencySymbol(field.priceCurrency)} / وحدة
                            </span>
                          </div>
                          <div className="admin-pricing-unit-example">
                            مثال: إذا اختار العميل {field.min || 10} → السعر = {((field.min || 10) * (field.pricePerUnit || 0)).toLocaleString()} {getCurrencySymbol(field.priceCurrency)}
                          </div>
                        </div>
                      )}

                      {/* ── fixed: fixed price ── */}
                      {field.pricingMode === "fixed" && (
                        <div className="admin-pricing-fixed">
                          <label className="admin-field-label">المبلغ الثابت المُضاف</label>
                          <div className="admin-pricing-unit-input-wrap">
                            <input
                              type="text"
                              className="admin-pricing-unit-input"
                              value={field.fixedPrice !== undefined ? formatPriceWithCommas(String(field.fixedPrice)) : ""}
                              onChange={(e) => {
                                const clean = stripCommas(e.target.value).replace(/[^\d.]/g, "");
                                updateField(index, { fixedPrice: clean ? parseFloat(clean) : 0 });
                              }}
                              placeholder="0"
                              dir="ltr"
                            />
                            <span className="admin-pricing-unit-currency">
                              {getCurrencySymbol(field.priceCurrency)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Field Button */}
      <button
        onClick={addField}
        style={{
          marginTop: "1rem",
          width: "100%",
          padding: "0.85rem",
          borderRadius: "0.75rem",
          background: "rgba(255,255,255,0.04)",
          border: "2px dashed rgba(255,255,255,0.1)",
          color: "#666",
          fontWeight: 700,
          fontSize: "0.9rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          transition: "all 0.3s ease",
          fontFamily: "inherit",
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.25)";
          (e.target as HTMLElement).style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
          (e.target as HTMLElement).style.color = "#666";
        }}
      >
        <PlusCircle size={18} />
        إضافة حقل جديد
      </button>
    </div>
  );
}
