import { useState } from "react";
import { CheckCircle2, Sparkles, Send, Minus, Plus, Image, User, Phone, FileText } from "lucide-react";
import { FormField, ServiceData, PackageData, formatDisplayPrice, formatPriceWithCommas } from "../../lib/firebase";

interface ServicePreviewProps {
  mode: "service";
  data: ServiceData;
  showForm: boolean;
}

interface PackagePreviewProps {
  mode: "package";
  data: PackageData;
  showForm: boolean;
}

type LivePreviewProps = ServicePreviewProps | PackagePreviewProps;

function FormPreview({ fields, title }: { fields: FormField[]; title: string }) {
  // Interactive state for each field
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});

  const getValue = (fieldId: string, defaultVal: any = "") => {
    return fieldValues[fieldId] ?? defaultVal;
  };

  const setValue = (fieldId: string, val: any) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: val }));
  };

  return (
    <div className="preview-form">
      <div className="preview-form-title">
        <div className="preview-form-title-icon">
          <Sparkles size={16} color="#000" />
        </div>
        <h4>طلب خدمة</h4>
      </div>

      {/* Selected item */}
      <div className="preview-form-field">
        <label>الخدمة / الباقة المطلوبة</label>
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
          {title || "عنوان الخدمة"}
        </div>
      </div>

      {/* Dynamic Fields */}
      {fields.filter(f => !f.deleted).map((field) => (
        <div className="preview-form-field" key={field.id}>
          <label>
            {field.label || "اسم الحقل"} {field.required && <span style={{ color: "#f87171" }}>*</span>}
          </label>

          {field.type === "text" && (
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type="text"
                placeholder={field.placeholder || "أدخل النص..."}
                value={getValue(field.id)}
                onChange={(e) => setValue(field.id, e.target.value)}
                style={field.id === "customerName" ? { width: "100%", paddingRight: "2.5rem" } : { width: "100%" }}
              />
              {field.id === "customerName" && (
                <User size={16} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#555" }} />
              )}
            </div>
          )}

          {field.type === "email" && (
            <input
              type="email"
              placeholder={field.placeholder || "example@email.com"}
              value={getValue(field.id)}
              onChange={(e) => setValue(field.id, e.target.value)}
              dir="ltr"
              style={{ textAlign: "right" }}
            />
          )}

          {field.type === "tel" && (
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type="tel"
                placeholder={field.placeholder || "07X XXXX XXXX"}
                value={getValue(field.id)}
                onChange={(e) => setValue(field.id, e.target.value)}
                dir="ltr"
                style={field.id === "customerPhone" ? { width: "100%", textAlign: "right", paddingRight: "2.5rem" } : { width: "100%", textAlign: "right" }}
              />
              {field.id === "customerPhone" && (
                <Phone size={16} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#555" }} />
              )}
            </div>
          )}

          {field.type === "number" && (
            <input
              type="number"
              placeholder={field.placeholder || "0"}
              value={getValue(field.id)}
              onChange={(e) => setValue(field.id, e.target.value)}
              min={field.min}
              max={field.max}
              step={field.step ?? 1}
            />
          )}

          {field.type === "counter" && (() => {
            const min = field.min ?? 0;
            const max = field.max ?? 999;
            const step = field.step ?? 1;
            const val = Number(getValue(field.id, min));
            return (
              <div className="preview-form-counter">
                <button
                  type="button"
                  onClick={() => setValue(field.id, Math.max(min, val - step))}
                  style={{ opacity: val <= min ? 0.4 : 1 }}
                >
                  <Minus size={14} />
                </button>
                <span>{val}</span>
                <button
                  type="button"
                  onClick={() => setValue(field.id, Math.min(max, val + step))}
                  style={{ opacity: val >= max ? 0.4 : 1 }}
                >
                  <Plus size={14} />
                </button>
              </div>
            );
          })()}

          {field.type === "slider" && (() => {
            const min = field.min ?? 0;
            const max = field.max ?? 100;
            const step = field.step ?? 1;
            const val = Number(getValue(field.id, Math.round((min + max) / 2)));
            return (
              <div>
                <input
                  type="range"
                  className="preview-form-slider"
                  min={min}
                  max={max}
                  step={step}
                  value={val}
                  onChange={(e) => setValue(field.id, Number(e.target.value))}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#555", marginTop: "0.25rem" }}>
                  <span>{min}</span>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>{val}</span>
                  <span>{max}</span>
                </div>
              </div>
            );
          })()}

          {field.type === "textarea" && (
            <div style={{ position: "relative", width: "100%" }}>
              <textarea
                placeholder={field.placeholder || "أدخل النص..."}
                rows={3}
                value={getValue(field.id)}
                onChange={(e) => setValue(field.id, e.target.value)}
                style={field.id === "customerNotes" ? { width: "100%", resize: "none", paddingRight: "2.5rem" } : { width: "100%", resize: "none" }}
              />
              {field.id === "customerNotes" && (
                <FileText size={16} style={{ position: "absolute", right: "0.75rem", top: "0.85rem", color: "#555" }} />
              )}
            </div>
          )}

          {field.type === "select" && (
            <select
              value={getValue(field.id, "")}
              onChange={(e) => setValue(field.id, e.target.value)}
            >
              <option value="" disabled>
                {field.placeholder || "اختر..."}
              </option>
              {(field.options || []).map((opt, i) => (
                <option key={i} value={opt}>
                  {opt}
                </option>
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
  );
}

export function LivePreview(props: LivePreviewProps) {
  if (props.mode === "service") {
    const { data, showForm } = props;
    const displayPrice = formatDisplayPrice(data.price, data.currency);

    if (showForm) {
      return (
        <div className="admin-preview-panel">
          <div className="admin-preview-header">
            <div className="admin-preview-dot" />
            معاينة نموذج الطلب — تفاعلية
          </div>
          <div className="admin-preview-body">
            <FormPreview fields={data.orderFormFields} title={data.title} />
          </div>
        </div>
      );
    }

    return (
      <div className="admin-preview-panel">
        <div className="admin-preview-header">
          <div className="admin-preview-dot" />
          معاينة بطاقة الخدمة
        </div>
        <div className="admin-preview-body">
          <div className="preview-service-card">
            {data.imageUrl ? (
              <img
                src={data.imageUrl}
                alt=""
                className="preview-service-image"
                style={{ display: "block" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="preview-service-image">
                <Image size={32} />
              </div>
            )}
            <div className="preview-service-body">
              {data.type && <div className="preview-service-type">{data.type}</div>}
              <div className="preview-service-title">{data.title || "عنوان الخدمة"}</div>
              <div className="preview-service-desc">{data.description || "وصف الخدمة يظهر هنا..."}</div>
              {displayPrice && <div className="preview-service-price">{displayPrice}</div>}
              <div className="preview-service-btn">أطلب الخدمة</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Package mode
  const { data, showForm } = props;
  const displayPrice = formatDisplayPrice(data.price, data.currency);
  const bgColor = data.bgColor || "#000";
  const accentColor = data.accentColor || "#fff";

  if (showForm) {
    return (
      <div className="admin-preview-panel">
        <div className="admin-preview-header">
          <div className="admin-preview-dot" />
          معاينة نموذج الطلب — تفاعلية
        </div>
        <div className="admin-preview-body">
          <FormPreview fields={data.orderFormFields} title={data.title} />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-preview-panel">
      <div className="admin-preview-header">
        <div className="admin-preview-dot" />
        معاينة بطاقة الباقة
      </div>
      <div className="admin-preview-body">
        <div
          className="preview-package-card"
          style={{
            background: bgColor,
            borderColor: `${accentColor}30`,
            boxShadow: `0 0 40px ${accentColor}10`,
          }}
        >
          {data.popular && (
            <div
              className="preview-package-popular"
              style={{
                background: accentColor,
                color: bgColor,
              }}
            >
              الأكثر طلباً
            </div>
          )}
          <div className="preview-package-title" style={{ color: accentColor === "#ffffff" ? "#fff" : accentColor }}>
            {data.title || "عنوان الباقة"}
          </div>
          <div className="preview-package-subtitle">{data.subtitle || "SUBTITLE"}</div>
          <div className="preview-package-desc">{data.description || "وصف الباقة يظهر هنا..."}</div>
          {displayPrice && <div className="preview-package-price">{displayPrice}</div>}
          <div className="preview-package-divider" style={{ background: `linear-gradient(to right, transparent, ${accentColor}20, transparent)` }} />
          <div className="preview-package-features">
            {(data.features?.length ? data.features.filter(f => f) : ["ميزة 1", "ميزة 2"]).map((f, i) => (
              <div className="preview-package-feature" key={i}>
                <div className="preview-package-feature-dot" style={{ background: accentColor }}>
                  <CheckCircle2 size={12} color={bgColor || "#000"} />
                </div>
                <span>{f || "..."}</span>
              </div>
            ))}
          </div>
          <div
            className="preview-package-btn"
            style={{
              borderColor: `${accentColor}50`,
              color: accentColor === "#ffffff" ? "#fff" : accentColor,
            }}
          >
            أطلب الباقة
          </div>
        </div>
      </div>
    </div>
  );
}
