import { useState, useEffect } from "react";
import { Save, Loader2, Globe, MessageCircle, Phone } from "lucide-react";
import { SiteSettings, getSettings, saveSettings, getServiceTypes, saveServiceTypes } from "../../lib/firebase";

interface AdminSettingsProps {
  onCountChange?: (count: number) => void;
}

export function AdminSettings({ onCountChange }: AdminSettingsProps) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [newType, setNewType] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    Promise.all([getSettings(), getServiceTypes()]).then(([s, t]) => {
      setSettings(s);
      setServiceTypes(t);
      onCountChange?.(0);
      setLoading(false);
    });
  }, []);

  const handleChange = (key: keyof SiteSettings, value: string) => {
    setSettings((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await saveSettings(settings);
      await saveServiceTypes(serviceTypes);
      setToast("✅ تم حفظ الإعدادات بنجاح!");
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      console.error(err);
      setToast("❌ حدث خطأ أثناء الحفظ");
      setTimeout(() => setToast(""), 3000);
    }
    setSaving(false);
  };

  const addServiceType = () => {
    if (!newType.trim() || serviceTypes.includes(newType.trim())) return;
    setServiceTypes((prev) => [...prev, newType.trim()]);
    setNewType("");
  };

  const removeServiceType = (type: string) => {
    setServiceTypes((prev) => prev.filter((t) => t !== type));
  };

  if (loading || !settings) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#555" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Save button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={18} />}
          {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {/* Contact Info */}
        <div className="admin-editor-form" style={{ borderRadius: "1.5rem", overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Phone size={18} color="#22c55e" />
            <span style={{ fontWeight: 800, fontSize: "1rem" }}>معلومات التواصل</span>
          </div>
          <div style={{ padding: "1.5rem" }}>
            <div className="admin-form-group">
              <label className="admin-form-label">رقم الواتساب</label>
              <input
                className="admin-form-input"
                value={settings.whatsappNumber}
                onChange={(e) => handleChange("whatsappNumber", e.target.value)}
                placeholder="964XXXXXXXXXX"
                dir="ltr"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">البريد الإلكتروني</label>
              <input
                className="admin-form-input"
                value={settings.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="support@example.com"
                dir="ltr"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">رابط تيليجرام</label>
              <input
                className="admin-form-input"
                value={settings.telegramUrl}
                onChange={(e) => handleChange("telegramUrl", e.target.value)}
                placeholder="https://t.me/username"
                dir="ltr"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">رابط انستجرام</label>
              <input
                className="admin-form-input"
                value={settings.instagramUrl}
                onChange={(e) => handleChange("instagramUrl", e.target.value)}
                placeholder="https://instagram.com/username"
                dir="ltr"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">رابط تويتر/X</label>
              <input
                className="admin-form-input"
                value={settings.twitterUrl}
                onChange={(e) => handleChange("twitterUrl", e.target.value)}
                placeholder="https://x.com/username"
                dir="ltr"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">رابط تيك توك</label>
              <input
                className="admin-form-input"
                value={settings.tiktokUrl}
                onChange={(e) => handleChange("tiktokUrl", e.target.value)}
                placeholder="https://tiktok.com/@username"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Service Types + Site Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Service Types */}
          <div className="admin-editor-form" style={{ borderRadius: "1.5rem", overflow: "hidden" }}>
            <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Globe size={18} color="#3b82f6" />
              <span style={{ fontWeight: 800, fontSize: "1rem" }}>أنواع الخدمات</span>
            </div>
            <div style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
                {serviceTypes.map((type) => (
                  <div
                    key={type}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.4rem 0.75rem",
                      borderRadius: "0.5rem",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "#ccc",
                    }}
                  >
                    {type}
                    <button
                      onClick={() => removeServiceType(type)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#666",
                        fontSize: "1rem",
                        lineHeight: 1,
                        fontFamily: "inherit",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {serviceTypes.length === 0 && (
                  <span style={{ color: "#444", fontSize: "0.85rem" }}>لا توجد أنواع بعد</span>
                )}
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  className="admin-form-input"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  placeholder="اكتب نوع جديد..."
                  onKeyDown={(e) => e.key === "Enter" && addServiceType()}
                  style={{ flex: 1 }}
                />
                <button className="admin-btn admin-btn-secondary" onClick={addServiceType} style={{ whiteSpace: "nowrap" }}>
                  إضافة
                </button>
              </div>
            </div>
          </div>

          {/* Site Content */}
          <div className="admin-editor-form" style={{ borderRadius: "1.5rem", overflow: "hidden" }}>
            <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <MessageCircle size={18} color="#a855f7" />
              <span style={{ fontWeight: 800, fontSize: "1rem" }}>محتوى الموقع</span>
            </div>
            <div style={{ padding: "1.5rem" }}>
              <div className="admin-form-group">
                <label className="admin-form-label">عنوان Hero</label>
                <input
                  className="admin-form-input"
                  value={settings.heroTitle}
                  onChange={(e) => handleChange("heroTitle", e.target.value)}
                  placeholder="IVX Store"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">العنوان الفرعي</label>
                <input
                  className="admin-form-input"
                  value={settings.heroSubtitle}
                  onChange={(e) => handleChange("heroSubtitle", e.target.value)}
                  placeholder="متجرك الأول للألعاب"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && <div className="admin-toast">{toast}</div>}
    </div>
  );
}
