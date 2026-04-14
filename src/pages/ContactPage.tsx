import { useState } from "react";
import { motion } from "motion/react";
import { PageHero } from "../components/PageHero";
import { PageLayout } from "../components/PageLayout";
import { MapPin, Phone, Mail, Instagram, ArrowLeft, MessageCircle, Loader2, CheckCircle2 } from "lucide-react";
import { addMessage } from "../lib/firebase";

export function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
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
    <PageLayout>
      <PageHero
        badge="📩 نحن هنا لمساعدتك"
        title="تواصل"
        highlight="معنا"
        description="نحن هنا للإجابة على استفساراتك ومساعدتك في كل ما يخص الألعاب والاشتراكات. لا تتردد في التواصل."
      />

      <section className="pb-24 md:pb-32 relative z-10" dir="rtl">
        <div className="container mx-auto px-5 md:px-8">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">

            {/* Contact Info Cards */}
            <div className="space-y-4 md:space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-gray-900/40 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white/10 flex items-start gap-4 md:gap-6 group hover:border-white/20 hover:shadow-[0_20px_40px_rgba(255,255,255,0.04)] transition-all duration-300"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors duration-300">
                  <Phone className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:text-black transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2 font-arabic">اتصل بنا</h3>
                  <p className="text-sm md:text-base text-gray-400 mb-1 md:mb-2 font-arabic">نحن متاحون للرد على مكالماتك خلال أوقات العمل.</p>
                  <a href="tel:+9647830796658" className="text-base md:text-lg font-bold text-white font-arabic block" dir="ltr">+964 783 079 6658</a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-gray-900/40 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white/10 flex items-start gap-4 md:gap-6 group hover:border-white/20 hover:shadow-[0_20px_40px_rgba(255,255,255,0.04)] transition-all duration-300"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors duration-300">
                  <Mail className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:text-black transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2 font-arabic">البريد الإلكتروني</h3>
                  <p className="text-sm md:text-base text-gray-400 mb-1 md:mb-2 font-arabic">أرسل لنا استفسارك وسنرد عليك بأقرب وقت.</p>
                  <a href="mailto:support@ivx.com" className="text-base md:text-lg font-bold text-white font-arabic block" dir="ltr">support@ivx.com</a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gray-900/40 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white/10 flex items-start gap-4 md:gap-6 group hover:border-white/20 hover:shadow-[0_20px_40px_rgba(255,255,255,0.04)] transition-all duration-300"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors duration-300">
                  <MapPin className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:text-black transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2 font-arabic">موقعنا</h3>
                  <p className="text-sm md:text-base text-gray-400 mb-1 md:mb-2 font-arabic">متجر إلكتروني يخدم جميع أنحاء العالم.</p>
                  <p className="text-base md:text-lg font-bold text-white font-arabic">العراق 🇮🇶</p>
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
                <a href="https://wa.me/9647830796658" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-gray-900/60 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white hover:text-black hover:scale-110 transition-all">
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a href="https://www.instagram.com/ivx_iraq" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-gray-900/60 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white hover:text-black hover:scale-110 transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
              </motion.div>
            </div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gray-900/40 p-6 md:p-10 rounded-[2rem] border border-white/10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none" />

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
                        className="w-full px-4 md:px-5 py-3 md:py-4 bg-black border border-gray-800 rounded-xl md:rounded-2xl focus:bg-gray-900 focus:ring-2 focus:ring-white/20 focus:border-white outline-none transition-all font-arabic text-sm md:text-base text-white placeholder-gray-600"
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
                        className="w-full px-4 md:px-5 py-3 md:py-4 bg-black border border-gray-800 rounded-xl md:rounded-2xl focus:bg-gray-900 focus:ring-2 focus:ring-white/20 focus:border-white outline-none transition-all font-arabic text-right text-sm md:text-base text-white placeholder-gray-600"
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
                      className="w-full px-4 md:px-5 py-3 md:py-4 bg-black border border-gray-800 rounded-xl md:rounded-2xl focus:bg-gray-900 focus:ring-2 focus:ring-white/20 focus:border-white outline-none transition-all font-arabic text-right text-sm md:text-base text-white placeholder-gray-600"
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
                      className="w-full px-4 md:px-5 py-3 md:py-4 bg-black border border-gray-800 rounded-xl md:rounded-2xl focus:bg-gray-900 focus:ring-2 focus:ring-white/20 focus:border-white outline-none transition-all font-arabic resize-none text-sm md:text-base text-white placeholder-gray-600"
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
    </PageLayout>
  );
}
