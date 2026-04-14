import React from "react";
import { GripVertical, Trash2, Type, Mail, Hash, SlidersHorizontal, MinusCircle, PlusCircle, AlignLeft, ListOrdered } from "lucide-react";
import { FormField, generateFieldId } from "../../lib/firebase";

interface FormFieldEditorProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}

const FIELD_TYPES: { value: FormField["type"]; label: string; icon: React.ReactNode }[] = [
  { value: "text", label: "نص", icon: <Type size={14} /> },
  { value: "email", label: "بريد إلكتروني", icon: <Mail size={14} /> },
  { value: "number", label: "رقم", icon: <Hash size={14} /> },
  { value: "counter", label: "عداد (+/-)", icon: <PlusCircle size={14} /> },
  { value: "slider", label: "شريط تمرير", icon: <SlidersHorizontal size={14} /> },
  { value: "textarea", label: "نص طويل", icon: <AlignLeft size={14} /> },
  { value: "select", label: "قائمة منسدلة", icon: <ListOrdered size={14} /> },
];

function getFieldTypeLabel(type: string) {
  return FIELD_TYPES.find((t) => t.value === type)?.label || type;
}

export function FormFieldEditor({ fields, onChange }: FormFieldEditorProps) {
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
    onChange(fields.filter((_, i) => i !== index));
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

  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h4 style={{ fontSize: "1rem", fontWeight: 800, color: "#fff" }}>حقول النموذج</h4>
        <span style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600 }}>{fields.length} حقل</span>
      </div>

      <div className="admin-field-list">
        {fields.map((field, index) => (
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
                <button className="admin-btn-icon danger" onClick={() => removeField(index)} style={{ width: "1.75rem", height: "1.75rem" }}>
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
                  onChange={(e) => updateField(index, { type: e.target.value as FormField["type"] })}
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
                  onChange={(e) =>
                    updateField(index, {
                      options: e.target.value
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder={"الخيار الأول\nالخيار الثاني\nالخيار الثالث"}
                  rows={3}
                  style={{ resize: "vertical", minHeight: "70px" }}
                />
              </div>
            )}
          </div>
        ))}
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
