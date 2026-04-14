import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PageHero } from "../components/PageHero";
import { PageLayout } from "../components/PageLayout";
import { Quote, Star, ChevronDown, HelpCircle } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "أحمد محمد",
    role: "لاعب محترف",
    content: "متجر ivx هو الأفضل بلا منازع! أسعار الاشتراكات ممتازة والتسليم فوري. أنصح كل جيمر بالتعامل معهم.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
  },
  {
    id: 2,
    name: "سارة خالد",
    role: "صانعة محتوى",
    content: "أفضل متجر تعاملت معاه، حسابات مضمونة وخدمة عملاء سريعة ومتعاونة جداً. شكراً ivx!",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
  },
  {
    id: 3,
    name: "فهد العتيبي",
    role: "صاحب متجر ألعاب",
    content: "نتعامل مع ivx بالجملة منذ فترة، أسعارهم لا تقبل المنافسة والمصداقية عالية جداً. شركاء نجاح حقيقيين.",
    image: "https://randomuser.me/api/portraits/men/46.jpg",
    rating: 5,
  },
  {
    id: 4,
    name: "نورة السعد",
    role: "لاعبة",
    content: "تجربة شراء رائعة، حصلت على اللعبة اللي أبيها بسعر خيالي وفي ثواني. متجر موثوق 100%.",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    rating: 5,
  },
  {
    id: 5,
    name: "عبدالله الراجحي",
    role: "ستريمر",
    content: "دايماً أشحن رصيدي من عندهم، سرعة وأمان وأسعار تنافسية. أفضل متجر في العراق بدون شك.",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
    rating: 5,
  },
  {
    id: 6,
    name: "مريم حسين",
    role: "لاعبة كاجوال",
    content: "أول مرة أشتري أونلاين وكنت خايفة، بس تجربتي مع ivx كانت ممتازة. الحساب وصلني بدقائق والدعم الفني ساعدني بكل شي.",
    image: "https://randomuser.me/api/portraits/women/22.jpg",
    rating: 5,
  },
];

const faqs = [
  {
    question: "كيف أستلم طلبي بعد الدفع؟",
    answer: "بعد إتمام عملية الدفع بنجاح، سيتم إرسال تفاصيل طلبك (سواء كان حساب، اشتراك، أو كود لعبة) مباشرة إلى بريدك الإلكتروني المسجل، أو عبر رسالة نصية/واتساب حسب وسيلة التواصل التي اخترتها.",
  },
  {
    question: "هل الحسابات والاشتراكات مضمونة؟",
    answer: "نعم، جميع منتجاتنا مضمونة 100%. نحن نتعامل مع مصادر موثوقة ونقدم ضماناً كاملاً على جميع الاشتراكات والحسابات طوال فترة الصلاحية المحددة.",
  },
  {
    question: "ما هي طرق الدفع المتاحة؟",
    answer: "نوفر طرق دفع متعددة وآمنة تناسب الجميع في العراق، بما في ذلك ماستر كارد، زين كاش، آسيا حوالة، والبطاقات البنكية المعتمدة.",
  },
  {
    question: "هل يمكنني استرجاع المبلغ إذا واجهت مشكلة؟",
    answer: "بشكل عام، لا يمكن استرداد المبلغ بعد استلام الطلب. ولكن في حال مواجهة أي مشكلة، يرجى التواصل معنا؛ وسنقوم بدراسة الحالة لمعرفة نوع المشكلة، وبناءً عليها نقرر الإجراء الأنسب.",
  },
  {
    question: "هل تبيعون بالجملة لأصحاب المتاجر؟",
    answer: "نعم، بكل تأكيد! نحن نوفر أسعاراً خاصة ومنافسة جداً لطلبات الجملة المخصصة لأصحاب المتاجر وسناتر الألعاب. يمكنك التواصل مع فريق الدعم للحصول على قائمة أسعار الجملة.",
  },
  {
    question: "متى تكون خدمة العملاء متاحة؟",
    answer: "فريق خدمة العملاء لدينا متواجد لخدمتكم يومياً خلال ساعات العمل الرسمية: من الساعة 12:00 ظهراً (12 PM) وحتى الساعة 12:00 منتصف الليل (12 AM).",
  },
];

export function ClientsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <PageLayout>
      <PageHero
        badge="⭐ آراء العملاء"
        title="ماذا يقول"
        highlight="عملاؤنا"
        description="نفتخر بثقة عملائنا، ونسعد دائماً بأن نكون جزءاً من متعتهم. إليك تجاربهم معنا."
      />

      {/* Testimonials Grid */}
      <section className="pb-20 md:pb-28 relative z-10" dir="rtl">
        <div className="container mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 max-w-6xl mx-auto">
            {testimonials.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="relative bg-gray-900/40 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/5 hover:border-white/20 hover:shadow-[0_20px_60px_rgba(255,255,255,0.04)] transition-all duration-500 group overflow-hidden flex flex-col"
              >
                {/* Watermark Quote */}
                <Quote className="absolute top-4 left-4 w-12 h-12 md:w-16 md:h-16 text-white/[0.03] group-hover:text-white/[0.06] transition-all duration-500 rotate-180 pointer-events-none" />

                <div className="relative z-10 flex-grow">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-gray-300 font-arabic text-sm md:text-base leading-relaxed mb-6 font-medium">
                    "{item.content}"
                  </p>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 pt-5 border-t border-white/5 relative z-10">
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-11 h-11 md:w-14 md:h-14 rounded-full object-cover border-2 border-black"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div>
                    <h4 className="font-black text-white font-arabic text-sm md:text-base">{item.name}</h4>
                    <p className="text-[10px] md:text-xs text-gray-500 font-bold font-arabic mt-0.5">{item.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="pb-24 md:pb-32 relative z-10" dir="rtl">
        <div className="max-w-4xl mx-auto px-5 md:px-8">
          {/* FAQ Header */}
          <div className="text-center mb-10 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 border border-gray-800 text-white shadow-sm"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="text-sm font-bold">استفسارات شائعة</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-black text-white mb-4 md:mb-6"
            >
              أسئلة{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-white">شائعة</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-base md:text-lg text-gray-400 font-medium max-w-2xl mx-auto"
            >
              نجيب على استفساراتك الأكثر تكراراً بكل شفافية ووضوح.
            </motion.p>
          </div>

          {/* FAQ Items */}
          <div className="flex flex-col gap-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                    isOpen
                      ? "bg-gray-900 border-white/30 shadow-[0_15px_40px_rgba(255,255,255,0.08)]"
                      : "bg-black border-gray-800 hover:border-white/30 hover:bg-gray-900 hover:shadow-md"
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full px-5 py-4 md:px-8 md:py-6 flex items-center justify-between gap-4 text-right focus:outline-none group"
                  >
                    <span className={`font-bold text-base md:text-xl transition-colors duration-300 ${isOpen ? "text-white" : "text-gray-300 group-hover:text-white"}`}>
                      {faq.question}
                    </span>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${isOpen ? "bg-white/10 text-white" : "bg-gray-800 text-gray-500 group-hover:bg-white/10 group-hover:text-white"}`}>
                      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                        <ChevronDown className="w-5 h-5" />
                      </motion.div>
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-5 pb-5 md:px-8 md:pb-8 text-gray-400 font-medium leading-relaxed text-sm md:text-lg">
                          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-5" />
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
