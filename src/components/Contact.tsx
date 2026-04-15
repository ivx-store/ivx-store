import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { MapPin, Phone, Mail, Instagram, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { addMessage, getSettings, SiteSettings } from "../lib/firebase";

export function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) { setError("يرجى إدخال اسمك"); return; }
    if (!form.message.trim()) { setError("يرجى كتابة رسالتك"); return; }

    setSending(true);
    try {
      await addMessage({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      setSent(true);
      setForm({ name: "", phone: "", email: "", message: "" });
    } catch (err) {
      console.error("Error sending message:", err);
      setError("حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.");
    }
    setSending(false);
  };

  return (
    <section className="py-24 relative z-10 bg-black overflow-x-hidden" id="contact">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gray-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16" dir="rtl">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-arabic font-black text-white mb-6 tracking-tight"
          >
            تواصل <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-white">معنا</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400 font-arabic max-w-2xl mx-auto font-medium leading-relaxed"
          >
            نحن هنا للإجابة على استفساراتك ومساعدتك في كل ما يخص الألعاب والاشتراكات. لا تتردد في التواصل معنا.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto" dir="rtl">
          
          {/* Contact Info Cards */}
          <div className="space-y-4 md:space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-gray-900 p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgba(255,255,255,0.04)] border border-gray-800 flex items-start gap-4 md:gap-6 group hover:shadow-[0_20px_40px_rgba(255,255,255,0.08)] transition-all duration-300"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors duration-300">
                <Phone className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:text-black transition-colors duration-300" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2 font-arabic">اتصل بنا</h3>
                <p className="text-sm md:text-base text-gray-400 mb-1 md:mb-2 font-arabic">نحن متاحون للرد على مكالماتك خلال أوقات العمل.</p>
                <a href={settings?.whatsappNumber ? `tel:${settings.whatsappNumber.replace(/[^0-9+]/g, '')}` : "tel:+9647830796658"} className="text-base md:text-lg font-bold text-white font-arabic block" dir="ltr">{settings?.whatsappNumber || "+964 783 079 6658"}</a>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gray-900 p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgba(255,255,255,0.04)] border border-gray-800 flex items-start gap-4 md:gap-6 group hover:shadow-[0_20px_40px_rgba(255,255,255,0.08)] transition-all duration-300"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors duration-300">
                <Mail className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:text-black transition-colors duration-300" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2 font-arabic">البريد الإلكتروني</h3>
                <p className="text-sm md:text-base text-gray-400 mb-1 md:mb-2 font-arabic">أرسل لنا استفسارك وسنرد عليك بأقرب وقت.</p>
                <a href={`mailto:${(settings as any)?.email || "support@ivx.com"}`} className="text-base md:text-lg font-bold text-white font-arabic block" dir="ltr">{(settings as any)?.email || "support@ivx.com"}</a>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-900 p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgba(255,255,255,0.04)] border border-gray-800 flex items-start gap-4 md:gap-6 group hover:shadow-[0_20px_40px_rgba(255,255,255,0.08)] transition-all duration-300"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors duration-300">
                <MapPin className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:text-black transition-colors duration-300" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2 font-arabic">موقعنا</h3>
                <p className="text-sm md:text-base text-gray-400 mb-1 md:mb-2 font-arabic">متجر إلكتروني يخدم جميع أنحاء العالم.</p>
                <p className="text-base md:text-lg font-bold text-white font-arabic">العراق</p>
              </div>
            </motion.div>

            {/* Social Links */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-4 pt-4"
            >
              {/* WhatsApp */}
              <a
                href={`https://wa.me/${(settings?.whatsappNumber || "+9647830796658").replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-gray-900 shadow-md border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#25D366] hover:border-[#25D366] hover:scale-110 transition-all duration-300"
              >
                <span className="sr-only">WhatsApp</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a
                href={settings?.instagramUrl || "https://instagram.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-gray-900 shadow-md border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:scale-110 transition-all duration-300 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#bc1888] hover:border-transparent"
              >
                <Instagram size={22} />
              </a>
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gray-900 p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_20px_60px_rgba(255,255,255,0.06)] border border-gray-800 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full pointer-events-none" />
            
            <h3 className="text-xl md:text-2xl font-black text-white mb-6 md:mb-8 font-arabic">أرسل رسالة</h3>
            
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h4 className="text-xl font-black text-white mb-3 font-arabic">تم إرسال رسالتك بنجاح!</h4>
                <p className="text-gray-400 font-arabic text-sm mb-6">سنقوم بالرد عليك في أقرب وقت ممكن.</p>
                <button
                  onClick={() => setSent(false)}
                  className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-arabic font-bold text-sm hover:bg-white/10 transition-all"
                >
                  إرسال رسالة أخرى
                </button>
              </motion.div>
            ) : (
              <form className="space-y-4 md:space-y-6 relative z-10" onSubmit={handleSubmit}>
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold font-arabic">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-1.5 md:mb-2 font-arabic">
                      الاسم <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-4 md:px-5 py-3 md:py-4 bg-black border border-gray-700 rounded-xl md:rounded-2xl focus:bg-gray-800 focus:ring-2 focus:ring-white/20 focus:border-white outline-none transition-all font-arabic text-sm md:text-base text-white"
                      placeholder="اسمك الكريم"
                      disabled={sending}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-1.5 md:mb-2 font-arabic">رقم الجوال</label>
                    <input
                      type="tel"
                      dir="ltr"
                      value={form.phone}
                      onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                      className="w-full px-4 md:px-5 py-3 md:py-4 bg-black border border-gray-700 rounded-xl md:rounded-2xl focus:bg-gray-800 focus:ring-2 focus:ring-white/20 focus:border-white outline-none transition-all font-arabic text-right text-sm md:text-base text-white"
                      placeholder="07X XXXX XXXX"
                      disabled={sending}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-1.5 md:mb-2 font-arabic">البريد الإلكتروني</label>
                  <input
                    type="email"
                    dir="ltr"
                    value={form.email}
                    onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 md:px-5 py-3 md:py-4 bg-black border border-gray-700 rounded-xl md:rounded-2xl focus:bg-gray-800 focus:ring-2 focus:ring-white/20 focus:border-white outline-none transition-all font-arabic text-right text-sm md:text-base text-white"
                    placeholder="example@domain.com"
                    disabled={sending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-1.5 md:mb-2 font-arabic">
                    الرسالة <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))}
                    className="w-full px-4 md:px-5 py-3 md:py-4 bg-black border border-gray-700 rounded-xl md:rounded-2xl focus:bg-gray-800 focus:ring-2 focus:ring-white/20 focus:border-white outline-none transition-all font-arabic resize-none text-sm md:text-base text-white"
                    placeholder="كيف يمكننا مساعدتك؟"
                    disabled={sending}
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3 md:py-4 bg-white text-black rounded-xl md:rounded-2xl font-bold text-base md:text-lg font-arabic hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>جاري الإرسال...</span>
                    </>
                  ) : (
                    <>
                      <span>إرسال الرسالة</span>
                      <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
